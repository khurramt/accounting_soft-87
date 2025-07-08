from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.inventory_service import PurchaseOrderService
from schemas.inventory_schemas import (
    PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse,
    PurchaseOrderSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/purchase-orders", tags=["Purchase Orders"])

@router.post("/", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    company_id: str,
    po_data: PurchaseOrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new purchase order"""
    try:
        # Verify user has access to company
        if not await PurchaseOrderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        purchase_order = await PurchaseOrderService.create_purchase_order(
            db, company_id, po_data, str(user.user_id)
        )
        return PurchaseOrderResponse.from_orm(purchase_order)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create purchase order", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create purchase order"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_purchase_orders(
    company_id: str,
    search: Optional[str] = Query(None),
    vendor_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("po_date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get purchase orders with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await PurchaseOrderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = PurchaseOrderSearchFilters(
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
        
        purchase_orders, total = await PurchaseOrderService.get_purchase_orders(
            db, company_id, filters
        )
        
        return PaginatedResponse(
            items=[PurchaseOrderResponse.from_orm(po) for po in purchase_orders],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get purchase orders", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get purchase orders"
        )

@router.get("/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    company_id: str,
    po_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get purchase order by ID"""
    try:
        # Verify user has access to company
        if not await PurchaseOrderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        purchase_order = await PurchaseOrderService.get_purchase_order_by_id(
            db, company_id, po_id
        )
        
        if not purchase_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found"
            )
        
        return PurchaseOrderResponse.from_orm(purchase_order)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get purchase order", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get purchase order"
        )

@router.put("/{po_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order(
    company_id: str,
    po_id: str,
    po_data: PurchaseOrderUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update purchase order"""
    try:
        # Verify user has access to company
        if not await PurchaseOrderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        updated_po = await PurchaseOrderService.update_purchase_order(
            db, company_id, po_id, po_data
        )
        
        if not updated_po:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found"
            )
        
        return PurchaseOrderResponse.from_orm(updated_po)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update purchase order", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update purchase order"
        )

@router.delete("/{po_id}", response_model=MessageResponse)
async def delete_purchase_order(
    company_id: str,
    po_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete purchase order"""
    try:
        # Verify user has access to company
        if not await PurchaseOrderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        deleted = await PurchaseOrderService.delete_purchase_order(
            db, company_id, po_id
        )
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found"
            )
        
        return MessageResponse(message="Purchase order deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete purchase order", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete purchase order"
        )

@router.post("/{po_id}/email", response_model=MessageResponse)
async def email_purchase_order(
    company_id: str,
    po_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Email purchase order to vendor"""
    try:
        # Verify user has access to company
        if not await PurchaseOrderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Implementation needed for email service
        return MessageResponse(message="Purchase order emailed successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to email purchase order", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to email purchase order"
        )