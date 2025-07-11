from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import logging
import uuid
from datetime import datetime

from database.connection import get_db
from services.security import get_current_user
from services.banking_service import BankingService
from services.transaction_matching_service import TransactionMatchingService
from services.file_parsing_service import FileParsingService
from models.user import User
from schemas.banking_schemas import (
    BankConnectionCreate, BankConnectionUpdate, BankConnectionResponse,
    BankTransactionCreate, BankTransactionUpdate, BankTransactionResponse,
    BankRuleCreate, BankRuleUpdate, BankRuleResponse,
    BankReconciliationCreate, BankReconciliationUpdate, BankReconciliationResponse,
    BankInstitutionResponse, BankStatementImportResponse,
    BankTransactionFilter, InstitutionSearchFilter,
    TransactionMatchRequest, TransactionIgnoreRequest, BatchActionRequest,
    BankConnectionListResponse, BankTransactionListResponse, BankRuleListResponse,
    BankInstitutionListResponse, FileUploadResponse
)

router = APIRouter(tags=["banking"])
logger = logging.getLogger(__name__)


# Bank Connection Endpoints
@router.get("/companies/{company_id}/bank-connections", response_model=BankConnectionListResponse)
async def get_bank_connections(
    company_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bank connections for a company"""
    try:
        banking_service = BankingService(db)
        connections = await banking_service.get_bank_connections(
            company_id, skip, limit, is_active
        )
        
        # Calculate total for pagination
        total_connections = await banking_service.get_bank_connections(company_id, 0, 9999, is_active)
        total = len(total_connections)
        
        return BankConnectionListResponse(
            connections=connections,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
        
    except Exception as e:
        logger.error(f"Error getting bank connections: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/companies/{company_id}/bank-connections", response_model=BankConnectionResponse)
async def create_bank_connection(
    company_id: str,
    connection_data: BankConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new bank connection"""
    try:
        banking_service = BankingService(db)
        connection = await banking_service.create_bank_connection(
            company_id, connection_data, current_user.user_id
        )
        return connection
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating bank connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/companies/{company_id}/bank-connections/{connection_id}", response_model=BankConnectionResponse)
async def get_bank_connection(
    company_id: str,
    connection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific bank connection"""
    try:
        banking_service = BankingService(db)
        connection = await banking_service.get_bank_connection(connection_id, company_id)
        
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank connection not found"
            )
        
        return connection
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting bank connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/companies/{company_id}/bank-connections/{connection_id}", response_model=BankConnectionResponse)
async def update_bank_connection(
    company_id: str,
    connection_id: str,
    connection_data: BankConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a bank connection"""
    try:
        banking_service = BankingService(db)
        connection = await banking_service.update_bank_connection(
            connection_id, company_id, connection_data, current_user.user_id
        )
        
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank connection not found"
            )
        
        return connection
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating bank connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/companies/{company_id}/bank-connections/{connection_id}")
async def delete_bank_connection(
    company_id: str,
    connection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a bank connection"""
    try:
        banking_service = BankingService(db)
        success = await banking_service.delete_bank_connection(
            connection_id, company_id, current_user.user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank connection not found"
            )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Bank connection deleted successfully"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting bank connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/companies/{company_id}/bank-connections/{connection_id}/sync")
async def sync_bank_connection(
    company_id: str,
    connection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Sync bank connection to download new transactions"""
    try:
        banking_service = BankingService(db)
        result = await banking_service.sync_bank_connection(
            connection_id, company_id, current_user.user_id
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error syncing bank connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Bank Transaction Endpoints
@router.get("/companies/{company_id}/bank-transactions", response_model=BankTransactionListResponse)
async def get_bank_transactions(
    company_id: str,
    connection_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    amount_min: Optional[float] = Query(None),
    amount_max: Optional[float] = Query(None),
    description_contains: Optional[str] = Query(None),
    merchant_name_contains: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    pending: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bank transactions with filtering"""
    try:
        # Build filters
        filters = BankTransactionFilter()
        if status:
            filters.status = status
        if transaction_type:
            filters.transaction_type = transaction_type
        if date_from:
            filters.date_from = datetime.fromisoformat(date_from).date()
        if date_to:
            filters.date_to = datetime.fromisoformat(date_to).date()
        if amount_min is not None:
            filters.amount_min = amount_min
        if amount_max is not None:
            filters.amount_max = amount_max
        if description_contains:
            filters.description_contains = description_contains
        if merchant_name_contains:
            filters.merchant_name_contains = merchant_name_contains
        if category:
            filters.category = category
        if pending is not None:
            filters.pending = pending
        
        banking_service = BankingService(db)
        transactions = await banking_service.get_bank_transactions(
            company_id, connection_id, filters, skip, limit
        )
        
        # Calculate total for pagination
        total_transactions = await banking_service.get_bank_transactions(
            company_id, connection_id, filters, 0, 9999
        )
        total = len(total_transactions)
        
        return BankTransactionListResponse(
            transactions=transactions,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
        
    except Exception as e:
        logger.error(f"Error getting bank transactions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/companies/{company_id}/bank-transactions/{connection_id}", response_model=List[BankTransactionResponse])
async def get_bank_transactions_by_connection(
    company_id: str,
    connection_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bank transactions for a specific connection"""
    try:
        banking_service = BankingService(db)
        transactions = await banking_service.get_bank_transactions(
            company_id, connection_id, None, skip, limit
        )
        
        return transactions
        
    except Exception as e:
        logger.error(f"Error getting bank transactions by connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Transaction Matching Endpoints
@router.post("/companies/{company_id}/bank-transactions/{bank_transaction_id}/match")
async def match_transaction(
    company_id: str,
    bank_transaction_id: str,
    match_request: TransactionMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Match a bank transaction with a QuickBooks transaction"""
    try:
        matching_service = TransactionMatchingService(db)
        result = await matching_service.match_transaction(
            company_id, match_request, current_user.user_id
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result.dict()
        )
        
    except Exception as e:
        logger.error(f"Error matching transaction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/companies/{company_id}/bank-transactions/{bank_transaction_id}/ignore")
async def ignore_transaction(
    company_id: str,
    bank_transaction_id: str,
    ignore_request: TransactionIgnoreRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a bank transaction as ignored"""
    try:
        matching_service = TransactionMatchingService(db)
        result = await matching_service.ignore_transaction(
            company_id, ignore_request, current_user.user_id
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result.dict()
        )
        
    except Exception as e:
        logger.error(f"Error ignoring transaction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/companies/{company_id}/bank-transactions/{bank_transaction_id}/potential-matches")
async def get_potential_matches(
    company_id: str,
    bank_transaction_id: str,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get potential QuickBooks transactions that could match a bank transaction"""
    try:
        matching_service = TransactionMatchingService(db)
        matches = await matching_service.find_potential_matches(
            company_id, bank_transaction_id, limit
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"potential_matches": matches}
        )
        
    except Exception as e:
        logger.error(f"Error finding potential matches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/companies/{company_id}/bank-transactions/batch-actions")
async def batch_transaction_actions(
    company_id: str,
    batch_request: BatchActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Perform batch actions on multiple bank transactions"""
    try:
        # Implementation for batch actions would go here
        # For now, return a placeholder response
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "processed_count": len(batch_request.transaction_ids),
                "failed_count": 0,
                "errors": []
            }
        )
        
    except Exception as e:
        logger.error(f"Error performing batch actions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Institution Search Endpoints
@router.get("/banking/institutions/search", response_model=BankInstitutionListResponse)
async def search_institutions(
    name_contains: Optional[str] = Query(None),
    routing_number: Optional[str] = Query(None),
    supports_ofx: Optional[bool] = Query(None),
    supports_direct_connect: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search bank institutions"""
    try:
        filters = InstitutionSearchFilter()
        if name_contains:
            filters.name_contains = name_contains
        if routing_number:
            filters.routing_number = routing_number
        if supports_ofx is not None:
            filters.supports_ofx = supports_ofx
        if supports_direct_connect is not None:
            filters.supports_direct_connect = supports_direct_connect
        
        banking_service = BankingService(db)
        institutions = await banking_service.search_institutions(filters, skip, limit)
        
        # Calculate total for pagination
        total_institutions = await banking_service.search_institutions(filters, 0, 9999)
        total = len(total_institutions)
        
        return BankInstitutionListResponse(
            institutions=institutions,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
        
    except Exception as e:
        logger.error(f"Error searching institutions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/banking/institutions/{institution_id}", response_model=BankInstitutionResponse)
async def get_institution(
    institution_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific bank institution"""
    try:
        banking_service = BankingService(db)
        institution = await banking_service.get_institution(institution_id)
        
        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank institution not found"
            )
        
        return institution
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting institution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# File Upload Endpoints
@router.post("/companies/{company_id}/bank-statements/upload", response_model=FileUploadResponse)
async def upload_bank_statement(
    company_id: str,
    file: UploadFile = File(...),
    connection_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and parse a bank statement file"""
    try:
        # Validate file type
        allowed_extensions = ['.ofx', '.qfx', '.csv']
        file_extension = None
        for ext in allowed_extensions:
            if file.filename.lower().endswith(ext):
                file_extension = ext[1:]  # Remove the dot
                break
        
        if not file_extension:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Parse file
        parsing_service = FileParsingService(db)
        parsed_data = await parsing_service.parse_file(
            file_content, file.filename, file_extension, connection_id
        )
        
        if not parsed_data.get('success'):
            return FileUploadResponse(
                file_id=str(uuid.uuid4()),
                file_name=file.filename,
                file_size=file_size,
                file_type=file_extension,
                upload_status="failed",
                error_message=parsed_data.get('error')
            )
        
        # Validate transactions
        validated_data = await parsing_service.validate_parsed_transactions(
            parsed_data, connection_id
        )
        
        # Create import record
        # Implementation for creating import record would go here
        
        return FileUploadResponse(
            file_id=str(uuid.uuid4()),
            file_name=file.filename,
            file_size=file_size,
            file_type=file_extension,
            upload_status="completed",
            preview_data=validated_data.get('valid_transactions', [])[:10],  # First 10 for preview
            error_message=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading bank statement: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )