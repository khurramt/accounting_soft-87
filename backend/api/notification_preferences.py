from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.notification_service import NotificationPreferenceService
from schemas.notification_schemas import (
    NotificationPreferenceCreate, NotificationPreferenceUpdate,
    NotificationPreferenceResponse, NotificationType
)
from typing import List
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/notification-preferences", tags=["Notification Preferences"])

@router.get("/", response_model=List[NotificationPreferenceResponse])
async def get_notification_preferences(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notification preferences for current user"""
    try:
        # Verify user has access to company
        if not await NotificationPreferenceService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        preferences = await NotificationPreferenceService.get_user_preferences(
            db, str(user.user_id), company_id
        )
        
        return [NotificationPreferenceResponse.from_orm(pref) for pref in preferences]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get notification preferences", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification preferences"
        )

@router.put("/{notification_type}", response_model=NotificationPreferenceResponse)
async def update_notification_preference(
    company_id: str,
    notification_type: NotificationType,
    preference_data: NotificationPreferenceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update notification preference for a specific type"""
    try:
        # Verify user has access to company
        if not await NotificationPreferenceService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        preference = await NotificationPreferenceService.update_preference(
            db, str(user.user_id), company_id, notification_type, preference_data
        )
        
        return NotificationPreferenceResponse.from_orm(preference)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update notification preference", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preference"
        )

@router.get("/{notification_type}", response_model=NotificationPreferenceResponse)
async def get_notification_preference(
    company_id: str,
    notification_type: NotificationType,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notification preference for a specific type"""
    try:
        # Verify user has access to company
        if not await NotificationPreferenceService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        preference = await NotificationPreferenceService.get_or_create_preference(
            db, str(user.user_id), company_id, notification_type
        )
        
        return NotificationPreferenceResponse.from_orm(preference)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get notification preference", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification preference"
        )