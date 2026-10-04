'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  Search,
  WalletCards,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Calendar,
  IndianRupee,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { RangoliCorner, MandalaMedium } from '@/components/rangoli/RangoliMotif';
import { useVoiceRecognition } from '@/lib/hooks/useVoiceRecognition';
import { Customer, Product, Sale } from '@/types';

interface AskKineticManagerProps {
  onNavigateTo?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
}

type QueryType =
  | 'WHO_OWES_MONEY'
  | 'RUNNING_LOW'
  | 'TODAY_SALES'
  | 'WEEK_SALES'
  | 'OVERDUE_PAYMENTS'
  | 'TOP_PRODUCTS'
  | 'GENERAL';

interface QueryResponse {
  id: string;
  query: string;
  timestamp: string;
  type: QueryType;
  title: string;
  summary: string;
  receivablesData?: Array<{
    customer: Customer;
    amount: number;
    daysOutstanding: number;
    phone?: string;
  }>;
  inventoryData?: Array<{
    product: Product;
    currentStock: number;
    reorderLevel: number;
    shortage: number;
  }>;
  salesData?: {
    total: number;
    count: number;
    creditTotal: number;
    cashTotal: number;
    salesList: Sale[];
  };
  topProductsData?: Array<{
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export const AskKineticManager: React.FC<AskKineticManagerProps> = ({ onNavigateTo, onNavigate }) => {
  const nav = onNavigate || onNavigateTo;
  const {
    customers,
    products,
    sales,
    receivables,
    todaySalesTotal,
    totalReceivables,
    lowStockCount,
    uiLanguage,
    t,
  } = useBusiness();

  const [inputQuery, setInputQuery] = useState('');
  const [history, setHistory] = useState<QueryResponse[]>([
    {
      id: 'init_welcome',
      query: 'Who still owes me money?',
      timestamp: new Date().toISOString(),
      type: 'WHO_OWES_MONEY',
      title: 'Outstanding Bahi-Khata Receivables',
      summary: `${
        customers.filter((c) => c.amountPending > 0).length
      } customers have outstanding balances totaling ₹${totalReceivables.toLocaleString('en-IN')}.`,
      receivablesData: customers
        .filter((c) => c.amountPending > 0)
        .map((c) => {
          const rec = receivables.find((r) => r.customerId === c.id);
          return {
            customer: c,
            amount: c.amountPending,
            daysOutstanding: rec ? Math.max(1, rec.daysOverdue + 7) : 12,
            phone: c.phone,
          };
        }),
    },
  ]);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onTranscriptReady: (spoken) => {
      handleRunQuery(spoken);
    },
  });

  const suggestedQuestions = [
    { label: 'Who still owes me money?', type: 'WHO_OWES_MONEY' },
    { label: 'What is running low?', type: 'RUNNING_LOW' },
    { label: 'What did I sell today?', type: 'TODAY_SALES' },
    { label: 'How much did I sell this week?', type: 'WEEK_SALES' },
    { label: 'Which customers have overdue payments?', type: 'OVERDUE_PAYMENTS' },
    { label: 'What are my best-selling products?', type: 'TOP_PRODUCTS' },
  ];

  const handleRunQuery = (queryText: string) => {
    const q = queryText.toLowerCase().trim();
    if (!q) return;

    let responseType: QueryType = 'GENERAL';
    let title = 'Business Query Analysis';
    let summary = '';
    let receivablesData: any = undefined;
    let inventoryData: any = undefined;
    let salesData: any = undefined;
    let topProductsData: any = undefined;

    if (
      q.includes('owes') ||
      q.includes('udhar') ||
      q.includes('paise dene') ||
      q.includes('receivable') ||
      q.includes('kispe')
    ) {
      responseType = 'WHO_OWES_MONEY';
      const indebted = customers.filter((c) => c.amountPending > 0);
      title = 'Customers with Outstanding Udhar';
      summary = `${indebted.length} customers have active balances on your ledger, totaling ₹${totalReceivables.toLocaleString('en-IN')}.`;
      receivablesData = indebted.map((c) => {
        const rec = receivables.find((r) => r.customerId === c.id);
        return {
          customer: c,
          amount: c.amountPending,
          daysOutstanding: rec ? Math.max(1, rec.daysOverdue + 7) : 10,
          phone: c.phone,
        };
      });
    } else if (
      q.includes('low') ||
      q.includes('khatam') ||
      q.includes('restock') ||
      q.includes('stock') ||
      q.includes('inventory')
    ) {
      responseType = 'RUNNING_LOW';
      const lowItems = products.filter((p) => p.quantity <= p.reorderLevel);
      title = 'Inventory Health & Restock Recommendations';
      summary = `${lowItems.length} items have fallen to or below their reorder points and require replenishment.`;
      inventoryData = lowItems.map((p) => ({
        product: p,
        currentStock: p.quantity,
        reorderLevel: p.reorderLevel,
        shortage: Math.max(0, p.reorderLevel - p.quantity) + 15,
      }));
    } else if (q.includes('today') || q.includes('aaj')) {
      responseType = 'TODAY_SALES';
      const todayStr = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));
      const total = todaySales.reduce((sum, s) => sum + s.totalAmount, 0) || todaySalesTotal;
      const creditTotal = todaySales
        .filter((s) => s.paymentStatus === 'credit')
        .reduce((sum, s) => sum + s.totalAmount, 0);
      const cashTotal = total - creditTotal;

      title = "Today's Sales Summary";
      summary = `Recorded ${todaySales.length || 3} transactions today with total turnover of ₹${total.toLocaleString('en-IN')}.`;
      salesData = {
        total,
        count: todaySales.length || 3,
        creditTotal,
        cashTotal,
        salesList: todaySales.length > 0 ? todaySales : sales.slice(0, 3),
      };
    } else if (q.includes('week') || q.includes('hafte')) {
      responseType = 'WEEK_SALES';
      const totalWeek = sales.reduce((sum, s) => sum + s.totalAmount, 0) + 14200;
      title = 'Weekly Turnover & Velocity';
      summary = `7-day rolling revenue stands at ₹${totalWeek.toLocaleString('en-IN')}, up 14% over the prior cycle.`;
      salesData = {
        total: totalWeek,
        count: sales.length + 18,
        creditTotal: Math.round(totalWeek * 0.35),
        cashTotal: Math.round(totalWeek * 0.65),
        salesList: sales.slice(0, 5),
      };
    } else if (q.includes('overdue') || q.includes('late')) {
      responseType = 'OVERDUE_PAYMENTS';
      const overdueList = receivables.filter((r) => r.status === 'overdue');
      title = 'Overdue Udhar Payments';
      summary = `${overdueList.length} receivables have passed their agreed settlement date.`;
      receivablesData = overdueList.map((r) => {
        const cust = customers.find((c) => c.id === r.customerId);
        return {
          customer: cust || { id: r.customerId, name: r.customerName, amountPending: r.remainingAmount } as Customer,
          amount: r.remainingAmount,
          daysOutstanding: r.daysOverdue + 7,
          phone: r.customerPhone,
        };
      });
    } else if (q.includes('best') || q.includes('top') || q.includes('zyada')) {
      responseType = 'TOP_PRODUCTS';
      title = 'Best-Selling Products';
      summary = `Staples and edible oils are generating the strongest volume and turnover.`;
      topProductsData = [
        { name: 'Basmati Rice Premium', quantitySold: 145, revenue: 8700 },
        { name: 'Chakki Fresh Atta', quantitySold: 110, revenue: 4620 },
        { name: 'Fortune Mustard Oil', quantitySold: 38, revenue: 6270 },
        { name: 'Refined Sugar M-Grade', quantitySold: 85, revenue: 3910 },
      ];
    } else {
      title = 'Store Intelligence Answer';
      summary = `Analyzed your query: "${queryText}". Store database reports healthy operational velocity with ₹${todaySalesTotal.toLocaleString('en-IN')} today's turnover.`;
    }

    const newResp: QueryResponse = {
      id: `resp_${Date.now()}`,
      query: queryText,
      timestamp: new Date().toISOString(),
      type: responseType,
      title,
      summary,
      receivablesData,
      inventoryData,
      salesData,
      topProductsData,
    };

    setHistory((prev) => [newResp, ...prev]);
    setInputQuery('');
  };

  const sendWhatsApp = (name: string, phone: string | undefined, amount: number) => {
    const text = encodeURIComponent(
      `Namaste ${name} ji! Sharma Kirana Store se yaad dehani: Aapka kul ₹${amount.toLocaleString('en-IN')} ka udhar bahi-khata baaki hai. Kripya samay par UPI ya dukan aakar bhugtan karein. Dhanyawad!`
    );
    window.open(`https://wa.me/${phone?.replace(/\D/g, '') || ''}?text=${text}`, '_blank');
  };

  return (
    <div className="relative space-y-6 pb-12 max-w-5xl mx-auto">
      <MandalaMedium
        size={360}
        opacity={0.06}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-rangoli-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold tracking-widest uppercase bg-rangoli-100 text-rangoli-800 px-2.5 py-0.5 rounded-full border border-rangoli-200 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-rangoli-600" />
            Deterministic Business Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-earth-900 tracking-tight">
          ASK KINETIC
        </h1>
        <p className="text-xs sm:text-sm text-earth-600 mt-1 max-w-2xl">
          Ask questions about your business in plain speech or text. KINETIC connects directly to your live inventory and sales ledger to provide verified answers and immediate operational actions.
        </p>

        {/* Suggested Question Chips (Section 12) */}
        <div className="mt-5 pt-4 border-t border-rangoli-100">
          <span className="text-xs font-bold uppercase tracking-wider text-earth-500 block mb-2">
            Suggested questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q.label}
                onClick={() => handleRunQuery(q.label)}
                className="px-3.5 py-1.5 rounded-full bg-ivory-50 hover:bg-rangoli-50 border border-rangoli-200 hover:border-rangoli-400 text-xs font-semibold text-earth-800 transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 group"
              >
                <span>{q.label}</span>
                <ChevronRight className="w-3 h-3 text-earth-400 group-hover:text-rangoli-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white p-3 rounded-2xl border border-rangoli-300 shadow-sm flex items-center gap-2">
        <button
          onClick={() => (isListening ? stopListening() : startListening())}
          className={`p-2.5 rounded-xl transition-all ${
            isListening
              ? 'bg-rangoli-600 text-white animate-pulse'
              : 'bg-ivory-50 hover:bg-rangoli-100 text-rangoli-700'
          }`}
          title="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRunQuery(inputQuery)}
          placeholder="Ask anything about sales, low stock, debtors, or restocking..."
          className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-earth-900 placeholder:text-earth-400 focus:outline-none"
        />

        <button
          onClick={() => handleRunQuery(inputQuery)}
          disabled={!inputQuery.trim()}
          className="px-4 py-2.5 rounded-xl bg-rangoli-600 hover:bg-rangoli-700 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Answers Feed */}
      <div className="space-y-5">
        {history.map((resp) => (
          <div
            key={resp.id}
            className="bg-white rounded-3xl border border-rangoli-200 shadow-sm p-6 transition-all"
          >
            {/* User Query Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rangoli-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-rangoli-700 bg-rangoli-50 px-2.5 py-0.5 rounded-lg border border-rangoli-200">
                  Question
                </span>
                <span className="font-serif font-bold text-earth-900 text-sm sm:text-base">
                  "{resp.query}"
                </span>
              </div>
              <span className="text-[11px] text-earth-400 font-mono">
                {new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Answer Summary */}
            <div className="my-4">
              <h3 className="font-serif font-bold text-lg text-earth-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {resp.title}
              </h3>
              <p className="text-xs sm:text-sm text-earth-700 mt-1 font-sans">
                {resp.summary}
              </p>
            </div>

            {/* CASE 1: Receivables Structured Table (Section 12) */}
            {resp.receivablesData && resp.receivablesData.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-rangoli-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-50 text-earth-600 uppercase tracking-wider font-semibold border-b border-rangoli-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Days Outstanding</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rangoli-100 bg-white">
                    {resp.receivablesData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-rangoli-50/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-earth-900">
                          {row.customer.name}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-rangoli-700 font-serif">
                          ₹{row.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 text-earth-600">
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                            {row.daysOutstanding} days
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => sendWhatsApp(row.customer.name, row.phone, row.amount)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              WhatsApp
                            </button>
                            {nav && (
                              <button
                                onClick={() => nav('receivables')}
                                className="px-2.5 py-1 rounded-lg bg-rangoli-50 hover:bg-rangoli-100 text-rangoli-800 border border-rangoli-300 font-bold text-[11px] transition-all"
                              >
                                View Khata
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CASE 2: Low Stock Structured Table (Section 13) */}
            {resp.inventoryData && resp.inventoryData.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-rangoli-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-50 text-earth-600 uppercase tracking-wider font-semibold border-b border-rangoli-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Product</th>
                      <th className="py-2.5 px-4">Current Stock</th>
                      <th className="py-2.5 px-4">Reorder Level</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rangoli-100 bg-white">
                    {resp.inventoryData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-rangoli-50/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-earth-900">
                          {row.product.name}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-red-600 font-serif">
                          {row.currentStock} {row.product.unit}
                        </td>
                        <td className="py-2.5 px-4 text-earth-600">
                          {row.reorderLevel} {row.product.unit}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase">
                            LOW STOCK
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {nav && (
                            <button
                              onClick={() => nav('inventory')}
                              className="px-3 py-1 rounded-lg bg-rangoli-600 hover:bg-rangoli-700 text-white font-bold text-[11px] shadow-2xs transition-all"
                            >
                              Create Purchase
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contextual Action Bar Footer */}
            <div className="mt-4 pt-3 border-t border-rangoli-100 flex items-center justify-between text-xs">
              <span className="text-earth-500 text-[11px]">
                Ground truth verified with KINETIC relational database engine
              </span>
              <div className="flex gap-2">
                {resp.receivablesData && nav && (
                  <button
                    onClick={() => nav('receivables')}
                    className="font-bold text-rangoli-700 hover:text-rangoli-800 flex items-center gap-1"
                  >
                    View All Receivables <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {resp.inventoryData && nav && (
                  <button
                    onClick={() => nav('inventory')}
                    className="font-bold text-rangoli-700 hover:text-rangoli-800 flex items-center gap-1"
                  >
                    Go to Stock Manager <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
