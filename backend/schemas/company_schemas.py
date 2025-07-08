from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class BusinessType(str, Enum):
    SOLE_PROPRIETORSHIP = "sole_proprietorship"
    PARTNERSHIP = "partnership"
    CORPORATION = "corporation"
    S_CORP = "s_corp"
    LLC = "llc"
    NON_PROFIT = "non_profit"
    OTHER = "other"

class SubscriptionPlan(str, Enum):
    TRIAL = "trial"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIAL = "trial"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class CompanyBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    legal_name: Optional[str] = Field(None, max_length=255)
    tax_id: Optional[str] = Field(None, max_length=50)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    zip_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    business_type: Optional[BusinessType] = None
    fiscal_year_start: Optional[datetime] = None
    date_format: Optional[str] = Field("MM/DD/YYYY", max_length=20)
    currency: Optional[str] = Field("USD", max_length=3)
    company_logo_url: Optional[str] = Field(None, max_length=500)
    subscription_plan: Optional[SubscriptionPlan] = None
    subscription_status: Optional[SubscriptionStatus] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)

class CompanyResponse(CompanyBase):
    company_id: str
    is_active: bool
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CompanySettingRequest(BaseModel):
    category: str = Field(..., min_length=1, max_length=50)
    setting_key: str = Field(..., min_length=1, max_length=100)
    setting_value: Dict[str, Any] = Field(...)

class CompanySettingResponse(BaseModel):
    setting_id: str
    company_id: str
    category: str
    setting_key: str
    setting_value: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CompanySettingsUpdate(BaseModel):
    settings: List[CompanySettingRequest] = Field(...)

class FileAttachmentResponse(BaseModel):
    attachment_id: str
    company_id: str
    file_name: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    file_url: Optional[str] = None
    storage_provider: Optional[str] = None
    uploaded_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class CompanyUserResponse(BaseModel):
    user_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    permissions: Dict[str, Any]
    is_active: bool
    invited_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class CompanyUserInviteRequest(BaseModel):
    email: str = Field(..., max_length=255)
    role: str = Field(..., max_length=50)
    permissions: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CompanyUserUpdateRequest(BaseModel):
    role: Optional[str] = Field(None, max_length=50)
    permissions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str