import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import dashboardService from "../../services/dashboardService";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  AlertCircle,
  Plus,
  Calendar,
  RefreshCw,
  Settings,
  Loader2
} from "lucide-react";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState("this-month");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const { currentCompany } = useCompany();
  const navigate = useNavigate();

  // Utility function to safely format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return '0.00';
    }
    return numValue.toFixed(2);
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!currentCompany?.company_id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [dashData, recentTxns, outstandingInvs, dashAlerts] = await Promise.all([
        dashboardService.getDashboardSummary(currentCompany.company_id, dateRange),
        dashboardService.getRecentTransactions(currentCompany.company_id, 5),
        dashboardService.getOutstandingInvoices(currentCompany.company_id, 5),
        dashboardService.getDashboardAlerts(currentCompany.company_id)
      ]);

      setDashboardData(dashData);
      setRecentTransactions(recentTxns.items || []);
      setOutstandingInvoices(outstandingInvs.items || []);
      setAlerts(dashAlerts);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadDashboardData();
  }, [currentCompany?.company_id, dateRange]);

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const quickActions = [
    { title: "Create Invoice", path: "/customers/invoice/new", icon: FileText, color: "bg-blue-500" },
    { title: "Receive Payment", path: "/customers/payments/new", icon: DollarSign, color: "bg-green-500" },
    { title: "Write Check", path: "/vendors/checks/new", icon: FileText, color: "bg-red-500" },
    { title: "Enter Bill", path: "/vendors/bills/new", icon: FileText, color: "bg-orange-500" }
  ];

  // Build dashboard stats from API data
  const dashboardStats = dashboardData ? [
    {
      title: "Total Income",
      value: `$${formatCurrency(dashboardData.stats.total_income.value)}`,
      change: dashboardData.stats.total_income.change,
      trend: dashboardData.stats.total_income.trend,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Total Expenses", 
      value: `$${formatCurrency(dashboardData.stats.total_expenses.value)}`,
      change: dashboardData.stats.total_expenses.change,
      trend: dashboardData.stats.total_expenses.trend,
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Net Income",
      value: `$${formatCurrency(dashboardData.stats.net_income.value)}`,
      change: dashboardData.stats.net_income.change,
      trend: dashboardData.stats.net_income.trend,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Outstanding Invoices",
      value: `$${formatCurrency(dashboardData.stats.outstanding_invoices.value)}`,
      change: dashboardData.stats.outstanding_invoices.change,
      trend: dashboardData.stats.outstanding_invoices.trend,
      icon: Users,
      color: "text-orange-600"
    }
  ] : [];

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentCompany?.name || "Company"}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!isLoading && dashboardStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate(action.path)}
              >
                <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>Your cash position over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Cash flow chart would display here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accounts Receivable</CardTitle>
                <CardDescription>Money owed to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.accounts_receivable && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current (0-30 days)</span>
                        <span className="font-semibold">${dashboardData.accounts_receivable.current.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">31-60 days</span>
                        <span className="font-semibold">${dashboardData.accounts_receivable.days_31_60.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">61-90 days</span>
                        <span className="font-semibold">${dashboardData.accounts_receivable.days_61_90.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Over 90 days</span>
                        <span className="font-semibold text-red-600">${dashboardData.accounts_receivable.over_90_days.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest business transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No recent transactions found</p>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.transaction_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">{transaction.transaction_type}</div>
                          <div className="text-sm text-gray-600">
                            {transaction.customer_name || transaction.vendor_name || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${formatCurrency(transaction.total_amount)}</div>
                        <div className="text-sm text-gray-600">{transaction.transaction_date}</div>
                      </div>
                      <Badge 
                        variant={transaction.status === 'Posted' ? 'default' : 'secondary'}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>Invoices awaiting payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outstandingInvoices.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No outstanding invoices found</p>
                ) : (
                  outstandingInvoices.map((invoice) => (
                    <div key={invoice.transaction_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <div>
                          <div className="font-medium">{invoice.transaction_number}</div>
                          <div className="text-sm text-gray-600">{invoice.customer_name || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${invoice.balance_due.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{invoice.due_date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No alerts at this time</p>
                ) : (
                  alerts.map((alert, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                      alert.type === 'warning' ? 'border-orange-500 bg-orange-50' :
                      alert.type === 'info' ? 'border-blue-500 bg-blue-50' :
                      'border-green-500 bg-green-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <AlertCircle className={`w-5 h-5 ${
                          alert.type === 'warning' ? 'text-orange-500' :
                          alert.type === 'info' ? 'text-blue-500' :
                          'text-green-500'
                        }`} />
                        <span>{alert.message}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        {alert.action}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;