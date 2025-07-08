from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc, text
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional, Tuple, Dict, Any, Union
from models.reports import (
    ReportDefinition, MemorizedReport, MemorizedReportGroup,
    ReportCache, ReportExecution, ReportTemplate,
    ReportType, ReportFormat, ReportStatus, ReportCategory
)
from models.transactions import Transaction, TransactionLine, JournalEntry
from models.list_management import Account, Customer, Vendor, AccountType
from models.user import Company, User
from schemas.report_schemas import (
    ReportDefinitionCreate, ReportDefinitionUpdate, ReportSearchFilters,
    MemorizedReportCreate, MemorizedReportUpdate, MemorizedReportSearchFilters,
    ReportGroupCreate, ReportGroupUpdate, ReportExecutionRequest,
    ReportDataResponse, FinancialReportData, FinancialSection, FinancialLine,
    ProfitLossRequest, BalanceSheetRequest, CashFlowRequest,
    TrialBalanceRequest, AgingReportRequest
)
import uuid
import structlog
from datetime import datetime, date, timedelta
from decimal import Decimal
import json
import hashlib
from services.list_management_service import BaseListService

logger = structlog.get_logger()

class ReportService(BaseListService):
    """Service for report management operations"""
    
    @staticmethod
    async def create_report_definition(
        db: AsyncSession,
        user_id: str,
        report_data: ReportDefinitionCreate
    ) -> ReportDefinition:
        """Create a new report definition"""
        
        report = ReportDefinition(
            report_id=str(uuid.uuid4()),
            created_by=user_id,
            **report_data.dict()
        )
        
        db.add(report)
        await db.commit()
        await db.refresh(report)
        
        logger.info("Report definition created", report_id=report.report_id, user_id=user_id)
        return report
    
    @staticmethod
    async def get_report_definitions(
        db: AsyncSession,
        filters: ReportSearchFilters
    ) -> Tuple[List[ReportDefinition], int]:
        """Get report definitions with pagination and filtering"""
        query = select(ReportDefinition)
        
        # Apply filters
        if filters.category:
            query = query.where(ReportDefinition.report_category == filters.category)
        
        if filters.type:
            query = query.where(ReportDefinition.report_type == filters.type)
        
        if filters.created_by:
            query = query.where(ReportDefinition.created_by == filters.created_by)
        
        if filters.is_system_report is not None:
            query = query.where(ReportDefinition.is_system_report == filters.is_system_report)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    ReportDefinition.report_name.ilike(search_term),
                    ReportDefinition.description.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(ReportDefinition, filters.sort_by, ReportDefinition.report_name)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(ReportDefinition.report_name)
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        reports = result.scalars().all()
        
        return reports, total
    
    @staticmethod
    async def get_report_definition_by_id(
        db: AsyncSession,
        report_id: str
    ) -> Optional[ReportDefinition]:
        """Get report definition by ID"""
        result = await db.execute(
            select(ReportDefinition).where(
                ReportDefinition.report_id == report_id
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def execute_report(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        report_id: str,
        execution_request: ReportExecutionRequest
    ) -> ReportExecution:
        """Execute a report and return execution record"""
        
        # Get report definition
        report_def = await ReportService.get_report_definition_by_id(db, report_id)
        if not report_def:
            raise ValueError("Report definition not found")
        
        # Create execution record
        execution = ReportExecution(
            execution_id=str(uuid.uuid4()),
            company_id=company_id,
            report_id=report_id,
            executed_by=user_id,
            parameters=execution_request.parameters,
            filters=[f.dict() for f in execution_request.filters],
            status=ReportStatus.RUNNING,
            output_format=execution_request.output_format
        )
        
        db.add(execution)
        await db.flush()
        
        try:
            start_time = datetime.now()
            
            # Check cache first if requested
            if execution_request.use_cache:
                cached_data = await ReportService._get_cached_report_data(
                    db, report_id, execution_request.parameters, execution_request.filters
                )
                if cached_data:
                    execution.status = ReportStatus.COMPLETED
                    execution.row_count = len(cached_data.get('data', []))
                    execution.execution_time_ms = 0  # Cache hit
                    execution.completed_at = datetime.now()
                    await db.commit()
                    
                    logger.info("Report executed from cache", execution_id=execution.execution_id)
                    return execution
            
            # Execute the report
            report_data = await ReportService._execute_report_query(
                db, company_id, report_def, execution_request.parameters, execution_request.filters
            )
            
            # Calculate execution time
            end_time = datetime.now()
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)
            
            # Update execution record
            execution.status = ReportStatus.COMPLETED
            execution.row_count = len(report_data.get('data', []))
            execution.execution_time_ms = execution_time_ms
            execution.completed_at = end_time
            
            # Cache the results if requested
            if execution_request.use_cache:
                await ReportService._cache_report_data(
                    db, report_id, execution_request.parameters, 
                    execution_request.filters, report_data, execution_request.cache_duration_minutes
                )
            
            await db.commit()
            
            logger.info(
                "Report executed successfully",
                execution_id=execution.execution_id,
                row_count=execution.row_count,
                execution_time_ms=execution_time_ms
            )
            
        except Exception as e:
            execution.status = ReportStatus.FAILED
            execution.error_message = str(e)
            execution.completed_at = datetime.now()
            await db.commit()
            
            logger.error(
                "Report execution failed",
                execution_id=execution.execution_id,
                error=str(e),
                exc_info=True
            )
            raise
        
        return execution
    
    @staticmethod
    async def get_report_data(
        db: AsyncSession,
        company_id: str,
        report_id: str,
        parameters: Dict[str, Any] = None,
        filters: List[Dict[str, Any]] = None
    ) -> ReportDataResponse:
        """Get report data directly without creating execution record"""
        
        report_def = await ReportService.get_report_definition_by_id(db, report_id)
        if not report_def:
            raise ValueError("Report definition not found")
        
        # Check cache first
        cached_data = await ReportService._get_cached_report_data(
            db, report_id, parameters or {}, filters or []
        )
        
        if cached_data:
            return ReportDataResponse(**cached_data)
        
        # Execute the report
        start_time = datetime.now()
        report_data = await ReportService._execute_report_query(
            db, company_id, report_def, parameters or {}, filters or []
        )
        execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        response = ReportDataResponse(
            report_id=report_id,
            report_name=report_def.report_name,
            columns=report_def.column_definitions,
            data=report_data.get('data', []),
            summary=report_data.get('summary', {}),
            parameters=parameters or {},
            filters=filters or [],
            generated_at=datetime.now(),
            row_count=len(report_data.get('data', [])),
            execution_time_ms=execution_time
        )
        
        return response
    
    @staticmethod
    async def _execute_report_query(
        db: AsyncSession,
        company_id: str,
        report_def: ReportDefinition,
        parameters: Dict[str, Any],
        filters: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute the actual report query"""
        
        # For system reports, use predefined logic
        if report_def.is_system_report:
            return await ReportService._execute_system_report(
                db, company_id, report_def, parameters, filters
            )
        
        # For custom reports, execute SQL template
        if report_def.sql_template:
            return await ReportService._execute_custom_sql_report(
                db, company_id, report_def.sql_template, parameters, filters
            )
        
        # Default empty response
        return {"data": [], "summary": {}}
    
    @staticmethod
    async def _execute_system_report(
        db: AsyncSession,
        company_id: str,
        report_def: ReportDefinition,
        parameters: Dict[str, Any],
        filters: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute system report based on report name/type"""
        
        report_name = report_def.report_name.lower()
        
        if "profit" in report_name and "loss" in report_name:
            return await ReportService._generate_profit_loss_data(db, company_id, parameters)
        elif "balance" in report_name and "sheet" in report_name:
            return await ReportService._generate_balance_sheet_data(db, company_id, parameters)
        elif "cash" in report_name and "flow" in report_name:
            return await ReportService._generate_cash_flow_data(db, company_id, parameters)
        elif "trial" in report_name and "balance" in report_name:
            return await ReportService._generate_trial_balance_data(db, company_id, parameters)
        elif "aging" in report_name:
            if "receivable" in report_name or "customer" in report_name:
                return await ReportService._generate_ar_aging_data(db, company_id, parameters)
            elif "payable" in report_name or "vendor" in report_name:
                return await ReportService._generate_ap_aging_data(db, company_id, parameters)
        
        # Default for unknown system reports
        return {"data": [], "summary": {}}

    @staticmethod
    async def _generate_profit_loss_data(db: AsyncSession, company_id: str, parameters: Dict[str, Any]):
        """Generate Profit & Loss report data"""
        from services.financial_report_service import FinancialReportService
        from schemas.report_schemas import ProfitLossRequest
        from datetime import date, datetime
        
        # Parse parameters to create request
        start_date = parameters.get('start_date')
        end_date = parameters.get('end_date')
        
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
        request = ProfitLossRequest(
            start_date=start_date or date.today().replace(day=1),
            end_date=end_date or date.today(),
            comparison_type=parameters.get('comparison_type', 'none'),
            comparison_start_date=parameters.get('comparison_start_date'),
            comparison_end_date=parameters.get('comparison_end_date'),
            include_subtotals=parameters.get('include_subtotals', True),
            show_cents=parameters.get('show_cents', True)
        )
        
        financial_data = await FinancialReportService.generate_profit_loss_report(db, company_id, request)
        
        # Convert to standard report format
        data = []
        for section in financial_data.sections:
            for line in section.lines:
                data.append({
                    'section': section.section_name,
                    'account_name': line.account_name,
                    'amount': float(line.amount),
                    'comparison_amount': float(line.comparison_amount) if line.comparison_amount else None,
                    'variance_amount': float(line.variance_amount) if line.variance_amount else None
                })
        
        return {
            "data": data,
            "summary": {
                "total_sections": len(financial_data.sections),
                "grand_total": float(financial_data.grand_total) if financial_data.grand_total else 0,
                "report_date": financial_data.report_date.isoformat(),
                "comparison_date": financial_data.comparison_date.isoformat() if financial_data.comparison_date else None
            }
        }
    
    @staticmethod
    async def _generate_balance_sheet_data(db: AsyncSession, company_id: str, parameters: Dict[str, Any]):
        """Generate Balance Sheet report data"""
        from services.financial_report_service import FinancialReportService
        from schemas.report_schemas import BalanceSheetRequest
        from datetime import date, datetime
        
        as_of_date = parameters.get('as_of_date')
        if isinstance(as_of_date, str):
            as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d').date()
            
        request = BalanceSheetRequest(
            as_of_date=as_of_date or date.today(),
            comparison_date=parameters.get('comparison_date'),
            include_subtotals=parameters.get('include_subtotals', True),
            show_cents=parameters.get('show_cents', True)
        )
        
        financial_data = await FinancialReportService.generate_balance_sheet_report(db, company_id, request)
        
        # Convert to standard report format
        data = []
        for section in financial_data.sections:
            for line in section.lines:
                data.append({
                    'section': section.section_name,
                    'account_name': line.account_name,
                    'amount': float(line.amount),
                    'comparison_amount': float(line.comparison_amount) if line.comparison_amount else None
                })
        
        return {
            "data": data,
            "summary": {
                "total_sections": len(financial_data.sections),
                "total_assets": float(financial_data.grand_total) if financial_data.grand_total else 0,
                "report_date": financial_data.report_date.isoformat()
            }
        }
    
    @staticmethod
    async def _generate_cash_flow_data(db: AsyncSession, company_id: str, parameters: Dict[str, Any]):
        """Generate Cash Flow report data"""
        from services.financial_report_service import FinancialReportService
        from schemas.report_schemas import CashFlowRequest
        from datetime import date, datetime
        
        start_date = parameters.get('start_date')
        end_date = parameters.get('end_date')
        
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
        request = CashFlowRequest(
            start_date=start_date or date.today().replace(day=1),
            end_date=end_date or date.today(),
            method=parameters.get('method', 'indirect'),
            include_subtotals=parameters.get('include_subtotals', True),
            show_cents=parameters.get('show_cents', True)
        )
        
        financial_data = await FinancialReportService.generate_cash_flow_report(db, company_id, request)
        
        # Convert to standard report format
        data = []
        for section in financial_data.sections:
            for line in section.lines:
                data.append({
                    'section': section.section_name,
                    'account_name': line.account_name,
                    'amount': float(line.amount)
                })
        
        return {
            "data": data,
            "summary": {
                "net_cash_change": float(financial_data.grand_total) if financial_data.grand_total else 0,
                "period_start": start_date.isoformat(),
                "period_end": end_date.isoformat()
            }
        }
    
    @staticmethod
    async def _generate_trial_balance_data(db: AsyncSession, company_id: str, parameters: Dict[str, Any]):
        """Generate Trial Balance report data"""
        from services.financial_report_service import FinancialReportService
        from schemas.report_schemas import TrialBalanceRequest
        from datetime import date, datetime
        
        as_of_date = parameters.get('as_of_date')
        if isinstance(as_of_date, str):
            as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d').date()
            
        request = TrialBalanceRequest(
            as_of_date=as_of_date or date.today(),
            include_zero_balances=parameters.get('include_zero_balances', False),
            show_cents=parameters.get('show_cents', True)
        )
        
        return await FinancialReportService.generate_trial_balance_report(db, company_id, request)
    
    @staticmethod
    async def _generate_ar_aging_data(db: AsyncSession, company_id: str, parameters: Dict[str, Any]):
        """Generate Accounts Receivable Aging report data"""
        from services.financial_report_service import FinancialReportService
        from schemas.report_schemas import AgingReportRequest
        from datetime import date, datetime
        
        as_of_date = parameters.get('as_of_date')
        if isinstance(as_of_date, str):
            as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d').date()
            
        request = AgingReportRequest(
            as_of_date=as_of_date or date.today(),
            aging_periods=parameters.get('aging_periods', [30, 60, 90, 120]),
            include_zero_balances=parameters.get('include_zero_balances', False),
            customer_id=parameters.get('customer_id')
        )
        
        return await FinancialReportService.generate_ar_aging_report(db, company_id, request)
    
    @staticmethod
    async def _generate_ap_aging_data(db: AsyncSession, company_id: str, parameters: Dict[str, Any]):
        """Generate Accounts Payable Aging report data"""
        from services.financial_report_service import FinancialReportService
        from schemas.report_schemas import AgingReportRequest
        from datetime import date, datetime
        
        as_of_date = parameters.get('as_of_date')
        if isinstance(as_of_date, str):
            as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d').date()
            
        request = AgingReportRequest(
            as_of_date=as_of_date or date.today(),
            aging_periods=parameters.get('aging_periods', [30, 60, 90, 120]),
            include_zero_balances=parameters.get('include_zero_balances', False),
            vendor_id=parameters.get('vendor_id')
        )
        
        return await FinancialReportService.generate_ap_aging_report(db, company_id, request)
    
    @staticmethod
    async def _execute_custom_sql_report(
        db: AsyncSession,
        company_id: str,
        sql_template: str,
        parameters: Dict[str, Any],
        filters: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Execute custom SQL report with parameter substitution"""
        
        # Simple parameter substitution (in production, use more secure method)
        query = sql_template
        
        # Add company filter
        if "WHERE" in query.upper():
            query += f" AND company_id = '{company_id}'"
        else:
            query += f" WHERE company_id = '{company_id}'"
        
        # Substitute parameters
        for key, value in parameters.items():
            placeholder = f":{key}"
            if placeholder in query:
                if isinstance(value, str):
                    query = query.replace(placeholder, f"'{value}'")
                else:
                    query = query.replace(placeholder, str(value))
        
        try:
            result = await db.execute(text(query))
            rows = result.fetchall()
            
            # Convert rows to dictionaries
            columns = result.keys()
            data = [dict(zip(columns, row)) for row in rows]
            
            return {
                "data": data,
                "summary": {"total_rows": len(data)}
            }
            
        except Exception as e:
            logger.error("Custom SQL report execution failed", error=str(e), query=query)
            raise ValueError(f"Report execution failed: {str(e)}")
    
    @staticmethod
    async def _get_cached_report_data(
        db: AsyncSession,
        report_id: str,
        parameters: Dict[str, Any],
        filters: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Get cached report data if available and not expired"""
        
        # Generate cache key
        cache_key = ReportService._generate_cache_key(report_id, parameters, filters)
        
        result = await db.execute(
            select(ReportCache).where(
                and_(
                    ReportCache.cache_key == cache_key,
                    ReportCache.expires_at > datetime.now()
                )
            )
        )
        
        cache_entry = result.scalar_one_or_none()
        if cache_entry:
            # Update access statistics
            cache_entry.accessed_count += 1
            cache_entry.last_accessed = datetime.now()
            await db.commit()
            
            return cache_entry.report_data
        
        return None
    
    @staticmethod
    async def _cache_report_data(
        db: AsyncSession,
        report_id: str,
        parameters: Dict[str, Any],
        filters: List[Dict[str, Any]],
        report_data: Dict[str, Any],
        cache_duration_minutes: int
    ) -> None:
        """Cache report data"""
        
        cache_key = ReportService._generate_cache_key(report_id, parameters, filters)
        expires_at = datetime.now() + timedelta(minutes=cache_duration_minutes)
        
        # Check if cache entry already exists
        result = await db.execute(
            select(ReportCache).where(ReportCache.cache_key == cache_key)
        )
        
        cache_entry = result.scalar_one_or_none()
        
        if cache_entry:
            # Update existing entry
            cache_entry.report_data = report_data
            cache_entry.parameters = parameters
            cache_entry.expires_at = expires_at
            cache_entry.generated_at = datetime.now()
            cache_entry.row_count = len(report_data.get('data', []))
        else:
            # Create new entry
            cache_entry = ReportCache(
                cache_id=str(uuid.uuid4()),
                cache_key=cache_key,
                report_data=report_data,
                parameters=parameters,
                expires_at=expires_at,
                row_count=len(report_data.get('data', []))
            )
            db.add(cache_entry)
        
        await db.commit()
    
    @staticmethod
    def _generate_cache_key(
        report_id: str,
        parameters: Dict[str, Any],
        filters: List[Dict[str, Any]]
    ) -> str:
        """Generate unique cache key for report parameters"""
        
        # Create a consistent string representation
        cache_data = {
            "report_id": report_id,
            "parameters": parameters,
            "filters": filters
        }
        
        # Convert to JSON and hash
        cache_string = json.dumps(cache_data, sort_keys=True, default=str)
        return hashlib.md5(cache_string.encode()).hexdigest()

class MemorizedReportService(BaseListService):
    """Service for memorized report management"""
    
    @staticmethod
    async def create_memorized_report(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        report_data: MemorizedReportCreate
    ) -> MemorizedReport:
        """Create a new memorized report"""
        
        memorized_report = MemorizedReport(
            memorized_report_id=str(uuid.uuid4()),
            company_id=company_id,
            created_by=user_id,
            **report_data.dict()
        )
        
        # Set next run date if scheduled
        if memorized_report.is_scheduled:
            memorized_report.next_run_at = MemorizedReportService._calculate_next_run_date(
                memorized_report.schedule_frequency,
                memorized_report.schedule_config
            )
        
        db.add(memorized_report)
        await db.commit()
        await db.refresh(memorized_report)
        
        logger.info(
            "Memorized report created",
            memorized_report_id=memorized_report.memorized_report_id,
            company_id=company_id
        )
        return memorized_report
    
    @staticmethod
    async def get_memorized_reports(
        db: AsyncSession,
        company_id: str,
        filters: MemorizedReportSearchFilters
    ) -> Tuple[List[MemorizedReport], int]:
        """Get memorized reports with pagination and filtering"""
        query = select(MemorizedReport).where(
            MemorizedReport.company_id == company_id
        ).options(
            selectinload(MemorizedReport.report_definition),
            selectinload(MemorizedReport.group)
        )
        
        # Apply filters
        if filters.group_id:
            query = query.where(MemorizedReport.group_id == filters.group_id)
        
        if filters.is_scheduled is not None:
            query = query.where(MemorizedReport.is_scheduled == filters.is_scheduled)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                MemorizedReport.report_name.ilike(search_term)
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(MemorizedReport, filters.sort_by, MemorizedReport.report_name)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(MemorizedReport.report_name)
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        reports = result.scalars().all()
        
        return reports, total
    
    @staticmethod
    def _calculate_next_run_date(
        frequency: str,
        config: Dict[str, Any]
    ) -> datetime:
        """Calculate next run date based on frequency and configuration"""
        
        now = datetime.now()
        
        if frequency == "daily":
            return now + timedelta(days=1)
        elif frequency == "weekly":
            days_ahead = config.get("day_of_week", 1) - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            return now + timedelta(days=days_ahead)
        elif frequency == "monthly":
            day_of_month = config.get("day_of_month", 1)
            if now.month == 12:
                next_month = now.replace(year=now.year + 1, month=1, day=day_of_month)
            else:
                next_month = now.replace(month=now.month + 1, day=day_of_month)
            return next_month
        elif frequency == "quarterly":
            months_ahead = 3
            return now + timedelta(days=months_ahead * 30)  # Approximate
        elif frequency == "annually":
            return now.replace(year=now.year + 1)
        
        return now + timedelta(days=1)  # Default

class ReportGroupService(BaseListService):
    """Service for report group management"""
    
    @staticmethod
    async def create_report_group(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        group_data: ReportGroupCreate
    ) -> MemorizedReportGroup:
        """Create a new report group"""
        
        group = MemorizedReportGroup(
            group_id=str(uuid.uuid4()),
            company_id=company_id,
            created_by=user_id,
            **group_data.dict()
        )
        
        db.add(group)
        await db.commit()
        await db.refresh(group)
        
        logger.info("Report group created", group_id=group.group_id, company_id=company_id)
        return group
    
    @staticmethod
    async def get_report_groups(
        db: AsyncSession,
        company_id: str
    ) -> List[MemorizedReportGroup]:
        """Get all report groups for a company"""
        result = await db.execute(
            select(MemorizedReportGroup).where(
                MemorizedReportGroup.company_id == company_id
            ).order_by(MemorizedReportGroup.sort_order, MemorizedReportGroup.group_name)
        )
        return result.scalars().all()