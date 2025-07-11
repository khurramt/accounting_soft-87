import apiClient from './apiClient';

// SMS Service - Handles all SMS management API calls
export const smsService = {
  // SMS Sending
  async sendSMS(companyId, smsData) {
    const response = await apiClient.post(`/companies/${companyId}/sms/send`, smsData);
    return response.data;
  },

  // SMS Queue
  async getSMSQueue(companyId, params = {}) {
    const { 
      search,
      status,
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
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    
    const response = await apiClient.get(`/companies/${companyId}/sms/queue?${queryParams}`);
    return response.data;
  },

  // SMS Stats
  async getSMSStats(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/sms/stats`);
    return response.data;
  }
};

// SMS Utilities
export const smsUtils = {
  // SMS status colors
  getSMSStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'queued':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Format phone number
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phoneNumber;
  },

  // Validate phone number
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid US phone number (10 digits)
    return cleaned.length === 10 || cleaned.length === 11;
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

  // Get character count for SMS
  getCharacterCount(message) {
    return message ? message.length : 0;
  },

  // Get SMS count (160 characters per SMS)
  getSMSCount(message) {
    if (!message) return 0;
    return Math.ceil(message.length / 160);
  },

  // Validate SMS data
  validateSMSData(smsData) {
    const errors = [];
    
    if (!smsData.to_phone || !smsData.to_phone.trim()) {
      errors.push('Phone number is required');
    }
    
    if (!smsData.message || !smsData.message.trim()) {
      errors.push('Message is required');
    }
    
    if (smsData.to_phone && !this.validatePhoneNumber(smsData.to_phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (smsData.message && smsData.message.length > 1600) {
      errors.push('Message is too long (maximum 1600 characters)');
    }
    
    return errors;
  },

  // Get delivery status text
  getDeliveryStatusText(status) {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'Delivered';
      case 'undelivered':
        return 'Undelivered';
      case 'failed':
        return 'Failed';
      case 'unknown':
        return 'Unknown';
      default:
        return 'Pending';
    }
  }
};

export default smsService;