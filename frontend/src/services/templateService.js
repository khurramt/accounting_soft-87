import apiClient from './apiClient';

// Template Service - Handles all template-related API calls
export const templateService = {
  // Template Management
  async getTemplates(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      category,
      is_active 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(category && { category }),
      ...(is_active !== undefined && { is_active: is_active.toString() })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/emails/templates?${queryParams}`);
    return response.data;
  },

  async createTemplate(companyId, templateData) {
    const response = await apiClient.post(`/companies/${companyId}/emails/templates`, templateData);
    return response.data;
  },

  async getTemplate(companyId, templateId) {
    const response = await apiClient.get(`/companies/${companyId}/emails/templates/${templateId}`);
    return response.data;
  },

  async updateTemplate(companyId, templateId, templateData) {
    const response = await apiClient.put(`/companies/${companyId}/emails/templates/${templateId}`, templateData);
    return response.data;
  },

  async deleteTemplate(companyId, templateId) {
    const response = await apiClient.delete(`/companies/${companyId}/emails/templates/${templateId}`);
    return response.data;
  },

  async previewTemplate(companyId, templateId, previewData = {}) {
    const response = await apiClient.post(`/companies/${companyId}/emails/templates/${templateId}/preview`, previewData);
    return response.data;
  },

  // Document Template Operations (for invoice/document templates)
  async saveDocumentTemplate(companyId, templateData) {
    // For now, we'll save as a document template using the email template structure
    // but with a specific category to distinguish it
    const documentTemplateData = {
      ...templateData,
      category: 'document',
      template_type: 'invoice_template'
    };
    
    const response = await apiClient.post(`/companies/${companyId}/emails/templates`, documentTemplateData);
    return response.data;
  },

  async exportTemplate(companyId, templateId, format = 'json') {
    const response = await apiClient.get(`/companies/${companyId}/emails/templates/${templateId}`);
    const templateData = response.data;
    
    // Create a downloadable file
    const dataStr = JSON.stringify(templateData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${templateData.name || 'template'}_export.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return { message: 'Template exported successfully' };
  },

  async importTemplate(companyId, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const templateData = JSON.parse(event.target.result);
          
          // Create a new template with imported data
          const newTemplate = {
            name: `${templateData.name || 'Imported Template'} (${Date.now()})`,
            subject: templateData.subject || 'Imported Template',
            body: templateData.body || templateData.content || '',
            category: 'document',
            template_type: 'imported',
            variables: templateData.variables || [],
            is_active: true
          };
          
          const response = await this.createTemplate(companyId, newTemplate);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  // Template Customization
  async uploadLogo(companyId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/companies/${companyId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  // Template Utilities
  async validateTemplate(templateData) {
    // Basic template validation
    const errors = [];
    
    if (!templateData.name || templateData.name.trim() === '') {
      errors.push('Template name is required');
    }
    
    if (!templateData.body || templateData.body.trim() === '') {
      errors.push('Template content is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Additional template operations for the Template Designer
  async saveTemplate(companyId, templateData) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/templates/design`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  },

  async resetTemplate(companyId, templateId) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/templates/${templateId}/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting template:', error);
      throw error;
    }
  },

  async duplicateTemplate(companyId, templateId) {
    try {
      const response = await apiClient.post(`/companies/${companyId}/templates/${templateId}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  }
};

export default templateService;