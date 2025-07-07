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
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  FileText,
  Download,
  CreditCard,
  Bank,
  Calculator,
  Filter,
  Search,
  Plus
} from 'lucide-react';

const PayLiabilities = () => {
  const [selectedLiabilities, setSelectedLiabilities] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-quarter');

  const liabilities = [
    {
      id: 'fed-941-q1',
      vendor: 'IRS',
      type: 'Federal Income Tax',
      formNumber: '941',
      period: 'Q1 2024',
      dueDate: '2024-04-30',
      amount: 3250.75,
      status: 'overdue',
      priority: 'high',
      description: 'Quarterly Federal Income Tax',
      penaltyRisk: true
    },
    {
      id: 'state-sdi',
      vendor: 'State Employment Development',
      type: 'State Disability Insurance',
      formNumber: 'DE 88',
      period: 'Q1 2024',
      dueDate: '2024-04-30',
      amount: 890.50,
      status: 'due',
      priority: 'high',
      description: 'State Disability Insurance',
      penaltyRisk: false
    },
    {
      id: 'ss-medicare',
      vendor: 'Social Security Administration',
      type: 'Social Security & Medicare',
      formNumber: '941',
      period: 'March 2024',
      dueDate: '2024-04-15',
      amount: 2150.25,
      status: 'due',
      priority: 'medium',
      description: 'Employee & Employer SS/Medicare',
      penaltyRisk: false
    },
    {
      id: 'state-uit',
      vendor: 'State Unemployment Insurance',
      type: 'State Unemployment Tax',
      formNumber: 'UI-3',
      period: 'Q1 2024',
      dueDate: '2024-04-30',
      amount: 425.80,
      status: 'upcoming',
      priority: 'medium',
      description: 'State Unemployment Insurance Tax',
      penaltyRisk: false
    },
    {
      id: 'local-tax',
      vendor: 'City Tax Department',
      type: 'Local Payroll Tax',
      formNumber: 'LPT-100',
      period: 'Q1 2024',
      dueDate: '2024-05-15',
      amount: 185.40,
      status: 'upcoming',
      priority: 'low',
      description: 'City Payroll Tax',
      penaltyRisk: false
    },
    {
      id: 'workers-comp',
      vendor: 'Workers Compensation Insurance',
      type: 'Workers Compensation',
      formNumber: 'WC-1',
      period: 'Q1 2024',
      dueDate: '2024-05-01',
      amount: 750.00,
      status: 'paid',
      priority: 'medium',
      description: 'Workers Compensation Premium',
      penaltyRisk: false
    }
  ];

  const paymentMethods = [
    { id: 'eft', name: 'Electronic Funds Transfer (EFT)', fee: 0 },
    { id: 'eftps', name: 'Electronic Federal Tax Payment System', fee: 0 },
    { id: 'check', name: 'Check Payment', fee: 5.95 },
    { id: 'wire', name: 'Wire Transfer', fee: 25.00 }
  ];

  const filteredLiabilities = liabilities.filter(liability => {
    if (filterStatus === 'all') return true;
    return liability.status === filterStatus;
  });

  const totalAmount = selectedLiabilities.reduce((total, id) => {
    const liability = liabilities.find(l => l.id === id);
    return total + (liability ? liability.amount : 0);
  }, 0);

  const handleLiabilitySelect = (liabilityId) => {
    setSelectedLiabilities(prev => 
      prev.includes(liabilityId) 
        ? prev.filter(id => id !== liabilityId)
        : [...prev, liabilityId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'due': return 'bg-orange-100 text-orange-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pay Payroll Liabilities</h1>
          <p className="text-gray-600">Manage and pay your payroll tax obligations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Penalties
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(liabilities.filter(l => l.status === 'overdue').reduce((sum, l) => sum + l.amount, 0))}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due This Month</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(liabilities.filter(l => l.status === 'due').reduce((sum, l) => sum + l.amount, 0))}
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
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(liabilities.filter(l => l.status === 'upcoming').reduce((sum, l) => sum + l.amount, 0))}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid This Quarter</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(liabilities.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.amount, 0))}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payroll Liabilities</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={selectedLiabilities.length === 0}
                onClick={() => setPaymentDialog(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Selected ({selectedLiabilities.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search liabilities..." 
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
              <option value="overdue">Overdue</option>
              <option value="due">Due</option>
              <option value="upcoming">Upcoming</option>
              <option value="paid">Paid</option>
            </select>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="current-quarter">Current Quarter</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="current-year">Current Year</option>
              <option value="all">All Periods</option>
            </select>
          </div>

          {/* Liabilities List */}
          <div className="space-y-3">
            {filteredLiabilities.map((liability) => (
              <div 
                key={liability.id} 
                className={`flex items-center space-x-4 p-4 border rounded-lg transition-all ${
                  selectedLiabilities.includes(liability.id) ? 'border-green-500 bg-green-50' : 'border-gray-200'
                } ${liability.status === 'overdue' ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedLiabilities.includes(liability.id)}
                  onChange={() => handleLiabilitySelect(liability.id)}
                  className="w-4 h-4"
                  disabled={liability.status === 'paid'}
                />
                
                <div className="flex-1 grid grid-cols-6 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{liability.vendor}</span>
                    </div>
                    <div className="text-sm text-gray-600">{liability.type}</div>
                    <div className="text-sm text-gray-500">Form {liability.formNumber}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">{liability.period}</div>
                    <div className="text-sm text-gray-600">Due: {liability.dueDate}</div>
                  </div>
                  
                  <div>
                    <span className={`text-lg font-bold ${getPriorityColor(liability.priority)}`}>
                      {formatCurrency(liability.amount)}
                    </span>
                  </div>
                  
                  <div>
                    <Badge className={getStatusColor(liability.status)}>
                      {liability.status.charAt(0).toUpperCase() + liability.status.slice(1)}
                    </Badge>
                    {liability.penaltyRisk && (
                      <div className="flex items-center space-x-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">Penalty Risk</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(liability.priority)}`}>
                      {liability.priority.toUpperCase()} Priority
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                    {liability.status !== 'paid' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedLiabilities([liability.id]);
                          setPaymentDialog(true);
                        }}
                      >
                        <CreditCard className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedLiabilities.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Selected Liabilities Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pay Payroll Liabilities</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Selected Liabilities Summary */}
            <div>
              <h3 className="font-medium mb-3">Selected Liabilities</h3>
              <div className="space-y-2">
                {selectedLiabilities.map(id => {
                  const liability = liabilities.find(l => l.id === id);
                  return liability ? (
                    <div key={id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{liability.vendor} - {liability.type}</span>
                      <span className="font-medium">{formatCurrency(liability.amount)}</span>
                    </div>
                  ) : null;
                })}
                <div className="flex justify-between items-center p-2 border-t font-bold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Date</label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bank Account</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select Account</option>
                  <option value="checking">Business Checking - ****1234</option>
                  <option value="savings">Business Savings - ****5678</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={method.id}
                        defaultChecked={method.id === 'eft'}
                      />
                      <span>{method.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {method.fee > 0 ? `Fee: ${formatCurrency(method.fee)}` : 'No Fee'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Payroll tax payments are typically non-refundable. Please verify all information before proceeding.
                    Late payments may result in penalties and interest charges.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setPaymentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Process payment
                  console.log('Processing payment for:', selectedLiabilities);
                  setPaymentDialog(false);
                  setSelectedLiabilities([]);
                }}
              >
                Process Payment ({formatCurrency(totalAmount)})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayLiabilities;