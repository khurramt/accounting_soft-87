from typing import Optional, Dict, Any, List, Union
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload
from models.audit import AuditLog, SecurityLog, Role, UserPermission, SecuritySetting
from models.audit import AuditAction, SecurityEvent
from models.user import User, Company
from schemas.audit_schemas import (
    AuditLogCreate, AuditLogResponse, AuditLogFilter, AuditLogList,
    SecurityLogCreate, SecurityLogResponse, SecurityLogFilter, SecurityLogList,
    RoleCreate, RoleResponse, RoleUpdate, RoleList,
    UserPermissionCreate, UserPermissionResponse, UserPermissionUpdate, UserPermissionList,
    SecuritySettingsBase, SecuritySettingsResponse,
    AuditReportRequest, AuditReportResponse
)
from fastapi import HTTPException, status
import structlog
import json
import uuid
from math import ceil
import csv
import io
from datetime import timedelta

logger = structlog.get_logger()

class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_audit_log(self, audit_data: AuditLogCreate) -> AuditLogResponse:
        """Create a new audit log entry"""
        try:
            # Create audit log entry
            audit_log = AuditLog(
                company_id=audit_data.company_id,
                user_id=audit_data.user_id,
                table_name=audit_data.table_name,
                record_id=audit_data.record_id,
                action=audit_data.action,
                old_values=audit_data.old_values,
                new_values=audit_data.new_values,
                ip_address=audit_data.ip_address,
                user_agent=audit_data.user_agent,
                endpoint=audit_data.endpoint,
                request_method=audit_data.request_method,
                change_reason=audit_data.change_reason,
                affected_fields=audit_data.affected_fields
            )
            
            self.db.add(audit_log)
            await self.db.commit()
            await self.db.refresh(audit_log)
            
            logger.info("Audit log created", 
                       audit_id=audit_log.audit_id,
                       table_name=audit_data.table_name,
                       action=audit_data.action.value,
                       user_id=audit_data.user_id)
            
            return AuditLogResponse.model_validate(audit_log)
            
        except Exception as e:
            logger.error("Failed to create audit log", error=str(e))
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create audit log"
            )
    
    async def get_audit_logs(self, company_id: str, filters: AuditLogFilter, 
                            page: int = 1, page_size: int = 50) -> AuditLogList:
        """Get audit logs with filtering and pagination"""
        try:
            # Build query
            query = select(AuditLog).where(AuditLog.company_id == company_id)
            
            # Apply filters
            if filters.table_name:
                query = query.where(AuditLog.table_name == filters.table_name)
            
            if filters.record_id:
                query = query.where(AuditLog.record_id == filters.record_id)
            
            if filters.action:
                query = query.where(AuditLog.action == filters.action)
            
            if filters.user_id:
                query = query.where(AuditLog.user_id == filters.user_id)
            
            if filters.date_from:
                query = query.where(AuditLog.created_at >= filters.date_from)
            
            if filters.date_to:
                query = query.where(AuditLog.created_at <= filters.date_to)
            
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.where(
                    or_(
                        AuditLog.change_reason.like(search_term),
                        AuditLog.table_name.like(search_term),
                        AuditLog.record_id.like(search_term)
                    )
                )
            
            # Count total records
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Apply pagination and ordering
            query = query.order_by(desc(AuditLog.created_at))
            query = query.offset((page - 1) * page_size).limit(page_size)
            
            # Execute query
            result = await self.db.execute(query)
            audit_logs = result.scalars().all()
            
            # Convert to response models
            items = [AuditLogResponse.model_validate(log) for log in audit_logs]
            
            return AuditLogList(
                items=items,
                total=total,
                page=page,
                page_size=page_size,
                total_pages=ceil(total / page_size) if total > 0 else 0
            )
            
        except Exception as e:
            logger.error("Failed to get audit logs", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve audit logs"
            )
    
    async def get_audit_log_by_id(self, company_id: str, audit_id: str) -> Optional[AuditLogResponse]:
        """Get a specific audit log by ID"""
        try:
            query = select(AuditLog).where(
                and_(
                    AuditLog.audit_id == audit_id,
                    AuditLog.company_id == company_id
                )
            )
            
            result = await self.db.execute(query)
            audit_log = result.scalar_one_or_none()
            
            if not audit_log:
                return None
            
            return AuditLogResponse.model_validate(audit_log)
            
        except Exception as e:
            logger.error("Failed to get audit log by ID", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve audit log"
            )
    
    async def get_audit_logs_by_transaction(self, company_id: str, transaction_id: str) -> List[AuditLogResponse]:
        """Get audit logs for a specific transaction"""
        try:
            query = select(AuditLog).where(
                and_(
                    AuditLog.company_id == company_id,
                    AuditLog.record_id == transaction_id,
                    AuditLog.table_name.in_(["transactions", "transaction_lines"])
                )
            ).order_by(desc(AuditLog.created_at))
            
            result = await self.db.execute(query)
            audit_logs = result.scalars().all()
            
            return [AuditLogResponse.model_validate(log) for log in audit_logs]
            
        except Exception as e:
            logger.error("Failed to get transaction audit logs", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve transaction audit logs"
            )
    
    async def get_audit_logs_by_user(self, company_id: str, user_id: str) -> List[AuditLogResponse]:
        """Get audit logs for a specific user"""
        try:
            query = select(AuditLog).where(
                and_(
                    AuditLog.company_id == company_id,
                    AuditLog.user_id == user_id
                )
            ).order_by(desc(AuditLog.created_at))
            
            result = await self.db.execute(query)
            audit_logs = result.scalars().all()
            
            return [AuditLogResponse.model_validate(log) for log in audit_logs]
            
        except Exception as e:
            logger.error("Failed to get user audit logs", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve user audit logs"
            )
    
    async def track_change(self, company_id: str, user_id: str, table_name: str, 
                          record_id: str, action: AuditAction, old_values: Optional[Dict[str, Any]] = None,
                          new_values: Optional[Dict[str, Any]] = None, change_reason: Optional[str] = None,
                          request_context: Optional[Dict[str, Any]] = None) -> AuditLogResponse:
        """
        Convenience method to track changes automatically
        This would typically be called by middleware or decorators
        """
        try:
            # Calculate affected fields
            affected_fields = []
            if old_values and new_values:
                for key in set(old_values.keys()) | set(new_values.keys()):
                    if old_values.get(key) != new_values.get(key):
                        affected_fields.append(key)
            
            # Create audit log data
            audit_data = AuditLogCreate(
                company_id=company_id,
                user_id=user_id,
                table_name=table_name,
                record_id=record_id,
                action=action,
                old_values=old_values,
                new_values=new_values,
                change_reason=change_reason,
                affected_fields=affected_fields,
                ip_address=request_context.get("ip_address") if request_context else None,
                user_agent=request_context.get("user_agent") if request_context else None,
                endpoint=request_context.get("endpoint") if request_context else None,
                request_method=request_context.get("request_method") if request_context else None
            )
            
            return await self.create_audit_log(audit_data)
            
        except Exception as e:
            logger.error("Failed to track change", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to track change"
            )
    
    async def generate_audit_report(self, company_id: str, report_request: AuditReportRequest) -> AuditReportResponse:
        """Generate audit report in various formats"""
        try:
            # Build query based on report type
            query = select(AuditLog).where(
                and_(
                    AuditLog.company_id == company_id,
                    AuditLog.created_at >= report_request.date_from,
                    AuditLog.created_at <= report_request.date_to
                )
            )
            
            if report_request.include_tables:
                query = query.where(AuditLog.table_name.in_(report_request.include_tables))
            
            if report_request.include_users:
                query = query.where(AuditLog.user_id.in_(report_request.include_users))
            
            # Execute query
            result = await self.db.execute(query)
            audit_logs = result.scalars().all()
            
            # Generate report data based on format
            if report_request.format == "json":
                data = [
                    {
                        "audit_id": log.audit_id,
                        "table_name": log.table_name,
                        "record_id": log.record_id,
                        "action": log.action.value,
                        "user_id": log.user_id,
                        "old_values": log.old_values,
                        "new_values": log.new_values,
                        "affected_fields": log.affected_fields,
                        "change_reason": log.change_reason,
                        "ip_address": log.ip_address,
                        "created_at": log.created_at.isoformat()
                    }
                    for log in audit_logs
                ]
            
            elif report_request.format == "csv":
                # Generate CSV data
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Write headers
                writer.writerow([
                    "audit_id", "table_name", "record_id", "action", "user_id",
                    "change_reason", "affected_fields", "ip_address", "created_at"
                ])
                
                # Write data
                for log in audit_logs:
                    writer.writerow([
                        log.audit_id,
                        log.table_name,
                        log.record_id,
                        log.action.value,
                        log.user_id,
                        log.change_reason,
                        ", ".join(log.affected_fields or []),
                        log.ip_address,
                        log.created_at.isoformat()
                    ])
                
                data = output.getvalue()
            
            else:  # PDF format would require additional library
                data = {"message": "PDF format not implemented yet"}
            
            return AuditReportResponse(
                report_id=str(uuid.uuid4()),
                report_type=report_request.report_type,
                date_from=report_request.date_from,
                date_to=report_request.date_to,
                total_records=len(audit_logs),
                data=data,
                format=report_request.format,
                generated_at=datetime.now(timezone.utc),
                generated_by=company_id  # This should be the actual user ID
            )
            
        except Exception as e:
            logger.error("Failed to generate audit report", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate audit report"
            )
    
    async def get_audit_summary(self, company_id: str, days: int = 30) -> Dict[str, Any]:
        """Get audit summary statistics"""
        try:
            date_from = datetime.now(timezone.utc) - timedelta(days=days)
            
            # Total audit logs
            total_query = select(func.count(AuditLog.audit_id)).where(
                and_(
                    AuditLog.company_id == company_id,
                    AuditLog.created_at >= date_from
                )
            )
            total_result = await self.db.execute(total_query)
            total_logs = total_result.scalar()
            
            # Logs by action
            action_query = select(
                AuditLog.action,
                func.count(AuditLog.audit_id).label("count")
            ).where(
                and_(
                    AuditLog.company_id == company_id,
                    AuditLog.created_at >= date_from
                )
            ).group_by(AuditLog.action)
            
            action_result = await self.db.execute(action_query)
            actions_data = {row.action.value: row.count for row in action_result}
            
            # Logs by table
            table_query = select(
                AuditLog.table_name,
                func.count(AuditLog.audit_id).label("count")
            ).where(
                and_(
                    AuditLog.company_id == company_id,
                    AuditLog.created_at >= date_from
                )
            ).group_by(AuditLog.table_name).order_by(desc(func.count(AuditLog.audit_id))).limit(10)
            
            table_result = await self.db.execute(table_query)
            tables_data = {row.table_name: row.count for row in table_result}
            
            # Top users
            user_query = select(
                AuditLog.user_id,
                func.count(AuditLog.audit_id).label("count")
            ).where(
                and_(
                    AuditLog.company_id == company_id,
                    AuditLog.created_at >= date_from
                )
            ).group_by(AuditLog.user_id).order_by(desc(func.count(AuditLog.audit_id))).limit(10)
            
            user_result = await self.db.execute(user_query)
            users_data = {row.user_id: row.count for row in user_result}
            
            return {
                "total_logs": total_logs,
                "period_days": days,
                "actions": actions_data,
                "tables": tables_data,
                "top_users": users_data,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to get audit summary", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get audit summary"
            )