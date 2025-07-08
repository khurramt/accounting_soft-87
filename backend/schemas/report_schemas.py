from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

# Import enums from models
from models.reports import ReportType, ReportFormat, ReportStatus, ReportCategory

# Base schemas for common structures
class ReportParameterSchema(BaseModel):
    name: str
    type: str  # string, date, number, boolean, select
    label: str
    description: Optional[str] = None
    required: bool = False
    default_value: Optional[Any] = None
    options: Optional[List[Dict[str, Any]]] = None  # For select type

class ReportColumnSchema(BaseModel):
    name: str
    label: str
    data_type: str  # string, number, date, currency, percentage
    format: Optional[str] = None
    width: Optional[int] = None
    alignment: str = "left"  # left, right, center
    is_sortable: bool = True
    is_total_column: bool = False

class ReportFilterSchema(BaseModel):
    field: str
    operator: str  # eq, ne, gt, gte, lt, lte, in, like, between
    value: Union[str, int, float, date, List[Any]]
    label: Optional[str] = None

# Report Definition Schemas
class ReportDefinitionBase(BaseModel):
    report_name: str
    report_category: ReportCategory
    report_type: ReportType = ReportType.STANDARD
    sql_template: Optional[str] = None
    parameters: Dict[str, ReportParameterSchema] = {}
    default_filters: List[ReportFilterSchema] = []
    column_definitions: List[ReportColumnSchema] = []
    access_permissions: Dict[str, Any] = {"public": True}
    description: Optional[str] = None

    @validator('default_filters', pre=True)
    def convert_default_filters(cls, v):
        """Convert empty dict to empty list for backwards compatibility"""
        if isinstance(v, dict) and not v:  # empty dict
            return []
        elif isinstance(v, dict):
            # Convert dict to list if needed (for backwards compatibility)
            return []
        return v

    @validator('column_definitions', pre=True)
    def convert_column_definitions(cls, v):
        """Handle column_definitions conversion"""
        if isinstance(v, list):
            return v
        elif isinstance(v, dict) and not v:  # empty dict
            return []
        return v

class ReportDefinitionCreate(ReportDefinitionBase):
    pass

class ReportDefinitionUpdate(BaseModel):
    report_name: Optional[str] = None
    report_category: Optional[ReportCategory] = None
    sql_template: Optional[str] = None
    parameters: Optional[Dict[str, ReportParameterSchema]] = None
    default_filters: Optional[List[ReportFilterSchema]] = None
    column_definitions: Optional[List[ReportColumnSchema]] = None
    access_permissions: Optional[Dict[str, Any]] = None
    description: Optional[str] = None

class ReportDefinitionResponse(ReportDefinitionBase):
    report_id: str
    is_system_report: bool
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Memorized Report Schemas
class MemorizedReportBase(BaseModel):
    report_name: str
    parameters: Dict[str, Any] = {}
    filters: List[ReportFilterSchema] = []
    formatting: Dict[str, Any] = {}
    group_id: Optional[str] = None
    
    # Scheduling
    is_scheduled: bool = False
    schedule_frequency: Optional[str] = None  # daily, weekly, monthly, quarterly, annually
    schedule_config: Dict[str, Any] = {}
    
    # Email settings
    email_enabled: bool = False
    email_recipients: List[str] = []
    email_subject: Optional[str] = None
    email_body: Optional[str] = None

    @validator('schedule_frequency')
    def validate_schedule_frequency(cls, v, values):
        if values.get('is_scheduled') and not v:
            raise ValueError('Schedule frequency is required when scheduled is enabled')
        if v and v not in ['daily', 'weekly', 'monthly', 'quarterly', 'annually']:
            raise ValueError('Invalid schedule frequency')
        return v

class MemorizedReportCreate(MemorizedReportBase):
    report_id: str

class MemorizedReportUpdate(BaseModel):
    report_name: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    filters: Optional[List[ReportFilterSchema]] = None
    formatting: Optional[Dict[str, Any]] = None
    group_id: Optional[str] = None
    is_scheduled: Optional[bool] = None
    schedule_frequency: Optional[str] = None
    schedule_config: Optional[Dict[str, Any]] = None
    email_enabled: Optional[bool] = None
    email_recipients: Optional[List[str]] = None
    email_subject: Optional[str] = None
    email_body: Optional[str] = None

class MemorizedReportResponse(MemorizedReportBase):
    memorized_report_id: str
    company_id: str
    report_id: str
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Report Group Schemas
class ReportGroupBase(BaseModel):
    group_name: str
    description: Optional[str] = None
    sort_order: int = 0

class ReportGroupCreate(ReportGroupBase):
    pass

class ReportGroupUpdate(BaseModel):
    group_name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None

class ReportGroupResponse(ReportGroupBase):
    group_id: str
    company_id: str
    created_by: str
    created_at: datetime
    report_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Report Execution Schemas
class ReportExecutionRequest(BaseModel):
    parameters: Dict[str, Any] = {}
    filters: List[ReportFilterSchema] = []
    output_format: ReportFormat = ReportFormat.HTML
    use_cache: bool = True
    cache_duration_minutes: int = 60

class ReportExecutionResponse(BaseModel):
    execution_id: str
    company_id: str
    report_id: Optional[str] = None
    memorized_report_id: Optional[str] = None
    status: ReportStatus
    parameters: Dict[str, Any] = {}
    filters: List[ReportFilterSchema] = []
    execution_time_ms: Optional[int] = None
    row_count: Optional[int] = None
    file_size: Optional[int] = None
    error_message: Optional[str] = None
    output_format: Optional[ReportFormat] = None
    output_file_path: Optional[str] = None
    executed_by: str
    executed_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Report Data Schemas
class ReportDataResponse(BaseModel):
    report_id: str
    report_name: str
    columns: List[ReportColumnSchema]
    data: List[Dict[str, Any]]
    summary: Dict[str, Any] = {}
    parameters: Dict[str, Any] = {}
    filters: List[ReportFilterSchema] = []
    generated_at: datetime
    row_count: int
    execution_time_ms: Optional[int] = None

# Export Schemas
class ReportExportRequest(BaseModel):
    format: ReportFormat
    parameters: Dict[str, Any] = {}
    filters: List[ReportFilterSchema] = []
    include_summary: bool = True
    include_details: bool = True
    
    # PDF specific options
    page_orientation: str = "portrait"  # portrait, landscape
    page_size: str = "letter"  # letter, a4, legal
    
    # Excel specific options
    include_charts: bool = False
    freeze_header_row: bool = True

class ReportExportResponse(BaseModel):
    file_url: str
    file_name: str
    file_size: int
    format: ReportFormat
    expires_at: datetime

# Search and Filter Schemas
class ReportSearchFilters(BaseModel):
    search: Optional[str] = None
    category: Optional[ReportCategory] = None
    type: Optional[ReportType] = None
    created_by: Optional[str] = None
    is_system_report: Optional[bool] = None
    sort_by: str = "report_name"
    sort_order: str = "asc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

class MemorizedReportSearchFilters(BaseModel):
    search: Optional[str] = None
    group_id: Optional[str] = None
    is_scheduled: Optional[bool] = None
    sort_by: str = "report_name"
    sort_order: str = "asc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

# Standard Financial Report Schemas
class ProfitLossRequest(BaseModel):
    start_date: date
    end_date: date
    comparison_type: str = "none"  # none, previous_period, previous_year, custom
    comparison_start_date: Optional[date] = None
    comparison_end_date: Optional[date] = None
    include_subtotals: bool = True
    show_cents: bool = True

class BalanceSheetRequest(BaseModel):
    as_of_date: date
    comparison_date: Optional[date] = None
    include_subtotals: bool = True
    show_cents: bool = True

class CashFlowRequest(BaseModel):
    start_date: date
    end_date: date
    method: str = "indirect"  # indirect, direct
    include_subtotals: bool = True
    show_cents: bool = True

class TrialBalanceRequest(BaseModel):
    as_of_date: date
    include_zero_balances: bool = False
    show_cents: bool = True

class AgingReportRequest(BaseModel):
    as_of_date: date
    aging_periods: List[int] = [30, 60, 90, 120]  # Days for aging buckets
    include_zero_balances: bool = False
    customer_id: Optional[str] = None  # For AR aging
    vendor_id: Optional[str] = None    # For AP aging

# Report Template Schemas
class ReportTemplateResponse(BaseModel):
    template_id: str
    template_name: str
    template_type: str
    template_config: Dict[str, Any]
    calculation_rules: Dict[str, Any] = {}
    formatting_rules: Dict[str, Any] = {}
    version: str
    is_active: bool

    class Config:
        from_attributes = True

# Utility Schemas
class MessageResponse(BaseModel):
    message: str

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

# Financial Calculation Schemas
class FinancialLine(BaseModel):
    account_id: Optional[str] = None
    account_name: str
    amount: Decimal
    percentage: Optional[Decimal] = None
    comparison_amount: Optional[Decimal] = None
    variance_amount: Optional[Decimal] = None
    variance_percentage: Optional[Decimal] = None

class FinancialSection(BaseModel):
    section_name: str
    lines: List[FinancialLine]
    total_amount: Decimal
    comparison_total: Optional[Decimal] = None

class FinancialReportData(BaseModel):
    report_name: str
    company_name: str
    report_date: date
    comparison_date: Optional[date] = None
    sections: List[FinancialSection]
    grand_total: Optional[Decimal] = None
    currency: str = "USD"
    generated_at: datetime