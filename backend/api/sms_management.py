from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.notification_service import SMSService
from schemas.notification_schemas import (
    SMSSendRequest, SMSQueueResponse, SMSQueueSearchFilters,
    PaginatedResponse, MessageResponse, SMSStats
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/sms", tags=["SMS Management"])

@router.post("/send", response_model=SMSQueueResponse, status_code=status.HTTP_201_CREATED)
async def send_sms(
    company_id: str,
    sms_data: SMSSendRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send an SMS"""
    try:
        # Verify user has access to company
        if not await SMSService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        sms = await SMSService.send_sms(
            db, company_id, sms_data
        )
        
        # Manually construct response to avoid MissingGreenlet error
        return SMSQueueResponse(
            sms_id=sms.sms_id,
            company_id=sms.company_id,
            to_phone=sms.to_phone,
            message=sms.message,
            status=sms.status,
            attempts=sms.attempts,
            max_attempts=sms.max_attempts,
            last_error=sms.last_error,
            scheduled_at=sms.scheduled_at,
            sent_at=sms.sent_at,
            delivered_at=sms.delivered_at,
            provider_message_id=sms.provider_message_id,
            delivery_status=sms.delivery_status,
            created_at=sms.created_at,
            updated_at=getattr(sms, 'updated_at', None)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to send SMS", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send SMS"
        )

@router.get("/queue", response_model=PaginatedResponse)
async def get_sms_queue(
    company_id: str,
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get SMS queue with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await SMSService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = SMSQueueSearchFilters(
            search=search,
            status=status,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        sms_messages, total = await SMSService.get_sms_queue(
            db, company_id, filters
        )
        
        return PaginatedResponse(
            items=[SMSQueueResponse.from_orm(sms) for sms in sms_messages],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get SMS queue", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get SMS queue"
        )

@router.get("/stats", response_model=SMSStats)
async def get_sms_stats(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get SMS statistics"""
    try:
        # Verify user has access to company
        if not await SMSService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Get SMS statistics
        from sqlalchemy import select, func, and_
        from models.notification import SMSQueue, SMSStatus
        
        # Total SMS
        total_result = await db.execute(
            select(func.count(SMSQueue.sms_id)).where(
                SMSQueue.company_id == company_id
            )
        )
        total_sms = total_result.scalar()
        
        # SMS by status
        status_result = await db.execute(
            select(
                SMSQueue.status,
                func.count(SMSQueue.sms_id)
            ).where(
                SMSQueue.company_id == company_id
            ).group_by(SMSQueue.status)
        )
        sms_by_status = {row[0]: row[1] for row in status_result.fetchall()}
        
        # Calculate delivery rate
        sent_count = sms_by_status.get(SMSStatus.SENT, 0)
        delivered_count = await db.execute(
            select(func.count(SMSQueue.sms_id)).where(
                and_(
                    SMSQueue.company_id == company_id,
                    SMSQueue.delivered_at.is_not(None)
                )
            )
        )
        delivered_count = delivered_count.scalar()
        
        stats = SMSStats(
            total_sms=total_sms,
            queued_sms=sms_by_status.get(SMSStatus.QUEUED, 0),
            sent_sms=sent_count,
            failed_sms=sms_by_status.get(SMSStatus.FAILED, 0),
            sms_by_status=sms_by_status,
            delivery_rate=(delivered_count / sent_count * 100) if sent_count > 0 else 0
        )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get SMS stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get SMS stats"
        )