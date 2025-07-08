from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.notification_service import EmailTemplateService, EmailService
from schemas.notification_schemas import (
    EmailTemplateCreate, EmailTemplateUpdate, EmailTemplateResponse,
    EmailSendRequest, EmailTemplatePreview, EmailQueueResponse,
    EmailQueueSearchFilters, PaginatedResponse, MessageResponse,
    EmailStats
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/emails", tags=["Email Management"])

# Email Templates
@router.get("/templates", response_model=List[EmailTemplateResponse])
async def get_email_templates(
    company_id: str,
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email templates"""
    try:
        # Verify user has access to company
        if not await EmailTemplateService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        templates = await EmailTemplateService.get_templates(
            db, category, is_active
        )
        
        return [EmailTemplateResponse.from_orm(template) for template in templates]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get email templates", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get email templates"
        )

@router.post("/templates", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_email_template(
    company_id: str,
    template_data: EmailTemplateCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new email template"""
    try:
        # Verify user has access to company
        if not await EmailTemplateService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        template = await EmailTemplateService.create_template(
            db, template_data
        )
        return EmailTemplateResponse.from_orm(template)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create email template", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create email template"
        )

@router.get("/templates/{template_id}", response_model=EmailTemplateResponse)
async def get_email_template(
    company_id: str,
    template_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email template by ID"""
    try:
        # Verify user has access to company
        if not await EmailTemplateService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        template = await EmailTemplateService.get_template_by_id(
            db, template_id
        )
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found"
            )
        
        return EmailTemplateResponse.from_orm(template)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get email template", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get email template"
        )

@router.put("/templates/{template_id}", response_model=EmailTemplateResponse)
async def update_email_template(
    company_id: str,
    template_id: str,
    template_data: EmailTemplateUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update email template"""
    try:
        # Verify user has access to company
        if not await EmailTemplateService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        updated_template = await EmailTemplateService.update_template(
            db, template_id, template_data
        )
        
        if not updated_template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found"
            )
        
        return EmailTemplateResponse.from_orm(updated_template)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update email template", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update email template"
        )

@router.delete("/templates/{template_id}", response_model=MessageResponse)
async def delete_email_template(
    company_id: str,
    template_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete email template"""
    try:
        # Verify user has access to company
        if not await EmailTemplateService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        deleted = await EmailTemplateService.delete_template(
            db, template_id
        )
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found"
            )
        
        return MessageResponse(message="Email template deleted successfully")
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete email template", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete email template"
        )

@router.post("/templates/{template_id}/preview", response_model=dict)
async def preview_email_template(
    company_id: str,
    template_id: str,
    preview_data: EmailTemplatePreview,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Preview email template with variables"""
    try:
        # Verify user has access to company
        if not await EmailTemplateService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        subject, body = await EmailTemplateService.render_template(
            db, template_id, preview_data.variables or {}
        )
        
        return {
            "subject": subject,
            "body": body
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to preview email template", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to preview email template"
        )

# Email Sending
@router.post("/send", response_model=EmailQueueResponse, status_code=status.HTTP_201_CREATED)
async def send_email(
    company_id: str,
    email_data: EmailSendRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send an email"""
    try:
        # Verify user has access to company
        if not await EmailService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        email = await EmailService.send_email(
            db, company_id, email_data
        )
        
        # Manually construct response to avoid MissingGreenlet error
        return EmailQueueResponse(
            email_id=email.email_id,
            company_id=email.company_id,
            template_id=email.template_id,
            to_email=email.to_email,
            cc_email=email.cc_email,
            bcc_email=email.bcc_email,
            subject=email.subject,
            body=email.body,
            attachments=email.attachments,
            priority=email.priority,
            status=email.status,
            attempts=email.attempts,
            max_attempts=email.max_attempts,
            last_error=email.last_error,
            scheduled_at=email.scheduled_at,
            sent_at=email.sent_at,
            opened_at=email.opened_at,
            clicked_at=email.clicked_at,
            bounced_at=email.bounced_at,
            delivered_at=email.delivered_at,
            created_at=email.created_at,
            updated_at=getattr(email, 'updated_at', None)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to send email", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email"
        )

# Email Queue
@router.get("/queue", response_model=PaginatedResponse)
async def get_email_queue(
    company_id: str,
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email queue with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await EmailService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = EmailQueueSearchFilters(
            search=search,
            status=status,
            priority=priority,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        emails, total = await EmailService.get_email_queue(
            db, company_id, filters
        )
        
        return PaginatedResponse(
            items=[EmailQueueResponse.from_orm(email) for email in emails],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get email queue", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get email queue"
        )

@router.get("/stats", response_model=EmailStats)
async def get_email_stats(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email statistics"""
    try:
        # Verify user has access to company
        if not await EmailService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        stats = await EmailService.get_email_stats(db, company_id)
        
        return EmailStats(**stats)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get email stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get email stats"
        )