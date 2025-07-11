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
      transaction_type,
      status,
      min_amount,
      max_amount,
      search 
    } = params;
    
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(connection_id && { connection_id }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(transaction_type && { transaction_type }),
      ...(status && { status }),
      ...(min_amount && { min_amount: min_amount.toString() }),
      ...(max_amount && { max_amount: max_amount.toString() }),
      ...(search && { search })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/bank-transactions?${queryParams}`);
    return response.data;
  },

  async getBankTransaction(companyId, transactionId) {
    const response = await apiClient.get(`/companies/${companyId}/bank-transactions/${transactionId}`);
    return response.data;
  },

  async matchBankTransaction(companyId, transactionId, matchData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-transactions/${transactionId}/match`, matchData);
    return response.data;
  },

  async unmatchBankTransaction(companyId, transactionId) {
    const response = await apiClient.post(`/companies/${companyId}/bank-transactions/${transactionId}/unmatch`);
    return response.data;
  },

  // Bank Statement Upload
  async uploadBankStatement(companyId, connectionId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/companies/${companyId}/bank-statements/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        connection_id: connectionId
      }
    });
    return response.data;
  },

  // Institution Search
  async searchInstitutions(query, params = {}) {
    const { country = 'US', product = 'transactions' } = params;
    const queryParams = new URLSearchParams({
      query,
      country,
      product
    });
    
    const response = await apiClient.get(`/banking/institutions/search?${queryParams}`);
    return response.data;
  },

  // Chart of Accounts
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
  },

  // Bank Reconciliation
  async getBankReconciliations(companyId, params = {}) {
    const { 
      skip = 0, 
      limit = 100, 
      account_id,
      status,
      start_date,
      end_date,
      sort_by = 'statement_date',
      sort_order = 'desc'
    } = params;
    
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order,
      ...(account_id && { account_id }),
      ...(status && { status }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/bank-reconciliations?${queryParams}`);
    return response.data;
  },

  async createBankReconciliation(companyId, reconciliationData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-reconciliations`, reconciliationData);
    return response.data;
  },

  async getBankReconciliation(companyId, reconciliationId) {
    const response = await apiClient.get(`/companies/${companyId}/bank-reconciliations/${reconciliationId}`);
    return response.data;
  },

  async updateBankReconciliation(companyId, reconciliationId, reconciliationData) {
    const response = await apiClient.put(`/companies/${companyId}/bank-reconciliations/${reconciliationId}`, reconciliationData);
    return response.data;
  },

  async completeBankReconciliation(companyId, reconciliationId) {
    const response = await apiClient.post(`/companies/${companyId}/bank-reconciliations/${reconciliationId}/complete`);
    return response.data;
  },

  async deleteBankReconciliation(companyId, reconciliationId) {
    const response = await apiClient.delete(`/companies/${companyId}/bank-reconciliations/${reconciliationId}`);
    return response.data;
  },

  // Bank Rules
  async getBankRules(companyId, params = {}) {
    const { 
      skip = 0, 
      limit = 100, 
      is_active,
      rule_type,
      sort_by = 'priority',
      sort_order = 'asc'
    } = params;
    
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order,
      ...(is_active !== undefined && { is_active: is_active.toString() }),
      ...(rule_type && { rule_type })
    });
    
    const response = await apiClient.get(`/companies/${companyId}/bank-rules?${queryParams}`);
    return response.data;
  },

  async createBankRule(companyId, ruleData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-rules`, ruleData);
    return response.data;
  },

  async getBankRule(companyId, ruleId) {
    const response = await apiClient.get(`/companies/${companyId}/bank-rules/${ruleId}`);
    return response.data;
  },

  async updateBankRule(companyId, ruleId, ruleData) {
    const response = await apiClient.put(`/companies/${companyId}/bank-rules/${ruleId}`, ruleData);
    return response.data;
  },

  async deleteBankRule(companyId, ruleId) {
    const response = await apiClient.delete(`/companies/${companyId}/bank-rules/${ruleId}`);
    return response.data;
  },

  async testBankRule(companyId, ruleId, testData) {
    const response = await apiClient.post(`/companies/${companyId}/bank-rules/${ruleId}/test`, testData);
    return response.data;
  },

  async applyBankRule(companyId, ruleId, transactionIds) {
    const response = await apiClient.post(`/companies/${companyId}/bank-rules/${ruleId}/apply`, { transaction_ids: transactionIds });
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
  },

  getReconciliationStatusColor: (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'discrepancy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getBankRuleStatusColor: (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  },

  getBankRuleTypeColor: (type) => {
    switch (type?.toLowerCase()) {
      case 'categorize':
        return 'bg-blue-100 text-blue-800';
      case 'split':
        return 'bg-purple-100 text-purple-800';
      case 'exclude':
        return 'bg-red-100 text-red-800';
      case 'memo':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getBankRuleTypes: () => [
    { value: 'categorize', label: 'Categorize' },
    { value: 'split', label: 'Split' },
    { value: 'exclude', label: 'Exclude' },
    { value: 'memo', label: 'Add Memo' }
  ],

  getBankRuleConditions: () => [
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'equals', label: 'Equals' },
    { value: 'amount_greater', label: 'Amount Greater Than' },
    { value: 'amount_less', label: 'Amount Less Than' },
    { value: 'amount_equals', label: 'Amount Equals' }
  ],

  validateBankRuleData: (ruleData) => {
    const errors = [];
    
    if (!ruleData.name || !ruleData.name.trim()) {
      errors.push('Rule name is required');
    }
    
    if (!ruleData.rule_type || !ruleData.rule_type.trim()) {
      errors.push('Rule type is required');
    }
    
    if (!ruleData.conditions || !Array.isArray(ruleData.conditions) || ruleData.conditions.length === 0) {
      errors.push('At least one condition is required');
    }
    
    if (!ruleData.actions || !Array.isArray(ruleData.actions) || ruleData.actions.length === 0) {
      errors.push('At least one action is required');
    }
    
    return errors;
  },

  calculateReconciliationDifference: (statementBalance, bookBalance) => {
    const statement = parseFloat(statementBalance) || 0;
    const book = parseFloat(bookBalance) || 0;
    return statement - book;
  }
};

export default bankingService;