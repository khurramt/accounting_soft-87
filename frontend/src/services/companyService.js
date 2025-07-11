import apiClient from './apiClient';

class CompanyService {
  // Get all companies for the authenticated user
  async getCompanies() {
    try {
      const response = await apiClient.get('/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  // Create a new company
  async createCompany(companyData) {
    try {
      const response = await apiClient.post('/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Get specific company details
  async getCompany(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

  // Update company information
  async updateCompany(companyId, updateData) {
    try {
      const response = await apiClient.put(`/companies/${companyId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Delete company (soft delete)
  async deleteCompany(companyId) {
    try {
      const response = await apiClient.delete(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // Get company settings
  async getCompanySettings(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company settings:', error);
      throw error;
    }
  }

  // Update company settings
  async updateCompanySettings(companyId, settings) {
    try {
      const response = await apiClient.put(`/companies/${companyId}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  }

  // Get company settings by category
  async getCompanySettingsByCategory(companyId, category) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/settings/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company settings by category:', error);
      throw error;
    }
  }

  // Get company files
  async getCompanyFiles(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/files`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company files:', error);
      throw error;
    }
  }

  // Upload company file
  async uploadCompanyFile(companyId, formData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading company file:', error);
      throw error;
    }
  }

  // Get company users
  async getCompanyUsers(companyId) {
    try {
      const response = await apiClient.get(`/companies/${companyId}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
  }

  // Invite user to company
  async inviteUserToCompany(companyId, inviteData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/users/invite`, inviteData);
      return response.data;
    } catch (error) {
      console.error('Error inviting user to company:', error);
      throw error;
    }
  }
}

export default new CompanyService();