from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.inventory_service import InventoryLocationService
from schemas.inventory_schemas import (
    InventoryLocationCreate, InventoryLocationUpdate, InventoryLocationResponse,
    ItemLocationCreate, ItemLocationUpdate, ItemLocationResponse,
    InventorySearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/inventory-locations", tags=["Inventory Locations"])

@router.post("/", response_model=InventoryLocationResponse, status_code=status.HTTP_201_CREATED)
async def create_location(
    company_id: str,
    location_data: InventoryLocationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new inventory location"""
    try:
        # Verify user has access to company
        if not await InventoryLocationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        location = await InventoryLocationService.create_location(
            db, company_id, location_data
        )
        return InventoryLocationResponse.from_orm(location)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create inventory location", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create inventory location"
        )

@router.get("/", response_model=List[InventoryLocationResponse])
async def get_locations(
    company_id: str,
    is_active: Optional[bool] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get inventory locations"""
    try:
        # Verify user has access to company
        if not await InventoryLocationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        locations = await InventoryLocationService.get_locations(
            db, company_id, is_active
        )
        
        return [InventoryLocationResponse.from_orm(location) for location in locations]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get inventory locations", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory locations"
        )

@router.put("/{location_id}", response_model=InventoryLocationResponse)
async def update_location(
    company_id: str,
    location_id: str,
    location_data: InventoryLocationUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update inventory location"""
    try:
        # Verify user has access to company
        if not await InventoryLocationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        updated_location = await InventoryLocationService.update_location(
            db, company_id, location_id, location_data
        )
        
        if not updated_location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        
        return InventoryLocationResponse.from_orm(updated_location)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update location", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update location"
        )

@router.get("/{location_id}/items", response_model=PaginatedResponse)
async def get_location_items(
    company_id: str,
    location_id: str,
    search: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    negative_stock: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("item_name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get items in a specific location"""
    try:
        # Verify user has access to company
        if not await InventoryLocationService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = InventorySearchFilters(
            search=search,
            low_stock=low_stock,
            negative_stock=negative_stock,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        item_locations, total = await InventoryLocationService.get_location_items(
            db, company_id, location_id, filters
        )
        
        return PaginatedResponse(
            items=[ItemLocationResponse.from_orm(il) for il in item_locations],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get location items", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get location items"
        )