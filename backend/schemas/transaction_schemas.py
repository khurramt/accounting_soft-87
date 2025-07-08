from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

# Import enums from models
from models.transactions import (
    TransactionType, LineType, PaymentType, RecurringFrequency, 
    TransactionStatus
)

# Base schemas for common fields
class AddressSchema(BaseModel):
    line1: Optional[str] = None
    line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None

# Transaction Line Schemas
class TransactionLineBase(BaseModel):
    line_number: int
    line_type: LineType = LineType.ITEM
    item_id: Optional[str] = None
    account_id: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    discount_rate: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    tax_code: Optional[str] = None
    tax_rate: Optional[Decimal] = None
    tax_amount: Optional[Decimal] = None
    customer_id: Optional[str] = None
    billable: bool = False
    markup_rate: Optional[Decimal] = None
    custom_fields: Optional[Dict[str, Any]] = None

    @validator('quantity', 'unit_price', 'discount_rate', 'discount_amount', 'tax_rate', 'tax_amount', 'markup_rate')
    def validate_amounts(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount cannot be negative')
        return v

class TransactionLineCreate(TransactionLineBase):
    pass

class TransactionLineUpdate(BaseModel):
    line_type: Optional[LineType] = None
    item_id: Optional[str] = None
    account_id: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    discount_rate: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    tax_code: Optional[str] = None
    tax_rate: Optional[Decimal] = None
    tax_amount: Optional[Decimal] = None
    customer_id: Optional[str] = None
    billable: Optional[bool] = None
    markup_rate: Optional[Decimal] = None
    custom_fields: Optional[Dict[str, Any]] = None

class TransactionLineResponse(TransactionLineBase):
    line_id: str
    line_total: Optional[Decimal] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionBase(BaseModel):
    transaction_type: TransactionType
    transaction_number: Optional[str] = None
    reference_number: Optional[str] = None
    transaction_date: date
    due_date: Optional[date] = None
    customer_id: Optional[str] = None
    vendor_id: Optional[str] = None
    employee_id: Optional[str] = None
    account_id: Optional[str] = None
    memo: Optional[str] = None
    exchange_rate: Decimal = Decimal('1.0')
    currency_code: str = 'USD'
    payment_terms: Optional[str] = None
    billing_address: Optional[AddressSchema] = None
    shipping_address: Optional[AddressSchema] = None
    custom_fields: Optional[Dict[str, Any]] = None
    template_id: Optional[str] = None

    @validator('exchange_rate')
    def validate_exchange_rate(cls, v):
        if v <= 0:
            raise ValueError('Exchange rate must be positive')
        return v

class TransactionCreate(TransactionBase):
    lines: List[TransactionLineCreate] = []

    @validator('lines')
    def validate_lines(cls, v):
        if not v:
            raise ValueError('Transaction must have at least one line item')
        return v

class TransactionUpdate(BaseModel):
    transaction_number: Optional[str] = None
    reference_number: Optional[str] = None
    transaction_date: Optional[date] = None
    due_date: Optional[date] = None
    customer_id: Optional[str] = None
    vendor_id: Optional[str] = None
    employee_id: Optional[str] = None
    account_id: Optional[str] = None
    memo: Optional[str] = None
    exchange_rate: Optional[Decimal] = None
    currency_code: Optional[str] = None
    payment_terms: Optional[str] = None
    billing_address: Optional[AddressSchema] = None
    shipping_address: Optional[AddressSchema] = None
    custom_fields: Optional[Dict[str, Any]] = None
    template_id: Optional[str] = None
    lines: Optional[List[TransactionLineUpdate]] = None

class TransactionResponse(TransactionBase):
    transaction_id: str
    company_id: str
    status: TransactionStatus
    subtotal: Optional[Decimal] = None
    tax_amount: Optional[Decimal] = None
    total_amount: Decimal
    balance_due: Optional[Decimal] = None
    is_posted: bool
    is_cleared: bool
    is_void: bool
    voided_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    lines: List[TransactionLineResponse] = []

    class Config:
        from_attributes = True

# Invoice-specific schemas
class InvoiceCreate(TransactionCreate):
    transaction_type: TransactionType = TransactionType.INVOICE
    customer_id: str  # Required for invoices

class InvoiceUpdate(TransactionUpdate):
    pass

class InvoiceResponse(TransactionResponse):
    pass

# Bill-specific schemas
class BillCreate(TransactionCreate):
    transaction_type: TransactionType = TransactionType.BILL
    vendor_id: str  # Required for bills

class BillUpdate(TransactionUpdate):
    pass

class BillResponse(TransactionResponse):
    pass

# Sales Receipt schemas
class SalesReceiptCreate(TransactionCreate):
    transaction_type: TransactionType = TransactionType.SALES_RECEIPT
    customer_id: str  # Required for sales receipts

class SalesReceiptUpdate(TransactionUpdate):
    pass

class SalesReceiptResponse(TransactionResponse):
    pass

# Payment Schemas
class PaymentBase(BaseModel):
    payment_number: Optional[str] = None
    payment_date: date
    payment_type: Optional[PaymentType] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    customer_id: Optional[str] = None
    vendor_id: Optional[str] = None
    amount_received: Decimal
    deposit_to_account_id: str
    memo: Optional[str] = None

    @validator('amount_received')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Payment amount must be positive')
        return v

class PaymentApplicationSchema(BaseModel):
    transaction_id: str
    amount_applied: Decimal
    discount_taken: Decimal = Decimal('0.0')

    @validator('amount_applied', 'discount_taken')
    def validate_amounts(cls, v):
        if v < 0:
            raise ValueError('Amount cannot be negative')
        return v

class PaymentCreate(PaymentBase):
    applications: List[PaymentApplicationSchema] = []

class PaymentUpdate(BaseModel):
    payment_number: Optional[str] = None
    payment_date: Optional[date] = None
    payment_type: Optional[PaymentType] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    customer_id: Optional[str] = None
    vendor_id: Optional[str] = None
    amount_received: Optional[Decimal] = None
    deposit_to_account_id: Optional[str] = None
    memo: Optional[str] = None
    applications: Optional[List[PaymentApplicationSchema]] = None

class PaymentResponse(PaymentBase):
    payment_id: str
    company_id: str
    created_by: Optional[str] = None
    created_at: datetime
    applications: List[PaymentApplicationSchema] = []

    class Config:
        from_attributes = True

# Recurring Transaction Schemas
class RecurringTransactionBase(BaseModel):
    template_name: str
    transaction_type: TransactionType
    frequency: RecurringFrequency
    start_date: date
    end_date: Optional[date] = None
    occurrences_remaining: Optional[int] = None
    template_data: Dict[str, Any]
    is_active: bool = True

class RecurringTransactionCreate(RecurringTransactionBase):
    pass

class RecurringTransactionUpdate(BaseModel):
    template_name: Optional[str] = None
    frequency: Optional[RecurringFrequency] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    occurrences_remaining: Optional[int] = None
    template_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class RecurringTransactionResponse(RecurringTransactionBase):
    recurring_id: str
    company_id: str
    next_occurrence: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Search and Filter Schemas
class TransactionSearchFilters(BaseModel):
    search: Optional[str] = None
    transaction_type: Optional[TransactionType] = None
    status: Optional[TransactionStatus] = None
    customer_id: Optional[str] = None
    vendor_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    is_posted: Optional[bool] = None
    is_void: Optional[bool] = None
    sort_by: str = "transaction_date"
    sort_order: str = "desc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

# Utility Schemas
class TransactionVoidRequest(BaseModel):
    reason: Optional[str] = None

class TransactionPostRequest(BaseModel):
    posting_date: Optional[date] = None

class MessageResponse(BaseModel):
    message: str

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

# Journal Entry Schemas
class JournalEntryResponse(BaseModel):
    entry_id: str
    account_id: str
    debit_amount: Decimal
    credit_amount: Decimal
    description: Optional[str] = None
    posting_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Transaction Summary Schemas
class TransactionSummary(BaseModel):
    total_transactions: int
    total_amount: Decimal
    total_posted: int
    total_void: int
    average_amount: Decimal
    currency: str = 'USD'