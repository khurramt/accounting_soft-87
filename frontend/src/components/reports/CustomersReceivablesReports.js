import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
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
  Activity,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const CustomersReceivablesReports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const receivablesReports = [
    {
      id: 'ar-aging-summary',
      name: 'A/R Aging Summary',
      description: 'Summary of outstanding customer balances by age',
      type: 'Summary',
      frequency: 'Weekly',
      lastRun: '2024-01-14',
      isFavorite: false,
      isPopular: true,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      route: '/reports/customize?report=A%2FR%20Aging%20Summary'
    },
    {
      id: 'ar-aging-detail',
      name: 'A/R Aging Detail',
      description: 'Detailed listing of outstanding invoices by customer',
      type: 'Detail',
      frequency: 'Weekly',
      lastRun: '2024-01-14',
      isFavorite: false,
      isPopular: false,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      route: '/reports/customize?report=A%2FR%20Aging%20Detail'
    },
    {
      id: 'customer-balance-summary',
      name: 'Customer Balance Summary',
      description: 'Current balance for each customer',
      type: 'Summary',
      frequency: 'Weekly',
      lastRun: '2024-01-12',
      isFavorite: false,
      isPopular: true,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: '/reports/customize?report=Customer%20Balance%20Summary'
    },
    {
      id: 'customer-balance-detail',
      name: 'Customer Balance Detail',
      description: 'Detailed transaction history for each customer',
      type: 'Detail',
      frequency: 'As Needed',
      lastRun: '2024-01-10',
      isFavorite: false,
      isPopular: false,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: '/reports/customize?report=Customer%20Balance%20Detail'
    },
    {
      id: 'open-invoices',
      name: 'Open Invoices',
      description: 'All unpaid customer invoices',
      type: 'Standard',
      frequency: 'Daily',
      lastRun: '2024-01-15',
      isFavorite: false,
      isPopular: true,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      route: '/reports/customize?report=Open%20Invoices'
    },
    {
      id: 'collections-report',
      name: 'Collections Report',
      description: 'Overdue invoices and collection status',
      type: 'Standard',
      frequency: 'Weekly',
      lastRun: '2024-01-14',
      isFavorite: false,
      isPopular: false,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      route: '/reports/customize?report=Collections%20Report'
    },
    {
      id: 'sales-by-customer-summary',
      name: 'Sales by Customer Summary',
      description: 'Sales performance by customer',
      type: 'Summary',
      frequency: 'Monthly',
      lastRun: '2024-01-12',
      isFavorite: false,
      isPopular: true,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      route: '/reports/customize?report=Sales%20by%20Customer%20Summary'
    },
    {
      id: 'sales-by-customer-detail',
      name: 'Sales by Customer Detail',
      description: 'Detailed sales transactions by customer',
      type: 'Detail',
      frequency: 'Monthly',
      lastRun: '2024-01-10',
      isFavorite: false,
      isPopular: false,
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      route: '/reports/customize?report=Sales%20by%20Customer%20Detail'
    },
    {
      id: 'customer-contact-list',
      name: 'Customer Contact List',
      description: 'Complete list of customer contact information',
      type: 'Standard',
      frequency: 'As Needed',
      lastRun: '2024-01-08',
      isFavorite: false,
      isPopular: false,
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      route: '/reports/customize?report=Customer%20Contact%20List'
    },
    {
      id: 'estimates-by-customer',
      name: 'Estimates by Customer',
      description: 'Summary of estimates provided to customers',
      type: 'Summary',
      frequency: 'Monthly',
      lastRun: '2024-01-05',
      isFavorite: false,
      isPopular: false,
      icon: PieChart,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      route: '/reports/customize?report=Estimates%20by%20Customer'
    }
  ];

  const filteredReports = receivablesReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'favorites' && report.isFavorite) ||
                         (selectedFilter === 'popular' && report.isPopular) ||
                         (selectedFilter === 'standard' && report.type === 'Standard') ||
                         (selectedFilter === 'summary' && report.type === 'Summary') ||
                         (selectedFilter === 'detail' && report.type === 'Detail');
    
    return matchesSearch && matchesFilter;
  });

  const handleRunReport = (report) => {
    navigate(report.route);
  };

  const handlePreviewReport = (report) => {
    navigate(`/reports/view?report=${encodeURIComponent(report.name)}&category=Customers%20%26%20Receivables`);
  };

  const handleCustomizeReport = (report) => {
    navigate(`/reports/customize?report=${encodeURIComponent(report.name)}&category=Customers%20%26%20Receivables`);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Standard': return 'text-blue-600 bg-blue-50';
      case 'Summary': return 'text-green-600 bg-green-50';
      case 'Detail': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Customers & Receivables Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Customer sales and accounts receivable reports
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
            <option value="summary">Summary</option>
            <option value="detail">Detail</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{receivablesReports.length}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{receivablesReports.filter(r => r.isPopular).length}</div>
          <div className="text-sm text-gray-600">Popular</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{receivablesReports.filter(r => r.type === 'Summary').length}</div>
          <div className="text-sm text-gray-600">Summary</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{receivablesReports.filter(r => r.type === 'Detail').length}</div>
          <div className="text-sm text-gray-600">Detail</div>
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
            Showing {filteredReports.length} of {receivablesReports.length} reports
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

export default CustomersReceivablesReports;