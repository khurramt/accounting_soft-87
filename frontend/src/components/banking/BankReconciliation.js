import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAccounts } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { 
  CheckCircle, 
  Save,
  Calculator,
  AlertCircle,
  DollarSign,
  FileText
} from "lucide-react";

const BankReconciliation = () => {
  const [reconciliationData, setReconciliationData] = useState({
    account: "",
    statementEndDate: new Date().toISOString().split('T')[0],
    statementEndBalance: 0,
    serviceCharge: 0,
    serviceChargeDate: new Date().toISOString().split('T')[0],
    interestEarned: 0,
    interestEarnedDate: new Date().toISOString().split('T')[0]
  });

  const [transactions] = useState([
    {
      id: "1",
      date: "2024-01-15",
      type: "Deposit",
      description: "Customer Payment - ABC Company",
      payment: 0,
      deposit: 1500.00,
      cleared: false
    },
    {
      id: "2",
      date: "2024-01-14",
      type: "Check",
      description: "Check #1001 - Office Supplies Co",
      payment: 850.00,
      deposit: 0,
      cleared: true
    },
    {
      id: "3",
      date: "2024-01-13",
      type: "Deposit",
      description: "Cash Sales",
      payment: 0,
      deposit: 750.00,
      cleared: true
    },
    {
      id: "4",
      date: "2024-01-12",
      type: "ACH",
      description: "ACH Payment - Tech Solutions",
      payment: 1200.00,
      deposit: 0,
      cleared: false
    },
    {
      id: "5",
      date: "2024-01-10",
      type: "Check",
      description: "Check #1002 - Marketing Agency",
      payment: 2500.00,
      deposit: 0,
      cleared: true
    }
  ]);

  const [clearedTransactions, setClearedTransactions] = useState(
    transactions.filter(t => t.cleared).map(t => t.id)
  );

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setReconciliationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransactionToggle = (transactionId) => {
    setClearedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const bankAccounts = mockAccounts.filter(account => account.type === "Bank");
  const selectedAccount = bankAccounts.find(acc => acc.id === reconciliationData.account);

  const calculateBeginningBalance = () => {
    return selectedAccount ? selectedAccount.balance : 0;
  };

  const calculateClearedPayments = () => {
    return transactions
      .filter(t => clearedTransactions.includes(t.id))
      .reduce((sum, t) => sum + t.payment, 0);
  };

  const calculateClearedDeposits = () => {
    return transactions
      .filter(t => clearedTransactions.includes(t.id))
      .reduce((sum, t) => sum + t.deposit, 0);
  };

  const calculateClearedBalance = () => {
    const beginning = calculateBeginningBalance();
    const deposits = calculateClearedDeposits();
    const payments = calculateClearedPayments();
    const serviceCharge = reconciliationData.serviceCharge || 0;
    const interestEarned = reconciliationData.interestEarned || 0;
    
    return beginning + deposits - payments - serviceCharge + interestEarned;
  };

  const calculateDifference = () => {
    return reconciliationData.statementEndBalance - calculateClearedBalance();
  };

  const isReconciled = Math.abs(calculateDifference()) < 0.01;

  const handleSave = () => {
    if (isReconciled) {
      console.log("Saving reconciliation:", {
        ...reconciliationData,
        clearedTransactions,
        reconciled: true
      });
      navigate("/accounts");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
          <p className="text-gray-600">Reconcile your bank account with statement</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/accounts")}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!isReconciled}
          >
            <Save className="w-4 h-4 mr-2" />
            Finish Reconciliation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reconciliation Setup */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Statement Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select value={reconciliationData.account} onValueChange={(value) => handleInputChange("account", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statementEndDate">Statement End Date</Label>
              <Input
                id="statementEndDate"
                type="date"
                value={reconciliationData.statementEndDate}
                onChange={(e) => handleInputChange("statementEndDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statementEndBalance">Statement End Balance</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="statementEndBalance"
                  type="number"
                  step="0.01"
                  value={reconciliationData.statementEndBalance}
                  onChange={(e) => handleInputChange("statementEndBalance", parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceCharge">Service Charge</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="serviceCharge"
                  type="number"
                  step="0.01"
                  value={reconciliationData.serviceCharge}
                  onChange={(e) => handleInputChange("serviceCharge", parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestEarned">Interest Earned</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="interestEarned"
                  type="number"
                  step="0.01"
                  value={reconciliationData.interestEarned}
                  onChange={(e) => handleInputChange("interestEarned", parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            {selectedAccount && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Account Info</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>{selectedAccount.name}</p>
                  <p>QuickBooks Balance: ${selectedAccount.balance.toFixed(2)}</p>
                  <p>Account #: {selectedAccount.number}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark Cleared Transactions
              </span>
              <Badge variant="secondary">
                {clearedTransactions.length} of {transactions.length} cleared
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">✓</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Deposit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const isCleared = clearedTransactions.includes(transaction.id);
                    
                    return (
                      <TableRow key={transaction.id} className={isCleared ? "bg-green-50" : ""}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isCleared}
                            onChange={() => handleTransactionToggle(transaction.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell className="max-w-48 truncate">{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.payment > 0 && `$${transaction.payment.toFixed(2)}`}
                        </TableCell>
                        <TableCell>
                          {transaction.deposit > 0 && `$${transaction.deposit.toFixed(2)}`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Reconciliation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side - QuickBooks */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-900">QuickBooks Balance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Beginning Balance:</span>
                  <span>${calculateBeginningBalance().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>+ Cleared Deposits:</span>
                  <span>${calculateClearedDeposits().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>- Cleared Payments:</span>
                  <span>${calculateClearedPayments().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>- Service Charges:</span>
                  <span>${(reconciliationData.serviceCharge || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>+ Interest Earned:</span>
                  <span>${(reconciliationData.interestEarned || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Cleared Balance:</span>
                  <span>${calculateClearedBalance().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Side - Bank Statement */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-900">Bank Statement</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Statement End Date:</span>
                  <span>{reconciliationData.statementEndDate}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Statement End Balance:</span>
                  <span>${reconciliationData.statementEndBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Difference */}
          <div className="mt-6 p-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Difference:</span>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${
                  isReconciled ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Math.abs(calculateDifference()).toFixed(2)}
                </span>
                {isReconciled ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              {isReconciled ? (
                <span className="text-green-600 font-medium">✓ Account is reconciled!</span>
              ) : (
                <span className="text-red-600">
                  Account is not reconciled. Check for missing transactions or entry errors.
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankReconciliation;