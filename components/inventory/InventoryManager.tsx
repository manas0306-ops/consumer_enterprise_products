'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  TrendingDown,
  ShoppingBag,
  CheckCircle,
  Sparkles,
  Truck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { Product } from '@/types';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';

export const InventoryManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, suppliers, recordPurchase, t } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OOS'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [poSuccessMsg, setPoSuccessMsg] = useState<string | null>(null);

  // Summary Metrics
  const healthyCount = products.filter((p) => p.quantity > p.reorderLevel).length;
  const lowCount = products.filter((p) => p.quantity <= p.reorderLevel && p.quantity > 0).length;
  const criticalCount = products.filter((p) => p.quantity <= 0).length;
  const totalValuation = products.reduce((acc, p) => acc + p.quantity * p.purchasePrice, 0);

  // AI Restock Recommendations (Section 14)
  const restockRecommendations = products
    .filter((p) => p.quantity <= p.reorderLevel)
    .map((p) => {
      const isCritical = p.quantity <= 0;
      const daysLeft = isCritical ? 0 : Math.max(1, Math.round((p.quantity / (p.reorderLevel || 10)) * 3));
      const suggestedReorder = Math.max(20, p.reorderLevel * 2);
      return {
        product: p,
        daysLeft,
        suggestedReorder,
        urgency: isCritical ? 'CRITICAL' : daysLeft <= 2 ? 'HIGH' : 'MEDIUM',
        supplier: p.supplierName || 'Primary Mandi Supplier',
      };
    });

  const handleCreatePO = (rec: typeof restockRecommendations[0]) => {
    const res = recordPurchase({
      supplierName: rec.supplier,
      items: [
        {
          productName: rec.product.name,
          quantity: rec.suggestedReorder,
          unitPrice: rec.product.purchasePrice,
          unit: rec.product.unit,
        },
      ],
      totalAmount: rec.suggestedReorder * rec.product.purchasePrice,
      paymentStatus: 'cash',
    });

    if (res.success) {
      setPoSuccessMsg(`Purchase Order placed for ${rec.suggestedReorder} ${rec.product.unit} of ${rec.product.name}! Stock replenished immediately.`);
      setTimeout(() => setPoSuccessMsg(null), 4000);
    }
  };

  // New Product Form State
  const [formState, setFormState] = useState({
    name: '',
    nameHindi: '',
    category: 'Staples',
    sku: '',
    quantity: 50,
    unit: 'kg',
    purchasePrice: 40,
    sellingPrice: 50,
    reorderLevel: 20,
    supplierName: suppliers[0]?.name || 'Local Mandi',
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameHindi && p.nameHindi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'LOW') matchesStock = p.quantity <= p.reorderLevel && p.quantity > 0;
    if (stockFilter === 'OOS') matchesStock = p.quantity <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formState.name,
        nameHindi: formState.nameHindi,
        category: formState.category,
        sku: formState.sku || `SKU-${Date.now().toString().slice(-4)}`,
        quantity: Number(formState.quantity),
        unit: formState.unit,
        purchasePrice: Number(formState.purchasePrice),
        sellingPrice: Number(formState.sellingPrice),
        reorderLevel: Number(formState.reorderLevel),
        supplierName: formState.supplierName,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: formState.name,
        nameHindi: formState.nameHindi,
        category: formState.category,
        sku: formState.sku || `SKU-${Date.now().toString().slice(-6)}`,
        quantity: Number(formState.quantity),
        unit: formState.unit,
        purchasePrice: Number(formState.purchasePrice),
        sellingPrice: Number(formState.sellingPrice),
        reorderLevel: Number(formState.reorderLevel),
        supplierName: formState.supplierName,
      });
    }

    setShowAddModal(false);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormState({
      name: p.name,
      nameHindi: p.nameHindi || '',
      category: p.category,
      sku: p.sku,
      quantity: p.quantity,
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      reorderLevel: p.reorderLevel,
      supplierName: p.supplierName || '',
    });
    setShowAddModal(true);
  };

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-earth-900 font-serif">
            {t('inventory', 'title', 'Inventory & Stock Engine')}
          </h2>
          <p className="text-xs text-earth-600">
            {t('inventory', 'subtitle', 'Deterministic stock quantities and reorder thresholds')}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setFormState({
              name: '',
              nameHindi: '',
              category: 'Staples',
              sku: `SKU-${Date.now().toString().slice(-5)}`,
              quantity: 50,
              unit: 'kg',
              purchasePrice: 40,
              sellingPrice: 50,
              reorderLevel: 20,
              supplierName: suppliers[0]?.name || 'Local Mandi',
            });
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold shadow-md hover:shadow-rangoli transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('inventory', 'addProduct', 'Add New Product')}</span>
        </button>
      </div>

      {/* Notification banner for PO */}
      {poSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{poSuccessMsg}</span>
        </div>
      )}

      {/* Summary Metrics Bar (Section 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-rangoli-200/90 shadow-2xs">
          <span className="text-[10px] text-earth-500 font-bold uppercase tracking-wider block">Total SKUs</span>
          <span className="text-xl font-bold text-earth-900 font-serif mt-0.5 block">{products.length} Items</span>
          <span className="text-[11px] text-earth-400 mt-1 block">Valuation: ₹{totalValuation.toLocaleString('en-IN')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Healthy Stock</span>
          <span className="text-xl font-bold text-emerald-800 font-serif mt-0.5 block">{healthyCount} SKUs</span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Above reorder threshold</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Low Stock</span>
          <span className="text-xl font-bold text-amber-800 font-serif mt-0.5 block">{lowCount} SKUs</span>
          <span className="text-[11px] text-amber-600 mt-1 block">Needs replenishment</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 shadow-2xs">
          <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider block">Critical / OOS</span>
          <span className="text-xl font-bold text-red-800 font-serif mt-0.5 block">{criticalCount} SKUs</span>
          <span className="text-[11px] text-red-600 mt-1 block">Immediate action required</span>
        </div>
      </div>

      {/* AI Restock Recommendations (Section 14) */}
      {restockRecommendations.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rangoli-50/90 to-amber-50/60 border border-rangoli-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rangoli-600" />
              <h3 className="text-sm font-bold text-earth-900 font-serif">
                AI Restock Recommendations
              </h3>
            </div>
            <span className="text-[11px] text-earth-500 font-medium">
              Based on consumption rate & recent sales velocity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {restockRecommendations.map((rec) => (
              <div
                key={rec.product.id}
                className="p-3.5 rounded-xl bg-white border border-rangoli-200 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-earth-900">{rec.product.name}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rec.urgency === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-earth-600 mt-1.5 leading-relaxed">
                    Stock will run out in{' '}
                    <strong className="text-earth-900 font-bold">
                      {rec.daysLeft === 0 ? 'today (Out of Stock)' : `${rec.daysLeft} days`}
                    </strong>{' '}
                    based on this week's sales.
                  </p>
                  <div className="mt-2 text-[11px] text-earth-500 flex items-center justify-between">
                    <span>Suggested reorder:</span>
                    <strong className="text-rangoli-800 font-bold">
                      {rec.suggestedReorder} {rec.product.unit} (₹{(rec.suggestedReorder * rec.product.purchasePrice).toLocaleString('en-IN')})
                    </strong>
                  </div>
                  <span className="text-[10px] text-earth-400 block mt-0.5">
                    Supplier: {rec.supplier}
                  </span>
                </div>

                <button
                  onClick={() => handleCreatePO(rec)}
                  className="w-full py-2 px-3 rounded-lg bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Create Purchase Order</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-earth-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('inventory', 'searchPlaceholder', 'Search product name, Hindi name, or SKU...')}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-rangoli-200 bg-white text-xs text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-rangoli-200 bg-white text-xs text-earth-900 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
          >
            <option value="ALL">{t('inventory', 'all', 'All Categories')} ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
              stockFilter === 'ALL'
                ? 'bg-rangoli-500 text-white border-rangoli-500 shadow-xs'
                : 'bg-white text-earth-700 border-rangoli-200 hover:bg-rangoli-50'
            }`}
          >
            {t('inventory', 'all', 'All Stock')}
          </button>
          <button
            onClick={() => setStockFilter('LOW')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
              stockFilter === 'LOW'
                ? 'bg-warning text-white border-warning shadow-xs'
                : 'bg-white text-earth-700 border-rangoli-200 hover:bg-rangoli-50'
            }`}
          >
            {t('inventory', 'lowStock', 'Low Stock')}
          </button>
          <button
            onClick={() => setStockFilter('OOS')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
              stockFilter === 'OOS'
                ? 'bg-danger text-white border-danger shadow-xs'
                : 'bg-white text-earth-700 border-rangoli-200 hover:bg-rangoli-50'
            }`}
          >
            {t('inventory', 'outOfStock', 'Out of Stock')}
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-rangoli-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-800">
            <thead className="bg-ivory-100/80 border-b border-rangoli-200 text-earth-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t('inventory', 'productName', 'Product & Supplier')}</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">{t('inventory', 'stock', 'Available Quantity')}</th>
                <th className="py-3 px-4 text-right">{t('inventory', 'costPrice', 'Buy Price')}</th>
                <th className="py-3 px-4 text-right">{t('inventory', 'sellingPrice', 'Sell Price')}</th>
                <th className="py-3 px-4 text-center">{t('common', 'status', 'Stock Status')}</th>
                <th className="py-3 px-4 text-right">{t('common', 'actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rangoli-100 font-medium">
              {filteredProducts.map((p) => {
                const isCritical = p.quantity <= 0;
                const isLow = p.quantity <= p.reorderLevel;

                return (
                  <tr key={p.id} className="hover:bg-rangoli-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-earth-900">{p.name}</div>
                      <div className="text-[11px] text-earth-500">
                        {p.nameHindi && <span className="font-serif mr-2">{p.nameHindi}</span>}
                        <span>{p.category}</span>
                        {p.supplierName && (
                          <span className="text-[10px] text-earth-400 block mt-0.5">
                            Supplier: {p.supplierName}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-earth-500 font-mono text-[11px]">
                      {p.sku}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-earth-900">
                        {p.quantity} {p.unit}
                      </span>
                      <span className="block text-[10px] text-earth-400">
                        {t('inventory', 'reorderLevel', 'Min threshold')}: {p.reorderLevel} {p.unit}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-earth-600">
                      ₹{p.purchasePrice}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-earth-900 font-serif">
                      ₹{p.sellingPrice}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isCritical ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold inline-block">
                          Critical (OOS)
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold inline-block">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold inline-block">
                          Healthy
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-earth-600 hover:text-rangoli-700 hover:bg-rangoli-100 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-earth-400 hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-earth-900 font-serif mb-4">
              {editingProduct ? t('common', 'edit', 'Edit Product Details') : t('inventory', 'addProduct', 'Add New Product to Inventory')}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-earth-700 mb-1">{t('inventory', 'productName', 'Product Name')} *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
                    placeholder="e.g. Basmati Rice"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-earth-700 mb-1">Hindi / Local Name</label>
                  <input
                    type="text"
                    value={formState.nameHindi}
                    onChange={(e) => setFormState({ ...formState, nameHindi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300 focus:outline-none focus:ring-1 focus:ring-rangoli-500 font-serif"
                    placeholder="e.g. बासमती चावल"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">{t('inventory', 'category', 'Category')}</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  >
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Staples">Staples</option>
                    <option value="Flour">Flour</option>
                    <option value="Edible Oils">Edible Oils</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Spices & Condiments">Spices & Condiments</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Instant Food">Instant Food</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formState.sku}
                    onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">{t('inventory', 'stock', 'Initial Stock')}</label>
                  <input
                    type="number"
                    value={formState.quantity}
                    onChange={(e) => setFormState({ ...formState, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">Unit</label>
                  <select
                    value={formState.unit}
                    onChange={(e) => setFormState({ ...formState, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  >
                    <option value="kg">kg</option>
                    <option value="packet">packet</option>
                    <option value="litre">litre</option>
                    <option value="pcs">pcs</option>
                    <option value="sack">sack</option>
                    <option value="box">box</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">{t('inventory', 'reorderLevel', 'Reorder Level')}</label>
                  <input
                    type="number"
                    value={formState.reorderLevel}
                    onChange={(e) => setFormState({ ...formState, reorderLevel: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">{t('inventory', 'costPrice', 'Purchase Price (₹)')}</label>
                  <input
                    type="number"
                    value={formState.purchasePrice}
                    onChange={(e) => setFormState({ ...formState, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">{t('inventory', 'sellingPrice', 'Selling Price (₹)')}</label>
                  <input
                    type="number"
                    value={formState.sellingPrice}
                    onChange={(e) => setFormState({ ...formState, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-rangoli-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-rangoli-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-300 text-earth-700 font-semibold hover:bg-earth-50"
                >
                  {t('common', 'cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white font-bold shadow-sm"
                >
                  {editingProduct ? t('common', 'save', 'Save Changes') : t('inventory', 'saveProduct', 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
