import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, Filter, Calendar, DollarSign, User, FileText, 
  Building, Package, Clock, Download, Save, History, 
  RefreshCw, Eye, ChevronDown, ChevronUp
} from 'lucide-react';

const AdvancedFind = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    transactionType: 'all',
    dateRange: 'all',
    fromDate: '',
    toDate: '',
    amountFrom: '',
    amountTo: '',
    customer: '',
    vendor: '',
    account: '',
    item: '',
    memo: '',
    reference: '',
    status: 'all',
    modifiedBy: '',
    enteredBy: ''
  });

  const [searchResults, setSearchResults] = useState([
    {
      id: 1,
      type: 'Invoice',
      number: 'INV-001',
      date: '2024-01-15',
      customer: 'ABC Corporation',
      amount: 1500.00,
      status: 'Paid',
      memo: 'Web development services',
      modifiedBy: 'admin',
      modifiedDate: '2024-01-15 10:30'
    },
    {
      id: 2,
      type: 'Bill',
      number: 'BILL-102',
      date: '2024-01-14',
      vendor: 'Office Supplies Inc',
      amount: 250.75,
      status: 'Open',
      memo: 'Monthly office supplies',
      modifiedBy: 'jsmith',
      modifiedDate: '2024-01-14 14:20'
    },
    {
      id: 3,
      type: 'Payment',
      number: 'PMT-055',
      date: '2024-01-13',
      customer: 'XYZ Industries',
      amount: 2000.00,
      status: 'Deposited',
      memo: 'Payment for services rendered',
      modifiedBy: 'admin',
      modifiedDate: '2024-01-13 16:45'
    }
  ]);

  const [savedSearches, setSavedSearches] = useState([
    {
      id: 1,
      name: 'Unpaid Invoices Last 30 Days',
      criteria: { transactionType: 'invoice', status: 'open', dateRange: 'last30' },
      lastRun: '2024-01-15',
      resultCount: 12
    },
    {
      id: 2,
      name: 'Large Payments This Month',
      criteria: { transactionType: 'payment', amountFrom: '1000', dateRange: 'thisMonth' },
      lastRun: '2024-01-14',
      resultCount: 8
    }
  ]);

  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  const transactionTypes = [
    { value: 'all', label: 'All Transactions' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'payment', label: 'Payments' },
    { value: 'bill', label: 'Bills' },
    { value: 'check', label: 'Checks' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'journal', label: 'Journal Entries' },
    { value: 'estimate', label: 'Estimates' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'pending', label: 'Pending' },
    { value: 'voided', label: 'Voided' }
  ];

  const updateCriteria = (field, value) => {
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  const runSearch = () => {
    console.log('Running search with criteria:', searchCriteria);
    // Simulate search results
    alert(`Found ${searchResults.length} transactions matching your criteria`);
  };

  const clearSearch = () => {
    setSearchCriteria({
      transactionType: 'all',
      dateRange: 'all',
      fromDate: '',
      toDate: '',
      amountFrom: '',
      amountTo: '',
      customer: '',
      vendor: '',
      account: '',
      item: '',
      memo: '',
      reference: '',
      status: 'all',
      modifiedBy: '',
      enteredBy: ''
    });
    setSearchResults([]);
  };

  const saveSearch = () => {
    const name = prompt('Enter a name for this search:');
    if (name) {
      const newSearch = {
        id: savedSearches.length + 1,
        name,
        criteria: { ...searchCriteria },
        lastRun: new Date().toISOString().split('T')[0],
        resultCount: searchResults.length
      };
      setSavedSearches([...savedSearches, newSearch]);
      alert('Search saved successfully!');
    }
  };

  const loadSavedSearch = (savedSearch) => {
    setSearchCriteria(savedSearch.criteria);
    alert(`Loaded search: ${savedSearch.name}`);
  };

  const exportResults = () => {
    alert('Exporting search results...');
  };

  const viewTransaction = (transaction) => {
    alert(`Opening ${transaction.type} ${transaction.number}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Find</h1>
          <p className="text-gray-600">Search and filter all your QuickBooks transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportResults} variant="outline" disabled={searchResults.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={saveSearch} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Search
          </Button>
        </div>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="results">Results ({searchResults.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Search Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={searchCriteria.transactionType}
                    onChange={(e) => updateCriteria('transactionType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {transactionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={searchCriteria.dateRange}
                    onChange={(e) => updateCriteria('dateRange', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {dateRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={searchCriteria.status}
                    onChange={(e) => updateCriteria('status', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Date Range */}
              {searchCriteria.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={searchCriteria.fromDate}
                      onChange={(e) => updateCriteria('fromDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={searchCriteria.toDate}
                      onChange={(e) => updateCriteria('toDate', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Amount Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount From
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={searchCriteria.amountFrom}
                    onChange={(e) => updateCriteria('amountFrom', e.target.value)}
                    placeholder="Minimum amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount To
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={searchCriteria.amountTo}
                    onChange={(e) => updateCriteria('amountTo', e.target.value)}
                    placeholder="Maximum amount"
                  />
                </div>
              </div>

              {/* Advanced Criteria Toggle */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
                  className="flex items-center"
                >
                  {isAdvancedExpanded ? (
                    <ChevronUp className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  )}
                  Advanced Options
                </Button>
              </div>

              {/* Advanced Search Criteria */}
              {isAdvancedExpanded && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer/Vendor
                      </label>
                      <Input
                        value={searchCriteria.customer}
                        onChange={(e) => updateCriteria('customer', e.target.value)}
                        placeholder="Customer or vendor name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account
                      </label>
                      <Input
                        value={searchCriteria.account}
                        onChange={(e) => updateCriteria('account', e.target.value)}
                        placeholder="Account name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item/Service
                      </label>
                      <Input
                        value={searchCriteria.item}
                        onChange={(e) => updateCriteria('item', e.target.value)}
                        placeholder="Item or service name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Number
                      </label>
                      <Input
                        value={searchCriteria.reference}
                        onChange={(e) => updateCriteria('reference', e.target.value)}
                        placeholder="Reference or check number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modified By
                      </label>
                      <Input
                        value={searchCriteria.modifiedBy}
                        onChange={(e) => updateCriteria('modifiedBy', e.target.value)}
                        placeholder="User who modified transaction"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entered By
                      </label>
                      <Input
                        value={searchCriteria.enteredBy}
                        onChange={(e) => updateCriteria('enteredBy', e.target.value)}
                        placeholder="User who entered transaction"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memo/Description
                    </label>
                    <Input
                      value={searchCriteria.memo}
                      onChange={(e) => updateCriteria('memo', e.target.value)}
                      placeholder="Search in memo or description field"
                    />
                  </div>
                </div>
              )}

              {/* Search Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={runSearch} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button onClick={clearSearch} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Search Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Number</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Customer/Vendor</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Memo</th>
                        <th className="text-left p-3">Modified</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(result => (
                        <tr key={result.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <Badge variant="outline">{result.type}</Badge>
                          </td>
                          <td className="p-3 font-mono text-sm">{result.number}</td>
                          <td className="p-3">{result.date}</td>
                          <td className="p-3">{result.customer || result.vendor}</td>
                          <td className="p-3 font-medium">${result.amount.toFixed(2)}</td>
                          <td className="p-3">
                            <Badge variant={
                              result.status === 'Paid' ? 'success' :
                              result.status === 'Open' ? 'default' : 'secondary'
                            }>
                              {result.status}
                            </Badge>
                          </td>
                          <td className="p-3 max-w-xs truncate">{result.memo}</td>
                          <td className="p-3 text-sm">
                            <div>
                              <div>{result.modifiedBy}</div>
                              <div className="text-gray-500">{result.modifiedDate}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewTransaction(result)}
                              className="p-1"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No search results yet. Use the search tab to find transactions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedSearches.map(savedSearch => (
                  <div key={savedSearch.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{savedSearch.name}</h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => loadSavedSearch(savedSearch)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Load & Run
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Last run: {savedSearch.lastRun}</span>
                        <span>Results: {savedSearch.resultCount}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {savedSearches.length === 0 && (
                  <div className="text-center py-8">
                    <Save className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No saved searches yet. Save frequently used searches for quick access.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedFind;