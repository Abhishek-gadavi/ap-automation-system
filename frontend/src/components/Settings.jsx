import React, { useState } from 'react';
import { approvalMatrixRules } from '../mockData';

export default function Settings() {
  const [matrix, setMatrix] = useState(approvalMatrixRules);
  const [tolerance, setTolerance] = useState(2.0);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Workflow Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure dynamic approval thresholds, matching variance tolerances, and SLA auto-escalation timers.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          Save Configuration
        </button>
      </div>

      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
          <span>✓</span> Configuration saved and propagated to database successfully!
        </div>
      )}

      {/* Matching Tolerances Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Automated PO Matching Tolerance Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Unit Price Variance Tolerance (%)</label>
            <input
              type="number"
              step="0.1"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Price deviations within ±{tolerance}% will auto-match without raising a price exception flag.</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Quantity Tolerance Policy</label>
            <select className="w-full border border-slate-300 rounded p-2 bg-slate-50 text-slate-700 font-medium">
              <option>Strict (Billed Qty must not exceed GRN Accepted Qty)</option>
              <option>Permissive (+1% for bulk chemical/grain commodities)</option>
            </select>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Enforces that payments cannot be released for uninspected or warehouse-rejected material.</span>
          </div>
        </div>
      </div>

      {/* Approval Matrix Configuration Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Dynamic Multi-Tier Approval Matrix</h3>
          <span className="text-xs text-slate-500">Tier rules dictate automatic routing of invoices based on total invoice gross</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Approver Role</th>
              <th className="py-3 px-4">Min Amount (INR)</th>
              <th className="py-3 px-4">Max Amount (INR)</th>
              <th className="py-3 px-4">SLA Deadline</th>
              <th className="py-3 px-4">Parallel Dual Sign-off</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-700">Tier {row.tier}</td>
                <td className="py-3 px-4 font-semibold text-blue-600">{row.role}</td>
                <td className="py-3 px-4 font-medium text-slate-800">₹{row.min.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-bold text-slate-900">₹{row.max.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-semibold text-slate-700">{row.sla} Hours</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${row.parallel ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'}`}>
                    {row.parallel ? 'Yes (Dual CFO+VP)' : 'Sequential'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
