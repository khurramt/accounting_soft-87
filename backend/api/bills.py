from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.transaction_service import TransactionService
from schemas.transaction_schemas import (
    BillCreate, BillUpdate, BillResponse,
    TransactionSearchFilters, MessageResponse, PaginatedResponse
)
from models.transactions import TransactionType
from typing import List, Optional
import structlog
from datetime import date

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/bills", tags=["Bills"])

@router.post("/", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(
    company_id: str,
    bill_data: BillCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new bill"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        bill = await TransactionService.create_bill(
            db, company_id, str(user.user_id), bill_data
        )
        return BillResponse.from_orm(bill)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to create bill", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create bill"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_bills(
    company_id: str,
    search: Optional[str] = Query(None),
    vendor_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    is_posted: Optional[bool] = Query(None),
    sort_by: str = Query("transaction_date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bills with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = TransactionSearchFilters(
            search=search,
            transaction_type=TransactionType.BILL,
            status=status,
            vendor_id=vendor_id,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            is_posted=is_posted,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        bills, total = await TransactionService.get_transactions(db, company_id, filters)
        
        return PaginatedResponse(
            items=[BillResponse.from_orm(bill) for bill in bills],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except Exception as e:
        logger.error("Failed to get bills", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get bills"
        )

@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(
    company_id: str,
    bill_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bill by ID"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        bill = await TransactionService.get_transaction_by_id(db, company_id, bill_id)
        if not bill or bill.transaction_type != TransactionType.BILL:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bill not found"
            )
        
        return BillResponse.from_orm(bill)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get bill", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get bill"
        )

@router.put("/{bill_id}", response_model=BillResponse)
async def update_bill(
    company_id: str,
    bill_id: str,
    bill_data: BillUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update bill"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        bill = await TransactionService.get_transaction_by_id(db, company_id, bill_id)
        if not bill or bill.transaction_type != TransactionType.BILL:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bill not found"
            )
        
        updated_bill = await TransactionService.update_transaction(
            db, bill, bill_data, str(user.user_id)
        )
        return BillResponse.from_orm(updated_bill)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update bill", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update bill"
        )

@router.delete("/{bill_id}", response_model=MessageResponse)
async def delete_bill(
    company_id: str,
    bill_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete bill"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        bill = await TransactionService.get_transaction_by_id(db, company_id, bill_id)
        if not bill or bill.transaction_type != TransactionType.BILL:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bill not found"
            )
        
        await TransactionService.delete_transaction(db, bill)
        return MessageResponse(message="Bill deleted successfully")
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete bill", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete bill"
        )