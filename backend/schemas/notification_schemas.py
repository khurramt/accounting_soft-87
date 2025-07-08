from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import re

# Enum definitions for schemas
class NotificationType(str, Enum):
    SYSTEM = "system"
    TRANSACTION = "transaction"
    PAYMENT = "payment"
    INVOICE = "invoice"
    BILL = "bill"
    PURCHASE_ORDER = "purchase_order"
    INVENTORY = "inventory"
    PAYROLL = "payroll"
    BANKING = "banking"
    REPORT = "report"
    REMINDER = "reminder"
    ALERT = "alert"
    APPROVAL = "approval"
    WELCOME = "welcome"
    SECURITY = "security"

class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class EmailStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    SENT = "sent"
    FAILED = "failed"
    BOUNCED = "bounced"
    DELIVERED = "delivered"
    OPENED = "opened"
    CLICKED = "clicked"

class SMSStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    SENT = "sent"
    FAILED = "failed"
    DELIVERED = "delivered"

class WebhookStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    RETRYING = "retrying"

# Base schemas
class BaseRequest(BaseModel):
    pass

class BaseResponse(BaseModel):
    class Config:
        from_attributes = True

# Notification schemas
class NotificationCreate(BaseRequest):
    user_id: str = Field(..., description="User to notify")
    notification_type: NotificationType = Field(..., description="Type of notification")
    title: str = Field(..., min_length=1, max_length=255, description="Notification title")
    message: str = Field(..., min_length=1, description="Notification message")
    data: Optional[Dict[str, Any]] = None
    priority: Priority = Field(default=Priority.NORMAL, description="Notification priority")
    action_url: Optional[str] = Field(None, max_length=500, description="Action URL")
    expires_at: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1)
    data: Optional[Dict[str, Any]] = None
    priority: Optional[Priority] = None
    action_url: Optional[str] = Field(None, max_length=500)
    expires_at: Optional[datetime] = None

class NotificationMarkRead(BaseModel):
    read: bool = True

class NotificationResponse(BaseResponse):
    notification_id: str
    company_id: str
    user_id: str
    notification_type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]]
    priority: Priority
    read: bool
    read_at: Optional[datetime]
    action_url: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime

# Email Template schemas
class EmailTemplateCreate(BaseRequest):
    template_name: str = Field(..., min_length=1, max_length=255, description="Template name")
    template_category: Optional[str] = Field(None, max_length=100, description="Template category")
    subject_template: str = Field(..., min_length=1, description="Email subject template")
    body_template: str = Field(..., min_length=1, description="Email body template")
    is_html: bool = Field(default=False, description="Whether body is HTML")
    variables: Optional[Dict[str, Any]] = None

class EmailTemplateUpdate(BaseModel):
    template_name: Optional[str] = Field(None, min_length=1, max_length=255)
    template_category: Optional[str] = Field(None, max_length=100)
    subject_template: Optional[str] = Field(None, min_length=1)
    body_template: Optional[str] = Field(None, min_length=1)
    is_html: Optional[bool] = None
    variables: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class EmailTemplateResponse(BaseResponse):
    template_id: str
    template_name: str
    template_category: Optional[str]
    subject_template: str
    body_template: str
    is_html: bool
    variables: Optional[Dict[str, Any]]
    is_active: bool
    is_system: bool
    created_at: datetime
    updated_at: Optional[datetime]

# Email Queue schemas
class EmailSendRequest(BaseRequest):
    to_email: EmailStr = Field(..., description="Recipient email address")
    cc_email: Optional[EmailStr] = None
    bcc_email: Optional[EmailStr] = None
    subject: str = Field(..., min_length=1, description="Email subject")
    body: str = Field(..., min_length=1, description="Email body")
    template_id: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = None
    attachments: Optional[List[str]] = None
    priority: int = Field(default=1, ge=1, le=5, description="Priority (1=highest, 5=lowest)")
    scheduled_at: Optional[datetime] = None

class EmailTemplatePreview(BaseRequest):
    template_id: str = Field(..., description="Template ID")
    variables: Optional[Dict[str, Any]] = None

class EmailQueueResponse(BaseResponse):
    email_id: str
    company_id: Optional[str]
    template_id: Optional[str]
    to_email: str
    cc_email: Optional[str]
    bcc_email: Optional[str]
    subject: str
    body: str
    attachments: Optional[List[str]]
    priority: int
    status: EmailStatus
    attempts: int
    max_attempts: int
    last_error: Optional[str]
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    opened_at: Optional[datetime]
    clicked_at: Optional[datetime]
    bounced_at: Optional[datetime]
    delivered_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

# SMS Queue schemas
class SMSSendRequest(BaseRequest):
    to_phone: str = Field(..., description="Recipient phone number")
    message: str = Field(..., min_length=1, max_length=1600, description="SMS message")
    scheduled_at: Optional[datetime] = None

    @field_validator('to_phone')
    def validate_phone(cls, v):
        # Basic phone number validation
        phone_pattern = re.compile(r'^\+?1?\d{9,15}$')
        if not phone_pattern.match(v.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')):
            raise ValueError('Invalid phone number format')
        return v

class SMSQueueResponse(BaseResponse):
    sms_id: str
    company_id: Optional[str]
    to_phone: str
    message: str
    status: SMSStatus
    attempts: int
    max_attempts: int
    last_error: Optional[str]
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    provider_message_id: Optional[str]
    delivery_status: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

# Webhook schemas
class WebhookSubscriptionCreate(BaseRequest):
    webhook_url: str = Field(..., description="Webhook URL")
    events: List[str] = Field(..., min_length=1, description="List of events to subscribe to")
    secret_key: Optional[str] = None
    timeout_seconds: int = Field(default=30, ge=1, le=300, description="Timeout in seconds")
    headers: Optional[Dict[str, str]] = None
    auth_type: Optional[str] = Field(default="none", pattern="^(none|basic|bearer|api_key)$")
    auth_config: Optional[Dict[str, Any]] = None

    @field_validator('webhook_url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

class WebhookSubscriptionUpdate(BaseModel):
    webhook_url: Optional[str] = None
    events: Optional[List[str]] = None
    secret_key: Optional[str] = None
    is_active: Optional[bool] = None
    timeout_seconds: Optional[int] = Field(None, ge=1, le=300)
    headers: Optional[Dict[str, str]] = None
    auth_type: Optional[str] = Field(None, pattern="^(none|basic|bearer|api_key)$")
    auth_config: Optional[Dict[str, Any]] = None

    @field_validator('webhook_url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

class WebhookSubscriptionResponse(BaseResponse):
    webhook_id: str
    company_id: str
    webhook_url: str
    events: List[str]
    secret_key: str
    is_active: bool
    timeout_seconds: int
    last_ping: Optional[datetime]
    failure_count: int
    max_failures: int
    headers: Optional[Dict[str, str]]
    auth_type: Optional[str]
    auth_config: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]

class WebhookTestRequest(BaseRequest):
    event_type: str = Field(..., description="Event type to test")
    test_payload: Optional[Dict[str, Any]] = None

class WebhookDeliveryResponse(BaseResponse):
    delivery_id: str
    webhook_id: str
    event_type: str
    payload: Dict[str, Any]
    status: str
    attempts: int
    max_attempts: int
    response_status: Optional[int]
    response_body: Optional[str]
    response_headers: Optional[Dict[str, str]]
    error_message: Optional[str]
    scheduled_at: Optional[datetime]
    delivered_at: Optional[datetime]
    next_retry_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

# Notification Preference schemas
class NotificationPreferenceCreate(BaseRequest):
    notification_type: NotificationType = Field(..., description="Type of notification")
    in_app_enabled: bool = Field(default=True, description="Enable in-app notifications")
    email_enabled: bool = Field(default=True, description="Enable email notifications")
    sms_enabled: bool = Field(default=False, description="Enable SMS notifications")
    push_enabled: bool = Field(default=True, description="Enable push notifications")
    frequency: str = Field(default="immediate", pattern="^(immediate|daily|weekly|never)$")
    quiet_hours_start: Optional[str] = Field(None, pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: Optional[str] = Field(None, pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")

class NotificationPreferenceUpdate(BaseModel):
    in_app_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    frequency: Optional[str] = Field(None, pattern="^(immediate|daily|weekly|never)$")
    quiet_hours_start: Optional[str] = Field(None, pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: Optional[str] = Field(None, pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")

class NotificationPreferenceResponse(BaseResponse):
    preference_id: str
    user_id: str
    company_id: str
    notification_type: NotificationType
    in_app_enabled: bool
    email_enabled: bool
    sms_enabled: bool
    push_enabled: bool
    frequency: str
    quiet_hours_start: Optional[str]
    quiet_hours_end: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

# Search and filter schemas
class NotificationSearchFilters(BaseModel):
    search: Optional[str] = None
    notification_type: Optional[NotificationType] = None
    priority: Optional[Priority] = None
    read: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sort_by: Optional[str] = Field(default="created_at")
    sort_order: Optional[str] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class EmailQueueSearchFilters(BaseModel):
    search: Optional[str] = None
    status: Optional[EmailStatus] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sort_by: Optional[str] = Field(default="created_at")
    sort_order: Optional[str] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class SMSQueueSearchFilters(BaseModel):
    search: Optional[str] = None
    status: Optional[SMSStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sort_by: Optional[str] = Field(default="created_at")
    sort_order: Optional[str] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

# Common response schemas
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

# Bulk operations schemas
class BulkNotificationCreate(BaseRequest):
    user_ids: List[str] = Field(..., min_length=1, description="List of user IDs to notify")
    notification_type: NotificationType = Field(..., description="Type of notification")
    title: str = Field(..., min_length=1, max_length=255, description="Notification title")
    message: str = Field(..., min_length=1, description="Notification message")
    data: Optional[Dict[str, Any]] = None
    priority: Priority = Field(default=Priority.NORMAL, description="Notification priority")
    action_url: Optional[str] = Field(None, max_length=500, description="Action URL")
    expires_at: Optional[datetime] = None

class BulkNotificationResponse(BaseResponse):
    created_count: int
    failed_count: int
    errors: List[str]

class NotificationStats(BaseModel):
    total_notifications: int
    unread_notifications: int
    notifications_by_type: Dict[str, int]
    notifications_by_priority: Dict[str, int]
    recent_notifications: List[NotificationResponse]

class EmailStats(BaseModel):
    total_emails: int
    queued_emails: int
    sent_emails: int
    failed_emails: int
    emails_by_status: Dict[str, int]
    open_rate: float
    click_rate: float
    bounce_rate: float

class SMSStats(BaseModel):
    total_sms: int
    queued_sms: int
    sent_sms: int
    failed_sms: int
    sms_by_status: Dict[str, int]
    delivery_rate: float