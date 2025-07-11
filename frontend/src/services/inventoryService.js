import apiClient from './apiClient';

// Inventory Service - Handles all inventory-related API calls
export const inventoryService = {
  // Inventory Overview
  async getInventoryOverview(companyId, params = {}) {
    const { location_id } = params;
    
    const queryParams = new URLSearchParams();
    if (location_id) queryParams.append('location_id', location_id);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory?${queryParams}`);
    return response.data;
  },

  // Inventory Items
  async getInventoryItems(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      category,
      location_id,
      low_stock_only,
      out_of_stock_only,
      sort_by = 'name',
      sort_order = 'asc'
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      sort_by,
      sort_order
    });
    
    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (location_id) queryParams.append('location_id', location_id);
    if (low_stock_only) queryParams.append('low_stock_only', low_stock_only.toString());
    if (out_of_stock_only) queryParams.append('out_of_stock_only', out_of_stock_only.toString());
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/items?${queryParams}`);
    return response.data;
  },

  async getInventoryItem(companyId, itemId) {
    const response = await apiClient.get(`/companies/${companyId}/inventory/${itemId}`);
    return response.data;
  },

  async createInventoryItem(companyId, itemData) {
    const response = await apiClient.post(`/companies/${companyId}/inventory/items`, itemData);
    return response.data;
  },

  async updateInventoryItem(companyId, itemId, itemData) {
    const response = await apiClient.put(`/companies/${companyId}/inventory/items/${itemId}`, itemData);
    return response.data;
  },

  async deleteInventoryItem(companyId, itemId) {
    const response = await apiClient.delete(`/companies/${companyId}/inventory/items/${itemId}`);
    return response.data;
  },

  // Inventory Adjustments
  async createInventoryAdjustment(companyId, adjustmentData) {
    const response = await apiClient.post(`/companies/${companyId}/inventory/adjustments`, adjustmentData);
    return response.data;
  },

  async getInventoryAdjustments(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      item_id,
      location_id,
      date_from,
      date_to,
      reason
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString()
    });
    
    if (item_id) queryParams.append('item_id', item_id);
    if (location_id) queryParams.append('location_id', location_id);
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    if (reason) queryParams.append('reason', reason);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/adjustments?${queryParams}`);
    return response.data;
  },

  // Inventory Locations
  async getInventoryLocations(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      active_only = true
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      active_only: active_only.toString()
    });
    
    if (search) queryParams.append('search', search);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/locations?${queryParams}`);
    return response.data;
  },

  async createInventoryLocation(companyId, locationData) {
    const response = await apiClient.post(`/companies/${companyId}/inventory/locations`, locationData);
    return response.data;
  },

  async updateInventoryLocation(companyId, locationId, locationData) {
    const response = await apiClient.put(`/companies/${companyId}/inventory/locations/${locationId}`, locationData);
    return response.data;
  },

  // Inventory Transactions
  async getInventoryTransactions(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      item_id,
      location_id,
      transaction_type,
      date_from,
      date_to,
      reference
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString()
    });
    
    if (item_id) queryParams.append('item_id', item_id);
    if (location_id) queryParams.append('location_id', location_id);
    if (transaction_type) queryParams.append('transaction_type', transaction_type);
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    if (reference) queryParams.append('reference', reference);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/transactions?${queryParams}`);
    return response.data;
  },

  // Inventory Assemblies
  async getInventoryAssemblies(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      search,
      active_only = true
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      active_only: active_only.toString()
    });
    
    if (search) queryParams.append('search', search);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/assemblies?${queryParams}`);
    return response.data;
  },

  async createInventoryAssembly(companyId, assemblyData) {
    const response = await apiClient.post(`/companies/${companyId}/inventory/assemblies`, assemblyData);
    return response.data;
  },

  async updateInventoryAssembly(companyId, assemblyId, assemblyData) {
    const response = await apiClient.put(`/companies/${companyId}/inventory/assemblies/${assemblyId}`, assemblyData);
    return response.data;
  },

  // Inventory Reorder
  async getReorderPoints(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      location_id,
      category,
      below_reorder_point_only = false
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      below_reorder_point_only: below_reorder_point_only.toString()
    });
    
    if (location_id) queryParams.append('location_id', location_id);
    if (category) queryParams.append('category', category);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/reorder?${queryParams}`);
    return response.data;
  },

  async updateReorderPoint(companyId, itemId, reorderData) {
    const response = await apiClient.put(`/companies/${companyId}/inventory/reorder/${itemId}`, reorderData);
    return response.data;
  },

  // Inventory Receipts
  async getInventoryReceipts(companyId, params = {}) {
    const { 
      page = 1, 
      page_size = 50, 
      date_from,
      date_to,
      vendor_id,
      location_id,
      status
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString()
    });
    
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    if (vendor_id) queryParams.append('vendor_id', vendor_id);
    if (location_id) queryParams.append('location_id', location_id);
    if (status) queryParams.append('status', status);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/receipts?${queryParams}`);
    return response.data;
  },

  async createInventoryReceipt(companyId, receiptData) {
    const response = await apiClient.post(`/companies/${companyId}/inventory/receipts`, receiptData);
    return response.data;
  },

  // Inventory Valuation
  async getInventoryValuation(companyId, params = {}) {
    const { 
      valuation_date,
      location_id,
      category,
      method = 'FIFO'
    } = params;
    
    const queryParams = new URLSearchParams({
      method
    });
    
    if (valuation_date) queryParams.append('valuation_date', valuation_date);
    if (location_id) queryParams.append('location_id', location_id);
    if (category) queryParams.append('category', category);
    
    const response = await apiClient.get(`/companies/${companyId}/inventory/valuation?${queryParams}`);
    return response.data;
  },

  async createInventoryValuation(companyId, valuationData) {
    const response = await apiClient.post(`/companies/${companyId}/inventory/valuation`, valuationData);
    return response.data;
  },

  // Inventory Reports
  async generateInventoryReport(companyId, reportType, params = {}) {
    const response = await apiClient.post(`/companies/${companyId}/inventory/reports/${reportType}`, params);
    return response.data;
  },

  // Inventory Export/Import
  async exportInventory(companyId, params = {}) {
    const response = await apiClient.get(`/companies/${companyId}/inventory/export`, { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  },

  async importInventory(companyId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/companies/${companyId}/inventory/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Purchase Order creation for reorder functionality
  async createPurchaseOrder(companyId, purchaseOrderData) {
    const response = await apiClient.post(`/companies/${companyId}/purchase-orders`, purchaseOrderData);
    return response.data;
  }
};

// Inventory Utilities
export const inventoryUtils = {
  // Format currency
  formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = parseFloat(amount) || 0;
    return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  // Format quantity
  formatQuantity(quantity) {
    if (quantity === null || quantity === undefined) return '0';
    return parseFloat(quantity).toLocaleString('en-US');
  },

  // Get status color
  getStatusColor(status) {
    if (!status) return 'gray';
    switch (status.toLowerCase()) {
      case 'in stock': return 'green';
      case 'low stock': return 'yellow';
      case 'out of stock': return 'red';
      case 'discontinued': return 'gray';
      default: return 'gray';
    }
  },

  // Get inventory status
  getInventoryStatus(quantityOnHand, reorderPoint) {
    if (!quantityOnHand || quantityOnHand === 0) return 'Out of Stock';
    if (quantityOnHand <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  },

  // Calculate inventory value
  calculateInventoryValue(quantity, unitCost) {
    const qty = parseFloat(quantity) || 0;
    const cost = parseFloat(unitCost) || 0;
    return qty * cost;
  },

  // Format date
  formatDate(date) {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return date;
    }
  },

  // Format timestamp
  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  },

  // Get transaction type color
  getTransactionTypeColor(type) {
    if (!type) return 'gray';
    switch (type.toLowerCase()) {
      case 'purchase': return 'green';
      case 'sale': return 'blue';
      case 'adjustment': return 'yellow';
      case 'transfer': return 'purple';
      case 'return': return 'orange';
      default: return 'gray';
    }
  },

  // Calculate reorder quantity
  calculateReorderQuantity(maxStock, quantityOnHand, reorderPoint) {
    const max = parseFloat(maxStock) || 0;
    const current = parseFloat(quantityOnHand) || 0;
    const reorder = parseFloat(reorderPoint) || 0;
    
    if (current <= reorder) {
      return Math.max(0, max - current);
    }
    return 0;
  },

  // Get category color
  getCategoryColor(category) {
    if (!category) return 'gray';
    const colors = ['blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange', 'red'];
    const index = category.length % colors.length;
    return colors[index];
  },

  // Validate inventory item
  validateInventoryItem(item) {
    const errors = [];
    
    if (!item.name || item.name.trim() === '') {
      errors.push('Item name is required');
    }
    
    if (!item.sku || item.sku.trim() === '') {
      errors.push('SKU is required');
    }
    
    if (!item.category || item.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (item.unit_cost && parseFloat(item.unit_cost) < 0) {
      errors.push('Unit cost cannot be negative');
    }
    
    if (item.unit_price && parseFloat(item.unit_price) < 0) {
      errors.push('Unit price cannot be negative');
    }
    
    if (item.quantity_on_hand && parseFloat(item.quantity_on_hand) < 0) {
      errors.push('Quantity on hand cannot be negative');
    }
    
    if (item.reorder_point && parseFloat(item.reorder_point) < 0) {
      errors.push('Reorder point cannot be negative');
    }
    
    return errors;
  },

  // Calculate inventory turnover
  calculateInventoryTurnover(costOfGoodsSold, averageInventory) {
    const cogs = parseFloat(costOfGoodsSold) || 0;
    const avgInventory = parseFloat(averageInventory) || 0;
    
    if (avgInventory === 0) return 0;
    return cogs / avgInventory;
  },

  // Calculate days in inventory
  calculateDaysInInventory(inventoryTurnover) {
    const turnover = parseFloat(inventoryTurnover) || 0;
    if (turnover === 0) return 0;
    return 365 / turnover;
  },

  // Generate SKU
  generateSKU(category, name) {
    const categoryCode = category ? category.substring(0, 3).toUpperCase() : 'GEN';
    const nameCode = name ? name.substring(0, 3).toUpperCase() : 'ITM';
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}-${nameCode}-${randomNum}`;
  }
};

export default inventoryService;