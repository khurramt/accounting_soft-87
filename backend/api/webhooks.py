from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.notification_service import WebhookService
from schemas.notification_schemas import (
    WebhookSubscriptionCreate, WebhookSubscriptionUpdate, WebhookSubscriptionResponse,
    WebhookTestRequest, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/webhooks", tags=["Webhooks"])

@router.post("/", response_model=WebhookSubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_webhook(
    company_id: str,
    webhook_data: WebhookSubscriptionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new webhook subscription"""
    try:
        # Verify user has access to company
        if not await WebhookService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        webhook = await WebhookService.create_webhook(
            db, company_id, webhook_data
        )
        return WebhookSubscriptionResponse.from_orm(webhook)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create webhook", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create webhook"
        )

@router.get("/", response_model=List[WebhookSubscriptionResponse])
async def get_webhooks(
    company_id: str,
    is_active: Optional[bool] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get webhook subscriptions"""
    try:
        # Verify user has access to company
        if not await WebhookService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        webhooks = await WebhookService.get_webhooks(
            db, company_id, is_active
        )
        
        return [WebhookSubscriptionResponse.from_orm(webhook) for webhook in webhooks]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get webhooks", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get webhooks"
        )

@router.put("/{webhook_id}", response_model=WebhookSubscriptionResponse)
async def update_webhook(
    company_id: str,
    webhook_id: str,
    webhook_data: WebhookSubscriptionUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update webhook subscription"""
    try:
        # Verify user has access to company
        if not await WebhookService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        updated_webhook = await WebhookService.update_webhook(
            db, company_id, webhook_id, webhook_data
        )
        
        if not updated_webhook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Webhook not found"
            )
        
        return WebhookSubscriptionResponse.from_orm(updated_webhook)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update webhook", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update webhook"
        )

@router.delete("/{webhook_id}", response_model=MessageResponse)
async def delete_webhook(
    company_id: str,
    webhook_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete webhook subscription"""
    try:
        # Verify user has access to company
        if not await WebhookService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        deleted = await WebhookService.delete_webhook(
            db, company_id, webhook_id
        )
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Webhook not found"
            )
        
        return MessageResponse(message="Webhook deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete webhook", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete webhook"
        )

@router.post("/{webhook_id}/test", response_model=MessageResponse)
async def test_webhook(
    company_id: str,
    webhook_id: str,
    test_data: WebhookTestRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Test webhook subscription"""
    try:
        # Verify user has access to company
        if not await WebhookService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        success = await WebhookService.test_webhook(
            db, company_id, webhook_id, test_data
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Webhook not found"
            )
        
        return MessageResponse(message="Webhook test sent successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to test webhook", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to test webhook"
        )