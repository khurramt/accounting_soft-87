import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  FileText, Plus, Trash2, Calculator, Send, Save, 
  Copy, Eye, User, Calendar, DollarSign
} from 'lucide-react';

const CreateEstimate = () => {
  const [estimateData, setEstimateData] = useState({
    customer: '',
    estimateNumber: 'EST-001',
    date: new Date().toISOString().split('T')[0],
    expirationDate: '',
    template: 'Standard',
    status: 'Draft',
    terms: 'Net 30',
    salesRep: '',
    customerMessage: '',
    memo: '',
    acceptanceTerms: 'This estimate is valid for 30 days from the date of issue.'
  });

  const [lineItems, setLineItems] = useState([
    {
      id: 1,
      item: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      taxable: true
    }
  ]);

  const [customers] = useState([
    { id: 1, name: 'ABC Corporation', email: 'billing@abc.com' },
    { id: 2, name: 'XYZ Industries', email: 'ap@xyz.com' },
    { id: 3, name: 'Smith & Associates', email: 'info@smith.com' }
  ]);

  const [items] = useState([
    { id: 1, name: 'Consulting Services', rate: 150.00, description: 'Professional consulting services' },
    { id: 2, name: 'Web Development', rate: 125.00, description: 'Website development and design' },
    { id: 3, name: 'Project Management', rate: 100.00, description: 'Project management services' },
    { id: 4, name: 'Training Sessions', rate: 200.00, description: 'Staff training and workshops' }
  ]);

  const updateEstimateData = (field, value) => {
    setEstimateData(prev => ({ ...prev, [field]: value }));
  };

  const addLineItem = () => {
    const newItem = {
      id: lineItems.length + 1,
      item: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      taxable: true
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const deleteLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const selectItem = (lineId, selectedItem) => {
    updateLineItem(lineId, 'item', selectedItem.name);
    updateLineItem(lineId, 'description', selectedItem.description);
    updateLineItem(lineId, 'rate', selectedItem.rate);
    // Recalculate amount
    const lineItem = lineItems.find(item => item.id === lineId);
    if (lineItem) {
      updateLineItem(lineId, 'amount', lineItem.quantity * selectedItem.rate);
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    const taxableAmount = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.amount, 0);
    return taxableAmount * 0.0825; // 8.25% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const saveEstimate = () => {
    console.log('Saving estimate:', { estimateData, lineItems });
    alert('Estimate saved successfully!');
  };

  const previewEstimate = () => {
    alert('Opening estimate preview...');
  };

  const sendEstimate = () => {
    alert('Sending estimate to customer...');
  };

  const convertToInvoice = () => {
    alert('Converting estimate to invoice...');
  };

  const duplicateEstimate = () => {
    alert('Creating duplicate estimate...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Estimate</h1>
          <p className="text-gray-600">Prepare a professional estimate for your customer</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={previewEstimate} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveEstimate} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={sendEstimate} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estimate Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Estimate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <select
                    value={estimateData.customer}
                    onChange={(e) => updateEstimateData('customer', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.name}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimate #
                  </label>
                  <Input
                    value={estimateData.estimateNumber}
                    onChange={(e) => updateEstimateData('estimateNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimate Date
                  </label>
                  <Input
                    type="date"
                    value={estimateData.date}
                    onChange={(e) => updateEstimateData('date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <Input
                    type="date"
                    value={estimateData.expirationDate}
                    onChange={(e) => updateEstimateData('expirationDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <select
                    value={estimateData.template}
                    onChange={(e) => updateEstimateData('template', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Professional">Professional</option>
                    <option value="Detailed">Detailed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Rep
                  </label>
                  <Input
                    value={estimateData.salesRep}
                    onChange={(e) => updateEstimateData('salesRep', e.target.value)}
                    placeholder="Enter sales representative"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button onClick={addLineItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-1/4">Item</th>
                      <th className="text-left p-2 w-2/5">Description</th>
                      <th className="text-left p-2 w-16">Qty</th>
                      <th className="text-left p-2 w-20">Rate</th>
                      <th className="text-left p-2 w-20">Amount</th>
                      <th className="text-left p-2 w-16">Tax</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">
                          <select
                            value={item.item}
                            onChange={(e) => {
                              const selectedItem = items.find(i => i.name === e.target.value);
                              if (selectedItem) {
                                selectItem(item.id, selectedItem);
                              } else {
                                updateLineItem(item.id, 'item', e.target.value);
                              }
                            }}
                            className="w-full p-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">Select Item</option>
                            {items.map(availableItem => (
                              <option key={availableItem.id} value={availableItem.name}>
                                {availableItem.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            className="text-sm"
                            placeholder="Description"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="text-sm w-16"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="text-sm w-20"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="p-2">
                          <span className="text-sm font-medium">
                            ${item.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => updateLineItem(item.id, 'taxable', e.target.checked)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLineItem(item.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Customer Message & Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Message
                </label>
                <Textarea
                  value={estimateData.customerMessage}
                  onChange={(e) => updateEstimateData('customerMessage', e.target.value)}
                  placeholder="Message to display on estimate"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acceptance Terms
                </label>
                <Textarea
                  value={estimateData.acceptanceTerms}
                  onChange={(e) => updateEstimateData('acceptanceTerms', e.target.value)}
                  placeholder="Terms and conditions for estimate acceptance"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memo (Internal Use)
                </label>
                <Textarea
                  value={estimateData.memo}
                  onChange={(e) => updateEstimateData('memo', e.target.value)}
                  placeholder="Internal notes (will not appear on estimate)"
                  rows="2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estimate Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Estimate Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (8.25%):</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="secondary">{estimateData.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span>{estimateData.expirationDate || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={convertToInvoice} className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Convert to Invoice
              </Button>
              <Button onClick={duplicateEstimate} className="w-full" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Estimate
              </Button>
              <Button className="w-full" variant="outline">
                <User className="w-4 h-4 mr-2" />
                Customer Portal Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimate History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Created today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>Total: ${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateEstimate;