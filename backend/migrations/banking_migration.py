"""Banking Integration Migration Script

This script creates the banking integration tables in the database.
Compatible with both SQLite and PostgreSQL.

Created: 2025-01-08
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from database.connection import engine, Base, AsyncSessionLocal
from models.banking import (
    BankConnection, BankTransaction, BankRule, 
    BankReconciliation, BankInstitution, BankStatementImport
)
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample bank institutions data
SAMPLE_INSTITUTIONS = [
    {
        'name': 'Chase Bank',
        'website_url': 'https://www.chase.com',
        'routing_number': '021000021',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://ofx.chase.com',
        'ofx_fid': '10898',
        'ofx_org': 'B1'
    },
    {
        'name': 'Bank of America',
        'website_url': 'https://www.bankofamerica.com',
        'routing_number': '021000322',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://eftx.bankofamerica.com/eftxweb/OFXDownload',
        'ofx_fid': '5959',
        'ofx_org': 'HAN'
    },
    {
        'name': 'Wells Fargo',
        'website_url': 'https://www.wellsfargo.com',
        'routing_number': '121000248',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://ofx.wellsfargo.com',
        'ofx_fid': '4000',
        'ofx_org': 'WF'
    },
    {
        'name': 'Citibank',
        'website_url': 'https://www.citibank.com',
        'routing_number': '021000089',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://ofx.citibank.com',
        'ofx_fid': '24909',
        'ofx_org': 'Citigroup'
    },
    {
        'name': 'PNC Bank',
        'website_url': 'https://www.pnc.com',
        'routing_number': '043000096',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://www.pnc.com/ofx',
        'ofx_fid': '7101',
        'ofx_org': 'PNC'
    },
    {
        'name': 'Capital One',
        'website_url': 'https://www.capitalone.com',
        'routing_number': '051405515',
        'supports_ofx': True,
        'supports_direct_connect': False,
        'ofx_url': 'https://ofx.capitalone.com',
        'ofx_fid': '12572',
        'ofx_org': 'Capital One'
    },
    {
        'name': 'US Bank',
        'website_url': 'https://www.usbank.com',
        'routing_number': '091000022',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://ofx.usbank.com',
        'ofx_fid': '1001',
        'ofx_org': 'USBANK'
    },
    {
        'name': 'TD Bank',
        'website_url': 'https://www.tdbank.com',
        'routing_number': '031101266',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://ofx.tdbank.com',
        'ofx_fid': '5561',
        'ofx_org': 'TD'
    },
    {
        'name': 'Ally Bank',
        'website_url': 'https://www.ally.com',
        'routing_number': '124003116',
        'supports_ofx': True,
        'supports_direct_connect': False,
        'ofx_url': 'https://ofx.ally.com',
        'ofx_fid': '10192',
        'ofx_org': 'Ally'
    },
    {
        'name': 'American Express',
        'website_url': 'https://www.americanexpress.com',
        'routing_number': '021000322',
        'supports_ofx': True,
        'supports_direct_connect': True,
        'ofx_url': 'https://online.americanexpress.com/ofx',
        'ofx_fid': '3101',
        'ofx_org': 'AMEX'
    }
]

async def create_banking_tables():
    """Create banking integration tables"""
    try:
        async with engine.begin() as conn:
            # Create all banking tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Banking tables created successfully")
            
        # Insert sample institution data
        await insert_sample_institutions()
        logger.info("Sample institutions inserted successfully")
        
    except Exception as e:
        logger.error(f"Error creating banking tables: {e}")
        raise

async def insert_sample_institutions():
    """Insert sample bank institutions"""
    try:
        async with AsyncSessionLocal() as session:
            # Check if institutions already exist
            result = await session.execute(text("SELECT COUNT(*) FROM bank_institutions"))
            count = result.scalar()
            
            if count == 0:
                # Insert sample institutions
                for inst_data in SAMPLE_INSTITUTIONS:
                    institution = BankInstitution(**inst_data)
                    session.add(institution)
                
                await session.commit()
                logger.info(f"Inserted {len(SAMPLE_INSTITUTIONS)} sample institutions")
            else:
                logger.info(f"Bank institutions already exist ({count} found)")
                
    except Exception as e:
        logger.error(f"Error inserting sample institutions: {e}")
        raise

async def drop_banking_tables():
    """Drop banking integration tables (for rollback)"""
    try:
        async with engine.begin() as conn:
            # Drop tables in reverse order to handle foreign key constraints
            tables_to_drop = [
                'bank_statement_imports',
                'bank_reconciliations',
                'bank_rules',
                'bank_transactions',
                'bank_connections',
                'bank_institutions'
            ]
            
            for table in tables_to_drop:
                await conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
                logger.info(f"Dropped table: {table}")
                
        logger.info("Banking tables dropped successfully")
        
    except Exception as e:
        logger.error(f"Error dropping banking tables: {e}")
        raise

async def verify_banking_tables():
    """Verify banking tables exist and are accessible"""
    try:
        async with AsyncSessionLocal() as session:
            # Test each table
            tables = [
                ('bank_institutions', BankInstitution),
                ('bank_connections', BankConnection),
                ('bank_transactions', BankTransaction),
                ('bank_rules', BankRule),
                ('bank_reconciliations', BankReconciliation),
                ('bank_statement_imports', BankStatementImport)
            ]
            
            for table_name, model_class in tables:
                result = await session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar()
                logger.info(f"Table {table_name}: {count} records")
                
        logger.info("Banking tables verification completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error verifying banking tables: {e}")
        return False

async def main():
    """Main migration function"""
    import sys
    
    if len(sys.argv) > 1:
        action = sys.argv[1]
        
        if action == "create":
            await create_banking_tables()
        elif action == "drop":
            await drop_banking_tables()
        elif action == "verify":
            await verify_banking_tables()
        else:
            logger.error("Invalid action. Use: create, drop, or verify")
            sys.exit(1)
    else:
        # Default action is to create tables
        await create_banking_tables()
        await verify_banking_tables()

if __name__ == "__main__":
    asyncio.run(main())