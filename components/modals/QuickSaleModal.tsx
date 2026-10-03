'use client';

import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, X, Plus, Trash2 } from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { PaymentStatus } from '@/types';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({ isOpen, onClose }) => {
  const { products, customers, recordSale, t } = useBusiness();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('credit');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = customPrice !== null ? customPrice : currentProduct?.sellingPrice || 50;
  const totalAmount = quantity * unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !currentProduct) return;

    recordSale({
      customerName,
      customerPhone,
      items: [
        {
          productName: currentProduct.name,
          quantity: Number(quantity),
          unit: currentProduct.unit,
          unitPrice,
        },
      ],
      totalAmount,
      paymentStatus,
      paymentDueDate: paymentStatus === 'credit' ? dueDate : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-rangoli-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rangoli-100 text-rangoli-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-earth-900 font-serif">
              {t('sales', 'recordNewSale', 'Record Quick Sale')}
            </h3>
          </div>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-700 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-earth-700 font-semibold mb-1">{t('customers', 'customerName', 'Customer Name *')}</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              list="existing-customers"
              className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
              placeholder="Type name (e.g. Ramesh Verma)..."
            />
            <datalist id="existing-customers">
              {customers.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-earth-700 font-semibold mb-1">{t('inventory', 'productName', 'Product')}</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomPrice(null);
              }}
              className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({t('inventory', 'stock', 'Stock')}: {p.quantity} {p.unit} • ₹{p.sellingPrice}/{p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-earth-700 font-semibold mb-1">
                {t('purchases', 'quantity', 'Quantity')} ({currentProduct?.unit || 'unit'})
              </label>
              <input
                type="number"
                min={0.1}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
              />
            </div>
            <div>
              <label className="block text-earth-700 font-semibold mb-1">{t('inventory', 'sellingPrice', 'Rate')} (₹/{currentProduct?.unit})</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-earth-700 font-semibold mb-1">{t('purchases', 'paymentMode', 'Payment Mode')}</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
              >
                <option value="credit">{t('sales', 'credit', 'Udhar / Credit')}</option>
                <option value="cash">{t('sales', 'cash', 'Cash / Nakad')}</option>
                <option value="upi">{t('sales', 'upi', 'UPI')}</option>
              </select>
            </div>
            <div>
              <label className="block text-earth-700 font-semibold mb-1">
                {paymentStatus === 'credit' ? t('receivables', 'dueDate', 'Due Date') : t('purchases', 'paymentMode', 'Payment Status')}
              </label>
              {paymentStatus === 'credit' ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                />
              ) : (
                <div className="py-2 px-3 bg-emerald-50 text-success font-bold rounded-lg border border-emerald-200">
                  {t('receivables', 'settled', 'Instant Settled')}
                </div>
              )}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-ivory-50 p-3 rounded-xl border border-rangoli-200 flex items-center justify-between">
            <span className="font-semibold text-earth-700">{t('sales', 'amount', 'Total Invoice Amount:')}:</span>
            <span className="text-lg font-bold text-rangoli-700 font-serif">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
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
              className="px-5 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white font-bold shadow-sm"
            >
              {t('sales', 'recordNewSale', 'Record Sale & Update Stock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
