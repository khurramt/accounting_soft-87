from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.list_management_service import CustomerService
from schemas.list_management_schemas import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    CustomerSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/customers", tags=["Customers"])

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    company_id: str,
    customer_data: CustomerCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new customer"""
    try:
        # Verify user has access to company
        if not await CustomerService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        customer = await CustomerService.create_customer(db, company_id, customer_data)
        return CustomerResponse.from_orm(customer)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create customer", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create customer"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_customers(
    company_id: str,
    search: Optional[str] = Query(None),
    customer_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("customer_name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get customers with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await CustomerService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = CustomerSearchFilters(
            search=search,
            customer_type=customer_type,
            city=city,
            state=state,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        customers, total = await CustomerService.get_customers(db, company_id, filters)
        
        return PaginatedResponse(
            items=[CustomerResponse.from_orm(customer) for customer in customers],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get customers", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customers"
        )

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    company_id: str,
    customer_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get customer by ID"""
    try:
        # Verify user has access to company
        if not await CustomerService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        customer = await CustomerService.get_customer_by_id(db, company_id, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        return CustomerResponse.from_orm(customer)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get customer", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer"
        )

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    company_id: str,
    customer_id: str,
    customer_data: CustomerUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update customer"""
    try:
        # Verify user has access to company
        if not await CustomerService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        customer = await CustomerService.get_customer_by_id(db, company_id, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        updated_customer = await CustomerService.update_customer(db, customer, customer_data)
        return CustomerResponse.from_orm(updated_customer)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update customer", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer"
        )

@router.delete("/{customer_id}", response_model=MessageResponse)
async def delete_customer(
    company_id: str,
    customer_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete customer (soft delete)"""
    try:
        # Verify user has access to company
        if not await CustomerService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        customer = await CustomerService.get_customer_by_id(db, company_id, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        await CustomerService.delete_customer(db, customer)
        return MessageResponse(message="Customer deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete customer", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete customer"
        )

@router.get("/{customer_id}/transactions")
async def get_customer_transactions(
    company_id: str,
    customer_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get customer transactions (placeholder)"""
    try:
        # Verify user has access to company
        if not await CustomerService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        customer = await CustomerService.get_customer_by_id(db, company_id, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
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
        logger.error("Failed to get customer transactions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer transactions"
        )

@router.get("/{customer_id}/balance")
async def get_customer_balance(
    company_id: str,
    customer_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get customer balance"""
    try:
        # Verify user has access to company
        if not await CustomerService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        customer = await CustomerService.get_customer_by_id(db, company_id, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        balance = await CustomerService.get_customer_balance(db, customer_id)
        
        return {
            "customer_id": customer_id,
            "balance": balance,
            "currency": "USD"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get customer balance", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer balance"
        )