# Engineering Challenges & Solutions

**Candidate:** Abhishek Gadavi  
**Project:** Accounts Payable (AP) Automation Software with OCR  
**Submission for:** Templegate Technologies & Services Pvt. Ltd.

---

### Challenge 1: Multi-Page Tabular Extraction & OCR Noise in Varied Invoice Formats
#### Problem:
Invoices arrive from hundreds of independent vendors in heterogeneous layouts—ranging from clean digital multi-page PDFs to low-resolution camera scans, skewed photos, and tilted faxes. Standard off-the-shelf OCR often jumbles line-item columns (e.g., merging Quantity and Unit Price, or splitting multi-line product descriptions into disjointed table rows), leading to erroneous totals.

#### Solution & Implementation Approach:
1. **Multi-Pass Document Preprocessing:** Before OCR ingestion, the pipeline applies grayscale conversion, binarization (Otsu thresholding), and deskewing using OpenCV and Pillow to straighten tilted pages.
2. **Anchor-Based Spatial Heuristics:** Rather than relying solely on raw text coordinates, the engine searches for semantic header anchors (`Description`, `Qty`, `Rate`, `HSN/SAC`, `Taxable Amt`, `Total`) to calculate dynamic bounding column boundaries.
3. **Multi-Page Accumulation:** For multi-page invoices, page-by-page table parser accumulates line items while detecting carry-over sub-totals and suppressing repeated page headers.
4. **Token-Level Confidence Scoring:** Every extracted field and line item is tagged with a statistical confidence score (e.g. `98.4%`). When confidence falls below 85%, the system highlights the cell in yellow/orange in the React frontend for human-in-the-loop verification.

---

### Challenge 2: 3-Way PO Matching with Tolerances & Partial Warehouse Shipments
#### Problem:
Real-world enterprise purchasing rarely matches 1:1. Suppliers frequently deliver goods in partial shipments, or invoiced quantities deviate slightly due to weight loss in transit, or freight surcharges cause minor fractional price variances. Strict equality matching causes over 60% of legitimate invoices to be falsely rejected, creating massive AP bottlenecks.

#### Solution & Implementation Approach:
1. **Configurable Tolerance Matrix:** Built a granular tolerance engine into Django supporting:
   - **Unit Price Variance Threshold:** Configured default at `±2.0%` (or absolute threshold such as `±₹50`).
   - **Quantity Variance Threshold:** Strictly enforces that `Billed Quantity <= GRN Accepted Quantity` (preventing payments for unreceived or rejected goods).
2. **Item-Level Variance Decomposition:** When a discrepancy occurs, the engine categorizes the failure into exact actionable flags (`DISCREPANCY_PRICE`, `DISCREPANCY_QTY`, `NO_GRN_RECORD`, `UNAUTHORIZED_ITEM`) instead of generic failures.
3. **Manager Override Workflow:** Implemented an authorized override protocol where an AP Manager or Finance Controller can review the line-by-line delta, supply an audit justification note, and approve the invoice into the approval queue with full SOX compliance tracking.

---

### Challenge 3: Indian GST Compliance, Tax Splitting & Floating-Point Precision
#### Problem:
Invoicing in India is strictly governed by the GST framework. Errors in tax classification (e.g., levying IGST on intra-state supplies, or miscalculating 9% CGST + 9% SGST vs 18% IGST) prevent companies from claiming Input Tax Credit (ITC), causing direct financial loss. Furthermore, floating-point arithmetic errors in standard JavaScript/Python numbers (`0.1 + 0.2 = 0.30000000000000004`) cause artificial reconciliation mismatches.

#### Solution & Implementation Approach:
1. **Arbitrary Precision Arithmetic (`Decimal`):** Stored all financial figures as PostgreSQL `NUMERIC(15, 2)` and computed all values using Python's `decimal.Decimal` module, eliminating IEEE 754 floating-point inaccuracies.
2. **Statutory 15-Digit GSTIN Validation:** Enforced regex pattern `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` which verifies state code, PAN linkage, and entity code.
3. **State Code Geographic Rule Engine:** Compares the vendor's GST state code (first 2 digits) against Templegate's state code (`29` - Karnataka). If identical, intra-state rules apply (`CGST + SGST`); if different, inter-state rules apply (`IGST`). Any deviation is flagged immediately during the validation phase.

---

### Challenge 4: Concurrency & State Machine Integrity in Multi-Tier Approvals
#### Problem:
When invoices exceed high monetary thresholds (e.g., > ₹1,00,000 requiring Finance Controller sign-off, or > ₹5,00,000 requiring parallel CFO and VP sign-off), concurrent approvals or duplicate clicks can lead to race conditions where an invoice is scheduled for payment multiple times or skipped across tiers.

#### Solution & Implementation Approach:
1. **Deterministic State Machine:** Built an explicit lifecycle model (`UPLOADED` -> `PROCESSING_OCR` -> `EXTRACTED` -> `PENDING_MATCHING` -> `PENDING_APPROVAL` -> `APPROVED` -> `PAYMENT_SCHEDULED` -> `PAID`). Transitions are only permitted through verified workflow handlers.
2. **Database Row Locks:** Used Django's `select_for_update()` during approval transitions inside atomic transactions, guaranteeing that sequential tier approvals cannot be corrupted by simultaneous requests.
3. **Automated SLA Escalation:** Implemented SLA turnaround limits (24 hours for Tier 1-2, 48 hours for Tier 3, 72 hours for Tier 4). Invoices languishing past SLA automatically trigger visual escalation flags and re-route to senior management.

---

### Challenge 5: Seamless Production Packaging & Deployment
#### Problem:
Connecting a React frontend, Django REST backend, Celery/OCR worker dependencies, and a PostgreSQL database on disparate host environments often leads to dependency conflicts ("works on my machine" syndrome).

#### Solution & Implementation Approach:
1. **Docker Compose Orchestration:** Packaged the entire platform into a 3-container `docker-compose.yml` (PostgreSQL 15, Django Backend, React Vite Frontend) that spins up with a single `docker-compose up --build` command.
2. **Automated Database Initialization:** Included SQL initialization scripts (`1_schema.sql` and `2_seed.sql`) mounted into PostgreSQL's `/docker-entrypoint-initdb.d/`, ensuring immediate availability of realistic test data upon launch.
3. **Resilient Dual-Mode Database Support:** Designed the Django backend with an automated fallback mechanism: if PostgreSQL is unreachable during local developer testing without Docker, the app seamlessly falls back to SQLite without code modifications.
