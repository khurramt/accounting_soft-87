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
  Loader2
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
    headerBgColor: '#3B82F6',
    headerTextColor: '#FFFFFF',
    bodyTextColor: '#374151',
    borderColor: '#E5E7EB',
    showCompanyAddress: true,
    showPaymentTerms: true,
    showNotes: true,
    showSignature: false,
    customMessage: '',
    footerText: 'Thank you for your business!'
  });

  const [customFields, setCustomFields] = useState([
    { id: 1, name: 'Project Code', type: 'text', required: false, position: 'header' },
    { id: 2, name: 'Department', type: 'dropdown', required: false, position: 'line-item' },
    { id: 3, name: 'Special Instructions', type: 'textarea', required: false, position: 'footer' }
  ]);

  const colorSchemes = [
    { name: 'Blue', primary: '#3B82F6', secondary: '#EBF4FF' },
    { name: 'Green', primary: '#10B981', secondary: '#ECFDF5' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#F3E8FF' },
    { name: 'Red', primary: '#EF4444', secondary: '#FEF2F2' },
    { name: 'Gray', primary: '#6B7280', secondary: '#F9FAFB' }
  ];

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Calibri', 'Verdana', 'Georgia'
  ];

  const logoPositions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' }
  ];

  const handleSettingChange = (key, value) => {
    setTemplateSettings(prev => ({ ...prev, [key]: value }));
  };

  const addCustomField = () => {
    const newField = {
      id: customFields.length + 1,
      name: 'New Field',
      type: 'text',
      required: false,
      position: 'header'
    };
    setCustomFields([...customFields, newField]);
  };

  const updateCustomField = (id, updates) => {
    setCustomFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const deleteCustomField = (id) => {
    setCustomFields(fields => fields.filter(field => field.id !== id));
  };

  const saveTemplate = () => {
    alert('Template saved successfully!');
  };

  const previewTemplate = () => {
    alert('Opening template preview...');
  };

  const exportTemplate = () => {
    alert('Exporting template...');
  };

  const duplicateTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    const newTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false
    };
    setTemplates([...templates, newTemplate]);
    alert('Template duplicated successfully!');
  };

  const importTemplate = () => {
    // Create a file input element to trigger file selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.xml,.html';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Here you would typically read the file and process it
        console.log('Selected file:', file.name);
        alert(`Importing template: ${file.name}`);
        // TODO: Implement actual file processing logic
      }
    };
    input.click();
  };

  const uploadLogo = () => {
    // Create a file input element to trigger logo upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleSettingChange('companyLogo', event.target.result);
          alert('Logo uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      setTemplateSettings({
        companyLogo: null,
        logoPosition: 'top-left',
        logoSize: 'medium',
        colorScheme: 'blue',
        fontFamily: 'arial',
        fontSize: 'medium',
        headerBgColor: '#3B82F6',
        headerTextColor: '#FFFFFF',
        bodyTextColor: '#374151',
        borderColor: '#E5E7EB',
        showCompanyAddress: true,
        showPaymentTerms: true,
        showNotes: true,
        showSignature: false,
        customMessage: '',
        footerText: 'Thank you for your business!'
      });
      alert('Template settings reset to default!');
    }
  };

  // Text formatting handlers
  const handleTextFormat = (format) => {
    // This would typically interact with a rich text editor
    alert(`Applied ${format} formatting`);
  };

  const handleTextAlign = (alignment) => {
    // This would typically interact with a rich text editor
    alert(`Applied ${alignment} alignment`);
  };

  const handleUndo = () => {
    alert('Undo last action');
  };

  const handleRedo = () => {
    alert('Redo last action');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Designer</h1>
          <p className="text-gray-600">Customize your business forms and documents</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={previewTemplate} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveTemplate} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="w-5 h-5 mr-2" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedTemplate === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{template.type}</p>
                    <div className="mt-2 h-20 bg-gray-100 rounded flex items-center justify-center">
                      <Layout className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" onClick={importTemplate}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Customization */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="fields">Custom Fields</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="design">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Colors & Branding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Scheme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {colorSchemes.map(scheme => (
                          <button
                            key={scheme.name}
                            className={`p-3 rounded-lg border-2 ${
                              templateSettings.colorScheme === scheme.name.toLowerCase()
                                ? 'border-blue-500'
                                : 'border-gray-200'
                            }`}
                            onClick={() => handleSettingChange('colorScheme', scheme.name.toLowerCase())}
                          >
                            <div className="flex space-x-1 mb-1">
                              <div 
                                className="w-4 h-4 rounded" 
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div 
                                className="w-4 h-4 rounded" 
                                style={{ backgroundColor: scheme.secondary }}
                              />
                            </div>
                            <span className="text-xs">{scheme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Logo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Drop logo here or click to upload</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={uploadLogo}>
                          Choose File
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Position
                      </label>
                      <select
                        value={templateSettings.logoPosition}
                        onChange={(e) => handleSettingChange('logoPosition', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {logoPositions.map(pos => (
                          <option key={pos.value} value={pos.value}>{pos.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size
                      </label>
                      <select
                        value={templateSettings.logoSize}
                        onChange={(e) => handleSettingChange('logoSize', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Type className="w-5 h-5 mr-2" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={templateSettings.fontFamily}
                        onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {fontFamilies.map(font => (
                          <option key={font} value={font.toLowerCase()}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <select
                        value={templateSettings.fontSize}
                        onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Header Background Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={templateSettings.headerBgColor}
                          onChange={(e) => handleSettingChange('headerBgColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <Input
                          value={templateSettings.headerBgColor}
                          onChange={(e) => handleSettingChange('headerBgColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Header Text Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={templateSettings.headerTextColor}
                          onChange={(e) => handleSettingChange('headerTextColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <Input
                          value={templateSettings.headerTextColor}
                          onChange={(e) => handleSettingChange('headerTextColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Body Text Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={templateSettings.bodyTextColor}
                          onChange={(e) => handleSettingChange('bodyTextColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <Input
                          value={templateSettings.bodyTextColor}
                          onChange={(e) => handleSettingChange('bodyTextColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="layout">
              <Card>
                <CardHeader>
                  <CardTitle>Layout Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Header Section</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showCompanyAddress"
                            checked={templateSettings.showCompanyAddress}
                            onChange={(e) => handleSettingChange('showCompanyAddress', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="showCompanyAddress" className="text-sm">
                            Show Company Address
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showPaymentTerms"
                            checked={templateSettings.showPaymentTerms}
                            onChange={(e) => handleSettingChange('showPaymentTerms', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="showPaymentTerms" className="text-sm">
                            Show Payment Terms
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Footer Section</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showNotes"
                            checked={templateSettings.showNotes}
                            onChange={(e) => handleSettingChange('showNotes', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="showNotes" className="text-sm">
                            Show Notes Section
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showSignature"
                            checked={templateSettings.showSignature}
                            onChange={(e) => handleSettingChange('showSignature', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="showSignature" className="text-sm">
                            Show Signature Line
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Text Formatting Toolbar</h3>
                    <div className="flex space-x-2 p-2 border rounded-lg bg-gray-50">
                      <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextFormat('bold')}>
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextFormat('italic')}>
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextFormat('underline')}>
                        <Underline className="w-4 h-4" />
                      </Button>
                      <div className="border-l mx-2"></div>
                      <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextAlign('left')}>
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextAlign('center')}>
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="p-2" onClick={() => handleTextAlign('right')}>
                        <AlignRight className="w-4 h-4" />
                      </Button>
                      <div className="border-l mx-2"></div>
                      <Button size="sm" variant="outline" className="p-2" onClick={handleUndo}>
                        <Undo className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="p-2" onClick={handleRedo}>
                        <Redo className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fields">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customFields.map(field => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Field Name
                            </label>
                            <Input
                              value={field.name}
                              onChange={(e) => updateCustomField(field.id, { name: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateCustomField(field.id, { type: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Text Area</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="date">Date</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Position
                            </label>
                            <select
                              value={field.position}
                              onChange={(e) => updateCustomField(field.id, { position: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="header">Header</option>
                              <option value="line-item">Line Item</option>
                              <option value="footer">Footer</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`required_${field.id}`}
                                checked={field.required}
                                onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                              />
                              <label htmlFor={`required_${field.id}`} className="text-sm">
                                Required
                              </label>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCustomField(field.id)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button onClick={addCustomField} variant="outline" className="w-full">
                      Add Custom Field
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message
                    </label>
                    <textarea
                      value={templateSettings.customMessage}
                      onChange={(e) => handleSettingChange('customMessage', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Enter a custom message for your documents..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer Text
                    </label>
                    <Input
                      value={templateSettings.footerText}
                      onChange={(e) => handleSettingChange('footerText', e.target.value)}
                      placeholder="Thank you for your business!"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Template Actions</h3>
                    <div className="flex space-x-2">
                      <Button onClick={duplicateTemplate} variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button onClick={exportTemplate} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" onClick={resetToDefault}>
                        Reset to Default
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TemplateDesigner;