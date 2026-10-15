# WhatsLandlord Property - Complete Interface Wireframes

This document details the layout wireframes (ASCII Mockups) for the newly introduced/refined interfaces in WhatsLandlord Property, categorized by portal and role.

---

## 🌐 Public Landing Page: Pricing Checkout Flow

### 1. Pricing Cards & Checkout Trigger
```
+-----------------------------------------------------------------------------+
|                                  PRICING PLANS                              |
|                                                                             |
|   [ Essential ]                [ Professional ]              [ Premium ]    |
|   $19 /mo                      $49 /mo                       $99 /mo        |
|   - Basic Features             - All core modules            - Unlimited    |
|                                                                             |
|   [ BUY NOW ]                  [ BUY NOW ] (Click)           [ BUY NOW ]    |
+-----------------------------------------------------------------------------+
```

### 2. Interactive Checkout Modal
```
+--------------------------------------------------------+
| Checkout - Professional Plan                       [X] |
+--------------------------------------------------------+
|                                                        |
|  Full Name                                             |
|  [ John Doe                                          ] |
|                                                        |
|  Email Address                                         |
|  [ john@example.com                                  ] |
|                                                        |
|  Payment Method                                        |
|  (*) Credit Card      ( ) ACH Bank Transfer            |
|                                                        |
|  Card Details                                          |
|  [ 4111 2222 3333 4444 ]  [ 12/29 ]  [ 123 ]           |
|                                                        |
|  [ Cancel ]                     [ Submit Payment & Reg ]|
+--------------------------------------------------------+
```

---

## 👑 Admin / Manager Portal: User Directory

### 1. User Directory with Inline Actions
```
+-----------------------------------------------------------------------------+
| HOME > USER DIRECTORY                                       [ Invite User ] |
|                                                                             |
| [ Search users by name or email...   ]  Category: [ All Role (v) ]          |
|                                                                             |
| NAME          EMAIL             ROLE           STATUS     ACTIONS           |
| John Doe      john@apex.com     Super Admin    [Active]   [View] [Suspend]  |
| Jane Smith    jane@apex.com     Accountant     [Active]   [View] [Suspend]  |
| Bob Johnson   bob@apex.com      Leasing Agent  [Suspended][View] [Activate] |
|                                                                             |
| * Revoke buttons prompt a delete Confirmation Dialog                        |
+-----------------------------------------------------------------------------+
```

### 2. Invite User React Modal
```
+--------------------------------------------------------+
| Invite Team Member                                 [X] |
+--------------------------------------------------------+
|                                                        |
|  Full Name                                             |
|  [ Enter name                                        ] |
|                                                        |
|  Email Address                                         |
|  [ Enter email                                       ] |
|                                                        |
|  Role                            Team                  |
|  [ Property Manager (v) ]        [ Operations    (v) ] |
|                                                        |
|  [ Cancel ]                                [ Send Invite ]|
+--------------------------------------------------------+
```

---

## 🔑 Tenant Portal

### 1. Rent Payments page (Paid State)
```
+-----------------------------------------------------------------------------+
| HOME > PAYMENTS & AUTOPAY                           [ Submit Rent Payment ] |
|                                                                             |
| +------------------------------------+ +----------------------------------+ |
| | OUTSTANDING BALANCE DUE            | | AUTOPAY SETUP                    | |
| |                                    | |                                  | |
| |  $0.00   (Checkmark Green)         | | Status: [ ENABLED ]              | |
| |                                    | |                                  | |
| |  [ No Balance Due (Disabled) ]     | | Automatically debited on 1st.    | |
| +------------------------------------+ +----------------------------------+ |
|                                                                             |
| PAYMENT HISTORY LEDGER                                                      |
| DATE        METHOD       AMOUNT       STATUS                                |
| 2026-07-01  ACH          $1,250       Cleared                               |
| 2026-06-01  ACH          $1,250       Cleared                               |
+-----------------------------------------------------------------------------+
```

### 2. Tenant Document Upload Modal (Max 5MB)
```
+--------------------------------------------------------+
| Upload New Document                                [X] |
+--------------------------------------------------------+
|  +--------------------------------------------------+  |
|  |       (UploadCloud Icon)                         |  |
|  |       Drag and drop file here or click to browse |  |
|  |       PDF, PNG, JPG up to 5MB                    |  |
|  +--------------------------------------------------+  |
|                                                        |
|  Document Title                                        |
|  [ E.g., Renter Insurance Policy                     ] |
|                                                        |
|  Category                                              |
|  [ Rental Agreement  (v) ]                             |
|  * Options: Rental Agreement, Identity Proof,          |
|    Proof of Income, Utility Bills, Insurance, Other    |
|                                                        |
|  * Selecting 'Other' displays a custom category field  |
|                                                        |
|  [ Cancel ]                                [ Upload ]  |
+--------------------------------------------------------+
```

---

## 👑 Owner Portal

### 1. My Properties List (with Add and Delete Actions)
```
+-----------------------------------------------------------------------------+
| HOME > MY PROPERTIES                                         [ Add Property ]|
|                                                                             |
| +------------------+ +------------------+ +------------------+            |
| | OAKRIDGE HEIGHTS | | DOWNTOWN PLAZA   | | SUNSET GARDENS   |            |
| | 100 Main St      | | 112 Main St      | | 789 Palms Blvd   |            |
| |                  | |                  | |                  |            |
| | Type: Apartment  | | Type: Commercial | | Type: Apartment  |            |
| | Rent: $2,400     | | Rent: $2,400     | | Rent: $2,400     |            |
| |                  | |                  | |                  |            |
| | [Details] [Trash]| | [Details] [Trash]| | [Details] [Trash]|            |
| +------------------+ +------------------+ +------------------+            |
+-----------------------------------------------------------------------------+
```

### 2. Owner Add Property Modal
```
+--------------------------------------------------------+
| Add New Property                                   [X] |
+--------------------------------------------------------+
|                                                        |
|  Property Name                                         |
|  [ E.g., Sunset Gardens                              ] |
|                                                        |
|  Address                                               |
|  [ E.g., 789 Palms Blvd, Austin, TX                  ] |
|                                                        |
|  Property Type                   Target Monthly Rent   |
|  [ Apartment       (v) ]         [ $2,400            ] |
|                                                        |
|  [ Cancel ]                         [ Add Property ]   |
+--------------------------------------------------------+
```

### 3. Owner Document Upload Modal (Max 5MB)
```
+--------------------------------------------------------+
| Upload New Document                                [X] |
+--------------------------------------------------------+
|  +--------------------------------------------------+  |
|  |       (UploadCloud Icon)                         |  |
|  |       Drag and drop file here or click to browse |  |
|  |       PDF, PNG, JPG up to 5MB                    |  |
|  +--------------------------------------------------+  |
|                                                        |
|  Document Title                                        |
|  [ E.g., Annual Tax Statement                        ] |
|                                                        |
|  Category                                              |
|  [ Statements        (v) ]                             |
|  * Options: Statements, Tax Documents, Contracts,      |
|    Insurance, Property Photos, Maintenance, Other      |
|                                                        |
|  [ Cancel ]                                [ Upload ]  |
+--------------------------------------------------------+
```
