import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoicesList from './components/InvoicesList';
import InvoiceCapture from './components/InvoiceCapture';
import VendorManagement from './components/VendorManagement';
import PurchaseOrders from './components/PurchaseOrders';
import GoodsReceipts from './components/GoodsReceipts';
import POMatching from './components/POMatching';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import PaymentProcessing from './components/PaymentProcessing';
import Reports from './components/Reports';
import Notifications from './components/Notifications';
import AuditLogs from './components/AuditLogs';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';

import { initialInvoices, initialPayments, initialVendors } from './mockData';

export default function App() {
  // Persistent State: Survives browser close, refresh, and server restarts
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('templegate_active_tab') || 'dashboard';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('templegate_role') || 'Finance Controller';
  });

  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('templegate_invoices');
      return saved ? JSON.parse(saved) : initialInvoices;
    } catch (e) {
      return initialInvoices;
    }
  });

  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('templegate_payments');
      return saved ? JSON.parse(saved) : initialPayments;
    } catch (e) {
      return initialPayments;
    }
  });

  const [vendors, setVendors] = useState(() => {
    try {
      const saved = localStorage.getItem('templegate_vendors');
      return saved ? JSON.parse(saved) : initialVendors;
    } catch (e) {
      return initialVendors;
    }
  });

  const [selectedInvoice, setSelectedInvoice] = useState(() => {
    return invoices[0] || initialInvoices[0];
  });

  // Automatically save any new invoice uploads, approvals, or payments
  useEffect(() => {
    localStorage.setItem('templegate_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('templegate_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('templegate_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('templegate_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('templegate_active_tab', activeTab);
  }, [activeTab]);

  // Convenience function to reset data to initial demo seed if desired
  const handleResetData = () => {
    localStorage.removeItem('templegate_invoices');
    localStorage.removeItem('templegate_payments');
    localStorage.removeItem('templegate_vendors');
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setVendors(initialVendors);
    setSelectedInvoice(initialInvoices[0]);
    alert('Database successfully reset to initial demo state!');
  };

  const pendingApprovalsCount = invoices.filter(
    i => i.status !== 'APPROVED' && i.status !== 'PAID' && i.status !== 'REJECTED' && i.status !== 'CANCELLED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Top Application Bar */}
      <Navbar currentRole={currentRole} setCurrentRole={setCurrentRole} onResetData={handleResetData} />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar with all 14 AP modules */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingApprovalsCount}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              invoices={invoices}
              payments={payments}
              vendors={vendors}
              setActiveTab={setActiveTab}
              setSelectedInvoice={setSelectedInvoice}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesList
              invoices={invoices}
              setActiveTab={setActiveTab}
              setSelectedInvoice={setSelectedInvoice}
            />
          )}

          {activeTab === 'capture' && (
            <InvoiceCapture
              invoices={invoices}
              setInvoices={setInvoices}
              setActiveTab={setActiveTab}
              setSelectedInvoice={setSelectedInvoice}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorManagement
              vendors={vendors}
              setVendors={setVendors}
            />
          )}

          {activeTab === 'purchase_orders' && (
            <PurchaseOrders
              invoices={invoices}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'goods_receipts' && (
            <GoodsReceipts
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'matching' && (
            <POMatching
              invoices={invoices}
              setInvoices={setInvoices}
              selectedInvoice={selectedInvoice}
              setSelectedInvoice={setSelectedInvoice}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalWorkflow
              invoices={invoices}
              setInvoices={setInvoices}
              currentRole={currentRole}
              setActiveTab={setActiveTab}
              setPayments={setPayments}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentProcessing
              invoices={invoices}
              payments={payments}
              setPayments={setPayments}
              setInvoices={setInvoices}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              invoices={invoices}
              payments={payments}
              vendors={vendors}
            />
          )}

          {activeTab === 'notifications' && (
            <Notifications />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogs />
          )}

          {activeTab === 'user_management' && (
            <UserManagement
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
            />
          )}

          {activeTab === 'settings' && (
            <Settings onResetData={handleResetData} />
          )}
        </main>

      </div>

    </div>
  );
}
