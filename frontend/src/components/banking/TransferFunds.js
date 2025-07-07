import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAccounts } from "../../data/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { 
  ArrowRightLeft, 
  Save,
  Calculator,
  AlertCircle,
  DollarSign
} from "lucide-react";

const TransferFunds = () => {
  const [transferData, setTransferData] = useState({
    transferFrom: "",
    transferTo: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    memo: ""
  });

  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setTransferData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const bankAccounts = mockAccounts.filter(account => account.type === "Bank");
  
  const fromAccount = bankAccounts.find(acc => acc.id === transferData.transferFrom);
  const toAccount = bankAccounts.find(acc => acc.id === transferData.transferTo);

  const canTransfer = transferData.transferFrom && 
                     transferData.transferTo && 
                     transferData.transferFrom !== transferData.transferTo &&
                     transferData.amount > 0 &&
                     fromAccount && 
                     fromAccount.balance >= transferData.amount;

  const handleSave = () => {
    if (canTransfer) {
      console.log("Saving transfer:", transferData);
      navigate("/accounts");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
          <p className="text-gray-600">Transfer money between your accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/accounts")}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!canTransfer}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Transfer
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRightLeft className="w-5 h-5 mr-2" />
              Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transfer Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Account */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferFrom">Transfer From *</Label>
                  <Select value={transferData.transferFrom} onValueChange={(value) => handleInputChange("transferFrom", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - ${account.balance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {fromAccount && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">From Account</h4>
                    <p className="text-blue-800">{fromAccount.name}</p>
                    <p className="text-blue-700">Current Balance: ${fromAccount.balance.toFixed(2)}</p>
                    <p className="text-blue-700">Account #: {fromAccount.number}</p>
                  </div>
                )}
              </div>

              {/* To Account */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferTo">Transfer To *</Label>
                  <Select value={transferData.transferTo} onValueChange={(value) => handleInputChange("transferTo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.filter(acc => acc.id !== transferData.transferFrom).map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - ${account.balance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {toAccount && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900">To Account</h4>
                    <p className="text-green-800">{toAccount.name}</p>
                    <p className="text-green-700">Current Balance: ${toAccount.balance.toFixed(2)}</p>
                    <p className="text-green-700">Account #: {toAccount.number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Amount and Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Transfer Amount *</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={transferData.amount}
                    onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Transfer Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={transferData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo</Label>
              <Textarea
                id="memo"
                placeholder="Optional note about this transfer"
                value={transferData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
              />
            </div>

            {/* Validation Messages */}
            {transferData.transferFrom && transferData.transferTo && transferData.transferFrom === transferData.transferTo && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>Cannot transfer to the same account. Please select different accounts.</span>
              </div>
            )}

            {fromAccount && transferData.amount > fromAccount.balance && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>Insufficient funds. Available balance: ${fromAccount.balance.toFixed(2)}</span>
              </div>
            )}

            {/* Transfer Summary */}
            {fromAccount && toAccount && transferData.amount > 0 && canTransfer && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calculator className="w-5 h-5 mr-2" />
                    Transfer Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">From Account</h4>
                      <div className="space-y-1 text-sm">
                        <p>{fromAccount.name}</p>
                        <p>Current Balance: ${fromAccount.balance.toFixed(2)}</p>
                        <p className="font-medium">New Balance: ${(fromAccount.balance - transferData.amount).toFixed(2)}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">To Account</h4>
                      <div className="space-y-1 text-sm">
                        <p>{toAccount.name}</p>
                        <p>Current Balance: ${toAccount.balance.toFixed(2)}</p>
                        <p className="font-medium">New Balance: ${(toAccount.balance + transferData.amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Transfer Amount:</span>
                      <span className="text-2xl font-bold text-green-600">${transferData.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Transfer Tips */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Transfer Tips</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Transfers between your accounts are typically instant</li>
              <li>• Make sure you have sufficient funds in the source account</li>
              <li>• Keep records of transfers for accounting purposes</li>
              <li>• Use memos to track the purpose of transfers</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransferFunds;