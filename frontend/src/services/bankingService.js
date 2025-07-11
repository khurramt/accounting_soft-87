import apiClient from './apiClient';

// Banking Service - Handles all banking-related API calls
export const bankingService = {
  // Bank Connections
  async getBankConnections(companyId, params = {}) {
    const { skip = 0, limit = 100, is_active } = params;
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(is_active !== undefined && { is_active: is_active.toString() })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/bank-connections?${queryParams}`);
    return response.data;
  },

  async createBankConnection(companyId, connectionData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-connections`, connectionData);
    return response.data;
  },

  async getBankConnection(companyId, connectionId) {
    const response = await apiClient.get(`/companies/${companyId}/bank-connections/${connectionId}`);
    return response.data;
  },

  async updateBankConnection(companyId, connectionId, connectionData) {
    const response = await apiClient.put(`/companies/${companyId}/bank-connections/${connectionId}`, connectionData);
    return response.data;
  },

  async deleteBankConnection(companyId, connectionId) {
    const response = await apiClient.delete(`/companies/${companyId}/bank-connections/${connectionId}`);
    return response.data;
  },

  async syncBankConnection(companyId, connectionId, options = {}) {
    const response = await apiClient.post(`/companies/${companyId}/bank-connections/${connectionId}/sync`, options);
    return response.data;
  },

  // Bank Transactions
  async getBankTransactions(companyId, params = {}) {
    const { 
      skip = 0, 
      limit = 100, 
      connection_id,
      start_date,
      end_date,
      min_amount,
      max_amount,
      transaction_type,
      status,
      description_contains
    } = params;
    
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(connection_id && { connection_id }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(min_amount && { min_amount: min_amount.toString() }),
      ...(max_amount && { max_amount: max_amount.toString() }),
      ...(transaction_type && { transaction_type }),
      ...(status && { status }),
      ...(description_contains && { description_contains })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/bank-transactions?${queryParams}`);
    return response.data;
  },

  async getBankTransactionsByConnection(companyId, connectionId) {
    const response = await apiClient.get(`/companies/${companyId}/bank-transactions/${connectionId}`);
    return response.data;
  },

  // Transaction Matching
  async matchTransaction(companyId, bankTransactionId, matchData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-transactions/${bankTransactionId}/match`, matchData);
    return response.data;
  },

  async ignoreTransaction(companyId, bankTransactionId, ignoreData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-transactions/${bankTransactionId}/ignore`, ignoreData);
    return response.data;
  },

  async getPotentialMatches(companyId, bankTransactionId) {
    const response = await apiClient.get(`/companies/${companyId}/bank-transactions/${bankTransactionId}/potential-matches`);
    return response.data;
  },

  async batchTransactionActions(companyId, batchData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-transactions/batch-actions`, batchData);
    return response.data;
  },

  // Institution Search
  async searchInstitutions(params = {}) {
    const { name_contains, routing_number, institution_type, skip = 0, limit = 100 } = params;
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(name_contains && { name_contains }),
      ...(routing_number && { routing_number }),
      ...(institution_type && { institution_type })
    });
    
    const response = await apiClient.get(`/banking/institutions/search?${queryParams}`);
    return response.data;
  },

  async getInstitution(institutionId) {
    const response = await apiClient.get(`/banking/institutions/${institutionId}`);
    return response.data;
  },

  // File Upload
  async uploadBankStatement(companyId, file, fileType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    const response = await apiClient.post(`/companies/${companyId}/bank-statements/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Account Service - Handles Chart of Accounts API calls
export const accountService = {
  async getAccounts(companyId, params = {}) {
    const { 
      skip = 0, 
      limit = 100, 
      search,
      account_type,
      is_active,
      sort_by = 'number',
      sort_order = 'asc'
    } = params;
    
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order,
      ...(search && { search }),
      ...(account_type && { account_type }),
      ...(is_active !== undefined && { is_active: is_active.toString() })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/accounts?${queryParams}`);
    return response.data;
  },

  async createAccount(companyId, accountData) {
    const response = await apiClient.post(`/companies/${companyId}/accounts`, accountData);
    return response.data;
  },

  async getAccount(companyId, accountId) {
    const response = await apiClient.get(`/companies/${companyId}/accounts/${accountId}`);
    return response.data;
  },

  async updateAccount(companyId, accountId, accountData) {
    const response = await apiClient.put(`/companies/${companyId}/accounts/${accountId}`, accountData);
    return response.data;
  },

  async deleteAccount(companyId, accountId) {
    const response = await apiClient.delete(`/companies/${companyId}/accounts/${accountId}`);
    return response.data;
  },

  async mergeAccounts(companyId, accountId, mergeData) {
    const response = await apiClient.post(`/companies/${companyId}/accounts/${accountId}/merge`, mergeData);
    return response.data;
  }
};

// Utility functions for banking
export const bankingUtils = {
  formatCurrency: (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return numAmount >= 0 ? `$${numAmount.toFixed(2)}` : `($${Math.abs(numAmount).toFixed(2)})`;
  },

  formatDate: (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  },

  getAccountTypeColor: (type) => {
    switch (type?.toLowerCase()) {
      case 'bank':
        return 'bg-blue-100 text-blue-800';
      case 'accounts receivable':
        return 'bg-green-100 text-green-800';
      case 'fixed asset':
        return 'bg-purple-100 text-purple-800';
      case 'accounts payable':
        return 'bg-red-100 text-red-800';
      case 'equity':
        return 'bg-orange-100 text-orange-800';
      case 'income':
        return 'bg-emerald-100 text-emerald-800';
      case 'expense':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getTransactionStatusColor: (status) => {
    switch (status?.toLowerCase()) {
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ignored':
        return 'bg-gray-100 text-gray-800';
      case 'unmatched':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
};