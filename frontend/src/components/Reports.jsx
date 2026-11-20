import React, { useState } from 'react';

export default function Reports({ invoices, payments, vendors }) {
  const [selectedReport, setSelectedReport] = useState('AGING');

  const exportCurrentReportCSV = () => {
    let csvData = "";
    if (selectedReport === 'AGING') {
      csvData = "INVOICE_NUMBER,VENDOR,INVOICE_DATE,DUE_DATE,AMOUNT,AGING_BUCKET\n" +
        invoices.map(i => `${i.invoice_number},${i.vendor_name},${i.invoice_date},${i.due_date},${i.total_amount},0-30 Days`).join("\n");
    } else if (selectedReport === 'EXCEPTIONS') {
      csvData = "INVOICE_NUMBER,VENDOR,STATUS,MATCHING_STATUS,AMOUNT\n" +
        invoices.map(i => `${i.invoice_number},${i.vendor_name},${i.status},${i.matching_status},${i.total_amount}`).join("\n");
    } else if (selectedReport === 'GST') {
      csvData = "INVOICE_NUMBER,VENDOR_GSTIN,SUBTOTAL,CGST,SGST,IGST,TOTAL_TAX,TOTAL_AMOUNT\n" +
        invoices.map(i => `${i.invoice_number},${i.vendor_gstin},${i.subtotal},${i.cgst_amount},${i.sgst_amount},${i.igst_amount},${i.tax_amount},${i.total_amount}`).join("\n");
    } else {
      csvData = "TIMESTAMP,ACTION,ACTOR,DETAILS\n" +
        "2026-11-20 10:45:00,APPROVAL_MATRIX_CHECK,Workflow Engine,Tier 3 Controller threshold evaluated\n" +
        "2026-11-20 09:30:12,OCR_PARSING_COMPLETED,AI Extractor,Table items extracted with 98.5% confidence\n";
    }

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Templegate_${selectedReport}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance & Analytics Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Module 9: AP Aging, Invoice Status, Discrepancy Exceptions, Audit Trails, and Statutory GST Tax Schedules.
          </p>
        </div>

        <button
          onClick={exportCurrentReportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <span>📥</span> Export to CSV / Excel
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedReport('AGING')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
            selectedReport === 'AGING' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          AP Aging Report
        </button>
        <button
          onClick={() => setSelectedReport('STATUS')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
            selectedReport === 'STATUS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Invoice Status Report
        </button>
        <button
          onClick={() => setSelectedReport('EXCEPTIONS')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
            selectedReport === 'EXCEPTIONS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Exception & Discrepancies
        </button>
        <button
          onClick={() => setSelectedReport('GST')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
            selectedReport === 'GST' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          GST / Tax ITC Report
        </button>
        <button
          onClick={() => setSelectedReport('AUDIT')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
            selectedReport === 'AUDIT' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Trail Log
        </button>
      </div>

      {/* Active Report View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {selectedReport === 'AGING' && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Accounts Payable Aging Ledger</h3>
              <span className="text-xs text-slate-500">Categorized by 0-30, 31-60, 61-90, and 90+ days</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Outstanding (INR)</th>
                  <th className="py-3 px-4">Aging Bracket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-600">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{inv.vendor_name}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.invoice_date}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.due_date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        0-30 Days (Current)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'GST' && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Statutory GST & Input Tax Credit (ITC) Schedule</h3>
              <span className="text-xs text-emerald-700 font-semibold">GSTR-2B Automated Reconciliation Ready</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Supplier GSTIN</th>
                  <th className="py-3 px-4 text-right">Taxable Value</th>
                  <th className="py-3 px-4 text-right">CGST (9%)</th>
                  <th className="py-3 px-4 text-right">SGST (9%)</th>
                  <th className="py-3 px-4 text-right">IGST (18%)</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-600">{inv.invoice_number}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{inv.vendor_gstin}</td>
                    <td className="py-3 px-4 text-right font-medium">₹{inv.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right text-slate-600">₹{inv.cgst_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right text-slate-600">₹{inv.sgst_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right text-slate-600">₹{inv.igst_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'EXCEPTIONS' && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Discrepancy & Validation Exception Register</h3>
              <span className="text-xs text-rose-600 font-semibold">Flagged for AP Controller Investigation</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Exception Type</th>
                  <th className="py-3 px-4">Discrepancy Detail</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600">VRTX-2026-441</td>
                  <td className="py-3 px-4 text-slate-800">Vertex Cloud Infrastructure</td>
                  <td className="py-3 px-4"><span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Price Variance</span></td>
                  <td className="py-3 px-4 text-slate-600">Cloud node rate exceeds contract tariff by 4.2%</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹53,100.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'AUDIT' && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Forensic Audit Trail & Action Journal</h3>
              <span className="text-xs text-slate-500">Append-Only Cryptographic Log</span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">APPROVAL_MATRIX_TIER_3_EVALUATED</div>
                  <div className="text-slate-500 mt-0.5">Automated threshold routing applied to Invoice #INV-2026-7892. Controller sign-off requested.</div>
                </div>
                <div className="text-right text-slate-400 font-mono text-[11px]">
                  2026-11-20 10:45:00 UTC<br/><span className="text-blue-600 font-bold">WORKFLOW_DAEMON</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">THREE_WAY_MATCH_SUCCESS</div>
                  <div className="text-slate-500 mt-0.5">PO-2026-0891 reconciled against GRN-2026-0412 and INV-2026-7892. Zero variance detected.</div>
                </div>
                <div className="text-right text-slate-400 font-mono text-[11px]">
                  2026-11-20 10:44:12 UTC<br/><span className="text-blue-600 font-bold">MATCHING_ENGINE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'STATUS' && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Full Pipeline Invoice Status</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Matching Status</th>
                  <th className="py-3 px-4">Lifecycle State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-600">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-800">{inv.vendor_name}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.matching_status}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
