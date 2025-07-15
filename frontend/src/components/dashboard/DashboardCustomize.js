import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import dashboardService from '../../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  LayoutDashboard, 
  Plus, 
  Edit3, 
  Trash2, 
  Move, 
  Save, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Grid,
  List,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Calendar,
  Bell,
  Activity,
  CreditCard,
  FileText,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  GripVertical,
  Loader2
} from 'lucide-react';

const DashboardCustomize = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Dashboard layout state
  const [dashboardLayout, setDashboardLayout] = useState({
    widgets: [],
    layout: 'grid',
    columns: 3,
    theme: 'light',
    showTitles: true,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  });
  
  // Available widgets
  const [availableWidgets, setAvailableWidgets] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('widgets');
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [draggedWidget, setDraggedWidget] = useState(null);
  
  // Widget form state
  const [widgetForm, setWidgetForm] = useState({
    type: '',
    title: '',
    size: 'medium',
    refreshInterval: 300000,
    settings: {}
  });

  // Load dashboard customization data
  useEffect(() => {
    if (currentCompany?.id) {
      loadDashboardCustomization();
    }
  }, [currentCompany?.id]);

  const loadDashboardCustomization = async () => {
    try {
      setLoading(true);
      
      // Load current dashboard layout
      const layoutResponse = await dashboardService.getDashboardLayout(currentCompany.id);
      if (layoutResponse) {
        setDashboardLayout(layoutResponse);
      }
      
      // Load available widgets
      const widgetsResponse = await dashboardService.getAvailableWidgets(currentCompany.id);
      setAvailableWidgets(widgetsResponse || []);
      
    } catch (error) {
      console.error('Error loading dashboard customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDashboardLayout = async () => {
    try {
      setSaving(true);
      await dashboardService.saveDashboardLayout(currentCompany.id, dashboardLayout);
      alert('Dashboard layout saved successfully!');
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      alert('Failed to save dashboard layout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addWidget = async () => {
    try {
      setLoading(true);
      
      const newWidget = {
        id: Date.now().toString(),
        type: widgetForm.type,
        title: widgetForm.title,
        size: widgetForm.size,
        position: { x: 0, y: 0 },
        settings: widgetForm.settings,
        refreshInterval: widgetForm.refreshInterval,
        isVisible: true
      };
      
      const updatedLayout = {
        ...dashboardLayout,
        widgets: [...dashboardLayout.widgets, newWidget]
      };
      
      setDashboardLayout(updatedLayout);
      setShowAddWidget(false);
      resetWidgetForm();
      
    } catch (error) {
      console.error('Error adding widget:', error);
      alert('Failed to add widget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateWidget = (widgetId, updates) => {
    const updatedWidgets = dashboardLayout.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );
    
    setDashboardLayout({
      ...dashboardLayout,
      widgets: updatedWidgets
    });
  };

  const removeWidget = (widgetId) => {
    const updatedWidgets = dashboardLayout.widgets.filter(widget => widget.id !== widgetId);
    setDashboardLayout({
      ...dashboardLayout,
      widgets: updatedWidgets
    });
  };

  const toggleWidgetVisibility = (widgetId) => {
    updateWidget(widgetId, { 
      isVisible: !dashboardLayout.widgets.find(w => w.id === widgetId)?.isVisible 
    });
  };

  const resetWidgetForm = () => {
    setWidgetForm({
      type: '',
      title: '',
      size: 'medium',
      refreshInterval: 300000,
      settings: {}
    });
  };

  const handleDragStart = (e, widget) => {
    setDraggedWidget(widget);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedWidget) {
      const widgets = [...dashboardLayout.widgets];
      const draggedIndex = widgets.findIndex(w => w.id === draggedWidget.id);
      
      if (draggedIndex !== -1) {
        const [removed] = widgets.splice(draggedIndex, 1);
        widgets.splice(targetIndex, 0, removed);
        
        setDashboardLayout({
          ...dashboardLayout,
          widgets
        });
      }
    }
    
    setDraggedWidget(null);
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset the dashboard to default layout? This will remove all customizations.')) {
      setDashboardLayout({
        widgets: [
          {
            id: '1',
            type: 'financial_overview',
            title: 'Financial Overview',
            size: 'large',
            position: { x: 0, y: 0 },
            settings: {},
            refreshInterval: 300000,
            isVisible: true
          },
          {
            id: '2',
            type: 'recent_transactions',
            title: 'Recent Transactions',
            size: 'medium',
            position: { x: 1, y: 0 },
            settings: {},
            refreshInterval: 300000,
            isVisible: true
          },
          {
            id: '3',
            type: 'quick_actions',
            title: 'Quick Actions',
            size: 'small',
            position: { x: 2, y: 0 },
            settings: {},
            refreshInterval: 300000,
            isVisible: true
          }
        ],
        layout: 'grid',
        columns: 3,
        theme: 'light',
        showTitles: true,
        autoRefresh: true,
        refreshInterval: 300000
      });
    }
  };

  const getWidgetIcon = (type) => {
    switch (type) {
      case 'financial_overview': return <BarChart3 className="w-5 h-5" />;
      case 'recent_transactions': return <Activity className="w-5 h-5" />;
      case 'quick_actions': return <Target className="w-5 h-5" />;
      case 'sales_chart': return <TrendingUp className="w-5 h-5" />;
      case 'expense_chart': return <PieChart className="w-5 h-5" />;
      case 'invoice_status': return <FileText className="w-5 h-5" />;
      case 'customer_overview': return <Users className="w-5 h-5" />;
      case 'inventory_status': return <ShoppingCart className="w-5 h-5" />;
      case 'calendar': return <Calendar className="w-5 h-5" />;
      case 'notifications': return <Bell className="w-5 h-5" />;
      case 'cash_flow': return <DollarSign className="w-5 h-5" />;
      case 'payment_status': return <CreditCard className="w-5 h-5" />;
      default: return <LayoutDashboard className="w-5 h-5" />;
    }
  };

  const getWidgetSizeClass = (size) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-2';
    }
  };

  const widgetTypes = [
    { value: 'financial_overview', label: 'Financial Overview' },
    { value: 'recent_transactions', label: 'Recent Transactions' },
    { value: 'quick_actions', label: 'Quick Actions' },
    { value: 'sales_chart', label: 'Sales Chart' },
    { value: 'expense_chart', label: 'Expense Chart' },
    { value: 'invoice_status', label: 'Invoice Status' },
    { value: 'customer_overview', label: 'Customer Overview' },
    { value: 'inventory_status', label: 'Inventory Status' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'cash_flow', label: 'Cash Flow' },
    { value: 'payment_status', label: 'Payment Status' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small (1 column)' },
    { value: 'medium', label: 'Medium (2 columns)' },
    { value: 'large', label: 'Large (3 columns)' }
  ];

  const refreshIntervalOptions = [
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Customization</h1>
          <p className="text-gray-600 mt-1">Customize your dashboard layout and widgets</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => loadDashboardCustomization()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={resetToDefault}>
            <X className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={saveDashboardLayout} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Layout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="widgets">
            <Grid className="w-4 h-4 mr-2" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="layout">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dashboard Widgets</CardTitle>
                <Button onClick={() => setShowAddWidget(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Widget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading widgets...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardLayout.widgets.map((widget, index) => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      draggable
                      onDragStart={(e) => handleDragStart(e, widget)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <div className="flex items-center space-x-2">
                          {getWidgetIcon(widget.type)}
                          <span className="font-medium">{widget.title}</span>
                        </div>
                        <Badge variant="outline">{widget.size}</Badge>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWidgetVisibility(widget.id)}
                          >
                            {widget.isVisible ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingWidget(widget)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWidget(widget.id)}
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

          {/* Widget Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${dashboardLayout.columns === 4 ? 'grid-cols-4' : dashboardLayout.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {dashboardLayout.widgets.filter(w => w.isVisible).map((widget) => (
                  <div
                    key={widget.id}
                    className={`${getWidgetSizeClass(widget.size)} border rounded-lg p-4 bg-white`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getWidgetIcon(widget.type)}
                        <span className="font-medium text-sm">{widget.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {widget.size}
                      </Badge>
                    </div>
                    <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm text-gray-600">Widget Preview</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="layout_type">Layout Type</Label>
                  <Select
                    value={dashboardLayout.layout}
                    onValueChange={(value) => setDashboardLayout({...dashboardLayout, layout: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="columns">Columns</Label>
                  <Select
                    value={dashboardLayout.columns.toString()}
                    onValueChange={(value) => setDashboardLayout({...dashboardLayout, columns: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={dashboardLayout.theme}
                    onValueChange={(value) => setDashboardLayout({...dashboardLayout, theme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="refresh_interval">Auto Refresh Interval</Label>
                  <Select
                    value={dashboardLayout.refreshInterval.toString()}
                    onValueChange={(value) => setDashboardLayout({...dashboardLayout, refreshInterval: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {refreshIntervalOptions.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_titles">Show Widget Titles</Label>
                  <Switch
                    id="show_titles"
                    checked={dashboardLayout.showTitles}
                    onCheckedChange={(checked) => setDashboardLayout({...dashboardLayout, showTitles: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_refresh">Auto Refresh</Label>
                  <Switch
                    id="auto_refresh"
                    checked={dashboardLayout.autoRefresh}
                    onCheckedChange={(checked) => setDashboardLayout({...dashboardLayout, autoRefresh: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Dashboard Name</Label>
                  <Input
                    placeholder="My Dashboard"
                    value={dashboardLayout.name || ''}
                    onChange={(e) => setDashboardLayout({...dashboardLayout, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Dashboard description"
                    value={dashboardLayout.description || ''}
                    onChange={(e) => setDashboardLayout({...dashboardLayout, description: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Enable Animations</Label>
                    <Switch
                      checked={dashboardLayout.animations !== false}
                      onCheckedChange={(checked) => setDashboardLayout({...dashboardLayout, animations: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Compact Mode</Label>
                    <Switch
                      checked={dashboardLayout.compact === true}
                      onCheckedChange={(checked) => setDashboardLayout({...dashboardLayout, compact: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Grid Lines</Label>
                    <Switch
                      checked={dashboardLayout.showGrid === true}
                      onCheckedChange={(checked) => setDashboardLayout({...dashboardLayout, showGrid: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="widget_type">Widget Type</Label>
              <Select
                value={widgetForm.type}
                onValueChange={(value) => setWidgetForm({...widgetForm, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  {widgetTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        {getWidgetIcon(type.value)}
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="widget_title">Widget Title</Label>
              <Input
                id="widget_title"
                placeholder="Enter widget title"
                value={widgetForm.title}
                onChange={(e) => setWidgetForm({...widgetForm, title: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="widget_size">Widget Size</Label>
              <Select
                value={widgetForm.size}
                onValueChange={(value) => setWidgetForm({...widgetForm, size: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="widget_refresh">Refresh Interval</Label>
              <Select
                value={widgetForm.refreshInterval.toString()}
                onValueChange={(value) => setWidgetForm({...widgetForm, refreshInterval: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {refreshIntervalOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddWidget(false)}>
                Cancel
              </Button>
              <Button onClick={addWidget} disabled={!widgetForm.type || !widgetForm.title}>
                Add Widget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCustomize;