import React, { useState } from 'react';

export default function AuditLogs() {
  const [logs] = useState([
    { id: '1', timestamp: '2026-11-20 14:10:02', actor: 'priya.finance', role: 'FINANCE_EMPLOYEE', action: 'INVOICE_UPLOAD_OCR', entity: 'INV-2026-7892', details: 'Parsed multi-page invoice. 2 line items extracted with 98.6% confidence.', ip: '192.168.1.45' },
    { id: '2', timestamp: '2026-11-20 13:50:18', actor: 'SYSTEM_ENGINE', role: 'VALIDATION_DAEMON', action: '5_POINT_VALIDATION_PASS', entity: 'INV-2026-7892', details: 'Mandatory fields, duplicate uniqueness, GSTIN 29AABCA1234F1Z5 checked.', ip: '127.0.0.1' },
    { id: '3', timestamp: '2026-11-20 13:45:00', actor: 'rahul.manager', role: 'APPROVER_MANAGER', action: '3_WAY_MATCH_VERIFIED', entity: 'PO-2026-0891', details: 'PO vs GRN-2026-0412 vs INV-2026-7892 matched with 0.00% variance.', ip: '192.168.1.82' },
    { id: '4', timestamp: '2026-11-20 11:30:45', actor: 'abhishek.admin', role: 'ADMIN', action: 'APPROVAL_MATRIX_UPDATED', entity: 'MATRIX_TIER_3', details: 'Configured SLA to 48 hours for values between ₹1,00,000 and ₹5,00,000.', ip: '192.168.1.10' },
    { id: '5', timestamp: '2026-11-20 10:15:22', actor: 'SYSTEM_BANK_GATEWAY', role: 'PAYMENT_ADAPTER', action: 'NEFT_DISBURSEMENT_SETTLED', entity: 'PAY-20261105-X9810', details: 'UTR CMS2611050912X45P generated. Remittance advice published.', ip: '10.0.4.12' }
  ]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forensic Audit Logs & Compliance Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">
          SOX & Statutory Compliance: Cryptographically immutable journal of all invoice uploads, OCR extractions, matching evaluations, approvals, and disbursements.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Security Event Trail</h3>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded">Append-Only Storage</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Timestamp (IST)</th>
              <th className="py-3 px-4">User / Actor</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Event Narrative</th>
              <th className="py-3 px-4 font-mono">IP Origin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 font-sans">
                <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{log.actor}</div>
                  <div className="text-[10px] text-blue-600 font-semibold">{log.role}</div>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">{log.action}</td>
                <td className="py-3 px-4 font-mono text-blue-600 font-bold">{log.entity}</td>
                <td className="py-3 px-4 text-slate-600">{log.details}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
