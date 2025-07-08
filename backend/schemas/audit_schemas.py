from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum
from models.audit import AuditAction, SecurityEvent

# Audit Log Schemas
class AuditLogBase(BaseModel):
    table_name: str = Field(..., description="Name of the table that was modified")
    record_id: str = Field(..., description="ID of the record that was modified")
    action: AuditAction = Field(..., description="Type of action performed")
    old_values: Optional[Dict[str, Any]] = Field(None, description="Values before change")
    new_values: Optional[Dict[str, Any]] = Field(None, description="Values after change")
    change_reason: Optional[str] = Field(None, description="Reason for the change")
    affected_fields: Optional[List[str]] = Field(None, description="Fields that were changed")

class AuditLogCreate(AuditLogBase):
    company_id: str = Field(..., description="Company ID")
    user_id: str = Field(..., description="User who made the change")
    ip_address: Optional[str] = Field(None, description="IP address of the user")
    user_agent: Optional[str] = Field(None, description="User agent string")
    endpoint: Optional[str] = Field(None, description="API endpoint used")
    request_method: Optional[str] = Field(None, description="HTTP method used")

class AuditLogResponse(AuditLogBase):
    audit_id: str = Field(..., description="Unique audit log ID")
    company_id: str = Field(..., description="Company ID")
    user_id: str = Field(..., description="User who made the change")
    ip_address: Optional[str] = Field(None, description="IP address of the user")
    user_agent: Optional[str] = Field(None, description="User agent string")
    endpoint: Optional[str] = Field(None, description="API endpoint used")
    request_method: Optional[str] = Field(None, description="HTTP method used")
    created_at: datetime = Field(..., description="When the audit log was created")
    
    class Config:
        from_attributes = True

class AuditLogFilter(BaseModel):
    table_name: Optional[str] = Field(None, description="Filter by table name")
    record_id: Optional[str] = Field(None, description="Filter by record ID")
    action: Optional[AuditAction] = Field(None, description="Filter by action type")
    user_id: Optional[str] = Field(None, description="Filter by user ID")
    date_from: Optional[datetime] = Field(None, description="Filter from date")
    date_to: Optional[datetime] = Field(None, description="Filter to date")
    search: Optional[str] = Field(None, description="Search in change reason or affected fields")

class AuditLogList(BaseModel):
    items: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Security Log Schemas
class SecurityLogBase(BaseModel):
    event_type: SecurityEvent = Field(..., description="Type of security event")
    success: bool = Field(..., description="Whether the event was successful")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional event details")
    risk_score: int = Field(0, ge=0, le=100, description="Risk score (0-100)")
    threat_level: str = Field("low", pattern="^(low|medium|high|critical)$", description="Threat level")

class SecurityLogCreate(SecurityLogBase):
    user_id: Optional[str] = Field(None, description="User ID (if applicable)")
    company_id: Optional[str] = Field(None, description="Company ID (if applicable)")
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="User agent string")
    endpoint: Optional[str] = Field(None, description="API endpoint used")
    request_method: Optional[str] = Field(None, description="HTTP method used")

class SecurityLogResponse(SecurityLogBase):
    log_id: str = Field(..., description="Unique security log ID")
    user_id: Optional[str] = Field(None, description="User ID (if applicable)")
    company_id: Optional[str] = Field(None, description="Company ID (if applicable)")
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="User agent string")
    endpoint: Optional[str] = Field(None, description="API endpoint used")
    request_method: Optional[str] = Field(None, description="HTTP method used")
    created_at: datetime = Field(..., description="When the security log was created")
    
    class Config:
        from_attributes = True

class SecurityLogFilter(BaseModel):
    event_type: Optional[SecurityEvent] = Field(None, description="Filter by event type")
    success: Optional[bool] = Field(None, description="Filter by success status")
    user_id: Optional[str] = Field(None, description="Filter by user ID")
    threat_level: Optional[str] = Field(None, description="Filter by threat level")
    date_from: Optional[datetime] = Field(None, description="Filter from date")
    date_to: Optional[datetime] = Field(None, description="Filter to date")
    ip_address: Optional[str] = Field(None, description="Filter by IP address")
    min_risk_score: Optional[int] = Field(None, ge=0, le=100, description="Minimum risk score")

class SecurityLogList(BaseModel):
    items: List[SecurityLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Role Schemas
class RoleBase(BaseModel):
    role_name: str = Field(..., min_length=1, max_length=100, description="Role name")
    description: Optional[str] = Field(None, description="Role description")
    permissions: Dict[str, Any] = Field(default_factory=dict, description="Role permissions")
    is_active: bool = Field(True, description="Whether the role is active")
    parent_role_id: Optional[str] = Field(None, description="Parent role ID for hierarchy")

class RoleCreate(RoleBase):
    company_id: Optional[str] = Field(None, description="Company ID (null for system roles)")

class RoleUpdate(BaseModel):
    role_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Role name")
    description: Optional[str] = Field(None, description="Role description")
    permissions: Optional[Dict[str, Any]] = Field(None, description="Role permissions")
    is_active: Optional[bool] = Field(None, description="Whether the role is active")
    parent_role_id: Optional[str] = Field(None, description="Parent role ID for hierarchy")

class RoleResponse(RoleBase):
    role_id: str = Field(..., description="Unique role ID")
    company_id: Optional[str] = Field(None, description="Company ID (null for system roles)")
    is_system_role: bool = Field(..., description="Whether this is a system role")
    created_at: datetime = Field(..., description="When the role was created")
    updated_at: Optional[datetime] = Field(None, description="When the role was last updated")
    
    class Config:
        from_attributes = True

class RoleList(BaseModel):
    items: List[RoleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# User Permission Schemas
class UserPermissionBase(BaseModel):
    resource: str = Field(..., min_length=1, max_length=100, description="Resource name")
    actions: List[str] = Field(..., description="List of allowed actions")
    conditions: Optional[Dict[str, Any]] = Field(None, description="Permission conditions")
    expires_at: Optional[datetime] = Field(None, description="Permission expiration date")
    is_active: bool = Field(True, description="Whether the permission is active")

class UserPermissionCreate(UserPermissionBase):
    user_id: str = Field(..., description="User ID")
    company_id: str = Field(..., description="Company ID")
    role_id: Optional[str] = Field(None, description="Role ID (if role-based permission)")
    granted_by: str = Field(..., description="ID of user who granted the permission")

class UserPermissionUpdate(BaseModel):
    resource: Optional[str] = Field(None, min_length=1, max_length=100, description="Resource name")
    actions: Optional[List[str]] = Field(None, description="List of allowed actions")
    conditions: Optional[Dict[str, Any]] = Field(None, description="Permission conditions")
    expires_at: Optional[datetime] = Field(None, description="Permission expiration date")
    is_active: Optional[bool] = Field(None, description="Whether the permission is active")

class UserPermissionResponse(UserPermissionBase):
    permission_id: str = Field(..., description="Unique permission ID")
    user_id: str = Field(..., description="User ID")
    company_id: str = Field(..., description="Company ID")
    role_id: Optional[str] = Field(None, description="Role ID (if role-based permission)")
    granted_by: str = Field(..., description="ID of user who granted the permission")
    created_at: datetime = Field(..., description="When the permission was created")
    updated_at: Optional[datetime] = Field(None, description="When the permission was last updated")
    
    class Config:
        from_attributes = True

class UserPermissionList(BaseModel):
    items: List[UserPermissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Security Settings Schemas
class SecuritySettingsBase(BaseModel):
    password_policy: Dict[str, Any] = Field(default_factory=lambda: {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_symbols": True,
        "password_history": 5
    })
    session_settings: Dict[str, Any] = Field(default_factory=lambda: {
        "timeout_minutes": 30,
        "max_concurrent_sessions": 3,
        "require_2fa": False
    })
    access_control: Dict[str, Any] = Field(default_factory=lambda: {
        "allowed_ip_ranges": [],
        "blocked_ip_ranges": [],
        "allowed_countries": [],
        "blocked_countries": []
    })
    audit_settings: Dict[str, Any] = Field(default_factory=lambda: {
        "log_all_actions": True,
        "log_sensitive_data": True,
        "retention_days": 2555
    })

class SecuritySettingsResponse(SecuritySettingsBase):
    setting_id: str = Field(..., description="Unique setting ID")
    company_id: str = Field(..., description="Company ID")
    created_at: datetime = Field(..., description="When the settings were created")
    updated_at: Optional[datetime] = Field(None, description="When the settings were last updated")
    
    class Config:
        from_attributes = True

# Audit Report Schemas
class AuditReportRequest(BaseModel):
    report_type: str = Field(..., pattern="^(summary|detailed|compliance|sox)$", description="Type of audit report")
    date_from: datetime = Field(..., description="Report start date")
    date_to: datetime = Field(..., description="Report end date")
    include_tables: Optional[List[str]] = Field(None, description="Specific tables to include")
    include_users: Optional[List[str]] = Field(None, description="Specific users to include")
    format: str = Field("json", regex="^(json|csv|pdf)$", description="Report format")

class AuditReportResponse(BaseModel):
    report_id: str = Field(..., description="Unique report ID")
    report_type: str = Field(..., description="Type of audit report")
    date_from: datetime = Field(..., description="Report start date")
    date_to: datetime = Field(..., description="Report end date")
    total_records: int = Field(..., description="Total number of audit records")
    data: Union[List[Dict[str, Any]], str] = Field(..., description="Report data or file path")
    format: str = Field(..., description="Report format")
    generated_at: datetime = Field(..., description="When the report was generated")
    generated_by: str = Field(..., description="User who generated the report")