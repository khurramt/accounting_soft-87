from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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

@router.get("", response_model=PaginatedResponse)
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
        
        # Calculate balance for each customer
        customer_responses = []
        for customer in customers:
            # Get customer balance from transactions
            balance = await CustomerService.get_customer_balance(db, customer.customer_id, company_id)
            
            # Create customer response with balance
            customer_dict = {
                "customer_id": customer.customer_id,
                "company_id": customer.company_id,
                "customer_number": customer.customer_number,
                "customer_name": customer.customer_name,
                "company_name": customer.company_name,
                "customer_type": customer.customer_type,
                "salutation": customer.salutation,
                "first_name": customer.first_name,
                "last_name": customer.last_name,
                "contact_person": customer.contact_person,
                "address_line1": customer.address_line1,
                "address_line2": customer.address_line2,
                "city": customer.city,
                "state": customer.state,
                "zip_code": customer.zip_code,
                "country": customer.country,
                "phone": customer.phone,
                "mobile": customer.mobile,
                "fax": customer.fax,
                "email": customer.email,
                "website": customer.website,
                "payment_terms": customer.payment_terms,
                "credit_limit": customer.credit_limit,
                "price_level": customer.price_level,
                "sales_tax_code": customer.sales_tax_code,
                "sales_tax_item": customer.sales_tax_item,
                "preferred_delivery_method": customer.preferred_delivery_method,
                "preferred_payment_method": customer.preferred_payment_method,
                "account_number": customer.account_number,
                "custom_field1": customer.custom_field1,
                "custom_field2": customer.custom_field2,
                "custom_field3": customer.custom_field3,
                "is_active": customer.is_active,
                "balance": balance,
                "created_at": customer.created_at,
                "updated_at": customer.updated_at
            }
            customer_responses.append(CustomerResponse(**customer_dict))
        
        return PaginatedResponse(
            items=customer_responses,
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
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get customer transactions"""
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
        
        # Import transaction service
        from services.transaction_service import TransactionService
        from schemas.transaction_schemas import TransactionSearchFilters
        
        # Get customer transactions
        filters = TransactionSearchFilters(
            customer_id=customer_id,
            page=page,
            page_size=page_size,
            sort_by="transaction_date",
            sort_order="desc"
        )
        
        transactions, total = await TransactionService.get_transactions(db, company_id, filters)
        
        # Format transactions for response
        formatted_transactions = []
        for transaction in transactions:
            formatted_transactions.append({
                "transaction_id": transaction.transaction_id,
                "transaction_type": transaction.transaction_type,
                "transaction_number": transaction.transaction_number,
                "transaction_date": transaction.transaction_date.isoformat() if transaction.transaction_date else None,
                "due_date": transaction.due_date.isoformat() if transaction.due_date else None,
                "total_amount": float(transaction.total_amount),
                "balance_due": float(transaction.balance_due) if transaction.balance_due else float(transaction.total_amount),
                "status": transaction.status,
                "memo": transaction.memo,
                "currency_code": transaction.currency_code or "USD"
            })
        
        return {
            "transactions": formatted_transactions,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
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
        
        # Import transaction service
        from services.transaction_service import TransactionService
        from schemas.transaction_schemas import TransactionSearchFilters
        from models.transactions import TransactionType
        from sqlalchemy import and_, func
        from decimal import Decimal
        
        # Calculate customer balance from transactions
        # Get all unpaid invoices and credit memos for this customer
        from models.transactions import Transaction
        
        # Get invoices (positive balance)
        invoice_result = await db.execute(
            select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                and_(
                    Transaction.company_id == company_id,
                    Transaction.customer_id == customer_id,
                    Transaction.transaction_type == TransactionType.INVOICE,
                    Transaction.is_void == False,
                    Transaction.balance_due > 0
                )
            )
        )
        invoice_balance = invoice_result.scalar() or Decimal('0.0')
        
        # Get credit memos (negative balance)
        credit_result = await db.execute(
            select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                and_(
                    Transaction.company_id == company_id,
                    Transaction.customer_id == customer_id,
                    Transaction.transaction_type == TransactionType.CREDIT_MEMO,
                    Transaction.is_void == False,
                    Transaction.balance_due > 0
                )
            )
        )
        credit_balance = credit_result.scalar() or Decimal('0.0')
        
        # Calculate net balance (invoices - credit memos)
        net_balance = invoice_balance - credit_balance
        
        # Get aging information
        from datetime import date, timedelta
        today = date.today()
        
        # Current (0-30 days)
        current_result = await db.execute(
            select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                and_(
                    Transaction.company_id == company_id,
                    Transaction.customer_id == customer_id,
                    Transaction.transaction_type == TransactionType.INVOICE,
                    Transaction.is_void == False,
                    Transaction.balance_due > 0,
                    Transaction.due_date >= today - timedelta(days=30)
                )
            )
        )
        current_balance = current_result.scalar() or Decimal('0.0')
        
        # 31-60 days
        aging_60_result = await db.execute(
            select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                and_(
                    Transaction.company_id == company_id,
                    Transaction.customer_id == customer_id,
                    Transaction.transaction_type == TransactionType.INVOICE,
                    Transaction.is_void == False,
                    Transaction.balance_due > 0,
                    Transaction.due_date < today - timedelta(days=30),
                    Transaction.due_date >= today - timedelta(days=60)
                )
            )
        )
        aging_60_balance = aging_60_result.scalar() or Decimal('0.0')
        
        # 61-90 days
        aging_90_result = await db.execute(
            select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                and_(
                    Transaction.company_id == company_id,
                    Transaction.customer_id == customer_id,
                    Transaction.transaction_type == TransactionType.INVOICE,
                    Transaction.is_void == False,
                    Transaction.balance_due > 0,
                    Transaction.due_date < today - timedelta(days=60),
                    Transaction.due_date >= today - timedelta(days=90)
                )
            )
        )
        aging_90_balance = aging_90_result.scalar() or Decimal('0.0')
        
        # Over 90 days
        over_90_result = await db.execute(
            select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                and_(
                    Transaction.company_id == company_id,
                    Transaction.customer_id == customer_id,
                    Transaction.transaction_type == TransactionType.INVOICE,
                    Transaction.is_void == False,
                    Transaction.balance_due > 0,
                    Transaction.due_date < today - timedelta(days=90)
                )
            )
        )
        over_90_balance = over_90_result.scalar() or Decimal('0.0')
        
        return {
            "customer_id": customer_id,
            "balance": float(net_balance),
            "currency": "USD",
            "aging": {
                "current": float(current_balance),
                "aging_31_60": float(aging_60_balance),
                "aging_61_90": float(aging_90_balance),
                "aging_over_90": float(over_90_balance)
            },
            "invoice_balance": float(invoice_balance),
            "credit_balance": float(credit_balance),
            "last_updated": today.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get customer balance", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer balance"
        )