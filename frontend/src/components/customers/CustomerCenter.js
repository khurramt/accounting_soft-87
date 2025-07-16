import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import customerService from "../../services/customerService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Search, 
  Plus, 
  FileText, 
  DollarSign, 
  Receipt, 
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Filter,
  Loader2,
  AlertCircle
} from "lucide-react";

const CustomerCenter = () => {
  const { currentCompany } = useCompany();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [customerBalance, setCustomerBalance] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0
  });
  const navigate = useNavigate();

  // Load customers from API
  const loadCustomers = async (filters = {}) => {
    if (!currentCompany) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {
        search: searchTerm,
        is_active: filterStatus === "all" ? undefined : filterStatus === "active",
        page: pagination.page,
        page_size: pagination.page_size,
        sort_by: "customer_name",
        sort_order: "asc",
        ...filters
      };

      const response = await customerService.getCustomers(currentCompany.id, filterParams);
      
      setCustomers(response.items || []);
      setPagination({
        page: response.page || 1,
        page_size: response.page_size || 20,
        total: response.total || 0,
        total_pages: response.total_pages || 0
      });

      // Set first customer as selected if none selected
      if (!selectedCustomer && response.items && response.items.length > 0) {
        setSelectedCustomer(response.items[0]);
      }
    } catch (err) {
      console.error("Error loading customers:", err);
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Load customer transactions
  const loadCustomerTransactions = async (customerId) => {
    if (!currentCompany || !customerId) return;
    
    try {
      setLoadingTransactions(true);
      const response = await customerService.getCustomerTransactions(currentCompany.id, customerId);
      setCustomerTransactions(response.transactions || []);
    } catch (err) {
      console.error("Error loading customer transactions:", err);
      setCustomerTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Load customer balance
  const loadCustomerBalance = async (customerId) => {
    if (!currentCompany || !customerId) return;
    
    try {
      const response = await customerService.getCustomerBalance(currentCompany.id, customerId);
      setCustomerBalance(response.balance || 0);
    } catch (err) {
      console.error("Error loading customer balance:", err);
      setCustomerBalance(0);
    }
  };

  // Load data on component mount and when company changes
  useEffect(() => {
    if (currentCompany) {
      loadCustomers();
    }
  }, [currentCompany]);

  // Load data when search or filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentCompany) {
        loadCustomers();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterStatus]);

  // Load customer transactions when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerTransactions(selectedCustomer.customer_id);
      loadCustomerBalance(selectedCustomer.customer_id);
    }
  }, [selectedCustomer]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleNewCustomer = () => {
    navigate("/customers/new");
  };

  const handleNewTransaction = (type) => {
    const paths = {
      invoice: "/customers/invoice/new",
      payment: "/customers/payments/new",
      receipt: "/customers/sales-receipt/new",
      statement: "/customers/statement/new"
    };
    navigate(paths[type]);
  };

  const handleEditCustomer = () => {
    if (selectedCustomer) {
      navigate(`/customers/${selectedCustomer.customer_id}/edit`);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer || !currentCompany) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCustomer.customer_name}?`)) {
      try {
        await customerService.deleteCustomer(currentCompany.company_id, selectedCustomer.customer_id);
        await loadCustomers(); // Reload customers list
        setSelectedCustomer(customers.length > 1 ? customers[0] : null);
      } catch (err) {
        console.error("Error deleting customer:", err);
        alert("Failed to delete customer");
      }
    }
  };

  // Display loading state
  if (loading && customers.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading customers...</span>
        </div>
      </div>
    );
  }

  // Display error state
  if (error && customers.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <span className="ml-2 text-red-600">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Center</h1>
          <p className="text-gray-600">Manage your customers and track receivables</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleNewCustomer} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleNewTransaction('invoice')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleNewTransaction('payment')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Receive Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customers</span>
              <Badge variant="secondary">{customers.length}</Badge>
            </CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Loading customers...
                </div>
              ) : customers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No customers found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleNewCustomer}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Customer
                  </Button>
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.customer_id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCustomer?.customer_id === customer.customer_id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{customer.customer_name || customer.name}</h4>
                        <p className="text-sm text-gray-600">{customer.email || 'No email'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(customer.balance || 0).toFixed(2)}</p>
                        <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Details</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleEditCustomer}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteCustomer}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Customer Info</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="statements">Statements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedCustomer.customer_name || selectedCustomer.name}</h3>
                        <p className="text-gray-600">{selectedCustomer.customer_type || 'Customer'}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedCustomer.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedCustomer.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {selectedCustomer.address_line1 || selectedCustomer.address ? 
                              `${selectedCustomer.address_line1 || selectedCustomer.address}${selectedCustomer.city ? ', ' + selectedCustomer.city : ''}${selectedCustomer.state ? ', ' + selectedCustomer.state : ''}${selectedCustomer.zip_code ? ' ' + selectedCustomer.zip_code : ''}` : 
                              'No address'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Account Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Current Balance:</span>
                            <span className="font-semibold">${(customerBalance || selectedCustomer.balance || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Terms:</span>
                            <span>{selectedCustomer.payment_terms || 'Net 30'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant={selectedCustomer.is_active ? 'default' : 'secondary'}>
                              {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Recent Transactions</h4>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  
                  {loadingTransactions ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Loading transactions...</p>
                    </div>
                  ) : customerTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Number</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.type}</TableCell>
                            <TableCell>{transaction.number}</TableCell>
                            <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === 'Paid' ? 'default' : 'secondary'}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No transactions found for this customer</p>
                      <p className="text-sm">Create an invoice or record a payment to get started</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="statements" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Customer Statements</h4>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Create Statement
                    </Button>
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No statements available</p>
                    <p className="text-sm">Create a statement to get started</p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a customer to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerCenter;