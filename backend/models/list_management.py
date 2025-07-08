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

class AccountType(str, Enum):
    ASSETS = "assets"
    LIABILITIES = "liabilities"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSES = "expenses"
    COST_OF_GOODS_SOLD = "cost_of_goods_sold"

class ItemType(str, Enum):
    INVENTORY = "inventory"
    NON_INVENTORY = "non_inventory"
    SERVICE = "service"
    ASSEMBLY = "assembly"
    GROUP = "group"
    DISCOUNT = "discount"
    SALES_TAX = "sales_tax"
    OTHER_CHARGE = "other_charge"

class DeliveryMethod(str, Enum):
    EMAIL = "email"
    MAIL = "mail"
    PHONE = "phone"
    FAX = "fax"
    PICKUP = "pickup"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"
    SEPARATED = "separated"

class PayFrequency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    SEMIMONTHLY = "semimonthly"
    MONTHLY = "monthly"

class PayType(str, Enum):
    SALARY = "salary"
    HOURLY = "hourly"
    COMMISSION = "commission"
    CONTRACTOR = "contractor"

class Account(Base):
    __tablename__ = "accounts"
    
    account_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    account_number = Column(String(50))
    account_name = Column(String(255), nullable=False)
    account_type = Column(SQLEnum(AccountType), nullable=False)
    parent_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    description = Column(Text)
    opening_balance = Column(Numeric(15, 2), default=0)
    opening_balance_date = Column(Date)
    bank_account_number = Column(String(50))
    routing_number = Column(String(20))
    tax_line = Column(String(100))
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    parent_account = relationship("Account", remote_side=[account_id])
    child_accounts = relationship("Account", back_populates="parent_account")
    
    def __repr__(self):
        return f"<Account {self.account_name}>"

class Customer(Base):
    __tablename__ = "customers"
    
    customer_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    customer_number = Column(String(50))
    customer_name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    customer_type = Column(String(100))
    salutation = Column(String(20))
    first_name = Column(String(100))
    last_name = Column(String(100))
    contact_person = Column(String(255))
    
    # Address fields
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(20))
    country = Column(String(100))
    
    # Contact information
    phone = Column(String(20))
    mobile = Column(String(20))
    fax = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    
    # Business information
    payment_terms = Column(String(100))
    credit_limit = Column(Numeric(15, 2))
    price_level = Column(String(100))
    sales_tax_code = Column(String(50))
    sales_tax_item = Column(String(50))
    preferred_delivery_method = Column(SQLEnum(DeliveryMethod))
    preferred_payment_method = Column(String(100))
    account_number = Column(String(100))
    
    # Custom fields
    custom_field1 = Column(String(255))
    custom_field2 = Column(String(255))
    custom_field3 = Column(String(255))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<Customer {self.customer_name}>"

class Vendor(Base):
    __tablename__ = "vendors"
    
    vendor_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    vendor_number = Column(String(50))
    vendor_name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    vendor_type = Column(String(100))
    contact_person = Column(String(255))
    
    # Address fields
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(20))
    country = Column(String(100))
    
    # Contact information
    phone = Column(String(20))
    mobile = Column(String(20))
    fax = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    
    # Business information
    payment_terms = Column(String(100))
    credit_limit = Column(Numeric(15, 2))
    tax_id = Column(String(50))
    eligible_1099 = Column(Boolean, default=False)
    account_number = Column(String(100))
    
    # Custom fields
    custom_field1 = Column(String(255))
    custom_field2 = Column(String(255))
    custom_field3 = Column(String(255))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<Vendor {self.vendor_name}>"

class Item(Base):
    __tablename__ = "items"
    
    item_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    item_type = Column(SQLEnum(ItemType), nullable=False)
    item_name = Column(String(255), nullable=False)
    item_number = Column(String(100))
    description = Column(Text)
    purchase_description = Column(Text)
    
    # Pricing
    sales_price = Column(Numeric(15, 2))
    purchase_cost = Column(Numeric(15, 2))
    
    # Account assignments
    income_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    cogs_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    asset_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    expense_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    
    # Vendor information
    preferred_vendor_id = Column(SQLString(36), ForeignKey("vendors.vendor_id"))
    
    # Inventory tracking
    quantity_on_hand = Column(Numeric(15, 4))
    quantity_on_order = Column(Numeric(15, 4))
    reorder_point = Column(Numeric(15, 4))
    average_cost = Column(Numeric(15, 2))
    last_cost = Column(Numeric(15, 2))
    
    # Tax information
    sales_tax_code = Column(String(50))
    purchase_tax_code = Column(String(50))
    
    # Product details
    unit_of_measure = Column(String(50))
    weight = Column(Numeric(10, 4))
    manufacturer = Column(String(255))
    upc_code = Column(String(50))
    
    # Custom fields
    custom_field1 = Column(String(255))
    custom_field2 = Column(String(255))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    income_account = relationship("Account", foreign_keys=[income_account_id])
    cogs_account = relationship("Account", foreign_keys=[cogs_account_id])
    asset_account = relationship("Account", foreign_keys=[asset_account_id])
    expense_account = relationship("Account", foreign_keys=[expense_account_id])
    preferred_vendor = relationship("Vendor", foreign_keys=[preferred_vendor_id])
    
    def __repr__(self):
        return f"<Item {self.item_name}>"

class Employee(Base):
    __tablename__ = "employees"
    
    employee_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    employee_number = Column(String(50))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_initial = Column(String(5))
    social_security_number = Column(String(11))
    
    # Address fields
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(20))
    
    # Contact information
    phone = Column(String(20))
    mobile = Column(String(20))
    email = Column(String(255))
    
    # Emergency contact
    emergency_contact_name = Column(String(255))
    emergency_contact_phone = Column(String(20))
    
    # Personal information
    hire_date = Column(Date)
    birth_date = Column(Date)
    gender = Column(SQLEnum(Gender))
    marital_status = Column(SQLEnum(MaritalStatus))
    
    # Payroll information
    pay_frequency = Column(SQLEnum(PayFrequency))
    pay_type = Column(SQLEnum(PayType))
    salary_amount = Column(Numeric(15, 2))
    hourly_rate = Column(Numeric(15, 2))
    overtime_rate = Column(Numeric(15, 2))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<Employee {self.first_name} {self.last_name}>"