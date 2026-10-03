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
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { Customer, Sale } from '@/types';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';
import { PrintableInvoiceModal } from '@/components/invoices/PrintableInvoiceModal';

export const CustomerManager: React.FC = () => {
  const { customers, addCustomer, updateCustomer, sales, business, uiLanguage, t } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);

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
              onClick={() => setSelectedCustomer(cust)}
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

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-rangoli-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-earth-900 font-serif">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-earth-500">
                  {selectedCustomer.phone} • {selectedCustomer.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-earth-400 hover:text-earth-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-ivory-50 p-4 rounded-xl border border-rangoli-200/70 text-xs mb-4">
              <div>
                <span className="text-earth-500 block text-[11px]">{t('customers', 'totalPurchases', 'Total Purchases')}</span>
                <span className="text-base font-bold text-earth-900 font-serif">
                  ₹{selectedCustomer.totalPurchases.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-earth-500 block text-[11px]">{t('customers', 'amountPaid', 'Amount Paid')}</span>
                <span className="text-base font-bold text-success font-serif">
                  ₹{selectedCustomer.amountPaid.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-earth-500 block text-[11px]">{t('customers', 'amountPending', 'Pending Udhar')}</span>
                <span className="text-base font-bold text-danger font-serif">
                  ₹{selectedCustomer.amountPending.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Purchase History */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-earth-600 mb-2">
              {t('customers', 'history', 'Purchase & Ledger History')}
            </h4>

            {customerSales.length === 0 ? (
              <p className="text-xs text-earth-500 py-3 italic">
                {t('customers', 'noTransactions', 'No past transactions recorded for this customer yet.')}
              </p>
            ) : (
              <div className="space-y-2">
                {customerSales.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-rangoli-100 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-earth-900">{s.invoiceNo}</div>
                      <div className="text-[11px] text-earth-500">
                        {s.items.map((i) => `${i.productName} (${i.quantity}${i.unit})`).join(', ')}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2.5">
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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-earth-900 text-white text-xs font-bold"
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
