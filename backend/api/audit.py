from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime
from database.connection import get_db
from services.auth_service import AuthService
from services.audit_service import AuditService
from services.security_service import SecurityService
from services.security import get_current_user
from models.user import User
from schemas.audit_schemas import (
    AuditLogResponse, AuditLogFilter, AuditLogList,
    AuditReportRequest, AuditReportResponse
)
from models.audit import SecurityEvent
from schemas.audit_schemas import SecurityLogCreate
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
import structlog

logger = structlog.get_logger()

# Create router
router = APIRouter(prefix="/companies/{company_id}/audit", tags=["audit"])

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Auth service
auth_service = AuthService()

@router.get("/logs", response_model=AuditLogList)
@limiter.limit("30/minute")
async def get_audit_logs(
    request: Request,
    company_id: str,
    table_name: Optional[str] = Query(None, description="Filter by table name"),
    record_id: Optional[str] = Query(None, description="Filter by record ID"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    date_from: Optional[datetime] = Query(None, description="Filter from date"),
    date_to: Optional[datetime] = Query(None, description="Filter to date"),
    search: Optional[str] = Query(None, description="Search in change reason or fields"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get audit logs for a company with filtering and pagination
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check audit read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "audit", "read"):
            # Log security event
            await security_service.create_security_log(SecurityLogCreate(
                user_id=current_user.user_id,
                company_id=company_id,
                event_type=SecurityEvent.PERMISSION_DENIED,
                success=False,
                ip_address=get_remote_address(request),
                user_agent=request.headers.get("user-agent"),
                endpoint="/audit/logs",
                request_method="GET",
                details={"resource": "audit", "action": "read"}
            ))
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view audit logs"
            )
        
        # Create filter object
        filters = AuditLogFilter(
            table_name=table_name,
            record_id=record_id,
            action=action,
            user_id=user_id,
            date_from=date_from,
            date_to=date_to,
            search=search
        )
        
        # Get audit logs
        audit_service = AuditService(db)
        audit_logs = await audit_service.get_audit_logs(company_id, filters, page, page_size)
        
        # Log access to audit logs
        await security_service.create_security_log(SecurityLogCreate(
            user_id=current_user.user_id,
            company_id=company_id,
            event_type=SecurityEvent.SENSITIVE_DATA_ACCESS,
            success=True,
            ip_address=get_remote_address(request),
            user_agent=request.headers.get("user-agent"),
            endpoint="/audit/logs",
            request_method="GET",
            details={"resource": "audit_logs", "records_accessed": len(audit_logs.items)}
        ))
        
        return audit_logs
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get audit logs", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit logs"
        )

@router.get("/logs/{audit_id}", response_model=AuditLogResponse)
@limiter.limit("60/minute")
async def get_audit_log(
    request: Request,
    company_id: str,
    audit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific audit log by ID
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check audit read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "audit", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view audit logs"
            )
        
        # Get audit log
        audit_service = AuditService(db)
        audit_log = await audit_service.get_audit_log_by_id(company_id, audit_id)
        
        if not audit_log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit log not found"
            )
        
        return audit_log
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get audit log", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit log"
        )

@router.get("/logs/transaction/{transaction_id}", response_model=List[AuditLogResponse])
@limiter.limit("30/minute")
async def get_transaction_audit_logs(
    request: Request,
    company_id: str,
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get audit logs for a specific transaction
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check audit read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "audit", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view audit logs"
            )
        
        # Get transaction audit logs
        audit_service = AuditService(db)
        audit_logs = await audit_service.get_audit_logs_by_transaction(company_id, transaction_id)
        
        return audit_logs
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get transaction audit logs", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve transaction audit logs"
        )

@router.get("/logs/user/{user_id}", response_model=List[AuditLogResponse])
@limiter.limit("30/minute")
async def get_user_audit_logs(
    request: Request,
    company_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get audit logs for a specific user
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check audit read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "audit", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view audit logs"
            )
        
        # Get user audit logs
        audit_service = AuditService(db)
        audit_logs = await audit_service.get_audit_logs_by_user(company_id, user_id)
        
        return audit_logs
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get user audit logs", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user audit logs"
        )

@router.post("/reports", response_model=AuditReportResponse)
@limiter.limit("10/minute")
async def generate_audit_report(
    request: Request,
    company_id: str,
    report_request: AuditReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate audit report in various formats
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check audit export permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "audit", "export"):
            # Log security event
            await security_service.create_security_log(SecurityLogCreate(
                user_id=current_user.user_id,
                company_id=company_id,
                event_type=SecurityEvent.PERMISSION_DENIED,
                success=False,
                ip_address=get_remote_address(request),
                user_agent=request.headers.get("user-agent"),
                endpoint="/audit/reports",
                request_method="POST",
                details={"resource": "audit", "action": "export"}
            ))
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to export audit reports"
            )
        
        # Generate report
        audit_service = AuditService(db)
        report = await audit_service.generate_audit_report(company_id, report_request)
        
        # Log data export
        await security_service.create_security_log(SecurityLogCreate(
            user_id=current_user.user_id,
            company_id=company_id,
            event_type=SecurityEvent.DATA_EXPORT,
            success=True,
            ip_address=get_remote_address(request),
            user_agent=request.headers.get("user-agent"),
            endpoint="/audit/reports",
            request_method="POST",
            details={
                "resource": "audit_report",
                "report_type": report_request.report_type,
                "format": report_request.format,
                "records_exported": report.total_records
            }
        ))
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to generate audit report", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate audit report"
        )

@router.get("/summary")
@limiter.limit("20/minute")
async def get_audit_summary(
    request: Request,
    company_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days for summary"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get audit summary statistics
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check audit read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "audit", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view audit summary"
            )
        
        # Get audit summary
        audit_service = AuditService(db)
        summary = await audit_service.get_audit_summary(company_id, days)
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get audit summary", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit summary"
        )