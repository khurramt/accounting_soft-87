import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  FileText,
  Download,
  Printer,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Users,
  DollarSign,
  Calculator,
  Eye,
  Upload,
  Settings,
  Filter,
  Search
} from 'lucide-react';

const PayrollForms = () => {
  const [selectedForms, setSelectedForms] = useState([]);
  const [formDialog, setFormDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const payrollForms = [
    {
      id: 'form-941-q1',
      formNumber: '941',
      title: 'Employer\'s Quarterly Federal Tax Return',
      type: 'quarterly',
      period: 'Q1 2024',
      dueDate: '2024-04-30',
      status: 'pending',
      priority: 'high',
      totalWages: 48000.00,
      federalTax: 7200.00,
      socialSecurity: 2976.00,
      medicare: 696.00,
      description: 'Quarterly federal tax return for Q1 2024',
      canFile: true,
      isOverdue: false
    },
    {
      id: 'form-940-annual',
      formNumber: '940',
      title: 'Employer\'s Annual Federal Unemployment Tax Return',
      type: 'annual',
      period: '2023',
      dueDate: '2024-01-31',
      status: 'filed',
      priority: 'high',
      totalWages: 180000.00,
      unemploymentTax: 1080.00,
      description: 'Annual federal unemployment tax return for 2023',
      canFile: false,
      isOverdue: false,
      filedDate: '2024-01-25'
    },
    {
      id: 'w2-2023',
      formNumber: 'W-2',
      title: 'Wage and Tax Statement',
      type: 'annual',
      period: '2023',
      dueDate: '2024-01-31',
      status: 'completed',
      priority: 'high',
      employeeCount: 8,
      totalWages: 180000.00,
      description: 'Employee W-2 forms for tax year 2023',
      canFile: false,
      isOverdue: false,
      completedDate: '2024-01-15'
    },
    {
      id: 'w3-2023',
      formNumber: 'W-3',
      title: 'Transmittal of Wage and Tax Statements',
      type: 'annual',
      period: '2023',
      dueDate: '2024-02-28',
      status: 'filed',
      priority: 'high',
      employeeCount: 8,
      totalWages: 180000.00,
      description: 'W-3 transmittal form for 2023 W-2s',
      canFile: false,
      isOverdue: false,
      filedDate: '2024-02-15'
    },
    {
      id: 'state-de88-q1',
      formNumber: 'DE 88',
      title: 'State Disability Insurance Report',
      type: 'quarterly',
      period: 'Q1 2024',
      dueDate: '2024-04-30',
      status: 'draft',
      priority: 'medium',
      totalWages: 48000.00,
      sdiTax: 480.00,
      description: 'California State Disability Insurance quarterly report',
      canFile: true,
      isOverdue: false
    },
    {
      id: 'state-ui3-q1',
      formNumber: 'UI-3',
      title: 'State Unemployment Insurance Report',
      type: 'quarterly',
      period: 'Q1 2024',
      dueDate: '2024-04-30',
      status: 'pending',
      priority: 'medium',
      totalWages: 48000.00,
      unemploymentTax: 1440.00,
      description: 'State unemployment insurance quarterly report',
      canFile: true,
      isOverdue: false
    },
    {
      id: 'local-lpt-q1',
      formNumber: 'LPT-100',
      title: 'Local Payroll Tax Return',
      type: 'quarterly',
      period: 'Q1 2024',
      dueDate: '2024-05-15',
      status: 'not_started',
      priority: 'low',
      totalWages: 48000.00,
      localTax: 240.00,
      description: 'City payroll tax quarterly return',
      canFile: false,
      isOverdue: false
    }
  ];

  const formTemplates = [
    {
      id: 'template-941',
      formNumber: '941',
      title: 'Form 941 Template',
      description: 'Quarterly federal tax return template',
      isRecurring: true
    },
    {
      id: 'template-940',
      formNumber: '940',
      title: 'Form 940 Template',
      description: 'Annual federal unemployment tax return template',
      isRecurring: true
    },
    {
      id: 'template-w2',
      formNumber: 'W-2',
      title: 'W-2 Form Template',
      description: 'Employee wage and tax statement template',
      isRecurring: true
    }
  ];

  const filteredForms = payrollForms.filter(form => {
    if (filterStatus !== 'all' && form.status !== filterStatus) return false;
    if (filterType !== 'all' && form.type !== filterType) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'filed': return 'bg-purple-100 text-purple-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'filed': return <Send className="w-4 h-4" />;
      case 'not_started': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleFormAction = (formId, action) => {
    console.log(`Performing ${action} on form ${formId}`);
    // Implement form actions
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setFormDialog(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Forms</h1>
          <p className="text-gray-600">Manage your payroll tax forms and filings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Form Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Forms</p>
                <p className="text-2xl font-bold text-orange-600">
                  {payrollForms.filter(f => f.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft Forms</p>
                <p className="text-2xl font-bold text-blue-600">
                  {payrollForms.filter(f => f.status === 'draft').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Filed This Quarter</p>
                <p className="text-2xl font-bold text-green-600">
                  {payrollForms.filter(f => f.status === 'filed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tax Liability</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    payrollForms.reduce((sum, f) => sum + (f.federalTax || f.sdiTax || f.unemploymentTax || f.localTax || 0), 0)
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forms">Current Forms</TabsTrigger>
          <TabsTrigger value="templates">Form Templates</TabsTrigger>
          <TabsTrigger value="history">Filing History</TabsTrigger>
        </TabsList>

        {/* Current Forms Tab */}
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Payroll Forms</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Forms
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="Search forms..." 
                      className="pl-9"
                    />
                  </div>
                </div>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="filed">Filed</option>
                  <option value="not_started">Not Started</option>
                </select>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Types</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Forms List */}
              <div className="space-y-3">
                {filteredForms.map((form) => (
                  <div 
                    key={form.id} 
                    className={`flex items-center space-x-4 p-4 border rounded-lg transition-all hover:shadow-md ${
                      form.isOverdue ? 'border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(form.status)}
                          <span className="font-medium">Form {form.formNumber}</span>
                        </div>
                        <div className="text-sm text-gray-600">{form.title}</div>
                        <div className="text-sm text-gray-500">{form.description}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium">{form.period}</div>
                        <div className="text-sm text-gray-600">Due: {form.dueDate}</div>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(form.priority)}`}>
                          {form.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <Badge className={getStatusColor(form.status)}>
                          {form.status.replace('_', ' ').charAt(0).toUpperCase() + form.status.replace('_', ' ').slice(1)}
                        </Badge>
                        {form.filedDate && (
                          <div className="text-xs text-gray-500 mt-1">Filed: {form.filedDate}</div>
                        )}
                      </div>
                      
                      <div>
                        {form.totalWages && (
                          <div className="text-sm">
                            <div>Wages: {formatCurrency(form.totalWages)}</div>
                            {form.employeeCount && (
                              <div className="text-gray-600">Employees: {form.employeeCount}</div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {(form.federalTax || form.sdiTax || form.unemploymentTax || form.localTax) && (
                          <div className="text-sm font-medium">
                            Tax: {formatCurrency(
                              form.federalTax || form.sdiTax || form.unemploymentTax || form.localTax || 0
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewForm(form)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {form.canFile && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleFormAction(form.id, 'edit')}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleFormAction(form.id, 'print')}
                            >
                              <Print className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleFormAction(form.id, 'download')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Form Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Form {template.formNumber}</CardTitle>
                        {template.isRecurring && (
                          <Badge variant="outline">Recurring</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filing History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Filing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payrollForms.filter(f => f.status === 'filed' || f.status === 'completed').map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Form {form.formNumber} - {form.period}</div>
                        <div className="text-sm text-gray-600">{form.title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {form.filedDate ? `Filed: ${form.filedDate}` : `Completed: ${form.completedDate}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {form.totalWages && `Wages: ${formatCurrency(form.totalWages)}`}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Detail Dialog */}
      <Dialog open={formDialog} onOpenChange={setFormDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedForm && `Form ${selectedForm.formNumber} - ${selectedForm.period}`}
            </DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Form Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Form Number:</span>
                      <span className="font-medium">{selectedForm.formNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Period:</span>
                      <span className="font-medium">{selectedForm.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="font-medium">{selectedForm.dueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedForm.status)}>
                        {selectedForm.status.replace('_', ' ').charAt(0).toUpperCase() + selectedForm.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Financial Summary</h3>
                  <div className="space-y-2 text-sm">
                    {selectedForm.totalWages && (
                      <div className="flex justify-between">
                        <span>Total Wages:</span>
                        <span className="font-medium">{formatCurrency(selectedForm.totalWages)}</span>
                      </div>
                    )}
                    {selectedForm.federalTax && (
                      <div className="flex justify-between">
                        <span>Federal Tax:</span>
                        <span className="font-medium">{formatCurrency(selectedForm.federalTax)}</span>
                      </div>
                    )}
                    {selectedForm.socialSecurity && (
                      <div className="flex justify-between">
                        <span>Social Security:</span>
                        <span className="font-medium">{formatCurrency(selectedForm.socialSecurity)}</span>
                      </div>
                    )}
                    {selectedForm.medicare && (
                      <div className="flex justify-between">
                        <span>Medicare:</span>
                        <span className="font-medium">{formatCurrency(selectedForm.medicare)}</span>
                      </div>
                    )}
                    {selectedForm.unemploymentTax && (
                      <div className="flex justify-between">
                        <span>Unemployment Tax:</span>
                        <span className="font-medium">{formatCurrency(selectedForm.unemploymentTax)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setFormDialog(false)}>
                  Close
                </Button>
                {selectedForm.canFile && (
                  <>
                    <Button variant="outline">
                      <Print className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      File Form
                    </Button>
                  </>
                )}
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollForms;