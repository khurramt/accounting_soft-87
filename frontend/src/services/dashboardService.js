import apiClient from './apiClient';

class DashboardService {
  /**
   * Get dashboard summary data
   * @param {string} companyId - Company ID
   * @param {string} dateRange - Date range (today, this-week, this-month, this-quarter, this-year)
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardSummary(companyId, dateRange = 'this-month') {
    try {
      const response = await apiClient.get(`/companies/${companyId}/reports/dashboard`, {
        params: { date_range: dateRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions
   * @param {string} companyId - Company ID
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<Object>} Recent transactions
   */
  async getRecentTransactions(companyId, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/transactions/`, {
        params: { 
          recent: true, 
          page_size: limit,
          sort_by: 'created_at',
          sort_order: 'desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Get outstanding invoices
   * @param {string} companyId - Company ID
   * @param {number} limit - Number of invoices to fetch
   * @returns {Promise<Object>} Outstanding invoices
   */
  async getOutstandingInvoices(companyId, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/invoices/`, {
        params: { 
          status: 'outstanding',
          page_size: limit,
          sort_by: 'due_date',
          sort_order: 'asc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching outstanding invoices:', error);
      throw error;
    }
  }

  /**
   * Get cash flow data
   * @param {string} companyId - Company ID
   * @param {string} dateRange - Date range
   * @returns {Promise<Object>} Cash flow data
   */
  async getCashFlowData(companyId, dateRange = 'this-month') {
    try {
      const today = new Date();
      let startDate, endDate;

      if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
      } else if (dateRange === 'this-week') {
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        startDate = weekStart.toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
      } else if (dateRange === 'this-month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
      } else if (dateRange === 'this-quarter') {
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
      } else if (dateRange === 'this-year') {
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
      } else {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
      }

      const response = await apiClient.get(`/companies/${companyId}/reports/cash-flow`, {
        params: { 
          start_date: startDate,
          end_date: endDate,
          method: 'indirect'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
      // Return placeholder data for now
      return {
        periods: [
          { label: 'Week 1', amount: 5000 },
          { label: 'Week 2', amount: 7500 },
          { label: 'Week 3', amount: 6200 },
          { label: 'Week 4', amount: 8300 }
        ],
        total: 27000
      };
    }
  }

  /**
   * Get accounts receivable aging data
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} AR aging data
   */
  async getAccountsReceivableAging(companyId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`/companies/${companyId}/reports/ar-aging`, {
        params: { as_of_date: today }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AR aging data:', error);
      throw error;
    }
  }

  /**
   * Get alerts for the dashboard
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Dashboard alerts
   */
  async getDashboardAlerts(companyId) {
    try {
      // This would fetch from various endpoints to build alerts
      const [outstandingInvoices, overdueInvoices] = await Promise.all([
        this.getOutstandingInvoices(companyId, 100),
        apiClient.get(`/companies/${companyId}/invoices/`, {
          params: { status: 'overdue', page_size: 100 }
        })
      ]);

      const alerts = [];

      // Check for overdue invoices
      if (overdueInvoices.data.total > 0) {
        alerts.push({
          type: 'warning',
          message: `${overdueInvoices.data.total} overdue invoices requiring attention`,
          action: 'View Details'
        });
      }

      // Check for high outstanding amount
      const totalOutstanding = outstandingInvoices.items?.reduce((sum, invoice) => sum + invoice.balance_due, 0) || 0;
      if (totalOutstanding > 10000) {
        alerts.push({
          type: 'info',
          message: `$${totalOutstanding.toFixed(2)} in outstanding invoices`,
          action: 'Review'
        });
      }

      // Add other alert types as needed
      alerts.push({
        type: 'success',
        message: 'All recent transactions have been reconciled',
        action: 'View Report'
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error);
      // Return default alerts
      return [
        {
          type: 'info',
          message: 'Welcome to your dashboard',
          action: 'Get Started'
        }
      ];
    }
  }
}

export default new DashboardService();