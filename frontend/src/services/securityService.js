import apiClient from './apiClient';

// Security Service - Handles all security-related API calls
export const securityService = {
  // Security Logs
  async getSecurityLogs(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      event_type,
      success,
      user_id,
      threat_level,
      date_from,
      date_to,
      ip_address,
      min_risk_score 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(event_type && { event_type }),
      ...(success !== undefined && { success: success.toString() }),
      ...(user_id && { user_id }),
      ...(threat_level && { threat_level }),
      ...(date_from && { date_from }),
      ...(date_to && { date_to }),
      ...(ip_address && { ip_address }),
      ...(min_risk_score !== undefined && { min_risk_score: min_risk_score.toString() })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/security/logs?${queryParams}`);
    return response.data;
  },

  async getSecuritySummary(companyId, days = 30) {
    const response = await apiClient.get(`/companies/${companyId}/security/summary?days=${days}`);
    return response.data;
  },

  // Role Management
  async getRoles(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString()
    });
    
    const response = await apiClient.get(`/companies/${companyId}/security/roles?${queryParams}`);
    return response.data;
  },

  async createRole(companyId, roleData) {
    const response = await apiClient.post(`/companies/${companyId}/security/roles`, roleData);
    return response.data;
  },

  async getRole(companyId, roleId) {
    const response = await apiClient.get(`/companies/${companyId}/security/roles/${roleId}`);
    return response.data;
  },

  async updateRole(companyId, roleId, roleData) {
    const response = await apiClient.put(`/companies/${companyId}/security/roles/${roleId}`, roleData);
    return response.data;
  },

  async deleteRole(companyId, roleId) {
    const response = await apiClient.delete(`/companies/${companyId}/security/roles/${roleId}`);
    return response.data;
  },

  // User Permission Management
  async getUserPermissions(companyId, userId, params = {}) {
    const { 
      page = 1, 
      page_size = 50 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString()
    });
    
    const response = await apiClient.get(`/companies/${companyId}/security/users/${userId}/permissions?${queryParams}`);
    return response.data;
  },

  async updateUserPermissions(companyId, userId, permissions) {
    const response = await apiClient.put(`/companies/${companyId}/security/users/${userId}/permissions`, permissions);
    return response.data;
  },

  // Security Settings
  async getSecuritySettings(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/security/settings`);
    return response.data;
  },

  async updateSecuritySettings(companyId, settings) {
    const response = await apiClient.put(`/companies/${companyId}/security/settings`, settings);
    return response.data;
  }
};

// Audit Service - Handles all audit-related API calls
export const auditService = {
  // Audit Logs
  async getAuditLogs(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      table_name,
      record_id,
      action,
      user_id,
      date_from,
      date_to,
      search 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(table_name && { table_name }),
      ...(record_id && { record_id }),
      ...(action && { action }),
      ...(user_id && { user_id }),
      ...(date_from && { date_from }),
      ...(date_to && { date_to }),
      ...(search && { search })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/audit/logs?${queryParams}`);
    return response.data;
  },

  async getAuditLog(companyId, auditId) {
    const response = await apiClient.get(`/companies/${companyId}/audit/logs/${auditId}`);
    return response.data;
  },

  async getTransactionAuditLogs(companyId, transactionId) {
    const response = await apiClient.get(`/companies/${companyId}/audit/logs/transaction/${transactionId}`);
    return response.data;
  },

  async getUserAuditLogs(companyId, userId) {
    const response = await apiClient.get(`/companies/${companyId}/audit/logs/user/${userId}`);
    return response.data;
  },

  async generateAuditReport(companyId, reportRequest) {
    const response = await apiClient.post(`/companies/${companyId}/audit/reports`, reportRequest);
    return response.data;
  },

  async getAuditSummary(companyId, days = 30) {
    const response = await apiClient.get(`/companies/${companyId}/audit/summary?days=${days}`);
    return response.data;
  }
};

// Security Utilities
export const securityUtils = {
  // Format security event types
  formatEventType(eventType) {
    if (!eventType) return 'N/A';
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Get severity color
  getSeverityColor(severity) {
    if (!severity) return 'gray';
    switch (severity.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      case 'info': return 'blue';
      default: return 'gray';
    }
  },

  // Get threat level color
  getThreatLevelColor(threatLevel) {
    if (!threatLevel) return 'gray';
    switch (threatLevel.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  },

  // Format IP address
  formatIpAddress(ip) {
    if (!ip) return 'N/A';
    return ip;
  },

  // Format user agent
  formatUserAgent(userAgent) {
    if (!userAgent) return 'N/A';
    // Extract browser name from user agent
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
    return browserMatch ? browserMatch[0] : userAgent.substring(0, 50) + '...';
  },

  // Get action color
  getActionColor(action) {
    if (!action) return 'gray';
    switch (action.toLowerCase()) {
      case 'login': return 'green';
      case 'logout': return 'blue';
      case 'failed_login': return 'red';
      case 'permission_denied': return 'orange';
      case 'data_export': return 'purple';
      case 'sensitive_data_access': return 'yellow';
      default: return 'gray';
    }
  },

  // Format timestamp
  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  },

  // Format duration
  formatDuration(startTime, endTime) {
    if (!startTime || !endTime) return 'N/A';
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diff = end - start;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      return 'N/A';
    }
  },

  // Get status color
  getStatusColor(status) {
    if (!status) return 'gray';
    switch (status.toLowerCase()) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'suspended': return 'orange';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  },

  // Validate password strength
  validatePasswordStrength(password) {
    if (!password) return { score: 0, feedback: 'Password is required' };
    
    let score = 0;
    const feedback = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Special character');
    
    return {
      score,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password'
    };
  },

  // Format permission name
  formatPermission(permission) {
    if (!permission) return 'N/A';
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Get risk score color
  getRiskScoreColor(score) {
    if (!score) return 'gray';
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    if (score >= 40) return 'yellow';
    return 'green';
  }
};