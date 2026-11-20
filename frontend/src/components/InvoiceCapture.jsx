import React, { useState } from 'react';

export default function InvoiceCapture({ invoices, setInvoices, setActiveTab, setSelectedInvoice }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeExtractedInvoice, setActiveExtractedInvoice] = useState(invoices[0] || null);
  const [emailSubject, setEmailSubject] = useState('Tax Invoice #INV-2026-9921 from Acme Corp');

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file) => {
    setSelectedFile(file);
    setIsProcessing(true);

    setTimeout(() => {
      const ext = file.name.split('.').pop().toUpperCase();
      const newInvoice = {
        id: `inv-${Date.now()}`,
        invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor_name: file.name.toLowerCase().includes('apex') ? 'Apex Logistics & Transport Co' : 'Acme Industrial Solutions Ltd',
        vendor_gstin: file.name.toLowerCase().includes('apex') ? '27BBACB5678G2Z6' : '29AABCA1234F1Z5',
        po_number: 'PO-2026-0891',
        grn_number: 'GRN-2026-0412',
        file_name: file.name,
        file_format: ext,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        subtotal: 150000.0,
        tax_amount: 27000.0,
        cgst_amount: 13500.0,
        sgst_amount: 13500.0,
        igst_amount: 0.0,
        total_amount: 177000.0,
        ocr_confidence: 98.6,
        page_count: ext === 'PDF' ? 2 : 1,
        matching_type: 'THREE_WAY',
        matching_status: 'MATCHED_EXACT',
        status: 'PENDING_MATCHING',
        validation_errors: [],
        line_items: [
          { id: `l-${Date.now()}-1`, line_number: 1, item_code: 'ITM-SRV-01', description: 'High-Precision CNC Machined Cylinders', quantity: 50, unit_price: 2000.0, tax_rate: 18, total_price: 118000.0, confidence_score: 99.1 },
          { id: `l-${Date.now()}-2`, line_number: 2, item_code: 'ITM-SRV-02', description: 'High-Tensile Industrial Fasteners (Box of 500)', quantity: 25, unit_price: 2000.0, tax_rate: 18, total_price: 59000.0, confidence_score: 98.0 }
        ],
        approvals: [
          { id: `app-${Date.now()}`, tier: 3, role: 'Finance Controller', approver_email: 'controller@templegate.example.com', status: 'PENDING', sla_hours: 48, comments: 'Awaiting Controller Review' }
        ]
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setActiveExtractedInvoice(newInvoice);
      setSelectedInvoice(newInvoice);
      setIsProcessing(false);
    }, 1200);
  };

  const handleSimulatedEmailIngest = () => {
    const mockEmailFile = new File(["simulated invoice buffer"], "Acme_Invoice_AutoIngest.pdf", { type: "application/pdf" });
    processUploadedFile(mockEmailFile);
  };

  const handleBulkUploadDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const f1 = new File(["b1"], "Acme_Batch_Nov_01.pdf", { type: "application/pdf" });
      const f2 = new File(["b2"], "Apex_Logistics_Nov_02.png", { type: "image/png" });
      processUploadedFile(f1);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoice Capture & OCR Extraction Engine</h1>
        <p className="text-sm text-slate-500 mt-1">
          Module 1 & 2: Ingest multi-format documents (PDF, JPG, PNG, TIFF) via drag-and-drop, email automation, or bulk upload with AI table parsing.
        </p>
      </div>

      {/* Ingestion Channels Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Drag & Drop Card */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.tiff"
            onChange={handleFileInput}
          />
          <label htmlFor="fileInput" className="cursor-pointer space-y-2">
            <span className="text-3xl block">📄</span>
            <div className="font-semibold text-slate-800 text-sm">Drag & Drop Invoices Here</div>
            <div className="text-xs text-slate-400">PDF, JPG, PNG, TIFF (Single or Multi-Page)</div>
            <span className="inline-block mt-2 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded">
              Browse Files
            </span>
          </label>
        </div>

        {/* Bulk Ingestion */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h3 className="font-bold text-slate-800 text-sm">Bulk Ingestion Pipeline</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Queue batch processing of invoices. Automatically spawns parallel OCR workers with layout detection.
            </p>
          </div>
          <button
            onClick={handleBulkUploadDemo}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg transition"
          >
            Trigger Bulk Ingestion (Batch)
          </button>
        </div>

        {/* Email Ingestion Webhook */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✉️</span>
              <h3 className="font-bold text-slate-800 text-sm">Automated Email Ingestion</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Simulate webhook receiving from <code>invoices@templegate.example.com</code> with automated attachment parsing.
            </p>
          </div>
          <button
            onClick={handleSimulatedEmailIngest}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition"
          >
            Simulate Email Webhook
          </button>
        </div>

      </div>

      {isProcessing && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-blue-900">
            OCR & NLP Engine is processing document layout, extracting GSTIN, and parsing tabular items...
          </span>
        </div>
      )}

      {/* Extracted Invoice Review Workspace */}
      {activeExtractedInvoice && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Extracted Invoice: {activeExtractedInvoice.invoice_number}
                </h2>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  OCR Confidence: {activeExtractedInvoice.ocr_confidence}%
                </span>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  Format: {activeExtractedInvoice.file_format} ({activeExtractedInvoice.page_count} Pages)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Source Document: <span className="font-mono text-slate-700">{activeExtractedInvoice.file_name}</span>
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedInvoice(activeExtractedInvoice);
                setActiveTab('matching');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              Proceed to PO Matching →
            </button>
          </div>

          {/* Validation Engine Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Module 3: Invoice Validation Engine (5-Point Audit)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <div className="font-semibold text-slate-700">Mandatory Fields</div>
                  <div className="text-slate-400">All present</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <div className="font-semibold text-slate-700">Duplicate Check</div>
                  <div className="text-slate-400">Unique (Passed)</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <div className="font-semibold text-slate-700">GST / Tax Rules</div>
                  <div className="text-slate-400">Valid 15-char code</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <div className="font-semibold text-slate-700">Amount Math</div>
                  <div className="text-slate-400">Subtotal + Tax = Total</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <div className="font-semibold text-slate-700">Vendor Master</div>
                  <div className="text-slate-400">Active & Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-slate-200 p-3 rounded-lg">
              <label className="text-xs font-semibold text-slate-400">Vendor Name</label>
              <div className="text-sm font-bold text-slate-800 mt-1">{activeExtractedInvoice.vendor_name}</div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">GSTIN: {activeExtractedInvoice.vendor_gstin}</div>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg">
              <label className="text-xs font-semibold text-slate-400">PO Reference</label>
              <div className="text-sm font-bold text-blue-600 mt-1">{activeExtractedInvoice.po_number || 'Not Linked'}</div>
              <div className="text-xs text-slate-500 mt-0.5">GRN: {activeExtractedInvoice.grn_number || 'N/A'}</div>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg">
              <label className="text-xs font-semibold text-slate-400">Invoice Dates</label>
              <div className="text-sm font-semibold text-slate-800 mt-1">Date: {activeExtractedInvoice.invoice_date}</div>
              <div className="text-xs text-slate-500 mt-0.5">Due: {activeExtractedInvoice.due_date}</div>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-blue-50/50">
              <label className="text-xs font-semibold text-blue-600">Total Invoice Amount</label>
              <div className="text-lg font-bold text-slate-900 mt-1">
                ₹{activeExtractedInvoice.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500">Tax: ₹{activeExtractedInvoice.tax_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Tabular Line-Item Extraction Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100/70 p-3 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Extracted Line Items (Materials & Services)
              </h4>
              <span className="text-xs text-slate-500">OCR AI confidence per cell</span>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Tax Rate</th>
                  <th className="py-2.5 px-3 text-right">Total Price</th>
                  <th className="py-2.5 px-3 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeExtractedInvoice.line_items.map((line, idx) => (
                  <tr key={line.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-500">{line.line_number}</td>
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-700">{line.item_code}</td>
                    <td className="py-2.5 px-3 text-slate-800">{line.description}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{line.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-medium">₹{line.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{line.tax_rate}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{line.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded font-semibold border border-emerald-200">
                        {line.confidence_score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
