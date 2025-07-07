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
import VendorCenter from "./components/vendors/VendorCenter";
import ItemsList from "./components/items/ItemsList";
import ChartOfAccounts from "./components/banking/ChartOfAccounts";
import ReportCenter from "./components/reports/ReportCenter";
import PayrollCenter from "./components/payroll/PayrollCenter";
import TimeTracking from "./components/time/TimeTracking";
import CreateInvoice from "./components/customers/CreateInvoice";
import EnterBills from "./components/vendors/EnterBills";
import BankFeeds from "./components/banking/BankFeeds";
import CompanyInfo from "./components/company/CompanyInfo";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  
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
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/select-company" element={<CompanySelection />} />
      <Route path="/setup" element={<CompanySetup />} />
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<CustomerCenter />} />
        <Route path="customers/invoice/new" element={<CreateInvoice />} />
        <Route path="vendors" element={<VendorCenter />} />
        <Route path="vendors/bills/new" element={<EnterBills />} />
        <Route path="items" element={<ItemsList />} />
        <Route path="accounts" element={<ChartOfAccounts />} />
        <Route path="banking/feeds" element={<BankFeeds />} />
        <Route path="reports" element={<ReportCenter />} />
        <Route path="payroll" element={<PayrollCenter />} />
        <Route path="time-tracking" element={<TimeTracking />} />
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