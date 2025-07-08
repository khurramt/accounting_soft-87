from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.inventory_service import InventoryReceiptService
from schemas.inventory_schemas import (
    InventoryReceiptCreate, InventoryReceiptUpdate, InventoryReceiptResponse,
    ReceiptSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/inventory-receipts", tags=["Inventory Receipts"])

@router.post("/", response_model=InventoryReceiptResponse, status_code=status.HTTP_201_CREATED)
async def create_receipt(
    company_id: str,
    receipt_data: InventoryReceiptCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new inventory receipt"""
    try:
        # Verify user has access to company
        if not await InventoryReceiptService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        receipt = await InventoryReceiptService.create_receipt(
            db, company_id, receipt_data, str(user.user_id)
        )
        return InventoryReceiptResponse.from_orm(receipt)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create inventory receipt", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create inventory receipt"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_receipts(
    company_id: str,
    search: Optional[str] = Query(None),
    vendor_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("receipt_date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get inventory receipts with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await InventoryReceiptService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = ReceiptSearchFilters(
            search=search,
            vendor_id=vendor_id,
            status=status,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        # Implementation needed in service
        # For now, return empty result
        return PaginatedResponse(
            items=[],
            total=0,
            page=page,
            page_size=page_size,
            total_pages=0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get inventory receipts", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory receipts"
        )

@router.get("/{receipt_id}", response_model=InventoryReceiptResponse)
async def get_receipt(
    company_id: str,
    receipt_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get receipt by ID"""
    try:
        # Verify user has access to company
        if not await InventoryReceiptService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Implementation needed in service
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receipt not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get receipt", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get receipt"
        )

@router.put("/{receipt_id}", response_model=InventoryReceiptResponse)
async def update_receipt(
    company_id: str,
    receipt_id: str,
    receipt_data: InventoryReceiptUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update receipt"""
    try:
        # Verify user has access to company
        if not await InventoryReceiptService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Implementation needed in service
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receipt not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update receipt", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update receipt"
        )