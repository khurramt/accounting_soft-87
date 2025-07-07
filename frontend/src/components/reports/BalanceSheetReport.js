import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { 
  Download, 
  Printer, 
  Mail, 
  Calendar,
  Building,
  TrendingUp,
  DollarSign,
  FileText,
  RefreshCw,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from "lucide-react";

const BalanceSheetReport = () => {
  const [searchParams] = useSearchParams();
  const reportName = searchParams.get('report') || 'Balance Sheet';
  const category = searchParams.get('category') || 'Company & Financial';
  
  const [asOfDate, setAsOfDate] = useState("2024-01-31");
  const [reportBasis, setReportBasis] = useState("accrual");
  const [reportFormat, setReportFormat] = useState("standard");
  const [comparisonPeriod, setComparisonPeriod] = useState("none");

  // Mock Balance Sheet data
  const [reportData] = useState({
    companyName: "Your Company Name",
    reportTitle: "Balance Sheet",
    asOfDate: "January 31, 2024",
    reportBasis: "Accrual Basis",
    generatedDate: "February 1, 2024",
    assets: {
      title: "ASSETS",
      currentAssets: {
        title: "Current Assets",
        accounts: [
          { name: "Checking Account", current: 45000.00, previous: 38000.00 },
          { name: "Savings Account", current: 25000.00, previous: 22000.00 },
          { name: "Accounts Receivable", current: 18500.00, previous: 22000.00 },
          { name: "Inventory", current: 32000.00, previous: 28000.00 },
          { name: "Prepaid Expenses", current: 4500.00, previous: 3800.00 },
          { name: "Other Current Assets", current: 2000.00, previous: 1500.00 }
        ],
        total: 127000.00,
        previousTotal: 115300.00
      },
      fixedAssets: {
        title: "Fixed Assets",
        accounts: [
          { name: "Equipment", current: 85000.00, previous: 85000.00 },
          { name: "Less: Accumulated Depreciation", current: -22000.00, previous: -18000.00 },
          { name: "Furniture & Fixtures", current: 15000.00, previous: 15000.00 },
          { name: "Less: Accumulated Depreciation", current: -4500.00, previous: -3000.00 },
          { name: "Vehicles", current: 45000.00, previous: 45000.00 },
          { name: "Less: Accumulated Depreciation", current: -12000.00, previous: -8000.00 }
        ],
        total: 106500.00,
        previousTotal: 116000.00
      },
      otherAssets: {
        title: "Other Assets",
        accounts: [
          { name: "Security Deposits", current: 3500.00, previous: 3500.00 },
          { name: "Investments", current: 15000.00, previous: 12000.00 }
        ],
        total: 18500.00,
        previousTotal: 15500.00
      },
      totalAssets: 252000.00,
      previousTotalAssets: 246800.00
    },
    liabilities: {
      title: "LIABILITIES & EQUITY",
      currentLiabilities: {
        title: "Current Liabilities",
        accounts: [
          { name: "Accounts Payable", current: 12500.00, previous: 15000.00 },
          { name: "Credit Card", current: 3200.00, previous: 2800.00 },
          { name: "Accrued Expenses", current: 8500.00, previous: 7200.00 },
          { name: "Payroll Liabilities", current: 4200.00, previous: 3800.00 },
          { name: "Sales Tax Payable", current: 2800.00, previous: 2400.00 },
          { name: "Current Portion of Long-term Debt", current: 6000.00, previous: 6000.00 }
        ],
        total: 37200.00,
        previousTotal: 37200.00
      },
      longTermLiabilities: {
        title: "Long-term Liabilities",
        accounts: [
          { name: "Equipment Loan", current: 28000.00, previous: 34000.00 },
          { name: "Building Loan", current: 125000.00, previous: 130000.00 }
        ],
        total: 153000.00,
        previousTotal: 164000.00
      },
      totalLiabilities: 190200.00,
      previousTotalLiabilities: 201200.00
    },
    equity: {
      title: "Equity",
      accounts: [
        { name: "Owner's Equity", current: 30000.00, previous: 30000.00 },
        { name: "Retained Earnings", current: 15400.00, previous: 14800.00 },
        { name: "Current Year Earnings", current: 16400.00, previous: 800.00 }
      ],
      total: 61800.00,
      previousTotal: 45600.00
    },
    totalLiabilitiesAndEquity: 252000.00,
    previousTotalLiabilitiesAndEquity: 246800.00
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatAmount = (amount) => {
    if (amount < 0) {
      return `(${formatCurrency(amount)})`;
    }
    return formatCurrency(amount);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{reportName}</h1>
          <p className="text-gray-600">Assets, liabilities, and equity statement</p>
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
              <Label htmlFor="asOfDate">As Of Date</Label>
              <input
                type="date"
                id="asOfDate"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.assets.totalAssets)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getVarianceIcon(reportData.assets.totalAssets, reportData.assets.previousTotalAssets)}
              <span className={getVarianceColor(reportData.assets.totalAssets, reportData.assets.previousTotalAssets)}>
                {calculatePercentage(reportData.assets.totalAssets, reportData.assets.previousTotalAssets)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <FileText className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.liabilities.totalLiabilities)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getVarianceIcon(reportData.liabilities.totalLiabilities, reportData.liabilities.previousTotalLiabilities)}
              <span className={getVarianceColor(reportData.liabilities.totalLiabilities, reportData.liabilities.previousTotalLiabilities)}>
                {calculatePercentage(reportData.liabilities.totalLiabilities, reportData.liabilities.previousTotalLiabilities)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.equity.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getVarianceIcon(reportData.equity.total, reportData.equity.previousTotal)}
              <span className={getVarianceColor(reportData.equity.total, reportData.equity.previousTotal)}>
                {calculatePercentage(reportData.equity.total, reportData.equity.previousTotal)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt to Equity</CardTitle>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(reportData.liabilities.totalLiabilities / reportData.equity.total).toFixed(2)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Industry avg: 1.25</span>
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
                As of {reportData.asOfDate} • {reportData.reportBasis}
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
                <TableHead className="text-right">Amount</TableHead>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableHead className="text-right">Previous</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* ASSETS */}
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold text-blue-800 text-lg">{reportData.assets.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {/* Current Assets */}
              <TableRow>
                <TableCell className="font-semibold pl-4">{reportData.assets.currentAssets.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {reportData.assets.currentAssets.accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-8">{account.name}</TableCell>
                  <TableCell className="text-right">{formatAmount(account.current)}</TableCell>
                  {comparisonPeriod !== 'none' && (
                    <>
                      <TableCell className="text-right">{formatAmount(account.previous)}</TableCell>
                      <TableCell className="text-right">{formatAmount(account.current - account.previous)}</TableCell>
                      <TableCell className="text-right">
                        <span className={getVarianceColor(account.current, account.previous)}>
                          {calculatePercentage(account.current, account.previous)}%
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              <TableRow className="border-t">
                <TableCell className="font-semibold pl-6">Total Current Assets</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(reportData.assets.currentAssets.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-semibold">{formatCurrency(reportData.assets.currentAssets.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatAmount(reportData.assets.currentAssets.total - reportData.assets.currentAssets.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={getVarianceColor(reportData.assets.currentAssets.total, reportData.assets.currentAssets.previousTotal)}>
                        {calculatePercentage(reportData.assets.currentAssets.total, reportData.assets.currentAssets.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Fixed Assets */}
              <TableRow>
                <TableCell className="font-semibold pl-4">{reportData.assets.fixedAssets.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {reportData.assets.fixedAssets.accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-8">{account.name}</TableCell>
                  <TableCell className="text-right">{formatAmount(account.current)}</TableCell>
                  {comparisonPeriod !== 'none' && (
                    <>
                      <TableCell className="text-right">{formatAmount(account.previous)}</TableCell>
                      <TableCell className="text-right">{formatAmount(account.current - account.previous)}</TableCell>
                      <TableCell className="text-right">
                        <span className={getVarianceColor(account.current, account.previous)}>
                          {calculatePercentage(account.current, account.previous)}%
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              <TableRow className="border-t">
                <TableCell className="font-semibold pl-6">Total Fixed Assets</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(reportData.assets.fixedAssets.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-semibold">{formatCurrency(reportData.assets.fixedAssets.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatAmount(reportData.assets.fixedAssets.total - reportData.assets.fixedAssets.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={getVarianceColor(reportData.assets.fixedAssets.total, reportData.assets.fixedAssets.previousTotal)}>
                        {calculatePercentage(reportData.assets.fixedAssets.total, reportData.assets.fixedAssets.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Other Assets */}
              <TableRow>
                <TableCell className="font-semibold pl-4">{reportData.assets.otherAssets.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {reportData.assets.otherAssets.accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-8">{account.name}</TableCell>
                  <TableCell className="text-right">{formatAmount(account.current)}</TableCell>
                  {comparisonPeriod !== 'none' && (
                    <>
                      <TableCell className="text-right">{formatAmount(account.previous)}</TableCell>
                      <TableCell className="text-right">{formatAmount(account.current - account.previous)}</TableCell>
                      <TableCell className="text-right">
                        <span className={getVarianceColor(account.current, account.previous)}>
                          {calculatePercentage(account.current, account.previous)}%
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              <TableRow className="border-t">
                <TableCell className="font-semibold pl-6">Total Other Assets</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(reportData.assets.otherAssets.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-semibold">{formatCurrency(reportData.assets.otherAssets.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatAmount(reportData.assets.otherAssets.total - reportData.assets.otherAssets.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={getVarianceColor(reportData.assets.otherAssets.total, reportData.assets.otherAssets.previousTotal)}>
                        {calculatePercentage(reportData.assets.otherAssets.total, reportData.assets.otherAssets.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Total Assets */}
              <TableRow className="bg-blue-50 border-t-2 border-blue-600">
                <TableCell className="font-bold text-blue-800 text-lg">TOTAL ASSETS</TableCell>
                <TableCell className="text-right font-bold text-blue-800 text-lg">{formatCurrency(reportData.assets.totalAssets)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-bold text-blue-800 text-lg">{formatCurrency(reportData.assets.previousTotalAssets)}</TableCell>
                    <TableCell className="text-right font-bold text-blue-800 text-lg">{formatAmount(reportData.assets.totalAssets - reportData.assets.previousTotalAssets)}</TableCell>
                    <TableCell className="text-right font-bold text-blue-800 text-lg">
                      {calculatePercentage(reportData.assets.totalAssets, reportData.assets.previousTotalAssets)}%
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Spacer */}
              <TableRow>
                <TableCell colSpan={comparisonPeriod !== 'none' ? 5 : 2} className="py-2"></TableCell>
              </TableRow>

              {/* LIABILITIES & EQUITY */}
              <TableRow className="bg-red-50">
                <TableCell className="font-bold text-red-800 text-lg">{reportData.liabilities.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {/* Current Liabilities */}
              <TableRow>
                <TableCell className="font-semibold pl-4">{reportData.liabilities.currentLiabilities.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {reportData.liabilities.currentLiabilities.accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-8">{account.name}</TableCell>
                  <TableCell className="text-right">{formatAmount(account.current)}</TableCell>
                  {comparisonPeriod !== 'none' && (
                    <>
                      <TableCell className="text-right">{formatAmount(account.previous)}</TableCell>
                      <TableCell className="text-right">{formatAmount(account.current - account.previous)}</TableCell>
                      <TableCell className="text-right">
                        <span className={getVarianceColor(account.current, account.previous)}>
                          {calculatePercentage(account.current, account.previous)}%
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              <TableRow className="border-t">
                <TableCell className="font-semibold pl-6">Total Current Liabilities</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(reportData.liabilities.currentLiabilities.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-semibold">{formatCurrency(reportData.liabilities.currentLiabilities.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatAmount(reportData.liabilities.currentLiabilities.total - reportData.liabilities.currentLiabilities.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={getVarianceColor(reportData.liabilities.currentLiabilities.total, reportData.liabilities.currentLiabilities.previousTotal)}>
                        {calculatePercentage(reportData.liabilities.currentLiabilities.total, reportData.liabilities.currentLiabilities.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Long-term Liabilities */}
              <TableRow>
                <TableCell className="font-semibold pl-4">{reportData.liabilities.longTermLiabilities.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {reportData.liabilities.longTermLiabilities.accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-8">{account.name}</TableCell>
                  <TableCell className="text-right">{formatAmount(account.current)}</TableCell>
                  {comparisonPeriod !== 'none' && (
                    <>
                      <TableCell className="text-right">{formatAmount(account.previous)}</TableCell>
                      <TableCell className="text-right">{formatAmount(account.current - account.previous)}</TableCell>
                      <TableCell className="text-right">
                        <span className={getVarianceColor(account.current, account.previous)}>
                          {calculatePercentage(account.current, account.previous)}%
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              <TableRow className="border-t">
                <TableCell className="font-semibold pl-6">Total Long-term Liabilities</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(reportData.liabilities.longTermLiabilities.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-semibold">{formatCurrency(reportData.liabilities.longTermLiabilities.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatAmount(reportData.liabilities.longTermLiabilities.total - reportData.liabilities.longTermLiabilities.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={getVarianceColor(reportData.liabilities.longTermLiabilities.total, reportData.liabilities.longTermLiabilities.previousTotal)}>
                        {calculatePercentage(reportData.liabilities.longTermLiabilities.total, reportData.liabilities.longTermLiabilities.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Total Liabilities */}
              <TableRow className="border-t-2 border-gray-300">
                <TableCell className="font-bold">Total Liabilities</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(reportData.liabilities.totalLiabilities)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-bold">{formatCurrency(reportData.liabilities.previousTotalLiabilities)}</TableCell>
                    <TableCell className="text-right font-bold">{formatAmount(reportData.liabilities.totalLiabilities - reportData.liabilities.previousTotalLiabilities)}</TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={getVarianceColor(reportData.liabilities.totalLiabilities, reportData.liabilities.previousTotalLiabilities)}>
                        {calculatePercentage(reportData.liabilities.totalLiabilities, reportData.liabilities.previousTotalLiabilities)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Equity */}
              <TableRow>
                <TableCell className="font-semibold pl-4">{reportData.equity.title}</TableCell>
                <TableCell></TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </>
                )}
              </TableRow>

              {reportData.equity.accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-8">{account.name}</TableCell>
                  <TableCell className="text-right">{formatAmount(account.current)}</TableCell>
                  {comparisonPeriod !== 'none' && (
                    <>
                      <TableCell className="text-right">{formatAmount(account.previous)}</TableCell>
                      <TableCell className="text-right">{formatAmount(account.current - account.previous)}</TableCell>
                      <TableCell className="text-right">
                        <span className={getVarianceColor(account.current, account.previous)}>
                          {calculatePercentage(account.current, account.previous)}%
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              <TableRow className="border-t">
                <TableCell className="font-semibold pl-6">Total Equity</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(reportData.equity.total)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-semibold">{formatCurrency(reportData.equity.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatAmount(reportData.equity.total - reportData.equity.previousTotal)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={getVarianceColor(reportData.equity.total, reportData.equity.previousTotal)}>
                        {calculatePercentage(reportData.equity.total, reportData.equity.previousTotal)}%
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Total Liabilities and Equity */}
              <TableRow className="bg-red-50 border-t-4 border-red-600">
                <TableCell className="font-bold text-red-800 text-lg">TOTAL LIABILITIES & EQUITY</TableCell>
                <TableCell className="text-right font-bold text-red-800 text-lg">{formatCurrency(reportData.totalLiabilitiesAndEquity)}</TableCell>
                {comparisonPeriod !== 'none' && (
                  <>
                    <TableCell className="text-right font-bold text-red-800 text-lg">{formatCurrency(reportData.previousTotalLiabilitiesAndEquity)}</TableCell>
                    <TableCell className="text-right font-bold text-red-800 text-lg">{formatAmount(reportData.totalLiabilitiesAndEquity - reportData.previousTotalLiabilitiesAndEquity)}</TableCell>
                    <TableCell className="text-right font-bold text-red-800 text-lg">
                      {calculatePercentage(reportData.totalLiabilitiesAndEquity, reportData.previousTotalLiabilitiesAndEquity)}%
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
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <FileText className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <Button variant="outline">
                <PieChart className="w-4 h-4 mr-2" />
                View Charts
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

export default BalanceSheetReport;