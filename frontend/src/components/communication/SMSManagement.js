import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { smsService } from '../../services/smsService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Inbox, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';

const SMSManagement = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  
  // SMS management state
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState({});
  
  // SMS composition state
  const [composeSMS, setComposeSMS] = useState({
    to: '',
    message: '',
    template_id: '',
    send_later: false,
    scheduled_at: ''
  });
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'all',
    direction: 'all',
    date_range: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0
  });
  
  // UI state
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  
  // Load data when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadSMSData();
    }
  }, [currentCompany?.id, activeTab, filters, pagination.page]);
  
  const loadSMSData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'messages') {
        const response = await smsService.getMessages(currentCompany.id, {
          ...filters,
          page: pagination.page,
          page_size: pagination.page_size
        });
        setMessages(response.items || []);
        setPagination(prev => ({ ...prev, total: response.total || 0 }));
      } else if (activeTab === 'templates') {
        const response = await smsService.getTemplates(currentCompany.id);
        setTemplates(response.items || []);
      } else if (activeTab === 'campaigns') {
        const response = await smsService.getCampaigns(currentCompany.id);
        setCampaigns(response.items || []);
      } else if (activeTab === 'settings') {
        const response = await smsService.getSettings(currentCompany.id);
        setSettings(response || {});
      }
      
      // Load stats for all tabs
      const statsResponse = await smsService.getStats(currentCompany.id);
      setStats(statsResponse || {});
      
    } catch (error) {
      console.error('Error loading SMS data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendSMS = async () => {
    try {
      setLoading(true);
      await smsService.sendSMS(currentCompany.id, composeSMS);
      setShowCompose(false);
      setComposeSMS({
        to: '', message: '', template_id: '', send_later: false, scheduled_at: ''
      });
      loadSMSData();
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await smsService.deleteMessage(currentCompany.id, messageId);
        loadSMSData();
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Management</h1>
          <p className="text-gray-600 mt-1">Manage your SMS communications and campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => loadSMSData()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Send SMS
          </Button>
        </div>
      </div>

      {/* SMS Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total_messages || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{stats.failed || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Edit className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Send className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SMS Messages</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search messages..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.direction} onValueChange={(value) => setFilters({...filters, direction: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading messages...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(message.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{formatPhoneNumber(message.phone_number)}</span>
                            <Badge variant={message.direction === 'inbound' ? 'default' : 'secondary'}>
                              {message.direction}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(message.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowMessageDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SMS Templates</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Characters: {template.content?.length || 0}</span>
                        <span>Used: {template.usage_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="w-4 h-4 mr-1" />
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SMS Campaigns</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Recipients</p>
                        <p className="font-medium">{campaign.recipients_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sent</p>
                        <p className="font-medium">{campaign.sent_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Delivered</p>
                        <p className="font-medium">{campaign.delivered_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Failed</p>
                        <p className="font-medium">{campaign.failed_count || 0}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(campaign.created_at)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">SMS Provider</Label>
                  <Select value={settings.provider || 'twilio'} onValueChange={(value) => setSettings({...settings, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws_sns">AWS SNS</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sender_id">Sender ID</Label>
                  <Input
                    id="sender_id"
                    value={settings.sender_id || ''}
                    onChange={(e) => setSettings({...settings, sender_id: e.target.value})}
                    placeholder="Company name or short code"
                  />
                </div>
                <div>
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={settings.api_key || ''}
                    onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                    placeholder="Provider API key"
                  />
                </div>
                <div>
                  <Label htmlFor="api_secret">API Secret</Label>
                  <Input
                    id="api_secret"
                    type="password"
                    value={settings.api_secret || ''}
                    onChange={(e) => setSettings({...settings, api_secret: e.target.value})}
                    placeholder="Provider API secret"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_replies"
                    checked={settings.auto_replies || false}
                    onCheckedChange={(checked) => setSettings({...settings, auto_replies: checked})}
                  />
                  <Label htmlFor="auto_replies">Enable auto-replies</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="delivery_reports"
                    checked={settings.delivery_reports || false}
                    onCheckedChange={(checked) => setSettings({...settings, delivery_reports: checked})}
                  />
                  <Label htmlFor="delivery_reports">Enable delivery reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="spam_protection"
                    checked={settings.spam_protection || false}
                    onCheckedChange={(checked) => setSettings({...settings, spam_protection: checked})}
                  />
                  <Label htmlFor="spam_protection">Enable spam protection</Label>
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose SMS Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send SMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">Phone Number</Label>
              <Input
                id="to"
                placeholder="+1234567890"
                value={composeSMS.to}
                onChange={(e) => setComposeSMS({...composeSMS, to: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                rows={4}
                value={composeSMS.message}
                onChange={(e) => setComposeSMS({...composeSMS, message: e.target.value})}
              />
              <p className="text-sm text-gray-500 mt-1">
                {composeSMS.message.length}/160 characters
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="send_later"
                  checked={composeSMS.send_later}
                  onCheckedChange={(checked) => setComposeSMS({...composeSMS, send_later: checked})}
                />
                <Label htmlFor="send_later">Schedule Send</Label>
              </div>
              {composeSMS.send_later && (
                <div>
                  <Input
                    type="datetime-local"
                    value={composeSMS.scheduled_at}
                    onChange={(e) => setComposeSMS({...composeSMS, scheduled_at: e.target.value})}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendSMS} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send SMS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Details Dialog */}
      <Dialog open={showMessageDetails} onOpenChange={setShowMessageDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <p className="text-sm">{formatPhoneNumber(selectedMessage.phone_number)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedMessage.status)}
                    <span className="text-sm capitalize">{selectedMessage.status}</span>
                  </div>
                </div>
                <div>
                  <Label>Direction</Label>
                  <p className="text-sm capitalize">{selectedMessage.direction}</p>
                </div>
                <div>
                  <Label>Sent At</Label>
                  <p className="text-sm">{formatDate(selectedMessage.created_at)}</p>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMSManagement;