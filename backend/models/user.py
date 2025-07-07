from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base
import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import String as SQLString
import sqlalchemy as sa

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    ACCOUNTANT = "accountant"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    
    # Email verification
    is_email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255))
    email_verification_expires = Column(DateTime(timezone=True))
    
    # Password reset
    password_reset_token = Column(String(255))
    password_reset_expires = Column(DateTime(timezone=True))
    
    # Security features
    last_login = Column(DateTime(timezone=True))
    failed_login_attempts = Column(Integer, default=0)
    account_locked_until = Column(DateTime(timezone=True))
    
    # Password history for security (JSON for SQLite compatibility)
    password_history = Column(JSON, default=lambda: [])
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    company_memberships = relationship("CompanyMembership", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_locked(self):
        if self.account_locked_until:
            return datetime.now(timezone.utc) < self.account_locked_until
        return False

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    session_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    refresh_token = Column(String(255), unique=True, nullable=False)
    
    # Device and location info (JSON for SQLite compatibility)
    device_info = Column(JSON)
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    
    # Session status
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_used = Column(DateTime(timezone=True), default=func.now())
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def __repr__(self):
        return f"<UserSession {self.session_id}>"

class CompanyMembership(Base):
    __tablename__ = "company_memberships"
    
    membership_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    
    # Role and permissions
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.EMPLOYEE)
    permissions = Column(JSON, default=lambda: {})
    
    # Membership status
    is_active = Column(Boolean, default=True)
    
    # Invitation tracking
    invited_by = Column(SQLString(36), ForeignKey("users.user_id"))
    invited_at = Column(DateTime(timezone=True), default=func.now())
    accepted_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="company_memberships", foreign_keys=[user_id])
    inviter = relationship("User", foreign_keys=[invited_by])
    
    def __repr__(self):
        return f"<CompanyMembership {self.user_id} - {self.company_id}>"

class Company(Base):
    __tablename__ = "companies"
    
    company_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    legal_name = Column(String(255))
    
    # Company details (JSON for SQLite compatibility)
    address = Column(JSON)
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    tax_id = Column(String(50))
    
    # Business information
    industry = Column(String(100))
    business_type = Column(String(100))
    fiscal_year_start = Column(DateTime(timezone=True))
    
    # Company settings (JSON for SQLite compatibility)
    settings = Column(JSON, default=lambda: {})
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    memberships = relationship("CompanyMembership", back_populates="company", foreign_keys="CompanyMembership.company_id")
    
    def __repr__(self):
        return f"<Company {self.name}>"