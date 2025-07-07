import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Receipt,
  Plus,
  Trash2,
  Calculator,
  Save,
  Printer,
  Mail,
  Copy,
  RefreshCw,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle
} from "lucide-react";

const CreateCreditMemo = () => {
  const [creditMemoData, setCreditMemoData] = useState({
    customer: "",
    class: "",
    template: "Standard Credit Memo",
    date: new Date().toISOString().split('T')[0],
    creditMemoNo: "CM-001",
    refNo: "",
    billTo: "",
    customerMessage: "",
    memo: "",
    creditApplication: "retain" // retain, refund, apply
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, item: "", description: "", qty: 1, rate: 0, amount: 0, taxCode: "Tax" }
  ]);

  const [customers] = useState([
    { id: "1", name: "ABC Company", address: "123 Main St, City, ST 12345" },
    { id: "2", name: "XYZ Corporation", address: "456 Oak Ave, Town, ST 67890" },
    { id: "3", name: "Tech Solutions Inc.", address: "789 Tech Dr, Metro, ST 11111" }
  ]);

  const [items] = useState([
    { id: "1", name: "Service - Consulting", rate: 150.00 },
    { id: "2", name: "Product - Software License", rate: 299.00 },
    { id: "3", name: "Service - Training", rate: 75.00 },
    { id: "4", name: "Product - Hardware", rate: 450.00 }
  ]);

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, { 
      id: newId, 
      item: "", 
      description: "", 
      qty: 1, 
      rate: 0, 
      amount: 0, 
      taxCode: "Tax" 
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
            updatedItem.rate = selectedItem.rate;
            updatedItem.amount = updatedItem.qty * selectedItem.rate;
          }
        } else if (field === 'qty' || field === 'rate') {
          updatedItem.amount = updatedItem.qty * updatedItem.rate;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setCreditMemoData(prev => ({
      ...prev,
      customer: customerId,
      billTo: customer ? customer.address : ""
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
    console.log("Saving credit memo:", { creditMemoData, lineItems });
  };

  const handlePrint = () => {
    console.log("Printing credit memo");
  };

  const handleEmail = () => {
    console.log("Emailing credit memo");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Credit Memo</h1>
          <p className="text-gray-600 mt-1">Issue a credit memo for returned items or adjustments</p>
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
        {/* Main Credit Memo Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Credit Memo Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer/Job *</label>
                    <select 
                      value={creditMemoData.customer}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <select 
                      value={creditMemoData.class}
                      onChange={(e) => setCreditMemoData(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Class</option>
                      <option value="Service">Service</option>
                      <option value="Product">Product</option>
                      <option value="Consulting">Consulting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Template</label>
                    <select 
                      value={creditMemoData.template}
                      onChange={(e) => setCreditMemoData(prev => ({ ...prev, template: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Standard Credit Memo">Standard Credit Memo</option>
                      <option value="Professional Credit Memo">Professional Credit Memo</option>
                      <option value="Service Credit Memo">Service Credit Memo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input 
                      type="date"
                      value={creditMemoData.date}
                      onChange={(e) => setCreditMemoData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Credit Memo No.</label>
                    <Input 
                      value={creditMemoData.creditMemoNo}
                      onChange={(e) => setCreditMemoData(prev => ({ ...prev, creditMemoNo: e.target.value }))}
                      placeholder="CM-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reference No.</label>
                    <Input 
                      value={creditMemoData.refNo}
                      onChange={(e) => setCreditMemoData(prev => ({ ...prev, refNo: e.target.value }))}
                      placeholder="Reference number"
                    />
                  </div>
                </div>
              </div>

              {/* Bill To Address */}
              <div>
                <label className="block text-sm font-medium mb-2">Bill To</label>
                <textarea 
                  value={creditMemoData.billTo}
                  onChange={(e) => setCreditMemoData(prev => ({ ...prev, billTo: e.target.value }))}
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Customer billing address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items</CardTitle>
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
                      <TableHead className="w-[100px]">Rate</TableHead>
                      <TableHead className="w-[100px]">Amount</TableHead>
                      <TableHead className="w-[80px]">Tax</TableHead>
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
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <select 
                            value={item.taxCode}
                            onChange={(e) => updateLineItem(item.id, 'taxCode', e.target.value)}
                            className="w-full p-1 border rounded"
                          >
                            <option value="Tax">Tax</option>
                            <option value="Non">Non</option>
                          </select>
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
                <label className="block text-sm font-medium mb-2">Customer Message</label>
                <textarea 
                  value={creditMemoData.customerMessage}
                  onChange={(e) => setCreditMemoData(prev => ({ ...prev, customerMessage: e.target.value }))}
                  className="w-full p-2 border rounded-md h-16"
                  placeholder="Message to appear on credit memo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Memo (Internal Use)</label>
                <textarea 
                  value={creditMemoData.memo}
                  onChange={(e) => setCreditMemoData(prev => ({ ...prev, memo: e.target.value }))}
                  className="w-full p-2 border rounded-md h-16"
                  placeholder="Internal memo (not printed on credit memo)"
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
                Credit Memo Totals
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
                <span>Total Credit:</span>
                <span className="text-red-600">-${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Credit Application */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Credit Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="creditApplication"
                    value="retain"
                    checked={creditMemoData.creditApplication === 'retain'}
                    onChange={(e) => setCreditMemoData(prev => ({ ...prev, creditApplication: e.target.value }))}
                  />
                  <span className="text-sm">Retain as available credit</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="creditApplication"
                    value="refund"
                    checked={creditMemoData.creditApplication === 'refund'}
                    onChange={(e) => setCreditMemoData(prev => ({ ...prev, creditApplication: e.target.value }))}
                  />
                  <span className="text-sm">Give a refund</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="creditApplication"
                    value="apply"
                    checked={creditMemoData.creditApplication === 'apply'}
                    onChange={(e) => setCreditMemoData(prev => ({ ...prev, creditApplication: e.target.value }))}
                  />
                  <span className="text-sm">Apply to an invoice</span>
                </label>
              </div>

              {creditMemoData.creditApplication === 'apply' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Select Invoice</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Select Invoice</option>
                    <option value="INV-001">INV-001 - $1,500.00</option>
                    <option value="INV-002">INV-002 - $2,250.00</option>
                  </select>
                </div>
              )}
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
                <User className="w-4 h-4 mr-2" />
                Find Customer
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Credit Memo Tips:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Use for returns or billing adjustments</li>
                    <li>• Credits can be applied to future invoices</li>
                    <li>• Track refunds for accurate records</li>
                    <li>• Include detailed descriptions</li>
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

export default CreateCreditMemo;