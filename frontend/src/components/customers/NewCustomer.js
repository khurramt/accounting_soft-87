import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import customerService from "../../services/customerService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { 
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Settings,
  Calculator,
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";

const NewCustomer = () => {
  const { currentCompany } = useCompany();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [customerData, setCustomerData] = useState({
    // Address Info
    customerName: "",
    companyName: "",
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    contact: "",
    phoneNumber: "",
    faxNumber: "",
    email: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    
    // Additional Info
    customerType: "",
    terms: "Net 30",
    rep: "",
    preferredContactMethod: "Email",
    resaleNumber: "",
    accountNumber: "",
    creditLimit: "",
    
    // Payment Settings
    preferredDeliveryMethod: "Mail",
    preferredPaymentMethod: "Check",
    creditCardNumber: "",
    expirationDate: "",
    nameOnCard: "",
    address: "",
    zipCode: "",
    
    // Sales Tax Settings
    taxCode: "",
    taxItem: "",
    resaleNumber: "",
    
    // Job Info
    jobStatus: "Not Started",
    startDate: "",
    projectedEndDate: "",
    endDate: "",
    jobDescription: "",
    jobType: ""
  });

  const [activeTab, setActiveTab] = useState("address");
  const [customFields, setCustomFields] = useState([]);

  const customerTypes = [
    "Regular Customer",
    "One-time Customer", 
    "Preferred Customer",
    "Commercial Customer",
    "Wholesale Customer"
  ];

  const paymentTerms = [
    "Net 15", "Net 30", "Net 60", "Due on receipt", "1% 10 Net 30", "2% 10 Net 30"
  ];

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { label: "", value: "" }]);
  };

  const removeCustomField = (index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    if (!currentCompany) {
      setError("No company selected");
      return;
    }

    // Validate required fields
    if (!customerData.customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Map form data to API format
      const apiData = {
        customer_name: customerData.customerName,
        company_name: customerData.companyName,
        first_name: customerData.firstName,
        middle_name: customerData.middleName,
        last_name: customerData.lastName,
        email: customerData.email,
        phone: customerData.phoneNumber,
        fax: customerData.faxNumber,
        website: customerData.website,
        address_line1: customerData.addressLine1,
        address_line2: customerData.addressLine2,
        city: customerData.city,
        state: customerData.state,
        zip_code: customerData.zipCode,
        country: customerData.country,
        customer_type: customerData.customerType,
        payment_terms: customerData.terms,
        preferred_contact_method: customerData.preferredContactMethod,
        resale_number: customerData.resaleNumber,
        account_number: customerData.accountNumber,
        credit_limit: customerData.creditLimit ? parseFloat(customerData.creditLimit) : null,
        preferred_delivery_method: customerData.preferredDeliveryMethod,
        preferred_payment_method: customerData.preferredPaymentMethod,
        is_active: true,
        // Add any additional fields as needed
        notes: customerData.jobDescription || null
      };

      const response = await customerService.createCustomer(currentCompany.company_id, apiData);
      
      // Success - navigate back to customer center
      navigate("/customers");
    } catch (err) {
      console.error("Error creating customer:", err);
      setError(err.response?.data?.detail || err.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/customers");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Customer</h1>
          <p className="text-gray-600 mt-1">Create a new customer record</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
                <TabsTrigger value="address" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                  Address Info
                </TabsTrigger>
                <TabsTrigger value="additional" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                  Additional Info
                </TabsTrigger>
                <TabsTrigger value="payment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                  Payment Settings
                </TabsTrigger>
                <TabsTrigger value="tax" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                  Sales Tax Settings
                </TabsTrigger>
                <TabsTrigger value="job" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                  Job Info
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Address Info Tab */}
            <TabsContent value="address" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Customer Name *</label>
                      <Input 
                        value={customerData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      <Input 
                        value={customerData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Salutation</label>
                      <select 
                        value={customerData.salutation}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input 
                        value={customerData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">M.I.</label>
                      <Input 
                        value={customerData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        placeholder="M.I."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input 
                        value={customerData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Contact</label>
                    <Input 
                      value={customerData.contact}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                      placeholder="Primary contact person"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Address & Contact</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1</label>
                      <Input 
                        value={customerData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <Input 
                        value={customerData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        placeholder="Apt, suite, building, etc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <Input 
                          value={customerData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <select 
                          value={customerData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select State</option>
                          {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">ZIP Code</label>
                        <Input 
                          value={customerData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          placeholder="ZIP Code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        <Input 
                          value={customerData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input 
                          value={customerData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Fax</label>
                        <Input 
                          value={customerData.faxNumber}
                          onChange={(e) => handleInputChange('faxNumber', e.target.value)}
                          placeholder="Fax number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input 
                          type="email"
                          value={customerData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <Input 
                          value={customerData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="Website URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Additional Info Tab */}
            <TabsContent value="additional" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Customer Defaults</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Customer Type</label>
                      <select 
                        value={customerData.customerType}
                        onChange={(e) => handleInputChange('customerType', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Type</option>
                        {customerTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Terms</label>
                      <select 
                        value={customerData.terms}
                        onChange={(e) => handleInputChange('terms', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        {paymentTerms.map(term => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Rep</label>
                      <Input 
                        value={customerData.rep}
                        onChange={(e) => handleInputChange('rep', e.target.value)}
                        placeholder="Sales representative"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Contact Method</label>
                      <select 
                        value={customerData.preferredContactMethod}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="Fax">Fax</option>
                        <option value="Mail">Mail</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Account Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Resale Number</label>
                      <Input 
                        value={customerData.resaleNumber}
                        onChange={(e) => handleInputChange('resaleNumber', e.target.value)}
                        placeholder="Resale certificate number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number</label>
                      <Input 
                        value={customerData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        placeholder="Customer account number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Credit Limit</label>
                      <Input 
                        type="number"
                        value={customerData.creditLimit}
                        onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Custom Fields</h4>
                      <Button size="sm" variant="outline" onClick={addCustomField}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                    
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          placeholder="Field label"
                          value={field.label}
                          onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                        />
                        <Input 
                          placeholder="Field value"
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => removeCustomField(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Payment Settings Tab */}
            <TabsContent value="payment" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Payment Preferences</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Delivery Method</label>
                      <select 
                        value={customerData.preferredDeliveryMethod}
                        onChange={(e) => handleInputChange('preferredDeliveryMethod', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Mail">Mail</option>
                        <option value="Email">Email</option>
                        <option value="Pickup">Pickup</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Payment Method</label>
                      <select 
                        value={customerData.preferredPaymentMethod}
                        onChange={(e) => handleInputChange('preferredPaymentMethod', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Check">Check</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="ACH/Bank Transfer">ACH/Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Credit Card Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Credit Card Number</label>
                      <Input 
                        value={customerData.creditCardNumber}
                        onChange={(e) => handleInputChange('creditCardNumber', e.target.value)}
                        placeholder="**** **** **** ****"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiration Date</label>
                        <Input 
                          value={customerData.expirationDate}
                          onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Name on Card</label>
                        <Input 
                          value={customerData.nameOnCard}
                          onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                          placeholder="Name on card"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Billing Address</label>
                      <Input 
                        value={customerData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Billing address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ZIP Code</label>
                      <Input 
                        value={customerData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="ZIP Code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sales Tax Settings Tab */}
            <TabsContent value="tax" className="p-6 space-y-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Sales Tax Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tax Code</label>
                    <select 
                      value={customerData.taxCode}
                      onChange={(e) => handleInputChange('taxCode', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Tax Code</option>
                      <option value="Tax">Tax</option>
                      <option value="Non">Non-taxable</option>
                      <option value="Out">Out of State</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tax Item</label>
                    <select 
                      value={customerData.taxItem}
                      onChange={(e) => handleInputChange('taxItem', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Tax Item</option>
                      <option value="State Tax">State Tax</option>
                      <option value="Local Tax">Local Tax</option>
                      <option value="Federal Tax">Federal Tax</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Resale Number</label>
                    <Input 
                      value={customerData.resaleNumber}
                      onChange={(e) => handleInputChange('resaleNumber', e.target.value)}
                      placeholder="Tax resale certificate number"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Job Info Tab */}
            <TabsContent value="job" className="p-6 space-y-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Job Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Status</label>
                    <select 
                      value={customerData.jobStatus}
                      onChange={(e) => handleInputChange('jobStatus', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <Input 
                        type="date"
                        value={customerData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Projected End Date</label>
                      <Input 
                        type="date"
                        value={customerData.projectedEndDate}
                        onChange={(e) => handleInputChange('projectedEndDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <Input 
                      type="date"
                      value={customerData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Description</label>
                    <textarea 
                      value={customerData.jobDescription}
                      onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                      className="w-full p-2 border rounded-md h-24"
                      placeholder="Describe the job or project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Type</label>
                    <Input 
                      value={customerData.jobType}
                      onChange={(e) => handleInputChange('jobType', e.target.value)}
                      placeholder="e.g., Consulting, Construction, etc."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Next</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>OK</Button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomer;