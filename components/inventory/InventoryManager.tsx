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
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { Product } from '@/types';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';

export const InventoryManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, suppliers, t } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OOS'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
                <th className="py-3 px-4">{t('inventory', 'productName', 'Product & Category')}</th>
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
                const isOOS = p.quantity <= 0;
                const isLow = p.quantity <= p.reorderLevel;

                return (
                  <tr key={p.id} className="hover:bg-rangoli-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-earth-900">{p.name}</div>
                      <div className="text-[11px] text-earth-500">
                        {p.nameHindi && <span className="font-serif mr-2">{p.nameHindi}</span>}
                        <span>{p.category}</span>
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
                      {isOOS ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/30 text-[10px] font-bold inline-block">
                          {t('common', 'outOfStock', 'Out of Stock')}
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30 text-[10px] font-bold inline-block">
                          {t('common', 'lowStock', 'Low Stock')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/30 text-[10px] font-bold inline-block">
                          {t('common', 'healthy', 'Healthy')}
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
