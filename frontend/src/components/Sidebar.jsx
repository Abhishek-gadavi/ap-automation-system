import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, pendingCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', badge: null, icon: '📊' },
    { id: 'capture', label: 'Invoice Capture & OCR', badge: 'AI', icon: '📥' },
    { id: 'matching', label: 'PO Matching Engine', badge: '2/3-Way', icon: '⚖️' },
    { id: 'approvals', label: 'Approval Workflows', badge: pendingCount > 0 ? pendingCount : null, icon: '✅' },
    { id: 'vendors', label: 'Vendor Management', badge: null, icon: '🏢' },
    { id: 'payments', label: 'Payment Processing', badge: null, icon: '💳' },
    { id: 'reports', label: 'Reports & Audit Logs', badge: null, icon: '📈' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 shadow-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          AP Lifecycle Modules
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
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

      {/* Compliance / Tech Stack Badge */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
        <div className="font-semibold text-slate-700 flex items-center justify-between">
          <span>Target Architecture</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="space-y-1 text-slate-500">
          <div className="flex justify-between"><span>Frontend:</span> <span className="font-medium text-slate-700">ReactJS</span></div>
          <div className="flex justify-between"><span>Backend:</span> <span className="font-medium text-slate-700">Django REST</span></div>
          <div className="flex justify-between"><span>Database:</span> <span className="font-medium text-slate-700">PostgreSQL</span></div>
          <div className="flex justify-between"><span>Engine:</span> <span className="font-medium text-slate-700">OCR & NLP</span></div>
        </div>
      </div>
    </aside>
  );
}
