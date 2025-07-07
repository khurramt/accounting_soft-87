// Mock data for QuickBooks Clone

export const mockCompanies = [
  {
    id: "1",
    name: "Acme Corp",
    legalName: "Acme Corporation LLC",
    industry: "Technology",
    lastAccessed: "2024-01-15T10:30:00Z",
    fileSize: "2.4 MB"
  },
  {
    id: "2", 
    name: "Global Solutions",
    legalName: "Global Solutions Inc",
    industry: "Consulting",
    lastAccessed: "2024-01-14T09:15:00Z",
    fileSize: "1.8 MB"
  }
];

export const mockCustomers = [
  {
    id: "1",
    name: "ABC Company",
    email: "contact@abc.com",
    phone: "(555) 123-4567",
    balance: 2500.00,
    address: "123 Main St, City, State 12345",
    type: "Company",
    terms: "Net 30",
    status: "Active"
  },
  {
    id: "2",
    name: "XYZ Corporation",
    email: "info@xyz.com", 
    phone: "(555) 987-6543",
    balance: 1750.50,
    address: "456 Oak Ave, City, State 67890",
    type: "Company",
    terms: "Net 15",
    status: "Active"
  }
];

export const mockVendors = [
  {
    id: "1",
    name: "Office Supplies Co",
    email: "orders@officesupplies.com",
    phone: "(555) 111-2222",
    balance: 850.00,
    address: "789 Business Blvd, City, State 11111",
    type: "Supplier",
    terms: "Net 30",
    status: "Active"
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    email: "billing@techsolutions.com",
    phone: "(555) 333-4444", 
    balance: 1200.00,
    address: "321 Tech Drive, City, State 22222",
    type: "Service Provider",
    terms: "Net 15",
    status: "Active"
  }
];

export const mockItems = [
  {
    id: "1",
    name: "Consulting Services",
    description: "Professional consulting services",
    type: "Service",
    rate: 150.00,
    account: "Service Revenue",
    taxCode: "Tax"
  },
  {
    id: "2",
    name: "Software License",
    description: "Annual software license",
    type: "Non-inventory Part",
    rate: 299.99,
    account: "Product Revenue",
    taxCode: "Tax"
  }
];

export const mockAccounts = [
  {
    id: "1",
    name: "Checking Account",
    type: "Bank",
    number: "1001",
    balance: 25000.00,
    description: "Primary business checking account"
  },
  {
    id: "2",
    name: "Accounts Receivable",
    type: "Accounts Receivable", 
    number: "1200",
    balance: 4250.50,
    description: "Money owed by customers"
  },
  {
    id: "3",
    name: "Office Equipment",
    type: "Fixed Asset",
    number: "1500",
    balance: 15000.00,
    description: "Computer equipment and furniture"
  }
];

export const mockTransactions = [
  {
    id: "1",
    type: "Invoice",
    customer: "ABC Company",
    date: "2024-01-15",
    number: "INV-001",
    amount: 1500.00,
    status: "Sent",
    dueDate: "2024-02-14"
  },
  {
    id: "2",
    type: "Payment",
    customer: "XYZ Corporation", 
    date: "2024-01-14",
    number: "PMT-001",
    amount: 750.00,
    status: "Deposited",
    dueDate: null
  }
];

export const mockInvoices = [
  {
    id: "1",
    number: "INV-001",
    customer: "ABC Company",
    date: "2024-01-15",
    dueDate: "2024-02-14",
    amount: 1500.00,
    status: "Sent",
    items: [
      {
        item: "Consulting Services",
        description: "Project consultation",
        qty: 10,
        rate: 150.00,
        amount: 1500.00
      }
    ]
  }
];

export const mockBills = [
  {
    id: "1",
    vendor: "Office Supplies Co",
    date: "2024-01-10",
    dueDate: "2024-02-09",
    refNo: "OS-2024-001",
    amount: 850.00,
    status: "Open"
  }
];

export const mockReports = [
  {
    category: "Company & Financial",
    reports: [
      "Profit & Loss",
      "Balance Sheet",
      "Statement of Cash Flows",
      "Trial Balance"
    ]
  },
  {
    category: "Customers & Receivables", 
    reports: [
      "A/R Aging Summary",
      "Customer Balance Summary",
      "Invoice List",
      "Sales by Customer Summary"
    ]
  },
  {
    category: "Vendors & Payables",
    reports: [
      "A/P Aging Summary", 
      "Vendor Balance Summary",
      "Bill Payment List",
      "Expenses by Vendor Summary"
    ]
  }
];

export const mockEmployees = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "(555) 555-5555",
    address: "123 Employee St, City, State 12345",
    ssn: "***-**-1234",
    payType: "Salary",
    rate: 75000.00,
    status: "Active"
  },
  {
    id: "2",
    name: "Jane Doe", 
    email: "jane.doe@company.com",
    phone: "(555) 555-5556",
    address: "456 Worker Ave, City, State 67890",
    ssn: "***-**-5678",
    payType: "Hourly",
    rate: 25.00,
    status: "Active"
  }
];