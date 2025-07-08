from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.inventory_service import InventoryReorderService
from schemas.inventory_schemas import (
    ReorderReport, PurchaseOrderResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/inventory-reorder", tags=["Inventory Reorder"])

@router.get("/report", response_model=ReorderReport)
async def get_reorder_report(
    company_id: str,
    location_id: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate reorder report for items below reorder point"""
    try:
        # Verify user has access to company
        if not await InventoryReorderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        report = await InventoryReorderService.generate_reorder_report(
            db, company_id, location_id
        )
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to generate reorder report", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate reorder report"
        )

@router.post("/auto-generate-pos", response_model=List[PurchaseOrderResponse])
async def auto_generate_purchase_orders(
    company_id: str,
    vendor_id: Optional[str] = Query(None, description="Specific vendor to generate POs for"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Automatically generate purchase orders for items below reorder point"""
    try:
        # Verify user has access to company
        if not await InventoryReorderService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        purchase_orders = await InventoryReorderService.auto_generate_purchase_orders(
            db, company_id, str(user.user_id), vendor_id
        )
        
        return [PurchaseOrderResponse.from_orm(po) for po in purchase_orders]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to auto-generate purchase orders", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to auto-generate purchase orders"
        )