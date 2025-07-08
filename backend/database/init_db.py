import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine
from database.connection import Base, DATABASE_URL, ASYNC_DATABASE_URL
from models.user import User, UserSession, CompanyMembership, Company, CompanySetting, FileAttachment, UserRole
from models.list_management import Account, Customer, Vendor, Item, Employee
from models.transactions import Transaction, TransactionLine, JournalEntry, Payment, PaymentApplication, RecurringTransaction
from models.reports import ReportDefinition, MemorizedReport, MemorizedReportGroup, ReportCache, ReportExecution, ReportTemplate
import structlog

logger = structlog.get_logger()

async def create_tables():
    """Create all database tables"""
    logger.info("Creating database tables", database_url=ASYNC_DATABASE_URL)
    
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error("Failed to create database tables", error=str(e))
        raise
    finally:
        await engine.dispose()

async def create_demo_data():
    """Create demo data for testing"""
    import uuid
    from database.connection import AsyncSessionLocal
    from services.auth_service import auth_service
    from models.reports import ReportDefinition, ReportCategory, ReportType
    
    async with AsyncSessionLocal() as session:
        try:
            # Create demo company
            demo_company = Company(
                company_name="Demo Company",
                legal_name="Demo Company LLC",
                industry="Technology",
                business_type="LLC",
                address_line1="123 Main St",
                city="San Francisco",
                state="CA",
                zip_code="94105",
                country="USA",
                phone="(555) 123-4567",
                email="info@democompany.com"
            )
            session.add(demo_company)
            await session.flush()
            
            # Create demo user
            demo_user = await auth_service.register_user(
                db=session,
                email="demo@quickbooks.com",
                password="Password123!",
                first_name="Demo",
                last_name="User"
            )
            
            # Create company membership
            membership = CompanyMembership(
                user_id=demo_user.user_id,
                company_id=demo_company.company_id,
                role=UserRole.ADMIN,  # Use the enum value
                permissions={
                    "full_access": True,
                    "manage_users": True,
                    "view_reports": True,
                    "manage_finances": True
                },
                accepted_at=demo_user.created_at
            )
            session.add(membership)
            
            # Create system report definitions
            system_reports = [
                {
                    "report_name": "Profit & Loss",
                    "report_category": ReportCategory.COMPANY_FINANCIAL,
                    "description": "Shows company income, expenses, and net profit over a period",
                    "is_system_report": True,
                    "parameters": {
                        "start_date": {
                            "name": "start_date",
                            "type": "date",
                            "label": "Start Date",
                            "required": True
                        },
                        "end_date": {
                            "name": "end_date",
                            "type": "date", 
                            "label": "End Date",
                            "required": True
                        },
                        "comparison_type": {
                            "name": "comparison_type",
                            "type": "select",
                            "label": "Comparison",
                            "options": [
                                {"value": "none", "label": "No Comparison"},
                                {"value": "previous_period", "label": "Previous Period"},
                                {"value": "previous_year", "label": "Previous Year"}
                            ]
                        }
                    },
                    "column_definitions": [
                        {"name": "section", "label": "Section", "data_type": "string"},
                        {"name": "account_name", "label": "Account", "data_type": "string"},
                        {"name": "amount", "label": "Amount", "data_type": "currency", "alignment": "right"}
                    ]
                },
                {
                    "report_name": "Balance Sheet",
                    "report_category": ReportCategory.COMPANY_FINANCIAL,
                    "description": "Shows company assets, liabilities, and equity at a point in time",
                    "is_system_report": True,
                    "parameters": {
                        "as_of_date": {
                            "name": "as_of_date",
                            "type": "date",
                            "label": "As of Date",
                            "required": True
                        }
                    },
                    "column_definitions": [
                        {"name": "section", "label": "Section", "data_type": "string"},
                        {"name": "account_name", "label": "Account", "data_type": "string"},
                        {"name": "amount", "label": "Amount", "data_type": "currency", "alignment": "right"}
                    ]
                },
                {
                    "report_name": "Cash Flow Statement",
                    "report_category": ReportCategory.COMPANY_FINANCIAL,
                    "description": "Shows cash inflows and outflows by activity type",
                    "is_system_report": True,
                    "parameters": {
                        "start_date": {
                            "name": "start_date",
                            "type": "date",
                            "label": "Start Date",
                            "required": True
                        },
                        "end_date": {
                            "name": "end_date",
                            "type": "date",
                            "label": "End Date",
                            "required": True
                        },
                        "method": {
                            "name": "method",
                            "type": "select",
                            "label": "Method",
                            "options": [
                                {"value": "indirect", "label": "Indirect Method"},
                                {"value": "direct", "label": "Direct Method"}
                            ]
                        }
                    },
                    "column_definitions": [
                        {"name": "section", "label": "Activity", "data_type": "string"},
                        {"name": "account_name", "label": "Description", "data_type": "string"},
                        {"name": "amount", "label": "Amount", "data_type": "currency", "alignment": "right"}
                    ]
                },
                {
                    "report_name": "Trial Balance",
                    "report_category": ReportCategory.COMPANY_FINANCIAL,
                    "description": "Shows all account balances to verify debits equal credits",
                    "is_system_report": True,
                    "parameters": {
                        "as_of_date": {
                            "name": "as_of_date",
                            "type": "date",
                            "label": "As of Date",
                            "required": True
                        },
                        "include_zero_balances": {
                            "name": "include_zero_balances",
                            "type": "boolean",
                            "label": "Include Zero Balances",
                            "default_value": False
                        }
                    },
                    "column_definitions": [
                        {"name": "account_number", "label": "Account #", "data_type": "string"},
                        {"name": "account_name", "label": "Account Name", "data_type": "string"},
                        {"name": "debit_balance", "label": "Debit", "data_type": "currency", "alignment": "right"},
                        {"name": "credit_balance", "label": "Credit", "data_type": "currency", "alignment": "right"}
                    ]
                },
                {
                    "report_name": "A/R Aging Summary",
                    "report_category": ReportCategory.CUSTOMERS_RECEIVABLES,
                    "description": "Shows outstanding customer invoices by age",
                    "is_system_report": True,
                    "parameters": {
                        "as_of_date": {
                            "name": "as_of_date",
                            "type": "date",
                            "label": "As of Date",
                            "required": True
                        },
                        "aging_periods": {
                            "name": "aging_periods",
                            "type": "string",
                            "label": "Aging Periods (days)",
                            "default_value": "30,60,90,120"
                        }
                    },
                    "column_definitions": [
                        {"name": "customer_name", "label": "Customer", "data_type": "string"},
                        {"name": "total_balance", "label": "Total", "data_type": "currency", "alignment": "right"},
                        {"name": "current", "label": "Current", "data_type": "currency", "alignment": "right"},
                        {"name": "1_30_days", "label": "1-30 Days", "data_type": "currency", "alignment": "right"},
                        {"name": "31_60_days", "label": "31-60 Days", "data_type": "currency", "alignment": "right"},
                        {"name": "61_90_days", "label": "61-90 Days", "data_type": "currency", "alignment": "right"},
                        {"name": "over_90_days", "label": "Over 90 Days", "data_type": "currency", "alignment": "right"}
                    ]
                },
                {
                    "report_name": "A/P Aging Summary", 
                    "report_category": ReportCategory.VENDORS_PAYABLES,
                    "description": "Shows outstanding vendor bills by age",
                    "is_system_report": True,
                    "parameters": {
                        "as_of_date": {
                            "name": "as_of_date",
                            "type": "date",
                            "label": "As of Date",
                            "required": True
                        },
                        "aging_periods": {
                            "name": "aging_periods",
                            "type": "string",
                            "label": "Aging Periods (days)",
                            "default_value": "30,60,90,120"
                        }
                    },
                    "column_definitions": [
                        {"name": "vendor_name", "label": "Vendor", "data_type": "string"},
                        {"name": "total_balance", "label": "Total", "data_type": "currency", "alignment": "right"},
                        {"name": "current", "label": "Current", "data_type": "currency", "alignment": "right"},
                        {"name": "1_30_days", "label": "1-30 Days", "data_type": "currency", "alignment": "right"},
                        {"name": "31_60_days", "label": "31-60 Days", "data_type": "currency", "alignment": "right"},
                        {"name": "61_90_days", "label": "61-90 Days", "data_type": "currency", "alignment": "right"},
                        {"name": "over_90_days", "label": "Over 90 Days", "data_type": "currency", "alignment": "right"}
                    ]
                }
            ]
            
            for report_data in system_reports:
                report = ReportDefinition(
                    report_id=str(uuid.uuid4()),
                    **report_data
                )
                session.add(report)
            
            await session.commit()
            logger.info("Demo data created successfully")
            
        except Exception as e:
            logger.error("Failed to create demo data", error=str(e))
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(create_tables())
    asyncio.run(create_demo_data())