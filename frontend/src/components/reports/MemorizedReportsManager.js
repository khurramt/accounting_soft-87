import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { 
  Bookmark,
  Plus,
  Play,
  Edit,
  Trash2,
  Share,
  Download,
  Calendar,
  Clock,
  Folder,
  MoreHorizontal,
  Search,
  Filter,
  Copy,
  Mail,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building
} from "lucide-react";

const MemorizedReportsManager = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const reportGroups = [
    { id: "all", name: "All Reports", count: 24 },
    { id: "financial", name: "Financial", count: 8 },
    { id: "sales", name: "Sales", count: 6 },
    { id: "customers", name: "Customers", count: 4 },
    { id: "vendors", name: "Vendors", count: 3 },
    { id: "custom", name: "Custom", count: 3 }
  ];

  const [memorizedReports] = useState([
    {
      id: "1",
      name: "Monthly P&L by Class",
      type: "Profit & Loss",
      group: "financial",
      lastRun: "2024-01-15",
      frequency: "Monthly",
      scheduled: true,
      shared: false,
      description: "Profit and Loss report grouped by class for monthly review",
      icon: BarChart3,
      settings: {
        dateRange: "this-month",
        basis: "accrual",
        groupBy: "class"
      }
    },
    {
      id: "2", 
      name: "A/R Aging Detail",
      type: "A/R Aging",
      group: "customers",
      lastRun: "2024-01-14",
      frequency: "Weekly",
      scheduled: true,
      shared: true,
      description: "Detailed aging report for accounts receivable",
      icon: Users,
      settings: {
        asOf: "today",
        groupBy: "customer",
        showDetails: true
      }
    },
    {
      id: "3",
      name: "Sales by Item Summary", 
      type: "Sales",
      group: "sales",
      lastRun: "2024-01-13",
      frequency: "Daily",
      scheduled: false,
      shared: false,
      description: "Summary of sales performance by item",
      icon: PieChart,
      settings: {
        dateRange: "last-30-days",
        sortBy: "amount"
      }
    },
    {
      id: "4",
      name: "Vendor Payment Report",
      type: "A/P Aging", 
      group: "vendors",
      lastRun: "2024-01-12",
      frequency: "Bi-weekly",
      scheduled: true,
      shared: true,
      description: "Report of outstanding vendor payments",
      icon: Building,
      settings: {
        asOf: "today",
        showDetails: true
      }
    },
    {
      id: "5",
      name: "Cash Flow Forecast",
      type: "Cash Flow",
      group: "financial", 
      lastRun: "2024-01-11",
      frequency: "Weekly",
      scheduled: true,
      shared: false,
      description: "13-week cash flow forecast",
      icon: TrendingUp,
      settings: {
        weeks: 13,
        includeProjections: true
      }
    }
  ]);

  const [scheduledReports] = useState([
    {
      id: "1",
      reportId: "1",
      reportName: "Monthly P&L by Class",
      frequency: "Monthly",
      nextRun: "2024-02-01",
      recipients: ["manager@company.com", "accounting@company.com"],
      format: "PDF",
      active: true
    },
    {
      id: "2",
      reportId: "2", 
      reportName: "A/R Aging Detail",
      frequency: "Weekly",
      nextRun: "2024-01-22",
      recipients: ["sales@company.com"],
      format: "Excel",
      active: true
    },
    {
      id: "3",
      reportId: "4",
      reportName: "Vendor Payment Report", 
      frequency: "Bi-weekly",
      nextRun: "2024-01-26",
      recipients: ["ap@company.com"],
      format: "PDF",
      active: false
    }
  ]);

  const filteredReports = memorizedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "all" || report.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleRunReport = (reportId) => {
    console.log("Running report:", reportId);
  };

  const handleEditReport = (reportId) => {
    console.log("Editing report:", reportId);
  };

  const handleDeleteReport = (reportId) => {
    console.log("Deleting report:", reportId);
  };

  const handleShareReport = (reportId) => {
    console.log("Sharing report:", reportId);
  };

  const handleScheduleReport = (reportId) => {
    setIsScheduleOpen(true);
  };

  const getFrequencyBadge = (frequency) => {
    const colors = {
      Daily: "bg-green-100 text-green-800",
      Weekly: "bg-blue-100 text-blue-800",
      "Bi-weekly": "bg-purple-100 text-purple-800",
      Monthly: "bg-orange-100 text-orange-800",
      Quarterly: "bg-red-100 text-red-800"
    };
    return colors[frequency] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Memorized Reports</h1>
          <p className="text-gray-600 mt-1">Manage your saved and scheduled reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Groups Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Report Groups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportGroups.map(group => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <span>{group.name}</span>
                  <Badge variant="secondary">{group.count}</Badge>
                </Button>
              ))}
              
              <div className="pt-4">
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      New Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Report Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Group Name</label>
                        <Input placeholder="Enter group name..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Input placeholder="Optional description..." />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setIsCreateGroupOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={() => setIsCreateGroupOpen(false)}>
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports Tabs */}
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Reports ({filteredReports.length})</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled ({scheduledReports.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* All Reports */}
                <TabsContent value="all">
                  <div className="space-y-4">
                    {filteredReports.map(report => {
                      const Icon = report.icon;
                      return (
                        <Card key={report.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{report.name}</h3>
                                  <p className="text-sm text-gray-600">{report.description}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-gray-500">Type: {report.type}</span>
                                    <span className="text-xs text-gray-500">Last run: {report.lastRun}</span>
                                    {report.scheduled && (
                                      <Badge className={getFrequencyBadge(report.frequency)}>
                                        {report.frequency}
                                      </Badge>
                                    )}
                                    {report.shared && (
                                      <Badge variant="outline" className="text-xs">
                                        <Share className="w-3 h-3 mr-1" />
                                        Shared
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => handleRunReport(report.id)}>
                                  <Play className="w-4 h-4 mr-2" />
                                  Run
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditReport(report.id)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleScheduleReport(report.id)}>
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Schedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleShareReport(report.id)}>
                                      <Share className="w-4 h-4 mr-2" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="w-4 h-4 mr-2" />
                                      Export
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteReport(report.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Scheduled Reports */}
                <TabsContent value="scheduled">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledReports.map(schedule => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.reportName}</TableCell>
                          <TableCell>
                            <Badge className={getFrequencyBadge(schedule.frequency)}>
                              {schedule.frequency}
                            </Badge>
                          </TableCell>
                          <TableCell>{schedule.nextRun}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm truncate">{schedule.recipients.join(", ")}</p>
                              <p className="text-xs text-gray-500">{schedule.recipients.length} recipient(s)</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{schedule.format}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={schedule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {schedule.active ? 'Active' : 'Paused'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Recipients</label>
              <Input placeholder="Enter email addresses, separated by commas..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Subject</label>
              <Input placeholder="Scheduled Report: [Report Name]" />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => setIsScheduleOpen(false)}>
                Schedule Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemorizedReportsManager;