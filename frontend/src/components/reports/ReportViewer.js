import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  ArrowLeft,
  Download,
  Mail,
  Printer,
  Share2,
  Settings,
  RefreshCw,
  Calendar,
  FileText,
  FileSpreadsheet,
  Image,
  Copy,
  Maximize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";

const ReportViewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportName = searchParams.get('report') || 'Profit & Loss';
  const reportCategory = searchParams.get('category') || 'Company & Financial';
  
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState('fit-width');

  // Mock report data - in real app this would come from API
  const mockReportData = {
    "Profit & Loss": {
      title: "Profit & Loss",
      subtitle: "January 1 - December 31, 2023",
      company: "Acme Corporation",
      generatedDate: "January 15, 2024 2:30 PM",
      reportBasis: "Accrual Basis",
      data: [
        {
          category: "Income",
          accounts: [
            { name: "Product Sales", amount: 125000.00 },
            { name: "Service Revenue", amount: 75000.00 },
            { name: "Other Income", amount: 5000.00 }
          ],
          total: 205000.00
        },
        {
          category: "Cost of Goods Sold",
          accounts: [
            { name: "Product Costs", amount: -45000.00 },
            { name: "Direct Labor", amount: -25000.00 }
          ],
          total: -70000.00
        },
        {
          category: "Gross Profit",
          total: 135000.00
        },
        {
          category: "Expenses",
          accounts: [
            { name: "Rent Expense", amount: -24000.00 },
            { name: "Utilities", amount: -6000.00 },
            { name: "Office Supplies", amount: -3000.00 },
            { name: "Marketing", amount: -12000.00 },
            { name: "Professional Services", amount: -8000.00 },
            { name: "Insurance", amount: -4000.00 },
            { name: "Other Expenses", amount: -2000.00 }
          ],
          total: -59000.00
        },
        {
          category: "Net Income",
          total: 76000.00
        }
      ]
    }
  };

  useEffect(() => {
    // Simulate loading report data
    setIsLoading(true);
    setTimeout(() => {
      setReportData(mockReportData[reportName] || mockReportData["Profit & Loss"]);
      setIsLoading(false);
    }, 1000);
  }, [reportName]);

  const handleExport = (format) => {
    console.log(`Exporting report as ${format}`);
    // Handle export functionality
  };

  const handleEmail = () => {
    console.log("Opening email dialog");
    // Open email composition modal
  };

  const handlePrint = () => {
    console.log("Printing report");
    window.print();
  };

  const handleShare = () => {
    console.log("Sharing report");
    // Open share options
  };

  const handleRefresh = () => {
    console.log("Refreshing report data");
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const isNegative = (amount) => amount < 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Generating Report...</p>
            <p className="text-sm text-gray-600">Please wait while we prepare your data</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">{reportData?.title}</h1>
            <p className="text-gray-600">{reportData?.subtitle}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">{reportCategory}</Badge>
              <Badge variant="outline">{reportData?.reportBasis}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate(`/reports/customize?report=${encodeURIComponent(reportName)}&category=${encodeURIComponent(reportCategory)}`)}>
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium px-2">{zoom}%</span>
                <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fit-width">Fit Width</SelectItem>
                  <SelectItem value="fit-page">Fit Page</SelectItem>
                  <SelectItem value="actual-size">Actual Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleExport('PDF')}>
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('Excel')}>
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button size="sm" variant="outline" onClick={handleEmail}>
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button size="sm" variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardContent className="p-0">
          <div 
            className="bg-white p-8 print:p-0" 
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              minHeight: '800px'
            }}
          >
            {/* Report Header */}
            <div className="text-center mb-8 border-b pb-4">
              <h1 className="text-2xl font-bold mb-2">{reportData?.company}</h1>
              <h2 className="text-xl font-semibold mb-1">{reportData?.title}</h2>
              <p className="text-gray-600 mb-2">{reportData?.subtitle}</p>
              <p className="text-sm text-gray-500">{reportData?.reportBasis}</p>
            </div>

            {/* Report Data */}
            <div className="space-y-6">
              {reportData?.data?.map((section, index) => (
                <div key={index}>
                  {section.category === "Gross Profit" || section.category === "Net Income" ? (
                    // Special handling for calculated totals
                    <div className={`flex justify-between items-center py-2 px-4 font-bold text-lg border-t border-b ${
                      section.category === "Net Income" ? "bg-gray-100" : ""
                    }`}>
                      <span>{section.category}</span>
                      <span className={isNegative(section.total) ? "text-red-600" : "text-green-600"}>
                        {isNegative(section.total) && "("}
                        {formatCurrency(section.total)}
                        {isNegative(section.total) && ")"}
                      </span>
                    </div>
                  ) : (
                    // Regular account sections
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-blue-800 border-b pb-1">
                        {section.category}
                      </h3>
                      
                      {section.accounts && (
                        <div className="ml-4 space-y-1 mb-3">
                          {section.accounts.map((account, accountIndex) => (
                            <div key={accountIndex} className="flex justify-between items-center py-1">
                              <span className="text-gray-700">{account.name}</span>
                              <span className={`font-medium ${isNegative(account.amount) ? "text-red-600" : "text-green-600"}`}>
                                {isNegative(account.amount) && "("}
                                {formatCurrency(account.amount)}
                                {isNegative(account.amount) && ")"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-2 px-4 font-semibold bg-gray-50 border">
                        <span>Total {section.category}</span>
                        <span className={isNegative(section.total) ? "text-red-600" : "text-green-600"}>
                          {isNegative(section.total) && "("}
                          {formatCurrency(section.total)}
                          {isNegative(section.total) && ")"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Report Footer */}
            <div className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
              <p>Generated on {reportData?.generatedDate}</p>
              <p className="mt-1">QuickBooks Clone - Financial Reporting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Generated:</span>
              <p className="font-medium">{reportData?.generatedDate}</p>
            </div>
            <div>
              <span className="text-gray-500">Report Basis:</span>
              <p className="font-medium">{reportData?.reportBasis}</p>
            </div>
            <div>
              <span className="text-gray-500">Period:</span>
              <p className="font-medium">{reportData?.subtitle}</p>
            </div>
            <div>
              <span className="text-gray-500">Format:</span>
              <p className="font-medium">HTML</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportViewer;