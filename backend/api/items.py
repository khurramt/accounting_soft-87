from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.list_management_service import ItemService
from schemas.list_management_schemas import (
    ItemCreate, ItemUpdate, ItemResponse,
    ItemSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/items", tags=["Items"])

@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    company_id: str,
    item_data: ItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new item"""
    try:
        # Verify user has access to company
        if not await ItemService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        item = await ItemService.create_item(db, company_id, item_data)
        return ItemResponse.from_orm(item)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create item", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create item"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_items(
    company_id: str,
    search: Optional[str] = Query(None),
    item_type: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("item_name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get items with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await ItemService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = ItemSearchFilters(
            search=search,
            item_type=item_type,
            low_stock=low_stock,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        items, total = await ItemService.get_items(db, company_id, filters)
        
        return PaginatedResponse(
            items=[ItemResponse.from_orm(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get items", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get items"
        )

@router.get("/low-stock", response_model=List[ItemResponse])
async def get_low_stock_items(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get items with low stock"""
    try:
        # Verify user has access to company
        if not await ItemService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        items = await ItemService.get_low_stock_items(db, company_id)
        return [ItemResponse.from_orm(item) for item in items]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get low stock items", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get low stock items"
        )

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    company_id: str,
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get item by ID"""
    try:
        # Verify user has access to company
        if not await ItemService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        item = await ItemService.get_item_by_id(db, company_id, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        return ItemResponse.from_orm(item)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get item", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get item"
        )

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    company_id: str,
    item_id: str,
    item_data: ItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update item"""
    try:
        # Verify user has access to company
        if not await ItemService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        item = await ItemService.get_item_by_id(db, company_id, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        updated_item = await ItemService.update_item(db, item, item_data)
        return ItemResponse.from_orm(updated_item)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update item", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update item"
        )

@router.delete("/{item_id}", response_model=MessageResponse)
async def delete_item(
    company_id: str,
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete item (soft delete)"""
    try:
        # Verify user has access to company
        if not await ItemService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        item = await ItemService.get_item_by_id(db, company_id, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        await ItemService.delete_item(db, item)
        return MessageResponse(message="Item deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete item", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete item"
        )

@router.get("/low-stock", response_model=List[ItemResponse])
async def get_low_stock_items(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get items with low stock"""
    try:
        # Verify user has access to company
        if not await ItemService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        items = await ItemService.get_low_stock_items(db, company_id)
        return [ItemResponse.from_orm(item) for item in items]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get low stock items", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get low stock items"
        )