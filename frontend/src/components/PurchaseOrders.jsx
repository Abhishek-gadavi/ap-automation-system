import React, { useState } from 'react';

export default function PurchaseOrders({ invoices, setActiveTab }) {
  const [poList, setPoList] = useState([
    {
      id: 'po-1',
      po_number: 'PO-2026-0891',
      vendor_name: 'Acme Industrial Solutions Ltd',
      po_date: '2026-11-01',
      delivery_date: '2026-11-15',
      subtotal: 150000.0,
      tax_amount: 27000.0,
      total_amount: 177000.0,
      status: 'OPEN',
      items: [
        { item_code: 'ITM-SRV-01', description: 'High-Precision CNC Machined Cylinders', ordered_qty: 50, received_qty: 50, unit_price: 2000.0, total: 118000.0 },
        { item_code: 'ITM-SRV-02', description: 'High-Tensile Industrial Fasteners (Box of 500)', ordered_qty: 25, received_qty: 25, unit_price: 2000.0, total: 59000.0 }
      ]
    },
    {
      id: 'po-2',
      po_number: 'PO-2026-0904',
      vendor_name: 'Apex Logistics & Transport Co',
      po_date: '2026-11-05',
      delivery_date: '2026-11-18',
      subtotal: 85000.0,
      tax_amount: 15300.0,
      total_amount: 100300.0,
      status: 'OPEN',
      items: [
        { item_code: 'LOG-FTL-01', description: 'Full Truck Load Freight Transport - BLR to BOM', ordered_qty: 2, received_qty: 2, unit_price: 42500.0, total: 100300.0 }
      ]
    },
    {
      id: 'po-3',
      po_number: 'PO-2026-0915',
      vendor_name: 'Vertex Cloud Infrastructure',
      po_date: '2026-11-10',
      delivery_date: '2026-11-20',
      subtotal: 45000.0,
      tax_amount: 8100.0,
      total_amount: 53100.0,
      status: 'PARTIALLY_RECEIVED',
      items: [
        { item_code: 'CLD-K8S-01', description: 'Managed Production Kubernetes Cluster Nodes', ordered_qty: 2, received_qty: 1, unit_price: 22500.0, total: 53100.0 }
      ]
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPO, setNewPO] = useState({
    po_number: '',
    vendor_name: 'Acme Industrial Solutions Ltd',
    po_date: new Date().toISOString().split('T')[0],
    item_code: 'ITM-NEW-01',
    description: 'Raw Steel Alloy Billets (Grade 304)',
    quantity: 10,
    unit_price: 5000
  });

  const handleCreatePO = (e) => {
    e.preventDefault();
    const subtotal = newPO.quantity * newPO.unit_price;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const po = {
      id: `po-${Date.now()}`,
      po_number: newPO.po_number || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor_name: newPO.vendor_name,
      po_date: newPO.po_date,
      delivery_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      subtotal: subtotal,
      tax_amount: tax,
      total_amount: total,
      status: 'OPEN',
      items: [
        {
          item_code: newPO.item_code,
          description: newPO.description,
          ordered_qty: newPO.quantity,
          received_qty: 0,
          unit_price: newPO.unit_price,
          total: total
        }
      ]
    };

    setPoList([po, ...poList]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Order (PO) Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Additional Feature 1: Create, track, and manage authorized corporate purchase orders linked to vendors for automated matching.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <span>+</span> Create Purchase Order
        </button>
      </div>

      {/* PO Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Purchase Order Register</h3>
          <span className="text-xs text-slate-500">{poList.length} Active Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">PO Date</th>
                <th className="py-3 px-4">Delivery Due</th>
                <th className="py-3 px-4 text-right">Gross Total</th>
                <th className="py-3 px-4 text-center">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {poList.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{po.po_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{po.vendor_name}</td>
                  <td className="py-3 px-4 text-slate-600">{po.po_date}</td>
                  <td className="py-3 px-4 text-slate-600">{po.delivery_date}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{po.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      po.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('matching')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Inspect Match →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for creating PO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Create New Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">PO Number</label>
                <input
                  type="text"
                  value={newPO.po_number}
                  onChange={(e) => setNewPO({ ...newPO, po_number: e.target.value })}
                  placeholder="PO-2026-XXXX"
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Vendor</label>
                <select
                  value={newPO.vendor_name}
                  onChange={(e) => setNewPO({ ...newPO, vendor_name: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                >
                  <option value="Acme Industrial Solutions Ltd">Acme Industrial Solutions Ltd</option>
                  <option value="Apex Logistics & Transport Co">Apex Logistics & Transport Co</option>
                  <option value="Vertex Cloud Infrastructure">Vertex Cloud Infrastructure</option>
                  <option value="Sigma Raw Materials Corp">Sigma Raw Materials Corp</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Item Code</label>
                  <input
                    type="text"
                    value={newPO.item_code}
                    onChange={(e) => setNewPO({ ...newPO, item_code: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Description</label>
                  <input
                    type="text"
                    value={newPO.description}
                    onChange={(e) => setNewPO({ ...newPO, description: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Unit Price (INR)</label>
                  <input
                    type="number"
                    value={newPO.unit_price}
                    onChange={(e) => setNewPO({ ...newPO, unit_price: Number(e.target.value) })}
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
                  Authorize PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
