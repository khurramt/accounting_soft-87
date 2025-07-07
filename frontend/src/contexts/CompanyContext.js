import React, { createContext, useContext, useState, useEffect } from "react";

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
    // Load companies from localStorage
    const storedCompanies = localStorage.getItem("qb_companies");
    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies));
    }

    const storedCurrentCompany = localStorage.getItem("qb_current_company");
    if (storedCurrentCompany) {
      setCurrentCompany(JSON.parse(storedCurrentCompany));
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

  const value = {
    currentCompany,
    companies,
    selectCompany,
    createCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};