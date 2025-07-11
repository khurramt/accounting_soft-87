import apiClient from './apiClient';

// Email Service - Handles all email management API calls
export const emailService = {
  // Email Templates
  async getEmailTemplates(companyId, params = {}) {
    const { category, is_active } = params;
    
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (is_active !== undefined) queryParams.append('is_active', is_active.toString());
    
    const response = await apiClient.get(`/companies/${companyId}/emails/templates?${queryParams}`);
    return response.data;
  },

  async createEmailTemplate(companyId, templateData) {
    const response = await apiClient.post(`/companies/${companyId}/emails/templates`, templateData);
    return response.data;
  },

  async getEmailTemplate(companyId, templateId) {
    const response = await apiClient.get(`/companies/${companyId}/emails/templates/${templateId}`);
    return response.data;
  },

  async updateEmailTemplate(companyId, templateId, templateData) {
    const response = await apiClient.put(`/companies/${companyId}/emails/templates/${templateId}`, templateData);
    return response.data;
  },

  async deleteEmailTemplate(companyId, templateId) {
    const response = await apiClient.delete(`/companies/${companyId}/emails/templates/${templateId}`);
    return response.data;
  },

  async previewEmailTemplate(companyId, templateId, previewData) {
    const response = await apiClient.post(`/companies/${companyId}/emails/templates/${templateId}/preview`, previewData);
    return response.data;
  },

  // Email Sending
  async sendEmail(companyId, emailData) {
    const response = await apiClient.post(`/companies/${companyId}/emails/send`, emailData);
    return response.data;
  },

  // Email Queue
  async getEmailQueue(companyId, params = {}) {
    const { 
      search,
      status,
      priority,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      page_size = 20 
    } = params;
    
    const queryParams = new URLSearchParams({
      sort_by,
      sort_order,
      page: page.toString(),
      page_size: page_size.toString()
    });
    
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (priority) queryParams.append('priority', priority.toString());
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    
    const response = await apiClient.get(`/companies/${companyId}/emails/queue?${queryParams}`);
    return response.data;
  },

  // Email Stats
  async getEmailStats(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/emails/stats`);
    return response.data;
  }
};

// Email Utilities
export const emailUtils = {
  // Email status colors
  getEmailStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'queued':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Email priority colors
  getEmailPriorityColor(priority) {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Format date for display
  formatDate(date) {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return date;
    }
  },

  // Email template categories
  getEmailCategories() {
    return [
      { value: 'invoice', label: 'Invoice' },
      { value: 'estimate', label: 'Estimate' },
      { value: 'statement', label: 'Statement' },
      { value: 'payment_reminder', label: 'Payment Reminder' },
      { value: 'welcome', label: 'Welcome' },
      { value: 'notification', label: 'Notification' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'other', label: 'Other' }
    ];
  },

  // Email priority options
  getEmailPriorityOptions() {
    return [
      { value: 1, label: 'High' },
      { value: 2, label: 'Medium' },
      { value: 3, label: 'Low' }
    ];
  },

  // Validate email data
  validateEmailData(emailData) {
    const errors = [];
    
    if (!emailData.to_email || !emailData.to_email.trim()) {
      errors.push('To email is required');
    }
    
    if (!emailData.subject || !emailData.subject.trim()) {
      errors.push('Subject is required');
    }
    
    if (!emailData.body || !emailData.body.trim()) {
      errors.push('Email body is required');
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailData.to_email && !emailRegex.test(emailData.to_email)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  },

  // Validate email template data
  validateEmailTemplateData(templateData) {
    const errors = [];
    
    if (!templateData.name || !templateData.name.trim()) {
      errors.push('Template name is required');
    }
    
    if (!templateData.subject || !templateData.subject.trim()) {
      errors.push('Subject is required');
    }
    
    if (!templateData.body || !templateData.body.trim()) {
      errors.push('Template body is required');
    }
    
    if (!templateData.category || !templateData.category.trim()) {
      errors.push('Category is required');
    }
    
    return errors;
  }
};

export default emailService;