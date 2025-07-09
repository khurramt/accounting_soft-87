import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import paymentService from "../../services/paymentService";
import invoiceService from "../../services/invoiceService";
import customerService from "../../services/customerService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  DollarSign, 
  Save, 
  CreditCard,
  Check,
  Calculator,
  Receipt,
  Loader2,
  AlertCircle
} from "lucide-react";

const ReceivePayment = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  
  const [paymentData, setPaymentData] = useState({
    customer: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "check",
    referenceNumber: "",
    depositTo: "checking",
    amount: 0,
    selectedInvoices: []
  });

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load customers on component mount
  useEffect(() => {
    if (currentCompany) {
      loadCustomers();
    }
  }, [currentCompany]);

  // Load customer invoices when customer is selected
  useEffect(() => {
    if (currentCompany && paymentData.customer) {
      loadCustomerInvoices();
    } else {
      setInvoices([]);
    }
  }, [currentCompany, paymentData.customer]);

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

  const loadCustomerInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getOutstandingInvoices(currentCompany.company_id, paymentData.customer);
      setInvoices(response.items || []);
    } catch (err) {
      setError('Failed to load customer invoices');
      console.error('Error loading customer invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInvoiceSelection = (invoiceId, amount) => {
    setPaymentData(prev => ({
      ...prev,
      selectedInvoices: prev.selectedInvoices.some(inv => inv.id === invoiceId)
        ? prev.selectedInvoices.filter(inv => inv.id !== invoiceId)
        : [...prev.selectedInvoices, { id: invoiceId, amount }]
    }));
  };

  const calculateTotalPayment = () => {
    return paymentData.selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  };

  const selectedCustomer = mockCustomers.find(c => c.id === paymentData.customer);
  const customerInvoices = mockInvoices.filter(inv => inv.customer === selectedCustomer?.name);

  const handleSave = () => {
    console.log("Saving payment:", paymentData);
    navigate("/customers");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receive Payment</h1>
          <p className="text-gray-600">Record a payment from your customer</p>
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
        {/* Payment Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Received From *</Label>
                <Select value={paymentData.customer} onValueChange={(value) => handleInputChange("customer", value)}>
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
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={paymentData.referenceNumber}
                  onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
                  placeholder="Check number, transaction ID, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="depositTo">Deposit To</Label>
                <Select value={paymentData.depositTo} onValueChange={(value) => handleInputChange("depositTo", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="petty_cash">Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Outstanding Invoices */}
            {selectedCustomer && (
              <div className="space-y-4">
                <h4 className="font-semibold">Outstanding Invoices</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">✓</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Original Amount</TableHead>
                        <TableHead>Amount Due</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={paymentData.selectedInvoices.some(inv => inv.id === invoice.id)}
                              onChange={() => handleInvoiceSelection(invoice.id, invoice.amount)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.number}</TableCell>
                          <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                          <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-24"
                              disabled={!paymentData.selectedInvoices.some(inv => inv.id === invoice.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
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
                <span>Amount Received:</span>
                <span className="font-medium">${calculateTotalPayment().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Credits Applied:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Applied:</span>
                  <span>${calculateTotalPayment().toFixed(2)}</span>
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
                  Process Credit Card
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Check className="w-4 h-4 mr-2" />
                  Print Deposit Slip
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Payment Tips</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Record payments as soon as received</li>
                <li>• Match payments to specific invoices</li>
                <li>• Keep reference numbers for tracking</li>
                <li>• Deposit funds promptly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceivePayment;