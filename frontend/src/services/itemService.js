import apiClient from './apiClient';

// Item Service - Handles all item management API calls
export const itemService = {
  // Items
  async createItem(companyId, itemData) {
    const response = await apiClient.post(`/companies/${companyId}/items`, itemData);
    return response.data;
  },

  async getItems(companyId, params = {}) {
    const { 
      search,
      item_type,
      low_stock,
      is_active,
      sort_by = 'item_name',
      sort_order = 'asc',
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
    if (item_type) queryParams.append('item_type', item_type);
    if (low_stock !== undefined) queryParams.append('low_stock', low_stock.toString());
    if (is_active !== undefined) queryParams.append('is_active', is_active.toString());
    
    const response = await apiClient.get(`/companies/${companyId}/items?${queryParams}`);
    return response.data;
  },

  async getLowStockItems(companyId) {
    const response = await apiClient.get(`/companies/${companyId}/items/low-stock`);
    return response.data;
  },

  async getItem(companyId, itemId) {
    const response = await apiClient.get(`/companies/${companyId}/items/${itemId}`);
    return response.data;
  },

  async updateItem(companyId, itemId, itemData) {
    const response = await apiClient.put(`/companies/${companyId}/items/${itemId}`, itemData);
    return response.data;
  },

  async deleteItem(companyId, itemId) {
    const response = await apiClient.delete(`/companies/${companyId}/items/${itemId}`);
    return response.data;
  }
};

// Item Utilities
export const itemUtils = {
  // Get item type color
  getItemTypeColor(type) {
    switch (type?.toLowerCase()) {
      case 'inventory':
        return 'bg-blue-100 text-blue-800';
      case 'non-inventory':
        return 'bg-green-100 text-green-800';
      case 'service':
        return 'bg-purple-100 text-purple-800';
      case 'other_charge':
        return 'bg-yellow-100 text-yellow-800';
      case 'subtotal':
        return 'bg-gray-100 text-gray-800';
      case 'group':
        return 'bg-orange-100 text-orange-800';
      case 'discount':
        return 'bg-red-100 text-red-800';
      case 'payment':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get item status color
  getItemStatusColor(isActive) {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  },

  // Format currency
  formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = parseFloat(amount) || 0;
    return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  // Get item types
  getItemTypes() {
    return [
      { value: 'inventory', label: 'Inventory' },
      { value: 'non-inventory', label: 'Non-Inventory' },
      { value: 'service', label: 'Service' },
      { value: 'other_charge', label: 'Other Charge' },
      { value: 'subtotal', label: 'Subtotal' },
      { value: 'group', label: 'Group' },
      { value: 'discount', label: 'Discount' },
      { value: 'payment', label: 'Payment' }
    ];
  },

  // Get stock status
  getStockStatus(quantityOnHand, reorderPoint) {
    if (!quantityOnHand || quantityOnHand === 0) return 'Out of Stock';
    if (quantityOnHand <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  },

  // Get stock status color
  getStockStatusColor(quantityOnHand, reorderPoint) {
    if (!quantityOnHand || quantityOnHand === 0) return 'bg-red-100 text-red-800';
    if (quantityOnHand <= reorderPoint) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  },

  // Validate item data
  validateItemData(itemData) {
    const errors = [];
    
    if (!itemData.item_name || !itemData.item_name.trim()) {
      errors.push('Item name is required');
    }
    
    if (!itemData.item_type || !itemData.item_type.trim()) {
      errors.push('Item type is required');
    }
    
    if (itemData.unit_price && parseFloat(itemData.unit_price) < 0) {
      errors.push('Unit price cannot be negative');
    }
    
    if (itemData.unit_cost && parseFloat(itemData.unit_cost) < 0) {
      errors.push('Unit cost cannot be negative');
    }
    
    if (itemData.quantity_on_hand && parseFloat(itemData.quantity_on_hand) < 0) {
      errors.push('Quantity on hand cannot be negative');
    }
    
    if (itemData.reorder_point && parseFloat(itemData.reorder_point) < 0) {
      errors.push('Reorder point cannot be negative');
    }
    
    return errors;
  },

  // Calculate inventory value
  calculateInventoryValue(quantityOnHand, unitCost) {
    const qty = parseFloat(quantityOnHand) || 0;
    const cost = parseFloat(unitCost) || 0;
    return qty * cost;
  },

  // Generate item number
  generateItemNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `ITM-${year}${month}${day}-${random}`;
  },

  // Check if item is taxable
  isItemTaxable(itemData) {
    return itemData.taxable === true || itemData.taxable === 'true';
  },

  // Get item description
  getItemDescription(itemData) {
    if (itemData.description) return itemData.description;
    if (itemData.item_name) return itemData.item_name;
    return 'No description available';
  }
};

export default itemService;