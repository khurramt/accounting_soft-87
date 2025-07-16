import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Calendar, 
  Search,
  Filter,
  Play,
  Star,
  Eye,
  Download,
  Settings,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const CompanyFinancialReports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const financialReports = [
    {
      id: 'profit-loss',
      name: 'Profit & Loss',
      description: 'Shows your income and expenses for a period',
      type: 'Standard',
      frequency: 'Monthly',
      lastRun: '2024-01-15',
      isFavorite: true,
      isPopular: true,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: '/reports/profit-loss'
    },
    {
      id: 'profit-loss-detail',
      name: 'Profit & Loss Detail',
      description: 'Detailed breakdown of income and expenses',
      type: 'Detail',
      frequency: 'Monthly',
      lastRun: '2024-01-10',
      isFavorite: false,
      isPopular: false,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: '/reports/customize?report=Profit%20%26%20Loss%20Detail'
    },
    {
      id: 'profit-loss-ytd-comparison',
      name: 'Profit & Loss YTD Comparison',
      description: 'Year-to-date comparison with previous year',
      type: 'Comparison',
      frequency: 'Quarterly',
      lastRun: '2024-01-01',
      isFavorite: false,
      isPopular: true,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      route: '/reports/customize?report=Profit%20%26%20Loss%20YTD%20Comparison'
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Shows your assets, liabilities, and equity',
      type: 'Standard',
      frequency: 'Monthly',
      lastRun: '2024-01-15',
      isFavorite: true,
      isPopular: true,
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      route: '/reports/balance-sheet'
    },
    {
      id: 'balance-sheet-detail',
      name: 'Balance Sheet Detail',
      description: 'Detailed balance sheet with account breakdowns',
      type: 'Detail',
      frequency: 'Monthly',
      lastRun: '2024-01-12',
      isFavorite: false,
      isPopular: false,
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      route: '/reports/customize?report=Balance%20Sheet%20Detail'
    },
    {
      id: 'cash-flow',
      name: 'Statement of Cash Flows',
      description: 'Shows cash inflows and outflows',
      type: 'Standard',
      frequency: 'Monthly',
      lastRun: '2024-01-15',
      isFavorite: true,
      isPopular: true,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/reports/cash-flow'
    },
    {
      id: 'trial-balance',
      name: 'Trial Balance',
      description: 'Lists all accounts with debit and credit balances',
      type: 'Standard',
      frequency: 'Monthly',
      lastRun: '2024-01-10',
      isFavorite: false,
      isPopular: false,
      icon: PieChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      route: '/reports/customize?report=Trial%20Balance'
    },
    {
      id: 'general-ledger',
      name: 'General Ledger',
      description: 'Detailed listing of all transactions by account',
      type: 'Detail',
      frequency: 'As Needed',
      lastRun: '2024-01-08',
      isFavorite: false,
      isPopular: false,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      route: '/reports/customize?report=General%20Ledger'
    }
  ];

  const filteredReports = financialReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'favorites' && report.isFavorite) ||
                         (selectedFilter === 'popular' && report.isPopular) ||
                         (selectedFilter === 'standard' && report.type === 'Standard') ||
                         (selectedFilter === 'detail' && report.type === 'Detail');
    
    return matchesSearch && matchesFilter;
  });

  const handleRunReport = (report) => {
    navigate(report.route);
  };

  const handlePreviewReport = (report) => {
    navigate(`/reports/view?report=${encodeURIComponent(report.name)}&category=Company%20%26%20Financial`);
  };

  const handleCustomizeReport = (report) => {
    navigate(`/reports/customize?report=${encodeURIComponent(report.name)}&category=Company%20%26%20Financial`);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Standard': return 'text-blue-600 bg-blue-50';
      case 'Detail': return 'text-purple-600 bg-purple-50';
      case 'Comparison': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-8 h-8 text-blue-600" />
            Company & Financial Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of company performance and financial health
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button 
            onClick={() => navigate('/reports/memorized/manager')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Memorized Reports
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Reports</option>
            <option value="favorites">Favorites</option>
            <option value="popular">Popular</option>
            <option value="standard">Standard</option>
            <option value="detail">Detail</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{financialReports.length}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{financialReports.filter(r => r.isFavorite).length}</div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{financialReports.filter(r => r.isPopular).length}</div>
          <div className="text-sm text-gray-600">Popular</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{financialReports.filter(r => r.type === 'Standard').length}</div>
          <div className="text-sm text-gray-600">Standard</div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${report.bgColor}`}>
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <div className="flex items-center gap-1">
                  {report.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  {report.isPopular && <TrendingUp className="w-4 h-4 text-green-500" />}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(report.type)}`}>
                  {report.type}
                </span>
                <span className="text-xs text-gray-500">
                  Last run: {report.lastRun}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunReport(report)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4" />
                  Run Report
                </button>
                <button
                  onClick={() => handlePreviewReport(report)}
                  className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCustomizeReport(report)}
                  className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Customize"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredReports.length} of {financialReports.length} reports
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/reports')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Back to Report Center
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => navigate('/reports/categories')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              All Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyFinancialReports;