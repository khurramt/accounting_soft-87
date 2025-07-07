import React, { useState } from "react";
import { mockReports } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Search, 
  BarChart3, 
  FileText, 
  Download,
  Eye,
  Star,
  Calendar,
  Filter,
  Settings
} from "lucide-react";

const ReportCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Company & Financial");

  const filteredReports = mockReports.filter(category => 
    category.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.reports.some(report => report.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const popularReports = [
    { name: "Profit & Loss", category: "Company & Financial", description: "Summary of income and expenses" },
    { name: "Balance Sheet", category: "Company & Financial", description: "Assets, liabilities, and equity" },
    { name: "A/R Aging Summary", category: "Customers & Receivables", description: "Outstanding customer balances" },
    { name: "A/P Aging Summary", category: "Vendors & Payables", description: "Outstanding vendor balances" }
  ];

  const recentReports = [
    { name: "Profit & Loss - December 2023", runDate: "2024-01-15", type: "PDF" },
    { name: "Sales by Customer Summary - Q4 2023", runDate: "2024-01-14", type: "Excel" },
    { name: "Expense by Vendor Detail - December 2023", runDate: "2024-01-13", type: "PDF" }
  ];

  const handleRunReport = (reportName) => {
    console.log("Running report:", reportName);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Center</h1>
          <p className="text-gray-600">Access all your business reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Star className="w-4 h-4 mr-2" />
            Memorized Reports
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Categories */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Report Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredReports.map((category) => (
                <button
                  key={category.category}
                  onClick={() => setSelectedCategory(category.category)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedCategory === category.category
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.category}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.reports.length}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="all-reports" className="w-full">
            <TabsList>
              <TabsTrigger value="all-reports">All Reports</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    {selectedCategory}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredReports
                      .find(cat => cat.category === selectedCategory)
                      ?.reports.map((report, index) => (
                        <Card key={index} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{report}</h4>
                                <p className="text-sm text-gray-600">
                                  {report.includes('Profit') && 'Shows revenue, expenses, and net income'}
                                  {report.includes('Balance') && 'Shows assets, liabilities, and equity'}
                                  {report.includes('Aging') && 'Shows outstanding balances by age'}
                                  {report.includes('Sales') && 'Shows sales performance metrics'}
                                  {report.includes('Expenses') && 'Shows expense breakdown and analysis'}
                                  {!report.includes('Profit') && !report.includes('Balance') && !report.includes('Aging') && !report.includes('Sales') && !report.includes('Expenses') && 'Detailed business analysis report'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" onClick={() => handleRunReport(report)}>
                                  Run
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Popular Reports
                  </CardTitle>
                  <CardDescription>Most frequently used reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularReports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-gray-600">{report.description}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {report.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                          <Button size="sm" onClick={() => handleRunReport(report.name)}>
                            Run Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Recent Reports
                  </CardTitle>
                  <CardDescription>Recently generated reports</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentReports.length > 0 ? (
                    <div className="space-y-4">
                      {recentReports.map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <p className="text-sm text-gray-600">Generated on {report.runDate}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {report.type}
                            </Badge>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent reports</p>
                      <p className="text-sm">Run a report to see it here</p>
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