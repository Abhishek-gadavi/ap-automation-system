import React, { useState } from 'react';

export default function PaymentProcessing({ invoices, payments, setPayments, setInvoices }) {
  const [selectedPaymentAdvice, setSelectedPaymentAdvice] = useState(null);

  // Eligible invoices for payment creation (Approved but not yet scheduled/paid)
  const approvedInvoices = invoices.filter(i => i.status === 'APPROVED');

  const handleSchedulePayment = (invoice) => {
    const newPayment = {
      id: `pay-${Date.now()}`,
      payment_reference: `PAY-202611-${Math.floor(1000 + Math.random() * 9000)}`,
      invoice_number: invoice.invoice_number,
      vendor_name: invoice.vendor_name,
      bank_name: 'HDFC Bank',
      account_number: '50200012345678',
      ifsc_code: 'HDFC0000123',
      payment_method: 'NEFT',
      amount: invoice.total_amount,
      scheduled_date: new Date().toISOString().split('T')[0],
      processed_date: null,
      utr_number: null,
      status: 'PENDING'
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update invoice state
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoice.id) {
        return { ...inv, status: 'PAYMENT_SCHEDULED' };
      }
      return inv;
    }));
  };

  const handleExecuteSettlement = (paymentId) => {
    const utr = `CMS2611${Math.floor(10000000 + Math.random() * 90000000)}P`;
    const nowStr = new Date().toLocaleString();

    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'PAID',
          utr_number: utr,
          processed_date: nowStr
        };
      }
      return p;
    }));

    // Find invoice and mark paid
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      setInvoices(prev => prev.map(inv => {
        if (inv.invoice_number === payment.invoice_number) {
          return { ...inv, status: 'PAID' };
        }
        return inv;
      }));
    }
  };

  const handleDownloadBatchCMS = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "PAYMENT_REF,BENEFICIARY,IFSC,ACCOUNT_NO,AMOUNT,CURRENCY,PAY_MODE\n"
      + payments.map(p => `${p.payment_reference},${p.vendor_name},${p.ifsc_code},${p.account_number},${p.amount},INR,${p.payment_method}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Templegate_Bank_CMS_Batch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Processing & Remittance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Module 7: Automated payment request generation, ERP banking integration (NEFT/RTGS CMS), status tracking, and remittance advice.
          </p>
        </div>

        <button
          onClick={handleDownloadBatchCMS}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition"
        >
          <span>📁</span> Export Bank Batch (CMS / ACH)
        </button>
      </div>

      {/* Invoices Eligible for Payment Scheduling */}
      {approvedInvoices.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-amber-900 text-sm">
              Approved Invoices Ready for Payment Scheduling ({approvedInvoices.length})
            </h3>
            <span className="text-xs text-amber-700 font-semibold">Fully authorized by Approval Matrix</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {approvedInvoices.map((inv) => (
              <div key={inv.id} className="bg-white border border-amber-200 p-3.5 rounded-lg flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{inv.invoice_number}</div>
                  <div className="text-xs text-slate-500">{inv.vendor_name}</div>
                  <div className="text-xs font-semibold text-blue-600 mt-1">
                    ₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <button
                  onClick={() => handleSchedulePayment(inv)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Schedule NEFT
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Disbursement Register</h3>
          <span className="text-xs text-slate-500">{payments.length} Transaction Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Payment Ref</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor & Bank</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Disbursed Amount</th>
                <th className="py-3 px-4">UTR Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.payment_reference}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-600">{p.invoice_number}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{p.vendor_name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{p.bank_name} • {p.account_number?.slice(-4)}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-600">{p.payment_method}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{p.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {p.utr_number || <span className="text-amber-600 font-medium italic">Pending Bank Exec</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {p.status === 'PENDING' ? (
                      <button
                        onClick={() => handleExecuteSettlement(p.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded transition text-[11px]"
                      >
                        Execute Transfer
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPaymentAdvice(p)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded transition text-[11px]"
                      >
                        View Advice 📄
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Advice Modal */}
      {selectedPaymentAdvice && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            
            <div className="border-b-2 border-blue-600 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Templegate Technologies & Services Pvt. Ltd.</h2>
                <p className="text-xs text-slate-500">Electronic City, Bengaluru, Karnataka 560100</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">SETTLED</span>
                <div className="text-xs font-mono font-bold text-slate-700 mt-1">{selectedPaymentAdvice.payment_reference}</div>
              </div>
            </div>

            <div className="text-center py-2 bg-slate-50 border border-slate-100 rounded-lg">
              <h3 className="font-bold text-base text-blue-900 uppercase tracking-wide">Official Payment Remittance Advice</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                <strong className="text-slate-800 block mb-1">Beneficiary Credited:</strong>
                <div className="text-slate-700 font-bold">{selectedPaymentAdvice.vendor_name}</div>
                <div className="text-slate-500 font-mono mt-0.5">Bank: {selectedPaymentAdvice.bank_name}</div>
                <div className="text-slate-500 font-mono">Account: {selectedPaymentAdvice.account_number}</div>
                <div className="text-slate-500 font-mono">IFSC: {selectedPaymentAdvice.ifsc_code}</div>
              </div>

              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                <strong className="text-slate-800 block mb-1">Transaction Proof:</strong>
                <div>UTR Number: <span className="font-mono font-bold text-blue-700">{selectedPaymentAdvice.utr_number}</span></div>
                <div>Payment Mode: <span className="font-bold">{selectedPaymentAdvice.payment_method}</span></div>
                <div>Value Date: <span className="font-medium">{selectedPaymentAdvice.processed_date || selectedPaymentAdvice.scheduled_date}</span></div>
                <div className="mt-2 text-sm font-bold text-slate-900">
                  Total Disbursed: ₹{selectedPaymentAdvice.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-2">
              This document is a certified electronic remittance generated by Templegate AP Automation Software.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedPaymentAdvice(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
