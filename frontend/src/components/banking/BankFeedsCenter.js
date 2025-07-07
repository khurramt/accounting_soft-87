import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { 
  Plus, 
  Link, 
  Check, 
  X, 
  RefreshCw,
  CreditCard,
  AlertCircle,
  Download,
  Filter,
  ChevronDown,
  Eye,
  FileText,
  Settings,
  Bell,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  Shield
} from "lucide-react";

const BankFeedsCenter = () => {
  const [activeTab, setActiveTab] = useState("recognized");
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);

  const [connectedAccounts] = useState([
    {
      id: "1",
      bankName: "Chase Bank",
      accountName: "Business Checking",
      accountNumber: "****1234",
      balance: 25000.00,
      lastUpdate: "2024-01-15 10:30 AM",
      status: "Connected",
      pendingTransactions: 5,
      newTransactions: 3
    },
    {
      id: "2",
      bankName: "Wells Fargo", 
      accountName: "Business Savings",
      accountNumber: "****5678",
      balance: 15000.00,
      lastUpdate: "2024-01-15 09:15 AM", 
      status: "Connected",
      pendingTransactions: 2,
      newTransactions: 1
    },
    {
      id: "3",
      bankName: "American Express",
      accountName: "Business Credit Card",
      accountNumber: "****9012",
      balance: -2500.00,
      lastUpdate: "2024-01-15 08:45 AM",
      status: "Needs Attention",
      pendingTransactions: 8,
      newTransactions: 6
    }
  ]);

  const [recognizedTransactions] = useState([
    {
      id: "1",
      date: "2024-01-15",
      description: "ACH DEPOSIT CUSTOMER PAYMENT",
      amount: 1500.00,
      type: "Deposit",
      status: "Recognized",
      suggestedMatch: "Invoice INV-001 - ABC Company",
      confidence: "High",
      account: "Business Checking"
    },
    {
      id: "2", 
      date: "2024-01-14",
      description: "PAYMENT TO OFFICE DEPOT",
      amount: -245.50,
      type: "Payment",
      status: "Recognized",
      suggestedMatch: "Office Supplies Expense",
      confidence: "Medium",
      account: "Business Checking"
    },
    {
      id: "3",
      date: "2024-01-14",
      description: "PAYROLL DEPOSIT",
      amount: -3200.00,
      type: "Payment", 
      status: "Recognized",
      suggestedMatch: "Payroll Expenses",
      confidence: "High",
      account: "Business Checking"
    }
  ]);

  const [unrecognizedTransactions] = useState([
    {
      id: "4",
      date: "2024-01-13",
      description: "CHECK 1234",
      amount: -500.00,
      type: "Check",
      status: "Unrecognized",
      account: "Business Checking"
    },
    {
      id: "5",
      date: "2024-01-12",
      description: "WIRE TRANSFER",
      amount: 5000.00,
      type: "Wire",
      status: "Unrecognized", 
      account: "Business Checking"
    },
    {
      id: "6",
      date: "2024-01-12",
      description: "MONTHLY SERVICE FEE",
      amount: -25.00,
      type: "Fee",
      status: "Unrecognized",
      account: "Business Checking"
    }
  ]);

  const [bankingRules] = useState([
    {
      id: "1",
      name: "Office Depot Purchases",
      condition: "Description contains 'OFFICE DEPOT'",
      action: "Categorize as Office Supplies",
      account: "Office Supplies Expense",
      autoApply: true,
      timesUsed: 23
    },
    {
      id: "2", 
      name: "Customer Payments",
      condition: "Description contains 'ACH DEPOSIT CUSTOMER'",
      action: "Match to open invoices",
      account: "Accounts Receivable",
      autoApply: true,
      timesUsed: 156
    },
    {
      id: "3",
      name: "Payroll Transactions",
      condition: "Description contains 'PAYROLL'",
      action: "Categorize as Payroll Expense",
      account: "Payroll Expenses",
      autoApply: true,
      timesUsed: 52
    }
  ]);

  const handleTransactionAction = (transactionId, action) => {
    console.log(`${action} transaction ${transactionId}`);
  };

  const handleBulkAction = (action) => {
    console.log(`${action} selected transactions:`, selectedTransactions);
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Connected: { variant: "default", color: "bg-green-100 text-green-800" },
      "Needs Attention": { variant: "destructive", color: "bg-red-100 text-red-800" },
      Connecting: { variant: "secondary", color: "bg-yellow-100 text-yellow-800" }
    };
    return statusConfig[status] || { variant: "secondary", color: "bg-gray-100 text-gray-800" };
  };

  const getConfidenceBadge = (confidence) => {
    const colors = {
      High: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800", 
      Low: "bg-red-100 text-red-800"
    };
    return colors[confidence] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Feeds Center</h1>
          <p className="text-gray-600 mt-1">Connect and manage your bank accounts for automatic transaction import</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Connect Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Connect Bank Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search for your bank</label>
                  <Input placeholder="Enter bank name..." />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Popular banks:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {["Chase", "Wells Fargo", "Bank of America", "Citibank", "Capital One"].map(bank => (
                      <Button key={bank} variant="outline" className="justify-start">
                        <Building className="w-4 h-4 mr-2" />
                        {bank}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsConnectDialogOpen(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button className="flex-1">Continue</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Connected Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedAccounts.map(account => (
              <Card key={account.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{account.accountName}</h4>
                      <p className="text-sm text-gray-600">{account.bankName}</p>
                      <p className="text-xs text-gray-500">{account.accountNumber}</p>
                    </div>
                    <Badge className={getStatusBadge(account.status).color}>
                      {account.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Balance:</span>
                      <span className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(account.balance).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New:</span>
                      <Badge variant="secondary">{account.newTransactions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending:</span>
                      <Badge variant="outline">{account.pendingTransactions}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {account.lastUpdate}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Review */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transaction Review</CardTitle>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <Input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <Input 
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recognized">
                Recognized ({recognizedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="unrecognized">
                Unrecognized ({unrecognizedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="rules">
                Rules ({bankingRules.length})
              </TabsTrigger>
            </TabsList>

            {/* Recognized Transactions */}
            <TabsContent value="recognized" className="space-y-4">
              {selectedTransactions.length > 0 && (
                <div className="flex gap-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">{selectedTransactions.length} selected</span>
                  <Button size="sm" onClick={() => handleBulkAction('add')}>
                    Add Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('ignore')}>
                    Ignore Selected
                  </Button>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransactions(recognizedTransactions.map(t => t.id));
                          } else {
                            setSelectedTransactions([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Suggested Match</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recognizedTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <input 
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => handleSelectTransaction(transaction.id)}
                        />
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.account}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{transaction.suggestedMatch}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getConfidenceBadge(transaction.confidence)}>
                          {transaction.confidence}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleTransactionAction(transaction.id, 'add')}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTransactionAction(transaction.id, 'edit')}
                          >
                            <FileText className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTransactionAction(transaction.id, 'ignore')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Unrecognized Transactions */}
            <TabsContent value="unrecognized" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unrecognizedTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.account}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm"
                            onClick={() => handleTransactionAction(transaction.id, 'categorize')}
                          >
                            Add Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTransactionAction(transaction.id, 'match')}
                          >
                            Find Match
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTransactionAction(transaction.id, 'ignore')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Banking Rules */}
            <TabsContent value="rules" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Banking Rules</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Times Used</TableHead>
                    <TableHead>Auto Apply</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankingRules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell className="text-sm">{rule.condition}</TableCell>
                      <TableCell className="text-sm">{rule.action}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rule.timesUsed}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={rule.autoApply ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {rule.autoApply ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Settings and Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Bank Feeds Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Auto-Processing</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Auto-apply banking rules</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Auto-match invoice payments</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Auto-add recognized transactions</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">New transactions available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Connection issues</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Weekly summary</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankFeedsCenter;