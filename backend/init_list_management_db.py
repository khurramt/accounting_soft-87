#!/usr/bin/env python3
"""
Database initialization script for List Management Module
"""
import asyncio
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine
from database.connection import ASYNC_DATABASE_URL, Base
from models.user import User, UserSession, CompanyMembership, Company, CompanySetting, FileAttachment
from models.list_management import Account, Customer, Vendor, Item, Employee
import structlog

logger = structlog.get_logger()

async def create_tables():
    """Create all database tables"""
    try:
        # Create async engine
        engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
        # Close engine
        await engine.dispose()
        
    except Exception as e:
        logger.error("Failed to create database tables", error=str(e))
        raise

if __name__ == "__main__":
    asyncio.run(create_tables())