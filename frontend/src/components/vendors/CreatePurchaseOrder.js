import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  ShoppingCart,
  Plus,
  Trash2,
  Calculator,
  Save,
  Printer,
  Mail,
  Copy,
  RefreshCw,
  Building,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Truck
} from "lucide-react";

const CreatePurchaseOrder = () => {
  const [poData, setPoData] = useState({
    vendor: "",
    template: "Standard Purchase Order",
    date: new Date().toISOString().split('T')[0],
    poNumber: "PO-001",
    shipTo: "",
    vendorAddress: "",
    memo: "",
    vendorMessage: ""
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, item: "", description: "", qty: 1, cost: 0, amount: 0, customer: "" }
  ]);

  const [vendors] = useState([
    { id: "1", name: "Office Supplies Co.", address: "123 Supply St, Business City, ST 12345" },
    { id: "2", name: "Tech Equipment Inc.", address: "456 Tech Ave, Silicon Valley, CA 90210" },
    { id: "3", name: "Professional Services LLC", address: "789 Service Dr, Metro Town, NY 10001" }
  ]);

  const [items] = useState([
    { id: "1", name: "Office Chairs", cost: 150.00 },
    { id: "2", name: "Laptop Computer", cost: 899.00 },
    { id: "3", name: "Printer Paper", cost: 25.00 },
    { id: "4", name: "Software License", cost: 299.00 },
    { id: "5", name: "Desk Supplies", cost: 45.00 }
  ]);

  const [customers] = useState([
    { id: "1", name: "ABC Company" },
    { id: "2", name: "XYZ Corporation" },
    { id: "3", name: "Tech Solutions Inc." }
  ]);

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, { 
      id: newId, 
      item: "", 
      description: "", 
      qty: 1, 
      cost: 0, 
      amount: 0,
      customer: ""
    }]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-fill item details and calculate amount
        if (field === 'item') {
          const selectedItem = items.find(i => i.name === value);
          if (selectedItem) {
            updatedItem.description = selectedItem.name;
            updatedItem.cost = selectedItem.cost;
            updatedItem.amount = updatedItem.qty * selectedItem.cost;
          }
        } else if (field === 'qty' || field === 'cost') {
          updatedItem.amount = updatedItem.qty * updatedItem.cost;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setPoData(prev => ({
      ...prev,
      vendor: vendorId,
      vendorAddress: vendor ? vendor.address : ""
    }));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const handleSave = () => {
    console.log("Saving purchase order:", { poData, lineItems });
  };

  const handlePrint = () => {
    console.log("Printing purchase order");
  };

  const handleEmail = () => {
    console.log("Emailing purchase order");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Purchase Order</h1>
          <p className="text-gray-600 mt-1">Order items or services from vendors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Purchase Order Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Purchase Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vendor *</label>
                    <select 
                      value={poData.vendor}
                      onChange={(e) => handleVendorChange(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Template</label>
                    <select 
                      value={poData.template}
                      onChange={(e) => setPoData(prev => ({ ...prev, template: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Standard Purchase Order">Standard Purchase Order</option>
                      <option value="Professional Purchase Order">Professional Purchase Order</option>
                      <option value="Service Purchase Order">Service Purchase Order</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input 
                      type="date"
                      value={poData.date}
                      onChange={(e) => setPoData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">P.O. No.</label>
                    <Input 
                      value={poData.poNumber}
                      onChange={(e) => setPoData(prev => ({ ...prev, poNumber: e.target.value }))}
                      placeholder="PO-001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Ship To</label>
                    <textarea 
                      value={poData.shipTo}
                      onChange={(e) => setPoData(prev => ({ ...prev, shipTo: e.target.value }))}
                      className="w-full p-2 border rounded-md h-20"
                      placeholder="Shipping address"
                    />
                  </div>
                </div>
              </div>

              {/* Vendor Address */}
              <div>
                <label className="block text-sm font-medium mb-2">Vendor Address</label>
                <textarea 
                  value={poData.vendorAddress}
                  onChange={(e) => setPoData(prev => ({ ...prev, vendorAddress: e.target.value }))}
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Vendor address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items to Purchase</CardTitle>
                <Button onClick={addLineItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Item</TableHead>
                      <TableHead className="w-[250px]">Description</TableHead>
                      <TableHead className="w-[80px]">Qty</TableHead>
                      <TableHead className="w-[100px]">Cost</TableHead>
                      <TableHead className="w-[150px]">Customer</TableHead>
                      <TableHead className="w-[100px]">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <select 
                            value={item.item}
                            onChange={(e) => updateLineItem(item.id, 'item', e.target.value)}
                            className="w-full p-1 border rounded"
                          >
                            <option value="">Select Item</option>
                            {items.map(i => (
                              <option key={i.id} value={i.name}>{i.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateLineItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            step="0.01"
                            value={item.cost}
                            onChange={(e) => updateLineItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <select 
                            value={item.customer}
                            onChange={(e) => updateLineItem(item.id, 'customer', e.target.value)}
                            className="w-full p-1 border rounded"
                          >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Messages and Memo */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vendor Message</label>
                <textarea 
                  value={poData.vendorMessage}
                  onChange={(e) => setPoData(prev => ({ ...prev, vendorMessage: e.target.value }))}
                  className="w-full p-2 border rounded-md h-16"
                  placeholder="Message to appear on purchase order"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Memo (Internal Use)</label>
                <textarea 
                  value={poData.memo}
                  onChange={(e) => setPoData(prev => ({ ...prev, memo: e.target.value }))}
                  className="w-full p-2 border rounded-md h-16"
                  placeholder="Internal memo (not printed on purchase order)"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Purchase Order Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge className="bg-orange-100 text-orange-800">Draft</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expected:</span>
                  <span className="text-sm">TBD</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Next Steps</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Review order details</li>
                  <li>• Send to vendor for approval</li>
                  <li>• Track delivery status</li>
                  <li>• Receive items when delivered</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Attach File
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Building className="w-4 h-4 mr-2" />
                Find Vendor
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Truck className="w-4 h-4 mr-2" />
                Set Delivery Date
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Purchase Order Tips:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Include detailed item descriptions</li>
                    <li>• Specify delivery dates and locations</li>
                    <li>• Review vendor terms and conditions</li>
                    <li>• Track order status and delivery</li>
                    <li>• Match receipts to orders</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrder;