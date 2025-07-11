from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Tuple, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, select
import uuid

from models.payroll import (
    PayrollItem, EmployeePayrollInfo, PayrollRun, Paycheck, PaycheckLine,
    TimeEntry, PayrollLiability, FederalTaxTable, StateTaxTable,
    PayrollItemType, PayFrequency, PayType, PayrollRunStatus, PaycheckLineType,
    FilingStatus, PayrollLiabilityStatus
)
from models.list_management import Employee
from schemas.payroll_schemas import (
    PayrollRunCreate, PayrollCalculationResult, PayrollRunCalculationResponse
)

class PayrollService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def calculate_payroll_run(self, company_id: str, payroll_run_data: PayrollRunCreate) -> PayrollRunCalculationResponse:
        """Calculate payroll for all employees in a payroll run"""
        
        # Get all active employees if no specific employee IDs provided
        if not payroll_run_data.employee_ids:
            result = await self.db.execute(
                select(Employee).filter(
                    Employee.company_id == company_id,
                    Employee.is_active == True
                )
            )
            employees = result.scalars().all()
            employee_ids = [emp.employee_id for emp in employees]
        else:
            employee_ids = payroll_run_data.employee_ids
        
        calculations = []
        total_gross_pay = Decimal('0')
        total_net_pay = Decimal('0')
        total_taxes = Decimal('0')
        total_deductions = Decimal('0')
        total_employer_taxes = Decimal('0')
        
        for employee_id in employee_ids:
            calc_result = await self._calculate_employee_payroll(
                company_id, employee_id, payroll_run_data.pay_period_start, payroll_run_data.pay_period_end
            )
            calculations.append(calc_result)
            
            total_gross_pay += calc_result.gross_pay
            total_net_pay += calc_result.net_pay
            total_taxes += calc_result.total_taxes
            total_deductions += calc_result.total_deductions
            total_employer_taxes += calc_result.employer_taxes
        
        return PayrollRunCalculationResponse(
            payroll_run_id="",  # Will be set when payroll run is created
            calculations=calculations,
            total_gross_pay=total_gross_pay,
            total_net_pay=total_net_pay,
            total_taxes=total_taxes,
            total_deductions=total_deductions,
            total_employer_taxes=total_employer_taxes
        )
    
    async def _calculate_employee_payroll(self, company_id: str, employee_id: str, 
                                  period_start: date, period_end: date) -> PayrollCalculationResult:
        """Calculate payroll for a single employee"""
        
        # Get employee payroll info
        result = await self.db.execute(
            select(EmployeePayrollInfo).filter(
                EmployeePayrollInfo.employee_id == employee_id
            )
        )
        payroll_info = result.scalars().first()
        
        if not payroll_info:
            raise ValueError(f"No payroll information found for employee {employee_id}")
        
        # Calculate gross pay
        gross_pay = await self._calculate_gross_pay(employee_id, payroll_info, period_start, period_end)
        
        # Calculate taxes
        tax_calculations = await self._calculate_taxes(payroll_info, gross_pay)
        
        # Calculate deductions (placeholder - would be more complex in real implementation)
        total_deductions = await self._calculate_deductions(employee_id, gross_pay)
        
        # Calculate net pay
        net_pay = gross_pay - tax_calculations['total_taxes'] - total_deductions
        
        return PayrollCalculationResult(
            employee_id=employee_id,
            gross_pay=gross_pay,
            federal_income_tax=tax_calculations['federal_income_tax'],
            state_income_tax=tax_calculations['state_income_tax'],
            social_security_tax=tax_calculations['social_security_tax'],
            medicare_tax=tax_calculations['medicare_tax'],
            state_disability_tax=tax_calculations['state_disability_tax'],
            total_taxes=tax_calculations['total_taxes'],
            total_deductions=total_deductions,
            net_pay=net_pay,
            employer_taxes=tax_calculations['employer_taxes']
        )
    
    async def _calculate_gross_pay(self, employee_id: str, payroll_info: EmployeePayrollInfo, 
                           period_start: date, period_end: date) -> Decimal:
        """Calculate gross pay for an employee"""
        
        if payroll_info.pay_type == PayType.SALARY:
            # For salary employees, calculate based on pay frequency
            return self._calculate_salary_pay(payroll_info)
        elif payroll_info.pay_type == PayType.HOURLY:
            # For hourly employees, calculate based on time entries
            return await self._calculate_hourly_pay(employee_id, payroll_info, period_start, period_end)
        else:
            # For commission and contractor, would need additional logic
            return Decimal('0')
    
    def _calculate_salary_pay(self, payroll_info: EmployeePayrollInfo) -> Decimal:
        """Calculate salary pay based on pay frequency"""
        if not payroll_info.salary_amount:
            return Decimal('0')
        
        salary = payroll_info.salary_amount
        
        if payroll_info.pay_frequency == PayFrequency.WEEKLY:
            return salary / 52
        elif payroll_info.pay_frequency == PayFrequency.BIWEEKLY:
            return salary / 26
        elif payroll_info.pay_frequency == PayFrequency.SEMIMONTHLY:
            return salary / 24
        elif payroll_info.pay_frequency == PayFrequency.MONTHLY:
            return salary / 12
        else:
            return salary / 26  # Default to biweekly
    
    async def _calculate_hourly_pay(self, employee_id: str, payroll_info: EmployeePayrollInfo, 
                            period_start: date, period_end: date) -> Decimal:
        """Calculate hourly pay based on time entries"""
        
        # Get time entries for the pay period
        result = await self.db.execute(
            select(TimeEntry).filter(
                TimeEntry.employee_id == employee_id,
                TimeEntry.date >= period_start,
                TimeEntry.date <= period_end,
                TimeEntry.approved == True
            )
        )
        time_entries = result.scalars().all()
        
        if not time_entries:
            return Decimal('0')
        
        total_regular_hours = Decimal('0')
        total_overtime_hours = Decimal('0')
        total_double_time_hours = Decimal('0')
        
        for entry in time_entries:
            total_regular_hours += entry.hours or Decimal('0')
            total_overtime_hours += entry.overtime_hours or Decimal('0')
            total_double_time_hours += entry.double_time_hours or Decimal('0')
        
        # Calculate overtime (over 40 hours per week for regular hours)
        if total_regular_hours > 40:
            overtime_hours = total_regular_hours - 40
            regular_hours = Decimal('40')
            total_overtime_hours += overtime_hours
        else:
            regular_hours = total_regular_hours
        
        # Calculate pay
        regular_rate = payroll_info.hourly_rate or Decimal('0')
        overtime_rate = payroll_info.overtime_rate or (regular_rate * Decimal('1.5'))
        double_time_rate = regular_rate * Decimal('2')
        
        gross_pay = (
            regular_hours * regular_rate +
            total_overtime_hours * overtime_rate +
            total_double_time_hours * double_time_rate
        )
        
        return gross_pay.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    async def _calculate_taxes(self, payroll_info: EmployeePayrollInfo, gross_pay: Decimal) -> Dict[str, Decimal]:
        """Calculate all taxes for an employee"""
        
        # Social Security tax (6.2% up to wage base)
        ss_wage_base = Decimal('160200')  # 2023 limit - would be configurable
        ss_rate = Decimal('0.062')
        social_security_tax = min(gross_pay * ss_rate, ss_wage_base * ss_rate)
        
        # Medicare tax (1.45%)
        medicare_rate = Decimal('0.0145')
        medicare_tax = gross_pay * medicare_rate
        
        # Additional Medicare tax (0.9% on income over $200,000) - simplified
        additional_medicare_tax = Decimal('0')
        if gross_pay > Decimal('3846.15'):  # Rough per-paycheck equivalent of $200k annually
            additional_medicare_tax = (gross_pay - Decimal('3846.15')) * Decimal('0.009')
        
        medicare_tax += additional_medicare_tax
        
        # Federal income tax
        federal_income_tax = await self._calculate_federal_income_tax(payroll_info, gross_pay)
        
        # State income tax
        state_income_tax = await self._calculate_state_income_tax(payroll_info, gross_pay)
        
        # State disability insurance (example for CA)
        state_disability_tax = Decimal('0')
        if payroll_info.state_code == 'CA':
            sdi_rate = Decimal('0.009')  # CA SDI rate
            sdi_wage_base = Decimal('153164')  # 2023 CA limit
            state_disability_tax = min(gross_pay * sdi_rate, sdi_wage_base * sdi_rate)
        
        total_taxes = (
            federal_income_tax + state_income_tax + social_security_tax + 
            medicare_tax + state_disability_tax
        )
        
        # Employer taxes (matching portions)
        employer_social_security = social_security_tax  # Employer matches
        employer_medicare = gross_pay * medicare_rate  # Employer matches regular Medicare
        employer_futa = gross_pay * Decimal('0.006')  # FUTA rate (up to wage base)
        employer_suta = gross_pay * Decimal('0.034')  # Example SUTA rate (varies by state)
        
        employer_taxes = employer_social_security + employer_medicare + employer_futa + employer_suta
        
        return {
            'federal_income_tax': federal_income_tax.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'state_income_tax': state_income_tax.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'social_security_tax': social_security_tax.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'medicare_tax': medicare_tax.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'state_disability_tax': state_disability_tax.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'total_taxes': total_taxes.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'employer_taxes': employer_taxes.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        }
    
    async def _calculate_federal_income_tax(self, payroll_info: EmployeePayrollInfo, gross_pay: Decimal) -> Decimal:
        """Calculate federal income tax using tax tables"""
        
        if not payroll_info.federal_filing_status:
            return Decimal('0')
        
        # Get current year tax table
        current_year = datetime.now().year
        result = await self.db.execute(
            select(FederalTaxTable).filter(
                FederalTaxTable.tax_year == current_year,
                FederalTaxTable.filing_status == payroll_info.federal_filing_status,
                FederalTaxTable.pay_frequency == payroll_info.pay_frequency,
                FederalTaxTable.income_from <= gross_pay,
                or_(FederalTaxTable.income_to.is_(None), FederalTaxTable.income_to >= gross_pay)
            )
        )
        tax_table = result.scalars().first()
        
        if not tax_table:
            # Fallback calculation - simplified percentage method
            return await self._calculate_federal_tax_percentage_method(payroll_info, gross_pay)
        
        # Calculate tax using tax table
        excess_income = gross_pay - tax_table.income_from
        federal_tax = tax_table.base_tax + (excess_income * tax_table.tax_rate)
        
        # Apply allowances and additional withholding
        allowance_amount = Decimal('87.50')  # 2023 per allowance amount - would be configurable
        allowance_reduction = payroll_info.federal_allowances * allowance_amount
        
        federal_tax = max(federal_tax - allowance_reduction, Decimal('0'))
        federal_tax += payroll_info.federal_extra_withholding
        
        return federal_tax
    
    def _calculate_federal_tax_percentage_method(self, payroll_info: EmployeePayrollInfo, gross_pay: Decimal) -> Decimal:
        """Simplified federal tax calculation using percentage method"""
        
        # This is a simplified calculation - real implementation would use current IRS tables
        filing_status = payroll_info.federal_filing_status
        
        # Standard deduction per paycheck (rough calculation)
        if filing_status == FilingStatus.SINGLE:
            standard_deduction = Decimal('13850') / 26  # Annual standard deduction / pay periods
        elif filing_status in [FilingStatus.MARRIED_JOINTLY, FilingStatus.QUALIFYING_WIDOW]:
            standard_deduction = Decimal('27700') / 26
        else:
            standard_deduction = Decimal('20800') / 26  # Head of household
        
        taxable_income = max(gross_pay - standard_deduction, Decimal('0'))
        
        # Simplified tax brackets (2023 single filer example)
        if taxable_income <= Decimal('200'):  # $10,275 annually / 26 = ~$395
            tax = taxable_income * Decimal('0.10')
        elif taxable_income <= Decimal('780'):  # $41,775 annually / 26 = ~$1607
            tax = Decimal('20') + (taxable_income - Decimal('200')) * Decimal('0.12')
        else:
            tax = Decimal('90') + (taxable_income - Decimal('780')) * Decimal('0.22')
        
        # Apply allowances and additional withholding
        allowance_amount = Decimal('87.50')
        allowance_reduction = payroll_info.federal_allowances * allowance_amount
        
        tax = max(tax - allowance_reduction, Decimal('0'))
        tax += payroll_info.federal_extra_withholding
        
        return tax
    
    def _calculate_state_income_tax(self, payroll_info: EmployeePayrollInfo, gross_pay: Decimal) -> Decimal:
        """Calculate state income tax"""
        
        if not payroll_info.state_code or not payroll_info.state_filing_status:
            return Decimal('0')
        
        # States with no income tax
        no_tax_states = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']
        if payroll_info.state_code in no_tax_states:
            return Decimal('0')
        
        # Get current year state tax table
        current_year = datetime.now().year
        tax_table = self.db.query(StateTaxTable).filter(
            StateTaxTable.state_code == payroll_info.state_code,
            StateTaxTable.tax_year == current_year,
            StateTaxTable.filing_status == payroll_info.state_filing_status,
            StateTaxTable.pay_frequency == payroll_info.pay_frequency,
            StateTaxTable.income_from <= gross_pay,
            or_(StateTaxTable.income_to.is_(None), StateTaxTable.income_to >= gross_pay)
        ).first()
        
        if not tax_table:
            # Fallback - use simplified rate based on state
            return self._calculate_state_tax_simplified(payroll_info, gross_pay)
        
        # Calculate tax using state tax table
        excess_income = gross_pay - tax_table.income_from
        state_tax = tax_table.base_tax + (excess_income * tax_table.tax_rate)
        
        # Apply allowances and additional withholding
        allowance_amount = Decimal('50.00')  # Varies by state
        allowance_reduction = payroll_info.state_allowances * allowance_amount
        
        state_tax = max(state_tax - allowance_reduction, Decimal('0'))
        state_tax += payroll_info.state_extra_withholding
        
        return state_tax
    
    def _calculate_state_tax_simplified(self, payroll_info: EmployeePayrollInfo, gross_pay: Decimal) -> Decimal:
        """Simplified state tax calculation"""
        
        # Simplified rates by state (examples)
        state_rates = {
            'CA': Decimal('0.04'),  # California example
            'NY': Decimal('0.04'),  # New York example
            'TX': Decimal('0.00'),  # No state income tax
            'FL': Decimal('0.00'),  # No state income tax
        }
        
        rate = state_rates.get(payroll_info.state_code, Decimal('0.03'))  # Default 3%
        state_tax = gross_pay * rate
        
        # Apply allowances and additional withholding
        allowance_amount = Decimal('50.00')
        allowance_reduction = payroll_info.state_allowances * allowance_amount
        
        state_tax = max(state_tax - allowance_reduction, Decimal('0'))
        state_tax += payroll_info.state_extra_withholding
        
        return state_tax
    
    def _calculate_deductions(self, employee_id: str, gross_pay: Decimal) -> Decimal:
        """Calculate employee deductions (health insurance, 401k, etc.)"""
        
        # This would be more complex in a real implementation
        # For now, return a simple calculation
        total_deductions = Decimal('0')
        
        # Example: Health insurance deduction
        # Would query employee benefit elections and calculate deductions
        
        return total_deductions
    
    def create_payroll_run(self, company_id: str, payroll_run_data: PayrollRunCreate, created_by: str) -> PayrollRun:
        """Create a new payroll run"""
        
        payroll_run = PayrollRun(
            payroll_run_id=str(uuid.uuid4()),
            company_id=company_id,
            pay_period_start=payroll_run_data.pay_period_start,
            pay_period_end=payroll_run_data.pay_period_end,
            pay_date=payroll_run_data.pay_date,
            run_type=payroll_run_data.run_type,
            status=PayrollRunStatus.DRAFT,
            created_by=created_by
        )
        
        self.db.add(payroll_run)
        self.db.commit()
        self.db.refresh(payroll_run)
        
        return payroll_run
    
    def process_payroll_run(self, payroll_run_id: str, company_id: str) -> PayrollRun:
        """Process payroll run and create paychecks"""
        
        payroll_run = self.db.query(PayrollRun).filter(
            PayrollRun.payroll_run_id == payroll_run_id,
            PayrollRun.company_id == company_id
        ).first()
        
        if not payroll_run:
            raise ValueError("Payroll run not found")
        
        if payroll_run.status not in [PayrollRunStatus.DRAFT, PayrollRunStatus.CALCULATED]:
            raise ValueError("Payroll run cannot be processed in current status")
        
        # Calculate payroll for all employees
        payroll_run_data = PayrollRunCreate(
            pay_period_start=payroll_run.pay_period_start,
            pay_period_end=payroll_run.pay_period_end,
            pay_date=payroll_run.pay_date,
            run_type=payroll_run.run_type
        )
        
        calc_response = self.calculate_payroll_run(company_id, payroll_run_data)
        
        # Update payroll run totals
        payroll_run.total_gross_pay = calc_response.total_gross_pay
        payroll_run.total_net_pay = calc_response.total_net_pay
        payroll_run.total_taxes = calc_response.total_taxes
        payroll_run.total_deductions = calc_response.total_deductions
        payroll_run.total_employer_taxes = calc_response.total_employer_taxes
        payroll_run.status = PayrollRunStatus.CALCULATED
        payroll_run.processed_at = datetime.utcnow()
        
        # Create paychecks for each employee
        for calc in calc_response.calculations:
            self._create_paycheck(payroll_run, calc)
        
        self.db.commit()
        
        # Create payroll liabilities
        self._create_payroll_liabilities(payroll_run)
        
        return payroll_run
    
    def _create_paycheck(self, payroll_run: PayrollRun, calculation: PayrollCalculationResult):
        """Create a paycheck for an employee"""
        
        paycheck = Paycheck(
            paycheck_id=str(uuid.uuid4()),
            payroll_run_id=payroll_run.payroll_run_id,
            employee_id=calculation.employee_id,
            pay_period_start=payroll_run.pay_period_start,
            pay_period_end=payroll_run.pay_period_end,
            pay_date=payroll_run.pay_date,
            gross_pay=calculation.gross_pay,
            total_taxes=calculation.total_taxes,
            total_deductions=calculation.total_deductions,
            net_pay=calculation.net_pay,
            check_amount=calculation.net_pay
        )
        
        self.db.add(paycheck)
        self.db.flush()  # Get the paycheck ID
        
        # Create paycheck lines for earnings
        earnings_line = PaycheckLine(
            paycheck_line_id=str(uuid.uuid4()),
            paycheck_id=paycheck.paycheck_id,
            line_type=PaycheckLineType.EARNING,
            line_number=1,
            description="Regular Pay",
            amount=calculation.gross_pay
        )
        self.db.add(earnings_line)
        
        # Create paycheck lines for taxes
        line_number = 2
        tax_items = [
            ("Federal Income Tax", calculation.federal_income_tax),
            ("State Income Tax", calculation.state_income_tax),
            ("Social Security Tax", calculation.social_security_tax),
            ("Medicare Tax", calculation.medicare_tax),
            ("State Disability Tax", calculation.state_disability_tax)
        ]
        
        for description, amount in tax_items:
            if amount > 0:
                tax_line = PaycheckLine(
                    paycheck_line_id=str(uuid.uuid4()),
                    paycheck_id=paycheck.paycheck_id,
                    line_type=PaycheckLineType.TAX,
                    line_number=line_number,
                    description=description,
                    amount=-amount  # Negative for deductions
                )
                self.db.add(tax_line)
                line_number += 1
    
    def _create_payroll_liabilities(self, payroll_run: PayrollRun):
        """Create payroll liabilities for taxes"""
        
        # Federal Income Tax liability
        federal_tax_total = sum(
            calc.federal_income_tax 
            for calc in self.calculate_payroll_run(
                payroll_run.company_id, 
                PayrollRunCreate(
                    pay_period_start=payroll_run.pay_period_start,
                    pay_period_end=payroll_run.pay_period_end,
                    pay_date=payroll_run.pay_date
                )
            ).calculations
        )
        
        if federal_tax_total > 0:
            federal_liability = PayrollLiability(
                liability_id=str(uuid.uuid4()),
                company_id=payroll_run.company_id,
                liability_type="Federal Income Tax",
                pay_period_start=payroll_run.pay_period_start,
                pay_period_end=payroll_run.pay_period_end,
                due_date=payroll_run.pay_date + timedelta(days=15),  # Example due date
                amount=federal_tax_total,
                balance=federal_tax_total,
                status=PayrollLiabilityStatus.PENDING
            )
            self.db.add(federal_liability)
        
        # Additional liabilities would be created similarly for FICA, FUTA, SUTA, etc.
        
        self.db.commit()
    
    def approve_payroll_run(self, payroll_run_id: str, company_id: str, approved_by: str) -> PayrollRun:
        """Approve a payroll run"""
        
        payroll_run = self.db.query(PayrollRun).filter(
            PayrollRun.payroll_run_id == payroll_run_id,
            PayrollRun.company_id == company_id
        ).first()
        
        if not payroll_run:
            raise ValueError("Payroll run not found")
        
        if payroll_run.status != PayrollRunStatus.CALCULATED:
            raise ValueError("Payroll run must be calculated before approval")
        
        payroll_run.status = PayrollRunStatus.APPROVED
        payroll_run.approved_by = approved_by
        payroll_run.approved_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(payroll_run)
        
        return payroll_run
    
    def void_paycheck(self, paycheck_id: str, company_id: str, reason: str) -> Paycheck:
        """Void a paycheck"""
        
        paycheck = self.db.query(Paycheck).join(PayrollRun).filter(
            Paycheck.paycheck_id == paycheck_id,
            PayrollRun.company_id == company_id
        ).first()
        
        if not paycheck:
            raise ValueError("Paycheck not found")
        
        if paycheck.is_void:
            raise ValueError("Paycheck is already voided")
        
        paycheck.is_void = True
        paycheck.void_reason = reason
        paycheck.voided_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(paycheck)
        
        return paycheck