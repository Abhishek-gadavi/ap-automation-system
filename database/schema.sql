-- ============================================================================
-- Enterprise Accounts Payable (AP) Automation Software with OCR
-- Target RDBMS: PostgreSQL 14+ (Compulsory Stack)
-- Database Name: accounts_payable_db
-- User: accounts_user
-- Submission for: Templegate Technologies & Services Pvt. Ltd.
-- Author: Abhishek Gadavi
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE invoice_status_enum AS ENUM (
        'DRAFT', 'UPLOADED', 'PROCESSING_OCR', 'EXTRACTED', 'VALIDATION_FAILED',
        'PENDING_MATCHING', 'MATCHING_FAILED', 'PENDING_APPROVAL', 'APPROVED',
        'REJECTED', 'PAYMENT_SCHEDULED', 'PAID', 'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE matching_type_enum AS ENUM ('TWO_WAY', 'THREE_WAY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE match_status_enum AS ENUM (
        'PENDING', 'MATCHED_EXACT', 'MATCHED_WITHIN_TOLERANCE',
        'DISCREPANCY_PRICE', 'DISCREPANCY_QTY', 'DISCREPANCY_TOTAL', 'MANUALLY_OVERRIDDEN'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE approval_status_enum AS ENUM (
        'PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'CLARIFICATION_REQUESTED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE vendor_status_enum AS ENUM (
        'PENDING_ONBOARDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'ADMIN', 'FINANCE_EMPLOYEE', 'APPROVER_MANAGER', 'VENDOR'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ----------------------------------------------------------------------------
-- 2. USERS & ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role user_role_enum DEFAULT 'FINANCE_EMPLOYEE',
    department VARCHAR(100) DEFAULT 'Accounts Payable',
    approval_limit NUMERIC(15, 2) DEFAULT 50000.00,
    vendor_id UUID,
    is_active_employee BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. VENDORS & BANK DETAILS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    gstin VARCHAR(15) UNIQUE NOT NULL,
    pan_number VARCHAR(10) NOT NULL,
    msme_registered BOOLEAN DEFAULT FALSE,
    payment_terms_days INTEGER DEFAULT 30,
    status vendor_status_enum DEFAULT 'PENDING_ONBOARDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_bank_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    bank_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(150),
    is_primary BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. PURCHASE ORDERS & LINE ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(64) UNIQUE NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    po_date DATE NOT NULL,
    delivery_date DATE,
    currency VARCHAR(3) DEFAULT 'INR',
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS po_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_code VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    unit_of_measure VARCHAR(16) DEFAULT 'NOS',
    unit_price NUMERIC(15, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. GOODS RECEIPT NOTES (GRN) & RECEIVED ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(64) UNIQUE NOT NULL,
    po_id UUID NOT NULL REFERENCES purchase_orders(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    received_date DATE NOT NULL,
    received_by VARCHAR(150),
    warehouse_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grn_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id UUID NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    po_line_item_id UUID REFERENCES po_line_items(id),
    item_code VARCHAR(64) NOT NULL,
    quantity_received NUMERIC(12, 3) NOT NULL,
    quantity_accepted NUMERIC(12, 3) NOT NULL,
    quantity_rejected NUMERIC(12, 3) DEFAULT 0.000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. INVOICES, OCR EXTRACTION & DOCUMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100),
    vendor_id UUID REFERENCES vendors(id),
    po_id UUID REFERENCES purchase_orders(id),
    grn_id UUID REFERENCES goods_receipt_notes(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_format VARCHAR(10) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    page_count INTEGER DEFAULT 1,
    invoice_date DATE,
    due_date DATE,
    currency VARCHAR(3) DEFAULT 'INR',
    subtotal NUMERIC(15, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    cgst_amount NUMERIC(15, 2) DEFAULT 0.00,
    sgst_amount NUMERIC(15, 2) DEFAULT 0.00,
    igst_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) DEFAULT 0.00,
    ocr_confidence NUMERIC(5, 2) DEFAULT 0.00,
    ocr_raw_payload JSONB,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    is_duplicate BOOLEAN DEFAULT FALSE,
    matching_type matching_type_enum DEFAULT 'THREE_WAY',
    matching_status match_status_enum DEFAULT 'PENDING',
    status invoice_status_enum DEFAULT 'UPLOADED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_code VARCHAR(64),
    description TEXT NOT NULL,
    hsn_sac_code VARCHAR(16),
    quantity NUMERIC(12, 3) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL,
    confidence_score NUMERIC(5, 2) DEFAULT 95.00
);

CREATE TABLE IF NOT EXISTS invoice_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    document_type VARCHAR(50) DEFAULT 'ORIGINAL_INVOICE',
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_hash_sha256 VARCHAR(64),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_validation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    check_name VARCHAR(100) NOT NULL,
    check_status VARCHAR(20) NOT NULL, -- VALID, WARNING, FAILED
    error_message TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. MATCHING RESULTS & DISCREPANCIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matching_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    po_id UUID REFERENCES purchase_orders(id),
    grn_id UUID REFERENCES goods_receipt_notes(id),
    matching_type matching_type_enum NOT NULL,
    overall_status match_status_enum NOT NULL,
    price_variance_pct NUMERIC(6, 2) DEFAULT 0.00,
    qty_variance_pct NUMERIC(6, 2) DEFAULT 0.00,
    total_variance_amount NUMERIC(15, 2) DEFAULT 0.00,
    discrepancy_details JSONB DEFAULT '{}'::jsonb,
    overridden_by VARCHAR(150),
    override_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. APPROVAL MATRIX & WORKFLOW ENGINE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_level INTEGER NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    min_amount NUMERIC(15, 2) NOT NULL,
    max_amount NUMERIC(15, 2) NOT NULL,
    requires_parallel_approval BOOLEAN DEFAULT FALSE,
    sla_hours INTEGER DEFAULT 48,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS invoice_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    tier_level INTEGER NOT NULL,
    approver_role VARCHAR(100) NOT NULL,
    approver_email VARCHAR(255),
    status approval_status_enum DEFAULT 'PENDING',
    comments TEXT,
    escalated_to VARCHAR(255),
    decision_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_id UUID NOT NULL REFERENCES invoice_approvals(id) ON DELETE CASCADE,
    actor_email VARCHAR(255) NOT NULL,
    action_taken VARCHAR(50) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. PAYMENT PROCESSING & TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference VARCHAR(64) UNIQUE NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    bank_detail_id UUID REFERENCES vendor_bank_details(id),
    payment_method VARCHAR(32) DEFAULT 'NEFT',
    amount NUMERIC(15, 2) NOT NULL,
    scheduled_date DATE NOT NULL,
    processed_date TIMESTAMP WITH TIME ZONE,
    utr_number VARCHAR(100),
    status payment_status_enum DEFAULT 'PENDING',
    batch_reference VARCHAR(64),
    payment_advice_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_request_id UUID NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    gateway_name VARCHAR(100) DEFAULT 'SANDBOX_NEFT_ADAPTER',
    gateway_reference VARCHAR(150),
    response_code VARCHAR(50),
    response_payload JSONB,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATIONS & IMMUTABLE AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(64) DEFAULT 'FINANCE_EMPLOYEE',
    notification_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_id VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    email_dispatched BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    old_state JSONB,
    new_state JSONB,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. INDEXES & CONSTRAINTS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_matching_status ON invoices(matching_status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_vendor_invoice ON invoices(vendor_id, invoice_number);

CREATE INDEX IF NOT EXISTS idx_inv_lines_inv_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_po_id ON po_line_items(po_id);
CREATE INDEX IF NOT EXISTS idx_grn_lines_grn_id ON grn_line_items(grn_id);

CREATE INDEX IF NOT EXISTS idx_approvals_inv ON invoice_approvals(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_inv ON payment_requests(invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_logs(created_at DESC);
