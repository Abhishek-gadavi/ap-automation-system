import React, { useState } from 'react';

export default function VendorManagement({ vendors, setVendors }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    vendor_code: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    gstin: '',
    pan_number: '',
    msme_registered: false,
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });

  const handleCreateVendor = (e) => {
    e.preventDefault();
    const created = {
      id: `v-${Date.now()}`,
      vendor_code: newVendor.vendor_code || `VEND-00${vendors.length + 1}`,
      name: newVendor.name,
      email: newVendor.email,
      phone: newVendor.phone,
      city: newVendor.city,
      state: newVendor.state,
      gstin: newVendor.gstin.toUpperCase(),
      pan_number: newVendor.pan_number.toUpperCase(),
      msme_registered: newVendor.msme_registered,
      payment_terms_days: 30,
      status: 'ACTIVE',
      bank: {
        bank_name: newVendor.bank_name || 'HDFC Bank',
        account_number: newVendor.account_number || '50200099887766',
        ifsc_code: newVendor.ifsc_code || 'HDFC0000123',
        is_verified: true
      }
    };
    setVendors(prev => [...prev, created]);
    setShowAddModal(false);
    setNewVendor({
      name: '', vendor_code: '', email: '', phone: '', city: '', state: '',
      gstin: '', pan_number: '', msme_registered: false, bank_name: '', account_number: '', ifsc_code: ''
    });
  };

  const handleToggleStatus = (id) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: v.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
        };
      }
      return v;
    }));
  };

  const handleVerifyBank = (id) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id && v.bank) {
        return {
          ...v,
          bank: { ...v.bank, is_verified: true }
        };
      }
      return v;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vendor Management Master</h1>
          <p className="text-sm text-slate-500 mt-1">
            Module 6: Vendor master records, statutory GSTIN / PAN validation, bank account verification, and onboarding workflows.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <span>+</span> Onboard New Vendor
        </button>
      </div>

      {/* Vendors Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{vendor.name}</h3>
                  <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {vendor.vendor_code}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {vendor.city}, {vendor.state} | {vendor.email}
                </div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                vendor.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                vendor.status === 'PENDING_ONBOARDING' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {vendor.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Statutory Details */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400 font-semibold block">GSTIN (Verified):</span>
                <span className="font-mono font-bold text-slate-800">{vendor.gstin}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">PAN Number:</span>
                <span className="font-mono font-bold text-slate-800">{vendor.pan_number}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 font-semibold block">Payment Terms:</span>
                <span className="font-bold text-slate-700">Net {vendor.payment_terms_days} Days</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 font-semibold block">MSME Registered:</span>
                <span className={`font-bold ${vendor.msme_registered ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {vendor.msme_registered ? 'Yes (Priority Clearance)' : 'No'}
                </span>
              </div>
            </div>

            {/* Bank Details */}
            {vendor.bank && (
              <div className="border border-slate-200 rounded-lg p-3 text-xs flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">{vendor.bank.bank_name}</div>
                  <div className="text-slate-500 font-mono">A/C: {vendor.bank.account_number} | IFSC: {vendor.bank.ifsc_code}</div>
                </div>

                {vendor.bank.is_verified ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    <span>✓</span> Bank Verified
                  </span>
                ) : (
                  <button
                    onClick={() => handleVerifyBank(vendor.id)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold px-2 py-1 rounded text-[11px]"
                  >
                    Verify Penny Drop
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleToggleStatus(vendor.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded transition ${
                  vendor.status === 'ACTIVE'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {vendor.status === 'ACTIVE' ? 'Suspend Vendor' : 'Reactivate Vendor'}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Onboarding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Onboard New Vendor Master</h3>
            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Company / Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    placeholder="e.g. Precision Tech Pvt Ltd"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Vendor Code</label>
                  <input
                    type="text"
                    required
                    value={newVendor.vendor_code}
                    onChange={(e) => setNewVendor({ ...newVendor, vendor_code: e.target.value })}
                    placeholder="e.g. VEND-005"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">GSTIN (15 characters)</label>
                  <input
                    type="text"
                    required
                    value={newVendor.gstin}
                    onChange={(e) => setNewVendor({ ...newVendor, gstin: e.target.value })}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full border border-slate-300 rounded p-2 font-mono uppercase focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    required
                    value={newVendor.pan_number}
                    onChange={(e) => setNewVendor({ ...newVendor, pan_number: e.target.value })}
                    placeholder="AAAAA0000A"
                    className="w-full border border-slate-300 rounded p-2 font-mono uppercase focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    placeholder="finance@vendor.com"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">City & State</label>
                  <input
                    type="text"
                    required
                    value={newVendor.city}
                    onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value, state: 'Karnataka' })}
                    placeholder="Bengaluru, Karnataka"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Remittance Bank Account</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={newVendor.bank_name}
                    onChange={(e) => setNewVendor({ ...newVendor, bank_name: e.target.value })}
                    className="border border-slate-300 rounded p-2"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={newVendor.account_number}
                    onChange={(e) => setNewVendor({ ...newVendor, account_number: e.target.value })}
                    className="border border-slate-300 rounded p-2"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={newVendor.ifsc_code}
                    onChange={(e) => setNewVendor({ ...newVendor, ifsc_code: e.target.value })}
                    className="border border-slate-300 rounded p-2 font-mono uppercase"
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
                  Onboard Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
