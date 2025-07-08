from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc, text
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple, Dict, Any
from models.transactions import (
    Transaction, TransactionLine, JournalEntry, Payment, 
    PaymentApplication, RecurringTransaction,
    TransactionType, TransactionStatus, PaymentType
)
from models.list_management import Account, Customer, Vendor, Item
from models.user import Company, User
from schemas.transaction_schemas import (
    TransactionCreate, TransactionUpdate, TransactionSearchFilters,
    PaymentCreate, PaymentUpdate, PaymentApplicationSchema,
    RecurringTransactionCreate, RecurringTransactionUpdate,
    InvoiceCreate, BillCreate, SalesReceiptCreate
)
import uuid
import structlog
from datetime import datetime, date
from decimal import Decimal
from services.list_management_service import BaseListService

logger = structlog.get_logger()

class TransactionService(BaseListService):
    """Service for transaction management operations"""
    
    @staticmethod
    async def create_transaction(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        transaction_data: TransactionCreate
    ) -> Transaction:
        """Create a new transaction with lines and journal entries"""
        
        # Generate transaction number if not provided
        if not transaction_data.transaction_number:
            transaction_data.transaction_number = await TransactionService._generate_transaction_number(
                db, company_id, transaction_data.transaction_type
            )
        
        # Calculate totals from line items
        subtotal, tax_amount, total_amount = await TransactionService._calculate_transaction_totals(
            transaction_data.lines
        )
        
        # Create main transaction
        transaction = Transaction(
            transaction_id=str(uuid.uuid4()),
            company_id=company_id,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            balance_due=total_amount,  # Initially, balance due equals total
            status=TransactionStatus.DRAFT,
            created_by=user_id,
            **transaction_data.dict(exclude={'lines'})
        )
        
        db.add(transaction)
        await db.flush()  # Get transaction ID
        
        # Create transaction lines
        for line_data in transaction_data.lines:
            line_total = await TransactionService._calculate_line_total(line_data)
            
            line = TransactionLine(
                line_id=str(uuid.uuid4()),
                transaction_id=transaction.transaction_id,
                line_total=line_total,
                **line_data.dict()
            )
            db.add(line)
        
        await db.commit()
        await db.refresh(transaction)
        
        # Load relationships
        await db.refresh(transaction, ['lines'])
        
        logger.info(
            "Transaction created",
            transaction_id=transaction.transaction_id,
            transaction_type=transaction.transaction_type,
            company_id=company_id
        )
        
        return transaction
    
    @staticmethod
    async def get_transactions(
        db: AsyncSession,
        company_id: str,
        filters: TransactionSearchFilters
    ) -> Tuple[List[Transaction], int]:
        """Get transactions with pagination and filtering"""
        query = select(Transaction).where(
            Transaction.company_id == company_id
        ).options(
            selectinload(Transaction.lines),
            selectinload(Transaction.customer),
            selectinload(Transaction.vendor)
        )
        
        # Apply filters
        if filters.transaction_type:
            query = query.where(Transaction.transaction_type == filters.transaction_type)
        
        if filters.status:
            query = query.where(Transaction.status == filters.status)
        
        if filters.customer_id:
            query = query.where(Transaction.customer_id == filters.customer_id)
        
        if filters.vendor_id:
            query = query.where(Transaction.vendor_id == filters.vendor_id)
        
        if filters.start_date:
            query = query.where(Transaction.transaction_date >= filters.start_date)
        
        if filters.end_date:
            query = query.where(Transaction.transaction_date <= filters.end_date)
        
        if filters.min_amount:
            query = query.where(Transaction.total_amount >= filters.min_amount)
        
        if filters.max_amount:
            query = query.where(Transaction.total_amount <= filters.max_amount)
        
        if filters.is_posted is not None:
            query = query.where(Transaction.is_posted == filters.is_posted)
        
        if filters.is_void is not None:
            query = query.where(Transaction.is_void == filters.is_void)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Transaction.transaction_number.ilike(search_term),
                    Transaction.reference_number.ilike(search_term),
                    Transaction.memo.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(Transaction, filters.sort_by, Transaction.transaction_date)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(Transaction.transaction_date))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        transactions = result.scalars().all()
        
        return transactions, total
    
    @staticmethod
    async def get_transaction_by_id(
        db: AsyncSession,
        company_id: str,
        transaction_id: str
    ) -> Optional[Transaction]:
        """Get transaction by ID with all relationships"""
        result = await db.execute(
            select(Transaction).where(
                and_(
                    Transaction.transaction_id == transaction_id,
                    Transaction.company_id == company_id
                )
            ).options(
                selectinload(Transaction.lines),
                selectinload(Transaction.journal_entries),
                selectinload(Transaction.customer),
                selectinload(Transaction.vendor)
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_transaction(
        db: AsyncSession,
        transaction: Transaction,
        transaction_data: TransactionUpdate,
        user_id: str
    ) -> Transaction:
        """Update transaction"""
        # Prevent updates to posted transactions
        if transaction.is_posted:
            raise ValueError("Cannot update posted transaction")
        
        update_data = transaction_data.dict(exclude_unset=True)
        
        # Handle line updates if provided
        if 'lines' in update_data:
            lines_data = update_data.pop('lines')
            
            # Delete existing lines
            await db.execute(
                text("DELETE FROM transaction_lines WHERE transaction_id = :transaction_id"),
                {"transaction_id": transaction.transaction_id}
            )
            
            # Create new lines
            for line_data in lines_data:
                line_total = await TransactionService._calculate_line_total(line_data)
                line = TransactionLine(
                    line_id=str(uuid.uuid4()),
                    transaction_id=transaction.transaction_id,
                    line_total=line_total,
                    **line_data
                )
                db.add(line)
            
            # Recalculate totals
            subtotal, tax_amount, total_amount = await TransactionService._calculate_transaction_totals(
                lines_data
            )
            transaction.subtotal = subtotal
            transaction.tax_amount = tax_amount
            transaction.total_amount = total_amount
            transaction.balance_due = total_amount  # Reset balance due
        
        # Update other fields
        for field, value in update_data.items():
            setattr(transaction, field, value)
        
        transaction.updated_by = user_id
        
        await db.commit()
        await db.refresh(transaction)
        
        logger.info("Transaction updated", transaction_id=transaction.transaction_id)
        return transaction
    
    @staticmethod
    async def post_transaction(
        db: AsyncSession,
        transaction: Transaction,
        user_id: str,
        posting_date: Optional[date] = None
    ) -> Transaction:
        """Post transaction and create journal entries"""
        if transaction.is_posted:
            raise ValueError("Transaction already posted")
        
        if transaction.is_void:
            raise ValueError("Cannot post voided transaction")
        
        # Create journal entries for double-entry bookkeeping
        await TransactionService._create_journal_entries(db, transaction, posting_date)
        
        # Update transaction status
        transaction.is_posted = True
        transaction.status = TransactionStatus.POSTED
        transaction.updated_by = user_id
        
        await db.commit()
        await db.refresh(transaction)
        
        logger.info("Transaction posted", transaction_id=transaction.transaction_id)
        return transaction
    
    @staticmethod
    async def void_transaction(
        db: AsyncSession,
        transaction: Transaction,
        user_id: str,
        reason: Optional[str] = None
    ) -> Transaction:
        """Void transaction"""
        if transaction.is_void:
            raise ValueError("Transaction already voided")
        
        # Reverse journal entries if posted
        if transaction.is_posted:
            await TransactionService._reverse_journal_entries(db, transaction)
        
        # Update transaction
        transaction.is_void = True
        transaction.status = TransactionStatus.VOIDED
        transaction.voided_at = datetime.utcnow()
        transaction.voided_by = user_id
        transaction.balance_due = Decimal('0.0')
        
        if reason:
            transaction.memo = f"{transaction.memo or ''}\nVOIDED: {reason}".strip()
        
        await db.commit()
        await db.refresh(transaction)
        
        logger.info("Transaction voided", transaction_id=transaction.transaction_id)
        return transaction
    
    @staticmethod
    async def delete_transaction(
        db: AsyncSession,
        transaction: Transaction
    ) -> None:
        """Delete transaction (only if not posted)"""
        if transaction.is_posted:
            raise ValueError("Cannot delete posted transaction. Void instead.")
        
        await db.delete(transaction)
        await db.commit()
        
        logger.info("Transaction deleted", transaction_id=transaction.transaction_id)

    # Invoice-specific methods
    @staticmethod
    async def create_invoice(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        invoice_data: InvoiceCreate
    ) -> Transaction:
        """Create a new invoice"""
        return await TransactionService.create_transaction(db, company_id, user_id, invoice_data)
    
    @staticmethod
    async def send_invoice_email(
        db: AsyncSession,
        transaction: Transaction,
        email_address: Optional[str] = None
    ) -> bool:
        """Send invoice via email (placeholder)"""
        # TODO: Implement email service integration
        transaction.status = TransactionStatus.SENT
        await db.commit()
        
        logger.info("Invoice sent", transaction_id=transaction.transaction_id)
        return True
    
    # Bill-specific methods
    @staticmethod
    async def create_bill(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        bill_data: BillCreate
    ) -> Transaction:
        """Create a new bill"""
        return await TransactionService.create_transaction(db, company_id, user_id, bill_data)

    # Sales Receipt methods
    @staticmethod
    async def create_sales_receipt(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        receipt_data: SalesReceiptCreate
    ) -> Transaction:
        """Create a new sales receipt"""
        # Sales receipts are automatically paid
        receipt_data.status = TransactionStatus.PAID
        transaction = await TransactionService.create_transaction(db, company_id, user_id, receipt_data)
        transaction.balance_due = Decimal('0.0')
        await db.commit()
        return transaction

    # Helper methods
    @staticmethod
    async def _calculate_line_total(line_data) -> Decimal:
        """Calculate total for a transaction line"""
        quantity = line_data.get('quantity', Decimal('1.0')) or Decimal('1.0')
        unit_price = line_data.get('unit_price', Decimal('0.0')) or Decimal('0.0')
        discount_amount = line_data.get('discount_amount', Decimal('0.0')) or Decimal('0.0')
        tax_amount = line_data.get('tax_amount', Decimal('0.0')) or Decimal('0.0')
        
        subtotal = quantity * unit_price
        total = subtotal - discount_amount + tax_amount
        return total
    
    @staticmethod
    async def _calculate_transaction_totals(lines_data) -> Tuple[Decimal, Decimal, Decimal]:
        """Calculate transaction totals from line items"""
        subtotal = Decimal('0.0')
        tax_amount = Decimal('0.0')
        
        for line_data in lines_data:
            quantity = line_data.get('quantity', Decimal('1.0')) or Decimal('1.0')
            unit_price = line_data.get('unit_price', Decimal('0.0')) or Decimal('0.0')
            discount_amount = line_data.get('discount_amount', Decimal('0.0')) or Decimal('0.0')
            line_tax = line_data.get('tax_amount', Decimal('0.0')) or Decimal('0.0')
            
            line_subtotal = quantity * unit_price - discount_amount
            subtotal += line_subtotal
            tax_amount += line_tax
        
        total_amount = subtotal + tax_amount
        return subtotal, tax_amount, total_amount
    
    @staticmethod
    async def _generate_transaction_number(
        db: AsyncSession,
        company_id: str,
        transaction_type: TransactionType
    ) -> str:
        """Generate next transaction number"""
        type_prefixes = {
            TransactionType.INVOICE: "INV",
            TransactionType.BILL: "BILL",
            TransactionType.PAYMENT: "PMT",
            TransactionType.CHECK: "CHK",
            TransactionType.SALES_RECEIPT: "SR",
            TransactionType.CREDIT_MEMO: "CM",
            TransactionType.DEPOSIT: "DEP",
            TransactionType.JOURNAL_ENTRY: "JE"
        }
        
        prefix = type_prefixes.get(transaction_type, "TXN")
        
        # Get count of existing transactions of this type
        result = await db.execute(
            select(func.count(Transaction.transaction_id)).where(
                and_(
                    Transaction.company_id == company_id,
                    Transaction.transaction_type == transaction_type
                )
            )
        )
        count = result.scalar() or 0
        return f"{prefix}-{count + 1:06d}"
    
    @staticmethod
    async def _create_journal_entries(
        db: AsyncSession,
        transaction: Transaction,
        posting_date: Optional[date] = None
    ) -> None:
        """Create journal entries for double-entry bookkeeping"""
        if not posting_date:
            posting_date = transaction.transaction_date
        
        # This is a simplified version. In a real system, you'd have complex
        # rules based on transaction type, accounts, etc.
        
        entries = []
        
        if transaction.transaction_type == TransactionType.INVOICE:
            # Debit Accounts Receivable, Credit Revenue
            if transaction.customer_id:
                # Get customer's AR account or default AR account
                ar_account_id = await TransactionService._get_accounts_receivable_account(db, transaction.company_id)
                
                # Accounts Receivable (Debit)
                entries.append(JournalEntry(
                    entry_id=str(uuid.uuid4()),
                    transaction_id=transaction.transaction_id,
                    account_id=ar_account_id,
                    debit_amount=transaction.total_amount,
                    credit_amount=Decimal('0.0'),
                    description=f"Invoice {transaction.transaction_number}",
                    posting_date=posting_date
                ))
                
                # Revenue accounts (Credit) - from line items
                await db.refresh(transaction, ['lines'])
                for line in transaction.lines:
                    if line.account_id:
                        entries.append(JournalEntry(
                            entry_id=str(uuid.uuid4()),
                            transaction_id=transaction.transaction_id,
                            account_id=line.account_id,
                            debit_amount=Decimal('0.0'),
                            credit_amount=line.line_total or Decimal('0.0'),
                            description=f"Invoice {transaction.transaction_number} - {line.description}",
                            posting_date=posting_date
                        ))
        
        elif transaction.transaction_type == TransactionType.BILL:
            # Credit Accounts Payable, Debit Expense/Asset
            if transaction.vendor_id:
                ap_account_id = await TransactionService._get_accounts_payable_account(db, transaction.company_id)
                
                # Accounts Payable (Credit)
                entries.append(JournalEntry(
                    entry_id=str(uuid.uuid4()),
                    transaction_id=transaction.transaction_id,
                    account_id=ap_account_id,
                    debit_amount=Decimal('0.0'),
                    credit_amount=transaction.total_amount,
                    description=f"Bill {transaction.transaction_number}",
                    posting_date=posting_date
                ))
                
                # Expense accounts (Debit) - from line items
                await db.refresh(transaction, ['lines'])
                for line in transaction.lines:
                    if line.account_id:
                        entries.append(JournalEntry(
                            entry_id=str(uuid.uuid4()),
                            transaction_id=transaction.transaction_id,
                            account_id=line.account_id,
                            debit_amount=line.line_total or Decimal('0.0'),
                            credit_amount=Decimal('0.0'),
                            description=f"Bill {transaction.transaction_number} - {line.description}",
                            posting_date=posting_date
                        ))
        
        # Add all journal entries
        for entry in entries:
            db.add(entry)
    
    @staticmethod
    async def _reverse_journal_entries(
        db: AsyncSession,
        transaction: Transaction
    ) -> None:
        """Reverse journal entries for voided transaction"""
        # Get existing journal entries
        result = await db.execute(
            select(JournalEntry).where(
                JournalEntry.transaction_id == transaction.transaction_id
            )
        )
        entries = result.scalars().all()
        
        # Create reversal entries
        for entry in entries:
            reversal = JournalEntry(
                entry_id=str(uuid.uuid4()),
                transaction_id=transaction.transaction_id,
                account_id=entry.account_id,
                debit_amount=entry.credit_amount,  # Swap debit/credit
                credit_amount=entry.debit_amount,
                description=f"REVERSAL: {entry.description}",
                posting_date=datetime.utcnow().date()
            )
            db.add(reversal)
    
    @staticmethod
    async def _get_accounts_receivable_account(db: AsyncSession, company_id: str) -> str:
        """Get default Accounts Receivable account"""
        result = await db.execute(
            select(Account.account_id).where(
                and_(
                    Account.company_id == company_id,
                    Account.account_name.ilike("%receivable%"),
                    Account.is_active == True
                )
            ).limit(1)
        )
        account_id = result.scalar()
        return account_id or "default-ar-account"
    
    @staticmethod
    async def _get_accounts_payable_account(db: AsyncSession, company_id: str) -> str:
        """Get default Accounts Payable account"""
        result = await db.execute(
            select(Account.account_id).where(
                and_(
                    Account.company_id == company_id,
                    Account.account_name.ilike("%payable%"),
                    Account.is_active == True
                )
            ).limit(1)
        )
        account_id = result.scalar()
        return account_id or "default-ap-account"

class PaymentService(BaseListService):
    """Service for payment management operations"""
    
    @staticmethod
    async def create_payment(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        payment_data: PaymentCreate
    ) -> Payment:
        """Create a new payment with applications"""
        
        # Generate payment number if not provided
        if not payment_data.payment_number:
            payment_data.payment_number = await PaymentService._generate_payment_number(db, company_id)
        
        # Create payment
        payment = Payment(
            payment_id=str(uuid.uuid4()),
            company_id=company_id,
            created_by=user_id,
            **payment_data.dict(exclude={'applications'})
        )
        
        db.add(payment)
        await db.flush()
        
        # Create payment applications
        total_applied = Decimal('0.0')
        for app_data in payment_data.applications:
            application = PaymentApplication(
                application_id=str(uuid.uuid4()),
                payment_id=payment.payment_id,
                **app_data.dict()
            )
            db.add(application)
            total_applied += app_data.amount_applied
            
            # Update transaction balance
            await PaymentService._update_transaction_balance(
                db, app_data.transaction_id, app_data.amount_applied
            )
        
        # Verify total applied doesn't exceed payment amount
        if total_applied > payment.amount_received:
            raise ValueError("Total applied amount exceeds payment amount")
        
        await db.commit()
        await db.refresh(payment)
        
        logger.info("Payment created", payment_id=payment.payment_id, company_id=company_id)
        return payment
    
    @staticmethod
    async def _generate_payment_number(db: AsyncSession, company_id: str) -> str:
        """Generate next payment number"""
        result = await db.execute(
            select(func.count(Payment.payment_id)).where(
                Payment.company_id == company_id
            )
        )
        count = result.scalar() or 0
        return f"PMT-{count + 1:06d}"
    
    @staticmethod
    async def _update_transaction_balance(
        db: AsyncSession,
        transaction_id: str,
        amount_applied: Decimal
    ) -> None:
        """Update transaction balance due"""
        result = await db.execute(
            select(Transaction).where(Transaction.transaction_id == transaction_id)
        )
        transaction = result.scalar_one_or_none()
        
        if transaction:
            current_balance = transaction.balance_due or transaction.total_amount
            new_balance = current_balance - amount_applied
            transaction.balance_due = max(new_balance, Decimal('0.0'))
            
            # Update status based on balance
            if transaction.balance_due == Decimal('0.0'):
                transaction.status = TransactionStatus.PAID
            elif transaction.balance_due < transaction.total_amount:
                transaction.status = TransactionStatus.PARTIALLY_PAID

class RecurringTransactionService(BaseListService):
    """Service for recurring transaction management"""
    
    @staticmethod
    async def create_recurring_transaction(
        db: AsyncSession,
        company_id: str,
        recurring_data: RecurringTransactionCreate
    ) -> RecurringTransaction:
        """Create recurring transaction template"""
        
        recurring = RecurringTransaction(
            recurring_id=str(uuid.uuid4()),
            company_id=company_id,
            next_occurrence=recurring_data.start_date,
            **recurring_data.dict()
        )
        
        db.add(recurring)
        await db.commit()
        await db.refresh(recurring)
        
        logger.info("Recurring transaction created", recurring_id=recurring.recurring_id)
        return recurring