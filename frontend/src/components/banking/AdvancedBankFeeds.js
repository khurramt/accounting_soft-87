import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Building2,
  TrendingUp
} from 'lucide-react';

const AdvancedBankFeeds = () => {
  const [selectedAccount, setSelectedAccount] = useState('checking-001');
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [feedMode, setFeedMode] = useState('advanced'); // 'express' or 'advanced'
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const connectedAccounts = [
    {
      id: 'checking-001',
      name: 'Business Checking',
      bank: 'First National Bank',
      accountNumber: '****1234',
      balance: 15420.50,
      lastUpdate: '2024-01-15 09:30',
      status: 'connected'
    },
    {
      id: 'savings-001',
      name: 'Business Savings',
      bank: 'First National Bank',
      accountNumber: '****5678',
      balance: 50000.00,
      lastUpdate: '2024-01-15 09:30',
      status: 'connected'
    },
    {
      id: 'credit-001',
      name: 'Business Credit Card',
      bank: 'Capital Business',
      accountNumber: '****9012',
      balance: -2450.75,
      lastUpdate: '2024-01-15 09:25',
      status: 'needs_attention'
    }
  ];

  const bankRules = [
    {
      id: 'rule-001',
      name: 'Office Supplies Auto-Categorize',
      condition: 'Description contains "Office Depot" OR "Staples"',
      action: 'Categorize as Office Supplies',
      account: 'Office Supplies',
      status: 'active',
      matches: 12
    },
    {
      id: 'rule-002',
      name: 'Recurring Rent Payment',
      condition: 'Amount equals $2,500 AND Description contains "Property Management"',
      action: 'Categorize as Rent',
      account: 'Rent Expense',
      status: 'active',
      matches: 8
    },
    {
      id: 'rule-003',
      name: 'Utilities Auto-Match',
      condition: 'Vendor equals "City Electric" OR "Water Department"',
      action: 'Categorize as Utilities',
      account: 'Utilities Expense',
      status: 'active',
      matches: 24
    }
  ];

  const recognizedTransactions = [
    {
      id: 'txn-001',
      date: '2024-01-15',
      description: 'Office Depot - Office Supplies',
      amount: -156.48,
      category: 'Office Supplies',
      confidence: 95,
      rule: 'Office Supplies Auto-Categorize',
      status: 'recognized'
    },
    {
      id: 'txn-002',
      date: '2024-01-14',
      description: 'ABC Property Management - Rent',
      amount: -2500.00,
      category: 'Rent Expense',
      confidence: 98,
      rule: 'Recurring Rent Payment',
      status: 'recognized'
    },
    {
      id: 'txn-003',
      date: '2024-01-14',
      description: 'Direct Deposit - Customer Payment',
      amount: 1850.00,
      category: 'Income',
      confidence: 90,
      rule: 'Auto-deposit Recognition',
      status: 'recognized'
    }
  ];

  const unrecognizedTransactions = [
    {
      id: 'txn-004',
      date: '2024-01-15',
      description: 'AMAZON.COM - Purchase',
      amount: -89.99,
      category: null,
      confidence: 0,
      status: 'unrecognized'
    },
    {
      id: 'txn-005',
      date: '2024-01-14',
      description: 'UNKNOWN VENDOR - Payment',
      amount: -245.00,
      category: null,
      confidence: 0,
      status: 'unrecognized'
    },
    {
      id: 'txn-006',
      date: '2024-01-13',
      description: 'MOBILE DEPOSIT',
      amount: 750.00,
      category: null,
      confidence: 0,
      status: 'unrecognized'
    }
  ];

  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on transactions:`, selectedTransactions);
    // Implement bulk action logic
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Bank Feeds</h1>
          <p className="text-gray-600">Manage your bank connections and automate transaction processing</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Connected Accounts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {connectedAccounts.map((account) => (
          <Card 
            key={account.id}
            className={`cursor-pointer transition-all ${
              selectedAccount === account.id ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setSelectedAccount(account.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                </div>
                <Badge variant={account.status === 'connected' ? 'default' : 'destructive'}>
                  {account.status === 'connected' ? 'Connected' : 'Attention'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bank:</span>
                  <span className="text-sm font-medium">{account.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account:</span>
                  <span className="text-sm font-medium">{account.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Balance:</span>
                  <span className={`text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(account.balance).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Update:</span>
                  <span className="text-sm">{account.lastUpdate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm font-medium">Processing Mode:</span>
        <div className="flex space-x-2">
          <Button 
            variant={feedMode === 'express' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFeedMode('express')}
          >
            Express Mode
          </Button>
          <Button 
            variant={feedMode === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFeedMode('advanced')}
          >
            Advanced Mode
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transaction Review</TabsTrigger>
          <TabsTrigger value="rules">Bank Rules</TabsTrigger>
          <TabsTrigger value="settings">Feed Settings</TabsTrigger>
        </TabsList>

        {/* Transaction Review Tab */}
        <TabsContent value="transactions">
          <div className="space-y-4">
            {/* Transaction Controls */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Transaction Processing</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={selectedTransactions.length === 0}
                      onClick={() => handleBulkAction('accept')}
                    >
                      Accept Selected ({selectedTransactions.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={selectedTransactions.length === 0}
                      onClick={() => handleBulkAction('ignore')}
                    >
                      Ignore Selected
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recognized" className="w-full">
                  <TabsList>
                    <TabsTrigger value="recognized">
                      Recognized ({recognizedTransactions.length})
                    </TabsTrigger>
                    <TabsTrigger value="unrecognized">
                      Unrecognized ({unrecognizedTransactions.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="recognized">
                    <div className="space-y-2">
                      {recognizedTransactions.map((txn) => (
                        <div key={txn.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(txn.id)}
                            onChange={() => handleTransactionSelect(txn.id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1 grid grid-cols-5 gap-4">
                            <div>
                              <div className="font-medium">{txn.date}</div>
                              <div className="text-sm text-gray-600">{txn.description}</div>
                            </div>
                            <div className={`font-medium ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${Math.abs(txn.amount).toLocaleString()}
                            </div>
                            <div>
                              <Badge variant="outline">{txn.category}</Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{txn.confidence}% confidence</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="unrecognized">
                    <div className="space-y-2">
                      {unrecognizedTransactions.map((txn) => (
                        <div key={txn.id} className="flex items-center space-x-4 p-3 border rounded-lg bg-yellow-50">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(txn.id)}
                            onChange={() => handleTransactionSelect(txn.id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1 grid grid-cols-5 gap-4">
                            <div>
                              <div className="font-medium">{txn.date}</div>
                              <div className="text-sm text-gray-600">{txn.description}</div>
                            </div>
                            <div className={`font-medium ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${Math.abs(txn.amount).toLocaleString()}
                            </div>
                            <div>
                              <select className="text-sm border rounded px-2 py-1">
                                <option value="">Select Category</option>
                                <option value="office">Office Supplies</option>
                                <option value="rent">Rent</option>
                                <option value="utilities">Utilities</option>
                                <option value="income">Income</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-1">
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">Needs Review</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bank Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Bank Rules Management</CardTitle>
                <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Bank Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rule Name</label>
                        <Input placeholder="Enter rule name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Conditions</label>
                        <div className="space-y-2">
                          <select className="w-full border rounded px-3 py-2">
                            <option value="">Select condition type</option>
                            <option value="description">Description contains</option>
                            <option value="amount">Amount equals</option>
                            <option value="vendor">Vendor equals</option>
                          </select>
                          <Input placeholder="Enter condition value" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Action</label>
                        <select className="w-full border rounded px-3 py-2">
                          <option value="">Select action</option>
                          <option value="categorize">Categorize as</option>
                          <option value="match">Match to existing</option>
                          <option value="ignore">Ignore</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Account</label>
                        <select className="w-full border rounded px-3 py-2">
                          <option value="">Select account</option>
                          <option value="office">Office Supplies</option>
                          <option value="rent">Rent Expense</option>
                          <option value="utilities">Utilities</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setShowRuleDialog(false)}>
                          Create Rule
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                          {rule.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rule.condition}</p>
                      <p className="text-sm text-gray-600">{rule.action}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm">Account: {rule.account}</span>
                        <span className="text-sm">Matches: {rule.matches}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feed Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Processing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable auto-categorization</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-accept high confidence matches</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-create rules from patterns</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confidence threshold</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="85"
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">85%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email notifications for new transactions</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Notify on rule creation opportunities</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Daily transaction summary</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email address</label>
                  <Input 
                    type="email" 
                    placeholder="notifications@company.com"
                    defaultValue="admin@company.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedBankFeeds;