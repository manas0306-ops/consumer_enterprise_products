'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  PackagePlus,
  CheckCircle,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';

export const PurchasesManager: React.FC = () => {
  const { suppliers, products, recordPurchase } = useBusiness();

  const [showModal, setShowModal] = useState(false);
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || 'Sharma Wholesale Agro Mandi');
  const [productName, setProductName] = useState('Basmati Rice Premium');
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState('kg');
  const [unitPrice, setUnitPrice] = useState(48);
  const [paymentStatus, setPaymentStatus] = useState<'cash' | 'credit'>('cash');

  const [purchasesList, setPurchasesList] = useState([
    {
      id: 'pur_01',
      invoiceNo: 'PUR-2026-0045',
      supplierName: 'Sharma Wholesale Agro Mandi',
      productName: 'Chakki Fresh Atta',
      quantity: 100,
      unit: 'kg',
      unitPrice: 32,
      totalAmount: 3200,
      paymentStatus: 'cash',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'pur_02',
      invoiceNo: 'PUR-2026-0046',
      supplierName: 'Gupta Edible Oils & FMCG',
      productName: 'Fortune Mustard Oil Kacchi Ghani',
      quantity: 20,
      unit: 'litre',
      unitPrice: 135,
      totalAmount: 2700,
      paymentStatus: 'credit',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ]);

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();

    const totalAmount = quantity * unitPrice;
    const res = recordPurchase({
      supplierName,
      items: [{ productName, quantity, unitPrice, unit }],
      totalAmount,
      paymentStatus,
    });

    setPurchasesList((prev) => [
      {
        id: res.purchase.id,
        invoiceNo: res.purchase.invoiceNo,
        supplierName,
        productName,
        quantity,
        unit,
        unitPrice,
        totalAmount,
        paymentStatus,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setShowModal(false);
  };

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-earth-900 font-serif">
            Stock Procurement & Purchases
          </h2>
          <p className="text-xs text-earth-600">
            Log wholesale purchases, auto-increment inventory stock levels, and track supplier invoices
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold shadow-md hover:shadow-rangoli transition-all"
        >
          <PackagePlus className="w-4 h-4" />
          <span>Record New Purchase</span>
        </button>
      </div>

      {/* Purchase List Table */}
      <div className="bg-white rounded-2xl border border-rangoli-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-800">
            <thead className="bg-ivory-100/80 border-b border-rangoli-200 text-earth-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Supplier / Mandi</th>
                <th className="py-3 px-4">Product Added</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Wholesale Rate</th>
                <th className="py-3 px-4 text-right">Total Bill</th>
                <th className="py-3 px-4 text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rangoli-100 font-medium">
              {purchasesList.map((p) => (
                <tr key={p.id} className="hover:bg-rangoli-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-earth-900">{p.invoiceNo}</span>
                    <span className="block text-[10px] text-earth-400">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-earth-900">
                    {p.supplierName}
                  </td>

                  <td className="py-3 px-4 text-earth-700">
                    {p.productName}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-success text-sm">
                    +{p.quantity} {p.unit}
                  </td>

                  <td className="py-3 px-4 text-right text-earth-600">
                    ₹{p.unitPrice}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-earth-900 font-serif text-sm">
                    ₹{p.totalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rangoli-100 text-rangoli-800 border border-rangoli-300">
                      {p.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-earth-900 font-serif mb-4">
              Record Wholesale Purchase / Inflow
            </h3>

            <form onSubmit={handleCreatePurchase} className="space-y-3 text-xs">
              <div>
                <label className="block text-earth-700 font-semibold mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                />
              </div>

              <div>
                <label className="block text-earth-700 font-semibold mb-1">Product to Replenish *</label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (Current: {p.quantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-earth-700 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  />
                </div>
                <div>
                  <label className="block text-earth-700 font-semibold mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  >
                    <option value="kg">kg</option>
                    <option value="packet">packet</option>
                    <option value="litre">litre</option>
                    <option value="pcs">pcs</option>
                    <option value="sack">sack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-earth-700 font-semibold mb-1">Buy Rate (₹)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center bg-ivory-50 p-2.5 rounded-lg border border-rangoli-200 mb-3">
                  <span className="font-semibold text-earth-700">Total Purchase Value:</span>
                  <span className="font-bold text-base text-rangoli-700 font-serif">
                    ₹{(quantity * unitPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rangoli-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-300 text-earth-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white font-bold"
                >
                  Record & Increment Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
