from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base
import uuid
import enum


class ConnectionTypeEnum(str, enum.Enum):
    DIRECT_CONNECT = "direct_connect"
    WEB_CONNECT = "web_connect"
    FILE_IMPORT = "file_import"


class TransactionStatusEnum(str, enum.Enum):
    UNREVIEWED = "unreviewed"
    MATCHED = "matched"
    IGNORED = "ignored"
    PENDING = "pending"
    CLEARED = "cleared"


class ReconciliationStatusEnum(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISCREPANCY = "discrepancy"
    CANCELLED = "cancelled"


class BankConnection(Base):
    __tablename__ = "bank_connections"

    connection_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.company_id"), nullable=False)
    account_id = Column(String(36), ForeignKey("accounts.account_id"), nullable=True)
    bank_name = Column(String(255), nullable=False)
    account_type = Column(String(50), nullable=False)
    account_number_masked = Column(String(50), nullable=False)
    connection_type = Column(Enum(ConnectionTypeEnum), nullable=False)
    institution_id = Column(String(100), nullable=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    credentials_encrypted = Column(Text, nullable=True)
    last_sync_date = Column(DateTime, nullable=True)
    sync_frequency = Column(String(50), default="daily")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="bank_connections")
    account = relationship("Account", back_populates="bank_connections")
    bank_transactions = relationship("BankTransaction", back_populates="bank_connection")
    reconciliations = relationship("BankReconciliation", back_populates="bank_connection")


class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    bank_transaction_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    connection_id = Column(String(36), ForeignKey("bank_connections.connection_id"), nullable=False)
    transaction_id = Column(String(255), nullable=False)  # Bank's transaction ID
    transaction_date = Column(Date, nullable=False)
    posted_date = Column(Date, nullable=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    merchant_name = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    pending = Column(Boolean, default=False)
    balance = Column(Float, nullable=True)
    check_number = Column(String(50), nullable=True)
    reference_number = Column(String(100), nullable=True)
    raw_data = Column(JSON, nullable=True)
    status = Column(Enum(TransactionStatusEnum), default=TransactionStatusEnum.UNREVIEWED)
    matched_transaction_id = Column(String(36), ForeignKey("transactions.transaction_id"), nullable=True)
    quickbooks_transaction_id = Column(String(36), ForeignKey("transactions.transaction_id"), nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    bank_connection = relationship("BankConnection", back_populates="bank_transactions")
    matched_transaction = relationship("Transaction", foreign_keys=[matched_transaction_id])
    quickbooks_transaction = relationship("Transaction", foreign_keys=[quickbooks_transaction_id])


class BankRule(Base):
    __tablename__ = "bank_rules"

    rule_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.company_id"), nullable=False)
    rule_name = Column(String(255), nullable=False)
    conditions = Column(JSON, nullable=False)  # JSON structure for conditions
    actions = Column(JSON, nullable=False)     # JSON structure for actions
    priority = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_by = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="bank_rules")
    created_by_user = relationship("User")


class BankReconciliation(Base):
    __tablename__ = "bank_reconciliations"

    reconciliation_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.company_id"), nullable=False)
    account_id = Column(String(36), ForeignKey("accounts.account_id"), nullable=False)
    connection_id = Column(String(36), ForeignKey("bank_connections.connection_id"), nullable=True)
    statement_date = Column(Date, nullable=False)
    beginning_balance = Column(Float, nullable=False)
    ending_balance = Column(Float, nullable=False)
    service_charge = Column(Float, default=0.0)
    interest_earned = Column(Float, default=0.0)
    reconciled_items = Column(JSON, nullable=True)  # JSON structure for reconciled items
    difference = Column(Float, default=0.0)
    status = Column(Enum(ReconciliationStatusEnum), default=ReconciliationStatusEnum.IN_PROGRESS)
    reconciled_by = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    reconciled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="bank_reconciliations")
    account = relationship("Account", back_populates="bank_reconciliations")
    bank_connection = relationship("BankConnection", back_populates="reconciliations")
    reconciled_by_user = relationship("User")


class BankInstitution(Base):
    __tablename__ = "bank_institutions"

    institution_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    routing_number = Column(String(20), nullable=True)
    supports_ofx = Column(Boolean, default=False)
    supports_direct_connect = Column(Boolean, default=False)
    ofx_url = Column(String(500), nullable=True)
    ofx_fid = Column(String(50), nullable=True)
    ofx_org = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class BankStatementImport(Base):
    __tablename__ = "bank_statement_imports"

    import_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.company_id"), nullable=False)
    connection_id = Column(String(36), ForeignKey("bank_connections.connection_id"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'ofx', 'qfx', 'csv'
    file_size = Column(Integer, nullable=False)
    transactions_count = Column(Integer, default=0)
    imported_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    import_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    import_data = Column(JSON, nullable=True)  # Summary of import results
    imported_by = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    imported_at = Column(DateTime, default=func.now())

    # Relationships
    company = relationship("Company")
    bank_connection = relationship("BankConnection")
    imported_by_user = relationship("User")