import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { 
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Plus,
  Calculator,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  Timer,
  DollarSign
} from "lucide-react";

const WeeklyTimeSheet = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Mock employees data
  const [employees] = useState([
    { id: "1", name: "John Smith", hourly_rate: 50.00, employee_id: "EMP001" },
    { id: "2", name: "Jane Doe", hourly_rate: 45.00, employee_id: "EMP002" },
    { id: "3", name: "Mike Johnson", hourly_rate: 55.00, employee_id: "EMP003" },
    { id: "4", name: "Sarah Wilson", hourly_rate: 48.00, employee_id: "EMP004" }
  ]);
  
  // Mock customers/projects data
  const [customers] = useState([
    { id: "1", name: "ABC Company", project: "Website Development" },
    { id: "2", name: "XYZ Corp", project: "Mobile App" },
    { id: "3", name: "Tech Solutions", project: "System Integration" },
    { id: "4", name: "Marketing Inc", project: "Campaign Management" }
  ]);

  // Mock service items
  const [serviceItems] = useState([
    { id: "1", name: "Consulting", rate: 150.00, billable: true },
    { id: "2", name: "Development", rate: 120.00, billable: true },
    { id: "3", name: "Design", rate: 100.00, billable: true },
    { id: "4", name: "Training", rate: 80.00, billable: true },
    { id: "5", name: "Admin", rate: 0.00, billable: false }
  ]);

  // Get week dates
  const getWeekDates = (date) => {
    const week = [];
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Initialize time entries for the week
  useEffect(() => {
    if (selectedEmployee) {
      const initializeTimeEntries = () => {
        const entries = [];
        weekDates.forEach(date => {
          // Add some mock entries for demonstration
          if (date.getDay() !== 0 && date.getDay() !== 6) { // Weekdays only
            entries.push({
              id: `${selectedEmployee}-${date.toISOString().split('T')[0]}`,
              employee_id: selectedEmployee,
              date: date.toISOString().split('T')[0],
              customer_id: "1",
              service_item_id: "1",
              description: "Project work",
              hours: 8.0,
              break_time: 1.0,
              overtime_hours: 0.0,
              billable: true,
              hourly_rate: 50.00,
              status: "draft"
            });
          }
        });
        setTimeEntries(entries);
      };
      
      initializeTimeEntries();
    }
  }, [selectedEmployee, currentWeek]);

  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const handleTimeEntryChange = (entryId, field, value) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, [field]: value } : entry
    ));
  };

  const handleAddTimeEntry = (date) => {
    const newEntry = {
      id: `new-${Date.now()}`,
      employee_id: selectedEmployee,
      date: date.toISOString().split('T')[0],
      customer_id: "",
      service_item_id: "",
      description: "",
      hours: 0.0,
      break_time: 0.0,
      overtime_hours: 0.0,
      billable: true,
      hourly_rate: 50.00,
      status: "draft"
    };
    
    setTimeEntries(prev => [...prev, newEntry]);
    setEditingEntry(newEntry.id);
  };

  const handleDeleteTimeEntry = (entryId) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const handleSaveTimeSheet = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement actual API call
      console.log("Saving timesheet for employee:", selectedEmployee);
      console.log("Time entries:", timeEntries);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Timesheet saved successfully!");
    } catch (err) {
      console.error("Error saving timesheet:", err);
      setError("Failed to save timesheet");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTimeSheet = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement actual API call
      console.log("Submitting timesheet for approval");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Timesheet submitted for approval!");
    } catch (err) {
      console.error("Error submitting timesheet:", err);
      setError("Failed to submit timesheet");
    } finally {
      setLoading(false);
    }
  };

  const getEntryForDate = (date) => {
    return timeEntries.filter(entry => 
      entry.date === date.toISOString().split('T')[0]
    );
  };

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);
  };

  const getTotalOvertimeHours = () => {
    return timeEntries.reduce((sum, entry) => sum + parseFloat(entry.overtime_hours || 0), 0);
  };

  const getTotalAmount = () => {
    return timeEntries.reduce((sum, entry) => {
      const hours = parseFloat(entry.hours || 0);
      const overtimeHours = parseFloat(entry.overtime_hours || 0);
      const rate = parseFloat(entry.hourly_rate || 0);
      return sum + (hours * rate) + (overtimeHours * rate * 1.5);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Time Sheet</h1>
          <p className="text-gray-600">Track time for employees and projects</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate("/time-tracking")}
            className="flex items-center space-x-2"
          >
            <Timer className="h-4 w-4" />
            <span>Time Tracking</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Week Navigation & Employee Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handlePreviousWeek}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Week</span>
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              Week of {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
            </h2>
            <p className="text-sm text-gray-600">
              {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleNextWeek}
            className="flex items-center space-x-2"
          >
            <span>Next Week</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <>
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Employee Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedEmployeeData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{selectedEmployeeData?.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="font-medium">{formatCurrency(selectedEmployeeData?.hourly_rate || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Week Status</p>
                  <Badge variant="secondary">Draft</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Sheet Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Time Entries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {weekDates.map((date, index) => {
                  const dayEntries = getEntryForDate(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${isWeekend ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </h3>
                          {isWeekend && (
                            <Badge variant="secondary" className="mt-1">Weekend</Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTimeEntry(date)}
                          className="flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Entry</span>
                        </Button>
                      </div>

                      {dayEntries.length > 0 ? (
                        <div className="space-y-3">
                          {dayEntries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="space-y-1">
                                <Label className="text-xs">Customer/Project</Label>
                                <Select
                                  value={entry.customer_id}
                                  onValueChange={(value) => handleTimeEntryChange(entry.id, 'customer_id', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {customers.map((customer) => (
                                      <SelectItem key={customer.id} value={customer.id}>
                                        {customer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Service Item</Label>
                                <Select
                                  value={entry.service_item_id}
                                  onValueChange={(value) => handleTimeEntryChange(entry.id, 'service_item_id', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {serviceItems.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={entry.description}
                                  onChange={(e) => handleTimeEntryChange(entry.id, 'description', e.target.value)}
                                  placeholder="Work description"
                                  className="h-8"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Hours</Label>
                                <Input
                                  type="number"
                                  value={entry.hours}
                                  onChange={(e) => handleTimeEntryChange(entry.id, 'hours', e.target.value)}
                                  placeholder="0.0"
                                  className="h-8"
                                  step="0.25"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Break Time</Label>
                                <Input
                                  type="number"
                                  value={entry.break_time}
                                  onChange={(e) => handleTimeEntryChange(entry.id, 'break_time', e.target.value)}
                                  placeholder="0.0"
                                  className="h-8"
                                  step="0.25"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Overtime</Label>
                                <Input
                                  type="number"
                                  value={entry.overtime_hours}
                                  onChange={(e) => handleTimeEntryChange(entry.id, 'overtime_hours', e.target.value)}
                                  placeholder="0.0"
                                  className="h-8"
                                  step="0.25"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Actions</Label>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteTimeEntry(entry.id)}
                                    className="h-8 px-2"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                  <div className="flex items-center space-x-1">
                                    <input
                                      type="checkbox"
                                      checked={entry.billable}
                                      onChange={(e) => handleTimeEntryChange(entry.id, 'billable', e.target.checked)}
                                      className="h-3 w-3"
                                    />
                                    <Label className="text-xs">Billable</Label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          <p>No time entries for this day</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Week Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold text-blue-600">{getTotalHours().toFixed(2)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Overtime Hours</p>
                      <p className="text-2xl font-bold text-orange-600">{getTotalOvertimeHours().toFixed(2)}</p>
                    </div>
                    <Timer className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalAmount())}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Billable Hours</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <Briefcase className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleSaveTimeSheet}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </Button>
            
            <Button
              onClick={handleSubmitTimeSheet}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit for Approval</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyTimeSheet;