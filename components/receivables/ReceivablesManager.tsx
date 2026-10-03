'use client';

import React, { useState } from 'react';
import {
  WalletCards,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageCircle,
  PlusCircle,
  Calendar,
  Filter,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { Receivable, Sale } from '@/types';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';
import { PrintableInvoiceModal } from '@/components/invoices/PrintableInvoiceModal';

export const ReceivablesManager: React.FC<{ onOpenQuickPayment: () => void }> = ({
  onOpenQuickPayment,
}) => {
  const {
    receivables,
    customers,
    recordPayment,
    totalReceivables,
    overdueReceivablesTotal,
    sales,
    business,
    t,
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'PAID'>('ALL');
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);

  const filteredReceivables = receivables.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.customerPhone && r.customerPhone.includes(searchQuery));

    let matchesStatus = true;
    if (statusFilter === 'PENDING') matchesStatus = r.status === 'pending';
    if (statusFilter === 'OVERDUE') matchesStatus = r.status === 'overdue';
    if (statusFilter === 'PAID') matchesStatus = r.status === 'paid';

    return matchesSearch && matchesStatus;
  });

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable || paymentAmount <= 0) return;

    recordPayment({
      customerId: selectedReceivable.customerId,
      amount: Number(paymentAmount),
      paymentMode: 'cash',
      notes: `Settled towards ${selectedReceivable.invoiceNo}`,
    });

    setSelectedReceivable(null);
    setPaymentAmount(0);
  };

  const generateWhatsAppReminder = (r: Receivable) => {
    const text = encodeURIComponent(
      `Namaste ${r.customerName} ji! Sharma Kirana Store se namaste. Aapka Bill #${r.invoiceNo} ka kul ₹${r.remainingAmount.toLocaleString('en-IN')} udhar baaki hai (Due date: ${r.dueDate}). Kripya samay par UPI ya dukan aakar bhuqtan karein. Dhanyawad!`
    );
    window.open(`https://wa.me/${r.customerPhone?.replace(/\D/g, '') || ''}?text=${text}`, '_blank');
  };

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Top Banner and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-rangoli-700 bg-rangoli-100 px-2 py-0.5 rounded-full border border-rangoli-300">
                {t('receivables', 'ledgerBadge', 'Bahi-Khata Ledger')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-earth-900 font-serif mt-1">
              {t('receivables', 'title', 'Udhar & Receivables Engine')}
            </h2>
            <p className="text-xs text-earth-600 mt-0.5">
              {t('receivables', 'subtitle', 'Tracks customer credit balances, due dates, aging, and automated WhatsApp reminder triggers')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-rangoli-100">
            <div>
              <span className="text-[11px] text-earth-500 uppercase tracking-wider block">{t('receivables', 'totalOutstanding', 'Total Outstanding Udhar')}</span>
              <span className="text-xl font-bold text-earth-900 font-serif">
                ₹{totalReceivables.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-rangoli-200" />
            <div>
              <span className="text-[11px] text-danger uppercase tracking-wider block">{t('receivables', 'overdueAmount', 'Critically Overdue')}</span>
              <span className="text-xl font-bold text-danger font-serif">
                ₹{overdueReceivablesTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Settle CTA */}
        <div className="bg-gradient-to-br from-rangoli-50 to-ivory-100 p-5 rounded-2xl border border-rangoli-300 flex flex-col justify-between shadow-rangoli">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rangoli-500 text-white flex items-center justify-center mb-2 shadow-sm">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-earth-900 font-serif">
              {t('receivables', 'settlePayment', 'Record Customer Payment')}
            </h3>
            <p className="text-xs text-earth-600 mt-1">
              {t('receivables', 'settleSub', 'Customer returned udhar? Enter amount to instantly reduce ledger balance.')}
            </p>
          </div>

          <button
            onClick={onOpenQuickPayment}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-earth-900 hover:bg-earth-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            {t('receivables', 'settlePayment', '+ Settle Udhar Now')}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-earth-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('receivables', 'searchPlaceholder', 'Search customer, invoice, phone...')}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-rangoli-200 bg-white text-xs text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {([
            { id: 'ALL', label: t('receivables', 'all', 'All') },
            { id: 'PENDING', label: t('receivables', 'pending', 'Pending') },
            { id: 'OVERDUE', label: t('receivables', 'overdue', 'Overdue') },
            { id: 'PAID', label: t('receivables', 'settled', 'Paid') },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === tab.id
                  ? 'bg-rangoli-500 text-white border-rangoli-500 shadow-xs'
                  : 'bg-white text-earth-700 border-rangoli-200 hover:bg-rangoli-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Receivables Table */}
      <div className="bg-white rounded-2xl border border-rangoli-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-800">
            <thead className="bg-ivory-100/80 border-b border-rangoli-200 text-earth-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t('receivables', 'customer', 'Customer & Contact')}</th>
                <th className="py-3 px-4">{t('sales', 'invoiceNo', 'Invoice #')}</th>
                <th className="py-3 px-4 text-right">{t('sales', 'amount', 'Total Sale')}</th>
                <th className="py-3 px-4 text-right">{t('customers', 'amountPaid', 'Paid')}</th>
                <th className="py-3 px-4 text-right">{t('receivables', 'amount', 'Pending Udhar')}</th>
                <th className="py-3 px-4">{t('receivables', 'dueDate', 'Due Date')}</th>
                <th className="py-3 px-4 text-center">{t('sales', 'mode', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('sales', 'actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rangoli-100 font-medium">
              {filteredReceivables.map((r) => {
                const isOverdue = r.status === 'overdue';
                const isPaid = r.status === 'paid';

                return (
                  <tr key={r.id} className="hover:bg-rangoli-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-earth-900">{r.customerName}</div>
                      <div className="text-[11px] text-earth-500">{r.customerPhone || t('common', 'none', 'No phone')}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-earth-600">
                      {r.invoiceNo}
                    </td>

                    <td className="py-3 px-4 text-right text-earth-600">
                      ₹{r.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right text-success font-semibold">
                      ₹{r.paidAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-base text-earth-900 font-serif">
                      ₹{r.remainingAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-earth-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-earth-400" />
                        <span>{r.dueDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isPaid ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/30 text-[10px] font-bold">
                          {t('receivables', 'settled', 'Paid')}
                        </span>
                      ) : isOverdue ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/30 text-[10px] font-bold animate-pulse">
                          {t('receivables', 'overdue', 'Overdue')} ({r.daysOverdue}d)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                          {t('receivables', 'pending', 'Pending')}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          const sale = sales.find((s) => s.invoiceNo === r.invoiceNo || s.id === r.saleId);
                          if (sale) {
                            setActiveInvoice(sale);
                          } else {
                            setActiveInvoice({
                              id: r.saleId || `REC-${r.id}`,
                              invoiceNo: r.invoiceNo,
                              customerId: r.customerId,
                              customerName: r.customerName,
                              totalAmount: r.totalAmount,
                              paidAmount: r.paidAmount ?? (r.totalAmount - r.remainingAmount),
                              balanceAmount: r.remainingAmount,
                              paymentStatus: 'credit',
                              paymentDueDate: r.dueDate,
                              createdAt: r.createdAt || new Date().toISOString(),
                              items: [
                                {
                                  productId: 'p-rec',
                                  productName: 'Outstanding Credit Goods',
                                  quantity: 1,
                                  unit: 'order',
                                  unitPrice: r.totalAmount,
                                  totalPrice: r.totalAmount,
                                },
                              ],
                            });
                          }
                        }}
                        className="p-1 rounded-lg border border-rangoli-200 bg-white hover:bg-rangoli-100 text-rangoli-700 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors align-middle"
                        title={t('invoices', 'printInvoice', 'View & Print Bill / Invoice')}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('sales', 'print', 'Bill')}</span>
                      </button>

                      {!isPaid && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReceivable(r);
                              setPaymentAmount(r.remainingAmount);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rangoli-100 hover:bg-rangoli-200 text-rangoli-800 text-[11px] font-bold transition-colors inline-block align-middle"
                          >
                            {t('receivables', 'collect', 'Collect')}
                          </button>
                          <button
                            onClick={() => generateWhatsAppReminder(r)}
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors inline-block align-middle"
                            title={t('customers', 'sendReminder', 'Send WhatsApp payment reminder')}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Single Receivable Modal */}
      {selectedReceivable && (
        <div className="fixed inset-0 z-50 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-earth-900 font-serif mb-1">
              {t('receivables', 'collectTitle', 'Collect Udhar Payment')}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              {selectedReceivable.customerName} • Invoice #{selectedReceivable.invoiceNo}
            </p>

            <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-earth-600 font-semibold mb-1">
                  {t('receivables', 'remainingBalance', 'Remaining Udhar Balance')}
                </label>
                <div className="text-xl font-bold text-earth-900 font-serif mb-3">
                  ₹{selectedReceivable.remainingAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-earth-600 font-semibold mb-1">
                  {t('receivables', 'amountReceived', 'Amount Received Now (₹) *')}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedReceivable.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300 text-sm font-bold text-earth-900 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-rangoli-100">
                <button
                  type="button"
                  onClick={() => setSelectedReceivable(null)}
                  className="px-4 py-2 rounded-xl border border-earth-300 text-earth-700 font-semibold hover:bg-earth-50"
                >
                  {t('common', 'cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-success hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  {t('customers', 'recordPayment', 'Record Payment')}
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
