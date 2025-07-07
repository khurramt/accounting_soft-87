import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockBills } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { 
  CreditCard, 
  Check, 
  DollarSign,
  Calendar,
  Calculator,
  Save
} from "lucide-react";

const PayBills = () => {
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "check",
    paymentAccount: "checking",
    selectedBills: [],
    totalPayment: 0
  });

  const navigate = useNavigate();

  const [bills] = useState([
    ...mockBills,
    {
      id: "2",
      vendor: "Tech Solutions Inc",
      date: "2024-01-12",
      dueDate: "2024-02-11",
      refNo: "TS-2024-002",
      amount: 1200.00,
      status: "Open"
    },
    {
      id: "3",
      vendor: "Marketing Agency",
      date: "2024-01-08",
      dueDate: "2024-02-07",
      refNo: "MA-2024-001",
      amount: 2500.00,
      status: "Open"
    }
  ]);

  const handleBillSelection = (billId, amount) => {
    setPaymentData(prev => {
      const isSelected = prev.selectedBills.some(bill => bill.id === billId);
      let newSelectedBills;
      
      if (isSelected) {
        newSelectedBills = prev.selectedBills.filter(bill => bill.id !== billId);
      } else {
        newSelectedBills = [...prev.selectedBills, { id: billId, amount }];
      }
      
      const newTotal = newSelectedBills.reduce((sum, bill) => sum + bill.amount, 0);
      
      return {
        ...prev,
        selectedBills: newSelectedBills,
        totalPayment: newTotal
      };
    });
  };

  const handlePaymentAmountChange = (billId, newAmount) => {
    setPaymentData(prev => {
      const updatedBills = prev.selectedBills.map(bill => 
        bill.id === billId ? { ...bill, amount: parseFloat(newAmount) || 0 } : bill
      );
      const newTotal = updatedBills.reduce((sum, bill) => sum + bill.amount, 0);
      
      return {
        ...prev,
        selectedBills: updatedBills,
        totalPayment: newTotal
      };
    });
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "Paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const handlePaySelectedBills = () => {
    console.log("Paying selected bills:", paymentData);
    navigate("/vendors");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pay Bills</h1>
          <p className="text-gray-600">Select bills to pay and process payments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/vendors")}>
            Cancel
          </Button>
          <Button 
            onClick={handlePaySelectedBills} 
            className="bg-green-600 hover:bg-green-700"
            disabled={paymentData.selectedBills.length === 0}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Pay Selected Bills
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Payment Options */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => handleInputChange("paymentDate", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="ach">ACH Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentAccount">Payment Account</Label>
              <Select value={paymentData.paymentAccount} onValueChange={(value) => handleInputChange("paymentAccount", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking Account</SelectItem>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="credit_line">Credit Line</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Account Balance:</span>
                  <span className="font-medium">$25,000.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Selected Amount:</span>
                  <span className="font-medium">${paymentData.totalPayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Ending Balance:</span>
                  <span>${(25000 - paymentData.totalPayment).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Bills to Pay
              </span>
              <Badge variant="secondary">
                {paymentData.selectedBills.length} selected
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">✓</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Ref No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Amount to Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.filter(bill => bill.status === "Open").map((bill) => {
                    const isSelected = paymentData.selectedBills.some(selected => selected.id === bill.id);
                    const selectedBill = paymentData.selectedBills.find(selected => selected.id === bill.id);
                    
                    return (
                      <TableRow key={bill.id} className={isOverdue(bill.dueDate) ? "bg-red-50" : ""}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBillSelection(bill.id, bill.amount)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{bill.vendor}</TableCell>
                        <TableCell>{bill.refNo}</TableCell>
                        <TableCell>{bill.date}</TableCell>
                        <TableCell className={isOverdue(bill.dueDate) ? "text-red-600 font-medium" : ""}>
                          {bill.dueDate}
                          {isOverdue(bill.dueDate) && (
                            <span className="ml-1 text-xs">(Overdue)</span>
                          )}
                        </TableCell>
                        <TableCell>${bill.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max={bill.amount}
                            value={selectedBill?.amount || ""}
                            onChange={(e) => handlePaymentAmountChange(bill.id, e.target.value)}
                            disabled={!isSelected}
                            className="w-24"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {bills.filter(bill => bill.status === "Open").length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Check className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bills to pay</p>
                <p className="text-sm">All bills are up to date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      {paymentData.selectedBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Bills Selected</h4>
                <p className="text-2xl font-bold text-blue-600">{paymentData.selectedBills.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Total Payment</h4>
                <p className="text-2xl font-bold text-green-600">${paymentData.totalPayment.toFixed(2)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Method</h4>
                <p className="text-lg font-medium capitalize">{paymentData.paymentMethod.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayBills;