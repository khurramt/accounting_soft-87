from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum, Numeric, Date, JSON
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base
import uuid
from datetime import datetime, date
from enum import Enum
from sqlalchemy import String as SQLString
import sqlalchemy as sa

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

class InventoryAdjustment(Base):
    __tablename__ = "inventory_adjustments"
    
    adjustment_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    item_id = Column(SQLString(36), ForeignKey("items.item_id"), nullable=False)
    location_id = Column(SQLString(36), ForeignKey("inventory_locations.location_id"))
    adjustment_date = Column(Date, nullable=False)
    adjustment_type = Column(SQLEnum(AdjustmentType), nullable=False)
    quantity_before = Column(Numeric(15, 4), nullable=False)
    quantity_after = Column(Numeric(15, 4), nullable=False)
    quantity_adjustment = Column(Numeric(15, 4), nullable=False)
    value_before = Column(Numeric(15, 2), nullable=False)
    value_after = Column(Numeric(15, 2), nullable=False)
    value_adjustment = Column(Numeric(15, 2), nullable=False)
    unit_cost = Column(Numeric(15, 2), nullable=False)
    reason_code = Column(String(50))
    reference_number = Column(String(50))
    memo = Column(Text)
    adjustment_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    
    # Lot and Serial tracking
    lot_number = Column(String(100))
    serial_number = Column(String(100))
    expiry_date = Column(Date)
    
    # Audit fields
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    approved_by = Column(SQLString(36), ForeignKey("users.user_id"))
    approved_at = Column(DateTime)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    item = relationship("Item", foreign_keys=[item_id])
    location = relationship("InventoryLocation", foreign_keys=[location_id])
    adjustment_account = relationship("Account", foreign_keys=[adjustment_account_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    
    def __repr__(self):
        return f"<InventoryAdjustment {self.adjustment_id}>"

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    purchase_order_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    po_number = Column(String(50), nullable=False)
    vendor_id = Column(SQLString(36), ForeignKey("vendors.vendor_id"), nullable=False)
    po_date = Column(Date, nullable=False)
    expected_date = Column(Date)
    ship_to_address = Column(JSON)
    vendor_address = Column(JSON)
    
    # Financial fields
    subtotal = Column(Numeric(15, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(15, 2), nullable=False, default=0)
    shipping_amount = Column(Numeric(15, 2), nullable=False, default=0)
    discount_amount = Column(Numeric(15, 2), nullable=False, default=0)
    total_amount = Column(Numeric(15, 2), nullable=False, default=0)
    
    # Status and tracking
    status = Column(SQLEnum(PurchaseOrderStatus), nullable=False, default=PurchaseOrderStatus.DRAFT)
    approval_status = Column(String(20), default="pending")
    
    # Notes and references
    memo = Column(Text)
    reference_number = Column(String(100))
    terms = Column(String(100))
    
    # Audit fields
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    approved_by = Column(SQLString(36), ForeignKey("users.user_id"))
    approved_at = Column(DateTime)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    vendor = relationship("Vendor", foreign_keys=[vendor_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    po_lines = relationship("PurchaseOrderLine", back_populates="purchase_order", cascade="all, delete-orphan")
    receipts = relationship("InventoryReceipt", back_populates="purchase_order")
    
    def __repr__(self):
        return f"<PurchaseOrder {self.po_number}>"

class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"
    
    po_line_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_order_id = Column(SQLString(36), ForeignKey("purchase_orders.purchase_order_id", ondelete="CASCADE"), nullable=False)
    line_number = Column(Integer, nullable=False)
    item_id = Column(SQLString(36), ForeignKey("items.item_id"), nullable=False)
    description = Column(Text)
    
    # Quantity and pricing
    quantity_ordered = Column(Numeric(15, 4), nullable=False)
    quantity_received = Column(Numeric(15, 4), nullable=False, default=0)
    quantity_billed = Column(Numeric(15, 4), nullable=False, default=0)
    unit_cost = Column(Numeric(15, 2), nullable=False)
    line_total = Column(Numeric(15, 2), nullable=False)
    
    # Customer job assignment (optional)
    customer_id = Column(SQLString(36), ForeignKey("customers.customer_id"))
    
    # Lot and Serial tracking
    lot_number = Column(String(100))
    serial_numbers = Column(JSON)  # Array of serial numbers
    expiry_date = Column(Date)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="po_lines")
    item = relationship("Item", foreign_keys=[item_id])
    customer = relationship("Customer", foreign_keys=[customer_id])
    receipt_lines = relationship("ReceiptLine", back_populates="po_line")
    
    def __repr__(self):
        return f"<PurchaseOrderLine {self.po_line_id}>"

class InventoryReceipt(Base):
    __tablename__ = "inventory_receipts"
    
    receipt_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    receipt_number = Column(String(50), nullable=False)
    vendor_id = Column(SQLString(36), ForeignKey("vendors.vendor_id"), nullable=False)
    purchase_order_id = Column(SQLString(36), ForeignKey("purchase_orders.purchase_order_id"))
    receipt_date = Column(Date, nullable=False)
    
    # Financial fields
    total_cost = Column(Numeric(15, 2), nullable=False, default=0)
    
    # Status and tracking
    status = Column(SQLEnum(ReceiptStatus), nullable=False, default=ReceiptStatus.PENDING)
    
    # Reference information
    vendor_invoice_number = Column(String(100))
    tracking_number = Column(String(100))
    memo = Column(Text)
    
    # Audit fields
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    vendor = relationship("Vendor", foreign_keys=[vendor_id])
    purchase_order = relationship("PurchaseOrder", back_populates="receipts")
    created_by_user = relationship("User", foreign_keys=[created_by])
    receipt_lines = relationship("ReceiptLine", back_populates="receipt", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<InventoryReceipt {self.receipt_number}>"

class ReceiptLine(Base):
    __tablename__ = "receipt_lines"
    
    receipt_line_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    receipt_id = Column(SQLString(36), ForeignKey("inventory_receipts.receipt_id", ondelete="CASCADE"), nullable=False)
    item_id = Column(SQLString(36), ForeignKey("items.item_id"), nullable=False)
    po_line_id = Column(SQLString(36), ForeignKey("purchase_order_lines.po_line_id"))
    location_id = Column(SQLString(36), ForeignKey("inventory_locations.location_id"))
    
    # Quantity and pricing
    quantity_received = Column(Numeric(15, 4), nullable=False)
    unit_cost = Column(Numeric(15, 2), nullable=False)
    line_total = Column(Numeric(15, 2), nullable=False)
    
    # Lot and Serial tracking
    lot_number = Column(String(100))
    serial_numbers = Column(JSON)  # Array of serial numbers
    expiry_date = Column(Date)
    
    # Quality control
    quality_check_status = Column(String(20), default="pending")
    quality_notes = Column(Text)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    receipt = relationship("InventoryReceipt", back_populates="receipt_lines")
    item = relationship("Item", foreign_keys=[item_id])
    po_line = relationship("PurchaseOrderLine", back_populates="receipt_lines")
    location = relationship("InventoryLocation", foreign_keys=[location_id])
    
    def __repr__(self):
        return f"<ReceiptLine {self.receipt_line_id}>"

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    
    inventory_transaction_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    item_id = Column(SQLString(36), ForeignKey("items.item_id"), nullable=False)
    location_id = Column(SQLString(36), ForeignKey("inventory_locations.location_id"))
    transaction_type = Column(SQLEnum(InventoryTransactionType), nullable=False)
    transaction_date = Column(Date, nullable=False)
    
    # Quantity and cost tracking
    quantity_change = Column(Numeric(15, 4), nullable=False)
    unit_cost = Column(Numeric(15, 2), nullable=False)
    total_cost = Column(Numeric(15, 2), nullable=False)
    balance_quantity = Column(Numeric(15, 4), nullable=False)
    balance_value = Column(Numeric(15, 2), nullable=False)
    
    # Cost method tracking
    cost_method = Column(SQLEnum(CostMethod), nullable=False, default=CostMethod.AVERAGE_COST)
    
    # Reference information
    reference_type = Column(String(50))  # 'purchase_order', 'sale', 'adjustment', etc.
    reference_id = Column(SQLString(36))  # ID of the referenced document
    
    # Lot and Serial tracking
    lot_number = Column(String(100))
    serial_number = Column(String(100))
    expiry_date = Column(Date)
    
    # Notes
    memo = Column(Text)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(SQLString(36), ForeignKey("users.user_id"))
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    item = relationship("Item", foreign_keys=[item_id])
    location = relationship("InventoryLocation", foreign_keys=[location_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<InventoryTransaction {self.inventory_transaction_id}>"

class InventoryLocation(Base):
    __tablename__ = "inventory_locations"
    
    location_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    location_name = Column(String(255), nullable=False)
    location_code = Column(String(50))
    location_type = Column(String(50))  # 'warehouse', 'store', 'truck', etc.
    
    # Address information
    address = Column(JSON)
    
    # Settings
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    allow_negative_stock = Column(Boolean, default=False)
    
    # Contact information
    manager_name = Column(String(255))
    phone = Column(String(20))
    email = Column(String(255))
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    item_locations = relationship("ItemLocation", back_populates="location")
    
    def __repr__(self):
        return f"<InventoryLocation {self.location_name}>"

class ItemLocation(Base):
    __tablename__ = "item_locations"
    
    item_location_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    item_id = Column(SQLString(36), ForeignKey("items.item_id"), nullable=False)
    location_id = Column(SQLString(36), ForeignKey("inventory_locations.location_id"), nullable=False)
    
    # Quantity tracking
    quantity_on_hand = Column(Numeric(15, 4), nullable=False, default=0)
    quantity_available = Column(Numeric(15, 4), nullable=False, default=0)
    quantity_on_order = Column(Numeric(15, 4), nullable=False, default=0)
    quantity_allocated = Column(Numeric(15, 4), nullable=False, default=0)
    
    # Reorder management
    reorder_point = Column(Numeric(15, 4), default=0)
    reorder_quantity = Column(Numeric(15, 4), default=0)
    max_stock_level = Column(Numeric(15, 4))
    
    # Physical location
    bin_location = Column(String(100))
    aisle = Column(String(20))
    shelf = Column(String(20))
    
    # Cost tracking
    average_cost = Column(Numeric(15, 2), default=0)
    last_cost = Column(Numeric(15, 2), default=0)
    total_value = Column(Numeric(15, 2), default=0)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    last_count_date = Column(Date)
    
    # Relationships
    item = relationship("Item", foreign_keys=[item_id])
    location = relationship("InventoryLocation", back_populates="item_locations")
    
    # Unique constraint
    __table_args__ = (sa.UniqueConstraint('item_id', 'location_id', name='unique_item_location'),)
    
    def __repr__(self):
        return f"<ItemLocation {self.item_location_id}>"

class InventoryAssembly(Base):
    __tablename__ = "inventory_assemblies"
    
    assembly_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assembly_item_id = Column(SQLString(36), ForeignKey("items.item_id"), nullable=False)
    component_item_id = Column(SQLString(36), ForeignKey("items.item_id"), nullable=False)
    
    # Assembly details
    quantity_needed = Column(Numeric(15, 4), nullable=False)
    unit_cost = Column(Numeric(15, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Build information
    build_sequence = Column(Integer, default=1)
    is_optional = Column(Boolean, default=False)
    
    # Notes
    notes = Column(Text)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    assembly_item = relationship("Item", foreign_keys=[assembly_item_id])
    component_item = relationship("Item", foreign_keys=[component_item_id])
    
    def __repr__(self):
        return f"<InventoryAssembly {self.assembly_id}>"

class InventoryValuation(Base):
    __tablename__ = "inventory_valuations"
    
    valuation_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    valuation_date = Column(Date, nullable=False)
    cost_method = Column(SQLEnum(CostMethod), nullable=False)
    
    # Valuation totals
    total_quantity = Column(Numeric(15, 4), nullable=False)
    total_cost = Column(Numeric(15, 2), nullable=False)
    total_market_value = Column(Numeric(15, 2))
    
    # Settings
    include_inactive_items = Column(Boolean, default=False)
    location_id = Column(SQLString(36), ForeignKey("inventory_locations.location_id"))
    
    # Notes
    notes = Column(Text)
    
    # Audit fields
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    location = relationship("InventoryLocation", foreign_keys=[location_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<InventoryValuation {self.valuation_id}>"