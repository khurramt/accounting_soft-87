from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.inventory_service import InventoryAssemblyService
from schemas.inventory_schemas import (
    InventoryAssemblyCreate, InventoryAssemblyUpdate, InventoryAssemblyResponse,
    AssemblyBuildRequest, AssemblyBuildResponse, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/inventory-assemblies", tags=["Inventory Assemblies"])

@router.post("/", response_model=InventoryAssemblyResponse, status_code=status.HTTP_201_CREATED)
async def create_assembly(
    company_id: str,
    assembly_data: InventoryAssemblyCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new inventory assembly"""
    try:
        # Verify user has access to company
        if not await InventoryAssemblyService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        assembly = await InventoryAssemblyService.create_assembly(
            db, assembly_data
        )
        return InventoryAssemblyResponse.from_orm(assembly)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create inventory assembly", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create inventory assembly"
        )

@router.get("/", response_model=List[InventoryAssemblyResponse])
async def get_assemblies(
    company_id: str,
    assembly_item_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get inventory assemblies"""
    try:
        # Verify user has access to company
        if not await InventoryAssemblyService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Implementation needed in service
        # For now, return empty list
        return []
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get inventory assemblies", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory assemblies"
        )

@router.put("/{assembly_id}", response_model=InventoryAssemblyResponse)
async def update_assembly(
    company_id: str,
    assembly_id: str,
    assembly_data: InventoryAssemblyUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update inventory assembly"""
    try:
        # Verify user has access to company
        if not await InventoryAssemblyService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Implementation needed in service
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assembly not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update assembly", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update assembly"
        )

@router.post("/{assembly_id}/build", response_model=AssemblyBuildResponse, status_code=status.HTTP_201_CREATED)
async def build_assembly(
    company_id: str,
    assembly_id: str,
    build_request: AssemblyBuildRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Build an assembly from components"""
    try:
        # Verify user has access to company
        if not await InventoryAssemblyService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        build_result = await InventoryAssemblyService.build_assembly(
            db, company_id, build_request, str(user.user_id)
        )
        return AssemblyBuildResponse(**build_result)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to build assembly", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to build assembly"
        )