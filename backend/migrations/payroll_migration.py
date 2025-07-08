#!/usr/bin/env python3
"""
Payroll Module Database Migration Script
Creates all payroll-related tables and inserts sample data
"""

import os
import sys
import sqlite3
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(backend_dir))

# Create synchronous database connection for migration
DATABASE_URL = "sqlite:///./quickbooks_clone.db"
sync_engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=sync_engine)

from models.payroll import (
    PayrollItem, EmployeePayrollInfo, PayrollRun, Paycheck, PaycheckLine,
    TimeEntry, PayrollLiability, FederalTaxTable, StateTaxTable, PayrollForm,
    PayrollItemType, PayFrequency, PayType, FilingStatus, PayrollRunStatus
)
from models.list_management import Employee
from database.connection import Base

def create_payroll_tables():
    """Create all payroll tables"""
    print("Creating payroll tables...")
    
    # Import all models to ensure they're registered
    from models import payroll
    
    # Create all tables
    Base.metadata.create_all(bind=sync_engine)
    print("✅ Payroll tables created successfully!")

def insert_sample_payroll_items(db, company_id):
    """Insert sample payroll items"""
    print("Inserting sample payroll items...")
    
    sample_items = [
        {
            "item_name": "Regular Wages",
            "item_type": PayrollItemType.WAGES,
            "item_category": "Earnings",
            "calculation_basis": "hourly",
            "tax_tracking": "W-2 Wages"
        },
        {
            "item_name": "Overtime Wages",
            "item_type": PayrollItemType.OVERTIME,
            "item_category": "Earnings",
            "calculation_basis": "hourly",
            "tax_tracking": "W-2 Wages"
        },
        {
            "item_name": "Salary",
            "item_type": PayrollItemType.SALARY,
            "item_category": "Earnings",
            "calculation_basis": "salary",
            "tax_tracking": "W-2 Wages"
        },
        {
            "item_name": "Bonus",
            "item_type": PayrollItemType.BONUS,
            "item_category": "Earnings",
            "calculation_basis": "amount",
            "tax_tracking": "W-2 Wages"
        },
        {
            "item_name": "Federal Income Tax",
            "item_type": PayrollItemType.TAX,
            "item_category": "Taxes",
            "calculation_basis": "percentage",
            "tax_tracking": "Federal Income Tax"
        },
        {
            "item_name": "Social Security Tax",
            "item_type": PayrollItemType.TAX,
            "item_category": "Taxes",
            "calculation_basis": "percentage",
            "rate": Decimal("0.062"),
            "annual_limit": Decimal("160200"),
            "tax_tracking": "Social Security Tax"
        },
        {
            "item_name": "Medicare Tax",
            "item_type": PayrollItemType.TAX,
            "item_category": "Taxes",
            "calculation_basis": "percentage",
            "rate": Decimal("0.0145"),
            "tax_tracking": "Medicare Tax"
        },
        {
            "item_name": "State Income Tax",
            "item_type": PayrollItemType.TAX,
            "item_category": "Taxes",
            "calculation_basis": "percentage",
            "tax_tracking": "State Income Tax"
        },
        {
            "item_name": "Health Insurance",
            "item_type": PayrollItemType.DEDUCTION,
            "item_category": "Benefits",
            "calculation_basis": "amount",
            "tax_tracking": "Health Insurance"
        },
        {
            "item_name": "401(k) Contribution",
            "item_type": PayrollItemType.DEDUCTION,
            "item_category": "Retirement",
            "calculation_basis": "percentage",
            "annual_limit": Decimal("22500"),
            "tax_tracking": "401(k) Contribution"
        }
    ]
    
    for item_data in sample_items:
        item = PayrollItem(
            company_id=company_id,
            **item_data
        )
        db.add(item)
    
    db.commit()
    print(f"✅ Inserted {len(sample_items)} sample payroll items!")

def insert_sample_tax_tables(db):
    """Insert sample federal and state tax tables"""
    print("Inserting sample tax tables...")
    
    current_year = datetime.now().year
    
    # Federal tax tables for 2023 (simplified)
    federal_tax_data = [
        # Single filer, weekly pay
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("0"), "income_to": Decimal("198"), "base_tax": Decimal("0"), "tax_rate": Decimal("0.10")},
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("198"), "income_to": Decimal("803"), "base_tax": Decimal("19.80"), "tax_rate": Decimal("0.12")},
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("803"), "income_to": Decimal("1736"), "base_tax": Decimal("92.40"), "tax_rate": Decimal("0.22")},
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("1736"), "income_to": None, "base_tax": Decimal("297.66"), "tax_rate": Decimal("0.24")},
        
        # Married filing jointly, weekly pay
        {"filing_status": FilingStatus.MARRIED_JOINTLY, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("0"), "income_to": Decimal("396"), "base_tax": Decimal("0"), "tax_rate": Decimal("0.10")},
        {"filing_status": FilingStatus.MARRIED_JOINTLY, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("396"), "income_to": Decimal("1606"), "base_tax": Decimal("39.60"), "tax_rate": Decimal("0.12")},
        {"filing_status": FilingStatus.MARRIED_JOINTLY, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("1606"), "income_to": Decimal("2906"), "base_tax": Decimal("184.80"), "tax_rate": Decimal("0.22")},
        {"filing_status": FilingStatus.MARRIED_JOINTLY, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("2906"), "income_to": None, "base_tax": Decimal("470.80"), "tax_rate": Decimal("0.24")},
        
        # Biweekly versions (doubled amounts)
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.BIWEEKLY, 
         "income_from": Decimal("0"), "income_to": Decimal("396"), "base_tax": Decimal("0"), "tax_rate": Decimal("0.10")},
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.BIWEEKLY, 
         "income_from": Decimal("396"), "income_to": Decimal("1606"), "base_tax": Decimal("39.60"), "tax_rate": Decimal("0.12")},
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.BIWEEKLY, 
         "income_from": Decimal("1606"), "income_to": Decimal("3472"), "base_tax": Decimal("184.80"), "tax_rate": Decimal("0.22")},
        {"filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.BIWEEKLY, 
         "income_from": Decimal("3472"), "income_to": None, "base_tax": Decimal("595.32"), "tax_rate": Decimal("0.24")},
    ]
    
    for tax_data in federal_tax_data:
        tax_table = FederalTaxTable(
            tax_year=current_year,
            standard_deduction=Decimal("13850") if tax_data["filing_status"] == FilingStatus.SINGLE else Decimal("27700"),
            personal_exemption=Decimal("0"),  # No personal exemption for 2023
            **tax_data
        )
        db.add(tax_table)
    
    # Sample state tax tables (California)
    ca_tax_data = [
        # Single filer, weekly pay
        {"state_code": "CA", "filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("0"), "income_to": Decimal("173"), "base_tax": Decimal("0"), "tax_rate": Decimal("0.01")},
        {"state_code": "CA", "filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("173"), "income_to": Decimal("413"), "base_tax": Decimal("1.73"), "tax_rate": Decimal("0.02")},
        {"state_code": "CA", "filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("413"), "income_to": Decimal("653"), "base_tax": Decimal("6.53"), "tax_rate": Decimal("0.04")},
        {"state_code": "CA", "filing_status": FilingStatus.SINGLE, "pay_frequency": PayFrequency.WEEKLY, 
         "income_from": Decimal("653"), "income_to": None, "base_tax": Decimal("16.13"), "tax_rate": Decimal("0.06")},
    ]
    
    for tax_data in ca_tax_data:
        tax_table = StateTaxTable(
            tax_year=current_year,
            standard_deduction=Decimal("5202"),  # CA standard deduction
            personal_exemption=Decimal("154"),  # CA personal exemption
            disability_insurance_rate=Decimal("0.009"),  # CA SDI rate
            **tax_data
        )
        db.add(tax_table)
    
    db.commit()
    print(f"✅ Inserted sample tax tables for {current_year}!")

def insert_sample_employee_payroll_info(db, company_id):
    """Insert sample employee payroll information"""
    print("Inserting sample employee payroll information...")
    
    # Get existing employees
    employees = db.query(Employee).filter(Employee.company_id == company_id).all()
    
    if not employees:
        print("No employees found to create payroll info for")
        return
    
    for i, employee in enumerate(employees[:3]):  # Limit to first 3 employees
        payroll_info = EmployeePayrollInfo(
            employee_id=employee.employee_id,
            pay_frequency=PayFrequency.BIWEEKLY,
            pay_type=PayType.HOURLY if i % 2 == 0 else PayType.SALARY,
            salary_amount=Decimal("65000") if i % 2 == 1 else None,
            hourly_rate=Decimal("25.50") if i % 2 == 0 else None,
            overtime_rate=Decimal("38.25") if i % 2 == 0 else None,
            federal_filing_status=FilingStatus.SINGLE if i % 2 == 0 else FilingStatus.MARRIED_JOINTLY,
            federal_allowances=1,
            federal_extra_withholding=Decimal("0"),
            state_filing_status=FilingStatus.SINGLE if i % 2 == 0 else FilingStatus.MARRIED_JOINTLY,
            state_allowances=1,
            state_extra_withholding=Decimal("0"),
            state_code="CA",
            sick_hours_available=Decimal("40"),
            vacation_hours_available=Decimal("80"),
            sick_accrual_rate=Decimal("3.08"),  # ~40 hours per year
            vacation_accrual_rate=Decimal("6.15"),  # ~80 hours per year
            bank_name="Demo Bank",
            account_number="****1234",
            routing_number="123456789",
            account_type="checking"
        )
        db.add(payroll_info)
    
    db.commit()
    print(f"✅ Inserted payroll info for {min(len(employees), 3)} employees!")

def insert_sample_time_entries(db, company_id):
    """Insert sample time entries"""
    print("Inserting sample time entries...")
    
    # Get employees with payroll info
    employees_with_payroll = db.query(Employee).join(EmployeePayrollInfo).filter(
        Employee.company_id == company_id
    ).all()
    
    if not employees_with_payroll:
        print("No employees with payroll info found")
        return
    
    # Create time entries for the last 2 weeks
    start_date = date.today() - timedelta(days=14)
    
    for employee in employees_with_payroll:
        for day in range(10):  # 10 working days (2 weeks)
            entry_date = start_date + timedelta(days=day)
            
            # Skip weekends
            if entry_date.weekday() >= 5:
                continue
            
            time_entry = TimeEntry(
                company_id=company_id,
                employee_id=employee.employee_id,
                date=entry_date,
                hours=Decimal("8.0"),
                break_hours=Decimal("1.0"),
                overtime_hours=Decimal("0") if day < 5 else Decimal("2.0"),  # Overtime on second week
                hourly_rate=Decimal("25.50"),
                overtime_rate=Decimal("38.25"),
                description=f"Regular work day - {entry_date.strftime('%A')}",
                billable=True,
                approved=True,
                created_by="system"  # Would be a real user ID in production
            )
            db.add(time_entry)
    
    db.commit()
    print(f"✅ Inserted sample time entries for {len(employees_with_payroll)} employees!")

def run_migration():
    """Run the complete payroll migration"""
    print("🚀 Starting Payroll Module Migration...")
    
    # Create tables
    create_payroll_tables()
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Get the first company for sample data
        # This assumes companies table exists with at least one company
        from models.user import Company
        company = db.query(Company).first()
        
        if not company:
            print("❌ No company found. Please create a company first.")
            return
        
        company_id = company.company_id
        print(f"Using company: {company.company_name} (ID: {company_id})")
        
        # Insert sample data
        insert_sample_payroll_items(db, company_id)
        insert_sample_tax_tables(db)
        insert_sample_employee_payroll_info(db, company_id)
        insert_sample_time_entries(db, company_id)
        
        print("\n🎉 Payroll Module Migration Completed Successfully!")
        print("\nPayroll tables created:")
        print("- payroll_items")
        print("- employee_payroll_info") 
        print("- payroll_runs")
        print("- paychecks")
        print("- paycheck_lines")
        print("- time_entries")
        print("- payroll_liabilities")
        print("- federal_tax_tables")
        print("- state_tax_tables")
        print("- payroll_forms")
        
        print("\nSample data inserted:")
        print("- 10 payroll items (wages, taxes, deductions)")
        print("- Federal and state tax tables for current year")
        print("- Employee payroll information")
        print("- Sample time entries for last 2 weeks")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()