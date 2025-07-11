import apiClient from './apiClient';

// Notification Service - Handles all notification management API calls
export const notificationService = {
  // Notifications
  async createNotification(companyId, notificationData) {
    const response = await apiClient.post(`/companies/${companyId}/notifications`, notificationData);
    return response.data;
  },

  async createBulkNotifications(companyId, bulkData) {
    const response = await apiClient.post(`/companies/${companyId}/notifications/bulk`, bulkData);
    return response.data;
  },

  async getNotifications(companyId, params = {}) {
    const { 
      search,
      notification_type,
      priority,
      read,
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
    if (notification_type) queryParams.append('notification_type', notification_type);
    if (priority) queryParams.append('priority', priority);
    if (read !== undefined) queryParams.append('read', read.toString());
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    
    const response = await apiClient.get(`/companies/${companyId}/notifications?${queryParams}`);
    return response.data;
  },

  async getNotificationStats(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/notifications/stats`);
    return response.data;
  },

  async markNotificationRead(companyId, notificationId, markRead) {
    const response = await apiClient.put(`/companies/${companyId}/notifications/${notificationId}/read`, markRead);
    return response.data;
  },

  async markAllNotificationsRead(companyId) {
    const response = await apiClient.post(`/companies/${companyId}/notifications/mark-all-read`);
    return response.data;
  },

  async deleteNotification(companyId, notificationId) {
    const response = await apiClient.delete(`/companies/${companyId}/notifications/${notificationId}`);
    return response.data;
  },

  // Notification Preferences
  async getNotificationPreferences(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/notification-preferences`);
    return response.data;
  },

  async updateNotificationPreference(companyId, notificationType, preferenceData) {
    const response = await apiClient.put(`/companies/${companyId}/notification-preferences/${notificationType}`, preferenceData);
    return response.data;
  },

  async getNotificationPreference(companyId, notificationType) {
    const response = await apiClient.get(`/companies/${companyId}/notification-preferences/${notificationType}`);
    return response.data;
  }
};

// Notification Utilities
export const notificationUtils = {
  // Get notification type color
  getNotificationTypeColor(type) {
    switch (type?.toLowerCase()) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'invoice':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-orange-100 text-orange-800';
      case 'payroll':
        return 'bg-indigo-100 text-indigo-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get notification priority color
  getNotificationPriorityColor(priority) {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get notification read status color
  getNotificationReadStatusColor(isRead) {
    return isRead ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800';
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

  // Get relative time
  getRelativeTime(date) {
    if (!date) return 'N/A';
    
    try {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInSeconds = Math.floor((now - notificationDate) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        return this.formatDate(date);
      }
    } catch (error) {
      return date;
    }
  },

  // Get notification types
  getNotificationTypes() {
    return [
      { value: 'info', label: 'Information' },
      { value: 'success', label: 'Success' },
      { value: 'warning', label: 'Warning' },
      { value: 'error', label: 'Error' },
      { value: 'invoice', label: 'Invoice' },
      { value: 'payment', label: 'Payment' },
      { value: 'expense', label: 'Expense' },
      { value: 'payroll', label: 'Payroll' },
      { value: 'system', label: 'System' }
    ];
  },

  // Get notification priorities
  getNotificationPriorities() {
    return [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' }
    ];
  },

  // Get notification channels
  getNotificationChannels() {
    return [
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'SMS' },
      { value: 'push', label: 'Push Notification' },
      { value: 'webhook', label: 'Webhook' }
    ];
  },

  // Validate notification data
  validateNotificationData(notificationData) {
    const errors = [];
    
    if (!notificationData.title || !notificationData.title.trim()) {
      errors.push('Notification title is required');
    }
    
    if (!notificationData.message || !notificationData.message.trim()) {
      errors.push('Notification message is required');
    }
    
    if (!notificationData.notification_type || !notificationData.notification_type.trim()) {
      errors.push('Notification type is required');
    }
    
    if (!notificationData.priority || !notificationData.priority.trim()) {
      errors.push('Priority is required');
    }
    
    if (!notificationData.user_id || !notificationData.user_id.trim()) {
      errors.push('User ID is required');
    }
    
    return errors;
  },

  // Validate bulk notification data
  validateBulkNotificationData(bulkData) {
    const errors = [];
    
    if (!bulkData.title || !bulkData.title.trim()) {
      errors.push('Notification title is required');
    }
    
    if (!bulkData.message || !bulkData.message.trim()) {
      errors.push('Notification message is required');
    }
    
    if (!bulkData.notification_type || !bulkData.notification_type.trim()) {
      errors.push('Notification type is required');
    }
    
    if (!bulkData.priority || !bulkData.priority.trim()) {
      errors.push('Priority is required');
    }
    
    if (!bulkData.user_ids || !Array.isArray(bulkData.user_ids) || bulkData.user_ids.length === 0) {
      errors.push('At least one user must be selected');
    }
    
    return errors;
  },

  // Get notification icon
  getNotificationIcon(type) {
    switch (type?.toLowerCase()) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'invoice':
        return '📄';
      case 'payment':
        return '💳';
      case 'expense':
        return '💰';
      case 'payroll':
        return '💼';
      case 'system':
        return '🔧';
      default:
        return '📣';
    }
  }
};

export default notificationService;