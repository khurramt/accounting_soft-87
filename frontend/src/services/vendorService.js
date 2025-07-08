import apiClient from './apiClient';

class VendorService {
  // Get all vendors for a company with search and filtering
  async getVendors(companyId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.vendor_type) params.append('vendor_type', filters.vendor_type);
      if (filters.eligible_1099 !== undefined) params.append('eligible_1099', filters.eligible_1099);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      if (filters.page) params.append('page', filters.page);
      if (filters.page_size) params.append('page_size', filters.page_size);

      const response = await apiClient.get(`/companies/${companyId}/vendors?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  // Create a new vendor
  async createVendor(companyId, vendorData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/vendors`, vendorData);
      return response.data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  // Get specific vendor details
  async getVendor(companyId, vendorId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }

  // Update vendor information
  async updateVendor(companyId, vendorId, updateData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/vendors/${vendorId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  // Delete vendor (soft delete)
  async deleteVendor(companyId, vendorId) {
    try {
      const response = await apiClient.delete(`/companies/${companyId}/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  // Get vendor transactions
  async getVendorTransactions(companyId, vendorId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/vendors/${vendorId}/transactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor transactions:', error);
      throw error;
    }
  }

  // Search vendors (simplified method for quick searches)
  async searchVendors(companyId, searchTerm, limit = 10) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/vendors`, {
        params: {
          search: searchTerm,
          page_size: limit,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching vendors:', error);
      throw error;
    }
  }

  // Get vendor summary stats
  async getVendorStats(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/vendors`, {
        params: {
          page_size: 1,
          page: 1
        }
      });
      
      // Get basic stats from the response
      const activeVendors = await apiClient.get(`/companies/${companyId}/vendors`, {
        params: {
          is_active: true,
          page_size: 1,
          page: 1
        }
      });

      return {
        total: response.data.total,
        active: activeVendors.data.total,
        inactive: response.data.total - activeVendors.data.total
      };
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }
  }

  // Get eligible 1099 vendors
  async get1099Vendors(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/vendors`, {
        params: {
          eligible_1099: true,
          page_size: 100,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching 1099 vendors:', error);
      throw error;
    }
  }
}

export default new VendorService();