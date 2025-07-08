from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum, Numeric, Date
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String as SQLString
import sqlalchemy as sa

# Enums for transaction types
class TransactionType(str, Enum):
    INVOICE = "invoice"
    BILL = "bill"
    PAYMENT = "payment"
    CHECK = "check"
    SALES_RECEIPT = "sales_receipt"
    CREDIT_MEMO = "credit_memo"
    PURCHASE_ORDER = "purchase_order"
    ESTIMATE = "estimate"
    DEPOSIT = "deposit"
    REFUND = "refund"
    JOURNAL_ENTRY = "journal_entry"
    TRANSFER = "transfer"

class LineType(str, Enum):
    ITEM = "item"
    ACCOUNT = "account"
    DISCOUNT = "discount"
    TAX = "tax"
    SHIPPING = "shipping"
    OTHER = "other"

class PaymentType(str, Enum):
    CASH = "cash"
    CHECK = "check"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    OTHER_ONLINE = "other_online"
    MONEY_ORDER = "money_order"
    ACH = "ach"

class RecurringFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMIANNUALLY = "semiannually"
    ANNUALLY = "annually"

class TransactionStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    SENT = "sent"
    APPROVED = "approved"
    POSTED = "posted"
    PAID = "paid"
    OVERDUE = "overdue"
    PARTIALLY_PAID = "partially_paid"
    CANCELLED = "cancelled"
    VOIDED = "voided"

# Main transactions table
class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    transaction_number = Column(String(50))
    reference_number = Column(String(50))
    transaction_date = Column(Date, nullable=False)
    due_date = Column(Date)
    
    # Entity relationships
    customer_id = Column(SQLString(36), ForeignKey("customers.customer_id"))
    vendor_id = Column(SQLString(36), ForeignKey("vendors.vendor_id"))
    employee_id = Column(SQLString(36), ForeignKey("employees.employee_id"))
    account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    
    # Transaction details
    memo = Column(Text)
    exchange_rate = Column(Numeric(10, 6), default=1.0)
    currency_code = Column(String(3), default='USD')
    
    # Financial amounts
    subtotal = Column(Numeric(15, 2))
    tax_amount = Column(Numeric(15, 2))
    total_amount = Column(Numeric(15, 2), nullable=False)
    balance_due = Column(Numeric(15, 2))
    
    # Business details
    payment_terms = Column(String(100))
    billing_address = Column(JSON)
    shipping_address = Column(JSON)
    custom_fields = Column(JSON)
    
    # Status and control
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.DRAFT)
    is_posted = Column(Boolean, default=False)
    is_cleared = Column(Boolean, default=False)
    is_void = Column(Boolean, default=False)
    voided_at = Column(DateTime)
    voided_by = Column(SQLString(36), ForeignKey("users.user_id"))
    
    # Template and audit
    template_id = Column(String(100))
    created_by = Column(SQLString(36), ForeignKey("users.user_id"))
    updated_by = Column(SQLString(36), ForeignKey("users.user_id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    customer = relationship("Customer", foreign_keys=[customer_id])
    vendor = relationship("Vendor", foreign_keys=[vendor_id])
    employee = relationship("Employee", foreign_keys=[employee_id])
    account = relationship("Account", foreign_keys=[account_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])
    voided_by_user = relationship("User", foreign_keys=[voided_by])
    
    # One-to-many relationships
    lines = relationship("TransactionLine", back_populates="transaction", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="transaction", cascade="all, delete-orphan")
    payment_applications = relationship("PaymentApplication", foreign_keys="PaymentApplication.transaction_id")
    
    def __repr__(self):
        return f"<Transaction {self.transaction_type} {self.transaction_number}>"

# Transaction line items
class TransactionLine(Base):
    __tablename__ = "transaction_lines"
    
    line_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(SQLString(36), ForeignKey("transactions.transaction_id", ondelete="CASCADE"), nullable=False)
    line_number = Column(Integer, nullable=False)
    line_type = Column(SQLEnum(LineType), default=LineType.ITEM)
    
    # Item and account references
    item_id = Column(SQLString(36), ForeignKey("items.item_id"))
    account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    
    # Line details
    description = Column(Text)
    quantity = Column(Numeric(15, 4))
    unit_price = Column(Numeric(15, 2))
    line_total = Column(Numeric(15, 2))
    
    # Discounts and taxes
    discount_rate = Column(Numeric(5, 2))
    discount_amount = Column(Numeric(15, 2))
    tax_code = Column(String(50))
    tax_rate = Column(Numeric(5, 4))
    tax_amount = Column(Numeric(15, 2))
    
    # Project tracking
    customer_id = Column(SQLString(36), ForeignKey("customers.customer_id"))
    job_id = Column(SQLString(36))  # Future implementation
    class_id = Column(SQLString(36))  # Future implementation
    location_id = Column(SQLString(36))  # Future implementation
    
    # Additional details
    billable = Column(Boolean, default=False)
    markup_rate = Column(Numeric(5, 2))
    custom_fields = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="lines")
    item = relationship("Item", foreign_keys=[item_id])
    account = relationship("Account", foreign_keys=[account_id])
    customer = relationship("Customer", foreign_keys=[customer_id])
    
    def __repr__(self):
        return f"<TransactionLine {self.description}>"

# Journal entries for double-entry bookkeeping
class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    entry_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(SQLString(36), ForeignKey("transactions.transaction_id"), nullable=False)
    account_id = Column(SQLString(36), ForeignKey("accounts.account_id"), nullable=False)
    
    # Double-entry amounts
    debit_amount = Column(Numeric(15, 2), default=0)
    credit_amount = Column(Numeric(15, 2), default=0)
    
    # Details
    description = Column(Text)
    posting_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="journal_entries")
    account = relationship("Account", foreign_keys=[account_id])
    
    def __repr__(self):
        return f"<JournalEntry {self.description}>"

# Payments table
class Payment(Base):
    __tablename__ = "payments"
    
    payment_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    payment_number = Column(String(50))
    payment_date = Column(Date, nullable=False)
    payment_type = Column(SQLEnum(PaymentType))
    payment_method = Column(String(100))
    reference_number = Column(String(50))
    
    # Payment details
    customer_id = Column(SQLString(36), ForeignKey("customers.customer_id"))
    vendor_id = Column(SQLString(36), ForeignKey("vendors.vendor_id"))
    amount_received = Column(Numeric(15, 2), nullable=False)
    deposit_to_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    memo = Column(Text)
    
    # Audit
    created_by = Column(SQLString(36), ForeignKey("users.user_id"))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    customer = relationship("Customer", foreign_keys=[customer_id])
    vendor = relationship("Vendor", foreign_keys=[vendor_id])
    deposit_account = relationship("Account", foreign_keys=[deposit_to_account_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    # One-to-many relationships
    applications = relationship("PaymentApplication", back_populates="payment")
    
    def __repr__(self):
        return f"<Payment {self.payment_number}>"

# Payment applications to transactions
class PaymentApplication(Base):
    __tablename__ = "payment_applications"
    
    application_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    payment_id = Column(SQLString(36), ForeignKey("payments.payment_id"), nullable=False)
    transaction_id = Column(SQLString(36), ForeignKey("transactions.transaction_id"), nullable=False)
    amount_applied = Column(Numeric(15, 2), nullable=False)
    discount_taken = Column(Numeric(15, 2), default=0)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    payment = relationship("Payment", back_populates="applications")
    transaction = relationship("Transaction", foreign_keys=[transaction_id])
    
    def __repr__(self):
        return f"<PaymentApplication {self.amount_applied}>"

# Recurring transactions
class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"
    
    recurring_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    template_name = Column(String(255), nullable=False)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    frequency = Column(SQLEnum(RecurringFrequency), nullable=False)
    
    # Schedule details
    start_date = Column(Date)
    end_date = Column(Date)
    next_occurrence = Column(Date)
    occurrences_remaining = Column(Integer)
    
    # Template data
    template_data = Column(JSON)
    is_active = Column(Boolean, default=True)
    
    # Audit
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<RecurringTransaction {self.template_name}>"