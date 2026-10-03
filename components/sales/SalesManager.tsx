'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  PlusCircle,
  FileText,
  Printer,
  Calendar,
  CheckCircle,
  IndianRupee,
  Clock,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { Sale } from '@/types';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';
import { PrintableInvoiceModal } from '@/components/invoices/PrintableInvoiceModal';

export const SalesManager: React.FC<{ onOpenQuickSale: () => void }> = ({ onOpenQuickSale }) => {
  const { sales, business } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CREDIT' | 'CASH' | 'UPI'>('ALL');
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterMode === 'CREDIT') matchesFilter = s.paymentStatus === 'credit';
    if (filterMode === 'CASH') matchesFilter = s.paymentStatus === 'cash';
    if (filterMode === 'UPI') matchesFilter = s.paymentStatus === 'upi';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-earth-900 font-serif">
            Sales Register & Invoices
          </h2>
          <p className="text-xs text-earth-600">
            Real-time audit trail of customer sales, GST billing, items dispatched, and payment states
          </p>
        </div>

        <button
          onClick={onOpenQuickSale}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold shadow-md hover:shadow-rangoli transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-earth-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice # or customer..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-rangoli-200 bg-white text-xs text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {(['ALL', 'CREDIT', 'CASH', 'UPI'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterMode === m
                  ? 'bg-rangoli-500 text-white border-rangoli-500 shadow-xs'
                  : 'bg-white text-earth-700 border-rangoli-200 hover:bg-rangoli-50'
              }`}
            >
              {m === 'CREDIT' ? 'Udhar / Credit' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white rounded-2xl border border-rangoli-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-800">
            <thead className="bg-ivory-100/80 border-b border-rangoli-200 text-earth-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Products / Items</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rangoli-100 font-medium">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-rangoli-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-sm text-earth-900">{s.invoiceNo}</div>
                    <div className="text-[10px] text-earth-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-earth-900">{s.customerName}</div>
                  </td>

                  <td className="py-3 px-4 text-earth-600 max-w-xs">
                    <div className="truncate">
                      {s.items.map((it) => `${it.productName} (${it.quantity}${it.unit})`).join(', ')}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-base text-earth-900 font-serif">
                    ₹{s.totalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.paymentStatus === 'credit'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {s.paymentStatus === 'credit' ? 'Udhar' : s.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveInvoice(s)}
                      className="px-2.5 py-1 rounded-lg border border-rangoli-200 hover:bg-rangoli-100 text-rangoli-800 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Bill</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
