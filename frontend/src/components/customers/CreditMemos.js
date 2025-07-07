import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Copy,
  Calculator,
  FileText,
  CreditCard,
  DollarSign,
  Percent,
  RefreshCw,
  User,
  Building,
  Calendar,
  Hash,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";

const CreditMemos = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer: "",
    class: "",
    template: "standard",
    date: new Date().toISOString().split('T')[0],
    creditNumber: "CM-001",
    referenceNumber: "",
    billToAddress: "",
    memo: "",
    customerMessage: ""
  });

  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      item: "",
      description: "",
      qty: "",
      rate: "",
      amount: "",
      taxCode: "",
      customer: "",
      class: ""
    }
  ]);

  const [creditApplication, setCreditApplication] = useState({
    method: "retain", // retain, refund, apply
    selectedInvoices: [],
    refundMethod: "check",
    refundAmount: ""
  });

  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Mock data
  const [customers] = useState([
    { id: "1", name: "ABC Company", address: "123 Business St, New York, NY 10001" },
    { id: "2", name: "XYZ Corporation", address: "456 Corporate Blvd, Los Angeles, CA 90210" },
    { id: "3", name: "Johnson & Associates", address: "789 Professional Way, Chicago, IL 60601" },
    { id: "4", name: "Smith Enterprises", address: "321 Enterprise Dr, Houston, TX 77001" }
  ]);

  const [items] = useState([
    { id: "1", name: "Consulting Services", description: "Professional consulting services", rate: 150.00, taxCode: "TAX" },
    { id: "2", name: "Software License", description: "Annual software licensing", rate: 299.00, taxCode: "TAX" },
    { id: "3", name: "Training Services", description: "Employee training programs", rate: 75.00, taxCode: "TAX" },
    { id: "4", name: "Support Services", description: "Technical support services", rate: 100.00, taxCode: "NON" }
  ]);

  const [taxCodes] = useState([
    { id: "TAX", name: "TAX - Taxable", rate: 8.25 },
    { id: "NON", name: "NON - Non-taxable", rate: 0 },
    { id: "OUT", name: "OUT - Out of state", rate: 0 }
  ]);

  const [classes] = useState([
    { id: "1", name: "Operations" },
    { id: "2", name: "Marketing" },
    { id: "3", name: "Administration" },
    { id: "4", name: "Sales" }
  ]);

  const [templates] = useState([
    { id: "standard", name: "Standard Credit Memo" },
    { id: "detailed", name: "Detailed Credit Memo" },
    { id: "service", name: "Service Credit Memo" }
  ]);

  // Mock outstanding invoices for the selected customer
  const [outstandingInvoices] = useState([
    {
      id: "INV-001",
      date: "2024-01-15",
      amount: 1500.00,
      balance: 1500.00,
      terms: "Net 30",
      dueDate: "2024-02-14"
    },
    {
      id: "INV-002", 
      date: "2024-01-10",
      amount: 2750.50,
      balance: 2750.50,
      terms: "Net 30",
      dueDate: "2024-02-09"
    },
    {
      id: "INV-003",
      date: "2023-12-20",
      amount: 890.00,
      balance: 890.00,
      terms: "Net 15",
      dueDate: "2024-01-04"
    }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLineItem = () => {
    const newItem = {
      id: Math.max(...lineItems.map(item => item.id)) + 1,
      item: "",
      description: "",
      qty: "",
      rate: "",
      amount: "",
      taxCode: "",
      customer: "",
      class: ""
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-populate item details when item is selected
        if (field === 'item' && value) {
          const selectedItem = items.find(i => i.id === value);
          if (selectedItem) {
            updatedItem.description = selectedItem.description;
            updatedItem.rate = selectedItem.rate.toFixed(2);
            updatedItem.taxCode = selectedItem.taxCode;
          }
        }
        
        // Auto-calculate amount when qty or rate changes
        if ((field === 'qty' || field === 'rate') && updatedItem.qty && updatedItem.rate) {
          updatedItem.amount = (parseFloat(updatedItem.qty) * parseFloat(updatedItem.rate)).toFixed(2);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const newSubtotal = lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);

    const newTaxAmount = lineItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      const taxCode = taxCodes.find(code => code.id === item.taxCode);
      const taxRate = taxCode ? taxCode.rate : 0;
      return sum + (amount * taxRate / 100);
    }, 0);

    const newTotal = newSubtotal + newTaxAmount;

    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setTotal(newTotal);
  };

  React.useEffect(() => {
    calculateTotals();
  }, [lineItems]);

  const handleInvoiceToggle = (invoiceId) => {
    setCreditApplication(prev => ({
      ...prev,
      selectedInvoices: prev.selectedInvoices.includes(invoiceId)
        ? prev.selectedInvoices.filter(id => id !== invoiceId)
        : [...prev.selectedInvoices, invoiceId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSave = () => {
    console.log("Saving credit memo:", {
      formData,
      lineItems,
      creditApplication,
      totals: { subtotal, taxAmount, total }
    });
    navigate('/customers');
  };

  const selectedCustomer = customers.find(c => c.id === formData.customer);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Credit Memo</h1>
            <p className="text-gray-600">Issue credit for returned items or billing adjustments</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {formData.creditNumber}
          </Badge>
          <Badge variant="secondary">
            Credit Amount: {formatCurrency(total)}
          </Badge>
        </div>
      </div>

      {/* Credit Memo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Credit Memo Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer">Customer/Job *</Label>
              <Select value={formData.customer} onValueChange={(value) => {
                handleInputChange('customer', value);
                const customer = customers.find(c => c.id === value);
                if (customer) {
                  handleInputChange('billToAddress', customer.address);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={formData.template} onValueChange={(value) => handleInputChange('template', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="creditNumber">Credit No. *</Label>
              <Input
                id="creditNumber"
                value={formData.creditNumber}
                onChange={(e) => handleInputChange('creditNumber', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                placeholder="Return authorization, etc."
              />
            </div>
          </div>

          {selectedCustomer && (
            <div className="mt-4">
              <Label htmlFor="billToAddress">Bill To Address</Label>
              <Textarea
                id="billToAddress"
                value={formData.billToAddress}
                onChange={(e) => handleInputChange('billToAddress', e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Credit Items
            </div>
            <Button size="sm" onClick={addLineItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Line
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Customer/Job</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Select
                      value={item.item}
                      onValueChange={(value) => updateLineItem(item.id, 'item', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((availableItem) => (
                          <SelectItem key={availableItem.id} value={availableItem.id}>
                            {availableItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-48"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)}
                      placeholder="1"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                      placeholder="0.00"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => updateLineItem(item.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.taxCode}
                      onValueChange={(value) => updateLineItem(item.id, 'taxCode', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Tax" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxCodes.map((taxCode) => (
                          <SelectItem key={taxCode.id} value={taxCode.id}>
                            {taxCode.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.customer}
                      onValueChange={(value) => updateLineItem(item.id, 'customer', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.class}
                      onValueChange={(value) => updateLineItem(item.id, 'class', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
        </CardContent>
      </Card>

      {/* Totals and Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerMessage">Customer Message</Label>
              <Textarea
                id="customerMessage"
                value={formData.customerMessage}
                onChange={(e) => handleInputChange('customerMessage', e.target.value)}
                placeholder="Message to appear on credit memo"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="memo">Memo (Internal Use)</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                placeholder="Internal notes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Credit Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Credit:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Application */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Credit Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="retain"
                  name="creditApplication"
                  value="retain"
                  checked={creditApplication.method === "retain"}
                  onChange={(e) => setCreditApplication(prev => ({ ...prev, method: e.target.value }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="retain">Retain as an available credit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="refund"
                  name="creditApplication"
                  value="refund"
                  checked={creditApplication.method === "refund"}
                  onChange={(e) => setCreditApplication(prev => ({ ...prev, method: e.target.value }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="refund">Give a refund</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="apply"
                  name="creditApplication"
                  value="apply"
                  checked={creditApplication.method === "apply"}
                  onChange={(e) => setCreditApplication(prev => ({ ...prev, method: e.target.value }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="apply">Apply to an invoice</Label>
              </div>
            </div>

            {creditApplication.method === "refund" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Refund Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="refundMethod">Refund Method</Label>
                      <Select 
                        value={creditApplication.refundMethod} 
                        onValueChange={(value) => setCreditApplication(prev => ({ ...prev, refundMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="ach">ACH Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="refundAmount">Refund Amount</Label>
                      <Input
                        id="refundAmount"
                        type="number"
                        step="0.01"
                        value={creditApplication.refundAmount || total.toFixed(2)}
                        onChange={(e) => setCreditApplication(prev => ({ ...prev, refundAmount: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {creditApplication.method === "apply" && formData.customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Apply to Outstanding Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Apply</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Credit Applied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={creditApplication.selectedInvoices.includes(invoice.id)}
                              onChange={() => handleInvoiceToggle(invoice.id)}
                              className="w-4 h-4 rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.balance)}</TableCell>
                          <TableCell className="text-right">
                            {creditApplication.selectedInvoices.includes(invoice.id) && (
                              <Input
                                type="number"
                                step="0.01"
                                max={Math.min(invoice.balance, total)}
                                placeholder="0.00"
                                className="w-24 text-right"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {outstandingInvoices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>No outstanding invoices found for this customer</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Credit memo will be saved and {
                creditApplication.method === "retain" ? "retained as available credit" :
                creditApplication.method === "refund" ? "processed as a refund" :
                "applied to selected invoices"
              }
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/customers')}>
                Cancel
              </Button>
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Save & New
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save & Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditMemos;