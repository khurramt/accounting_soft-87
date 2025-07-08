from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from enum import Enum
import uuid


class ConnectionTypeEnum(str, Enum):
    DIRECT_CONNECT = "direct_connect"
    WEB_CONNECT = "web_connect"
    FILE_IMPORT = "file_import"


class TransactionStatusEnum(str, Enum):
    UNREVIEWED = "unreviewed"
    MATCHED = "matched"
    IGNORED = "ignored"
    PENDING = "pending"
    CLEARED = "cleared"


class ReconciliationStatusEnum(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISCREPANCY = "discrepancy"
    CANCELLED = "cancelled"


class ImportStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# Bank Connection Schemas
class BankConnectionBase(BaseModel):
    bank_name: str = Field(..., min_length=1, max_length=255)
    account_type: str = Field(..., min_length=1, max_length=50)
    account_number_masked: str = Field(..., min_length=1, max_length=50)
    connection_type: ConnectionTypeEnum
    institution_id: Optional[str] = Field(None, max_length=100)
    sync_frequency: str = Field(default="daily", max_length=50)
    is_active: bool = Field(default=True)


class BankConnectionCreate(BankConnectionBase):
    account_id: Optional[str] = Field(None, description="Associated account ID")
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    credentials_encrypted: Optional[str] = None


class BankConnectionUpdate(BaseModel):
    bank_name: Optional[str] = Field(None, min_length=1, max_length=255)
    account_type: Optional[str] = Field(None, min_length=1, max_length=50)
    account_number_masked: Optional[str] = Field(None, min_length=1, max_length=50)
    connection_type: Optional[ConnectionTypeEnum] = None
    institution_id: Optional[str] = Field(None, max_length=100)
    account_id: Optional[str] = None
    sync_frequency: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class BankConnectionResponse(BankConnectionBase):
    connection_id: str
    company_id: str
    account_id: Optional[str] = None
    last_sync_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bank Transaction Schemas
class BankTransactionBase(BaseModel):
    transaction_id: str = Field(..., min_length=1, max_length=255)
    transaction_date: date
    posted_date: Optional[date] = None
    amount: float
    transaction_type: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    merchant_name: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    pending: bool = Field(default=False)
    balance: Optional[float] = None
    check_number: Optional[str] = Field(None, max_length=50)
    reference_number: Optional[str] = Field(None, max_length=100)
    raw_data: Optional[Dict[str, Any]] = None


class BankTransactionCreate(BankTransactionBase):
    connection_id: str
    status: TransactionStatusEnum = Field(default=TransactionStatusEnum.UNREVIEWED)


class BankTransactionUpdate(BaseModel):
    transaction_date: Optional[date] = None
    posted_date: Optional[date] = None
    amount: Optional[float] = None
    transaction_type: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    merchant_name: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    pending: Optional[bool] = None
    balance: Optional[float] = None
    check_number: Optional[str] = Field(None, max_length=50)
    reference_number: Optional[str] = Field(None, max_length=100)
    status: Optional[TransactionStatusEnum] = None
    matched_transaction_id: Optional[str] = None
    quickbooks_transaction_id: Optional[str] = None


class BankTransactionResponse(BankTransactionBase):
    bank_transaction_id: str
    connection_id: str
    status: TransactionStatusEnum
    matched_transaction_id: Optional[str] = None
    quickbooks_transaction_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Bank Rule Schemas
class BankRuleCondition(BaseModel):
    field: str = Field(..., description="Field to match against (description, merchant_name, amount, etc.)")
    operator: str = Field(..., description="Comparison operator (contains, equals, greater_than, etc.)")
    value: Union[str, float, int] = Field(..., description="Value to match")
    case_sensitive: bool = Field(default=False)


class BankRuleAction(BaseModel):
    action_type: str = Field(..., description="Type of action (categorize, split, match, etc.)")
    parameters: Dict[str, Any] = Field(..., description="Parameters for the action")


class BankRuleBase(BaseModel):
    rule_name: str = Field(..., min_length=1, max_length=255)
    conditions: List[BankRuleCondition] = Field(..., min_items=1)
    actions: List[BankRuleAction] = Field(..., min_items=1)
    priority: int = Field(default=0, description="Higher priority rules are processed first")
    is_active: bool = Field(default=True)


class BankRuleCreate(BankRuleBase):
    pass


class BankRuleUpdate(BaseModel):
    rule_name: Optional[str] = Field(None, min_length=1, max_length=255)
    conditions: Optional[List[BankRuleCondition]] = Field(None, min_items=1)
    actions: Optional[List[BankRuleAction]] = Field(None, min_items=1)
    priority: Optional[int] = None
    is_active: Optional[bool] = None


class BankRuleResponse(BankRuleBase):
    rule_id: str
    company_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bank Reconciliation Schemas
class ReconciliationItem(BaseModel):
    transaction_id: str
    amount: float
    cleared: bool
    reconciled_at: Optional[datetime] = None


class BankReconciliationBase(BaseModel):
    statement_date: date
    beginning_balance: float
    ending_balance: float
    service_charge: float = Field(default=0.0)
    interest_earned: float = Field(default=0.0)
    reconciled_items: Optional[List[ReconciliationItem]] = None
    difference: float = Field(default=0.0)


class BankReconciliationCreate(BankReconciliationBase):
    account_id: str
    connection_id: Optional[str] = None


class BankReconciliationUpdate(BaseModel):
    statement_date: Optional[date] = None
    beginning_balance: Optional[float] = None
    ending_balance: Optional[float] = None
    service_charge: Optional[float] = None
    interest_earned: Optional[float] = None
    reconciled_items: Optional[List[ReconciliationItem]] = None
    difference: Optional[float] = None
    status: Optional[ReconciliationStatusEnum] = None


class BankReconciliationResponse(BankReconciliationBase):
    reconciliation_id: str
    company_id: str
    account_id: str
    connection_id: Optional[str] = None
    status: ReconciliationStatusEnum
    reconciled_by: Optional[str] = None
    reconciled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bank Institution Schemas
class BankInstitutionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)
    website_url: Optional[str] = Field(None, max_length=500)
    routing_number: Optional[str] = Field(None, max_length=20)
    supports_ofx: bool = Field(default=False)
    supports_direct_connect: bool = Field(default=False)
    ofx_url: Optional[str] = Field(None, max_length=500)
    ofx_fid: Optional[str] = Field(None, max_length=50)
    ofx_org: Optional[str] = Field(None, max_length=100)
    is_active: bool = Field(default=True)


class BankInstitutionCreate(BankInstitutionBase):
    pass


class BankInstitutionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)
    website_url: Optional[str] = Field(None, max_length=500)
    routing_number: Optional[str] = Field(None, max_length=20)
    supports_ofx: Optional[bool] = None
    supports_direct_connect: Optional[bool] = None
    ofx_url: Optional[str] = Field(None, max_length=500)
    ofx_fid: Optional[str] = Field(None, max_length=50)
    ofx_org: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class BankInstitutionResponse(BankInstitutionBase):
    institution_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bank Statement Import Schemas
class BankStatementImportBase(BaseModel):
    file_name: str = Field(..., min_length=1, max_length=255)
    file_type: str = Field(..., description="File type: ofx, qfx, csv")
    file_size: int = Field(..., gt=0)
    transactions_count: int = Field(default=0)
    imported_count: int = Field(default=0)
    duplicate_count: int = Field(default=0)
    error_count: int = Field(default=0)
    import_status: ImportStatusEnum = Field(default=ImportStatusEnum.PENDING)
    error_message: Optional[str] = None
    import_data: Optional[Dict[str, Any]] = None


class BankStatementImportCreate(BankStatementImportBase):
    connection_id: Optional[str] = None


class BankStatementImportUpdate(BaseModel):
    transactions_count: Optional[int] = None
    imported_count: Optional[int] = None
    duplicate_count: Optional[int] = None
    error_count: Optional[int] = None
    import_status: Optional[ImportStatusEnum] = None
    error_message: Optional[str] = None
    import_data: Optional[Dict[str, Any]] = None


class BankStatementImportResponse(BankStatementImportBase):
    import_id: str
    company_id: str
    connection_id: Optional[str] = None
    imported_by: str
    imported_at: datetime

    class Config:
        from_attributes = True


# File Upload Schemas
class FileUploadResponse(BaseModel):
    file_id: str
    file_name: str
    file_size: int
    file_type: str
    upload_status: str
    preview_data: Optional[List[Dict[str, Any]]] = None
    error_message: Optional[str] = None


# Transaction Matching Schemas
class TransactionMatchRequest(BaseModel):
    bank_transaction_id: str
    quickbooks_transaction_id: str
    match_type: str = Field(default="manual")  # manual, auto, suggested


class TransactionMatchResponse(BaseModel):
    success: bool
    message: str
    matched_transaction_id: Optional[str] = None


class TransactionIgnoreRequest(BaseModel):
    bank_transaction_id: str
    reason: Optional[str] = None


class BatchActionRequest(BaseModel):
    transaction_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., description="Action to perform: match, ignore, categorize")
    parameters: Optional[Dict[str, Any]] = None


class BatchActionResponse(BaseModel):
    success: bool
    processed_count: int
    failed_count: int
    errors: List[str] = Field(default_factory=list)


# Search and Filter Schemas
class BankTransactionFilter(BaseModel):
    connection_id: Optional[str] = None
    status: Optional[TransactionStatusEnum] = None
    transaction_type: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    amount_min: Optional[float] = None
    amount_max: Optional[float] = None
    description_contains: Optional[str] = None
    merchant_name_contains: Optional[str] = None
    category: Optional[str] = None
    pending: Optional[bool] = None


class InstitutionSearchFilter(BaseModel):
    name_contains: Optional[str] = None
    routing_number: Optional[str] = None
    supports_ofx: Optional[bool] = None
    supports_direct_connect: Optional[bool] = None
    is_active: Optional[bool] = True


# Response wrapper for lists
class BankTransactionListResponse(BaseModel):
    transactions: List[BankTransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class BankConnectionListResponse(BaseModel):
    connections: List[BankConnectionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class BankRuleListResponse(BaseModel):
    rules: List[BankRuleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class BankInstitutionListResponse(BaseModel):
    institutions: List[BankInstitutionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int