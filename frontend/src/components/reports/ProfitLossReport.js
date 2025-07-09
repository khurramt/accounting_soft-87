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
    companyName: "Your Company Name",
    reportTitle: "Profit & Loss",
    period: "January 1 - 31, 2024",
    reportBasis: "Accrual Basis",
    generatedDate: "February 1, 2024",
    income: {
      title: "Income",
      accounts: [
        {
          name: "Sales Revenue",
          current: 125000.00,
          previous: 118000.00,
          budgeted: 120000.00,
          subcategories: [
            { name: "Product Sales", current: 95000.00, previous: 88000.00 },
            { name: "Service Revenue", current: 30000.00, previous: 30000.00 }
          ]
        },
        {
          name: "Other Income",
          current: 2500.00,
          previous: 1800.00,
          budgeted: 2000.00,
          subcategories: [
            { name: "Interest Income", current: 1500.00, previous: 1200.00 },
            { name: "Miscellaneous Income", current: 1000.00, previous: 600.00 }
          ]
        }
      ],
      total: 127500.00,
      previousTotal: 119800.00,
      budgetedTotal: 122000.00
    },
    grossProfit: {
      title: "Gross Profit",
      current: 127500.00,
      previous: 119800.00,
      budgeted: 122000.00
    },
    expenses: {
      title: "Expenses",
      accounts: [
        {
          name: "Cost of Goods Sold",
          current: 45000.00,
          previous: 42000.00,
          budgeted: 43000.00,
          subcategories: [
            { name: "Materials", current: 30000.00, previous: 28000.00 },
            { name: "Direct Labor", current: 15000.00, previous: 14000.00 }
          ]
        },
        {
          name: "Operating Expenses", 
          current: 32500.00,
          previous: 31000.00,
          budgeted: 33000.00,
          subcategories: [
            { name: "Rent", current: 8000.00, previous: 8000.00 },
            { name: "Utilities", current: 1500.00, previous: 1400.00 },
            { name: "Office Supplies", current: 800.00, previous: 750.00 },
            { name: "Marketing", current: 5200.00, previous: 4800.00 },
            { name: "Professional Services", current: 3500.00, previous: 3200.00 },
            { name: "Insurance", current: 2500.00, previous: 2500.00 },
            { name: "Depreciation", current: 2000.00, previous: 2000.00 },
            { name: "Other Expenses", current: 9000.00, previous: 8350.00 }
          ]
        },
        {
          name: "Administrative Expenses",
          current: 18500.00,
          previous: 17200.00,
          budgeted: 18000.00,
          subcategories: [
            { name: "Salaries & Wages", current: 12000.00, previous: 11500.00 },
            { name: "Employee Benefits", current: 3500.00, previous: 3200.00 },
            { name: "Payroll Taxes", current: 1500.00, previous: 1400.00 },
            { name: "Training", current: 800.00, previous: 600.00 },
            { name: "Other Admin", current: 700.00, previous: 500.00 }
          ]
        }
      ],
      total: 96000.00,
      previousTotal: 90200.00,
      budgetedTotal: 94000.00
    },
    netIncome: {
      title: "Net Income",
      current: 31500.00,
      previous: 29600.00,
      budgeted: 28000.00
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculatePercentage = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getVarianceColor = (current, previous) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (current, previous) => {
    if (current > previous) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (current < previous) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return null;
  };

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
              <Button className="w-full">
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
            <div className="text-2xl font-bold">{formatCurrency(reportData.income.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getVarianceIcon(reportData.income.total, reportData.income.previousTotal)}
              <span className={getVarianceColor(reportData.income.total, reportData.income.previousTotal)}>
                {calculatePercentage(reportData.income.total, reportData.income.previousTotal)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.expenses.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getVarianceIcon(reportData.expenses.total, reportData.expenses.previousTotal)}
              <span className={getVarianceColor(reportData.expenses.total, reportData.expenses.previousTotal)}>
                {calculatePercentage(reportData.expenses.total, reportData.expenses.previousTotal)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.netIncome.current)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getVarianceIcon(reportData.netIncome.current, reportData.netIncome.previous)}
              <span className={getVarianceColor(reportData.netIncome.current, reportData.netIncome.previous)}>
                {calculatePercentage(reportData.netIncome.current, reportData.netIncome.previous)}% vs last period
              </span>
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
              {(reportData.netIncome.current / reportData.income.total * 100).toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>
                Industry avg: 15.2%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{reportData.companyName}</CardTitle>
              <div className="text-lg font-semibold">{reportData.reportTitle}</div>
              <div className="text-sm text-gray-600">
                {reportData.period} • {reportData.reportBasis}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Generated: {reportData.generatedDate}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/3">Account</TableHead>
                <TableHead className="text-right">Current Period</TableHead>
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
              {/* Income Section */}
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold text-blue-800">{reportData.income.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>
              
              {reportData.income.accounts.map((account, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell className="font-medium pl-4">{account.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(account.current)}</TableCell>
                    {comparisonPeriod !== 'none' && (
                      <>
                        <TableCell className="text-right">
                          {formatCurrency(comparisonPeriod === 'budget' ? account.budgeted : account.previous)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.current - (comparisonPeriod === 'budget' ? account.budgeted : account.previous))}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={getVarianceColor(account.current, comparisonPeriod === 'budget' ? account.budgeted : account.previous)}>
                            {calculatePercentage(account.current, comparisonPeriod === 'budget' ? account.budgeted : account.previous)}%
                          </span>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  {showDetail !== 'summary' && account.subcategories.map((sub, subIndex) => (
                    <TableRow key={`${index}-${subIndex}`} className="text-sm">
                      <TableCell className="pl-8 text-gray-600">{sub.name}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatCurrency(sub.current)}</TableCell>
                      {comparisonPeriod !== 'none' && (
                        <>
                          <TableCell className="text-right text-gray-600">{formatCurrency(sub.previous)}</TableCell>
                          <TableCell className="text-right text-gray-600">{formatCurrency(sub.current - sub.previous)}</TableCell>
                          <TableCell className="text-right text-gray-600">{calculatePercentage(sub.current, sub.previous)}%</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Total Income */}
              <TableRow className="border-t-2 border-gray-300">
                <TableCell className="font-bold">Total {reportData.income.title}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(reportData.income.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(comparisonPeriod === 'budget' ? reportData.income.budgetedTotal : reportData.income.previousTotal)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(reportData.income.total - (comparisonPeriod === 'budget' ? reportData.income.budgetedTotal : reportData.income.previousTotal))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={getVarianceColor(reportData.income.total, comparisonPeriod === 'budget' ? reportData.income.budgetedTotal : reportData.income.previousTotal)}>
                        {calculatePercentage(reportData.income.total, comparisonPeriod === 'budget' ? reportData.income.budgetedTotal : reportData.income.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Gross Profit */}
              <TableRow className="bg-green-50">
                <TableCell className="font-bold text-green-800">{reportData.grossProfit.title}</TableCell>
                <TableCell className="text-right font-bold text-green-800">{formatCurrency(reportData.grossProfit.current)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-bold text-green-800">
                      {formatCurrency(comparisonPeriod === 'budget' ? reportData.grossProfit.budgeted : reportData.grossProfit.previous)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-800">
                      {formatCurrency(reportData.grossProfit.current - (comparisonPeriod === 'budget' ? reportData.grossProfit.budgeted : reportData.grossProfit.previous))}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-800">
                      {calculatePercentage(reportData.grossProfit.current, comparisonPeriod === 'budget' ? reportData.grossProfit.budgeted : reportData.grossProfit.previous)}%
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Expenses Section */}
              <TableRow className="bg-red-50">
                <TableCell className="font-bold text-red-800">{reportData.expenses.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>
              
              {reportData.expenses.accounts.map((account, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell className="font-medium pl-4">{account.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(account.current)}</TableCell>
                    {comparisonPeriod !== 'none' && (
                      <>
                        <TableCell className="text-right">
                          {formatCurrency(comparisonPeriod === 'budget' ? account.budgeted : account.previous)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.current - (comparisonPeriod === 'budget' ? account.budgeted : account.previous))}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={getVarianceColor(account.current, comparisonPeriod === 'budget' ? account.budgeted : account.previous)}>
                            {calculatePercentage(account.current, comparisonPeriod === 'budget' ? account.budgeted : account.previous)}%
                          </span>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  {showDetail !== 'summary' && account.subcategories.map((sub, subIndex) => (
                    <TableRow key={`${index}-${subIndex}`} className="text-sm">
                      <TableCell className="pl-8 text-gray-600">{sub.name}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatCurrency(sub.current)}</TableCell>
                      {comparisonPeriod !== 'none' && (
                        <>
                          <TableCell className="text-right text-gray-600">{formatCurrency(sub.previous)}</TableCell>
                          <TableCell className="text-right text-gray-600">{formatCurrency(sub.current - sub.previous)}</TableCell>
                          <TableCell className="text-right text-gray-600">{calculatePercentage(sub.current, sub.previous)}%</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Total Expenses */}
              <TableRow className="border-t-2 border-gray-300">
                <TableCell className="font-bold">Total {reportData.expenses.title}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(reportData.expenses.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(comparisonPeriod === 'budget' ? reportData.expenses.budgetedTotal : reportData.expenses.previousTotal)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(reportData.expenses.total - (comparisonPeriod === 'budget' ? reportData.expenses.budgetedTotal : reportData.expenses.previousTotal))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={getVarianceColor(reportData.expenses.total, comparisonPeriod === 'budget' ? reportData.expenses.budgetedTotal : reportData.expenses.previousTotal)}>
                        {calculatePercentage(reportData.expenses.total, comparisonPeriod === 'budget' ? reportData.expenses.budgetedTotal : reportData.expenses.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Net Income */}
              <TableRow className="bg-blue-50 border-t-4 border-blue-600">
                <TableCell className="font-bold text-blue-800 text-lg">{reportData.netIncome.title}</TableCell>
                <TableCell className="text-right font-bold text-blue-800 text-lg">{formatCurrency(reportData.netIncome.current)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-bold text-blue-800 text-lg">
                      {formatCurrency(comparisonPeriod === 'budget' ? reportData.netIncome.budgeted : reportData.netIncome.previous)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-800 text-lg">
                      {formatCurrency(reportData.netIncome.current - (comparisonPeriod === 'budget' ? reportData.netIncome.budgeted : reportData.netIncome.previous))}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-800 text-lg">
                      {calculatePercentage(reportData.netIncome.current, comparisonPeriod === 'budget' ? reportData.netIncome.budgeted : reportData.netIncome.previous)}%
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleSchedule}>
                <Clock className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <FileText className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossReport;