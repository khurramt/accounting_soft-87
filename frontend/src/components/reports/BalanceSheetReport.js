import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import reportService from "../../services/reportService";
import { formatCurrency, calculatePercentage, getVarianceColor } from "../../utils/formatCurrency";
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
  PieChart,
  Loader2
} from "lucide-react";

const BalanceSheetReport = () => {
  const [searchParams] = useSearchParams();
  const reportName = searchParams.get('report') || 'Balance Sheet';
  const category = searchParams.get('category') || 'Company & Financial';
  const { currentCompany, loading: companyLoading, error: companyError } = useCompany();
  
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportBasis, setReportBasis] = useState("accrual");
  const [reportFormat, setReportFormat] = useState("standard");
  const [comparisonPeriod, setComparisonPeriod] = useState("none");
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
        
        // Prepare report parameters
        const params = {
          as_of_date: asOfDate,
          comparison_date: comparisonPeriod === 'previous-year' ? getPreviousYearDate(asOfDate) : undefined,
          include_subtotals: reportFormat === 'detail',
          show_cents: true
        };
        
        console.log('Loading Balance Sheet report with params:', params);
        const data = await reportService.getBalanceSheetReport(currentCompany.id, params);
        setReportData(data);
      } catch (err) {
        console.error('Error loading Balance Sheet report:', err);
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    
    loadReportData();
  }, [currentCompany, companyLoading, companyError, asOfDate, reportBasis, comparisonPeriod, reportFormat]);

  // Helper function to get previous year date
  const getPreviousYearDate = (date) => {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  };

  // Handle refresh report
  const handleRefreshReport = () => {
    if (!currentCompany || !currentCompany.id) {
      setError('No company selected. Please select a company first.');
      return;
    }
    
    const loadReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          as_of_date: asOfDate,
          comparison_date: comparisonPeriod === 'previous-year' ? getPreviousYearDate(asOfDate) : undefined,
          include_subtotals: reportFormat === 'detail',
          show_cents: true
        };
        
        const data = await reportService.getBalanceSheetReport(currentCompany.id, params);
        setReportData(data);
      } catch (err) {
        console.error('Error refreshing Balance Sheet report:', err);
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
            <span className="text-lg">Loading Balance Sheet Report...</span>
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
          <p className="text-gray-600">Assets, liabilities, and equity snapshot</p>
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
              <Label htmlFor="asOfDate">As of Date</Label>
              <input
                type="date"
                id="asOfDate"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <SelectItem value="previous-year">Previous Year</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.total_assets || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.previous_total_assets && (
                <span className={getVarianceColor(reportData.total_assets, reportData.previous_total_assets)}>
                  {calculatePercentage(reportData.total_assets, reportData.previous_total_assets)}% vs previous
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingUp className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.total_liabilities || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.previous_total_liabilities && (
                <span className={getVarianceColor(reportData.total_liabilities, reportData.previous_total_liabilities)}>
                  {calculatePercentage(reportData.total_liabilities, reportData.previous_total_liabilities)}% vs previous
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.total_equity || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {reportData.previous_total_equity && (
                <span className={getVarianceColor(reportData.total_equity, reportData.previous_total_equity)}>
                  {calculatePercentage(reportData.total_equity, reportData.previous_total_equity)}% vs previous
                </span>
              )}
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
              <div className="text-lg font-semibold">Balance Sheet</div>
              <div className="text-sm text-gray-600">
                As of {reportData.as_of_date || asOfDate}
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
                    <TableHead className="text-right">Previous Year</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Assets Section */}
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold text-blue-800">ASSETS</TableCell>
                <TableCell className="text-right font-bold text-blue-800">
                  {formatCurrency(reportData.total_assets || 0)}
                </TableCell>
                {comparisonPeriod !== 'none' && reportData.previous_total_assets && (
                  <>
                    <TableCell className="text-right font-bold text-blue-800">
                      {formatCurrency(reportData.previous_total_assets)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-800">
                      {formatCurrency((reportData.total_assets || 0) - reportData.previous_total_assets)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-800">
                      {calculatePercentage(reportData.total_assets, reportData.previous_total_assets)}%
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Liabilities Section */}
              <TableRow className="bg-red-50">
                <TableCell className="font-bold text-red-800">LIABILITIES</TableCell>
                <TableCell className="text-right font-bold text-red-800">
                  {formatCurrency(reportData.total_liabilities || 0)}
                </TableCell>
                {comparisonPeriod !== 'none' && reportData.previous_total_liabilities && (
                  <>
                    <TableCell className="text-right font-bold text-red-800">
                      {formatCurrency(reportData.previous_total_liabilities)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-800">
                      {formatCurrency((reportData.total_liabilities || 0) - reportData.previous_total_liabilities)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-800">
                      {calculatePercentage(reportData.total_liabilities, reportData.previous_total_liabilities)}%
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Equity Section */}
              <TableRow className="bg-green-50">
                <TableCell className="font-bold text-green-800">EQUITY</TableCell>
                <TableCell className="text-right font-bold text-green-800">
                  {formatCurrency(reportData.total_equity || 0)}
                </TableCell>
                {comparisonPeriod !== 'none' && reportData.previous_total_equity && (
                  <>
                    <TableCell className="text-right font-bold text-green-800">
                      {formatCurrency(reportData.previous_total_equity)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-800">
                      {formatCurrency((reportData.total_equity || 0) - reportData.previous_total_equity)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-800">
                      {calculatePercentage(reportData.total_equity, reportData.previous_total_equity)}%
                    </TableCell>
                  </>
                )}
              </TableRow>

              {/* Balance Check */}
              <TableRow className="border-t-4 border-gray-600 bg-gray-50">
                <TableCell className="font-bold text-gray-800">TOTAL LIABILITIES + EQUITY</TableCell>
                <TableCell className="text-right font-bold text-gray-800">
                  {formatCurrency((reportData.total_liabilities || 0) + (reportData.total_equity || 0))}
                </TableCell>
                {comparisonPeriod !== 'none' && reportData.previous_total_liabilities && reportData.previous_total_equity && (
                  <>
                    <TableCell className="text-right font-bold text-gray-800">
                      {formatCurrency(reportData.previous_total_liabilities + reportData.previous_total_equity)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-800">
                      {formatCurrency(
                        ((reportData.total_liabilities || 0) + (reportData.total_equity || 0)) -
                        (reportData.previous_total_liabilities + reportData.previous_total_equity)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-800">
                      {calculatePercentage(
                        (reportData.total_liabilities || 0) + (reportData.total_equity || 0),
                        reportData.previous_total_liabilities + reportData.previous_total_equity
                      )}%
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

export default BalanceSheetReport;