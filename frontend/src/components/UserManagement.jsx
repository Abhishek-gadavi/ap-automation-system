import React, { useState } from 'react';

export default function UserManagement({ currentRole, setCurrentRole }) {
  const [users, setUsers] = useState([
    { id: 'u1', username: 'abhishek.admin', name: 'Abhishek Gadavi', email: 'admin@templegate.example.com', role: 'ADMIN', department: 'Executive Management', limit: 'Unlimited', status: 'ACTIVE' },
    { id: 'u2', username: 'priya.finance', name: 'Priya Sharma', email: 'priya.s@templegate.example.com', role: 'FINANCE_EMPLOYEE', department: 'Accounts Payable', limit: '₹25,000', status: 'ACTIVE' },
    { id: 'u3', username: 'rahul.manager', name: 'Rahul Deshmukh', email: 'rahul.d@templegate.example.com', role: 'APPROVER_MANAGER', department: 'Finance Operations', limit: '₹5,00,000', status: 'ACTIVE' },
    { id: 'u4', username: 'acme.vendor', name: 'Acme Portal Rep', email: 'billing@acmeindustrial.com', role: 'VENDOR', department: 'Supplier Representative', limit: 'N/A', status: 'ACTIVE' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    role: 'FINANCE_EMPLOYEE',
    department: 'Accounts Payable',
    limit: '₹50,000'
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers([...users, { id: `u-${Date.now()}`, ...newUser, status: 'ACTIVE' }]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Authentication & Role Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Section 4: Granular role-based access control (RBAC), approval monetary limits, and JWT security tokens.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
        >
          <span>+</span> Create System User
        </button>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Role-Based Permission Matrix (RBAC)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-900">1. Admin</div>
            <p className="text-slate-500 text-[11px] mt-1">Full master access: User management, approval matrix configuration, system audit logs, all vendors & POs.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-900">2. Finance Employee</div>
            <p className="text-slate-500 text-[11px] mt-1">Capture & upload invoices, review and correct OCR tabular data, run PO matching, initiate payment runs.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-900">3. Approver / Manager</div>
            <p className="text-slate-500 text-[11px] mt-1">Sign off invoices based on approval matrix monetary limits, add comments, reject, or escalate.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-900">4. Vendor</div>
            <p className="text-slate-500 text-[11px] mt-1">Vendor onboarding portal, manage banking details, submit invoices, view remittance status.</p>
          </div>
        </div>
      </div>

      {/* User Directory */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Authorized User Accounts</h3>
          <span className="text-xs text-slate-500">{users.length} Active Credentials</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Monetary Sign-off Limit</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Switch Active Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{u.name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 text-blue-800">
                    {u.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">{u.department}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{u.limit}</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {u.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setCurrentRole(u.role === 'ADMIN' ? 'CFO' : u.role === 'FINANCE_EMPLOYEE' ? 'AP Clerk' : 'Finance Controller')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded transition"
                  >
                    Impersonate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Provision New User</h3>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="ADMIN">System Admin</option>
                    <option value="FINANCE_EMPLOYEE">Finance Employee</option>
                    <option value="APPROVER_MANAGER">Manager / Approver</option>
                    <option value="VENDOR">Vendor Rep</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Approval Limit</label>
                  <input
                    type="text"
                    value={newUser.limit}
                    onChange={(e) => setNewUser({ ...newUser, limit: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
