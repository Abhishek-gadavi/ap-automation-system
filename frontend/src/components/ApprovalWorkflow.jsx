import React, { useState } from 'react';
import { approvalMatrixRules } from '../mockData';

export default function ApprovalWorkflow({ invoices, setInvoices, currentRole, setActiveTab, setPayments }) {
  const [activeTab, setSubTab] = useState('queue'); // 'queue' or 'matrix'
  const [commentInput, setCommentInput] = useState('');
  const [approvalBanner, setApprovalBanner] = useState(null);
  const [auditLogs, setAuditLogs] = useState([
    { id: '1', time: '14:20 IST', role: 'Finance Controller', action: 'TIER_3_REVIEW_READY', details: 'Awaiting controller authorization on Acme Industrial Solutions invoice.' },
    { id: '2', time: '13:45 IST', role: 'System Workflow', action: '3_WAY_MATCH_PASSED', details: 'Zero price or quantity discrepancy detected across PO and GRN.' }
  ]);

  // Include any invoice that requires approval (not yet finalized)
  const pendingInvoices = invoices.filter(
    i => i.status !== 'APPROVED' && i.status !== 'PAID' && i.status !== 'REJECTED' && i.status !== 'CANCELLED'
  );

  const handleAction = (invoice, decision) => {
    const updatedStatus = decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : 'PENDING_APPROVAL';

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoice.id) {
        const existingApprovals = (inv.approvals && inv.approvals.length > 0) ? inv.approvals : [
          { id: `app-${Date.now()}`, tier: 3, role: currentRole, approver_email: 'controller@templegate.example.com', status: 'PENDING', sla_hours: 48, comments: '' }
        ];

        return {
          ...inv,
          status: updatedStatus,
          approvals: existingApprovals.map(app => ({
            ...app,
            status: decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : decision,
            comments: commentInput || `Sign-off granted by ${currentRole}`
          }))
        };
      }
      return inv;
    }));

    // Add audit log entry
    setAuditLogs(prev => [
      {
        id: String(Date.now()),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: currentRole,
        action: `DECISION_${decision}`,
        details: `${decision} executed on invoice ${invoice.invoice_number} for ₹${invoice.total_amount?.toLocaleString('en-IN')}. Notes: ${commentInput || 'Verified and approved.'}`
      },
      ...prev
    ]);

    if (decision === 'APPROVE') {
      setApprovalBanner({
        invoice_number: invoice.invoice_number,
        amount: invoice.total_amount,
        role: currentRole
      });
    }

    setCommentInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workflow & Approval Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Module 5: Multi-tier threshold approval matrix, role segregation, SLA timers, and escalation triggers.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
          <button
            onClick={() => setSubTab('queue')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === 'queue' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Invoices ({pendingInvoices.length})
          </button>
          <button
            onClick={() => setSubTab('matrix')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approval Matrix Rules
          </button>
        </div>
      </div>

      {/* Success Banner when Approved */}
      {approvalBanner && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="text-sm font-bold text-emerald-900">
                Invoice #{approvalBanner.invoice_number} Approved Successfully!
              </div>
              <div className="text-xs text-emerald-700">
                Authorized for ₹{approvalBanner.amount?.toLocaleString('en-IN')} by {approvalBanner.role}. Ready for NEFT payment release.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('payments')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
          >
            Go to Payment Processing →
          </button>
        </div>
      )}

      {/* Role Banner */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <div className="text-xs font-semibold text-blue-900">Acting Approver Profile: <span className="underline font-bold">{currentRole}</span></div>
            <div className="text-xs text-blue-700">Decisions are timestamped and committed to immutable PostgreSQL audit logs.</div>
          </div>
        </div>
        <span className="text-xs bg-blue-200/70 text-blue-800 font-bold px-2.5 py-1 rounded">SLA Active (24/48h)</span>
      </div>

      {activeTab === 'queue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Approval Action Stream */}
          <div className="lg:col-span-2 space-y-4">
            {pendingInvoices.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <span className="text-4xl block mb-2">🎉</span>
                <div className="font-bold text-slate-700">All Approval Queues Clear!</div>
                <div className="text-xs mt-1">Upload a new invoice or check the Payments module for settled records.</div>
              </div>
            ) : (
              pendingInvoices.map((inv) => (
                <div key={inv.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">{inv.invoice_number}</span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                          PO: {inv.po_number || 'N/A'}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                          3-Way Matched ✓
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Vendor: <strong className="text-slate-700">{inv.vendor_name}</strong> | Date: {inv.invoice_date}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        ₹{inv.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-amber-600 font-semibold mt-0.5">Tier 3 (Controller Authorization)</div>
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Approver Notes / Audit Justification:</label>
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="e.g. Verified goods receipt and contract pricing. Sign-off granted."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(inv, 'CLARIFY')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
                      >
                        Request Clarification
                      </button>
                      <button
                        onClick={() => handleAction(inv, 'ESCALATE')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
                      >
                        Escalate (SLA Expiry)
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(inv, 'REJECT')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-4 py-2 rounded-lg transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(inv, 'APPROVE')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition"
                      >
                        Approve Invoice ✓
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Audit Logs Stream */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase">Live Workflow Audit Log</h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">SOX Compliant</span>
            </div>

            <div className="space-y-3 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="font-bold text-blue-600">{log.role}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="font-semibold text-slate-700">{log.action}</div>
                  <div className="text-slate-500 text-[11px]">{log.details}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Approval Matrix Configuration Table */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">Dynamic Multi-Tier Approval Matrix</h3>
            <p className="text-xs text-slate-500">Configurable authorization limits, delegation rules, and automated escalation SLA hours.</p>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Min Amount</th>
                <th className="py-3 px-4">Max Amount</th>
                <th className="py-3 px-4">SLA (Turnaround)</th>
                <th className="py-3 px-4">Parallel Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {approvalMatrixRules.map((rule) => (
                <tr key={rule.tier} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-700">Tier {rule.tier}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600">{rule.role}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">₹{rule.min.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{rule.max.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{rule.sla} Hours</td>
                  <td className="py-3 px-4">
                    {rule.parallel ? (
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">Parallel Dual Sign</span>
                    ) : (
                      <span className="text-slate-400">Sequential</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
