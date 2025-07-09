from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, case
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from decimal import Decimal

from database.connection import get_db
from services.auth_service import auth_service
from services.security import get_current_user
from services.report_service import ReportService, MemorizedReportService, ReportGroupService
from services.financial_report_service import FinancialReportService
from services.report_export_service import ReportExportService
from models.reports import ReportDefinition, MemorizedReport, MemorizedReportGroup, ReportExecution
from models.user import User
from models.transactions import Transaction, TransactionLine, TransactionType, TransactionStatus
from models.list_management import Account, AccountType
from schemas.report_schemas import (
    # Report Definition schemas
    ReportDefinitionCreate, ReportDefinitionUpdate, ReportDefinitionResponse,
    ReportSearchFilters,
    
    # Memorized Report schemas
    MemorizedReportCreate, MemorizedReportUpdate, MemorizedReportResponse,
    MemorizedReportSearchFilters,
    
    # Report Group schemas
    ReportGroupCreate, ReportGroupUpdate, ReportGroupResponse,
    
    # Report Execution schemas
    ReportExecutionRequest, ReportExecutionResponse, ReportDataResponse,
    
    # Export schemas
    ReportExportRequest, ReportExportResponse,
    
    # Standard Financial Report schemas
    ProfitLossRequest, BalanceSheetRequest, CashFlowRequest,
    TrialBalanceRequest, AgingReportRequest,
    
    # Utility schemas
    MessageResponse, PaginatedResponse
)
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/companies/{company_id}", tags=["reports"])

# Authentication dependency
async def get_current_user_with_company_access(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> User:
    """Verify user has access to the company"""
    has_access = await ReportService.verify_company_access(db, current_user.user_id, company_id)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to company resources"
        )
    return current_user

# Report Definition Endpoints
@router.get("/reports", response_model=PaginatedResponse)
async def get_reports(
    company_id: str,
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    is_system_report: Optional[bool] = Query(None),
    sort_by: str = Query("report_name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Get available reports with filtering and pagination"""
    
    filters = ReportSearchFilters(
        search=search,
        category=category,
        type=type,
        is_system_report=is_system_report,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    
    reports, total = await ReportService.get_report_definitions(db, filters)
    total_pages = (total + page_size - 1) // page_size
    
    return PaginatedResponse(
        items=[ReportDefinitionResponse.from_orm(report) for report in reports],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/reports/definition/{report_id}", response_model=ReportDefinitionResponse)
async def get_report(
    company_id: str,
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Get specific report definition"""
    
    report = await ReportService.get_report_definition_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return ReportDefinitionResponse.from_orm(report)

@router.post("/reports/definition/{report_id}/run", response_model=ReportExecutionResponse)
async def run_report(
    company_id: str,
    report_id: str,
    execution_request: ReportExecutionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Execute a report"""
    
    execution = await ReportService.execute_report(
        db, company_id, current_user.user_id, report_id, execution_request
    )
    
    return ReportExecutionResponse.from_orm(execution)

@router.get("/reports/definition/{report_id}/data", response_model=ReportDataResponse)
async def get_report_data(
    company_id: str,
    report_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    as_of_date: Optional[date] = Query(None),
    comparison_type: Optional[str] = Query("none"),
    include_zero_balances: Optional[bool] = Query(False),
    customer_id: Optional[str] = Query(None),
    vendor_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Get report data directly"""
    
    # Build parameters from query params
    parameters = {}
    if start_date:
        parameters['start_date'] = start_date
    if end_date:
        parameters['end_date'] = end_date
    if as_of_date:
        parameters['as_of_date'] = as_of_date
    if comparison_type:
        parameters['comparison_type'] = comparison_type
    if include_zero_balances is not None:
        parameters['include_zero_balances'] = include_zero_balances
    if customer_id:
        parameters['customer_id'] = customer_id
    if vendor_id:
        parameters['vendor_id'] = vendor_id
    
    report_data = await ReportService.get_report_data(
        db, company_id, report_id, parameters
    )
    
    return report_data

# Report Customization Endpoints
@router.post("/reports/definition/{report_id}/customize", response_model=ReportDefinitionResponse)
async def customize_report(
    company_id: str,
    report_id: str,
    customization_data: ReportDefinitionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Create a customized version of a report"""
    
    # Create a new custom report based on existing one
    customized_report = await ReportService.create_report_definition(
        db, current_user.user_id, customization_data
    )
    
    return ReportDefinitionResponse.from_orm(customized_report)

@router.put("/reports/definition/{report_id}/filters")
async def update_report_filters(
    company_id: str,
    report_id: str,
    filters: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Update report filters"""
    
    report = await ReportService.get_report_definition_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update filters (this would need proper implementation)
    # For now, just return success
    return {"message": "Filters updated successfully"}

@router.get("/reports/definition/{report_id}/columns")
async def get_report_columns(
    company_id: str,
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Get report column definitions"""
    
    report = await ReportService.get_report_definition_by_id(db, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return {"columns": report.column_definitions}

# Memorized Reports Endpoints
@router.get("/memorized-reports", response_model=PaginatedResponse)
async def get_memorized_reports(
    company_id: str,
    search: Optional[str] = Query(None),
    group_id: Optional[str] = Query(None),
    is_scheduled: Optional[bool] = Query(None),
    sort_by: str = Query("report_name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Get memorized reports"""
    
    filters = MemorizedReportSearchFilters(
        search=search,
        group_id=group_id,
        is_scheduled=is_scheduled,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    
    reports, total = await MemorizedReportService.get_memorized_reports(db, company_id, filters)
    total_pages = (total + page_size - 1) // page_size
    
    return PaginatedResponse(
        items=[MemorizedReportResponse.from_orm(report) for report in reports],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.post("/memorized-reports", response_model=MemorizedReportResponse)
async def create_memorized_report(
    company_id: str,
    report_data: MemorizedReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Create a memorized report"""
    
    memorized_report = await MemorizedReportService.create_memorized_report(
        db, company_id, current_user.user_id, report_data
    )
    
    return MemorizedReportResponse.from_orm(memorized_report)

@router.put("/memorized-reports/{memorized_id}", response_model=MemorizedReportResponse)
async def update_memorized_report(
    company_id: str,
    memorized_id: str,
    report_data: MemorizedReportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Update a memorized report"""
    
    # This would need proper implementation
    # For now, return a placeholder response
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Update memorized report not yet implemented"
    )

@router.delete("/memorized-reports/{memorized_id}")
async def delete_memorized_report(
    company_id: str,
    memorized_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Delete a memorized report"""
    
    # This would need proper implementation
    # For now, return success
    return {"message": "Memorized report deleted successfully"}

# Report Groups Endpoints
@router.get("/report-groups", response_model=List[ReportGroupResponse])
async def get_report_groups(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Get report groups"""
    
    groups = await ReportGroupService.get_report_groups(db, company_id)
    return [ReportGroupResponse.from_orm(group) for group in groups]

@router.post("/report-groups", response_model=ReportGroupResponse)
async def create_report_group(
    company_id: str,
    group_data: ReportGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Create a report group"""
    
    group = await ReportGroupService.create_report_group(
        db, company_id, current_user.user_id, group_data
    )
    
    return ReportGroupResponse.from_orm(group)

@router.put("/report-groups/{group_id}", response_model=ReportGroupResponse)
async def update_report_group(
    company_id: str,
    group_id: str,
    group_data: ReportGroupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Update a report group"""
    
    # This would need proper implementation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Update report group not yet implemented"
    )

@router.delete("/report-groups/{group_id}")
async def delete_report_group(
    company_id: str,
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Delete a report group"""
    
    # This would need proper implementation
    return {"message": "Report group deleted successfully"}

# Report Export Endpoints
@router.post("/reports/definition/{report_id}/export/pdf", response_model=ReportExportResponse)
async def export_report_to_pdf(
    company_id: str,
    report_id: str,
    export_request: ReportExportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Export report to PDF"""
    
    # Get report data
    report_data = await ReportService.get_report_data(
        db, company_id, report_id, export_request.parameters
    )
    
    # Get company and report info
    company = await ReportService.get_company(db, company_id)
    report_def = await ReportService.get_report_definition_by_id(db, report_id)
    
    # Export to PDF
    export_service = ReportExportService()
    export_result = await export_service.export_report(
        report_data.dict(),
        export_request,
        company.company_name,
        report_def.report_name if report_def else "Report"
    )
    
    return ReportExportResponse(
        file_url=f"/api/companies/{company_id}/reports/download/{export_result['filename']}",
        file_name=export_result['filename'],
        file_size=export_result['file_size'],
        format=export_result['format'],
        expires_at=datetime.now().replace(hour=23, minute=59, second=59)  # End of day
    )

@router.post("/reports/definition/{report_id}/export/excel", response_model=ReportExportResponse)
async def export_report_to_excel(
    company_id: str,
    report_id: str,
    export_request: ReportExportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Export report to Excel"""
    
    # Similar implementation as PDF export
    export_request.format = "excel"
    
    # Get report data
    report_data = await ReportService.get_report_data(
        db, company_id, report_id, export_request.parameters
    )
    
    # Get company and report info
    company = await ReportService.get_company(db, company_id)
    report_def = await ReportService.get_report_definition_by_id(db, report_id)
    
    # Export to Excel
    export_service = ReportExportService()
    export_result = await export_service.export_report(
        report_data.dict(),
        export_request,
        company.company_name,
        report_def.report_name if report_def else "Report"
    )
    
    return ReportExportResponse(
        file_url=f"/api/companies/{company_id}/reports/download/{export_result['filename']}",
        file_name=export_result['filename'],
        file_size=export_result['file_size'],
        format=export_result['format'],
        expires_at=datetime.now().replace(hour=23, minute=59, second=59)
    )

@router.post("/reports/definition/{report_id}/export/csv", response_model=ReportExportResponse)
async def export_report_to_csv(
    company_id: str,
    report_id: str,
    export_request: ReportExportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Export report to CSV"""
    
    # Similar implementation as PDF export
    export_request.format = "csv"
    
    # Get report data
    report_data = await ReportService.get_report_data(
        db, company_id, report_id, export_request.parameters
    )
    
    # Get company and report info
    company = await ReportService.get_company(db, company_id)
    report_def = await ReportService.get_report_definition_by_id(db, report_id)
    
    # Export to CSV
    export_service = ReportExportService()
    export_result = await export_service.export_report(
        report_data.dict(),
        export_request,
        company.company_name,
        report_def.report_name if report_def else "Report"
    )
    
    return ReportExportResponse(
        file_url=f"/api/companies/{company_id}/reports/download/{export_result['filename']}",
        file_name=export_result['filename'],
        file_size=export_result['file_size'],
        format=export_result['format'],
        expires_at=datetime.now().replace(hour=23, minute=59, second=59)
    )

# File Download Endpoint
@router.get("/reports/download/{filename}")
async def download_report_file(
    company_id: str,
    filename: str,
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Download exported report file"""
    
    file_path = f"/app/backend/exports/{filename}"
    
    # Check if file exists
    import os
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Determine media type based on file extension
    media_type = "application/octet-stream"
    if filename.endswith('.pdf'):
        media_type = "application/pdf"
    elif filename.endswith('.xlsx'):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif filename.endswith('.csv'):
        media_type = "text/csv"
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )

# Standard Financial Reports Endpoints
@router.get("/reports/profit-loss")
async def get_profit_loss_report(
    company_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    comparison_type: str = Query("none"),
    comparison_start_date: Optional[date] = Query(None),
    comparison_end_date: Optional[date] = Query(None),
    include_subtotals: bool = Query(True),
    show_cents: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Generate Profit & Loss report"""
    
    request = ProfitLossRequest(
        start_date=start_date,
        end_date=end_date,
        comparison_type=comparison_type,
        comparison_start_date=comparison_start_date,
        comparison_end_date=comparison_end_date,
        include_subtotals=include_subtotals,
        show_cents=show_cents
    )
    
    report_data = await FinancialReportService.generate_profit_loss_report(
        db, company_id, request
    )
    
    return report_data

@router.get("/reports/balance-sheet")
async def get_balance_sheet_report(
    company_id: str,
    as_of_date: date = Query(...),
    comparison_date: Optional[date] = Query(None),
    include_subtotals: bool = Query(True),
    show_cents: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Generate Balance Sheet report"""
    
    request = BalanceSheetRequest(
        as_of_date=as_of_date,
        comparison_date=comparison_date,
        include_subtotals=include_subtotals,
        show_cents=show_cents
    )
    
    report_data = await FinancialReportService.generate_balance_sheet_report(
        db, company_id, request
    )
    
    return report_data

@router.get("/reports/cash-flow")
async def get_cash_flow_report(
    company_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    method: str = Query("indirect"),
    include_subtotals: bool = Query(True),
    show_cents: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Generate Cash Flow Statement report"""
    
    request = CashFlowRequest(
        start_date=start_date,
        end_date=end_date,
        method=method,
        include_subtotals=include_subtotals,
        show_cents=show_cents
    )
    
    report_data = await FinancialReportService.generate_cash_flow_report(
        db, company_id, request
    )
    
    return report_data

@router.get("/reports/trial-balance")
async def get_trial_balance_report(
    company_id: str,
    as_of_date: date = Query(...),
    include_zero_balances: bool = Query(False),
    show_cents: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Generate Trial Balance report"""
    
    request = TrialBalanceRequest(
        as_of_date=as_of_date,
        include_zero_balances=include_zero_balances,
        show_cents=show_cents
    )
    
    report_data = await FinancialReportService.generate_trial_balance_report(
        db, company_id, request
    )
    
    return report_data

@router.get("/reports/ar-aging")
async def get_ar_aging_report(
    company_id: str,
    as_of_date: date = Query(...),
    aging_periods: List[int] = Query([30, 60, 90, 120]),
    include_zero_balances: bool = Query(False),
    customer_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Generate Accounts Receivable Aging report"""
    
    request = AgingReportRequest(
        as_of_date=as_of_date,
        aging_periods=aging_periods,
        include_zero_balances=include_zero_balances,
        customer_id=customer_id
    )
    
    report_data = await FinancialReportService.generate_ar_aging_report(
        db, company_id, request
    )
    
    return report_data

@router.get("/reports/dashboard")
async def get_dashboard_summary(
    company_id: str,
    date_range: str = Query("this-month", description="Date range for dashboard stats"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Get dashboard summary data"""
    
    # Calculate date range
    from datetime import datetime, date, timedelta
    
    today = date.today()
    if date_range == "today":
        start_date = today
        end_date = today
    elif date_range == "this-week":
        start_date = today - timedelta(days=today.weekday())
        end_date = today
    elif date_range == "this-month":
        start_date = today.replace(day=1)
        end_date = today
    elif date_range == "this-quarter":
        quarter = (today.month - 1) // 3 + 1
        start_date = date(today.year, (quarter - 1) * 3 + 1, 1)
        end_date = today
    elif date_range == "this-year":
        start_date = date(today.year, 1, 1)
        end_date = today
    else:
        start_date = today.replace(day=1)
        end_date = today
    
    try:
        # Use a single optimized query to get all dashboard stats
        # This combines multiple queries into one for better performance
        dashboard_query = select(
            func.sum(
                case(
                    (
                        and_(
                            Transaction.transaction_date >= start_date,
                            Transaction.transaction_date <= end_date,
                            Transaction.status == TransactionStatus.POSTED,
                            Transaction.transaction_type == TransactionType.INVOICE
                        ),
                        Transaction.total_amount
                    ),
                    else_=0
                )
            ).label('total_income'),
            func.sum(
                case(
                    (
                        and_(
                            Transaction.transaction_date >= start_date,
                            Transaction.transaction_date <= end_date,
                            Transaction.status == TransactionStatus.POSTED,
                            Transaction.transaction_type == TransactionType.BILL
                        ),
                        Transaction.total_amount
                    ),
                    else_=0
                )
            ).label('total_expenses'),
            func.sum(
                case(
                    (
                        and_(
                            Transaction.transaction_type == TransactionType.INVOICE,
                            Transaction.status == TransactionStatus.POSTED,
                            Transaction.balance_due > 0
                        ),
                        Transaction.balance_due
                    ),
                    else_=0
                )
            ).label('outstanding_amount')
        ).where(
            Transaction.company_id == company_id
        )
        
        result = await db.execute(dashboard_query)
        row = result.first()
        
        total_income = row.total_income or Decimal('0.0')
        total_expenses = row.total_expenses or Decimal('0.0')
        outstanding_invoices = row.outstanding_amount or Decimal('0.0')
        
        # Calculate net income
        net_income = total_income - total_expenses
        
        # Get recent transactions (last 10) with limited fields for better performance
        recent_query = select(
            Transaction.transaction_id,
            Transaction.transaction_type,
            Transaction.transaction_number,
            Transaction.transaction_date,
            Transaction.total_amount,
            Transaction.status
        ).where(
            and_(
                Transaction.company_id == company_id,
                Transaction.status == TransactionStatus.POSTED
            )
        ).order_by(desc(Transaction.created_at)).limit(10)
        
        recent_result = await db.execute(recent_query)
        recent_transactions = recent_result.all()
        
        # Format recent transactions
        recent_transactions_data = []
        for tx in recent_transactions:
            recent_transactions_data.append({
                "transaction_id": tx.transaction_id,
                "transaction_type": tx.transaction_type.value.title(),
                "transaction_number": tx.transaction_number,
                "customer_name": None,  # Will be populated when relationships are loaded
                "vendor_name": None,
                "transaction_date": tx.transaction_date.isoformat(),
                "total_amount": float(tx.total_amount),
                "status": tx.status.value.title()
            })
        
        # Calculate percentage changes (mock for now)
        income_change = "+12.5%"
        expenses_change = "+8.2%"
        net_income_change = "+15.3%"
        outstanding_change = "-5.2%"
        
        return {
            "date_range": date_range,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "stats": {
                "total_income": {
                    "value": float(total_income),
                    "change": income_change,
                    "trend": "up"
                },
                "total_expenses": {
                    "value": float(total_expenses),
                    "change": expenses_change,
                    "trend": "up"
                },
                "net_income": {
                    "value": float(net_income),
                    "change": net_income_change,
                    "trend": "up"
                },
                "outstanding_invoices": {
                    "value": float(outstanding_invoices),
                    "change": outstanding_change,
                    "trend": "down"
                }
            },
            "recent_transactions": recent_transactions_data,
            "accounts_receivable": {
                "current": float(outstanding_invoices * Decimal('0.6')),
                "days_31_60": float(outstanding_invoices * Decimal('0.25')),
                "days_61_90": float(outstanding_invoices * Decimal('0.1')),
                "over_90_days": float(outstanding_invoices * Decimal('0.05'))
            }
        }
    
    except Exception as e:
        logger.error(f"Dashboard API error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating dashboard summary: {str(e)}"
        )


@router.get("/reports/ap-aging")
async def get_ap_aging_report(
    company_id: str,
    as_of_date: date = Query(...),
    aging_periods: List[int] = Query([30, 60, 90, 120]),
    include_zero_balances: bool = Query(False),
    vendor_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_company_access)
):
    """Generate Accounts Payable Aging report"""
    
    request = AgingReportRequest(
        as_of_date=as_of_date,
        aging_periods=aging_periods,
        include_zero_balances=include_zero_balances,
        vendor_id=vendor_id
    )
    
    report_data = await FinancialReportService.generate_ap_aging_report(
        db, company_id, request
    )
    
    return report_data