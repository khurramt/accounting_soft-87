import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import companyService from "../services/companyService";

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isLoading: authLoading } = useAuth();

  // Load companies from backend API
  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!user) {
        console.log("User not authenticated, skipping company load");
        setLoading(false);
        return;
      }
      
      // Check if token is available
      const token = localStorage.getItem("qb_access_token");
      if (!token) {
        console.error("No authentication token available");
        setError("Authentication required");
        setLoading(false);
        return;
      }
      
      console.log("Loading companies for authenticated user...");
      const companiesData = await companyService.getCompanies();
      
      // Transform company data to ensure 'id' field exists
      const transformedCompanies = companiesData.map(company => ({
        ...company,
        id: company.company_id || company.id, // Use company_id if available, fallback to id
        name: company.company_name || company.name // Also ensure name field consistency
      }));
      
      setCompanies(transformedCompanies);
      
      // Store in localStorage for caching
      localStorage.setItem("qb_companies", JSON.stringify(transformedCompanies));
    } catch (err) {
      console.error("Error loading companies:", err);
      setError(err.message || "Failed to load companies");
      
      // Fallback to localStorage if API fails
      const storedCompanies = localStorage.getItem("qb_companies");
      if (storedCompanies) {
        setCompanies(JSON.parse(storedCompanies));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load companies when auth loading is complete and user is authenticated
    if (!authLoading && user) {
      loadCompanies();
    } else if (!authLoading && !user) {
      // User is not authenticated, clear state
      setCompanies([]);
      setCurrentCompany(null);
      setLoading(false);
    }

    // Load current company from localStorage only if user is authenticated
    if (user) {
      const storedCurrentCompany = localStorage.getItem("qb_current_company");
      if (storedCurrentCompany) {
        setCurrentCompany(JSON.parse(storedCurrentCompany));
      }
    }
  }, [user, authLoading]);

  const selectCompany = (company) => {
    // Ensure the company object has the required fields
    const transformedCompany = {
      ...company,
      id: company.company_id || company.id, // Ensure id field exists
      name: company.company_name || company.name // Ensure name field exists
    };
    
    setCurrentCompany(transformedCompany);
    localStorage.setItem("qb_current_company", JSON.stringify(transformedCompany));
  };

  const createCompany = async (companyData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newCompany = await companyService.createCompany(companyData);
      
      // Update local state
      const updatedCompanies = [...companies, newCompany];
      setCompanies(updatedCompanies);
      localStorage.setItem("qb_companies", JSON.stringify(updatedCompanies));
      
      // Select the newly created company
      selectCompany(newCompany);
      
      return newCompany;
    } catch (err) {
      console.error("Error creating company:", err);
      setError(err.message || "Failed to create company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCompany = await companyService.updateCompany(companyId, updateData);
      
      // Update local state
      const updatedCompanies = companies.map(company => 
        company.id === companyId ? updatedCompany : company
      );
      setCompanies(updatedCompanies);
      localStorage.setItem("qb_companies", JSON.stringify(updatedCompanies));
      
      // Update current company if it was the one being updated
      if (currentCompany?.id === companyId) {
        setCurrentCompany(updatedCompany);
        localStorage.setItem("qb_current_company", JSON.stringify(updatedCompany));
      }
      
      return updatedCompany;
    } catch (err) {
      console.error("Error updating company:", err);
      setError(err.message || "Failed to update company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (companyId) => {
    try {
      setLoading(true);
      setError(null);
      
      await companyService.deleteCompany(companyId);
      
      // Update local state
      const updatedCompanies = companies.filter(company => company.id !== companyId);
      setCompanies(updatedCompanies);
      localStorage.setItem("qb_companies", JSON.stringify(updatedCompanies));
      
      // Clear current company if it was the one being deleted
      if (currentCompany?.id === companyId) {
        setCurrentCompany(null);
        localStorage.removeItem("qb_current_company");
      }
      
      return true;
    } catch (err) {
      console.error("Error deleting company:", err);
      setError(err.message || "Failed to delete company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshCompanies = () => {
    loadCompanies();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentCompany,
    companies,
    loading,
    error,
    selectCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies,
    clearError,
    // Legacy method for backward compatibility
    addCompany: createCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};