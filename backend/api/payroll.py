from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional
from datetime import datetime, date, timedelta
import uuid

from database.connection import get_db
from services.security import get_current_user
from services.payroll_service import PayrollService
from models.user import User
from models.payroll import (
    PayrollItem, EmployeePayrollInfo, PayrollRun, Paycheck, PaycheckLine,
    TimeEntry, PayrollLiability, FederalTaxTable, StateTaxTable, PayrollForm,
    PayrollRunStatus, PayrollLiabilityStatus
)
from models.list_management import Employee
from schemas.payroll_schemas import (
    PayrollItem as PayrollItemSchema, PayrollItemCreate, PayrollItemUpdate, PayrollItemListResponse,
    EmployeePayrollInfo as EmployeePayrollInfoSchema, EmployeePayrollInfoCreate, EmployeePayrollInfoUpdate, EmployeePayrollInfoListResponse,
    PayrollRun as PayrollRunSchema, PayrollRunCreate, PayrollRunUpdate, PayrollRunListResponse,
    Paycheck as PaycheckSchema, PaycheckListResponse,
    TimeEntry as TimeEntrySchema, TimeEntryCreate, TimeEntryUpdate, TimeEntryListResponse,
    PayrollLiability as PayrollLiabilitySchema, PayrollLiabilityCreate, PayrollLiabilityUpdate, PayrollLiabilityListResponse,
    FederalTaxTable as FederalTaxTableSchema, FederalTaxTableCreate,
    StateTaxTable as StateTaxTableSchema, StateTaxTableCreate,
    PayrollForm as PayrollFormSchema, PayrollFormCreate, PayrollFormUpdate,
    VoidPaycheckRequest, ApprovePayrollRunRequest, ProcessPayrollRunRequest, PayLiabilityRequest,
    PayrollRunCalculationResponse
)

router = APIRouter(prefix="/companies/{company_id}", tags=["payroll"])
security = HTTPBearer()

# Helper function to verify company access
def verify_company_access(company_id: str, current_user: User, db: Session):
    # This would check if user has access to the company
    # Implementation would depend on your company access model
    return True

# ===== PAYROLL ITEMS ENDPOINTS =====

@router.get("/payroll-items", response_model=PayrollItemListResponse)
async def get_payroll_items(
    company_id: str = Path(..., description="Company ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    item_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_by: str = Query("item_name", pattern="^(item_name|item_type|created_at)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payroll items for a company with filtering and pagination"""
    
    verify_company_access(company_id, current_user, db)
    
    query = db.query(PayrollItem).filter(PayrollItem.company_id == company_id)
    
    # Apply filters
    if search:
        query = query.filter(PayrollItem.item_name.ilike(f"%{search}%"))
    
    if item_type:
        query = query.filter(PayrollItem.item_type == item_type)
    
    if is_active is not None:
        query = query.filter(PayrollItem.is_active == is_active)
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(PayrollItem, sort_by)))
    else:
        query = query.order_by(asc(getattr(PayrollItem, sort_by)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    
    return PayrollItemListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=offset + page_size < total,
        has_prev=page > 1
    )

@router.post("/payroll-items", response_model=PayrollItemSchema, status_code=status.HTTP_201_CREATED)
async def create_payroll_item(
    company_id: str = Path(..., description="Company ID"),
    payroll_item_data: PayrollItemCreate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new payroll item"""
    
    verify_company_access(company_id, current_user, db)
    
    # Check if payroll item name already exists for this company
    existing_item = db.query(PayrollItem).filter(
        PayrollItem.company_id == company_id,
        PayrollItem.item_name == payroll_item_data.item_name
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payroll item with this name already exists"
        )
    
    payroll_item = PayrollItem(
        payroll_item_id=str(uuid.uuid4()),
        company_id=company_id,
        **payroll_item_data.model_dump()
    )
    
    db.add(payroll_item)
    db.commit()
    db.refresh(payroll_item)
    
    return payroll_item

@router.get("/payroll-items/{item_id}", response_model=PayrollItemSchema)
async def get_payroll_item(
    company_id: str = Path(..., description="Company ID"),
    item_id: str = Path(..., description="Payroll Item ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific payroll item"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_item = db.query(PayrollItem).filter(
        PayrollItem.payroll_item_id == item_id,
        PayrollItem.company_id == company_id
    ).first()
    
    if not payroll_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll item not found"
        )
    
    return payroll_item

@router.put("/payroll-items/{item_id}", response_model=PayrollItemSchema)
async def update_payroll_item(
    company_id: str = Path(..., description="Company ID"),
    item_id: str = Path(..., description="Payroll Item ID"),
    payroll_item_data: PayrollItemUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a payroll item"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_item = db.query(PayrollItem).filter(
        PayrollItem.payroll_item_id == item_id,
        PayrollItem.company_id == company_id
    ).first()
    
    if not payroll_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll item not found"
        )
    
    # Update fields
    update_data = payroll_item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payroll_item, field, value)
    
    payroll_item.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(payroll_item)
    
    return payroll_item

@router.delete("/payroll-items/{item_id}")
async def delete_payroll_item(
    company_id: str = Path(..., description="Company ID"),
    item_id: str = Path(..., description="Payroll Item ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a payroll item (soft delete)"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_item = db.query(PayrollItem).filter(
        PayrollItem.payroll_item_id == item_id,
        PayrollItem.company_id == company_id
    ).first()
    
    if not payroll_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll item not found"
        )
    
    payroll_item.is_active = False
    payroll_item.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Payroll item deleted successfully"}

# ===== EMPLOYEE PAYROLL INFO ENDPOINTS =====

@router.get("/employees/{employee_id}/payroll", response_model=EmployeePayrollInfoSchema)
async def get_employee_payroll_info(
    company_id: str = Path(..., description="Company ID"),
    employee_id: str = Path(..., description="Employee ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payroll information for an employee"""
    
    verify_company_access(company_id, current_user, db)
    
    # Verify employee belongs to company
    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id,
        Employee.company_id == company_id
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    payroll_info = db.query(EmployeePayrollInfo).filter(
        EmployeePayrollInfo.employee_id == employee_id
    ).first()
    
    if not payroll_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee payroll information not found"
        )
    
    return payroll_info

@router.put("/employees/{employee_id}/payroll", response_model=EmployeePayrollInfoSchema)
async def update_employee_payroll_info(
    company_id: str = Path(..., description="Company ID"),
    employee_id: str = Path(..., description="Employee ID"),
    payroll_data: EmployeePayrollInfoUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update payroll information for an employee"""
    
    verify_company_access(company_id, current_user, db)
    
    # Verify employee belongs to company
    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id,
        Employee.company_id == company_id
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    payroll_info = db.query(EmployeePayrollInfo).filter(
        EmployeePayrollInfo.employee_id == employee_id
    ).first()
    
    if not payroll_info:
        # Create new payroll info if it doesn't exist
        payroll_create_data = EmployeePayrollInfoCreate(
            employee_id=employee_id,
            **payroll_data.model_dump(exclude_unset=True)
        )
        
        payroll_info = EmployeePayrollInfo(
            employee_payroll_id=str(uuid.uuid4()),
            **payroll_create_data.model_dump()
        )
        
        db.add(payroll_info)
    else:
        # Update existing payroll info
        update_data = payroll_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(payroll_info, field, value)
        
        payroll_info.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(payroll_info)
    
    return payroll_info

# ===== TIME ENTRIES ENDPOINTS =====

@router.get("/time-entries", response_model=TimeEntryListResponse)
async def get_time_entries(
    company_id: str = Path(..., description="Company ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    employee_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    approved: Optional[bool] = Query(None),
    billable: Optional[bool] = Query(None),
    sort_by: str = Query("date", pattern="^(date|hours|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get time entries for a company with filtering and pagination"""
    
    verify_company_access(company_id, current_user, db)
    
    query = db.query(TimeEntry).filter(TimeEntry.company_id == company_id)
    
    # Apply filters
    if employee_id:
        query = query.filter(TimeEntry.employee_id == employee_id)
    
    if start_date:
        query = query.filter(TimeEntry.date >= start_date)
    
    if end_date:
        query = query.filter(TimeEntry.date <= end_date)
    
    if approved is not None:
        query = query.filter(TimeEntry.approved == approved)
    
    if billable is not None:
        query = query.filter(TimeEntry.billable == billable)
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(TimeEntry, sort_by)))
    else:
        query = query.order_by(asc(getattr(TimeEntry, sort_by)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    
    return TimeEntryListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=offset + page_size < total,
        has_prev=page > 1
    )

@router.post("/time-entries", response_model=TimeEntrySchema, status_code=status.HTTP_201_CREATED)
async def create_time_entry(
    company_id: str = Path(..., description="Company ID"),
    time_entry_data: TimeEntryCreate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new time entry"""
    
    verify_company_access(company_id, current_user, db)
    
    # Verify employee belongs to company
    employee = db.query(Employee).filter(
        Employee.employee_id == time_entry_data.employee_id,
        Employee.company_id == company_id
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee not found in this company"
        )
    
    time_entry = TimeEntry(
        time_entry_id=str(uuid.uuid4()),
        company_id=company_id,
        created_by=current_user.user_id,
        **time_entry_data.model_dump()
    )
    
    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)
    
    return time_entry

@router.get("/time-entries/{entry_id}", response_model=TimeEntrySchema)
async def get_time_entry(
    company_id: str = Path(..., description="Company ID"),
    entry_id: str = Path(..., description="Time Entry ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific time entry"""
    
    verify_company_access(company_id, current_user, db)
    
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.time_entry_id == entry_id,
        TimeEntry.company_id == company_id
    ).first()
    
    if not time_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    return time_entry

@router.put("/time-entries/{entry_id}", response_model=TimeEntrySchema)
async def update_time_entry(
    company_id: str = Path(..., description="Company ID"),
    entry_id: str = Path(..., description="Time Entry ID"),
    time_entry_data: TimeEntryUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a time entry"""
    
    verify_company_access(company_id, current_user, db)
    
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.time_entry_id == entry_id,
        TimeEntry.company_id == company_id
    ).first()
    
    if not time_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    # Update fields
    update_data = time_entry_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(time_entry, field, value)
    
    time_entry.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(time_entry)
    
    return time_entry

@router.delete("/time-entries/{entry_id}")
async def delete_time_entry(
    company_id: str = Path(..., description="Company ID"),
    entry_id: str = Path(..., description="Time Entry ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a time entry"""
    
    verify_company_access(company_id, current_user, db)
    
    time_entry = db.query(TimeEntry).filter(
        TimeEntry.time_entry_id == entry_id,
        TimeEntry.company_id == company_id
    ).first()
    
    if not time_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )
    
    db.delete(time_entry)
    db.commit()
    
    return {"message": "Time entry deleted successfully"}

# ===== PAYROLL RUNS ENDPOINTS =====

@router.get("/payroll-runs", response_model=PayrollRunListResponse)
async def get_payroll_runs(
    company_id: str = Path(..., description="Company ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    sort_by: str = Query("pay_date", pattern="^(pay_date|pay_period_start|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payroll runs for a company with filtering and pagination"""
    
    verify_company_access(company_id, current_user, db)
    
    query = db.query(PayrollRun).filter(PayrollRun.company_id == company_id)
    
    # Apply filters
    if status:
        query = query.filter(PayrollRun.status == status)
    
    if year:
        query = query.filter(func.extract('year', PayrollRun.pay_date) == year)
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(PayrollRun, sort_by)))
    else:
        query = query.order_by(asc(getattr(PayrollRun, sort_by)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    
    return PayrollRunListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=offset + page_size < total,
        has_prev=page > 1
    )

@router.post("/payroll-runs", response_model=PayrollRunSchema, status_code=status.HTTP_201_CREATED)
async def create_payroll_run(
    company_id: str = Path(..., description="Company ID"),
    payroll_run_data: PayrollRunCreate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new payroll run"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_service = PayrollService(db)
    payroll_run = payroll_service.create_payroll_run(
        company_id, payroll_run_data, current_user.user_id
    )
    
    return payroll_run

@router.get("/payroll-runs/{run_id}", response_model=PayrollRunSchema)
async def get_payroll_run(
    company_id: str = Path(..., description="Company ID"),
    run_id: str = Path(..., description="Payroll Run ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific payroll run"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_run = db.query(PayrollRun).filter(
        PayrollRun.payroll_run_id == run_id,
        PayrollRun.company_id == company_id
    ).first()
    
    if not payroll_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll run not found"
        )
    
    return payroll_run

@router.post("/payroll-runs/{run_id}/calculate", response_model=PayrollRunCalculationResponse)
async def calculate_payroll_run(
    company_id: str = Path(..., description="Company ID"),
    run_id: str = Path(..., description="Payroll Run ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate payroll for a payroll run"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_run = db.query(PayrollRun).filter(
        PayrollRun.payroll_run_id == run_id,
        PayrollRun.company_id == company_id
    ).first()
    
    if not payroll_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll run not found"
        )
    
    payroll_service = PayrollService(db)
    
    payroll_run_data = PayrollRunCreate(
        pay_period_start=payroll_run.pay_period_start,
        pay_period_end=payroll_run.pay_period_end,
        pay_date=payroll_run.pay_date,
        run_type=payroll_run.run_type
    )
    
    calculation_result = payroll_service.calculate_payroll_run(company_id, payroll_run_data)
    calculation_result.payroll_run_id = run_id
    
    return calculation_result

@router.post("/payroll-runs/{run_id}/process", response_model=PayrollRunSchema)
async def process_payroll_run(
    company_id: str = Path(..., description="Company ID"),
    run_id: str = Path(..., description="Payroll Run ID"),
    process_data: ProcessPayrollRunRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process a payroll run and create paychecks"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_service = PayrollService(db)
    payroll_run = payroll_service.process_payroll_run(run_id, company_id)
    
    return payroll_run

@router.post("/payroll-runs/{run_id}/approve", response_model=PayrollRunSchema)
async def approve_payroll_run(
    company_id: str = Path(..., description="Company ID"),
    run_id: str = Path(..., description="Payroll Run ID"),
    approve_data: ApprovePayrollRunRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a payroll run"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_service = PayrollService(db)
    payroll_run = payroll_service.approve_payroll_run(run_id, company_id, current_user.user_id)
    
    return payroll_run

# ===== PAYCHECKS ENDPOINTS =====

@router.get("/paychecks", response_model=PaycheckListResponse)
async def get_paychecks(
    company_id: str = Path(..., description="Company ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    employee_id: Optional[str] = Query(None),
    payroll_run_id: Optional[str] = Query(None),
    is_void: Optional[bool] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    sort_by: str = Query("pay_date", pattern="^(pay_date|check_number|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paychecks for a company with filtering and pagination"""
    
    verify_company_access(company_id, current_user, db)
    
    query = db.query(Paycheck).join(PayrollRun).filter(PayrollRun.company_id == company_id)
    
    # Apply filters
    if employee_id:
        query = query.filter(Paycheck.employee_id == employee_id)
    
    if payroll_run_id:
        query = query.filter(Paycheck.payroll_run_id == payroll_run_id)
    
    if is_void is not None:
        query = query.filter(Paycheck.is_void == is_void)
    
    if start_date:
        query = query.filter(Paycheck.pay_date >= start_date)
    
    if end_date:
        query = query.filter(Paycheck.pay_date <= end_date)
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(Paycheck, sort_by)))
    else:
        query = query.order_by(asc(getattr(Paycheck, sort_by)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    items = query.options(joinedload(Paycheck.paycheck_lines)).offset(offset).limit(page_size).all()
    
    return PaycheckListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=offset + page_size < total,
        has_prev=page > 1
    )

@router.get("/paychecks/{paycheck_id}", response_model=PaycheckSchema)
async def get_paycheck(
    company_id: str = Path(..., description="Company ID"),
    paycheck_id: str = Path(..., description="Paycheck ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific paycheck"""
    
    verify_company_access(company_id, current_user, db)
    
    paycheck = db.query(Paycheck).join(PayrollRun).options(
        joinedload(Paycheck.paycheck_lines)
    ).filter(
        Paycheck.paycheck_id == paycheck_id,
        PayrollRun.company_id == company_id
    ).first()
    
    if not paycheck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paycheck not found"
        )
    
    return paycheck

@router.post("/paychecks/{paycheck_id}/void", response_model=PaycheckSchema)
async def void_paycheck(
    company_id: str = Path(..., description="Company ID"),
    paycheck_id: str = Path(..., description="Paycheck ID"),
    void_data: VoidPaycheckRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Void a paycheck"""
    
    verify_company_access(company_id, current_user, db)
    
    payroll_service = PayrollService(db)
    paycheck = payroll_service.void_paycheck(paycheck_id, company_id, void_data.reason)
    
    return paycheck

# ===== PAYROLL LIABILITIES ENDPOINTS =====

@router.get("/payroll-liabilities", response_model=PayrollLiabilityListResponse)
async def get_payroll_liabilities(
    company_id: str = Path(..., description="Company ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    liability_type: Optional[str] = Query(None),
    due_before: Optional[date] = Query(None),
    sort_by: str = Query("due_date", pattern="^(due_date|amount|created_at)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payroll liabilities for a company with filtering and pagination"""
    
    verify_company_access(company_id, current_user, db)
    
    query = db.query(PayrollLiability).filter(PayrollLiability.company_id == company_id)
    
    # Apply filters
    if status:
        query = query.filter(PayrollLiability.status == status)
    
    if liability_type:
        query = query.filter(PayrollLiability.liability_type.ilike(f"%{liability_type}%"))
    
    if due_before:
        query = query.filter(PayrollLiability.due_date <= due_before)
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(PayrollLiability, sort_by)))
    else:
        query = query.order_by(asc(getattr(PayrollLiability, sort_by)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    
    return PayrollLiabilityListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=offset + page_size < total,
        has_prev=page > 1
    )

@router.get("/payroll-liabilities/due", response_model=PayrollLiabilityListResponse)
async def get_due_payroll_liabilities(
    company_id: str = Path(..., description="Company ID"),
    days_ahead: int = Query(30, ge=0, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payroll liabilities due within specified days"""
    
    verify_company_access(company_id, current_user, db)
    
    due_date = date.today() + timedelta(days=days_ahead)
    
    items = db.query(PayrollLiability).filter(
        PayrollLiability.company_id == company_id,
        PayrollLiability.status == PayrollLiabilityStatus.PENDING,
        PayrollLiability.due_date <= due_date
    ).order_by(PayrollLiability.due_date).all()
    
    return PayrollLiabilityListResponse(
        items=items,
        total=len(items),
        page=1,
        page_size=len(items),
        has_next=False,
        has_prev=False
    )

@router.post("/payroll-liabilities/{liability_id}/pay", response_model=PayrollLiabilitySchema)
async def pay_payroll_liability(
    company_id: str = Path(..., description="Company ID"),
    liability_id: str = Path(..., description="Liability ID"),
    payment_data: PayLiabilityRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record payment for a payroll liability"""
    
    verify_company_access(company_id, current_user, db)
    
    liability = db.query(PayrollLiability).filter(
        PayrollLiability.liability_id == liability_id,
        PayrollLiability.company_id == company_id
    ).first()
    
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll liability not found"
        )
    
    if liability.status == PayrollLiabilityStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Liability is already paid"
        )
    
    # Update liability with payment information
    liability.paid_amount += payment_data.payment_amount
    liability.balance = liability.amount - liability.paid_amount
    liability.payment_date = payment_data.payment_date
    liability.payment_method = payment_data.payment_method
    liability.payment_reference = payment_data.payment_reference
    
    # Update status based on payment
    if liability.balance <= 0:
        liability.status = PayrollLiabilityStatus.PAID
    else:
        liability.status = PayrollLiabilityStatus.PARTIAL
    
    liability.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(liability)
    
    return liability