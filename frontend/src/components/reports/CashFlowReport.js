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
  Download,
  Printer,
  Share,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

const CashFlowReport = () => {
  const [reportType, setReportType] = useState('statement'); // 'statement' or 'forecast'
  const [dateRange, setDateRange] = useState('current-month');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('none');

  const cashFlowData = {
    statement: {
      operatingActivities: [
        { description: 'Net Income', amount: 12500.00 },
        { description: 'Depreciation', amount: 1200.00 },
        { description: 'Accounts Receivable Decrease', amount: 2300.00 },
        { description: 'Accounts Payable Increase', amount: 1800.00 },
        { description: 'Inventory Increase', amount: -1500.00 },
        { description: 'Prepaid Expenses Increase', amount: -800.00 }
      ],
      investingActivities: [
        { description: 'Equipment Purchase', amount: -5000.00 },
        { description: 'Computer System Upgrade', amount: -2500.00 },
        { description: 'Office Furniture', amount: -1200.00 }
      ],
      financingActivities: [
        { description: 'Bank Loan Proceeds', amount: 10000.00 },
        { description: 'Loan Payment', amount: -1500.00 },
        { description: 'Owner Draws', amount: -3000.00 }
      ]
    },
    forecast: {
      projectedInflows: [
        { description: 'Expected Customer Payments', amount: 25000.00, date: '2024-02-15' },
        { description: 'Service Revenue', amount: 8500.00, date: '2024-02-28' },
        { description: 'Product Sales', amount: 12000.00, date: '2024-03-15' },
        { description: 'Consulting Income', amount: 6000.00, date: '2024-03-30' }
      ],
      projectedOutflows: [
        { description: 'Rent Payment', amount: -2500.00, date: '2024-02-01' },
        { description: 'Payroll', amount: -8000.00, date: '2024-02-15' },
        { description: 'Utilities', amount: -450.00, date: '2024-02-20' },
        { description: 'Supplier Payments', amount: -3200.00, date: '2024-02-25' },
        { description: 'Loan Payment', amount: -1500.00, date: '2024-02-28' }
      ]
    }
  };

  const calculateTotal = (activities) => {
    return activities.reduce((total, activity) => total + activity.amount, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const operatingTotal = calculateTotal(cashFlowData.statement.operatingActivities);
  const investingTotal = calculateTotal(cashFlowData.statement.investingActivities);
  const financingTotal = calculateTotal(cashFlowData.statement.financingActivities);
  const netCashFlow = operatingTotal + investingTotal + financingTotal;

  const forecastInflows = calculateTotal(cashFlowData.forecast.projectedInflows);
  const forecastOutflows = calculateTotal(cashFlowData.forecast.projectedOutflows);
  const forecastNet = forecastInflows + forecastOutflows;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow Reports</h1>
          <p className="text-gray-600">Analyze your cash flow and forecast future liquidity</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Print className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="statement">Statement of Cash Flows</option>
                <option value="forecast">Cash Flow Forecast</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="quarter">Current Quarter</option>
                <option value="year">Current Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comparison</label>
              <select 
                value={comparisonPeriod} 
                onChange={(e) => setComparisonPeriod(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="none">None</option>
                <option value="previous-period">Previous Period</option>
                <option value="previous-year">Previous Year</option>
                <option value="budget">Budget</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statement">Statement of Cash Flows</TabsTrigger>
          <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
        </TabsList>

        {/* Statement of Cash Flows */}
        <TabsContent value="statement">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Operating Activities</p>
                      <p className={`text-2xl font-bold ${operatingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(operatingTotal)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Investing Activities</p>
                      <p className={`text-2xl font-bold ${investingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(investingTotal)}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Financing Activities</p>
                      <p className={`text-2xl font-bold ${financingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(financingTotal)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Net Cash Flow</p>
                      <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netCashFlow)}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Cash Flow Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Statement of Cash Flows</CardTitle>
                <p className="text-sm text-gray-600">For the period January 1, 2024 - January 31, 2024</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Operating Activities */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Cash Flows from Operating Activities</h3>
                    <div className="space-y-2">
                      {cashFlowData.statement.operatingActivities.map((activity, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">{activity.description}</span>
                          <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 font-bold border-t-2">
                        <span>Net Cash from Operating Activities</span>
                        <span className={operatingTotal >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(operatingTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Investing Activities */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Cash Flows from Investing Activities</h3>
                    <div className="space-y-2">
                      {cashFlowData.statement.investingActivities.map((activity, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">{activity.description}</span>
                          <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 font-bold border-t-2">
                        <span>Net Cash from Investing Activities</span>
                        <span className={investingTotal >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(investingTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financing Activities */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Cash Flows from Financing Activities</h3>
                    <div className="space-y-2">
                      {cashFlowData.statement.financingActivities.map((activity, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">{activity.description}</span>
                          <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 font-bold border-t-2">
                        <span>Net Cash from Financing Activities</span>
                        <span className={financingTotal >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(financingTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Change in Cash */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Net Change in Cash and Cash Equivalents</span>
                      <span className={netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(netCashFlow)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cash Flow Forecast */}
        <TabsContent value="forecast">
          <div className="space-y-6">
            {/* Forecast Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Projected Inflows</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(forecastInflows)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Projected Outflows</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(Math.abs(forecastOutflows))}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Net Forecast</p>
                      <p className={`text-2xl font-bold ${forecastNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(forecastNet)}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projected Cash Flows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Projected Cash Inflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cashFlowData.forecast.projectedInflows.map((flow, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium">{flow.description}</div>
                          <div className="text-sm text-gray-600">{flow.date}</div>
                        </div>
                        <div className="font-bold text-green-600">
                          {formatCurrency(flow.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Projected Cash Outflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cashFlowData.forecast.projectedOutflows.map((flow, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium">{flow.description}</div>
                          <div className="text-sm text-gray-600">{flow.date}</div>
                        </div>
                        <div className="font-bold text-red-600">
                          {formatCurrency(Math.abs(flow.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-gray-600">
                    <LineChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Interactive cash flow timeline will be displayed here</p>
                    <p className="text-sm">Showing projected cash position over time</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold">Week 1</div>
                      <div className="text-green-600">+$12,450</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold">Week 2</div>
                      <div className="text-red-600">-$8,200</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold">Week 3</div>
                      <div className="text-green-600">+$15,750</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold">Week 4</div>
                      <div className="text-red-600">-$5,100</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowReport;