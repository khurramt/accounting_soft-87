import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

const CompanyPreferences = () => {
  const [preferences, setPreferences] = useState({
    accounting: {
      fiscalYear: 'January',
      taxBasis: 'Accrual',
      enableClosingDate: false,
      closingDate: '',
      requirePassword: false
    },
    general: {
      companyName: 'Demo Company',
      autoBackup: true,
      backupFrequency: 'Daily',
      soundEffects: true,
      showTips: true,
      decimalPlaces: 2
    },
    salesCustomers: {
      defaultTerms: 'Net 30',
      defaultShipping: 'FOB',
      enableEstimates: true,
      enableProgressInvoicing: false,
      defaultTaxRate: 8.25,
      trackReimbursable: true
    },
    reports: {
      defaultBasis: 'Accrual',
      showCents: true,
      negativeNumbers: 'Parentheses',
      refreshData: 'Automatically',
      reportFormat: 'Portrait',
      headerFooter: true
    },
    payroll: {
      enablePayroll: true,
      payPeriod: 'Bi-weekly',
      trackSickVacation: true,
      enableDirectDeposit: false,
      payrollSchedule: 'Every other Friday',
      taxTracking: 'Quarterly'
    },
    inventory: {
      enableInventory: true,
      trackQuantity: true,
      trackCost: true,
      enableAssemblies: false,
      lowStockWarning: true,
      reorderPoint: 10
    }
  });

  const [activeTab, setActiveTab] = useState('accounting');

  const handlePreferenceChange = (section, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const savePreferences = () => {
    // In a real app, this would save to backend
    console.log('Saving preferences:', preferences);
    alert('Preferences saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Preferences</h1>
          <p className="text-gray-600">Configure company-wide settings and preferences</p>
        </div>
        <Button onClick={savePreferences} className="bg-blue-600 hover:bg-blue-700">
          Save All Preferences
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="accounting">
          <Card>
            <CardHeader>
              <CardTitle>Accounting Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiscal Year Start
                  </label>
                  <select 
                    value={preferences.accounting.fiscalYear}
                    onChange={(e) => handlePreferenceChange('accounting', 'fiscalYear', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Basis
                  </label>
                  <select 
                    value={preferences.accounting.taxBasis}
                    onChange={(e) => handlePreferenceChange('accounting', 'taxBasis', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Accrual">Accrual</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableClosingDate"
                    checked={preferences.accounting.enableClosingDate}
                    onChange={(e) => handlePreferenceChange('accounting', 'enableClosingDate', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enableClosingDate" className="text-sm text-gray-700">
                    Enable Closing Date
                  </label>
                </div>

                {preferences.accounting.enableClosingDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Date
                    </label>
                    <Input
                      type="date"
                      value={preferences.accounting.closingDate}
                      onChange={(e) => handlePreferenceChange('accounting', 'closingDate', e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requirePassword"
                    checked={preferences.accounting.requirePassword}
                    onChange={(e) => handlePreferenceChange('accounting', 'requirePassword', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="requirePassword" className="text-sm text-gray-700">
                    Require Password for Transactions Before Closing Date
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <Input
                  value={preferences.general.companyName}
                  onChange={(e) => handlePreferenceChange('general', 'companyName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select 
                    value={preferences.general.backupFrequency}
                    onChange={(e) => handlePreferenceChange('general', 'backupFrequency', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Never">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decimal Places
                  </label>
                  <select 
                    value={preferences.general.decimalPlaces}
                    onChange={(e) => handlePreferenceChange('general', 'decimalPlaces', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoBackup"
                    checked={preferences.general.autoBackup}
                    onChange={(e) => handlePreferenceChange('general', 'autoBackup', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="autoBackup" className="text-sm text-gray-700">
                    Enable Automatic Backup
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="soundEffects"
                    checked={preferences.general.soundEffects}
                    onChange={(e) => handlePreferenceChange('general', 'soundEffects', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="soundEffects" className="text-sm text-gray-700">
                    Enable Sound Effects
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showTips"
                    checked={preferences.general.showTips}
                    onChange={(e) => handlePreferenceChange('general', 'showTips', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="showTips" className="text-sm text-gray-700">
                    Show Tips of the Day
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales & Customers Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Terms
                  </label>
                  <select 
                    value={preferences.salesCustomers.defaultTerms}
                    onChange={(e) => handlePreferenceChange('salesCustomers', 'defaultTerms', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Shipping Method
                  </label>
                  <Input
                    value={preferences.salesCustomers.defaultShipping}
                    onChange={(e) => handlePreferenceChange('salesCustomers', 'defaultShipping', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Tax Rate (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={preferences.salesCustomers.defaultTaxRate}
                  onChange={(e) => handlePreferenceChange('salesCustomers', 'defaultTaxRate', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableEstimates"
                    checked={preferences.salesCustomers.enableEstimates}
                    onChange={(e) => handlePreferenceChange('salesCustomers', 'enableEstimates', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enableEstimates" className="text-sm text-gray-700">
                    Enable Estimates
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableProgressInvoicing"
                    checked={preferences.salesCustomers.enableProgressInvoicing}
                    onChange={(e) => handlePreferenceChange('salesCustomers', 'enableProgressInvoicing', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enableProgressInvoicing" className="text-sm text-gray-700">
                    Enable Progress Invoicing
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackReimbursable"
                    checked={preferences.salesCustomers.trackReimbursable}
                    onChange={(e) => handlePreferenceChange('salesCustomers', 'trackReimbursable', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="trackReimbursable" className="text-sm text-gray-700">
                    Track Reimbursable Expenses
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Graphs Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Basis
                  </label>
                  <select 
                    value={preferences.reports.defaultBasis}
                    onChange={(e) => handlePreferenceChange('reports', 'defaultBasis', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Accrual">Accrual</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negative Numbers
                  </label>
                  <select 
                    value={preferences.reports.negativeNumbers}
                    onChange={(e) => handlePreferenceChange('reports', 'negativeNumbers', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Parentheses">Parentheses</option>
                    <option value="Minus Sign">Minus Sign</option>
                    <option value="Red">Red</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Format
                  </label>
                  <select 
                    value={preferences.reports.reportFormat}
                    onChange={(e) => handlePreferenceChange('reports', 'reportFormat', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refresh Data
                  </label>
                  <select 
                    value={preferences.reports.refreshData}
                    onChange={(e) => handlePreferenceChange('reports', 'refreshData', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Automatically">Automatically</option>
                    <option value="When Requested">When Requested</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showCents"
                    checked={preferences.reports.showCents}
                    onChange={(e) => handlePreferenceChange('reports', 'showCents', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="showCents" className="text-sm text-gray-700">
                    Show Cents in Reports
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="headerFooter"
                    checked={preferences.reports.headerFooter}
                    onChange={(e) => handlePreferenceChange('reports', 'headerFooter', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="headerFooter" className="text-sm text-gray-700">
                    Show Header and Footer
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Pay Period
                  </label>
                  <select 
                    value={preferences.payroll.payPeriod}
                    onChange={(e) => handlePreferenceChange('payroll', 'payPeriod', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Semi-monthly">Semi-monthly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Tracking
                  </label>
                  <select 
                    value={preferences.payroll.taxTracking}
                    onChange={(e) => handlePreferenceChange('payroll', 'taxTracking', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payroll Schedule
                </label>
                <Input
                  value={preferences.payroll.payrollSchedule}
                  onChange={(e) => handlePreferenceChange('payroll', 'payrollSchedule', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enablePayroll"
                    checked={preferences.payroll.enablePayroll}
                    onChange={(e) => handlePreferenceChange('payroll', 'enablePayroll', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enablePayroll" className="text-sm text-gray-700">
                    Enable Payroll Features
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackSickVacation"
                    checked={preferences.payroll.trackSickVacation}
                    onChange={(e) => handlePreferenceChange('payroll', 'trackSickVacation', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="trackSickVacation" className="text-sm text-gray-700">
                    Track Sick/Vacation Time
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableDirectDeposit"
                    checked={preferences.payroll.enableDirectDeposit}
                    onChange={(e) => handlePreferenceChange('payroll', 'enableDirectDeposit', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enableDirectDeposit" className="text-sm text-gray-700">
                    Enable Direct Deposit
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Reorder Point
                </label>
                <Input
                  type="number"
                  value={preferences.inventory.reorderPoint}
                  onChange={(e) => handlePreferenceChange('inventory', 'reorderPoint', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableInventory"
                    checked={preferences.inventory.enableInventory}
                    onChange={(e) => handlePreferenceChange('inventory', 'enableInventory', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enableInventory" className="text-sm text-gray-700">
                    Enable Inventory Features
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackQuantity"
                    checked={preferences.inventory.trackQuantity}
                    onChange={(e) => handlePreferenceChange('inventory', 'trackQuantity', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="trackQuantity" className="text-sm text-gray-700">
                    Track Quantity on Hand
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackCost"
                    checked={preferences.inventory.trackCost}
                    onChange={(e) => handlePreferenceChange('inventory', 'trackCost', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="trackCost" className="text-sm text-gray-700">
                    Track Cost of Goods Sold
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableAssemblies"
                    checked={preferences.inventory.enableAssemblies}
                    onChange={(e) => handlePreferenceChange('inventory', 'enableAssemblies', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="enableAssemblies" className="text-sm text-gray-700">
                    Enable Inventory Assemblies
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lowStockWarning"
                    checked={preferences.inventory.lowStockWarning}
                    onChange={(e) => handlePreferenceChange('inventory', 'lowStockWarning', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="lowStockWarning" className="text-sm text-gray-700">
                    Show Low Stock Warnings
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPreferences;