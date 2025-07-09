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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Download, 
  Printer, 
  Mail, 
  Settings, 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Filter,
  Share,
  BookOpen,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Star,
  Clock,
  Loader2
} from "lucide-react";

const ProfitLossReport = () => {
  const [searchParams] = useSearchParams();
  const reportName = searchParams.get('report') || 'Profit & Loss';
  const category = searchParams.get('category') || 'Company & Financial';
  const { currentCompany } = useCompany();
  
  const [dateRange, setDateRange] = useState("current-month");
  const [reportBasis, setReportBasis] = useState("accrual");
  const [reportFormat, setReportFormat] = useState("standard");
  const [comparisonPeriod, setComparisonPeriod] = useState("none");
  const [showDetail, setShowDetail] = useState("summary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Load report data from backend
  useEffect(() => {
    const loadReportData = async () => {
      if (!currentCompany) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range
        const { startDate, endDate } = getDateRange(dateRange);
        
        // Prepare report parameters
        const params = {
          start_date: startDate,
          end_date: endDate,
          comparison_type: comparisonPeriod === 'none' ? 'none' : comparisonPeriod,
          include_subtotals: showDetail !== 'summary',
          show_cents: true
        };
        
        console.log('Loading P&L report with params:', params);
        const data = await reportService.getProfitLossReport(currentCompany.id, params);
        setReportData(data);
      } catch (err) {
        console.error('Error loading P&L report:', err);
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    
    loadReportData();
  }, [currentCompany, dateRange, reportBasis, comparisonPeriod, showDetail]);

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
          comparison_type: comparisonPeriod === 'none' ? 'none' : comparisonPeriod,
          include_subtotals: showDetail !== 'summary',
          show_cents: true
        };
        
        const data = await reportService.getProfitLossReport(currentCompany.id, params);
        setReportData(data);
      } catch (err) {
        console.error('Error refreshing P&L report:', err);
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

  const getVarianceIcon = (current, previous) => {
    const currentNum = typeof current === 'string' ? parseFloat(current) : current;
    const previousNum = typeof previous === 'string' ? parseFloat(previous) : previous;
    
    if (currentNum > previousNum) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (currentNum < previousNum) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg">Loading Profit & Loss Report...</span>
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
          <p className="text-gray-600">Comprehensive income and expense analysis</p>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
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
                  <SelectItem value="comparative">Comparative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="comparisonPeriod">Comparison</Label>
              <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="previous-period">Previous Period</SelectItem>
                  <SelectItem value="previous-year">Previous Year</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="showDetail">Detail Level</Label>
              <Select value={showDetail} onValueChange={setShowDetail}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Only</SelectItem>
                  <SelectItem value="detail">Show Details</SelectItem>
                  <SelectItem value="all">All Transactions</SelectItem>
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

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.total_revenue || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.previous_total_revenue && (
                <span className={getVarianceColor(reportData.total_revenue, reportData.previous_total_revenue)}>
                  {calculatePercentage(reportData.total_revenue, reportData.previous_total_revenue)}% vs last period
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.total_expenses || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.previous_total_expenses && (
                <span className={getVarianceColor(reportData.total_expenses, reportData.previous_total_expenses)}>
                  {calculatePercentage(reportData.total_expenses, reportData.previous_total_expenses)}% vs last period
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.net_income || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.previous_net_income && (
                <span className={getVarianceColor(reportData.net_income, reportData.previous_net_income)}>
                  {calculatePercentage(reportData.net_income, reportData.previous_net_income)}% vs last period
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.total_revenue && reportData.total_revenue > 0 
                ? ((reportData.net_income / reportData.total_revenue) * 100).toFixed(1) + '%'
                : '0.0%'
              }
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Based on current period</span>
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
              <div className="text-lg font-semibold">Profit & Loss Report</div>
              <div className="text-sm text-gray-600">
                {reportData.period || 'Current Period'}
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
                <TableHead className="w-2/3">Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableHead className="text-right">
                      {comparisonPeriod === 'previous-period' ? 'Previous Period' :
                       comparisonPeriod === 'previous-year' ? 'Previous Year' : 'Budget'}
                    </TableHead>
                    <TableHead className="text-right">$ Change</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Revenue Section */}
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold text-blue-800">Revenue</TableCell>
                <TableCell className="text-right font-bold text-blue-800">
                  {formatCurrency(reportData.total_revenue || 0)}
                </TableCell>
                {comparisonPeriod !== 'none' && reportData.previous_total_revenue && (
                  <>
                    <TableCell className="text-right font-bold text-blue-800">
                      {formatCurrency(reportData.previous_total_revenue)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-800">
                      {formatCurrency((reportData.total_revenue || 0) - reportData.previous_total_revenue)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-800">
                      {calculatePercentage(reportData.total_revenue, reportData.previous_total_revenue)}%
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Expenses Section */}
              <TableRow className="bg-red-50">
                <TableCell className="font-bold text-red-800">Expenses</TableCell>
                <TableCell className="text-right font-bold text-red-800">
                  {formatCurrency(reportData.total_expenses || 0)}
                </TableCell>
                {comparisonPeriod !== 'none' && reportData.previous_total_expenses && (
                  <>
                    <TableCell className="text-right font-bold text-red-800">
                      {formatCurrency(reportData.previous_total_expenses)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-800">
                      {formatCurrency((reportData.total_expenses || 0) - reportData.previous_total_expenses)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-800">
                      {calculatePercentage(reportData.total_expenses, reportData.previous_total_expenses)}%
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Net Income */}
              <TableRow className="bg-green-50 border-t-4 border-green-600">
                <TableCell className="font-bold text-green-800">Net Income</TableCell>
                <TableCell className="text-right font-bold text-green-800">
                  {formatCurrency(reportData.net_income || 0)}
                </TableCell>
                {comparisonPeriod !== 'none' && reportData.previous_net_income && (
                  <>
                    <TableCell className="text-right font-bold text-green-800">
                      {formatCurrency(reportData.previous_net_income)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-800">
                      {formatCurrency((reportData.net_income || 0) - reportData.previous_net_income)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-800">
                      {calculatePercentage(reportData.net_income, reportData.previous_net_income)}%
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossReport;