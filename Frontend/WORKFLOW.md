# WhatsLandlord Property - Complete Workflow Guide

This document details the project structure, user roles and personas, data flow, and module-specific workflows for the **WhatsLandlord Property** management system.

---

## 🛠️ Tech Stack

This project is built using modern frontend technologies:
- **Core Library**: React (v19)
- **Language**: TypeScript
- **Bundler & Build Tool**: Vite (v8)
- **Routing**: `@tanstack/react-router`
- **State Management**: Zustand
- **Query & Data Fetching**: `@tanstack/react-query`
- **Styling**: Vanilla CSS, TailwindCSS & PostCSS
- **Icons**: Lucide React
- **Linter & Tools**: Oxlint

---

## 📁 Folder Structure

The primary directories and key files of the project are organized as follows:

- **[`src/routes/index.tsx`](file:///Users/Software/Kiaan/WhatsLandlord-property/src/routes/index.tsx)**: The single entrypoint for all route definitions and page layouts.
- **[`src/features/`](file:///Users/Software/Kiaan/WhatsLandlord-property/src/features)**: Modules organized by business domain features:
  - `auth/`: Login, Forgot Password, and Reset Password views (with a direct return link to `/landing`).
  - `landing/`: Marketing website showing product packages, features, and an interactive Checkout Modal.
  - `dashboard/`: Custom dashboards for managers and Super Admins.
  - `properties/` & `units/`: Management of real estate properties, buildings, and units.
  - `tenants/` & `leasing/`: Management of tenants, leases, renewals, move-in/out procedures, and rental applications.
  - `crm/`: Customer Relationship Management (Leads & Contacts management).
  - `rent/`: Rent collection, invoices, payments, deposits, payment plans, and refunds.
  - `accounting/`: Chart of accounts, expenses, bills, bank reconciliation, and taxes.
  - `maintenance/`: Maintenance requests, work orders, preventive maintenance, assets, and vendor details.
  - `documents/`: Document hub, version history, all documents, and electronic signatures.
  - `reports/`: Interactive charts, executive dashboards, forecasting, and custom report builders.
  - `communication/`: Shared inbox, email, SMS, announcements, and marketing campaigns.
  - `ai/`: Smart AI assistant and settings.
  - `owner/`: Self-service portal for property owners (Properties addition/deletion, Statements, Financials, Distributions, Document uploads).
  - `tenant/`: Dedicated self-service portal for tenants (Payments with zero-balance validation, Maintenance tickets, Lease information, Document uploads).
  - `admin/`: System-wide preferences, team roles, integrations, webhooks, and audit logs.
- **[`src/components/`](file:///Users/Software/Kiaan/WhatsLandlord-property/src/components)**: Reusable global components like `DataTable`, `KanbanBoard`, `Timeline`, `FileUploader`, and custom UI components.
- **[`src/store/useStore.ts`](file:///Users/Software/Kiaan/WhatsLandlord-property/src/store/useStore.ts)**: Global state management powered by Zustand (Theme, Authentication, and Notifications).

---

## 👥 User Roles & Personas

Authentication is handled dynamically in `useAuthStore` based on the user's login email format:

1. **Super Admin** (Email must contain `admin`):
   - Has full, unrestricted system access.
   - Manages global settings, integrations, audit/activity logs, and system billing.
2. **Property Manager / Staff** (Standard email format):
   - Manages day-to-day operations: rentals, collections, leases, and maintenance.
3. **Property Owner** (Email must contain `owner`):
   - Accesses a dedicated portal to view property performance, distribution payments, and financial statements.
   - Can **Add Properties** and **Delete Properties** from their dashboard.
   - Can **Upload Documents** under owner-specific categories (Statements, Tax, Insurance, Contracts, etc.) with a 5MB limit.
4. **Tenant** (Email must contain `tenant`):
   - Accesses a tenant portal to pay rent online, submit maintenance tickets, view lease documents, and register visitors.
   - Can **Upload Documents** under tenant-specific categories (Rental Agreement, Govt ID, Proof of Income, Utility Bills, Renter's Insurance, etc.) with a 5MB limit.

---

## 🔄 Core Business Workflows

### 1. Pricing Plan Checkout Workflow (Landing Page)
1. **Plan Selection**: User browses pricing options on the public Landing Page and clicks **Buy Now**.
2. **Checkout Modal**: Opens an interactive modal prompting for contact and payment information (Credit Card / Bank Account).
3. **Simulated Loader**: Displays progress spinners and animations during checkout.
4. **Success Redirect**: Automatically redirects the user to the `/login` screen to set up their workspace.

### 2. User Management Workflow (Manager/Admin Portal)
1. **Invite Modal**: Manager clicks "Invite User" which opens a React Form Modal (replacing native browser alerts).
2. **Inline Action Toggles**: 
   - **View Details**: View permissions and activities.
   - **Suspend / Activate**: Instantly toggles the status badge of the user.
   - **Revoke**: Prompts with a Confirm Dialog and deletes the user from the active directory.

### 3. Tenant Portal Document Upload
1. **Dropzone Interface**: Tenant clicks on the drag-and-drop area.
2. **File Explorer**: Triggered automatically via a hidden file input to browse local computer files. Selecting a file auto-populates the document title.
3. **Categories & Custom Category**:
   - Selector choices: *Rental Agreement, Identity Proof (Govt ID), Proof of Income, Utility Bills, Renter's Insurance, and Other*.
   - Selecting **Other** opens a text input to write a custom category name.
4. **5MB Validation**: The interface limits file size alerts up to 5MB, hiding unnecessary size sliders.

### 4. Tenant Payments and Balance Check
1. **Payments Page**: The tenant visits their payments tab.
2. **Outstanding Rent Check**:
   - If balance is **$0.00**, a green success check icon appears.
   - The "Pay Rent" action changes to a disabled **No Balance Due** outline button to prevent redundant payments.
   - If a balance exists, the tenant can complete the transaction online.

### 5. Owner Portal Property Management
1. **Add Property**: Owner clicks **+ Add Property**, opening a Modal form to set Property Name, Address, Type, and Target Rent.
2. **Delete Property**: Next to the details button is a Red Trash button. Clicking it triggers a **Confirm Dialog** before purging the property.

### 6. Owner Portal Document Upload
1. **Dropzone Interaction**: Opens file browser upon click.
2. **Owner Categories**: *Statements, Tax Documents, Contracts, Insurance, Property Photos, Maintenance Reports, Inspection Reports, and Other*. Selecting **Other** prompts for a custom name.
3. **Storage Sync**: Successfully uploaded files immediately appear in the owner's central Documents list.

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Log in with Mock Roles (Email Inputs)**:
   - **Super Admin**: `admin@whatslandlord.com`
   - **Owner**: `owner@whatslandlord.com`
   - **Tenant**: `tenant@whatslandlord.com`
   - **Property Manager**: `manager@whatslandlord.com` (or any general email)
