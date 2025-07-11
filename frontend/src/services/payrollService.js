import { apiClient } from './apiClient';

// Payroll Service - Handles all payroll-related API calls
export const payrollService = {
  // Payroll Items
  async getPayrollItems(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      item_type,
      is_active,
      is_tax_deduction,
      is_employer_tax 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(search && { search }),
      ...(item_type && { item_type }),
      ...(is_active !== undefined && { is_active: is_active.toString() }),
      ...(is_tax_deduction !== undefined && { is_tax_deduction: is_tax_deduction.toString() }),
      ...(is_employer_tax !== undefined && { is_employer_tax: is_employer_tax.toString() })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/payroll-items?${queryParams}`);
    return response.data;
  },

  async createPayrollItem(companyId, payrollItemData) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-items`, payrollItemData);
    return response.data;
  },

  async getPayrollItem(companyId, payrollItemId) {
    const response = await apiClient.get(`/companies/${companyId}/payroll-items/${payrollItemId}`);
    return response.data;
  },

  async updatePayrollItem(companyId, payrollItemId, payrollItemData) {
    const response = await apiClient.put(`/companies/${companyId}/payroll-items/${payrollItemId}`, payrollItemData);
    return response.data;
  },

  async deletePayrollItem(companyId, payrollItemId) {
    const response = await apiClient.delete(`/companies/${companyId}/payroll-items/${payrollItemId}`);
    return response.data;
  },

  // Employee Payroll Info
  async getEmployeePayrollInfo(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      is_active,
      pay_frequency,
      employee_id 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(search && { search }),
      ...(is_active !== undefined && { is_active: is_active.toString() }),
      ...(pay_frequency && { pay_frequency }),
      ...(employee_id && { employee_id })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/employee-payroll-info?${queryParams}`);
    return response.data;
  },

  async createEmployeePayrollInfo(companyId, employeePayrollData) {
    const response = await apiClient.post(`/companies/${companyId}/employee-payroll-info`, employeePayrollData);
    return response.data;
  },

  async getEmployeePayrollInfoById(companyId, employeePayrollId) {
    const response = await apiClient.get(`/companies/${companyId}/employee-payroll-info/${employeePayrollId}`);
    return response.data;
  },

  async updateEmployeePayrollInfo(companyId, employeePayrollId, employeePayrollData) {
    const response = await apiClient.put(`/companies/${companyId}/employee-payroll-info/${employeePayrollId}`, employeePayrollData);
    return response.data;
  },

  async deleteEmployeePayrollInfo(companyId, employeePayrollId) {
    const response = await apiClient.delete(`/companies/${companyId}/employee-payroll-info/${employeePayrollId}`);
    return response.data;
  },

  // Payroll Runs
  async getPayrollRuns(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      status,
      start_date,
      end_date,
      pay_frequency 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(pay_frequency && { pay_frequency })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/payroll-runs?${queryParams}`);
    return response.data;
  },

  async createPayrollRun(companyId, payrollRunData) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-runs`, payrollRunData);
    return response.data;
  },

  async getPayrollRun(companyId, payrollRunId) {
    const response = await apiClient.get(`/companies/${companyId}/payroll-runs/${payrollRunId}`);
    return response.data;
  },

  async updatePayrollRun(companyId, payrollRunId, payrollRunData) {
    const response = await apiClient.put(`/companies/${companyId}/payroll-runs/${payrollRunId}`, payrollRunData);
    return response.data;
  },

  async deletePayrollRun(companyId, payrollRunId) {
    const response = await apiClient.delete(`/companies/${companyId}/payroll-runs/${payrollRunId}`);
    return response.data;
  },

  async calculatePayrollRun(companyId, payrollRunId) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-runs/${payrollRunId}/calculate`);
    return response.data;
  },

  async approvePayrollRun(companyId, payrollRunId) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-runs/${payrollRunId}/approve`);
    return response.data;
  },

  async processPayrollRun(companyId, payrollRunId) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-runs/${payrollRunId}/process`);
    return response.data;
  },

  // Paychecks
  async getPaychecks(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      payroll_run_id,
      employee_id,
      status,
      start_date,
      end_date 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(search && { search }),
      ...(payroll_run_id && { payroll_run_id }),
      ...(employee_id && { employee_id }),
      ...(status && { status }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/paychecks?${queryParams}`);
    return response.data;
  },

  async getPaycheck(companyId, paycheckId) {
    const response = await apiClient.get(`/companies/${companyId}/paychecks/${paycheckId}`);
    return response.data;
  },

  async voidPaycheck(companyId, paycheckId, reason) {
    const response = await apiClient.post(`/companies/${companyId}/paychecks/${paycheckId}/void`, { reason });
    return response.data;
  },

  async printPaycheck(companyId, paycheckId) {
    const response = await apiClient.get(`/companies/${companyId}/paychecks/${paycheckId}/print`);
    return response.data;
  },

  // Time Entries
  async getTimeEntries(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      employee_id,
      start_date,
      end_date,
      billable_status 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(search && { search }),
      ...(employee_id && { employee_id }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(billable_status && { billable_status })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/time-entries?${queryParams}`);
    return response.data;
  },

  async createTimeEntry(companyId, timeEntryData) {
    const response = await apiClient.post(`/companies/${companyId}/time-entries`, timeEntryData);
    return response.data;
  },

  async getTimeEntry(companyId, timeEntryId) {
    const response = await apiClient.get(`/companies/${companyId}/time-entries/${timeEntryId}`);
    return response.data;
  },

  async updateTimeEntry(companyId, timeEntryId, timeEntryData) {
    const response = await apiClient.put(`/companies/${companyId}/time-entries/${timeEntryId}`, timeEntryData);
    return response.data;
  },

  async deleteTimeEntry(companyId, timeEntryId) {
    const response = await apiClient.delete(`/companies/${companyId}/time-entries/${timeEntryId}`);
    return response.data;
  },

  async approveTimeEntry(companyId, timeEntryId) {
    const response = await apiClient.post(`/companies/${companyId}/time-entries/${timeEntryId}/approve`);
    return response.data;
  },

  // Payroll Liabilities
  async getPayrollLiabilities(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      liability_type,
      status,
      due_date_start,
      due_date_end 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(search && { search }),
      ...(liability_type && { liability_type }),
      ...(status && { status }),
      ...(due_date_start && { due_date_start }),
      ...(due_date_end && { due_date_end })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/payroll-liabilities?${queryParams}`);
    return response.data;
  },

  async getPayrollLiability(companyId, liabilityId) {
    const response = await apiClient.get(`/companies/${companyId}/payroll-liabilities/${liabilityId}`);
    return response.data;
  },

  async payLiability(companyId, liabilityId, paymentData) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-liabilities/${liabilityId}/pay`, paymentData);
    return response.data;
  },

  // Tax Tables
  async getFederalTaxTables(companyId, params = {}) {
    const { page = 1, page_size = 50, tax_year } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(tax_year && { tax_year: tax_year.toString() })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/federal-tax-tables?${queryParams}`);
    return response.data;
  },

  async getStateTaxTables(companyId, params = {}) {
    const { page = 1, page_size = 50, state, tax_year } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(state && { state }),
      ...(tax_year && { tax_year: tax_year.toString() })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/state-tax-tables?${queryParams}`);
    return response.data;
  },

  // Payroll Forms
  async getPayrollForms(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      form_type,
      tax_year,
      quarter,
      filing_status 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(search && { search }),
      ...(form_type && { form_type }),
      ...(tax_year && { tax_year: tax_year.toString() }),
      ...(quarter && { quarter }),
      ...(filing_status && { filing_status })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/payroll-forms?${queryParams}`);
    return response.data;
  },

  async getPayrollForm(companyId, formId) {
    const response = await apiClient.get(`/companies/${companyId}/payroll-forms/${formId}`);
    return response.data;
  },

  async generatePayrollForm(companyId, formData) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-forms/generate`, formData);
    return response.data;
  },

  async updatePayrollForm(companyId, formId, formData) {
    const response = await apiClient.put(`/companies/${companyId}/payroll-forms/${formId}`, formData);
    return response.data;
  },

  async deletePayrollForm(companyId, formId) {
    const response = await apiClient.delete(`/companies/${companyId}/payroll-forms/${formId}`);
    return response.data;
  },

  async filePayrollForm(companyId, formId) {
    const response = await apiClient.post(`/companies/${companyId}/payroll-forms/${formId}/file`);
    return response.data;
  },

  // Employee Management (for payroll integration)
  async getEmployees(companyId, params = {}) {
    const { 
      skip = 0, 
      limit = 100, 
      search,
      is_active,
      department 
    } = params;
    
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(is_active !== undefined && { is_active: is_active.toString() }),
      ...(department && { department })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/employees?${queryParams}`);
    return response.data;
  },

  async getEmployee(companyId, employeeId) {
    const response = await apiClient.get(`/companies/${companyId}/employees/${employeeId}`);
    return response.data;
  }
};

// Utility functions for payroll
export const payrollUtils = {
  formatCurrency: (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return numAmount >= 0 ? `$${numAmount.toFixed(2)}` : `($${Math.abs(numAmount).toFixed(2)})`;
  },

  formatDate: (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  },

  formatTime: (hours) => {
    if (!hours) return '0:00';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  },

  getPayrollStatusColor: (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'calculated':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'processed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getLiabilityStatusColor: (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getPayFrequencyOptions: () => [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'semi-monthly', label: 'Semi-Monthly' },
    { value: 'monthly', label: 'Monthly' }
  ],

  getPayrollItemTypes: () => [
    { value: 'wage', label: 'Wage' },
    { value: 'salary', label: 'Salary' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'commission', label: 'Commission' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'deduction', label: 'Deduction' },
    { value: 'addition', label: 'Addition' },
    { value: 'tax', label: 'Tax' }
  ],

  calculateGrossPay: (payrollInfo, timeEntries = []) => {
    let grossPay = 0;
    
    // Calculate based on pay type
    if (payrollInfo.pay_type === 'hourly') {
      const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
      grossPay = totalHours * (payrollInfo.hourly_rate || 0);
    } else if (payrollInfo.pay_type === 'salary') {
      // Calculate based on pay frequency
      const annualSalary = payrollInfo.annual_salary || 0;
      switch (payrollInfo.pay_frequency) {
        case 'weekly':
          grossPay = annualSalary / 52;
          break;
        case 'bi-weekly':
          grossPay = annualSalary / 26;
          break;
        case 'semi-monthly':
          grossPay = annualSalary / 24;
          break;
        case 'monthly':
          grossPay = annualSalary / 12;
          break;
        default:
          grossPay = annualSalary / 26; // Default to bi-weekly
      }
    }
    
    return grossPay;
  },

  calculateTaxes: (grossPay, payrollInfo) => {
    // This is a simplified tax calculation
    // In a real application, you would use proper tax tables
    const federalTaxRate = 0.12; // 12% federal tax
    const stateTaxRate = 0.05; // 5% state tax (varies by state)
    const socialSecurityRate = 0.062; // 6.2% Social Security
    const medicareRate = 0.0145; // 1.45% Medicare
    
    const federalTax = grossPay * federalTaxRate;
    const stateTax = grossPay * stateTaxRate;
    const socialSecurity = grossPay * socialSecurityRate;
    const medicare = grossPay * medicareRate;
    
    return {
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      totalTaxes: federalTax + stateTax + socialSecurity + medicare
    };
  }
};