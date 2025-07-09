from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.transaction_service import TransactionService
from schemas.transaction_schemas import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    TransactionSearchFilters, MessageResponse, PaginatedResponse
)
from models.transactions import TransactionType
from typing import List, Optional
import structlog
from datetime import date
from decimal import Decimal

logger = structlog.get_logger()

router = APIRouter(prefix="/companies/{company_id}/invoices", tags=["Invoices"])

@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    company_id: str,
    invoice_data: InvoiceCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new invoice"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        invoice = await TransactionService.create_invoice(
            db, company_id, str(user.user_id), invoice_data
        )
        return InvoiceResponse.from_orm(invoice)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to create invoice", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create invoice"
        )

@router.get("/", response_model=PaginatedResponse)
async def get_invoices(
    company_id: str,
    search: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    transaction_status: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="Filter by invoice status (outstanding, paid, overdue)"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    is_posted: Optional[bool] = Query(None),
    sort_by: str = Query("transaction_date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get invoices with pagination and filtering"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Handle special status filters
        if status == "outstanding":
            is_posted = True
            # We'll filter for invoices with balance_due > 0 in the service
        elif status == "paid":
            is_posted = True
            # We'll filter for invoices with balance_due = 0 in the service
        elif status == "overdue":
            is_posted = True
            # We'll filter for invoices with balance_due > 0 and due_date < today in the service
        
        filters = TransactionSearchFilters(
            search=search,
            transaction_type=TransactionType.INVOICE,
            status=transaction_status,
            customer_id=customer_id,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            is_posted=is_posted,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        invoices, total = await TransactionService.get_transactions(db, company_id, filters)
        
        # Additional filtering for outstanding status
        if status == "outstanding":
            invoices = [invoice for invoice in invoices if invoice.balance_due > Decimal('0')]
            total = len(invoices)
        elif status == "paid":
            invoices = [invoice for invoice in invoices if invoice.balance_due == Decimal('0')]
            total = len(invoices)
        elif status == "overdue":
            from datetime import date
            today = date.today()
            invoices = [invoice for invoice in invoices if invoice.balance_due > Decimal('0') and invoice.due_date and invoice.due_date < today]
            total = len(invoices)
        
        return PaginatedResponse(
            items=[InvoiceResponse.from_orm(invoice) for invoice in invoices],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
        
    except Exception as e:
        logger.error("Failed to get invoices", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get invoices"
        )

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    company_id: str,
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get invoice by ID"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        invoice = await TransactionService.get_transaction_by_id(db, company_id, invoice_id)
        if not invoice or invoice.transaction_type != TransactionType.INVOICE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        return InvoiceResponse.from_orm(invoice)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get invoice", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get invoice"
        )

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    company_id: str,
    invoice_id: str,
    invoice_data: InvoiceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update invoice"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        invoice = await TransactionService.get_transaction_by_id(db, company_id, invoice_id)
        if not invoice or invoice.transaction_type != TransactionType.INVOICE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        updated_invoice = await TransactionService.update_transaction(
            db, invoice, invoice_data, str(user.user_id)
        )
        return InvoiceResponse.from_orm(updated_invoice)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update invoice", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update invoice"
        )

@router.delete("/{invoice_id}", response_model=MessageResponse)
async def delete_invoice(
    company_id: str,
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete invoice"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        invoice = await TransactionService.get_transaction_by_id(db, company_id, invoice_id)
        if not invoice or invoice.transaction_type != TransactionType.INVOICE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        await TransactionService.delete_transaction(db, invoice)
        return MessageResponse(message="Invoice deleted successfully")
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete invoice", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete invoice"
        )

@router.post("/{invoice_id}/send-email", response_model=MessageResponse)
async def send_invoice_email(
    company_id: str,
    invoice_id: str,
    email_address: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send invoice via email"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        invoice = await TransactionService.get_transaction_by_id(db, company_id, invoice_id)
        if not invoice or invoice.transaction_type != TransactionType.INVOICE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        success = await TransactionService.send_invoice_email(db, invoice, email_address)
        
        if success:
            return MessageResponse(message="Invoice sent successfully")
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send invoice email"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to send invoice email", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send invoice email"
        )

@router.get("/{invoice_id}/pdf")
async def get_invoice_pdf(
    company_id: str,
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate and download invoice PDF"""
    try:
        # Verify user has access to company
        if not await TransactionService.verify_company_access(db, str(user.user_id), company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        invoice = await TransactionService.get_transaction_by_id(db, company_id, invoice_id)
        if not invoice or invoice.transaction_type != TransactionType.INVOICE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        # TODO: Implement PDF generation
        return {
            "message": "PDF generation not implemented yet",
            "invoice_id": invoice_id,
            "download_url": f"/api/companies/{company_id}/invoices/{invoice_id}/pdf"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to generate invoice PDF", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate invoice PDF"
        )