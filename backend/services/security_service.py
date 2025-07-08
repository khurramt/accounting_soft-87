from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, update
from sqlalchemy.orm import selectinload
from models.audit import SecurityLog, Role, UserPermission, SecuritySetting, SecurityEvent
from models.user import User, Company, CompanyMembership, UserRole
from schemas.audit_schemas import (
    SecurityLogCreate, SecurityLogResponse, SecurityLogFilter, SecurityLogList,
    RoleCreate, RoleResponse, RoleUpdate, RoleList,
    UserPermissionCreate, UserPermissionResponse, UserPermissionUpdate, UserPermissionList,
    SecuritySettingsBase, SecuritySettingsResponse
)
from fastapi import HTTPException, status
import structlog
import uuid
from math import ceil
import re
import ipaddress
from collections import defaultdict

logger = structlog.get_logger()

class SecurityService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_security_log(self, log_data: SecurityLogCreate) -> SecurityLogResponse:
        """Create a new security log entry"""
        try:
            # Calculate risk score and threat level if not provided
            risk_score = log_data.risk_score
            threat_level = log_data.threat_level
            
            if risk_score == 0:
                risk_score = self._calculate_risk_score(log_data.event_type, log_data.success, log_data.details)
            
            if threat_level == "low":
                threat_level = self._determine_threat_level(risk_score)
            
            # Create security log entry
            security_log = SecurityLog(
                user_id=log_data.user_id,
                company_id=log_data.company_id,
                event_type=log_data.event_type,
                success=log_data.success,
                ip_address=log_data.ip_address,
                user_agent=log_data.user_agent,
                endpoint=log_data.endpoint,
                request_method=log_data.request_method,
                details=log_data.details,
                risk_score=risk_score,
                threat_level=threat_level
            )
            
            self.db.add(security_log)
            await self.db.commit()
            await self.db.refresh(security_log)
            
            # Check for suspicious patterns
            await self._check_suspicious_patterns(security_log)
            
            logger.info("Security log created", 
                       log_id=security_log.log_id,
                       event_type=log_data.event_type.value,
                       success=log_data.success,
                       risk_score=risk_score,
                       threat_level=threat_level)
            
            return SecurityLogResponse.model_validate(security_log)
            
        except Exception as e:
            logger.error("Failed to create security log", error=str(e))
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create security log"
            )
    
    async def get_security_logs(self, company_id: str, filters: SecurityLogFilter, 
                               page: int = 1, page_size: int = 50) -> SecurityLogList:
        """Get security logs with filtering and pagination"""
        try:
            # Build query
            query = select(SecurityLog).where(
                or_(
                    SecurityLog.company_id == company_id,
                    SecurityLog.company_id.is_(None)  # Include company-agnostic logs
                )
            )
            
            # Apply filters
            if filters.event_type:
                query = query.where(SecurityLog.event_type == filters.event_type)
            
            if filters.success is not None:
                query = query.where(SecurityLog.success == filters.success)
            
            if filters.user_id:
                query = query.where(SecurityLog.user_id == filters.user_id)
            
            if filters.threat_level:
                query = query.where(SecurityLog.threat_level == filters.threat_level)
            
            if filters.date_from:
                query = query.where(SecurityLog.created_at >= filters.date_from)
            
            if filters.date_to:
                query = query.where(SecurityLog.created_at <= filters.date_to)
            
            if filters.ip_address:
                query = query.where(SecurityLog.ip_address == filters.ip_address)
            
            if filters.min_risk_score is not None:
                query = query.where(SecurityLog.risk_score >= filters.min_risk_score)
            
            # Count total records
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Apply pagination and ordering
            query = query.order_by(desc(SecurityLog.created_at))
            query = query.offset((page - 1) * page_size).limit(page_size)
            
            # Execute query
            result = await self.db.execute(query)
            security_logs = result.scalars().all()
            
            # Convert to response models
            items = [SecurityLogResponse.model_validate(log) for log in security_logs]
            
            return SecurityLogList(
                items=items,
                total=total,
                page=page,
                page_size=page_size,
                total_pages=ceil(total / page_size) if total > 0 else 0
            )
            
        except Exception as e:
            logger.error("Failed to get security logs", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve security logs"
            )
    
    async def get_security_summary(self, company_id: str, days: int = 30) -> Dict[str, Any]:
        """Get security summary statistics"""
        try:
            date_from = datetime.now(timezone.utc) - timedelta(days=days)
            
            # Total security events
            total_query = select(func.count(SecurityLog.log_id)).where(
                and_(
                    or_(
                        SecurityLog.company_id == company_id,
                        SecurityLog.company_id.is_(None)
                    ),
                    SecurityLog.created_at >= date_from
                )
            )
            total_result = await self.db.execute(total_query)
            total_events = total_result.scalar()
            
            # Failed events
            failed_query = select(func.count(SecurityLog.log_id)).where(
                and_(
                    or_(
                        SecurityLog.company_id == company_id,
                        SecurityLog.company_id.is_(None)
                    ),
                    SecurityLog.created_at >= date_from,
                    SecurityLog.success == False
                )
            )
            failed_result = await self.db.execute(failed_query)
            failed_events = failed_result.scalar()
            
            # High risk events
            high_risk_query = select(func.count(SecurityLog.log_id)).where(
                and_(
                    or_(
                        SecurityLog.company_id == company_id,
                        SecurityLog.company_id.is_(None)
                    ),
                    SecurityLog.created_at >= date_from,
                    SecurityLog.risk_score >= 70
                )
            )
            high_risk_result = await self.db.execute(high_risk_query)
            high_risk_events = high_risk_result.scalar()
            
            # Events by type
            event_query = select(
                SecurityLog.event_type,
                func.count(SecurityLog.log_id).label("count")
            ).where(
                and_(
                    or_(
                        SecurityLog.company_id == company_id,
                        SecurityLog.company_id.is_(None)
                    ),
                    SecurityLog.created_at >= date_from
                )
            ).group_by(SecurityLog.event_type)
            
            event_result = await self.db.execute(event_query)
            events_data = {row.event_type.value: row.count for row in event_result}
            
            # Top risk IPs
            ip_query = select(
                SecurityLog.ip_address,
                func.avg(SecurityLog.risk_score).label("avg_risk"),
                func.count(SecurityLog.log_id).label("count")
            ).where(
                and_(
                    or_(
                        SecurityLog.company_id == company_id,
                        SecurityLog.company_id.is_(None)
                    ),
                    SecurityLog.created_at >= date_from,
                    SecurityLog.ip_address.is_not(None)
                )
            ).group_by(SecurityLog.ip_address).order_by(desc(func.avg(SecurityLog.risk_score))).limit(10)
            
            ip_result = await self.db.execute(ip_query)
            ips_data = {
                row.ip_address: {
                    "avg_risk_score": float(row.avg_risk),
                    "event_count": row.count
                }
                for row in ip_result
            }
            
            return {
                "total_events": total_events,
                "failed_events": failed_events,
                "high_risk_events": high_risk_events,
                "success_rate": (total_events - failed_events) / total_events * 100 if total_events > 0 else 0,
                "period_days": days,
                "events_by_type": events_data,
                "top_risk_ips": ips_data,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to get security summary", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get security summary"
            )
    
    async def check_user_permissions(self, user_id: str, company_id: str, 
                                   resource: str, action: str) -> bool:
        """Check if user has specific permission for a resource"""
        try:
            # Check direct permissions
            permission_query = select(UserPermission).where(
                and_(
                    UserPermission.user_id == user_id,
                    UserPermission.company_id == company_id,
                    UserPermission.resource == resource,
                    UserPermission.is_active == True,
                    or_(
                        UserPermission.expires_at.is_(None),
                        UserPermission.expires_at > datetime.now(timezone.utc)
                    )
                )
            )
            
            result = await self.db.execute(permission_query)
            permissions = result.scalars().all()
            
            # Check if user has the required action
            for permission in permissions:
                if action in permission.actions:
                    return True
            
            # Check role-based permissions
            membership_query = select(CompanyMembership).where(
                and_(
                    CompanyMembership.user_id == user_id,
                    CompanyMembership.company_id == company_id,
                    CompanyMembership.is_active == True
                )
            )
            
            membership_result = await self.db.execute(membership_query)
            membership = membership_result.scalar_one_or_none()
            
            if membership:
                # Check default role permissions
                role_permissions = self._get_default_role_permissions(membership.role)
                if resource in role_permissions and action in role_permissions[resource]:
                    return True
            
            return False
            
        except Exception as e:
            logger.error("Failed to check user permissions", error=str(e))
            return False
    
    async def create_role(self, role_data: RoleCreate) -> RoleResponse:
        """Create a new role"""
        try:
            # Check if role already exists
            existing_query = select(Role).where(
                and_(
                    Role.role_name == role_data.role_name,
                    Role.company_id == role_data.company_id
                )
            )
            
            existing_result = await self.db.execute(existing_query)
            existing_role = existing_result.scalar_one_or_none()
            
            if existing_role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Role with this name already exists"
                )
            
            # Create new role
            role = Role(
                company_id=role_data.company_id,
                role_name=role_data.role_name,
                description=role_data.description,
                permissions=role_data.permissions,
                is_active=role_data.is_active,
                parent_role_id=role_data.parent_role_id
            )
            
            self.db.add(role)
            await self.db.commit()
            await self.db.refresh(role)
            
            logger.info("Role created", role_id=role.role_id, role_name=role_data.role_name)
            
            return RoleResponse.model_validate(role)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to create role", error=str(e))
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create role"
            )
    
    async def get_roles(self, company_id: str, page: int = 1, page_size: int = 50) -> RoleList:
        """Get roles for a company"""
        try:
            # Build query
            query = select(Role).where(
                or_(
                    Role.company_id == company_id,
                    Role.is_system_role == True
                )
            )
            
            # Count total records
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Apply pagination and ordering
            query = query.order_by(Role.role_name)
            query = query.offset((page - 1) * page_size).limit(page_size)
            
            # Execute query
            result = await self.db.execute(query)
            roles = result.scalars().all()
            
            # Convert to response models
            items = [RoleResponse.model_validate(role) for role in roles]
            
            return RoleList(
                items=items,
                total=total,
                page=page,
                page_size=page_size,
                total_pages=ceil(total / page_size) if total > 0 else 0
            )
            
        except Exception as e:
            logger.error("Failed to get roles", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve roles"
            )
    
    def _calculate_risk_score(self, event_type: SecurityEvent, success: bool, details: Optional[Dict[str, Any]]) -> int:
        """Calculate risk score based on event type and context"""
        base_scores = {
            SecurityEvent.LOGIN_SUCCESS: 0,
            SecurityEvent.LOGIN_FAILED: 30,
            SecurityEvent.PASSWORD_CHANGED: 10,
            SecurityEvent.ACCOUNT_LOCKED: 50,
            SecurityEvent.ACCOUNT_UNLOCKED: 20,
            SecurityEvent.SUSPICIOUS_ACTIVITY: 80,
            SecurityEvent.PERMISSION_DENIED: 40,
            SecurityEvent.SESSION_EXPIRED: 5,
            SecurityEvent.MULTIPLE_SESSIONS: 25,
            SecurityEvent.UNAUTHORIZED_ACCESS: 90,
            SecurityEvent.DATA_EXPORT: 30,
            SecurityEvent.SENSITIVE_DATA_ACCESS: 40
        }
        
        score = base_scores.get(event_type, 20)
        
        # Adjust for failure
        if not success:
            score += 20
        
        # Adjust based on details
        if details:
            if details.get("repeated_attempts", 0) > 3:
                score += 30
            if details.get("unusual_location"):
                score += 20
            if details.get("suspicious_user_agent"):
                score += 15
        
        return min(score, 100)
    
    def _determine_threat_level(self, risk_score: int) -> str:
        """Determine threat level based on risk score"""
        if risk_score >= 80:
            return "critical"
        elif risk_score >= 60:
            return "high"
        elif risk_score >= 30:
            return "medium"
        else:
            return "low"
    
    def _get_default_role_permissions(self, role: UserRole) -> Dict[str, List[str]]:
        """Get default permissions for user roles"""
        role_permissions = {
            UserRole.ADMIN: {
                "users": ["read", "write", "delete"],
                "companies": ["read", "write", "delete"],
                "transactions": ["read", "write", "delete"],
                "reports": ["read", "write", "export"],
                "settings": ["read", "write"],
                "audit": ["read", "export"],
                "security": ["read", "write", "delete"]
            },
            UserRole.MANAGER: {
                "users": ["read", "write"],
                "companies": ["read", "write"],
                "transactions": ["read", "write"],
                "reports": ["read", "write", "export"],
                "settings": ["read"],
                "audit": ["read"]
            },
            UserRole.ACCOUNTANT: {
                "transactions": ["read", "write"],
                "reports": ["read", "write", "export"],
                "customers": ["read", "write"],
                "vendors": ["read", "write"],
                "items": ["read", "write"]
            },
            UserRole.EMPLOYEE: {
                "transactions": ["read"],
                "reports": ["read"],
                "customers": ["read"],
                "vendors": ["read"],
                "items": ["read"]
            },
            UserRole.VIEWER: {
                "transactions": ["read"],
                "reports": ["read"],
                "customers": ["read"],
                "vendors": ["read"],
                "items": ["read"]
            }
        }
        
        return role_permissions.get(role, {})
    
    async def _check_suspicious_patterns(self, security_log: SecurityLog):
        """Check for suspicious patterns in security events"""
        try:
            # Check for repeated failed logins
            if security_log.event_type == SecurityEvent.LOGIN_FAILED:
                await self._check_repeated_failed_logins(security_log)
            
            # Check for unusual access patterns
            if security_log.event_type == SecurityEvent.LOGIN_SUCCESS:
                await self._check_unusual_access_patterns(security_log)
            
            # Check for suspicious data access
            if security_log.event_type == SecurityEvent.SENSITIVE_DATA_ACCESS:
                await self._check_suspicious_data_access(security_log)
        
        except Exception as e:
            logger.error("Failed to check suspicious patterns", error=str(e))
    
    async def _check_repeated_failed_logins(self, security_log: SecurityLog):
        """Check for repeated failed login attempts"""
        try:
            # Check last 15 minutes
            time_window = datetime.now(timezone.utc) - timedelta(minutes=15)
            
            query = select(func.count(SecurityLog.log_id)).where(
                and_(
                    SecurityLog.ip_address == security_log.ip_address,
                    SecurityLog.event_type == SecurityEvent.LOGIN_FAILED,
                    SecurityLog.created_at >= time_window
                )
            )
            
            result = await self.db.execute(query)
            failed_count = result.scalar()
            
            if failed_count >= 5:
                # Create suspicious activity log
                suspicious_log = SecurityLogCreate(
                    user_id=security_log.user_id,
                    company_id=security_log.company_id,
                    event_type=SecurityEvent.SUSPICIOUS_ACTIVITY,
                    success=False,
                    ip_address=security_log.ip_address,
                    user_agent=security_log.user_agent,
                    details={
                        "pattern": "repeated_failed_logins",
                        "failed_attempts": failed_count,
                        "time_window_minutes": 15
                    },
                    risk_score=85,
                    threat_level="high"
                )
                
                await self.create_security_log(suspicious_log)
        
        except Exception as e:
            logger.error("Failed to check repeated failed logins", error=str(e))
    
    async def _check_unusual_access_patterns(self, security_log: SecurityLog):
        """Check for unusual access patterns"""
        try:
            if not security_log.user_id:
                return
            
            # Check for access from new IP
            query = select(func.count(SecurityLog.log_id)).where(
                and_(
                    SecurityLog.user_id == security_log.user_id,
                    SecurityLog.ip_address == security_log.ip_address,
                    SecurityLog.event_type == SecurityEvent.LOGIN_SUCCESS,
                    SecurityLog.created_at < security_log.created_at
                )
            )
            
            result = await self.db.execute(query)
            previous_logins = result.scalar()
            
            if previous_logins == 0:
                # First time login from this IP
                suspicious_log = SecurityLogCreate(
                    user_id=security_log.user_id,
                    company_id=security_log.company_id,
                    event_type=SecurityEvent.SUSPICIOUS_ACTIVITY,
                    success=True,
                    ip_address=security_log.ip_address,
                    user_agent=security_log.user_agent,
                    details={
                        "pattern": "new_ip_login",
                        "previous_logins_from_ip": previous_logins
                    },
                    risk_score=40,
                    threat_level="medium"
                )
                
                await self.create_security_log(suspicious_log)
        
        except Exception as e:
            logger.error("Failed to check unusual access patterns", error=str(e))
    
    async def _check_suspicious_data_access(self, security_log: SecurityLog):
        """Check for suspicious data access patterns"""
        try:
            # Check for bulk data access
            if security_log.details and security_log.details.get("bulk_access"):
                suspicious_log = SecurityLogCreate(
                    user_id=security_log.user_id,
                    company_id=security_log.company_id,
                    event_type=SecurityEvent.SUSPICIOUS_ACTIVITY,
                    success=True,
                    ip_address=security_log.ip_address,
                    user_agent=security_log.user_agent,
                    details={
                        "pattern": "bulk_data_access",
                        "records_accessed": security_log.details.get("records_count", 0)
                    },
                    risk_score=60,
                    threat_level="high"
                )
                
                await self.create_security_log(suspicious_log)
        
        except Exception as e:
            logger.error("Failed to check suspicious data access", error=str(e))