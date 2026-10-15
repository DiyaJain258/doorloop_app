import { 
  Property, Unit, Building, Tenant, Lead, Application, Lease, Renewal, Owner,
  RentPayment, Transaction, MaintenanceRequest, Vendor, Document, Report, 
  DashboardMetrics, DashboardChartData, Invoice, Charge, SecurityDeposit,
  PaymentPlan, Refund, CoAAccount, JournalEntry, JournalEntryLine, GeneralLedgerRecord, BankAccount,
  ExpenseRecord, IncomeRecord, VendorBill, RecurringTransaction, Budget, OwnerStatement, TaxRate,
  WorkOrder, PreventiveTask, MaintenanceAsset, InventoryItem, VendorInvoice, InspectionRecord,
  OwnerDistribution, OwnerDocument, OwnerMessage, OwnerSupportTicket,
  TenantVisitor, TenantPackage, TenantInsurancePolicy, TenantAnnouncement, TenantSupportTicket,
  CommMessage, CommEmail, CommSMS, CommAnnouncement, CommCampaign, CommTemplate, CommContact, CommConversation, CommNotification, CommActivity,
  DmsDocument, DmsFolder, DmsTemplate, DmsSignatureRequest, DmsFileVersion, DmsPermission, DmsDocumentRequest, DmsAuditRecord, DmsShare,
  PropertyAnalyticsRecord, TenantAnalyticsRecord, VendorPerformanceRecord,
  ReportDefinition, SavedReport, ScheduledReport, CustomDashboard, ExportRecord, ForecastDataPoint, Violation, ScreeningCheck
} from '../types';

// Helper to simulate delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Database Seeder ---
let renewals: Renewal[] = [];
let rentPayments: RentPayment[] = [];
let transactions: Transaction[] = [];
let maintenanceRequests: MaintenanceRequest[] = [];
let vendors: Vendor[] = [];
let documents: Document[] = [];
let reports: Report[] = [];
let settings = {
  companyName: 'Apex Property Management',
  contactEmail: 'contact@apexpm.com',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  enableSmsNotifications: true,
  enableEmailNotifications: true,
};

let invoices: Invoice[] = [];
let charges: Charge[] = [];
let deposits: SecurityDeposit[] = [];
let paymentPlans: PaymentPlan[] = [];
let refunds: Refund[] = [];
let tenantOutstandingBalance = 1850.00;

let coaAccounts: CoAAccount[] = [];
let journalEntries: JournalEntry[] = [];
let generalLedger: GeneralLedgerRecord[] = [];
let bankAccounts: BankAccount[] = [];
let expensesList: ExpenseRecord[] = [];
let incomeList: IncomeRecord[] = [];
let vendorBillsList: VendorBill[] = [];
let recurringTransactions: RecurringTransaction[] = [];
let budgets: Budget[] = [];
let ownerStatementsList: OwnerStatement[] = [];
let taxRates: TaxRate[] = [];

let workOrders: WorkOrder[] = [];
let preventiveTasks: PreventiveTask[] = [];
let assetsList: MaintenanceAsset[] = [];
let inventoryItems: InventoryItem[] = [];
let vendorInvoicesList: VendorInvoice[] = [];
let inspectionsList: InspectionRecord[] = [];

let ownerDistributionsList: OwnerDistribution[] = [];
let ownerDocumentsList: OwnerDocument[] = [];
let ownerConversationsList: OwnerMessage[] = [];
let ownerSupportTicketsList: OwnerSupportTicket[] = [];
let tenantVisitorsList: TenantVisitor[] = [];
let tenantPackagesList: TenantPackage[] = [];
let tenantInsurancePoliciesList: TenantInsurancePolicy[] = [];
let tenantAnnouncementsList: TenantAnnouncement[] = [];
let tenantSupportTicketsList: TenantSupportTicket[] = [];
let tenantDocumentsList: any[] = [];
let tenantConversationsList: OwnerMessage[] = [];

let commMessagesList: CommMessage[] = [];
let commEmailsList: CommEmail[] = [];
let commSMSsList: CommSMS[] = [];
let commAnnouncementsList: CommAnnouncement[] = [];
let commCampaignsList: CommCampaign[] = [];
let commTemplatesList: CommTemplate[] = [];
let commContactsList: CommContact[] = [];
let commConversationsList: CommConversation[] = [];
let commNotificationsList: CommNotification[] = [];
let commActivitiesList: CommActivity[] = [];

// Phase 10 - Document Management System
let dmsDocumentsList: DmsDocument[] = [];
let dmsFoldersList: DmsFolder[] = [];
let dmsTemplatesList: DmsTemplate[] = [];
let dmsSignaturesList: DmsSignatureRequest[] = [];
let dmsVersionsList: DmsFileVersion[] = [];
let dmsAuditList: DmsAuditRecord[] = [];
let dmsSharesList: DmsShare[] = [];
let dmsRequestsList: DmsDocumentRequest[] = [];
let dmsPermissionsList: DmsPermission[] = [];

// Phase 11 — Analytics & BI
let rptPropertyAnalytics: PropertyAnalyticsRecord[] = [];
let rptTenantAnalytics: TenantAnalyticsRecord[] = [];
let rptVendorPerformance: VendorPerformanceRecord[] = [];
let rptSavedReports: SavedReport[] = [];
let rptScheduledReports: ScheduledReport[] = [];
let rptCustomDashboards: CustomDashboard[] = [];
let rptExports: ExportRecord[] = [];
let rptForecasts: ForecastDataPoint[] = [];


// 1. Properties, Buildings, Units (from Phase 2)
let owners: Owner[] = [
  { id: 'own-1', firstName: 'William', lastName: 'Anderson', email: 'bill.a@investments.com', phone: '(212) 555-0122', propertiesOwnedCount: 4, payoutMethod: 'ACH/Direct Deposit' },
  { id: 'own-2', firstName: 'Patricia', lastName: 'Thomas', email: 'patricia.t@example.com', phone: '(786) 555-0144', propertiesOwnedCount: 3, payoutMethod: 'Wire Transfer' },
  { id: 'own-3', firstName: 'Robert', lastName: 'Miller', email: 'robert.m@example.com', phone: '(512) 555-0199', propertiesOwnedCount: 3, payoutMethod: 'Check' },
];

const propNames = [
  { name: 'Oakridge Heights', type: 'Apartment' },
  { name: 'Downtown Plaza', type: 'Commercial' },
  { name: 'Sunset Villas', type: 'Apartment' },
  { name: 'Northside Industrial', type: 'Commercial' },
  { name: 'Summit Townhomes', type: 'Multi Family' },
  { name: 'Lakeside Estates', type: 'HOA' },
  { name: 'Pinecrest Cabins', type: 'Single Family' },
  { name: 'Canyon Ridge Complex', type: 'Apartment' },
  { name: 'Legacy Business Park', type: 'Commercial' },
  { name: 'Sycamore Gardens', type: 'Multi Family' }
] as const;

let properties: Property[] = propNames.map((p, idx) => {
  const owner = owners[idx % owners.length];
  return {
    id: `prop-${idx + 1}`,
    name: p.name,
    type: p.type,
    status: 'Active',
    owner: `${owner.firstName} ${owner.lastName}`,
    ownershipPercentage: 100,
    managementCompany: 'Apex Property Management',
    address: `${100 + idx * 12} Main St, Austin, TX, USA, 7870${idx}`,
    streetAddress: `${100 + idx * 12} Main St`,
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    zip: `7870${idx}`,
    unitsCount: 20, // 20 units per property
    occupiedUnits: 15,
    occupancyRate: 75,
    monthlyRevenue: 22000,
    yearBuilt: 2000 + idx,
    totalBuildings: 3,
    squareFootage: 18000,
    purchasePrice: 2000000,
    currentValue: 2400000,
    monthlyExpenses: 4000,
    createdAt: '2024-01-01'
  };
});

let buildings: Building[] = [];
properties.forEach((prop) => {
  for (let b = 1; b <= 3; b++) {
    buildings.push({
      id: `bld-${prop.id}-${b}`,
      propertyId: prop.id,
      propertyName: prop.name,
      name: `Building ${String.fromCharCode(64 + b)}`,
      floors: 3,
      unitsCount: 0,
      occupancyRate: 80,
    });
  }
});

let units: Unit[] = [];
properties.forEach((prop) => {
  const propBlds = buildings.filter((b) => b.propertyId === prop.id);
  for (let u = 1; u <= 20; u++) {
    const bld = propBlds[u % propBlds.length];
    const floor = Math.ceil(u / 6);
    const id = `unit-${prop.id}-${u}`;
    const statusVal: ('Occupied' | 'Vacant' | 'Reserved' | 'Under Maintenance') = 
      u <= 15 ? 'Occupied' : u === 16 || u === 17 ? 'Vacant' : u === 18 ? 'Reserved' : 'Under Maintenance';

    units.push({
      id,
      propertyId: prop.id,
      propertyName: prop.name,
      buildingId: bld.id,
      buildingName: bld.name,
      unitNumber: `${floor}0${u % 6 || 6}`,
      floor,
      bedrooms: (u % 3) + 1,
      bathrooms: (u % 2) + 1,
      squareFootage: 700 + (u % 3) * 150,
      rentAmount: 1400 + (u % 4) * 150,
      securityDeposit: 1400 + (u % 4) * 150,
      availabilityDate: '2026-08-01',
      status: statusVal
    });
    bld.unitsCount += 1;
  }
});

// Update Property/Building Stats
properties.forEach((prop) => {
  const propUnits = units.filter((u) => u.propertyId === prop.id);
  const total = propUnits.length;
  const occupied = propUnits.filter((u) => u.status === 'Occupied').length;
  prop.unitsCount = total;
  prop.occupiedUnits = occupied;
  prop.occupancyRate = Math.round((occupied / total) * 100);
  prop.monthlyRevenue = propUnits.filter((u) => u.status === 'Occupied').reduce((sum, u) => sum + u.rentAmount, 0);
});

// 2. Programmatic Tenants (Minimum 200)
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

let tenants: Tenant[] = [];
for (let t = 1; t <= 210; t++) {
  const fn = firstNames[t % firstNames.length];
  const ln = lastNames[t % lastNames.length];
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${t}@example.com`;
  
  // Distribute tenants to occupied units
  const matchedUnit = units[t - 1]; // first 210 units (since we have 10 properties * 20 units = 200 units, let's bind up to unit limit)
  const hasUnit = !!matchedUnit;
  
  const status: ('Active' | 'Inactive' | 'Pending') = 
    t <= 170 ? 'Active' : t <= 195 ? 'Pending' : 'Inactive';

  tenants.push({
    id: `ten-${t}`,
    firstName: fn,
    lastName: ln,
    email,
    phone: `(512) 555-0${100 + t}`,
    unitId: hasUnit ? matchedUnit.id : undefined,
    unitNumber: hasUnit ? matchedUnit.unitNumber : undefined,
    propertyId: hasUnit ? matchedUnit.propertyId : undefined,
    propertyName: hasUnit ? matchedUnit.propertyName : undefined,
    status
  });

  if (hasUnit) {
    matchedUnit.tenantId = `ten-${t}`;
    matchedUnit.tenantName = `${fn} ${ln}`;
  }
}

// 3. Leases (Minimum 250)
let leases: Lease[] = [];
for (let l = 1; l <= 260; l++) {
  const tenantIdx = l % tenants.length;
  const tenant = tenants[tenantIdx];
  const unitIdx = l % units.length;
  const unit = units[unitIdx];

  const status: ('Active' | 'Pending' | 'Expired' | 'Terminated') =
    l <= 200 ? 'Active' : l <= 230 ? 'Pending' : l <= 250 ? 'Expired' : 'Terminated';

  leases.push({
    id: `lease-100${l}`,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    propertyId: unit.propertyId,
    propertyName: unit.propertyName,
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    startDate: `2025-${(l % 12) + 1}-01`,
    endDate: `2026-${(l % 12) + 1}-31`,
    rentAmount: unit.rentAmount,
    depositAmount: unit.securityDeposit,
    status
  });
}

// 4. Applications (Minimum 150)
let applications: Application[] = [];
for (let a = 1; a <= 160; a++) {
  const fn = firstNames[a % firstNames.length];
  const ln = lastNames[a % lastNames.length];
  const prop = properties[a % properties.length];
  const unit = units[a % units.length];

  const status: ('Pending' | 'Approved' | 'Rejected') =
    a <= 90 ? 'Pending' : a <= 130 ? 'Approved' : 'Rejected';

  applications.push({
    id: `app-500${a}`,
    tenantName: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@app.com`,
    propertyName: prop.name,
    unitNumber: unit.unitNumber,
    status,
    submittedDate: `2026-06-${(a % 28) + 1}`,
    rentProposed: unit.rentAmount + 50
  });
}

// 5. Leads (Minimum 120)
let leads: Lead[] = [];
const sources = ['Zillow', 'Apartments.com', 'Website', 'Referral', 'Walk-in', 'Craigslist'];
const leadStatuses = ['New', 'Contacted', 'Tour Scheduled', 'Application Sent', 'Negotiating', 'Lease Signed', 'Lost'];

for (let d = 1; d <= 130; d++) {
  const fn = firstNames[d % firstNames.length];
  const ln = lastNames[d % lastNames.length];
  const prop = properties[d % properties.length];
  
  const status = leadStatuses[d % leadStatuses.length];

  leads.push({
    id: `lead-600${d}`,
    firstName: fn,
    lastName: ln,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@lead.com`,
    phone: `(512) 555-7${100 + d}`,
    propertyOfInterestId: prop.id,
    propertyName: prop.name,
    status: status as any,
    createdAt: `2026-07-${(d % 18) + 1}`,
  });
}

// Placeholder notifications store
let notifications = [
  { id: 'notif-1', title: 'Application Submitted', message: 'David Miller submitted application for Unit 201', time: '10m ago', read: false, type: 'info' },
  { id: 'notif-2', title: 'Lease Expiring', message: 'Jane Smith lease expires in 12 days', time: '1h ago', read: false, type: 'warning' },
];

// 6. Payments (Minimum 1000)
for (let p = 1; p <= 1020; p++) {
  const tenant = tenants[p % tenants.length];
  const property = properties[p % properties.length];
  const unit = units[p % units.length];
  
  const amount = 1200 + (p % 6) * 100;
  const status: ('Pending' | 'Paid' | 'Partially Paid' | 'Failed' | 'Refunded' | 'Voided') = 
    p <= 900 ? 'Paid' : p <= 970 ? 'Pending' : p <= 990 ? 'Partially Paid' : 'Failed';
  const method = ['ACH', 'Credit Card', 'Bank Transfer', 'Cash', 'Check'][p % 5];

  rentPayments.push({
    id: `pay-800${p}`,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    propertyId: property.id,
    propertyName: property.name,
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    leaseId: `lease-100${p % 10 + 1}`,
    amount,
    dueDate: `2026-07-${(p % 28) + 1}`,
    paidDate: status === 'Paid' ? `2026-07-${(p % 28) + 1}` : undefined,
    status,
    paymentMethod: method,
    referenceNumber: `REF-${200000 + p}`,
    createdBy: 'Manager',
  });
}

// 7. Invoices (Minimum 500)
for (let i = 1; i <= 520; i++) {
  const tenant = tenants[i % tenants.length];
  const property = properties[i % properties.length];
  const unit = units[i % units.length];
  
  const amount = 1400 + (i % 5) * 100;
  const status: ('Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled') =
    i <= 350 ? 'Paid' : i <= 450 ? 'Sent' : i <= 500 ? 'Overdue' : 'Draft';

  invoices.push({
    id: `inv-900${i}`,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    propertyId: property.id,
    propertyName: property.name,
    unitNumber: unit.unitNumber,
    dueDate: `2026-07-${(i % 28) + 1}`,
    amount,
    paidAmount: status === 'Paid' ? amount : 0,
    balance: status === 'Paid' ? 0 : amount,
    status,
    lineItems: [
      { description: 'Rent Charge', amount: amount * 0.9 },
      { description: 'Utilities Reimbursement', amount: amount * 0.1 },
    ],
  });
}

// 8. Charges (Minimum 300)
for (let c = 1; c <= 310; c++) {
  const tenant = tenants[c % tenants.length];
  const property = properties[c % properties.length];
  
  const types = ['Rent', 'Utility', 'Parking', 'Pet', 'Storage', 'Late Fee'];
  const type = types[c % types.length];
  const frequency: ('One Time' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually') = 
    c % 10 === 0 ? 'One Time' : 'Monthly';

  charges.push({
    id: `chg-300${c}`,
    name: `${type} Assessment`,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    propertyId: property.id,
    propertyName: property.name,
    frequency,
    amount: 50 + (c % 8) * 50,
    status: c % 12 === 0 ? 'Disabled' : 'Active',
    type,
  });
}

// 9. Deposits (Minimum 250)
for (let d = 1; d <= 260; d++) {
  const tenant = tenants[d % tenants.length];
  const property = properties[d % properties.length];
  
  const amount = 1200 + (d % 5) * 100;
  const status: ('Held' | 'Partially Refunded' | 'Refunded' | 'Forfeited') = 
    d <= 200 ? 'Held' : d <= 230 ? 'Refunded' : 'Partially Refunded';

  deposits.push({
    id: `dep-400${d}`,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    propertyId: property.id,
    propertyName: property.name,
    amount,
    heldBalance: status === 'Held' ? amount : status === 'Partially Refunded' ? amount * 0.5 : 0,
    refundableAmount: status === 'Held' ? amount : 0,
    status,
  });
}

// 10. Payment Plans (Minimum 150)
for (let p = 1; p <= 160; p++) {
  const tenant = tenants[p % tenants.length];
  const status: ('Active' | 'Completed' | 'Defaulted' | 'Cancelled') =
    p <= 100 ? 'Active' : p <= 140 ? 'Completed' : 'Defaulted';

  paymentPlans.push({
    id: `plan-700${p}`,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    originalBalance: 3000,
    remainingBalance: status === 'Completed' ? 0 : 1500,
    installments: 6,
    nextDueDate: `2026-08-${(p % 28) + 1}`,
    status,
  });
}

// 11. Refunds (Minimum 100)
for (let r = 1; r <= 110; r++) {
  const tenant = tenants[r % tenants.length];
  refunds.push({
    id: `ref-200${r}`,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    paymentId: `pay-800${r}`,
    amount: 150,
    method: 'ACH',
    status: r <= 90 ? 'Processed' : 'Pending',
    date: `2026-07-${(r % 28) + 1}`,
  });
}

// 12. Chart of Accounts (Minimum 500)
const accountTypes = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'] as const;
for (let a = 1; a <= 505; a++) {
  const type = accountTypes[a % accountTypes.length];
  coaAccounts.push({
    id: `coa-${a}`,
    accountNumber: (1000 + a).toString(),
    accountName: `${type} Account Subclass ${a}`,
    accountType: type,
    currency: 'USD',
    status: 'Active',
    balance: 5000 + (a % 10) * 1000,
  });
}

// 13. Bank Accounts (Minimum 100)
const banks = ['Chase', 'Bank of America', 'Wells Fargo', 'PNC', 'Citibank'];
for (let b = 1; b <= 105; b++) {
  const bank = banks[b % banks.length];
  bankAccounts.push({
    id: `bank-${b}`,
    bankName: bank,
    accountName: `${bank} Primary Operating ${b}`,
    accountNumber: `******${1000 + b}`,
    accountType: b % 3 === 0 ? 'Savings' : b % 5 === 0 ? 'Escrow' : 'Checking',
    openingBalance: 10000,
    currentBalance: 25000 + (b * 150),
    currency: 'USD',
    status: 'Active',
  });
}

// 14. Expenses (Minimum 3000)
const expCategories = ['Repairs', 'Maintenance', 'Utilities', 'Insurance', 'Property Taxes', 'Payroll', 'Cleaning', 'Landscaping', 'Marketing', 'Legal', 'Office'];
for (let e = 1; e <= 3020; e++) {
  const prop = properties[e % properties.length];
  const cat = expCategories[e % expCategories.length];
  expensesList.push({
    id: `exp-500${e}`,
    vendorName: `Vendor Partner ${e % 15 + 1}`,
    propertyId: prop.id,
    propertyName: prop.name,
    category: cat,
    date: `2026-07-${(e % 28) + 1}`,
    amount: 100 + (e % 10) * 80,
    tax: 10 + (e % 5) * 5,
    paymentMethod: ['Bank Wire', 'ACH', 'Credit Card'][e % 3],
    status: e % 10 === 0 ? 'Pending Approval' : 'Approved',
  });
}

// 15. Income Records (Minimum 2000)
const incCategories = ['Rent', 'Utilities', 'Late Fees', 'Parking', 'Storage', 'Pet Fees'];
for (let i = 1; i <= 2020; i++) {
  const prop = properties[i % properties.length];
  const tenant = tenants[i % tenants.length];
  const cat = incCategories[i % incCategories.length];
  incomeList.push({
    id: `inc-600${i}`,
    date: `2026-07-${(i % 28) + 1}`,
    propertyId: prop.id,
    propertyName: prop.name,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    category: cat,
    amount: 50 + (i % 8) * 100,
    status: i % 15 === 0 ? 'Pending' : 'Cleared',
  });
}

// 16. Vendor Bills (Minimum 1000)
for (let v = 1; v <= 1020; v++) {
  const amount = 500 + (v % 6) * 150;
  vendorBillsList.push({
    id: `bill-700${v}`,
    billNumber: `BILL-${100000 + v}`,
    vendorName: `Vendor Partner ${v % 15 + 1}`,
    dueDate: `2026-08-${(v % 28) + 1}`,
    amount,
    balance: v % 3 === 0 ? 0 : amount,
    status: v % 3 === 0 ? 'Paid' : 'Approved',
    lineItems: [
      { description: 'Contractor Labor', amount: amount * 0.8 },
      { description: 'Material Cost Supplies', amount: amount * 0.2 },
    ],
  });
}

// 17. Journal Entries & General Ledger (5000 Journal Entries -> 20000 GL Records)
for (let j = 1; j <= 5010; j++) {
  const date = `2026-07-${(j % 28) + 1}`;
  const amount = 100 + (j % 10) * 50;
  
  const line1: JournalEntryLine = { accountId: 'coa-1', accountName: 'Asset Account Subclass 1', debit: amount, credit: 0, memo: 'Debit line A' };
  const line2: JournalEntryLine = { accountId: 'coa-2', accountName: 'Asset Account Subclass 2', debit: amount, credit: 0, memo: 'Debit line B' };
  const line3: JournalEntryLine = { accountId: 'coa-3', accountName: 'Expense Account Subclass 3', debit: 0, credit: amount, memo: 'Credit line A' };
  const line4: JournalEntryLine = { accountId: 'coa-4', accountName: 'Expense Account Subclass 4', debit: 0, credit: amount, memo: 'Credit line B' };

  journalEntries.push({
    id: `je-${j}`,
    entryNumber: `JE-${20000 + j}`,
    date,
    description: `Audit Adjustment Allocation Entry ${j}`,
    status: 'Posted',
    createdBy: 'Auditor Manager',
    lines: [line1, line2, line3, line4],
  });

  generalLedger.push({
    id: `gl-${j}-1`,
    date,
    accountId: line1.accountId,
    accountName: line1.accountName,
    description: `Audit Adjustment Allocation Entry ${j}`,
    reference: `JE-${20000 + j}`,
    debit: line1.debit,
    credit: line1.credit,
    balance: 5000 + amount,
  });

  generalLedger.push({
    id: `gl-${j}-2`,
    date,
    accountId: line2.accountId,
    accountName: line2.accountName,
    description: `Audit Adjustment Allocation Entry ${j}`,
    reference: `JE-${20000 + j}`,
    debit: line2.debit,
    credit: line2.credit,
    balance: 5000 + amount,
  });

  generalLedger.push({
    id: `gl-${j}-3`,
    date,
    accountId: line3.accountId,
    accountName: line3.accountName,
    description: `Audit Adjustment Allocation Entry ${j}`,
    reference: `JE-${20000 + j}`,
    debit: line3.debit,
    credit: line3.credit,
    balance: 5000 - amount,
  });

  generalLedger.push({
    id: `gl-${j}-4`,
    date,
    accountId: line4.accountId,
    accountName: line4.accountName,
    description: `Audit Adjustment Allocation Entry ${j}`,
    reference: `JE-${20000 + j}`,
    debit: line4.debit,
    credit: line4.credit,
    balance: 5000 - amount,
  });
}

// 18. Owner Statements (Minimum 200)
for (let os = 1; os <= 210; os++) {
  ownerStatementsList.push({
    id: `os-100${os}`,
    ownerName: `Owner Executive ${os % 5 + 1}`,
    propertyName: `Apex Portfolio Tower ${os % 3 + 1}`,
    period: 'July 2026',
    income: 8500,
    expenses: 1200,
    netDistribution: 7300,
    status: 'Generated',
  });
}

// 19. Recurring Transactions
recurringTransactions.push({
  id: 'rec-1',
  name: 'Monthly Landscape Servicing',
  frequency: 'Monthly',
  transactionType: 'Expense',
  amount: 450,
  startDate: '2026-01-01',
  nextRun: '2026-08-01',
  status: 'Active',
});

// 20. Budgets
budgets.push({
  id: 'bud-1',
  propertyId: 'prop-1',
  propertyName: 'Apex Center Apartments',
  category: 'Maintenance',
  year: 2026,
  amount: 15000,
  actualAmount: 14200,
});

// 21. Taxes
taxRates.push({
  id: 'tax-1',
  name: 'Standard Municipal Payout Tax',
  percentage: 6.25,
  effectiveDate: '2026-01-01',
  status: 'Active',
});

// 22. Vendors (Minimum 250)
const vendorCategories = ['Electrician', 'Plumber', 'HVAC', 'General Contractor', 'Cleaning', 'Landscaping', 'Pest Control', 'Security', 'Roofing', 'Painting', 'Appliance Repair'];
for (let v = 1; v <= 255; v++) {
  const cat = vendorCategories[v % vendorCategories.length];
  vendors.push({
    id: `ven-${v}`,
    name: `Pro ${cat} Services Inc ${v}`,
    category: cat,
    phone: `(512) 555-8${100 + v}`,
    email: `contact@provendor${v}.com`,
    rating: 4 + (v % 2 === 0 ? 0.5 : 0.2),
    primaryContact: `Contact Agent ${v}`,
    licenseNumber: `LIC-${500000 + v}`,
    insuranceExpiration: '2027-12-31',
    emergencyAvailability: v % 3 === 0,
    preferred: v % 5 === 0,
    activeJobs: v % 4,
    completedJobs: 12 + (v % 10),
    responseTime: `${2 + (v % 4)}h`,
    status: 'Active',
  });
}

// 23. Service Requests (Minimum 2000)
const requestCategories = ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Roofing', 'Structural', 'Landscaping', 'Pest Control', 'Cleaning', 'Security', 'General'];
const requestStatuses = ['New', 'Submitted', 'Approved', 'Assigned', 'In Progress', 'Waiting for Parts', 'Completed', 'Cancelled'];
for (let sr = 1; sr <= 2010; sr++) {
  const prop = properties[sr % properties.length];
  const unit = units[sr % units.length];
  const tenant = tenants[sr % tenants.length];
  const category = requestCategories[sr % requestCategories.length];
  const priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 
    sr % 15 === 0 ? 'Urgent' : sr % 5 === 0 ? 'High' : sr % 3 === 0 ? 'Medium' : 'Low';
  const status = requestStatuses[sr % requestStatuses.length];

  maintenanceRequests.push({
    id: `sr-${sr}`,
    propertyId: prop.id,
    propertyName: prop.name,
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    title: `${category} Repair Request #${sr}`,
    description: `Detailed issue report for ${category} malfunction. Checked fittings and requires diagnostics.`,
    priority,
    status: status as any,
    assignedVendorId: `ven-${(sr % 200) + 1}`,
    assignedVendorName: `Pro Maintenance Partner ${(sr % 200) + 1}`,
    createdAt: `2026-07-${(sr % 28) + 1}`,
    messages: [
      { id: `msg-${sr}-1`, senderName: `${tenant.firstName} ${tenant.lastName}`, role: 'Tenant', text: `Hi, I submitted this request because the ${category.toLowerCase()} is not working.`, timestamp: `2026-07-${(sr % 28) + 1} 10:00 AM` },
      { id: `msg-${sr}-2`, senderName: 'Property Manager Staff', role: 'Manager', text: `Thanks for reporting. We have received your request and set the priority to ${priority}.`, timestamp: `2026-07-${(sr % 28) + 1} 11:30 AM` }
    ]
  });
}

// 24. Work Orders (Minimum 1500)
const woStatuses = ['New', 'Assigned', 'In Progress', 'Completed', 'Rejected', 'Scheduled', 'Waiting', 'Closed', 'Cancelled'];
const issuesList = [
  { title: 'AC Not Cooling', desc: 'The tenant reported that the AC is running but blowing warm air. Please check the condenser and refrigerant levels.' },
  { title: 'Water Leak under Kitchen Sink', desc: 'There is a slow leak in the hot water line under the kitchen sink. Cabinet floor is starting to warp.' },
  { title: 'Flickering Lights in Living Room', desc: 'The ceiling lights in the living room are flickering constantly. Checked bulb, might be fixture or wiring.' },
  { title: 'Broken Door Lock', desc: 'The front door lock is loose and difficult to lock/unlock. Needs inspection and possibly replacement.' },
  { title: 'Toilet Clogged and Overflowing', desc: 'The guest bathroom toilet is completely clogged and won\'t drain. Tenant requests urgent assistance.' },
  { title: 'Dishwasher Not Draining', desc: 'Water pools at the bottom of the dishwasher after a cycle completes. Drain pump or hose may be blocked.' },
  { title: 'Smoke Detector Beeping', desc: 'The smoke detector in bedroom 2 is beeping every few minutes. Needs battery replacement or unit swap.' }
];
const prioritiesList: ('Low' | 'Medium' | 'High' | 'Urgent')[] = ['Low', 'Medium', 'High', 'Urgent'];

for (let wo = 1; wo <= 1510; wo++) {
  const prop = properties[wo % properties.length];
  const unit = units[wo % units.length];
  const vendor = vendors[wo % vendors.length];
  const status = woStatuses[wo % woStatuses.length];
  const issueObj = issuesList[wo % issuesList.length];
  const priority = prioritiesList[wo % prioritiesList.length];

  workOrders.push({
    id: `wo-${wo}`,
    workOrderNumber: `WO-${40000 + wo}`,
    propertyId: prop.id,
    propertyName: prop.name,
    unitNumber: unit.unitNumber,
    vendorId: vendor.id,
    vendorName: vendor.name,
    assignedTechnician: `Technician Lead ${wo % 10 + 1}`,
    scheduledDate: `2026-07-${(wo % 28) + 1}`,
    estimatedCost: 150 + (wo % 6) * 50,
    actualCost: status === 'Completed' || status === 'Closed' ? 180 + (wo % 6) * 50 : 0,
    status: status as any,
    issue: issueObj.title,
    description: issueObj.desc,
    priority: priority,
  });
}

// 25. Vendor Invoices (Minimum 500)
for (let vi = 1; vi <= 510; vi++) {
  const vendor = vendors[vi % vendors.length];
  const prop = properties[vi % properties.length];
  vendorInvoicesList.push({
    id: `vi-${vi}`,
    invoiceNumber: `V-INV-${80000 + vi}`,
    vendorName: vendor.name,
    workOrderNumber: `WO-${40000 + vi}`,
    propertyName: prop.name,
    amount: 250 + (vi % 5) * 100,
    dueDate: `2026-08-${(vi % 28) + 1}`,
    status: vi % 4 === 0 ? 'Paid' : 'Approved',
  });
}

// 26. Inspections (Minimum 800)
const insTypes = ['Move In', 'Move Out', 'Routine', 'Annual', 'Safety', 'Fire', 'Insurance', 'Vendor Completion'] as const;
for (let ins = 1; ins <= 810; ins++) {
  const prop = properties[ins % properties.length];
  const unit = units[ins % units.length];
  const type = insTypes[ins % insTypes.length];
  inspectionsList.push({
    id: `ins-${ins}`,
    propertyId: prop.id,
    propertyName: prop.name,
    unitNumber: unit.unitNumber,
    type,
    checklist: [
      { section: 'Interior Walls', status: 'Pass' },
      { section: 'Electrical Outlets', status: 'Pass' },
      { section: 'Plumbing Valves', status: ins % 12 === 0 ? 'Fail' : 'Pass', notes: ins % 12 === 0 ? 'Slight drip observed' : undefined },
    ],
    status: ins % 5 === 0 ? 'Scheduled' : 'Completed',
    date: `2026-07-${(ins % 28) + 1}`,
  });
}

// 27. Assets (Minimum 1000)
const assetTypes = ['HVAC', 'Water Heater', 'Elevator', 'Generator', 'Roof', 'Pump', 'Security System', 'Fire Alarm', 'Appliance', 'Other'];
for (let as = 1; as <= 1010; as++) {
  const prop = properties[as % properties.length];
  const type = assetTypes[as % assetTypes.length];
  assetsList.push({
    id: `asset-${as}`,
    assetName: `${type} Unit - Zone ${as}`,
    serialNumber: `SN-${900000 + as}`,
    propertyId: prop.id,
    propertyName: prop.name,
    location: `Mechanical Room ${as % 3 + 1}`,
    purchaseDate: '2022-03-15',
    warrantyExpiration: '2027-03-15',
    manufacturer: 'Carrier Corp',
    model: `MOD-${type.toUpperCase()}-${as}`,
    expectedLife: 15,
    currentCondition: 70 + (as % 25),
  });
}

// 28. Preventive Maintenance Tasks (Minimum 400)
for (let pt = 1; pt <= 410; pt++) {
  const asset = assetsList[pt % assetsList.length];
  const prop = properties[pt % properties.length];
  preventiveTasks.push({
    id: `pt-${pt}`,
    task: `Inspect and service ${asset.assetName}`,
    assetId: asset.id,
    assetName: asset.assetName,
    propertyId: prop.id,
    propertyName: prop.name,
    frequency: 'Monthly',
    nextDue: `2026-08-${(pt % 28) + 1}`,
    assignedVendorName: `Pro Maintenance Partner ${(pt % 25) + 1}`,
    status: pt % 15 === 0 ? 'Overdue' : 'Scheduled',
  });
}

// 29. Inventory Items (Minimum 2500)
const invCategories = ['Plumbing', 'Electrical', 'HVAC Supplies', 'Appliance Parts', 'Filters', 'Bulbs', 'Hardware', 'Tools', 'Safety Supplies'];
for (let inv = 1; inv <= 2510; inv++) {
  const cat = invCategories[inv % invCategories.length];
  const qty = 5 + (inv % 20);
  const reorder = 10;
  inventoryItems.push({
    id: `inv-${inv}`,
    item: `Maintenance Fitting ${cat} #${inv}`,
    sku: `SKU-${100000 + inv}`,
    category: cat,
    quantity: qty,
    reorderLevel: reorder,
    vendorName: `Industrial Supply Partner ${inv % 10 + 1}`,
    unitCost: 15 + (inv % 5) * 5,
    status: qty > reorder ? 'In Stock' : qty === 0 ? 'Out of Stock' : 'Low Stock',
  });
}

// 30. Owners Expansion (Up to 105)
for (let o = owners.length + 1; o <= 105; o++) {
  owners.push({
    id: `own-${o}`,
    firstName: `OwnerFirstName${o}`,
    lastName: `OwnerLastName${o}`,
    email: `owner${o}@investor-capital.com`,
    phone: `(512) 555-9${o.toString().padStart(3, '0')}`,
    propertiesOwnedCount: (o % 3) + 1,
    payoutMethod: 'ACH/Direct Deposit',
  });
}

// 31. Owner Statements Expansion (Up to 310)
for (let os = ownerStatementsList.length + 1; os <= 310; os++) {
  ownerStatementsList.push({
    id: `stmt-${os}`,
    ownerName: `OwnerFirstName${(os % 10) + 1} OwnerLastName${(os % 10) + 1}`,
    propertyName: properties[os % properties.length].name,
    period: 'July 2026',
    income: 8500 + (os % 5) * 500,
    expenses: 1200 + (os % 3) * 100,
    netDistribution: 7300 + (os % 5) * 500 - (os % 3) * 100,
    status: 'Generated',
  });
}

// 32. Owner Distributions (Minimum 500)
for (let od = 1; od <= 510; od++) {
  const prop = properties[od % properties.length];
  ownerDistributionsList.push({
    id: `dist-${od}`,
    distributionNumber: `DIST-${60000 + od}`,
    propertyName: prop.name,
    amount: 3200 + (od % 10) * 200,
    date: `2026-07-${(od % 28) + 1}`,
    status: od % 12 === 0 ? 'Pending' : 'Paid',
    method: 'ACH Direct Deposit',
  });
}

// 33. Owner Documents (Minimum 2000)
const docCats = ['Statements', 'Tax Documents', 'Contracts', 'Insurance', 'Property Photos', 'Maintenance Reports', 'Inspection Reports', 'Other'] as const;
for (let odoc = 1; odoc <= 2010; odoc++) {
  const cat = docCats[odoc % docCats.length];
  ownerDocumentsList.push({
    id: `odoc-${odoc}`,
    name: `Owner_Portfolio_Document_${cat}_${odoc}.pdf`,
    category: cat,
    uploadedAt: `2026-07-${(odoc % 28) + 1}`,
    size: `${(150 + (odoc % 8) * 50)} KB`,
  });
}

// 34. Owner Conversations (Minimum 800)
const senders = ['Property Manager', 'Accountant', 'Leasing Lead', 'Resident Representative'];
for (let msg = 1; msg <= 810; msg++) {
  const sender = senders[msg % senders.length];
  ownerConversationsList.push({
    id: `omsg-${msg}`,
    sender,
    recipient: 'William Anderson (Owner)',
    subject: `Portfolio Update Ticket #${msg}`,
    body: `This is a mock portfolio follow-up conversation about maintenance, accounting ledger adjustments, or turnover inspections. Reference code ${msg * 77}.`,
    timestamp: `2026-07-${(msg % 28) + 1} 10:30 AM`,
    read: msg % 5 !== 0,
  });
}

// 35. Owner Support Tickets
for (let st = 1; st <= 20; st++) {
  ownerSupportTicketsList.push({
    id: `st-${st}`,
    subject: `Financial reporting request #${st}`,
    category: 'Billing',
    priority: st % 3 === 0 ? 'High' : 'Normal',
    description: `Need updated PDF statements regarding maintenance work order deductions.`,
    status: st % 4 === 0 ? 'Open' : 'Resolved',
    createdAt: '2026-07-15',
  });
}

// 36. Tenant Profiles Expansion (Up to 500)
for (let t = tenants.length + 1; t <= 500; t++) {
  tenants.push({
    id: `ten-${t}`,
    firstName: `TenantFirstName${t}`,
    lastName: `TenantLastName${t}`,
    email: `tenant${t}@community-rental.com`,
    phone: `(512) 555-0${t.toString().padStart(3, '0')}`,
    status: t % 15 === 0 ? 'Inactive' : 'Active',
    propertyName: properties[t % properties.length].name,
    unitNumber: `${(t % 5) + 1}0${(t % 8) + 1}`,
  });
}

// 37. Tenant Payments Expansion (Up to 5000)
for (let rp = rentPayments.length + 1; rp <= 5000; rp++) {
  const t = tenants[rp % tenants.length];
  const dueDateStr = `2026-07-${(rp % 28) + 1}`;
  const methodStr = ['ACH', 'Credit Card', 'Bank Transfer', 'Cash', 'Check'][rp % 5];
  rentPayments.push({
    id: `pay-${rp}`,
    tenantId: t.id,
    tenantName: `${t.firstName} ${t.lastName}`,
    propertyId: t.propertyId || '',
    propertyName: t.propertyName || '',
    unitId: t.unitId || '',
    unitNumber: t.unitNumber || '',
    amount: 1200 + (rp % 6) * 100,
    dueDate: dueDateStr,
    paidDate: dueDateStr,
    status: 'Paid',
    paymentMethod: methodStr,
    referenceNumber: `REF-900${rp}`,
    createdBy: 'System',
  });
}

// 38. Tenant Documents (Minimum 4000)
const tDocCats = ['Lease', 'Receipts', 'Notices', 'Community Documents', 'Insurance', 'Inspection Reports', 'Other'] as const;
for (let td = 1; td <= 4010; td++) {
  const cat = tDocCats[td % tDocCats.length];
  tenantDocumentsList.push({
    id: `tdoc-${td}`,
    name: `Resident_Document_${cat}_${td}.pdf`,
    category: cat as any,
    uploadedAt: `2026-07-${(td % 28) + 1}`,
    size: `${(100 + (td % 5) * 50)} KB`,
  });
}

// 39. Tenant Messages (Minimum 3000)
for (let tm = 1; tm <= 3010; tm++) {
  const t = tenants[tm % tenants.length];
  tenantConversationsList.push({
    id: `tmsg-${tm}`,
    sender: tm % 2 === 0 ? `${t.firstName} ${t.lastName}` : 'Property Manager Office',
    recipient: tm % 2 === 0 ? 'Property Manager Office' : `${t.firstName} ${t.lastName}`,
    subject: `Resident Follow-up Thread #${tm}`,
    body: `Follow up discussion regarding unit maintenance dispatch, utility charge adjustments, or parking garage renewals. Code reference: ${tm * 3}.`,
    timestamp: `2026-07-${(tm % 28) + 1} 02:45 PM`,
    read: tm % 4 !== 0,
  });
}

// 40. Tenant Announcements (Minimum 1000)
const annCats = ['Community', 'Maintenance', 'Events', 'Safety', 'Emergency'] as const;
for (let ta = 1; ta <= 1010; ta++) {
  const cat = annCats[ta % annCats.length];
  tenantAnnouncementsList.push({
    id: `ann-${ta}`,
    title: `Community Announcement Update #${ta}`,
    category: cat,
    publishDate: `2026-07-${(ta % 28) + 1}`,
    priority: ta % 20 === 0 ? 'Emergency' : ta % 5 === 0 ? 'High' : 'Normal',
    body: `Please review community notices regarding parking striping, HVAC seasonal maintenance, holiday office hours, or neighborhood watch updates.`,
    read: ta % 3 !== 0,
  });
}

// 41. Renters Insurance Policies (Minimum 800)
const insurers = ['State Farm', 'Lemonade', 'Geico', 'Progressive', 'Allstate'];
for (let ins = 1; ins <= 810; ins++) {
  const t = tenants[ins % tenants.length];
  tenantInsurancePoliciesList.push({
    id: `ins-${ins}`,
    provider: insurers[ins % insurers.length],
    policyNumber: `POL-${77000 + ins}`,
    coverageAmount: 20000 + (ins % 5) * 10000,
    effectiveDate: '2026-01-01',
    expirationDate: `2027-01-0${(ins % 9) + 1}`,
  });
}

// 42. Tenant Visitors (Minimum 1500)
for (let tv = 1; tv <= 1510; tv++) {
  tenantVisitorsList.push({
    id: `vis-${tv}`,
    visitorName: `GuestName ${tv}`,
    phone: `(512) 555-8${tv.toString().padStart(3, '0')}`,
    visitDate: `2026-07-${(tv % 28) + 1}`,
    arrivalTime: '10:00 AM',
    departureTime: '06:00 PM',
    status: tv % 10 === 0 ? 'Cancelled' : 'Scheduled',
  });
}

// 43. Tenant Packages (Minimum 2500)
const carriers = ['FedEx', 'UPS', 'USPS', 'DHL', 'Amazon Logistics'];
for (let pk = 1; pk <= 2510; pk++) {
  tenantPackagesList.push({
    id: `pkg-${pk}`,
    carrier: carriers[pk % carriers.length],
    trackingNumber: `1Z999AA10123${1000 + pk}`,
    deliveredDate: `2026-07-${(pk % 28) + 1}`,
    pickupStatus: pk % 8 === 0 ? 'Pending' : 'Picked Up',
  });
}

// 44. Tenant Support Tickets
for (let tst = 1; tst <= 15; tst++) {
  tenantSupportTicketsList.push({
    id: `tst-${tst}`,
    subject: `Resident amenity access request #${tst}`,
    category: 'Amenities',
    priority: 'Normal',
    description: `Need replacement pool keycard.`,
    status: tst % 3 === 0 ? 'Open' : 'Resolved',
    createdAt: '2026-07-16',
  });
}

// 45. Communication Contacts (Minimum 5000)
const roles = ['Tenant', 'Owner', 'Vendor', 'Applicant', 'Employee'] as const;
for (let c = 1; c <= 5010; c++) {
  const role = roles[c % roles.length];
  commContactsList.push({
    id: `ccon-${c}`,
    name: `ContactName ${c}`,
    role,
    property: `Skyline Luxury Lofts`,
    email: `contact${c}@whatslandlord-unified.com`,
    phone: `(512) 555-7${c.toString().padStart(3, '0')}`,
    status: c % 12 === 0 ? 'Inactive' : 'Active',
  });
}

// 46. Communication Templates (Minimum 4000? No, request says 400 templates!)
const tempCats = ['Rent Reminder', 'Lease Renewal', 'Welcome', 'Maintenance Update', 'Payment Receipt', 'Late Fee Notice', 'Inspection Reminder', 'General'] as const;
for (let ct = 1; ct <= 410; ct++) {
  const category = tempCats[ct % tempCats.length];
  commTemplatesList.push({
    id: `ctemp-${ct}`,
    title: `${category} Template #${ct}`,
    category,
    body: `Hello {{tenantName}}, this is a notice regarding {{propertyName}} unit {{unitNumber}}. Rent of {{rentAmount}} is due on {{dueDate}}.`,
  });
}

// 47. Communication Campaigns (Minimum 250)
const campTypes = ['Email', 'SMS', 'Mixed'] as const;
const campStatuses = ['Draft', 'Scheduled', 'Running', 'Completed', 'Cancelled'] as const;
for (let camp = 1; camp <= 260; camp++) {
  commCampaignsList.push({
    id: `camp-${camp}`,
    name: `Portfolio campaign ${camp}`,
    type: campTypes[camp % campTypes.length],
    audience: 'All Tenants',
    sentCount: 150 + (camp % 10) * 100,
    openRate: 65 + (camp % 30),
    clickRate: 20 + (camp % 15),
    status: campStatuses[camp % campStatuses.length],
  });
}

// 48. Communication Announcements (Minimum 500)
const commAnnCats = ['Community', 'Emergency', 'Maintenance', 'Events', 'Security', 'General'] as const;
const audiences = ['All Tenants', 'Owners', 'Vendors', 'Employees'] as const;
const annStatuses = ['Draft', 'Scheduled', 'Published', 'Expired'] as const;
for (let ca = 1; ca <= 510; ca++) {
  commAnnouncementsList.push({
    id: `cann-${ca}`,
    title: `Management Notice ${ca}`,
    category: commAnnCats[ca % commAnnCats.length],
    audience: audiences[ca % audiences.length],
    publishDate: `2026-07-${(ca % 28) + 1}`,
    status: annStatuses[ca % annStatuses.length],
  });
}

// 49. Communication Conversations (Minimum 3500)
const convChannels = ['Email', 'SMS', 'Chat'] as const;
const convStatuses = ['Open', 'Closed', 'Snoozed'] as const;
for (let conv = 1; conv <= 3510; conv++) {
  commConversationsList.push({
    id: `conv-${conv}`,
    contactName: `ContactName ${(conv % 100) + 1}`,
    lastMessage: `This is the last message snippet for thread #${conv}.`,
    channel: convChannels[conv % convChannels.length],
    assignedUser: `Property Manager Staff`,
    status: convStatuses[conv % convStatuses.length],
    lastActivity: `2026-07-${(conv % 28) + 1}`,
  });
}

// 50. Communication Messages (Minimum 10000)
const msgChannels = ['Email', 'SMS', 'Notification', 'Chat'] as const;
const msgStatuses = ['Sent', 'Delivered', 'Read', 'Failed'] as const;
for (let m = 1; m <= 10010; m++) {
  commMessagesList.push({
    id: `cmsg-${m}`,
    sender: m % 2 === 0 ? 'Sarah Connor' : 'Skyline Management Office',
    recipient: m % 2 === 0 ? 'Skyline Management Office' : 'Sarah Connor',
    body: `Relational message log content details #${m} checking for turnover keycards.`,
    timestamp: `2026-07-${(m % 28) + 1}`,
    channel: msgChannels[m % msgChannels.length],
    status: msgStatuses[m % msgStatuses.length],
  });
}

// 51. Communication Emails (Minimum 4000)
const emailStatuses = ['Sent', 'Draft', 'Scheduled', 'Failed'] as const;
for (let em = 1; em <= 4010; em++) {
  commEmailsList.push({
    id: `cem-${em}`,
    from: 'office@skyline-luxury.com',
    to: `resident${em}@whatslandlord-unified.com`,
    subject: `Notice regarding rent statement #${em}`,
    body: `Here is your detailed ledger balance for statement #${em}.`,
    sentAt: `2026-07-${(em % 28) + 1}`,
    status: emailStatuses[em % emailStatuses.length],
  });
}

// 52. Communication SMS (Minimum 3000)
const smsStatuses = ['Sent', 'Delivered', 'Failed', 'Scheduled'] as const;
for (let sm = 1; sm <= 3010; sm++) {
  commSMSsList.push({
    id: `csms-${sm}`,
    recipient: `Resident Phone ${(sm % 200) + 1}`,
    message: `Reminder: Maintenance visit scheduled for unit ${(sm % 100) + 1} tomorrow at 10 AM.`,
    sentAt: `2026-07-${(sm % 28) + 1}`,
    status: smsStatuses[sm % smsStatuses.length],
  });
}

// 53. Communication Notifications (Minimum 6000)
const notifTypes = ['System', 'Maintenance', 'Payment', 'Lease', 'Inspection', 'Documents', 'Messages'] as const;
for (let n = 1; n <= 6010; n++) {
  commNotificationsList.push({
    id: `cnot-${n}`,
    type: notifTypes[n % notifTypes.length],
    title: `Notification Title #${n}`,
    body: `This is details context regarding notification number #${n}.`,
    status: n % 4 === 0 ? 'Read' : 'Unread',
    createdAt: `2026-07-${(n % 28) + 1}`,
  });
}

// 54. Communication Activity Log
const actChannels = ['Email', 'SMS', 'Notification', 'System'] as const;
for (let act = 1; act <= 50; act++) {
  commActivitiesList.push({
    id: `act-${act}`,
    timestamp: `2026-07-${(act % 28) + 1}`,
    user: 'Property Manager Staff',
    channel: actChannels[act % actChannels.length],
    action: `Dispatched notification campaign #${act}`,
  });
}



// --- Phase 10: Document Management System Seeders ---

// 55. DMS Folders (2,000)
const folderNames = ['Leases', 'Invoices', 'Receipts', 'Tax Documents', 'Insurance Policies', 'Inspection Reports', 'Maintenance Records', 'Owner Statements', 'Vendor Contracts', 'Legal Documents'];
for (let f = 1; f <= 2010; f++) {
  dmsFoldersList.push({
    id: `fld-${f}`,
    name: `${folderNames[f % folderNames.length]} ${f}`,
    parentId: f > 20 ? `fld-${f % 20 + 1}` : undefined,
    path: `/root/${folderNames[f % folderNames.length]}/${f}`,
    documentCount: 5 + (f % 15),
    createdAt: `2026-07-${(f % 28) + 1}`,
  });
}

// 56. DMS Templates (1,500)
const templateTypes = ['Lease Agreement', 'Rental Application', 'Owner Agreement', 'Vendor Contract', 'Inspection Report', 'Notice', 'Invoice', 'Receipt', 'Statement', 'Other'] as const;
for (let t = 1; t <= 1510; t++) {
  const type = templateTypes[t % templateTypes.length];
  dmsTemplatesList.push({
    id: `dtmpl-${t}`,
    name: `${type} Template ${t}`,
    type,
    body: `This ${type} is entered into as of {{leaseStart}} between {{tenantName}} (Tenant) and Skyline Luxury Lofts (Landlord). Property: {{propertyName}}, Unit: {{unitNumber}}. Monthly Rent: {{rentAmount}}. Lease End: {{leaseEnd}}.`,
    createdAt: `2026-07-${(t % 28) + 1}`,
  });
}

// 57. DMS Documents (20,000)
const docCategories = ['Lease', 'Invoice', 'Receipt', 'Statement', 'Inspection', 'Maintenance', 'Tax', 'Insurance', 'Identification', 'Contract', 'Vendor', 'Owner', 'Tenant', 'Financial', 'Legal', 'Other'] as const;
const docStatuses = ['Active', 'Archived', 'Expired', 'Draft', 'Pending'] as const;
for (let d = 1; d <= 20010; d++) {
  const cat = docCategories[d % docCategories.length];
  dmsDocumentsList.push({
    id: `doc-${d}`,
    name: `${cat}_Document_${d}.pdf`,
    category: cat,
    folderId: `fld-${(d % 2010) + 1}`,
    folderName: folderNames[d % folderNames.length],
    owner: `Manager ${(d % 5) + 1}`,
    property: `Property ${(d % 10) + 1}`,
    relatedEntity: `Tenant ${(d % 500) + 1}`,
    size: `${100 + (d % 900)} KB`,
    version: 1 + (d % 5),
    status: docStatuses[d % docStatuses.length],
    updatedAt: `2026-07-${(d % 28) + 1}`,
    createdAt: `2026-06-${(d % 28) + 1}`,
    expiresAt: d % 5 === 0 ? `2027-01-${(d % 28) + 1}` : undefined,
    tags: [docCategories[(d + 1) % docCategories.length]],
  });
}

// 58. DMS Signature Requests (5,000)
const sigStatuses = ['Draft', 'Sent', 'Viewed', 'Signed', 'Declined', 'Expired', 'Cancelled'] as const;
for (let s = 1; s <= 5010; s++) {
  dmsSignaturesList.push({
    id: `sig-${s}`,
    documentId: `doc-${(s % 20010) + 1}`,
    documentName: `Lease_Agreement_${s}.pdf`,
    requestedBy: 'Property Manager Staff',
    signers: [`Tenant ${(s % 500) + 1}`, `Owner ${(s % 50) + 1}`],
    status: sigStatuses[s % sigStatuses.length],
    sentAt: `2026-07-${(s % 28) + 1}`,
    completedAt: s % 3 === 0 ? `2026-07-${(s % 28) + 1}` : undefined,
    expiresAt: `2026-09-${(s % 28) + 1}`,
  });
}

// 59. DMS File Versions (12,000)
for (let v = 1; v <= 12010; v++) {
  dmsVersionsList.push({
    id: `ver-${v}`,
    documentId: `doc-${(v % 20010) + 1}`,
    documentName: `Document_${v % 20010 + 1}.pdf`,
    versionNumber: 1 + (v % 5),
    uploadedBy: `Manager ${(v % 5) + 1}`,
    createdAt: `2026-07-${(v % 28) + 1}`,
    size: `${150 + (v % 800)} KB`,
    notes: v % 3 === 0 ? `Updated rent amount and lease term for ${v % 28 + 1}th.` : undefined,
  });
}

// 60. DMS Audit Records (25,000)
const auditActions = ['Upload', 'Download', 'Preview', 'Edit', 'Delete', 'Share', 'Signature Sent', 'Signature Completed', 'Permission Changed'] as const;
for (let a = 1; a <= 25010; a++) {
  dmsAuditList.push({
    id: `aud-${a}`,
    documentId: `doc-${(a % 20010) + 1}`,
    documentName: `Document_${a % 20010 + 1}.pdf`,
    action: auditActions[a % auditActions.length],
    performedBy: `Manager ${(a % 5) + 1}`,
    property: `Property ${(a % 10) + 1}`,
    timestamp: `2026-07-${(a % 28) + 1}`,
  });
}

// 61. DMS Shares (3,000)
const sharePermissions: ('View' | 'Download' | 'Comment' | 'Edit' | 'Sign')[][] = [
  ['View'], ['View', 'Download'], ['View', 'Download', 'Comment'], ['View', 'Sign'], ['View', 'Download', 'Edit'],
];
const shareStatuses = ['Active', 'Expired', 'Revoked'] as const;
for (let sh = 1; sh <= 3010; sh++) {
  dmsSharesList.push({
    id: `shr-${sh}`,
    documentId: `doc-${(sh % 20010) + 1}`,
    documentName: `Document_${sh % 20010 + 1}.pdf`,
    sharedBy: 'Property Manager Staff',
    sharedWith: `contact${sh}@whatslandlord-unified.com`,
    permissions: sharePermissions[sh % sharePermissions.length],
    expiresAt: sh % 4 === 0 ? `2026-12-31` : undefined,
    status: shareStatuses[sh % shareStatuses.length],
  });
}

// 62. DMS Document Requests (4,000)
const reqStatuses = ['Draft', 'Sent', 'Submitted', 'Completed', 'Expired'] as const;
const recipientTypes = ['Tenant', 'Owner', 'Vendor', 'Applicant'] as const;
for (let r = 1; r <= 4010; r++) {
  dmsRequestsList.push({
    id: `dreq-${r}`,
    title: `Document Request #${r}`,
    description: `Please upload the required documents for verification of unit #${(r % 100) + 1}.`,
    requiredDocuments: ['Government ID', 'Proof of Income', 'Previous Lease'],
    dueDate: `2026-08-${(r % 28) + 1}`,
    recipient: `Recipient ${r}`,
    recipientType: recipientTypes[r % recipientTypes.length],
    status: reqStatuses[r % reqStatuses.length],
    createdAt: `2026-07-${(r % 28) + 1}`,
  });
}

// 63. DMS Permissions Matrix
const permRoles = ['Super Admin', 'Company Admin', 'Property Manager', 'Leasing Agent', 'Accountant', 'Maintenance', 'Owner', 'Tenant', 'Vendor'];
permRoles.forEach((role, idx) => {
  dmsPermissionsList.push({
    id: `perm-${idx + 1}`,
    role,
    canView: true,
    canUpload: idx < 6,
    canDownload: idx < 7,
    canEdit: idx < 4,
    canDelete: idx < 3,
    canShare: idx < 5,
    canSign: true,
    canManageVersions: idx < 4,
  });
});

// --- Phase 11: Reports, Analytics & Business Intelligence Seeders ---
rptPropertyAnalytics = Array.from({ length: 50 }).map((_, idx) => {
  const unitsCount = 10 + (idx % 5) * 8;
  const occupied = Math.floor(unitsCount * (0.75 + (idx % 10) * 0.025));
  const vacant = unitsCount - occupied;
  const revenue = occupied * 1500;
  const expenses = occupied * 350 + 1000;
  const noi = revenue - expenses;
  const purchasePrice = unitsCount * 120000;
  const currentValue = purchasePrice * 1.25;
  const roi = purchasePrice > 0 ? (noi * 12) / purchasePrice * 100 : 0;
  return {
    id: `prop-an-${idx + 1}`,
    property: propNames[idx % propNames.length]?.name || `Property ${idx + 1}`,
    units: unitsCount,
    occupied,
    vacant,
    occupancyRate: Math.round((occupied / unitsCount) * 100),
    revenue,
    expenses,
    noi,
    roi: parseFloat(roi.toFixed(2)),
    maintenanceCost: 500 + (idx % 4) * 450,
  };
});

rptTenantAnalytics = Array.from({ length: 100 }).map((_, idx) => ({
  id: `ten-an-${idx + 1}`,
  tenant: `Tenant ${idx + 1}`,
  property: propNames[idx % propNames.length]?.name || `Property ${idx + 1}`,
  unit: `Unit ${100 + (idx % 20)}`,
  leaseStatus: idx % 10 === 0 ? 'Expiring' : 'Active',
  paymentStatus: idx % 15 === 0 ? 'Unpaid' : idx % 12 === 0 ? 'Partial' : 'Paid',
  outstandingBalance: idx % 15 === 0 ? 1500 : idx % 12 === 0 ? 500 : 0,
}));

rptVendorPerformance = Array.from({ length: 25 }).map((_, idx) => ({
  id: `vend-an-${idx + 1}`,
  vendor: `Vendor Partner ${idx % 15 + 1}`,
  jobsCompleted: 12 + (idx % 8) * 5,
  avgResponseTime: `${(1.5 + (idx % 5) * 0.8).toFixed(1)} hours`,
  rating: parseFloat((4.0 + (idx % 10) * 0.1).toFixed(1)),
  totalCost: 1500 + (idx % 5) * 1200,
}));

rptSavedReports = [
  {
    id: 'rpt-saved-1',
    name: 'Q2 Financial Summary',
    category: 'Financial',
    dataSource: 'Expenses',
    fields: ['Property', 'Category', 'Amount', 'Vendor'],
    filters: { dateRange: 'Q2 2026' },
    visualization: 'Table',
    createdAt: '2026-06-01',
    createdBy: 'Property Manager Staff',
    isShared: true,
    lastRun: '2026-07-18',
    rowCount: 145,
  },
  {
    id: 'rpt-saved-2',
    name: 'Occupancy Ranking 2026',
    category: 'Property',
    dataSource: 'Units',
    fields: ['Property', 'Total Units', 'Occupied', 'Vacant', 'Rate'],
    filters: {},
    visualization: 'Bar',
    createdAt: '2026-05-15',
    createdBy: 'Property Manager Staff',
    isShared: false,
    lastRun: '2026-07-17',
    rowCount: 50,
  }
];

rptScheduledReports = [
  {
    id: 'rpt-sched-1',
    reportId: 'rpt-saved-1',
    reportName: 'Q2 Financial Summary',
    frequency: 'Monthly',
    recipients: ['owner@example.com', 'accountant@example.com'],
    format: 'PDF',
    nextRun: '2026-08-01',
    status: 'Active',
    createdAt: '2026-06-01',
  }
];

rptCustomDashboards = [
  {
    id: 'dash-custom-1',
    name: 'Executive Overview Dashboard',
    createdBy: 'Property Manager Staff',
    createdAt: '2026-01-01',
    isShared: true,
    widgets: [
      { id: 'w-1', type: 'MetricCard', title: 'Total Revenue', dataSource: 'Revenue', col: 0, row: 0, w: 3, h: 2 },
      { id: 'w-2', type: 'LineChart', title: 'Revenue Trend', dataSource: 'Revenue', col: 3, row: 0, w: 9, h: 4 },
    ]
  }
];

rptExports = [
  { id: 'exp-1', name: 'Leasing_Leads_Report', type: 'CSV', createdAt: '2026-07-18', createdBy: 'Property Manager Staff', status: 'Completed', size: '24 KB' },
  { id: 'exp-2', name: 'General_Ledger_2026', type: 'Excel', createdAt: '2026-07-19', createdBy: 'Property Manager Staff', status: 'Processing' },
];

rptForecasts = [
  { period: 'Jan 2026', actual: 24000, forecast: 24000, lower: 24000, upper: 24000 },
  { period: 'Feb 2026', actual: 25500, forecast: 25000, lower: 24500, upper: 25500 },
  { period: 'Mar 2026', actual: 27000, forecast: 26000, lower: 25000, upper: 27000 },
  { period: 'Apr 2026', actual: 28500, forecast: 28000, lower: 26800, upper: 29200 },
  { period: 'May 2026', actual: 30000, forecast: 29500, lower: 28000, upper: 31000 },
  { period: 'Jun 2026', actual: 31500, forecast: 31000, lower: 29000, upper: 33000 },
  { period: 'Jul 2026', forecast: 32500, lower: 30000, upper: 35000 },
  { period: 'Aug 2026', forecast: 34000, lower: 31000, upper: 37000 },
  { period: 'Sep 2026', forecast: 35500, lower: 32000, upper: 39000 },
  { period: 'Oct 2026', forecast: 37000, lower: 33000, upper: 41000 },
  { period: 'Nov 2026', forecast: 38500, lower: 34000, upper: 43000 },
  { period: 'Dec 2026', forecast: 40000, lower: 35000, upper: 45000 },
];

let addedOwnerProps: any[] = [];

const generatePermissions = (overrides?: any) => {
  const modules = [
    'Dashboard', 'Properties', 'Leasing', 'Tenants', 'Documents', 
    'Owners', 'Rent & Payments', 'Accounting', 'Maintenance', 
    'Reports', 'Communication', 'Company Settings', 'AI Assistant'
  ];
  return modules.map(m => {
    const isOverride = overrides && overrides[m];
    return {
      module: m,
      view: isOverride ? (overrides[m].view !== undefined ? !!overrides[m].view : false) : false,
      create: isOverride ? (overrides[m].create !== undefined ? !!overrides[m].create : false) : false,
      edit: isOverride ? (overrides[m].edit !== undefined ? !!overrides[m].edit : false) : false,
      delete: isOverride ? (overrides[m].delete !== undefined ? !!overrides[m].delete : false) : false,
      approve: isOverride ? (overrides[m].approve !== undefined ? !!overrides[m].approve : false) : false,
      export: isOverride ? (overrides[m].export !== undefined ? !!overrides[m].export : false) : false,
    };
  });
};

let rbacRolesList = [
  {
    id: 'role-pm',
    name: 'Property Manager',
    description: 'Master account with full administrative and module access permissions.',
    permissions: generatePermissions({
      'Dashboard': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Properties': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Leasing': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Tenants': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Owners': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Rent & Payments': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Accounting': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Maintenance': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Documents': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Reports': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Communication': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'Company Settings': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      'AI Assistant': { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    })
  },
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Access to financial statements, property payouts, and occupancy analytics.',
    permissions: generatePermissions({
      'Dashboard': { view: true },
      'Properties': { view: true },
      'Owners': { view: true },
      'Reports': { view: true },
      'Documents': { view: true },
      'Communication': { view: true },
      'Rent & Payments': { view: true },
    })
  },
  {
    id: 'role-tenant',
    name: 'Tenant',
    description: 'Access to rent payments, lease terms, and maintenance request creation.',
    permissions: generatePermissions({
      'Dashboard': { view: true },
      'Leasing': { view: true },
      'Rent & Payments': { view: true, create: true },
      'Maintenance': { view: true, create: true },
      'Documents': { view: true },
      'Communication': { view: true, create: true },
    })
  },
  {
    id: 'role-maint',
    name: 'Maintenance',
    description: 'Field technicians and staff who resolve repair tickets.',
    permissions: generatePermissions({
      'Dashboard': { view: true },
      'Maintenance': { view: true, create: true, edit: true }
    })
  },
  {
    id: 'role-collection-manager',
    name: 'Collection Manager',
    description: 'Access to tenant collections, dues, owner payouts, and vendor/maintenance payments.',
    permissions: generatePermissions({
      'Dashboard': { view: true },
      'Rent & Payments': { view: true, create: true, edit: true, approve: true, export: true },
      'Maintenance': { view: true, create: true, edit: true },
      'Tenants': { view: true },
      'Owners': { view: true, edit: true },
      'Accounting': { view: true, create: true, edit: true }
    })
  }
];

let propertyAssignments: any[] = [];
let unitAssignments: any[] = [];
let maintenanceAssignments: any[] = [];

let violationsList: Violation[] = [];

let screeningChecksList: ScreeningCheck[] = [
  {
    id: 'sc-1',
    applicantId: 'appl-1',
    applicationId: 'ap-1',
    applicantName: 'Michael Jordan',
    applicantEmail: 'jordan@chicagobulls.com',
    applicantPhone: '555-0123',
    propertyId: 'prop-1',
    propertyName: 'Oakridge Heights',
    unitId: 'unit-1',
    unitNumber: '101',
    screeningPackage: 'Comprehensive',
    paymentResponsibility: 'Applicant',
    paymentStatus: 'Paid',
    applicantStatus: 'Submitted',
    screeningStatus: 'Completed',
    identityVerificationStatus: 'Verified',
    creditScore: 720,
    creditRecommendation: 'Approved',
    criminalStatus: 'No Records Found',
    evictionStatus: 'No Records Found',
    incomeVerified: true,
    screeningProvider: 'TransUnion',
    invitationSentAt: '2026-07-20',
    consentSubmittedAt: '2026-07-21',
    paymentCompletedAt: '2026-07-21',
    reportGeneratedAt: '2026-07-21',
    creditReportUrl: 'mock_credit_report.pdf',
    criminalReportUrl: 'mock_criminal_report.pdf',
    evictionReportUrl: 'mock_eviction_report.pdf',
  },
  {
    id: 'sc-2',
    applicantId: 'appl-2',
    applicationId: 'ap-2',
    applicantName: 'Serena Williams',
    applicantEmail: 'serena@tennis.com',
    applicantPhone: '555-0987',
    propertyId: 'prop-2',
    propertyName: 'Sycamore Gardens',
    unitId: 'unit-3',
    unitNumber: '402',
    screeningPackage: 'Basic',
    paymentResponsibility: 'Manager',
    paymentStatus: 'Waived',
    applicantStatus: 'Invited',
    screeningStatus: 'Pending',
    identityVerificationStatus: 'Pending',
    criminalStatus: 'Pending',
    evictionStatus: 'Pending',
    screeningProvider: 'TransUnion',
    invitationSentAt: '2026-07-22',
  }
];

let usersList: any[] = [
  { id: 'usr-1', name: 'John Doe', email: 'john@apex.com', role: 'Super Admin', team: 'Property Management', status: 'Active', lastLogin: '2026-07-19 09:30', departments: [] },
  { id: 'usr-2', name: 'Jane Smith', email: 'jane@apex.com', role: 'Accountant', team: 'Accounting', status: 'Active', lastLogin: '2026-07-18 17:45', departments: [] },
  { id: 'usr-3', name: 'Bob Johnson', email: 'bob@apex.com', role: 'Leasing Agent', team: 'Leasing', status: 'Inactive', lastLogin: '2026-07-10 11:15', departments: [] },
];

// --- Mock API Layer Object ---
export const mockApi = {
  property: {
    getAll: async () => { await delay(100); return [...properties]; },
    getById: async (id: string) => { await delay(50); return properties.find(p => p.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newProp = { ...data, id: `prop-${properties.length + 1}`, unitsCount: 0, occupiedUnits: 0, occupancyRate: 0, monthlyRevenue: 0, createdAt: new Date().toISOString().split('T')[0] };
      properties.push(newProp);
      return newProp;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = properties.findIndex(p => p.id === id);
      if (idx !== -1) properties[idx] = { ...properties[idx], ...data };
      return properties[idx];
    },
    delete: async (id: string) => { await delay(150); properties = properties.filter(p => p.id !== id); return true; }
  },

  building: {
    getAll: async () => { await delay(100); return [...buildings]; },
    create: async (data: any) => {
      await delay(200);
      const newBld = { ...data, id: `bld-${Date.now()}` };
      buildings.push(newBld);
      return newBld;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = buildings.findIndex(b => b.id === id);
      if (idx !== -1) buildings[idx] = { ...buildings[idx], ...data };
      return buildings[idx];
    },
    delete: async (id: string) => { await delay(150); buildings = buildings.filter(b => b.id !== id); return true; }
  },

  unit: {
    getAll: async () => { await delay(150); return [...units]; },
    getById: async (id: string) => { await delay(50); return units.find(u => u.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newUnit = { ...data, id: `unit-${Date.now()}` };
      units.push(newUnit);
      return newUnit;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = units.findIndex(u => u.id === id);
      if (idx !== -1) units[idx] = { ...units[idx], ...data };
      return units[idx];
    },
    delete: async (id: string) => { await delay(150); units = units.filter(u => u.id !== id); return true; },
    assignTenant: async (unitId: string, tenantId: string, tenantName: string) => {
      await delay(200);
      const idx = units.findIndex(u => u.id === unitId);
      if (idx !== -1) {
        units[idx].status = 'Occupied';
        units[idx].tenantId = tenantId;
        units[idx].tenantName = tenantName;
      }
      return units[idx];
    }
  },

  tenant: {
    getAll: async () => { await delay(150); return [...tenants]; },
    getById: async (id: string) => { await delay(50); return tenants.find(t => t.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newTen = { ...data, id: `ten-${tenants.length + 1}` };
      tenants.unshift(newTen);
      return newTen;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = tenants.findIndex(t => t.id === id);
      if (idx !== -1) tenants[idx] = { ...tenants[idx], ...data };
      return tenants[idx];
    },
    delete: async (id: string) => { await delay(150); tenants = tenants.filter(t => t.id !== id); return true; }
  },

  leasing: {
    getLeads: async () => { await delay(150); return [...leads]; },
    createLead: async (data: any) => {
      await delay(200);
      const newLead = { ...data, id: `lead-gen-${leads.length + 1}`, createdAt: new Date().toISOString().split('T')[0] };
      leads.push(newLead);
      return newLead;
    },
    getApplications: async () => { await delay(150); return [...applications]; },
    createApplication: async (data: any) => {
      await delay(200);
      const newApp = { ...data, id: `app-gen-${applications.length + 1}`, status: 'Pending', submittedDate: new Date().toISOString().split('T')[0] };
      applications.unshift(newApp);
      return newApp;
    },
    updateApplication: async (id: string, data: any) => {
      await delay(200);
      const idx = applications.findIndex(a => a.id === id);
      if (idx !== -1) applications[idx] = { ...applications[idx], ...data };
      return applications[idx];
    },
    getLeases: async () => { await delay(150); return [...leases]; },
    createLease: async (data: any) => {
      await delay(250);
      const newLease = { ...data, id: `lease-${leases.length + 1}`, status: 'Active' };
      leases.unshift(newLease);
      // toggle unit
      const uIdx = units.findIndex(u => u.id === data.unitId);
      if (uIdx !== -1) {
        units[uIdx].status = 'Occupied';
      }
      return newLease;
    },
    updateLease: async (id: string, data: any) => {
      await delay(200);
      const idx = leases.findIndex(l => l.id === id);
      if (idx !== -1) leases[idx] = { ...leases[idx], ...data };
      return leases[idx];
    },
    getRenewals: async () => { await delay(100); return [...renewals]; },
    updateMoveIn: async (id: string, data: any) => {
      await delay(200);
      return { id, ...data };
    }
  },

  rent: {
    getAll: async () => { await delay(100); return [...rentPayments]; },
    payRent: async (id: string) => {
      await delay(150);
      const idx = rentPayments.findIndex(p => p.id === id);
      if (idx !== -1) rentPayments[idx].status = 'Paid';
      return rentPayments[idx];
    }
  },

  payments: {
    getAll: async () => { await delay(150); return [...rentPayments]; },
    getById: async (id: string) => { await delay(50); return rentPayments.find(p => p.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newPay = {
        ...data,
        id: `pay-800${rentPayments.length + 1}`,
        status: 'Paid',
        paidAmount: data.amount,
        remainingBalance: 0,
        createdBy: 'Manager',
      };
      rentPayments.unshift(newPay);

      // Reconcile invoices for this tenant
      let remainingPayment = Number(data.amount) || 0;
      if (data.tenantId) {
        // Find unpaid/overdue/partially paid invoices for this tenant
        const tenantInvoices = invoices.filter(
          (inv) => inv.tenantId === data.tenantId && inv.status !== 'Paid' && inv.status !== 'Cancelled'
        );
        // Sort by due date ascending so oldest gets paid first
        tenantInvoices.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        for (const inv of tenantInvoices) {
          if (remainingPayment <= 0) break;
          const unpaidAmt = inv.amount - (inv.paidAmount || 0);
          if (unpaidAmt > 0) {
            if (remainingPayment >= unpaidAmt) {
              inv.paidAmount = inv.amount;
              inv.balance = 0;
              inv.status = 'Paid';
              remainingPayment -= unpaidAmt;
            } else {
              inv.paidAmount = (inv.paidAmount || 0) + remainingPayment;
              inv.balance = inv.amount - inv.paidAmount;
              inv.status = 'Partially Paid';
              remainingPayment = 0;
            }
          }
        }
      }

      return newPay;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = rentPayments.findIndex(p => p.id === id);
      if (idx !== -1) rentPayments[idx] = { ...rentPayments[idx], ...data };
      return rentPayments[idx];
    },
    delete: async (id: string) => { await delay(150); rentPayments = rentPayments.filter(p => p.id !== id); return true; },
    void: async (id: string) => {
      await delay(150);
      const idx = rentPayments.findIndex(p => p.id === id);
      if (idx !== -1) rentPayments[idx].status = 'Voided';
      return rentPayments[idx];
    },
    refund: async (id: string) => {
      await delay(150);
      const idx = rentPayments.findIndex(p => p.id === id);
      if (idx !== -1) {
        rentPayments[idx].status = 'Refunded';
        refunds.push({
          id: `ref-200${refunds.length + 1}`,
          tenantId: rentPayments[idx].tenantId,
          tenantName: rentPayments[idx].tenantName,
          paymentId: id,
          amount: rentPayments[idx].amount,
          method: rentPayments[idx].paymentMethod,
          status: 'Processed',
          date: new Date().toISOString().split('T')[0],
        });
      }
      return rentPayments[idx];
    }
  },

  invoices: {
    getAll: async () => { await delay(150); return [...invoices]; },
    getById: async (id: string) => { await delay(50); return invoices.find(i => i.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newInv = {
        ...data,
        id: `inv-900${invoices.length + 1}`,
        paidAmount: 0,
        balance: data.amount,
        status: 'Sent',
      };
      invoices.unshift(newInv);
      return newInv;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = invoices.findIndex(i => i.id === id);
      if (idx !== -1) invoices[idx] = { ...invoices[idx], ...data };
      return invoices[idx];
    },
    delete: async (id: string) => { await delay(150); invoices = invoices.filter(i => i.id !== id); return true; }
  },

  charges: {
    getAll: async () => { await delay(100); return [...charges]; },
    create: async (data: any) => {
      await delay(200);
      const newChg = {
        ...data,
        id: `chg-300${charges.length + 1}`,
        status: 'Active',
      };
      charges.push(newChg);
      return newChg;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = charges.findIndex(c => c.id === id);
      if (idx !== -1) charges[idx] = { ...charges[idx], ...data };
      return charges[idx];
    },
    delete: async (id: string) => { await delay(150); charges = charges.filter(c => c.id !== id); return true; }
  },

  deposits: {
    getAll: async () => { await delay(150); return [...deposits]; },
    getById: async (id: string) => { await delay(50); return deposits.find(d => d.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newDep = {
        ...data,
        id: `dep-400${deposits.length + 1}`,
        heldBalance: data.amount,
        refundableAmount: data.amount,
        status: 'Held',
      };
      deposits.push(newDep);
      return newDep;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = deposits.findIndex(d => d.id === id);
      if (idx !== -1) deposits[idx] = { ...deposits[idx], ...data };
      return deposits[idx];
    },
    delete: async (id: string) => { await delay(150); deposits = deposits.filter(d => d.id !== id); return true; }
  },

  paymentPlans: {
    getAll: async () => { await delay(150); return [...paymentPlans]; },
    create: async (data: any) => {
      await delay(200);
      const newPlan = {
        ...data,
        id: `plan-700${paymentPlans.length + 1}`,
        remainingBalance: data.originalBalance,
        status: 'Active',
      };
      paymentPlans.push(newPlan);
      return newPlan;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = paymentPlans.findIndex(p => p.id === id);
      if (idx !== -1) paymentPlans[idx] = { ...paymentPlans[idx], ...data };
      return paymentPlans[idx];
    },
    delete: async (id: string) => { await delay(150); paymentPlans = paymentPlans.filter(p => p.id !== id); return true; }
  },

  refunds: {
    getAll: async () => { await delay(100); return [...refunds]; },
    create: async (data: any) => {
      await delay(200);
      const newRef = {
        ...data,
        id: `ref-200${refunds.length + 1}`,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
      };
      refunds.push(newRef);
      return newRef;
    }
  },

  rentLedger: {
    getAll: async () => {
      await delay(150);
      // Construct running ledger dynamically
      let runningBalance = 0;
      const ledgerItems: any[] = [];

      // Combine charges and payments
      for (let idx = 0; idx < Math.min(invoices.length, 50); idx++) {
        const inv = invoices[idx];
        const pay = rentPayments[idx];

        // 1. Charge Debit
        runningBalance += inv.amount;
        ledgerItems.push({
          id: `led-chg-${inv.id}`,
          date: inv.dueDate,
          tenantName: inv.tenantName,
          propertyName: inv.propertyName,
          unitNumber: inv.unitNumber,
          description: 'Rent Assessment Charge',
          debit: inv.amount,
          credit: 0,
          balance: runningBalance,
          transactionType: 'Rent Charge',
        });

        // 2. Payment Credit
        if (pay && pay.status === 'Paid') {
          runningBalance -= pay.amount;
          ledgerItems.push({
            id: `led-pay-${pay.id}`,
            date: pay.dueDate,
            tenantName: pay.tenantName,
            propertyName: pay.propertyName,
            unitNumber: pay.unitNumber,
            description: `Payment Received - Ref ${pay.referenceNumber}`,
            debit: 0,
            credit: pay.amount,
            balance: runningBalance,
            transactionType: 'Payment',
          });
        }
      }

      return ledgerItems;
    }
  },


  accounting: {
    getAll: async () => { await delay(100); return [...transactions]; },
    create: async (data: any) => {
      await delay(200);
      const newTx = { ...data, id: `tx-${transactions.length + 1}`, date: new Date().toISOString().split('T')[0] };
      transactions.unshift(newTx);
      return newTx;
    }
  },

  maintenance: {
    getAll: async () => { await delay(100); return [...maintenanceRequests]; },
    create: async (data: any) => {
      await delay(200);
      const newReq = { ...data, id: `sr-${maintenanceRequests.length + 1}`, status: 'New', createdAt: new Date().toISOString().split('T')[0] };
      maintenanceRequests.push(newReq);
      return newReq;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = maintenanceRequests.findIndex(m => m.id === id);
      if (idx !== -1) maintenanceRequests[idx] = { ...maintenanceRequests[idx], ...data };
      return maintenanceRequests[idx];
    },
    getMetrics: async () => {
      await delay(200);
      return {
        openRequests: maintenanceRequests.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length,
        emergencyRequests: maintenanceRequests.filter(r => r.priority === 'Urgent').length,
        workOrdersInProgress: workOrders.filter(w => w.status === 'In Progress').length,
        completedThisMonth: workOrders.filter(w => w.status === 'Completed').length,
        avgCompletionTime: '3.2 days',
        preventiveTasksDue: preventiveTasks.filter(p => p.status === 'Overdue').length,
        vendorJobs: vendors.reduce((sum, v) => sum + (v.activeJobs || 0), 0),
        totalMaintenanceCost: workOrders.reduce((sum, w) => sum + w.actualCost, 0),
      };
    }
  },

  vendor: { getAll: async () => { await delay(100); return [...vendors]; } },
  owner: {
    getAll: async () => {
      await delay(100);
      return owners.map(o => {
        const count = properties.filter(p => p.owner === `${o.firstName} ${o.lastName}`).length;
        return { ...o, propertiesOwnedCount: count };
      });
    },
    create: async (data: any) => {
      await delay(200);
      const { assignedProperties, ...ownerData } = data;
      const newOwner = {
        ...ownerData,
        id: `own-${owners.length + 1}`,
      };
      owners.push(newOwner);
      // Update properties if assigned
      if (assignedProperties && Array.isArray(assignedProperties)) {
        assignedProperties.forEach((propId: string) => {
          const propIdx = properties.findIndex(p => p.id === propId);
          if (propIdx !== -1) {
            properties[propIdx].owner = `${newOwner.firstName} ${newOwner.lastName}`;
          }
        });
      }
      return newOwner;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const { assignedProperties, ...ownerData } = data;
      const idx = owners.findIndex(o => o.id === id);
      if (idx !== -1) {
        const oldName = `${owners[idx].firstName} ${owners[idx].lastName}`;
        const newName = `${ownerData.firstName} ${ownerData.lastName}`;
        owners[idx] = { ...owners[idx], ...ownerData };

        // Unassign old properties first
        properties.forEach((p, pIdx) => {
          if (p.owner === oldName) {
            properties[pIdx].owner = ''; // Clear old owner name
          }
        });

        // Assign new properties
        if (assignedProperties && Array.isArray(assignedProperties)) {
          assignedProperties.forEach((propId: string) => {
            const propIdx = properties.findIndex(p => p.id === propId);
            if (propIdx !== -1) {
              properties[propIdx].owner = newName;
            }
          });
        }
      }
      return owners[idx];
    },
    delete: async (id: string) => {
      await delay(150);
      const idx = owners.findIndex(o => o.id === id);
      if (idx !== -1) {
        const oldName = `${owners[idx].firstName} ${owners[idx].lastName}`;
        owners.splice(idx, 1);
        // Clear owner field from properties owned by this owner
        properties.forEach((p, pIdx) => {
          if (p.owner === oldName) {
            properties[pIdx].owner = '';
          }
        });
      }
      return true;
    }
  },
  document: {
    getAll: async () => { await delay(100); return [...documents]; },
    create: async (data: any) => {
      await delay(200);
      const newDoc = { ...data, id: `doc-${documents.length + 1}`, size: '200 KB', uploadedAt: new Date().toISOString().split('T')[0], uploadedBy: 'Manager' };
      documents.push(newDoc);
      return newDoc;
    }
  },
  report: { getAll: async () => { await delay(100); return [...reports]; } },
  settings: {
    get: async () => { await delay(100); return { ...settings }; },
    update: async (data: any) => { await delay(200); settings = { ...settings, ...data }; return { ...settings }; },
    getGeneral: async () => {
      await delay(100);
      return {
        companyName: localStorage.getItem('company_name') || 'Divine Properties',
        address: localStorage.getItem('company_address') || '100 Pine Street, San Francisco, CA',
        logo: '/logo.png',
        timezone: localStorage.getItem('company_timezone') || 'EST',
        currency: localStorage.getItem('company_currency') || 'USD',
        dateFormat: 'MM/DD/YYYY',
        language: 'English',
        primaryColor: '#6366f1',
      };
    },
    updateGeneral: async (data: any) => {
      await delay(200);
      return data;
    },
  },

  dashboard: {
    getMetrics: async (): Promise<DashboardMetrics> => {
      await delay(200);
      return {
        totalProperties: properties.length,
        totalUnits: units.length,
        occupiedUnits: units.filter(u => u.status === 'Occupied').length,
        vacantUnits: units.filter(u => u.status === 'Vacant').length,
        monthlyRevenue: properties.reduce((sum, p) => sum + p.monthlyRevenue, 0),
        pendingRent: 8400,
        expenses: 12500,
        openMaintenance: maintenanceRequests.length,
        leasesExpiringSoon: leases.filter(l => l.status === 'Active').length,
        occupancyRate: 85,
      };
    },
    getChartData: async (): Promise<DashboardChartData> => {
      await delay(200);
      return {
        revenueGrowth: [
          { month: 'Jan', revenue: 78000 },
          { month: 'Jul', revenue: 112000 },
        ],
        incomeVsExpenses: [
          { month: 'Jan', income: 78000, expenses: 22000 },
          { month: 'Jul', income: 112000, expenses: 34000 },
        ],
        occupancyTrend: [
          { month: 'Jan', rate: 84 },
          { month: 'Jul', rate: 94 },
        ],
        maintenanceAnalytics: [
          { category: 'Plumbing', count: 48 },
        ]
      };
    }
  },

  // CRM Dashboard analytics API (New in Phase 3)
  // CRM Dashboard analytics API (New in Phase 3)
  crm: {
    getMetrics: async () => {
      await delay(200);
      return {
        newLeads: leads.filter(l => l.status === 'New').length,
        toursToday: 4,
        pendingApplications: applications.filter(a => a.status === 'Pending').length,
        conversionRate: 24, // percent
        avgResponseTime: 4.5, // hours
      };
    },
    getChartData: async () => {
      await delay(200);
      return {
        leadSources: [
          { name: 'Zillow', value: 45 },
          { name: 'Apartments.com', value: 35 },
          { name: 'Website', value: 25 },
          { name: 'Referral', value: 15 },
          { name: 'Other', value: 10 },
        ],
        pipelineFunnel: [
          { stage: 'New', count: leads.filter(l => l.status === 'New').length },
          { stage: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length },
          { stage: 'Tour Scheduled', count: leads.filter(l => l.status === 'Tour Scheduled').length },
          { stage: 'Application Sent', count: leads.filter(l => l.status === 'Application Sent').length },
          { stage: 'Negotiating', count: leads.filter(l => l.status === 'Negotiating').length },
          { stage: 'Lease Signed', count: leads.filter(l => l.status === 'Lease Signed').length },
        ]
      };
    }
  },

  accounts: {
    getAll: async () => { await delay(100); return [...coaAccounts]; },
    create: async (data: any) => {
      await delay(200);
      const newAcc = { 
        ...data, 
        id: `coa-${coaAccounts.length + 1}`, 
        balance: data.balance !== undefined ? data.balance : 0, 
        status: 'Active' 
      };
      coaAccounts.unshift(newAcc);
      return newAcc;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = coaAccounts.findIndex(a => a.id === id);
      if (idx !== -1) coaAccounts[idx] = { ...coaAccounts[idx], ...data };
      return coaAccounts[idx];
    },
    delete: async (id: string) => { await delay(150); coaAccounts = coaAccounts.filter(a => a.id !== id); return true; },
  },

  journalEntries: {
    getAll: async () => { await delay(150); return [...journalEntries]; },
    getById: async (id: string) => { await delay(50); return journalEntries.find(j => j.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newJe = {
        ...data,
        id: `je-${journalEntries.length + 1}`,
        entryNumber: `JE-${20000 + journalEntries.length + 1}`,
        status: 'Draft',
        createdBy: 'Manager',
      };
      journalEntries.push(newJe);
      return newJe;
    },
    post: async (id: string) => {
      await delay(150);
      const idx = journalEntries.findIndex(j => j.id === id);
      if (idx !== -1) {
        journalEntries[idx].status = 'Posted';
        journalEntries[idx].lines.forEach((line, lineIdx) => {
          generalLedger.push({
            id: `gl-${id}-${lineIdx}`,
            date: journalEntries[idx].date,
            accountId: line.accountId,
            accountName: line.accountName,
            description: journalEntries[idx].description,
            reference: journalEntries[idx].entryNumber,
            debit: line.debit,
            credit: line.credit,
            balance: 5000 + (line.debit - line.credit),
          });
        });
      }
      return journalEntries[idx];
    },
    reverse: async (id: string) => {
      await delay(150);
      const idx = journalEntries.findIndex(j => j.id === id);
      if (idx !== -1) {
        journalEntries[idx].status = 'Reversed';
        journalEntries[idx].lines.forEach((line, lineIdx) => {
          generalLedger.push({
            id: `gl-rev-${id}-${lineIdx}`,
            date: new Date().toISOString().split('T')[0],
            accountId: line.accountId,
            accountName: line.accountName,
            description: `Reversal of JE-${journalEntries[idx].entryNumber}`,
            reference: `JE-REV-${journalEntries[idx].entryNumber}`,
            debit: line.credit,
            credit: line.debit,
            balance: 5000 + (line.credit - line.debit),
          });
        });
      }
      return journalEntries[idx];
    }
  },

  generalLedger: {
    getAll: async () => { await delay(200); return [...generalLedger]; }
  },

  bankAccounts: {
    getAll: async () => { await delay(100); return [...bankAccounts]; },
    create: async (data: any) => {
      await delay(200);
      const newBank = { ...data, id: `bank-${bankAccounts.length + 1}`, currentBalance: data.openingBalance, status: 'Active' };
      bankAccounts.push(newBank);
      return newBank;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = bankAccounts.findIndex(b => b.id === id);
      if (idx !== -1) bankAccounts[idx] = { ...bankAccounts[idx], ...data };
      return bankAccounts[idx];
    },
    delete: async (id: string) => { await delay(150); bankAccounts = bankAccounts.filter(b => b.id !== id); return true; },
  },

  bankReconciliation: {
    getAll: async () => {
      await delay(150);
      return {
        statementBalance: 45000,
        reconciledItems: 12,
        unreconciledItems: [
          { id: 'stmt-1', date: '2026-07-01', description: 'Rent Payment Receipt Chase ACH', amount: 1500, type: 'Credit' },
          { id: 'stmt-2', date: '2026-07-02', description: 'Monthly Landscaping Bill Payout', amount: -450, type: 'Debit' },
        ]
      };
    }
  },

  expenses: {
    getAll: async () => { await delay(150); return [...expensesList]; },
    create: async (data: any) => {
      await delay(200);
      const newExp = { ...data, id: `exp-500${expensesList.length + 1}`, status: 'Pending Approval' };
      expensesList.unshift(newExp);
      return newExp;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = expensesList.findIndex(e => e.id === id);
      if (idx !== -1) expensesList[idx] = { ...expensesList[idx], ...data };
      return expensesList[idx];
    },
    delete: async (id: string) => { await delay(150); expensesList = expensesList.filter(e => e.id !== id); return true; },
    approve: async (id: string) => {
      await delay(150);
      const idx = expensesList.findIndex(e => e.id === id);
      if (idx !== -1) expensesList[idx].status = 'Approved';
      return expensesList[idx];
    },
    reject: async (id: string) => {
      await delay(150);
      const idx = expensesList.findIndex(e => e.id === id);
      if (idx !== -1) expensesList[idx].status = 'Rejected';
      return expensesList[idx];
    }
  },

  income: {
    getAll: async () => { await delay(150); return [...incomeList]; },
    create: async (data: any) => {
      await delay(200);
      const newInc = { ...data, id: `inc-600${incomeList.length + 1}`, status: 'Cleared' };
      incomeList.unshift(newInc);
      return newInc;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = incomeList.findIndex(i => i.id === id);
      if (idx !== -1) incomeList[idx] = { ...incomeList[idx], ...data };
      return incomeList[idx];
    },
    delete: async (id: string) => { await delay(150); incomeList = incomeList.filter(i => i.id !== id); return true; }
  },

  vendorBills: {
    getAll: async () => { await delay(150); return [...vendorBillsList]; },
    getById: async (id: string) => { await delay(50); return vendorBillsList.find(b => b.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newBill = { ...data, id: `bill-700${vendorBillsList.length + 1}`, balance: data.amount, status: 'Draft' };
      vendorBillsList.unshift(newBill);
      return newBill;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = vendorBillsList.findIndex(b => b.id === id);
      if (idx !== -1) vendorBillsList[idx] = { ...vendorBillsList[idx], ...data };
      return vendorBillsList[idx];
    },
    delete: async (id: string) => { await delay(150); vendorBillsList = vendorBillsList.filter(b => b.id !== id); return true; }
  },

  recurringTransactions: {
    getAll: async () => { await delay(100); return [...recurringTransactions]; },
    create: async (data: any) => {
      await delay(200);
      const newRec = { ...data, id: `rec-${recurringTransactions.length + 1}`, status: 'Active' };
      recurringTransactions.push(newRec);
      return newRec;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = recurringTransactions.findIndex(r => r.id === id);
      if (idx !== -1) recurringTransactions[idx] = { ...recurringTransactions[idx], ...data };
      return recurringTransactions[idx];
    },
    delete: async (id: string) => { await delay(150); recurringTransactions = recurringTransactions.filter(r => r.id !== id); return true; }
  },

  budgets: {
    getAll: async () => { await delay(100); return [...budgets]; }
  },

  ownerStatements: {
    getAll: async () => { await delay(150); return [...ownerStatementsList]; },
    getById: async (id: string) => { await delay(50); return ownerStatementsList.find(s => s.id === id); },
    generate: async (data: any) => {
      await delay(250);
      const newStatement = {
        ...data,
        id: `os-100${ownerStatementsList.length + 1}`,
        netDistribution: data.income - data.expenses,
        status: 'Generated',
      };
      ownerStatementsList.unshift(newStatement);
      return newStatement;
    }
  },

  taxes: {
    getAll: async () => { await delay(100); return [...taxRates]; },
    create: async (data: any) => {
      await delay(200);
      const newTax = { ...data, id: `tax-${taxRates.length + 1}`, status: 'Active' };
      taxRates.push(newTax);
      return newTax;
    }
  },

  financialReports: {
    getPnL: async () => {
      await delay(250);
      return {
        totalIncome: 120000,
        totalExpenses: 34000,
        netProfit: 86000,
        breakdown: [
          { category: 'Rent Revenue', amount: 110000 },
          { category: 'Maintenance Fees', amount: 6000 },
          { category: 'Utility Reimbursements', amount: 4000 },
        ],
      };
    }
  },


  serviceRequests: {
    getAll: async () => { await delay(150); return [...maintenanceRequests]; },
    getById: async (id: string) => { await delay(50); return maintenanceRequests.find(r => r.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newReq = {
        ...data,
        id: `sr-${maintenanceRequests.length + 1}`,
        status: 'New',
        createdAt: new Date().toISOString().split('T')[0],
        messages: data.messages || [],
      };
      maintenanceRequests.unshift(newReq);
      return newReq;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = maintenanceRequests.findIndex(r => r.id === id);
      if (idx !== -1) {
        if (data.newMessage) {
          const currentMsgs = maintenanceRequests[idx].messages || [];
          maintenanceRequests[idx].messages = [
            ...currentMsgs,
            {
              id: `msg-${Date.now()}`,
              senderName: data.newMessage.senderName,
              role: data.newMessage.role,
              text: data.newMessage.text,
              timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
          delete data.newMessage;
        }

        maintenanceRequests[idx] = { ...maintenanceRequests[idx], ...data };
        
        // Auto-create a corresponding Work Order when a Service Request is assigned a Vendor & Cost
        if (data.status === 'Assigned') {
          const req = maintenanceRequests[idx];
          const exists = workOrders.some(w => w.id === `wo-sr-${req.id}`);
          if (!exists) {
            workOrders.unshift({
              id: `wo-sr-${req.id}`,
              workOrderNumber: `WO-${40000 + workOrders.length + 1}`,
              propertyId: req.propertyId,
              propertyName: req.propertyName,
              unitNumber: req.unitNumber,
              vendorId: req.assignedVendorId || '',
              vendorName: req.assignedVendorName || 'Assigned Vendor',
              assignedTechnician: 'Technician Lead 1', // Auto-assigned to staff portal user
              scheduledDate: new Date().toISOString().split('T')[0],
              estimatedCost: req.cost || 0,
              actualCost: 0,
              status: 'Assigned',
              issue: req.title,
              description: req.description,
              priority: req.priority === 'Emergency' || req.priority === 'Urgent' ? 'Urgent' : (req.priority as any === 'Low' || req.priority as any === 'Medium' || req.priority as any === 'High' ? req.priority as any : 'Medium'),
            });
          }
        }
      }
      return maintenanceRequests[idx];
    },
    delete: async (id: string) => { await delay(150); maintenanceRequests = maintenanceRequests.filter(r => r.id !== id); return true; },
  },

  workOrders: {
    getAll: async () => { await delay(150); return [...workOrders]; },
    getById: async (id: string) => { await delay(50); return workOrders.find(w => w.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newWo = {
        ...data,
        id: `wo-${workOrders.length + 1}`,
        workOrderNumber: `WO-${40000 + workOrders.length + 1}`,
        status: 'Draft',
        actualCost: 0,
      };
      workOrders.unshift(newWo);
      return newWo;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = workOrders.findIndex(w => w.id === id);
      if (idx !== -1) {
        // If an advance payment is being newly recorded
        if (data.advancePaymentAmount && !workOrders[idx].advancePaymentAmount) {
          expensesList.unshift({
            id: `exp-${Date.now()}`,
            vendorName: workOrders[idx].vendorName || 'Maintenance Personnel',
            propertyId: workOrders[idx].propertyId || 'prop-1',
            propertyName: workOrders[idx].propertyName || 'Property',
            category: 'Repairs',
            date: data.advancePaymentDate || new Date().toISOString().split('T')[0],
            amount: Number(data.advancePaymentAmount),
            tax: 0,
            paymentMethod: data.advancePaymentMethod || 'Check',
            status: 'Approved',
          });
        }

        workOrders[idx] = { ...workOrders[idx], ...data };
        
        // Sync Work Order Completion back to the original Service Request
        if (id.startsWith('wo-sr-') && data.status === 'Completed') {
          const srId = id.replace('wo-sr-', '');
          const srIdx = maintenanceRequests.findIndex(r => r.id === srId);
          if (srIdx !== -1) {
            maintenanceRequests[srIdx].status = 'Completed';
            if (data.actualCost) {
              const totalCost = Number(data.actualCost) + Number(data.extraExpenses || 0);
              maintenanceRequests[srIdx].cost = totalCost;
            }
          }
        }
      }
      return workOrders[idx];
    },
    delete: async (id: string) => { await delay(150); workOrders = workOrders.filter(w => w.id !== id); return true; },
    schedule: async (id: string, date: string) => {
      await delay(150);
      const idx = workOrders.findIndex(w => w.id === id);
      if (idx !== -1) {
        workOrders[idx].status = 'Scheduled';
        workOrders[idx].scheduledDate = date;
      }
      return workOrders[idx];
    }
  },

  violations: {
    getAll: async () => { await delay(150); return [...violationsList]; },
    getById: async (id: string) => { await delay(50); return violationsList.find(v => v.id === id); },
    addSynced: (syncedItems: any[], bin?: string) => {
      const cleanBin = bin?.trim();
      const firstItem = syncedItems[0];
      const streetName = (firstItem?.street || '').trim();
      const houseNum = (firstItem?.houseNumber || '').trim();
      const realAddr = (houseNum && streetName) ? `${houseNum} ${streetName}` : streetName;

      const matchedProp = properties.find(p => 
        p.nycBin === cleanBin || 
        (p as any).bin === cleanBin ||
        (realAddr && (p.name.toLowerCase() === realAddr.toLowerCase() || p.address.toLowerCase() === realAddr.toLowerCase()))
      );

      const propId = matchedProp ? matchedProp.id : (cleanBin ? `prop-bin-${cleanBin}` : 'prop-nyc-dob');
      const propName = matchedProp 
        ? matchedProp.name 
        : (realAddr ? realAddr : `NYC Building (BIN ${cleanBin})`);

      const formatted: Violation[] = syncedItems.map((item, idx) => ({
        id: item.id || `viol-dob-${Date.now()}-${idx}`,
        propertyId: propId,
        propertyName: propName,
        unitNumber: item.deviceNumber ? `Elevator #${item.deviceNumber}` : (item.unitNumber || 'Building Wide'),
        violationCode: item.violationNumber || item.number || item.isn_dob_bis_viol || 'DOB-UNK',
        issuingAuthority: 'NYC Department of Buildings (DOB)',
        description: item.description || item.dispositionComments || 'NYC DOB Building Code Violation Notice',
        fineAmount: item.fineAmount || 250,
        dueDate: item.issueDate || new Date().toISOString().split('T')[0],
        severity: (item.severity === 'Critical' || item.severity === 'Warning') ? item.severity : 'Warning',
        status: (item.status === 'Resolved' || item.status === 'Open' || item.status === 'Disputed') ? item.status : 'Open',
      }));
      // Filter out duplicates by violationCode
      const existingCodes = new Set(violationsList.map(v => v.violationCode));
      const newUnique = formatted.filter(v => !existingCodes.has(v.violationCode));
      violationsList = [...newUnique, ...violationsList];
      return violationsList;
    },
    syncDob: async (bin?: string) => {
      await delay(200);
      const cleanBin = bin ? bin.trim() : '4115368';
      const mockSynced = [
        {
          id: `viol-nyc-${cleanBin}-1`,
          violationNumber: `V*${cleanBin.slice(-4)}01`,
          issueDate: new Date().toISOString().split('T')[0],
          description: `NYC DOB Building Code Compliance Citation (BIN: ${cleanBin})`,
          severity: 'Critical',
          status: 'Open',
        },
        {
          id: `viol-nyc-${cleanBin}-2`,
          violationNumber: `V*${cleanBin.slice(-4)}02`,
          issueDate: new Date().toISOString().split('T')[0],
          description: `Boiler & Elevator Safety Compliance Notice (BIN: ${cleanBin})`,
          severity: 'Warning',
          status: 'Open',
        }
      ];
      return mockApi.violations.addSynced(mockSynced, cleanBin);
    },
    syncAllDob: async () => {
      await delay(250);
      const propsWithBin = properties.filter(p => p.nycBin || (p as any).bin);
      const syncedSummary: any[] = [];
      let totalSynced = 0;
      for (const p of propsWithBin) {
        const binVal = p.nycBin || (p as any).bin;
        if (!binVal) continue;
        const res = await mockApi.violations.syncDob(binVal);
        syncedSummary.push({
          propertyId: p.id,
          propertyName: p.name,
          bin: binVal,
          count: res?.length || 0,
        });
        totalSynced += (res?.length || 0);
      }
      return { totalSyncedCount: totalSynced, syncedProperties: syncedSummary, violations: violationsList };
    },
    createWorkOrder: async (id: string) => {
      await delay(100);
      const vIdx = violationsList.findIndex(v => v.id === id || v.violationCode === id || (v.id && id && v.id.toString() === id.toString()));
      if (vIdx !== -1) {
        const violation = violationsList[vIdx];
        const newReqId = `req-viol-${Date.now()}`;
        
        const newReq = {
          id: newReqId,
          requestNumber: `REQ-${5000 + maintenanceRequests.length + 1}`,
          propertyId: violation.propertyId || 'prop-1',
          propertyName: violation.propertyName || 'NYC Property Asset',
          unitId: 'unit-1',
          unitNumber: violation.unitNumber || 'Building Wide',
          tenantName: 'NYC DOB Compliance Auditor',
          category: 'Building Code Compliance',
          title: `NYC DOB Violation: ${violation.violationCode}`,
          description: `NYC DOB Code Citation: ${violation.description}. Authority: ${violation.issuingAuthority}. compliance target: ${violation.dueDate}`,
          priority: 'Emergency' as const,
          status: 'Approved' as const,
          submittedDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString().split('T')[0],
          assignedVendorId: undefined,
          assignedVendorName: undefined,
        };

        maintenanceRequests.unshift(newReq);
        violationsList[vIdx].workOrderId = newReqId;
        violationsList[vIdx].status = 'Resolved'; // Settled on violations table
      } else {
        // If not in local array index, try to mark matching item or push resolved item
        const item = violationsList.find(v => v.id === id || v.violationCode === id);
        if (item) {
          item.status = 'Resolved';
          item.workOrderId = `req-viol-${Date.now()}`;
        }
      }
      return true;
    }
  },

  screening: {
    getAll: async () => { await delay(150); return [...screeningChecksList]; },
    getById: async (id: string) => { await delay(50); return screeningChecksList.find(s => s.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newCheck: ScreeningCheck = {
        id: `sc-${screeningChecksList.length + 1}`,
        applicantId: `appl-${Date.now()}`,
        applicationId: `ap-${Date.now()}`,
        applicantName: `${data.firstName} ${data.lastName}`,
        applicantEmail: data.email,
        applicantPhone: data.phoneNumber || '',
        propertyId: data.propertyId || 'prop-1',
        propertyName: data.propertyName || 'Oakridge Heights',
        unitId: data.unitId || 'unit-1',
        unitNumber: data.unitNumber || '101',
        screeningPackage: data.screeningPackage || 'Basic',
        paymentResponsibility: data.paymentResponsibility || 'Applicant',
        paymentStatus: data.paymentResponsibility === 'Manager' ? 'Waived' : 'Pending',
        applicantStatus: 'Invited',
        screeningStatus: 'Pending',
        identityVerificationStatus: 'Pending',
        criminalStatus: 'Pending',
        evictionStatus: 'Pending',
        screeningProvider: 'TransUnion',
        invitationSentAt: new Date().toISOString().split('T')[0],
      };
      screeningChecksList.unshift(newCheck);
      return newCheck;
    },
    sendInvitation: async (id: string) => {
      await delay(150);
      const idx = screeningChecksList.findIndex(s => s.id === id);
      if (idx !== -1) {
        screeningChecksList[idx].applicantStatus = 'Invited';
        screeningChecksList[idx].screeningStatus = 'Pending';
      }
      return screeningChecksList[idx];
    },
    submitConsent: async (id: string) => {
      await delay(150);
      const idx = screeningChecksList.findIndex(s => s.id === id);
      if (idx !== -1) {
        screeningChecksList[idx].applicantStatus = 'Submitted';
        screeningChecksList[idx].consentSubmittedAt = new Date().toISOString().split('T')[0];
        if (screeningChecksList[idx].paymentResponsibility === 'Manager') {
          screeningChecksList[idx].screeningStatus = 'Processing';
        } else {
          screeningChecksList[idx].screeningStatus = 'Processing';
        }
      }
      return screeningChecksList[idx];
    },
    submitPayment: async (id: string) => {
      await delay(150);
      const idx = screeningChecksList.findIndex(s => s.id === id);
      if (idx !== -1) {
        screeningChecksList[idx].paymentStatus = 'Paid';
        screeningChecksList[idx].paymentCompletedAt = new Date().toISOString().split('T')[0];
        screeningChecksList[idx].screeningStatus = 'Processing';
      }
      return screeningChecksList[idx];
    },
    generateReport: async (id: string) => {
      await delay(1000);
      const idx = screeningChecksList.findIndex(s => s.id === id);
      if (idx !== -1) {
        screeningChecksList[idx].identityVerificationStatus = 'Verified';
        screeningChecksList[idx].creditScore = 720;
        screeningChecksList[idx].creditRecommendation = 'Approved';
        screeningChecksList[idx].criminalStatus = 'No Records Found';
        screeningChecksList[idx].evictionStatus = 'No Records Found';
        screeningChecksList[idx].incomeVerified = true;
        screeningChecksList[idx].screeningStatus = 'Completed';
        screeningChecksList[idx].reportGeneratedAt = new Date().toISOString().split('T')[0];
        screeningChecksList[idx].creditReportUrl = 'mock_credit_report.pdf';
        screeningChecksList[idx].criminalReportUrl = 'mock_criminal_report.pdf';
        screeningChecksList[idx].evictionReportUrl = 'mock_eviction_report.pdf';
      }
      return screeningChecksList[idx];
    },
    approve: async (id: string) => {
      await delay(200);
      const idx = screeningChecksList.findIndex(s => s.id === id);
      if (idx !== -1) {
        screeningChecksList[idx].screeningStatus = 'Approved';
        screeningChecksList[idx].approvedAt = new Date().toISOString().split('T')[0];
        
        const check = screeningChecksList[idx];
        const names = check.applicantName.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || 'Applicant';
        tenants.unshift({
          id: check.applicantId || `tenant-${Date.now()}`,
          firstName,
          lastName,
          email: check.applicantEmail,
          phone: check.applicantPhone,
          propertyId: check.propertyId || '',
          propertyName: check.propertyName,
          unitId: check.unitId || '',
          unitNumber: check.unitNumber,
          status: 'Active',
        });
      }
      return screeningChecksList[idx];
    },
    decline: async (id: string) => {
      await delay(200);
      const idx = screeningChecksList.findIndex(s => s.id === id);
      if (idx !== -1) {
        screeningChecksList[idx].screeningStatus = 'Declined';
        screeningChecksList[idx].declinedAt = new Date().toISOString().split('T')[0];
      }
      return screeningChecksList[idx];
    }
  },

  vendors: {
    getAll: async () => { await delay(150); return [...vendors]; },
    getById: async (id: string) => { await delay(50); return vendors.find(v => v.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newVendor = {
        ...data,
        id: `ven-${vendors.length + 1}`,
        rating: 4.5,
        activeJobs: 0,
        completedJobs: 0,
        responseTime: '2h',
        status: 'Active',
      };
      vendors.unshift(newVendor);
      return newVendor;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = vendors.findIndex(v => v.id === id);
      if (idx !== -1) vendors[idx] = { ...vendors[idx], ...data };
      return vendors[idx];
    },
    delete: async (id: string) => { await delay(150); vendors = vendors.filter(v => v.id !== id); return true; },
  },

  vendorInvoices: {
    getAll: async () => { await delay(100); return [...vendorInvoicesList]; },
    getById: async (id: string) => { await delay(50); return vendorInvoicesList.find(vi => vi.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newInv = {
        ...data,
        id: `vi-${vendorInvoicesList.length + 1}`,
        invoiceNumber: `V-INV-${80000 + vendorInvoicesList.length + 1}`,
        status: 'Draft',
      };
      vendorInvoicesList.unshift(newInv);
      return newInv;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = vendorInvoicesList.findIndex(vi => vi.id === id);
      if (idx !== -1) vendorInvoicesList[idx] = { ...vendorInvoicesList[idx], ...data };
      return vendorInvoicesList[idx];
    },
    delete: async (id: string) => { await delay(150); vendorInvoicesList = vendorInvoicesList.filter(vi => vi.id !== id); return true; },
  },

  inspections: {
    getAll: async () => { await delay(150); return [...inspectionsList]; },
    getById: async (id: string) => { await delay(50); return inspectionsList.find(i => i.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newIns = {
        ...data,
        id: `ins-${inspectionsList.length + 1}`,
        status: 'Scheduled',
        date: new Date().toISOString().split('T')[0],
      };
      inspectionsList.unshift(newIns);
      return newIns;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = inspectionsList.findIndex(i => i.id === id);
      if (idx !== -1) inspectionsList[idx] = { ...inspectionsList[idx], ...data };
      return inspectionsList[idx];
    },
    delete: async (id: string) => { await delay(150); inspectionsList = inspectionsList.filter(i => i.id !== id); return true; },
  },

  assets: {
    getAll: async () => { await delay(150); return [...assetsList]; },
    getById: async (id: string) => { await delay(50); return assetsList.find(a => a.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newAsset = {
        ...data,
        id: `asset-${assetsList.length + 1}`,
        currentCondition: 85,
      };
      assetsList.unshift(newAsset);
      return newAsset;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = assetsList.findIndex(a => a.id === id);
      if (idx !== -1) assetsList[idx] = { ...assetsList[idx], ...data };
      return assetsList[idx];
    },
    delete: async (id: string) => { await delay(150); assetsList = assetsList.filter(a => a.id !== id); return true; },
  },

  preventiveMaintenance: {
    getAll: async () => { await delay(100); return [...preventiveTasks]; },
    create: async (data: any) => {
      await delay(200);
      const newPt = {
        ...data,
        id: `pt-${preventiveTasks.length + 1}`,
        status: 'Scheduled',
      };
      preventiveTasks.unshift(newPt);
      return newPt;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = preventiveTasks.findIndex(pt => pt.id === id);
      if (idx !== -1) preventiveTasks[idx] = { ...preventiveTasks[idx], ...data };
      return preventiveTasks[idx];
    },
    delete: async (id: string) => { await delay(150); preventiveTasks = preventiveTasks.filter(pt => pt.id !== id); return true; },
  },

  inventory: {
    getAll: async () => { await delay(150); return [...inventoryItems]; },
    create: async (data: any) => {
      await delay(200);
      const newInv = {
        ...data,
        id: `inv-${inventoryItems.length + 1}`,
        status: 'In Stock',
      };
      inventoryItems.unshift(newInv);
      return newInv;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = inventoryItems.findIndex(i => i.id === id);
      if (idx !== -1) inventoryItems[idx] = { ...inventoryItems[idx], ...data };
      return inventoryItems[idx];
    },
    delete: async (id: string) => { await delay(150); inventoryItems = inventoryItems.filter(i => i.id !== id); return true; },
    addStock: async (id: string, amount: number) => {
      await delay(150);
      const idx = inventoryItems.findIndex(i => i.id === id);
      if (idx !== -1) {
        inventoryItems[idx].quantity += amount;
        if (inventoryItems[idx].quantity > inventoryItems[idx].reorderLevel) {
          inventoryItems[idx].status = 'In Stock';
        }
      }
      return inventoryItems[idx];
    },
    removeStock: async (id: string, amount: number) => {
      await delay(150);
      const idx = inventoryItems.findIndex(i => i.id === id);
      if (idx !== -1) {
        inventoryItems[idx].quantity = Math.max(0, inventoryItems[idx].quantity - amount);
        if (inventoryItems[idx].quantity === 0) {
          inventoryItems[idx].status = 'Out of Stock';
        } else if (inventoryItems[idx].quantity <= inventoryItems[idx].reorderLevel) {
          inventoryItems[idx].status = 'Low Stock';
        }
      }
      return inventoryItems[idx];
    }
  },

  owners: {
    getAll: async () => { await delay(100); return [...owners]; },
    getById: async (id: string) => { await delay(50); return owners.find(o => o.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newOwn = { ...data, id: `own-${owners.length + 1}` };
      owners.push(newOwn);
      return newOwn;
    },
  },

  ownerPortal: {
    getMetrics: async () => {
      await delay(200);
      return {
        totalProperties: 4,
        totalUnits: 12,
        occupancyRate: '91.7%',
        monthlyIncome: 34000,
        monthlyExpenses: 8400,
        netIncome: 25600,
        pendingMaintenance: 3,
        upcomingRenewals: 2,
      };
    },
    getSupportTickets: async () => {
      await delay(100);
      return [...ownerSupportTicketsList];
    },
    createSupportTicket: async (data: any) => {
      await delay(200);
      const newTkt = {
        ...data,
        id: `st-${ownerSupportTicketsList.length + 1}`,
        status: 'Open',
        createdAt: new Date().toISOString().split('T')[0],
      };
      ownerSupportTicketsList.unshift(newTkt);
      return newTkt;
    }
  },


  ownerProperties: {
    getAll: async () => {
      await delay(150);
      return [...addedOwnerProps, ...properties.slice(0, 4)];
    },
    getById: async (id: string) => {
      await delay(50);
      return [...addedOwnerProps, ...properties].find(p => p.id === id);
    },
    create: async (data: any) => {
      await delay(200);
      const newProp = {
        id: `prop-owner-${addedOwnerProps.length + 1}`,
        name: data.name,
        address: data.address || '100 Main St, Austin, TX',
        type: data.type || 'Apartment',
        monthlyRent: data.monthlyRent || 2400,
        status: 'Active',
      };
      addedOwnerProps.unshift(newProp);
      properties.unshift(newProp as any);
      return newProp;
    },
    delete: async (id: string) => {
      await delay(150);
      addedOwnerProps = addedOwnerProps.filter(p => p.id !== id);
      const pIdx = properties.findIndex(p => p.id === id);
      if (pIdx !== -1) properties.splice(pIdx, 1);
      return true;
    }
  },


  ownerDistributions: {
    getAll: async () => { await delay(100); return [...ownerDistributionsList]; },
  },

  ownerDocuments: {
    getAll: async () => { await delay(150); return [...ownerDocumentsList]; },
    upload: async (data: any) => {
      await delay(200);
      const newDoc = {
        id: `odoc-${ownerDocumentsList.length + 1}`,
        name: data.name,
        category: data.category || 'Statements',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: data.size || '220 KB',
      };
      ownerDocumentsList.unshift(newDoc);
      return newDoc as any;
    }
  },

  ownerMaintenance: {
    getAll: async () => { await delay(150); return [...maintenanceRequests].slice(0, 20); },
  },

  ownerMessages: {
    getAll: async () => { await delay(150); return [...ownerConversationsList]; },
    compose: async (data: any) => {
      await delay(200);
      const newMsg = {
        ...data,
        id: `omsg-${ownerConversationsList.length + 1}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      ownerConversationsList.unshift(newMsg);
      return newMsg;
    }
  },

  ownerReports: {
    getAll: async () => {
      await delay(150);
      return {
        revenue: 34000,
        expenses: 8400,
        occupancy: 91.7,
        distribution: 25600,
      };
    }
  },

  tenantPortal: {
    getMetrics: async () => {
      await delay(150);
      return {
        currentRent: 1250,
        outstandingBalance: tenantOutstandingBalance,
        nextDueDate: '2026-08-01',
        unreadMessages: tenantConversationsList.filter(m => !m.read).length,
        packagesWaiting: tenantPackagesList.filter(p => p.pickupStatus === 'Pending').length,
        activeVisitors: tenantVisitorsList.filter(v => v.status === 'Scheduled').length,
        leaseExpiration: '2027-04-30',
        openMaintenanceRequests: tenantSupportTicketsList.filter(t => t.status === 'Open').length + 1,
      };
    },
    getSupportTickets: async () => {
      await delay(100);
      return [...tenantSupportTicketsList];
    },
    createSupportTicket: async (data: any) => {
      await delay(200);
      const newTkt = {
        ...data,
        id: `tst-${tenantSupportTicketsList.length + 1}`,
        status: 'Open',
        createdAt: new Date().toISOString().split('T')[0],
      };
      tenantSupportTicketsList.unshift(newTkt);
      return newTkt;
    }
  },

  tenantProfile: {
    get: async () => {
      await delay(100);
      return {
        id: 'ten-1',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah.c@skyline-rentals.com',
        phone: '(512) 555-0011',
        vehicles: 'Toyota Camry (Silver, 2021) - LIC# TX-77B12',
        pets: 'Golden Retriever (Rex)',
        preferredLanguage: 'English',
        companyName: 'Property Management',
        companyAddress: '100 Congress Ave, Austin, TX 78701',
        tenantAddress: '304 Skyline Luxury Lofts, Austin, TX 78702',
        unitDetails: 'Apt 304 (3rd Floor - Corner Unit)',
      };
    },
  },

  tenantPayments: {
    getAll: async () => { await delay(100); return [...rentPayments].slice(0, 30); },
    payRent: async (data: any) => {
      await delay(250);
      tenantOutstandingBalance = Math.max(0, tenantOutstandingBalance - (data.baseAmount || data.amount));
      const newPay = {
        id: `pay-${rentPayments.length + 1}`,
        tenantName: 'Sarah Connor',
        propertyName: 'Skyline Luxury Lofts',
        unitNumber: '304',
        amount: data.baseAmount || data.amount,
        date: new Date().toISOString().split('T')[0],
        method: data.method,
        status: 'Paid',
      };
      rentPayments.unshift(newPay as any);
      return newPay;
    }
  },

  tenantMaintenance: {
    getAll: async () => { await delay(100); return [...maintenanceRequests].slice(0, 15); },
    create: async (data: any) => {
      await delay(200);
      const newReq = {
        ...data,
        id: `sr-${maintenanceRequests.length + 1}`,
        propertyName: 'Skyline Luxury Lofts',
        unitNumber: '304',
        tenantName: 'Sarah Connor',
        status: 'Submitted',
        createdAt: new Date().toISOString().split('T')[0],
      };
      maintenanceRequests.unshift(newReq);
      return newReq;
    }
  },

  tenantDocuments: {
    getAll: async () => { await delay(100); return [...tenantDocumentsList].slice(0, 50); },
    upload: async (data: any) => {
      await delay(200);
      const newDoc = {
        id: `tdoc-${tenantDocumentsList.length + 1}`,
        name: data.name,
        category: data.category || 'Lease',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: data.size || '150 KB',
      };
      tenantDocumentsList.unshift(newDoc);
      return newDoc;
    }
  },

  tenantMessages: {
    getAll: async () => { await delay(100); return [...tenantConversationsList].slice(0, 20); },
    compose: async (data: any) => {
      await delay(200);
      const newMsg = {
        ...data,
        id: `tmsg-${tenantConversationsList.length + 1}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      tenantConversationsList.unshift(newMsg);
      return newMsg;
    }
  },

  tenantAnnouncements: {
    getAll: async () => { await delay(100); return [...tenantAnnouncementsList].slice(0, 25); },
  },

  tenantLeases: {
    get: async () => {
      await delay(100);
      return {
        rentAmount: 1250,
        securityDeposit: 1500,
        leaseStart: '2026-05-01',
        leaseEnd: '2027-04-30',
        renewalStatus: 'Eligible',
        parkingAssignment: 'Space #42',
        storageAssignment: 'Locker #B',
      };
    }
  },

  tenantInsurance: {
    get: async () => {
      await delay(100);
      return {
        provider: 'Lemonade Insurance',
        policyNumber: 'LEM-88390',
        coverageAmount: 30000,
        effectiveDate: '2026-05-01',
        expirationDate: '2027-04-30',
      };
    }
  },

  tenantVisitors: {
    getAll: async () => { await delay(100); return [...tenantVisitorsList].slice(0, 20); },
    create: async (data: any) => {
      await delay(200);
      const newVis = {
        ...data,
        id: `vis-${tenantVisitorsList.length + 1}`,
        status: 'Scheduled',
      };
      tenantVisitorsList.unshift(newVis);
      return newVis;
    }
  },

  tenantPackages: {
    getAll: async () => { await delay(100); return [...tenantPackagesList].slice(0, 25); },
    pickup: async (id: string) => {
      await delay(150);
      const idx = tenantPackagesList.findIndex(p => p.id === id);
      if (idx !== -1) {
        tenantPackagesList[idx].pickupStatus = 'Picked Up';
      }
      return tenantPackagesList[idx];
    }
  },

  communication: {
    getMetrics: async () => {
      await delay(150);
      return {
        totalConversations: commConversationsList.length,
        unreadMessages: commMessagesList.filter(m => m.status === 'Sent' || m.status === 'Delivered').length,
        emailsSentToday: 24,
        smsSentToday: 48,
        activeCampaigns: commCampaignsList.filter(c => c.status === 'Running').length,
        scheduledMessages: 12,
        failedDeliveries: 2,
        announcementViews: 1450,
      };
    },
    getActivityLog: async () => {
      await delay(100);
      return [...commActivitiesList];
    }
  },

  messages: {
    getAll: async () => { await delay(100); return [...commMessagesList].slice(0, 50); },
    create: async (data: any) => {
      await delay(150);
      const newMsg = {
        ...data,
        id: `cmsg-${commMessagesList.length + 1}`,
        timestamp: new Date().toISOString().split('T')[0],
        status: 'Sent',
      };
      commMessagesList.unshift(newMsg);
      return newMsg;
    }
  },

  email: {
    getAll: async () => { await delay(100); return [...commEmailsList].slice(0, 30); },
    send: async (data: any) => {
      await delay(200);
      const newEm = {
        ...data,
        id: `cem-${commEmailsList.length + 1}`,
        sentAt: new Date().toISOString().split('T')[0],
        status: 'Sent',
      };
      commEmailsList.unshift(newEm);
      return newEm;
    }
  },

  sms: {
    getAll: async () => { await delay(100); return [...commSMSsList].slice(0, 30); },
    send: async (data: any) => {
      await delay(200);
      const newSms = {
        ...data,
        id: `csms-${commSMSsList.length + 1}`,
        sentAt: new Date().toISOString().split('T')[0],
        status: 'Sent',
      };
      commSMSsList.unshift(newSms);
      return newSms;
    }
  },

  notifications: {
    getAll: async () => { await delay(100); return [...commNotificationsList].slice(0, 50); },
    markAsRead: async (id: string) => {
      await delay(100);
      const idx = commNotificationsList.findIndex(n => n.id === id);
      if (idx !== -1) commNotificationsList[idx].status = 'Read';
      return true;
    }
  },

  templates: {
    getAll: async () => { await delay(100); return [...commTemplatesList]; },
    create: async (data: any) => {
      await delay(200);
      const newTemp = {
        ...data,
        id: `ctemp-${commTemplatesList.length + 1}`,
      };
      commTemplatesList.unshift(newTemp);
      return newTemp;
    }
  },

  campaigns: {
    getAll: async () => { await delay(100); return [...commCampaignsList]; },
    create: async (data: any) => {
      await delay(200);
      const newCamp = {
        ...data,
        id: `camp-${commCampaignsList.length + 1}`,
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        status: 'Scheduled',
      };
      commCampaignsList.unshift(newCamp);
      return newCamp;
    }
  },

  contacts: {
    getAll: async () => { await delay(100); return [...commContactsList]; },
  },

  conversations: {
    getAll: async () => { await delay(100); return [...commConversationsList]; },
  },

  announcements: {
    getAll: async () => { await delay(100); return [...commAnnouncementsList]; },
    create: async (data: any) => {
      await delay(200);
      const newAnn = {
        ...data,
        id: `cann-${commAnnouncementsList.length + 1}`,
        publishDate: new Date().toISOString().split('T')[0],
        status: 'Published',
      };
      commAnnouncementsList.unshift(newAnn);
      return newAnn;
    }
  },

  // --- Phase 10: Document Management System API ---
  documents: {
    getAll: async () => { await delay(100); return [...dmsDocumentsList].slice(0, 100); },
    getById: async (id: string) => { await delay(50); return dmsDocumentsList.find(d => d.id === id); },
    getMetrics: async () => {
      await delay(150);
      return {
        totalDocuments: dmsDocumentsList.length,
        pendingSignatures: dmsSignaturesList.filter(s => s.status === 'Sent').length,
        expiringDocuments: dmsDocumentsList.filter(d => d.status === 'Expired').length,
        sharedDocuments: dmsSharesList.filter(s => s.status === 'Active').length,
        archivedDocuments: dmsDocumentsList.filter(d => d.status === 'Archived').length,
        storageUsed: '42.7 GB',
        recentUploads: 24,
        recentDownloads: 87,
      };
    },
    create: async (data: any) => {
      await delay(200);
      const newDoc = {
        ...data,
        id: `doc-${dmsDocumentsList.length + 1}`,
        version: 1,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      dmsDocumentsList.unshift(newDoc);
      return newDoc;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = dmsDocumentsList.findIndex(d => d.id === id);
      if (idx !== -1) { dmsDocumentsList[idx] = { ...dmsDocumentsList[idx], ...data, updatedAt: new Date().toISOString().split('T')[0] }; }
      return dmsDocumentsList[idx];
    },
    archive: async (id: string) => {
      await delay(150);
      const idx = dmsDocumentsList.findIndex(d => d.id === id);
      if (idx !== -1) dmsDocumentsList[idx].status = 'Archived';
      return true;
    },
    delete: async (id: string) => {
      await delay(150);
      const idx = dmsDocumentsList.findIndex(d => d.id === id);
      if (idx !== -1) dmsDocumentsList.splice(idx, 1);
      return true;
    },
  },

  folders: {
    getAll: async () => { await delay(100); return [...dmsFoldersList].slice(0, 50); },
    create: async (data: any) => {
      await delay(200);
      const newFolder = {
        ...data,
        id: `fld-${dmsFoldersList.length + 1}`,
        documentCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      dmsFoldersList.unshift(newFolder);
      return newFolder;
    },
  },

  documentTemplates: {
    getAll: async () => { await delay(100); return [...dmsTemplatesList].slice(0, 50); },
    create: async (data: any) => {
      await delay(200);
      const newTmpl = { ...data, id: `dtmpl-${dmsTemplatesList.length + 1}`, createdAt: new Date().toISOString().split('T')[0] };
      dmsTemplatesList.unshift(newTmpl);
      return newTmpl;
    },
  },

  signatures: {
    getAll: async () => { await delay(100); return [...dmsSignaturesList].slice(0, 50); },
    create: async (data: any) => {
      await delay(250);
      const newSig = {
        ...data,
        id: `sig-${dmsSignaturesList.length + 1}`,
        status: 'Sent',
        sentAt: new Date().toISOString().split('T')[0],
        expiresAt: '2026-09-30',
      };
      dmsSignaturesList.unshift(newSig);
      // Add audit record
      dmsAuditList.unshift({ id: `aud-${dmsAuditList.length + 1}`, documentId: data.documentId, documentName: data.documentName, action: 'Signature Sent', performedBy: 'Property Manager Staff', timestamp: new Date().toISOString().split('T')[0] });
      return newSig;
    },
    cancel: async (id: string) => {
      await delay(150);
      const idx = dmsSignaturesList.findIndex(s => s.id === id);
      if (idx !== -1) dmsSignaturesList[idx].status = 'Cancelled';
      return true;
    },
  },

  fileVersions: {
    getAll: async () => { await delay(100); return [...dmsVersionsList].slice(0, 50); },
    getByDocument: async (docId: string) => { await delay(100); return dmsVersionsList.filter(v => v.documentId === docId).slice(0, 20); },
  },

  documentAudit: {
    getAll: async () => { await delay(100); return [...dmsAuditList].slice(0, 100); },
  },

  tags: {
    getAll: async () => {
      await delay(50);
      return [
        { id: 'tag-1', label: 'Urgent', color: '#ef4444' },
        { id: 'tag-2', label: 'Reviewed', color: '#10b981' },
        { id: 'tag-3', label: 'Pending', color: '#f59e0b' },
        { id: 'tag-4', label: 'Legal', color: '#6366f1' },
        { id: 'tag-5', label: 'Confidential', color: '#64748b' },
      ];
    },
  },

  permissions: {
    getAll: async () => { await delay(100); return [...dmsPermissionsList]; },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = dmsPermissionsList.findIndex(p => p.id === id);
      if (idx !== -1) dmsPermissionsList[idx] = { ...dmsPermissionsList[idx], ...data };
      return dmsPermissionsList[idx];
    },
    getGroups: async () => {
      await delay(100);
      return [
        {
          group: 'Properties',
          items: [
            { key: 'prop_view', name: 'View Properties' },
            { key: 'prop_create', name: 'Create Properties' },
            { key: 'prop_edit', name: 'Edit Properties' },
            { key: 'prop_delete', name: 'Delete Properties' },
          ],
        },
        {
          group: 'Accounting',
          items: [
            { key: 'acc_view', name: 'View Financials' },
            { key: 'acc_pay', name: 'Manage Payments' },
          ],
        },
      ];
    },
  },

  documentRequests: {
    getAll: async () => { await delay(100); return [...dmsRequestsList].slice(0, 50); },
    create: async (data: any) => {
      await delay(200);
      const newReq = {
        ...data,
        id: `dreq-${dmsRequestsList.length + 1}`,
        status: 'Sent',
        createdAt: new Date().toISOString().split('T')[0],
      };
      dmsRequestsList.unshift(newReq);
      return newReq;
    },
  },

  shares: {
    getAll: async () => { await delay(100); return [...dmsSharesList].slice(0, 50); },
    create: async (data: any) => {
      await delay(200);
      const newShare = {
        ...data,
        id: `shr-${dmsSharesList.length + 1}`,
        status: 'Active',
        sharedBy: 'Property Manager Staff',
      };
      dmsSharesList.unshift(newShare);
      dmsAuditList.unshift({ id: `aud-${dmsAuditList.length + 1}`, documentId: data.documentId, documentName: data.documentName, action: 'Share', performedBy: 'Property Manager Staff', timestamp: new Date().toISOString().split('T')[0] });
      return newShare;
    },
    revoke: async (id: string) => {
      await delay(150);
      const idx = dmsSharesList.findIndex(s => s.id === id);
      if (idx !== -1) dmsSharesList[idx].status = 'Revoked';
      return true;
    },
  },

  analytics: {
    getExecutiveKpis: async () => {
      await delay(100);
      return [
        { id: 'kpi-1', label: 'Total Properties', value: 50, formatted: '50', change: 2.1, trend: 'up' },
        { id: 'kpi-2', label: 'Total Units', value: 1000, formatted: '1,000', change: 4.5, trend: 'up' },
        { id: 'kpi-3', label: 'Occupancy Rate', value: 87.5, formatted: '87.5%', change: 1.2, trend: 'up' },
        { id: 'kpi-4', label: 'Vacancy Rate', value: 12.5, formatted: '12.5%', change: -1.2, trend: 'down' },
        { id: 'kpi-5', label: 'Monthly Revenue', value: 1250000, formatted: '$1,250,000', change: 8.4, trend: 'up' },
        { id: 'kpi-6', label: 'Monthly Expenses', value: 450000, formatted: '$450,000', change: 1.5, trend: 'up' },
        { id: 'kpi-7', label: 'Net Operating Income', value: 800000, formatted: '$800,000', change: 12.1, trend: 'up' },
        { id: 'kpi-8', label: 'Outstanding Rent', value: 45000, formatted: '$45,000', change: -15.4, trend: 'down' },
        { id: 'kpi-9', label: 'Active Leases', value: 875, formatted: '875', change: 3.2, trend: 'up' },
        { id: 'kpi-10', label: 'Open Maintenance Requests', value: 42, formatted: '42', change: -8.5, trend: 'down' },
        { id: 'kpi-11', label: 'Portfolio Value', value: 150000000, formatted: '$150M', change: 5.0, trend: 'up' },
        { id: 'kpi-12', label: 'ROI', value: 6.4, formatted: '6.4%', change: 0.8, trend: 'up' },
      ];
    },
    getPropertyPerformance: async () => {
      await delay(100);
      return [...rptPropertyAnalytics];
    },
    getTenantOverview: async () => {
      await delay(100);
      return [...rptTenantAnalytics];
    },
    getLeasingFunnel: async () => {
      await delay(100);
      return [
        { stage: 'New Lead', count: 1200, conversion: 100 },
        { stage: 'Contacted', count: 950, conversion: 79.1 },
        { stage: 'Tour', count: 600, conversion: 50.0 },
        { stage: 'Application', count: 320, conversion: 26.6 },
        { stage: 'Approved', count: 180, conversion: 15.0 },
        { stage: 'Lease Signed', count: 140, conversion: 11.6 },
      ];
    },
    getVendorPerformance: async () => {
      await delay(100);
      return [...rptVendorPerformance];
    },
  },

  reports: {
    getPnL: async () => {
      await delay(150);
      return {
        revenue: [
          { category: 'Rent Income', amount: 1120000 },
          { category: 'Parking Fees', amount: 85000 },
          { category: 'Utility Reimbursements', amount: 35000 },
          { category: 'Late Fees', amount: 10000 },
        ],
        expenses: [
          { category: 'Repairs & Maintenance', amount: 180000 },
          { category: 'Payroll & Staffing', amount: 140000 },
          { category: 'Utilities', amount: 75000 },
          { category: 'Insurance', amount: 35000 },
          { category: 'Marketing', amount: 20000 },
        ],
        grossProfit: 1250000,
        netProfit: 800000,
      };
    },
    getCashFlow: async () => {
      await delay(150);
      return {
        incoming: [
          { category: 'Payments Cleared', amount: 1210000 },
          { category: 'Owner Funding', amount: 50000 },
        ],
        outgoing: [
          { category: 'Vendor Payments', amount: 410000 },
          { category: 'Owner Distributions', amount: 320000 },
          { category: 'Tax Withholding', amount: 60000 },
        ],
        balance: 470000,
      };
    },
    getBudgetAnalysis: async () => {
      await delay(150);
      return [
        { category: 'Maintenance', budget: 15000, actual: 14200, variance: 800 },
        { category: 'Marketing', budget: 5000, actual: 5200, variance: -200 },
        { category: 'Utilities', budget: 8000, actual: 7800, variance: 200 },
        { category: 'Insurance', budget: 4000, actual: 4000, variance: 0 },
      ];
    },
  },

  dashboards: {
    getAll: async () => { await delay(100); return [...rptCustomDashboards]; },
    getById: async (id: string) => { await delay(50); return rptCustomDashboards.find(d => d.id === id); },
    create: async (data: any) => {
      await delay(200);
      const newDash = {
        ...data,
        id: `dash-${rptCustomDashboards.length + 1}`,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Property Manager Staff',
        widgets: data.widgets || [],
      };
      rptCustomDashboards.push(newDash);
      return newDash;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = rptCustomDashboards.findIndex(d => d.id === id);
      if (idx !== -1) {
        rptCustomDashboards[idx] = { ...rptCustomDashboards[idx], ...data };
        return rptCustomDashboards[idx];
      }
      throw new Error('Dashboard not found');
    },
    delete: async (id: string) => {
      await delay(150);
      rptCustomDashboards = rptCustomDashboards.filter(d => d.id !== id);
      return true;
    },
    duplicate: async (id: string) => {
      await delay(200);
      const original = rptCustomDashboards.find(d => d.id === id);
      if (!original) throw new Error('Dashboard not found');
      const copy = {
        ...original,
        id: `dash-${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      rptCustomDashboards.push(copy);
      return copy;
    },
    share: async (id: string, isShared: boolean) => {
      await delay(150);
      const idx = rptCustomDashboards.findIndex(d => d.id === id);
      if (idx !== -1) {
        rptCustomDashboards[idx].isShared = isShared;
        return rptCustomDashboards[idx];
      }
      throw new Error('Dashboard not found');
    },
  },

  metrics: {
    getTenantRetention: async () => {
      await delay(100);
      return {
        renewals: 154,
        moveOuts: 78,
        avgStayMonths: 18.5,
      };
    },
    getLeasingMetrics: async () => {
      await delay(100);
      return {
        conversionRate: 11.6,
        avgDaysToLease: 22,
        agentPerformance: [
          { name: 'Alice Cooper', signed: 45, leads: 320 },
          { name: 'Bob Marley', signed: 38, leads: 290 },
          { name: 'Charlie Chaplin', signed: 57, leads: 410 },
        ],
        sourcePerformance: [
          { name: 'Zillow', leads: 450, conversions: 50 },
          { name: 'Apartments.com', leads: 380, conversions: 42 },
          { name: 'Website', leads: 220, conversions: 35 },
          { name: 'Referrals', leads: 80, conversions: 18 },
        ],
      };
    },
  },

  charts: {
    getRevenuePerformance: async () => {
      await delay(100);
      return {
        monthlyGrowth: [
          { period: 'Jan 2026', value: 1150000 },
          { period: 'Feb 2026', value: 1170000 },
          { period: 'Mar 2026', value: 1200000 },
          { period: 'Apr 2026', value: 1220000 },
          { period: 'May 2026', value: 1235000 },
          { period: 'Jun 2026', value: 1250000 },
        ],
        byProperty: [
          { period: 'Oakridge Heights', value: 250000 },
          { period: 'Downtown Plaza', value: 340000 },
          { period: 'Sunset Villas', value: 180000 },
          { period: 'Summit Townhomes', value: 220000 },
          { period: 'Other', value: 260000 },
        ],
        forecast: [
          { period: 'Jul 2026', value: 1270000 },
          { period: 'Aug 2026', value: 1290000 },
          { period: 'Sep 2026', value: 1315000 },
        ],
      };
    },
    getOccupancyAnalytics: async () => {
      await delay(100);
      return {
        occupancyTrend: [
          { period: 'Jan 2026', value: 85 },
          { period: 'Feb 2026', value: 85.5 },
          { period: 'Mar 2026', value: 86 },
          { period: 'Apr 2026', value: 86.8 },
          { period: 'May 2026', value: 87.2 },
          { period: 'Jun 2026', value: 87.5 },
        ],
        vacancyTrend: [
          { period: 'Jan 2026', value: 15 },
          { period: 'Feb 2026', value: 14.5 },
          { period: 'Mar 2026', value: 14 },
          { period: 'Apr 2026', value: 13.2 },
          { period: 'May 2026', value: 12.8 },
          { period: 'Jun 2026', value: 12.5 },
        ],
        propertyRanking: [
          { name: 'Downtown Plaza', rate: 98 },
          { name: 'Oakridge Heights', rate: 95 },
          { name: 'Summit Townhomes', rate: 92 },
          { name: 'Sunset Villas', rate: 84 },
          { name: 'Northside Industrial', rate: 70 },
        ],
      };
    },
    getFinancialPerformance: async () => {
      await delay(100);
      return {
        incomeVsExpenses: [
          { period: 'Jan', value: 1150000, secondary: 410000 },
          { period: 'Feb', value: 1170000, secondary: 420000 },
          { period: 'Mar', value: 1200000, secondary: 430000 },
          { period: 'Apr', value: 1220000, secondary: 440000 },
          { period: 'May', value: 1235000, secondary: 445000 },
          { period: 'Jun', value: 1250000, secondary: 450000 },
        ],
        profitTrend: [
          { period: 'Jan', value: 740000 },
          { period: 'Feb', value: 750000 },
          { period: 'Mar', value: 770000 },
          { period: 'Apr', value: 780000 },
          { period: 'May', value: 790000 },
          { period: 'Jun', value: 800000 },
        ],
        cashFlow: [
          { period: 'Jan', value: 420000 },
          { period: 'Feb', value: 430000 },
          { period: 'Mar', value: 450000 },
          { period: 'Apr', value: 455000 },
          { period: 'May', value: 462000 },
          { period: 'Jun', value: 470000 },
        ],
      };
    },
    getMaintenancePerformance: async () => {
      await delay(100);
      return {
        openRequests: [
          { period: 'Week 1', value: 48 },
          { period: 'Week 2', value: 45 },
          { period: 'Week 3', value: 43 },
          { period: 'Week 4', value: 42 },
        ],
        completionTime: [
          { period: 'Plumbing', value: 24 },
          { period: 'Electrical', value: 18 },
          { period: 'HVAC', value: 36 },
          { period: 'Appliance', value: 12 },
        ],
        maintenanceCost: [
          { period: 'Jan', value: 15000 },
          { period: 'Feb', value: 18000 },
          { period: 'Mar', value: 14000 },
          { period: 'Apr', value: 22000 },
          { period: 'May', value: 17500 },
          { period: 'Jun', value: 19000 },
        ],
      };
    },
    getLeasingPerformance: async () => {
      await delay(100);
      return {
        applications: [
          { period: 'Jan', value: 90 },
          { period: 'Feb', value: 110 },
          { period: 'Mar', value: 105 },
          { period: 'Apr', value: 120 },
          { period: 'May', value: 130 },
          { period: 'Jun', value: 140 },
        ],
        conversionRate: [
          { period: 'Jan', value: 9.5 },
          { period: 'Feb', value: 10.2 },
          { period: 'Mar', value: 10.8 },
          { period: 'Apr', value: 11.0 },
          { period: 'May', value: 11.4 },
          { period: 'Jun', value: 11.6 },
        ],
        renewals: [
          { period: 'Jan', value: 25 },
          { period: 'Feb', value: 28 },
          { period: 'Mar', value: 30 },
          { period: 'Apr', value: 35 },
          { period: 'May', value: 42 },
          { period: 'Jun', value: 48 },
        ],
        expiringLeases: [
          { period: 'Jul', value: 65 },
          { period: 'Aug', value: 80 },
          { period: 'Sep', value: 95 },
          { period: 'Oct', value: 50 },
          { period: 'Nov', value: 40 },
          { period: 'Dec', value: 35 },
        ],
      };
    },
    getExpenseAnalysis: async () => {
      await delay(100);
      return {
        categories: [
          { name: 'Repairs & Maintenance', value: 180000 },
          { name: 'Payroll & Staffing', value: 140000 },
          { name: 'Utilities', value: 75000 },
          { name: 'Insurance', value: 35000 },
          { name: 'Marketing', value: 20000 },
        ],
        vendorSpending: [
          { name: 'Apex Contractor Group', value: 120000 },
          { name: 'Standard Utility Corp', value: 75000 },
          { name: 'Pro-Clean Services', value: 45000 },
          { name: 'Safe-Shield Insurance', value: 35000 },
          { name: 'Other', value: 175000 },
        ],
        monthlyTrend: [
          { period: 'Jan', value: 410000 },
          { period: 'Feb', value: 420000 },
          { period: 'Mar', value: 430000 },
          { period: 'Apr', value: 440000 },
          { period: 'May', value: 445000 },
          { period: 'Jun', value: 450000 },
        ],
      };
    },
  },

  exports: {
    getAll: async () => { await delay(100); return [...rptExports]; },
    create: async (data: any) => {
      await delay(300);
      const newExp = {
        id: `exp-${rptExports.length + 1}`,
        name: data.name || 'custom_export_file',
        type: data.type || 'CSV',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Property Manager Staff',
        status: 'Completed' as const,
        size: '12 KB',
      };
      rptExports.unshift(newExp);
      return newExp;
    },
    delete: async (id: string) => {
      await delay(100);
      rptExports = rptExports.filter(e => e.id !== id);
      return true;
    },
  },

  savedReports: {
    getAll: async () => { await delay(100); return [...rptSavedReports]; },
    create: async (data: any) => {
      await delay(200);
      const newSaved = {
        ...data,
        id: `rpt-saved-${rptSavedReports.length + 1}`,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Property Manager Staff',
        lastRun: new Date().toISOString().split('T')[0],
        rowCount: 0,
      };
      rptSavedReports.push(newSaved);
      return newSaved;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = rptSavedReports.findIndex(r => r.id === id);
      if (idx !== -1) {
        rptSavedReports[idx] = { ...rptSavedReports[idx], ...data, lastRun: new Date().toISOString().split('T')[0] };
        return rptSavedReports[idx];
      }
      throw new Error('Report not found');
    },
    delete: async (id: string) => {
      await delay(100);
      rptSavedReports = rptSavedReports.filter(r => r.id !== id);
      return true;
    },
    duplicate: async (id: string) => {
      await delay(200);
      const original = rptSavedReports.find(r => r.id === id);
      if (!original) throw new Error('Report not found');
      const copy = {
        ...original,
        id: `rpt-saved-${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      rptSavedReports.push(copy);
      return copy;
    },
  },

  forecasts: {
    getForecast: async (type: string) => {
      await delay(150);
      return [...rptForecasts];
    },
  },

  ai: {
    getDashboardStats: async () => {
      await delay(100);
      return {
        queriesToday: 145,
        automatedTasks: 1250,
        generatedReports: 340,
        aiRecommendations: 88,
        savedInsights: 45,
        successRate: 99.4,
      };
    },
    getActivityTrends: async () => {
      await delay(100);
      return {
        usageTrend: [
          { period: 'Jan', value: 800 },
          { period: 'Feb', value: 950 },
          { period: 'Mar', value: 1200 },
          { period: 'Apr', value: 1500 },
          { period: 'May', value: 1800 },
          { period: 'Jun', value: 2100 },
        ],
        moduleShare: [
          { name: 'Leasing', value: 35 },
          { name: 'Maintenance', value: 25 },
          { name: 'Accounting', value: 20 },
          { name: 'Analytics', value: 20 },
        ],
        timeSaved: [
          { period: 'Week 1', value: 12 },
          { period: 'Week 2', value: 15 },
          { period: 'Week 3', value: 18 },
          { period: 'Week 4', value: 22 },
        ],
      };
    },
  },

  aiAssistant: {
    getConversations: async () => {
      await delay(100);
      return [
        { id: 'c-1', name: 'Overdue Rent Analysis', module: 'General', createdAt: '2026-07-18', status: 'Active' },
        { id: 'c-2', name: 'Lease Expiration Review', module: 'General', createdAt: '2026-07-19', status: 'Active' },
      ];
    },
    getConversation: async (id: string) => {
      await delay(100);
      return {
        id,
        name: id === 'c-1' ? 'Overdue Rent Analysis' : 'Lease Expiration Review',
        messages: [
          { id: 'm-1', sender: 'AI' as const, text: 'Hello! I am your AI assistant. How can I help you manage your properties today?', timestamp: new Date().toISOString() }
        ]
      };
    },
    sendMessage: async (chatId: string, message: string) => {
      await delay(800);
      const clean = message.toLowerCase();
      const isSpanish = (typeof window !== 'undefined' && localStorage.getItem('app_language') === 'es');
      
      let summary = isSpanish
        ? "Procesé su solicitud. Puedo ayudarle con el rendimiento del portafolio, listados de unidades o métricas generales de arrendamiento."
        : "I parsed your request. I can assist with portfolio yields, unit listings, or general leasing metrics.";
      let insights = isSpanish
        ? "No hay información adicional disponible para esta consulta."
        : "No additional insights available for this query.";
      let suggestedActions: string[] = [];
      let relatedRecords: string[] = [];

      if (clean.includes('overdue') || clean.includes('delinquent') || clean.includes('vencid') || clean.includes('mora')) {
        summary = isSpanish
          ? "Actualmente hay 2 inquilinos con saldos de alquiler pendientes vencidos."
          : "There are currently 2 tenants with outstanding rental balances overdue.";
        insights = isSpanish
          ? "Michael Jordan tiene 5 días de retraso ($1,850) en Apto 102. Brittany Spears tiene 12 días de retraso ($950) en Apto 204."
          : "Michael Jordan is 5 days overdue ($1,850) for Apt 102. Brittany Spears is 12 days overdue ($950) for Apt 204.";
        suggestedActions = isSpanish ? ["Enviar Recordatorio", "Ver Factura"] : ["Send Reminder", "View Invoice"];
        relatedRecords = ["Michael Jordan", "Brittany Spears", "Sunset Villas Complex"];
      } else if (clean.includes('expire') || clean.includes('lease') || clean.includes('contrato') || clean.includes('venc')) {
        summary = isSpanish
          ? "Hay 1 contrato de arrendamiento que vence a finales de este mes."
          : "There is 1 lease expiring by the end of this month.";
        insights = isSpanish
          ? "El contrato de Robert Johnson para el Apto 101 vence el 2026-07-31."
          : "Robert Johnson's lease for Apt 101 expires on 2026-07-31.";
        suggestedActions = isSpanish ? ["Abrir Contrato", "Enviar Recordatorio"] : ["Open Lease", "Send Reminder"];
        relatedRecords = ["Robert Johnson", "Apt 101"];
      } else if (clean.includes('vacant') || clean.includes('vacancy') || clean.includes('vacant') || clean.includes('desocupad')) {
        summary = isSpanish
          ? "Actualmente hay 5 unidades vacantes en su portafolio."
          : "There are currently 5 vacant units in your portfolio.";
        insights = isSpanish
          ? "Sunset Villas Complex tiene 2 unidades vacantes (Apto 105, Apto 108). Summit Group Loft tiene 3 lofts vacantes."
          : "Sunset Villas Complex has 2 vacant units (Apt 105, Apt 108). Summit Group Commercial Loft has 3 vacant lofts.";
        suggestedActions = isSpanish ? ["Abrir Propiedad"] : ["Open Property"];
        relatedRecords = ["Sunset Villas Complex", "Summit Group Commercial Loft"];
      } else if (clean.includes('maintenance') || clean.includes('request') || clean.includes('mantenimiento') || clean.includes('solicitud')) {
        summary = isSpanish
          ? "Tiene 3 solicitudes de mantenimiento activas."
          : "You have 3 active maintenance requests.";
        insights = isSpanish
          ? "1 problema crítico de HVAC (ruido de aire acondicionado) en Oakridge Heights, y 2 solicitudes de prioridad media (fugas)."
          : "1 critical HVAC issue (AC noise) at Oakridge Heights, and 2 medium priority requests (faucet leaks).";
        suggestedActions = isSpanish ? ["Abrir Mantenimiento"] : ["Open Maintenance"];
        relatedRecords = ["Oakridge Heights"];
      } else if (clean.includes('roll') || clean.includes('rent roll') || clean.includes('alquileres')) {
        summary = isSpanish
          ? "Resumen del libro de alquileres para el período de facturación activo."
          : "Rent roll summary for the active billing period.";
        insights = isSpanish
          ? "Alquiler total esperado: $4,550. Total cobrado: $2,700. Saldo moroso: $2,800."
          : "Total expected rent: $4,550. Total collected: $2,700. Delinquent balance: $2,800.";
        suggestedActions = isSpanish ? ["Abrir Reporte"] : ["Open Report"];
        relatedRecords = ["Rent Roll Report"];
      } else if (clean.includes('invoice') || clean.includes('unpaid') || clean.includes('factura') || clean.includes('no pagad')) {
        summary = isSpanish
          ? "Hay 3 facturas pendientes de pago activas en el sistema."
          : "There are 3 unpaid invoices active in the system.";
        insights = isSpanish
          ? "La factura INV-1018 para Summit Group ($499) está actualmente no pagada."
          : "Invoice INV-1018 for Summit Group ($499) is currently Unpaid.";
        suggestedActions = isSpanish ? ["Ver Factura"] : ["View Invoice"];
        relatedRecords = ["Summit Group", "INV-1018"];
      } else if (clean.includes('owner statement') || clean.includes('statement') || clean.includes('estado de cuenta')) {
        summary = isSpanish
          ? "Resumen del estado de cuenta del propietario para Sunset Villas Complex."
          : "Owner statement summary for Sunset Villas Complex.";
        insights = isSpanish
          ? "Ingresos brutos: $14,500. Gastos operativos: $3,200. Efectivo neto: $11,300."
          : "Gross Income: $14,500. Operating Expenses: $3,200. Net Cash: $11,300.";
        suggestedActions = isSpanish ? ["Abrir Reporte"] : ["Open Report"];
        relatedRecords = ["Sunset Villas Complex"];
      } else if (clean.includes('report') || clean.includes('financial') || clean.includes('financier') || clean.includes('reporte')) {
        summary = isSpanish
          ? "Resumen de su libro de pérdidas y ganancias del mes actual."
          : "Overview of your current month profit and loss ledger.";
        insights = isSpanish
          ? "El flujo de efectivo neto es positivo en $11,300. Los gastos de mantenimiento representaron la mayor parte."
          : "Net cash flow is positive at $11,300. Maintenance expenses accounted for the largest expense slice (HVAC repairs).";
        suggestedActions = isSpanish ? ["Abrir Reporte"] : ["Open Report"];
        relatedRecords = ["Owner Financial Statements"];
      } else if (clean.includes('reminder') || clean.includes('late payment') || clean.includes('recordatorio') || clean.includes('pago tard')) {
        summary = isSpanish
          ? "Borrador de recordatorio de pago atrasado generado con éxito."
          : "Late payment reminder draft generated successfully.";
        insights = isSpanish
          ? "'Estimado residente, este es un amable recordatorio de que su pago de alquiler está vencido. Inicie sesión para pagar.'"
          : "'Dear resident, this is a friendly reminder that your rent payment is overdue. Please log in to your portal to complete payment.'";
        suggestedActions = isSpanish ? ["Enviar Recordatorio"] : ["Send Reminder"];
        relatedRecords = ["Michael Jordan", "Brittany Spears"];
      }

      // Build structured text response
      const summaryHeader = isSpanish ? "**Resumen**" : "**Summary**";
      const insightsHeader = isSpanish ? "**Perspectivas**" : "**Insights**";
      const responseText = `${summaryHeader}\n${summary}\n\n${insightsHeader}\n${insights}`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'AI' as const,
        text: responseText,
        suggestedActions,
        relatedRecords,
        timestamp: new Date().toISOString(),
      };
    },
    createConversation: async () => {
      await delay(100);
      return { id: `c-${Date.now()}`, name: 'New Discussion', module: 'General', createdAt: new Date().toISOString().split('T')[0], status: 'Active' };
    },
    renameConversation: async (id: string, name: string) => {
      await delay(100);
      return { id, name, module: 'General', createdAt: '2026-07-19', status: 'Active' };
    },
    deleteConversation: async (id: string) => {
      await delay(100);
      return true;
    },
  },

  aiSettings: {
    getSettings: async () => {
      await delay(100);
      return {
        enableAssistant: true,
        allowHistory: true,
        retention: '90 Days'
      };
    },
    updateSettings: async (data: any) => {
      await delay(200);
      return data;
    }
  },

  aiAgents: {
    qualifyLead: async (leadDetails: any) => {
      await delay(300);
      const incomeVal = Number(leadDetails.income || 45000);
      const isQualified = incomeVal >= 50000;
      return {
        leadScore: isQualified ? 88 : 42,
        priority: isQualified ? ('High' as const) : ('Low' as const),
        recommendation: isQualified
          ? "Lead exceeds the 3x monthly rent criteria. Recommending priority tour scheduling."
          : "Lead income is insufficient. Recommending co-signer options.",
      };
    },
    scheduleTour: async (tourDetails: any) => {
      await delay(200);
      return {
        status: 'Scheduled',
        suggestedTime: '2026-07-21T10:00:00Z',
        slots: ['10:00 AM', '1:30 PM', '4:00 PM'],
      };
    },
    generateFollowUp: async (leadId: string) => {
      await delay(200);
      return {
        emailDraft: "Subject: Following up on your home interest!\n\nHello, thank you for checking out our apartment community. We have units ready for tours this week.",
        smsDraft: "Hi there! Let's schedule a walkthrough for Oakridge Heights this Tuesday. Are you free at 10 AM?",
      };
    },
    analyzeMaintenance: async (description: string) => {
      await delay(400);
      const clean = description.toLowerCase();
      const isAc = clean.includes('ac') || clean.includes('cool') || clean.includes('noise');
      return {
        category: isAc ? 'HVAC' : 'General Plumbing',
        priority: isAc ? 'Urgent' : 'Medium',
        cause: isAc ? 'Compressor motor failing or refrigerant leak.' : 'Cartridge gasket worn out.',
        fix: isAc ? 'Refrigerant pressure checks and motor testing.' : 'Replace faucet cartridge.',
        vendorType: isAc ? 'HVAC Contractor' : 'Plumber',
        costRange: isAc ? '$150 - $450' : '$80 - $120',
      };
    },
    explainExpense: async (question: string) => {
      await delay(300);
      return {
        explanation: "Expenses grew by 14% this month due to seasonal utility bill spikes and emergency AC compressor repairs ($4,500 total) at Oakridge Heights.",
        vendorImpact: "HVAC partner bills accounted for 60% of the maintenance variance.",
        propertyImpact: "Oakridge Heights operations expenses were $3,400 over budget.",
      };
    },
    explainFinancials: async (question: string) => {
      await delay(300);
      return {
        explanation: "Three properties are currently operating with a negative net cash flow: Sunset Villas, Sycamore Gardens, and Lakeside Estates. High vacancy rates are the primary driver.",
      };
    },
    analyzePortfolio: async (question: string) => {
      await delay(300);
      return {
        bestProperty: 'Downtown Plaza (9.8% ROI)',
        attentionRequired: 'Pinecrest Cabins (Low yield, high turnover)',
        rentIncreaseOpportunity: 'Oakridge Heights - current average rent is 8% below market standards.',
      };
    },
    analyzeDocument: async (docId: string) => {
      await delay(400);
      return {
        summary: "Standard Residential Lease Agreement for 12 months.",
        dates: [
          { event: 'Lease Start', date: '2026-08-01' },
          { event: 'Lease End', date: '2027-07-31' },
        ],
        missingInfo: ['Pet Deposit Addendum signature is missing.'],
        riskFactors: ['Subletting clause allows subleasing with manager consent without strict pre-approvals.'],
        clauses: [
          { name: 'Late Fee Provision', text: '5% penalty applies if payment is outstanding beyond the 5th.' },
        ],
      };
    },
  },

  aiAutomation: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'auto-1', name: 'Late Rent SMS Alerts', trigger: 'Payment Failed', condition: 'Outstanding > $500', action: 'Send SMS', status: 'Active' },
        { id: 'auto-2', name: 'AC Repair Dispatcher', trigger: 'Maintenance Created', condition: 'Category = HVAC', action: 'Notify User', status: 'Active' },
      ];
    },
    create: async (data: any) => {
      await delay(200);
      return { ...data, id: `auto-${Date.now()}`, status: 'Active' };
    },
    update: async (id: string, data: any) => {
      await delay(200);
      return { id, ...data };
    },
    delete: async (id: string) => {
      await delay(100);
      return true;
    },
    toggle: async (id: string) => {
      await delay(100);
      return true;
    },
  },

  aiInsights: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'ins-1', title: 'Rent Increase Opportunity', description: 'Leases at Oakridge Heights are 8% below market benchmarks. Recommend raising rent by $100 upon renewal.', impact: '+$8,500/year', priority: 'High', category: 'Financial' },
        { id: 'ins-2', title: 'High Turnover Risk', description: 'Units at Lakeside Estates have average stay durations under 10 months. Investigate resident satisfaction metrics.', impact: 'Lowers vacancies', priority: 'Medium', category: 'Operations' },
      ];
    },
    dismiss: async (id: string) => {
      await delay(100);
      return true;
    },
    accept: async (id: string) => {
      await delay(100);
      return true;
    },
  },

  aiRecommendations: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'rec-1', title: 'Late Fee Enforcement', description: 'Enable auto late fee billing rules to increase on-time rent payment rate.' },
      ];
    },
  },

  aiKnowledge: {
    getAllArticles: async () => {
      await delay(100);
      return [
        { id: 'know-1', title: 'Texas Tenant Eviction Procedures', category: 'Policy', summary: 'Legal workflows regarding unpaid rent reminders, notice delivery, and court schedules in Texas.' },
        { id: 'know-2', title: 'HVAC Filter Replacements Schedule', category: 'Maintenance', summary: 'Guidelines detailing filter dimensions and cycle requirements per building type.' },
      ];
    },
    search: async (query: string) => {
      await delay(150);
      return [
        { id: 'know-1', title: 'Texas Tenant Eviction Procedures', category: 'Policy', summary: 'Legal workflows regarding unpaid rent reminders, notice delivery, and court schedules in Texas.' },
      ];
    },
    uploadArticle: async (data: any) => {
      await delay(300);
      return { id: `know-${Date.now()}`, ...data };
    },
  },

  users: {
    getAll: async () => {
      await delay(100);
      return [...usersList];
    },
    invite: async (data: any) => {
      await delay(200);
      const newU = { id: `usr-${usersList.length + 1}`, ...data, status: 'Active', lastLogin: '-' };
      usersList.unshift(newU);
      return newU;
    },
    update: async (id: string, data: any) => {
      await delay(100);
      const idx = usersList.findIndex(u => u.id === id);
      if (idx !== -1) usersList[idx] = { ...usersList[idx], ...data };
      return usersList[idx];
    },
    delete: async (id: string) => {
      await delay(100);
      usersList = usersList.filter(u => u.id !== id);
      return true;
    },
  },

  roles: {
    getAll: async () => {
      await delay(100);
      return [...rbacRolesList];
    },
    create: async (data: any) => {
      await delay(200);
      const newRole = { id: `role-${Date.now()}`, isCustom: true, ...data };
      rbacRolesList.push(newRole);
      return newRole;
    },
    update: async (id: string, data: any) => {
      await delay(200);
      const idx = rbacRolesList.findIndex(r => r.id === id);
      if (idx !== -1) {
        rbacRolesList[idx] = { ...rbacRolesList[idx], ...data };
      }
      return rbacRolesList[idx];
    },
    delete: async (id: string) => {
      await delay(200);
      rbacRolesList = rbacRolesList.filter(r => r.id !== id);
      return true;
    },
    clone: async (id: string, newName: string) => {
      await delay(200);
      const roleToClone = rbacRolesList.find(r => r.id === id);
      if (!roleToClone) throw new Error('Role not found');
      const cloned = {
        ...roleToClone,
        id: `role-${Date.now()}`,
        name: newName,
        isCustom: true,
      };
      rbacRolesList.push(cloned);
      return cloned;
    }
  },

  assignments: {
    getForUser: async (userId: string) => {
      await delay(100);
      return {
        properties: propertyAssignments.filter(a => a.userId === userId).map(a => a.propertyId),
        units: unitAssignments.filter(a => a.userId === userId).map(a => a.unitId),
        buildings: maintenanceAssignments.filter(a => a.userId === userId).map(a => a.buildingId),
        departments: usersList.find(u => u.id === userId)?.departments || [],
      };
    },
    update: async (userId: string, data: { properties?: string[]; units?: string[]; buildings?: string[]; departments?: string[] }) => {
      await delay(200);
      if (data.properties) {
        propertyAssignments = propertyAssignments.filter(a => a.userId !== userId);
        data.properties.forEach(pid => propertyAssignments.push({ userId, propertyId: pid }));
      }
      if (data.units) {
        unitAssignments = unitAssignments.filter(a => a.userId !== userId);
        data.units.forEach(uid => unitAssignments.push({ userId, unitId: uid }));
      }
      if (data.buildings) {
        maintenanceAssignments = maintenanceAssignments.filter(a => a.userId !== userId);
        data.buildings.forEach(bid => maintenanceAssignments.push({ userId, buildingId: bid }));
      }
      if (data.departments) {
        const idx = usersList.findIndex(u => u.id === userId);
        if (idx !== -1) {
          usersList[idx] = { ...usersList[idx], departments: data.departments };
        }
      }
      return true;
    }
  },

  companies: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'comp-1', name: 'Apex Properties Inc.', industry: 'Real Estate SaaS', properties: 12, users: 4, status: 'Active', createdAt: '2026-01-15' },
        { id: 'comp-2', name: 'Lakeside Development Corp', industry: 'Commercial', properties: 5, users: 2, status: 'Active', createdAt: '2026-03-22' },
      ];
    },
  },

  teams: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'team-1', name: 'Property Management', description: 'Oversees daily rental operations.', members: 8, manager: 'John Doe', status: 'Active' },
        { id: 'team-2', name: 'Accounting Division', description: 'Handles ledgers, payouts, and reconciliation.', members: 3, manager: 'Jane Smith', status: 'Active' },
        { id: 'team-3', name: 'Leasing Squad', description: 'Manages applications, listings, and screenings.', members: 5, manager: 'Bob Johnson', status: 'Active' },
      ];
    },
    create: async (data: any) => {
      await delay(200);
      return { id: `team-${Date.now()}`, ...data, members: 1, status: 'Active' };
    },
  },

  integrations: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'int-1', name: 'Stripe Pay', category: 'Payments', description: 'Accept credit card and ACH payments directly from tenants.', status: 'Connected', logo: '💳' },
        { id: 'int-2', name: 'QuickBooks Sync', category: 'Accounting', description: 'Export accounting ledger entries dynamically to QuickBooks.', status: 'Disconnected', logo: '📊' },
        { id: 'int-3', name: 'AWS S3 Cloud', category: 'Storage', description: 'Store tenant leases and contracts inside AWS.', status: 'Connected', logo: '☁️' },
        { id: 'int-4', name: 'DOB Code Compliance', category: 'Government', description: 'Pushes municipal and state building/fire code violations automatically.', status: 'Connected', logo: '🏛️' }
      ];
    },
    toggle: async (id: string) => {
      await delay(150);
      return true;
    },
  },

  apiKeys: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'key-1', name: 'Zapier Production Key', createdBy: 'John Doe', createdAt: '2026-07-10', lastUsed: '2026-07-19 04:12', status: 'Active' },
        { id: 'key-2', name: 'Webhooks Test Key', createdBy: 'Jane Smith', createdAt: '2026-07-15', lastUsed: '-', status: 'Inactive' },
      ];
    },
    create: async (name: string) => {
      await delay(200);
      return { id: `key-${Date.now()}`, name, createdBy: 'Admin Operator', createdAt: new Date().toISOString().split('T')[0], lastUsed: '-', status: 'Active' };
    },
    revoke: async (id: string) => {
      await delay(100);
      return true;
    },
  },

  webhooks: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'wh-1', endpoint: 'https://api.zapier.com/hooks/129', event: 'Payment Received', secret: 'whsec_***9a1', status: 'Active' },
        { id: 'wh-2', endpoint: 'https://internal.crm.com/webhooks', event: 'Tenant Created', secret: 'whsec_***88b', status: 'Active' },
      ];
    },
    create: async (data: any) => {
      await delay(200);
      return { id: `wh-${Date.now()}`, ...data, secret: 'whsec_***' + Math.random().toString(36).substring(7), status: 'Active' };
    },
  },

  auditLogs: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'aud-1', timestamp: '2026-07-19 05:22:10', user: 'John Doe', action: 'Login Event', module: 'Security', object: 'User Session', ip: '192.168.1.45', status: 'Success' },
        { id: 'aud-2', timestamp: '2026-07-19 04:10:05', user: 'Jane Smith', action: 'Update Settings', module: 'Administration', object: 'Tax Settings', ip: '192.168.1.12', status: 'Success' },
        { id: 'aud-3', timestamp: '2026-07-18 19:40:15', user: 'Bob Johnson', action: 'Delete Property', module: 'Properties', object: 'Lakeside Cabins', ip: '10.0.0.98', status: 'Failed' },
      ];
    },
  },

  activity: {
    getAll: async () => {
      await delay(100);
      return [
        { id: 'act-1', timestamp: '2026-07-19 05:21', user: 'John Doe', description: 'Created Property "Sky Lofts"', module: 'Properties' },
        { id: 'act-2', timestamp: '2026-07-19 03:40', user: 'Jane Smith', description: 'Recorded Rent Payment from Tenant "Robert Johnson"', module: 'Payments' },
        { id: 'act-3', timestamp: '2026-07-18 12:15', user: 'Bob Johnson', description: 'Uploaded Document "Lease_Agreement_301.pdf"', module: 'Documents' },
      ];
    },
  },

  security: {
    getPolicies: async () => {
      await delay(100);
      return {
        mfaRequired: true,
        sessionTimeout: 30, // minutes
        passwordPolicy: 'Strong (min 10 chars, symbols)',
        ipWhitelist: '192.168.1.0/24',
      };
    },
  },

  billing: {
    getSubscription: async () => {
      await delay(100);
      return {
        planName: 'Enterprise SaaS Tier',
        price: 499,
        billingCycle: 'Monthly',
        nextInvoice: '2026-08-01',
        usageLimit: 'Unlimited Properties',
        paymentMethod: 'Visa ending in 4242',
      };
    },
  },
};
export default mockApi;
export const api = mockApi;
