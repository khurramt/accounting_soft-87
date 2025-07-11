import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { notificationService } from '../../services/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  Search,
  RefreshCw,
  Archive,
  Trash2,
  Settings,
  Filter,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';

const NotificationCenter = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [stats, setStats] = useState({});
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    date_range: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0
  });
  
  // UI state
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  
  // Notification types
  const notificationTypes = [
    { value: 'invoice', label: 'Invoice', icon: FileText, color: 'blue' },
    { value: 'payment', label: 'Payment', icon: DollarSign, color: 'green' },
    { value: 'customer', label: 'Customer', icon: Users, color: 'purple' },
    { value: 'system', label: 'System', icon: Settings, color: 'gray' },
    { value: 'reminder', label: 'Reminder', icon: Clock, color: 'orange' },
    { value: 'alert', label: 'Alert', icon: AlertCircle, color: 'red' }
  ];
  
  // Load data when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadNotificationData();
    }
  }, [currentCompany?.id, activeTab, filters, pagination.page]);
  
  const loadNotificationData = async () => {
    try {
      setLoading(true);
      
      const response = await notificationService.getNotifications(currentCompany.id, {
        ...filters,
        status: activeTab === 'all' ? 'all' : activeTab,
        page: pagination.page,
        page_size: pagination.page_size
      });
      
      setNotifications(response.items || []);
      setPagination(prev => ({ ...prev, total: response.total || 0 }));
      
      // Load preferences and stats
      const [prefsResponse, statsResponse] = await Promise.all([
        notificationService.getNotificationPreferences(currentCompany.id),
        notificationService.getNotificationStats(currentCompany.id)
      ]);
      
      setPreferences(prefsResponse || {});
      setStats(statsResponse || {});
      
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (notificationIds) => {
    try {
      await notificationService.markAsRead(currentCompany.id, notificationIds);
      loadNotificationData();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  const handleMarkAsUnread = async (notificationIds) => {
    try {
      await notificationService.markAsUnread(currentCompany.id, notificationIds);
      loadNotificationData();
    } catch (error) {
      console.error('Error marking notifications as unread:', error);
    }
  };
  
  const handleArchive = async (notificationIds) => {
    try {
      await notificationService.archiveNotifications(currentCompany.id, notificationIds);
      loadNotificationData();
    } catch (error) {
      console.error('Error archiving notifications:', error);
    }
  };
  
  const handleDelete = async (notificationIds) => {
    if (window.confirm('Are you sure you want to delete these notifications?')) {
      try {
        await notificationService.deleteNotifications(currentCompany.id, notificationIds);
        loadNotificationData();
      } catch (error) {
        console.error('Error deleting notifications:', error);
      }
    }
  };
  
  const handleUpdatePreferences = async (newPreferences) => {
    try {
      await notificationService.updateNotificationPreferences(currentCompany.id, newPreferences);
      setPreferences(newPreferences);
      setShowPreferences(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences. Please try again.');
    }
  };
  
  const getNotificationIcon = (type) => {
    const notificationType = notificationTypes.find(t => t.value === type);
    if (notificationType) {
      const IconComponent = notificationType.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <Bell className="w-4 h-4" />;
  };
  
  const getNotificationColor = (type) => {
    const notificationType = notificationTypes.find(t => t.value === type);
    return notificationType ? notificationType.color : 'gray';
  };
  
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };
  
  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-1">Manage your notifications and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => loadNotificationData()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowPreferences(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Notification Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold">{stats.unread || 0}</p>
              </div>
              <EyeOff className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{stats.high_priority || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold">{stats.today || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {notificationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} selected
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMarkAsRead(selectedNotifications)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Mark as Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMarkAsUnread(selectedNotifications)}
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Mark as Unread
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleArchive(selectedNotifications)}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(selectedNotifications)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading notifications...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Select All Checkbox */}
                  <div className="flex items-center space-x-2 p-2 border-b">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                      onChange={handleSelectAll}
                    />
                    <Label className="text-sm text-gray-600">Select all</Label>
                  </div>
                  
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 ${
                        notification.is_read ? 'opacity-60' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`p-2 rounded-lg bg-${getNotificationColor(notification.type)}-100`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                              {notification.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            {getPriorityIcon(notification.priority)}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{formatDate(notification.created_at)}</span>
                            {notification.action_url && (
                              <Badge variant="outline" className="text-xs">Action Required</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowNotificationDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => notification.is_read 
                            ? handleMarkAsUnread([notification.id])
                            : handleMarkAsRead([notification.id])
                          }
                        >
                          {notification.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notification Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notificationTypes.map((type) => (
                <Card key={type.value} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-5 h-5" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <Switch
                      checked={preferences[`${type.value}_enabled`] !== false}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        [`${type.value}_enabled`]: checked
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <Switch
                        checked={preferences[`${type.value}_email`] !== false}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          [`${type.value}_email`]: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">SMS</span>
                      <Switch
                        checked={preferences[`${type.value}_sms`] !== false}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          [`${type.value}_sms`]: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Push</span>
                      <Switch
                        checked={preferences[`${type.value}_push`] !== false}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          [`${type.value}_push`]: checked
                        })}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPreferences(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdatePreferences(preferences)}>
                Save Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Details Dialog */}
      <Dialog open={showNotificationDetails} onOpenChange={setShowNotificationDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${getNotificationColor(selectedNotification.type)}-100`}>
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedNotification.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{selectedNotification.type}</Badge>
                    {getPriorityIcon(selectedNotification.priority)}
                  </div>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedNotification.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{formatDate(selectedNotification.created_at)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedNotification.is_read ? 'default' : 'secondary'}>
                    {selectedNotification.is_read ? 'Read' : 'Unread'}
                  </Badge>
                </div>
              </div>
              {selectedNotification.action_url && (
                <div>
                  <Label>Action</Label>
                  <div className="mt-2">
                    <Button size="sm" onClick={() => window.open(selectedNotification.action_url, '_blank')}>
                      Take Action
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenter;