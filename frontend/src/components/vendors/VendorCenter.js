import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CompanyContext } from "../../contexts/CompanyContext";
import vendorService from "../../services/vendorService";
import { 
  Search, 
  Plus, 
  FileText, 
  DollarSign, 
  Receipt, 
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Filter,
  Building,
  Loader2
} from "lucide-react";

const VendorCenter = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendorTransactions, setVendorTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const navigate = useNavigate();
  const { selectedCompany } = useContext(CompanyContext);

  // Fetch vendors from backend
  useEffect(() => {
    if (selectedCompany) {
      fetchVendors();
    }
  }, [selectedCompany, searchTerm, filterStatus]);

  const fetchVendors = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: searchTerm || undefined,
        is_active: filterStatus === "all" ? undefined : filterStatus === "active",
        page_size: 50,
        page: 1
      };
      
      const data = await vendorService.getVendors(selectedCompany.company_id, filters);
      setVendors(data.items || []);
      
      // If we have vendors and no selected vendor, select the first one
      if (data.items && data.items.length > 0 && !selectedVendor) {
        setSelectedVendor(data.items[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor transactions when vendor is selected
  useEffect(() => {
    if (selectedVendor && selectedCompany) {
      fetchVendorTransactions();
    }
  }, [selectedVendor, selectedCompany]);

  const fetchVendorTransactions = async () => {
    if (!selectedVendor || !selectedCompany) return;
    
    setLoadingTransactions(true);
    
    try {
      const data = await vendorService.getVendorTransactions(selectedCompany.company_id, selectedVendor.vendor_id);
      setVendorTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching vendor transactions:', err);
      setVendorTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!selectedCompany) return;
    
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorService.deleteVendor(selectedCompany.company_id, vendorId);
        fetchVendors();
        
        // If deleted vendor was selected, clear selection
        if (selectedVendor && selectedVendor.vendor_id === vendorId) {
          setSelectedVendor(null);
        }
      } catch (err) {
        alert('Error deleting vendor: ' + err.message);
      }
    }
  };

  const handleNewVendor = () => {
    navigate("/vendors/new");
  };

  const handleNewTransaction = (type) => {
    const paths = {
      bill: "/vendors/bills/new",
      check: "/vendors/checks/new",
      payment: "/vendors/bills/pay",
      order: "/vendors/purchase-orders/new"
    };
    navigate(paths[type]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Center</h1>
          <p className="text-gray-600">Manage your vendors and track payables</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleNewVendor} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Vendor
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleNewTransaction('bill')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Enter Bill
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleNewTransaction('check')}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Write Check
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vendors</span>
              <Badge variant="secondary">{vendors.length}</Badge>
            </CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
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
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading vendors...</span>
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No vendors found</p>
                  <p className="text-sm">Add a vendor to get started</p>
                </div>
              ) : (
                vendors.map((vendor) => (
                  <div
                    key={vendor.vendor_id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedVendor?.vendor_id === vendor.vendor_id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleVendorSelect(vendor)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{vendor.vendor_name}</h4>
                        <p className="text-sm text-gray-600">{vendor.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(vendor.balance || 0).toFixed(2)}</p>
                        <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
                          {vendor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vendor Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vendor Details</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled={!selectedVendor}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!selectedVendor}
                  onClick={() => selectedVendor && handleDeleteVendor(selectedVendor.vendor_id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedVendor ? (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Vendor Info</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedVendor.vendor_name}</h3>
                        <p className="text-gray-600">{selectedVendor.vendor_type || 'Vendor'}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedVendor.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedVendor.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedVendor.address || 'No address'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Account Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Current Balance:</span>
                            <span className="font-semibold">${(selectedVendor.balance || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Terms:</span>
                            <span>{selectedVendor.payment_terms || 'Net 30'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant={selectedVendor.is_active ? 'default' : 'secondary'}>
                              {selectedVendor.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>1099 Eligible:</span>
                            <span>{selectedVendor.eligible_1099 ? 'Yes' : 'No'}</span>
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
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Loading transactions...</span>
                    </div>
                  ) : vendorTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendorTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.type}</TableCell>
                            <TableCell>{transaction.reference}</TableCell>
                            <TableCell>${(transaction.amount || 0).toFixed(2)}</TableCell>
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
                      <p>No transactions found for this vendor</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="orders" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Purchase Orders</h4>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Order
                    </Button>
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No purchase orders available</p>
                    <p className="text-sm">Create a purchase order to get started</p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a vendor to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorCenter;