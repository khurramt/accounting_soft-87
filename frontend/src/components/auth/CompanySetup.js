import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";

const CompanySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    legalName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    federalTaxId: "",
    fiscalYearStart: "",
    industry: "",
    businessType: "",
    companySize: ""
  });

  const { createCompany } = useCompany();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      const company = createCompany(formData);
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Setup</h1>
          <p className="text-gray-600">Let's set up your company information</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Company Information"}
              {currentStep === 2 && "Industry & Business Type"}
              {currentStep === 3 && "Chart of Accounts"}
              {currentStep === 4 && "Initial Data"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your company's basic information"}
              {currentStep === 2 && "Select your industry and business type"}
              {currentStep === 3 && "Set up your chart of accounts"}
              {currentStep === 4 && "Import or set up initial data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Company Name</Label>
                  <Input
                    id="legalName"
                    value={formData.legalName}
                    onChange={(e) => handleInputChange("legalName", e.target.value)}
                    placeholder="Legal Company Name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Street Address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Email Address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="Website URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="federalTaxId">Federal Tax ID</Label>
                  <Input
                    id="federalTaxId"
                    value={formData.federalTaxId}
                    onChange={(e) => handleInputChange("federalTaxId", e.target.value)}
                    placeholder="Federal Tax ID"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="s-corporation">S-Corporation</SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={formData.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 employees</SelectItem>
                      <SelectItem value="6-20">6-20 employees</SelectItem>
                      <SelectItem value="21-100">21-100 employees</SelectItem>
                      <SelectItem value="100+">100+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Chart of Accounts Template</h4>
                  <p className="text-sm text-gray-600">We'll create a standard chart of accounts based on your industry selection. You can customize it later.</p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Preview of Standard Accounts:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Checking Account</li>
                    <li>• Accounts Receivable</li>
                    <li>• Inventory Asset</li>
                    <li>• Accounts Payable</li>
                    <li>• Sales Revenue</li>
                    <li>• Cost of Goods Sold</li>
                    <li>• Office Expenses</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Initial Data Setup</h4>
                  <p className="text-sm text-gray-600">You can import existing data or start fresh. This can be done later from the application.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Import</Label>
                    <div className="text-sm text-gray-600">
                      <p>Import existing customers from:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Excel/CSV file</li>
                        <li>Other accounting software</li>
                        <li>Manual entry later</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor Import</Label>
                    <div className="text-sm text-gray-600">
                      <p>Import existing vendors from:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Excel/CSV file</li>
                        <li>Other accounting software</li>
                        <li>Manual entry later</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentStep === 4 ? "Finish Setup" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySetup;