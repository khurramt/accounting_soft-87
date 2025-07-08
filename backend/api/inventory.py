from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.inventory_service import InventoryService
from schemas.inventory_schemas import (
    InventorySearchFilters, PaginatedResponse, MessageResponse,
    InventorySummary, ItemInventorySummary, TransactionSearchFilters,
    InventoryTransactionResponse, InventoryValuationCreate, InventoryValuationResponse
)
from typing import List, Optional, Dict, Any
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/inventory", tags=["Inventory"])

@router.get("/", response_model=Dict[str, Any])
async def get_inventory_overview(
    company_id: str,
    location_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get inventory overview with summary statistics"""
    try:
        # Verify user has access to company
        if not await InventoryService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        summary = await InventoryService.get_inventory_summary(db, company_id, location_id)
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get inventory overview", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory overview"
        )

@router.get("/{item_id}", response_model=Dict[str, Any])
async def get_item_inventory(
    company_id: str,
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get inventory information for a specific item"""
    try:
        # Verify user has access to company
        if not await InventoryService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        inventory_info = await InventoryService.get_inventory_by_item(db, company_id, item_id)
        return inventory_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get item inventory", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get item inventory"
        )

@router.get("/{item_id}/transactions", response_model=PaginatedResponse)
async def get_item_transactions(
    company_id: str,
    item_id: str,
    location_id: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("transaction_date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get transaction history for an item"""
    try:
        # Verify user has access to company
        if not await InventoryService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = TransactionSearchFilters(
            location_id=location_id,
            transaction_type=transaction_type,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        transactions, total = await InventoryService.get_item_transactions(
            db, company_id, item_id, filters
        )
        
        return PaginatedResponse(
            items=[InventoryTransactionResponse.from_orm(t) for t in transactions],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get item transactions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get item transactions"
        )

@router.get("/low-stock", response_model=List[Dict[str, Any]])
async def get_low_stock_items(
    company_id: str,
    location_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get items with low stock levels"""
    try:
        # Verify user has access to company
        if not await InventoryService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # This would be implemented in the service
        # For now, return empty list
        return []
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get low stock items", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get low stock items"
        )

@router.post("/valuation", response_model=InventoryValuationResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_valuation(
    company_id: str,
    valuation_data: InventoryValuationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an inventory valuation"""
    try:
        # Verify user has access to company
        if not await InventoryService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        valuation = await InventoryService.calculate_inventory_valuation(
            db, company_id, valuation_data, str(user.user_id)
        )
        return InventoryValuationResponse.from_orm(valuation)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create inventory valuation", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create inventory valuation"
        )