import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockVendors, mockAccounts } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Textarea } from "../ui/textarea";
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer,
  Check,
  Calculator,
  CreditCard
} from "lucide-react";

const WriteCheck = () => {
  const [checkData, setCheckData] = useState({
    bankAccount: "checking",
    checkNumber: "1001",
    date: new Date().toISOString().split('T')[0],
    payToVendor: "",
    amount: 0,
    memo: "",
    address: "",
    expenses: [
      {
        id: 1,
        account: "",
        amount: 0,
        memo: "",
        customer: ""
      }
    ]
  });

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setCheckData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...checkData.expenses];
    updatedExpenses[index][field] = value;
    
    // Update total amount
    const totalAmount = updatedExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    setCheckData(prev => ({
      ...prev,
      expenses: updatedExpenses,
      amount: totalAmount
    }));
  };

  const addExpense = () => {
    setCheckData(prev => ({
      ...prev,
      expenses: [...prev.expenses, {
        id: Date.now(),
        account: "",
        amount: 0,
        memo: "",
        customer: ""
      }]
    }));
  };

  const removeExpense = (index) => {
    if (checkData.expenses.length > 1) {
      const updatedExpenses = checkData.expenses.filter((_, i) => i !== index);
      const totalAmount = updatedExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      setCheckData(prev => ({
        ...prev,
        expenses: updatedExpenses,
        amount: totalAmount
      }));
    }
  };

  const handleSave = () => {
    console.log("Saving check:", checkData);
    navigate("/vendors");
  };

  const selectedVendor = mockVendors.find(v => v.id === checkData.payToVendor);

  const formatAmountInWords = (amount) => {
    // Simple implementation - in real app would use a proper number-to-words library
    if (amount === 0) return "Zero dollars";
    return `${amount.toFixed(2)} dollars`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Write Check</h1>
          <p className="text-gray-600">Write a check to pay vendor or expense</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/vendors")}>
            Cancel
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="w-5 h-5 mr-2" />
              Check Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Check Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Select value={checkData.bankAccount} onValueChange={(value) => handleInputChange("bankAccount", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="checkNumber">Check No.</Label>
                <Input
                  id="checkNumber"
                  value={checkData.checkNumber}
                  onChange={(e) => handleInputChange("checkNumber", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={checkData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
            </div>

            {/* Check Visual Representation */}
            <div className="border-2 border-gray-300 p-6 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                {/* Check Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">YOUR COMPANY NAME</h3>
                    <p className="text-sm text-gray-600">123 Business St, City, State 12345</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Check #{checkData.checkNumber}</p>
                    <p className="text-sm">{checkData.date}</p>
                  </div>
                </div>

                {/* Pay To Line */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Pay to the Order of:</span>
                    <div className="flex-1 border-b border-gray-400">
                      <Select value={checkData.payToVendor} onValueChange={(value) => handleInputChange("payToVendor", value)}>
                        <SelectTrigger className="border-none shadow-none bg-transparent">
                          <SelectValue placeholder="Select vendor or enter name" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockVendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border border-gray-400 px-3 py-1 min-w-24 text-right">
                      ${checkData.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Amount in Words */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 border-b border-gray-400 py-1">
                    <span className="text-sm italic">{formatAmountInWords(checkData.amount)}</span>
                  </div>
                  <span className="text-sm">Dollars</span>
                </div>

                {/* Memo Line */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Memo:</span>
                  <div className="flex-1 border-b border-gray-400">
                    <Input
                      value={checkData.memo}
                      onChange={(e) => handleInputChange("memo", e.target.value)}
                      className="border-none shadow-none bg-transparent"
                      placeholder="Memo line"
                    />
                  </div>
                </div>

                {/* Address */}
                {selectedVendor && (
                  <div className="mt-4 p-3 bg-white border rounded">
                    <h4 className="font-semibold text-sm mb-1">Pay To:</h4>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{selectedVendor.name}</p>
                      <p>{selectedVendor.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Expense Breakdown</h4>
                <Button variant="outline" size="sm" onClick={addExpense}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="w-32">Amount</TableHead>
                      <TableHead>Memo</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkData.expenses.map((expense, index) => (
                      <TableRow key={expense.id}>
                        <TableCell className="p-2">
                          <Select 
                            value={expense.account} 
                            onValueChange={(value) => handleExpenseChange(index, "account", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.name}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={expense.amount}
                            onChange={(e) => handleExpenseChange(index, "amount", e.target.value)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={expense.memo}
                            onChange={(e) => handleExpenseChange(index, "memo", e.target.value)}
                            placeholder="Description"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={expense.customer}
                            onChange={(e) => handleExpenseChange(index, "customer", e.target.value)}
                            placeholder="Customer/Job"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpense(index)}
                            disabled={checkData.expenses.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Check Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Check Amount:</span>
                <span className="font-bold text-lg">${checkData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Account:</span>
                <span className="capitalize">{checkData.bankAccount} Account</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Check Number:</span>
                <span>#{checkData.checkNumber}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Options</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Later
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Online Payment
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Check Tips</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Record check number for tracking</li>
                <li>• Verify vendor address</li>
                <li>• Keep detailed expense records</li>
                <li>• Print checks on check stock</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WriteCheck;