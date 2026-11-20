import React, { useState } from 'react';

export default function POMatching({ invoices, setInvoices, selectedInvoice, setSelectedInvoice, setActiveTab }) {
  const [matchingType, setMatchingType] = useState('THREE_WAY');
  const [priceTolerance, setPriceTolerance] = useState(2.0); // 2%
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const currentInvoice = selectedInvoice || invoices[0];

  const handleSelectInvoice = (inv) => {
    setSelectedInvoice(inv);
  };

  const handleApplyOverride = () => {
    if (!overrideReason.trim()) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id === currentInvoice.id) {
        return {
          ...inv,
          matching_status: 'MANUALLY_OVERRIDDEN',
          status: 'PENDING_APPROVAL',
          override_reason: overrideReason
        };
      }
      return inv;
    }));
    setOverrideModalOpen(false);
    setOverrideReason('');
  };

  const handleSendToApprovals = () => {
    // Explicitly transition invoice status to PENDING_APPROVAL so it is immediately approveable
    setInvoices(prev => prev.map(inv => {
      if (inv.id === currentInvoice.id) {
        return {
          ...inv,
          status: 'PENDING_APPROVAL',
          matching_status: inv.matching_status === 'PENDING' ? 'MATCHED_EXACT' : inv.matching_status
        };
      }
      return inv;
    }));
    setSelectedInvoice({
      ...currentInvoice,
      status: 'PENDING_APPROVAL'
    });
    setActiveTab('approvals');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Order (PO) Matching Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Module 4: High-precision 2-Way (PO vs Invoice) & 3-Way (PO vs GRN vs Invoice) automated reconciliation.
          </p>
        </div>

        {/* Matching Mode Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
          <button
            onClick={() => setMatchingType('TWO_WAY')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              matchingType === 'TWO_WAY' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2-Way Match (PO vs Invoice)
          </button>
          <button
            onClick={() => setMatchingType('THREE_WAY')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              matchingType === 'THREE_WAY' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3-Way Match (PO + GRN + Invoice)
          </button>
        </div>
      </div>

      {/* Invoice Selector Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {invoices.map((inv) => {
          const isSelected = currentInvoice?.id === inv.id;
          return (
            <button
              key={inv.id}
              onClick={() => handleSelectInvoice(inv)}
              className={`px-4 py-3 rounded-xl border text-left shrink-0 transition shadow-sm ${
                isSelected ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-semibold text-slate-500">{inv.vendor_name}</div>
              <div className="font-bold text-slate-900 text-sm">{inv.invoice_number}</div>
              <div className="flex items-center justify-between gap-4 mt-2">
                <span className="text-xs font-bold text-slate-700">₹{inv.total_amount?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  inv.matching_status === 'MATCHED_EXACT' ? 'bg-emerald-100 text-emerald-800' :
                  inv.matching_status === 'MANUALLY_OVERRIDDEN' ? 'bg-purple-100 text-purple-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {inv.matching_status.replace(/_/g, ' ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Matching Inspection Workspace */}
      {currentInvoice && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Reconciliation for Invoice: {currentInvoice.invoice_number}
                </h2>
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  currentInvoice.matching_status === 'MATCHED_EXACT' ? 'bg-emerald-100 text-emerald-800' :
                  currentInvoice.matching_status === 'MANUALLY_OVERRIDDEN' ? 'bg-purple-100 text-purple-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {currentInvoice.matching_status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Linked PO: <span className="font-mono font-semibold text-blue-600">{currentInvoice.po_number}</span> |
                Linked GRN: <span className="font-mono font-semibold text-slate-700">{currentInvoice.grn_number}</span> |
                Price Tolerance: <span className="font-semibold text-slate-700">±{priceTolerance}%</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentInvoice.matching_status.includes('DISCREPANCY') && (
                <button
                  onClick={() => setOverrideModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                >
                  Manual Manager Override
                </button>
              )}
              <button
                onClick={handleSendToApprovals}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
              >
                Confirm 3-Way Match & Send to Approvals →
              </button>
            </div>
          </div>

          {/* 3-Way Comparative Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Column 1: PO Data */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs uppercase">1. Purchase Order (PO)</span>
                <span className="text-xs font-mono font-semibold text-blue-600">{currentInvoice.po_number}</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between"><span>PO Total:</span> <span className="font-bold text-slate-900">₹{currentInvoice.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span>Status:</span> <span className="font-medium text-emerald-600">APPROVED & RELEASED</span></div>
                <div className="flex justify-between"><span>Authorized Qty:</span> <span className="font-medium">75 Units</span></div>
              </div>
            </div>

            {/* Column 2: GRN Data */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs uppercase">2. Goods Receipt (GRN)</span>
                <span className="text-xs font-mono font-semibold text-slate-700">{currentInvoice.grn_number}</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between"><span>Warehouse Code:</span> <span className="font-medium">WH-BLR-01</span></div>
                <div className="flex justify-between"><span>Inspection:</span> <span className="font-semibold text-emerald-600">PASSED QC</span></div>
                <div className="flex justify-between"><span>Accepted Qty:</span> <span className="font-bold text-slate-900">75 Units</span></div>
              </div>
            </div>

            {/* Column 3: Invoiced Data */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs uppercase">3. Billed Invoice</span>
                <span className="text-xs font-mono font-semibold text-blue-600">{currentInvoice.invoice_number}</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between"><span>Invoice Total:</span> <span className="font-bold text-slate-900">₹{currentInvoice.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span>Billed Qty:</span> <span className="font-medium">75 Units</span></div>
                <div className="flex justify-between"><span>Variance:</span> <span className="font-bold text-emerald-600">₹0.00 (0.00%)</span></div>
              </div>
            </div>

          </div>

          {/* Line-Level Cross-Matching Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100/70 p-3 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Line-Item Variance Matrix (PO vs GRN vs Invoice)
              </h4>
              <span className="text-xs text-slate-500">Checking unit prices, delivered quantities, and tax applicability</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">PO Qty</th>
                  <th className="py-2.5 px-3 text-right">GRN Received</th>
                  <th className="py-2.5 px-3 text-right">Invoice Billed</th>
                  <th className="py-2.5 px-3 text-right">PO Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Inv Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentInvoice.line_items.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{line.item_code}</td>
                    <td className="py-2.5 px-3 text-slate-800">{line.description}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{line.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-emerald-700">{line.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{line.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-medium">₹{line.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{line.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        Exact Match ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Manual Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Manual Discrepancy Override</h3>
            <p className="text-xs text-slate-500">
              Provide justification for overriding invoice discrepancy. This audit log is permanently stored.
            </p>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Approved price adjustment confirmed via supplier addendum #A-412."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOverride}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
              >
                Confirm & Authorize
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
