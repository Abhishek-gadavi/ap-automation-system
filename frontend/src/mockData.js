export const initialVendors = [
  {
    id: "v1",
    vendor_code: "VEND-001",
    name: "Acme Industrial Solutions Ltd",
    email: "billing@acmeindustrial.com",
    phone: "+91 9876543210",
    city: "Bengaluru",
    state: "Karnataka",
    gstin: "29AABCA1234F1Z5",
    pan_number: "AABCA1234F",
    msme_registered: true,
    payment_terms_days: 30,
    status: "ACTIVE",
    bank: {
      bank_name: "HDFC Bank",
      account_number: "50200012345678",
      ifsc_code: "HDFC0000123",
      is_verified: true
    }
  },
  {
    id: "v2",
    vendor_code: "VEND-002",
    name: "Apex Logistics & Transport Co",
    email: "accounts@apexlogistics.in",
    phone: "+91 9876543211",
    city: "Mumbai",
    state: "Maharashtra",
    gstin: "27BBACB5678G2Z6",
    pan_number: "BBACB5678G",
    msme_registered: false,
    payment_terms_days: 45,
    status: "ACTIVE",
    bank: {
      bank_name: "State Bank of India",
      account_number: "309988776655",
      ifsc_code: "SBIN0004567",
      is_verified: true
    }
  },
  {
    id: "v3",
    vendor_code: "VEND-003",
    name: "Vertex Cloud Infrastructure",
    email: "invoicing@vertexcloud.io",
    phone: "+91 9876543212",
    city: "Gurugram",
    state: "Haryana",
    gstin: "06CCACC9012H3Z7",
    pan_number: "CCACC9012H",
    msme_registered: false,
    payment_terms_days: 15,
    status: "ACTIVE",
    bank: {
      bank_name: "ICICI Bank",
      account_number: "000105009988",
      ifsc_code: "ICIC0000001",
      is_verified: true
    }
  },
  {
    id: "v4",
    vendor_code: "VEND-004",
    name: "Sigma Raw Materials Corp",
    email: "sales@sigmamaterials.com",
    phone: "+91 9876543213",
    city: "Vadodara",
    state: "Gujarat",
    gstin: "24DDADD3456I4Z8",
    pan_number: "DDADD3456I",
    msme_registered: true,
    payment_terms_days: 30,
    status: "PENDING_ONBOARDING",
    bank: {
      bank_name: "Bank of Baroda",
      account_number: "98760100004455",
      ifsc_code: "BARB0VADODA",
      is_verified: false
    }
  }
];

export const initialPOs = [
  {
    id: "po1",
    po_number: "PO-2026-0891",
    vendor_name: "Acme Industrial Solutions Ltd",
    po_date: "2026-11-01",
    total_amount: 177000.0,
    status: "OPEN",
    items: [
      { item_code: "ITM-SRV-01", description: "High-Precision CNC Machined Cylinders", quantity: 50, unit_price: 2000.0, tax_rate: 18, total: 118000.0 },
      { item_code: "ITM-SRV-02", description: "High-Tensile Industrial Fasteners (Box of 500)", quantity: 25, unit_price: 2000.0, tax_rate: 18, total: 59000.0 }
    ]
  },
  {
    id: "po2",
    po_number: "PO-2026-0904",
    vendor_name: "Apex Logistics & Transport Co",
    po_date: "2026-11-05",
    total_amount: 100300.0,
    status: "OPEN",
    items: [
      { item_code: "LOG-FTL-01", description: "Full Truck Load Freight Transport - BLR to BOM", quantity: 2, unit_price: 42500.0, tax_rate: 18, total: 100300.0 }
    ]
  }
];

export const initialGRNs = [
  {
    id: "grn1",
    grn_number: "GRN-2026-0412",
    po_number: "PO-2026-0891",
    received_date: "2026-11-14",
    received_by: "Ramesh Kumar (Warehouse Mgr)",
    warehouse: "WH-BLR-01",
    items: [
      { item_code: "ITM-SRV-01", quantity_received: 50, quantity_accepted: 50, quantity_rejected: 0 },
      { item_code: "ITM-SRV-02", quantity_received: 25, quantity_accepted: 25, quantity_rejected: 0 }
    ]
  }
];

export const initialInvoices = [
  {
    id: "inv-1",
    invoice_number: "INV-2026-7892",
    vendor_name: "Acme Industrial Solutions Ltd",
    vendor_gstin: "29AABCA1234F1Z5",
    po_number: "PO-2026-0891",
    grn_number: "GRN-2026-0412",
    file_name: "INV-2026-7892.pdf",
    file_format: "PDF",
    invoice_date: "2026-11-15",
    due_date: "2026-12-15",
    subtotal: 150000.0,
    tax_amount: 27000.0,
    cgst_amount: 13500.0,
    sgst_amount: 13500.0,
    igst_amount: 0.0,
    total_amount: 177000.0,
    ocr_confidence: 98.5,
    page_count: 1,
    matching_type: "THREE_WAY",
    matching_status: "MATCHED_EXACT",
    status: "PENDING_APPROVAL",
    validation_errors: [],
    line_items: [
      { id: "l1", line_number: 1, item_code: "ITM-SRV-01", description: "High-Precision CNC Machined Cylinders", quantity: 50, unit_price: 2000.0, tax_rate: 18, total_price: 118000.0, confidence_score: 99.2 },
      { id: "l2", line_number: 2, item_code: "ITM-SRV-02", description: "High-Tensile Industrial Fasteners (Box of 500)", quantity: 25, unit_price: 2000.0, tax_rate: 18, total_price: 59000.0, confidence_score: 97.8 }
    ],
    approvals: [
      { id: "app1", tier: 3, role: "Finance Controller", approver_email: "controller@templegate.example.com", status: "PENDING", sla_hours: 48, comments: "Awaiting final controller authorization." }
    ]
  },
  {
    id: "inv-2",
    invoice_number: "APEX-2611-09",
    vendor_name: "Apex Logistics & Transport Co",
    vendor_gstin: "27BBACB5678G2Z6",
    po_number: "PO-2026-0904",
    grn_number: "N/A",
    file_name: "APEX_Freight_0904.png",
    file_format: "PNG",
    invoice_date: "2026-11-12",
    due_date: "2026-12-27",
    subtotal: 85000.0,
    tax_amount: 15300.0,
    cgst_amount: 0.0,
    sgst_amount: 0.0,
    igst_amount: 15300.0,
    total_amount: 100300.0,
    ocr_confidence: 99.1,
    page_count: 1,
    matching_type: "TWO_WAY",
    matching_status: "MATCHED_EXACT",
    status: "APPROVED",
    validation_errors: [],
    line_items: [
      { id: "l3", line_number: 1, item_code: "LOG-FTL-01", description: "Full Truck Load Freight Transport - BLR to BOM", quantity: 2, unit_price: 42500.0, tax_rate: 18, total_price: 100300.0, confidence_score: 99.1 }
    ],
    approvals: [
      { id: "app2", tier: 2, role: "Finance Team Lead", approver_email: "teamlead@templegate.example.com", status: "APPROVED", sla_hours: 24, comments: "Freight validated against dispatch docket." }
    ]
  },
  {
    id: "inv-3",
    invoice_number: "VRTX-2026-441",
    vendor_name: "Vertex Cloud Infrastructure",
    vendor_gstin: "06CCACC9012H3Z7",
    po_number: "PO-2026-0915",
    grn_number: "N/A",
    file_name: "Cloud_Monthly_Invoice.pdf",
    file_format: "PDF",
    invoice_date: "2026-11-18",
    due_date: "2026-12-03",
    subtotal: 45000.0,
    tax_amount: 8100.0,
    cgst_amount: 0.0,
    sgst_amount: 0.0,
    igst_amount: 8100.0,
    total_amount: 53100.0,
    ocr_confidence: 96.4,
    page_count: 2,
    matching_type: "TWO_WAY",
    matching_status: "DISCREPANCY_PRICE",
    status: "MATCHING_FAILED",
    validation_errors: [],
    line_items: [
      { id: "l4", line_number: 1, item_code: "CLD-K8S-01", description: "Managed Production Kubernetes Cluster Nodes", quantity: 1, unit_price: 45000.0, tax_rate: 18, total_price: 53100.0, confidence_score: 96.4 }
    ],
    approvals: []
  }
];

export const initialPayments = [
  {
    id: "pay-1",
    payment_reference: "PAY-20261105-X9810",
    invoice_number: "INV-APEX-1049",
    vendor_name: "Apex Logistics & Transport Co",
    bank_name: "State Bank of India",
    account_number: "309988776655",
    ifsc_code: "SBIN0004567",
    payment_method: "NEFT",
    amount: 50150.0,
    scheduled_date: "2026-11-05",
    processed_date: "2026-11-05 14:32:00",
    utr_number: "CMS2611050912X45P",
    status: "PAID"
  }
];

export const approvalMatrixRules = [
  { tier: 1, role: "AP Clerk / Reviewer", min: 0, max: 25000, sla: 24, parallel: false },
  { tier: 2, role: "Finance Team Lead", min: 25001, max: 100000, sla: 24, parallel: false },
  { tier: 3, role: "Finance Controller", min: 100001, max: 500000, sla: 48, parallel: false },
  { tier: 4, role: "Chief Financial Officer (CFO)", min: 500001, max: 10000000, sla: 72, parallel: true }
];
