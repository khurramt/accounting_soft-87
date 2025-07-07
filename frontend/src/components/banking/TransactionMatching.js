import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  Search, 
  Check, 
  X, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Filter,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  BarChart3
} from "lucide-react";

const TransactionMatching = () => {
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [matchingMode, setMatchingMode] = useState("manual"); // manual, auto, rules
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Sample bank transactions
  const [bankTransactions] = useState([
    {
      id: "BT-001",
      date: "2024-01-15",
      description: "ACH DEPOSIT CUSTOMER PAYMENT JOHN DOE",
      amount: 1500.00,
      type: "Deposit",
      status: "Unmatched",
      confidence: 0,
      bankReference: "ACH20240115001",
      suggestedMatches: []
    },
    {
      id: "BT-002",
      date: "2024-01-14",
      description: "CHECK #1001 OFFICE DEPOT SUPPLIES",
      amount: -350.00,
      type: "Check",
      status: "Partially Matched",
      confidence: 85,
      bankReference: "CHK1001",
      suggestedMatches: [
        { id: "INV-2001", type: "Bill", description: "Office Depot - Office Supplies", amount: 350.00, confidence: 85 }
      ]
    },
    {
      id: "BT-003",
      date: "2024-01-14",
      description: "DEBIT CARD PURCHASE SHELL GAS STATION",
      amount: -75.00,
      type: "Debit",
      status: "Auto-Matched",
      confidence: 95,
      bankReference: "DEBIT20240114001",
      suggestedMatches: [
        { id: "EXP-3001", type: "Expense", description: "Fuel Expense", amount: 75.00, confidence: 95 }
      ]
    },
    {
      id: "BT-004",
      date: "2024-01-13",
      description: "WIRE TRANSFER ABC COMPANY INVOICE PAYMENT",
      amount: 2500.00,
      type: "Wire",
      status: "Review Required",
      confidence: 70,
      bankReference: "WIRE20240113001",
      suggestedMatches: [
        { id: "INV-1002", type: "Invoice", description: "ABC Company - Consulting Services", amount: 2500.00, confidence: 70 },
        { id: "INV-1003", type: "Invoice", description: "ABC Company - Software License", amount: 2400.00, confidence: 65 }
      ]
    },
    {
      id: "BT-005",
      date: "2024-01-12",
      description: "AUTOMATIC PAYMENT UTILITIES ELECTRIC",
      amount: -285.00,
      type: "Auto Payment",
      status: "Unmatched",
      confidence: 0,
      bankReference: "AUTOPAY20240112001",
      suggestedMatches: []
    }
  ]);

  // Sample QuickBooks transactions for matching
  const [qbTransactions] = useState([
    { id: "INV-1001", type: "Invoice", customer: "John Doe", description: "Consulting Services", amount: 1500.00, date: "2024-01-10", status: "Unpaid" },
    { id: "INV-1002", type: "Invoice", customer: "ABC Company", description: "Consulting Services", amount: 2500.00, date: "2024-01-08", status: "Unpaid" },
    { id: "INV-1003", type: "Invoice", customer: "ABC Company", description: "Software License", amount: 2400.00, date: "2024-01-09", status: "Unpaid" },
    { id: "BILL-2001", type: "Bill", vendor: "Office Depot", description: "Office Supplies", amount: 350.00, date: "2024-01-12", status: "Unpaid" },
    { id: "EXP-3001", type: "Expense", account: "Fuel Expense", description: "Vehicle Fuel", amount: 75.00, date: "2024-01-14", status: "Unrecorded" }
  ]);

  // Matching rules
  const [matchingRules] = useState([
    {
      id: "RULE-001",
      name: "Invoice Payment Pattern",
      description: "Match wire transfers with unpaid invoices",
      conditions: [
        { field: "description", operator: "contains", value: "wire transfer" },
        { field: "amount", operator: "equals", value: "invoice_amount" }
      ],
      action: "auto_match",
      confidence: 90,
      isActive: true
    },
    {
      id: "RULE-002", 
      name: "Fuel Expense Auto-Match",
      description: "Automatically categorize fuel purchases",
      conditions: [
        { field: "description", operator: "contains", value: "gas|fuel|shell|bp|exxon" },
        { field: "type", operator: "equals", value: "debit" }
      ],
      action: "categorize",
      account: "Vehicle Expenses",
      confidence: 95,
      isActive: true
    },
    {
      id: "RULE-003",
      name: "Utility Payment Pattern",
      description: "Match recurring utility payments",
      conditions: [
        { field: "description", operator: "contains", value: "utilities|electric|gas|water" },
        { field: "type", operator: "equals", value: "auto payment" }
      ],
      action: "categorize",
      account: "Utilities Expense",
      confidence: 85,
      isActive: true
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Auto-Matched': return 'bg-green-100 text-green-800';
      case 'Partially Matched': return 'bg-yellow-100 text-yellow-800';
      case 'Review Required': return 'bg-orange-100 text-orange-800';
      case 'Unmatched': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    if (confidence >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleMatchTransaction = (bankTransaction, qbTransaction) => {
    console.log("Matching:", bankTransaction.id, "with", qbTransaction.id);
    setShowMatchDialog(false);
  };

  const handleBulkMatch = () => {
    console.log("Bulk matching transactions:", selectedTransactions);
  };

  const handleCreateRule = () => {
    console.log("Creating new matching rule");
  };

  const filteredTransactions = bankTransactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Matching</h1>
          <p className="text-gray-600">Match bank transactions with QuickBooks entries</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={matchingMode} onValueChange={setMatchingMode}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Matching</SelectItem>
              <SelectItem value="auto">Auto Matching</SelectItem>
              <SelectItem value="rules">Rules Based</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleCreateRule}>
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
          <Button onClick={handleBulkMatch} disabled={selectedTransactions.length === 0}>
            <Zap className="w-4 h-4 mr-2" />
            Bulk Match ({selectedTransactions.length})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              In current batch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Matched</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bankTransactions.filter(t => t.status === 'Auto-Matched').length}
            </div>
            <p className="text-xs text-muted-foreground">
              High confidence matches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Review</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bankTransactions.filter(t => t.status === 'Review Required' || t.status === 'Partially Matched').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require manual review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unmatched</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bankTransactions.filter(t => t.status === 'Unmatched').length}
            </div>
            <p className="text-xs text-muted-foreground">
              No matches found
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search transactions by description or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Accounts</SelectItem>
                <SelectItem value="checking">Business Checking</SelectItem>
                <SelectItem value="savings">Business Savings</SelectItem>
                <SelectItem value="credit">Business Credit Card</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Bank Transactions</TabsTrigger>
          <TabsTrigger value="matches">Suggested Matches</TabsTrigger>
          <TabsTrigger value="rules">Matching Rules</TabsTrigger>
        </TabsList>

        {/* Bank Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transactions</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransactions(filteredTransactions.map(t => t.id));
                          } else {
                            setSelectedTransactions([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
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
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-500">Ref: {transaction.bankReference}</div>
                        </div>
                      </TableCell>
                      <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getConfidenceColor(transaction.confidence)}`}>
                          {transaction.confidence > 0 ? `${transaction.confidence}%` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Dialog open={showMatchDialog && selectedTransaction?.id === transaction.id} onOpenChange={setShowMatchDialog}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Target className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Match Transaction</DialogTitle>
                                <DialogDescription>
                                  Find and select the matching QuickBooks transaction
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Bank Transaction Details */}
                                <div>
                                  <h3 className="font-medium mb-3">Bank Transaction</h3>
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Date:</span>
                                          <span className="font-medium">{transaction.date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Amount:</span>
                                          <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${Math.abs(transaction.amount).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Type:</span>
                                          <span className="font-medium">{transaction.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-600">Description:</span>
                                          <span className="font-medium text-right">{transaction.description}</span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Suggested Matches */}
                                <div>
                                  <h3 className="font-medium mb-3">Suggested Matches</h3>
                                  <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {transaction.suggestedMatches.length > 0 ? (
                                      transaction.suggestedMatches.map((match, index) => (
                                        <Card key={index} className="border hover:bg-gray-50 cursor-pointer">
                                          <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                  <Badge variant="outline">{match.type}</Badge>
                                                  <span className={`text-sm ${getConfidenceColor(match.confidence)}`}>
                                                    {match.confidence}%
                                                  </span>
                                                </div>
                                                <div className="font-medium mt-1">{match.description}</div>
                                                <div className="text-sm text-gray-600">${match.amount.toFixed(2)}</div>
                                              </div>
                                              <Button 
                                                size="sm"
                                                onClick={() => handleMatchTransaction(transaction, match)}
                                              >
                                                <Check className="w-4 h-4 mr-1" />
                                                Match
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))
                                    ) : (
                                      <div className="text-center py-8 text-gray-500">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                        <p>No suggested matches found</p>
                                        <p className="text-sm">Try searching manually or create a new entry</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
                                  Cancel
                                </Button>
                                <Button>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create New Entry
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {transaction.status === 'Auto-Matched' && (
                            <Button size="sm" variant="outline">
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggested Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Matching Suggestions</CardTitle>
              <div className="text-sm text-gray-600">
                AI-powered suggestions based on transaction patterns and historical data
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankTransactions
                  .filter(t => t.suggestedMatches.length > 0)
                  .map((transaction) => (
                    <Card key={transaction.id} className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-600">
                              {transaction.date} • ${Math.abs(transaction.amount).toFixed(2)}
                            </div>
                          </div>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {transaction.suggestedMatches.map((match, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(match.confidence).replace('text-', 'bg-')}`}></div>
                                <div>
                                  <div className="font-medium">{match.description}</div>
                                  <div className="text-sm text-gray-600">
                                    {match.type} • ${match.amount.toFixed(2)} • {match.confidence}% confidence
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleMatchTransaction(transaction, match)}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline">
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matching Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Automatic Matching Rules</span>
                <Button onClick={handleCreateRule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </CardTitle>
              <div className="text-sm text-gray-600">
                Configure rules to automatically match and categorize transactions
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matchingRules.map((rule) => (
                  <Card key={rule.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{rule.name}</h3>
                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">
                              {rule.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Action: {rule.action === 'auto_match' ? 'Auto Match' : 'Categorize'} 
                            {rule.account && ` → ${rule.account}`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionMatching;