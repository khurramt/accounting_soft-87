from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum, JSON, ARRAY
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String as SQLString
import sqlalchemy as sa

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

class Notification(Base):
    __tablename__ = "notifications"
    
    notification_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    user_id = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON)  # Additional data payload
    priority = Column(SQLEnum(Priority), default=Priority.NORMAL)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    action_url = Column(String(500))  # URL for action button
    expires_at = Column(DateTime)  # Expiration time for notification
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<Notification {self.notification_id}>"

class EmailTemplate(Base):
    __tablename__ = "email_templates"
    
    template_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_name = Column(String(255), nullable=False)
    template_category = Column(String(100))  # invoices, payments, reminders, etc.
    subject_template = Column(Text, nullable=False)
    body_template = Column(Text, nullable=False)
    is_html = Column(Boolean, default=False)
    variables = Column(JSON)  # Available template variables
    
    # Template settings
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)  # System templates cannot be deleted
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    def __repr__(self):
        return f"<EmailTemplate {self.template_name}>"

class EmailQueue(Base):
    __tablename__ = "email_queue"
    
    email_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"))
    template_id = Column(SQLString(36), ForeignKey("email_templates.template_id"))
    
    # Email details
    to_email = Column(String(255), nullable=False)
    cc_email = Column(String(255))
    bcc_email = Column(String(255))
    subject = Column(Text, nullable=False)
    body = Column(Text, nullable=False)
    attachments = Column(JSON)  # Array of attachment file paths/URLs
    
    # Queue management
    priority = Column(Integer, default=1)  # 1 = highest, 5 = lowest
    status = Column(SQLEnum(EmailStatus), default=EmailStatus.QUEUED)
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    last_error = Column(Text)
    
    # Scheduling
    scheduled_at = Column(DateTime)  # When to send (NULL = send immediately)
    sent_at = Column(DateTime)
    
    # Tracking
    opened_at = Column(DateTime)
    clicked_at = Column(DateTime)
    bounced_at = Column(DateTime)
    delivered_at = Column(DateTime)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    template = relationship("EmailTemplate", foreign_keys=[template_id])
    
    def __repr__(self):
        return f"<EmailQueue {self.email_id}>"

class SMSQueue(Base):
    __tablename__ = "sms_queue"
    
    sms_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"))
    
    # SMS details
    to_phone = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    
    # Queue management
    status = Column(SQLEnum(SMSStatus), default=SMSStatus.QUEUED)
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    last_error = Column(Text)
    
    # Scheduling
    scheduled_at = Column(DateTime)  # When to send (NULL = send immediately)
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    
    # Tracking
    provider_message_id = Column(String(255))  # Provider's message ID
    delivery_status = Column(String(50))  # Provider's delivery status
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<SMSQueue {self.sms_id}>"

class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"
    
    webhook_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    
    # Webhook details
    webhook_url = Column(String(500), nullable=False)
    events = Column(JSON)  # Array of subscribed events
    secret_key = Column(String(255), nullable=False)  # For signature verification
    
    # Configuration
    is_active = Column(Boolean, default=True)
    timeout_seconds = Column(Integer, default=30)
    
    # Health monitoring
    last_ping = Column(DateTime)
    failure_count = Column(Integer, default=0)
    max_failures = Column(Integer, default=5)
    
    # Headers and authentication
    headers = Column(JSON)  # Custom headers to include
    auth_type = Column(String(50))  # none, basic, bearer, api_key
    auth_config = Column(JSON)  # Authentication configuration
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<WebhookSubscription {self.webhook_id}>"

class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"
    
    delivery_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    webhook_id = Column(SQLString(36), ForeignKey("webhook_subscriptions.webhook_id"), nullable=False)
    
    # Delivery details
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    
    # Delivery status
    status = Column(String(50), default="pending")  # pending, success, failed, retrying
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    
    # Response details
    response_status = Column(Integer)
    response_body = Column(Text)
    response_headers = Column(JSON)
    error_message = Column(Text)
    
    # Timing
    scheduled_at = Column(DateTime)
    delivered_at = Column(DateTime)
    next_retry_at = Column(DateTime)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    webhook = relationship("WebhookSubscription", foreign_keys=[webhook_id])
    
    def __repr__(self):
        return f"<WebhookDelivery {self.delivery_id}>"

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    
    preference_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    
    # Preference settings
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    
    # Delivery channels
    in_app_enabled = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    
    # Frequency settings
    frequency = Column(String(50), default="immediate")  # immediate, daily, weekly, never
    quiet_hours_start = Column(String(5))  # HH:MM format
    quiet_hours_end = Column(String(5))  # HH:MM format
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    company = relationship("Company", foreign_keys=[company_id])
    
    # Unique constraint per user/company/notification_type
    __table_args__ = (sa.UniqueConstraint('user_id', 'company_id', 'notification_type', name='unique_user_company_notification'),)
    
    def __repr__(self):
        return f"<NotificationPreference {self.preference_id}>"