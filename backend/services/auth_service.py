import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from models.user import User, UserSession, CompanyMembership
from database.connection import get_redis
import secrets
import structlog
from fastapi import HTTPException, status
import uuid
from pydantic import BaseModel, EmailStr

logger = structlog.get_logger()

class AuthService:
    def __init__(self):
        self.jwt_secret = os.getenv("JWT_SECRET_KEY")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
        self.refresh_token_expire_days = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "30"))
        self.bcrypt_rounds = int(os.getenv("BCRYPT_ROUNDS", "12"))
        self.max_login_attempts = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
        self.lockout_duration = int(os.getenv("ACCOUNT_LOCKOUT_DURATION", "30"))
        
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt(rounds=self.bcrypt_rounds)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def generate_access_token(self, user_id: str, session_id: str) -> str:
        """Generate JWT access token"""
        payload = {
            "user_id": str(user_id),
            "session_id": str(session_id),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=self.access_token_expire_minutes),
            "iat": datetime.now(timezone.utc),
            "type": "access"
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def generate_refresh_token(self) -> str:
        """Generate secure refresh token"""
        return secrets.token_urlsafe(32)
    
    def decode_access_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate JWT access token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            if payload.get("type") != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    async def validate_password_strength(self, password: str) -> tuple[bool, str]:
        """Validate password strength and return detailed error if invalid"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit"
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            return False, "Password must contain at least one special character"
        return True, "Password is strong"
    
    async def check_password_strength(self, password: str) -> bool:
        """Check password strength"""
        is_valid, _ = await self.validate_password_strength(password)
        return is_valid
    
    async def is_password_in_history(self, user: User, password: str) -> bool:
        """Check if password was used recently"""
        if not user.password_history:
            return False
        
        for old_hash in user.password_history[-5:]:  # Check last 5 passwords
            if self.verify_password(password, old_hash):
                return True
        return False
    
    async def register_user(
        self,
        db: AsyncSession,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None
    ) -> User:
        """Register a new user"""
        
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check password strength
        is_valid, error_message = await self.validate_password_strength(password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
        
        # Hash password
        password_hash = self.hash_password(password)
        
        # Create user
        user = User(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            email_verification_token=secrets.token_urlsafe(32),
            email_verification_expires=datetime.now(timezone.utc) + timedelta(hours=24),
            password_history=[password_hash]
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        logger.info("User registered", user_id=str(user.user_id), email=email)
        return user
    
    async def authenticate_user(
        self,
        db: AsyncSession,
        email: str,
        password: str,
        device_info: Optional[Dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[User, str, str]:
        """Authenticate user and create session"""
        
        # Get user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if account is locked
        if user.is_locked:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked due to failed login attempts"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Verify password
        if not self.verify_password(password, user.password_hash):
            # Increment failed attempts
            user.failed_login_attempts += 1
            
            if user.failed_login_attempts >= self.max_login_attempts:
                user.account_locked_until = datetime.now(timezone.utc) + timedelta(minutes=self.lockout_duration)
                logger.warning("Account locked due to failed attempts", user_id=str(user.user_id))
            
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Reset failed attempts and update last login
        user.failed_login_attempts = 0
        user.account_locked_until = None
        user.last_login = datetime.now(timezone.utc)
        
        # Create session
        refresh_token = self.generate_refresh_token()
        session = UserSession(
            user_id=user.user_id,
            refresh_token=refresh_token,
            device_info=device_info,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=datetime.now(timezone.utc) + timedelta(days=self.refresh_token_expire_days)
        )
        
        db.add(session)
        await db.commit()
        await db.refresh(session)
        
        # Generate access token
        access_token = self.generate_access_token(user.user_id, session.session_id)
        
        logger.info("User authenticated", user_id=str(user.user_id), session_id=str(session.session_id))
        return user, access_token, refresh_token
    
    async def refresh_access_token(self, db: AsyncSession, refresh_token: str) -> str:
        """Refresh access token using refresh token"""
        
        # Find session
        result = await db.execute(
            select(UserSession).where(
                and_(
                    UserSession.refresh_token == refresh_token,
                    UserSession.is_active == True,
                    UserSession.expires_at > datetime.now(timezone.utc)
                )
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Update session last used
        session.last_used = datetime.now(timezone.utc)
        await db.commit()
        
        # Generate new access token
        access_token = self.generate_access_token(session.user_id, session.session_id)
        
        logger.info("Access token refreshed", user_id=str(session.user_id), session_id=str(session.session_id))
        return access_token
    
    async def logout_user(self, db: AsyncSession, session_id: str) -> None:
        """Logout user by deactivating session"""
        
        result = await db.execute(
            update(UserSession)
            .where(UserSession.session_id == session_id)
            .values(is_active=False)
        )
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        await db.commit()
        
        # Add token to blacklist in Redis
        redis = await get_redis()
        await redis.setex(
            f"blacklist:{session_id}",
            timedelta(days=1),
            "true"
        )
        
        logger.info("User logged out", session_id=session_id)
    
    async def logout_all_sessions(self, db: AsyncSession, user_id: str) -> None:
        """Logout user from all devices"""
        
        result = await db.execute(
            update(UserSession)
            .where(and_(UserSession.user_id == user_id, UserSession.is_active == True))
            .values(is_active=False)
        )
        
        await db.commit()
        
        logger.info("All sessions logged out", user_id=user_id, sessions_count=result.rowcount)
    
    async def get_user_sessions(self, db: AsyncSession, user_id: str) -> list[UserSession]:
        """Get active sessions for user"""
        
        result = await db.execute(
            select(UserSession).where(
                and_(
                    UserSession.user_id == user_id,
                    UserSession.is_active == True,
                    UserSession.expires_at > datetime.now(timezone.utc)
                )
            ).order_by(UserSession.created_at.desc())
        )
        
        return result.scalars().all()
    
    async def verify_email(self, db: AsyncSession, token: str) -> User:
        """Verify user email with token"""
        
        result = await db.execute(
            select(User).where(
                and_(
                    User.email_verification_token == token,
                    User.email_verification_expires > datetime.now(timezone.utc)
                )
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        
        await db.commit()
        
        logger.info("Email verified", user_id=str(user.user_id))
        return user
    
    async def request_password_reset(self, db: AsyncSession, email: str) -> str:
        """Request password reset token"""
        
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Don't reveal if email exists or not
            return "If the email exists, a reset link will be sent"
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        await db.commit()
        
        logger.info("Password reset requested", user_id=str(user.user_id))
        return reset_token
    
    async def reset_password(self, db: AsyncSession, token: str, new_password: str) -> None:
        """Reset password with token"""
        
        result = await db.execute(
            select(User).where(
                and_(
                    User.password_reset_token == token,
                    User.password_reset_expires > datetime.now(timezone.utc)
                )
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Check password strength
        is_valid, error_message = await self.validate_password_strength(new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
        
        # Check password history
        if await self.is_password_in_history(user, new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reuse recent passwords"
            )
        
        # Hash new password
        new_password_hash = self.hash_password(new_password)
        
        # Update password and clear reset token
        user.password_hash = new_password_hash
        user.password_reset_token = None
        user.password_reset_expires = None
        
        # Update password history
        if not user.password_history:
            user.password_history = []
        user.password_history.append(new_password_hash)
        user.password_history = user.password_history[-5:]  # Keep last 5 passwords
        
        await db.commit()
        
        # Logout all sessions
        await self.logout_all_sessions(db, str(user.user_id))
        
        logger.info("Password reset completed", user_id=str(user.user_id))

# Global auth service instance
auth_service = AuthService()