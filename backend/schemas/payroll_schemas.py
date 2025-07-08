from pydantic import BaseModel, validator, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

# Enums matching the SQLAlchemy models
class PayrollItemType(str, Enum):
    WAGES = "wages"
    SALARY = "salary"
    OVERTIME = "overtime"
    BONUS = "bonus"
    COMMISSION = "commission"
    ALLOWANCE = "allowance"
    DEDUCTION = "deduction"
    TAX = "tax"
    BENEFITS = "benefits"
    REIMBURSEMENT = "reimbursement"

class PayFrequency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    SEMIMONTHLY = "semimonthly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"

class PayType(str, Enum):
    SALARY = "salary"
    HOURLY = "hourly"
    COMMISSION = "commission"
    CONTRACTOR = "contractor"

class PayrollRunType(str, Enum):
    REGULAR = "regular"
    BONUS = "bonus"
    CORRECTION = "correction"
    FINAL = "final"
    TERMINATION = "termination"

class PayrollRunStatus(str, Enum):
    DRAFT = "draft"
    CALCULATED = "calculated"
    APPROVED = "approved"
    PROCESSED = "processed"
    POSTED = "posted"
    CANCELLED = "cancelled"

class PaycheckLineType(str, Enum):
    EARNING = "earning"
    DEDUCTION = "deduction"
    TAX = "tax"
    EMPLOYER_TAX = "employer_tax"

class PayrollLiabilityStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    PARTIAL = "partial"

class FilingStatus(str, Enum):
    SINGLE = "single"
    MARRIED_JOINTLY = "married_jointly"
    MARRIED_SEPARATELY = "married_separately"
    HEAD_OF_HOUSEHOLD = "head_of_household"
    QUALIFYING_WIDOW = "qualifying_widow"

# Base schemas
class PayrollItemBase(BaseModel):
    item_name: str = Field(..., max_length=255)
    item_type: PayrollItemType
    item_category: Optional[str] = Field(None, max_length=100)
    rate: Optional[Decimal] = Field(None, ge=0)
    calculation_basis: Optional[str] = Field(None, max_length=50)
    limit_type: Optional[str] = Field(None, max_length=50)
    annual_limit: Optional[Decimal] = Field(None, ge=0)
    tax_tracking: Optional[str] = Field(None, max_length=100)
    expense_account_id: Optional[str] = None
    liability_account_id: Optional[str] = None
    vendor_id: Optional[str] = None
    is_active: bool = True

class PayrollItemCreate(PayrollItemBase):
    pass

class PayrollItemUpdate(BaseModel):
    item_name: Optional[str] = Field(None, max_length=255)
    item_type: Optional[PayrollItemType] = None
    item_category: Optional[str] = Field(None, max_length=100)
    rate: Optional[Decimal] = Field(None, ge=0)
    calculation_basis: Optional[str] = Field(None, max_length=50)
    limit_type: Optional[str] = Field(None, max_length=50)
    annual_limit: Optional[Decimal] = Field(None, ge=0)
    tax_tracking: Optional[str] = Field(None, max_length=100)
    expense_account_id: Optional[str] = None
    liability_account_id: Optional[str] = None
    vendor_id: Optional[str] = None
    is_active: Optional[bool] = None

class PayrollItem(PayrollItemBase):
    payroll_item_id: str
    company_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Employee Payroll Info Schemas
class EmployeePayrollInfoBase(BaseModel):
    pay_frequency: PayFrequency
    pay_type: PayType
    salary_amount: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)
    federal_filing_status: Optional[FilingStatus] = None
    federal_allowances: int = Field(0, ge=0)
    federal_extra_withholding: Decimal = Field(0, ge=0)
    state_filing_status: Optional[FilingStatus] = None
    state_allowances: int = Field(0, ge=0)
    state_extra_withholding: Decimal = Field(0, ge=0)
    state_code: Optional[str] = Field(None, max_length=2)
    sick_hours_available: Decimal = Field(0, ge=0)
    vacation_hours_available: Decimal = Field(0, ge=0)
    sick_accrual_rate: Decimal = Field(0, ge=0)
    vacation_accrual_rate: Decimal = Field(0, ge=0)
    bank_name: Optional[str] = Field(None, max_length=100)
    account_number: Optional[str] = Field(None, max_length=50)
    routing_number: Optional[str] = Field(None, max_length=20)
    account_type: Optional[str] = Field(None, max_length=20)
    is_active: bool = True

class EmployeePayrollInfoCreate(EmployeePayrollInfoBase):
    employee_id: str

class EmployeePayrollInfoUpdate(BaseModel):
    pay_frequency: Optional[PayFrequency] = None
    pay_type: Optional[PayType] = None
    salary_amount: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)
    federal_filing_status: Optional[FilingStatus] = None
    federal_allowances: Optional[int] = Field(None, ge=0)
    federal_extra_withholding: Optional[Decimal] = Field(None, ge=0)
    state_filing_status: Optional[FilingStatus] = None
    state_allowances: Optional[int] = Field(None, ge=0)
    state_extra_withholding: Optional[Decimal] = Field(None, ge=0)
    state_code: Optional[str] = Field(None, max_length=2)
    sick_hours_available: Optional[Decimal] = Field(None, ge=0)
    vacation_hours_available: Optional[Decimal] = Field(None, ge=0)
    sick_accrual_rate: Optional[Decimal] = Field(None, ge=0)
    vacation_accrual_rate: Optional[Decimal] = Field(None, ge=0)
    bank_name: Optional[str] = Field(None, max_length=100)
    account_number: Optional[str] = Field(None, max_length=50)
    routing_number: Optional[str] = Field(None, max_length=20)
    account_type: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None

class EmployeePayrollInfo(EmployeePayrollInfoBase):
    employee_payroll_id: str
    employee_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Payroll Run Schemas
class PayrollRunBase(BaseModel):
    pay_period_start: date
    pay_period_end: date
    pay_date: date
    run_type: PayrollRunType = PayrollRunType.REGULAR

class PayrollRunCreate(PayrollRunBase):
    employee_ids: Optional[List[str]] = []  # List of employee IDs to include

class PayrollRunUpdate(BaseModel):
    pay_period_start: Optional[date] = None
    pay_period_end: Optional[date] = None
    pay_date: Optional[date] = None
    run_type: Optional[PayrollRunType] = None
    status: Optional[PayrollRunStatus] = None

class PayrollRun(PayrollRunBase):
    payroll_run_id: str
    company_id: str
    status: PayrollRunStatus
    total_gross_pay: Decimal
    total_net_pay: Decimal
    total_taxes: Decimal
    total_deductions: Decimal
    total_employer_taxes: Decimal
    created_by: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Paycheck Line Schemas
class PaycheckLineBase(BaseModel):
    line_type: PaycheckLineType
    line_number: Optional[int] = None
    description: Optional[str] = Field(None, max_length=255)
    hours: Optional[Decimal] = Field(None, ge=0)
    rate: Optional[Decimal] = Field(None, ge=0)
    amount: Decimal
    is_taxable: bool = True

class PaycheckLineCreate(PaycheckLineBase):
    payroll_item_id: Optional[str] = None

class PaycheckLine(PaycheckLineBase):
    paycheck_line_id: str
    paycheck_id: str
    payroll_item_id: Optional[str] = None
    year_to_date: Decimal
    tax_year: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Paycheck Schemas
class PaycheckBase(BaseModel):
    check_number: Optional[str] = Field(None, max_length=50)
    pay_period_start: date
    pay_period_end: date
    pay_date: date

class Paycheck(PaycheckBase):
    paycheck_id: str
    payroll_run_id: str
    employee_id: str
    gross_pay: Decimal
    total_taxes: Decimal
    total_deductions: Decimal
    net_pay: Decimal
    check_amount: Decimal
    is_void: bool
    void_reason: Optional[str] = None
    voided_at: Optional[datetime] = None
    printed: bool
    direct_deposit: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    paycheck_lines: List[PaycheckLine] = []

    class Config:
        from_attributes = True

# Time Entry Schemas
class TimeEntryBase(BaseModel):
    date: date
    hours: Decimal = Field(..., gt=0, le=24)
    break_hours: Decimal = Field(0, ge=0)
    overtime_hours: Decimal = Field(0, ge=0)
    double_time_hours: Decimal = Field(0, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)
    double_time_rate: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = None
    billable: bool = False
    customer_id: Optional[str] = None
    job_id: Optional[str] = None
    service_item_id: Optional[str] = None

class TimeEntryCreate(TimeEntryBase):
    employee_id: str

class TimeEntryUpdate(BaseModel):
    date: Optional[date] = None
    hours: Optional[Decimal] = Field(None, gt=0, le=24)
    break_hours: Optional[Decimal] = Field(None, ge=0)
    overtime_hours: Optional[Decimal] = Field(None, ge=0)
    double_time_hours: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    overtime_rate: Optional[Decimal] = Field(None, ge=0)
    double_time_rate: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = None
    billable: Optional[bool] = None
    customer_id: Optional[str] = None
    job_id: Optional[str] = None
    service_item_id: Optional[str] = None
    approved: Optional[bool] = None

class TimeEntry(TimeEntryBase):
    time_entry_id: str
    company_id: str
    employee_id: str
    billed: bool
    invoice_id: Optional[str] = None
    approved: bool
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Payroll Liability Schemas
class PayrollLiabilityBase(BaseModel):
    liability_type: str = Field(..., max_length=100)
    pay_period_start: date
    pay_period_end: date
    due_date: date
    amount: Decimal = Field(..., gt=0)
    vendor_id: Optional[str] = None

class PayrollLiabilityCreate(PayrollLiabilityBase):
    pass

class PayrollLiabilityUpdate(BaseModel):
    liability_type: Optional[str] = Field(None, max_length=100)
    due_date: Optional[date] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    balance: Optional[Decimal] = Field(None, ge=0)
    status: Optional[PayrollLiabilityStatus] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = Field(None, max_length=50)
    payment_reference: Optional[str] = Field(None, max_length=100)
    penalty_amount: Optional[Decimal] = Field(None, ge=0)
    interest_amount: Optional[Decimal] = Field(None, ge=0)

class PayrollLiability(PayrollLiabilityBase):
    liability_id: str
    company_id: str
    balance: Decimal
    paid_amount: Decimal
    status: PayrollLiabilityStatus
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    penalty_amount: Decimal
    interest_amount: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Tax Table Schemas
class FederalTaxTableBase(BaseModel):
    tax_year: int = Field(..., ge=2020, le=2030)
    filing_status: FilingStatus
    pay_frequency: PayFrequency
    income_from: Decimal = Field(..., ge=0)
    income_to: Optional[Decimal] = Field(None, ge=0)
    base_tax: Decimal = Field(0, ge=0)
    tax_rate: Decimal = Field(..., ge=0, le=1)
    standard_deduction: Optional[Decimal] = Field(None, ge=0)
    personal_exemption: Optional[Decimal] = Field(None, ge=0)

class FederalTaxTableCreate(FederalTaxTableBase):
    pass

class FederalTaxTable(FederalTaxTableBase):
    tax_table_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class StateTaxTableBase(BaseModel):
    state_code: str = Field(..., max_length=2)
    tax_year: int = Field(..., ge=2020, le=2030)
    filing_status: FilingStatus
    pay_frequency: PayFrequency
    income_from: Decimal = Field(..., ge=0)
    income_to: Optional[Decimal] = Field(None, ge=0)
    base_tax: Decimal = Field(0, ge=0)
    tax_rate: Decimal = Field(..., ge=0, le=1)
    standard_deduction: Optional[Decimal] = Field(None, ge=0)
    personal_exemption: Optional[Decimal] = Field(None, ge=0)
    disability_insurance_rate: Optional[Decimal] = Field(None, ge=0, le=1)

class StateTaxTableCreate(StateTaxTableBase):
    pass

class StateTaxTable(StateTaxTableBase):
    state_tax_table_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Payroll Form Schemas
class PayrollFormBase(BaseModel):
    form_type: str = Field(..., max_length=50)
    form_year: int = Field(..., ge=2020, le=2030)
    form_quarter: Optional[int] = Field(None, ge=1, le=4)
    period_start: date
    period_end: date
    due_date: Optional[date] = None
    form_data: Optional[Dict[str, Any]] = {}

class PayrollFormCreate(PayrollFormBase):
    pass

class PayrollFormUpdate(BaseModel):
    form_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = Field(None, max_length=50)
    filed_date: Optional[date] = None
    efile_confirmation: Optional[str] = Field(None, max_length=100)
    efile_status: Optional[str] = Field(None, max_length=50)

class PayrollForm(PayrollFormBase):
    form_id: str
    company_id: str
    status: str
    filed_date: Optional[date] = None
    efile_confirmation: Optional[str] = None
    efile_status: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Response schemas for lists
class PayrollItemListResponse(BaseModel):
    items: List[PayrollItem]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

class EmployeePayrollInfoListResponse(BaseModel):
    items: List[EmployeePayrollInfo]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

class PayrollRunListResponse(BaseModel):
    items: List[PayrollRun]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

class PaycheckListResponse(BaseModel):
    items: List[Paycheck]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

class TimeEntryListResponse(BaseModel):
    items: List[TimeEntry]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

class PayrollLiabilityListResponse(BaseModel):
    items: List[PayrollLiability]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

# Additional action schemas
class VoidPaycheckRequest(BaseModel):
    reason: str = Field(..., max_length=500)

class ApprovePayrollRunRequest(BaseModel):
    approved_by: str

class ProcessPayrollRunRequest(BaseModel):
    processing_date: Optional[date] = None

class PayLiabilityRequest(BaseModel):
    payment_date: date
    payment_method: str = Field(..., max_length=50)
    payment_reference: Optional[str] = Field(None, max_length=100)
    payment_amount: Decimal = Field(..., gt=0)

# Payroll calculation results
class PayrollCalculationResult(BaseModel):
    employee_id: str
    gross_pay: Decimal
    federal_income_tax: Decimal
    state_income_tax: Decimal
    social_security_tax: Decimal
    medicare_tax: Decimal
    state_disability_tax: Decimal
    total_taxes: Decimal
    total_deductions: Decimal
    net_pay: Decimal
    employer_taxes: Decimal
    
class PayrollRunCalculationResponse(BaseModel):
    payroll_run_id: str
    calculations: List[PayrollCalculationResult]
    total_gross_pay: Decimal
    total_net_pay: Decimal
    total_taxes: Decimal
    total_deductions: Decimal
    total_employer_taxes: Decimal