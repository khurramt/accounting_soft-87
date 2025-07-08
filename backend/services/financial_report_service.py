from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc, text, case
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional, Tuple, Dict, Any, Union
from models.transactions import Transaction, TransactionLine, JournalEntry, TransactionType, TransactionStatus
from models.list_management import Account, Customer, Vendor, AccountType
from models.user import Company
from schemas.report_schemas import (
    FinancialReportData, FinancialSection, FinancialLine,
    ProfitLossRequest, BalanceSheetRequest, CashFlowRequest,
    TrialBalanceRequest, AgingReportRequest
)
import structlog
from datetime import datetime, date, timedelta
from decimal import Decimal
from collections import defaultdict

logger = structlog.get_logger()

class FinancialReportService:
    """Service for generating financial reports"""
    
    @staticmethod
    async def generate_profit_loss_report(
        db: AsyncSession,
        company_id: str,
        request: ProfitLossRequest
    ) -> FinancialReportData:
        """Generate Profit & Loss (Income Statement) report"""
        
        # Get company info
        company = await FinancialReportService._get_company(db, company_id)
        
        # Get account balances for the period
        income_accounts = await FinancialReportService._get_account_balances_by_type(
            db, company_id, AccountType.REVENUE, request.start_date, request.end_date
        )
        
        expense_accounts = await FinancialReportService._get_account_balances_by_type(
            db, company_id, AccountType.EXPENSES, request.start_date, request.end_date
        )
        
        cogs_accounts = await FinancialReportService._get_account_balances_by_type(
            db, company_id, AccountType.COST_OF_GOODS_SOLD, request.start_date, request.end_date
        )
        
        # Get comparison period data if requested
        comparison_income = comparison_expenses = comparison_cogs = {}
        if request.comparison_type != "none" and request.comparison_start_date and request.comparison_end_date:
            comparison_income = await FinancialReportService._get_account_balances_by_type(
                db, company_id, AccountType.REVENUE, request.comparison_start_date, request.comparison_end_date
            )
            comparison_expenses = await FinancialReportService._get_account_balances_by_type(
                db, company_id, AccountType.EXPENSES, request.comparison_start_date, request.comparison_end_date
            )
            comparison_cogs = await FinancialReportService._get_account_balances_by_type(
                db, company_id, AccountType.COST_OF_GOODS_SOLD, request.comparison_start_date, request.comparison_end_date
            )
        
        # Build report sections
        sections = []
        
        # Income section
        income_lines = []
        total_income = Decimal('0.0')
        comparison_total_income = Decimal('0.0')
        
        for account_id, account_data in income_accounts.items():
            comparison_amount = comparison_income.get(account_id, {}).get('balance', Decimal('0.0'))
            variance = account_data['balance'] - comparison_amount if comparison_amount else None
            
            income_lines.append(FinancialLine(
                account_id=account_id,
                account_name=account_data['name'],
                amount=account_data['balance'],
                comparison_amount=comparison_amount if comparison_amount else None,
                variance_amount=variance,
                variance_percentage=FinancialReportService._calculate_percentage_change(
                    comparison_amount, account_data['balance']
                ) if comparison_amount else None
            ))
            total_income += account_data['balance']
            comparison_total_income += comparison_amount
        
        sections.append(FinancialSection(
            section_name="Income",
            lines=income_lines,
            total_amount=total_income,
            comparison_total=comparison_total_income if comparison_total_income else None
        ))
        
        # Cost of Goods Sold section
        cogs_lines = []
        total_cogs = Decimal('0.0')
        comparison_total_cogs = Decimal('0.0')
        
        for account_id, account_data in cogs_accounts.items():
            comparison_amount = comparison_cogs.get(account_id, {}).get('balance', Decimal('0.0'))
            variance = account_data['balance'] - comparison_amount if comparison_amount else None
            
            cogs_lines.append(FinancialLine(
                account_id=account_id,
                account_name=account_data['name'],
                amount=account_data['balance'],
                comparison_amount=comparison_amount if comparison_amount else None,
                variance_amount=variance,
                variance_percentage=FinancialReportService._calculate_percentage_change(
                    comparison_amount, account_data['balance']
                ) if comparison_amount else None
            ))
            total_cogs += account_data['balance']
            comparison_total_cogs += comparison_amount
        
        if cogs_lines:
            sections.append(FinancialSection(
                section_name="Cost of Goods Sold",
                lines=cogs_lines,
                total_amount=total_cogs,
                comparison_total=comparison_total_cogs if comparison_total_cogs else None
            ))
        
        # Gross Profit calculation
        gross_profit = total_income - total_cogs
        comparison_gross_profit = comparison_total_income - comparison_total_cogs
        
        sections.append(FinancialSection(
            section_name="Gross Profit",
            lines=[FinancialLine(
                account_name="Gross Profit",
                amount=gross_profit,
                comparison_amount=comparison_gross_profit if comparison_gross_profit else None,
                variance_amount=gross_profit - comparison_gross_profit if comparison_gross_profit else None,
                variance_percentage=FinancialReportService._calculate_percentage_change(
                    comparison_gross_profit, gross_profit
                ) if comparison_gross_profit else None
            )],
            total_amount=gross_profit,
            comparison_total=comparison_gross_profit if comparison_gross_profit else None
        ))
        
        # Expenses section
        expense_lines = []
        total_expenses = Decimal('0.0')
        comparison_total_expenses = Decimal('0.0')
        
        for account_id, account_data in expense_accounts.items():
            comparison_amount = comparison_expenses.get(account_id, {}).get('balance', Decimal('0.0'))
            variance = account_data['balance'] - comparison_amount if comparison_amount else None
            
            expense_lines.append(FinancialLine(
                account_id=account_id,
                account_name=account_data['name'],
                amount=account_data['balance'],
                comparison_amount=comparison_amount if comparison_amount else None,
                variance_amount=variance,
                variance_percentage=FinancialReportService._calculate_percentage_change(
                    comparison_amount, account_data['balance']
                ) if comparison_amount else None
            ))
            total_expenses += account_data['balance']
            comparison_total_expenses += comparison_amount
        
        sections.append(FinancialSection(
            section_name="Expenses",
            lines=expense_lines,
            total_amount=total_expenses,
            comparison_total=comparison_total_expenses if comparison_total_expenses else None
        ))
        
        # Net Income calculation
        net_income = gross_profit - total_expenses
        comparison_net_income = comparison_gross_profit - comparison_total_expenses
        
        return FinancialReportData(
            report_name="Profit & Loss",
            company_name=company.company_name,
            report_date=request.end_date,
            comparison_date=request.comparison_end_date,
            sections=sections,
            grand_total=net_income,
            generated_at=datetime.now()
        )
    
    @staticmethod
    async def generate_balance_sheet_report(
        db: AsyncSession,
        company_id: str,
        request: BalanceSheetRequest
    ) -> FinancialReportData:
        """Generate Balance Sheet report"""
        
        company = await FinancialReportService._get_company(db, company_id)
        
        # Get account balances as of the report date
        asset_accounts = await FinancialReportService._get_account_balances_as_of_date(
            db, company_id, AccountType.ASSETS, request.as_of_date
        )
        
        liability_accounts = await FinancialReportService._get_account_balances_as_of_date(
            db, company_id, AccountType.LIABILITIES, request.as_of_date
        )
        
        equity_accounts = await FinancialReportService._get_account_balances_as_of_date(
            db, company_id, AccountType.EQUITY, request.as_of_date
        )
        
        # Get comparison data if requested
        comparison_assets = comparison_liabilities = comparison_equity = {}
        if request.comparison_date:
            comparison_assets = await FinancialReportService._get_account_balances_as_of_date(
                db, company_id, AccountType.ASSETS, request.comparison_date
            )
            comparison_liabilities = await FinancialReportService._get_account_balances_as_of_date(
                db, company_id, AccountType.LIABILITIES, request.comparison_date
            )
            comparison_equity = await FinancialReportService._get_account_balances_as_of_date(
                db, company_id, AccountType.EQUITY, request.comparison_date
            )
        
        sections = []
        
        # Assets section
        asset_lines = []
        total_assets = Decimal('0.0')
        comparison_total_assets = Decimal('0.0')
        
        for account_id, account_data in asset_accounts.items():
            comparison_amount = comparison_assets.get(account_id, {}).get('balance', Decimal('0.0'))
            variance = account_data['balance'] - comparison_amount if comparison_amount else None
            
            asset_lines.append(FinancialLine(
                account_id=account_id,
                account_name=account_data['name'],
                amount=account_data['balance'],
                comparison_amount=comparison_amount if comparison_amount else None,
                variance_amount=variance
            ))
            total_assets += account_data['balance']
            comparison_total_assets += comparison_amount
        
        sections.append(FinancialSection(
            section_name="Assets",
            lines=asset_lines,
            total_amount=total_assets,
            comparison_total=comparison_total_assets if comparison_total_assets else None
        ))
        
        # Liabilities section
        liability_lines = []
        total_liabilities = Decimal('0.0')
        comparison_total_liabilities = Decimal('0.0')
        
        for account_id, account_data in liability_accounts.items():
            comparison_amount = comparison_liabilities.get(account_id, {}).get('balance', Decimal('0.0'))
            variance = account_data['balance'] - comparison_amount if comparison_amount else None
            
            liability_lines.append(FinancialLine(
                account_id=account_id,
                account_name=account_data['name'],
                amount=account_data['balance'],
                comparison_amount=comparison_amount if comparison_amount else None,
                variance_amount=variance
            ))
            total_liabilities += account_data['balance']
            comparison_total_liabilities += comparison_amount
        
        sections.append(FinancialSection(
            section_name="Liabilities",
            lines=liability_lines,
            total_amount=total_liabilities,
            comparison_total=comparison_total_liabilities if comparison_total_liabilities else None
        ))
        
        # Equity section
        equity_lines = []
        total_equity = Decimal('0.0')
        comparison_total_equity = Decimal('0.0')
        
        for account_id, account_data in equity_accounts.items():
            comparison_amount = comparison_equity.get(account_id, {}).get('balance', Decimal('0.0'))
            variance = account_data['balance'] - comparison_amount if comparison_amount else None
            
            equity_lines.append(FinancialLine(
                account_id=account_id,
                account_name=account_data['name'],
                amount=account_data['balance'],
                comparison_amount=comparison_amount if comparison_amount else None,
                variance_amount=variance
            ))
            total_equity += account_data['balance']
            comparison_total_equity += comparison_amount
        
        sections.append(FinancialSection(
            section_name="Equity",
            lines=equity_lines,
            total_amount=total_equity,
            comparison_total=comparison_total_equity if comparison_total_equity else None
        ))
        
        # Total Liabilities & Equity
        total_liab_equity = total_liabilities + total_equity
        
        return FinancialReportData(
            report_name="Balance Sheet",
            company_name=company.company_name,
            report_date=request.as_of_date,
            comparison_date=request.comparison_date,
            sections=sections,
            grand_total=total_assets,  # Should equal total_liab_equity
            generated_at=datetime.now()
        )
    
    @staticmethod
    async def generate_cash_flow_report(
        db: AsyncSession,
        company_id: str,
        request: CashFlowRequest
    ) -> FinancialReportData:
        """Generate Cash Flow Statement report"""
        
        company = await FinancialReportService._get_company(db, company_id)
        
        # This is a simplified cash flow calculation
        # In a real system, you'd need more sophisticated logic for indirect method
        
        sections = []
        
        # Operating Activities
        operating_activities = await FinancialReportService._calculate_operating_cash_flow(
            db, company_id, request.start_date, request.end_date, request.method
        )
        
        sections.append(FinancialSection(
            section_name="Cash Flows from Operating Activities",
            lines=operating_activities['lines'],
            total_amount=operating_activities['total']
        ))
        
        # Investing Activities
        investing_activities = await FinancialReportService._calculate_investing_cash_flow(
            db, company_id, request.start_date, request.end_date
        )
        
        sections.append(FinancialSection(
            section_name="Cash Flows from Investing Activities",
            lines=investing_activities['lines'],
            total_amount=investing_activities['total']
        ))
        
        # Financing Activities
        financing_activities = await FinancialReportService._calculate_financing_cash_flow(
            db, company_id, request.start_date, request.end_date
        )
        
        sections.append(FinancialSection(
            section_name="Cash Flows from Financing Activities",
            lines=financing_activities['lines'],
            total_amount=financing_activities['total']
        ))
        
        # Net Change in Cash
        net_change = (operating_activities['total'] + 
                     investing_activities['total'] + 
                     financing_activities['total'])
        
        return FinancialReportData(
            report_name="Statement of Cash Flows",
            company_name=company.company_name,
            report_date=request.end_date,
            sections=sections,
            grand_total=net_change,
            generated_at=datetime.now()
        )
    
    @staticmethod
    async def generate_trial_balance_report(
        db: AsyncSession,
        company_id: str,
        request: TrialBalanceRequest
    ) -> Dict[str, Any]:
        """Generate Trial Balance report"""
        
        # Get all account balances as of the report date
        query = text("""
            SELECT 
                a.account_id,
                a.account_name,
                a.account_type,
                a.account_number,
                COALESCE(SUM(je.debit_amount), 0) as total_debits,
                COALESCE(SUM(je.credit_amount), 0) as total_credits,
                COALESCE(SUM(je.debit_amount) - SUM(je.credit_amount), 0) as balance
            FROM accounts a
            LEFT JOIN journal_entries je ON a.account_id = je.account_id
            LEFT JOIN transactions t ON je.transaction_id = t.transaction_id
            WHERE a.company_id = :company_id
            AND a.is_active = 1
            AND (t.transaction_date <= :as_of_date OR t.transaction_date IS NULL)
            AND (t.is_posted = 1 OR t.is_posted IS NULL)
            GROUP BY a.account_id, a.account_name, a.account_type, a.account_number
            ORDER BY a.account_number, a.account_name
        """)
        
        result = await db.execute(query, {
            "company_id": company_id,
            "as_of_date": request.as_of_date
        })
        
        rows = result.fetchall()
        
        data = []
        total_debits = Decimal('0.0')
        total_credits = Decimal('0.0')
        
        for row in rows:
            balance = Decimal(str(row.balance))
            
            # Skip zero balances if requested
            if not request.include_zero_balances and balance == 0:
                continue
            
            debit_balance = balance if balance > 0 else Decimal('0.0')
            credit_balance = abs(balance) if balance < 0 else Decimal('0.0')
            
            data.append({
                'account_id': row.account_id,
                'account_number': row.account_number,
                'account_name': row.account_name,
                'account_type': row.account_type,
                'debit_balance': debit_balance,
                'credit_balance': credit_balance,
                'balance': balance
            })
            
            total_debits += debit_balance
            total_credits += credit_balance
        
        return {
            "data": data,
            "summary": {
                "total_debits": total_debits,
                "total_credits": total_credits,
                "difference": total_debits - total_credits,
                "is_balanced": total_debits == total_credits
            }
        }
    
    @staticmethod
    async def generate_ar_aging_report(
        db: AsyncSession,
        company_id: str,
        request: AgingReportRequest
    ) -> Dict[str, Any]:
        """Generate Accounts Receivable Aging report"""
        
        query = text("""
            SELECT 
                c.customer_id,
                c.customer_name,
                t.transaction_id,
                t.transaction_number,
                t.transaction_date,
                t.due_date,
                t.total_amount,
                COALESCE(t.balance_due, t.total_amount) as balance_due,
                CASE 
                    WHEN t.due_date IS NULL THEN 0
                    ELSE julianday(:as_of_date) - julianday(t.due_date)
                END as days_overdue
            FROM transactions t
            JOIN customers c ON t.customer_id = c.customer_id
            WHERE t.company_id = :company_id
            AND t.transaction_type = 'invoice'
            AND t.status NOT IN ('paid', 'voided', 'cancelled')
            AND COALESCE(t.balance_due, t.total_amount) > 0
            AND (:customer_id IS NULL OR t.customer_id = :customer_id)
            ORDER BY c.customer_name, t.transaction_date
        """)
        
        result = await db.execute(query, {
            "company_id": company_id,
            "as_of_date": request.as_of_date,
            "customer_id": request.customer_id
        })
        
        rows = result.fetchall()
        
        # Group by customer and aging periods
        customer_data = defaultdict(lambda: {
            'customer_name': '',
            'transactions': [],
            'aging_buckets': defaultdict(Decimal)
        })
        
        aging_periods = request.aging_periods
        total_aging = defaultdict(Decimal)
        
        for row in rows:
            customer_id = row.customer_id
            days_overdue = int(row.days_overdue) if row.days_overdue else 0
            balance_due = Decimal(str(row.balance_due))
            
            customer_data[customer_id]['customer_name'] = row.customer_name
            customer_data[customer_id]['transactions'].append({
                'transaction_id': row.transaction_id,
                'transaction_number': row.transaction_number,
                'transaction_date': row.transaction_date,
                'due_date': row.due_date,
                'total_amount': Decimal(str(row.total_amount)),
                'balance_due': balance_due,
                'days_overdue': days_overdue
            })
            
            # Categorize into aging buckets
            bucket = FinancialReportService._get_aging_bucket(days_overdue, aging_periods)
            customer_data[customer_id]['aging_buckets'][bucket] += balance_due
            total_aging[bucket] += balance_due
        
        # Convert to list format
        data = []
        for customer_id, customer_info in customer_data.items():
            customer_record = {
                'customer_id': customer_id,
                'customer_name': customer_info['customer_name'],
                'total_balance': sum(customer_info['aging_buckets'].values()),
                'aging_buckets': dict(customer_info['aging_buckets']),
                'transactions': customer_info['transactions']
            }
            
            # Skip zero balances if requested
            if not request.include_zero_balances and customer_record['total_balance'] == 0:
                continue
            
            data.append(customer_record)
        
        return {
            "data": data,
            "summary": {
                "total_customers": len(data),
                "total_balance": sum(total_aging.values()),
                "aging_totals": dict(total_aging)
            }
        }
    
    @staticmethod
    async def generate_ap_aging_report(
        db: AsyncSession,
        company_id: str,
        request: AgingReportRequest
    ) -> Dict[str, Any]:
        """Generate Accounts Payable Aging report"""
        
        # Similar logic to AR aging but for vendors and bills
        query = text("""
            SELECT 
                v.vendor_id,
                v.vendor_name,
                t.transaction_id,
                t.transaction_number,
                t.transaction_date,
                t.due_date,
                t.total_amount,
                COALESCE(t.balance_due, t.total_amount) as balance_due,
                CASE 
                    WHEN t.due_date IS NULL THEN 0
                    ELSE julianday(:as_of_date) - julianday(t.due_date)
                END as days_overdue
            FROM transactions t
            JOIN vendors v ON t.vendor_id = v.vendor_id
            WHERE t.company_id = :company_id
            AND t.transaction_type = 'bill'
            AND t.status NOT IN ('paid', 'voided', 'cancelled')
            AND COALESCE(t.balance_due, t.total_amount) > 0
            AND (:vendor_id IS NULL OR t.vendor_id = :vendor_id)
            ORDER BY v.vendor_name, t.transaction_date
        """)
        
        result = await db.execute(query, {
            "company_id": company_id,
            "as_of_date": request.as_of_date,
            "vendor_id": request.vendor_id
        })
        
        rows = result.fetchall()
        
        # Similar processing as AR aging
        vendor_data = defaultdict(lambda: {
            'vendor_name': '',
            'transactions': [],
            'aging_buckets': defaultdict(Decimal)
        })
        
        aging_periods = request.aging_periods
        total_aging = defaultdict(Decimal)
        
        for row in rows:
            vendor_id = row.vendor_id
            days_overdue = int(row.days_overdue) if row.days_overdue else 0
            balance_due = Decimal(str(row.balance_due))
            
            vendor_data[vendor_id]['vendor_name'] = row.vendor_name
            vendor_data[vendor_id]['transactions'].append({
                'transaction_id': row.transaction_id,
                'transaction_number': row.transaction_number,
                'transaction_date': row.transaction_date,
                'due_date': row.due_date,
                'total_amount': Decimal(str(row.total_amount)),
                'balance_due': balance_due,
                'days_overdue': days_overdue
            })
            
            bucket = FinancialReportService._get_aging_bucket(days_overdue, aging_periods)
            vendor_data[vendor_id]['aging_buckets'][bucket] += balance_due
            total_aging[bucket] += balance_due
        
        data = []
        for vendor_id, vendor_info in vendor_data.items():
            vendor_record = {
                'vendor_id': vendor_id,
                'vendor_name': vendor_info['vendor_name'],
                'total_balance': sum(vendor_info['aging_buckets'].values()),
                'aging_buckets': dict(vendor_info['aging_buckets']),
                'transactions': vendor_info['transactions']
            }
            
            if not request.include_zero_balances and vendor_record['total_balance'] == 0:
                continue
            
            data.append(vendor_record)
        
        return {
            "data": data,
            "summary": {
                "total_vendors": len(data),
                "total_balance": sum(total_aging.values()),
                "aging_totals": dict(total_aging)
            }
        }
    
    # Helper methods
    @staticmethod
    async def _get_company(db: AsyncSession, company_id: str) -> Company:
        """Get company information"""
        result = await db.execute(
            select(Company).where(Company.company_id == company_id)
        )
        company = result.scalar_one_or_none()
        if not company:
            raise ValueError("Company not found")
        return company
    
    @staticmethod
    async def _get_account_balances_by_type(
        db: AsyncSession,
        company_id: str,
        account_type: AccountType,
        start_date: date,
        end_date: date
    ) -> Dict[str, Dict[str, Any]]:
        """Get account balances for specific type within date range"""
        
        query = text("""
            SELECT 
                a.account_id,
                a.account_name,
                a.account_number,
                COALESCE(SUM(je.credit_amount) - SUM(je.debit_amount), 0) as balance
            FROM accounts a
            LEFT JOIN journal_entries je ON a.account_id = je.account_id
            LEFT JOIN transactions t ON je.transaction_id = t.transaction_id
            WHERE a.company_id = :company_id
            AND a.account_type = :account_type
            AND a.is_active = 1
            AND (t.transaction_date BETWEEN :start_date AND :end_date OR t.transaction_date IS NULL)
            AND (t.is_posted = 1 OR t.is_posted IS NULL)
            GROUP BY a.account_id, a.account_name, a.account_number
            ORDER BY a.account_number, a.account_name
        """)
        
        result = await db.execute(query, {
            "company_id": company_id,
            "account_type": account_type.value,
            "start_date": start_date,
            "end_date": end_date
        })
        
        accounts = {}
        for row in result.fetchall():
            accounts[row.account_id] = {
                'name': row.account_name,
                'number': row.account_number,
                'balance': Decimal(str(row.balance))
            }
        
        return accounts
    
    @staticmethod
    async def _get_account_balances_as_of_date(
        db: AsyncSession,
        company_id: str,
        account_type: AccountType,
        as_of_date: date
    ) -> Dict[str, Dict[str, Any]]:
        """Get account balances as of a specific date"""
        
        query = text("""
            SELECT 
                a.account_id,
                a.account_name,
                a.account_number,
                COALESCE(SUM(je.debit_amount) - SUM(je.credit_amount), 0) as balance
            FROM accounts a
            LEFT JOIN journal_entries je ON a.account_id = je.account_id
            LEFT JOIN transactions t ON je.transaction_id = t.transaction_id
            WHERE a.company_id = :company_id
            AND a.account_type = :account_type
            AND a.is_active = 1
            AND (t.transaction_date <= :as_of_date OR t.transaction_date IS NULL)
            AND (t.is_posted = 1 OR t.is_posted IS NULL)
            GROUP BY a.account_id, a.account_name, a.account_number
            ORDER BY a.account_number, a.account_name
        """)
        
        result = await db.execute(query, {
            "company_id": company_id,
            "account_type": account_type.value,
            "as_of_date": as_of_date
        })
        
        accounts = {}
        for row in result.fetchall():
            accounts[row.account_id] = {
                'name': row.account_name,
                'number': row.account_number,
                'balance': Decimal(str(row.balance))
            }
        
        return accounts
    
    @staticmethod
    async def _calculate_operating_cash_flow(
        db: AsyncSession,
        company_id: str,
        start_date: date,
        end_date: date,
        method: str
    ) -> Dict[str, Any]:
        """Calculate operating cash flow (simplified)"""
        
        # This is a simplified calculation
        # In reality, you'd need more sophisticated indirect method calculations
        
        lines = [
            FinancialLine(
                account_name="Cash receipts from customers",
                amount=Decimal('100000.00')  # Placeholder
            ),
            FinancialLine(
                account_name="Cash payments to suppliers",
                amount=Decimal('-50000.00')  # Placeholder
            ),
            FinancialLine(
                account_name="Cash payments for operating expenses",
                amount=Decimal('-30000.00')  # Placeholder
            )
        ]
        
        total = sum(line.amount for line in lines)
        
        return {
            'lines': lines,
            'total': total
        }
    
    @staticmethod
    async def _calculate_investing_cash_flow(
        db: AsyncSession,
        company_id: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Calculate investing cash flow"""
        
        lines = [
            FinancialLine(
                account_name="Purchase of equipment",
                amount=Decimal('-10000.00')  # Placeholder
            )
        ]
        
        total = sum(line.amount for line in lines)
        
        return {
            'lines': lines,
            'total': total
        }
    
    @staticmethod
    async def _calculate_financing_cash_flow(
        db: AsyncSession,
        company_id: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Calculate financing cash flow"""
        
        lines = [
            FinancialLine(
                account_name="Proceeds from loan",
                amount=Decimal('25000.00')  # Placeholder
            )
        ]
        
        total = sum(line.amount for line in lines)
        
        return {
            'lines': lines,
            'total': total
        }
    
    @staticmethod
    def _get_aging_bucket(days_overdue: int, aging_periods: List[int]) -> str:
        """Determine aging bucket for given days overdue"""
        
        if days_overdue <= 0:
            return "Current"
        
        for period in aging_periods:
            if days_overdue <= period:
                prev_period = 0
                for p in aging_periods:
                    if p < period:
                        prev_period = p
                    else:
                        break
                
                if prev_period == 0:
                    return f"1-{period} days"
                else:
                    return f"{prev_period + 1}-{period} days"
        
        # Over the longest period
        return f"Over {max(aging_periods)} days"
    
    @staticmethod
    def _calculate_percentage_change(
        old_value: Decimal,
        new_value: Decimal
    ) -> Optional[Decimal]:
        """Calculate percentage change between two values"""
        
        if not old_value or old_value == 0:
            return None
        
        return ((new_value - old_value) / old_value) * 100