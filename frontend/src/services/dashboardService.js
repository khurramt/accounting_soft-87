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
      const response = await apiClient.get(`/companies/${companyId}/reports/dashboard/alerts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error);
      // Return some default alerts if the API fails
      return [
        {
          id: 1,
          type: 'warning',
          message: 'You have 3 overdue invoices',
          action: 'Review'
        },
        {
          id: 2,
          type: 'info',
          message: 'Welcome to your dashboard',
          action: 'Get Started'
        }
      ];
    }
  }

  async approveAlert(companyId, alertId) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/reports/dashboard/alerts/${alertId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving alert:', error);
      throw error;
    }
  }

  async dismissAlert(companyId, alertId) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/reports/dashboard/alerts/${alertId}/dismiss`);
      return response.data;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      throw error;
    }
  }

  /**
   * Get dashboard layout configuration
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Dashboard layout configuration
   */
  async getDashboardLayout(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/dashboard/layout`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard layout:', error);
      // Return default layout if API fails
      return {
        widgets: [
          {
            id: '1',
            type: 'financial_overview',
            title: 'Financial Overview',
            size: 'large',
            position: { x: 0, y: 0 },
            settings: {},
            refreshInterval: 300000,
            isVisible: true
          },
          {
            id: '2',
            type: 'recent_transactions',
            title: 'Recent Transactions',
            size: 'medium',
            position: { x: 1, y: 0 },
            settings: {},
            refreshInterval: 300000,
            isVisible: true
          },
          {
            id: '3',
            type: 'quick_actions',
            title: 'Quick Actions',
            size: 'small',
            position: { x: 2, y: 0 },
            settings: {},
            refreshInterval: 300000,
            isVisible: true
          }
        ],
        layout: 'grid',
        columns: 3,
        theme: 'light',
        showTitles: true,
        autoRefresh: true,
        refreshInterval: 300000
      };
    }
  }

  /**
   * Save dashboard layout configuration
   * @param {string} companyId - Company ID
   * @param {Object} layoutData - Layout configuration data
   * @returns {Promise<Object>} Response data
   */
  async saveDashboardLayout(companyId, layoutData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/dashboard/layout`, layoutData);
      return response.data;
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      throw error;
    }
  }

  /**
   * Get available widgets for dashboard
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Available widgets
   */
  async getAvailableWidgets(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/dashboard/widgets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available widgets:', error);
      // Return default widgets if API fails
      return [
        { id: 'financial_overview', name: 'Financial Overview', description: 'Overview of financial metrics' },
        { id: 'recent_transactions', name: 'Recent Transactions', description: 'Latest transactions' },
        { id: 'quick_actions', name: 'Quick Actions', description: 'Common actions' },
        { id: 'sales_chart', name: 'Sales Chart', description: 'Sales performance chart' },
        { id: 'expense_chart', name: 'Expense Chart', description: 'Expense breakdown' },
        { id: 'invoice_status', name: 'Invoice Status', description: 'Invoice status overview' },
        { id: 'customer_overview', name: 'Customer Overview', description: 'Customer metrics' },
        { id: 'inventory_status', name: 'Inventory Status', description: 'Inventory levels' },
        { id: 'calendar', name: 'Calendar', description: 'Calendar events' },
        { id: 'notifications', name: 'Notifications', description: 'System notifications' },
        { id: 'cash_flow', name: 'Cash Flow', description: 'Cash flow analysis' },
        { id: 'payment_status', name: 'Payment Status', description: 'Payment tracking' }
      ];
    }
  }
}

export default new DashboardService();