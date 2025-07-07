import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine
from database.connection import Base, DATABASE_URL, ASYNC_DATABASE_URL
from models.user import User, UserSession, CompanyMembership, Company
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
    from database.connection import AsyncSessionLocal
    from services.auth_service import auth_service
    
    async with AsyncSessionLocal() as session:
        try:
            # Create demo company
            demo_company = Company(
                name="Demo Company",
                legal_name="Demo Company LLC",
                industry="Technology",
                business_type="LLC",
                address={
                    "street": "123 Main St",
                    "city": "San Francisco",
                    "state": "CA",
                    "zip": "94105"
                },
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
                role="admin",
                permissions={
                    "full_access": True,
                    "manage_users": True,
                    "view_reports": True,
                    "manage_finances": True
                },
                accepted_at=demo_user.created_at
            )
            session.add(membership)
            
            await session.commit()
            logger.info("Demo data created successfully")
            
        except Exception as e:
            logger.error("Failed to create demo data", error=str(e))
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(create_tables())
    asyncio.run(create_demo_data())