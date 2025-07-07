import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Activity, User, Shield, Clock, Download, Filter, Search, AlertCircle, Eye } from 'lucide-react';

const ActivityTracking = () => {
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:30:15',
      user: 'admin',
      userFullName: 'System Administrator',
      action: 'Login',
      category: 'Authentication',
      details: 'Successful login from IP 192.168.1.100',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      severity: 'info',
      module: 'System'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:32',
      user: 'jsmith',
      userFullName: 'Jane Smith',
      action: 'Invoice Created',
      category: 'Transaction',
      details: 'Created invoice INV-001 for customer ABC Corp, amount $1,500.00',
      ipAddress: '192.168.1.105',
      userAgent: 'Chrome 120.0.0.0',
      severity: 'info',
      module: 'Sales'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:18',
      user: 'jsmith',
      userFullName: 'Jane Smith',
      action: 'Payment Received',
      category: 'Transaction',
      details: 'Received payment of $2,000.00 from customer XYZ Inc',
      ipAddress: '192.168.1.105',
      userAgent: 'Chrome 120.0.0.0',
      severity: 'info',
      module: 'Sales'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:45',
      user: 'admin',
      userFullName: 'System Administrator',
      action: 'User Permission Modified',
      category: 'Security',
      details: 'Modified permissions for user jdoe - removed access to Payroll module',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      severity: 'warning',
      module: 'User Management'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:22',
      user: 'bookkeeper',
      userFullName: 'Mary Johnson',
      action: 'Report Generated',
      category: 'Reporting',
      details: 'Generated Profit & Loss report for period 2024-01-01 to 2024-01-31',
      ipAddress: '192.168.1.110',
      userAgent: 'Firefox 121.0.0.0',
      severity: 'info',
      module: 'Reports'
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:05:33',
      user: 'admin',
      userFullName: 'System Administrator',
      action: 'Backup Created',
      category: 'System',
      details: 'Manual backup created: Demo_Company_2024-01-15_14-05.qbb',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      severity: 'info',
      module: 'System'
    },
    {
      id: 7,
      timestamp: '2024-01-15 13:55:17',
      user: 'jdoe',
      userFullName: 'John Doe',
      action: 'Failed Login',
      category: 'Authentication',
      details: 'Failed login attempt - incorrect password',
      ipAddress: '192.168.1.108',
      userAgent: 'Safari 17.1.0',
      severity: 'error',
      module: 'System'
    }
  ]);

  const [userSessions, setUserSessions] = useState([
    {
      id: 1,
      user: 'admin',
      userFullName: 'System Administrator',
      loginTime: '2024-01-15 14:30:15',
      lastActivity: '2024-01-15 15:45:22',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0',
      status: 'Active',
      sessionDuration: '1h 15m',
      actionsCount: 8
    },
    {
      id: 2,
      user: 'jsmith',
      userFullName: 'Jane Smith',
      loginTime: '2024-01-15 14:20:30',
      lastActivity: '2024-01-15 15:40:18',
      ipAddress: '192.168.1.105',
      userAgent: 'Chrome 120.0.0.0',
      status: 'Active',
      sessionDuration: '1h 20m',
      actionsCount: 12
    },
    {
      id: 3,
      user: 'bookkeeper',
      userFullName: 'Mary Johnson',
      loginTime: '2024-01-15 13:45:10',
      lastActivity: '2024-01-15 14:10:22',
      ipAddress: '192.168.1.110',
      userAgent: 'Firefox 121.0.0.0',
      status: 'Idle',
      sessionDuration: '25m',
      actionsCount: 3
    }
  ]);

  const [filters, setFilters] = useState({
    user: '',
    action: '',
    category: '',
    severity: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  const [selectedLogs, setSelectedLogs] = useState([]);

  const categories = ['Authentication', 'Transaction', 'Security', 'Reporting', 'System'];
  const severities = ['info', 'warning', 'error'];
  const actions = ['Login', 'Logout', 'Invoice Created', 'Payment Received', 'Report Generated', 'User Permission Modified', 'Backup Created', 'Failed Login'];

  const filteredLogs = activityLogs.filter(log => {
    return (
      (!filters.user || log.user.toLowerCase().includes(filters.user.toLowerCase())) &&
      (!filters.action || log.action.toLowerCase().includes(filters.action.toLowerCase())) &&
      (!filters.category || log.category === filters.category) &&
      (!filters.severity || log.severity === filters.severity) &&
      (!filters.searchTerm || 
        log.details.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    );
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      user: '',
      action: '',
      category: '',
      severity: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  const exportLogs = () => {
    const selectedData = selectedLogs.length > 0 
      ? activityLogs.filter(log => selectedLogs.includes(log.id))
      : filteredLogs;
    
    // In a real application, this would export the data
    alert(`Exporting ${selectedData.length} activity log entries...`);
  };

  const terminateSession = (sessionId) => {
    if (window.confirm('Are you sure you want to terminate this session?')) {
      setUserSessions(sessions => 
        sessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'Terminated' }
            : session
        )
      );
      alert('Session terminated successfully');
    }
  };

  const toggleLogSelection = (logId) => {
    setSelectedLogs(prev => 
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const getActivityStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = activityLogs.filter(log => log.timestamp.startsWith(today));
    
    return {
      totalToday: todayLogs.length,
      errors: todayLogs.filter(log => log.severity === 'error').length,
      warnings: todayLogs.filter(log => log.severity === 'warning').length,
      activeSessions: userSessions.filter(session => session.status === 'Active').length
    };
  };

  const stats = getActivityStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Tracking</h1>
          <p className="text-gray-600">Monitor user activities and system events</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalToday}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeSessions}</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <Input
                      placeholder="Filter by user"
                      value={filters.user}
                      onChange={(e) => handleFilterChange('user', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select
                      value={filters.severity}
                      onChange={(e) => handleFilterChange('severity', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Severities</option>
                      {severities.map(severity => (
                        <option key={severity} value={severity}>
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search logs..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Showing {filteredLogs.length} of {activityLogs.length} entries
                  </span>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Logs Table */}
            <Card>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLogs(filteredLogs.map(log => log.id));
                              } else {
                                setSelectedLogs([]);
                              }
                            }}
                          />
                        </th>
                        <th className="text-left p-3">Timestamp</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Action</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Severity</th>
                        <th className="text-left p-3">Details</th>
                        <th className="text-left p-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => toggleLogSelection(log.id)}
                            />
                          </td>
                          <td className="p-3 text-sm">
                            <div>
                              <div className="font-medium">{log.timestamp.split(' ')[1]}</div>
                              <div className="text-gray-600">{log.timestamp.split(' ')[0]}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{log.userFullName}</div>
                              <div className="text-sm text-gray-600">@{log.user}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{log.action}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">{log.category}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={getSeverityColor(log.severity)}>
                              {log.severity.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm max-w-xs truncate">{log.details}</td>
                          <td className="p-3 text-sm font-mono">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Active User Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Login Time</th>
                      <th className="text-left p-3">Last Activity</th>
                      <th className="text-left p-3">Duration</th>
                      <th className="text-left p-3">IP Address</th>
                      <th className="text-left p-3">Browser</th>
                      <th className="text-left p-3">Actions</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSessions.map(session => (
                      <tr key={session.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{session.userFullName}</div>
                            <div className="text-sm text-gray-600">@{session.user}</div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{session.loginTime}</td>
                        <td className="p-3 text-sm">{session.lastActivity}</td>
                        <td className="p-3 text-sm font-medium">{session.sessionDuration}</td>
                        <td className="p-3 text-sm font-mono">{session.ipAddress}</td>
                        <td className="p-3 text-sm">{session.userAgent.split(' ')[0]}</td>
                        <td className="p-3 text-sm">
                          <Badge variant="outline">{session.actionsCount}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={
                            session.status === 'Active' ? 'success' :
                            session.status === 'Idle' ? 'default' : 'destructive'
                          }>
                            {session.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="p-1"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => terminateSession(session.id)}
                              className="p-1 text-red-600 hover:text-red-700"
                              disabled={session.status === 'Terminated'}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityTracking;