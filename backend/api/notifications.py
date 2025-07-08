from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.notification_service import NotificationService
from schemas.notification_schemas import (
    NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationSearchFilters, PaginatedResponse, MessageResponse,
    BulkNotificationCreate, BulkNotificationResponse, NotificationMarkRead,
    NotificationStats
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/notifications", tags=["Notifications"])

@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    company_id: str,
    notification_data: NotificationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new notification"""
    try:
        # Verify user has access to company
        if not await NotificationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        notification = await NotificationService.create_notification(
            db, company_id, notification_data
        )
        return NotificationResponse.from_orm(notification)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create notification", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification"
        )

@router.post("/bulk", response_model=BulkNotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_bulk_notifications(
    company_id: str,
    bulk_data: BulkNotificationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create notifications for multiple users"""
    try:
        # Verify user has access to company
        if not await NotificationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        created_count, failed_count, errors = await NotificationService.create_bulk_notifications(
            db, company_id, bulk_data
        )
        
        return BulkNotificationResponse(
            created_count=created_count,
            failed_count=failed_count,
            errors=errors
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create bulk notifications", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create bulk notifications"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_notifications(
    company_id: str,
    search: Optional[str] = Query(None),
    notification_type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    read: Optional[bool] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notifications for current user with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await NotificationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = NotificationSearchFilters(
            search=search,
            notification_type=notification_type,
            priority=priority,
            read=read,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        notifications, total = await NotificationService.get_notifications(
            db, company_id, str(user.user_id), filters
        )
        
        return PaginatedResponse(
            items=[NotificationResponse.from_orm(n) for n in notifications],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get notifications", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notifications"
        )

@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notification statistics for current user"""
    try:
        # Verify user has access to company
        if not await NotificationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        stats = await NotificationService.get_notification_stats(
            db, company_id, str(user.user_id)
        )
        
        return NotificationStats(
            total_notifications=stats["total_notifications"],
            unread_notifications=stats["unread_notifications"],
            notifications_by_type=stats["notifications_by_type"],
            notifications_by_priority=stats["notifications_by_priority"],
            recent_notifications=[NotificationResponse.from_orm(n) for n in stats["recent_notifications"]]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get notification stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification stats"
        )

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    company_id: str,
    notification_id: str,
    mark_read: NotificationMarkRead,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a notification as read"""
    try:
        # Verify user has access to company
        if not await NotificationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        notification = await NotificationService.mark_notification_read(
            db, company_id, str(user.user_id), notification_id
        )
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        return NotificationResponse.from_orm(notification)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to mark notification as read", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )

@router.post("/mark-all-read", response_model=MessageResponse)
async def mark_all_notifications_read(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read for current user"""
    try:
        # Verify user has access to company
        if not await NotificationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        count = await NotificationService.mark_all_notifications_read(
            db, company_id, str(user.user_id)
        )
        
        return MessageResponse(message=f"Marked {count} notifications as read")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to mark all notifications as read", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read"
        )

@router.delete("/{notification_id}", response_model=MessageResponse)
async def delete_notification(
    company_id: str,
    notification_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a notification"""
    try:
        # Verify user has access to company
        if not await NotificationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        deleted = await NotificationService.delete_notification(
            db, company_id, str(user.user_id), notification_id
        )
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        return MessageResponse(message="Notification deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete notification", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )