import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Package, Search, Plus, Edit, Trash2, AlertTriangle, 
  TrendingUp, TrendingDown, BarChart3, Download, Upload,
  Filter, RefreshCw, ShoppingCart, CheckCircle
} from 'lucide-react';

const InventoryCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: 'Laptop Computer',
      sku: 'LT-001',
      category: 'Electronics',
      description: 'High-performance business laptop',
      quantityOnHand: 15,
      reorderPoint: 5,
      maxStock: 50,
      unitCost: 899.00,
      unitPrice: 1299.00,
      totalValue: 13485.00,
      lastUpdated: '2024-01-15',
      status: 'In Stock',
      vendor: 'Tech Supplies Inc',
      location: 'Warehouse A',
      barcode: '123456789012'
    },
    {
      id: 2,
      name: 'Office Chair',
      sku: 'OC-002',
      category: 'Furniture',
      description: 'Ergonomic office chair with lumbar support',
      quantityOnHand: 3,
      reorderPoint: 8,
      maxStock: 25,
      unitCost: 250.00,
      unitPrice: 399.00,
      totalValue: 750.00,
      lastUpdated: '2024-01-14',
      status: 'Low Stock',
      vendor: 'Office Furniture Co',
      location: 'Showroom',
      barcode: '123456789013'
    },
    {
      id: 3,
      name: 'Printer Paper',
      sku: 'PP-003',
      category: 'Office Supplies',
      description: 'Premium white paper, 500 sheets',
      quantityOnHand: 120,
      reorderPoint: 30,
      maxStock: 200,
      unitCost: 8.50,
      unitPrice: 15.99,
      totalValue: 1020.00,
      lastUpdated: '2024-01-13',
      status: 'In Stock',
      vendor: 'Paper Products LLC',
      location: 'Storage Room B',
      barcode: '123456789014'
    },
    {
      id: 4,
      name: 'Wireless Mouse',
      sku: 'WM-004',
      category: 'Electronics',
      description: 'Bluetooth wireless mouse',
      quantityOnHand: 0,
      reorderPoint: 10,
      maxStock: 30,
      unitCost: 25.00,
      unitPrice: 49.99,
      totalValue: 0.00,
      lastUpdated: '2024-01-12',
      status: 'Out of Stock',
      vendor: 'Tech Supplies Inc',
      location: 'Warehouse A',
      barcode: '123456789015'
    }
  ]);

  const [inventoryLocations] = useState([
    { id: 1, name: 'Warehouse A', address: '123 Industrial Way', capacity: 1000 },
    { id: 2, name: 'Showroom', address: '456 Main Street', capacity: 100 },
    { id: 3, name: 'Storage Room B', address: '789 Back Street', capacity: 500 }
  ]);

  const [categories] = useState([
    'Electronics', 'Furniture', 'Office Supplies', 'Equipment', 'Materials'
  ]);

  const [recentTransactions] = useState([
    {
      id: 1,
      type: 'Purchase',
      item: 'Laptop Computer',
      quantity: 5,
      date: '2024-01-15',
      reference: 'PO-001',
      cost: 4495.00
    },
    {
      id: 2,
      type: 'Sale',
      item: 'Office Chair',
      quantity: -2,
      date: '2024-01-14',
      reference: 'INV-101',
      cost: -500.00
    },
    {
      id: 3,
      type: 'Adjustment',
      item: 'Printer Paper',
      quantity: -5,
      date: '2024-01-13',
      reference: 'ADJ-001',
      cost: -42.50
    }
  ]);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'success';
      case 'Low Stock': return 'default';
      case 'Out of Stock': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (item) => {
    if (item.quantityOnHand === 0) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (item.quantityOnHand <= item.reorderPoint) return <TrendingDown className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getTotalInventoryValue = () => {
    return inventoryItems.reduce((total, item) => total + item.totalValue, 0);
  };

  const getLowStockItems = () => {
    return inventoryItems.filter(item => item.quantityOnHand <= item.reorderPoint);
  };

  const getOutOfStockItems = () => {
    return inventoryItems.filter(item => item.quantityOnHand === 0);
  };

  const adjustQuantity = (itemId) => {
    alert(`Opening quantity adjustment for item ${itemId}...`);
  };

  const reorderItem = (itemId) => {
    alert(`Creating purchase order for item ${itemId}...`);
  };

  const exportInventory = () => {
    alert('Exporting inventory data...');
  };

  const runInventoryReport = () => {
    alert('Generating inventory valuation report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Center</h1>
          <p className="text-gray-600">Manage your inventory items and stock levels</p>
        </div>
        <div className="flex space-x-2">
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
                <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
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
                  ${getTotalInventoryValue().toLocaleString()}
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
                <p className="text-2xl font-bold text-yellow-600">{getLowStockItems().length}</p>
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
                <p className="text-2xl font-bold text-red-600">{getOutOfStockItems().length}</p>
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