# Demo Video Walkthrough Script & Architecture Presentation

**Candidate:** Abhishek Gadavi  
**Project:** Accounts Payable (AP) Automation Software with OCR  
**Company:** Templegate Technologies & Services Pvt. Ltd.  
**Target Duration:** 5 - 7 Minutes  
**Video Goal:** Demonstrate all 9 required modules, explain the technical architecture, database schema, and design decisions.

---

## Video Outline & Time Breakdown

| Timestamp | Section | Key Screen to Show | Core Talking Points |
|---|---|---|---|
| **00:00 - 00:45** | **1. Introduction & Overview** | Slide / Webcam + Title Screen | Introduce yourself, summarize the project goals, and introduce the mandatory tech stack (React + Django + PostgreSQL). |
| **00:45 - 01:45** | **2. Architecture & Design Decisions** | Architecture Diagram / Database Schema | Explain the decoupled architecture, REST APIs, PostgreSQL schema, 5-point validation engine, and OCR pipeline. |
| **01:45 - 02:45** | **3. Module 1 & 2: Invoice Capture & AI OCR Extraction** | "Invoice Capture & OCR" UI Tab | Drag & drop a PDF/PNG invoice, show live AI parsing of header, dates, GSTIN, and line-item table extraction with confidence scores. |
| **02:45 - 03:45** | **4. Module 3 & 4: Validation Engine & 3-Way Matching** | "PO Matching Engine" UI Tab | Show 5-point statutory validation, 2-Way vs 3-Way reconciliation (PO vs GRN vs Invoice), tolerance calculations, and manager override. |
| **03:45 - 04:45** | **5. Module 5 & 6: Approval Matrix & Vendor Management** | "Approval Workflows" & "Vendor Master" Tabs | Demonstrate dynamic multi-tier matrix routing, role switching (AP Clerk vs Controller vs CFO), approval actions, and vendor onboarding. |
| **04:45 - 05:45** | **6. Module 7, 8 & 9: Payments, Dashboard & Reports** | "Payment Processing", "Dashboard" & "Reports" | Schedule NEFT payment, generate payment advice PDF, review AP aging schedule, TAT metrics, and export GSTR-2B tax reports. |
| **05:45 - 06:15** | **7. Conclusion & Source Code Structure** | VS Code / GitHub Repository | Brief tour of backend modular apps, schema DDL, test suite, and closing remarks. |

---

## Word-For-Word Spoken Script

### 1. Introduction (00:00 - 00:45)
> *"Hello everyone! My name is Abhishek Gadavi. In this video, I am presenting my technical assignment for Templegate Technologies & Services: an enterprise-grade Accounts Payable Automation Software with OCR and workflow automation.*
> 
> *The goal of this platform is to eliminate manual data entry, prevent duplicate and unauthorized payments, streamline multi-tier approval hierarchies, and provide total visibility over invoice aging and cash disbursements.*
> 
> *As mandated in the project specification, this system is engineered with ReactJS on the frontend, Django and Django REST Framework on the backend, and PostgreSQL as the relational database."*

### 2. Architecture & Key Design Decisions (00:45 - 01:45)
> *(Switch to Architecture & Schema diagram)*
> *"Let's examine the high-level architecture. The platform consists of 6 modular backend domains: Invoices, Matching, Approvals, Vendors, Payments, and Analytics.*
> 
> *In PostgreSQL, our schema is built around strict data integrity: UUID primary keys, ENUM states for predictable lifecycles, composite unique constraints on `(vendor_id, invoice_number)` to eliminate duplicate invoices at the database level, and decimal precision to avoid floating-point errors.*
> 
> *A core design decision was decoupling the OCR ingestion engine from the business logic. Incoming documents are passed through a layout-aware extraction engine that outputs structured JSON tokens along with statistical confidence scores. This feeds directly into our 5-point validation engine."*

### 3. Module 1 & 2: Invoice Capture & OCR Extraction (01:45 - 02:45)
> *(Switch to React UI -> Click 'Invoice Capture & OCR')*
> *"Now let's see the application in action. Here in the Invoice Capture Module, users can ingest invoices via drag-and-drop, trigger bulk ingestion, or connect to automated email webhooks.*
> 
> *I'll drop a multi-page PDF invoice from Acme Industrial Solutions. Notice how our OCR engine immediately extracts the vendor GSTIN, invoice date, due date, subtotal, and tax breakdowns.*
> 
> *Crucially, our system extracts tabular line items—such as CNC Machined Cylinders and Industrial Fasteners—mapping item codes, quantities, and unit rates into an interactive grid with individual cell confidence scores exceeding 98%."*

### 4. Module 3 & 4: Validation Engine & 3-Way PO Matching (02:45 - 03:45)
> *(Switch to 'PO Matching Engine' Tab)*
> *"Once extracted, Module 3 automatically executes our 5-point validation: checking mandatory fields, verifying vendor active status, running duplicate checks, and confirming GST statutory rules.*
> 
> *Next, we move to Module 4: The PO Matching Engine. The system supports both 2-Way matching against the Purchase Order and 3-Way matching against the PO and Goods Receipt Note (GRN).*
> 
> *As you can see on screen, our engine compares the authorized PO items, the warehouse GRN accepted quantities, and the billed invoice. If unit prices differ within our 2% tolerance, it passes; if a price or quantity discrepancy occurs, it flags the variance with full itemized breakdown. An authorized manager can review the discrepancy and perform a compliant manual override with audit comments."*

### 5. Module 5 & 6: Approval Matrix & Vendor Management (03:45 - 04:45)
> *(Switch to 'Approval Workflows' and then 'Vendor Management')*
> *"Once validated and matched, Module 5 routes the invoice into our dynamic Approval Matrix.*
> 
> *Our matrix defines 4 distinct tiers: Tier 1 for AP Clerks up to ₹25,000, Tier 2 for Team Leads up to ₹1,00,000, Tier 3 for Finance Controllers up to ₹5,00,000, and Tier 4 for the CFO requiring parallel dual signatures.*
> 
> *In our UI, I can switch acting roles in the top navbar. As a Finance Controller, I can review the invoice notes, request clarification, escalate if SLA turnaround has expired, or approve it. Every single action is logged to an immutable audit journal.*
> 
> *In the Vendor Management tab, we maintain the complete supplier directory, enforce 15-character GSTIN regex validation, track MSME priority status, and perform bank account verification."*

### 6. Module 7, 8 & 9: Payments, Dashboard & Reports (04:45 - 05:45)
> *(Switch to 'Payment Processing', 'Dashboard', and 'Reports')*
> *"Once fully approved, the invoice moves to Module 7: Payment Processing.*
> 
> *Finance can schedule NEFT, RTGS, or ACH disbursements with a single click, export a standardized banking CMS batch CSV, and simulate bank gateway settlement to issue a unique transaction UTR number.*
> 
> *Clicking 'View Advice' generates an official corporate Remittance Advice PDF document with company details, vendor bank credentials, and tax deductions.*
> 
> *Finally, our Executive Dashboard provides full visibility over invoice aging (0-30, 31-60, 61-90, and 90+ days), pending approval counts, turnaround time (TAT), and OCR accuracy percentages.*
> 
> *In the Reports module, teams can review and export AP Aging schedules, discrepancy exception logs, and statutory GST Input Tax Credit reports to CSV."*

### 7. Conclusion (05:45 - 06:15)
> *(Show GitHub Repository in browser or VS Code file explorer)*
> *"To wrap up: this platform provides a complete, production-ready, full-stack AP automation solution with clean code architecture, comprehensive Docker Compose setup, and modular Django apps.*
> 
> *All source code, PostgreSQL schema DDL, test seed scripts, and documentation are available in the GitHub repository linked in my email submission.*
> 
> *Thank you very much for your time and consideration. I look forward to the next steps!"*
