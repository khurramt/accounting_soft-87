import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  Calendar,
  ArrowLeft,
  Play,
  Download,
  Mail,
  Printer,
  Save,
  Settings,
  Filter,
  Eye,
  FileText,
  BarChart3
} from "lucide-react";

const ReportCustomization = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportName = searchParams.get('report') || 'Profit & Loss';
  const reportCategory = searchParams.get('category') || 'Company & Financial';

  const [reportSettings, setReportSettings] = useState({
    // Display Settings
    reportBasis: 'Accrual',
    dateRange: 'This Fiscal Year',
    fromDate: '2024-01-01',
    toDate: '2024-12-31',
    columns: 'Total Only',
    showColumns: ['Account', 'Total'],
    
    // Filters
    accountFilter: 'All',
    customerFilter: 'All',
    vendorFilter: 'All',
    employeeFilter: 'All',
    itemFilter: 'All',
    classFilter: 'All',
    
    // Header/Footer
    companyName: true,
    reportTitle: true,
    subtitle: '',
    datePrepared: true,
    timePrepared: false,
    reportBasisDisplay: true,
    
    // Fonts & Numbers
    showNegativeNumbers: 'parentheses',
    showZeroAmounts: false,
    withoutCents: false,
    fontSize: 'Normal'
  });

  const [previewData, setPreviewData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const dateRanges = [
    'Today',
    'This Week',
    'This Month',
    'This Quarter',
    'This Fiscal Year',
    'Yesterday',
    'Last Week', 
    'Last Month',
    'Last Quarter',
    'Last Fiscal Year',
    'Custom'
  ];

  const columnOptions = [
    'Total Only',
    'Previous Year',
    'Previous Period',
    'Year-to-Date',
    '% of Column',
    '% of Row',
    '% of Income'
  ];

  const handleRunReport = async () => {
    setIsGenerating(true);
    console.log('Generating report with settings:', reportSettings);
    
    // Simulate report generation
    setTimeout(() => {
      setPreviewData({
        generatedAt: new Date().toISOString(),
        format: 'HTML',
        pages: 1,
        size: '142 KB'
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleSaveSettings = () => {
    console.log('Saving report settings:', reportSettings);
    // Save to memorized reports
  };

  const handleEmailReport = () => {
    console.log('Opening email dialog');
    // Open email composition modal
  };

  const handlePrintReport = () => {
    console.log('Printing report');
    // Open print dialog
  };

  const handleExportReport = (format) => {
    console.log('Exporting report as:', format);
    // Export report in specified format
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{reportName}</h1>
            <p className="text-gray-600">Customize and run your report</p>
            <Badge variant="secondary" className="mt-1">
              {reportCategory}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button 
            onClick={handleRunReport} 
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Run Report'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customization Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="display" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="header">Header/Footer</TabsTrigger>
              <TabsTrigger value="fonts">Fonts & Numbers</TabsTrigger>
            </TabsList>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>Configure how your report is displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportBasis">Report Basis</Label>
                      <Select 
                        value={reportSettings.reportBasis} 
                        onValueChange={(value) => setReportSettings(prev => ({...prev, reportBasis: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accrual">Accrual</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select 
                        value={reportSettings.dateRange} 
                        onValueChange={(value) => setReportSettings(prev => ({...prev, dateRange: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dateRanges.map(range => (
                            <SelectItem key={range} value={range}>{range}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {reportSettings.dateRange === 'Custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromDate">From Date</Label>
                        <Input 
                          type="date" 
                          value={reportSettings.fromDate}
                          onChange={(e) => setReportSettings(prev => ({...prev, fromDate: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toDate">To Date</Label>
                        <Input 
                          type="date" 
                          value={reportSettings.toDate}
                          onChange={(e) => setReportSettings(prev => ({...prev, toDate: e.target.value}))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="columns">Columns</Label>
                    <Select 
                      value={reportSettings.columns} 
                      onValueChange={(value) => setReportSettings(prev => ({...prev, columns: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columnOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Show Columns</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Account', 'Description', 'Type', 'Total', 'Tax Line'].map(column => (
                        <div key={column} className="flex items-center space-x-2">
                          <Checkbox 
                            id={column}
                            checked={reportSettings.showColumns.includes(column)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setReportSettings(prev => ({
                                  ...prev, 
                                  showColumns: [...prev.showColumns, column]
                                }));
                              } else {
                                setReportSettings(prev => ({
                                  ...prev, 
                                  showColumns: prev.showColumns.filter(col => col !== column)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={column} className="text-sm">{column}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Filter your report data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Filter</Label>
                      <Select 
                        value={reportSettings.accountFilter} 
                        onValueChange={(value) => setReportSettings(prev => ({...prev, accountFilter: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Accounts</SelectItem>
                          <SelectItem value="Income">Income Accounts</SelectItem>
                          <SelectItem value="Expense">Expense Accounts</SelectItem>
                          <SelectItem value="Asset">Asset Accounts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Customer Filter</Label>
                      <Select 
                        value={reportSettings.customerFilter} 
                        onValueChange={(value) => setReportSettings(prev => ({...prev, customerFilter: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Customers</SelectItem>
                          <SelectItem value="Active">Active Customers</SelectItem>
                          <SelectItem value="Inactive">Inactive Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Vendor Filter</Label>
                      <Select 
                        value={reportSettings.vendorFilter} 
                        onValueChange={(value) => setReportSettings(prev => ({...prev, vendorFilter: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Vendors</SelectItem>
                          <SelectItem value="Active">Active Vendors</SelectItem>
                          <SelectItem value="Inactive">Inactive Vendors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Class Filter</Label>
                      <Select 
                        value={reportSettings.classFilter} 
                        onValueChange={(value) => setReportSettings(prev => ({...prev, classFilter: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Classes</SelectItem>
                          <SelectItem value="Department">Department</SelectItem>
                          <SelectItem value="Location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Header/Footer Tab */}
            <TabsContent value="header" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Header & Footer</CardTitle>
                  <CardDescription>Customize report header and footer information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="companyName"
                        checked={reportSettings.companyName}
                        onCheckedChange={(checked) => setReportSettings(prev => ({...prev, companyName: checked}))}
                      />
                      <Label htmlFor="companyName">Show Company Name</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="reportTitle"
                        checked={reportSettings.reportTitle}
                        onCheckedChange={(checked) => setReportSettings(prev => ({...prev, reportTitle: checked}))}
                      />
                      <Label htmlFor="reportTitle">Show Report Title</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                      <Input 
                        id="subtitle"
                        placeholder="Enter subtitle for the report"
                        value={reportSettings.subtitle}
                        onChange={(e) => setReportSettings(prev => ({...prev, subtitle: e.target.value}))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="datePrepared"
                        checked={reportSettings.datePrepared}
                        onCheckedChange={(checked) => setReportSettings(prev => ({...prev, datePrepared: checked}))}
                      />
                      <Label htmlFor="datePrepared">Show Date Prepared</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="timePrepared"
                        checked={reportSettings.timePrepared}
                        onCheckedChange={(checked) => setReportSettings(prev => ({...prev, timePrepared: checked}))}
                      />
                      <Label htmlFor="timePrepared">Show Time Prepared</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="reportBasisDisplay"
                        checked={reportSettings.reportBasisDisplay}
                        onCheckedChange={(checked) => setReportSettings(prev => ({...prev, reportBasisDisplay: checked}))}
                      />
                      <Label htmlFor="reportBasisDisplay">Show Report Basis</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fonts & Numbers Tab */}
            <TabsContent value="fonts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fonts & Numbers</CardTitle>
                  <CardDescription>Configure number formatting and font options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Show Negative Numbers</Label>
                    <Select 
                      value={reportSettings.showNegativeNumbers} 
                      onValueChange={(value) => setReportSettings(prev => ({...prev, showNegativeNumbers: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parentheses">In parentheses: (1,234.56)</SelectItem>
                        <SelectItem value="minus">With minus sign: -1,234.56</SelectItem>
                        <SelectItem value="red">In red: 1,234.56</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="showZeroAmounts"
                        checked={reportSettings.showZeroAmounts}
                        onCheckedChange={(checked) => setReportSettings(prev => ({...prev, showZeroAmounts: checked}))}
                      />
                      <Label htmlFor="showZeroAmounts">Show zero amounts</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="withoutCents"
                        checked={reportSettings.withoutCents}
                        onCheckedChange={(checked) => setReportSettings(prev => ({...prev, withoutCents: checked}))}
                      />
                      <Label htmlFor="withoutCents">Show amounts without cents</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select 
                      value={reportSettings.fontSize} 
                      onValueChange={(value) => setReportSettings(prev => ({...prev, fontSize: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{reportName}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Generated: {new Date(previewData.generatedAt).toLocaleString()}</p>
                      <p>Format: {previewData.format}</p>
                      <p>Pages: {previewData.pages}</p>
                      <p>Size: {previewData.size}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => handleExportReport('PDF')}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleExportReport('Excel')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export to Excel
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleEmailReport}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email Report
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handlePrintReport}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Run the report to see a preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Set as Current Month
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare to Last Year
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Filter className="w-4 h-4 mr-2" />
                Reset All Filters
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportCustomization;