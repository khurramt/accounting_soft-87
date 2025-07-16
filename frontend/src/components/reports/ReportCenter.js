import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Search, 
  BarChart3, 
  FileText, 
  Download,
  Eye,
  Star,
  Calendar,
  Filter,
  Settings,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Package,
  Briefcase,
  CreditCard,
  Calculator,
  FolderOpen,
  PieChart,
  Activity,
  FileSpreadsheet,
  Printer,
  Mail,
  Copy,
  Edit,
  Trash2,
  Play,
  Plus
} from "lucide-react";

const ReportCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Company & Financial");
  const [viewType, setViewType] = useState("grid");
  const navigate = useNavigate();

  // Comprehensive report categories with all QuickBooks reports
  const reportCategories = [
    {
      category: "Company & Financial",
      icon: TrendingUp,
      color: "text-blue-600",
      reports: [
        {
          name: "Profit & Loss",
          description: "Summary of income and expenses for a specific period",
          type: "Summary",
          popular: true,
          variants: ["Standard", "Detail", "Year-to-Date Comparison", "Previous Year Comparison", "By Job", "By Class", "By Month"]
        },
        {
          name: "Balance Sheet",
          description: "Assets, liabilities, and equity at a specific date",
          type: "Summary",
          popular: true,
          variants: ["Standard", "Detail", "Summary", "Previous Year Comparison"]
        },
        {
          name: "Statement of Cash Flows",
          description: "Cash receipts and payments during a specific period",
          type: "Summary",
          popular: false,
          variants: ["Standard", "Direct Method", "Indirect Method"]
        },
        {
          name: "Trial Balance",
          description: "List of all accounts with their balances",
          type: "Detail",
          popular: false,
          variants: ["Standard", "Previous Year Comparison"]
        },
        {
          name: "General Ledger",
          description: "All transactions for all accounts",
          type: "Detail",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Journal",
          description: "All journal entries in chronological order",
          type: "Detail",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Customers & Receivables",
      icon: Users,
      color: "text-green-600",
      reports: [
        {
          name: "A/R Aging Summary",
          description: "Outstanding customer balances by age",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Customer Balance Summary",
          description: "Balance for each customer",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Open Invoices",
          description: "All unpaid invoices",
          type: "Detail",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Collections Report",
          description: "Overdue invoices and collection information",
          type: "Detail",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Customer Contact List",
          description: "Customer names and contact information",
          type: "List",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Invoice List",
          description: "All invoices for a specified period",
          type: "List",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Sales",
      icon: DollarSign,
      color: "text-purple-600",
      reports: [
        {
          name: "Sales by Customer Summary",
          description: "Sales amounts by customer",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Sales by Item Summary",
          description: "Sales amounts by item",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Sales Tax Liability",
          description: "Sales tax collected and owed",
          type: "Summary",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Sales by Rep Summary",
          description: "Sales amounts by sales representative",
          type: "Summary",
          popular: false,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Monthly Sales Summary",
          description: "Sales totals by month",
          type: "Summary",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Vendors & Payables",
      icon: Building,
      color: "text-orange-600",
      reports: [
        {
          name: "A/P Aging Summary",
          description: "Outstanding vendor balances by age",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Vendor Balance Summary",
          description: "Balance for each vendor",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Unpaid Bills Detail",
          description: "All unpaid bills",
          type: "Detail",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Expenses by Vendor Summary",
          description: "Expense amounts by vendor",
          type: "Summary",
          popular: false,
          variants: ["Summary", "Detail"]
        },
        {
          name: "1099 Summary",
          description: "1099 information for vendors",
          type: "Summary",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Inventory",
      icon: Package,
      color: "text-red-600",
      reports: [
        {
          name: "Inventory Valuation Summary",
          description: "Inventory quantities and values",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Inventory Stock Status",
          description: "Quantity on hand, on order, and available",
          type: "Summary",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Physical Inventory Worksheet",
          description: "Worksheet for physical inventory counting",
          type: "Worksheet",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Pending Builds",
          description: "Inventory assemblies waiting to be built",
          type: "Detail",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Employees & Payroll",
      icon: Briefcase,
      color: "text-indigo-600",
      reports: [
        {
          name: "Payroll Summary",
          description: "Payroll totals by employee",
          type: "Summary",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Payroll Detail Review",
          description: "Detailed payroll information",
          type: "Detail",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Employee Contact List",
          description: "Employee names and contact information",
          type: "List",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Payroll Tax and Wage Summary",
          description: "Tax and wage information by employee",
          type: "Summary",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Jobs, Time & Mileage",
      icon: Clock,
      color: "text-teal-600",
      reports: [
        {
          name: "Time by Job Summary",
          description: "Time tracked by job",
          type: "Summary",
          popular: true,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Time by Name",
          description: "Time tracked by employee or vendor",
          type: "Summary",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Mileage by Job Summary",
          description: "Mileage tracked by job",
          type: "Summary",
          popular: false,
          variants: ["Summary", "Detail"]
        },
        {
          name: "Time by Item",
          description: "Time tracked by service item",
          type: "Summary",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Banking",
      icon: CreditCard,
      color: "text-cyan-600",
      reports: [
        {
          name: "Deposit Detail",
          description: "Details of all deposits",
          type: "Detail",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Check Detail",
          description: "Details of all checks written",
          type: "Detail",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Banking Summary",
          description: "Summary of banking activity",
          type: "Summary",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Reconciliation Discrepancy",
          description: "Discrepancies found during reconciliation",
          type: "Detail",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Accountant & Taxes",
      icon: Calculator,
      color: "text-gray-600",
      reports: [
        {
          name: "Accountant's Review",
          description: "Changes made to closed periods",
          type: "Detail",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Closing Date Exception Report",
          description: "Transactions dated before closing date",
          type: "Detail",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Audit Trail",
          description: "All changes made to transactions",
          type: "Detail",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "Budgets & Forecasts",
      icon: PieChart,
      color: "text-pink-600",
      reports: [
        {
          name: "Budget vs. Actual",
          description: "Comparison of budget to actual amounts",
          type: "Summary",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Budget Overview",
          description: "Overview of all budgets",
          type: "Summary",
          popular: false,
          variants: ["Standard"]
        }
      ]
    },
    {
      category: "List",
      icon: FolderOpen,
      color: "text-amber-600",
      reports: [
        {
          name: "Item Listing",
          description: "List of all items and services",
          type: "List",
          popular: true,
          variants: ["Standard"]
        },
        {
          name: "Customer Phone List",
          description: "Customer names and phone numbers",
          type: "List",
          popular: false,
          variants: ["Standard"]
        },
        {
          name: "Vendor Contact List",
          description: "Vendor names and contact information",
          type: "List",
          popular: false,
          variants: ["Standard"]
        }
      ]
    }
  ];

  // Popular reports across all categories
  const popularReports = reportCategories
    .flatMap(cat => cat.reports.filter(report => report.popular)
    .map(report => ({ ...report, category: cat.category, categoryIcon: cat.icon, categoryColor: cat.color })))
    .slice(0, 8);

  // Mock recent reports
  const recentReports = [
    { 
      name: "Profit & Loss - December 2023", 
      category: "Company & Financial",
      runDate: "2024-01-15", 
      runTime: "2:30 PM",
      type: "PDF",
      status: "Completed",
      size: "245 KB"
    },
    { 
      name: "A/R Aging Summary - January 2024", 
      category: "Customers & Receivables",
      runDate: "2024-01-14", 
      runTime: "10:15 AM",
      type: "Excel",
      status: "Completed",
      size: "128 KB"
    },
    { 
      name: "Sales by Customer Summary - Q4 2023", 
      category: "Sales",
      runDate: "2024-01-13", 
      runTime: "4:45 PM",
      type: "PDF",
      status: "Completed",
      size: "387 KB"
    }
  ];

  // Memorized reports
  const memorizedReports = [
    {
      name: "Monthly P&L",
      originalReport: "Profit & Loss",
      schedule: "Monthly",
      lastRun: "2024-01-01",
      nextRun: "2024-02-01",
      emailTo: "manager@company.com"
    },
    {
      name: "Weekly A/R Aging",
      originalReport: "A/R Aging Summary", 
      schedule: "Weekly",
      lastRun: "2024-01-08",
      nextRun: "2024-01-15",
      emailTo: "accounting@company.com"
    }
  ];

  const filteredReports = reportCategories.filter(category => 
    category.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.reports.some(report => report.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCategoryData = filteredReports.find(cat => cat.category === selectedCategory);

  const handleRunReport = (reportName, reportCategory) => {
    console.log("Running report:", reportName, "from category:", reportCategory);
    // Navigate to report customization page
    navigate(`/reports/customize?report=${encodeURIComponent(reportName)}&category=${encodeURIComponent(reportCategory)}`);
  };

  const handlePreviewReport = (reportName) => {
    console.log("Previewing report:", reportName);
    // Navigate directly to specific report pages for available reports
    const getReportRoute = (reportName) => {
      switch (reportName) {
        case 'Statement of Cash Flows':
          return '/reports/cash-flow';
        case 'Profit & Loss':
          return '/reports/profit-loss';
        case 'Balance Sheet':
          return '/reports/balance-sheet';
        default:
          return `/reports/customize?report=${encodeURIComponent(reportName)}&category=Company & Financial`;
      }
    };
    
    const reportRoute = getReportRoute(reportName);
    navigate(reportRoute);
  };

  const handleScheduleReport = (reportName) => {
    console.log("Scheduling report:", reportName);
    // Open scheduling dialog
  };

  const handleMemorizeReport = (reportName) => {
    console.log("Memorizing report:", reportName);
    // Open memorize dialog
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Center</h1>
          <p className="text-gray-600">Access comprehensive business reports and analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/reports/memorized')}>
            <Star className="w-4 h-4 mr-2" />
            Memorized Reports
          </Button>
          <Button variant="outline" onClick={() => navigate('/reports/scheduled')}>
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled Reports
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search reports by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FolderOpen className="w-5 h-5 mr-2" />
              Report Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredReports.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.category}
                    onClick={() => setSelectedCategory(category.category)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                      selectedCategory === category.category
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <IconComponent className={`w-4 h-4 mr-2 ${category.color}`} />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.reports.length}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="all-reports" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-reports">All Reports</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="memorized">Memorized</TabsTrigger>
            </TabsList>
            
            {/* All Reports Tab */}
            <TabsContent value="all-reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {selectedCategoryData && <selectedCategoryData.icon className={`w-5 h-5 mr-2 ${selectedCategoryData.color}`} />}
                    {selectedCategory}
                  </CardTitle>
                  <CardDescription>
                    {selectedCategoryData?.reports.length} reports available in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewType === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCategoryData?.reports.map((report, index) => (
                        <Card key={index} className="border hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-lg">{report.name}</h4>
                                    {report.popular && (
                                      <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {report.type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {report.variants.length} variant{report.variants.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handlePreviewReport(report.name)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleMemorizeReport(report.name)}>
                                    <Star className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleScheduleReport(report.name)}>
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Schedule
                                  </Button>
                                  <Button size="sm" onClick={() => handleRunReport(report.name, selectedCategory)}>
                                    <Play className="w-4 h-4 mr-1" />
                                    Run
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCategoryData?.reports.map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{report.name}</h4>
                              {report.popular && (
                                <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                                  Popular
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {report.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{report.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleRunReport(report.name, selectedCategory)}>
                              Run Report
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Popular Reports Tab */}
            <TabsContent value="popular" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Popular Reports
                  </CardTitle>
                  <CardDescription>Most frequently used reports across all categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularReports.map((report, index) => {
                      const IconComponent = report.categoryIcon;
                      return (
                        <Card key={index} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-lg">{report.name}</h4>
                                  <p className="text-sm text-gray-600">{report.description}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <IconComponent className={`w-4 h-4 ${report.categoryColor}`} />
                                    <Badge variant="secondary" className="text-xs">
                                      {report.category}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Preview
                                </Button>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Schedule
                                  </Button>
                                  <Button size="sm" onClick={() => handleRunReport(report.name, report.category)}>
                                    Run Report
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Recent Reports Tab */}
            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-500" />
                    Recent Reports
                  </CardTitle>
                  <CardDescription>Recently generated reports and their details</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentReports.length > 0 ? (
                    <div className="space-y-4">
                      {recentReports.map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{report.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {report.category}
                              </Badge>
                              <Badge 
                                variant={report.status === 'Completed' ? 'default' : 'destructive'} 
                                className="text-xs"
                              >
                                {report.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>Generated: {report.runDate} at {report.runTime}</span>
                              <span>Format: {report.type}</span>
                              <span>Size: {report.size}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="w-4 h-4 mr-1" />
                              Re-run
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No recent reports</p>
                      <p className="text-sm">Run a report to see it appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Memorized Reports Tab */}
            <TabsContent value="memorized" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-purple-500" />
                    Memorized Reports
                  </CardTitle>
                  <CardDescription>Saved report configurations and scheduled reports</CardDescription>
                </CardHeader>
                <CardContent>
                  {memorizedReports.length > 0 ? (
                    <div className="space-y-4">
                      {memorizedReports.map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{report.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                Based on: {report.originalReport}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>Schedule: {report.schedule}</span>
                              <span>Last Run: {report.lastRun}</span>
                              <span>Next Run: {report.nextRun}</span>
                              <span>Email: {report.emailTo}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Play className="w-4 h-4 mr-1" />
                              Run Now
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4 mr-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No memorized reports</p>
                      <p className="text-sm">Memorize a report to save its settings and schedule it to run automatically</p>
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Memorized Report
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReportCenter;