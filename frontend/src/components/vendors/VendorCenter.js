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
  const [selectedVendor, setSelectedVendor] = useState(mockVendors[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const filteredVendors = mockVendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || vendor.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const vendorBills = mockBills.filter(
    bill => bill.vendor === selectedVendor?.name
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vendors</span>
              <Badge variant="secondary">{filteredVendors.length}</Badge>
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
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedVendor?.id === vendor.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{vendor.name}</h4>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${vendor.balance.toFixed(2)}</p>
                      <Badge variant={vendor.status === 'Active' ? 'default' : 'secondary'}>
                        {vendor.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendor Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vendor Details</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
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
                        <h3 className="font-semibold text-lg">{selectedVendor.name}</h3>
                        <p className="text-gray-600">{selectedVendor.type}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedVendor.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedVendor.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedVendor.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Account Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Current Balance:</span>
                            <span className="font-semibold">${selectedVendor.balance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Terms:</span>
                            <span>{selectedVendor.terms}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant={selectedVendor.status === 'Active' ? 'default' : 'secondary'}>
                              {selectedVendor.status}
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
                  
                  {vendorBills.length > 0 ? (
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
                        {vendorBills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell>{bill.date}</TableCell>
                            <TableCell>Bill</TableCell>
                            <TableCell>{bill.refNo}</TableCell>
                            <TableCell>${bill.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={bill.status === 'Paid' ? 'default' : 'secondary'}>
                                {bill.status}
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