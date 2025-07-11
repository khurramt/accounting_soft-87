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
  
  // Load templates when component mounts
  useEffect(() => {
    if (currentCompany?.id) {
      loadTemplates();
    }
  }, [currentCompany?.id]);
  
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates(currentCompany.id, {
        category: 'document',
        page_size: 100
      });
      setTemplates(response || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fall back to default templates if API fails
      setTemplates([
        {
          id: 'invoice_modern',
          name: 'Modern Invoice',
          template_type: 'invoice',
          is_active: true,
          preview: '/api/placeholder/300/400',
          description: 'Clean, modern invoice template'
        },
        {
          id: 'invoice_classic',
          name: 'Classic Invoice',
          template_type: 'invoice',
          is_active: true,
          preview: '/api/placeholder/300/400',
          description: 'Traditional invoice template'
        },
        {
          id: 'estimate_modern',
          name: 'Modern Estimate',
          template_type: 'estimate',
          is_active: true,
          preview: '/api/placeholder/300/400',
          description: 'Professional estimate template'
        },
        {
          id: 'receipt_simple',
          name: 'Simple Receipt',
          template_type: 'receipt',
          is_active: true,
          preview: '/api/placeholder/300/400',
          description: 'Basic receipt template'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  const saveTemplate = async () => {
    try {
      setLoading(true);
      
      // Validate template data
      const templateData = {
        name: `Custom Template ${Date.now()}`,
        subject: 'Document Template',
        body: JSON.stringify(templateSettings),
        category: 'document',
        template_type: 'custom',
        variables: customFields,
        is_active: true
      };
      
      const validation = await templateService.validateTemplate(templateData);
      if (!validation.isValid) {
        alert(`Template validation failed: ${validation.errors.join(', ')}`);
        return;
      }
      
      const response = await templateService.saveDocumentTemplate(currentCompany.id, templateData);
      
      // Refresh templates list
      await loadTemplates();
      
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const previewTemplate = async () => {
    try {
      setLoading(true);
      
      if (!selectedTemplate) {
        alert('Please select a template to preview');
        return;
      }
      
      // Find the selected template
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        alert('Template not found');
        return;
      }
      
      // Open preview in new window
      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      previewWindow.document.write(`
        <html>
          <head>
            <title>Template Preview - ${template.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .preview-container { max-width: 800px; margin: 0 auto; }
              .template-header { border-bottom: 2px solid ${templateSettings.headerBgColor}; padding: 20px 0; }
              .template-body { padding: 20px 0; }
              .template-footer { border-top: 1px solid #ccc; padding: 20px 0; color: #666; }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <div class="template-header">
                <h1 style="color: ${templateSettings.headerBgColor}">${template.name} Preview</h1>
                ${templateSettings.companyLogo ? `<img src="${templateSettings.companyLogo}" alt="Company Logo" style="max-height: 100px;">` : ''}
              </div>
              <div class="template-body">
                <p>This is a preview of your ${template.template_type} template with the selected settings.</p>
                <p><strong>Color Scheme:</strong> ${templateSettings.colorScheme}</p>
                <p><strong>Font Family:</strong> ${templateSettings.fontFamily}</p>
                <p><strong>Font Size:</strong> ${templateSettings.fontSize}</p>
                ${templateSettings.customMessage ? `<p><strong>Custom Message:</strong> ${templateSettings.customMessage}</p>` : ''}
              </div>
              <div class="template-footer">
                <p>${templateSettings.footerText}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      
      alert('Template preview opened in new window');
    } catch (error) {
      console.error('Error previewing template:', error);
      alert(`Failed to preview template: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportTemplate = async () => {
    try {
      setLoading(true);
      
      if (!selectedTemplate) {
        alert('Please select a template to export');
        return;
      }
      
      // Find the selected template
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        alert('Template not found');
        return;
      }
      
      // If it's a custom template with an ID, use the API export
      if (template.id && template.id !== 'invoice_modern' && template.id !== 'invoice_classic' && template.id !== 'estimate_modern' && template.id !== 'receipt_simple') {
        const response = await templateService.exportTemplate(currentCompany.id, template.id);
        alert(`Template exported successfully! ${response.message}`);
      } else {
        // For default templates, create a manual export
        const exportData = {
          ...template,
          settings: templateSettings,
          customFields: customFields,
          exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${template.name}_export.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Template exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting template:', error);
      alert(`Failed to export template: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const duplicateTemplate = async () => {
    try {
      setLoading(true);
      
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        alert('Template not found');
        return;
      }
      
      const newTemplate = {
        name: `${template.name || 'Template'} (Copy)`,
        subject: `${template.subject || 'Document Template'} (Copy)`,
        body: template.body || JSON.stringify(templateSettings),
        category: 'document',
        template_type: 'duplicate',
        variables: customFields,
        is_active: true
      };
      
      const response = await templateService.createTemplate(currentCompany.id, newTemplate);
      
      // Refresh templates list
      await loadTemplates();
      
      alert('Template duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert(`Failed to duplicate template: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
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
            const response = await templateService.uploadLogo(currentCompany.id, file);
            
            // Read the file as data URL for preview
            const reader = new FileReader();
            reader.onload = (event) => {
              handleSettingChange('companyLogo', event.target.result);
            };
            reader.readAsDataURL(file);
            
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
        
        setTemplateSettings({
          companyLogo: null,
          logoPosition: 'top-left',
          logoSize: 'medium',
          colorScheme: 'blue',
          fontFamily: 'arial',
          fontSize: 'medium',
          headerBgColor: '#3B82F6',
          headerTextColor: '#FFFFFF',
          footerText: 'Thank you for your business!',
          customMessage: '',
          showCompanyAddress: true,
          showBankDetails: true,
          showTermsAndConditions: true,
          includeSignature: false,
          watermark: false,
          pageFormat: 'A4',
          orientation: 'portrait',
          margins: 'normal'
        });
        
        setCustomFields([]);
        
        alert('Template settings reset to default!');
      } catch (error) {
        console.error('Error resetting template:', error);
        alert(`Failed to reset template: ${error.message || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Text formatting handlers
  const handleTextFormat = (format) => {
    // In a real implementation, this would apply text formatting
    // For now, we'll update the template settings to reflect the change
    setTemplateSettings(prev => ({
      ...prev,
      lastAction: `Applied ${format} formatting`,
      lastActionTime: new Date().toISOString()
    }));
    
    // Visual feedback for user
    console.log(`Applied ${format} formatting`);
  };

  const handleTextAlign = (alignment) => {
    // In a real implementation, this would apply text alignment
    // For now, we'll update the template settings to reflect the change
    setTemplateSettings(prev => ({
      ...prev,
      textAlignment: alignment,
      lastAction: `Applied ${alignment} alignment`,
      lastActionTime: new Date().toISOString()
    }));
    
    // Visual feedback for user
    console.log(`Applied ${alignment} alignment`);
  };

  const handleUndo = () => {
    // In a real implementation, this would undo the last action
    // For now, we'll just provide feedback
    console.log('Undo last action');
  };

  const handleRedo = () => {
    // In a real implementation, this would redo the last action
    // For now, we'll just provide feedback
    console.log('Redo last action');
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