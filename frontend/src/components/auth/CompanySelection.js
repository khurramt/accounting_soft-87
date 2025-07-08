import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const CompanySelection = () => {
  const { companies, selectCompany, loading, error, refreshCompanies, clearError } = useCompany();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error("Company selection error:", error);
    }
  }, [error]);

  const handleCompanySelect = (company) => {
    selectCompany(company);
    navigate("/dashboard");
  };

  const handleCreateNew = () => {
    navigate("/setup");
  };

  const handleRefresh = () => {
    clearError();
    refreshCompanies();
  };

  const formatLastAccessed = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return "Unknown";
    }
  };

  const getFileSize = (company) => {
    return company.fileSize || "Unknown";
  };

  const getIndustry = (company) => {
    return company.industry || "General";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Company</h1>
            <p className="text-gray-600">Loading your companies...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Company</h1>
            <p className="text-red-600">Error loading companies: {error}</p>
          </div>
          <div className="text-center">
            <Button onClick={handleRefresh} className="mr-4">
              Retry
            </Button>
            <Button onClick={handleCreateNew} variant="outline">
              Create New Company
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Company</h1>
          <p className="text-gray-600">Choose a company to work with or create a new one</p>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No companies found</div>
            <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700">
              Create Your First Company
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCompanySelect(company)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge variant="secondary">{getIndustry(company)}</Badge>
                    </div>
                    <CardDescription>{company.legal_name || company.legalName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Last accessed:</span>
                        <span>{formatLastAccessed(company.last_accessed || company.lastAccessed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>File size:</span>
                        <span>{getFileSize(company)}</span>
                      </div>
                      {company.status && (
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                            {company.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" className="flex-1">Open</Button>
                      <Button size="sm" variant="outline">Backup</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center space-y-4">
              <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700">
                Create New Company
              </Button>
              <div className="space-x-4">
                <Button variant="outline">Open Existing File</Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Recent Files</h3>
              <div className="space-y-2">
                {companies.slice(0, 3).map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.legal_name || company.legalName}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleCompanySelect(company)}>
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanySelection;