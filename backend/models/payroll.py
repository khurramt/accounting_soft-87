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

# Payroll Enums
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

# Payroll Items
class PayrollItem(Base):
    __tablename__ = "payroll_items"
    
    payroll_item_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    item_name = Column(String(255), nullable=False)
    item_type = Column(SQLEnum(PayrollItemType), nullable=False)
    item_category = Column(String(100))
    rate = Column(Numeric(15, 4))
    calculation_basis = Column(String(50))  # e.g., "hourly", "salary", "percentage"
    limit_type = Column(String(50))  # e.g., "annual", "per_payroll"
    annual_limit = Column(Numeric(15, 2))
    tax_tracking = Column(String(100))
    expense_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    liability_account_id = Column(SQLString(36), ForeignKey("accounts.account_id"))
    vendor_id = Column(SQLString(36), ForeignKey("vendors.vendor_id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    expense_account = relationship("Account", foreign_keys=[expense_account_id])
    liability_account = relationship("Account", foreign_keys=[liability_account_id])
    
    def __repr__(self):
        return f"<PayrollItem {self.item_name}>"

# Employee Payroll Information
class EmployeePayrollInfo(Base):
    __tablename__ = "employee_payroll_info"
    
    employee_payroll_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(SQLString(36), ForeignKey("employees.employee_id"), nullable=False)
    pay_frequency = Column(SQLEnum(PayFrequency), nullable=False)
    pay_type = Column(SQLEnum(PayType), nullable=False)
    salary_amount = Column(Numeric(15, 2))
    hourly_rate = Column(Numeric(15, 2))
    overtime_rate = Column(Numeric(15, 2))
    
    # Federal tax information
    federal_filing_status = Column(SQLEnum(FilingStatus))
    federal_allowances = Column(Integer, default=0)
    federal_extra_withholding = Column(Numeric(15, 2), default=0)
    
    # State tax information
    state_filing_status = Column(SQLEnum(FilingStatus))
    state_allowances = Column(Integer, default=0)
    state_extra_withholding = Column(Numeric(15, 2), default=0)
    state_code = Column(String(2))  # e.g., "CA", "NY"
    
    # Time off information
    sick_hours_available = Column(Numeric(8, 2), default=0)
    vacation_hours_available = Column(Numeric(8, 2), default=0)
    sick_accrual_rate = Column(Numeric(8, 4), default=0)  # hours per pay period
    vacation_accrual_rate = Column(Numeric(8, 4), default=0)  # hours per pay period
    
    # Direct deposit information
    bank_name = Column(String(100))
    account_number = Column(String(50))
    routing_number = Column(String(20))
    account_type = Column(String(20))  # "checking", "savings"
    
    # Additional fields
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id])
    
    def __repr__(self):
        return f"<EmployeePayrollInfo {self.employee_id}>"

# Payroll Runs
class PayrollRun(Base):
    __tablename__ = "payroll_runs"
    
    payroll_run_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    pay_date = Column(Date, nullable=False)
    run_type = Column(SQLEnum(PayrollRunType), default=PayrollRunType.REGULAR)
    status = Column(SQLEnum(PayrollRunStatus), default=PayrollRunStatus.DRAFT)
    
    # Totals
    total_gross_pay = Column(Numeric(15, 2), default=0)
    total_net_pay = Column(Numeric(15, 2), default=0)
    total_taxes = Column(Numeric(15, 2), default=0)
    total_deductions = Column(Numeric(15, 2), default=0)
    total_employer_taxes = Column(Numeric(15, 2), default=0)
    
    # Processing information
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    approved_by = Column(SQLString(36), ForeignKey("users.user_id"))
    approved_at = Column(DateTime)
    processed_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    paychecks = relationship("Paycheck", back_populates="payroll_run", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<PayrollRun {self.pay_period_start} to {self.pay_period_end}>"

# Paychecks
class Paycheck(Base):
    __tablename__ = "paychecks"
    
    paycheck_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    payroll_run_id = Column(SQLString(36), ForeignKey("payroll_runs.payroll_run_id"), nullable=False)
    employee_id = Column(SQLString(36), ForeignKey("employees.employee_id"), nullable=False)
    check_number = Column(String(50))
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    pay_date = Column(Date, nullable=False)
    
    # Amounts
    gross_pay = Column(Numeric(15, 2), default=0)
    total_taxes = Column(Numeric(15, 2), default=0)
    total_deductions = Column(Numeric(15, 2), default=0)
    net_pay = Column(Numeric(15, 2), default=0)
    check_amount = Column(Numeric(15, 2), default=0)
    
    # Status
    is_void = Column(Boolean, default=False)
    void_reason = Column(Text)
    voided_at = Column(DateTime)
    printed = Column(Boolean, default=False)
    direct_deposit = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    payroll_run = relationship("PayrollRun", back_populates="paychecks")
    employee = relationship("Employee", foreign_keys=[employee_id])
    paycheck_lines = relationship("PaycheckLine", back_populates="paycheck", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Paycheck {self.check_number} - {self.employee_id}>"

# Paycheck Line Items
class PaycheckLine(Base):
    __tablename__ = "paycheck_lines"
    
    paycheck_line_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paycheck_id = Column(SQLString(36), ForeignKey("paychecks.paycheck_id", ondelete="CASCADE"), nullable=False)
    payroll_item_id = Column(SQLString(36), ForeignKey("payroll_items.payroll_item_id"))
    line_type = Column(SQLEnum(PaycheckLineType), nullable=False)
    line_number = Column(Integer)
    description = Column(String(255))
    
    # Quantities and rates
    hours = Column(Numeric(8, 2))
    rate = Column(Numeric(15, 4))
    amount = Column(Numeric(15, 2), nullable=False)
    year_to_date = Column(Numeric(15, 2), default=0)
    
    # Tax information
    is_taxable = Column(Boolean, default=True)
    tax_year = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    paycheck = relationship("Paycheck", back_populates="paycheck_lines")
    payroll_item = relationship("PayrollItem", foreign_keys=[payroll_item_id])
    
    def __repr__(self):
        return f"<PaycheckLine {self.description} - {self.amount}>"

# Time Entries
class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    time_entry_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    employee_id = Column(SQLString(36), ForeignKey("employees.employee_id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # Customer/Job information
    customer_id = Column(SQLString(36), ForeignKey("customers.customer_id"))
    job_id = Column(SQLString(36))  # Reference to jobs if implemented
    service_item_id = Column(SQLString(36), ForeignKey("items.item_id"))
    
    # Time information
    hours = Column(Numeric(8, 2), nullable=False)
    break_hours = Column(Numeric(8, 2), default=0)
    overtime_hours = Column(Numeric(8, 2), default=0)
    double_time_hours = Column(Numeric(8, 2), default=0)
    
    # Rates
    hourly_rate = Column(Numeric(15, 2))
    overtime_rate = Column(Numeric(15, 2))
    double_time_rate = Column(Numeric(15, 2))
    
    # Billing information
    description = Column(Text)
    billable = Column(Boolean, default=False)
    billed = Column(Boolean, default=False)
    invoice_id = Column(SQLString(36), ForeignKey("transactions.transaction_id"))
    
    # Status
    approved = Column(Boolean, default=False)
    approved_by = Column(SQLString(36), ForeignKey("users.user_id"))
    approved_at = Column(DateTime)
    
    # Timestamps
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    employee = relationship("Employee", foreign_keys=[employee_id])
    customer = relationship("Customer", foreign_keys=[customer_id])
    service_item = relationship("Item", foreign_keys=[service_item_id])
    
    def __repr__(self):
        return f"<TimeEntry {self.employee_id} - {self.date} - {self.hours}h>"

# Payroll Liabilities
class PayrollLiability(Base):
    __tablename__ = "payroll_liabilities"
    
    liability_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    liability_type = Column(String(100), nullable=False)  # e.g., "Federal Income Tax", "FICA", "State Tax"
    vendor_id = Column(SQLString(36), ForeignKey("vendors.vendor_id"))
    
    # Period information
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    
    # Amounts
    amount = Column(Numeric(15, 2), nullable=False)
    balance = Column(Numeric(15, 2), nullable=False)
    paid_amount = Column(Numeric(15, 2), default=0)
    
    # Status
    status = Column(SQLEnum(PayrollLiabilityStatus), default=PayrollLiabilityStatus.PENDING)
    payment_date = Column(Date)
    payment_method = Column(String(50))
    payment_reference = Column(String(100))
    
    # Late fees and penalties
    penalty_amount = Column(Numeric(15, 2), default=0)
    interest_amount = Column(Numeric(15, 2), default=0)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    vendor = relationship("Vendor", foreign_keys=[vendor_id])
    
    def __repr__(self):
        return f"<PayrollLiability {self.liability_type} - {self.amount}>"

# Federal Tax Tables
class FederalTaxTable(Base):
    __tablename__ = "federal_tax_tables"
    
    tax_table_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tax_year = Column(Integer, nullable=False)
    filing_status = Column(SQLEnum(FilingStatus), nullable=False)
    pay_frequency = Column(SQLEnum(PayFrequency), nullable=False)
    
    # Income brackets
    income_from = Column(Numeric(15, 2), nullable=False)
    income_to = Column(Numeric(15, 2))  # NULL for top bracket
    base_tax = Column(Numeric(15, 2), default=0)
    tax_rate = Column(Numeric(8, 6), nullable=False)  # Percentage as decimal
    
    # Additional information
    standard_deduction = Column(Numeric(15, 2))
    personal_exemption = Column(Numeric(15, 2))
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<FederalTaxTable {self.tax_year} - {self.filing_status} - {self.pay_frequency}>"

# State Tax Tables
class StateTaxTable(Base):
    __tablename__ = "state_tax_tables"
    
    state_tax_table_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    state_code = Column(String(2), nullable=False)  # e.g., "CA", "NY"
    tax_year = Column(Integer, nullable=False)
    filing_status = Column(SQLEnum(FilingStatus), nullable=False)
    pay_frequency = Column(SQLEnum(PayFrequency), nullable=False)
    
    # Income brackets
    income_from = Column(Numeric(15, 2), nullable=False)
    income_to = Column(Numeric(15, 2))  # NULL for top bracket
    base_tax = Column(Numeric(15, 2), default=0)
    tax_rate = Column(Numeric(8, 6), nullable=False)  # Percentage as decimal
    
    # State-specific information
    standard_deduction = Column(Numeric(15, 2))
    personal_exemption = Column(Numeric(15, 2))
    disability_insurance_rate = Column(Numeric(8, 6))  # e.g., CA SDI
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<StateTaxTable {self.state_code} - {self.tax_year} - {self.filing_status}>"

# Payroll Forms/Reports tracking
class PayrollForm(Base):
    __tablename__ = "payroll_forms"
    
    form_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    form_type = Column(String(50), nullable=False)  # "941", "940", "W2", "W3", etc.
    form_year = Column(Integer, nullable=False)
    form_quarter = Column(Integer)  # For quarterly forms like 941
    
    # Period information
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Form data (JSON)
    form_data = Column(JSON)
    
    # Status
    status = Column(String(50), default="draft")  # draft, filed, accepted, rejected
    filed_date = Column(Date)
    due_date = Column(Date)
    
    # Electronic filing information
    efile_confirmation = Column(String(100))
    efile_status = Column(String(50))
    
    # Timestamps
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    
    def __repr__(self):
        return f"<PayrollForm {self.form_type} - {self.form_year}>"