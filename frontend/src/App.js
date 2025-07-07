import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CompanyProvider, useCompany } from "./contexts/CompanyContext";
import Login from "./components/auth/Login";
import CompanySelection from "./components/auth/CompanySelection";
import CompanySetup from "./components/auth/CompanySetup";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/dashboard/Dashboard";
import CustomerCenter from "./components/customers/CustomerCenter";
import CreateInvoice from "./components/customers/CreateInvoice";
import ReceivePayment from "./components/customers/ReceivePayment";
import CreateSalesReceipt from "./components/customers/CreateSalesReceipt";
import VendorCenter from "./components/vendors/VendorCenter";
import EnterBills from "./components/vendors/EnterBills";
import PayBills from "./components/vendors/PayBills";
import WriteCheck from "./components/vendors/WriteCheck";
import ItemsList from "./components/items/ItemsList";
import ChartOfAccounts from "./components/banking/ChartOfAccounts";
import BankFeeds from "./components/banking/BankFeeds";
import MakeDeposit from "./components/banking/MakeDeposit";
import TransferFunds from "./components/banking/TransferFunds";
import BankReconciliation from "./components/banking/BankReconciliation";
import ReportCenter from "./components/reports/ReportCenter";
import ReportCustomization from "./components/reports/ReportCustomization";
import MemorizedReports from "./components/reports/MemorizedReports";
import ReportViewer from "./components/reports/ReportViewer";
import PayrollCenter from "./components/payroll/PayrollCenter";
import EmployeeSetup from "./components/payroll/EmployeeSetup";
import RunPayroll from "./components/payroll/RunPayroll";
import TimeTracking from "./components/time/TimeTracking";
import CompanyInfo from "./components/company/CompanyInfo";
import TransactionMatching from "./components/banking/TransactionMatching";
import ProfitLossReport from "./components/reports/ProfitLossReport";
import BalanceSheetReport from "./components/reports/BalanceSheetReport";
import CreditCardCharges from "./components/banking/CreditCardCharges";
import AdvancedBankFeeds from "./components/banking/AdvancedBankFeeds";
import CashFlowReport from "./components/reports/CashFlowReport";
import ReportCategories from "./components/reports/ReportCategories";
import PayLiabilities from "./components/payroll/PayLiabilities";
import PayrollForms from "./components/payroll/PayrollForms";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { currentCompany } = useCompany();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!currentCompany) {
    return <Navigate to="/select-company" replace />;
  }
  
  return children;
};

// App Router Component
const AppRouter = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/select-company" replace /> : <Login />} />
      <Route path="/select-company" element={
        user ? <CompanySelection /> : <Navigate to="/login" replace />
      } />
      <Route path="/setup" element={
        user ? <CompanySetup /> : <Navigate to="/login" replace />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Customer Routes */}
        <Route path="customers" element={<CustomerCenter />} />
        <Route path="customers/invoice/new" element={<CreateInvoice />} />
        <Route path="customers/payments/new" element={<ReceivePayment />} />
        <Route path="customers/sales-receipt/new" element={<CreateSalesReceipt />} />
        
        {/* Vendor Routes */}
        <Route path="vendors" element={<VendorCenter />} />
        <Route path="vendors/bills/new" element={<EnterBills />} />
        <Route path="vendors/bills/pay" element={<PayBills />} />
        <Route path="vendors/checks/new" element={<WriteCheck />} />
        
        {/* Items & Inventory */}
        <Route path="items" element={<ItemsList />} />
        
        {/* Banking Routes */}
        <Route path="banking" element={<Navigate to="/accounts" replace />} />
        <Route path="accounts" element={<ChartOfAccounts />} />
        <Route path="banking/feeds" element={<BankFeeds />} />
        <Route path="banking/feeds/advanced" element={<AdvancedBankFeeds />} />
        <Route path="banking/transaction-matching" element={<TransactionMatching />} />
        <Route path="banking/deposits/new" element={<MakeDeposit />} />
        <Route path="banking/transfers/new" element={<TransferFunds />} />
        <Route path="banking/reconcile" element={<BankReconciliation />} />
        <Route path="banking/credit-cards/new" element={<CreditCardCharges />} />
        
        {/* Reports */}
        <Route path="reports" element={<ReportCenter />} />
        <Route path="reports/customize" element={<ReportCustomization />} />
        <Route path="reports/memorized" element={<MemorizedReports />} />
        <Route path="reports/scheduled" element={<MemorizedReports />} />
        <Route path="reports/view" element={<ReportViewer />} />
        <Route path="reports/profit-loss" element={<ProfitLossReport />} />
        <Route path="reports/balance-sheet" element={<BalanceSheetReport />} />
        
        {/* Payroll */}
        <Route path="payroll" element={<PayrollCenter />} />
        <Route path="payroll/setup" element={<EmployeeSetup />} />
        <Route path="payroll/run" element={<RunPayroll />} />
        <Route path="payroll/run/:payrollId" element={<RunPayroll />} />
        <Route path="employees/new" element={<EmployeeSetup />} />
        <Route path="employees/:employeeId" element={<EmployeeSetup />} />
        <Route path="employees/:employeeId/edit" element={<EmployeeSetup />} />
        
        {/* Time Tracking */}
        <Route path="time-tracking" element={<TimeTracking />} />
        
        {/* Company Management */}
        <Route path="company/info" element={<CompanyInfo />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <BrowserRouter>
          <div className="App">
            <AppRouter />
          </div>
        </BrowserRouter>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;