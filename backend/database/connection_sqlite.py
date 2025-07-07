import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from dotenv import load_dotenv
import structlog
from typing import AsyncGenerator

load_dotenv()

logger = structlog.get_logger()

# Database configuration - Use SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./quickbooks_clone.db")

# Convert SQLite URL for async usage
if DATABASE_URL.startswith("sqlite://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
else:
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True if os.getenv("DEBUG") == "true" else False,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if "sqlite" in ASYNC_DATABASE_URL else {}
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Mock Redis for development (in-memory store)
class MockRedis:
    def __init__(self):
        self._data = {}
    
    async def get(self, key: str):
        return self._data.get(key)
    
    async def set(self, key: str, value: str):
        self._data[key] = value
    
    async def setex(self, key: str, time, value: str):
        self._data[key] = value
    
    async def incr(self, key: str):
        current = int(self._data.get(key, 0))
        self._data[key] = str(current + 1)
        return current + 1
    
    async def expire(self, key: str, time):
        pass  # No-op for development
    
    async def smembers(self, key: str):
        return set()
    
    async def sadd(self, key: str, value: str):
        pass
    
    async def pipeline(self):
        return MockRedisPipeline(self)
    
    async def close(self):
        pass

class MockRedisPipeline:
    def __init__(self, redis_instance):
        self.redis = redis_instance
        self.commands = []
    
    def incr(self, key: str):
        self.commands.append(('incr', key))
        return self
    
    def expire(self, key: str, time):
        self.commands.append(('expire', key, time))
        return self
    
    def sadd(self, key: str, value: str):
        self.commands.append(('sadd', key, value))
        return self
    
    async def execute(self):
        results = []
        for cmd in self.commands:
            if cmd[0] == 'incr':
                result = await self.redis.incr(cmd[1])
                results.append(result)
            elif cmd[0] == 'expire':
                await self.redis.expire(cmd[1], cmd[2])
                results.append(True)
            elif cmd[0] == 'sadd':
                await self.redis.sadd(cmd[1], cmd[2])
                results.append(1)
        return results

# Redis connection (mock for development)
redis_client = MockRedis()

async def get_redis():
    """Get Redis client instance (mock for development)"""
    return redis_client

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error("Database session error", error=str(e))
            await session.rollback()
            raise
        finally:
            await session.close()

async def close_db_connections():
    """Close all database connections"""
    await engine.dispose()
    await redis_client.close()