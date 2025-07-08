import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useCompany } from "../../contexts/CompanyContext";
import vendorService from "../../services/vendorService";
import { 
  Building,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Settings,
  Save,
  X,
  Loader2
} from "lucide-react";

const NewVendor = () => {
  const [vendorData, setVendorData] = useState({
    // Basic Info
    vendor_name: "",
    company_name: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    fax: "",
    email: "",
    website: "",
    
    // Address Info
    address: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States",
    
    // Additional Info
    account_number: "",
    vendor_type: "",
    payment_terms: "Net 30",
    credit_limit: "",
    print_on_check_as: "",
    
    // Tax & 1099 Info
    tax_id: "",
    eligible_1099: false,
    
    // Status
    is_active: true,
    
    // Notes
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { selectedCompany } = useContext(CompanyContext);

  const vendorTypes = [
    "Supplier",
    "Contractor", 
    "Service Provider",
    "Consultant",
    "Utility Company",
    "Government Agency"
  ];

  const paymentTerms = [
    "Net 15", "Net 30", "Net 60", "Due on receipt", "1% 10 Net 30", "2% 10 Net 30", "COD"
  ];

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const handleInputChange = (field, value) => {
    setVendorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      setError('No company selected');
      return;
    }

    if (!vendorData.vendor_name.trim()) {
      setError('Vendor name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for backend
      const vendorPayload = {
        ...vendorData,
        // Convert string values to appropriate types
        credit_limit: vendorData.credit_limit ? parseFloat(vendorData.credit_limit) : null,
        eligible_1099: Boolean(vendorData.eligible_1099),
        is_active: Boolean(vendorData.is_active)
      };

      await vendorService.createVendor(selectedCompany.company_id, vendorPayload);
      
      // Navigate back to vendor center
      navigate('/vendors');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/vendors');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Vendor</h1>
          <p className="text-gray-600 mt-1">Create a new vendor record</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
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

      {/* Vendor Form */}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="address" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="address">Address Info</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
            <TabsTrigger value="payment">Payment Settings</TabsTrigger>
            <TabsTrigger value="tax">Tax Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="address" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor_name">Vendor Name *</Label>
                    <Input
                      id="vendor_name"
                      value={vendorData.vendor_name}
                      onChange={(e) => handleInputChange("vendor_name", e.target.value)}
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={vendorData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={vendorData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      value={vendorData.middle_name}
                      onChange={(e) => handleInputChange("middle_name", e.target.value)}
                      placeholder="Middle name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={vendorData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={vendorData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fax">Fax</Label>
                    <Input
                      id="fax"
                      value={vendorData.fax}
                      onChange={(e) => handleInputChange("fax", e.target.value)}
                      placeholder="Fax number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={vendorData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={vendorData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="Website URL"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address Line 1</Label>
                  <Input
                    id="address"
                    value={vendorData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_line_2">Address Line 2</Label>
                  <Input
                    id="address_line_2"
                    value={vendorData.address_line_2}
                    onChange={(e) => handleInputChange("address_line_2", e.target.value)}
                    placeholder="Apt, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={vendorData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={vendorData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={vendorData.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={vendorData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={vendorData.account_number}
                      onChange={(e) => handleInputChange("account_number", e.target.value)}
                      placeholder="Account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor_type">Vendor Type</Label>
                    <Select value={vendorData.vendor_type} onValueChange={(value) => handleInputChange("vendor_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="print_on_check_as">Print on Check As</Label>
                  <Input
                    id="print_on_check_as"
                    value={vendorData.print_on_check_as}
                    onChange={(e) => handleInputChange("print_on_check_as", e.target.value)}
                    placeholder="Name to print on checks"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={vendorData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={vendorData.is_active}
                      onChange={(e) => handleInputChange("is_active", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select value={vendorData.payment_terms} onValueChange={(value) => handleInputChange("payment_terms", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTerms.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit_limit">Credit Limit</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={vendorData.credit_limit}
                      onChange={(e) => handleInputChange("credit_limit", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Tax Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    value={vendorData.tax_id}
                    onChange={(e) => handleInputChange("tax_id", e.target.value)}
                    placeholder="Tax ID number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>1099 Settings</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="eligible_1099"
                      checked={vendorData.eligible_1099}
                      onChange={(e) => handleInputChange("eligible_1099", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="eligible_1099">Eligible for 1099</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default NewVendor;