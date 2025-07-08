from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.list_management_service import EmployeeService
from schemas.list_management_schemas import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    EmployeeSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/employees", tags=["Employees"])

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    company_id: str,
    employee_data: EmployeeCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new employee"""
    try:
        # Verify user has access to company
        if not await EmployeeService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        employee = await EmployeeService.create_employee(db, company_id, employee_data)
        return EmployeeResponse.from_orm(employee)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create employee", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create employee"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_employees(
    company_id: str,
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    pay_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("last_name"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get employees with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await EmployeeService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = EmployeeSearchFilters(
            search=search,
            department=department,
            pay_type=pay_type,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        employees, total = await EmployeeService.get_employees(db, company_id, filters)
        
        return PaginatedResponse(
            items=[EmployeeResponse.from_orm(employee) for employee in employees],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get employees", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get employees"
        )

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    company_id: str,
    employee_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get employee by ID"""
    try:
        # Verify user has access to company
        if not await EmployeeService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        employee = await EmployeeService.get_employee_by_id(db, company_id, employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        return EmployeeResponse.from_orm(employee)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get employee", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get employee"
        )

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    company_id: str,
    employee_id: str,
    employee_data: EmployeeUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update employee"""
    try:
        # Verify user has access to company
        if not await EmployeeService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        employee = await EmployeeService.get_employee_by_id(db, company_id, employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        updated_employee = await EmployeeService.update_employee(db, employee, employee_data)
        return EmployeeResponse.from_orm(updated_employee)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update employee", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update employee"
        )

@router.delete("/{employee_id}", response_model=MessageResponse)
async def delete_employee(
    company_id: str,
    employee_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete employee (soft delete)"""
    try:
        # Verify user has access to company
        if not await EmployeeService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        employee = await EmployeeService.get_employee_by_id(db, company_id, employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        await EmployeeService.delete_employee(db, employee)
        return MessageResponse(message="Employee deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete employee", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete employee"
        )