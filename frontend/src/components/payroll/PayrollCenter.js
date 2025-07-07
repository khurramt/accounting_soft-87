import React, { useState } from "react";
import { mockEmployees } from "../../data/mockData";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  DollarSign, 
  Users, 
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  Play,
  Clock,
  Calculator
} from "lucide-react";

const PayrollCenter = () => {
  const [payrollSummary] = useState({
    totalEmployees: mockEmployees.length,
    nextPayDate: "2024-01-31",
    monthlyPayroll: 12500.00,
    ytdPayroll: 12500.00,
    pendingTimeSheets: 2
  });

  const [upcomingPayroll] = useState([
    {
      id: "1",
      payPeriod: "January 16-31, 2024",
      payDate: "2024-01-31",
      employees: 2,
      estimatedTotal: 6250.00,
      status: "Pending"
    }
  ]);

  const [recentPayrolls] = useState([
    {
      id: "1",
      payPeriod: "January 1-15, 2024",
      payDate: "2024-01-15",
      employees: 2,
      total: 6250.00,
      status: "Completed"
    },
    {
      id: "2",
      payPeriod: "December 16-31, 2023",
      payDate: "2023-12-31",
      employees: 2,
      total: 6250.00,
      status: "Completed"
    }
  ]);

  const handleRunPayroll = () => {
    console.log("Running payroll");
  };

  const handleAddEmployee = () => {
    console.log("Adding new employee");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Center</h1>
          <p className="text-gray-600">Manage employee payroll and benefits</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleRunPayroll}>
            <Play className="w-4 h-4 mr-2" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold">{payrollSummary.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Next Pay Date</p>
                <p className="text-lg font-semibold">{payrollSummary.nextPayDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Monthly Payroll</p>
                <p className="text-lg font-semibold">${payrollSummary.monthlyPayroll.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">YTD Payroll</p>
                <p className="text-lg font-semibold">${payrollSummary.ytdPayroll.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Timesheets</p>
                <p className="text-2xl font-bold">{payrollSummary.pendingTimeSheets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {payrollSummary.pendingTimeSheets > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Action Required</p>
                <p className="text-sm text-orange-700">
                  {payrollSummary.pendingTimeSheets} employee(s) have pending timesheets that need approval before running payroll.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Review Timesheets
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="payroll" className="w-full">
        <TabsList>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payroll" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Payroll */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payroll</CardTitle>
                <CardDescription>Scheduled payroll runs</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingPayroll.map((payroll) => (
                  <div key={payroll.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{payroll.payPeriod}</h4>
                      <Badge variant="secondary">{payroll.status}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Pay Date: {payroll.payDate}</p>
                      <p>Employees: {payroll.employees}</p>
                      <p className="font-medium">Estimated Total: ${payroll.estimatedTotal.toFixed(2)}</p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" onClick={handleRunPayroll}>
                        <Play className="w-4 h-4 mr-1" />
                        Start Payroll
                      </Button>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Payrolls */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payrolls</CardTitle>
                <CardDescription>Previously completed payroll runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayrolls.map((payroll) => (
                    <div key={payroll.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{payroll.payPeriod}</h4>
                        <Badge variant="default">{payroll.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Pay Date: {payroll.payDate}</p>
                        <p>Employees: {payroll.employees}</p>
                        <p className="font-medium">Total: ${payroll.total.toFixed(2)}</p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Print Checks
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Employee List</CardTitle>
                <Button onClick={handleAddEmployee}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pay Type</TableHead>
                    <TableHead>Rate/Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.payType}</TableCell>
                      <TableCell>
                        {employee.payType === 'Salary' 
                          ? `$${employee.rate.toFixed(2)}/year` 
                          : `$${employee.rate.toFixed(2)}/hour`
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="liabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Liabilities</CardTitle>
              <CardDescription>Tax and benefit liabilities to be paid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No payroll liabilities to display</p>
                <p className="text-sm">Liabilities will appear after running payroll</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Forms</CardTitle>
              <CardDescription>Tax forms and compliance documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Form 941 - Quarterly</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Employer's quarterly federal tax return
                    </p>
                    <Button size="sm" variant="outline">
                      Prepare Form
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Form 940 - Annual</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Employer's annual FUTA tax return
                    </p>
                    <Button size="sm" variant="outline">
                      Prepare Form
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">W-2 Forms</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Annual wage and tax statements
                    </p>
                    <Button size="sm" variant="outline">
                      Generate W-2s
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">State Forms</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      State unemployment and tax forms
                    </p>
                    <Button size="sm" variant="outline">
                      View State Forms
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollCenter;