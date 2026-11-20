# RESTful API Reference Documentation

**Platform:** Accounts Payable Automation Software with OCR  
**Base URL:** `http://localhost:8000/api/v1/`  
**Authentication:** JWT Bearer Token (`Authorization: Bearer <jwt_access_token>`)  
**Format:** `application/json`

---

## 1. Authentication & User Management (`/api/v1/auth/`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/login/` | Obtain JWT access and refresh token pair | Public |
| `POST` | `/api/v1/auth/refresh/` | Refresh expired access token | Public |
| `POST` | `/api/v1/auth/register/` | Register new employee or vendor account | Public / Admin |
| `GET` | `/api/v1/auth/profile/` | Fetch authenticated user profile & roles | Bearer JWT |
| `GET` | `/api/v1/auth/users/` | List all users (Admin only) | Bearer JWT (Admin) |

---

## 2. Invoices & OCR Capture (`/api/v1/invoices/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/invoices/invoices/` | List all invoices with pagination & status filtering |
| `POST` | `/api/v1/invoices/invoices/capture_invoice/` | Upload single invoice (PDF/PNG/JPG/TIFF), trigger OCR & 5-point validation |
| `POST` | `/api/v1/invoices/invoices/bulk_upload/` | Queue batch bulk invoice ingestion |
| `GET` | `/api/v1/invoices/invoices/{id}/` | Retrieve full invoice details with line items and validation results |
| `POST` | `/api/v1/invoices/invoices/{id}/revalidate/` | Re-run validation engine after manual line item corrections |
| `GET` | `/api/v1/invoices/purchase-orders/` | List all purchase orders |
| `POST` | `/api/v1/invoices/purchase-orders/` | Create a new purchase order with line items |
| `GET` | `/api/v1/invoices/grns/` | List all Goods Receipt Notes |
| `POST` | `/api/v1/invoices/grns/` | Record new warehouse goods receipt (GRN) with QC status |

---

## 3. PO Matching Engine (`/api/v1/matching/`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/matching/run_match/` | Execute 2-way (PO vs Inv) or 3-way (PO vs GRN vs Inv) matching with tolerance checks |
| `POST` | `/api/v1/matching/{id}/manual_override/` | Authorize manager override for price or quantity discrepancies with audit justification |
| `GET` | `/api/v1/matching/{id}/` | Get variance decomposition details |

---

## 4. Approval Workflows & Matrix (`/api/v1/approvals/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/approvals/matrix/` | Fetch active approval matrix tiers, thresholds, and SLA hours |
| `POST` | `/api/v1/approvals/matrix/` | Configure approval matrix rule (Admin) |
| `GET` | `/api/v1/approvals/requests/` | List pending invoice approval requests |
| `POST` | `/api/v1/approvals/requests/{id}/act/` | Execute decision: `APPROVE`, `REJECT`, `CLARIFY`, or `ESCALATE` |
| `GET` | `/api/v1/approvals/audit-logs/` | Query immutable audit log journal |

---

## 5. Vendor Master Management (`/api/v1/vendors/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/vendors/` | List all registered vendors |
| `POST` | `/api/v1/vendors/` | Onboard new vendor with 15-digit GSTIN & PAN validation |
| `GET` | `/api/v1/vendors/{id}/` | Get vendor master record, bank details, and invoice history |
| `POST` | `/api/v1/vendors/{id}/approve_onboarding/` | Transition vendor state from `PENDING_ONBOARDING` to `ACTIVE` |
| `POST` | `/api/v1/vendors/{id}/verify_bank/` | Verify bank details for remittance readiness |

---

## 6. Payment Processing & Remittance (`/api/v1/payments/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/payments/` | List all payment requests & transaction registers |
| `POST` | `/api/v1/payments/create_request/` | Generate payment request for approved invoice |
| `POST` | `/api/v1/payments/{id}/execute_settlement/` | Simulate bank gateway settlement and issue UTR number |
| `GET` | `/api/v1/payments/{id}/advice/` | Generate official Remittance Advice document |

---

## 7. Notifications (`/api/v1/notifications/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/notifications/` | Fetch all in-app & email notification records |
| `POST` | `/api/v1/notifications/{id}/mark_read/` | Mark notification as read |
| `POST` | `/api/v1/notifications/mark_all_read/` | Mark all notifications as read |

---

## 8. Dashboard & Analytics (`/api/v1/analytics/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/analytics/dashboard/` | Real-time aggregate KPIs (Total volume, Aging schedule, TAT, OCR accuracy %, Vendor spend) |
| `GET` | `/api/v1/analytics/reports/?type={TYPE}` | Exportable reports: `AP_AGING`, `STATUS`, `EXCEPTIONS`, `GST_TAX`, `AUDIT_LOGS` |
