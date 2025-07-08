from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

# Enum definitions for schemas
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

# Base schemas
class BaseRequest(BaseModel):
    pass

class BaseResponse(BaseModel):
    class Config:
        from_attributes = True

# Account schemas
class AccountCreate(BaseRequest):
    account_number: Optional[str] = None
    account_name: str = Field(..., min_length=1, max_length=255)
    account_type: AccountType
    parent_account_id: Optional[str] = None
    description: Optional[str] = None
    opening_balance: Optional[Decimal] = Field(default=0, ge=0)
    opening_balance_date: Optional[date] = None
    bank_account_number: Optional[str] = None
    routing_number: Optional[str] = None
    tax_line: Optional[str] = None
    sort_order: Optional[int] = None

class AccountUpdate(BaseModel):
    account_number: Optional[str] = None
    account_name: Optional[str] = Field(None, min_length=1, max_length=255)
    account_type: Optional[AccountType] = None
    parent_account_id: Optional[str] = None
    description: Optional[str] = None
    opening_balance: Optional[Decimal] = Field(None, ge=0)
    opening_balance_date: Optional[date] = None
    bank_account_number: Optional[str] = None
    routing_number: Optional[str] = None
    tax_line: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class AccountResponse(BaseResponse):
    account_id: str
    company_id: str
    account_number: Optional[str]
    account_name: str
    account_type: AccountType
    parent_account_id: Optional[str]
    description: Optional[str]
    opening_balance: Optional[Decimal]
    opening_balance_date: Optional[date]
    bank_account_number: Optional[str]
    routing_number: Optional[str]
    tax_line: Optional[str]
    is_active: bool
    sort_order: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

# Customer schemas
class CustomerCreate(BaseRequest):
    customer_number: Optional[str] = None
    customer_name: str = Field(..., min_length=1, max_length=255)
    company_name: Optional[str] = None
    customer_type: Optional[str] = None
    salutation: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_person: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[Decimal] = Field(None, ge=0)
    price_level: Optional[str] = None
    sales_tax_code: Optional[str] = None
    sales_tax_item: Optional[str] = None
    preferred_delivery_method: Optional[DeliveryMethod] = None
    preferred_payment_method: Optional[str] = None
    account_number: Optional[str] = None
    custom_field1: Optional[str] = None
    custom_field2: Optional[str] = None
    custom_field3: Optional[str] = None

class CustomerUpdate(BaseModel):
    customer_number: Optional[str] = None
    customer_name: Optional[str] = Field(None, min_length=1, max_length=255)
    company_name: Optional[str] = None
    customer_type: Optional[str] = None
    salutation: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_person: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[Decimal] = Field(None, ge=0)
    price_level: Optional[str] = None
    sales_tax_code: Optional[str] = None
    sales_tax_item: Optional[str] = None
    preferred_delivery_method: Optional[DeliveryMethod] = None
    preferred_payment_method: Optional[str] = None
    account_number: Optional[str] = None
    custom_field1: Optional[str] = None
    custom_field2: Optional[str] = None
    custom_field3: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerResponse(BaseResponse):
    customer_id: str
    company_id: str
    customer_number: Optional[str]
    customer_name: str
    company_name: Optional[str]
    customer_type: Optional[str]
    salutation: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    contact_person: Optional[str]
    address_line1: Optional[str]
    address_line2: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    country: Optional[str]
    phone: Optional[str]
    mobile: Optional[str]
    fax: Optional[str]
    email: Optional[str]
    website: Optional[str]
    payment_terms: Optional[str]
    credit_limit: Optional[Decimal]
    price_level: Optional[str]
    sales_tax_code: Optional[str]
    sales_tax_item: Optional[str]
    preferred_delivery_method: Optional[DeliveryMethod]
    preferred_payment_method: Optional[str]
    account_number: Optional[str]
    custom_field1: Optional[str]
    custom_field2: Optional[str]
    custom_field3: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

# Vendor schemas
class VendorCreate(BaseRequest):
    vendor_number: Optional[str] = None
    vendor_name: str = Field(..., min_length=1, max_length=255)
    company_name: Optional[str] = None
    vendor_type: Optional[str] = None
    contact_person: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[Decimal] = Field(None, ge=0)
    tax_id: Optional[str] = None
    eligible_1099: Optional[bool] = False
    account_number: Optional[str] = None
    custom_field1: Optional[str] = None
    custom_field2: Optional[str] = None
    custom_field3: Optional[str] = None

class VendorUpdate(BaseModel):
    vendor_number: Optional[str] = None
    vendor_name: Optional[str] = Field(None, min_length=1, max_length=255)
    company_name: Optional[str] = None
    vendor_type: Optional[str] = None
    contact_person: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[Decimal] = Field(None, ge=0)
    tax_id: Optional[str] = None
    eligible_1099: Optional[bool] = None
    account_number: Optional[str] = None
    custom_field1: Optional[str] = None
    custom_field2: Optional[str] = None
    custom_field3: Optional[str] = None
    is_active: Optional[bool] = None

class VendorResponse(BaseResponse):
    vendor_id: str
    company_id: str
    vendor_number: Optional[str]
    vendor_name: str
    company_name: Optional[str]
    vendor_type: Optional[str]
    contact_person: Optional[str]
    address_line1: Optional[str]
    address_line2: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    country: Optional[str]
    phone: Optional[str]
    mobile: Optional[str]
    fax: Optional[str]
    email: Optional[str]
    website: Optional[str]
    payment_terms: Optional[str]
    credit_limit: Optional[Decimal]
    tax_id: Optional[str]
    eligible_1099: bool
    account_number: Optional[str]
    custom_field1: Optional[str]
    custom_field2: Optional[str]
    custom_field3: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

# Item schemas
class ItemCreate(BaseRequest):
    item_type: ItemType
    item_name: str = Field(..., min_length=1, max_length=255)
    item_number: Optional[str] = None
    description: Optional[str] = None
    purchase_description: Optional[str] = None
    sales_price: Optional[Decimal] = Field(None, ge=0)
    purchase_cost: Optional[Decimal] = Field(None, ge=0)
    income_account_id: Optional[str] = None
    cogs_account_id: Optional[str] = None
    asset_account_id: Optional[str] = None
    expense_account_id: Optional[str] = None
    preferred_vendor_id: Optional[str] = None
    quantity_on_hand: Optional[Decimal] = Field(None, ge=0)
    quantity_on_order: Optional[Decimal] = Field(None, ge=0)
    reorder_point: Optional[Decimal] = Field(None, ge=0)
    average_cost: Optional[Decimal] = Field(None, ge=0)
    last_cost: Optional[Decimal] = Field(None, ge=0)
    sales_tax_code: Optional[str] = None
    purchase_tax_code: Optional[str] = None
    unit_of_measure: Optional[str] = None
    weight: Optional[Decimal] = Field(None, ge=0)
    manufacturer: Optional[str] = None
    upc_code: Optional[str] = None
    custom_field1: Optional[str] = None
    custom_field2: Optional[str] = None

class ItemUpdate(BaseModel):
    item_type: Optional[ItemType] = None
    item_name: Optional[str] = Field(None, min_length=1, max_length=255)
    item_number: Optional[str] = None
    description: Optional[str] = None
    purchase_description: Optional[str] = None
    sales_price: Optional[Decimal] = Field(None, ge=0)
    purchase_cost: Optional[Decimal] = Field(None, ge=0)
    income_account_id: Optional[str] = None
    cogs_account_id: Optional[str] = None
    asset_account_id: Optional[str] = None
    expense_account_id: Optional[str] = None
    preferred_vendor_id: Optional[str] = None
    quantity_on_hand: Optional[Decimal] = Field(None, ge=0)
    quantity_on_order: Optional[Decimal] = Field(None, ge=0)
    reorder_point: Optional[Decimal] = Field(None, ge=0)
    average_cost: Optional[Decimal] = Field(None, ge=0)
    last_cost: Optional[Decimal] = Field(None, ge=0)
    sales_tax_code: Optional[str] = None
    purchase_tax_code: Optional[str] = None
    unit_of_measure: Optional[str] = None
    weight: Optional[Decimal] = Field(None, ge=0)
    manufacturer: Optional[str] = None
    upc_code: Optional[str] = None
    custom_field1: Optional[str] = None
    custom_field2: Optional[str] = None
    is_active: Optional[bool] = None

class ItemResponse(BaseResponse):
    item_id: str
    company_id: str
    item_type: ItemType
    item_name: str
    item_number: Optional[str]
    description: Optional[str]
    purchase_description: Optional[str]
    sales_price: Optional[Decimal]
    purchase_cost: Optional[Decimal]
    income_account_id: Optional[str]
    cogs_account_id: Optional[str]
    asset_account_id: Optional[str]
    expense_account_id: Optional[str]
    preferred_vendor_id: Optional[str]
    quantity_on_hand: Optional[Decimal]
    quantity_on_order: Optional[Decimal]
    reorder_point: Optional[Decimal]
    average_cost: Optional[Decimal]
    last_cost: Optional[Decimal]
    sales_tax_code: Optional[str]
    purchase_tax_code: Optional[str]
    unit_of_measure: Optional[str]
    weight: Optional[Decimal]
    manufacturer: Optional[str]
    upc_code: Optional[str]
    custom_field1: Optional[str]
    custom_field2: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

# Employee schemas
class EmployeeCreate(BaseRequest):
    employee_number: Optional[str] = None
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_initial: Optional[str] = None
    social_security_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    hire_date: Optional[date] = None
    birth_date: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    pay_frequency: Optional[PayFrequency] = None
    pay_type: Optional[PayType] = None
    salary_amount: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)

class EmployeeUpdate(BaseModel):
    employee_number: Optional[str] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_initial: Optional[str] = None
    social_security_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    hire_date: Optional[date] = None
    birth_date: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    pay_frequency: Optional[PayFrequency] = None
    pay_type: Optional[PayType] = None
    salary_amount: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None

class EmployeeResponse(BaseResponse):
    employee_id: str
    company_id: str
    employee_number: Optional[str]
    first_name: str
    last_name: str
    middle_initial: Optional[str]
    social_security_number: Optional[str]
    address_line1: Optional[str]
    address_line2: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    phone: Optional[str]
    mobile: Optional[str]
    email: Optional[str]
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    hire_date: Optional[date]
    birth_date: Optional[date]
    gender: Optional[Gender]
    marital_status: Optional[MaritalStatus]
    pay_frequency: Optional[PayFrequency]
    pay_type: Optional[PayType]
    salary_amount: Optional[Decimal]
    hourly_rate: Optional[Decimal]
    overtime_rate: Optional[Decimal]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

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

# Search and filter schemas
class SearchFilters(BaseModel):
    search: Optional[str] = None
    is_active: Optional[bool] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = Field(default="asc", regex="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class AccountSearchFilters(SearchFilters):
    account_type: Optional[AccountType] = None
    parent_account_id: Optional[str] = None

class CustomerSearchFilters(SearchFilters):
    customer_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class VendorSearchFilters(SearchFilters):
    vendor_type: Optional[str] = None
    eligible_1099: Optional[bool] = None

class ItemSearchFilters(SearchFilters):
    item_type: Optional[ItemType] = None
    low_stock: Optional[bool] = None

class EmployeeSearchFilters(SearchFilters):
    department: Optional[str] = None
    pay_type: Optional[PayType] = None