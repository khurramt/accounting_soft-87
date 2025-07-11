import apiClient from './apiClient';

// Webhook Service - Handles all webhook management API calls
export const webhookService = {
  // Webhook Subscriptions
  async createWebhook(companyId, webhookData) {
    const response = await apiClient.post(`/companies/${companyId}/webhooks`, webhookData);
    return response.data;
  },

  async getWebhooks(companyId, params = {}) {
    const { is_active } = params;
    
    const queryParams = new URLSearchParams();
    if (is_active !== undefined) queryParams.append('is_active', is_active.toString());
    
    const response = await apiClient.get(`/companies/${companyId}/webhooks?${queryParams}`);
    return response.data;
  },

  async updateWebhook(companyId, webhookId, webhookData) {
    const response = await apiClient.put(`/companies/${companyId}/webhooks/${webhookId}`, webhookData);
    return response.data;
  },

  async deleteWebhook(companyId, webhookId) {
    const response = await apiClient.delete(`/companies/${companyId}/webhooks/${webhookId}`);
    return response.data;
  },

  async testWebhook(companyId, webhookId, testData) {
    const response = await apiClient.post(`/companies/${companyId}/webhooks/${webhookId}/test`, testData);
    return response.data;
  }
};

// Webhook Utilities
export const webhookUtils = {
  // Get webhook status color
  getWebhookStatusColor(isActive) {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  },

  // Get webhook status text
  getWebhookStatusText(isActive) {
    return isActive ? 'Active' : 'Inactive';
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

  // Get available webhook events
  getWebhookEvents() {
    return [
      { value: 'invoice.created', label: 'Invoice Created' },
      { value: 'invoice.updated', label: 'Invoice Updated' },
      { value: 'invoice.sent', label: 'Invoice Sent' },
      { value: 'invoice.paid', label: 'Invoice Paid' },
      { value: 'customer.created', label: 'Customer Created' },
      { value: 'customer.updated', label: 'Customer Updated' },
      { value: 'payment.received', label: 'Payment Received' },
      { value: 'payment.failed', label: 'Payment Failed' },
      { value: 'estimate.created', label: 'Estimate Created' },
      { value: 'estimate.accepted', label: 'Estimate Accepted' },
      { value: 'estimate.declined', label: 'Estimate Declined' },
      { value: 'expense.created', label: 'Expense Created' },
      { value: 'expense.updated', label: 'Expense Updated' },
      { value: 'vendor.created', label: 'Vendor Created' },
      { value: 'vendor.updated', label: 'Vendor Updated' },
      { value: 'item.created', label: 'Item Created' },
      { value: 'item.updated', label: 'Item Updated' },
      { value: 'item.low_stock', label: 'Item Low Stock' },
      { value: 'payroll.processed', label: 'Payroll Processed' },
      { value: 'timesheet.submitted', label: 'Timesheet Submitted' },
      { value: 'report.generated', label: 'Report Generated' }
    ];
  },

  // Get HTTP methods
  getHTTPMethods() {
    return [
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      { value: 'PATCH', label: 'PATCH' }
    ];
  },

  // Validate webhook URL
  validateWebhookURL(url) {
    if (!url || !url.trim()) {
      return 'Webhook URL is required';
    }
    
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'URL must use HTTP or HTTPS protocol';
      }
      return null;
    } catch (error) {
      return 'Please enter a valid URL';
    }
  },

  // Validate webhook data
  validateWebhookData(webhookData) {
    const errors = [];
    
    if (!webhookData.name || !webhookData.name.trim()) {
      errors.push('Webhook name is required');
    }
    
    if (!webhookData.url || !webhookData.url.trim()) {
      errors.push('Webhook URL is required');
    } else {
      const urlError = this.validateWebhookURL(webhookData.url);
      if (urlError) {
        errors.push(urlError);
      }
    }
    
    if (!webhookData.events || webhookData.events.length === 0) {
      errors.push('At least one event must be selected');
    }
    
    if (!webhookData.http_method || !webhookData.http_method.trim()) {
      errors.push('HTTP method is required');
    }
    
    return errors;
  },

  // Generate webhook secret
  generateWebhookSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  },

  // Get webhook failure reason color
  getFailureReasonColor(reason) {
    switch (reason?.toLowerCase()) {
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800';
      case 'connection_error':
        return 'bg-red-100 text-red-800';
      case 'invalid_response':
        return 'bg-orange-100 text-orange-800';
      case 'authentication_failed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
};

export default webhookService;