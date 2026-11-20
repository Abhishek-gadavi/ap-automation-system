# Architecture & System Design Document

**System:** Accounts Payable (AP) Automation Software with OCR  
**Target Enterprise:** Templegate Technologies & Services Pvt. Ltd.  
**Stack:** ReactJS + Django REST Framework + PostgreSQL 15 (Docker)  
**Author:** Abhishek Gadavi  

---

## 1. High-Level Architectural Diagram

```mermaid
flowchart TB
    subgraph Client ["Frontend Layer (ReactJS SPA)"]
        UI_Web["React Router & Hooks UI"]
        UI_Store["Client State & Mock Datasets"]
        UI_Components["14 Modular Pages (Dashboard, Capture, Match, Matrix, etc.)"]
    end

    subgraph API_Gateway ["Backend Layer (Django REST Framework)"]
        JWT_Auth["JWT Authentication & RBAC Filter"]
        Invoices_API["Invoice Capture & Lifecycle Controller"]
        OCR_Service["OCR & Layout Heuristics Engine"]
        Validation_Service["5-Point Statutory Validation Engine"]
        Matching_Service["2-Way & 3-Way PO Reconciliation Engine"]
        Workflow_Service["Approval Matrix & SLA Escalation Daemon"]
        Payment_Service["Banking CMS & Remittance Advice Service"]
        Report_Service["Analytics & GSTR-2B Schedule Generator"]
    end

    subgraph Storage ["Persistence Layer (PostgreSQL 15 via Docker)"]
        PG_DB[(PostgreSQL Database: accounts_payable_db)]
        T_Vendors["vendors & vendor_bank_details"]
        T_POs["purchase_orders & po_line_items"]
        T_GRNs["goods_receipt_notes & grn_line_items"]
        T_Invoices["invoices & invoice_line_items"]
        T_Approvals["approval_matrix & invoice_approvals"]
        T_Payments["payment_requests & transactions"]
        T_Audit["audit_logs (Immutable SOX)"]
    end

    UI_Web --> JWT_Auth
    JWT_Auth --> Invoices_API
    Invoices_API --> OCR_Service
    OCR_Service --> Validation_Service
    Validation_Service --> Matching_Service
    Matching_Service --> Workflow_Service
    Workflow_Service --> Payment_Service
    Payment_Service --> Report_Service

    Invoices_API --> T_Invoices
    OCR_Service --> T_Invoices
    Validation_Service --> T_Vendors
    Matching_Service --> T_POs
    Matching_Service --> T_GRNs
    Workflow_Service --> T_Approvals
    Payment_Service --> T_Payments
    Report_Service --> T_Audit
```

---

## 2. Core Architectural Principles

### 2.1. Decoupled Service Architecture
The backend is partitioned into discrete Django business applications (`accounts`, `vendors`, `invoices`, `matching`, `approvals`, `payments`, `notifications`, `analytics`), preventing monolithic tight coupling and ensuring each module can be maintained or scaled independently.

### 2.2. Deterministic State Machine
Invoice lifecycle transitions are governed strictly by state constraints:
`DRAFT` ➔ `UPLOADED` ➔ `PROCESSING_OCR` ➔ `EXTRACTED` ➔ `PENDING_MATCHING` ➔ `PENDING_APPROVAL` ➔ `APPROVED` ➔ `PAYMENT_SCHEDULED` ➔ `PAID`.  
Invoices cannot be scheduled for payment without traversing all preceding validation and approval checkpoints.

### 2.3. Mathematical Financial Integrity
All calculations involving Indian Rupee currency (subtotals, CGST, SGST, IGST, matching tolerances, gross totals) use arbitrary-precision Python `decimal.Decimal` and PostgreSQL `NUMERIC(15, 2)`, completely eliminating binary floating-point roundoff errors.

### 2.4. Containerized PostgreSQL Persistence
PostgreSQL 15 is configured with a named persistent Docker volume (`pgdata`), ensuring complete data durability across host reboots and container upgrades.
