import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { 
  ArrowLeft,
  Filter,
  Search,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  TrendingUp,
  Download,
  Printer,
  Mail,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  BarChart3,
  PieChart,
  Target
} from "lucide-react";

const IncomeTracker = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    dateRange: "current-month",
    customFromDate: "",
    customToDate: "",
    customer: "",
    status: "all", // all, unbilled, unpaid, paid, overdue
    transactionType: "all",
    searchTerm: ""
  });

  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // list, summary

  // Mock income tracking data
  const [transactions] = useState([
    {
      id: "1",
      customer: "ABC Company",
      customerId: "1",
      type: "Time",
      date: "2024-01-15",
      number: "TIME-001",
      poNumber: "PO-2024-001",
      terms: "Net 30",
      dueDate: "2024-02-14",
      amount: 1200.00,
      openBalance: 1200.00,
      status: "Unbilled",
      aging: 0,
      description: "Consulting services - 8 hours @ $150/hr",
      employee: "John Smith",
      service: "Consulting",
      billable: true
    },
    {
      id: "2",
      customer: "XYZ Corporation",
      customerId: "2", 
      type: "Invoice",
      date: "2024-01-12",
      number: "INV-001",
      poNumber: "PO-2024-002",
      terms: "Net 15",
      dueDate: "2024-01-27",
      amount: 2800.00,
      openBalance: 2800.00,
      status: "Unpaid",
      aging: 10,
      description: "Software licensing and setup",
      employee: "",
      service: "Software License",
      billable: true
    },
    {
      id: "3",
      customer: "Johnson & Associates",
      customerId: "3",
      type: "Expense",
      date: "2024-01-10",
      number: "EXP-001",
      poNumber: "",
      terms: "",
      dueDate: "",
      amount: 450.00,
      openBalance: 450.00,
      status: "Unbilled",
      aging: 0,
      description: "Travel expenses for client meeting",
      employee: "Jane Doe",
      service: "Travel",
      billable: true
    },
    {
      id: "4",
      customer: "Smith Enterprises",
      customerId: "4",
      type: "Invoice",
      date: "2024-01-08",
      number: "INV-002",
      poNumber: "PO-2024-003",
      terms: "Net 30",
      dueDate: "2024-02-07",
      amount: 1950.00,
      openBalance: 0.00,
      status: "Paid",
      aging: 0,
      description: "Training services completed",
      employee: "Mike Johnson",
      service: "Training",
      billable: true
    },
    {
      id: "5",
      customer: "ABC Company",
      customerId: "1",
      type: "Time",
      date: "2024-01-05",
      number: "TIME-002",
      poNumber: "",
      terms: "Net 30",
      dueDate: "2024-02-04",
      amount: 750.00,
      openBalance: 750.00,
      status: "Unpaid",
      aging: 22,
      description: "Technical support - 5 hours @ $150/hr",
      employee: "Sarah Wilson",
      service: "Support",
      billable: true
    },
    {
      id: "6",
      customer: "XYZ Corporation",
      customerId: "2",
      type: "Invoice",
      date: "2023-12-20",
      number: "INV-003",
      poNumber: "PO-2023-015",
      terms: "Net 30",
      dueDate: "2024-01-19",
      amount: 3200.00,
      openBalance: 3200.00,
      status: "Overdue",
      aging: 42,
      description: "Year-end consultation project",
      employee: "John Smith",
      service: "Consulting",
      billable: true
    }
  ]);

  const [customers] = useState([
    { id: "1", name: "ABC Company" },
    { id: "2", name: "XYZ Corporation" },
    { id: "3", name: "Johnson & Associates" },
    { id: "4", name: "Smith Enterprises" }
  ]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransactionToggle = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      // Status filter
      if (filters.status !== "all") {
        if (filters.status !== transaction.status.toLowerCase()) {
          return false;
        }
      }

      // Customer filter
      if (filters.customer && transaction.customerId !== filters.customer) {
        return false;
      }

      // Transaction type filter
      if (filters.transactionType !== "all" && filters.transactionType !== transaction.type.toLowerCase()) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          transaction.customer.toLowerCase().includes(searchLower) ||
          transaction.number.toLowerCase().includes(searchLower) ||
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.employee.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'unbilled': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'unpaid': return <Clock className="w-4 h-4" />;
      case 'unbilled': return <FileText className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateSummary = () => {
    const filtered = getFilteredTransactions();
    
    return {
      total: filtered.reduce((sum, t) => sum + t.amount, 0),
      unbilled: filtered.filter(t => t.status === 'Unbilled').reduce((sum, t) => sum + t.amount, 0),
      unpaid: filtered.filter(t => t.status === 'Unpaid').reduce((sum, t) => sum + t.amount, 0),
      overdue: filtered.filter(t => t.status === 'Overdue').reduce((sum, t) => sum + t.amount, 0),
      paid: filtered.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0),
      count: filtered.length
    };
  };

  const handleCreateInvoice = () => {
    const unbilledTransactions = selectedTransactions.filter(id => {
      const transaction = transactions.find(t => t.id === id);
      return transaction && transaction.status === 'Unbilled';
    });
    
    if (unbilledTransactions.length > 0) {
      console.log("Creating invoice for transactions:", unbilledTransactions);
      navigate('/customers/invoice/new', { 
        state: { 
          preselectedTransactions: unbilledTransactions 
        }
      });
    }
  };

  const handleReceivePayment = () => {
    const unpaidTransactions = selectedTransactions.filter(id => {
      const transaction = transactions.find(t => t.id === id);
      return transaction && (transaction.status === 'Unpaid' || transaction.status === 'Overdue');
    });
    
    if (unpaidTransactions.length > 0) {
      console.log("Receiving payment for transactions:", unpaidTransactions);
      navigate('/customers/payments/new', { 
        state: { 
          preselectedTransactions: unpaidTransactions 
        }
      });
    }
  };

  const summary = calculateSummary();
  const filteredTransactions = getFilteredTransactions();

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
            <h1 className="text-3xl font-bold text-gray-900">Income Tracker</h1>
            <p className="text-gray-600">Track unbilled time, expenses, and outstanding payments</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {filteredTransactions.length} transactions
          </Badge>
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'summary' : 'list')}>
            {viewMode === 'list' ? <BarChart3 className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            {viewMode === 'list' ? 'Summary View' : 'List View'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
            <div className="text-sm text-gray-600">Total Income</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{formatCurrency(summary.unbilled)}</div>
            <div className="text-sm text-gray-600">Unbilled</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{formatCurrency(summary.unpaid)}</div>
            <div className="text-sm text-gray-600">Unpaid</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{formatCurrency(summary.overdue)}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{formatCurrency(summary.paid)}</div>
            <div className="text-sm text-gray-600">Paid</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={filters.customer} onValueChange={(value) => handleFilterChange('customer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unbilled">Unbilled</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transactionType">Type</Label>
              <Select value={filters.transactionType} onValueChange={(value) => handleFilterChange('transactionType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedTransactions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleCreateInvoice}
                  disabled={!selectedTransactions.some(id => {
                    const transaction = transactions.find(t => t.id === id);
                    return transaction && transaction.status === 'Unbilled';
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
                <Button 
                  onClick={handleReceivePayment}
                  disabled={!selectedTransactions.some(id => {
                    const transaction = transactions.find(t => t.id === id);
                    return transaction && (transaction.status === 'Unpaid' || transaction.status === 'Overdue');
                  })}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Receive Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Income Transactions
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions(filteredTransactions.map(t => t.id));
                      } else {
                        setSelectedTransactions([]);
                      }
                    }}
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>P.O. Number</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Open Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleTransactionToggle(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.customer}</div>
                      <div className="text-sm text-gray-600">{transaction.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">{transaction.number}</TableCell>
                  <TableCell>{transaction.poNumber}</TableCell>
                  <TableCell>{transaction.terms}</TableCell>
                  <TableCell>{transaction.dueDate}</TableCell>
                  <TableCell>
                    {transaction.aging > 0 ? (
                      <Badge variant={transaction.aging > 30 ? "destructive" : "secondary"}>
                        {transaction.aging} days
                      </Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={transaction.openBalance > 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(transaction.openBalance)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(transaction.status)}
                        <span>{transaction.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p>No transactions found matching your criteria</p>
              <p className="text-sm">Try adjusting your filters or date range</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeTracker;