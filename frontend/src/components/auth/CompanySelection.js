import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { mockCompanies } from "../../data/mockData";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const CompanySelection = () => {
  const { companies, selectCompany } = useCompany();
  const navigate = useNavigate();

  const allCompanies = companies.length > 0 ? companies : mockCompanies;

  const handleCompanySelect = (company) => {
    selectCompany(company);
    navigate("/dashboard");
  };

  const handleCreateNew = () => {
    navigate("/setup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Company</h1>
          <p className="text-gray-600">Choose a company to work with or create a new one</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCompanySelect(company)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <Badge variant="secondary">{company.industry}</Badge>
                </div>
                <CardDescription>{company.legalName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Last accessed:</span>
                    <span>{new Date(company.lastAccessed).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File size:</span>
                    <span>{company.fileSize}</span>
                  </div>
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
            {allCompanies.slice(0, 3).map((company) => (
              <div key={company.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.legalName}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleCompanySelect(company)}>
                  Open
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySelection;