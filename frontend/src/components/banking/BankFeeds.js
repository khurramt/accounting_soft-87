import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Plus, 
  Link, 
  Check, 
  X, 
  RefreshCw,
  CreditCard,
  AlertCircle,
  Download
} from "lucide-react";

const BankFeeds = () => {
  const [connectedAccounts] = useState([
    {
      id: "1",
      bankName: "Chase Bank",
      accountName: "Business Checking",
      accountNumber: "****1234",
      balance: 25000.00,
      lastUpdate: "2024-01-15 10:30 AM",
      status: "Connected"
    },
    {
      id: "2",
      bankName: "Wells Fargo",
      accountName: "Business Savings",
      accountNumber: "****5678",
      balance: 15000.00,
      lastUpdate: "2024-01-15 09:15 AM",
      status: "Connected"
    }
  ]);

  const [transactions] = useState([
    {
      id: "1",
      date: "2024-01-15",
      description: "ACH DEPOSIT CUSTOMER PAYMENT",
      amount: 1500.00,
      type: "Deposit",
      status: "Recognized",
      suggestedMatch: "INV-001 Payment"
    },
    {
      id: "2",
      date: "2024-01-14",
      description: "CHECK #1001 OFFICE SUPPLIES",
      amount: -350.00,
      type: "Check",
      status: "Unrecognized",
      suggestedMatch: null
    },
    {
      id: "3",
      date: "2024-01-14",
      description: "DEBIT CARD PURCHASE FUEL",
      amount: -75.00,
      type: "Debit",
      status: "Recognized",
      suggestedMatch: "Fuel Expense"
    },
    {
      id: "4",
      date: "2024-01-13",
      description: "WIRE TRANSFER CUSTOMER ABC",
      amount: 2500.00,
      type: "Wire",
      status: "Unrecognized",
      suggestedMatch: null
    }
  ]);

  const [rules] = useState([
    {
      id: "1",
      name: "Office Supplies Auto-Match",
      description: "Automatically categorize office supply purchases",
      account: "Office Expenses",
      conditions: "Description contains 'OFFICE SUPPLIES'"
    },
    {
      id: "2",
      name: "Fuel Expense Rule",
      description: "Categorize fuel purchases",
      account: "Vehicle Expenses",
      conditions: "Description contains 'FUEL'"
    }
  ]);

  const recognizedTransactions = transactions.filter(t => t.status === "Recognized");
  const unrecognizedTransactions = transactions.filter(t => t.status === "Unrecognized");

  const handleAddToQuickBooks = (transactionId) => {
    console.log("Adding transaction to QuickBooks:", transactionId);
  };

  const handleIgnoreTransaction = (transactionId) => {
    console.log("Ignoring transaction:", transactionId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Feeds</h1>
          <p className="text-gray-600">Connect and manage your bank accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Connect Account
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="w-5 h-5 mr-2" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedAccounts.map((account) => (
              <Card key={account.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{account.bankName}</span>
                    </div>
                    <Badge variant="default">{account.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{account.accountName}</p>
                    <p className="text-sm text-gray-600">{account.accountNumber}</p>
                    <p className="text-lg font-bold text-green-600">${account.balance.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Last updated: {account.lastUpdate}</p>
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
          <CardTitle>Transaction Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recognized" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recognized">
                Recognized ({recognizedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="unrecognized">
                Unrecognized ({unrecognizedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="rules">
                Rules ({rules.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recognized" className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Suggested Match</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recognizedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>{transaction.suggestedMatch}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddToQuickBooks(transaction.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleIgnoreTransaction(transaction.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Ignore
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="unrecognized" className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    These transactions need to be reviewed and categorized manually.
                  </span>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unrecognizedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              Add Details
                            </Button>
                            <Button size="sm" variant="outline">
                              Create Rule
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="rules" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Rules help automatically categorize transactions based on patterns.
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>
              
              <div className="space-y-3">
                {rules.map((rule) => (
                  <Card key={rule.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Account: {rule.account} | Conditions: {rule.conditions}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankFeeds;