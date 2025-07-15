import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { templateService } from '../../services/templateService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { 
  FileText, 
  Eye, 
  Download, 
  Upload, 
  Save, 
  Copy, 
  Trash2,
  Settings,
  Image,
  Type,
  Palette,
  Layout,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Loader2,
  Check,
  X
} from 'lucide-react';

const TemplateDesigner = () => {
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('invoice_modern');

  const [templateSettings, setTemplateSettings] = useState({
    companyLogo: null,
    logoPosition: 'top-left',
    logoSize: 'medium',
    colorScheme: 'blue',
    fontFamily: 'arial',
    fontSize: 'medium',
    headerColor: '#ffffff',
    accentColor: '#2563eb',
    textColor: '#000000',
    borderColor: '#e5e7eb',
    showBorder: true,
    showHeader: true,
    showFooter: true,
    customFields: [],
    lastAction: null,
    lastActionTime: null,
    textAlignment: 'left',
    history: [],
    historyIndex: -1
  });

  const [customFields, setCustomFields] = useState([]);

  // Load templates when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadTemplates();
    }
  }, [currentCompany?.id]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates(currentCompany.id);
      setTemplates(response.items || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    // Save current state to history before making changes
    const newState = {
      ...templateSettings,
      [key]: value,
      lastAction: `Updated ${key}`,
      lastActionTime: new Date().toISOString()
    };
    
    // Add to history
    const newHistory = [...templateSettings.history.slice(0, templateSettings.historyIndex + 1), templateSettings];
    newState.history = newHistory;
    newState.historyIndex = newHistory.length - 1;
    
    setTemplateSettings(newState);
  };

  const addCustomField = () => {
    const newField = {
      id: Date.now(),
      name: `Custom Field ${customFields.length + 1}`,
      type: 'text',
      required: false,
      placeholder: 'Enter value...'
    };
    setCustomFields([...customFields, newField]);
    handleSettingChange('customFields', [...customFields, newField]);
  };

  const deleteCustomField = (fieldId) => {
    const updatedFields = customFields.filter(field => field.id !== fieldId);
    setCustomFields(updatedFields);
    handleSettingChange('customFields', updatedFields);
  };

  const previewTemplate = () => {
    // In a real implementation, this would open a preview modal
    alert('Template preview functionality will be implemented here');
  };

  const saveTemplate = async () => {
    try {
      setLoading(true);
      
      const templateData = {
        template_id: selectedTemplate,
        settings: templateSettings,
        custom_fields: customFields
      };
      
      await templateService.saveTemplate(currentCompany.id, templateData);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportTemplate = async () => {
    try {
      const templateData = {
        template_id: selectedTemplate,
        settings: templateSettings,
        custom_fields: customFields
      };
      
      const dataStr = JSON.stringify(templateData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `template_${selectedTemplate}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('Template exported successfully!');
    } catch (error) {
      console.error('Error exporting template:', error);
      alert(`Failed to export template: ${error.message || 'Please try again.'}`);
    }
  };

  const duplicateTemplate = async () => {
    try {
      const templateData = {
        template_id: `${selectedTemplate}_copy`,
        settings: templateSettings,
        custom_fields: customFields
      };
      
      await templateService.saveTemplate(currentCompany.id, templateData);
      await loadTemplates();
      alert('Template duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert(`Failed to duplicate template: ${error.message || 'Please try again.'}`);
    }
  };

  const importTemplate = async () => {
    try {
      setLoading(true);
      
      // Create a file input element to trigger file selection
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.xml,.html';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const response = await templateService.importTemplate(currentCompany.id, file);
            
            // Refresh templates list
            await loadTemplates();
            
            alert(`Template imported successfully! ${response.name}`);
          } catch (error) {
            console.error('Error importing template:', error);
            alert(`Failed to import template: ${error.message || 'Please check the file format and try again.'}`);
          }
        }
      };
      input.click();
    } catch (error) {
      console.error('Error importing template:', error);
      alert(`Failed to import template: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async () => {
    try {
      setLoading(true);
      
      // Create a file input element to trigger logo upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            // Show upload progress
            const uploadProgress = document.createElement('div');
            uploadProgress.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              z-index: 1000;
            `;
            uploadProgress.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>Uploading logo...</span>
              </div>
            `;
            document.body.appendChild(uploadProgress);

            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `;
            document.head.appendChild(style);

            const response = await templateService.uploadLogo(currentCompany.id, file);
            
            // Read the file as data URL for preview
            const reader = new FileReader();
            reader.onload = (event) => {
              handleSettingChange('companyLogo', event.target.result);
            };
            reader.readAsDataURL(file);
            
            document.body.removeChild(uploadProgress);
            document.head.removeChild(style);
            
            alert('Logo uploaded successfully!');
          } catch (error) {
            console.error('Error uploading logo:', error);
            alert(`Failed to upload logo: ${error.message || 'Please try again.'}`);
          }
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(`Failed to upload logo: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        // Save current state to history before reset
        const newHistory = [...templateSettings.history, templateSettings];
        
        const defaultSettings = {
          companyLogo: null,
          logoPosition: 'top-left',
          logoSize: 'medium',
          colorScheme: 'blue',
          fontFamily: 'arial',
          fontSize: 'medium',
          headerColor: '#ffffff',
          accentColor: '#2563eb',
          textColor: '#000000',
          borderColor: '#e5e7eb',
          showBorder: true,
          showHeader: true,
          showFooter: true,
          customFields: [],
          lastAction: 'Reset to default',
          lastActionTime: new Date().toISOString(),
          textAlignment: 'left',
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
        
        setTemplateSettings(defaultSettings);
        setCustomFields([]);
        
        // Optionally save to backend
        await templateService.resetTemplate(currentCompany.id, selectedTemplate);
        
        alert('Template reset to default settings!');
      } catch (error) {
        console.error('Error resetting template:', error);
        alert(`Failed to reset template: ${error.message || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTextFormat = (format) => {
    // Get current selection if any
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      // Apply formatting to selected text
      try {
        let formattedText = selectedText;
        
        switch (format) {
          case 'bold':
            formattedText = `<strong>${selectedText}</strong>`;
            break;
          case 'italic':
            formattedText = `<em>${selectedText}</em>`;
            break;
          case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
          default:
            break;
        }
        
        // Replace selection with formatted text
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(formattedText));
        }
        
        handleSettingChange('lastAction', `Applied ${format} formatting to selected text`);
      } catch (error) {
        console.error('Error applying formatting:', error);
      }
    } else {
      // No selection, just record the formatting preference
      handleSettingChange('textFormat', format);
      handleSettingChange('lastAction', `Set ${format} as default text formatting`);
    }
    
    // Visual feedback
    const button = document.querySelector(`[data-format="${format}"]`);
    if (button) {
      button.style.backgroundColor = '#3b82f6';
      button.style.color = 'white';
      setTimeout(() => {
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 300);
    }
  };

  const handleTextAlign = (alignment) => {
    // Find the currently focused element or apply to the template preview
    const focusedElement = document.activeElement;
    
    if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) {
      // Apply to input/textarea
      focusedElement.style.textAlign = alignment;
    }
    
    // Update template settings
    handleSettingChange('textAlignment', alignment);
    handleSettingChange('lastAction', `Applied ${alignment} alignment`);
    
    // Visual feedback
    const button = document.querySelector(`[data-align="${alignment}"]`);
    if (button) {
      button.style.backgroundColor = '#3b82f6';
      button.style.color = 'white';
      setTimeout(() => {
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 300);
    }
  };

  const handleUndo = () => {
    if (templateSettings.historyIndex > 0) {
      const newIndex = templateSettings.historyIndex - 1;
      const previousState = templateSettings.history[newIndex];
      
      setTemplateSettings({
        ...previousState,
        historyIndex: newIndex,
        lastAction: 'Undo',
        lastActionTime: new Date().toISOString()
      });
    }
  };

  const handleRedo = () => {
    if (templateSettings.historyIndex < templateSettings.history.length - 1) {
      const newIndex = templateSettings.historyIndex + 1;
      const nextState = templateSettings.history[newIndex];
      
      setTemplateSettings({
        ...nextState,
        historyIndex: newIndex,
        lastAction: 'Redo',
        lastActionTime: new Date().toISOString()
      });
    }
  };

  const colorSchemes = [
    { name: 'Blue', primary: '#2563eb', secondary: '#dbeafe' },
    { name: 'Green', primary: '#059669', secondary: '#d1fae5' },
    { name: 'Red', primary: '#dc2626', secondary: '#fee2e2' },
    { name: 'Purple', primary: '#7c3aed', secondary: '#ede9fe' },
    { name: 'Gray', primary: '#4b5563', secondary: '#f3f4f6' }
  ];

  const fontOptions = [
    { value: 'arial', label: 'Arial' },
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'times', label: 'Times New Roman' },
    { value: 'georgia', label: 'Georgia' },
    { value: 'verdana', label: 'Verdana' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const mockTemplates = [
    { id: 'invoice_modern', name: 'Modern Invoice', type: 'invoice', thumbnail: null },
    { id: 'invoice_classic', name: 'Classic Invoice', type: 'invoice', thumbnail: null },
    { id: 'estimate_professional', name: 'Professional Estimate', type: 'estimate', thumbnail: null },
    { id: 'receipt_simple', name: 'Simple Receipt', type: 'receipt', thumbnail: null }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Designer</h1>
          <p className="text-gray-600 mt-1">Customize your business document templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={previewTemplate} disabled={loading}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveTemplate} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Template Selection and Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.type}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="mt-2 h-20 bg-gray-100 rounded flex items-center justify-center">
                      <Layout className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" onClick={importTemplate} disabled={loading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="appearance">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="appearance">
                    <Palette className="w-4 h-4 mr-1" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="layout">
                    <Layout className="w-4 h-4 mr-1" />
                    Layout
                  </TabsTrigger>
                  <TabsTrigger value="branding">
                    <Image className="w-4 h-4 mr-1" />
                    Logo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appearance" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Scheme
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {colorSchemes.map((scheme) => (
                        <button
                          key={scheme.name}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            templateSettings.colorScheme === scheme.name.toLowerCase()
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSettingChange('colorScheme', scheme.name.toLowerCase())}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: scheme.primary }}
                            />
                            <span className="text-sm font-medium">{scheme.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <Select
                      value={templateSettings.fontFamily}
                      onValueChange={(value) => handleSettingChange('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <Select
                      value={templateSettings.fontSize}
                      onValueChange={(value) => handleSettingChange('fontSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {templateSettings.companyLogo ? (
                          <img 
                            src={templateSettings.companyLogo} 
                            alt="Company Logo" 
                            className="mx-auto max-h-20 max-w-full object-contain"
                          />
                        ) : (
                          <>
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Drop logo here or click to upload</p>
                          </>
                        )}
                        <Button variant="outline" size="sm" className="mt-2" onClick={uploadLogo} disabled={loading}>
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Choose File
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Position
                      </label>
                      <Select
                        value={templateSettings.logoPosition}
                        onValueChange={(value) => handleSettingChange('logoPosition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-center">Top Center</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size
                      </label>
                      <Select
                        value={templateSettings.logoSize}
                        onValueChange={(value) => handleSettingChange('logoSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Show Header</label>
                      <Switch
                        checked={templateSettings.showHeader}
                        onCheckedChange={(checked) => handleSettingChange('showHeader', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Show Footer</label>
                      <Switch
                        checked={templateSettings.showFooter}
                        onCheckedChange={(checked) => handleSettingChange('showFooter', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Show Border</label>
                      <Switch
                        checked={templateSettings.showBorder}
                        onCheckedChange={(checked) => handleSettingChange('showBorder', checked)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel - Template Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Preview</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextFormat('bold')} data-format="bold">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextFormat('italic')} data-format="italic">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextFormat('underline')} data-format="underline">
                    <Underline className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextAlign('left')} data-align="left">
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextAlign('center')} data-align="center">
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextAlign('right')} data-align="right">
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <Button size="sm" variant="outline" className="p-2" onClick={handleUndo} disabled={templateSettings.historyIndex <= 0}>
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2" onClick={handleRedo} disabled={templateSettings.historyIndex >= templateSettings.history.length - 1}>
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="min-h-96 bg-white border rounded-lg p-4 shadow-sm"
                style={{
                  fontFamily: templateSettings.fontFamily,
                  fontSize: templateSettings.fontSize === 'small' ? '12px' : templateSettings.fontSize === 'large' ? '16px' : '14px',
                  color: templateSettings.textColor,
                  textAlign: templateSettings.textAlignment,
                  borderColor: templateSettings.showBorder ? templateSettings.borderColor : 'transparent'
                }}
              >
                {templateSettings.showHeader && (
                  <div 
                    className="mb-4 p-3 rounded"
                    style={{ backgroundColor: templateSettings.headerColor }}
                  >
                    {templateSettings.companyLogo && (
                      <img 
                        src={templateSettings.companyLogo} 
                        alt="Company Logo" 
                        className={`${templateSettings.logoPosition === 'top-center' ? 'mx-auto' : templateSettings.logoPosition === 'top-right' ? 'ml-auto' : ''} ${templateSettings.logoSize === 'small' ? 'h-8' : templateSettings.logoSize === 'large' ? 'h-16' : 'h-12'}`}
                      />
                    )}
                    <h2 className="text-lg font-bold" style={{ color: templateSettings.accentColor }}>
                      {selectedTemplate.replace('_', ' ').toUpperCase()}
                    </h2>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Invoice Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Invoice #: INV-001</div>
                      <div>Date: {new Date().toLocaleDateString()}</div>
                      <div>Due Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                      <div>Status: Draft</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Bill To</h3>
                    <div className="text-sm">
                      <div>Sample Customer</div>
                      <div>123 Main Street</div>
                      <div>City, State 12345</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Items</h3>
                    <div className="text-sm">
                      <div className="grid grid-cols-4 gap-2 font-medium border-b pb-1">
                        <div>Description</div>
                        <div>Qty</div>
                        <div>Rate</div>
                        <div>Amount</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 py-1">
                        <div>Sample Item</div>
                        <div>1</div>
                        <div>$100.00</div>
                        <div>$100.00</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>$100.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>$8.00</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>$108.00</span>
                    </div>
                  </div>
                </div>
                
                {templateSettings.showFooter && (
                  <div className="mt-4 pt-3 border-t text-xs text-gray-600">
                    <p>Thank you for your business!</p>
                    <p>Questions? Contact us at support@company.com</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Custom Fields and Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{field.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteCustomField(field.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <Button onClick={addCustomField} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Field
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={duplicateTemplate} variant="outline" disabled={loading}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button onClick={exportTemplate} variant="outline" disabled={loading}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={resetToDefault} disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {templateSettings.lastAction && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p><strong>Last Action:</strong> {templateSettings.lastAction}</p>
                  <p><strong>Time:</strong> {templateSettings.lastActionTime ? new Date(templateSettings.lastActionTime).toLocaleString() : 'N/A'}</p>
                  <p><strong>History:</strong> {templateSettings.history.length} changes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDesigner;