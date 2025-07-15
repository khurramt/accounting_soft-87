import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import vendorService from '../../services/vendorService';
import { itemService } from '../../services/itemService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Send,
  Check,
  X,
  Clock,
  AlertCircle,
  Package,
  Truck,
  FileText,
  Download,
  Upload,
  Calendar,
  DollarSign,
  Users,
  Building,
  Loader2
} from 'lucide-react';

const PurchaseOrderManagement = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Purchase order management state
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  
  // Purchase order form state
  const [orderForm, setOrderForm] = useState({
    vendor_id: '',
    reference: '',
    description: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    status: 'draft',
    priority: 'normal',
    shipping_address: '',
    billing_address: '',
    notes: '',
    discount_amount: 0,
    tax_amount: 0,
    shipping_amount: 0,
    line_items: []
  });
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'all',
    vendor_id: 'all',
    priority: 'all',
    date_range: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0
  });
  
  // UI state
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  
  // Load data when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadPurchaseOrderData();
      loadVendors();
      loadItems();
    }
  }, [currentCompany?.id, activeTab, filters, pagination.page]);
  
  const loadPurchaseOrderData = async () => {
    try {
      setLoading(true);
      
      const response = await purchaseOrderService.getPurchaseOrders(currentCompany.id, {
        ...filters,
        page: pagination.page,
        page_size: pagination.page_size
      });
      
      setPurchaseOrders(response.items || []);
      setPagination(prev => ({ ...prev, total: response.total || 0 }));
      
      // Load stats
      const statsResponse = await purchaseOrderService.getPurchaseOrderStats(currentCompany.id);
      setStats(statsResponse || {});
      
    } catch (error) {
      console.error('Error loading purchase order data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadVendors = async () => {
    try {
      const response = await vendorService.getVendors(currentCompany.id, { page_size: 100 });
      setVendors(response.items || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };
  
  const loadItems = async () => {
    try {
      const response = await itemService.getItems(currentCompany.id, { page_size: 100 });
      setItems(response.items || []);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };
  
  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      await purchaseOrderService.createPurchaseOrder(currentCompany.id, orderForm);
      setShowCreateOrder(false);
      resetOrderForm();
      loadPurchaseOrderData();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateOrder = async (orderId, updates) => {
    try {
      setLoading(true);
      await purchaseOrderService.updatePurchaseOrder(currentCompany.id, orderId, updates);
      setEditingOrder(null);
      loadPurchaseOrderData();
    } catch (error) {
      console.error('Error updating purchase order:', error);
      alert('Failed to update purchase order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await purchaseOrderService.deletePurchaseOrder(currentCompany.id, orderId);
        loadPurchaseOrderData();
      } catch (error) {
        console.error('Error deleting purchase order:', error);
        alert('Failed to delete purchase order. Please try again.');
      }
    }
  };
  
  const handleSendOrder = async (orderId) => {
    try {
      await purchaseOrderService.sendPurchaseOrder(currentCompany.id, orderId);
      loadPurchaseOrderData();
      alert('Purchase order sent successfully!');
    } catch (error) {
      console.error('Error sending purchase order:', error);
      alert('Failed to send purchase order. Please try again.');
    }
  };
  
  const handleApproveOrder = async (orderId) => {
    try {
      await purchaseOrderService.approvePurchaseOrder(currentCompany.id, orderId);
      loadPurchaseOrderData();
    } catch (error) {
      console.error('Error approving purchase order:', error);
      alert('Failed to approve purchase order. Please try again.');
    }
  };
  
  const handleReceiveOrder = async (orderId, receivedItems) => {
    try {
      await purchaseOrderService.receivePurchaseOrder(currentCompany.id, orderId, receivedItems);
      loadPurchaseOrderData();
      alert('Purchase order received successfully!');
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      alert('Failed to receive purchase order. Please try again.');
    }
  };
  
  const resetOrderForm = () => {
    setOrderForm({
      vendor_id: '', reference: '', description: '', order_date: new Date().toISOString().split('T')[0],
      expected_date: '', status: 'draft', priority: 'normal', shipping_address: '', billing_address: '',
      notes: '', discount_amount: 0, tax_amount: 0, shipping_amount: 0, line_items: []
    });
  };
  
  const addLineItem = (item) => {
    const newLineItem = {
      id: Date.now(),
      item_id: item.id,
      item_name: item.name,
      description: item.description,
      quantity: 1,
      unit_price: item.unit_price || 0,
      total: item.unit_price || 0
    };
    setOrderForm(prev => ({
      ...prev,
      line_items: [...prev.line_items, newLineItem]
    }));
    setShowAddItem(false);
  };
  
  const updateLineItem = (itemId, field, value) => {
    setOrderForm(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };
  
  const removeLineItem = (itemId) => {
    setOrderForm(prev => ({
      ...prev,
      line_items: prev.line_items.filter(item => item.id !== itemId)
    }));
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
      case 'approved': return <Check className="w-4 h-4 text-green-500" />;
      case 'received': return <Package className="w-4 h-4 text-purple-500" />;
      case 'cancelled': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'approved': return 'default';
      case 'received': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  const calculateOrderTotal = () => {
    const subtotal = orderForm.line_items.reduce((sum, item) => sum + item.total, 0);
    return subtotal + (orderForm.tax_amount || 0) + (orderForm.shipping_amount || 0) - (orderForm.discount_amount || 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Management</h1>
          <p className="text-gray-600 mt-1">Manage your purchase orders and vendor relationships</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => loadPurchaseOrderData()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateOrder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Purchase Order Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total_orders || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending_orders || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_amount_month || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendors</p>
                <p className="text-2xl font-bold">{stats.active_vendors || 0}</p>
              </div>
              <Building className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Orders</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.vendor_id} onValueChange={(value) => setFilters({...filters, vendor_id: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading purchase orders...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-medium">PO-{order.po_number}</span>
                      </div>
                      <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                      <Badge variant={getPriorityColor(order.priority)}>{order.priority}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingOrder(order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {order.status === 'draft' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSendOrder(order.id)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      {order.status === 'sent' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApproveOrder(order.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Vendor</p>
                      <p className="font-medium">{order.vendor_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Order Date</p>
                      <p className="font-medium">{formatDate(order.order_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expected Date</p>
                      <p className="font-medium">{order.expected_date ? formatDate(order.expected_date) : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>
                  {order.description && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">{order.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Purchase Order Dialog */}
      <Dialog open={showCreateOrder || editingOrder} onOpenChange={(open) => {
        if (!open) {
          setShowCreateOrder(false);
          setEditingOrder(null);
          resetOrderForm();
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor_id">Vendor</Label>
                <Select value={orderForm.vendor_id} onValueChange={(value) => setOrderForm({...orderForm, vendor_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  placeholder="Purchase order reference"
                  value={orderForm.reference}
                  onChange={(e) => setOrderForm({...orderForm, reference: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="order_date">Order Date</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={orderForm.order_date}
                  onChange={(e) => setOrderForm({...orderForm, order_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expected_date">Expected Date</Label>
                <Input
                  id="expected_date"
                  type="date"
                  value={orderForm.expected_date}
                  onChange={(e) => setOrderForm({...orderForm, expected_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={orderForm.status} onValueChange={(value) => setOrderForm({...orderForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={orderForm.priority} onValueChange={(value) => setOrderForm({...orderForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Purchase order description"
                value={orderForm.description}
                onChange={(e) => setOrderForm({...orderForm, description: e.target.value})}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddItem(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {orderForm.line_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        placeholder="Unit Price"
                      />
                    </div>
                    <div className="w-32">
                      <p className="font-medium">{formatCurrency(item.total)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="discount_amount">Discount</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  value={orderForm.discount_amount}
                  onChange={(e) => setOrderForm({...orderForm, discount_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="tax_amount">Tax</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  value={orderForm.tax_amount}
                  onChange={(e) => setOrderForm({...orderForm, tax_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="shipping_amount">Shipping</Label>
                <Input
                  id="shipping_amount"
                  type="number"
                  value={orderForm.shipping_amount}
                  onChange={(e) => setOrderForm({...orderForm, shipping_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Total</Label>
                <p className="text-xl font-bold">{formatCurrency(calculateOrderTotal())}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes"
                value={orderForm.notes}
                onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowCreateOrder(false);
                setEditingOrder(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={editingOrder ? () => handleUpdateOrder(editingOrder.id, orderForm) : handleCreateOrder} 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingOrder ? 'Update' : 'Create'} Purchase Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                className="pl-10"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.unit_price)}</p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => addLineItem(item)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PO Number</Label>
                  <p className="text-sm">PO-{selectedOrder.po_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <p className="text-sm">{selectedOrder.vendor_name}</p>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <p className="text-sm">{formatDate(selectedOrder.order_date)}</p>
                </div>
                <div>
                  <Label>Expected Date</Label>
                  <p className="text-sm">{selectedOrder.expected_date ? formatDate(selectedOrder.expected_date) : 'Not set'}</p>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="text-sm font-bold">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>
              
              {selectedOrder.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedOrder.description}</p>
                </div>
              )}
              
              {selectedOrder.line_items && selectedOrder.line_items.length > 0 && (
                <div>
                  <Label>Line Items</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.line_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.item_name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                          <p className="text-sm">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderManagement;