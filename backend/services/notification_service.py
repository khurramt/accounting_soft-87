import asyncio
import uuid
import json
import hmac
import hashlib
import httpx
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc, update, delete
from sqlalchemy.orm import selectinload, joinedload
from models.notification import (
    Notification, EmailTemplate, EmailQueue, SMSQueue, WebhookSubscription,
    WebhookDelivery, NotificationPreference, NotificationType, Priority,
    EmailStatus, SMSStatus
)
from models.user import User, Company
from schemas.notification_schemas import (
    NotificationCreate, NotificationUpdate, NotificationSearchFilters,
    EmailTemplateCreate, EmailTemplateUpdate, EmailSendRequest,
    EmailQueueSearchFilters, SMSSendRequest, SMSQueueSearchFilters,
    WebhookSubscriptionCreate, WebhookSubscriptionUpdate,
    NotificationPreferenceCreate, NotificationPreferenceUpdate,
    BulkNotificationCreate, WebhookTestRequest
)
import structlog
import re
from jinja2 import Template, Environment, BaseLoader

logger = structlog.get_logger()

class BaseNotificationService:
    """Base service for notification operations"""
    
    @staticmethod
    async def verify_company_access(db: AsyncSession, user_id: str, company_id: str) -> bool:
        """Verify user has access to company"""
        try:
            # Check if user has access to company through membership
            from models.user import CompanyMembership
            result = await db.execute(
                select(CompanyMembership).where(
                    and_(
                        CompanyMembership.user_id == user_id,
                        CompanyMembership.company_id == company_id
                    )
                )
            )
            return result.scalar_one_or_none() is not None
        except Exception as e:
            logger.error("Error verifying company access", error=str(e))
            return False

class NotificationService(BaseNotificationService):
    """Service for notification operations"""
    
    @staticmethod
    async def create_notification(
        db: AsyncSession,
        company_id: str,
        notification_data: NotificationCreate
    ) -> Notification:
        """Create a new notification"""
        
        notification = Notification(
            notification_id=str(uuid.uuid4()),
            company_id=company_id,
            **notification_data.dict()
        )
        
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        
        # TODO: Send real-time notification via WebSocket
        await NotificationService._send_realtime_notification(notification)
        
        logger.info("Notification created", 
                   notification_id=notification.notification_id,
                   user_id=notification.user_id,
                   type=notification.notification_type)
        
        return notification
    
    @staticmethod
    async def create_bulk_notifications(
        db: AsyncSession,
        company_id: str,
        bulk_data: BulkNotificationCreate
    ) -> Tuple[int, int, List[str]]:
        """Create notifications for multiple users"""
        
        created_count = 0
        failed_count = 0
        errors = []
        
        for user_id in bulk_data.user_ids:
            try:
                notification_data = NotificationCreate(
                    user_id=user_id,
                    notification_type=bulk_data.notification_type,
                    title=bulk_data.title,
                    message=bulk_data.message,
                    data=bulk_data.data,
                    priority=bulk_data.priority,
                    action_url=bulk_data.action_url,
                    expires_at=bulk_data.expires_at
                )
                
                await NotificationService.create_notification(
                    db, company_id, notification_data
                )
                created_count += 1
                
            except Exception as e:
                failed_count += 1
                errors.append(f"User {user_id}: {str(e)}")
                logger.error("Failed to create notification", 
                           user_id=user_id, error=str(e))
        
        logger.info("Bulk notifications created", 
                   created=created_count, failed=failed_count)
        
        return created_count, failed_count, errors
    
    @staticmethod
    async def get_notifications(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        filters: NotificationSearchFilters
    ) -> Tuple[List[Notification], int]:
        """Get notifications with filtering and pagination"""
        
        query = select(Notification).where(
            and_(
                Notification.company_id == company_id,
                Notification.user_id == user_id
            )
        )
        
        # Apply filters
        if filters.notification_type:
            query = query.where(Notification.notification_type == filters.notification_type)
        
        if filters.priority:
            query = query.where(Notification.priority == filters.priority)
        
        if filters.read is not None:
            query = query.where(Notification.read == filters.read)
        
        if filters.date_from:
            query = query.where(Notification.created_at >= filters.date_from)
        
        if filters.date_to:
            query = query.where(Notification.created_at <= filters.date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Notification.title.ilike(search_term),
                    Notification.message.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(Notification, filters.sort_by, Notification.created_at)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(Notification.created_at))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        notifications = result.scalars().all()
        
        return notifications, total
    
    @staticmethod
    async def mark_notification_read(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        notification_id: str
    ) -> Optional[Notification]:
        """Mark a notification as read"""
        
        result = await db.execute(
            select(Notification).where(
                and_(
                    Notification.notification_id == notification_id,
                    Notification.company_id == company_id,
                    Notification.user_id == user_id
                )
            )
        )
        notification = result.scalar_one_or_none()
        
        if notification and not notification.read:
            notification.read = True
            notification.read_at = datetime.utcnow()
            await db.commit()
            await db.refresh(notification)
            
            logger.info("Notification marked as read", 
                       notification_id=notification_id)
        
        return notification
    
    @staticmethod
    async def mark_all_notifications_read(
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> int:
        """Mark all notifications as read for a user"""
        
        result = await db.execute(
            update(Notification)
            .where(
                and_(
                    Notification.company_id == company_id,
                    Notification.user_id == user_id,
                    Notification.read == False
                )
            )
            .values(read=True, read_at=datetime.utcnow())
        )
        
        await db.commit()
        count = result.rowcount
        
        logger.info("All notifications marked as read", 
                   user_id=user_id, count=count)
        
        return count
    
    @staticmethod
    async def delete_notification(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        notification_id: str
    ) -> bool:
        """Delete a notification"""
        
        result = await db.execute(
            delete(Notification).where(
                and_(
                    Notification.notification_id == notification_id,
                    Notification.company_id == company_id,
                    Notification.user_id == user_id
                )
            )
        )
        
        await db.commit()
        success = result.rowcount > 0
        
        if success:
            logger.info("Notification deleted", 
                       notification_id=notification_id)
        
        return success
    
    @staticmethod
    async def get_notification_stats(
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Get notification statistics for a user"""
        
        # Total notifications
        total_result = await db.execute(
            select(func.count(Notification.notification_id)).where(
                and_(
                    Notification.company_id == company_id,
                    Notification.user_id == user_id
                )
            )
        )
        total_notifications = total_result.scalar()
        
        # Unread notifications
        unread_result = await db.execute(
            select(func.count(Notification.notification_id)).where(
                and_(
                    Notification.company_id == company_id,
                    Notification.user_id == user_id,
                    Notification.read == False
                )
            )
        )
        unread_notifications = unread_result.scalar()
        
        # Notifications by type
        type_result = await db.execute(
            select(
                Notification.notification_type,
                func.count(Notification.notification_id)
            ).where(
                and_(
                    Notification.company_id == company_id,
                    Notification.user_id == user_id
                )
            ).group_by(Notification.notification_type)
        )
        notifications_by_type = {row[0]: row[1] for row in type_result.fetchall()}
        
        # Notifications by priority
        priority_result = await db.execute(
            select(
                Notification.priority,
                func.count(Notification.notification_id)
            ).where(
                and_(
                    Notification.company_id == company_id,
                    Notification.user_id == user_id
                )
            ).group_by(Notification.priority)
        )
        notifications_by_priority = {row[0]: row[1] for row in priority_result.fetchall()}
        
        # Recent notifications
        recent_result = await db.execute(
            select(Notification).where(
                and_(
                    Notification.company_id == company_id,
                    Notification.user_id == user_id
                )
            ).order_by(desc(Notification.created_at)).limit(5)
        )
        recent_notifications = recent_result.scalars().all()
        
        return {
            "total_notifications": total_notifications,
            "unread_notifications": unread_notifications,
            "notifications_by_type": notifications_by_type,
            "notifications_by_priority": notifications_by_priority,
            "recent_notifications": recent_notifications
        }
    
    @staticmethod
    async def _send_realtime_notification(notification: Notification) -> None:
        """Send real-time notification via WebSocket"""
        # TODO: Implement WebSocket notification
        # This would integrate with a WebSocket manager to send real-time notifications
        pass
    
    @staticmethod
    async def cleanup_expired_notifications(db: AsyncSession) -> int:
        """Clean up expired notifications"""
        
        result = await db.execute(
            delete(Notification).where(
                and_(
                    Notification.expires_at.is_not(None),
                    Notification.expires_at <= datetime.utcnow()
                )
            )
        )
        
        await db.commit()
        count = result.rowcount
        
        logger.info("Expired notifications cleaned up", count=count)
        
        return count

class EmailTemplateService(BaseNotificationService):
    """Service for email template operations"""
    
    @staticmethod
    async def create_template(
        db: AsyncSession,
        template_data: EmailTemplateCreate
    ) -> EmailTemplate:
        """Create a new email template"""
        
        template = EmailTemplate(
            template_id=str(uuid.uuid4()),
            **template_data.dict()
        )
        
        db.add(template)
        await db.commit()
        await db.refresh(template)
        
        logger.info("Email template created", 
                   template_id=template.template_id,
                   name=template.template_name)
        
        return template
    
    @staticmethod
    async def get_templates(
        db: AsyncSession,
        category: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[EmailTemplate]:
        """Get email templates"""
        
        query = select(EmailTemplate)
        
        if category:
            query = query.where(EmailTemplate.template_category == category)
        
        if is_active is not None:
            query = query.where(EmailTemplate.is_active == is_active)
        
        query = query.order_by(EmailTemplate.template_name)
        
        result = await db.execute(query)
        templates = result.scalars().all()
        
        return templates
    
    @staticmethod
    async def get_template_by_id(
        db: AsyncSession,
        template_id: str
    ) -> Optional[EmailTemplate]:
        """Get email template by ID"""
        
        result = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.template_id == template_id
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_template(
        db: AsyncSession,
        template_id: str,
        template_data: EmailTemplateUpdate
    ) -> Optional[EmailTemplate]:
        """Update an email template"""
        
        result = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.template_id == template_id
            )
        )
        template = result.scalar_one_or_none()
        
        if not template:
            return None
        
        # Check if it's a system template
        if template.is_system:
            raise ValueError("Cannot modify system templates")
        
        # Update fields
        for field, value in template_data.dict(exclude_unset=True).items():
            setattr(template, field, value)
        
        await db.commit()
        await db.refresh(template)
        
        logger.info("Email template updated", 
                   template_id=template_id)
        
        return template
    
    @staticmethod
    async def delete_template(
        db: AsyncSession,
        template_id: str
    ) -> bool:
        """Delete an email template"""
        
        result = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.template_id == template_id
            )
        )
        template = result.scalar_one_or_none()
        
        if not template:
            return False
        
        # Check if it's a system template
        if template.is_system:
            raise ValueError("Cannot delete system templates")
        
        await db.execute(
            delete(EmailTemplate).where(
                EmailTemplate.template_id == template_id
            )
        )
        
        await db.commit()
        
        logger.info("Email template deleted", 
                   template_id=template_id)
        
        return True
    
    @staticmethod
    async def render_template(
        db: AsyncSession,
        template_id: str,
        variables: Dict[str, Any]
    ) -> Tuple[str, str]:
        """Render email template with variables"""
        
        template = await EmailTemplateService.get_template_by_id(db, template_id)
        
        if not template:
            raise ValueError("Template not found")
        
        env = Environment(loader=BaseLoader())
        
        # Render subject
        subject_template = env.from_string(template.subject_template)
        subject = subject_template.render(variables)
        
        # Render body
        body_template = env.from_string(template.body_template)
        body = body_template.render(variables)
        
        return subject, body

class EmailService(BaseNotificationService):
    """Service for email operations"""
    
    @staticmethod
    async def send_email(
        db: AsyncSession,
        company_id: str,
        email_data: EmailSendRequest
    ) -> EmailQueue:
        """Queue an email for sending"""
        
        subject = email_data.subject
        body = email_data.body
        
        # If using template, render it
        if email_data.template_id:
            subject, body = await EmailTemplateService.render_template(
                db, email_data.template_id, email_data.template_variables or {}
            )
        
        email = EmailQueue(
            email_id=str(uuid.uuid4()),
            company_id=company_id,
            template_id=email_data.template_id,
            to_email=email_data.to_email,
            cc_email=email_data.cc_email,
            bcc_email=email_data.bcc_email,
            subject=subject,
            body=body,
            attachments=email_data.attachments,
            priority=email_data.priority,
            scheduled_at=email_data.scheduled_at
        )
        
        db.add(email)
        await db.commit()
        await db.refresh(email)
        
        # Process immediately if not scheduled
        if not email_data.scheduled_at:
            await EmailService._process_email(db, email)
        
        logger.info("Email queued", 
                   email_id=email.email_id,
                   to_email=email.to_email)
        
        return email
    
    @staticmethod
    async def get_email_queue(
        db: AsyncSession,
        company_id: str,
        filters: EmailQueueSearchFilters
    ) -> Tuple[List[EmailQueue], int]:
        """Get email queue with filtering and pagination"""
        
        query = select(EmailQueue).where(
            EmailQueue.company_id == company_id
        )
        
        # Apply filters
        if filters.status:
            query = query.where(EmailQueue.status == filters.status)
        
        if filters.priority:
            query = query.where(EmailQueue.priority == filters.priority)
        
        if filters.date_from:
            query = query.where(EmailQueue.created_at >= filters.date_from)
        
        if filters.date_to:
            query = query.where(EmailQueue.created_at <= filters.date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    EmailQueue.to_email.ilike(search_term),
                    EmailQueue.subject.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(EmailQueue, filters.sort_by, EmailQueue.created_at)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(EmailQueue.created_at))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        emails = result.scalars().all()
        
        return emails, total
    
    @staticmethod
    async def _process_email(db: AsyncSession, email: EmailQueue) -> None:
        """Process an email from the queue"""
        
        try:
            # Update status to processing
            email.status = EmailStatus.PROCESSING
            email.attempts += 1
            await db.commit()
            
            # TODO: Implement actual email sending
            # This would integrate with SendGrid, AWS SES, or other email service
            success = await EmailService._send_email_via_provider(email)
            
            if success:
                email.status = EmailStatus.SENT
                email.sent_at = datetime.utcnow()
                logger.info("Email sent successfully", email_id=email.email_id)
            else:
                email.status = EmailStatus.FAILED
                email.last_error = "Email sending failed"
                logger.error("Email sending failed", email_id=email.email_id)
            
            await db.commit()
            
        except Exception as e:
            email.status = EmailStatus.FAILED
            email.last_error = str(e)
            await db.commit()
            
            logger.error("Email processing failed", 
                        email_id=email.email_id, error=str(e))
    
    @staticmethod
    async def _send_email_via_provider(email: EmailQueue) -> bool:
        """Send email via email provider"""
        # TODO: Implement actual email sending logic
        # This is a placeholder implementation
        return True
    
    @staticmethod
    async def get_email_stats(
        db: AsyncSession,
        company_id: str
    ) -> Dict[str, Any]:
        """Get email statistics"""
        
        # Total emails
        total_result = await db.execute(
            select(func.count(EmailQueue.email_id)).where(
                EmailQueue.company_id == company_id
            )
        )
        total_emails = total_result.scalar()
        
        # Emails by status
        status_result = await db.execute(
            select(
                EmailQueue.status,
                func.count(EmailQueue.email_id)
            ).where(
                EmailQueue.company_id == company_id
            ).group_by(EmailQueue.status)
        )
        emails_by_status = {row[0]: row[1] for row in status_result.fetchall()}
        
        # Calculate rates
        sent_count = emails_by_status.get(EmailStatus.SENT, 0)
        opened_count = await db.execute(
            select(func.count(EmailQueue.email_id)).where(
                and_(
                    EmailQueue.company_id == company_id,
                    EmailQueue.opened_at.is_not(None)
                )
            )
        )
        opened_count = opened_count.scalar()
        
        clicked_count = await db.execute(
            select(func.count(EmailQueue.email_id)).where(
                and_(
                    EmailQueue.company_id == company_id,
                    EmailQueue.clicked_at.is_not(None)
                )
            )
        )
        clicked_count = clicked_count.scalar()
        
        bounced_count = emails_by_status.get(EmailStatus.BOUNCED, 0)
        
        return {
            "total_emails": total_emails,
            "queued_emails": emails_by_status.get(EmailStatus.QUEUED, 0),
            "sent_emails": sent_count,
            "failed_emails": emails_by_status.get(EmailStatus.FAILED, 0),
            "emails_by_status": emails_by_status,
            "open_rate": (opened_count / sent_count * 100) if sent_count > 0 else 0,
            "click_rate": (clicked_count / sent_count * 100) if sent_count > 0 else 0,
            "bounce_rate": (bounced_count / total_emails * 100) if total_emails > 0 else 0
        }

class SMSService(BaseNotificationService):
    """Service for SMS operations"""
    
    @staticmethod
    async def send_sms(
        db: AsyncSession,
        company_id: str,
        sms_data: SMSSendRequest
    ) -> SMSQueue:
        """Queue an SMS for sending"""
        
        sms = SMSQueue(
            sms_id=str(uuid.uuid4()),
            company_id=company_id,
            to_phone=sms_data.to_phone,
            message=sms_data.message,
            scheduled_at=sms_data.scheduled_at
        )
        
        db.add(sms)
        await db.commit()
        await db.refresh(sms)
        
        # Process immediately if not scheduled
        if not sms_data.scheduled_at:
            await SMSService._process_sms(db, sms)
        
        logger.info("SMS queued", 
                   sms_id=sms.sms_id,
                   to_phone=sms.to_phone)
        
        return sms
    
    @staticmethod
    async def get_sms_queue(
        db: AsyncSession,
        company_id: str,
        filters: SMSQueueSearchFilters
    ) -> Tuple[List[SMSQueue], int]:
        """Get SMS queue with filtering and pagination"""
        
        query = select(SMSQueue).where(
            SMSQueue.company_id == company_id
        )
        
        # Apply filters
        if filters.status:
            query = query.where(SMSQueue.status == filters.status)
        
        if filters.date_from:
            query = query.where(SMSQueue.created_at >= filters.date_from)
        
        if filters.date_to:
            query = query.where(SMSQueue.created_at <= filters.date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    SMSQueue.to_phone.ilike(search_term),
                    SMSQueue.message.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(SMSQueue, filters.sort_by, SMSQueue.created_at)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(SMSQueue.created_at))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        sms_messages = result.scalars().all()
        
        return sms_messages, total
    
    @staticmethod
    async def _process_sms(db: AsyncSession, sms: SMSQueue) -> None:
        """Process an SMS from the queue"""
        
        try:
            # Update status to processing
            sms.status = SMSStatus.PROCESSING
            sms.attempts += 1
            await db.commit()
            
            # TODO: Implement actual SMS sending
            # This would integrate with Twilio, AWS SNS, or other SMS service
            success = await SMSService._send_sms_via_provider(sms)
            
            if success:
                sms.status = SMSStatus.SENT
                sms.sent_at = datetime.utcnow()
                logger.info("SMS sent successfully", sms_id=sms.sms_id)
            else:
                sms.status = SMSStatus.FAILED
                sms.last_error = "SMS sending failed"
                logger.error("SMS sending failed", sms_id=sms.sms_id)
            
            await db.commit()
            
        except Exception as e:
            sms.status = SMSStatus.FAILED
            sms.last_error = str(e)
            await db.commit()
            
            logger.error("SMS processing failed", 
                        sms_id=sms.sms_id, error=str(e))
    
    @staticmethod
    async def _send_sms_via_provider(sms: SMSQueue) -> bool:
        """Send SMS via SMS provider"""
        # TODO: Implement actual SMS sending logic
        # This is a placeholder implementation
        return True

class WebhookService(BaseNotificationService):
    """Service for webhook operations"""
    
    @staticmethod
    async def create_webhook(
        db: AsyncSession,
        company_id: str,
        webhook_data: WebhookSubscriptionCreate
    ) -> WebhookSubscription:
        """Create a new webhook subscription"""
        
        # Generate secret key if not provided
        if not webhook_data.secret_key:
            webhook_data.secret_key = str(uuid.uuid4())
        
        webhook = WebhookSubscription(
            webhook_id=str(uuid.uuid4()),
            company_id=company_id,
            **webhook_data.dict()
        )
        
        db.add(webhook)
        await db.commit()
        await db.refresh(webhook)
        
        logger.info("Webhook subscription created", 
                   webhook_id=webhook.webhook_id,
                   url=webhook.webhook_url)
        
        return webhook
    
    @staticmethod
    async def get_webhooks(
        db: AsyncSession,
        company_id: str,
        is_active: Optional[bool] = None
    ) -> List[WebhookSubscription]:
        """Get webhook subscriptions"""
        
        query = select(WebhookSubscription).where(
            WebhookSubscription.company_id == company_id
        )
        
        if is_active is not None:
            query = query.where(WebhookSubscription.is_active == is_active)
        
        query = query.order_by(WebhookSubscription.created_at)
        
        result = await db.execute(query)
        webhooks = result.scalars().all()
        
        return webhooks
    
    @staticmethod
    async def update_webhook(
        db: AsyncSession,
        company_id: str,
        webhook_id: str,
        webhook_data: WebhookSubscriptionUpdate
    ) -> Optional[WebhookSubscription]:
        """Update a webhook subscription"""
        
        result = await db.execute(
            select(WebhookSubscription).where(
                and_(
                    WebhookSubscription.webhook_id == webhook_id,
                    WebhookSubscription.company_id == company_id
                )
            )
        )
        webhook = result.scalar_one_or_none()
        
        if not webhook:
            return None
        
        # Update fields
        for field, value in webhook_data.dict(exclude_unset=True).items():
            setattr(webhook, field, value)
        
        await db.commit()
        await db.refresh(webhook)
        
        logger.info("Webhook subscription updated", 
                   webhook_id=webhook_id)
        
        return webhook
    
    @staticmethod
    async def delete_webhook(
        db: AsyncSession,
        company_id: str,
        webhook_id: str
    ) -> bool:
        """Delete a webhook subscription"""
        
        result = await db.execute(
            delete(WebhookSubscription).where(
                and_(
                    WebhookSubscription.webhook_id == webhook_id,
                    WebhookSubscription.company_id == company_id
                )
            )
        )
        
        await db.commit()
        success = result.rowcount > 0
        
        if success:
            logger.info("Webhook subscription deleted", 
                       webhook_id=webhook_id)
        
        return success
    
    @staticmethod
    async def test_webhook(
        db: AsyncSession,
        company_id: str,
        webhook_id: str,
        test_data: WebhookTestRequest
    ) -> bool:
        """Test a webhook subscription"""
        
        result = await db.execute(
            select(WebhookSubscription).where(
                and_(
                    WebhookSubscription.webhook_id == webhook_id,
                    WebhookSubscription.company_id == company_id
                )
            )
        )
        webhook = result.scalar_one_or_none()
        
        if not webhook:
            return False
        
        # Create test payload
        payload = test_data.test_payload or {
            "event": test_data.event_type,
            "data": {"test": True},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Send test webhook
        success = await WebhookService._send_webhook(webhook, test_data.event_type, payload)
        
        logger.info("Webhook test sent", 
                   webhook_id=webhook_id,
                   success=success)
        
        return success
    
    @staticmethod
    async def send_webhook_event(
        db: AsyncSession,
        company_id: str,
        event_type: str,
        payload: Dict[str, Any]
    ) -> None:
        """Send webhook event to all subscribed webhooks"""
        
        result = await db.execute(
            select(WebhookSubscription).where(
                and_(
                    WebhookSubscription.company_id == company_id,
                    WebhookSubscription.is_active == True
                )
            )
        )
        webhooks = result.scalars().all()
        
        for webhook in webhooks:
            if event_type in webhook.events:
                await WebhookService._send_webhook(webhook, event_type, payload)
    
    @staticmethod
    async def _send_webhook(
        webhook: WebhookSubscription,
        event_type: str,
        payload: Dict[str, Any]
    ) -> bool:
        """Send webhook to a specific URL"""
        
        try:
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "X-Webhook-Event": event_type,
                "X-Webhook-Timestamp": str(int(datetime.utcnow().timestamp())),
                "User-Agent": "QuickBooks-Clone-Webhook/1.0"
            }
            
            # Add custom headers
            if webhook.headers:
                headers.update(webhook.headers)
            
            # Create signature
            signature = WebhookService._create_signature(
                webhook.secret_key, 
                json.dumps(payload, sort_keys=True)
            )
            headers["X-Webhook-Signature"] = signature
            
            # Send webhook
            async with httpx.AsyncClient(timeout=webhook.timeout_seconds) as client:
                response = await client.post(
                    webhook.webhook_url,
                    json=payload,
                    headers=headers
                )
                
                success = response.status_code == 200
                
                if success:
                    webhook.failure_count = 0
                    webhook.last_ping = datetime.utcnow()
                else:
                    webhook.failure_count += 1
                    
                    # Disable webhook if too many failures
                    if webhook.failure_count >= webhook.max_failures:
                        webhook.is_active = False
                        logger.warning("Webhook disabled due to failures", 
                                     webhook_id=webhook.webhook_id)
                
                logger.info("Webhook sent", 
                           webhook_id=webhook.webhook_id,
                           status=response.status_code,
                           success=success)
                
                return success
                
        except Exception as e:
            webhook.failure_count += 1
            
            # Disable webhook if too many failures
            if webhook.failure_count >= webhook.max_failures:
                webhook.is_active = False
                logger.warning("Webhook disabled due to failures", 
                             webhook_id=webhook.webhook_id)
            
            logger.error("Webhook sending failed", 
                        webhook_id=webhook.webhook_id,
                        error=str(e))
            
            return False
    
    @staticmethod
    def _create_signature(secret: str, payload: str) -> str:
        """Create HMAC signature for webhook"""
        return hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

class NotificationPreferenceService(BaseNotificationService):
    """Service for notification preference operations"""
    
    @staticmethod
    async def get_or_create_preference(
        db: AsyncSession,
        user_id: str,
        company_id: str,
        notification_type: NotificationType
    ) -> NotificationPreference:
        """Get or create notification preference"""
        
        result = await db.execute(
            select(NotificationPreference).where(
                and_(
                    NotificationPreference.user_id == user_id,
                    NotificationPreference.company_id == company_id,
                    NotificationPreference.notification_type == notification_type
                )
            )
        )
        preference = result.scalar_one_or_none()
        
        if not preference:
            preference = NotificationPreference(
                preference_id=str(uuid.uuid4()),
                user_id=user_id,
                company_id=company_id,
                notification_type=notification_type
            )
            db.add(preference)
            await db.commit()
            await db.refresh(preference)
        
        return preference
    
    @staticmethod
    async def update_preference(
        db: AsyncSession,
        user_id: str,
        company_id: str,
        notification_type: NotificationType,
        preference_data: NotificationPreferenceUpdate
    ) -> NotificationPreference:
        """Update notification preference"""
        
        preference = await NotificationPreferenceService.get_or_create_preference(
            db, user_id, company_id, notification_type
        )
        
        # Update fields
        for field, value in preference_data.dict(exclude_unset=True).items():
            setattr(preference, field, value)
        
        await db.commit()
        await db.refresh(preference)
        
        logger.info("Notification preference updated", 
                   user_id=user_id,
                   notification_type=notification_type)
        
        return preference
    
    @staticmethod
    async def get_user_preferences(
        db: AsyncSession,
        user_id: str,
        company_id: str
    ) -> List[NotificationPreference]:
        """Get all notification preferences for a user"""
        
        result = await db.execute(
            select(NotificationPreference).where(
                and_(
                    NotificationPreference.user_id == user_id,
                    NotificationPreference.company_id == company_id
                )
            ).order_by(NotificationPreference.notification_type)
        )
        preferences = result.scalars().all()
        
        return preferences