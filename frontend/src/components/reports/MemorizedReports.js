import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  ArrowLeft,
  Star,
  Play,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Plus,
  Settings,
  Search,
  FolderOpen,
  Clock
} from "lucide-react";

const MemorizedReports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");

  const reportGroups = [
    { name: "All", count: 12 },
    { name: "Accountant", count: 3 },
    { name: "Banking", count: 2 },
    { name: "Company", count: 4 },
    { name: "Customers", count: 2 },
    { name: "Vendors", count: 1 }
  ];

  const memorizedReports = [
    {
      id: 1,
      name: "Monthly P&L",
      originalReport: "Profit & Loss",
      group: "Company",
      schedule: "Monthly",
      lastRun: "2024-01-01",
      nextRun: "2024-02-01",
      emailTo: "manager@company.com",
      settings: {
        dateRange: "This Month",
        reportBasis: "Accrual",
        columns: "Total Only"
      },
      status: "Active"
    },
    {
      id: 2,
      name: "Weekly A/R Aging",
      originalReport: "A/R Aging Summary",
      group: "Customers",
      schedule: "Weekly",
      lastRun: "2024-01-08",
      nextRun: "2024-01-15",
      emailTo: "accounting@company.com",
      settings: {
        dateRange: "All Dates",
        agingMethod: "Current Date",
        columns: "30, 60, 90 Days"
      },
      status: "Active"
    },
    {
      id: 3,
      name: "Year-End Balance Sheet",
      originalReport: "Balance Sheet",
      group: "Accountant",
      schedule: "Annually",
      lastRun: "2023-12-31",
      nextRun: "2024-12-31",
      emailTo: "accountant@company.com",
      settings: {
        dateRange: "Last Fiscal Year",
        reportBasis: "Accrual",
        comparison: "Previous Year"
      },
      status: "Active"
    },
    {
      id: 4,
      name: "Quarterly Sales Tax",
      originalReport: "Sales Tax Liability",
      group: "Accountant",
      schedule: "Quarterly",
      lastRun: "2023-12-31",
      nextRun: "2024-03-31",
      emailTo: "tax@company.com",
      settings: {
        dateRange: "This Quarter",
        reportBasis: "Accrual"
      },
      status: "Active"
    },
    {
      id: 5,
      name: "Daily Cash Position",
      originalReport: "Banking Summary",
      group: "Banking",
      schedule: "Daily",
      lastRun: "2024-01-14",
      nextRun: "2024-01-15",
      emailTo: "cfo@company.com",
      settings: {
        dateRange: "Today",
        accounts: "All Bank Accounts"
      },
      status: "Paused"
    }
  ];

  const filteredReports = memorizedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.originalReport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "All" || report.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleRunReport = (report) => {
    console.log("Running memorized report:", report.name);
    // Navigate to report with pre-filled settings
    navigate(`/reports/customize?report=${encodeURIComponent(report.originalReport)}&memorized=${report.id}`);
  };

  const handleEditReport = (report) => {
    console.log("Editing memorized report:", report.name);
    // Open edit dialog or navigate to edit page
  };

  const handleDeleteReport = (reportId) => {
    console.log("Deleting memorized report:", reportId);
    // Show confirmation dialog and delete
  };

  const handleToggleStatus = (reportId) => {
    console.log("Toggling status for report:", reportId);
    // Toggle active/paused status
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
            <h1 className="text-3xl font-bold text-gray-900">Memorized Reports</h1>
            <p className="text-gray-600">Manage your saved report configurations and schedules</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Manage Groups
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Memorized Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search memorized reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportGroups.map(group => (
                  <SelectItem key={group.name} value={group.name}>
                    {group.name} ({group.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Groups Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FolderOpen className="w-5 h-5 mr-2" />
              Report Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {reportGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setSelectedGroup(group.name)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                    selectedGroup === group.name
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{group.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {group.count}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Memorized Reports List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-500" />
                {selectedGroup === "All" ? "All Memorized Reports" : `${selectedGroup} Reports`}
              </CardTitle>
              <CardDescription>
                {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReports.length > 0 ? (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-lg">{report.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {report.group}
                            </Badge>
                            <Badge 
                              variant={report.status === 'Active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {report.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            Based on: <span className="font-medium">{report.originalReport}</span>
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Schedule:</span>
                              <p className="font-medium">{report.schedule}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Last Run:</span>
                              <p className="font-medium">{report.lastRun}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Next Run:</span>
                              <p className="font-medium">{report.nextRun}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Email To:</span>
                              <p className="font-medium text-xs">{report.emailTo}</p>
                            </div>
                          </div>

                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Report Settings:</h4>
                            <div className="text-xs space-y-1">
                              {Object.entries(report.settings).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-500 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" onClick={() => handleRunReport(report)}>
                            <Play className="w-4 h-4 mr-1" />
                            Run Now
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditReport(report)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleStatus(report.id)}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            {report.status === 'Active' ? 'Pause' : 'Resume'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No memorized reports found</p>
                  <p className="text-sm">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Create your first memorized report to get started'}
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/reports')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Reports
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemorizedReports;