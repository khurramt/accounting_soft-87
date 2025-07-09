import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import invoiceService from "../../services/invoiceService";
import customerService from "../../services/customerService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Printer, 
  FileText,
  Calculator,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  
  const [invoiceData, setInvoiceData] = useState({
    customer: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    invoiceNumber: "INV-" + Date.now(),
    terms: "Net 30",
    memo: "",
    customerMessage: "",
    items: [
      {
        id: 1,
        item: "",
        description: "",
        qty: 1,
        rate: 0,
        amount: 0
      }
    ]
  });

  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load customers and items on component mount
  useEffect(() => {
    if (currentCompany) {
      loadCustomers();
      loadItems();
    }
  }, [currentCompany]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers(currentCompany.company_id);
      setCustomers(response.items || []);
    } catch (err) {
      setError('Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      // Mock items for now - would integrate with items service when available
      const mockItems = [
        { id: '1', name: 'Consulting Services', price: 150.00 },
        { id: '2', name: 'Software Development', price: 100.00 },
        { id: '3', name: 'Project Management', price: 125.00 },
        { id: '4', name: 'Technical Support', price: 75.00 }
      ];
      setItems(mockItems);
    } catch (err) {
      console.error('Error loading items:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = value;
    
    // Calculate amount for quantity and rate changes
    if (field === 'qty' || field === 'rate') {
      updatedItems[index].amount = parseFloat(updatedItems[index].qty || 0) * parseFloat(updatedItems[index].rate || 0);
    }
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        item: "",
        description: "",
        qty: 1,
        rate: 0,
        amount: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const updatedItems = invoiceData.items.filter((_, i) => i !== index);
      setInvoiceData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = async () => {
    if (!currentCompany) {
      setError('No company selected');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!invoiceData.customer) {
        setError('Please select a customer');
        return;
      }

      if (invoiceData.items.length === 0 || !invoiceData.items.some(item => item.item)) {
        setError('Please add at least one item');
        return;
      }

      // Create invoice via API
      const response = await invoiceService.createInvoice(currentCompany.company_id, invoiceData);
      
      console.log('Invoice created successfully:', response);
      navigate("/customers", { 
        state: { 
          message: 'Invoice created successfully',
          type: 'success' 
        }
      });
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.response?.data?.detail || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!currentCompany) {
      setError('No company selected');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!invoiceData.customer) {
        setError('Please select a customer');
        return;
      }

      if (invoiceData.items.length === 0 || !invoiceData.items.some(item => item.item)) {
        setError('Please add at least one item');
        return;
      }

      // Create invoice via API
      const response = await invoiceService.createInvoice(currentCompany.company_id, invoiceData);
      
      // Send invoice email
      await invoiceService.sendInvoiceEmail(currentCompany.company_id, response.transaction_id);
      
      console.log('Invoice created and sent successfully:', response);
      navigate("/customers", { 
        state: { 
          message: 'Invoice created and sent successfully',
          type: 'success' 
        }
      });
    } catch (err) {
      console.error('Error creating/sending invoice:', err);
      setError(err.response?.data?.detail || 'Failed to create and send invoice');
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomer = customers.find(c => c.customer_id === invoiceData.customer);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">Create a new invoice for your customer</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/customers")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSend} className="bg-green-600 hover:bg-green-700">
            <Send className="w-4 h-4 mr-2" />
            Save & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select value={invoiceData.customer} onValueChange={(value) => handleInputChange("customer", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customer_id} value={customer.customer_id}>
                        {customer.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoiceData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="terms">Terms</Label>
                <Select value={invoiceData.terms} onValueChange={(value) => handleInputChange("terms", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer Address */}
            {selectedCustomer && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Bill To:</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p>{selectedCustomer.address}</p>
                  <p>{selectedCustomer.email}</p>
                  <p>{selectedCustomer.phone}</p>
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Line Items</h4>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Qty</TableHead>
                      <TableHead className="w-24">Rate</TableHead>
                      <TableHead className="w-24">Amount</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceData.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="p-2">
                          <Select 
                            value={item.item} 
                            onValueChange={(value) => handleItemChange(index, "item", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockItems.map((mockItem) => (
                                <SelectItem key={mockItem.id} value={mockItem.name}>
                                  {mockItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, "qty", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={invoiceData.items.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerMessage">Customer Message</Label>
                <Textarea
                  id="customerMessage"
                  placeholder="Message to customer (appears on invoice)"
                  value={invoiceData.customerMessage}
                  onChange={(e) => handleInputChange("customerMessage", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Textarea
                  id="memo"
                  placeholder="Internal memo (not visible to customer)"
                  value={invoiceData.memo}
                  onChange={(e) => handleInputChange("memo", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span className="font-medium">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Preview
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Save as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Send
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Invoice Tips</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Include detailed descriptions</li>
                <li>• Set appropriate payment terms</li>
                <li>• Add your logo for branding</li>
                <li>• Include payment instructions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateInvoice;