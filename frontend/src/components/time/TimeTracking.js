import React, { useState } from "react";
import { mockEmployees } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Clock, 
  Play, 
  Pause, 
  Square,
  Calendar,
  FileText,
  DollarSign,
  Plus,
  Timer
} from "lucide-react";

const TimeTracking = () => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [timeEntries] = useState([
    {
      id: "1",
      employee: "John Smith",
      date: "2024-01-15",
      customer: "ABC Company",
      service: "Consulting Services",
      hours: 8.0,
      rate: 75.00,
      billable: true,
      notes: "Project consultation and planning"
    },
    {
      id: "2",
      employee: "Jane Doe",
      date: "2024-01-15",
      customer: "XYZ Corporation",
      service: "Development Work",
      hours: 6.5,
      rate: 25.00,
      billable: true,
      notes: "Frontend development"
    },
    {
      id: "3",
      employee: "John Smith",
      date: "2024-01-14",
      customer: "ABC Company",
      service: "Consulting Services",
      hours: 4.0,
      rate: 75.00,
      billable: false,
      notes: "Internal meetings"
    }
  ]);

  const [weeklyTimesheet] = useState({
    employee: "John Smith",
    weekOf: "2024-01-15",
    entries: [
      { day: "Monday", customer: "ABC Company", service: "Consulting", hours: 8.0, billable: true },
      { day: "Tuesday", customer: "XYZ Corp", service: "Development", hours: 7.5, billable: true },
      { day: "Wednesday", customer: "ABC Company", service: "Consulting", hours: 8.0, billable: true },
      { day: "Thursday", customer: "", service: "", hours: 0, billable: false },
      { day: "Friday", customer: "", service: "", hours: 0, billable: false }
    ]
  });

  const handleStartTimer = () => {
    setActiveTimer("running");
    console.log("Timer started");
  };

  const handlePauseTimer = () => {
    setActiveTimer("paused");
    console.log("Timer paused");
  };

  const handleStopTimer = () => {
    setActiveTimer(null);
    setCurrentTime("00:00:00");
    console.log("Timer stopped");
  };

  const calculateTotalHours = () => {
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const calculateBillableHours = () => {
    return timeEntries.filter(entry => entry.billable).reduce((total, entry) => total + entry.hours, 0);
  };

  const calculateTotalValue = () => {
    return timeEntries.filter(entry => entry.billable).reduce((total, entry) => total + (entry.hours * entry.rate), 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Track time for projects and billing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Time Reports
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <DollarSign className="w-4 h-4 mr-2" />
            Invoice from Time
          </Button>
        </div>
      </div>

      {/* Time Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{calculateTotalHours().toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Billable Hours</p>
                <p className="text-2xl font-bold">{calculateBillableHours().toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Billable Value</p>
                <p className="text-2xl font-bold">${calculateTotalValue().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">23.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="timer" className="w-full">
        <TabsList>
          <TabsTrigger value="timer">Stopwatch Timer</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Timesheet</TabsTrigger>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Stopwatch Timer
              </CardTitle>
              <CardDescription>Start tracking time for a specific activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
                  {currentTime}
                </div>
                <div className="flex items-center justify-center space-x-4">
                  {!activeTimer && (
                    <Button size="lg" onClick={handleStartTimer} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </Button>
                  )}
                  {activeTimer === "running" && (
                    <Button size="lg" onClick={handlePauseTimer} variant="outline">
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  {activeTimer === "paused" && (
                    <Button size="lg" onClick={handleStartTimer} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </Button>
                  )}
                  {activeTimer && (
                    <Button size="lg" onClick={handleStopTimer} variant="destructive">
                      <Square className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              {/* Activity Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.name}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer/Job</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc">ABC Company</SelectItem>
                      <SelectItem value="xyz">XYZ Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service">Service Item</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulting">Consulting Services</SelectItem>
                      <SelectItem value="development">Development Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Activity description or notes..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Time Entry</CardTitle>
              <CardDescription>Add time entries manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.25"
                    placeholder="8.0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employee-manual">Employee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.name}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer-manual">Customer/Job</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc">ABC Company</SelectItem>
                      <SelectItem value="xyz">XYZ Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes-manual">Notes</Label>
                <Input
                  id="notes-manual"
                  placeholder="Description of work performed..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="billable" className="rounded" />
                <Label htmlFor="billable">Billable</Label>
              </div>

              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Time Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timesheet</CardTitle>
              <CardDescription>Week of {weeklyTimesheet.weekOf} - {weeklyTimesheet.employee}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Customer/Job</TableHead>
                    <TableHead>Service Item</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Billable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyTimesheet.entries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entry.day}</TableCell>
                      <TableCell>{entry.customer || "-"}</TableCell>
                      <TableCell>{entry.service || "-"}</TableCell>
                      <TableCell>{entry.hours.toFixed(1)}</TableCell>
                      <TableCell>
                        {entry.billable ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-gray-400">✗ No</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 text-right">
                <p className="text-lg font-semibold">
                  Total Hours: {weeklyTimesheet.entries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>All recorded time entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.employee}</TableCell>
                      <TableCell>{entry.customer}</TableCell>
                      <TableCell>{entry.service}</TableCell>
                      <TableCell>{entry.hours.toFixed(1)}</TableCell>
                      <TableCell>${entry.rate.toFixed(2)}</TableCell>
                      <TableCell>
                        {entry.billable ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-gray-400">✗ No</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-48 truncate">{entry.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeTracking;