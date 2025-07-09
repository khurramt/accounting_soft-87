import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import reportService from "../../services/reportService";
import { formatCurrency, calculatePercentage, getVarianceColor } from "../../utils/formatCurrency";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { 
  Download, 
  Printer, 
  Mail, 
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Star,
  Clock,
  LineChart,
  Loader2
} from "lucide-react";

const CashFlowReport = () => {
  const [searchParams] = useSearchParams();
  const reportName = searchParams.get('report') || 'Cash Flow';
  const category = searchParams.get('category') || 'Company & Financial';
  const { currentCompany, loading: companyLoading, error: companyError } = useCompany();
  
  const [dateRange, setDateRange] = useState("current-month");
  const [reportBasis, setReportBasis] = useState("accrual");
  const [reportFormat, setReportFormat] = useState("standard");
  const [method, setMethod] = useState("indirect");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Load report data from backend
  useEffect(() => {
    const loadReportData = async () => {
      // Wait for company context to be available
      if (companyLoading) {
        console.log('Waiting for company context to load...');
        return;
      }
      
      if (companyError) {
        console.error('Company context error:', companyError);
        setError(`Company context error: ${companyError}`);
        return;
      }
      
      if (!currentCompany) {
        console.log('No current company selected');
        setError('No company selected. Please select a company first.');
        return;
      }
      
      if (!currentCompany.id) {
        console.error('Current company has no ID:', currentCompany);
        setError('Invalid company data. Please select a company again.');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range
        const { startDate, endDate } = getDateRange(dateRange);
        
        // Prepare report parameters
        const params = {
          start_date: startDate,
          end_date: endDate,
          method: method,
          include_subtotals: reportFormat === 'detail',
          show_cents: true
        };
        
        console.log('Loading Cash Flow report with params:', params);
        const data = await reportService.getCashFlowReport(currentCompany.id, params);
        setReportData(data);
      } catch (err) {
        console.error('Error loading Cash Flow report:', err);
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    
    loadReportData();
  }, [currentCompany, companyLoading, companyError, dateRange, reportBasis, method, reportFormat]);

  // Helper function to get date range
  const getDateRange = (range) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (range) {
      case 'current-month':
        return {
          startDate: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        };
      case 'last-month':
        return {
          startDate: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        };
      case 'current-quarter':
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        return {
          startDate: new Date(currentYear, quarterStart, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, quarterStart + 3, 0).toISOString().split('T')[0]
        };
      case 'current-year':
        return {
          startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, 11, 31).toISOString().split('T')[0]
        };
      default:
        return {
          startDate: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        };
    }
  };

  // Handle refresh report
  const handleRefreshReport = () => {
    if (!currentCompany) return;
    
    const loadReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { startDate, endDate } = getDateRange(dateRange);
        const params = {
          start_date: startDate,
          end_date: endDate,
          method: method,
          include_subtotals: reportFormat === 'detail',
          show_cents: true
        };
        
        const data = await reportService.getCashFlowReport(currentCompany.id, params);
        setReportData(data);
      } catch (err) {
        console.error('Error refreshing Cash Flow report:', err);
        setError(err.message || 'Failed to refresh report');
      } finally {
        setLoading(false);
      }
    };
    
    loadReportData();
  };

  // Handle various actions
  const handleExport = (format) => {
    console.log(`Exporting report as ${format}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    console.log("Opening email dialog");
  };

  const handleMemorize = () => {
    console.log("Memorizing report settings");
  };

  const handleSchedule = () => {
    console.log("Opening schedule dialog");
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg">Loading Cash Flow Report...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error Loading Report</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button onClick={handleRefreshReport}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!reportData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-600 text-lg font-medium mb-2">No Report Data Available</div>
            <div className="text-gray-500 mb-4">Please check your date range and filters</div>
            <Button onClick={handleRefreshReport}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Report
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
          <h1 className="text-3xl font-bold text-gray-900">{reportName}</h1>
          <p className="text-gray-600">Cash receipts and payments analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={handleMemorize}>
            <Star className="w-4 h-4 mr-2" />
            Memorize
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="method">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indirect">Indirect</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportBasis">Report Basis</Label>
              <Select value={reportBasis} onValueChange={setReportBasis}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accrual">Accrual</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportFormat">Format</Label>
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="detail">Detail</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={handleRefreshReport}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Cash Flow</CardTitle>
            <Activity className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.operating_cash_flow || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>From operations</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investing Cash Flow</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.investing_cash_flow || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>From investments</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financing Cash Flow</CardTitle>
            <TrendingDown className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.financing_cash_flow || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>From financing</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.net_cash_flow || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Total net change</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {reportData.company_name || currentCompany?.name || 'Company'}
              </CardTitle>
              <div className="text-lg font-semibold">Statement of Cash Flows</div>
              <div className="text-sm text-gray-600">
                {reportData.period || 'Current Period'} • {method.charAt(0).toUpperCase() + method.slice(1)} Method
                {reportData.report_basis && ` • ${reportData.report_basis} Basis`}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/3">Cash Flow Activity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Operating Activities */}
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold text-blue-800">CASH FLOWS FROM OPERATING ACTIVITIES</TableCell>
                <TableCell></TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-4">Net Income</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reportData.net_income || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-4">Adjustments to reconcile net income</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reportData.adjustments || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t">
                <TableCell className="font-medium">Net Cash from Operating Activities</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(reportData.operating_cash_flow || 0)}
                </TableCell>
              </TableRow>

              {/* Investing Activities */}
              <TableRow className="bg-green-50">
                <TableCell className="font-bold text-green-800">CASH FLOWS FROM INVESTING ACTIVITIES</TableCell>
                <TableCell></TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-4">Capital expenditures</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reportData.capital_expenditures || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-4">Investment activities</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reportData.investment_activities || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t">
                <TableCell className="font-medium">Net Cash from Investing Activities</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(reportData.investing_cash_flow || 0)}
                </TableCell>
              </TableRow>

              {/* Financing Activities */}
              <TableRow className="bg-purple-50">
                <TableCell className="font-bold text-purple-800">CASH FLOWS FROM FINANCING ACTIVITIES</TableCell>
                <TableCell></TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-4">Loan proceeds</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reportData.loan_proceeds || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-4">Loan repayments</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reportData.loan_repayments || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t">
                <TableCell className="font-medium">Net Cash from Financing Activities</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(reportData.financing_cash_flow || 0)}
                </TableCell>
              </TableRow>

              {/* Net Change in Cash */}
              <TableRow className="bg-orange-50 border-t-4 border-orange-600">
                <TableCell className="font-bold text-orange-800">NET CHANGE IN CASH</TableCell>
                <TableCell className="text-right font-bold text-orange-800">
                  {formatCurrency(reportData.net_cash_flow || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Cash at beginning of period</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(reportData.beginning_cash || 0)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t-2 border-gray-600">
                <TableCell className="font-bold">Cash at end of period</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency((reportData.beginning_cash || 0) + (reportData.net_cash_flow || 0))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Key Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Operating Cash Flow Margin:</span>
                  <span className="font-medium">
                    {reportData.total_revenue && reportData.total_revenue > 0 
                      ? ((reportData.operating_cash_flow / reportData.total_revenue) * 100).toFixed(1) + '%'
                      : '0.0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Free Cash Flow:</span>
                  <span className="font-medium">
                    {formatCurrency((reportData.operating_cash_flow || 0) - (reportData.capital_expenditures || 0))}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Cash Flow Trends</h4>
              <div className="text-center text-gray-600">
                <LineChart className="w-12 h-12 mx-auto mb-2" />
                <p>Interactive cash flow chart will be displayed here</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowReport;