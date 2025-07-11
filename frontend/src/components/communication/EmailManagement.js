import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { emailService } from '../../services/emailService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Mail, 
  Send, 
  Inbox, 
  Outbox, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Loader2
} from 'lucide-react';

const EmailManagement = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('emails');
  
  // Email management state
  const [emails, setEmails] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [settings, setSettings] = useState({});
  
  // Email composition state
  const [composeEmail, setComposeEmail] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    template_id: '',
    priority: 'normal',
    send_later: false,
    scheduled_at: '',
    attachments: []
  });
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
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
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailDetails, setShowEmailDetails] = useState(false);
  
  // Load data when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadEmailData();
    }
  }, [currentCompany?.id, activeTab, filters, pagination.page]);
  
  const loadEmailData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'emails') {
        const response = await emailService.getEmails(currentCompany.id, {
          ...filters,
          page: pagination.page,
          page_size: pagination.page_size
        });
        setEmails(response.items || []);
        setPagination(prev => ({ ...prev, total: response.total || 0 }));
      } else if (activeTab === 'templates') {
        const response = await emailService.getEmailTemplates(currentCompany.id);
        setTemplates(response.items || []);
      } else if (activeTab === 'campaigns') {
        const response = await emailService.getEmailCampaigns(currentCompany.id);
        setCampaigns(response.items || []);
      } else if (activeTab === 'settings') {
        const response = await emailService.getEmailSettings(currentCompany.id);
        setSettings(response || {});
      }
    } catch (error) {
      console.error('Error loading email data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendEmail = async () => {
    try {
      setLoading(true);
      await emailService.sendEmail(currentCompany.id, composeEmail);
      setShowCompose(false);
      setComposeEmail({
        to: '', cc: '', bcc: '', subject: '', body: '', template_id: '',
        priority: 'normal', send_later: false, scheduled_at: '', attachments: []
      });
      loadEmailData();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEmail = async (emailId) => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        await emailService.deleteEmail(currentCompany.id, emailId);
        loadEmailData();
      } catch (error) {
        console.error('Error deleting email:', error);
        alert('Failed to delete email. Please try again.');
      }
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Mail className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600 mt-1">Manage your email communications and templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => loadEmailData()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emails">
            <Mail className="w-4 h-4 mr-2" />
            Emails
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

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email History</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search emails..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading emails...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {emails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(email.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{email.subject}</span>
                            <Badge variant={email.priority === 'high' ? 'destructive' : 'secondary'}>
                              {email.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{email.recipient}</p>
                          <p className="text-xs text-gray-500">{formatDate(email.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedEmail(email);
                            setShowEmailDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteEmail(email.id)}
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
                <CardTitle>Email Templates</CardTitle>
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
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
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
                <CardTitle>Email Campaigns</CardTitle>
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
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Recipients</p>
                        <p className="font-medium">{campaign.recipients_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sent</p>
                        <p className="font-medium">{campaign.sent_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Opens</p>
                        <p className="font-medium">{campaign.opens_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clicks</p>
                        <p className="font-medium">{campaign.clicks_count}</p>
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
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host || ''}
                    onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port || ''}
                    onChange={(e) => setSettings({...settings, smtp_port: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={settings.smtp_username || ''}
                    onChange={(e) => setSettings({...settings, smtp_username: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={settings.smtp_password || ''}
                    onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="use_tls"
                  checked={settings.use_tls || false}
                  onCheckedChange={(checked) => setSettings({...settings, use_tls: checked})}
                />
                <Label htmlFor="use_tls">Use TLS</Label>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Email Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder="Recipient email"
                  value={composeEmail.to}
                  onChange={(e) => setComposeEmail({...composeEmail, to: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  placeholder="CC email"
                  value={composeEmail.cc}
                  onChange={(e) => setComposeEmail({...composeEmail, cc: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  placeholder="BCC email"
                  value={composeEmail.bcc}
                  onChange={(e) => setComposeEmail({...composeEmail, bcc: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={composeEmail.subject}
                onChange={(e) => setComposeEmail({...composeEmail, subject: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Email body"
                rows={10}
                value={composeEmail.body}
                onChange={(e) => setComposeEmail({...composeEmail, body: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={composeEmail.priority} onValueChange={(value) => setComposeEmail({...composeEmail, priority: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="send_later"
                    checked={composeEmail.send_later}
                    onCheckedChange={(checked) => setComposeEmail({...composeEmail, send_later: checked})}
                  />
                  <Label htmlFor="send_later">Schedule Send</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Send
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Details Dialog */}
      <Dialog open={showEmailDetails} onOpenChange={setShowEmailDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <p className="text-sm">{selectedEmail.subject}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedEmail.status)}
                    <span className="text-sm">{selectedEmail.status}</span>
                  </div>
                </div>
                <div>
                  <Label>Recipient</Label>
                  <p className="text-sm">{selectedEmail.recipient}</p>
                </div>
                <div>
                  <Label>Sent At</Label>
                  <p className="text-sm">{formatDate(selectedEmail.created_at)}</p>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedEmail.body}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailManagement;