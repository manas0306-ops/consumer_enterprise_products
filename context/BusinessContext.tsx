'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Business,
  Product,
  Customer,
  Supplier,
  Sale,
  Purchase,
  Receivable,
  Alert,
  ModelTelemetry,
  PaymentStatus,
  AIIntentResult,
} from '@/types';
import {
  initialBusiness,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialReceivables,
  initialTelemetry,
} from '@/lib/db/initialData';

import { getLocaleConfig } from '@/lib/i18n/locales.config';
import { translate, TranslationNamespace } from '@/lib/i18n/translations';
import { CalendarSystem } from '@/lib/i18n/formatters';

interface BusinessContextType {
  business: Business;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  receivables: Receivable[];
  alerts: Alert[];
  telemetry: ModelTelemetry;
  // Three Language States (PRD §5)
  uiLanguage: string;
  setUiLanguage: (locale: string) => void;
  inputLanguage: string;
  setInputLanguage: (lang: string) => void;
  responseLanguages: string[];
  setResponseLanguages: (langs: string[]) => void;
  // Internationalization helper
  t: (namespace: TranslationNamespace, key: string, fallback?: string) => string;
  // Calendar System (PRD §6.10)
  calendarSystem: CalendarSystem;
  setCalendarSystem: (system: CalendarSystem) => void;
  // Rangoli Theme Toggle (Rangoli Removal Test §2 & §34)
  showRangoli: boolean;
  setShowRangoli: (show: boolean) => void;
  // Language Modal state
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  // 8-second Transaction Undo Gate (Design System §19)
  canUndo: boolean;
  lastUndoMessage: string | null;
  undoLastTransaction: () => boolean;
  updateBusiness: (data: Partial<Business>) => void;
  recordSale: (saleInput: {
    customerName: string;
    customerPhone?: string;
    items: { productName: string; quantity: number; unitPrice?: number; unit?: string }[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentDueDate?: string;
    notes?: string;
  }) => { success: boolean; sale: Sale; message: string };
  recordPurchase: (purchaseInput: {
    supplierName: string;
    items: { productName: string; quantity: number; unitPrice: number; unit?: string }[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
  }) => { success: boolean; purchase: Purchase; message: string };
  recordPayment: (paymentInput: {
    customerId: string;
    amount: number;
    paymentMode: 'cash' | 'upi' | 'bank_transfer';
    notes?: string;
  }) => { success: boolean; message: string };
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  dismissAlert: (id: string) => void;
  recordTelemetry: (isCloud: boolean, latencyMs: number, tokens: number) => void;
  resetToDemo: () => void;
  resetToBlank: () => void;
  // Computed dynamic metrics
  todaySalesTotal: number;
  totalReceivables: number;
  totalInventoryValue: number;
  lowStockCount: number;
  pendingPaymentsCount: number;
  overdueReceivablesTotal: number;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEY = 'kinetic_msme_state_v1';

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [telemetry, setTelemetry] = useState<ModelTelemetry>(initialTelemetry);
  const [isHydrated, setIsHydrated] = useState(false);

  // Multilingual & Locale State
  const [uiLanguage, setUiLanguageState] = useState<string>('pa-IN');
  const [inputLanguage, setInputLanguage] = useState<string>('hi-IN');
  const [responseLanguages, setResponseLanguages] = useState<string[]>(['pa-IN', 'en-US']);
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('indian');
  const [showRangoli, setShowRangoli] = useState<boolean>(true);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  // Undo Stack (8-second window)
  const [undoSnapshot, setUndoSnapshot] = useState<{
    saleId?: string;
    productRollbacks?: { id: string; quantityToAdd: number }[];
    receivableId?: string;
    message: string;
  } | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [lastUndoMessage, setLastUndoMessage] = useState<string | null>(null);

  const setUiLanguage = (locale: string) => {
    setUiLanguageState(locale);
    const cfg = getLocaleConfig(locale);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = cfg.dir;
      document.documentElement.lang = cfg.code;
    }
    setCalendarSystem(cfg.calendarDefault);
    setResponseLanguages([locale, 'en-US']);
  };

  const t = (namespace: TranslationNamespace, key: string, fallback?: string): string => {
    return translate(uiLanguage, namespace, key, fallback).text;
  };

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.business) setBusiness(parsed.business);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.receivables) setReceivables(parsed.receivables);
        if (parsed.telemetry) setTelemetry(parsed.telemetry);
      }
    } catch (e) {
      console.warn('Could not parse stored business data, using defaults', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage whenever critical collections change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          business,
          products,
          customers,
          suppliers,
          sales,
          receivables,
          telemetry,
        })
      );
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [business, products, customers, suppliers, sales, receivables, telemetry, isHydrated]);

  // Recalculate dynamic alerts based on live inventory and receivables state
  useEffect(() => {
    const newAlerts: Alert[] = [];

    // 1. Inventory Alerts (Low stock and Out of stock)
    products.forEach((prod) => {
      if (prod.quantity <= 0) {
        newAlerts.push({
          id: `alert_oos_${prod.id}`,
          type: 'out_of_stock',
          title: 'Stock Depleted',
          message: `${prod.name} is completely OUT OF STOCK (0 ${prod.unit}). Customers cannot purchase.`,
          severity: 'danger',
          actionableEntity: { type: 'product', id: prod.id, name: prod.name },
          actionLabel: 'Record Purchase',
          actionType: 'reorder',
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      } else if (prod.quantity <= prod.reorderLevel) {
        newAlerts.push({
          id: `alert_low_${prod.id}`,
          type: 'low_stock',
          title: 'Low Stock Threshold Reached',
          message: `${prod.name} has only ${prod.quantity} ${prod.unit} left (Reorder level: ${prod.reorderLevel} ${prod.unit}).`,
          severity: 'warning',
          actionableEntity: { type: 'product', id: prod.id, name: prod.name },
          actionLabel: 'Reorder Now',
          actionType: 'reorder',
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 2. Receivables Alerts (Overdue payments)
    receivables.forEach((rec) => {
      if (rec.status === 'overdue' && rec.remainingAmount > 0) {
        newAlerts.push({
          id: `alert_rec_${rec.id}`,
          type: 'overdue_payment',
          title: 'Overdue Udhar Payment',
          message: `${rec.customerName} has an overdue balance of ₹${rec.remainingAmount.toLocaleString('en-IN')} (Due: ${rec.dueDate}).`,
          severity: 'danger',
          actionableEntity: { type: 'customer', id: rec.customerId, name: rec.customerName },
          actionLabel: 'Collect Payment',
          actionType: 'collect_payment',
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 3. Customer High Credit Risk Alert
    customers.forEach((cust) => {
      if (cust.creditLimit && cust.amountPending > cust.creditLimit) {
        newAlerts.push({
          id: `alert_credit_risk_${cust.id}`,
          type: 'credit_threshold',
          title: 'Credit Limit Exceeded',
          message: `${cust.name} owes ₹${cust.amountPending.toLocaleString('en-IN')}, exceeding credit ceiling of ₹${cust.creditLimit.toLocaleString('en-IN')}.`,
          severity: 'warning',
          actionableEntity: { type: 'customer', id: cust.id, name: cust.name },
          actionLabel: 'View Ledger',
          actionType: 'view',
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setAlerts(newAlerts);
  }, [products, receivables, customers]);

  // Telemetry Tracker
  const recordTelemetry = (isCloud: boolean, latencyMs: number, tokens: number) => {
    setTelemetry((prev) => ({
      totalRequests: prev.totalRequests + 1,
      localLightweightRequests: isCloud ? prev.localLightweightRequests : prev.localLightweightRequests + 1,
      cloudLLMRequests: isCloud ? prev.cloudLLMRequests + 1 : prev.cloudLLMRequests,
      estimatedTokensSaved: isCloud ? prev.estimatedTokensSaved : prev.estimatedTokensSaved + tokens,
      avgLatencyMs: Math.round((prev.avgLatencyMs * prev.totalRequests + latencyMs) / (prev.totalRequests + 1)),
      costSavedINR: Number((prev.costSavedINR + (isCloud ? 0 : 0.45)).toFixed(2)),
    }));
  };

  // CORE TRANSACTION ENGINE: Record Sale
  const recordSale = (saleInput: {
    customerName: string;
    customerPhone?: string;
    items: { productName: string; quantity: number; unitPrice?: number; unit?: string }[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentDueDate?: string;
    notes?: string;
  }) => {
    const saleId = `sale_${Date.now()}`;
    const invoiceNo = `INV-2026-${String(sales.length + 101).padStart(4, '0')}`;
    const isCredit = saleInput.paymentStatus === 'credit';
    const isPartial = saleInput.paymentStatus === 'partial';

    // 1. Resolve or Create Customer
    let customer = customers.find(
      (c) => c.name.toLowerCase() === saleInput.customerName.toLowerCase()
    );

    let customerId = customer ? customer.id : `cust_${Date.now()}`;

    if (!customer) {
      // Create new customer automatically
      const newCust: Customer = {
        id: customerId,
        name: saleInput.customerName,
        phone: saleInput.customerPhone || '',
        totalPurchases: saleInput.totalAmount,
        amountPaid: isCredit ? 0 : saleInput.totalAmount,
        amountPending: isCredit ? saleInput.totalAmount : 0,
        creditLimit: 5000,
        lastTransactionDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notes: 'Created via AI / Sale Entry',
      };
      setCustomers((prev) => [...prev, newCust]);
    } else {
      // Update existing customer
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customerId) {
            return {
              ...c,
              totalPurchases: c.totalPurchases + saleInput.totalAmount,
              amountPaid: isCredit ? c.amountPaid : c.amountPaid + saleInput.totalAmount,
              amountPending: isCredit ? c.amountPending + saleInput.totalAmount : c.amountPending,
              lastTransactionDate: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    }

    // 2. Reduce Inventory for Each Sold Item
    const finalItems = saleInput.items.map((item) => {
      // Find matching product in catalog
      const matchedProd = products.find(
        (p) =>
          p.name.toLowerCase().includes(item.productName.toLowerCase()) ||
          item.productName.toLowerCase().includes(p.name.toLowerCase())
      );

      const unitPrice = item.unitPrice || (matchedProd ? matchedProd.sellingPrice : Math.round(saleInput.totalAmount / (item.quantity || 1)));
      const unit = item.unit || (matchedProd ? matchedProd.unit : 'unit');

      if (matchedProd) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === matchedProd.id) {
              const newQty = Math.max(0, p.quantity - item.quantity);
              return {
                ...p,
                quantity: newQty,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          })
        );
      }

      return {
        productId: matchedProd ? matchedProd.id : `prod_${Date.now()}`,
        productName: matchedProd ? matchedProd.name : item.productName,
        quantity: item.quantity,
        unit,
        unitPrice,
        totalPrice: item.quantity * unitPrice,
      };
    });

    // 3. Create Sale Record
    const newSale: Sale = {
      id: saleId,
      invoiceNo,
      customerId,
      customerName: saleInput.customerName,
      items: finalItems,
      totalAmount: saleInput.totalAmount,
      paidAmount: isCredit ? 0 : saleInput.totalAmount,
      balanceAmount: isCredit ? saleInput.totalAmount : 0,
      paymentStatus: saleInput.paymentStatus,
      paymentDueDate: saleInput.paymentDueDate || (isCredit ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : undefined),
      notes: saleInput.notes,
      createdAt: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

    const recId = (isCredit || isPartial) ? `rec_${Date.now()}` : undefined;
    if (isCredit || isPartial) {
      const newReceivable: Receivable = {
        id: recId!,
        customerId,
        customerName: saleInput.customerName,
        customerPhone: saleInput.customerPhone || (customer ? customer.phone : undefined),
        saleId,
        invoiceNo,
        totalAmount: saleInput.totalAmount,
        paidAmount: 0,
        remainingAmount: saleInput.totalAmount,
        dueDate: saleInput.paymentDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        daysOverdue: 0,
        createdAt: new Date().toISOString(),
      };
      setReceivables((prev) => [newReceivable, ...prev]);
    }

    // Design System §19: 8-second Undo Window
    setUndoSnapshot({
      saleId,
      productRollbacks: finalItems.map((item) => ({ id: item.productId, quantityToAdd: item.quantity })),
      receivableId: recId,
      message: `Sale #${invoiceNo} for ₹${saleInput.totalAmount.toLocaleString('en-IN')}`,
    });
    setCanUndo(true);
    setLastUndoMessage(`Sale #${invoiceNo} recorded.`);
    setTimeout(() => {
      setCanUndo(false);
    }, 8000);

    return {
      success: true,
      sale: newSale,
      message: `Sale #${invoiceNo} for ₹${saleInput.totalAmount.toLocaleString('en-IN')} recorded successfully. Inventory & Ledger updated.`,
    };
  };

  const undoLastTransaction = (): boolean => {
    if (!undoSnapshot || !canUndo) return false;
    if (undoSnapshot.saleId) {
      setSales((prev) => prev.filter((s) => s.id !== undoSnapshot.saleId));
    }
    if (undoSnapshot.productRollbacks) {
      setProducts((prev) =>
        prev.map((p) => {
          const match = undoSnapshot.productRollbacks?.find((r) => r.id === p.id);
          if (match) return { ...p, quantity: p.quantity + match.quantityToAdd };
          return p;
        })
      );
    }
    if (undoSnapshot.receivableId) {
      setReceivables((prev) => prev.filter((r) => r.id !== undoSnapshot.receivableId));
    }
    setCanUndo(false);
    setUndoSnapshot(null);
    setLastUndoMessage('Transaction undone successfully.');
    return true;
  };

  // CORE TRANSACTION ENGINE: Record Purchase
  const recordPurchase = (purchaseInput: {
    supplierName: string;
    items: { productName: string; quantity: number; unitPrice: number; unit?: string }[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
  }) => {
    const purchaseId = `pur_${Date.now()}`;
    const invoiceNo = `PUR-2026-${String(Date.now()).slice(-4)}`;

    // 1. Resolve or create Supplier
    let supplier = suppliers.find((s) => s.name.toLowerCase() === purchaseInput.supplierName.toLowerCase());
    let supplierId = supplier ? supplier.id : `sup_${Date.now()}`;

    if (!supplier) {
      const newSup: Supplier = {
        id: supplierId,
        name: purchaseInput.supplierName,
        categories: ['General'],
        totalPurchased: purchaseInput.totalAmount,
        amountPending: purchaseInput.paymentStatus === 'credit' ? purchaseInput.totalAmount : 0,
        createdAt: new Date().toISOString(),
      };
      setSuppliers((prev) => [...prev, newSup]);
    } else {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === supplierId) {
            return {
              ...s,
              totalPurchased: s.totalPurchased + purchaseInput.totalAmount,
              amountPending: purchaseInput.paymentStatus === 'credit' ? s.amountPending + purchaseInput.totalAmount : s.amountPending,
            };
          }
          return s;
        })
      );
    }

    // 2. Increment Product Inventory
    const purchaseItems = purchaseInput.items.map((item) => {
      const matchedProd = products.find(
        (p) =>
          p.name.toLowerCase().includes(item.productName.toLowerCase()) ||
          item.productName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (matchedProd) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === matchedProd.id) {
              return {
                ...p,
                quantity: p.quantity + item.quantity,
                purchasePrice: item.unitPrice || p.purchasePrice,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          })
        );
      } else {
        // Create new product in catalog
        const newProduct: Product = {
          id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: item.productName,
          category: 'General',
          sku: `SKU-${Date.now().toString().slice(-6)}`,
          quantity: item.quantity,
          unit: item.unit || 'unit',
          purchasePrice: item.unitPrice,
          sellingPrice: Math.round(item.unitPrice * 1.25),
          reorderLevel: 10,
          supplierName: purchaseInput.supplierName,
          supplierId,
          updatedAt: new Date().toISOString(),
        };
        setProducts((prev) => [...prev, newProduct]);
      }

      return {
        productId: matchedProd ? matchedProd.id : `prod_${Date.now()}`,
        productName: matchedProd ? matchedProd.name : item.productName,
        quantity: item.quantity,
        unit: item.unit || 'unit',
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      };
    });

    const newPurchase: Purchase = {
      id: purchaseId,
      invoiceNo,
      supplierId,
      supplierName: purchaseInput.supplierName,
      items: purchaseItems,
      totalAmount: purchaseInput.totalAmount,
      paidAmount: purchaseInput.paymentStatus === 'credit' ? 0 : purchaseInput.totalAmount,
      balanceAmount: purchaseInput.paymentStatus === 'credit' ? purchaseInput.totalAmount : 0,
      paymentStatus: purchaseInput.paymentStatus,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      purchase: newPurchase,
      message: `Purchase invoice #${invoiceNo} recorded. Inventory replenished.`,
    };
  };

  // CORE ENGINE: Record Customer Payment Settlement
  const recordPayment = (paymentInput: {
    customerId: string;
    amount: number;
    paymentMode: 'cash' | 'upi' | 'bank_transfer';
    notes?: string;
  }) => {
    let unallocated = paymentInput.amount;

    // 1. Update Customer Pending Balance
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === paymentInput.customerId) {
          const newPending = Math.max(0, c.amountPending - paymentInput.amount);
          return {
            ...c,
            amountPaid: c.amountPaid + paymentInput.amount,
            amountPending: newPending,
            lastTransactionDate: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // 2. Settle Receivables FIFO
    setReceivables((prev) =>
      prev.map((rec) => {
        if (rec.customerId === paymentInput.customerId && rec.remainingAmount > 0 && unallocated > 0) {
          const settlement = Math.min(unallocated, rec.remainingAmount);
          const newRemaining = rec.remainingAmount - settlement;
          const newPaid = rec.paidAmount + settlement;
          unallocated -= settlement;

          return {
            ...rec,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status: newRemaining === 0 ? 'paid' : 'partially_paid',
          };
        }
        return rec;
      })
    );

    return {
      success: true,
      message: `Payment of ₹${paymentInput.amount.toLocaleString('en-IN')} successfully settled against customer ledger.`,
    };
  };

  // CRUD Helpers
  const addProduct = (product: Omit<Product, 'id' | 'updatedAt'>) => {
    const newP: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newP, ...prev]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...product, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newC: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newC, ...prev]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...customer } : c)));
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const updateBusiness = (data: Partial<Business>) => {
    setBusiness((prev) => ({ ...prev, ...data }));
  };

  const resetToDemo = () => {
    setBusiness(initialBusiness);
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setReceivables(initialReceivables);
    setTelemetry(initialTelemetry);
    localStorage.removeItem(STORAGE_KEY);
  };

  const resetToBlank = () => {
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setSales([]);
    setReceivables([]);
    setAlerts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Computed Dynamic Dashboard Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesTotal = sales
    .filter((s) => s.createdAt.startsWith(todayStr))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalReceivables = receivables
    .filter((r) => r.status !== 'paid')
    .reduce((sum, r) => sum + r.remainingAmount, 0);

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.quantity * p.purchasePrice,
    0
  );

  const lowStockCount = products.filter((p) => p.quantity <= p.reorderLevel).length;

  const pendingPaymentsCount = receivables.filter((r) => r.remainingAmount > 0).length;

  const overdueReceivablesTotal = receivables
    .filter((r) => r.status === 'overdue' && r.remainingAmount > 0)
    .reduce((sum, r) => sum + r.remainingAmount, 0);

  return (
    <BusinessContext.Provider
      value={{
        business,
        products,
        customers,
        suppliers,
        sales,
        receivables,
        alerts,
        telemetry,
        uiLanguage,
        setUiLanguage,
        inputLanguage,
        setInputLanguage,
        responseLanguages,
        setResponseLanguages,
        t,
        calendarSystem,
        setCalendarSystem,
        showRangoli,
        setShowRangoli,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        canUndo,
        lastUndoMessage,
        undoLastTransaction,
        updateBusiness,
        recordSale,
        recordPurchase,
        recordPayment,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        dismissAlert,
        recordTelemetry,
        resetToDemo,
        resetToBlank,
        todaySalesTotal,
        totalReceivables,
        totalInventoryValue,
        lowStockCount,
        pendingPaymentsCount,
        overdueReceivablesTotal,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
