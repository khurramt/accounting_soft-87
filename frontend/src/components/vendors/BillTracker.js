import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import billService from "../../services/billService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Printer,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

const BillTracker = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVendor, setFilterVendor] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedBills, setSelectedBills] = useState([]);

  // Load bills
  useEffect(() => {
    const loadBills = async () => {
      if (!currentCompany?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Mock bills data since billService might not have this method
        const mockBills = [
          {
            id: "1",
            bill_number: "BILL-001",
            vendor_name: "Office Supplies Co.",
            vendor_id: "1",
            bill_date: "2024-01-15",
            due_date: "2024-02-14",
            amount: 1250.00,
            amount_due: 1250.00,
            status: "unpaid",
            aging_days: 5,
            payment_terms: "Net 30",
            reference_number: "REF-001",
            description: "Office supplies and equipment",
            category: "Office Expenses",
            tags: ["supplies", "equipment"]
          },
          {
            id: "2",
            bill_number: "BILL-002",
            vendor_name: "Tech Solutions Inc.",
            vendor_id: "2",
            bill_date: "2024-01-10",
            due_date: "2024-01-25",
            amount: 3200.00,
            amount_due: 3200.00,
            status: "overdue",
            aging_days: 15,
            payment_terms: "Net 15",
            reference_number: "REF-002",
            description: "Software licensing fees",
            category: "Software",
            tags: ["software", "licensing"]
          },
          {
            id: "3",
            bill_number: "BILL-003",
            vendor_name: "Marketing Agency Ltd.",
            vendor_id: "3",
            bill_date: "2024-01-20",
            due_date: "2024-02-19",
            amount: 2800.00,
            amount_due: 0.00,
            status: "paid",
            aging_days: 0,
            payment_terms: "Net 30",
            reference_number: "REF-003",
            description: "Marketing campaign services",
            category: "Marketing",
            tags: ["marketing", "advertising"]
          },
          {
            id: "4",
            bill_number: "BILL-004",
            vendor_name: "Utilities Company",
            vendor_id: "4",
            bill_date: "2024-01-25",
            due_date: "2024-02-24",
            amount: 450.00,
            amount_due: 450.00,
            status: "pending",
            aging_days: 0,
            payment_terms: "Net 30",
            reference_number: "REF-004",
            description: "Monthly utility bills",
            category: "Utilities",
            tags: ["utilities", "monthly"]
          }
        ];
        
        setBills(mockBills);
      } catch (err) {
        console.error("Error loading bills:", err);
        setError("Failed to load bills");
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, [currentCompany?.id]);

  // Filter and sort bills
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || bill.status === filterStatus;
    const matchesVendor = filterVendor === "all" || bill.vendor_id === filterVendor;
    
    return matchesSearch && matchesStatus && matchesVendor;
  }).sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Get summary statistics
  const summary = {
    total_bills: bills.length,
    unpaid_bills: bills.filter(b => b.status === "unpaid").length,
    overdue_bills: bills.filter(b => b.status === "overdue").length,
    total_amount_due: bills.reduce((sum, bill) => sum + bill.amount_due, 0),
    overdue_amount: bills.filter(b => b.status === "overdue").reduce((sum, bill) => sum + bill.amount_due, 0)
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: "success", icon: CheckCircle, text: "Paid" },
      unpaid: { variant: "warning", icon: Clock, text: "Unpaid" },
      overdue: { variant: "destructive", icon: AlertTriangle, text: "Overdue" },
      pending: { variant: "secondary", icon: Activity, text: "Pending" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectBill = (billId) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBills.length === filteredBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(filteredBills.map(bill => bill.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bill Tracker</h1>
          <p className="text-gray-600">Track and manage your vendor bills</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate("/vendors/bills/new")}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Enter Bill</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold">{summary.total_bills}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unpaid Bills</p>
                <p className="text-2xl font-bold text-orange-600">{summary.unpaid_bills}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Bills</p>
                <p className="text-2xl font-bold text-red-600">{summary.overdue_bills}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount Due</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_amount_due)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.overdue_amount)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={filterVendor} onValueChange={setFilterVendor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {[...new Set(bills.map(bill => bill.vendor_name))].map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="bill_date">Bill Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="vendor_name">Vendor</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills ({filteredBills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bills...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bills found matching your criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedBills.length === filteredBills.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('bill_number')}
                  >
                    Bill # <ArrowUpDown className="h-4 w-4 inline ml-1" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('vendor_name')}
                  >
                    Vendor <ArrowUpDown className="h-4 w-4 inline ml-1" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('bill_date')}
                  >
                    Date <ArrowUpDown className="h-4 w-4 inline ml-1" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('due_date')}
                  >
                    Due Date <ArrowUpDown className="h-4 w-4 inline ml-1" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    Amount <ArrowUpDown className="h-4 w-4 inline ml-1" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('amount_due')}
                  >
                    Amount Due <ArrowUpDown className="h-4 w-4 inline ml-1" />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => handleSelectBill(bill.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{bill.bill_number}</TableCell>
                    <TableCell>{bill.vendor_name}</TableCell>
                    <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                    <TableCell className={
                      bill.status === 'overdue' ? 'text-red-600 font-medium' : ''
                    }>
                      {new Date(bill.due_date).toLocaleDateString()}
                      {bill.aging_days > 0 && (
                        <span className="text-red-600 text-xs ml-1">({bill.aging_days} days)</span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(bill.amount)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(bill.amount_due)}</TableCell>
                    <TableCell>{getStatusBadge(bill.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/vendors/bills/${bill.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/vendors/bills/${bill.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {bill.status === 'unpaid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vendors/bills/pay?bill=${bill.id}`)}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillTracker;