import apiClient from './apiClient';

class CustomerService {
  // Get all customers for a company with search and filtering
  async getCustomers(companyId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.customer_type) params.append('customer_type', filters.customer_type);
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      if (filters.page) params.append('page', filters.page);
      if (filters.page_size) params.append('page_size', filters.page_size);

      const response = await apiClient.get(`/companies/${companyId}/customers?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Create a new customer
  async createCustomer(companyId, customerData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/customers`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Get specific customer details
  async getCustomer(companyId, customerId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Update customer information
  async updateCustomer(companyId, customerId, updateData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/customers/${customerId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete customer (soft delete)
  async deleteCustomer(companyId, customerId) {
    try {
      const response = await apiClient.delete(`/companies/${companyId}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Get customer transactions
  async getCustomerTransactions(companyId, customerId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/customers/${customerId}/transactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      throw error;
    }
  }

  // Get customer balance
  async getCustomerBalance(companyId, customerId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/customers/${customerId}/balance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer balance:', error);
      throw error;
    }
  }

  // Search customers (simplified method for quick searches)
  async searchCustomers(companyId, searchTerm, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/customers`, {
        params: {
          search: searchTerm,
          page_size: limit,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Get customer summary stats
  async getCustomerStats(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/customers`, {
        params: {
          page_size: 1,
          page: 1
        }
      });
      
      // Get basic stats from the response
      const activeCustomers = await apiClient.get(`/companies/${companyId}/customers`, {
        params: {
          is_active: true,
          page_size: 1,
          page: 1
        }
      });

      return {
        total: response.data.total,
        active: activeCustomers.data.total,
        inactive: response.data.total - activeCustomers.data.total
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }
}

export default new CustomerService();