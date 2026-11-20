import React, { useState } from 'react';

export default function GoodsReceipts({ setActiveTab }) {
  const [grnList, setGrnList] = useState([
    {
      id: 'grn-1',
      grn_number: 'GRN-2026-0412',
      po_number: 'PO-2026-0891',
      vendor_name: 'Acme Industrial Solutions Ltd',
      received_date: '2026-11-14',
      received_by: 'Ramesh Kumar (Warehouse Mgr)',
      warehouse: 'WH-BLR-01',
      qc_status: 'PASSED',
      items: [
        { item_code: 'ITM-SRV-01', received_qty: 50, accepted_qty: 50, rejected_qty: 0 },
        { item_code: 'ITM-SRV-02', received_qty: 25, accepted_qty: 25, rejected_qty: 0 }
      ]
    },
    {
      id: 'grn-2',
      grn_number: 'GRN-2026-0428',
      po_number: 'PO-2026-0915',
      vendor_name: 'Vertex Cloud Infrastructure',
      received_date: '2026-11-16',
      received_by: 'Anand Verma (IT Lead)',
      warehouse: 'DC-HYD-02',
      qc_status: 'PARTIAL_ACCEPTANCE',
      items: [
        { item_code: 'CLD-K8S-01', received_qty: 2, accepted_qty: 1, rejected_qty: 1 }
      ]
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGRN, setNewGRN] = useState({
    grn_number: '',
    po_number: 'PO-2026-0891',
    vendor_name: 'Acme Industrial Solutions Ltd',
    received_by: 'Warehouse Inspector 01',
    warehouse: 'WH-BLR-01',
    item_code: 'ITM-SRV-01',
    received_qty: 50,
    accepted_qty: 50,
    rejected_qty: 0
  });

  const handleCreateGRN = (e) => {
    e.preventDefault();
    const grn = {
      id: `grn-${Date.now()}`,
      grn_number: newGRN.grn_number || `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      po_number: newGRN.po_number,
      vendor_name: newGRN.vendor_name,
      received_date: new Date().toISOString().split('T')[0],
      received_by: newGRN.received_by,
      warehouse: newGRN.warehouse,
      qc_status: newGRN.rejected_qty > 0 ? 'PARTIAL_ACCEPTANCE' : 'PASSED',
      items: [
        {
          item_code: newGRN.item_code,
          received_qty: newGRN.received_qty,
          accepted_qty: newGRN.accepted_qty,
          rejected_qty: newGRN.rejected_qty
        }
      ]
    };

    setGrnList([grn, ...grnList]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goods Receipt Note (GRN) Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Additional Feature 2: Record physical inward warehouse material deliveries, inspect quality (QC), and track accepted vs rejected goods for 3-way matching.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <span>+</span> Record Goods Receipt (GRN)
        </button>
      </div>

      {/* GRN Register */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Goods Inward Delivery Register</h3>
          <span className="text-xs text-slate-500">{grnList.length} Receiving Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">GRN Number</th>
                <th className="py-3 px-4">Linked PO</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4 text-center">QC Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grnList.map((grn) => (
                <tr key={grn.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{grn.grn_number}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 font-semibold">{grn.po_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{grn.vendor_name}</td>
                  <td className="py-3 px-4 text-slate-600">{grn.received_date}</td>
                  <td className="py-3 px-4 text-slate-600">{grn.warehouse}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      grn.qc_status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {grn.qc_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('matching')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      3-Way Match →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Record Inward Goods Receipt (GRN)</h3>
            <form onSubmit={handleCreateGRN} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">GRN Number</label>
                  <input
                    type="text"
                    value={newGRN.grn_number}
                    onChange={(e) => setNewGRN({ ...newGRN, grn_number: e.target.value })}
                    placeholder="GRN-2026-XXXX"
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Linked PO Number</label>
                  <input
                    type="text"
                    value={newGRN.po_number}
                    onChange={(e) => setNewGRN({ ...newGRN, po_number: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Warehouse Location</label>
                  <input
                    type="text"
                    value={newGRN.warehouse}
                    onChange={(e) => setNewGRN({ ...newGRN, warehouse: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Received By</label>
                  <input
                    type="text"
                    value={newGRN.received_by}
                    onChange={(e) => setNewGRN({ ...newGRN, received_by: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Qty Received</label>
                  <input
                    type="number"
                    value={newGRN.received_qty}
                    onChange={(e) => setNewGRN({ ...newGRN, received_qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Qty Accepted (QC)</label>
                  <input
                    type="number"
                    value={newGRN.accepted_qty}
                    onChange={(e) => setNewGRN({ ...newGRN, accepted_qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Qty Rejected</label>
                  <input
                    type="number"
                    value={newGRN.rejected_qty}
                    onChange={(e) => setNewGRN({ ...newGRN, rejected_qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded"
                >
                  Save GRN Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
