"""
Notification & Communication Module Migration Script
Creates all tables and sample data for the notification and communication system
"""

import sys
import os
import asyncio
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(backend_dir))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from database.connection import engine, AsyncSessionLocal, Base
from models.notification import (
    Notification, EmailTemplate, EmailQueue, SMSQueue, WebhookSubscription,
    WebhookDelivery, NotificationPreference, NotificationType, Priority,
    EmailStatus, SMSStatus
)
from models.user import Company, User
import structlog

logger = structlog.get_logger()

async def create_notification_tables():
    """Create all notification tables"""
    try:
        # Create all tables
        async with engine.begin() as conn:
            # Drop existing notification tables (for development only)
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS webhook_deliveries")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS notification_preferences")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS webhook_subscriptions")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS sms_queue")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS email_queue")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS email_templates")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS notifications")
            ))
            
            # Create all tables including new notification tables
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Notification tables created successfully")
        
    except Exception as e:
        logger.error("Failed to create notification tables", error=str(e))
        raise

async def create_sample_notification_data():
    """Create sample notification data for development and testing"""
    try:
        async with AsyncSessionLocal() as db:
            # Get sample company and user
            company_result = await db.execute(
                select(Company).where(Company.company_name == "Demo Company")
            )
            company = company_result.scalar_one_or_none()
            
            user_result = await db.execute(
                select(User).where(User.email == "demo@quickbooks.com")
            )
            user = user_result.scalar_one_or_none()
            
            if not company or not user:
                logger.warning("Demo company or user not found, skipping sample data creation")
                return
            
            # Create sample email templates
            invoice_template = EmailTemplate(
                template_id=str(uuid.uuid4()),
                template_name="Invoice Notification",
                template_category="invoices",
                subject_template="New Invoice {{ invoice_number }} from {{ company_name }}",
                body_template="""
                <h2>Invoice {{ invoice_number }}</h2>
                <p>Dear {{ customer_name }},</p>
                <p>A new invoice has been created for your account:</p>
                <ul>
                    <li>Invoice Number: {{ invoice_number }}</li>
                    <li>Amount: ${{ amount }}</li>
                    <li>Due Date: {{ due_date }}</li>
                </ul>
                <p>Please log in to your account to view the full invoice.</p>
                <p>Best regards,<br>{{ company_name }}</p>
                """,
                is_html=True,
                variables={
                    "invoice_number": "string",
                    "company_name": "string",
                    "customer_name": "string",
                    "amount": "decimal",
                    "due_date": "date"
                },
                is_system=True
            )
            
            payment_template = EmailTemplate(
                template_id=str(uuid.uuid4()),
                template_name="Payment Confirmation",
                template_category="payments",
                subject_template="Payment Confirmation - {{ payment_id }}",
                body_template="""
                <h2>Payment Confirmation</h2>
                <p>Dear {{ customer_name }},</p>
                <p>We have received your payment:</p>
                <ul>
                    <li>Payment ID: {{ payment_id }}</li>
                    <li>Amount: ${{ amount }}</li>
                    <li>Date: {{ payment_date }}</li>
                    <li>Method: {{ payment_method }}</li>
                </ul>
                <p>Thank you for your payment!</p>
                <p>Best regards,<br>{{ company_name }}</p>
                """,
                is_html=True,
                variables={
                    "payment_id": "string",
                    "customer_name": "string",
                    "amount": "decimal",
                    "payment_date": "date",
                    "payment_method": "string",
                    "company_name": "string"
                },
                is_system=True
            )
            
            reminder_template = EmailTemplate(
                template_id=str(uuid.uuid4()),
                template_name="Payment Reminder",
                template_category="reminders",
                subject_template="Payment Reminder - Invoice {{ invoice_number }}",
                body_template="""
                <h2>Payment Reminder</h2>
                <p>Dear {{ customer_name }},</p>
                <p>This is a friendly reminder that the following invoice is due:</p>
                <ul>
                    <li>Invoice Number: {{ invoice_number }}</li>
                    <li>Amount: ${{ amount }}</li>
                    <li>Due Date: {{ due_date }}</li>
                    <li>Days Overdue: {{ days_overdue }}</li>
                </ul>
                <p>Please process payment at your earliest convenience.</p>
                <p>Best regards,<br>{{ company_name }}</p>
                """,
                is_html=True,
                variables={
                    "invoice_number": "string",
                    "customer_name": "string",
                    "amount": "decimal",
                    "due_date": "date",
                    "days_overdue": "integer",
                    "company_name": "string"
                },
                is_system=True
            )
            
            welcome_template = EmailTemplate(
                template_id=str(uuid.uuid4()),
                template_name="Welcome Email",
                template_category="welcome",
                subject_template="Welcome to {{ company_name }}!",
                body_template="""
                <h2>Welcome to {{ company_name }}!</h2>
                <p>Dear {{ user_name }},</p>
                <p>Welcome to our QuickBooks Clone system. Your account has been set up successfully.</p>
                <p>You can now:</p>
                <ul>
                    <li>Create and manage invoices</li>
                    <li>Track payments and expenses</li>
                    <li>Generate financial reports</li>
                    <li>Manage your inventory</li>
                </ul>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>{{ company_name }} Team</p>
                """,
                is_html=True,
                variables={
                    "user_name": "string",
                    "company_name": "string"
                },
                is_system=True
            )
            
            db.add(invoice_template)
            db.add(payment_template)
            db.add(reminder_template)
            db.add(welcome_template)
            
            # Create sample notifications
            notifications = [
                Notification(
                    notification_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    user_id=user.user_id,
                    notification_type=NotificationType.INVOICE,
                    title="New Invoice Created",
                    message="Invoice INV-001 has been created for ABC Company",
                    data={"invoice_id": "inv-001", "amount": 1500.00},
                    priority=Priority.NORMAL,
                    action_url="/invoices/inv-001"
                ),
                Notification(
                    notification_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    user_id=user.user_id,
                    notification_type=NotificationType.PAYMENT,
                    title="Payment Received",
                    message="Payment of $750.00 received from ABC Company",
                    data={"payment_id": "pay-001", "amount": 750.00},
                    priority=Priority.HIGH,
                    action_url="/payments/pay-001"
                ),
                Notification(
                    notification_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    user_id=user.user_id,
                    notification_type=NotificationType.INVENTORY,
                    title="Low Stock Alert",
                    message="Product 'Office Supplies' is running low on stock",
                    data={"item_id": "item-001", "current_stock": 5, "reorder_point": 10},
                    priority=Priority.URGENT,
                    action_url="/inventory/item-001"
                ),
                Notification(
                    notification_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    user_id=user.user_id,
                    notification_type=NotificationType.REMINDER,
                    title="Invoice Due Tomorrow",
                    message="Invoice INV-002 is due tomorrow",
                    data={"invoice_id": "inv-002", "due_date": "2024-07-10"},
                    priority=Priority.HIGH,
                    action_url="/invoices/inv-002",
                    expires_at=datetime.utcnow() + timedelta(days=1)
                ),
                Notification(
                    notification_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    user_id=user.user_id,
                    notification_type=NotificationType.SYSTEM,
                    title="System Maintenance",
                    message="System maintenance is scheduled for this weekend",
                    data={"maintenance_date": "2024-07-13"},
                    priority=Priority.NORMAL,
                    read=True,
                    read_at=datetime.utcnow() - timedelta(hours=1)
                )
            ]
            
            for notification in notifications:
                db.add(notification)
            
            # Create sample email queue entries
            email_queue_entries = [
                EmailQueue(
                    email_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    template_id=invoice_template.template_id,
                    to_email="customer@example.com",
                    subject="New Invoice INV-001 from Demo Company",
                    body="<h2>Invoice INV-001</h2><p>Dear Customer,</p><p>A new invoice has been created...</p>",
                    priority=1,
                    status=EmailStatus.SENT,
                    sent_at=datetime.utcnow() - timedelta(hours=2),
                    delivered_at=datetime.utcnow() - timedelta(hours=2, minutes=1)
                ),
                EmailQueue(
                    email_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    template_id=payment_template.template_id,
                    to_email="customer@example.com",
                    subject="Payment Confirmation - PAY-001",
                    body="<h2>Payment Confirmation</h2><p>Dear Customer,</p><p>We have received your payment...</p>",
                    priority=1,
                    status=EmailStatus.SENT,
                    sent_at=datetime.utcnow() - timedelta(hours=1),
                    delivered_at=datetime.utcnow() - timedelta(hours=1, minutes=1),
                    opened_at=datetime.utcnow() - timedelta(minutes=30)
                ),
                EmailQueue(
                    email_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    to_email="pending@example.com",
                    subject="Test Email",
                    body="This is a test email in the queue",
                    priority=2,
                    status=EmailStatus.QUEUED,
                    scheduled_at=datetime.utcnow() + timedelta(hours=1)
                )
            ]
            
            for email in email_queue_entries:
                db.add(email)
            
            # Create sample SMS queue entries
            sms_queue_entries = [
                SMSQueue(
                    sms_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    to_phone="+1234567890",
                    message="Payment reminder: Invoice INV-001 is due tomorrow",
                    status=SMSStatus.SENT,
                    sent_at=datetime.utcnow() - timedelta(hours=1),
                    delivered_at=datetime.utcnow() - timedelta(hours=1, minutes=1),
                    provider_message_id="sms-123456"
                ),
                SMSQueue(
                    sms_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    to_phone="+1234567891",
                    message="Your payment has been received. Thank you!",
                    status=SMSStatus.QUEUED,
                    scheduled_at=datetime.utcnow() + timedelta(minutes=30)
                )
            ]
            
            for sms in sms_queue_entries:
                db.add(sms)
            
            # Create sample webhook subscription
            webhook = WebhookSubscription(
                webhook_id=str(uuid.uuid4()),
                company_id=company.company_id,
                webhook_url="https://example.com/webhook",
                events=["invoice.created", "payment.received", "customer.updated"],
                secret_key=str(uuid.uuid4()),
                is_active=True,
                timeout_seconds=30,
                headers={"Authorization": "Bearer token123"},
                auth_type="bearer",
                auth_config={"token": "token123"},
                last_ping=datetime.utcnow() - timedelta(minutes=5),
                failure_count=0
            )
            
            db.add(webhook)
            
            # Create sample notification preferences
            notification_types = [
                NotificationType.INVOICE,
                NotificationType.PAYMENT,
                NotificationType.INVENTORY,
                NotificationType.REMINDER,
                NotificationType.SYSTEM
            ]
            
            for notification_type in notification_types:
                preference = NotificationPreference(
                    preference_id=str(uuid.uuid4()),
                    user_id=user.user_id,
                    company_id=company.company_id,
                    notification_type=notification_type,
                    in_app_enabled=True,
                    email_enabled=True,
                    sms_enabled=notification_type in [NotificationType.REMINDER, NotificationType.INVENTORY],
                    push_enabled=True,
                    frequency="immediate" if notification_type != NotificationType.SYSTEM else "daily",
                    quiet_hours_start="22:00",
                    quiet_hours_end="08:00"
                )
                db.add(preference)
            
            await db.commit()
            logger.info("Sample notification data created successfully")
            
    except Exception as e:
        logger.error("Failed to create sample notification data", error=str(e))
        raise

async def run_notification_migration():
    """Run the complete notification migration"""
    try:
        logger.info("Starting notification & communication module migration...")
        
        # Create tables
        await create_notification_tables()
        
        # Create sample data
        await create_sample_notification_data()
        
        logger.info("Notification & communication module migration completed successfully!")
        
    except Exception as e:
        logger.error("Notification migration failed", error=str(e))
        raise

if __name__ == "__main__":
    # Run the migration
    asyncio.run(run_notification_migration())