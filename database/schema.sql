-- ============================================================================
-- Accounts Payable (AP) Automation Software - Database Schema
-- Target RDBMS: PostgreSQL 14+
-- Author: Abhishek Gadavi
-- Submission for: Templegate Technologies & Services Pvt. Ltd.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
CREATE TYPE invoice_status_enum AS ENUM (
    'DRAFT',
    'UPLOADED',
    'PROCESSING_OCR',
    'EXTRACTED',
    'VALIDATION_FAILED',
    'PENDING_MATCHING',
    'MATCHING_FAILED',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'PAYMENT_SCHEDULED',
    'PAID',
    'CANCELLED'
);

CREATE TYPE matching_type_enum AS ENUM (
    'TWO_WAY',
    'THREE_WAY'
);

CREATE TYPE match_status_enum AS ENUM (
    'PENDING',
    'MATCHED_EXACT',
    'MATCHED_WITHIN_TOLERANCE',
    'DISCREPANCY_PRICE',
    'DISCREPANCY_QTY',
    'DISCREPANCY_TOTAL',
    'MANUALLY_OVERRIDDEN'
);

CREATE TYPE approval_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'ESCALATED',
    'CLARIFICATION_REQUESTED'
);

CREATE TYPE payment_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED',
    'CANCELLED'
);

CREATE TYPE vendor_status_enum AS ENUM (
    'PENDING_ONBOARDING',
    'UNDER_REVIEW',
    'ACTIVE',
    'SUSPENDED',
    'REJECTED'
);

-- ----------------------------------------------------------------------------
-- 2. VENDORS & BANKING
-- ----------------------------------------------------------------------------
CREATE TABLE vendors (
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

CREATE TABLE vendor_bank_details (
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
-- 3. PURCHASE ORDERS & GOODS RECEIPT NOTES (GRN)
-- ----------------------------------------------------------------------------
CREATE TABLE purchase_orders (
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

CREATE TABLE po_line_items (
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

CREATE TABLE goods_receipt_notes (
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

CREATE TABLE grn_line_items (
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
-- 4. INVOICES & OCR EXTRACTION
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
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

CREATE TABLE invoice_line_items (
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

-- ----------------------------------------------------------------------------
-- 5. MATCHING RESULTS & DISCREPANCY LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE matching_results (
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
-- 6. APPROVAL MATRIX & WORKFLOWS
-- ----------------------------------------------------------------------------
CREATE TABLE approval_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_level INTEGER NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    min_amount NUMERIC(15, 2) NOT NULL,
    max_amount NUMERIC(15, 2) NOT NULL,
    requires_parallel_approval BOOLEAN DEFAULT FALSE,
    sla_hours INTEGER DEFAULT 48,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE invoice_approvals (
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

-- ----------------------------------------------------------------------------
-- 7. PAYMENT PROCESSING & ADVICE
-- ----------------------------------------------------------------------------
CREATE TABLE payment_requests (
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

-- ----------------------------------------------------------------------------
-- 8. AUDIT LOGGING & COMPLIANCE
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
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
-- 9. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_matching_status ON invoices(matching_status);
CREATE INDEX idx_invoices_unique_vendor_inv ON invoices(vendor_id, invoice_number);

CREATE INDEX idx_invoice_lines_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_po_lines_po_id ON po_line_items(po_id);
CREATE INDEX idx_grn_lines_grn_id ON grn_line_items(grn_id);

CREATE INDEX idx_approvals_invoice_id ON invoice_approvals(invoice_id);
CREATE INDEX idx_approvals_status ON invoice_approvals(status);

CREATE INDEX idx_payments_invoice_id ON payment_requests(invoice_id);
CREATE INDEX idx_payments_status ON payment_requests(status);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 10. TRIGGER FOR AUTO-UPDATING TIMESTAMPS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
