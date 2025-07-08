from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.inventory_service import InventoryAdjustmentService
from schemas.inventory_schemas import (
    InventoryAdjustmentCreate, InventoryAdjustmentUpdate, InventoryAdjustmentResponse,
    AdjustmentSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/inventory-adjustments", tags=["Inventory Adjustments"])

@router.post("/", response_model=InventoryAdjustmentResponse, status_code=status.HTTP_201_CREATED)
async def create_adjustment(
    company_id: str,
    adjustment_data: InventoryAdjustmentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new inventory adjustment"""
    try:
        # Verify user has access to company
        if not await InventoryAdjustmentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        adjustment = await InventoryAdjustmentService.create_adjustment(
            db, company_id, adjustment_data, str(user.user_id)
        )
        return InventoryAdjustmentResponse.from_orm(adjustment)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create inventory adjustment", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create inventory adjustment"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_adjustments(
    company_id: str,
    search: Optional[str] = Query(None),
    item_id: Optional[str] = Query(None),
    adjustment_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("adjustment_date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get inventory adjustments with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await InventoryAdjustmentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = AdjustmentSearchFilters(
            search=search,
            item_id=item_id,
            adjustment_type=adjustment_type,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        adjustments, total = await InventoryAdjustmentService.get_adjustments(
            db, company_id, filters
        )
        
        return PaginatedResponse(
            items=[InventoryAdjustmentResponse.from_orm(adj) for adj in adjustments],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get inventory adjustments", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory adjustments"
        )

@router.get("/{adjustment_id}", response_model=InventoryAdjustmentResponse)
async def get_adjustment(
    company_id: str,
    adjustment_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get adjustment by ID"""
    try:
        # Verify user has access to company
        if not await InventoryAdjustmentService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Get adjustment by ID (implementation needed in service)
        # For now, return a placeholder
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adjustment not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get adjustment", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get adjustment"
        )