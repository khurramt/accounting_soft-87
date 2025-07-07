import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAccounts } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer,
  DollarSign,
  Calculator,
  Receipt
} from "lucide-react";

const MakeDeposit = () => {
  const [depositData, setDepositData] = useState({
    depositTo: "checking",
    date: new Date().toISOString().split('T')[0],
    memo: "",
    cashBack: 0,
    cashBackAccount: "",
    paymentsToDeposit: [
      {
        id: 1,
        paymentMethod: "check",
        receivedFrom: "",
        memo: "",
        checkNo: "",
        amount: 0
      }
    ]
  });

  const navigate = useNavigate();

  const [availablePayments] = useState([
    {
      id: "1",
      customer: "ABC Company",
      paymentMethod: "Check",
      refNumber: "1001",
      amount: 1500.00,
      date: "2024-01-15"
    },
    {
      id: "2",
      customer: "XYZ Corporation",
      paymentMethod: "Cash",
      refNumber: "CASH-001",
      amount: 750.00,
      date: "2024-01-14"
    },
    {
      id: "3",
      customer: "Tech Startup LLC",
      paymentMethod: "Check",
      refNumber: "2505",
      amount: 2250.00,
      date: "2024-01-13"
    }
  ]);

  const [selectedPayments, setSelectedPayments] = useState([]);

  const handleInputChange = (field, value) => {
    setDepositData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentSelection = (payment) => {
    setSelectedPayments(prev => {
      const isSelected = prev.some(p => p.id === payment.id);
      if (isSelected) {
        return prev.filter(p => p.id !== payment.id);
      } else {
        return [...prev, payment];
      }
    });
  };

  const handleAdditionalDepositChange = (index, field, value) => {
    const updatedPayments = [...depositData.paymentsToDeposit];
    updatedPayments[index][field] = value;
    
    setDepositData(prev => ({
      ...prev,
      paymentsToDeposit: updatedPayments
    }));
  };

  const addAdditionalDeposit = () => {
    setDepositData(prev => ({
      ...prev,
      paymentsToDeposit: [...prev.paymentsToDeposit, {
        id: Date.now(),
        paymentMethod: "cash",
        receivedFrom: "",
        memo: "",
        checkNo: "",
        amount: 0
      }]
    }));
  };

  const removeAdditionalDeposit = (index) => {
    if (depositData.paymentsToDeposit.length > 1) {
      const updatedPayments = depositData.paymentsToDeposit.filter((_, i) => i !== index);
      setDepositData(prev => ({
        ...prev,
        paymentsToDeposit: updatedPayments
      }));
    }
  };

  const calculateSelectedPaymentsTotal = () => {
    return selectedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateAdditionalDepositsTotal = () => {
    return depositData.paymentsToDeposit.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  };

  const calculateTotalDeposit = () => {
    return calculateSelectedPaymentsTotal() + calculateAdditionalDepositsTotal() - depositData.cashBack;
  };

  const handleSave = () => {
    console.log("Saving deposit:", {
      ...depositData,
      selectedPayments,
      totalDeposit: calculateTotalDeposit()
    });
    navigate("/accounts");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Make Deposit</h1>
          <p className="text-gray-600">Deposit payments and other funds</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/accounts")}>
            Cancel
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Deposit Slip
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Deposit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deposit Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositTo">Deposit To</Label>
                <Select value={depositData.depositTo} onValueChange={(value) => handleInputChange("depositTo", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.filter(account => account.type === "Bank").map((account) => (
                      <SelectItem key={account.id} value={account.name.toLowerCase().replace(" ", "_")}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={depositData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
            </div>

            {/* Select Payments to Deposit */}
            <div className="space-y-4">
              <h4 className="font-semibold">Select Payments to Deposit</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">✓</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Ref Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availablePayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedPayments.some(p => p.id === payment.id)}
                            onChange={() => handlePaymentSelection(payment)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{payment.customer}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.refNumber}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Additional Cash/Check Deposits */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Additional Deposits</h4>
                <Button variant="outline" size="sm" onClick={addAdditionalDeposit}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Received From</TableHead>
                      <TableHead>Memo</TableHead>
                      <TableHead>Check No.</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depositData.paymentsToDeposit.map((payment, index) => (
                      <TableRow key={payment.id}>
                        <TableCell className="p-2">
                          <Select 
                            value={payment.paymentMethod} 
                            onValueChange={(value) => handleAdditionalDepositChange(index, "paymentMethod", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="money_order">Money Order</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={payment.receivedFrom}
                            onChange={(e) => handleAdditionalDepositChange(index, "receivedFrom", e.target.value)}
                            placeholder="Customer/Source"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={payment.memo}
                            onChange={(e) => handleAdditionalDepositChange(index, "memo", e.target.value)}
                            placeholder="Description"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={payment.checkNo}
                            onChange={(e) => handleAdditionalDepositChange(index, "checkNo", e.target.value)}
                            placeholder="Check #"
                            disabled={payment.paymentMethod !== "check"}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={payment.amount}
                            onChange={(e) => handleAdditionalDepositChange(index, "amount", e.target.value)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdditionalDeposit(index)}
                            disabled={depositData.paymentsToDeposit.length === 1}
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

            {/* Cash Back */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashBack">Cash Back Amount</Label>
                <Input
                  id="cashBack"
                  type="number"
                  step="0.01"
                  value={depositData.cashBack}
                  onChange={(e) => handleInputChange("cashBack", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cashBackAccount">Cash Back Goes To</Label>
                <Select value={depositData.cashBackAccount} onValueChange={(value) => handleInputChange("cashBackAccount", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petty_cash">Petty Cash</SelectItem>
                    <SelectItem value="cash_drawer">Cash Drawer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo</Label>
              <Input
                id="memo"
                value={depositData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
                placeholder="Deposit memo"
              />
            </div>
          </CardContent>
        </Card>

        {/* Deposit Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Deposit Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Selected Payments:</span>
                <span className="font-medium">${calculateSelectedPaymentsTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Additional Deposits:</span>
                <span className="font-medium">${calculateAdditionalDepositsTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Back:</span>
                <span className="font-medium text-red-600">-${depositData.cashBack.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Deposit:</span>
                  <span>${calculateTotalDeposit().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Account Info</h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm">Depositing to:</p>
                <p className="font-medium capitalize">{depositData.depositTo.replace("_", " ")} Account</p>
                <p className="text-sm text-gray-600 mt-1">Current Balance: $25,000.00</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Deposit Slip
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="w-4 h-4 mr-2" />
                  Print Summary
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Deposit Tips</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Verify all amounts before depositing</li>
                <li>• Keep deposit slip for records</li>
                <li>• Deposit payments promptly</li>
                <li>• Match deposits to bank statements</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MakeDeposit;