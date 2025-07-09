import apiClient from './apiClient';

class TransactionService {
  // Get all transactions for a company with search and filtering
  async getTransactions(companyId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.min_amount) params.append('min_amount', filters.min_amount);
      if (filters.max_amount) params.append('max_amount', filters.max_amount);
      if (filters.is_posted !== undefined) params.append('is_posted', filters.is_posted);
      if (filters.is_void !== undefined) params.append('is_void', filters.is_void);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      if (filters.page) params.append('page', filters.page);
      if (filters.page_size) params.append('page_size', filters.page_size);

      const response = await apiClient.get(`/companies/${companyId}/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Create a new transaction
  async createTransaction(companyId, transactionData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/transactions`, transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Get specific transaction details
  async getTransaction(companyId, transactionId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  // Update transaction information
  async updateTransaction(companyId, transactionId, updateData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/transactions/${transactionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Delete transaction
  async deleteTransaction(companyId, transactionId) {
    try {
      const response = await apiClient.delete(`/companies/${companyId}/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Post transaction (create journal entries)
  async postTransaction(companyId, transactionId, postingDate = null) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/transactions/${transactionId}/post`, {
        posting_date: postingDate
      });
      return response.data;
    } catch (error) {
      console.error('Error posting transaction:', error);
      throw error;
    }
  }

  // Void transaction
  async voidTransaction(companyId, transactionId, reason = null) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/transactions/${transactionId}/void`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      console.error('Error voiding transaction:', error);
      throw error;
    }
  }

  // Get recent transactions for dashboard
  async getRecentTransactions(companyId, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/transactions`, {
        params: {
          sort_by: 'transaction_date',
          sort_order: 'desc',
          page_size: limit,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  // Search transactions (simplified method for quick searches)
  async searchTransactions(companyId, searchTerm, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/transactions`, {
        params: {
          search: searchTerm,
          page_size: limit,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw error;
    }
  }
}

export default new TransactionService();