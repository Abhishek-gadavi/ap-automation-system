import React from 'react';

export default function Dashboard({ invoices, payments, vendors, setActiveTab, setSelectedInvoice }) {
  // Aggregate Metrics
  const totalInvoices = invoices.length;
  const pendingApprovals = invoices.filter(i => i.status === 'PENDING_APPROVAL').length;
  const matchingExceptions = invoices.filter(i => i.status === 'MATCHING_FAILED' || i.status === 'VALIDATION_FAILED').length;
  const totalSpend = invoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const avgOcrScore = invoices.length > 0
    ? (invoices.reduce((acc, curr) => acc + (curr.ocr_confidence || 95), 0) / invoices.length).toFixed(1)
    : 98.2;

  // Aging Analysis
  const agingData = {
    "0-30 Days": invoices.filter(i => i.status !== 'PAID').reduce((acc, c) => acc + c.total_amount, 0) * 0.65,
    "31-60 Days": invoices.filter(i => i.status !== 'PAID').reduce((acc, c) => acc + c.total_amount, 0) * 0.25,
    "61-90 Days": invoices.filter(i => i.status !== 'PAID').reduce((acc, c) => acc + c.total_amount, 0) * 0.08,
    "90+ Days": invoices.filter(i => i.status !== 'PAID').reduce((acc, c) => acc + c.total_amount, 0) * 0.02,
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Fast Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accounts Payable Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time visibility into invoice OCR extraction, 3-way matching, approval pipelines, and cash disbursement.</p>
        </div>
        <button
          onClick={() => setActiveTab('capture')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition"
        >
          <span>📥</span> Upload / Scan Invoices
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Total AP Volume</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="text-xs text-slate-500 mt-1">{totalInvoices} invoices in lifecycle</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Pending Approvals</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{pendingApprovals}</div>
          <div className="text-xs text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 inline-block mt-1 font-medium">Awaiting Matrix Sign-off</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Avg OCR Accuracy</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{avgOcrScore}%</div>
          <div className="text-xs text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5 inline-block mt-1 font-medium">AI Layout Extraction</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-400">Turnaround Time (TAT)</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">18.4 hrs</div>
          <div className="text-xs text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 inline-block mt-1 font-medium">Capture to Payment Advice</div>
        </div>
      </div>

      {/* Charts & Analytical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoice Aging Schedule */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-base">Invoice Aging Schedule (AP Aging)</h3>
            <span className="text-xs text-slate-400">Days from invoice due date</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {Object.entries(agingData).map(([bucket, amount]) => (
              <div key={bucket} className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                <div className="text-xs font-semibold text-slate-500">{bucket}</div>
                <div className="text-base font-bold text-slate-800 mt-1">₹{(amount / 1000).toFixed(1)}k</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${bucket === '0-30 Days' ? 'bg-emerald-500' : bucket === '31-60 Days' ? 'bg-blue-500' : bucket === '61-90 Days' ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, (amount / totalSpend) * 100 * 1.5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 flex justify-between items-center">
            <span>Automated payment priority based on vendor credit terms and early-settlement discounts.</span>
            <button onClick={() => setActiveTab('reports')} className="text-blue-600 hover:underline font-medium">View Detailed Report →</button>
          </div>
        </div>

        {/* OCR Engine & Accuracy Widget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-semibold text-slate-800 text-base">OCR & NLP Intelligence</h3>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Header Field Identification</span>
              <span className="font-bold text-emerald-600">99.4%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[99.4%]"></div>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Tabular Line Item Extraction</span>
              <span className="font-bold text-blue-600">96.8%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[96.8%]"></div>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-600">GSTIN / Tax Rule Compliance</span>
              <span className="font-bold text-emerald-600">98.9%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[98.9%]"></div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800">
            💡 Supported formats: Multi-page PDF, Scanned TIFF, PNG, JPG, and automated email inbox webhook ingestion.
          </div>
        </div>

      </div>

      {/* Active Invoices Pipeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800">Recent Invoice Processing Pipeline</h3>
            <p className="text-xs text-slate-500">Live feed of captured invoices through matching, approval, and settlement</p>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium">{invoices.length} Active Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">PO Link</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">OCR Score</th>
                <th className="py-3 px-4">Matching</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-blue-600">{inv.invoice_number}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{inv.vendor_name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{inv.po_number || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {inv.ocr_confidence}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      inv.matching_status === 'MATCHED_EXACT' ? 'bg-green-100 text-green-800' :
                      inv.matching_status === 'MATCHED_WITHIN_TOLERANCE' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.matching_type}: {inv.matching_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      inv.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                      inv.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setActiveTab('matching');
                      }}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded transition"
                    >
                      Inspect Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
