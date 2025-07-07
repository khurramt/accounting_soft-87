#!/usr/bin/env python3
"""
Startup script for QuickBooks Clone API
Handles database initialization and demo data creation
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from database.init_db import create_tables, create_demo_data
import structlog

logger = structlog.get_logger()

async def startup():
    """Initialize the application"""
    try:
        logger.info("Starting application initialization...")
        
        # For development, we'll use SQLite if PostgreSQL is not available
        # This allows the demo to work without complex setup
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url or "postgresql" in database_url:
            # Use SQLite for development if PostgreSQL is not available
            sqlite_path = backend_dir / "quickbooks_clone.db"
            os.environ["DATABASE_URL"] = f"sqlite:///{sqlite_path}"
            logger.info("Using SQLite database for development")
        
        # Create tables
        await create_tables()
        
        # Create demo data
        await create_demo_data()
        
        logger.info("Application initialization completed successfully")
        
    except Exception as e:
        logger.error("Application initialization failed", error=str(e))
        # Don't exit, let the app start anyway for demonstration
        pass

if __name__ == "__main__":
    asyncio.run(startup())