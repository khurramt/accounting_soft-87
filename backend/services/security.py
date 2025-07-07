import os
from typing import Optional
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from database.connection import get_db, get_redis
from models.user import User, UserSession
from services.auth_service import auth_service
import structlog
from datetime import datetime, timezone
import ipaddress

logger = structlog.get_logger()

# Security scheme
security = HTTPBearer()

class SecurityService:
    def __init__(self):
        self.max_requests_per_minute = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    async def get_current_user(
        self,
        request: Request,
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        """Get current authenticated user"""
        
        # Decode token
        payload = auth_service.decode_access_token(credentials.credentials)
        user_id = payload.get("user_id")
        session_id = payload.get("session_id")
        
        # Check if token is blacklisted
        redis = await get_redis()
        is_blacklisted = await redis.get(f"blacklist:{session_id}")
        if is_blacklisted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )
        
        # Get user and session
        result = await db.execute(
            select(User, UserSession).join(UserSession).where(
                and_(
                    User.user_id == user_id,
                    UserSession.session_id == session_id,
                    UserSession.is_active == True,
                    UserSession.expires_at > datetime.now(timezone.utc)
                )
            )
        )
        user_session = result.first()
        
        if not user_session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or session invalid"
            )
        
        user, session = user_session
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated"
            )
        
        # Update session last used
        session.last_used = datetime.now(timezone.utc)
        await db.commit()
        
        # Log access
        logger.info(
            "User accessed endpoint",
            user_id=str(user.user_id),
            endpoint=request.url.path,
            method=request.method,
            ip_address=self.get_client_ip(request)
        )
        
        return user
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host
    
    async def check_rate_limit(self, request: Request, user_id: Optional[str] = None) -> None:
        """Check rate limit for IP or user"""
        
        redis = await get_redis()
        client_ip = self.get_client_ip(request)
        
        # Rate limit by IP
        ip_key = f"rate_limit:ip:{client_ip}"
        ip_count = await redis.get(ip_key)
        
        if ip_count and int(ip_count) >= self.max_requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Increment counter
        pipe = await redis.pipeline()
        pipe.incr(ip_key)
        pipe.expire(ip_key, 60)
        await pipe.execute()
        
        # Rate limit by user if authenticated
        if user_id:
            user_key = f"rate_limit:user:{user_id}"
            user_count = await redis.get(user_key)
            
            if user_count and int(user_count) >= self.max_requests_per_minute * 2:  # Higher limit for authenticated users
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="User rate limit exceeded"
                )
            
            pipe = await redis.pipeline()
            pipe.incr(user_key)
            pipe.expire(user_key, 60)
            await pipe.execute()
    
    def validate_ip_address(self, ip_address: str) -> bool:
        """Validate IP address format"""
        try:
            ipaddress.ip_address(ip_address)
            return True
        except ValueError:
            return False
    
    async def is_suspicious_activity(self, user_id: str, ip_address: str) -> bool:
        """Check for suspicious activity patterns"""
        
        redis = await get_redis()
        
        # Check for multiple IP addresses in short time
        recent_ips_key = f"recent_ips:{user_id}"
        recent_ips = await redis.smembers(recent_ips_key)
        
        if len(recent_ips) > 5:  # More than 5 different IPs in the last hour
            logger.warning(
                "Suspicious activity detected",
                user_id=user_id,
                ip_address=ip_address,
                recent_ips_count=len(recent_ips)
            )
            return True
        
        # Add current IP to recent IPs
        pipe = await redis.pipeline()
        pipe.sadd(recent_ips_key, ip_address)
        pipe.expire(recent_ips_key, 3600)  # 1 hour
        await pipe.execute()
        
        return False
    
    async def log_security_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        details: Optional[dict] = None
    ) -> None:
        """Log security events"""
        
        logger.warning(
            "Security event",
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            details=details
        )
        
        # Store in Redis for monitoring
        redis = await get_redis()
        security_key = f"security_events:{event_type}:{datetime.now().strftime('%Y-%m-%d')}"
        await redis.incr(security_key)
        await redis.expire(security_key, 86400 * 7)  # Keep for 7 days

# Global security service instance
security_service = SecurityService()

# Dependency to get current user
async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    return await security_service.get_current_user(request, credentials, db)

# Dependency to check rate limit
async def check_rate_limit(request: Request) -> None:
    await security_service.check_rate_limit(request)

# Dependency to get current user with rate limit
async def get_current_user_with_rate_limit(
    request: Request,
    user: User = Depends(get_current_user)
) -> User:
    await security_service.check_rate_limit(request, str(user.user_id))
    return user