import apiClient from './apiClient';

// Purchase Order Service - Handles all purchase order API calls
export const purchaseOrderService = {
  // Purchase Orders
  async createPurchaseOrder(companyId, poData) {
    const response = await apiClient.post(`/companies/${companyId}/purchase-orders`, poData);
    return response.data;
  },

  async getPurchaseOrders(companyId, params = {}) {
    const { 
      search,
      vendor_id,
      status,
      date_from,
      date_to,
      sort_by = 'po_date',
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
    if (vendor_id) queryParams.append('vendor_id', vendor_id);
    if (status) queryParams.append('status', status);
    if (date_from) queryParams.append('date_from', date_from);
    if (date_to) queryParams.append('date_to', date_to);
    
    const response = await apiClient.get(`/companies/${companyId}/purchase-orders?${queryParams}`);
    return response.data;
  },

  async getPurchaseOrder(companyId, poId) {
    const response = await apiClient.get(`/companies/${companyId}/purchase-orders/${poId}`);
    return response.data;
  },

  async updatePurchaseOrder(companyId, poId, poData) {
    const response = await apiClient.put(`/companies/${companyId}/purchase-orders/${poId}`, poData);
    return response.data;
  },

  async deletePurchaseOrder(companyId, poId) {
    const response = await apiClient.delete(`/companies/${companyId}/purchase-orders/${poId}`);
    return response.data;
  },

  async emailPurchaseOrder(companyId, poId) {
    const response = await apiClient.post(`/companies/${companyId}/purchase-orders/${poId}/email`);
    return response.data;
  }
};

// Purchase Order Utilities
export const purchaseOrderUtils = {
  // Get purchase order status color
  getPurchaseOrderStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'ordered':
        return 'bg-purple-100 text-purple-800';
      case 'partially_received':
        return 'bg-orange-100 text-orange-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get purchase order status text
  getPurchaseOrderStatusText(status) {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'ordered':
        return 'Ordered';
      case 'partially_received':
        return 'Partially Received';
      case 'received':
        return 'Received';
      case 'cancelled':
        return 'Cancelled';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
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

  // Get purchase order statuses
  getPurchaseOrderStatuses() {
    return [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending Approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'ordered', label: 'Ordered' },
      { value: 'partially_received', label: 'Partially Received' },
      { value: 'received', label: 'Received' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'closed', label: 'Closed' }
    ];
  },

  // Calculate purchase order total
  calculatePurchaseOrderTotal(lineItems) {
    if (!lineItems || !Array.isArray(lineItems)) return 0;
    
    return lineItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitCost = parseFloat(item.unit_cost) || 0;
      return total + (quantity * unitCost);
    }, 0);
  },

  // Validate purchase order data
  validatePurchaseOrderData(poData) {
    const errors = [];
    
    if (!poData.vendor_id || !poData.vendor_id.trim()) {
      errors.push('Vendor is required');
    }
    
    if (!poData.po_date) {
      errors.push('Purchase order date is required');
    }
    
    if (!poData.line_items || !Array.isArray(poData.line_items) || poData.line_items.length === 0) {
      errors.push('At least one line item is required');
    }
    
    // Validate line items
    if (poData.line_items && Array.isArray(poData.line_items)) {
      poData.line_items.forEach((item, index) => {
        if (!item.item_id || !item.item_id.trim()) {
          errors.push(`Line item ${index + 1}: Item is required`);
        }
        
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
        }
        
        if (!item.unit_cost || parseFloat(item.unit_cost) <= 0) {
          errors.push(`Line item ${index + 1}: Unit cost must be greater than 0`);
        }
      });
    }
    
    return errors;
  },

  // Generate purchase order number
  generatePurchaseOrderNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `PO-${year}${month}${day}-${random}`;
  },

  // Get purchase order priority color
  getPurchaseOrderPriorityColor(priority) {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get purchase order priorities
  getPurchaseOrderPriorities() {
    return [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' }
    ];
  },

  // Check if purchase order can be edited
  canEditPurchaseOrder(status) {
    const editableStatuses = ['draft', 'pending'];
    return editableStatuses.includes(status?.toLowerCase());
  },

  // Check if purchase order can be cancelled
  canCancelPurchaseOrder(status) {
    const cancellableStatuses = ['draft', 'pending', 'approved', 'ordered'];
    return cancellableStatuses.includes(status?.toLowerCase());
  },

  // Get expected delivery date
  getExpectedDeliveryDate(poDate, leadDays = 7) {
    if (!poDate) return null;
    
    try {
      const date = new Date(poDate);
      date.setDate(date.getDate() + leadDays);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return null;
    }
  }
};

export default purchaseOrderService;