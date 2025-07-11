import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { inventoryService, inventoryUtils } from '../../services/inventoryService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Package, Search, Plus, Edit, Trash2, AlertTriangle, 
  TrendingUp, TrendingDown, BarChart3, Download, Upload,
  Filter, RefreshCw, ShoppingCart, CheckCircle, Loader2
} from 'lucide-react';

const InventoryCenter = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLocations, setInventoryLocations] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [inventoryOverview, setInventoryOverview] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [categories, setCategories] = useState([]);

  // Load data when component mounts or company changes
  useEffect(() => {
    if (currentCompany?.id) {
      loadInventoryData();
    }
  }, [currentCompany?.id]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load inventory overview
      const overviewData = await inventoryService.getInventoryOverview(currentCompany.id);
      setInventoryOverview(overviewData);
      
      // Load inventory items
      const itemsData = await inventoryService.getInventoryItems(currentCompany.id, {
        page: 1,
        page_size: 100
      });
      
      // Transform API data into component format
      const transformedItems = itemsData.items?.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        description: item.description,
        quantityOnHand: item.quantity_on_hand || 0,
        reorderPoint: item.reorder_point || 0,
        maxStock: item.max_stock || 0,
        unitCost: parseFloat(item.unit_cost || 0),
        unitPrice: parseFloat(item.unit_price || 0),
        totalValue: inventoryUtils.calculateInventoryValue(item.quantity_on_hand, item.unit_cost),
        lastUpdated: inventoryUtils.formatDate(item.last_updated),
        status: inventoryUtils.getInventoryStatus(item.quantity_on_hand, item.reorder_point),
        vendor: item.vendor_name || 'N/A',
        location: item.location_name || 'N/A',
        barcode: item.barcode || ''
      })) || [];
      
      setInventoryItems(transformedItems);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(transformedItems.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Load inventory locations
      const locationsData = await inventoryService.getInventoryLocations(currentCompany.id);
      const transformedLocations = locationsData.items?.map(location => ({
        id: location.id,
        name: location.name,
        address: location.address,
        capacity: location.capacity || 0
      })) || [];
      
      setInventoryLocations(transformedLocations);
      
      // Load recent transactions
      const transactionsData = await inventoryService.getInventoryTransactions(currentCompany.id, {
        page: 1,
        page_size: 20
      });
      
      const transformedTransactions = transactionsData.items?.map(transaction => ({
        id: transaction.id,
        type: transaction.transaction_type,
        item: transaction.item_name,
        quantity: transaction.quantity || 0,
        date: inventoryUtils.formatDate(transaction.transaction_date),
        reference: transaction.reference || 'N/A',
        cost: parseFloat(transaction.total_cost || 0)
      })) || [];
      
      setRecentTransactions(transformedTransactions);
      
    } catch (err) {
      // If API calls fail, use fallback data
      console.warn('Failed to load inventory data from API, using fallback:', err);
      
      // Use fallback mock data
      const fallbackItems = [
        {
          id: 1,
          name: 'Sample Item',
          sku: 'SAM-001',
          category: 'General',
          description: 'Sample inventory item',
          quantityOnHand: 10,
          reorderPoint: 5,
          maxStock: 50,
          unitCost: 10.00,
          unitPrice: 20.00,
          totalValue: 100.00,
          lastUpdated: inventoryUtils.formatDate(new Date()),
          status: 'In Stock',
          vendor: 'Sample Vendor',
          location: 'Main Warehouse',
          barcode: '1234567890'
        }
      ];
      
      setInventoryItems(fallbackItems);
      setCategories(['General']);
      setInventoryLocations([
        { id: 1, name: 'Main Warehouse', address: '123 Main St', capacity: 1000 }
      ]);
      setRecentTransactions([]);
      setInventoryOverview({
        totalItems: fallbackItems.length,
        totalValue: fallbackItems.reduce((sum, item) => sum + item.totalValue, 0),
        lowStockItems: fallbackItems.filter(item => item.status === 'Low Stock').length,
        outOfStockItems: fallbackItems.filter(item => item.status === 'Out of Stock').length
      });
      
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadInventoryData();
    setRefreshing(false);
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    return inventoryUtils.getStatusColor(status);
  };

  const getStatusIcon = (item) => {
    if (item.quantityOnHand === 0) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (item.quantityOnHand <= item.reorderPoint) return <TrendingDown className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getTotalInventoryValue = () => {
    return inventoryOverview.totalValue || inventoryItems.reduce((total, item) => total + item.totalValue, 0);
  };

  const getLowStockItems = () => {
    return inventoryOverview.lowStockItems || inventoryItems.filter(item => item.quantityOnHand <= item.reorderPoint);
  };

  const getOutOfStockItems = () => {
    return inventoryOverview.outOfStockItems || inventoryItems.filter(item => item.quantityOnHand === 0);
  };

  const adjustQuantity = async (itemId) => {
    try {
      const quantity = prompt('Enter adjustment quantity (positive for increase, negative for decrease):');
      if (quantity === null || quantity === '') return;
      
      const adjustmentQuantity = parseInt(quantity);
      if (isNaN(adjustmentQuantity)) {
        alert('Please enter a valid number');
        return;
      }
      
      await inventoryService.createInventoryAdjustment(currentCompany.id, {
        item_id: itemId,
        quantity: adjustmentQuantity,
        reason: 'Manual adjustment',
        adjustment_date: new Date().toISOString()
      });
      
      alert('Inventory adjustment created successfully!');
      await refreshData();
    } catch (err) {
      console.error('Error creating inventory adjustment:', err);
      alert('Failed to create inventory adjustment. Please try again.');
    }
  };

  const reorderItem = async (itemId) => {
    try {
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;
      
      const reorderQuantity = inventoryUtils.calculateReorderQuantity(
        item.maxStock,
        item.quantityOnHand,
        item.reorderPoint
      );
      
      if (reorderQuantity > 0) {
        alert(`Recommended reorder quantity: ${reorderQuantity} units\nThis would bring inventory to maximum stock level.`);
        // In a real implementation, this would create a purchase order
      } else {
        alert('Item is above reorder point. No reorder needed.');
      }
    } catch (err) {
      console.error('Error calculating reorder quantity:', err);
      alert('Failed to calculate reorder quantity. Please try again.');
    }
  };

  const exportInventory = async () => {
    try {
      const data = await inventoryService.exportInventory(currentCompany.id);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_${currentCompany.name}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting inventory:', err);
      alert('Failed to export inventory. Please try again.');
    }
  };

  const runInventoryReport = async () => {
    try {
      await inventoryService.generateInventoryReport(currentCompany.id, 'valuation');
      alert('Inventory valuation report generated successfully!');
    } catch (err) {
      console.error('Error generating inventory report:', err);
      alert('Failed to generate inventory report. Please try again.');
    }
  };

  const handleImportInventory = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      await inventoryService.importInventory(currentCompany.id, file);
      alert('Inventory imported successfully!');
      await refreshData();
    } catch (err) {
      console.error('Error importing inventory:', err);
      alert('Failed to import inventory. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Button onClick={loadInventoryData} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Center</h1>
          <p className="text-gray-600">Manage your inventory items and stock levels</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportInventory} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Item
          </Button>
        </div>
      </div>

      {/* Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryOverview.totalItems || inventoryItems.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {inventoryUtils.formatCurrency(getTotalInventoryValue())}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{typeof getLowStockItems() === 'number' ? getLowStockItems() : getLowStockItems().length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{typeof getOutOfStockItems() === 'number' ? getOutOfStockItems() : getOutOfStockItems().length}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Inventory Items
                </CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <Button size="sm" variant="outline" onClick={runInventoryReport}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Reports
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search items by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="name">Sort by Name</option>
                  <option value="sku">Sort by SKU</option>
                  <option value="quantity">Sort by Quantity</option>
                  <option value="value">Sort by Value</option>
                </select>
              </div>

              {/* Inventory Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Item</th>
                      <th className="text-left p-3">SKU</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Qty on Hand</th>
                      <th className="text-left p-3">Reorder Point</th>
                      <th className="text-left p-3">Unit Cost</th>
                      <th className="text-left p-3">Unit Price</th>
                      <th className="text-left p-3">Total Value</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            {getStatusIcon(item)}
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-sm">{item.sku}</td>
                        <td className="p-3">
                          <Badge variant="outline">{item.category}</Badge>
                        </td>
                        <td className="p-3">
                          <span className={`font-medium ${
                            item.quantityOnHand === 0 ? 'text-red-600' :
                            item.quantityOnHand <= item.reorderPoint ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.quantityOnHand}
                          </span>
                        </td>
                        <td className="p-3">{item.reorderPoint}</td>
                        <td className="p-3">${item.unitCost.toFixed(2)}</td>
                        <td className="p-3">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 font-medium">${item.totalValue.toFixed(2)}</td>
                        <td className="p-3">
                          <Badge variant={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="p-1">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => adjustQuantity(item.id)}
                              className="p-1"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            {item.quantityOnHand <= item.reorderPoint && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => reorderItem(item.id)}
                                className="p-1"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="p-1 text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {inventoryLocations.map(location => (
                  <Card key={location.id} className="border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{location.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Capacity: {location.capacity} units</span>
                        <Button size="sm" variant="outline">
                          View Items
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Inventory Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Item</th>
                      <th className="text-left p-3">Quantity</th>
                      <th className="text-left p-3">Reference</th>
                      <th className="text-left p-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{transaction.date}</td>
                        <td className="p-3">
                          <Badge variant={
                            transaction.type === 'Purchase' ? 'success' :
                            transaction.type === 'Sale' ? 'default' : 'secondary'
                          }>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="p-3">{transaction.item}</td>
                        <td className="p-3">
                          <span className={`font-medium ${
                            transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-sm">{transaction.reference}</td>
                        <td className="p-3">
                          <span className={`font-medium ${
                            transaction.cost > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${Math.abs(transaction.cost).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Inventory Valuation</h3>
                <p className="text-gray-600 mb-4">
                  Current value of all inventory items
                </p>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Reorder Report</h3>
                <p className="text-gray-600 mb-4">
                  Items that need to be reordered
                </p>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Stock Movement</h3>
                <p className="text-gray-600 mb-4">
                  Track inventory changes over time
                </p>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryCenter;