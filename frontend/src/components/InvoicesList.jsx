import React, { useState } from 'react';

export default function InvoicesList({ invoices, setActiveTab, setSelectedInvoice }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inv.po_number && inv.po_number.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoice Master Repository</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete database ledger of all ingested invoices across OCR extraction, matching, approval, and settlement.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('capture')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <span>📥</span> Upload New Invoice
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search invoice #, vendor, PO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING_MATCHING', 'PENDING_APPROVAL', 'APPROVED', 'MATCHING_FAILED', 'PAID'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Vendor</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">PO Link</th>
              <th className="py-3 px-4 text-right">Amount (INR)</th>
              <th className="py-3 px-4 text-center">OCR Score</th>
              <th className="py-3 px-4 text-center">Lifecycle Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-blue-600">{inv.invoice_number}</td>
                <td className="py-3.5 px-4 font-medium text-slate-900">{inv.vendor_name}</td>
                <td className="py-3.5 px-4 text-slate-600">{inv.invoice_date}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{inv.po_number || 'N/A'}</td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                  ₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    {inv.ocr_confidence}%
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    inv.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    inv.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                    inv.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {inv.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setActiveTab('matching');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Match PO
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setActiveTab('approvals');
                    }}
                    className="text-xs text-slate-700 hover:text-slate-900 font-semibold"
                  >
                    Approvals
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
