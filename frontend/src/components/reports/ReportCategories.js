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
  BarChart3,
  TrendingUp,
  Users,
  Building,
  Package,
  Clock,
  DollarSign,
  FileText,
  PieChart,
  LineChart,
  Calculator,
  Calendar,
  Search,
  Filter,
  Star,
  Eye,
  Download,
  Share
} from 'lucide-react';

const ReportCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('company-financial');
  const [favoriteReports, setFavoriteReports] = useState(['profit-loss', 'balance-sheet', 'cash-flow']);

  const reportCategories = {
    'company-financial': {
      title: 'Company & Financial',
      icon: Building,
      description: 'Overview of company performance and financial health',
      reports: [
        {
          id: 'profit-loss',
          name: 'Profit & Loss',
          description: 'Shows your income and expenses for a period',
          type: 'Standard',
          frequency: 'Monthly',
          lastRun: '2024-01-15',
          isFavorite: true,
          isPopular: true
        },
        {
          id: 'profit-loss-detail',
          name: 'Profit & Loss Detail',
          description: 'Detailed breakdown of income and expenses',
          type: 'Detail',
          frequency: 'Monthly',
          lastRun: '2024-01-10',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'profit-loss-ytd-comparison',
          name: 'Profit & Loss YTD Comparison',
          description: 'Year-to-date comparison with previous year',
          type: 'Comparison',
          frequency: 'Quarterly',
          lastRun: '2024-01-01',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'balance-sheet',
          name: 'Balance Sheet',
          description: 'Shows your assets, liabilities, and equity',
          type: 'Standard',
          frequency: 'Monthly',
          lastRun: '2024-01-15',
          isFavorite: true,
          isPopular: true
        },
        {
          id: 'balance-sheet-detail',
          name: 'Balance Sheet Detail',
          description: 'Detailed balance sheet with account breakdowns',
          type: 'Detail',
          frequency: 'Monthly',
          lastRun: '2024-01-12',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'cash-flow',
          name: 'Statement of Cash Flows',
          description: 'Shows cash inflows and outflows',
          type: 'Standard',
          frequency: 'Monthly',
          lastRun: '2024-01-15',
          isFavorite: true,
          isPopular: true
        },
        {
          id: 'trial-balance',
          name: 'Trial Balance',
          description: 'Lists all accounts with debit and credit balances',
          type: 'Standard',
          frequency: 'Monthly',
          lastRun: '2024-01-10',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'general-ledger',
          name: 'General Ledger',
          description: 'Detailed listing of all transactions by account',
          type: 'Detail',
          frequency: 'As Needed',
          lastRun: '2024-01-08',
          isFavorite: false,
          isPopular: false
        }
      ]
    },
    'customers-receivables': {
      title: 'Customers & Receivables',
      icon: Users,
      description: 'Customer sales and accounts receivable reports',
      reports: [
        {
          id: 'ar-aging-summary',
          name: 'A/R Aging Summary',
          description: 'Summary of outstanding customer balances by age',
          type: 'Summary',
          frequency: 'Weekly',
          lastRun: '2024-01-14',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'ar-aging-detail',
          name: 'A/R Aging Detail',
          description: 'Detailed listing of outstanding invoices by customer',
          type: 'Detail',
          frequency: 'Weekly',
          lastRun: '2024-01-14',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'customer-balance-summary',
          name: 'Customer Balance Summary',
          description: 'Current balance for each customer',
          type: 'Summary',
          frequency: 'Weekly',
          lastRun: '2024-01-12',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'customer-balance-detail',
          name: 'Customer Balance Detail',
          description: 'Detailed transaction history for each customer',
          type: 'Detail',
          frequency: 'As Needed',
          lastRun: '2024-01-10',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'open-invoices',
          name: 'Open Invoices',
          description: 'All unpaid customer invoices',
          type: 'Standard',
          frequency: 'Daily',
          lastRun: '2024-01-15',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'collections-report',
          name: 'Collections Report',
          description: 'Overdue invoices and collection status',
          type: 'Standard',
          frequency: 'Weekly',
          lastRun: '2024-01-14',
          isFavorite: false,
          isPopular: false
        }
      ]
    },
    'sales': {
      title: 'Sales',
      icon: TrendingUp,
      description: 'Sales performance and analysis reports',
      reports: [
        {
          id: 'sales-by-customer-summary',
          name: 'Sales by Customer Summary',
          description: 'Total sales amount for each customer',
          type: 'Summary',
          frequency: 'Monthly',
          lastRun: '2024-01-15',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'sales-by-customer-detail',
          name: 'Sales by Customer Detail',
          description: 'Detailed sales transactions by customer',
          type: 'Detail',
          frequency: 'Monthly',
          lastRun: '2024-01-12',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'sales-by-item-summary',
          name: 'Sales by Item Summary',
          description: 'Total sales for each item or service',
          type: 'Summary',
          frequency: 'Monthly',
          lastRun: '2024-01-15',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'sales-by-item-detail',
          name: 'Sales by Item Detail',
          description: 'Detailed sales transactions by item',
          type: 'Detail',
          frequency: 'Monthly',
          lastRun: '2024-01-10',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'sales-by-rep',
          name: 'Sales by Rep',
          description: 'Sales performance by sales representative',
          type: 'Summary',
          frequency: 'Monthly',
          lastRun: '2024-01-12',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'sales-tax-liability',
          name: 'Sales Tax Liability',
          description: 'Sales tax collected and owed by jurisdiction',
          type: 'Standard',
          frequency: 'Quarterly',
          lastRun: '2024-01-01',
          isFavorite: false,
          isPopular: true
        }
      ]
    },
    'vendors-payables': {
      title: 'Vendors & Payables',
      icon: Building,
      description: 'Vendor transactions and accounts payable reports',
      reports: [
        {
          id: 'ap-aging-summary',
          name: 'A/P Aging Summary',
          description: 'Summary of outstanding vendor balances by age',
          type: 'Summary',
          frequency: 'Weekly',
          lastRun: '2024-01-14',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'ap-aging-detail',
          name: 'A/P Aging Detail',
          description: 'Detailed listing of outstanding bills by vendor',
          type: 'Detail',
          frequency: 'Weekly',
          lastRun: '2024-01-14',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'vendor-balance-summary',
          name: 'Vendor Balance Summary',
          description: 'Current balance owed to each vendor',
          type: 'Summary',
          frequency: 'Weekly',
          lastRun: '2024-01-12',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'vendor-balance-detail',
          name: 'Vendor Balance Detail',
          description: 'Detailed transaction history for each vendor',
          type: 'Detail',
          frequency: 'As Needed',
          lastRun: '2024-01-10',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'unpaid-bills',
          name: 'Unpaid Bills Detail',
          description: 'All unpaid vendor bills',
          type: 'Standard',
          frequency: 'Daily',
          lastRun: '2024-01-15',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'vendor-1099',
          name: 'Vendor 1099 Review',
          description: '1099-eligible vendors and payment amounts',
          type: 'Standard',
          frequency: 'Annual',
          lastRun: '2024-01-01',
          isFavorite: false,
          isPopular: false
        }
      ]
    },
    'inventory': {
      title: 'Inventory',
      icon: Package,
      description: 'Inventory valuation and movement reports',
      reports: [
        {
          id: 'inventory-valuation-summary',
          name: 'Inventory Valuation Summary',
          description: 'Current value of inventory by item',
          type: 'Summary',
          frequency: 'Monthly',
          lastRun: '2024-01-15',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'inventory-valuation-detail',
          name: 'Inventory Valuation Detail',
          description: 'Detailed inventory valuation with quantities',
          type: 'Detail',
          frequency: 'Monthly',
          lastRun: '2024-01-12',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'inventory-stock-status',
          name: 'Inventory Stock Status',
          description: 'Current stock levels and reorder points',
          type: 'Standard',
          frequency: 'Weekly',
          lastRun: '2024-01-14',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'physical-inventory',
          name: 'Physical Inventory Worksheet',
          description: 'Worksheet for conducting physical inventory counts',
          type: 'Worksheet',
          frequency: 'As Needed',
          lastRun: '2023-12-31',
          isFavorite: false,
          isPopular: false
        }
      ]
    },
    'employees-payroll': {
      title: 'Employees & Payroll',
      icon: Clock,
      description: 'Payroll and employee management reports',
      reports: [
        {
          id: 'payroll-summary',
          name: 'Payroll Summary',
          description: 'Summary of payroll costs by employee',
          type: 'Summary',
          frequency: 'Bi-weekly',
          lastRun: '2024-01-15',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'payroll-detail',
          name: 'Payroll Detail Review',
          description: 'Detailed payroll information by pay period',
          type: 'Detail',
          frequency: 'Bi-weekly',
          lastRun: '2024-01-15',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'employee-earnings-summary',
          name: 'Employee Earnings Summary',
          description: 'Year-to-date earnings by employee',
          type: 'Summary',
          frequency: 'Monthly',
          lastRun: '2024-01-12',
          isFavorite: false,
          isPopular: true
        },
        {
          id: 'payroll-liability-balances',
          name: 'Payroll Liability Balances',
          description: 'Outstanding payroll tax liabilities',
          type: 'Standard',
          frequency: 'Monthly',
          lastRun: '2024-01-10',
          isFavorite: false,
          isPopular: false
        },
        {
          id: 'certified-payroll',
          name: 'Certified Payroll',
          description: 'Prevailing wage compliance report',
          type: 'Standard',
          frequency: 'Weekly',
          lastRun: '2024-01-14',
          isFavorite: false,
          isPopular: false
        }
      ]
    }
  };

  const toggleFavorite = (reportId) => {
    setFavoriteReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const getFilteredReports = (reports) => {
    if (!searchTerm) return reports;
    return reports.filter(report => 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Detail': return 'bg-green-100 text-green-800';
      case 'Summary': return 'bg-purple-100 text-purple-800';
      case 'Comparison': return 'bg-orange-100 text-orange-800';
      case 'Worksheet': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Categories</h1>
          <p className="text-gray-600">Browse reports by category to find the information you need</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Reports
          </Button>
          <Button variant="outline" size="sm">
            <Star className="w-4 h-4 mr-2" />
            Favorites ({favoriteReports.length})
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search reports..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {Object.entries(reportCategories).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === key ? 'ring-2 ring-green-500 bg-green-50' : ''
              }`}
              onClick={() => setSelectedCategory(key)}
            >
              <CardContent className="pt-6 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <h3 className="font-medium text-sm">{category.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                <div className="mt-2 text-xs text-gray-400">
                  {category.reports.length} reports
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Category Reports */}
      {selectedCategory && reportCategories[selectedCategory] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {React.createElement(reportCategories[selectedCategory].icon, { className: "w-6 h-6" })}
                <div>
                  <CardTitle>{reportCategories[selectedCategory].title}</CardTitle>
                  <p className="text-sm text-gray-600">{reportCategories[selectedCategory].description}</p>
                </div>
              </div>
              <Badge variant="outline">
                {getFilteredReports(reportCategories[selectedCategory].reports).length} reports
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredReports(reportCategories[selectedCategory].reports).map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-sm">{report.name}</h3>
                          {report.isPopular && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(report.id)}
                        className="p-1"
                      >
                        <Star className={`w-4 h-4 ${
                          favoriteReports.includes(report.id) 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-400'
                        }`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(report.type)} variant="secondary">
                          {report.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{report.frequency}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last run: {report.lastRun}
                      </div>
                      <div className="flex space-x-1 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportCategories;