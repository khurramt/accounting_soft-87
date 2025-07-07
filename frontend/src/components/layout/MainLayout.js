import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  User, 
  LogOut,
  Home,
  Users,
  Building,
  Package,
  CreditCard,
  BarChart3,
  DollarSign,
  Clock,
  FileText,
  ChevronDown
} from "lucide-react";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { currentCompany } = useCompany();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
      children: []
    },
    {
      title: "Customers",
      icon: Users,
      path: "/customers",
      children: [
        { title: "Customer Center", path: "/customers" },
        { title: "Create Invoice", path: "/customers/invoice/new" },
        { title: "Receive Payments", path: "/customers/payments" },
        { title: "Create Sales Receipt", path: "/customers/sales-receipt/new" },
        { title: "Create Statement", path: "/customers/statement/new" },
        { title: "Income Tracker", path: "/customers/income-tracker" }
      ]
    },
    {
      title: "Vendors",
      icon: Building,
      path: "/vendors",
      children: [
        { title: "Vendor Center", path: "/vendors" },
        { title: "Enter Bills", path: "/vendors/bills/new" },
        { title: "Pay Bills", path: "/vendors/bills/pay" },
        { title: "Write Checks", path: "/vendors/checks/new" },
        { title: "Purchase Orders", path: "/vendors/purchase-orders" },
        { title: "Bill Tracker", path: "/vendors/bill-tracker" }
      ]
    },
    {
      title: "Items & Services",
      icon: Package,
      path: "/items",
      children: [
        { title: "Items & Services", path: "/items" },
        { title: "Inventory Center", path: "/inventory" }
      ]
    },
    {
      title: "Banking",
      icon: CreditCard,
      path: "/banking",
      children: [
        { title: "Chart of Accounts", path: "/accounts" },
        { title: "Bank Feeds", path: "/banking/feeds" },
        { title: "Advanced Bank Feeds", path: "/banking/feeds/advanced" },
        { title: "Make Deposits", path: "/banking/deposits/new" },
        { title: "Transfer Funds", path: "/banking/transfers/new" },
        { title: "Reconcile", path: "/banking/reconcile" },
        { title: "Credit Card Charges", path: "/banking/credit-cards/new" }
      ]
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/reports",
      children: [
        { title: "Report Center", path: "/reports" },
        { title: "Report Categories", path: "/reports/categories" },
        { title: "Cash Flow Reports", path: "/reports/cash-flow" },
        { title: "Company & Financial", path: "/reports/company" },
        { title: "Customers & Receivables", path: "/reports/customers" },
        { title: "Vendors & Payables", path: "/reports/vendors" }
      ]
    },
    {
      title: "Payroll",
      icon: DollarSign,
      path: "/payroll",
      children: [
        { title: "Payroll Center", path: "/payroll" },
        { title: "Run Payroll", path: "/payroll/run" },
        { title: "Pay Liabilities", path: "/payroll/liabilities" },
        { title: "Payroll Forms", path: "/payroll/forms" }
      ]
    },
    {
      title: "Time Tracking",
      icon: Clock,
      path: "/time-tracking",
      children: [
        { title: "Time Tracking", path: "/time-tracking" },
        { title: "Weekly Timesheet", path: "/time-tracking/weekly" },
        { title: "Single Activity", path: "/time-tracking/single" }
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white shadow-lg transition-all duration-300 overflow-hidden`}>
        <div className={`w-64 ${sidebarOpen ? 'block' : 'hidden'} overflow-y-auto h-full`}>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">QuickBooks</h2>
                {currentCompany && (
                  <p className="text-sm text-gray-600 truncate">{currentCompany.name}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="mt-4">
          {navigationItems.map((item) => (
            <div key={item.title} className="px-2">
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{React.createElement(item.icon)}</span>
                {sidebarOpen && <span>{item.title}</span>}
              </button>

              {/* Submenu */}
              {item.subItems && (
                <div className={`ml-6 mt-1 space-y-1 ${sidebarOpen ? 'block' : 'hidden'}`}>
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.title}
                      onClick={() => navigate(subItem.path)}
                      className={`w-full flex items-center px-3 py-2 text-left text-sm rounded transition-colors ${
                        isActive(subItem.path)
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {subItem.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search transactions, customers, vendors..."
                  className="pl-10 w-96"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="sm">
                <HelpCircle className="w-5 h-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/company/info")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Company Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;