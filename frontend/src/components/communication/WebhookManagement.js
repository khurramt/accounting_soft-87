import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { webhookService } from '../../services/webhookService';
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
  Webhook, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Globe,
  Lock,
  Unlock,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Code,
  Activity,
  TrendingUp,
  Copy,
  Loader2
} from 'lucide-react';

const WebhookManagement = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('webhooks');
  
  // Webhook management state
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  
  // Webhook form state
  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: [],
    is_active: true,
    secret: '',
    retry_count: 3,
    timeout: 30,
    description: ''
  });
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'all',
    event_type: 'all',
    date_range: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0
  });
  
  // UI state
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [showWebhookDetails, setShowWebhookDetails] = useState(false);
  
  // Available webhook events
  const availableEvents = [
    { value: 'invoice.created', label: 'Invoice Created' },
    { value: 'invoice.paid', label: 'Invoice Paid' },
    { value: 'customer.created', label: 'Customer Created' },
    { value: 'customer.updated', label: 'Customer Updated' },
    { value: 'payment.received', label: 'Payment Received' },
    { value: 'transaction.created', label: 'Transaction Created' },
    { value: 'user.login', label: 'User Login' },
    { value: 'company.updated', label: 'Company Updated' }
  ];
  
  // Load data when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadWebhookData();
    }
  }, [currentCompany?.id, activeTab, filters, pagination.page]);
  
  const loadWebhookData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'webhooks') {
        const response = await webhookService.getWebhooks(currentCompany.id, {
          ...filters,
          page: pagination.page,
          page_size: pagination.page_size
        });
        setWebhooks(response.items || []);
        setPagination(prev => ({ ...prev, total: response.total || 0 }));
      } else if (activeTab === 'logs') {
        const response = await webhookService.getWebhookLogs(currentCompany.id, {
          ...filters,
          page: pagination.page,
          page_size: pagination.page_size
        });
        setLogs(response.items || []);
        setPagination(prev => ({ ...prev, total: response.total || 0 }));
      } else if (activeTab === 'events') {
        const response = await webhookService.getWebhookEvents(currentCompany.id);
        setEvents(response.items || []);
      }
      
      // Load stats for all tabs
      const statsResponse = await webhookService.getWebhookStats(currentCompany.id);
      setStats(statsResponse || {});
      
    } catch (error) {
      console.error('Error loading webhook data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateWebhook = async () => {
    try {
      setLoading(true);
      await webhookService.createWebhook(currentCompany.id, webhookForm);
      setShowCreateWebhook(false);
      setWebhookForm({
        name: '', url: '', events: [], is_active: true, secret: '', retry_count: 3, timeout: 30, description: ''
      });
      loadWebhookData();
    } catch (error) {
      console.error('Error creating webhook:', error);
      alert('Failed to create webhook. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateWebhook = async (webhookId, updates) => {
    try {
      setLoading(true);
      await webhookService.updateWebhook(currentCompany.id, webhookId, updates);
      setEditingWebhook(null);
      loadWebhookData();
    } catch (error) {
      console.error('Error updating webhook:', error);
      alert('Failed to update webhook. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteWebhook = async (webhookId) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      try {
        await webhookService.deleteWebhook(currentCompany.id, webhookId);
        loadWebhookData();
      } catch (error) {
        console.error('Error deleting webhook:', error);
        alert('Failed to delete webhook. Please try again.');
      }
    }
  };
  
  const handleTestWebhook = async (webhookId) => {
    try {
      setLoading(true);
      await webhookService.testWebhook(currentCompany.id, webhookId);
      alert('Test webhook sent successfully!');
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Failed to test webhook. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Webhook className="w-4 h-4 text-gray-500" />;
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
  
  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWebhookForm({...webhookForm, secret: result});
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhook Management</h1>
          <p className="text-gray-600 mt-1">Manage your webhook endpoints and event subscriptions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => loadWebhookData()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateWebhook(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Webhook
          </Button>
        </div>
      </div>

      {/* Webhook Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Webhooks</p>
                <p className="text-2xl font-bold">{stats.total_webhooks || 0}</p>
              </div>
              <Webhook className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active_webhooks || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deliveries (24h)</p>
                <p className="text-2xl font-bold">{stats.deliveries_24h || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.success_rate || 0}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-2" />
            Delivery Logs
          </TabsTrigger>
          <TabsTrigger value="events">
            <Code className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Webhook Endpoints</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search webhooks..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading webhooks...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {webhook.is_active ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Pause className="w-5 h-5 text-gray-400" />
                            )}
                            <h3 className="font-medium">{webhook.name}</h3>
                          </div>
                          <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setShowWebhookDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingWebhook(webhook)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{webhook.url}</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(webhook.url)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            Events: {webhook.events?.join(', ') || 'None'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">
                            Last triggered: {webhook.last_triggered ? formatDate(webhook.last_triggered) : 'Never'}
                          </span>
                          <span className="text-gray-500">
                            Success rate: {webhook.success_rate || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Webhook Delivery Logs</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.event_type} onValueChange={(value) => setFilters({...filters, event_type: value})}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      {availableEvents.map(event => (
                        <SelectItem key={event.value} value={event.value}>{event.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{log.event_type}</span>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{log.webhook_name}</p>
                        <p className="text-xs text-gray-500">{formatDate(log.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">HTTP {log.response_code}</span>
                      <span className="text-gray-500">{log.response_time}ms</span>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableEvents.map((event) => (
                  <div key={event.value} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{event.label}</h3>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{event.value}</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Triggered when {event.label.toLowerCase()} occurs in the system.
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used by {Math.floor(Math.random() * 5)} webhooks</span>
                      <span>Last triggered: {Math.floor(Math.random() * 24)}h ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Webhook Dialog */}
      <Dialog open={showCreateWebhook || editingWebhook} onOpenChange={(open) => {
        if (!open) {
          setShowCreateWebhook(false);
          setEditingWebhook(null);
          setWebhookForm({
            name: '', url: '', events: [], is_active: true, secret: '', retry_count: 3, timeout: 30, description: ''
          });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWebhook ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Webhook name"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm({...webhookForm, name: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={webhookForm.is_active}
                  onCheckedChange={(checked) => setWebhookForm({...webhookForm, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://your-endpoint.com/webhook"
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({...webhookForm, url: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Webhook description"
                value={webhookForm.description}
                onChange={(e) => setWebhookForm({...webhookForm, description: e.target.value})}
              />
            </div>
            <div>
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableEvents.map((event) => (
                  <div key={event.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event.value}
                      checked={webhookForm.events.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWebhookForm({...webhookForm, events: [...webhookForm.events, event.value]});
                        } else {
                          setWebhookForm({...webhookForm, events: webhookForm.events.filter(ev => ev !== event.value)});
                        }
                      }}
                    />
                    <Label htmlFor={event.value} className="text-sm">{event.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="secret">Secret</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secret"
                  type="password"
                  placeholder="Webhook secret"
                  value={webhookForm.secret}
                  onChange={(e) => setWebhookForm({...webhookForm, secret: e.target.value})}
                />
                <Button variant="outline" size="sm" onClick={generateSecret}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retry_count">Retry Count</Label>
                <Select value={webhookForm.retry_count.toString()} onValueChange={(value) => setWebhookForm({...webhookForm, retry_count: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Select value={webhookForm.timeout.toString()} onValueChange={(value) => setWebhookForm({...webhookForm, timeout: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="120">120</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowCreateWebhook(false);
                setEditingWebhook(null);
              }}>
                Cancel
              </Button>
              <Button onClick={editingWebhook ? () => handleUpdateWebhook(editingWebhook.id, webhookForm) : handleCreateWebhook} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingWebhook ? 'Update' : 'Create'} Webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhook Details Dialog */}
      <Dialog open={showWebhookDetails} onOpenChange={setShowWebhookDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Webhook Details</DialogTitle>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm">{selectedWebhook.name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedWebhook.is_active ? 'default' : 'secondary'}>
                    {selectedWebhook.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label>URL</Label>
                  <code className="block bg-gray-100 p-2 rounded text-sm">{selectedWebhook.url}</code>
                </div>
                <div className="col-span-2">
                  <Label>Events</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedWebhook.events?.map(event => (
                      <Badge key={event} variant="outline">{event}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{formatDate(selectedWebhook.created_at)}</p>
                </div>
                <div>
                  <Label>Last Triggered</Label>
                  <p className="text-sm">{selectedWebhook.last_triggered ? formatDate(selectedWebhook.last_triggered) : 'Never'}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600">{selectedWebhook.description || 'No description'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhookManagement;