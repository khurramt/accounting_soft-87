import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  Calculator,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Equal
} from "lucide-react";

const EnhancedReconciliation = () => {
  const [selectedAccount, setSelectedAccount] = useState("checking");
  const [statementEndDate, setStatementEndDate] = useState("2024-01-31");
  const [statementBalance, setStatementBalance] = useState("24,755.00");
  const [serviceCharge, setServiceCharge] = useState("25.00");
  const [interestEarned, setInterestEarned] = useState("12.50");
  const [isReconcileStarted, setIsReconcileStarted] = useState(false);
  const [clearedTransactions, setClearedTransactions] = useState([]);
  const [showOnlyUncleared, setShowOnlyUncleared] = useState(false);

  const accounts = [
    { id: "checking", name: "Business Checking", balance: 25000.00 },
    { id: "savings", name: "Business Savings", balance: 15000.00 },
    { id: "credit", name: "Business Credit Card", balance: -2500.00 }
  ];

  const [transactions] = useState([
    {
      id: "1",
      date: "2024-01-15",
      type: "Deposit",
      description: "Customer Payment - ABC Corp",
      reference: "DEP001",
      amount: 1500.00,
      cleared: false,
      reconciled: false
    },
    {
      id: "2", 
      date: "2024-01-14",
      type: "Check",
      description: "Office Supplies",
      reference: "1234",
      amount: -245.50,
      cleared: false,
      reconciled: false
    },
    {
      id: "3",
      date: "2024-01-13",
      type: "Payment",
      description: "Payroll Transfer",
      reference: "PAY001",
      amount: -3200.00,
      cleared: true,
      reconciled: true
    },
    {
      id: "4",
      date: "2024-01-12",
      type: "Deposit",
      description: "Wire Transfer",
      reference: "WIRE001",
      amount: 5000.00,
      cleared: false,
      reconciled: false
    },
    {
      id: "5",
      date: "2024-01-10",
      type: "Fee",
      description: "Monthly Service Fee",
      reference: "FEE001",
      amount: -25.00,
      cleared: true,
      reconciled: true
    },
    {
      id: "6",
      date: "2024-01-08",
      type: "Check",
      description: "Rent Payment",
      reference: "1235",
      amount: -2000.00,
      cleared: true,
      reconciled: true
    }
  ]);

  const [discrepancies] = useState([
    {
      id: "1",
      type: "Missing Transaction",
      description: "Bank statement shows deposit of $750 not in QB",
      amount: 750.00,
      severity: "High"
    },
    {
      id: "2",
      type: "Amount Difference", 
      description: "Check #1236 shows $155 on statement vs $150 in QB",
      amount: 5.00,
      severity: "Medium"
    }
  ]);

  const handleToggleCleared = (transactionId) => {
    setClearedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const calculateBalances = () => {
    const beginningBalance = parseFloat(accounts.find(a => a.id === selectedAccount)?.balance || 0);
    const clearedCredits = transactions
      .filter(t => (clearedTransactions.includes(t.id) || t.cleared) && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const clearedDebits = transactions
      .filter(t => (clearedTransactions.includes(t.id) || t.cleared) && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const clearedBalance = beginningBalance + clearedCredits - clearedDebits;
    const statementBal = parseFloat(statementBalance.replace(/,/g, ''));
    const difference = clearedBalance - statementBal;

    return {
      beginningBalance,
      clearedCredits,
      clearedDebits,
      clearedBalance,
      statementBalance: statementBal,
      difference
    };
  };

  const balances = calculateBalances();
  const isReconciled = Math.abs(balances.difference) < 0.01;

  const filteredTransactions = showOnlyUncleared 
    ? transactions.filter(t => !clearedTransactions.includes(t.id) && !t.cleared)
    : transactions;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Bank Reconciliation</h1>
          <p className="text-gray-600 mt-1">Reconcile your accounts with advanced tools and discrepancy detection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Previous Reconciliations
          </Button>
        </div>
      </div>

      {!isReconcileStarted ? (
        /* Reconciliation Setup */
        <Card>
          <CardHeader>
            <CardTitle>Begin Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account</label>
                  <select 
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} - ${account.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Statement Ending Date</label>
                  <Input 
                    type="date"
                    value={statementEndDate}
                    onChange={(e) => setStatementEndDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Statement Ending Balance</label>
                  <Input 
                    value={statementBalance}
                    onChange={(e) => setStatementBalance(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Service Charge</label>
                  <Input 
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Interest Earned</label>
                  <Input 
                    value={interestEarned}
                    onChange={(e) => setInterestEarned(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Reconciliation Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Gather your bank statement</li>
                    <li>• Check for outstanding transactions</li>
                    <li>• Look for bank fees and interest</li>
                    <li>• Verify dates and amounts match</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setIsReconcileStarted(true)} className="px-8">
                <Calculator className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Reconciliation Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Transactions to Clear</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowOnlyUncleared(!showOnlyUncleared)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showOnlyUncleared ? 'Show All' : 'Uncleared Only'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Find
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">✓</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map(transaction => {
                      const isCleared = clearedTransactions.includes(transaction.id) || transaction.cleared;
                      return (
                        <TableRow 
                          key={transaction.id}
                          className={isCleared ? "bg-green-50" : ""}
                        >
                          <TableCell>
                            <input 
                              type="checkbox"
                              checked={isCleared}
                              onChange={() => handleToggleCleared(transaction.id)}
                              disabled={transaction.cleared}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.type}</Badge>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell className={`text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(transaction.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Discrepancies */}
            {discrepancies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Potential Discrepancies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {discrepancies.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.type}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            item.severity === 'High' ? 'bg-red-100 text-red-800' :
                            item.severity === 'Medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {item.severity}
                          </Badge>
                          <span className="font-medium">${item.amount.toLocaleString()}</span>
                          <Button size="sm" variant="outline">Resolve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reconciliation Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Reconciliation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Beginning Balance:</span>
                    <span className="font-medium">${balances.beginningBalance.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-green-600">
                    <span>+ Cleared Credits:</span>
                    <span className="font-medium">${balances.clearedCredits.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-red-600">
                    <span>- Cleared Debits:</span>
                    <span className="font-medium">${balances.clearedDebits.toLocaleString()}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Cleared Balance:</span>
                    <span>${balances.clearedBalance.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Statement Balance:</span>
                    <span className="font-medium">${balances.statementBalance.toLocaleString()}</span>
                  </div>
                  
                  <hr />
                  
                  <div className={`flex justify-between font-bold ${isReconciled ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Difference:</span>
                    <span>${Math.abs(balances.difference).toLocaleString()}</span>
                  </div>
                </div>

                {isReconciled ? (
                  <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Ready to Reconcile!</span>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">Needs Adjustment</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    disabled={!isReconciled}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Reconcile Now
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <X className="w-4 h-4 mr-2" />
                    Leave Reconciliation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Journal Entry
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Find & Match
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReconciliation;