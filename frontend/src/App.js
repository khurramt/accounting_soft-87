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
import PayrollCenter from "./components/payroll/PayrollCenter";
import TimeTracking from "./components/time/TimeTracking";
import CompanyInfo from "./components/company/CompanyInfo";
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
        <Route path="banking/deposits/new" element={<MakeDeposit />} />
        <Route path="banking/transfers/new" element={<TransferFunds />} />
        <Route path="banking/reconcile" element={<BankReconciliation />} />
        
        {/* Reports */}
        <Route path="reports" element={<ReportCenter />} />
        
        {/* Payroll */}
        <Route path="payroll" element={<PayrollCenter />} />
        
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