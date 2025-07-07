import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { 
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
  DollarSign
} from "lucide-react";

const NewVendor = () => {
  const [vendorData, setVendorData] = useState({
    // Address Info
    vendorName: "",
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
    accountNumber: "",
    vendorType: "",
    terms: "Net 30",
    creditLimit: "",
    printOnCheckAs: "",
    
    // Payment Settings
    accountNumber: "",
    paymentTerms: "Net 30",
    printOnCheckAs: "",
    
    // Tax Settings
    vendorTaxId: "",
    eligible1099: false,
    trackPayments: false
  });

  const [activeTab, setActiveTab] = useState("address");
  const [customFields, setCustomFields] = useState([]);

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
    setVendorData(prev => ({ ...prev, [field]: value }));
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

  const handleSave = () => {
    console.log("Saving vendor:", vendorData);
    // Add save logic here
  };

  const handleCancel = () => {
    console.log("Cancelling vendor creation");
    // Add cancel logic here
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
                  Tax Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Address Info Tab */}
            <TabsContent value="address" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Vendor Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Vendor Name *</label>
                      <Input 
                        value={vendorData.vendorName}
                        onChange={(e) => handleInputChange('vendorName', e.target.value)}
                        placeholder="Enter vendor name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      <Input 
                        value={vendorData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Salutation</label>
                      <select 
                        value={vendorData.salutation}
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
                        value={vendorData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">M.I.</label>
                      <Input 
                        value={vendorData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        placeholder="M.I."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input 
                        value={vendorData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Contact</label>
                    <Input 
                      value={vendorData.contact}
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
                        value={vendorData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <Input 
                        value={vendorData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        placeholder="Apt, suite, building, etc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <Input 
                          value={vendorData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <select 
                          value={vendorData.state}
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
                          value={vendorData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          placeholder="ZIP Code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        <Input 
                          value={vendorData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input 
                          value={vendorData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Fax</label>
                        <Input 
                          value={vendorData.faxNumber}
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
                          value={vendorData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <Input 
                          value={vendorData.website}
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
                    <h3 className="text-lg font-semibold">Vendor Defaults</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number</label>
                      <Input 
                        value={vendorData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        placeholder="Your account number with vendor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Vendor Type</label>
                      <select 
                        value={vendorData.vendorType}
                        onChange={(e) => handleInputChange('vendorType', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Type</option>
                        {vendorTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Terms</label>
                      <select 
                        value={vendorData.terms}
                        onChange={(e) => handleInputChange('terms', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        {paymentTerms.map(term => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Credit Limit</label>
                      <Input 
                        type="number"
                        value={vendorData.creditLimit}
                        onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Print on Check as</label>
                      <Input 
                        value={vendorData.printOnCheckAs}
                        onChange={(e) => handleInputChange('printOnCheckAs', e.target.value)}
                        placeholder="Name to print on checks"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Additional Information</h3>
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

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Vendor Management Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Keep accurate contact information</li>
                      <li>• Set appropriate payment terms</li>
                      <li>• Track purchase order requirements</li>
                      <li>• Maintain vendor tax ID for 1099s</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Payment Settings Tab */}
            <TabsContent value="payment" className="p-6 space-y-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Payment Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <Input 
                      value={vendorData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Your account number with this vendor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Terms</label>
                    <select 
                      value={vendorData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {paymentTerms.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Print on Check as</label>
                    <Input 
                      value={vendorData.printOnCheckAs}
                      onChange={(e) => handleInputChange('printOnCheckAs', e.target.value)}
                      placeholder="Name to appear on printed checks"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If different from vendor name, specify how to print on checks
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Preferences</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Preferred vendor for expedited payments</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Requires purchase order</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Send remittance advice via email</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tax Settings Tab */}
            <TabsContent value="tax" className="p-6 space-y-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Tax Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vendor Tax ID</label>
                    <Input 
                      value={vendorData.vendorTaxId}
                      onChange={(e) => handleInputChange('vendorTaxId', e.target.value)}
                      placeholder="Federal Tax ID or SSN"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={vendorData.eligible1099}
                        onChange={(e) => handleInputChange('eligible1099', e.target.checked)}
                      />
                      <span className="text-sm font-medium">Vendor eligible for 1099</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={vendorData.trackPayments}
                        onChange={(e) => handleInputChange('trackPayments', e.target.checked)}
                      />
                      <span className="text-sm font-medium">Track payments for 1099</span>
                    </label>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      1099 Requirements
                    </h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>• Required for non-corporate vendors paid $600+ annually</p>
                      <p>• Collect W-9 form before making payments</p>
                      <p>• Track all payments for accurate 1099 reporting</p>
                      <p>• 1099-NEC forms due January 31st following tax year</p>
                    </div>
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

export default NewVendor;