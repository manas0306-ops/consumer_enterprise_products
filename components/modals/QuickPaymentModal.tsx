'use client';

import React, { useState } from 'react';
import { Wallet, CheckCircle, X, IndianRupee } from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({ isOpen, onClose }) => {
  const { customers, recordPayment, t } = useBusiness();

  const indebtedCustomers = customers.filter((c) => c.amountPending > 0);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    indebtedCustomers[0]?.id || customers[0]?.id || ''
  );
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || amount <= 0) return;

    recordPayment({
      customerId: selectedCustomerId,
      amount: Number(amount),
      paymentMode,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-rangoli-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-earth-900 font-serif">
              {t('receivables', 'collectTitle', 'Collect Udhar / Settle Payment')}
            </h3>
          </div>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-700 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-earth-700 font-semibold mb-1">{t('customers', 'customerName', 'Select Customer *')}</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const c = customers.find((cust) => cust.id === e.target.value);
                if (c) setAmount(c.amountPending);
              }}
              className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.amountPending > 0 ? `(₹${c.amountPending.toLocaleString('en-IN')})` : ''}
                </option>
              ))}
            </select>
          </div>

          {currentCustomer && (
            <div className="bg-ivory-50 p-3 rounded-xl border border-rangoli-200 flex justify-between items-center">
              <span className="text-earth-600">{t('receivables', 'amount', 'Total Udhar Pending:')}:</span>
              <span className="text-base font-bold text-danger font-serif">
                ₹{currentCustomer.amountPending.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div>
            <label className="block text-earth-700 font-semibold mb-1">{t('receivables', 'amountReceived', 'Amount Received (₹) *')}</label>
            <input
              type="number"
              required
              min={1}
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-rangoli-300 text-sm font-bold text-earth-900"
              placeholder="e.g. 500"
            />
          </div>

          <div>
            <label className="block text-earth-700 font-semibold mb-1">{t('purchases', 'paymentMode', 'Payment Mode')}</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
            >
              <option value="cash">{t('sales', 'cash', 'Cash / Rokad')}</option>
              <option value="upi">{t('sales', 'upi', 'UPI / GPay / PhonePe')}</option>
              <option value="bank_transfer">{t('common', 'bank', 'Bank Transfer / IMPS')}</option>
            </select>
          </div>

          <div>
            <label className="block text-earth-700 font-semibold mb-1">{t('common', 'notes', 'Notes / Reference')}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
              placeholder={t('common', 'notesPlaceholder', 'e.g. Settle part payment for last week')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-rangoli-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-earth-300 text-earth-700 font-semibold"
            >
              {t('common', 'cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-success hover:bg-emerald-700 text-white font-bold shadow-sm"
            >
              {t('customers', 'recordPayment', 'Confirm Settlement')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
