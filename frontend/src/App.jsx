import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceCapture from './components/InvoiceCapture';
import POMatching from './components/POMatching';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import VendorManagement from './components/VendorManagement';
import PaymentProcessing from './components/PaymentProcessing';
import Reports from './components/Reports';

import { initialInvoices, initialPayments, initialVendors } from './mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Finance Controller');
  const [invoices, setInvoices] = useState(initialInvoices);
  const [payments, setPayments] = useState(initialPayments);
  const [vendors, setVendors] = useState(initialVendors);
  const [selectedInvoice, setSelectedInvoice] = useState(initialInvoices[0]);

  const pendingApprovalsCount = invoices.filter(i => i.status === 'PENDING_APPROVAL').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Top Application Bar */}
      <Navbar currentRole={currentRole} setCurrentRole={setCurrentRole} />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
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

          {activeTab === 'capture' && (
            <InvoiceCapture
              invoices={invoices}
              setInvoices={setInvoices}
              setActiveTab={setActiveTab}
              setSelectedInvoice={setSelectedInvoice}
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

          {activeTab === 'vendors' && (
            <VendorManagement
              vendors={vendors}
              setVendors={setVendors}
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
        </main>

      </div>

    </div>
  );
}
