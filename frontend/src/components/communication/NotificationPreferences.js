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
import { Textarea } from '../ui/textarea';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Phone,
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react';

const NotificationPreferences = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [originalPreferences, setOriginalPreferences] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Notification categories
  const notificationCategories = [
    {
      id: 'invoices',
      name: 'Invoices & Bills',
      icon: FileText,
      color: 'blue',
      description: 'Invoice creation, payment reminders, and billing notifications',
      events: [
        { key: 'invoice_created', label: 'Invoice Created' },
        { key: 'invoice_overdue', label: 'Invoice Overdue' },
        { key: 'invoice_paid', label: 'Invoice Paid' },
        { key: 'bill_received', label: 'Bill Received' },
        { key: 'payment_reminder', label: 'Payment Reminder' }
      ]
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: Users,
      color: 'green',
      description: 'Customer-related activities and communications',
      events: [
        { key: 'customer_created', label: 'New Customer' },
        { key: 'customer_updated', label: 'Customer Updated' },
        { key: 'customer_payment', label: 'Customer Payment' },
        { key: 'customer_message', label: 'Customer Message' }
      ]
    },
    {
      id: 'financial',
      name: 'Financial',
      icon: DollarSign,
      color: 'purple',
      description: 'Financial reports, cash flow, and accounting alerts',
      events: [
        { key: 'low_balance', label: 'Low Account Balance' },
        { key: 'report_generated', label: 'Report Generated' },
        { key: 'reconciliation_needed', label: 'Reconciliation Needed' },
        { key: 'expense_threshold', label: 'Expense Threshold Alert' }
      ]
    },
    {
      id: 'system',
      name: 'System',
      icon: Settings,
      color: 'gray',
      description: 'System maintenance, updates, and security alerts',
      events: [
        { key: 'system_update', label: 'System Update' },
        { key: 'security_alert', label: 'Security Alert' },
        { key: 'backup_completed', label: 'Backup Completed' },
        { key: 'maintenance_scheduled', label: 'Maintenance Scheduled' }
      ]
    }
  ];
  
  // Notification channels
  const notificationChannels = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'sms', label: 'SMS', icon: MessageSquare },
    { key: 'push', label: 'Push Notifications', icon: Bell },
    { key: 'in_app', label: 'In-App', icon: Bell }
  ];
  
  // Load preferences when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadPreferences();
    }
  }, [currentCompany?.id]);
  
  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(preferences) !== JSON.stringify(originalPreferences));
  }, [preferences, originalPreferences]);
  
  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationPreferences(currentCompany.id);
      const prefs = response || {};
      setPreferences(prefs);
      setOriginalPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationService.updateNotificationPreferences(currentCompany.id, preferences);
      setOriginalPreferences(preferences);
      setHasChanges(false);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleReset = () => {
    setPreferences(originalPreferences);
    setHasChanges(false);
  };
  
  const updatePreference = (category, event, channel, value) => {
    const key = `${category}_${event}_${channel}`;
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const updateCategoryPreference = (category, channel, value) => {
    const newPreferences = { ...preferences };
    const categoryConfig = notificationCategories.find(c => c.id === category);
    
    if (categoryConfig) {
      categoryConfig.events.forEach(event => {
        const key = `${category}_${event.key}_${channel}`;
        newPreferences[key] = value;
      });
    }
    
    setPreferences(newPreferences);
  };
  
  const getPreferenceValue = (category, event, channel) => {
    const key = `${category}_${event}_${channel}`;
    return preferences[key] !== undefined ? preferences[key] : true;
  };
  
  const getCategoryChannelEnabled = (category, channel) => {
    const categoryConfig = notificationCategories.find(c => c.id === category);
    if (!categoryConfig) return false;
    
    return categoryConfig.events.some(event => {
      const key = `${category}_${event.key}_${channel}`;
      return preferences[key] !== false;
    });
  };
  
  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-1">Customize how and when you receive notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => loadPreferences()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading preferences...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {notificationCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                          <category.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notificationChannels.map((channel) => (
                          <div key={channel.key} className="flex items-center space-x-1">
                            <Switch
                              checked={getCategoryChannelEnabled(category.id, channel.key)}
                              onCheckedChange={(checked) => updateCategoryPreference(category.id, channel.key, checked)}
                            />
                            <channel.icon className="w-4 h-4 text-gray-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {category.events.map((event) => (
                          <div key={event.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{event.label}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              {notificationChannels.map((channel) => (
                                <div key={channel.key} className="flex items-center space-x-1">
                                  <Switch
                                    checked={getPreferenceValue(category.id, event.key, channel.key)}
                                    onCheckedChange={(checked) => updatePreference(category.id, event.key, channel.key, checked)}
                                  />
                                  <channel.icon className="w-4 h-4 text-gray-500" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notificationChannels.map((channel) => (
              <Card key={channel.key}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <channel.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{channel.label}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Configure {channel.label.toLowerCase()} notification settings
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable {channel.label}</Label>
                    <Switch
                      checked={preferences[`${channel.key}_enabled`] !== false}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences,
                        [`${channel.key}_enabled`]: checked
                      })}
                    />
                  </div>
                  
                  {channel.key === 'email' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="email_address">Email Address</Label>
                        <Input
                          id="email_address"
                          type="email"
                          value={preferences.email_address || ''}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            email_address: e.target.value
                          })}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Email Digest</Label>
                        <Switch
                          checked={preferences.email_digest !== false}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            email_digest: checked
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="digest_frequency">Digest Frequency</Label>
                        <Select 
                          value={preferences.digest_frequency || 'daily'}
                          onValueChange={(value) => setPreferences({
                            ...preferences,
                            digest_frequency: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {channel.key === 'sms' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          type="tel"
                          value={preferences.phone_number || ''}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            phone_number: e.target.value
                          })}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>High Priority Only</Label>
                        <Switch
                          checked={preferences.sms_high_priority_only !== false}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            sms_high_priority_only: checked
                          })}
                        />
                      </div>
                    </div>
                  )}
                  
                  {channel.key === 'push' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Browser Notifications</Label>
                        <Switch
                          checked={preferences.browser_notifications !== false}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            browser_notifications: checked
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Sound</Label>
                        <Switch
                          checked={preferences.notification_sound !== false}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            notification_sound: checked
                          })}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Schedule</CardTitle>
              <p className="text-sm text-gray-600">Set when you want to receive notifications</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Do Not Disturb</Label>
                <Switch
                  checked={preferences.do_not_disturb !== false}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    do_not_disturb: checked
                  })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet_hours_start">Quiet Hours Start</Label>
                  <Input
                    id="quiet_hours_start"
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      quiet_hours_start: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="quiet_hours_end">Quiet Hours End</Label>
                  <Input
                    id="quiet_hours_end"
                    type="time"
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      quiet_hours_end: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label>Weekdays</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                    <div key={day} className="flex items-center space-x-1">
                      <Switch
                        checked={preferences[`weekday_${index}`] !== false}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          [`weekday_${index}`]: checked
                        })}
                      />
                      <Label className="text-xs">{day.slice(0, 3)}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={preferences.timezone || 'America/New_York'}
                  onValueChange={(value) => setPreferences({
                    ...preferences,
                    timezone: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationPreferences;