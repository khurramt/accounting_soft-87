import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Users,
  Printer,
  Mail,
  Eye,
  Download,
  Settings,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Building,
  Phone,
  MapPin
} from "lucide-react";

const CustomerStatements = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    statementDate: new Date().toISOString().split('T')[0],
    periodFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    periodTo: new Date().toISOString().split('T')[0],
    template: "standard",
    customerSelection: "all", // all, multiple, one
    selectedCustomers: [],
    showInvoiceDetails: true,
    printDueDates: true,
    sortByZipCode: false,
    includeZeroBalances: false,
    onlyOverdue: false
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Mock customers data
  const [customers] = useState([
    {
      id: "1",
      name: "ABC Company",
      contactName: "John Smith",
      address: "123 Business St, Suite 100",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phone: "(555) 123-4567",
      email: "john@abccompany.com",
      currentBalance: 4250.50,
      past30: 1500.00,
      past60: 750.00,
      past90: 500.00,
      over90: 0.00,
      lastPayment: "2024-01-10",
      creditLimit: 10000.00
    },
    {
      id: "2",
      name: "XYZ Corporation",
      contactName: "Jane Doe",
      address: "456 Corporate Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      phone: "(555) 234-5678",
      email: "jane@xyzcorp.com",
      currentBalance: 2800.00,
      past30: 2800.00,
      past60: 0.00,
      past90: 0.00,
      over90: 0.00,
      lastPayment: "2024-01-05",
      creditLimit: 15000.00
    },
    {
      id: "3",
      name: "Johnson & Associates",
      contactName: "Mike Johnson",
      address: "789 Professional Way",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      phone: "(555) 345-6789",
      email: "mike@johnsonassoc.com",
      currentBalance: 1950.00,
      past30: 0.00,
      past60: 1200.00,
      past90: 750.00,
      over90: 0.00,
      lastPayment: "2023-12-15",
      creditLimit: 8000.00
    },
    {
      id: "4",
      name: "Smith Enterprises",
      contactName: "Sarah Smith",
      address: "321 Enterprise Dr",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      phone: "(555) 456-7890",
      email: "sarah@smithent.com",
      currentBalance: 0.00,
      past30: 0.00,
      past60: 0.00,
      past90: 0.00,
      over90: 0.00,
      lastPayment: "2024-01-12",
      creditLimit: 5000.00
    }
  ]);

  // Mock statement transactions
  const [statementTransactions] = useState([
    {
      id: "1",
      customerId: "1",
      date: "2024-01-15",
      type: "Invoice",
      number: "INV-001",
      poNumber: "PO-2024-001",
      terms: "Net 30",
      dueDate: "2024-02-14",
      amount: 1500.00,
      balance: 1500.00,
      aging: "Current"
    },
    {
      id: "2",
      customerId: "1",
      date: "2024-01-10",
      type: "Invoice",
      number: "INV-002",
      poNumber: "",
      terms: "Net 30",
      dueDate: "2024-02-09",
      amount: 2750.50,
      balance: 2750.50,
      aging: "Current"
    },
    {
      id: "3",
      customerId: "1",
      date: "2023-12-15",
      type: "Payment",
      number: "PMT-001",
      poNumber: "",
      terms: "",
      dueDate: "",
      amount: -1200.00,
      balance: -1200.00,
      aging: ""
    },
    {
      id: "4",
      customerId: "2",
      date: "2024-01-12",
      type: "Invoice",
      number: "INV-003",
      poNumber: "PO-2024-002",
      terms: "Net 15",
      dueDate: "2024-01-27",
      amount: 2800.00,
      balance: 2800.00,
      aging: "Current"
    }
  ]);

  const [templates] = useState([
    { id: "standard", name: "Standard Statement", description: "Default statement format" },
    { id: "detailed", name: "Detailed Statement", description: "Includes item details" },
    { id: "summary", name: "Summary Statement", description: "Summary format only" },
    { id: "aging", name: "Aging Statement", description: "Focus on aging analysis" }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerToggle = (customerId) => {
    if (formData.customerSelection === "multiple") {
      setFormData(prev => ({
        ...prev,
        selectedCustomers: prev.selectedCustomers.includes(customerId)
          ? prev.selectedCustomers.filter(id => id !== customerId)
          : [...prev.selectedCustomers, customerId]
      }));
    } else if (formData.customerSelection === "one") {
      setFormData(prev => ({
        ...prev,
        selectedCustomers: [customerId]
      }));
    }
  };

  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      if (formData.includeZeroBalances === false && customer.currentBalance === 0) {
        return false;
      }
      if (formData.onlyOverdue && (customer.past30 + customer.past60 + customer.past90 + customer.over90) === 0) {
        return false;
      }
      return true;
    });
  };

  const getCustomersToProcess = () => {
    const filtered = getFilteredCustomers();
    
    switch (formData.customerSelection) {
      case "all":
        return filtered;
      case "multiple":
        return filtered.filter(customer => formData.selectedCustomers.includes(customer.id));
      case "one":
        return filtered.filter(customer => formData.selectedCustomers.includes(customer.id));
      default:
        return [];
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getAgingColor = (aging) => {
    switch (aging) {
      case "Current": return "text-green-600";
      case "1-30": return "text-yellow-600";
      case "31-60": return "text-orange-600";
      case "61-90": return "text-red-600";
      case "Over 90": return "text-red-800";
      default: return "text-gray-600";
    }
  };

  const handlePreview = () => {
    setPreviewMode(true);
    const customers = getCustomersToProcess();
    if (customers.length > 0) {
      setSelectedCustomer(customers[0]);
    }
  };

  const handlePrint = () => {
    console.log("Printing statements for customers:", getCustomersToProcess());
    // Implement print functionality
  };

  const handleEmail = () => {
    console.log("Emailing statements for customers:", getCustomersToProcess());
    // Implement email functionality
  };

  const generateStatement = (customer) => {
    const customerTransactions = statementTransactions.filter(t => t.customerId === customer.id);
    
    return (
      <div className="bg-white p-8 border rounded-lg shadow-sm">
        {/* Statement Header */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">STATEMENT</h2>
            <div className="space-y-1">
              <div><strong>Your Company Name</strong></div>
              <div>123 Business Street</div>
              <div>City, State 12345</div>
              <div>Phone: (555) 123-4567</div>
            </div>
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <div><strong>Statement Date:</strong> {formData.statementDate}</div>
              <div><strong>Period:</strong> {formData.periodFrom} to {formData.periodTo}</div>
              <div><strong>Customer ID:</strong> {customer.id}</div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <div className="space-y-1">
            <div className="font-medium">{customer.name}</div>
            {customer.contactName && <div>{customer.contactName}</div>}
            <div>{customer.address}</div>
            <div>{customer.city}, {customer.state} {customer.zipCode}</div>
            {customer.phone && <div>{customer.phone}</div>}
          </div>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-5 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600">Current</div>
            <div className="font-bold text-green-600">{formatCurrency(customer.currentBalance - customer.past30 - customer.past60 - customer.past90 - customer.over90)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">1-30 Days</div>
            <div className="font-bold text-yellow-600">{formatCurrency(customer.past30)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">31-60 Days</div>
            <div className="font-bold text-orange-600">{formatCurrency(customer.past60)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">61-90 Days</div>
            <div className="font-bold text-red-600">{formatCurrency(customer.past90)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Over 90 Days</div>
            <div className="font-bold text-red-800">{formatCurrency(customer.over90)}</div>
          </div>
        </div>

        <div className="text-right mb-6">
          <div className="text-xl font-bold">
            Total Amount Due: {formatCurrency(customer.currentBalance)}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Number</TableHead>
                {formData.showInvoiceDetails && <TableHead>P.O. Number</TableHead>}
                {formData.printDueDates && <TableHead>Due Date</TableHead>}
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.number}</TableCell>
                  {formData.showInvoiceDetails && <TableCell>{transaction.poNumber}</TableCell>}
                  {formData.printDueDates && <TableCell>{transaction.dueDate}</TableCell>}
                  <TableCell className={`text-right ${transaction.amount >= 0 ? 'text-black' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '' : '-'}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(transaction.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          <p>Thank you for your business! Please remit payment by the due date to avoid late fees.</p>
          <p>Questions about your statement? Contact us at accounting@yourcompany.com or (555) 123-4567</p>
        </div>
      </div>
    );
  };

  if (previewMode) {
    return (
      <div className="p-6 space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Statement Preview</h1>
              <p className="text-gray-600">Review statement before printing or emailing</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedCustomer?.id} onValueChange={(value) => {
              const customer = getCustomersToProcess().find(c => c.id === value);
              setSelectedCustomer(customer);
            }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select customer to preview" />
              </SelectTrigger>
              <SelectContent>
                {getCustomersToProcess().map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print All
            </Button>
            <Button onClick={handleEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email All
            </Button>
          </div>
        </div>

        {/* Statement Preview */}
        {selectedCustomer && (
          <Card>
            <CardContent className="p-0">
              {generateStatement(selectedCustomer)}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Customer Statements</h1>
            <p className="text-gray-600">Generate and send customer account statements</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {getCustomersToProcess().length} customers selected
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statement Options */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Statement Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="statementDate">Statement Date</Label>
                <Input
                  id="statementDate"
                  type="date"
                  value={formData.statementDate}
                  onChange={(e) => handleInputChange('statementDate', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="periodFrom">Period From</Label>
                  <Input
                    id="periodFrom"
                    type="date"
                    value={formData.periodFrom}
                    onChange={(e) => handleInputChange('periodFrom', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="periodTo">Period To</Label>
                  <Input
                    id="periodTo"
                    type="date"
                    value={formData.periodTo}
                    onChange={(e) => handleInputChange('periodTo', e.target.value)}
                  />
                </div>
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
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Customer Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="allCustomers"
                    name="customerSelection"
                    value="all"
                    checked={formData.customerSelection === "all"}
                    onChange={(e) => handleInputChange('customerSelection', e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="allCustomers">All Customers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="multipleCustomers"
                    name="customerSelection"
                    value="multiple"
                    checked={formData.customerSelection === "multiple"}
                    onChange={(e) => handleInputChange('customerSelection', e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="multipleCustomers">Multiple Customers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="oneCustomer"
                    name="customerSelection"
                    value="one"
                    checked={formData.customerSelection === "one"}
                    onChange={(e) => handleInputChange('customerSelection', e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="oneCustomer">One Customer</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Additional Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showInvoiceDetails"
                  checked={formData.showInvoiceDetails}
                  onChange={(e) => handleInputChange('showInvoiceDetails', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="showInvoiceDetails">Show invoice item details</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="printDueDates"
                  checked={formData.printDueDates}
                  onChange={(e) => handleInputChange('printDueDates', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="printDueDates">Print due date on transactions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sortByZipCode"
                  checked={formData.sortByZipCode}
                  onChange={(e) => handleInputChange('sortByZipCode', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="sortByZipCode">Sort by billing address zip code</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeZeroBalances"
                  checked={formData.includeZeroBalances}
                  onChange={(e) => handleInputChange('includeZeroBalances', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="includeZeroBalances">Include zero balance customers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="onlyOverdue"
                  checked={formData.onlyOverdue}
                  onChange={(e) => handleInputChange('onlyOverdue', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="onlyOverdue">Only overdue customers</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Customer List
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {getFilteredCustomers().length} customers
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.customerSelection !== "all" && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    {formData.customerSelection === "multiple" 
                      ? "Select multiple customers by clicking the checkboxes"
                      : "Select one customer by clicking the radio button"
                    }
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    {formData.customerSelection !== "all" && (
                      <TableHead className="w-12">
                        {formData.customerSelection === "multiple" ? "Select" : ""}
                      </TableHead>
                    )}
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                    <TableHead className="text-right">Past Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredCustomers().map((customer) => {
                    const pastDue = customer.past30 + customer.past60 + customer.past90 + customer.over90;
                    const isSelected = formData.selectedCustomers.includes(customer.id);
                    
                    return (
                      <TableRow key={customer.id} className={isSelected ? "bg-blue-50" : ""}>
                        {formData.customerSelection !== "all" && (
                          <TableCell>
                            {formData.customerSelection === "multiple" ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCustomerToggle(customer.id)}
                                className="w-4 h-4 rounded"
                              />
                            ) : (
                              <input
                                type="radio"
                                name="selectedCustomer"
                                checked={isSelected}
                                onChange={() => handleCustomerToggle(customer.id)}
                                className="w-4 h-4"
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.city}, {customer.state}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{customer.contactName}</div>
                            <div className="text-sm text-gray-600">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.currentBalance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={pastDue > 0 ? "text-red-600 font-medium" : "text-gray-500"}>
                            {formatCurrency(pastDue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {customer.currentBalance === 0 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </Badge>
                          ) : pastDue > 0 ? (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {getCustomersToProcess().length} customer{getCustomersToProcess().length !== 1 ? 's' : ''} will receive statements
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handlePreview} disabled={getCustomersToProcess().length === 0}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" onClick={handlePrint} disabled={getCustomersToProcess().length === 0}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={handleEmail} disabled={getCustomersToProcess().length === 0}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatements;