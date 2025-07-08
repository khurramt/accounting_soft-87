from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum, Numeric
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String as SQLString

class ReportType(str, Enum):
    STANDARD = "standard"
    CUSTOM = "custom"
    MEMORIZED = "memorized"
    SCHEDULED = "scheduled"

class ReportFormat(str, Enum):
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"
    HTML = "html"

class ReportStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ReportCategory(str, Enum):
    COMPANY_FINANCIAL = "company_financial"
    CUSTOMERS_RECEIVABLES = "customers_receivables"
    VENDORS_PAYABLES = "vendors_payables"
    EMPLOYEES_PAYROLL = "employees_payroll"
    BANKING = "banking"
    BUDGETS_FORECASTS = "budgets_forecasts"
    CUSTOM = "custom"

# Report definitions table
class ReportDefinition(Base):
    __tablename__ = "report_definitions"
    
    report_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_name = Column(String(255), nullable=False)
    report_category = Column(SQLEnum(ReportCategory), nullable=False)
    report_type = Column(SQLEnum(ReportType), default=ReportType.STANDARD)
    
    # Query and template information
    sql_template = Column(Text)
    parameters = Column(JSON, default=lambda: {})
    default_filters = Column(JSON, default=lambda: {})
    column_definitions = Column(JSON, default=lambda: {})
    
    # Access and permissions
    access_permissions = Column(JSON, default=lambda: {"public": True})
    is_system_report = Column(Boolean, default=False)
    
    # Metadata
    description = Column(Text)
    created_by = Column(SQLString(36), ForeignKey("users.user_id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])
    memorized_reports = relationship("MemorizedReport", back_populates="report_definition")
    executions = relationship("ReportExecution", back_populates="report_definition")
    
    def __repr__(self):
        return f"<ReportDefinition {self.report_name}>"

# Memorized reports table
class MemorizedReport(Base):
    __tablename__ = "memorized_reports"
    
    memorized_report_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    report_id = Column(SQLString(36), ForeignKey("report_definitions.report_id"), nullable=False)
    
    # Report configuration
    report_name = Column(String(255), nullable=False)
    parameters = Column(JSON, default=lambda: {})
    filters = Column(JSON, default=lambda: {})
    formatting = Column(JSON, default=lambda: {})
    
    # Organization
    group_id = Column(SQLString(36), ForeignKey("memorized_report_groups.group_id"))
    
    # Scheduling information
    is_scheduled = Column(Boolean, default=False)
    schedule_frequency = Column(String(50))  # daily, weekly, monthly, quarterly, annually
    schedule_config = Column(JSON, default=lambda: {})
    last_run_at = Column(DateTime)
    next_run_at = Column(DateTime)
    
    # Email settings
    email_enabled = Column(Boolean, default=False)
    email_recipients = Column(JSON, default=lambda: [])
    email_subject = Column(String(255))
    email_body = Column(Text)
    
    # Metadata
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    report_definition = relationship("ReportDefinition", back_populates="memorized_reports")
    group = relationship("MemorizedReportGroup", back_populates="reports")
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<MemorizedReport {self.report_name}>"

# Report groups table
class MemorizedReportGroup(Base):
    __tablename__ = "memorized_report_groups"
    
    group_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    
    # Group information
    group_name = Column(String(255), nullable=False)
    description = Column(Text)
    sort_order = Column(Integer, default=0)
    
    # Metadata
    created_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    reports = relationship("MemorizedReport", back_populates="group")
    
    def __repr__(self):
        return f"<MemorizedReportGroup {self.group_name}>"

# Report cache table
class ReportCache(Base):
    __tablename__ = "report_cache"
    
    cache_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cache_key = Column(String(255), unique=True, nullable=False, index=True)
    
    # Cached data
    report_data = Column(JSON, nullable=False)
    parameters = Column(JSON, default=lambda: {})
    
    # Cache metadata
    file_size = Column(Integer)
    row_count = Column(Integer)
    generated_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=False)
    accessed_count = Column(Integer, default=0)
    last_accessed = Column(DateTime)
    
    # Cache statistics
    generation_time_ms = Column(Integer)
    
    def __repr__(self):
        return f"<ReportCache {self.cache_key}>"

# Report execution history table
class ReportExecution(Base):
    __tablename__ = "report_executions"
    
    execution_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(SQLString(36), ForeignKey("companies.company_id"), nullable=False)
    report_id = Column(SQLString(36), ForeignKey("report_definitions.report_id"))
    memorized_report_id = Column(SQLString(36), ForeignKey("memorized_reports.memorized_report_id"))
    
    # Execution details
    executed_by = Column(SQLString(36), ForeignKey("users.user_id"), nullable=False)
    parameters = Column(JSON, default=lambda: {})
    filters = Column(JSON, default=lambda: {})
    
    # Performance metrics
    execution_time_ms = Column(Integer)
    row_count = Column(Integer)
    file_size = Column(Integer)
    
    # Status and results
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING)
    error_message = Column(Text)
    output_format = Column(SQLEnum(ReportFormat))
    output_file_path = Column(String(500))
    
    # Timestamps
    executed_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    report_definition = relationship("ReportDefinition", back_populates="executions")
    memorized_report = relationship("MemorizedReport", foreign_keys=[memorized_report_id])
    executed_by_user = relationship("User", foreign_keys=[executed_by])
    
    def __repr__(self):
        return f"<ReportExecution {self.execution_id}>"

# Report templates for standard financial reports
class ReportTemplate(Base):
    __tablename__ = "report_templates"
    
    template_id = Column(SQLString(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_name = Column(String(255), nullable=False)
    template_type = Column(String(100), nullable=False)  # profit_loss, balance_sheet, cash_flow, etc.
    
    # Template configuration
    template_config = Column(JSON, nullable=False)
    calculation_rules = Column(JSON, default=lambda: {})
    formatting_rules = Column(JSON, default=lambda: {})
    
    # Version information
    version = Column(String(20), default="1.0")
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    def __repr__(self):
        return f"<ReportTemplate {self.template_name}>"