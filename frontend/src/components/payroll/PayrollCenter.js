import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockEmployees } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  DollarSign, 
  Users, 
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  Play,
  Clock,
  Calculator,
  Search,
  Edit,
  Eye,
  Download,
  CreditCard,
  Building,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Printer,
  Mail,
  Archive,
  UserPlus,
  ClipboardList,
  Briefcase
} from "lucide-react";

const PayrollCenter = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Enhanced payroll summary
  const [payrollSummary] = useState({
    totalEmployees: mockEmployees.length,
    activeEmployees: mockEmployees.filter(emp => emp.status === 'Active').length,
    nextPayDate: "2024-01-31",
    lastPayDate: "2024-01-15",
    monthlyPayroll: 12500.00,
    ytdPayroll: 12500.00,
    pendingTimeSheets: 2,
    unprocessedPayroll: 1,
    overduePayrollTax: 0,
    quarterlyPayrollTax: 3250.00
  });

  // Scheduled payroll runs
  const [scheduledPayrolls] = useState([
    {
      id: "1",
      payPeriod: "January 16-31, 2024",
      payDate: "2024-01-31",
      payType: "Regular",
      employees: 2,
      estimatedGross: 6250.00,
      estimatedTaxes: 1562.50,
      estimatedNet: 4687.50,
      status: "Scheduled",
      frequency: "Bi-weekly"
    },
    {
      id: "2", 
      payPeriod: "February 1-15, 2024",
      payDate: "2024-02-15",
      payType: "Regular",
      employees: 2,
      estimatedGross: 6250.00,
      estimatedTaxes: 1562.50,
      estimatedNet: 4687.50,
      status: "Draft",
      frequency: "Bi-weekly"
    }
  ]);

  // Recent payroll history
  const [recentPayrolls] = useState([
    {
      id: "PR-001",
      payPeriod: "January 1-15, 2024",
      payDate: "2024-01-15",
      payType: "Regular",
      employees: 2,
      grossPay: 6250.00,
      totalTaxes: 1562.50,
      netPay: 4687.50,
      status: "Completed",
      checksPrinted: true,
      directDeposits: 1
    },
    {
      id: "PR-002",
      payPeriod: "December 16-31, 2023",
      payDate: "2023-12-31",
      payType: "Regular",
      employees: 2,
      grossPay: 6250.00,
      totalTaxes: 1562.50,
      netPay: 4687.50,
      status: "Completed",
      checksPrinted: true,
      directDeposits: 1
    }
  ]);

  // Enhanced employee data with payroll info
  const [employees] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@company.com",
      ssn: "***-**-1234",
      payType: "Salary",
      rate: 75000.00,
      payFrequency: "Bi-weekly",
      status: "Active",
      hireDate: "2023-01-15",
      lastPayDate: "2024-01-15",
      ytdGross: 6250.00,
      ytdTaxes: 1562.50,
      directDeposit: true,
      federalFilingStatus: "Married",
      federalAllowances: 2,
      stateFilingStatus: "Married",
      sickHours: 40,
      vacationHours: 80
    },
    {
      id: "2",
      name: "Jane Doe",
      email: "jane.doe@company.com", 
      ssn: "***-**-5678",
      payType: "Hourly",
      rate: 25.00,
      payFrequency: "Bi-weekly",
      status: "Active",
      hireDate: "2023-03-01",
      lastPayDate: "2024-01-15",
      ytdGross: 4000.00,
      ytdTaxes: 1000.00,
      directDeposit: false,
      federalFilingStatus: "Single",
      federalAllowances: 1,
      stateFilingStatus: "Single",
      sickHours: 32,
      vacationHours: 24
    }
  ]);

  // Payroll liabilities
  const [payrollLiabilities] = useState([
    {
      vendor: "Federal Taxes",
      description: "Federal Withholding",
      period: "Q4 2023",
      dueDate: "2024-01-31",
      amount: 2500.00,
      status: "Due"
    },
    {
      vendor: "State Taxes",
      description: "State Withholding",
      period: "Q4 2023", 
      dueDate: "2024-01-31",
      amount: 750.00,
      status: "Due"
    },
    {
      vendor: "Social Security",
      description: "FICA Employee & Employer",
      period: "Q4 2023",
      dueDate: "2024-01-31",
      amount: 1240.00,
      status: "Paid"
    }
  ]);

  // Payroll forms
  const [payrollForms] = useState([
    {
      form: "941 - Quarterly",
      description: "Employer's Quarterly Federal Tax Return", 
      quarter: "Q4 2023",
      dueDate: "2024-01-31",
      status: "Ready to File",
      amount: 3250.00
    },
    {
      form: "940 - Annual",
      description: "Employer's Annual Federal Unemployment Tax Return",
      year: "2023",
      dueDate: "2024-01-31", 
      status: "In Progress",
      amount: 420.00
    },
    {
      form: "W-2 Forms",
      description: "Employee Wage and Tax Statements",
      year: "2023",
      dueDate: "2024-01-31",
      status: "Ready to Print",
      employeeCount: 2
    }
  ]);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Due': return 'bg-orange-100 text-orange-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Ready to File': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Ready to Print': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Center</h1>
          <p className="text-gray-600">Manage employees, payroll, and tax obligations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/payroll/setup')}>
            <Settings className="w-4 h-4 mr-2" />
            Payroll Setup
          </Button>
          <Button onClick={() => navigate('/payroll/run')}>
            <Play className="w-4 h-4 mr-2" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollSummary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {payrollSummary.activeEmployees} active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Pay Date</CardTitle>
            <Calendar className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollSummary.nextPayDate}</div>
            <p className="text-xs text-muted-foreground">
              {payrollSummary.unprocessedPayroll} pending payroll
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.monthlyPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              YTD: {formatCurrency(payrollSummary.ytdPayroll)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quarterly Tax</CardTitle>
            <Calculator className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.quarterlyPayrollTax)}</div>
            <p className="text-xs text-muted-foreground">
              {payrollSummary.overduePayrollTax === 0 ? 'No overdue taxes' : `${payrollSummary.overduePayrollTax} overdue`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => navigate('/payroll/run')}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Scheduled Payroll
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/employees/new')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Employee
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/time-tracking')}>
                  <Clock className="w-4 h-4 mr-2" />
                  Enter Employee Time
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/payroll/liabilities')}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Payroll Liabilities
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/payroll/forms')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Process Payroll Forms
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Payroll */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Upcoming Payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledPayrolls.slice(0, 3).map((payroll) => (
                  <div key={payroll.id} className="flex items-center justify-between p-3 border rounded-lg mb-3 last:mb-0">
                    <div>
                      <div className="font-medium">{payroll.payPeriod}</div>
                      <div className="text-sm text-gray-600">
                        Pay Date: {payroll.payDate} • {payroll.employees} employees
                      </div>
                      <div className="text-sm text-gray-600">
                        Estimated: {formatCurrency(payroll.estimatedGross)}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(payroll.status)}>
                        {payroll.status}
                      </Badge>
                      <div className="mt-1">
                        <Button size="sm" onClick={() => navigate(`/payroll/run/${payroll.id}`)}>
                          Process
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-2 text-purple-600" />
                Recent Payroll Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayrolls.slice(0, 3).map((payroll) => (
                  <div key={payroll.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{payroll.id} - {payroll.payPeriod}</div>
                      <div className="text-sm text-gray-600">
                        {payroll.employees} employees • Gross: {formatCurrency(payroll.grossPay)} • Net: {formatCurrency(payroll.netPay)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(payroll.status)}>
                        {payroll.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Employee Management
                </div>
                <Button onClick={() => navigate('/employees/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Pay Type</TableHead>
                    <TableHead>Rate/Salary</TableHead>
                    <TableHead>YTD Gross</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-600">{employee.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {employee.payType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.payType === 'Salary' 
                          ? formatCurrency(employee.rate)
                          : `$${employee.rate.toFixed(2)}/hr`
                        }
                      </TableCell>
                      <TableCell>{formatCurrency(employee.ytdGross)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/employees/${employee.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/employees/${employee.id}/edit`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Scheduled Payrolls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledPayrolls.map((payroll) => (
                    <div key={payroll.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{payroll.payPeriod}</div>
                        <Badge className={getStatusColor(payroll.status)}>
                          {payroll.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Pay Date: {payroll.payDate}</div>
                        <div>Employees: {payroll.employees}</div>
                        <div>Estimated Gross: {formatCurrency(payroll.estimatedGross)}</div>
                        <div>Estimated Net: {formatCurrency(payroll.estimatedNet)}</div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" onClick={() => navigate(`/payroll/run/${payroll.id}`)}>
                          <Play className="w-4 h-4 mr-1" />
                          Process
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Payrolls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayrolls.map((payroll) => (
                    <div key={payroll.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{payroll.id}</div>
                        <Badge className={getStatusColor(payroll.status)}>
                          {payroll.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Period: {payroll.payPeriod}</div>
                        <div>Employees: {payroll.employees}</div>
                        <div>Gross Pay: {formatCurrency(payroll.grossPay)}</div>
                        <div>Net Pay: {formatCurrency(payroll.netPay)}</div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Reports
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Liabilities Tab */}
        <TabsContent value="liabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
                  Payroll Liabilities
                </div>
                <Button onClick={() => navigate('/payroll/liabilities/pay')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Liabilities
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor/Agency</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollLiabilities.map((liability, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{liability.vendor}</TableCell>
                      <TableCell>{liability.description}</TableCell>
                      <TableCell>{liability.period}</TableCell>
                      <TableCell>{liability.dueDate}</TableCell>
                      <TableCell>{formatCurrency(liability.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(liability.status)}>
                          {liability.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {liability.status === 'Due' && (
                            <Button size="sm">
                              <DollarSign className="w-4 h-4 mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Payroll Tax Forms
              </CardTitle>
              <CardDescription>
                Manage quarterly and annual payroll tax forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollForms.map((form, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{form.form}</div>
                      <div className="text-sm text-gray-600">{form.description}</div>
                      <div className="text-sm text-gray-600">
                        {form.quarter && `Quarter: ${form.quarter}`}
                        {form.year && `Year: ${form.year}`}
                        {form.amount && ` • Amount: ${formatCurrency(form.amount)}`}
                        {form.employeeCount && ` • Employees: ${form.employeeCount}`}
                      </div>
                      <div className="text-sm text-gray-600">Due: {form.dueDate}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(form.status)}>
                        {form.status}
                      </Badge>
                      <div className="flex space-x-1">
                        {form.status === 'Ready to Print' && (
                          <Button size="sm">
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                          </Button>
                        )}
                        {form.status === 'Ready to File' && (
                          <Button size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            File
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Payroll Reports
              </CardTitle>
              <CardDescription>
                Access payroll and employee reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Payroll Summary", description: "Summary of payroll by employee", category: "Summary" },
                  { name: "Payroll Detail Review", description: "Detailed payroll information", category: "Detail" },
                  { name: "Employee Contact List", description: "Employee contact information", category: "List" },
                  { name: "Payroll Tax and Wage Summary", description: "Tax and wage summary by employee", category: "Tax" },
                  { name: "Employee State Taxes Detail", description: "State tax details by employee", category: "Tax" },
                  { name: "Vacation and Sick Leave", description: "Employee leave balances", category: "Summary" }
                ].map((report, index) => (
                  <Card key={index} className="border hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{report.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {report.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => navigate(`/reports/customize?report=${encodeURIComponent(report.name)}&category=Payroll`)}>
                            <Play className="w-4 h-4 mr-1" />
                            Run
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollCenter;