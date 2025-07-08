from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
import re

# Enum definitions for schemas
class AdjustmentType(str, Enum):
    QUANTITY = "quantity"
    REVALUE = "revalue"
    WRITE_OFF = "write_off"
    CYCLE_COUNT = "cycle_count"
    DAMAGED = "damaged"
    EXPIRED = "expired"
    FOUND = "found"
    LOST = "lost"
    TRANSFER = "transfer"

class PurchaseOrderStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    PARTIALLY_RECEIVED = "partially_received"
    RECEIVED = "received"
    CLOSED = "closed"
    CANCELLED = "cancelled"

class ReceiptStatus(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    COMPLETE = "complete"
    CANCELLED = "cancelled"

class InventoryTransactionType(str, Enum):
    PURCHASE = "purchase"
    SALE = "sale"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"
    ASSEMBLY = "assembly"
    DISASSEMBLY = "disassembly"
    RETURN = "return"
    DAMAGE = "damage"
    EXPIRY = "expiry"
    CYCLE_COUNT = "cycle_count"

class CostMethod(str, Enum):
    FIFO = "fifo"
    LIFO = "lifo"
    AVERAGE_COST = "average_cost"
    STANDARD_COST = "standard_cost"
    SPECIFIC_IDENTIFICATION = "specific_identification"

# Base schemas
class BaseRequest(BaseModel):
    pass

class BaseResponse(BaseModel):
    class Config:
        from_attributes = True

# Inventory Adjustment schemas
class InventoryAdjustmentCreate(BaseRequest):
    item_id: str = Field(..., description="Item being adjusted")
    location_id: Optional[str] = None
    adjustment_date: date = Field(..., description="Date of adjustment")
    adjustment_type: AdjustmentType = Field(..., description="Type of adjustment")
    quantity_adjustment: Decimal = Field(..., description="Quantity change (positive or negative)")
    unit_cost: Decimal = Field(..., ge=0, description="Unit cost for valuation")
    reason_code: Optional[str] = None
    reference_number: Optional[str] = None
    memo: Optional[str] = None
    adjustment_account_id: Optional[str] = None
    lot_number: Optional[str] = None
    serial_number: Optional[str] = None
    expiry_date: Optional[date] = None

class InventoryAdjustmentUpdate(BaseModel):
    adjustment_date: Optional[date] = None
    adjustment_type: Optional[AdjustmentType] = None
    reason_code: Optional[str] = None
    reference_number: Optional[str] = None
    memo: Optional[str] = None
    adjustment_account_id: Optional[str] = None

class InventoryAdjustmentResponse(BaseResponse):
    adjustment_id: str
    company_id: str
    item_id: str
    location_id: Optional[str]
    adjustment_date: date
    adjustment_type: AdjustmentType
    quantity_before: Decimal
    quantity_after: Decimal
    quantity_adjustment: Decimal
    value_before: Decimal
    value_after: Decimal
    value_adjustment: Decimal
    unit_cost: Decimal
    reason_code: Optional[str]
    reference_number: Optional[str]
    memo: Optional[str]
    adjustment_account_id: Optional[str]
    lot_number: Optional[str]
    serial_number: Optional[str]
    expiry_date: Optional[date]
    created_by: str
    created_at: datetime
    approved_by: Optional[str]
    approved_at: Optional[datetime]

# Purchase Order Line schemas
class PurchaseOrderLineCreate(BaseRequest):
    item_id: str = Field(..., description="Item being ordered")
    description: Optional[str] = None
    quantity_ordered: Decimal = Field(..., gt=0, description="Quantity to order")
    unit_cost: Decimal = Field(..., ge=0, description="Cost per unit")
    customer_id: Optional[str] = None  # For job costing
    lot_number: Optional[str] = None
    serial_numbers: Optional[List[str]] = None
    expiry_date: Optional[date] = None

class PurchaseOrderLineUpdate(BaseModel):
    item_id: Optional[str] = None
    description: Optional[str] = None
    quantity_ordered: Optional[Decimal] = Field(None, gt=0)
    unit_cost: Optional[Decimal] = Field(None, ge=0)
    customer_id: Optional[str] = None
    lot_number: Optional[str] = None
    serial_numbers: Optional[List[str]] = None
    expiry_date: Optional[date] = None

class PurchaseOrderLineResponse(BaseResponse):
    po_line_id: str
    purchase_order_id: str
    line_number: int
    item_id: str
    description: Optional[str]
    quantity_ordered: Decimal
    quantity_received: Decimal
    quantity_billed: Decimal
    unit_cost: Decimal
    line_total: Decimal
    customer_id: Optional[str]
    lot_number: Optional[str]
    serial_numbers: Optional[List[str]]
    expiry_date: Optional[date]
    created_at: datetime
    updated_at: Optional[datetime]

# Purchase Order schemas
class PurchaseOrderCreate(BaseRequest):
    vendor_id: str = Field(..., description="Vendor for this PO")
    po_date: date = Field(..., description="Purchase order date")
    expected_date: Optional[date] = None
    ship_to_address: Optional[Dict[str, Any]] = None
    vendor_address: Optional[Dict[str, Any]] = None
    memo: Optional[str] = None
    reference_number: Optional[str] = None
    terms: Optional[str] = None
    lines: List[PurchaseOrderLineCreate] = Field(..., min_length=1, description="PO line items")

class PurchaseOrderUpdate(BaseModel):
    vendor_id: Optional[str] = None
    po_date: Optional[date] = None
    expected_date: Optional[date] = None
    ship_to_address: Optional[Dict[str, Any]] = None
    vendor_address: Optional[Dict[str, Any]] = None
    status: Optional[PurchaseOrderStatus] = None
    memo: Optional[str] = None
    reference_number: Optional[str] = None
    terms: Optional[str] = None

class PurchaseOrderResponse(BaseResponse):
    purchase_order_id: str
    company_id: str
    po_number: str
    vendor_id: str
    po_date: date
    expected_date: Optional[date]
    ship_to_address: Optional[Dict[str, Any]]
    vendor_address: Optional[Dict[str, Any]]
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    status: PurchaseOrderStatus
    approval_status: str
    memo: Optional[str]
    reference_number: Optional[str]
    terms: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime]
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    lines: List[PurchaseOrderLineResponse] = []

# Receipt Line schemas
class ReceiptLineCreate(BaseRequest):
    item_id: str = Field(..., description="Item being received")
    po_line_id: Optional[str] = None
    location_id: Optional[str] = None
    quantity_received: Decimal = Field(..., gt=0, description="Quantity received")
    unit_cost: Decimal = Field(..., ge=0, description="Unit cost")
    lot_number: Optional[str] = None
    serial_numbers: Optional[List[str]] = None
    expiry_date: Optional[date] = None
    quality_check_status: Optional[str] = "pending"
    quality_notes: Optional[str] = None

class ReceiptLineUpdate(BaseModel):
    quantity_received: Optional[Decimal] = Field(None, gt=0)
    unit_cost: Optional[Decimal] = Field(None, ge=0)
    location_id: Optional[str] = None
    lot_number: Optional[str] = None
    serial_numbers: Optional[List[str]] = None
    expiry_date: Optional[date] = None
    quality_check_status: Optional[str] = None
    quality_notes: Optional[str] = None

class ReceiptLineResponse(BaseResponse):
    receipt_line_id: str
    receipt_id: str
    item_id: str
    po_line_id: Optional[str]
    location_id: Optional[str]
    quantity_received: Decimal
    unit_cost: Decimal
    line_total: Decimal
    lot_number: Optional[str]
    serial_numbers: Optional[List[str]]
    expiry_date: Optional[date]
    quality_check_status: str
    quality_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

# Inventory Receipt schemas
class InventoryReceiptCreate(BaseRequest):
    vendor_id: str = Field(..., description="Vendor for this receipt")
    purchase_order_id: Optional[str] = None
    receipt_date: date = Field(..., description="Receipt date")
    vendor_invoice_number: Optional[str] = None
    tracking_number: Optional[str] = None
    memo: Optional[str] = None
    lines: List[ReceiptLineCreate] = Field(..., min_length=1, description="Receipt line items")

class InventoryReceiptUpdate(BaseModel):
    vendor_id: Optional[str] = None
    receipt_date: Optional[date] = None
    status: Optional[ReceiptStatus] = None
    vendor_invoice_number: Optional[str] = None
    tracking_number: Optional[str] = None
    memo: Optional[str] = None

class InventoryReceiptResponse(BaseResponse):
    receipt_id: str
    company_id: str
    receipt_number: str
    vendor_id: str
    purchase_order_id: Optional[str]
    receipt_date: date
    total_cost: Decimal
    status: ReceiptStatus
    vendor_invoice_number: Optional[str]
    tracking_number: Optional[str]
    memo: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime]
    lines: List[ReceiptLineResponse] = []

# Inventory Transaction schemas
class InventoryTransactionCreate(BaseRequest):
    item_id: str = Field(..., description="Item for transaction")
    location_id: Optional[str] = None
    transaction_type: InventoryTransactionType = Field(..., description="Type of transaction")
    transaction_date: date = Field(..., description="Transaction date")
    quantity_change: Decimal = Field(..., description="Quantity change (positive or negative)")
    unit_cost: Decimal = Field(..., ge=0, description="Unit cost")
    cost_method: CostMethod = Field(default=CostMethod.AVERAGE_COST, description="Cost calculation method")
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    lot_number: Optional[str] = None
    serial_number: Optional[str] = None
    expiry_date: Optional[date] = None
    memo: Optional[str] = None

class InventoryTransactionResponse(BaseResponse):
    inventory_transaction_id: str
    company_id: str
    item_id: str
    location_id: Optional[str]
    transaction_type: InventoryTransactionType
    transaction_date: date
    quantity_change: Decimal
    unit_cost: Decimal
    total_cost: Decimal
    balance_quantity: Decimal
    balance_value: Decimal
    cost_method: CostMethod
    reference_type: Optional[str]
    reference_id: Optional[str]
    lot_number: Optional[str]
    serial_number: Optional[str]
    expiry_date: Optional[date]
    memo: Optional[str]
    created_at: datetime
    created_by: Optional[str]

# Inventory Location schemas
class InventoryLocationCreate(BaseRequest):
    location_name: str = Field(..., min_length=1, max_length=255, description="Location name")
    location_code: Optional[str] = None
    location_type: Optional[str] = "warehouse"
    address: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = False
    allow_negative_stock: Optional[bool] = False
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class InventoryLocationUpdate(BaseModel):
    location_name: Optional[str] = Field(None, min_length=1, max_length=255)
    location_code: Optional[str] = None
    location_type: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    allow_negative_stock: Optional[bool] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class InventoryLocationResponse(BaseResponse):
    location_id: str
    company_id: str
    location_name: str
    location_code: Optional[str]
    location_type: Optional[str]
    address: Optional[Dict[str, Any]]
    is_active: bool
    is_default: bool
    allow_negative_stock: bool
    manager_name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

# Item Location schemas
class ItemLocationCreate(BaseRequest):
    item_id: str = Field(..., description="Item ID")
    location_id: str = Field(..., description="Location ID")
    reorder_point: Optional[Decimal] = Field(default=0, ge=0)
    reorder_quantity: Optional[Decimal] = Field(default=0, ge=0)
    max_stock_level: Optional[Decimal] = Field(None, ge=0)
    bin_location: Optional[str] = None
    aisle: Optional[str] = None
    shelf: Optional[str] = None

class ItemLocationUpdate(BaseModel):
    quantity_on_hand: Optional[Decimal] = Field(None, ge=0)
    reorder_point: Optional[Decimal] = Field(None, ge=0)
    reorder_quantity: Optional[Decimal] = Field(None, ge=0)
    max_stock_level: Optional[Decimal] = Field(None, ge=0)
    bin_location: Optional[str] = None
    aisle: Optional[str] = None
    shelf: Optional[str] = None

class ItemLocationResponse(BaseResponse):
    item_location_id: str
    item_id: str
    location_id: str
    quantity_on_hand: Decimal
    quantity_available: Decimal
    quantity_on_order: Decimal
    quantity_allocated: Decimal
    reorder_point: Decimal
    reorder_quantity: Decimal
    max_stock_level: Optional[Decimal]
    bin_location: Optional[str]
    aisle: Optional[str]
    shelf: Optional[str]
    average_cost: Decimal
    last_cost: Decimal
    total_value: Decimal
    created_at: datetime
    updated_at: Optional[datetime]
    last_count_date: Optional[date]

# Inventory Assembly schemas
class InventoryAssemblyCreate(BaseRequest):
    assembly_item_id: str = Field(..., description="Assembly item ID")
    component_item_id: str = Field(..., description="Component item ID")
    quantity_needed: Decimal = Field(..., gt=0, description="Quantity of component needed")
    unit_cost: Decimal = Field(..., ge=0, description="Unit cost of component")
    build_sequence: Optional[int] = Field(default=1, ge=1)
    is_optional: Optional[bool] = False
    notes: Optional[str] = None

class InventoryAssemblyUpdate(BaseModel):
    quantity_needed: Optional[Decimal] = Field(None, gt=0)
    unit_cost: Optional[Decimal] = Field(None, ge=0)
    build_sequence: Optional[int] = Field(None, ge=1)
    is_optional: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class InventoryAssemblyResponse(BaseResponse):
    assembly_id: str
    assembly_item_id: str
    component_item_id: str
    quantity_needed: Decimal
    unit_cost: Decimal
    is_active: bool
    build_sequence: int
    is_optional: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

# Assembly Build schemas
class AssemblyBuildRequest(BaseRequest):
    assembly_item_id: str = Field(..., description="Assembly item to build")
    location_id: Optional[str] = None
    quantity_to_build: Decimal = Field(..., gt=0, description="Quantity to build")
    build_date: date = Field(..., description="Build date")
    memo: Optional[str] = None

class AssemblyBuildResponse(BaseResponse):
    build_id: str
    assembly_item_id: str
    quantity_built: Decimal
    total_cost: Decimal
    build_date: date
    status: str
    memo: Optional[str]
    transactions: List[InventoryTransactionResponse] = []

# Inventory Valuation schemas
class InventoryValuationCreate(BaseRequest):
    valuation_date: date = Field(..., description="Valuation date")
    cost_method: CostMethod = Field(..., description="Cost calculation method")
    include_inactive_items: Optional[bool] = False
    location_id: Optional[str] = None
    notes: Optional[str] = None

class InventoryValuationResponse(BaseResponse):
    valuation_id: str
    company_id: str
    valuation_date: date
    cost_method: CostMethod
    total_quantity: Decimal
    total_cost: Decimal
    total_market_value: Optional[Decimal]
    include_inactive_items: bool
    location_id: Optional[str]
    notes: Optional[str]
    created_by: str
    created_at: datetime

# Search and filter schemas
class InventorySearchFilters(BaseModel):
    search: Optional[str] = None
    location_id: Optional[str] = None
    low_stock: Optional[bool] = None
    negative_stock: Optional[bool] = None
    item_type: Optional[str] = None
    sort_by: Optional[str] = Field(default="item_name")
    sort_order: Optional[str] = Field(default="asc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class PurchaseOrderSearchFilters(BaseModel):
    search: Optional[str] = None
    vendor_id: Optional[str] = None
    status: Optional[PurchaseOrderStatus] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    sort_by: Optional[str] = Field(default="po_date")
    sort_order: Optional[str] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class ReceiptSearchFilters(BaseModel):
    search: Optional[str] = None
    vendor_id: Optional[str] = None
    status: Optional[ReceiptStatus] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    sort_by: Optional[str] = Field(default="receipt_date")
    sort_order: Optional[str] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class AdjustmentSearchFilters(BaseModel):
    search: Optional[str] = None
    item_id: Optional[str] = None
    adjustment_type: Optional[AdjustmentType] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    sort_by: Optional[str] = Field(default="adjustment_date")
    sort_order: Optional[str] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class TransactionSearchFilters(BaseModel):
    search: Optional[str] = None
    item_id: Optional[str] = None
    location_id: Optional[str] = None
    transaction_type: Optional[InventoryTransactionType] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    sort_by: Optional[str] = Field(default="transaction_date")
    sort_order: Optional[str] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

# Common response schemas
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

# Inventory summary schemas
class InventorySummary(BaseModel):
    total_items: int
    total_value: Decimal
    low_stock_items: int
    negative_stock_items: int
    total_locations: int

class ItemInventorySummary(BaseModel):
    item_id: str
    item_name: str
    total_quantity: Decimal
    total_value: Decimal
    locations: List[ItemLocationResponse] = []

# Reorder report schemas
class ReorderItem(BaseModel):
    item_id: str
    item_name: str
    location_id: str
    location_name: str
    current_quantity: Decimal
    reorder_point: Decimal
    reorder_quantity: Decimal
    preferred_vendor_id: Optional[str]
    suggested_order_quantity: Decimal

class ReorderReport(BaseModel):
    report_date: date
    items: List[ReorderItem]
    total_items: int
    estimated_cost: Decimal