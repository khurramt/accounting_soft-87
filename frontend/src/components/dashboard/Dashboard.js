import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
  Settings
} from "lucide-react";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState("this-month");
  const { currentCompany } = useCompany();
  const navigate = useNavigate();

  const quickActions = [
    { title: "Create Invoice", path: "/customers/invoice/new", icon: FileText, color: "bg-blue-500" },
    { title: "Receive Payment", path: "/customers/payments/new", icon: DollarSign, color: "bg-green-500" },
    { title: "Write Check", path: "/vendors/checks/new", icon: FileText, color: "bg-red-500" },
    { title: "Enter Bill", path: "/vendors/bills/new", icon: FileText, color: "bg-orange-500" }
  ];

  const dashboardStats = [
    {
      title: "Total Income",
      value: "$24,530.00",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Total Expenses", 
      value: "$18,240.00",
      change: "+8.2%",
      trend: "up",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Net Income",
      value: "$6,290.00",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Outstanding Invoices",
      value: "$4,250.50",
      change: "-5.2%",
      trend: "down",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const recentTransactions = [
    {
      id: "1",
      type: "Invoice",
      customer: "ABC Company",
      date: "2024-01-15",
      amount: 1500.00,
      status: "Paid"
    },
    {
      id: "2",
      type: "Payment",
      customer: "XYZ Corporation",
      date: "2024-01-14",
      amount: 750.00,
      status: "Deposited"
    },
    {
      id: "3",
      type: "Bill",
      vendor: "Office Supplies Co",
      date: "2024-01-13",
      amount: 850.00,
      status: "Unpaid"
    },
    {
      id: "4",
      type: "Check",
      vendor: "Tech Solutions Inc",
      date: "2024-01-12",
      amount: 1200.00,
      status: "Cleared"
    }
  ];

  const upcomingItems = [
    {
      type: "Invoice Due",
      description: "ABC Company - INV-001",
      date: "2024-01-20",
      amount: 1500.00,
      priority: "high"
    },
    {
      type: "Bill Due",
      description: "Office Supplies Co - OS-2024-001",
      date: "2024-01-22",
      amount: 850.00,
      priority: "medium"
    },
    {
      type: "Payroll",
      description: "Employee payroll processing",
      date: "2024-01-25",
      amount: 8500.00,
      priority: "high"
    }
  ];

  const alerts = [
    {
      type: "warning",
      message: "3 overdue invoices requiring attention",
      action: "View Details"
    },
    {
      type: "info",
      message: "Monthly sales tax filing due soon",
      action: "File Now"
    },
    {
      type: "success",
      message: "Bank reconciliation completed for December",
      action: "View Report"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentCompany?.name || "Company"}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
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
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current (0-30 days)</span>
                    <span className="font-semibold">$2,500.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">31-60 days</span>
                    <span className="font-semibold">$1,250.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">61-90 days</span>
                    <span className="font-semibold">$500.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Over 90 days</span>
                    <span className="font-semibold text-red-600">$300.00</span>
                  </div>
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
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">{transaction.type}</div>
                        <div className="text-sm text-gray-600">
                          {transaction.customer || transaction.vendor}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${transaction.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{transaction.date}</div>
                    </div>
                    <Badge 
                      variant={transaction.status === 'Paid' || transaction.status === 'Deposited' ? 'default' : 'secondary'}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Items</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500' : 
                        item.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${item.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{item.date}</div>
                    </div>
                  </div>
                ))}
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
                {alerts.map((alert, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;