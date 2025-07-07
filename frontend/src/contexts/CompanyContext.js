import React, { createContext, useContext, useState, useEffect } from "react";
import { mockCompanies } from "../data/mockData";

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

  useEffect(() => {
    // Load companies from localStorage or use mock data
    const storedCompanies = localStorage.getItem("qb_companies");
    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies));
    } else {
      setCompanies(mockCompanies);
      localStorage.setItem("qb_companies", JSON.stringify(mockCompanies));
    }

    const storedCurrentCompany = localStorage.getItem("qb_current_company");
    if (storedCurrentCompany) {
      setCurrentCompany(JSON.parse(storedCurrentCompany));
    } else {
      // For demo purposes, auto-select first company
      const defaultCompany = mockCompanies[0];
      setCurrentCompany(defaultCompany);
      localStorage.setItem("qb_current_company", JSON.stringify(defaultCompany));
    }
  }, []);

  const selectCompany = (company) => {
    setCurrentCompany(company);
    localStorage.setItem("qb_current_company", JSON.stringify(company));
  };

  const createCompany = (companyData) => {
    const newCompany = {
      ...companyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };

    const updatedCompanies = [...companies, newCompany];
    setCompanies(updatedCompanies);
    localStorage.setItem("qb_companies", JSON.stringify(updatedCompanies));
    
    selectCompany(newCompany);
    return newCompany;
  };

  const addCompany = (companyData) => {
    return createCompany(companyData);
  };

  const value = {
    currentCompany,
    companies,
    selectCompany,
    createCompany,
    addCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};