import apiClient from './apiClient';

class ReportService {
  /**
   * Get profit & loss report
   * @param {string} companyId - Company ID
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Profit & Loss report data
   */
  async getProfitLossReport(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/profit-loss`, {
        params: {
          start_date: params.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          end_date: params.end_date || new Date().toISOString().split('T')[0],
          comparison_type: params.comparison_type || 'none',
          comparison_start_date: params.comparison_start_date,
          comparison_end_date: params.comparison_end_date,
          include_subtotals: params.include_subtotals !== undefined ? params.include_subtotals : true,
          show_cents: params.show_cents !== undefined ? params.show_cents : true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profit & loss report:', error);
      throw error;
    }
  }

  /**
   * Get balance sheet report
   * @param {string} companyId - Company ID
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Balance sheet report data
   */
  async getBalanceSheetReport(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/balance-sheet`, {
        params: {
          as_of_date: params.as_of_date || new Date().toISOString().split('T')[0],
          comparison_date: params.comparison_date,
          include_subtotals: params.include_subtotals !== undefined ? params.include_subtotals : true,
          show_cents: params.show_cents !== undefined ? params.show_cents : true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching balance sheet report:', error);
      throw error;
    }
  }

  /**
   * Get cash flow report
   * @param {string} companyId - Company ID
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Cash flow report data
   */
  async getCashFlowReport(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/cash-flow`, {
        params: {
          start_date: params.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          end_date: params.end_date || new Date().toISOString().split('T')[0],
          method: params.method || 'indirect',
          include_subtotals: params.include_subtotals !== undefined ? params.include_subtotals : true,
          show_cents: params.show_cents !== undefined ? params.show_cents : true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash flow report:', error);
      throw error;
    }
  }

  /**
   * Get trial balance report
   * @param {string} companyId - Company ID
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Trial balance report data
   */
  async getTrialBalanceReport(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/trial-balance`, {
        params: {
          as_of_date: params.as_of_date || new Date().toISOString().split('T')[0],
          include_zero_balances: params.include_zero_balances !== undefined ? params.include_zero_balances : false,
          show_cents: params.show_cents !== undefined ? params.show_cents : true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trial balance report:', error);
      throw error;
    }
  }

  /**
   * Get accounts receivable aging report
   * @param {string} companyId - Company ID
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} AR aging report data
   */
  async getARAgingReport(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/ar-aging`, {
        params: {
          as_of_date: params.as_of_date || new Date().toISOString().split('T')[0],
          aging_periods: params.aging_periods || [30, 60, 90, 120],
          include_zero_balances: params.include_zero_balances !== undefined ? params.include_zero_balances : false,
          customer_id: params.customer_id
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AR aging report:', error);
      throw error;
    }
  }

  /**
   * Get accounts payable aging report
   * @param {string} companyId - Company ID
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} AP aging report data
   */
  async getAPAgingReport(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/ap-aging`, {
        params: {
          as_of_date: params.as_of_date || new Date().toISOString().split('T')[0],
          aging_periods: params.aging_periods || [30, 60, 90, 120],
          include_zero_balances: params.include_zero_balances !== undefined ? params.include_zero_balances : false,
          vendor_id: params.vendor_id
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AP aging report:', error);
      throw error;
    }
  }

  /**
   * Get available reports
   * @param {string} companyId - Company ID
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Available reports list
   */
  async getAvailableReports(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/`, {
        params: {
          search: params.search,
          category: params.category,
          type: params.type,
          is_system_report: params.is_system_report,
          sort_by: params.sort_by || 'report_name',
          sort_order: params.sort_order || 'asc',
          page: params.page || 1,
          page_size: params.page_size || 20
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available reports:', error);
      throw error;
    }
  }

  /**
   * Get report definition
   * @param {string} companyId - Company ID
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Report definition
   */
  async getReportDefinition(companyId, reportId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/definition/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report definition:', error);
      throw error;
    }
  }

  /**
   * Get report data directly
   * @param {string} companyId - Company ID
   * @param {string} reportId - Report ID
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Report data
   */
  async getReportData(companyId, reportId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/definition/${reportId}/data`, {
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
          as_of_date: params.as_of_date,
          comparison_type: params.comparison_type,
          include_zero_balances: params.include_zero_balances,
          customer_id: params.customer_id,
          vendor_id: params.vendor_id
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  }

  /**
   * Export report to PDF
   * @param {string} companyId - Company ID
   * @param {string} reportId - Report ID
   * @param {Object} exportRequest - Export parameters
   * @returns {Promise<Object>} Export result
   */
  async exportReportToPDF(companyId, reportId, exportRequest) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/reports/definition/${reportId}/export/pdf`, exportRequest);
      return response.data;
    } catch (error) {
      console.error('Error exporting report to PDF:', error);
      throw error;
    }
  }

  /**
   * Export report to Excel
   * @param {string} companyId - Company ID
   * @param {string} reportId - Report ID
   * @param {Object} exportRequest - Export parameters
   * @returns {Promise<Object>} Export result
   */
  async exportReportToExcel(companyId, reportId, exportRequest) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/reports/definition/${reportId}/export/excel`, exportRequest);
      return response.data;
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
      throw error;
    }
  }

  /**
   * Get memorized reports
   * @param {string} companyId - Company ID
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Memorized reports list
   */
  async getMemorizedReports(companyId, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/memorized-reports/`, {
        params: {
          search: params.search,
          group_id: params.group_id,
          is_scheduled: params.is_scheduled,
          sort_by: params.sort_by || 'report_name',
          sort_order: params.sort_order || 'asc',
          page: params.page || 1,
          page_size: params.page_size || 20
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching memorized reports:', error);
      throw error;
    }
  }

  /**
   * Create memorized report
   * @param {string} companyId - Company ID
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Created memorized report
   */
  async createMemorizedReport(companyId, reportData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/memorized-reports/`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating memorized report:', error);
      throw error;
    }
  }

  /**
   * Get report groups
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Report groups
   */
  async getReportGroups(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/report-groups/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report groups:', error);
      throw error;
    }
  }

  /**
   * Create report group
   * @param {string} companyId - Company ID
   * @param {Object} groupData - Group data
   * @returns {Promise<Object>} Created group
   */
  async createReportGroup(companyId, groupData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/report-groups/`, groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating report group:', error);
      throw error;
    }
  }
}

export default new ReportService();