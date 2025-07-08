import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { 
  Building, 
  MapPin, 
  Briefcase,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

const CompanySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState({
    // Step 1: Company Information
    companyName: "",
    legalName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    taxId: "",
    fiscalYearStart: "01",
    
    // Step 2: Industry Selection
    industry: "",
    businessType: "",
    companySize: "",
    
    // Step 3: Chart of Accounts
    accountTemplate: "standard",
    
    // Step 4: Initial Data
    importCustomers: false,
    importVendors: false,
    importItems: false,
    importEmployees: false
  });

  const navigate = useNavigate();
  const { createCompany } = useCompany();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare company data for API
      const newCompanyData = {
        name: companyData.companyName,
        legal_name: companyData.legalName,
        industry: companyData.industry,
        business_type: companyData.businessType,
        company_size: companyData.companySize,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zip_code: companyData.zipCode,
        phone: companyData.phone,
        email: companyData.email,
        website: companyData.website,
        tax_id: companyData.taxId,
        fiscal_year_start: companyData.fiscalYearStart,
        account_template: companyData.accountTemplate,
        settings: {
          import_customers: companyData.importCustomers,
          import_vendors: companyData.importVendors,
          import_items: companyData.importItems,
          import_employees: companyData.importEmployees
        }
      };
      
      const newCompany = await createCompany(newCompanyData);
      console.log("Company setup completed:", newCompany);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating company:", err);
      setError(err.message || "Failed to create company. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return companyData.companyName && companyData.address && companyData.city;
      case 2:
        return companyData.industry && companyData.businessType;
      case 3:
        return companyData.accountTemplate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const industries = [
    "Technology", "Retail", "Manufacturing", "Healthcare", "Education",
    "Construction", "Real Estate", "Professional Services", "Restaurants",
    "Non-profit", "Other"
  ];

  const businessTypes = [
    "Sole Proprietorship", "Partnership", "LLC", "Corporation", "S-Corporation", "Non-profit"
  ];

  const companySizes = [
    "1-5 employees", "6-25 employees", "26-100 employees", "100+ employees"
  ];

  const fiscalMonths = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Setup</h1>
          <p className="text-gray-600">Let's set up your company file</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4 text-xs text-gray-600">
              <span className={currentStep >= 1 ? "text-blue-600 font-medium" : ""}>Company Info</span>
              <span className={currentStep >= 2 ? "text-blue-600 font-medium" : ""}>Industry</span>
              <span className={currentStep >= 3 ? "text-blue-600 font-medium" : ""}>Accounts</span>
              <span className={currentStep >= 4 ? "text-blue-600 font-medium" : ""}>Data Import</span>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentStep === 1 && <Building className="w-6 h-6 mr-2" />}
              {currentStep === 2 && <Briefcase className="w-6 h-6 mr-2" />}
              {currentStep === 3 && <CreditCard className="w-6 h-6 mr-2" />}
              {currentStep === 4 && <CheckCircle className="w-6 h-6 mr-2" />}
              
              {currentStep === 1 && "Company Information"}
              {currentStep === 2 && "Industry Selection"}
              {currentStep === 3 && "Chart of Accounts"}
              {currentStep === 4 && "Initial Data"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your company's basic information"}
              {currentStep === 2 && "Select your industry and business type"}
              {currentStep === 3 && "Choose your chart of accounts template"}
              {currentStep === 4 && "Import existing data (optional)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={companyData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Company Name</Label>
                    <Input
                      id="legalName"
                      value={companyData.legalName}
                      onChange={(e) => handleInputChange("legalName", e.target.value)}
                      placeholder="Legal name (if different)"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    <h3 className="font-semibold">Address Information</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={companyData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={companyData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={companyData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={companyData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={companyData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={companyData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="www.company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Federal Tax ID</Label>
                    <Input
                      id="taxId"
                      value={companyData.taxId}
                      onChange={(e) => handleInputChange("taxId", e.target.value)}
                      placeholder="12-3456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYearStart">Fiscal Year Starts</Label>
                  <Select value={companyData.fiscalYearStart} onValueChange={(value) => handleInputChange("fiscalYearStart", value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fiscalMonths.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Industry Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="industry">What industry are you in? *</Label>
                  <Select value={companyData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">What type of business entity? *</Label>
                  <Select value={companyData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">How many employees?</Label>
                  <Select value={companyData.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Chart of Accounts */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Choose a chart of accounts template that best matches your business type.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" 
                         onClick={() => handleInputChange("accountTemplate", "standard")}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="accountTemplate"
                          value="standard"
                          checked={companyData.accountTemplate === "standard"}
                          onChange={() => {}}
                          className="text-blue-600"
                        />
                        <div>
                          <h4 className="font-medium">Standard Business</h4>
                          <p className="text-sm text-gray-600">
                            Most common accounts for general business use
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                         onClick={() => handleInputChange("accountTemplate", "retail")}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="accountTemplate"
                          value="retail"
                          checked={companyData.accountTemplate === "retail"}
                          onChange={() => {}}
                          className="text-blue-600"
                        />
                        <div>
                          <h4 className="font-medium">Retail/Product Sales</h4>
                          <p className="text-sm text-gray-600">
                            Includes inventory and cost of goods sold accounts
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                         onClick={() => handleInputChange("accountTemplate", "service")}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="accountTemplate"
                          value="service"
                          checked={companyData.accountTemplate === "service"}
                          onChange={() => {}}
                          className="text-blue-600"
                        />
                        <div>
                          <h4 className="font-medium">Service-Based Business</h4>
                          <p className="text-sm text-gray-600">
                            Focused on service revenue without inventory
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Initial Data */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Do you want to import existing data from another system? (This is optional and can be done later)
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="importCustomers"
                        checked={companyData.importCustomers}
                        onChange={(e) => handleInputChange("importCustomers", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="importCustomers">Import customer list</Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="importVendors"
                        checked={companyData.importVendors}
                        onChange={(e) => handleInputChange("importVendors", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="importVendors">Import vendor list</Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="importItems"
                        checked={companyData.importItems}
                        onChange={(e) => handleInputChange("importItems", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="importItems">Import products/services</Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="importEmployees"
                        checked={companyData.importEmployees}
                        onChange={(e) => handleInputChange("importEmployees", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="importEmployees">Import employee list</Label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Setup Summary</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Company:</strong> {companyData.companyName}</p>
                    <p><strong>Industry:</strong> {companyData.industry}</p>
                    <p><strong>Business Type:</strong> {companyData.businessType}</p>
                    <p><strong>Account Template:</strong> {companyData.accountTemplate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finish Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySetup;