import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { 
  Calendar,
  DollarSign,
  Users,
  Calculator,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Eye,
  Play,
  Pause,
  Save,
  Download,
  Printer,
  Mail,
  ArrowLeft,
  ArrowRight,
  FileText,
  CreditCard,
  Building,
  RefreshCw,
  Settings,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Briefcase
} from "lucide-react";

const RunPayroll = () => {
  const navigate = useNavigate();
  const { payrollId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [payrollStatus, setPayrollStatus] = useState("setup"); // setup, preview, processing, completed
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Mock payroll data
  const [payrollRun] = useState({
    id: payrollId || "PR-2024-003",
    payPeriod: "January 16-31, 2024",
    payDate: "2024-01-31",
    checkDate: "2024-01-31",
    frequency: "Bi-weekly",
    employees: 2,
    totalGross: 6250.00,
    totalTaxes: 1562.50,
    totalDeductions: 125.00,
    totalNet: 4562.50,
    status: "Draft"
  });

  const [employees] = useState([
    {
      id: "1",
      name: "John Smith",
      employeeId: "EMP001",
      payType: "Salary",
      basePay: 75000.00,
      payPeriodPay: 2884.62,
      regularHours: 80.0,
      overtimeHours: 0.0,
      sickHours: 0.0,
      vacationHours: 8.0,
      holidayHours: 0.0,
      bonuses: 0.0,
      commissions: 0.0,
      grossPay: 2884.62,
      federalTax: 462.50,
      stateTax: 138.75,
      socialSecurity: 178.85,
      medicare: 41.83,
      sdi: 28.85,
      healthInsurance: 125.00,
      retirement401k: 144.23,
      totalDeductions: 1119.91,
      netPay: 1764.71,
      isSelected: true,
      hasTimesheet: true,
      timesheetApproved: true,
      directDeposit: true,
      bankAccount: "****1234"
    },
    {
      id: "2",
      name: "Jane Doe",
      employeeId: "EMP002",
      payType: "Hourly",
      hourlyRate: 25.00,
      regularHours: 75.0,
      overtimeHours: 5.0,
      sickHours: 3.0,
      vacationHours: 0.0,
      holidayHours: 0.0,
      bonuses: 0.0,
      commissions: 0.0,
      grossPay: 2062.50,
      federalTax: 330.00,
      stateTax: 99.00,
      socialSecurity: 127.88,
      medicare: 29.91,
      sdi: 20.63,
      healthInsurance: 0.00,
      retirement401k: 0.00,
      totalDeductions: 607.42,
      netPay: 1455.08,
      isSelected: true,
      hasTimesheet: true,
      timesheetApproved: false,
      directDeposit: false,
      bankAccount: null
    }
  ]);

  const [payrollSettings] = useState({
    companyName: "Your Company Name",
    payrollAccount: "Business Checking - ****1234",
    defaultMemo: "Payroll for " + payrollRun.payPeriod,
    autoApproveTimesheets: false,
    requireManagerApproval: true,
    includeBenefits: true,
    includeTaxes: true
  });

  const steps = [
    { id: 1, title: "Setup", description: "Configure payroll parameters" },
    { id: 2, title: "Review Employees", description: "Select and review employees" },
    { id: 3, title: "Time & Earnings", description: "Review hours and earnings" },
    { id: 4, title: "Taxes & Deductions", description: "Calculate taxes and deductions" },
    { id: 5, title: "Preview", description: "Final review before processing" },
    { id: 6, title: "Process", description: "Generate paychecks and reports" }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleProcessPayroll = () => {
    setPayrollStatus("processing");
    setCurrentStep(6);
    
    // Simulate processing time
    setTimeout(() => {
      setPayrollStatus("completed");
    }, 3000);
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Setup
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pay Period Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Pay Period</Label>
                    <Input value={payrollRun.payPeriod} readOnly />
                  </div>
                  <div>
                    <Label>Pay Date</Label>
                    <Input type="date" value={payrollRun.payDate} />
                  </div>
                  <div>
                    <Label>Check Date</Label>
                    <Input type="date" value={payrollRun.checkDate} />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={payrollRun.frequency} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payroll Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Payroll Account</Label>
                    <Select value={payrollSettings.payrollAccount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business Checking - ****1234">Business Checking - ****1234</SelectItem>
                        <SelectItem value="Payroll Account - ****5678">Payroll Account - ****5678</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Memo</Label>
                    <Input value={payrollSettings.defaultMemo} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={payrollSettings.autoApproveTimesheets}
                        readOnly
                        className="rounded"
                      />
                      <Label>Auto-approve timesheets</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={payrollSettings.requireManagerApproval}
                        readOnly
                        className="rounded"
                      />
                      <Label>Require manager approval</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={payrollSettings.includeBenefits}
                        readOnly
                        className="rounded"
                      />
                      <Label>Include benefits</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2: // Review Employees
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select Employees for Payroll</h3>
              <Badge variant="outline">
                {employees.filter(emp => emp.isSelected).length} of {employees.length} selected
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" className="rounded" defaultChecked />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Type</TableHead>
                  <TableHead>Timesheet</TableHead>
                  <TableHead>Direct Deposit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={employee.isSelected}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.payType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {employee.hasTimesheet ? (
                          employee.timesheetApproved ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-orange-600" />
                          )
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {employee.hasTimesheet
                            ? employee.timesheetApproved
                              ? "Approved"
                              : "Pending"
                            : "Missing"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {employee.directDeposit ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="text-sm">
                          {employee.directDeposit ? employee.bankAccount : "Paper Check"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {employees.some(emp => !emp.timesheetApproved) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some employees have unapproved timesheets. Please review and approve before continuing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 3: // Time & Earnings
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Time and Earnings</h3>

            <div className="space-y-4">
              {employees.filter(emp => emp.isSelected).map((employee) => (
                <Card key={employee.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5" />
                        <span>{employee.name}</span>
                        <Badge variant="outline">{employee.payType}</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Hours */}
                      <div>
                        <h4 className="font-medium mb-3">Hours</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Regular Hours:</span>
                            <span className="font-medium">{employee.regularHours}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overtime Hours:</span>
                            <span className="font-medium">{employee.overtimeHours}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sick Hours:</span>
                            <span className="font-medium">{employee.sickHours}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vacation Hours:</span>
                            <span className="font-medium">{employee.vacationHours}</span>
                          </div>
                        </div>
                      </div>

                      {/* Earnings */}
                      <div>
                        <h4 className="font-medium mb-3">Earnings</h4>
                        <div className="space-y-2">
                          {employee.payType === 'Salary' ? (
                            <div className="flex justify-between">
                              <span>Period Salary:</span>
                              <span className="font-medium">{formatCurrency(employee.payPeriodPay)}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span>Regular Pay:</span>
                                <span className="font-medium">{formatCurrency(employee.regularHours * employee.hourlyRate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Overtime Pay:</span>
                                <span className="font-medium">{formatCurrency(employee.overtimeHours * employee.hourlyRate * 1.5)}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span>Bonuses:</span>
                            <span className="font-medium">{formatCurrency(employee.bonuses)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commissions:</span>
                            <span className="font-medium">{formatCurrency(employee.commissions)}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-bold">
                            <span>Gross Pay:</span>
                            <span>{formatCurrency(employee.grossPay)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h4 className="font-medium mb-3">Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Gross Pay:</span>
                            <span className="font-medium">{formatCurrency(employee.grossPay)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Deductions:</span>
                            <span className="font-medium">-{formatCurrency(employee.totalDeductions)}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-bold text-green-600">
                            <span>Net Pay:</span>
                            <span>{formatCurrency(employee.netPay)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4: // Taxes & Deductions
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Tax and Deduction Details</h3>

            <div className="space-y-4">
              {employees.filter(emp => emp.isSelected).map((employee) => (
                <Card key={employee.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{employee.name}</span>
                      <Button size="sm" variant="outline">
                        <Calculator className="w-4 h-4 mr-2" />
                        Recalculate
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Taxes */}
                      <div>
                        <h4 className="font-medium mb-3 text-red-600">Taxes</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Federal Tax:</span>
                            <span className="font-medium">{formatCurrency(employee.federalTax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>State Tax:</span>
                            <span className="font-medium">{formatCurrency(employee.stateTax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Social Security:</span>
                            <span className="font-medium">{formatCurrency(employee.socialSecurity)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medicare:</span>
                            <span className="font-medium">{formatCurrency(employee.medicare)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>State Disability:</span>
                            <span className="font-medium">{formatCurrency(employee.sdi)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div>
                        <h4 className="font-medium mb-3 text-blue-600">Deductions</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Health Insurance:</span>
                            <span className="font-medium">{formatCurrency(employee.healthInsurance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>401(k):</span>
                            <span className="font-medium">{formatCurrency(employee.retirement401k)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Calculation */}
                      <div>
                        <h4 className="font-medium mb-3">Net Calculation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Gross Pay:</span>
                            <span className="font-medium">{formatCurrency(employee.grossPay)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Total Taxes:</span>
                            <span className="font-medium">
                              -{formatCurrency(employee.federalTax + employee.stateTax + employee.socialSecurity + employee.medicare + employee.sdi)}
                            </span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>Total Deductions:</span>
                            <span className="font-medium">
                              -{formatCurrency(employee.healthInsurance + employee.retirement401k)}
                            </span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-bold text-green-600 text-lg">
                            <span>Net Pay:</span>
                            <span>{formatCurrency(employee.netPay)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Totals Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payroll Totals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(payrollRun.totalGross)}</div>
                    <div className="text-sm text-gray-600">Total Gross</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">-{formatCurrency(payrollRun.totalTaxes)}</div>
                    <div className="text-sm text-gray-600">Total Taxes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">-{formatCurrency(payrollRun.totalDeductions)}</div>
                    <div className="text-sm text-gray-600">Total Deductions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(payrollRun.totalNet)}</div>
                    <div className="text-sm text-gray-600">Total Net</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5: // Preview
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Payroll Preview</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Preview Report
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Paychecks
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{payrollRun.employees}</div>
                  <div className="text-sm text-gray-600">Employees</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{formatCurrency(payrollRun.totalGross)}</div>
                  <div className="text-sm text-gray-600">Gross Pay</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Building className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{formatCurrency(payrollRun.totalTaxes)}</div>
                  <div className="text-sm text-gray-600">Total Taxes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{formatCurrency(payrollRun.totalNet)}</div>
                  <div className="text-sm text-gray-600">Net Pay</div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Regular Hours</TableHead>
                      <TableHead className="text-right">OT Hours</TableHead>
                      <TableHead className="text-right">Gross Pay</TableHead>
                      <TableHead className="text-right">Taxes</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead>Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.filter(emp => emp.isSelected).map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-600">{employee.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{employee.regularHours}</TableCell>
                        <TableCell className="text-right">{employee.overtimeHours}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(employee.grossPay)}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(employee.federalTax + employee.stateTax + employee.socialSecurity + employee.medicare + employee.sdi)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {formatCurrency(employee.healthInsurance + employee.retirement401k)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">{formatCurrency(employee.netPay)}</TableCell>
                        <TableCell>
                          {employee.directDeposit ? (
                            <Badge variant="default">Direct Deposit</Badge>
                          ) : (
                            <Badge variant="outline">Paper Check</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Final Confirmation */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Please review all information carefully. Once processed, payroll cannot be easily modified.
                This will generate {employees.filter(emp => emp.isSelected).length} paychecks and create corresponding journal entries.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 6: // Process
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">
                {payrollStatus === "processing" ? "Processing Payroll..." : "Payroll Completed!"}
              </h3>
              
              {payrollStatus === "processing" && (
                <div className="space-y-4">
                  <div className="animate-spin mx-auto w-12 h-12">
                    <Zap className="w-12 h-12 text-blue-600" />
                  </div>
                  <Progress value={75} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-gray-600">Generating paychecks and updating records...</p>
                </div>
              )}

              {payrollStatus === "completed" && (
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-green-700">Payroll processed successfully!</p>
                    <p className="text-sm text-gray-600">
                      {employees.filter(emp => emp.isSelected).length} paychecks generated for pay period {payrollRun.payPeriod}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {payrollStatus === "completed" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="w-full">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Paychecks
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Pay Stubs
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Reports
                </Button>
              </div>
            )}
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
            <h1 className="text-3xl font-bold text-gray-900">Run Payroll</h1>
            <p className="text-gray-600">{payrollRun.payPeriod} • Pay Date: {payrollRun.payDate}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {payrollRun.id}
          </Badge>
          <Badge variant={payrollRun.status === 'Draft' ? 'secondary' : 'default'}>
            {payrollRun.status}
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    getStepStatus(step.id) === 'completed'
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : getStepStatus(step.id) === 'current'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                >
                  {getStepStatus(step.id) === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-1 mx-2 ${
                      getStepStatus(step.id) === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="font-medium">{steps[currentStep - 1].title}</div>
            <div className="text-sm text-gray-600">{steps[currentStep - 1].description}</div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {payrollStatus !== "completed" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || payrollStatus === "processing"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" disabled={payrollStatus === "processing"}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                
                {currentStep < 5 ? (
                  <Button onClick={handleNext} disabled={payrollStatus === "processing"}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : currentStep === 5 ? (
                  <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogTrigger asChild>
                      <Button disabled={payrollStatus === "processing"}>
                        <Play className="w-4 h-4 mr-2" />
                        Process Payroll
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Payroll Processing</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to process this payroll? This action will:
                          <ul className="mt-2 list-disc list-inside space-y-1">
                            <li>Generate {employees.filter(emp => emp.isSelected).length} paychecks</li>
                            <li>Create journal entries for payroll expenses</li>
                            <li>Update employee YTD totals</li>
                            <li>Generate tax liability entries</li>
                          </ul>
                          <p className="mt-2 font-medium">This action cannot be easily undone.</p>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          setShowConfirmDialog(false);
                          handleProcessPayroll();
                        }}>
                          <Play className="w-4 h-4 mr-2" />
                          Process Payroll
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RunPayroll;