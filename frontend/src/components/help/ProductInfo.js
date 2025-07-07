import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Info, Download, Key, Shield, Cpu, HardDrive, 
  Monitor, Globe, CheckCircle, AlertCircle, Clock, Users
} from 'lucide-react';

const ProductInfo = () => {
  const [systemInfo, setSystemInfo] = useState({
    version: '2024.1.15',
    buildNumber: '24011502',
    releaseDate: '2024-01-15',
    license: 'Professional',
    licenseKey: 'QB24-PRO-1234-5678-9012',
    expiration: '2024-12-31',
    maxUsers: 5,
    currentUsers: 3,
    lastUpdate: '2024-01-12',
    dataLocation: 'C:\\QuickBooks\\Company Files\\',
    backupLocation: 'C:\\QuickBooks\\Backups\\'
  });

  const [systemRequirements] = useState({
    minimum: {
      os: 'Windows 10 or later',
      processor: '2.4 GHz Intel Core i3 or equivalent',
      memory: '4 GB RAM',
      storage: '2.5 GB free disk space',
      display: '1024 x 768 resolution',
      internet: 'Required for activation and updates'
    },
    recommended: {
      os: 'Windows 11',
      processor: '2.8 GHz Intel Core i5 or equivalent',
      memory: '8 GB RAM',
      storage: '5 GB free disk space',
      display: '1920 x 1080 resolution',
      internet: 'Broadband connection'
    }
  });

  const [featureList] = useState([
    {
      category: 'Core Accounting',
      features: [
        'Chart of Accounts Management',
        'Journal Entries',
        'Financial Reporting',
        'Bank Reconciliation',
        'Accounts Payable/Receivable'
      ]
    },
    {
      category: 'Sales & Customer Management',
      features: [
        'Invoice Creation & Management',
        'Customer Database',
        'Payment Processing',
        'Sales Tax Tracking',
        'Estimates & Quotes'
      ]
    },
    {
      category: 'Purchasing & Vendor Management',
      features: [
        'Purchase Orders',
        'Bill Management',
        'Vendor Database',
        'Expense Tracking',
        '1099 Processing'
      ]
    },
    {
      category: 'Inventory Management',
      features: [
        'Item Tracking',
        'Quantity on Hand',
        'Reorder Points',
        'Inventory Valuation',
        'Assemblies (Premier/Enterprise)'
      ]
    },
    {
      category: 'Payroll (Add-on)',
      features: [
        'Employee Management',
        'Paycheck Processing',
        'Tax Calculations',
        'Direct Deposit',
        'Payroll Reports'
      ]
    },
    {
      category: 'Reporting & Analytics',
      features: [
        'Financial Statements',
        'Custom Reports',
        'Budgeting',
        'Cash Flow Forecasting',
        'Industry-specific Reports'
      ]
    }
  ]);

  const [updates] = useState([
    {
      version: '2024.1.15',
      date: '2024-01-15',
      type: 'Feature Update',
      status: 'installed',
      description: 'Enhanced reporting features and bug fixes',
      size: '125 MB'
    },
    {
      version: '2024.1.12',
      date: '2024-01-12',
      type: 'Security Update',
      status: 'installed',
      description: 'Security enhancements and stability improvements',
      size: '45 MB'
    },
    {
      version: '2024.1.18',
      date: '2024-01-18',
      type: 'Feature Update',
      status: 'available',
      description: 'New inventory management features',
      size: '180 MB'
    }
  ]);

  const checkForUpdates = () => {
    alert('Checking for updates...');
    // Simulate update check
    setTimeout(() => {
      alert('Your QuickBooks is up to date!');
    }, 2000);
  };

  const downloadUpdate = (version) => {
    alert(`Downloading update ${version}...`);
  };

  const exportSystemInfo = () => {
    const info = {
      ...systemInfo,
      systemRequirements,
      generatedOn: new Date().toISOString()
    };
    
    // In a real application, this would generate and download a file
    console.log('System Information:', info);
    alert('System information exported to console');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'installed': return 'success';
      case 'available': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Information</h1>
          <p className="text-gray-600">View system details, features, and updates</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportSystemInfo} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Info
          </Button>
          <Button onClick={checkForUpdates} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Check Updates
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="system">System Requirements</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Version</label>
                    <p className="text-lg font-semibold">{systemInfo.version}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Build Number</label>
                    <p className="text-lg font-semibold">{systemInfo.buildNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Release Date</label>
                    <p className="text-sm text-gray-900">{systemInfo.releaseDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Update</label>
                    <p className="text-sm text-gray-900">{systemInfo.lastUpdate}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Edition</label>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    QuickBooks {systemInfo.license}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Key</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {systemInfo.licenseKey}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiration</label>
                    <p className="text-sm text-gray-900">{systemInfo.expiration}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Users</label>
                    <p className="text-sm text-gray-900">{systemInfo.maxUsers}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Users</label>
                    <p className="text-sm text-gray-900">{systemInfo.currentUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="w-5 h-5 mr-2" />
                  File Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Data</label>
                  <p className="text-sm text-gray-900 bg-gray-100 p-2 rounded font-mono">
                    {systemInfo.dataLocation}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Backup Location</label>
                  <p className="text-sm text-gray-900 bg-gray-100 p-2 rounded font-mono">
                    {systemInfo.backupLocation}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Change Data Location
                  </Button>
                  <Button variant="outline" size="sm">
                    Change Backup Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Encryption</span>
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      AES-256
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Backup</span>
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Trail</span>
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Access Control</span>
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configured
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Compliant with SOX, GDPR, and industry security standards
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <div className="space-y-6">
            {featureList.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>Add-on Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">QuickBooks Payroll</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Full-service payroll with tax calculations and filing
                    </p>
                    <Badge variant="outline">Available</Badge>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">QuickBooks Payments</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Accept credit cards and bank transfers
                    </p>
                    <Badge variant="outline">Available</Badge>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">QuickBooks Time</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Time tracking for employees and projects
                    </p>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  Minimum Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Operating System</p>
                      <p className="text-sm text-gray-600">{systemRequirements.minimum.os}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Cpu className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Processor</p>
                      <p className="text-sm text-gray-600">{systemRequirements.minimum.processor}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Memory</p>
                      <p className="text-sm text-gray-600">{systemRequirements.minimum.memory}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Storage</p>
                      <p className="text-sm text-gray-600">{systemRequirements.minimum.storage}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Display</p>
                      <p className="text-sm text-gray-600">{systemRequirements.minimum.display}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Internet</p>
                      <p className="text-sm text-gray-600">{systemRequirements.minimum.internet}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-green-600" />
                  Recommended Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Operating System</p>
                      <p className="text-sm text-gray-600">{systemRequirements.recommended.os}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Cpu className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Processor</p>
                      <p className="text-sm text-gray-600">{systemRequirements.recommended.processor}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Memory</p>
                      <p className="text-sm text-gray-600">{systemRequirements.recommended.memory}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Storage</p>
                      <p className="text-sm text-gray-600">{systemRequirements.recommended.storage}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Display</p>
                      <p className="text-sm text-gray-600">{systemRequirements.recommended.display}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Internet</p>
                      <p className="text-sm text-gray-600">{systemRequirements.recommended.internet}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="updates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Update History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Version {update.version}</h3>
                        <p className="text-sm text-gray-600">{update.description}</p>
                      </div>
                      <Badge variant={getStatusColor(update.status)}>
                        {update.status === 'installed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {update.status === 'available' && <Download className="w-3 h-3 mr-1" />}
                        {update.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{update.date}</span>
                        </div>
                        <div className="flex items-center">
                          <HardDrive className="w-4 h-4 mr-1" />
                          <span>{update.size}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {update.type}
                        </Badge>
                      </div>

                      {update.status === 'available' && (
                        <Button
                          size="sm"
                          onClick={() => downloadUpdate(update.version)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Install
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Info className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Update Settings</span>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  Automatic updates are enabled. QuickBooks will check for updates daily and install them automatically.
                </p>
                <Button variant="outline" size="sm">
                  Change Update Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductInfo;