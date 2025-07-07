from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from models.user import UserRole
import uuid

# Request schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    device_info: Optional[Dict[str, Any]] = None
    remember_me: bool = False

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class VerifyEmailRequest(BaseModel):
    token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class CompanyAccessRequest(BaseModel):
    company_id: str

# Response schemas
class UserResponse(BaseModel):
    user_id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    is_email_verified: bool
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes in seconds

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 900

class SessionResponse(BaseModel):
    session_id: str
    device_info: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    is_active: bool
    last_used: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CompanyResponse(BaseModel):
    company_id: str
    name: str
    legal_name: Optional[str]
    industry: Optional[str]
    business_type: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CompanyMembershipResponse(BaseModel):
    membership_id: str
    company: CompanyResponse
    role: UserRole
    permissions: Optional[Dict[str, Any]]
    is_active: bool
    accepted_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    user: UserResponse
    companies: List[CompanyMembershipResponse]
    active_sessions_count: int

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    error: str
    details: Optional[Dict[str, Any]] = None
    success: bool = False

# Security schemas
class SecurityEventResponse(BaseModel):
    event_type: str
    user_id: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime
    details: Optional[Dict[str, Any]]

class PasswordStrengthResponse(BaseModel):
    is_strong: bool
    requirements: Dict[str, bool]
    suggestions: List[str]

# Utility function to convert SQLAlchemy models to Pydantic
def to_dict(obj):
    """Convert SQLAlchemy model to dict"""
    return {column.name: getattr(obj, column.name) for column in obj.__table__.columns}