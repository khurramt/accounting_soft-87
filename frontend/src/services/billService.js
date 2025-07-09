import apiClient from './apiClient';

class BillService {
  // Get all bills for a company with search and filtering
  async getBills(companyId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.min_amount) params.append('min_amount', filters.min_amount);
      if (filters.max_amount) params.append('max_amount', filters.max_amount);
      if (filters.is_posted !== undefined) params.append('is_posted', filters.is_posted);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      if (filters.page) params.append('page', filters.page);
      if (filters.page_size) params.append('page_size', filters.page_size);

      const response = await apiClient.get(`/companies/${companyId}/bills?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }

  // Create a new bill
  async createBill(companyId, billData) {
    try {
      // Transform frontend data to backend format
      const apiData = {
        transaction_type: 'BILL',
        vendor_id: billData.vendor,
        transaction_date: billData.date,
        due_date: billData.dueDate,
        reference_number: billData.refNo,
        payment_terms: billData.terms,
        memo: billData.memo,
        lines: billData.expenses.map((expense, index) => ({
          line_number: index + 1,
          line_type: 'EXPENSE',
          account_id: expense.account,
          description: expense.memo,
          quantity: 1,
          unit_price: expense.amount,
          billable: expense.billable
        }))
      };

      const response = await apiClient.post(`/companies/${companyId}/bills`, apiData);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  }

  // Get specific bill details
  async getBill(companyId, billId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/bills/${billId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  }

  // Update bill information
  async updateBill(companyId, billId, updateData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/bills/${billId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  }

  // Delete bill
  async deleteBill(companyId, billId) {
    try {
      const response = await apiClient.delete(`/companies/${companyId}/bills/${billId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  }

  // Get unpaid bills for vendor
  async getUnpaidBills(companyId, vendorId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/bills`, {
        params: {
          vendor_id: vendorId,
          is_posted: true,
          status: 'OPEN'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unpaid bills:', error);
      throw error;
    }
  }

  // Get overdue bills
  async getOverdueBills(companyId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`/companies/${companyId}/bills`, {
        params: {
          status: 'OPEN',
          end_date: today,
          sort_by: 'due_date',
          sort_order: 'asc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue bills:', error);
      throw error;
    }
  }

  // Get bill statistics
  async getBillStats(companyId) {
    try {
      const [allBills, openBills, overdueBills] = await Promise.all([
        this.getBills(companyId, { page_size: 1, page: 1 }),
        this.getBills(companyId, { status: 'OPEN', page_size: 1, page: 1 }),
        this.getOverdueBills(companyId)
      ]);

      return {
        total: allBills.total,
        open: openBills.total,
        overdue: overdueBills.total,
        paid: allBills.total - openBills.total
      };
    } catch (error) {
      console.error('Error fetching bill stats:', error);
      throw error;
    }
  }

  // Search bills (simplified method for quick searches)
  async searchBills(companyId, searchTerm, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/bills`, {
        params: {
          search: searchTerm,
          page_size: limit,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching bills:', error);
      throw error;
    }
  }
}

export default new BillService();