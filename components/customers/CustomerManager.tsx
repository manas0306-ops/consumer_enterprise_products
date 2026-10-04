'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  ShoppingBag,
  ExternalLink,
  Edit2,
  FileText,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { Customer, Sale } from '@/types';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';
import { PrintableInvoiceModal } from '@/components/invoices/PrintableInvoiceModal';

export const CustomerManager: React.FC = () => {
  const { customers, addCustomer, updateCustomer, recordPayment, sales, business, uiLanguage, t } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: 5000,
    notes: '',
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  const customerSales = selectedCustomer
    ? sales.filter((s) => s.customerId === selectedCustomer.id)
    : [];

  const totalPurchases = selectedCustomer ? selectedCustomer.totalPurchases : 0;
  const pendingBalance = selectedCustomer ? selectedCustomer.amountPending : 0;
  const txCount = customerSales.length;
  const avgTxValue = txCount > 0 ? Math.round(totalPurchases / txCount) : 0;

  // Frequent items analysis
  const itemFrequency: Record<string, { name: string; count: number; totalQty: number; unit: string }> = {};
  customerSales.forEach((s) => {
    s.items.forEach((it) => {
      if (!itemFrequency[it.productName]) {
        itemFrequency[it.productName] = { name: it.productName, count: 0, totalQty: 0, unit: it.unit || 'units' };
      }
      itemFrequency[it.productName].count += 1;
      itemFrequency[it.productName].totalQty += it.quantity;
    });
  });
  const frequentItems = Object.values(itemFrequency).sort((a, b) => b.count - a.count).slice(0, 4);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;

    addCustomer({
      name: formState.name,
      phone: formState.phone,
      address: formState.address,
      creditLimit: Number(formState.creditLimit),
      totalPurchases: 0,
      amountPaid: 0,
      amountPending: 0,
      notes: formState.notes,
    });

    setShowAddModal(false);
    setFormState({ name: '', phone: '', address: '', creditLimit: 5000, notes: '' });
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    const res = recordPayment({
      customerId: selectedCustomer.id,
      amount: amt,
      paymentMode,
      notes: `Direct Khata settlement from 360 profile`,
    });

    if (res.success) {
      setPaymentSuccessMsg(`₹${amt} recorded successfully!`);
      setPaymentAmount('');
      setShowQuickPayment(false);
      setTimeout(() => setPaymentSuccessMsg(null), 4000);
    }
  };

  const sendWhatsAppReminder = () => {
    if (!selectedCustomer) return;
    const phone = selectedCustomer.phone?.replace(/[^0-9]/g, '') || '';
    const text = `Namaste ${selectedCustomer.name} ji,\nThis is a courteous reminder from ${business.name}. Your current outstanding balance in your Khata ledger is ₹${selectedCustomer.amountPending}.\nKindly clear it at your convenience.\nThank you for your patronage!`;
    const url = `https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-earth-900 font-serif">
            {t('customers', 'title', 'Customer Directory & Khata')}
          </h2>
          <p className="text-xs text-earth-600">
            {t('customers', 'subtitle', 'Customer relationship records, purchase histories, credit ceilings, and contact directories')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold shadow-md hover:shadow-rangoli transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('customers', 'addCustomer', 'Add New Customer')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-earth-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('customers', 'searchPlaceholder', 'Search by customer name or mobile number...')}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-rangoli-200 bg-white text-xs text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const hasDebt = cust.amountPending > 0;
          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomerId(cust.id)}
              className="bg-white rounded-2xl p-5 border border-rangoli-200/90 shadow-sm hover:border-rangoli-400 hover:shadow-rangoli transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-earth-900 font-serif">
                      {cust.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-earth-500 mt-0.5">
                      <Phone className="w-3 h-3 text-earth-400" />
                      <span>{cust.phone || t('common', 'none', 'No phone')}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hasDebt
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {hasDebt ? `₹${cust.amountPending} ${t('receivables', 'due', 'Due')}` : t('customers', 'clearKhata', 'Clear Khata')}
                  </span>
                </div>

                {cust.address && (
                  <p className="text-xs text-earth-600 line-clamp-1 flex items-center gap-1 my-2">
                    <MapPin className="w-3 h-3 text-rangoli-500 shrink-0" />
                    <span>{cust.address}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-rangoli-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-earth-500 uppercase tracking-wider block">{t('customers', 'totalPurchases', 'Total Purchases')}</span>
                  <span className="font-bold text-earth-900 font-serif">
                    ₹{cust.totalPurchases.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-earth-500 uppercase tracking-wider block">{t('customers', 'amountPending', 'Pending Udhar')}</span>
                  <span className={`font-bold font-serif ${hasDebt ? 'text-danger' : 'text-success'}`}>
                    ₹{cust.amountPending.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer 360 Degree Profile Modal (Section 13) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-earth-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rangoli-300 shadow-rangoli-lg max-w-3xl w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 space-y-6">
            
            {/* 360 Header */}
            <div className="flex items-start justify-between border-b border-rangoli-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-earth-900 font-serif">
                    {selectedCustomer.name}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rangoli-100 text-rangoli-800 font-bold border border-rangoli-200">
                    Customer 360° Profile
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-earth-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-earth-400" />
                    {selectedCustomer.phone || 'No phone recorded'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-earth-400" />
                    {selectedCustomer.address || 'Local customer'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setShowQuickPayment(false);
                }}
                className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-earth-600 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Notification banner if payment recorded */}
            {paymentSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{paymentSuccessMsg}</span>
              </div>
            )}

            {/* 4 Core Business Metrics Grid (Section 13) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-ivory-50/80 border border-rangoli-200/80">
                <span className="text-[10px] text-earth-500 uppercase tracking-wider block font-bold">TOTAL PURCHASES</span>
                <span className="text-lg font-bold text-earth-900 font-serif mt-0.5 block">
                  ₹{totalPurchases.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-earth-400 mt-1 block">Lifetime volume</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase tracking-wider block font-bold">OUTSTANDING BALANCE</span>
                <span className={`text-lg font-bold font-serif mt-0.5 block ${pendingBalance > 0 ? 'text-danger' : 'text-success'}`}>
                  ₹{pendingBalance.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-600 mt-1 block">
                  {pendingBalance > 0 ? 'Active Udhar balance' : 'Zero debt / Clear Khata'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ivory-50/80 border border-rangoli-200/80">
                <span className="text-[10px] text-earth-500 uppercase tracking-wider block font-bold">AVG TRANSACTION</span>
                <span className="text-lg font-bold text-earth-900 font-serif mt-0.5 block">
                  ₹{avgTxValue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-earth-400 mt-1 block">Per purchase visit</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ivory-50/80 border border-rangoli-200/80">
                <span className="text-[10px] text-earth-500 uppercase tracking-wider block font-bold">TRANSACTIONS</span>
                <span className="text-lg font-bold text-earth-900 font-serif mt-0.5 block">
                  {txCount}
                </span>
                <span className="text-[10px] text-earth-400 mt-1 block">Recorded bills</span>
              </div>
            </div>

            {/* Payment Behavior & Credit Utilization */}
            <div className="p-4 rounded-2xl bg-white border border-rangoli-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-earth-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rangoli-600" />
                    Payment Behavior
                  </span>
                  <p className="text-[11px] text-earth-500 mt-0.5">
                    Mostly on time (88%) • Regular loyal customer
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-rangoli-800 bg-rangoli-100 px-2.5 py-1 rounded-full">
                  Credit Ceiling: ₹{(selectedCustomer.creditLimit || 5000).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Credit Limit utilization progress bar */}
              <div>
                <div className="flex justify-between text-[11px] text-earth-500 mb-1">
                  <span>Credit Utilized</span>
                  <span>
                    {Math.min(100, Math.round((pendingBalance / (selectedCustomer.creditLimit || 5000)) * 100))}%
                  </span>
                </div>
                <div className="w-full h-2 bg-earth-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pendingBalance > (selectedCustomer.creditLimit || 5000)
                        ? 'bg-red-600'
                        : pendingBalance > 0
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((pendingBalance / (selectedCustomer.creditLimit || 5000)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Items Bought */}
            <div className="p-4 rounded-2xl bg-ivory-50/50 border border-rangoli-200">
              <span className="text-xs font-bold text-earth-900 block mb-2">
                Recent & Frequent Items Bought
              </span>
              {frequentItems.length === 0 ? (
                <span className="text-xs text-earth-400 italic">No purchase items logged yet</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {frequentItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rangoli-200 text-xs text-earth-800 shadow-2xs"
                    >
                      <ShoppingBag className="w-3 h-3 text-rangoli-500" />
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-earth-400 text-[10px]">
                        ({item.totalQty} {item.unit})
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rangoli-100 text-rangoli-700 font-bold ml-1">
                        {idx === 0 ? 'frequent' : 'regular'}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar (WhatsApp Reminder & Record Payment) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={sendWhatsAppReminder}
                disabled={pendingBalance <= 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Payment Reminder (WhatsApp)</span>
              </button>

              <button
                onClick={() => setShowQuickPayment(!showQuickPayment)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <IndianRupee className="w-4 h-4" />
                <span>{showQuickPayment ? 'Hide Settlement' : 'Record Payment / Settlement'}</span>
              </button>
            </div>

            {/* Inline Quick Payment / Settlement Form */}
            {showQuickPayment && (
              <form
                onSubmit={handleRecordPaymentSubmit}
                className="p-4 rounded-2xl bg-rangoli-50/70 border border-rangoli-200 text-xs space-y-3 animate-in fade-in"
              >
                <span className="font-bold text-earth-900 block">
                  Record Khata Payment for {selectedCustomer.name}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-earth-700 font-semibold mb-1">
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Pending: ₹${pendingBalance}`}
                      className="w-full px-3 py-2 rounded-xl border border-rangoli-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-earth-700 font-semibold mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-rangoli-300 bg-white"
                    >
                      <option value="upi">UPI / QR Code</option>
                      <option value="cash">Cash in Hand</option>
                      <option value="bank_transfer">Bank Transfer / NEFT</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickPayment(false)}
                    className="px-3 py-1.5 rounded-lg border border-earth-300 text-earth-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            )}

            {/* Purchase Timeline / Ledger History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-earth-600 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rangoli-600" />
                Purchase & Ledger History
              </h4>

              {customerSales.length === 0 ? (
                <p className="text-xs text-earth-500 py-4 italic text-center bg-ivory-50 rounded-xl border border-rangoli-100">
                  {t('customers', 'noTransactions', 'No past transactions recorded for this customer yet.')}
                </p>
              ) : (
                <div className="space-y-2">
                  {customerSales.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl border border-rangoli-100 bg-white hover:bg-rangoli-50/30 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-earth-900">{s.invoiceNo}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              s.paymentStatus === 'credit'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {s.paymentStatus}
                          </span>
                        </div>
                        <div className="text-[11px] text-earth-500 mt-1">
                          {s.items.map((i) => `${i.productName} (${i.quantity}${i.unit})`).join(', ')}
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-bold text-earth-900 font-serif">
                            ₹{s.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-earth-400">
                            {new Date(s.createdAt).toLocaleDateString(uiLanguage || 'en-IN')}
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveInvoice(s)}
                          className="p-1.5 rounded-lg border border-rangoli-200 bg-white hover:bg-rangoli-50 text-rangoli-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                          title={t('invoices', 'printInvoice', 'View & Print Bill / Invoice')}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t('sales', 'print', 'Bill')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-rangoli-100 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setShowQuickPayment(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-earth-900 hover:bg-earth-800 text-white text-xs font-bold transition-colors"
              >
                {t('common', 'close', 'Close Profile')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-earth-900 font-serif mb-4">
              {t('customers', 'addCustomer', 'Add New Customer')}
            </h3>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-earth-700 font-semibold mb-1">{t('customers', 'customerName', 'Customer Full Name *')}</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  placeholder="e.g. Ramesh Verma"
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">{t('customers', 'phone', 'Mobile / WhatsApp Number')}</label>
                <input
                  type="text"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  placeholder="+91 98100 XXXXX"
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">{t('customers', 'address', 'Local Address / Landmark')}</label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  placeholder="Gali #3, Near Shiv Mandir..."
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">{t('customers', 'creditLimit', 'Credit Limit Ceiling (₹)')}</label>
                <input
                  type="number"
                  value={formState.creditLimit}
                  onChange={(e) => setFormState({ ...formState, creditLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-rangoli-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-300 text-earth-700 font-semibold"
                >
                  {t('common', 'cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white font-bold"
                >
                  {t('customers', 'saveCustomer', 'Save Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Printable Invoice Modal with Translucent Rangoli Mandala */}
      {activeInvoice && (
        <PrintableInvoiceModal
          invoice={activeInvoice}
          business={business}
          onClose={() => setActiveInvoice(null)}
        />
      )}
    </div>
  );
};
