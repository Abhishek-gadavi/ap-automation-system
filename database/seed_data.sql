-- ============================================================================
-- Seed Data for AP Automation System
-- Author: Abhishek Gadavi
-- ============================================================================

INSERT INTO vendors (id, vendor_code, name, email, phone, address_line1, city, state, postal_code, gstin, pan_number, msme_registered, payment_terms_days, status)
VALUES
('a1111111-1111-1111-1111-111111111111', 'VEND-001', 'Acme Industrial Solutions Ltd', 'billing@acmeindustrial.com', '+91 9876543210', 'Plot 42, Electronic City Phase 1', 'Bengaluru', 'Karnataka', '560100', '29AABCA1234F1Z5', 'AABCA1234F', TRUE, 30, 'ACTIVE'),
('a2222222-2222-2222-2222-222222222222', 'VEND-002', 'Apex Logistics & Transport Co', 'accounts@apexlogistics.in', '+91 9876543211', '12 Harbour Road, Ballard Estate', 'Mumbai', 'Maharashtra', '400001', '27BBACB5678G2Z6', 'BBACB5678G', FALSE, 45, 'ACTIVE'),
('a3333333-3333-3333-3333-333333333333', 'VEND-003', 'Vertex Cloud Infrastructure', 'invoicing@vertexcloud.io', '+91 9876543212', 'DLF Cyber City, Tower B', 'Gurugram', 'Haryana', '122002', '06CCACC9012H3Z7', 'CCACC9012H', FALSE, 15, 'ACTIVE'),
('a4444444-4444-4444-4444-444444444444', 'VEND-004', 'Sigma Raw Materials Corp', 'sales@sigmamaterials.com', '+91 9876543213', 'GIDC Industrial Estate', 'Vadodara', 'Gujarat', '390010', '24DDADD3456I4Z8', 'DDADD3456I', TRUE, 30, 'PENDING_ONBOARDING');

INSERT INTO vendor_bank_details (vendor_id, bank_name, account_number, ifsc_code, branch_name, is_primary, is_verified, verified_at)
VALUES
('a1111111-1111-1111-1111-111111111111', 'HDFC Bank', '50200012345678', 'HDFC0000123', 'Koramangala Bengaluru', TRUE, TRUE, CURRENT_TIMESTAMP),
('a2222222-2222-2222-2222-222222222222', 'State Bank of India', '309988776655', 'SBIN0004567', 'Fort Mumbai', TRUE, TRUE, CURRENT_TIMESTAMP),
('a3333333-3333-3333-3333-333333333333', 'ICICI Bank', '000105009988', 'ICIC0000001', 'Cyber City Gurugram', TRUE, TRUE, CURRENT_TIMESTAMP);

INSERT INTO purchase_orders (id, po_number, vendor_id, po_date, delivery_date, currency, subtotal, tax_amount, total_amount, status)
VALUES
('b1111111-1111-1111-1111-111111111111', 'PO-2026-0891', 'a1111111-1111-1111-1111-111111111111', '2026-11-01', '2026-11-15', 'INR', 150000.00, 27000.00, 177000.00, 'OPEN'),
('b2222222-2222-2222-2222-222222222222', 'PO-2026-0904', 'a2222222-2222-2222-2222-222222222222', '2026-11-05', '2026-11-18', 'INR', 85000.00, 15300.00, 100300.00, 'OPEN'),
('b3333333-3333-3333-3333-333333333333', 'PO-2026-0915', 'a3333333-3333-3333-3333-333333333333', '2026-11-10', '2026-11-20', 'INR', 45000.00, 8100.00, 53100.00, 'OPEN');

INSERT INTO po_line_items (po_id, item_code, description, quantity, unit_of_measure, unit_price, tax_rate, tax_amount, total_price)
VALUES
('b1111111-1111-1111-1111-111111111111', 'ITM-SRV-01', 'High-Precision CNC Machined Cylinders', 50.000, 'NOS', 2000.00, 18.00, 18000.00, 118000.00),
('b1111111-1111-1111-1111-111111111111', 'ITM-SRV-02', 'High-Tensile Industrial Fasteners (Box of 500)', 25.000, 'BOX', 2000.00, 18.00, 9000.00, 59000.00);

INSERT INTO goods_receipt_notes (id, grn_number, po_id, vendor_id, received_date, received_by, warehouse_code, notes)
VALUES
('c1111111-1111-1111-1111-111111111111', 'GRN-2026-0412', 'b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '2026-11-14', 'Ramesh Kumar (Warehouse Mgr)', 'WH-BLR-01', 'All packages received in good order. QC Passed.');

INSERT INTO grn_line_items (grn_id, item_code, quantity_received, quantity_accepted, quantity_rejected)
VALUES
('c1111111-1111-1111-1111-111111111111', 'ITM-SRV-01', 50.000, 50.000, 0.000),
('c1111111-1111-1111-1111-111111111111', 'ITM-SRV-02', 25.000, 25.000, 0.000);

INSERT INTO approval_matrix (tier_level, role_name, min_amount, max_amount, requires_parallel_approval, sla_hours)
VALUES
(1, 'AP Clerk / Reviewer', 0.00, 25000.00, FALSE, 24),
(2, 'Finance Team Lead', 25000.01, 100000.00, FALSE, 24),
(3, 'Finance Controller', 100000.01, 500000.00, FALSE, 48),
(4, 'Chief Financial Officer (CFO)', 500000.01, 99999999.99, TRUE, 72);

INSERT INTO invoices (
    id, invoice_number, vendor_id, po_id, grn_id, file_path, file_name, file_format, file_size_bytes, page_count,
    invoice_date, due_date, currency, subtotal, tax_amount, cgst_amount, sgst_amount, igst_amount, total_amount,
    ocr_confidence, matching_type, matching_status, status
) VALUES
('d1111111-1111-1111-1111-111111111111', 'INV-2026-7892', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111',
'/uploads/invoices/2026/11/INV-2026-7892.pdf', 'INV-2026-7892.pdf', 'PDF', 245100, 1,
'2026-11-15', '2026-12-15', 'INR', 150000.00, 27000.00, 13500.00, 13500.00, 0.00, 177000.00,
98.50, 'THREE_WAY', 'MATCHED_EXACT', 'PENDING_APPROVAL');

INSERT INTO invoice_line_items (invoice_id, line_number, item_code, description, hsn_sac_code, quantity, unit_price, tax_rate, tax_amount, total_price, confidence_score)
VALUES
('d1111111-1111-1111-1111-111111111111', 1, 'ITM-SRV-01', 'High-Precision CNC Machined Cylinders', '8412', 50.000, 2000.00, 18.00, 18000.00, 118000.00, 99.2),
('d1111111-1111-1111-1111-111111111111', 2, 'ITM-SRV-02', 'High-Tensile Industrial Fasteners (Box of 500)', '7318', 25.000, 2000.00, 18.00, 9000.00, 59000.00, 97.8);

INSERT INTO invoice_approvals (invoice_id, tier_level, approver_role, approver_email, status, comments)
VALUES
('d1111111-1111-1111-1111-111111111111', 3, 'Finance Controller', 'controller@templegate.example.com', 'PENDING', 'Awaiting Controller sign-off for payment scheduling.');
