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

class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    MERGE = "merge"
    BULK_CREATE = "bulk_create"
    BULK_UPDATE = "bulk_update"
    BULK_DELETE = "bulk_delete"

class SecurityEvent(str, Enum):
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    PASSWORD_CHANGED = "password_changed"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    PERMISSION_DENIED = "permission_denied"
    SESSION_EXPIRED = "session_expired"
    MULTIPLE_SESSIONS = "multiple_sessions"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DATA_EXPORT = "data_export"
    SENSITIVE_DATA_ACCESS = "sensitive_data_access"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    audit_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    user_id = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    
    # What was changed
    table_name = Column(String(100), nullable=False)
    record_id = Column(String(100), nullable=False)
    action = Column(SQLEnum(AuditAction), nullable=False)
    
    # Change details (JSON for SQLite compatibility)
    old_values = Column(JSON)
    new_values = Column(JSON)
    
    # Request context
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    endpoint = Column(String(255))
    request_method = Column(String(10))
    
    # Additional metadata
    change_reason = Column(String(255))
    affected_fields = Column(JSON)  # List of field names that changed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<AuditLog {self.table_name}:{self.record_id} - {self.action}>"

class SecurityLog(Base):
    __tablename__ = "security_logs"
    
    log_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(SQLString(36), ForeignKey("users.user_id"), nullable=True)  # Can be null for failed login attempts
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=True)
    
    # Event details
    event_type = Column(SQLEnum(SecurityEvent), nullable=False)
    success = Column(Boolean, default=True)
    
    # Request context
    ip_address = Column(String(45))
    user_agent = Column(Text)
    endpoint = Column(String(255))
    request_method = Column(String(10))
    
    # Event-specific details (JSON for SQLite compatibility)
    details = Column(JSON)
    
    # Risk assessment
    risk_score = Column(Integer, default=0)  # 0-100 scale
    threat_level = Column(String(20), default="low")  # low, medium, high, critical
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<SecurityLog {self.event_type} - {self.success}>"

class Role(Base):
    __tablename__ = "roles"
    
    role_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=True)  # Null for system roles
    
    # Role details
    role_name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Permissions (JSON for SQLite compatibility)
    permissions = Column(JSON, default=lambda: {})
    
    # Role properties
    is_system_role = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Hierarchy
    parent_role_id = Column(SQLString(36), ForeignKey("roles.role_id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    parent_role = relationship("Role", remote_side=[role_id])
    user_permissions = relationship("UserPermission", back_populates="role")
    
    def __repr__(self):
        return f"<Role {self.role_name}>"

class UserPermission(Base):
    __tablename__ = "user_permissions"
    
    permission_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    role_id = Column(SQLString(36), ForeignKey("roles.role_id"), nullable=True)  # Can be null for direct permissions
    
    # Permission details
    resource = Column(String(100), nullable=False)  # e.g., "transactions", "reports", "customers"
    actions = Column(JSON, default=lambda: [])  # e.g., ["read", "write", "delete"]
    
    # Conditions (JSON for SQLite compatibility)
    conditions = Column(JSON)  # Additional conditions for permission
    
    # Permission metadata
    granted_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    company = relationship("Company", foreign_keys=[company_id])
    role = relationship("Role", back_populates="user_permissions")
    granter = relationship("User", foreign_keys=[granted_by])
    
    def __repr__(self):
        return f"<UserPermission {self.user_id} - {self.resource}>"

class SecuritySetting(Base):
    __tablename__ = "security_settings"
    
    setting_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    
    # Security settings
    password_policy = Column(JSON, default=lambda: {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_symbols": True,
        "password_history": 5
    })
    
    session_settings = Column(JSON, default=lambda: {
        "timeout_minutes": 30,
        "max_concurrent_sessions": 3,
        "require_2fa": False
    })
    
    access_control = Column(JSON, default=lambda: {
        "allowed_ip_ranges": [],
        "blocked_ip_ranges": [],
        "allowed_countries": [],
        "blocked_countries": []
    })
    
    audit_settings = Column(JSON, default=lambda: {
        "log_all_actions": True,
        "log_sensitive_data": True,
        "retention_days": 2555  # 7 years
    })
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<SecuritySetting {self.company_id}>"