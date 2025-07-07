import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Lock, FileText, AlertCircle, Shield, Eye, Database } from 'lucide-react';

const AdvancedOptions = () => {
  const [closingDate, setClosingDate] = useState({
    enabled: false,
    date: '2023-12-31',
    password: '',
    restrictTransactions: true,
    allowAccountants: true
  });

  const [auditTrail, setAuditTrail] = useState({
    enabled: true,
    trackChanges: true,
    trackVoids: true,
    trackDeletes: true,
    retentionDays: 90
  });

  const [accountantsCopy, setAccountantsCopy] = useState({
    status: 'None',
    filename: '',
    createdDate: '',
    divideDate: '',
    restrictions: false
  });

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      date: '2024-01-15',
      time: '10:30:15',
      user: 'admin',
      action: 'Modified',
      type: 'Invoice',
      reference: 'INV-001',
      description: 'Changed amount from $1,200.00 to $1,500.00'
    },
    {
      id: 2,
      date: '2024-01-15',
      time: '09:45:22',
      user: 'accountant',
      action: 'Deleted',
      type: 'Check',
      reference: 'CHK-305',
      description: 'Deleted check payment to ABC Supplies'
    },
    {
      id: 3,
      date: '2024-01-14',
      time: '16:20:33',
      user: 'admin',
      action: 'Voided',
      type: 'Payment',
      reference: 'PMT-102',
      description: 'Voided payment from customer XYZ Corp'
    },
    {
      id: 4,
      date: '2024-01-14',
      time: '14:15:18',
      user: 'bookkeeper',
      action: 'Created',
      type: 'Journal Entry',
      reference: 'JE-008',
      description: 'Created adjusting journal entry'
    }
  ]);

  const [dataIntegrity, setDataIntegrity] = useState({
    lastVerified: '2024-01-15',
    status: 'Healthy',
    issues: 0,
    autoRepair: true
  });

  const handleSetClosingDate = () => {
    if (!closingDate.date) {
      alert('Please select a closing date');
      return;
    }
    
    if (closingDate.enabled && !closingDate.password) {
      alert('Please set a password for the closing date');
      return;
    }
    
    setClosingDate({ ...closingDate, enabled: !closingDate.enabled });
    alert(closingDate.enabled ? 'Closing date removed' : 'Closing date set successfully');
  };

  const createAccountantsCopy = () => {
    const filename = prompt('Enter filename for accountant\'s copy:');
    if (filename) {
      const divideDate = prompt('Enter divide date (YYYY-MM-DD):');
      if (divideDate) {
        setAccountantsCopy({
          status: 'Created',
          filename: filename,
          createdDate: new Date().toISOString().split('T')[0],
          divideDate: divideDate,
          restrictions: true
        });
        alert('Accountant\'s copy created successfully');
      }
    }
  };

  const removeAccountantsCopy = () => {
    if (window.confirm('Are you sure you want to remove accountant\'s copy restrictions?')) {
      setAccountantsCopy({
        status: 'None',
        filename: '',
        createdDate: '',
        divideDate: '',
        restrictions: false
      });
      alert('Accountant\'s copy restrictions removed');
    }
  };

  const runDataIntegrityCheck = () => {
    // Simulate data integrity check
    alert('Running data integrity check...');
    setTimeout(() => {
      setDataIntegrity({
        lastVerified: new Date().toISOString().split('T')[0],
        status: 'Healthy',
        issues: 0,
        autoRepair: true
      });
      alert('Data integrity check completed. No issues found.');
    }, 2000);
  };

  const exportAuditTrail = () => {
    // In a real application, this would export the audit trail
    alert('Exporting audit trail...');
  };

  const clearAuditTrail = () => {
    if (window.confirm('Are you sure you want to clear the audit trail? This action cannot be undone.')) {
      setAuditLogs([]);
      alert('Audit trail cleared');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Options</h1>
          <p className="text-gray-600">Configure advanced company settings and security options</p>
        </div>
      </div>

      <Tabs defaultValue="closing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="closing">Closing Date</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="accountant">Accountant's Copy</TabsTrigger>
          <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="closing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Closing Date Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Date
                  </label>
                  <Input
                    type="date"
                    value={closingDate.date}
                    onChange={(e) => setClosingDate({...closingDate, date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={closingDate.password}
                    onChange={(e) => setClosingDate({...closingDate, password: e.target.value})}
                    placeholder="Set password for closing date"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="restrictTransactions"
                    checked={closingDate.restrictTransactions}
                    onChange={(e) => setClosingDate({
                      ...closingDate,
                      restrictTransactions: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="restrictTransactions" className="text-sm text-gray-700">
                    Restrict transactions before closing date
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowAccountants"
                    checked={closingDate.allowAccountants}
                    onChange={(e) => setClosingDate({
                      ...closingDate,
                      allowAccountants: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="allowAccountants" className="text-sm text-gray-700">
                    Allow accountants to modify transactions
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">Closing Date Status:</span>
                  <Badge variant={closingDate.enabled ? 'success' : 'secondary'} className="ml-2">
                    {closingDate.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <Button
                  onClick={handleSetClosingDate}
                  className={closingDate.enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {closingDate.enabled ? 'Remove Closing Date' : 'Set Closing Date'}
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Setting a closing date prevents users from modifying transactions before that date without a password.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Audit Trail Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retention Period (Days)
                    </label>
                    <Input
                      type="number"
                      value={auditTrail.retentionDays}
                      onChange={(e) => setAuditTrail({
                        ...auditTrail,
                        retentionDays: parseInt(e.target.value)
                      })}
                      min="30"
                      max="365"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={exportAuditTrail}
                      variant="outline"
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={clearAuditTrail}
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trackChanges"
                      checked={auditTrail.trackChanges}
                      onChange={(e) => setAuditTrail({
                        ...auditTrail,
                        trackChanges: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <label htmlFor="trackChanges" className="text-sm text-gray-700">
                      Track transaction changes
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trackVoids"
                      checked={auditTrail.trackVoids}
                      onChange={(e) => setAuditTrail({
                        ...auditTrail,
                        trackVoids: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <label htmlFor="trackVoids" className="text-sm text-gray-700">
                      Track voided transactions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trackDeletes"
                      checked={auditTrail.trackDeletes}
                      onChange={(e) => setAuditTrail({
                        ...auditTrail,
                        trackDeletes: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <label htmlFor="trackDeletes" className="text-sm text-gray-700">
                      Track deleted transactions
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Trail Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Action</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Reference</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{log.date}</td>
                          <td className="p-2">{log.time}</td>
                          <td className="p-2">{log.user}</td>
                          <td className="p-2">
                            <Badge variant={
                              log.action === 'Created' ? 'success' :
                              log.action === 'Modified' ? 'default' :
                              log.action === 'Deleted' ? 'destructive' : 'secondary'
                            }>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="p-2">{log.type}</td>
                          <td className="p-2 font-medium">{log.reference}</td>
                          <td className="p-2">{log.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accountant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Accountant's Copy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge variant={accountantsCopy.status === 'None' ? 'secondary' : 'success'}>
                    {accountantsCopy.status}
                  </Badge>
                </div>

                {accountantsCopy.filename && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filename
                    </label>
                    <span className="text-sm text-gray-900">{accountantsCopy.filename}</span>
                  </div>
                )}
              </div>

              {accountantsCopy.createdDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <span className="text-sm text-gray-900">{accountantsCopy.createdDate}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Divide Date
                    </label>
                    <span className="text-sm text-gray-900">{accountantsCopy.divideDate}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                {accountantsCopy.status === 'None' ? (
                  <Button
                    onClick={createAccountantsCopy}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Create Accountant's Copy
                  </Button>
                ) : (
                  <Button
                    onClick={removeAccountantsCopy}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Remove Restrictions
                  </Button>
                )}
              </div>

              <div className="bg-yellow-50 p-3 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Creating an accountant's copy will restrict certain operations until the copy is removed.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Data Integrity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Verified
                  </label>
                  <span className="text-sm text-gray-900">{dataIntegrity.lastVerified}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge variant={dataIntegrity.status === 'Healthy' ? 'success' : 'destructive'}>
                    {dataIntegrity.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issues Found
                  </label>
                  <span className="text-sm text-gray-900">{dataIntegrity.issues}</span>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoRepair"
                    checked={dataIntegrity.autoRepair}
                    onChange={(e) => setDataIntegrity({
                      ...dataIntegrity,
                      autoRepair: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="autoRepair" className="text-sm text-gray-700">
                    Auto-repair minor issues
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={runDataIntegrityCheck}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Run Integrity Check
                </Button>
              </div>

              <div className="bg-green-50 p-3 rounded-md">
                <div className="flex items-center">
                  <Database className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    Your company file is healthy and no issues were found.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedOptions;