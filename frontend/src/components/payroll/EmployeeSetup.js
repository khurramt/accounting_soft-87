import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Building,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  UserPlus,
  Settings,
  Shield,
  Clock,
  Calculator,
  Briefcase,
  Home,
  Heart,
  Baby,
  PlusCircle,
  MinusCircle
} from "lucide-react";

const EmployeeSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    middleInitial: "",
    ssn: "",
    birthDate: "",
    gender: "",
    maritalStatus: "",
    
    // Contact Information
    address: "",
    city: "",
    state: "",
    zipCode: "",
    homePhone: "",
    mobilePhone: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",
    
    // Employment Information
    employeeId: "",
    hireDate: "",
    department: "",
    jobTitle: "",
    supervisor: "",
    employmentType: "", // Full-time, Part-time, Contract
    status: "Active",
    
    // Payroll Information
    payType: "", // Salary, Hourly
    salary: "",
    hourlyRate: "",
    payFrequency: "", // Weekly, Bi-weekly, Semi-monthly, Monthly
    overtimeRate: "",
    
    // Tax Information - Federal
    federalFilingStatus: "",
    federalAllowances: 0,
    federalExtraWithholding: "",
    federalExempt: false,
    
    // Tax Information - State
    stateWorked: "",
    stateLived: "",
    stateFilingStatus: "",
    stateAllowances: 0,
    stateExtraWithholding: "",
    stateExempt: false,
    
    // Benefits & Deductions
    healthInsurance: false,
    dentalInsurance: false,
    retirementPlan: false,
    retirementPercent: "",
    retirementAmount: "",
    lifeInsurance: false,
    
    // Time Off
    sickLeaveAccrual: "",
    vacationAccrual: "",
    sickHoursAvailable: 0,
    vacationHoursAvailable: 0,
    personalDays: 0,
    
    // Direct Deposit
    directDeposit: false,
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "",
    
    // Additional Information
    notes: "",
    w4OnFile: false,
    i9OnFile: false,
    backgroundCheck: false
  });

  const [errors, setErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    { id: 1, title: "Personal Info", icon: User, description: "Basic personal information" },
    { id: 2, title: "Contact", icon: MapPin, description: "Address and contact details" },
    { id: 3, title: "Employment", icon: Briefcase, description: "Job and employment details" },
    { id: 4, title: "Payroll", icon: DollarSign, description: "Pay rate and frequency" },
    { id: 5, title: "Federal Taxes", icon: Calculator, description: "Federal tax settings" },
    { id: 6, title: "State Taxes", icon: Building, description: "State tax settings" },
    { id: 7, title: "Benefits", icon: Heart, description: "Benefits and deductions" },
    { id: 8, title: "Time Off", icon: Clock, description: "Vacation and sick leave" },
    { id: 9, title: "Banking", icon: CreditCard, description: "Direct deposit setup" },
    { id: 10, title: "Review", icon: CheckCircle, description: "Review and submit" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Info
        if (!formData.firstName) newErrors.firstName = "First name is required";
        if (!formData.lastName) newErrors.lastName = "Last name is required";
        if (!formData.ssn) newErrors.ssn = "SSN is required";
        if (!formData.birthDate) newErrors.birthDate = "Birth date is required";
        break;
        
      case 2: // Contact
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
        if (!formData.email) newErrors.email = "Email is required";
        break;
        
      case 3: // Employment
        if (!formData.employeeId) newErrors.employeeId = "Employee ID is required";
        if (!formData.hireDate) newErrors.hireDate = "Hire date is required";
        if (!formData.department) newErrors.department = "Department is required";
        if (!formData.jobTitle) newErrors.jobTitle = "Job title is required";
        if (!formData.employmentType) newErrors.employmentType = "Employment type is required";
        break;
        
      case 4: // Payroll
        if (!formData.payType) newErrors.payType = "Pay type is required";
        if (formData.payType === 'Salary' && !formData.salary) newErrors.salary = "Salary is required";
        if (formData.payType === 'Hourly' && !formData.hourlyRate) newErrors.hourlyRate = "Hourly rate is required";
        if (!formData.payFrequency) newErrors.payFrequency = "Pay frequency is required";
        break;
        
      case 5: // Federal Taxes
        if (!formData.federalFilingStatus) newErrors.federalFilingStatus = "Filing status is required";
        break;
        
      case 6: // State Taxes
        if (!formData.stateWorked) newErrors.stateWorked = "State worked is required";
        if (!formData.stateLived) newErrors.stateLived = "State lived is required";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < 10) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      console.log("Employee setup data:", formData);
      // Here you would typically send the data to your backend
      navigate('/payroll');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="middleInitial">Middle Initial</Label>
                <Input
                  id="middleInitial"
                  value={formData.middleInitial}
                  onChange={(e) => handleInputChange('middleInitial', e.target.value)}
                  maxLength={1}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ssn">Social Security Number *</Label>
                <Input
                  id="ssn"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className={errors.ssn ? 'border-red-500' : ''}
                />
                {errors.ssn && <p className="text-red-500 text-sm mt-1">{errors.ssn}</p>}
              </div>
              <div>
                <Label htmlFor="birthDate">Birth Date *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                    <SelectItem value="Separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2: // Contact Information
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    {/* Add all states */}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homePhone">Home Phone</Label>
                <Input
                  id="homePhone"
                  value={formData.homePhone}
                  onChange={(e) => handleInputChange('homePhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="mobilePhone">Mobile Phone</Label>
                <Input
                  id="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Employment Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  className={errors.employeeId ? 'border-red-500' : ''}
                />
                {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
              </div>
              <div>
                <Label htmlFor="hireDate">Hire Date *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  className={errors.hireDate ? 'border-red-500' : ''}
                />
                {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className={errors.jobTitle ? 'border-red-500' : ''}
                />
                {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <Input
                  id="supervisor"
                  value={formData.supervisor}
                  onChange={(e) => handleInputChange('supervisor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                  <SelectTrigger className={errors.employmentType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentType && <p className="text-red-500 text-sm mt-1">{errors.employmentType}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Employment Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4: // Payroll Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payType">Pay Type *</Label>
                <Select value={formData.payType} onValueChange={(value) => handleInputChange('payType', value)}>
                  <SelectTrigger className={errors.payType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select pay type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payType && <p className="text-red-500 text-sm mt-1">{errors.payType}</p>}
              </div>
              <div>
                <Label htmlFor="payFrequency">Pay Frequency *</Label>
                <Select value={formData.payFrequency} onValueChange={(value) => handleInputChange('payFrequency', value)}>
                  <SelectTrigger className={errors.payFrequency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select pay frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="Semi-monthly">Semi-monthly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payFrequency && <p className="text-red-500 text-sm mt-1">{errors.payFrequency}</p>}
              </div>
            </div>

            {formData.payType === 'Salary' && (
              <div>
                <Label htmlFor="salary">Annual Salary *</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="75000"
                  className={errors.salary ? 'border-red-500' : ''}
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
              </div>
            )}

            {formData.payType === 'Hourly' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    placeholder="25.00"
                    className={errors.hourlyRate ? 'border-red-500' : ''}
                  />
                  {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>}
                </div>
                <div>
                  <Label htmlFor="overtimeRate">Overtime Rate</Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    step="0.01"
                    value={formData.overtimeRate}
                    onChange={(e) => handleInputChange('overtimeRate', e.target.value)}
                    placeholder="37.50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave blank for 1.5x regular rate</p>
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Federal Tax Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="federalFilingStatus">Federal Filing Status *</Label>
                <Select value={formData.federalFilingStatus} onValueChange={(value) => handleInputChange('federalFilingStatus', value)}>
                  <SelectTrigger className={errors.federalFilingStatus ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select filing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married Filing Jointly">Married Filing Jointly</SelectItem>
                    <SelectItem value="Married Filing Separately">Married Filing Separately</SelectItem>
                    <SelectItem value="Head of Household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
                {errors.federalFilingStatus && <p className="text-red-500 text-sm mt-1">{errors.federalFilingStatus}</p>}
              </div>
              <div>
                <Label htmlFor="federalAllowances">Federal Allowances</Label>
                <Input
                  id="federalAllowances"
                  type="number"
                  min="0"
                  value={formData.federalAllowances}
                  onChange={(e) => handleInputChange('federalAllowances', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="federalExtraWithholding">Additional Federal Withholding</Label>
              <Input
                id="federalExtraWithholding"
                type="number"
                step="0.01"
                value={formData.federalExtraWithholding}
                onChange={(e) => handleInputChange('federalExtraWithholding', e.target.value)}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">Additional amount to withhold per pay period</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="federalExempt"
                checked={formData.federalExempt}
                onChange={(e) => handleInputChange('federalExempt', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="federalExempt">Employee is exempt from federal withholding</Label>
            </div>
          </div>
        );

      case 6: // State Tax Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stateWorked">State Worked *</Label>
                <Select value={formData.stateWorked} onValueChange={(value) => handleInputChange('stateWorked', value)}>
                  <SelectTrigger className={errors.stateWorked ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    {/* Add all states */}
                  </SelectContent>
                </Select>
                {errors.stateWorked && <p className="text-red-500 text-sm mt-1">{errors.stateWorked}</p>}
              </div>
              <div>
                <Label htmlFor="stateLived">State Lived *</Label>
                <Select value={formData.stateLived} onValueChange={(value) => handleInputChange('stateLived', value)}>
                  <SelectTrigger className={errors.stateLived ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    {/* Add all states */}
                  </SelectContent>
                </Select>
                {errors.stateLived && <p className="text-red-500 text-sm mt-1">{errors.stateLived}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stateFilingStatus">State Filing Status</Label>
                <Select value={formData.stateFilingStatus} onValueChange={(value) => handleInputChange('stateFilingStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select filing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Head of Household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stateAllowances">State Allowances</Label>
                <Input
                  id="stateAllowances"
                  type="number"
                  min="0"
                  value={formData.stateAllowances}
                  onChange={(e) => handleInputChange('stateAllowances', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stateExtraWithholding">Additional State Withholding</Label>
              <Input
                id="stateExtraWithholding"
                type="number"
                step="0.01"
                value={formData.stateExtraWithholding}
                onChange={(e) => handleInputChange('stateExtraWithholding', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="stateExempt"
                checked={formData.stateExempt}
                onChange={(e) => handleInputChange('stateExempt', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="stateExempt">Employee is exempt from state withholding</Label>
            </div>
          </div>
        );

      case 7: // Benefits & Deductions
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="healthInsurance"
                      checked={formData.healthInsurance}
                      onChange={(e) => handleInputChange('healthInsurance', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="healthInsurance">Health Insurance</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dentalInsurance"
                      checked={formData.dentalInsurance}
                      onChange={(e) => handleInputChange('dentalInsurance', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="dentalInsurance">Dental Insurance</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lifeInsurance"
                      checked={formData.lifeInsurance}
                      onChange={(e) => handleInputChange('lifeInsurance', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="lifeInsurance">Life Insurance</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Retirement Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="retirementPlan"
                      checked={formData.retirementPlan}
                      onChange={(e) => handleInputChange('retirementPlan', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="retirementPlan">Enroll in 401(k) Plan</Label>
                  </div>
                  
                  {formData.retirementPlan && (
                    <>
                      <div>
                        <Label htmlFor="retirementPercent">Contribution Percentage</Label>
                        <Input
                          id="retirementPercent"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={formData.retirementPercent}
                          onChange={(e) => handleInputChange('retirementPercent', e.target.value)}
                          placeholder="5.0"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="retirementAmount">Or Fixed Amount</Label>
                        <Input
                          id="retirementAmount"
                          type="number"
                          step="0.01"
                          value={formData.retirementAmount}
                          onChange={(e) => handleInputChange('retirementAmount', e.target.value)}
                          placeholder="200.00"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 8: // Time Off
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sick Leave</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sickLeaveAccrual">Accrual Rate (hours per pay period)</Label>
                    <Input
                      id="sickLeaveAccrual"
                      type="number"
                      step="0.25"
                      value={formData.sickLeaveAccrual}
                      onChange={(e) => handleInputChange('sickLeaveAccrual', e.target.value)}
                      placeholder="4.0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sickHoursAvailable">Current Available Hours</Label>
                    <Input
                      id="sickHoursAvailable"
                      type="number"
                      step="0.25"
                      value={formData.sickHoursAvailable}
                      onChange={(e) => handleInputChange('sickHoursAvailable', parseFloat(e.target.value) || 0)}
                      placeholder="40.0"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vacation Leave</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vacationAccrual">Accrual Rate (hours per pay period)</Label>
                    <Input
                      id="vacationAccrual"
                      type="number"
                      step="0.25"
                      value={formData.vacationAccrual}
                      onChange={(e) => handleInputChange('vacationAccrual', e.target.value)}
                      placeholder="6.0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vacationHoursAvailable">Current Available Hours</Label>
                    <Input
                      id="vacationHoursAvailable"
                      type="number"
                      step="0.25"
                      value={formData.vacationHoursAvailable}
                      onChange={(e) => handleInputChange('vacationHoursAvailable', parseFloat(e.target.value) || 0)}
                      placeholder="80.0"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label htmlFor="personalDays">Personal Days per Year</Label>
              <Input
                id="personalDays"
                type="number"
                min="0"
                value={formData.personalDays}
                onChange={(e) => handleInputChange('personalDays', parseInt(e.target.value) || 0)}
                placeholder="3"
                className="w-32"
              />
            </div>
          </div>
        );

      case 9: // Direct Deposit
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="directDeposit"
                checked={formData.directDeposit}
                onChange={(e) => handleInputChange('directDeposit', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="directDeposit">Set up Direct Deposit</Label>
            </div>

            {formData.directDeposit && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={formData.routingNumber}
                      onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={formData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Checking">Checking</SelectItem>
                      <SelectItem value="Savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );

      case 10: // Review
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {formData.firstName} {formData.middleInitial} {formData.lastName}</div>
                  <div><strong>SSN:</strong> {formData.ssn}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Employee ID:</strong> {formData.employeeId}</div>
                  <div><strong>Hire Date:</strong> {formData.hireDate}</div>
                  <div><strong>Department:</strong> {formData.department}</div>
                  <div><strong>Job Title:</strong> {formData.jobTitle}</div>
                  <div><strong>Employment Type:</strong> {formData.employmentType}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payroll Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Pay Type:</strong> {formData.payType}</div>
                  {formData.payType === 'Salary' && (
                    <div><strong>Annual Salary:</strong> {formatCurrency(parseFloat(formData.salary) || 0)}</div>
                  )}
                  {formData.payType === 'Hourly' && (
                    <div><strong>Hourly Rate:</strong> ${formData.hourlyRate}/hour</div>
                  )}
                  <div><strong>Pay Frequency:</strong> {formData.payFrequency}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Federal Filing Status:</strong> {formData.federalFilingStatus}</div>
                  <div><strong>Federal Allowances:</strong> {formData.federalAllowances}</div>
                  <div><strong>State Worked:</strong> {formData.stateWorked}</div>
                  <div><strong>State Lived:</strong> {formData.stateLived}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Required Documents Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="w4OnFile"
                    checked={formData.w4OnFile}
                    onChange={(e) => handleInputChange('w4OnFile', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="w4OnFile">W-4 Form on file</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="i9OnFile"
                    checked={formData.i9OnFile}
                    onChange={(e) => handleInputChange('i9OnFile', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="i9OnFile">I-9 Form on file</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="backgroundCheck"
                    checked={formData.backgroundCheck}
                    onChange={(e) => handleInputChange('backgroundCheck', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="backgroundCheck">Background check completed</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any additional notes about this employee..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/payroll')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payroll
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Setup</h1>
            <p className="text-gray-600">Complete employee onboarding and payroll setup</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Step {currentStep} of {steps.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <Progress value={(currentStep / steps.length) * 100} className="w-full" />
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {steps.map((step) => {
              const IconComponent = step.icon;
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = currentStep === step.id;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center p-2 rounded-lg text-center cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 text-blue-700'
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <IconComponent className="w-6 h-6 mb-1" />
                  <div className="text-xs font-medium">{step.title}</div>
                  {isCompleted && <CheckCircle className="w-4 h-4 mt-1" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 mr-2" })}
            {steps[currentStep - 1].title}
          </CardTitle>
          <div className="text-sm text-gray-600">{steps[currentStep - 1].description}</div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => console.log('Saving draft...', formData)}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              {currentStep < 10 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Employee
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSetup;