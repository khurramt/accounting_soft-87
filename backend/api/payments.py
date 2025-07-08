from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.transaction_service import PaymentService
from schemas.transaction_schemas import (
    PaymentCreate, PaymentUpdate, PaymentResponse,
    MessageResponse, PaginatedResponse
)
from typing import List, Optional
import structlog
from datetime import date

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/payments", tags=["Payments"])

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    company_id: str,
    payment_data: PaymentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new payment"""
    try:
        # Verify user has access to company
        if not await PaymentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        payment = await PaymentService.create_payment(
            db, company_id, str(user.user_id), payment_data
        )
        return PaymentResponse.from_orm(payment)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to create payment", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment"
        )

@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    company_id: str,
    customer_id: Optional[str] = Query(None),
    vendor_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    payment_type: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get payments with filtering"""
    try:
        # Verify user has access to company
        if not await PaymentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # TODO: Implement payment filtering in service
        # For now, return placeholder
        return []
        
    except Exception as e:
        logger.error("Failed to get payments", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payments"
        )

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    company_id: str,
    payment_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get payment by ID"""
    try:
        # Verify user has access to company
        if not await PaymentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # TODO: Implement get payment by ID in service
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get payment", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payment"
        )

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    company_id: str,
    payment_id: str,
    payment_data: PaymentUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update payment"""
    try:
        # Verify user has access to company
        if not await PaymentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # TODO: Implement payment update in service
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update payment", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update payment"
        )

@router.delete("/{payment_id}", response_model=MessageResponse)
async def delete_payment(
    company_id: str,
    payment_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete payment"""
    try:
        # Verify user has access to company
        if not await PaymentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # TODO: Implement payment deletion in service
        return MessageResponse(message="Payment deleted successfully")
        
    except Exception as e:
        logger.error("Failed to delete payment", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete payment"
        )