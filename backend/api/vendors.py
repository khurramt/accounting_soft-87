from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.list_management_service import VendorService
from schemas.list_management_schemas import (
    VendorCreate, VendorUpdate, VendorResponse,
    VendorSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/vendors", tags=["Vendors"])

@router.post("/", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    company_id: str,
    vendor_data: VendorCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new vendor"""
    try:
        # Verify user has access to company
        if not await VendorService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        vendor = await VendorService.create_vendor(db, company_id, vendor_data)
        return VendorResponse.from_orm(vendor)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create vendor", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create vendor"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_vendors(
    company_id: str,
    search: Optional[str] = Query(None),
    vendor_type: Optional[str] = Query(None),
    eligible_1099: Optional[bool] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("vendor_name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get vendors with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await VendorService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = VendorSearchFilters(
            search=search,
            vendor_type=vendor_type,
            eligible_1099=eligible_1099,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        vendors, total = await VendorService.get_vendors(db, company_id, filters)
        
        return PaginatedResponse(
            items=[VendorResponse.from_orm(vendor) for vendor in vendors],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get vendors", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get vendors"
        )

@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    company_id: str,
    vendor_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get vendor by ID"""
    try:
        # Verify user has access to company
        if not await VendorService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        vendor = await VendorService.get_vendor_by_id(db, company_id, vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found"
            )
        
        return VendorResponse.from_orm(vendor)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get vendor", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get vendor"
        )

@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    company_id: str,
    vendor_id: str,
    vendor_data: VendorUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update vendor"""
    try:
        # Verify user has access to company
        if not await VendorService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        vendor = await VendorService.get_vendor_by_id(db, company_id, vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found"
            )
        
        updated_vendor = await VendorService.update_vendor(db, vendor, vendor_data)
        return VendorResponse.from_orm(updated_vendor)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update vendor", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update vendor"
        )

@router.delete("/{vendor_id}", response_model=MessageResponse)
async def delete_vendor(
    company_id: str,
    vendor_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete vendor (soft delete)"""
    try:
        # Verify user has access to company
        if not await VendorService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        vendor = await VendorService.get_vendor_by_id(db, company_id, vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found"
            )
        
        await VendorService.delete_vendor(db, vendor)
        return MessageResponse(message="Vendor deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete vendor", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete vendor"
        )

@router.get("/{vendor_id}/transactions")
async def get_vendor_transactions(
    company_id: str,
    vendor_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get vendor transactions (placeholder)"""
    try:
        # Verify user has access to company
        if not await VendorService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        vendor = await VendorService.get_vendor_by_id(db, company_id, vendor_id)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found"
            )
        
        # Placeholder for transaction data
        return {
            "transactions": [],
            "total": 0,
            "message": "Transaction integration pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get vendor transactions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get vendor transactions"
        )