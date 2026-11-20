import React, { useState } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'PENDING_APPROVAL',
      title: 'Action Required: High-Value Invoice #INV-2026-7892',
      message: 'Invoice from Acme Industrial Solutions Ltd for ₹1,77,000.00 requires Tier 3 Controller sign-off.',
      time: '12 mins ago',
      is_read: false,
      email_dispatched: true
    },
    {
      id: 'notif-2',
      type: 'INVOICE_APPROVED',
      title: 'Invoice #APEX-2611-09 Approved',
      message: 'Finance Team Lead approved freight transport charges for ₹1,00,300.00.',
      time: '1 hour ago',
      is_read: true,
      email_dispatched: true
    },
    {
      id: 'notif-3',
      type: 'PAYMENT_COMPLETED',
      title: 'NEFT Remittance Settled - Ref: PAY-20261105-X9810',
      message: 'Bank settlement successful via UTR CMS2611050912X45P to State Bank of India account.',
      time: '3 hours ago',
      is_read: true,
      email_dispatched: true
    },
    {
      id: 'notif-4',
      type: 'ESCALATION_ALERT',
      title: 'SLA Escalation: Vertex Cloud Subscription',
      message: 'Invoice #VRTX-2026-441 has exceeded the 48-hour SLA due to price variance.',
      time: 'Yesterday',
      is_read: false,
      email_dispatched: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Email Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Additional Feature 4: Automated event triggers for invoice submission, pending approvals, approval decisions, disbursements, and SLA escalations.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition"
        >
          Mark All as Read
        </button>
      </div>

      {/* SMTP Email Configuration Status Card */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📧</span>
          <div>
            <div className="text-xs font-bold text-blue-900">SMTP Notification Dispatcher: Active (Sandbox)</div>
            <div className="text-xs text-blue-700">All alerts trigger both in-app notification and email dispatch to relevant approver inboxes.</div>
          </div>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">100% Deliverability</span>
      </div>

      {/* Notifications Stream */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 flex items-start justify-between gap-4 transition ${n.is_read ? 'bg-white' : 'bg-blue-50/30'}`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${n.is_read ? 'bg-slate-300' : 'bg-blue-600'}`}></span>
                <span className="font-bold text-sm text-slate-900">{n.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {n.type.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-600 pl-4">{n.message}</p>
              <div className="text-[11px] text-slate-400 pl-4 flex items-center gap-3 pt-1">
                <span>{n.time}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">✓ Dispatched via SMTP</span>
              </div>
            </div>

            {!n.is_read && (
              <button
                onClick={() => setNotifications(notifications.map(item => item.id === n.id ? { ...item, is_read: true } : item))}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold shrink-0"
              >
                Mark Read
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
