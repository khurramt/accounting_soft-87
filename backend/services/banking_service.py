import uuid
import json
import logging
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload

from models.banking import (
    BankConnection, BankTransaction, BankRule, BankReconciliation,
    BankInstitution, BankStatementImport, ConnectionTypeEnum,
    TransactionStatusEnum, ReconciliationStatusEnum
)
from models.list_management import Account
from models.user import Company
from schemas.banking_schemas import (
    BankConnectionCreate, BankConnectionUpdate, BankTransactionCreate,
    BankTransactionUpdate, BankRuleCreate, BankRuleUpdate,
    BankReconciliationCreate, BankReconciliationUpdate, BankTransactionFilter,
    InstitutionSearchFilter
)

logger = logging.getLogger(__name__)


class BankingService:
    """Main banking service for managing bank connections and transactions"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # Bank Connection Management
    async def create_bank_connection(
        self, 
        company_id: str, 
        connection_data: BankConnectionCreate,
        user_id: str
    ) -> BankConnection:
        """Create a new bank connection"""
        try:
            # Validate account exists if provided
            if connection_data.account_id:
                result = await self.db.execute(
                    select(Account).where(
                        and_(
                            Account.account_id == connection_data.account_id,
                            Account.company_id == company_id
                        )
                    )
                )
                account = result.scalar_one_or_none()
                if not account:
                    raise ValueError("Account not found")
            
            # Create connection
            connection = BankConnection(
                connection_id=str(uuid.uuid4()),
                company_id=company_id,
                **connection_data.dict()
            )
            
            self.db.add(connection)
            await self.db.commit()
            await self.db.refresh(connection)
            
            logger.info(f"Created bank connection {connection.connection_id} for company {company_id}")
            return connection
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating bank connection: {e}")
            raise
    
    async def get_bank_connections(
        self, 
        company_id: str, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[BankConnection]:
        """Get bank connections for a company"""
        try:
            query = select(BankConnection).where(
                BankConnection.company_id == company_id
            )
            
            if is_active is not None:
                query = query.where(BankConnection.is_active == is_active)
            
            query = query.offset(skip).limit(limit).order_by(desc(BankConnection.created_at))
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error getting bank connections: {e}")
            raise
    
    async def get_bank_connection(self, connection_id: str, company_id: str) -> Optional[BankConnection]:
        """Get a specific bank connection"""
        try:
            result = await self.db.execute(
                select(BankConnection).where(
                    and_(
                        BankConnection.connection_id == connection_id,
                        BankConnection.company_id == company_id
                    )
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting bank connection: {e}")
            raise
    
    async def update_bank_connection(
        self, 
        connection_id: str, 
        company_id: str, 
        connection_data: BankConnectionUpdate,
        user_id: str
    ) -> Optional[BankConnection]:
        """Update a bank connection"""
        try:
            connection = await self.get_bank_connection(connection_id, company_id)
            if not connection:
                return None
            
            # Update fields
            for field, value in connection_data.dict(exclude_unset=True).items():
                setattr(connection, field, value)
            
            connection.updated_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(connection)
            
            logger.info(f"Updated bank connection {connection_id}")
            return connection
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating bank connection: {e}")
            raise
    
    async def delete_bank_connection(self, connection_id: str, company_id: str, user_id: str) -> bool:
        """Delete a bank connection (soft delete)"""
        try:
            connection = await self.get_bank_connection(connection_id, company_id)
            if not connection:
                return False
            
            connection.is_active = False
            connection.updated_at = datetime.utcnow()
            await self.db.commit()
            
            logger.info(f"Deleted bank connection {connection_id}")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting bank connection: {e}")
            raise
    
    # Bank Transaction Management
    async def create_bank_transaction(
        self, 
        transaction_data: BankTransactionCreate,
        user_id: str
    ) -> BankTransaction:
        """Create a new bank transaction"""
        try:
            # Validate connection exists
            connection = await self.get_bank_connection(
                transaction_data.connection_id, 
                None  # We'll get company_id from connection
            )
            if not connection:
                raise ValueError("Bank connection not found")
            
            # Check for duplicate transaction
            existing = await self.db.execute(
                select(BankTransaction).where(
                    and_(
                        BankTransaction.connection_id == transaction_data.connection_id,
                        BankTransaction.transaction_id == transaction_data.transaction_id
                    )
                )
            )
            if existing.scalar_one_or_none():
                raise ValueError("Transaction already exists")
            
            # Create transaction
            transaction = BankTransaction(
                bank_transaction_id=str(uuid.uuid4()),
                **transaction_data.dict()
            )
            
            self.db.add(transaction)
            await self.db.commit()
            await self.db.refresh(transaction)
            
            logger.info(f"Created bank transaction {transaction.bank_transaction_id}")
            return transaction
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating bank transaction: {e}")
            raise
    
    async def get_bank_transactions(
        self, 
        company_id: str,
        connection_id: Optional[str] = None,
        filters: Optional[BankTransactionFilter] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[BankTransaction]:
        """Get bank transactions with filtering"""
        try:
            # Build query
            query = select(BankTransaction).join(BankConnection).where(
                BankConnection.company_id == company_id
            )
            
            if connection_id:
                query = query.where(BankTransaction.connection_id == connection_id)
            
            if filters:
                if filters.status:
                    query = query.where(BankTransaction.status == filters.status)
                if filters.transaction_type:
                    query = query.where(BankTransaction.transaction_type == filters.transaction_type)
                if filters.date_from:
                    query = query.where(BankTransaction.transaction_date >= filters.date_from)
                if filters.date_to:
                    query = query.where(BankTransaction.transaction_date <= filters.date_to)
                if filters.amount_min:
                    query = query.where(BankTransaction.amount >= filters.amount_min)
                if filters.amount_max:
                    query = query.where(BankTransaction.amount <= filters.amount_max)
                if filters.description_contains:
                    query = query.where(BankTransaction.description.ilike(f'%{filters.description_contains}%'))
                if filters.merchant_name_contains:
                    query = query.where(BankTransaction.merchant_name.ilike(f'%{filters.merchant_name_contains}%'))
                if filters.category:
                    query = query.where(BankTransaction.category == filters.category)
                if filters.pending is not None:
                    query = query.where(BankTransaction.pending == filters.pending)
            
            query = query.offset(skip).limit(limit).order_by(desc(BankTransaction.transaction_date))
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error getting bank transactions: {e}")
            raise
    
    async def get_bank_transaction(self, bank_transaction_id: str, company_id: str) -> Optional[BankTransaction]:
        """Get a specific bank transaction"""
        try:
            result = await self.db.execute(
                select(BankTransaction).join(BankConnection).where(
                    and_(
                        BankTransaction.bank_transaction_id == bank_transaction_id,
                        BankConnection.company_id == company_id
                    )
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting bank transaction: {e}")
            raise
    
    async def update_bank_transaction(
        self, 
        bank_transaction_id: str, 
        company_id: str,
        transaction_data: BankTransactionUpdate,
        user_id: str
    ) -> Optional[BankTransaction]:
        """Update a bank transaction"""
        try:
            transaction = await self.get_bank_transaction(bank_transaction_id, company_id)
            if not transaction:
                return None
            
            # Update fields
            for field, value in transaction_data.dict(exclude_unset=True).items():
                setattr(transaction, field, value)
            
            await self.db.commit()
            await self.db.refresh(transaction)
            
            logger.info(f"Updated bank transaction {bank_transaction_id}")
            return transaction
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating bank transaction: {e}")
            raise
    
    # Bank Institution Management
    async def search_institutions(
        self, 
        filters: Optional[InstitutionSearchFilter] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[BankInstitution]:
        """Search bank institutions"""
        try:
            query = select(BankInstitution).where(BankInstitution.is_active == True)
            
            if filters:
                if filters.name_contains:
                    query = query.where(BankInstitution.name.ilike(f'%{filters.name_contains}%'))
                if filters.routing_number:
                    query = query.where(BankInstitution.routing_number == filters.routing_number)
                if filters.supports_ofx is not None:
                    query = query.where(BankInstitution.supports_ofx == filters.supports_ofx)
                if filters.supports_direct_connect is not None:
                    query = query.where(BankInstitution.supports_direct_connect == filters.supports_direct_connect)
            
            query = query.offset(skip).limit(limit).order_by(asc(BankInstitution.name))
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error searching institutions: {e}")
            raise
    
    async def get_institution(self, institution_id: str) -> Optional[BankInstitution]:
        """Get a specific bank institution"""
        try:
            result = await self.db.execute(
                select(BankInstitution).where(
                    and_(
                        BankInstitution.institution_id == institution_id,
                        BankInstitution.is_active == True
                    )
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting institution: {e}")
            raise
    
    async def sync_bank_connection(self, connection_id: str, company_id: str, user_id: str) -> Dict[str, Any]:
        """Sync bank connection (mock implementation)"""
        try:
            connection = await self.get_bank_connection(connection_id, company_id)
            if not connection:
                raise ValueError("Bank connection not found")
            
            # Mock sync - in real implementation, this would call external banking API
            mock_transactions = await self._generate_mock_transactions(connection)
            
            # Update last sync date
            connection.last_sync_date = datetime.utcnow()
            await self.db.commit()
            
            result = {
                "success": True,
                "transactions_downloaded": len(mock_transactions),
                "new_transactions": len(mock_transactions),
                "duplicates": 0,
                "errors": 0,
                "last_sync": connection.last_sync_date.isoformat()
            }
            
            logger.info(f"Synced bank connection {connection_id}: {result}")
            return result
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error syncing bank connection: {e}")
            raise
    
    async def _generate_mock_transactions(self, connection: BankConnection) -> List[BankTransaction]:
        """Generate mock transactions for testing"""
        transactions = []
        
        # Generate 5-10 mock transactions
        import random
        num_transactions = random.randint(5, 10)
        
        for i in range(num_transactions):
            transaction_date = datetime.now().date() - timedelta(days=random.randint(1, 30))
            amount = round(random.uniform(-1000, 1000), 2)
            
            transaction_data = BankTransactionCreate(
                connection_id=connection.connection_id,
                transaction_id=f"TXN_{uuid.uuid4().hex[:8]}",
                transaction_date=transaction_date,
                amount=amount,
                transaction_type="debit" if amount < 0 else "credit",
                description=f"Mock transaction {i+1}",
                merchant_name=f"Mock Merchant {i+1}",
                category="general",
                balance=random.uniform(1000, 10000)
            )
            
            transaction = await self.create_bank_transaction(transaction_data, "system")
            transactions.append(transaction)
        
        return transactions