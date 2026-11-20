import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, pendingCount }) {
  const navItems = [
    { id: 'dashboard', label: '1. Executive Dashboard', badge: null, icon: '📊' },
    { id: 'invoices', label: '2. Invoices Repository', badge: null, icon: '📑' },
    { id: 'capture', label: '3. Upload & OCR Capture', badge: 'AI', icon: '📥' },
    { id: 'vendors', label: '4. Vendor Management', badge: null, icon: '🏢' },
    { id: 'purchase_orders', label: '5. Purchase Orders', badge: null, icon: '📦' },
    { id: 'goods_receipts', label: '6. Goods Receipts (GRN)', badge: null, icon: '🚚' },
    { id: 'matching', label: '7. PO 2/3-Way Matching', badge: 'Reconcile', icon: '⚖️' },
    { id: 'approvals', label: '8. Approval Workflows', badge: pendingCount > 0 ? pendingCount : null, icon: '✅' },
    { id: 'payments', label: '9. Payment Processing', badge: null, icon: '💳' },
    { id: 'reports', label: '10. Compliance Reports', badge: null, icon: '📈' },
    { id: 'notifications', label: '11. Notifications & Email', badge: 'Live', icon: '🔔' },
    { id: 'audit_logs', label: '12. Forensic Audit Logs', badge: null, icon: '🛡️' },
    { id: 'user_management', label: '13. User & Role RBAC', badge: null, icon: '👥' },
    { id: 'settings', label: '14. Settings & Matrix', badge: null, icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-3 flex flex-col justify-between shrink-0 shadow-sm overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          AP Lifecycle Modules
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm font-bold border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Database & Stack Info */}
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] space-y-1">
        <div className="font-bold text-slate-700 flex items-center justify-between">
          <span>Stack: Docker + PG</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="text-slate-500">
          <div>DB: <span className="font-mono text-slate-800">accounts_payable_db</span></div>
          <div>User: <span className="font-mono text-slate-800">accounts_user</span></div>
        </div>
      </div>
    </aside>
  );
}
