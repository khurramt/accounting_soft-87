import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  Settings,
  Calendar,
  Filter,
  Eye,
  Download,
  Save,
  RotateCcw,
  Columns,
  SortAsc,
  SortDesc,
  Palette,
  FileText,
  Users,
  Building,
  DollarSign,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react";

const ReportCustomizer = () => {
  const [selectedReport, setSelectedReport] = useState("profit-loss");
  
  const initialReportSettings = {
    dateRange: "this-month",
    customStartDate: "",
    customEndDate: "",
    basis: "accrual",
    showCents: true,
    showNegativeNumbers: "parentheses",
    showColumns: ["account", "amount", "percent"],
    filters: {
      accounts: [],
      customers: [],
      vendors: [],
      items: [],
      classes: []
    },
    groupBy: "account",
    sortBy: "default",
    includeInactive: false
  };
  
  const [reportSettings, setReportSettings] = useState(initialReportSettings);

  const reportTypes = [
    { id: "profit-loss", name: "Profit & Loss", icon: BarChart3 },
    { id: "balance-sheet", name: "Balance Sheet", icon: PieChart },
    { id: "cash-flow", name: "Cash Flow", icon: TrendingUp },
    { id: "ar-aging", name: "A/R Aging Summary", icon: Users },
    { id: "ap-aging", name: "A/P Aging Summary", icon: Building },
    { id: "trial-balance", name: "Trial Balance", icon: FileText }
  ];

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "this-quarter", label: "This Quarter" },
    { value: "this-year", label: "This Year" },
    { value: "last-month", label: "Last Month" },
    { value: "last-quarter", label: "Last Quarter" },
    { value: "last-year", label: "Last Year" },
    { value: "custom", label: "Custom" }
  ];

  const columnOptions = [
    { id: "account", label: "Account" },
    { id: "amount", label: "Amount" },
    { id: "percent", label: "% of Total" },
    { id: "previous-year", label: "Previous Year" },
    { id: "variance", label: "$ Change" },
    { id: "variance-percent", label: "% Change" },
    { id: "budget", label: "Budget" },
    { id: "budget-variance", label: "Budget vs Actual" }
  ];

  const accounts = [
    { id: "1", name: "Checking Account", type: "Bank" },
    { id: "2", name: "Accounts Receivable", type: "Accounts Receivable" },
    { id: "3", name: "Inventory Asset", type: "Other Current Asset" },
    { id: "4", name: "Equipment", type: "Fixed Asset" },
    { id: "5", name: "Accounts Payable", type: "Accounts Payable" },
    { id: "6", name: "Sales Income", type: "Income" },
    { id: "7", name: "Cost of Goods Sold", type: "Cost of Goods Sold" },
    { id: "8", name: "Office Supplies", type: "Expense" }
  ];

  const customers = [
    { id: "1", name: "ABC Company" },
    { id: "2", name: "XYZ Corporation" },
    { id: "3", name: "Tech Solutions Inc." }
  ];

  const handleSettingChange = (key, value) => {
    setReportSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterChange = (filterType, values) => {
    setReportSettings(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterType]: values }
    }));
  };

  const handleColumnToggle = (columnId) => {
    setReportSettings(prev => ({
      ...prev,
      showColumns: prev.showColumns.includes(columnId)
        ? prev.showColumns.filter(id => id !== columnId)
        : [...prev.showColumns, columnId]
    }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all customizations to default? This action cannot be undone.')) {
      setReportSettings(initialReportSettings);
      alert('Report settings reset to defaults!');
    }
  };

  const generateReport = () => {
    console.log("Generating report with settings:", reportSettings);
  };

  const saveTemplate = () => {
    console.log("Saving report template");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Customizer</h1>
          <p className="text-gray-600 mt-1">Customize and generate detailed financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setReportSettings({})}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={saveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
          <Button onClick={generateReport}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Report Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map(report => {
                const Icon = report.icon;
                return (
                  <Button
                    key={report.id}
                    variant={selectedReport === report.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {report.name}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Customization Options */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Report Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="display" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="display">Display</TabsTrigger>
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                  <TabsTrigger value="formatting">Formatting</TabsTrigger>
                  <TabsTrigger value="header">Header/Footer</TabsTrigger>
                </TabsList>

                {/* Display Tab */}
                <TabsContent value="display" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Range */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date Range
                      </h4>
                      <div>
                        <label className="block text-sm font-medium mb-2">Report Period</label>
                        <select 
                          value={reportSettings.dateRange}
                          onChange={(e) => handleSettingChange('dateRange', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          {dateRangeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {reportSettings.dateRange === 'custom' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">From</label>
                            <Input 
                              type="date"
                              value={reportSettings.customStartDate}
                              onChange={(e) => handleSettingChange('customStartDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">To</label>
                            <Input 
                              type="date"
                              value={reportSettings.customEndDate}
                              onChange={(e) => handleSettingChange('customEndDate', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Report Basis */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Report Basis</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            value="accrual"
                            checked={reportSettings.basis === 'accrual'}
                            onChange={(e) => handleSettingChange('basis', e.target.value)}
                          />
                          <span className="text-sm">Accrual</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            value="cash"
                            checked={reportSettings.basis === 'cash'}
                            onChange={(e) => handleSettingChange('basis', e.target.value)}
                          />
                          <span className="text-sm">Cash</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Columns */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Columns className="w-4 h-4" />
                      Show Columns
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {columnOptions.map(column => (
                        <label key={column.id} className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={reportSettings.showColumns.includes(column.id)}
                            onChange={() => handleColumnToggle(column.id)}
                          />
                          <span className="text-sm">{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Filters Tab */}
                <TabsContent value="filters" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Filter */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Account Filter
                      </h4>
                      <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                        {accounts.map(account => (
                          <label key={account.id} className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="text-sm">{account.name}</span>
                            <Badge variant="outline" className="text-xs">{account.type}</Badge>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Customer Filter */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Customer Filter
                      </h4>
                      <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                        {customers.map(customer => (
                          <label key={customer.id} className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="text-sm">{customer.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Additional Options</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={reportSettings.includeInactive}
                          onChange={(e) => handleSettingChange('includeInactive', e.target.checked)}
                        />
                        <span className="text-sm">Include inactive accounts/items</span>
                      </label>
                    </div>
                  </div>
                </TabsContent>

                {/* Formatting Tab */}
                <TabsContent value="formatting" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Number Format */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Number Format
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={reportSettings.showCents}
                            onChange={(e) => handleSettingChange('showCents', e.target.checked)}
                          />
                          <span className="text-sm">Show cents</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Negative Numbers</label>
                        <select 
                          value={reportSettings.showNegativeNumbers}
                          onChange={(e) => handleSettingChange('showNegativeNumbers', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="parentheses">In parentheses</option>
                          <option value="minus">With minus sign</option>
                          <option value="red">In red</option>
                        </select>
                      </div>
                    </div>

                    {/* Sorting */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Sorting & Grouping
                      </h4>
                      <div>
                        <label className="block text-sm font-medium mb-2">Group By</label>
                        <select 
                          value={reportSettings.groupBy}
                          onChange={(e) => handleSettingChange('groupBy', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="account">Account</option>
                          <option value="type">Account Type</option>
                          <option value="customer">Customer</option>
                          <option value="class">Class</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Sort By</label>
                        <select 
                          value={reportSettings.sortBy}
                          onChange={(e) => handleSettingChange('sortBy', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="default">Default</option>
                          <option value="name">Name</option>
                          <option value="amount">Amount</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Header/Footer Tab */}
                <TabsContent value="header" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Header Options</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Report Title</label>
                          <Input placeholder="Custom report title" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Subtitle</label>
                          <Input placeholder="Optional subtitle" />
                        </div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Show company name</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Show report date</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span className="text-sm">Show time prepared</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Footer Options</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Show page numbers</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span className="text-sm">Show report basis</span>
                        </label>
                        <div>
                          <label className="block text-sm font-medium mb-1">Custom Footer</label>
                          <Input placeholder="Optional footer text" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Settings
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateReport}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={generateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCustomizer;