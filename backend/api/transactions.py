from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.transaction_service import TransactionService
from schemas.transaction_schemas import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    TransactionSearchFilters, TransactionVoidRequest, TransactionPostRequest,
    MessageResponse, PaginatedResponse
)
from typing import List, Optional
import structlog
from datetime import date

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/transactions", tags=["Transactions"])

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    company_id: str,
    transaction_data: TransactionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new transaction"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        transaction = await TransactionService.create_transaction(
            db, company_id, str(user.user_id), transaction_data
        )
        return TransactionResponse.from_orm(transaction)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to create transaction", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create transaction"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_transactions(
    company_id: str,
    search: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    transaction_status: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    vendor_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    is_posted: Optional[bool] = Query(None),
    is_void: Optional[bool] = Query(None),
    sort_by: str = Query("transaction_date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get transactions with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        filters = TransactionSearchFilters(
            search=search,
            transaction_type=transaction_type,
            status=transaction_status,
            customer_id=customer_id,
            vendor_id=vendor_id,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            is_posted=is_posted,
            is_void=is_void,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        transactions, total = await TransactionService.get_transactions(db, company_id, filters)
        
        return PaginatedResponse(
            items=[TransactionResponse.from_orm(transaction) for transaction in transactions],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except Exception as e:
        logger.error("Failed to get transactions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get transactions"
        )

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    company_id: str,
    transaction_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get transaction by ID"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        transaction = await TransactionService.get_transaction_by_id(db, company_id, transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        return TransactionResponse.from_orm(transaction)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get transaction", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get transaction"
        )

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    company_id: str,
    transaction_id: str,
    transaction_data: TransactionUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update transaction"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        transaction = await TransactionService.get_transaction_by_id(db, company_id, transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        updated_transaction = await TransactionService.update_transaction(
            db, transaction, transaction_data, str(user.user_id)
        )
        return TransactionResponse.from_orm(updated_transaction)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update transaction", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update transaction"
        )

@router.delete("/{transaction_id}", response_model=MessageResponse)
async def delete_transaction(
    company_id: str,
    transaction_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete transaction"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        transaction = await TransactionService.get_transaction_by_id(db, company_id, transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        await TransactionService.delete_transaction(db, transaction)
        return MessageResponse(message="Transaction deleted successfully")
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete transaction", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete transaction"
        )

@router.post("/{transaction_id}/post", response_model=TransactionResponse)
async def post_transaction(
    company_id: str,
    transaction_id: str,
    post_data: TransactionPostRequest = TransactionPostRequest(),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Post transaction and create journal entries"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        transaction = await TransactionService.get_transaction_by_id(db, company_id, transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        posted_transaction = await TransactionService.post_transaction(
            db, transaction, str(user.user_id), post_data.posting_date
        )
        return TransactionResponse.from_orm(posted_transaction)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to post transaction", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to post transaction"
        )

@router.post("/{transaction_id}/void", response_model=TransactionResponse)
async def void_transaction(
    company_id: str,
    transaction_id: str,
    void_data: TransactionVoidRequest = TransactionVoidRequest(),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Void transaction"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        transaction = await TransactionService.get_transaction_by_id(db, company_id, transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        voided_transaction = await TransactionService.void_transaction(
            db, transaction, str(user.user_id), void_data.reason
        )
        return TransactionResponse.from_orm(voided_transaction)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to void transaction", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to void transaction"
        )