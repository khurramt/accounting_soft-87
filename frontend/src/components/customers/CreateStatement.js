import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import customerService from "../../services/customerService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

import { Checkbox } from "../ui/checkbox";
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Printer,
  Download,
  Send,
  Eye,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const CreateStatement = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [statementData, setStatementData] = useState({
    customerId: "",
    statementDate: new Date(),
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    toDate: new Date(),
    includeZeroBalance: false,
    includePaidTransactions: true,
    includeCredits: true,
    includeForwardBalance: true,
    message: "",
    printDuplicateWatermark: false,
    emailStatement: false,
    emailAddresses: ""
  });

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      if (!currentCompany?.id) return;
      
      try {
        setLoading(true);
        const response = await customerService.getCustomers(currentCompany.id, {
          limit: 1000,
          is_active: true
        });
        setCustomers(response.items || []);
      } catch (err) {
        console.error("Error loading customers:", err);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [currentCompany?.id]);

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.customer_id === customerId);
    setSelectedCustomer(customer);
    setStatementData(prev => ({
      ...prev,
      customerId: customerId,
      emailAddresses: customer?.primary_email || ""
    }));
  };

  const handleInputChange = (field, value) => {
    setStatementData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateStatement = async () => {
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement actual statement generation
      console.log("Creating statement for:", selectedCustomer.customer_name);
      console.log("Statement data:", statementData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Statement created successfully!");
      navigate("/customers");
    } catch (err) {
      console.error("Error creating statement:", err);
      setError("Failed to create statement");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }
    
    // TODO: Open preview window
    console.log("Preview statement for:", selectedCustomer.customer_name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/customers")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customers</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Statement</h1>
            <p className="text-gray-600">Generate customer account statement</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statement Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Statement Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={statementData.customerId}
                onValueChange={handleCustomerSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Statement Date */}
            <div className="space-y-2">
              <Label htmlFor="statementDate">Statement Date</Label>
              <Input
                id="statementDate"
                type="date"
                value={statementData.statementDate.toISOString().split('T')[0]}
                onChange={(e) => handleInputChange("statementDate", new Date(e.target.value))}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <DatePicker
                  date={statementData.fromDate}
                  onDateChange={(date) => handleInputChange("fromDate", date)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <DatePicker
                  date={statementData.toDate}
                  onDateChange={(date) => handleInputChange("toDate", date)}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeZeroBalance"
                  checked={statementData.includeZeroBalance}
                  onCheckedChange={(checked) => handleInputChange("includeZeroBalance", checked)}
                />
                <Label htmlFor="includeZeroBalance" className="text-sm">
                  Include customers with zero balance
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePaidTransactions"
                  checked={statementData.includePaidTransactions}
                  onCheckedChange={(checked) => handleInputChange("includePaidTransactions", checked)}
                />
                <Label htmlFor="includePaidTransactions" className="text-sm">
                  Include paid transactions
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCredits"
                  checked={statementData.includeCredits}
                  onCheckedChange={(checked) => handleInputChange("includeCredits", checked)}
                />
                <Label htmlFor="includeCredits" className="text-sm">
                  Include credits
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeForwardBalance"
                  checked={statementData.includeForwardBalance}
                  onCheckedChange={(checked) => handleInputChange("includeForwardBalance", checked)}
                />
                <Label htmlFor="includeForwardBalance" className="text-sm">
                  Include forward balance
                </Label>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message on Statement</Label>
              <Textarea
                id="message"
                placeholder="Enter message to appear on statement..."
                value={statementData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Preview & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="space-y-4">
                {/* Customer Details */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg">{selectedCustomer.customer_name}</h3>
                  {selectedCustomer.company_name && (
                    <p className="text-gray-600">{selectedCustomer.company_name}</p>
                  )}
                  
                  <div className="mt-2 space-y-1">
                    {selectedCustomer.primary_email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedCustomer.primary_email}</span>
                      </div>
                    )}
                    
                    {selectedCustomer.primary_phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedCustomer.primary_phone}</span>
                      </div>
                    )}
                    
                    {selectedCustomer.billing_address_line1 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          {selectedCustomer.billing_address_line1}
                          {selectedCustomer.billing_city && `, ${selectedCustomer.billing_city}`}
                          {selectedCustomer.billing_state && `, ${selectedCustomer.billing_state}`}
                          {selectedCustomer.billing_zip_code && ` ${selectedCustomer.billing_zip_code}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Options */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailStatement"
                      checked={statementData.emailStatement}
                      onCheckedChange={(checked) => handleInputChange("emailStatement", checked)}
                    />
                    <Label htmlFor="emailStatement" className="text-sm">
                      Email statement to customer
                    </Label>
                  </div>
                  
                  {statementData.emailStatement && (
                    <div className="space-y-2">
                      <Label htmlFor="emailAddresses">Email Addresses</Label>
                      <Input
                        id="emailAddresses"
                        placeholder="Enter email addresses separated by commas"
                        value={statementData.emailAddresses}
                        onChange={(e) => handleInputChange("emailAddresses", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Statement
                  </Button>
                  
                  <Button
                    onClick={handleCreateStatement}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Creating Statement...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Create Statement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Select a customer to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateStatement;