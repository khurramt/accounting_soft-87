from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.list_management_service import AccountService
from schemas.list_management_schemas import (
    AccountCreate, AccountUpdate, AccountResponse,
    AccountSearchFilters, PaginatedResponse, MessageResponse
)
from typing import List, Optional
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/accounts", tags=["Accounts"])

@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    company_id: str,
    account_data: AccountCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new account"""
    try:
        # Verify user has access to company
        if not await AccountService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Verify parent account exists if provided
        if account_data.parent_account_id:
            parent_account = await AccountService.get_account_by_id(
                db, company_id, account_data.parent_account_id
            )
            if not parent_account:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent account not found"
                )
        
        account = await AccountService.create_account(db, company_id, account_data)
        return AccountResponse.from_orm(account)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create account", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_accounts(
    company_id: str,
    search: Optional[str] = Query(None),
    account_type: Optional[str] = Query(None),
    parent_account_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("account_name"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get accounts with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await AccountService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = AccountSearchFilters(
            search=search,
            account_type=account_type,
            parent_account_id=parent_account_id,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        accounts, total = await AccountService.get_accounts(db, company_id, filters)
        
        return PaginatedResponse(
            items=[AccountResponse.from_orm(account) for account in accounts],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get accounts", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get accounts"
        )

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    company_id: str,
    account_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get account by ID"""
    try:
        # Verify user has access to company
        if not await AccountService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        account = await AccountService.get_account_by_id(db, company_id, account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found"
            )
        
        return AccountResponse.from_orm(account)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get account", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get account"
        )

@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    company_id: str,
    account_id: str,
    account_data: AccountUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update account"""
    try:
        # Verify user has access to company
        if not await AccountService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        account = await AccountService.get_account_by_id(db, company_id, account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found"
            )
        
        # Verify parent account exists if provided
        if account_data.parent_account_id:
            parent_account = await AccountService.get_account_by_id(
                db, company_id, account_data.parent_account_id
            )
            if not parent_account:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent account not found"
                )
            
            # Prevent circular reference
            if account_data.parent_account_id == account_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Account cannot be its own parent"
                )
        
        updated_account = await AccountService.update_account(db, account, account_data)
        return AccountResponse.from_orm(updated_account)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update account", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update account"
        )

@router.delete("/{account_id}", response_model=MessageResponse)
async def delete_account(
    company_id: str,
    account_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete account (soft delete)"""
    try:
        # Verify user has access to company
        if not await AccountService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        account = await AccountService.get_account_by_id(db, company_id, account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found"
            )
        
        await AccountService.delete_account(db, account)
        return MessageResponse(message="Account deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete account", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )

@router.post("/{account_id}/merge", response_model=MessageResponse)
async def merge_accounts(
    company_id: str,
    account_id: str,
    target_account_id: str = Query(..., description="ID of account to merge into"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Merge account into another account"""
    try:
        # Verify user has access to company
        if not await AccountService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Get source account
        source_account = await AccountService.get_account_by_id(db, company_id, account_id)
        if not source_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Source account not found"
            )
        
        # Get target account
        target_account = await AccountService.get_account_by_id(db, company_id, target_account_id)
        if not target_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target account not found"
            )
        
        # Verify accounts are same type
        if source_account.account_type != target_account.account_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot merge accounts of different types"
            )
        
        await AccountService.merge_accounts(db, source_account, target_account)
        return MessageResponse(message="Accounts merged successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to merge accounts", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to merge accounts"
        )