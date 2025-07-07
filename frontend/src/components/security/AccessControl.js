import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Shield, Lock, Users, Activity, Settings, AlertTriangle, Check, X } from 'lucide-react';

const AccessControl = () => {
  const [accessLevels, setAccessLevels] = useState([
    {
      id: 1,
      name: 'Full Access',
      description: 'Complete access to all areas of QuickBooks',
      areas: ['All'],
      restrictions: [],
      userCount: 2,
      color: 'green'
    },
    {
      id: 2,
      name: 'Accounting Only',
      description: 'Access to accounting features only',
      areas: ['Chart of Accounts', 'Journal Entries', 'Banking', 'Reports'],
      restrictions: ['Sales', 'Purchases', 'Payroll'],
      userCount: 3,
      color: 'blue'
    },
    {
      id: 3,
      name: 'Sales & Customers',
      description: 'Access to customer and sales functions',
      areas: ['Customers', 'Invoices', 'Sales Receipts', 'Deposits'],
      restrictions: ['Banking', 'Payroll', 'Company Settings'],
      userCount: 2,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Vendors & Purchases',
      description: 'Access to vendor and purchase functions',
      areas: ['Vendors', 'Bills', 'Purchase Orders', 'Checks'],
      restrictions: ['Customers', 'Payroll', 'Banking'],
      userCount: 1,
      color: 'orange'
    }
  ]);

  const [permissions, setPermissions] = useState({
    dashboard: { view: true, edit: false, delete: false },
    customers: { view: true, edit: true, delete: false },
    vendors: { view: true, edit: true, delete: false },
    banking: { view: false, edit: false, delete: false },
    reports: { view: true, edit: false, delete: false },
    payroll: { view: false, edit: false, delete: false },
    inventory: { view: true, edit: false, delete: false },
    settings: { view: false, edit: false, delete: false }
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90,
      preventReuse: 3
    },
    sessionSettings: {
      sessionTimeout: 120,
      maxSessions: 3,
      requireReauth: false,
      logoutOnClose: true
    },
    loginSecurity: {
      maxAttempts: 5,
      lockoutDuration: 30,
      twoFactorRequired: false,
      ipRestriction: false,
      allowedIPs: []
    }
  });

  const [auditSettings, setAuditSettings] = useState({
    trackLogins: true,
    trackTransactions: true,
    trackReports: false,
    trackSettings: true,
    retentionDays: 90,
    alertThreshold: 10
  });

  const availableAreas = [
    'Dashboard', 'Customers', 'Vendors', 'Banking', 'Reports', 
    'Payroll', 'Inventory', 'Items & Services', 'Chart of Accounts',
    'Journal Entries', 'Company Settings', 'User Management'
  ];

  const handlePermissionChange = (area, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [area]: {
        ...prev[area],
        [permission]: value
      }
    }));
  };

  const handleSecuritySettingChange = (category, setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const saveAccessSettings = () => {
    // In a real application, this would save to backend
    alert('Access control settings saved successfully!');
  };

  const testPermission = (area, permission) => {
    const hasPermission = permissions[area] && permissions[area][permission];
    alert(`Permission Test: ${area} - ${permission} = ${hasPermission ? 'ALLOWED' : 'DENIED'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
          <p className="text-gray-600">Manage user permissions and security settings</p>
        </div>
        <Button onClick={saveAccessSettings} className="bg-blue-600 hover:bg-blue-700">
          <Shield className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="levels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="levels">Access Levels</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="levels">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Access Levels Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accessLevels.map(level => (
                    <div key={level.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{level.name}</h3>
                        <Badge variant="outline" className={`text-${level.color}-600`}>
                          {level.userCount} users
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-green-600">ALLOWED AREAS:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {level.areas.map(area => (
                              <Badge key={area} variant="success" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {level.restrictions.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-red-600">RESTRICTED:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {level.restrictions.map(restriction => (
                                <Badge key={restriction} variant="destructive" className="text-xs">
                                  {restriction}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Custom Access Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Access Level Name" />
                    <Input placeholder="Description" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Allowed Areas
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableAreas.map(area => (
                        <div key={area} className="flex items-center">
                          <input type="checkbox" id={area} className="mr-2" />
                          <label htmlFor={area} className="text-sm text-gray-700">
                            {area}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="bg-green-600 hover:bg-green-700">
                    Create Access Level
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Detailed Permissions Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Area</th>
                      <th className="text-center p-3">View</th>
                      <th className="text-center p-3">Edit</th>
                      <th className="text-center p-3">Delete</th>
                      <th className="text-center p-3">Test</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(permissions).map(([area, perms]) => (
                      <tr key={area} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium capitalize">{area.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perms.view}
                            onChange={(e) => handlePermissionChange(area, 'view', e.target.checked)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perms.edit}
                            onChange={(e) => handlePermissionChange(area, 'edit', e.target.checked)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={perms.delete}
                            onChange={(e) => handlePermissionChange(area, 'delete', e.target.checked)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testPermission(area, 'view')}
                            className="text-xs"
                          >
                            Test
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Shield className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">Permission Legend</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                  <div><strong>View:</strong> Can see the area and its data</div>
                  <div><strong>Edit:</strong> Can modify existing records</div>
                  <div><strong>Delete:</strong> Can remove records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Password Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Length
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.passwordPolicy.minLength}
                      onChange={(e) => handleSecuritySettingChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                      min="6"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Expiry (Days)
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.passwordPolicy.passwordExpiry}
                      onChange={(e) => handleSecuritySettingChange('passwordPolicy', 'passwordExpiry', parseInt(e.target.value))}
                      min="30"
                      max="365"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireUppercase"
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onChange={(e) => handleSecuritySettingChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="requireUppercase" className="text-sm text-gray-700">
                      Require uppercase letters
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireLowercase"
                      checked={securitySettings.passwordPolicy.requireLowercase}
                      onChange={(e) => handleSecuritySettingChange('passwordPolicy', 'requireLowercase', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="requireLowercase" className="text-sm text-gray-700">
                      Require lowercase letters
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireNumbers"
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onChange={(e) => handleSecuritySettingChange('passwordPolicy', 'requireNumbers', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="requireNumbers" className="text-sm text-gray-700">
                      Require numbers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireSpecialChars"
                      checked={securitySettings.passwordPolicy.requireSpecialChars}
                      onChange={(e) => handleSecuritySettingChange('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="requireSpecialChars" className="text-sm text-gray-700">
                      Require special characters
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Session Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (Minutes)
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.sessionSettings.sessionTimeout}
                      onChange={(e) => handleSecuritySettingChange('sessionSettings', 'sessionTimeout', parseInt(e.target.value))}
                      min="15"
                      max="480"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Concurrent Sessions
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.sessionSettings.maxSessions}
                      onChange={(e) => handleSecuritySettingChange('sessionSettings', 'maxSessions', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireReauth"
                      checked={securitySettings.sessionSettings.requireReauth}
                      onChange={(e) => handleSecuritySettingChange('sessionSettings', 'requireReauth', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="requireReauth" className="text-sm text-gray-700">
                      Require re-authentication for sensitive operations
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="logoutOnClose"
                      checked={securitySettings.sessionSettings.logoutOnClose}
                      onChange={(e) => handleSecuritySettingChange('sessionSettings', 'logoutOnClose', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="logoutOnClose" className="text-sm text-gray-700">
                      Auto-logout when browser closes
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Login Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Login Attempts
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.loginSecurity.maxAttempts}
                      onChange={(e) => handleSecuritySettingChange('loginSecurity', 'maxAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lockout Duration (Minutes)
                    </label>
                    <Input
                      type="number"
                      value={securitySettings.loginSecurity.lockoutDuration}
                      onChange={(e) => handleSecuritySettingChange('loginSecurity', 'lockoutDuration', parseInt(e.target.value))}
                      min="5"
                      max="120"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorRequired"
                      checked={securitySettings.loginSecurity.twoFactorRequired}
                      onChange={(e) => handleSecuritySettingChange('loginSecurity', 'twoFactorRequired', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="twoFactorRequired" className="text-sm text-gray-700">
                      Require two-factor authentication for all users
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ipRestriction"
                      checked={securitySettings.loginSecurity.ipRestriction}
                      onChange={(e) => handleSecuritySettingChange('loginSecurity', 'ipRestriction', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="ipRestriction" className="text-sm text-gray-700">
                      Restrict access by IP address
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Audit Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Period (Days)
                  </label>
                  <Input
                    type="number"
                    value={auditSettings.retentionDays}
                    onChange={(e) => setAuditSettings({...auditSettings, retentionDays: parseInt(e.target.value)})}
                    min="30"
                    max="365"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold (Events/Hour)
                  </label>
                  <Input
                    type="number"
                    value={auditSettings.alertThreshold}
                    onChange={(e) => setAuditSettings({...auditSettings, alertThreshold: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackLogins"
                    checked={auditSettings.trackLogins}
                    onChange={(e) => setAuditSettings({...auditSettings, trackLogins: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="trackLogins" className="text-sm text-gray-700">
                    Track user logins and logouts
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackTransactions"
                    checked={auditSettings.trackTransactions}
                    onChange={(e) => setAuditSettings({...auditSettings, trackTransactions: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="trackTransactions" className="text-sm text-gray-700">
                    Track transaction changes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackReports"
                    checked={auditSettings.trackReports}
                    onChange={(e) => setAuditSettings({...auditSettings, trackReports: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="trackReports" className="text-sm text-gray-700">
                    Track report generation
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackSettings"
                    checked={auditSettings.trackSettings}
                    onChange={(e) => setAuditSettings({...auditSettings, trackSettings: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="trackSettings" className="text-sm text-gray-700">
                    Track settings changes
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span>Audit logging: Active</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span>Retention policy: Enforced</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span>Storage usage: 67%</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span>Alerts: Configured</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessControl;