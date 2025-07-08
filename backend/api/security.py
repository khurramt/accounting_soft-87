from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime
from database.connection import get_db
from services.auth_service import AuthService
from services.security_service import SecurityService
from services.security import get_current_user
from models.user import User
from schemas.audit_schemas import (
    SecurityLogResponse, SecurityLogFilter, SecurityLogList,
    RoleCreate, RoleResponse, RoleUpdate, RoleList,
    UserPermissionCreate, UserPermissionResponse, UserPermissionUpdate, UserPermissionList,
    SecuritySettingsBase, SecuritySettingsResponse
)
from models.audit import SecurityEvent
from schemas.audit_schemas import SecurityLogCreate
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
import structlog

logger = structlog.get_logger()

# Create router
router = APIRouter(prefix="/companies/{company_id}/security", tags=["security"])

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Auth service
auth_service = AuthService()

# Security Logs Endpoints
@router.get("/logs", response_model=SecurityLogList)
@limiter.limit("30/minute")
async def get_security_logs(
    request: Request,
    company_id: str,
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    success: Optional[bool] = Query(None, description="Filter by success status"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    threat_level: Optional[str] = Query(None, description="Filter by threat level"),
    date_from: Optional[datetime] = Query(None, description="Filter from date"),
    date_to: Optional[datetime] = Query(None, description="Filter to date"),
    ip_address: Optional[str] = Query(None, description="Filter by IP address"),
    min_risk_score: Optional[int] = Query(None, ge=0, le=100, description="Minimum risk score"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get security logs for a company with filtering and pagination
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check security read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "security", "read"):
            # Log security event
            await security_service.create_security_log(SecurityLogCreate(
                user_id=current_user.user_id,
                company_id=company_id,
                event_type=SecurityEvent.PERMISSION_DENIED,
                success=False,
                ip_address=get_remote_address(request),
                user_agent=request.headers.get("user-agent"),
                endpoint="/security/logs",
                request_method="GET",
                details={"resource": "security", "action": "read"}
            ))
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view security logs"
            )
        
        # Create filter object
        filters = SecurityLogFilter(
            event_type=event_type,
            success=success,
            user_id=user_id,
            threat_level=threat_level,
            date_from=date_from,
            date_to=date_to,
            ip_address=ip_address,
            min_risk_score=min_risk_score
        )
        
        # Get security logs
        security_logs = await security_service.get_security_logs(company_id, filters, page, page_size)
        
        # Log access to security logs
        await security_service.create_security_log(SecurityLogCreate(
            user_id=current_user.user_id,
            company_id=company_id,
            event_type=SecurityEvent.SENSITIVE_DATA_ACCESS,
            success=True,
            ip_address=get_remote_address(request),
            user_agent=request.headers.get("user-agent"),
            endpoint="/security/logs",
            request_method="GET",
            details={"resource": "security_logs", "records_accessed": len(security_logs.items)}
        ))
        
        return security_logs
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get security logs", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve security logs"
        )

@router.get("/summary")
@limiter.limit("20/minute")
async def get_security_summary(
    request: Request,
    company_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days for summary"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get security summary statistics
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check security read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "security", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view security summary"
            )
        
        # Get security summary
        summary = await security_service.get_security_summary(company_id, days)
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get security summary", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve security summary"
        )

# Role Management Endpoints
@router.get("/roles", response_model=RoleList)
@limiter.limit("30/minute")
async def get_roles(
    request: Request,
    company_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get roles for a company
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check roles read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "roles", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view roles"
            )
        
        # Get roles
        roles = await security_service.get_roles(company_id, page, page_size)
        
        return roles
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get roles", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve roles"
        )

@router.post("/roles", response_model=RoleResponse)
@limiter.limit("10/minute")
async def create_role(
    request: Request,
    company_id: str,
    role_data: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new role
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check roles write permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "roles", "write"):
            # Log security event
            await security_service.create_security_log(SecurityLogCreate(
                user_id=current_user.user_id,
                company_id=company_id,
                event_type=SecurityEvent.PERMISSION_DENIED,
                success=False,
                ip_address=get_remote_address(request),
                user_agent=request.headers.get("user-agent"),
                endpoint="/security/roles",
                request_method="POST",
                details={"resource": "roles", "action": "write"}
            ))
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create roles"
            )
        
        # Set company ID
        role_data.company_id = company_id
        
        # Create role
        role = await security_service.create_role(role_data)
        
        # Log role creation
        await security_service.create_security_log(SecurityLogCreate(
            user_id=current_user.user_id,
            company_id=company_id,
            event_type=SecurityEvent.SENSITIVE_DATA_ACCESS,
            success=True,
            ip_address=get_remote_address(request),
            user_agent=request.headers.get("user-agent"),
            endpoint="/security/roles",
            request_method="POST",
            details={"resource": "role", "action": "create", "role_name": role_data.role_name}
        ))
        
        return role
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create role", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create role"
        )

@router.get("/roles/{role_id}", response_model=RoleResponse)
@limiter.limit("60/minute")
async def get_role(
    request: Request,
    company_id: str,
    role_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific role by ID
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check roles read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "roles", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view roles"
            )
        
        # Get role (implementation would need to be added to SecurityService)
        # For now, return a placeholder response
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Get role by ID not implemented yet"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get role", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve role"
        )

@router.put("/roles/{role_id}", response_model=RoleResponse)
@limiter.limit("10/minute")
async def update_role(
    request: Request,
    company_id: str,
    role_id: str,
    role_data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a role
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check roles write permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "roles", "write"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update roles"
            )
        
        # Update role (implementation would need to be added to SecurityService)
        # For now, return a placeholder response
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Update role not implemented yet"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update role", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update role"
        )

# User Permission Endpoints
@router.get("/users/{user_id}/permissions", response_model=UserPermissionList)
@limiter.limit("30/minute")
async def get_user_permissions(
    request: Request,
    company_id: str,
    user_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get permissions for a specific user
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check permissions read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "permissions", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view user permissions"
            )
        
        # Get user permissions
        permissions = await security_service.get_user_permissions(company_id, user_id, page, page_size)
        return permissions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get user permissions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user permissions"
        )

@router.put("/users/{user_id}/permissions", response_model=List[UserPermissionResponse])
@limiter.limit("10/minute")
async def update_user_permissions(
    request: Request,
    company_id: str,
    user_id: str,
    permissions: List[UserPermissionCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update permissions for a specific user
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check permissions write permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "permissions", "write"):
            # Log security event
            await security_service.create_security_log(SecurityLogCreate(
                user_id=current_user.user_id,
                company_id=company_id,
                event_type=SecurityEvent.PERMISSION_DENIED,
                success=False,
                ip_address=get_remote_address(request),
                user_agent=request.headers.get("user-agent"),
                endpoint=f"/security/users/{user_id}/permissions",
                request_method="PUT",
                details={"resource": "permissions", "action": "write"}
            ))
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update user permissions"
            )
        
        # Update user permissions (implementation would need to be added to SecurityService)
        # For now, return a placeholder response
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Update user permissions not implemented yet"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update user permissions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user permissions"
        )

# Security Settings Endpoints
@router.get("/settings", response_model=SecuritySettingsResponse)
@limiter.limit("30/minute")
async def get_security_settings(
    request: Request,
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get security settings for a company
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check settings read permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "settings", "read"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view security settings"
            )
        
        # Get security settings
        settings = await security_service.get_security_settings(company_id)
        return settings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get security settings", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve security settings"
        )

@router.put("/settings", response_model=SecuritySettingsResponse)
@limiter.limit("10/minute")
async def update_security_settings(
    request: Request,
    company_id: str,
    settings: SecuritySettingsBase,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update security settings for a company
    """
    try:
        # Check if user has access to this company
        if not await auth_service.check_company_access(current_user.user_id, company_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Check settings write permission
        security_service = SecurityService(db)
        if not await security_service.check_user_permissions(current_user.user_id, company_id, "settings", "write"):
            # Log security event
            await security_service.create_security_log(SecurityLogCreate(
                user_id=current_user.user_id,
                company_id=company_id,
                event_type=SecurityEvent.PERMISSION_DENIED,
                success=False,
                ip_address=get_remote_address(request),
                user_agent=request.headers.get("user-agent"),
                endpoint="/security/settings",
                request_method="PUT",
                details={"resource": "settings", "action": "write"}
            ))
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update security settings"
            )
        
        # Update security settings
        updated_settings = await security_service.update_security_settings(company_id, settings)
        return updated_settings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update security settings", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update security settings"
        )