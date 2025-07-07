import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockCustomers, mockItems } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Plus, 
  Trash2, 
  Save, 
  Receipt, 
  Calculator,
  CreditCard
} from "lucide-react";

const CreateSalesReceipt = () => {
  const [receiptData, setReceiptData] = useState({
    customer: "",
    date: new Date().toISOString().split('T')[0],
    receiptNumber: "SR-" + Date.now(),
    paymentMethod: "cash",
    checkNumber: "",
    memo: "",
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

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setReceiptData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receiptData.items];
    updatedItems[index][field] = value;
    
    if (field === 'qty' || field === 'rate') {
      updatedItems[index].amount = parseFloat(updatedItems[index].qty || 0) * parseFloat(updatedItems[index].rate || 0);
    }
    
    setReceiptData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setReceiptData(prev => ({
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
    if (receiptData.items.length > 1) {
      const updatedItems = receiptData.items.filter((_, i) => i !== index);
      setReceiptData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const calculateSubtotal = () => {
    return receiptData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = () => {
    console.log("Saving sales receipt:", receiptData);
    navigate("/customers");
  };

  const selectedCustomer = mockCustomers.find(c => c.id === receiptData.customer);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Sales Receipt</h1>
          <p className="text-gray-600">Record a cash sale or payment at time of sale</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/customers")}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Receipt Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Sales Receipt Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receipt Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select value={receiptData.customer} onValueChange={(value) => handleInputChange("customer", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Sale No.</Label>
                <Input
                  id="receiptNumber"
                  value={receiptData.receiptNumber}
                  onChange={(e) => handleInputChange("receiptNumber", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={receiptData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={receiptData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {receiptData.paymentMethod === 'check' && (
                <div className="space-y-2">
                  <Label htmlFor="checkNumber">Check No.</Label>
                  <Input
                    id="checkNumber"
                    value={receiptData.checkNumber}
                    onChange={(e) => handleInputChange("checkNumber", e.target.value)}
                    placeholder="Check number"
                  />
                </div>
              )}
            </div>

            {/* Customer Address */}
            {selectedCustomer && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Sold To:</h4>
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
                <h4 className="font-semibold">Items</h4>
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
                    {receiptData.items.map((item, index) => (
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
                            disabled={receiptData.items.length === 1}
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

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo</Label>
              <Input
                id="memo"
                placeholder="Internal memo"
                value={receiptData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Payment Summary
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
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Amount Paid:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Email Receipt
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Receipt Tips</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Use for immediate payment sales</li>
                <li>• Record cash transactions</li>
                <li>• Print receipt for customer</li>
                <li>• Keep for tax records</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateSalesReceipt;