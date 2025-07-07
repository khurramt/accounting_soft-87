import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { 
  CreditCard,
  Plus,
  Minus,
  Save,
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Calculator,
  Receipt,
  Trash2,
  Edit,
  Copy,
  RefreshCw,
  Building,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Briefcase,
  Phone
} from "lucide-react";

const CreditCardCharges = () => {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState("charge"); // charge, refund
  const [formData, setFormData] = useState({
    creditCardAccount: "",
    vendor: "",
    date: new Date().toISOString().split('T')[0],
    refNumber: "",
    amount: "",
    memo: "",
    class: "",
    customer: ""
  });

  const [expenseLines, setExpenseLines] = useState([
    {
      id: 1,
      account: "",
      amount: "",
      memo: "",
      customer: "",
      billable: false,
      class: ""
    }
  ]);

  const [itemLines, setItemLines] = useState([
    {
      id: 1,
      item: "",
      description: "",
      qty: "",
      cost: "",
      amount: "",
      customer: "",
      billable: false,
      class: ""
    }
  ]);

  const [activeTab, setActiveTab] = useState("expenses");

  // Mock data
  const [creditCardAccounts] = useState([
    { id: "1", name: "Business Credit Card - ****1234", balance: 2500.00 },
    { id: "2", name: "Corporate AmEx - ****5678", balance: 1200.00 },
    { id: "3", name: "Chase Business - ****9012", balance: 850.00 }
  ]);

  const [vendors] = useState([
    { id: "1", name: "Office Depot" },
    { id: "2", name: "Staples" },
    { id: "3", name: "Amazon Business" },
    { id: "4", name: "Shell Gas Station" },
    { id: "5", name: "Marriott Hotels" },
    { id: "6", name: "United Airlines" },
    { id: "7", name: "Dell Computer" },
    { id: "8", name: "Best Buy Business" }
  ]);

  const [expenseAccounts] = useState([
    { id: "1", name: "Office Supplies", icon: Briefcase },
    { id: "2", name: "Vehicle Expenses", icon: Car },
    { id: "3", name: "Travel & Entertainment", icon: Coffee },
    { id: "4", name: "Equipment", icon: Building },
    { id: "5", name: "Telecommunications", icon: Phone },
    { id: "6", name: "Rent Expense", icon: Home },
    { id: "7", name: "Professional Services", icon: FileText },
    { id: "8", name: "Meals & Entertainment", icon: Coffee }
  ]);

  const [items] = useState([
    { id: "1", name: "Office Supplies", description: "General office supplies" },
    { id: "2", name: "Computer Equipment", description: "Computers and peripherals" },
    { id: "3", name: "Software License", description: "Software licensing fees" },
    { id: "4", name: "Consulting Service", description: "Professional consulting hours" }
  ]);

  const [customers] = useState([
    { id: "1", name: "ABC Company" },
    { id: "2", name: "XYZ Corporation" },
    { id: "3", name: "Johnson & Associates" },
    { id: "4", name: "Smith Enterprises" }
  ]);

  const [classes] = useState([
    { id: "1", name: "Operations" },
    { id: "2", name: "Marketing" },
    { id: "3", name: "Administration" },
    { id: "4", name: "Sales" }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addExpenseLine = () => {
    const newLine = {
      id: Math.max(...expenseLines.map(l => l.id)) + 1,
      account: "",
      amount: "",
      memo: "",
      customer: "",
      billable: false,
      class: ""
    };
    setExpenseLines([...expenseLines, newLine]);
  };

  const removeExpenseLine = (id) => {
    if (expenseLines.length > 1) {
      setExpenseLines(expenseLines.filter(line => line.id !== id));
    }
  };

  const updateExpenseLine = (id, field, value) => {
    setExpenseLines(expenseLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const addItemLine = () => {
    const newLine = {
      id: Math.max(...itemLines.map(l => l.id)) + 1,
      item: "",
      description: "",
      qty: "",
      cost: "",
      amount: "",
      customer: "",
      billable: false,
      class: ""
    };
    setItemLines([...itemLines, newLine]);
  };

  const removeItemLine = (id) => {
    if (itemLines.length > 1) {
      setItemLines(itemLines.filter(line => line.id !== id));
    }
  };

  const updateItemLine = (id, field, value) => {
    setItemLines(itemLines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        
        // Auto-calculate amount if qty and cost are provided
        if ((field === 'qty' || field === 'cost') && updatedLine.qty && updatedLine.cost) {
          updatedLine.amount = (parseFloat(updatedLine.qty) * parseFloat(updatedLine.cost)).toFixed(2);
        }
        
        return updatedLine;
      }
      return line;
    }));
  };

  const calculateTotal = () => {
    if (activeTab === "expenses") {
      return expenseLines.reduce((total, line) => {
        return total + (parseFloat(line.amount) || 0);
      }, 0);
    } else {
      return itemLines.reduce((total, line) => {
        return total + (parseFloat(line.amount) || 0);
      }, 0);
    }
  };

  const handleSave = () => {
    console.log("Saving credit card charge:", {
      transactionType,
      formData,
      expenseLines: activeTab === "expenses" ? expenseLines : [],
      itemLines: activeTab === "items" ? itemLines : [],
      total: calculateTotal()
    });
    
    // Navigate back to chart of accounts or banking
    navigate('/accounts');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/accounts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {transactionType === 'charge' ? 'Credit Card Charge' : 'Credit Card Refund'}
            </h1>
            <p className="text-gray-600">Record credit card transactions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="charge">Credit Card Charge</SelectItem>
              <SelectItem value="refund">Credit Card Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction Type Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="charge"
                name="transactionType"
                value="charge"
                checked={transactionType === 'charge'}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-4 h-4"
              />
              <Label htmlFor="charge" className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-red-600" />
                Purchase/Charge
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="refund"
                name="transactionType"
                value="refund"
                checked={transactionType === 'refund'}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-4 h-4"
              />
              <Label htmlFor="refund" className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 text-green-600" />
                Refund/Credit
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="creditCardAccount">Credit Card Account *</Label>
              <Select value={formData.creditCardAccount} onValueChange={(value) => handleInputChange('creditCardAccount', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select credit card" />
                </SelectTrigger>
                <SelectContent>
                  {creditCardAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          Balance: {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={formData.vendor} onValueChange={(value) => handleInputChange('vendor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or add vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="add-new">
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Vendor
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="refNumber">Reference Number</Label>
              <Input
                id="refNumber"
                value={formData.refNumber}
                onChange={(e) => handleInputChange('refNumber', e.target.value)}
                placeholder="Receipt #, Confirmation #"
              />
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customer">Customer/Job</Label>
              <Select value={formData.customer} onValueChange={(value) => handleInputChange('customer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="memo">Memo</Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              placeholder="Enter transaction notes..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <div className="flex space-x-4">
            <Button
              variant={activeTab === "expenses" ? "default" : "outline"}
              onClick={() => setActiveTab("expenses")}
              className="flex items-center"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Expenses
            </Button>
            <Button
              variant={activeTab === "items" ? "default" : "outline"}
              onClick={() => setActiveTab("items")}
              className="flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Items
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "expenses" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Expense Lines</h4>
                <Button size="sm" onClick={addExpenseLine}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead>Customer/Job</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Select
                          value={line.account}
                          onValueChange={(value) => updateExpenseLine(line.id, 'account', value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseAccounts.map((account) => {
                              const IconComponent = account.icon;
                              return (
                                <SelectItem key={account.id} value={account.id}>
                                  <div className="flex items-center">
                                    <IconComponent className="w-4 h-4 mr-2" />
                                    {account.name}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.amount}
                          onChange={(e) => updateExpenseLine(line.id, 'amount', e.target.value)}
                          placeholder="0.00"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.memo}
                          onChange={(e) => updateExpenseLine(line.id, 'memo', e.target.value)}
                          placeholder="Description"
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.customer}
                          onValueChange={(value) => updateExpenseLine(line.id, 'customer', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={line.billable}
                          onChange={(e) => updateExpenseLine(line.id, 'billable', e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.class}
                          onValueChange={(value) => updateExpenseLine(line.id, 'class', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeExpenseLine(line.id)}
                          disabled={expenseLines.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item Lines</h4>
                <Button size="sm" onClick={addItemLine}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Customer/Job</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Select
                          value={line.item}
                          onValueChange={(value) => {
                            const selectedItem = items.find(item => item.id === value);
                            updateItemLine(line.id, 'item', value);
                            if (selectedItem) {
                              updateItemLine(line.id, 'description', selectedItem.description);
                            }
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateItemLine(line.id, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-48"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.qty}
                          onChange={(e) => updateItemLine(line.id, 'qty', e.target.value)}
                          placeholder="1"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.cost}
                          onChange={(e) => updateItemLine(line.id, 'cost', e.target.value)}
                          placeholder="0.00"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.amount}
                          onChange={(e) => updateItemLine(line.id, 'amount', e.target.value)}
                          placeholder="0.00"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.customer}
                          onValueChange={(value) => updateItemLine(line.id, 'customer', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={line.billable}
                          onChange={(e) => updateItemLine(line.id, 'billable', e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.class}
                          onValueChange={(value) => updateItemLine(line.id, 'class', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItemLine(line.id)}
                          disabled={itemLines.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total & Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-bold">
                Total: {formatCurrency(calculateTotal())}
              </div>
              <Badge variant={transactionType === 'charge' ? 'destructive' : 'default'}>
                {transactionType === 'charge' ? 'Charge' : 'Refund'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/accounts')}>
                Cancel
              </Button>
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Save & New
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save & Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditCardCharges;