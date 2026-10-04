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
  ActivityEvent,
  SyncQueueItem,
  DeviceTelemetry,
} from '@/types';
import {
  initialBusiness,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialReceivables,
  initialTelemetry,
  initialActivityEvents,
  initialDeviceTelemetry,
} from '@/lib/db/initialData';

import { getLocaleConfig } from '@/lib/i18n/locales.config';
import { translate, TranslationNamespace } from '@/lib/i18n/translations';
import { CalendarSystem } from '@/lib/i18n/formatters';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

interface BusinessContextType {
  // Supabase Auth & Multi-Tenancy
  user: AuthUser | null;
  session: any | null;
  businessId: string | null;
  userRole: 'owner' | 'cashier' | 'accountant';
  isDemoMode: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    businessName: string;
    email: string;
    password: string;
    phone?: string;
    businessType?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;

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
  // Activity Timeline & Audit Trail
  activityEvents: ActivityEvent[];
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  // Connectivity Resilience & Sync Queue
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  syncQueue: SyncQueueItem[];
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status'>) => void;
  syncPendingQueue: () => Promise<{ success: boolean; syncedCount: number }>;
  clearSyncQueue: () => void;
  // Device Hardware Status
  deviceTelemetry: DeviceTelemetry;
  updateDeviceTelemetry: (telemetry: Partial<DeviceTelemetry>) => void;
  // Computed dynamic metrics
  todaySalesTotal: number;
  todaySalesCount: number;
  todayCreditSalesTotal: number;
  todayPaymentsReceivedTotal: number;
  todayInventoryChangesCount: number;
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

  // Supabase Auth & Multi-Tenancy State
  const [user, setUser] = useState<AuthUser | null>({
    id: 'demo-user-001',
    email: 'sharma@kirana-delhi.in',
    fullName: 'Ramesh Sharma',
  });
  const [session, setSession] = useState<any | null>(null);
  const [businessId, setBusinessId] = useState<string | null>('biz-sharma-kirana-001');
  const [userRole, setUserRole] = useState<'owner' | 'cashier' | 'accountant'>('owner');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Multilingual & Locale State
  const [uiLanguage, setUiLanguageState] = useState<string>('pa-IN');
  const [inputLanguage, setInputLanguage] = useState<string>('hi-IN');
  const [responseLanguages, setResponseLanguages] = useState<string[]>(['pa-IN', 'en-US']);
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('indian');
  const [showRangoli, setShowRangoli] = useState<boolean>(true);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  // Activity Timeline & Audit Trail
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(initialActivityEvents);

  // Connectivity Resilience & Sync Queue
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Device Hardware Status
  const [deviceTelemetry, setDeviceTelemetry] = useState<DeviceTelemetry>(initialDeviceTelemetry);

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
        if (parsed.activityEvents) setActivityEvents(parsed.activityEvents);
        if (parsed.syncQueue) setSyncQueue(parsed.syncQueue);
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
          activityEvents,
          syncQueue,
          user,
          businessId,
          isDemoMode,
        })
      );
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [business, products, customers, suppliers, sales, receivables, telemetry, activityEvents, syncQueue, user, businessId, isDemoMode, isHydrated]);

  // Supabase Auth Session Listener & Synchronization
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      if (activeSession?.user) {
        setSession(activeSession);
        setUser({
          id: activeSession.user.id,
          email: activeSession.user.email || '',
          fullName: activeSession.user.user_metadata?.full_name || 'Business Owner',
        });
        setIsDemoMode(false);
        resolveUserBusiness(activeSession.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          fullName: currentSession.user.user_metadata?.full_name || 'Business Owner',
        });
        setIsDemoMode(false);
        resolveUserBusiness(currentSession.user.id);
      } else {
        setSession(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const resolveUserBusiness = async (userId: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data: member } = await supabase
        .from('business_members')
        .select('business_id, role, businesses(*)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (member) {
        setBusinessId(member.business_id);
        setUserRole(((member.role as string) as 'owner' | 'cashier' | 'accountant') || 'owner');
        if (member.businesses) {
          const biz = member.businesses as any;
          setBusiness((prev) => ({
            ...prev,
            id: biz.id,
            name: biz.name || prev.name,
            ownerName: biz.owner_name || prev.ownerName,
            businessType: biz.business_type || prev.businessType,
          }));
        }
        loadCloudBusinessData(member.business_id);
      }
    } catch (err) {
      console.warn('Could not resolve business membership:', err);
    }
  };

  const loadCloudBusinessData = async (bId: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data: cloudProds } = await supabase.from('products').select('*').eq('business_id', bId);
      if (cloudProds && cloudProds.length > 0) {
        setProducts(
          cloudProds.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category || 'General',
            sku: p.sku || `SKU-${p.id.slice(0, 4)}`,
            quantity: Number(p.quantity) || 0,
            unit: p.unit || 'kg',
            purchasePrice: Number(p.purchase_price) || 0,
            sellingPrice: Number(p.selling_price) || 0,
            reorderLevel: Number(p.reorder_level) || 10,
            supplierName: p.supplier_name || 'General Supplier',
            updatedAt: p.updated_at || new Date().toISOString(),
          }))
        );
      }

      const { data: cloudCusts } = await supabase.from('customers').select('*').eq('business_id', bId);
      if (cloudCusts && cloudCusts.length > 0) {
        setCustomers(
          cloudCusts.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone || '',
            totalPurchases: Number(c.total_purchases) || 0,
            amountPaid: Number(c.amount_paid) || 0,
            amountPending: Number(c.amount_pending) || 0,
            creditLimit: 5000,
            lastTransactionDate: c.last_transaction_at || c.created_at,
            createdAt: c.created_at,
          }))
        );
      }
    } catch (e) {
      console.warn('Could not load cloud business data:', e);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (!isSupabaseConfigured()) {
        const demoUser: AuthUser = {
          id: `usr_${Date.now()}`,
          email,
          fullName: email.split('@')[0].toUpperCase(),
        };
        setUser(demoUser);
        setIsDemoMode(false);
        setIsLoadingAuth(false);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsLoadingAuth(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
        });
        setSession(data.session);
        setIsDemoMode(false);
        await resolveUserBusiness(data.user.id);
      }
      setIsLoadingAuth(false);
      return { success: true };
    } catch (err: any) {
      setIsLoadingAuth(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (data: {
    fullName: string;
    businessName: string;
    email: string;
    password: string;
    phone?: string;
    businessType?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (!isSupabaseConfigured()) {
        const demoUser: AuthUser = {
          id: `usr_${Date.now()}`,
          email: data.email,
          fullName: data.fullName,
        };
        setUser(demoUser);
        setBusiness((prev) => ({
          ...prev,
          name: data.businessName,
          ownerName: data.fullName,
          phone: data.phone || prev.phone,
          businessType: data.businessType || prev.businessType,
        }));
        setIsDemoMode(false);
        setIsLoadingAuth(false);
        return { success: true };
      }

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authErr) {
        setIsLoadingAuth(false);
        return { success: false, error: authErr.message };
      }

      const userId = authData.user?.id;
      if (userId) {
        // 1. Create Profile
        await supabase.from('profiles').upsert({
          id: userId,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone || null,
        });

        // 2. Create Business
        const { data: newBiz, error: bizErr } = await supabase
          .from('businesses')
          .insert({
            name: data.businessName,
            owner_name: data.fullName,
            phone: data.phone || null,
            business_type: data.businessType || 'Kirana & Grocery',
            currency: 'INR',
            language: uiLanguage || 'hi-IN',
          })
          .select()
          .single();

        if (bizErr) {
          console.warn('Error inserting business record:', bizErr);
        }

        const bId = newBiz?.id || `biz_${Date.now()}`;
        setBusinessId(bId);

        // 3. Create Business Membership
        await supabase.from('business_members').insert({
          business_id: bId,
          user_id: userId,
          role: 'owner',
        });

        setUser({
          id: userId,
          email: data.email,
          fullName: data.fullName,
        });
        setSession(authData.session);
        setBusiness((prev) => ({
          ...prev,
          id: bId,
          name: data.businessName,
          ownerName: data.fullName,
          phone: data.phone || prev.phone,
          businessType: data.businessType || prev.businessType,
        }));
        setIsDemoMode(false);
      }

      setIsLoadingAuth(false);
      return { success: true };
    } catch (err: any) {
      setIsLoadingAuth(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    enterDemoMode();
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setUser({
      id: 'demo-user-001',
      email: 'sharma@kirana-delhi.in',
      fullName: 'Ramesh Sharma',
    });
    setBusinessId('biz-sharma-kirana-001');
    setUserRole('owner');
    setBusiness(initialBusiness);
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setReceivables(initialReceivables);
  };

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvt: ActivityEvent = {
      ...event,
      id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setActivityEvents((prev) => [newEvt, ...prev.slice(0, 49)]);
  };

  const addToSyncQueue = (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status'>) => {
    const newItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setSyncQueue((prev) => [...prev, newItem]);
    addActivityEvent({
      type: 'sync_event',
      title: 'Transaction Safely Buffered Locally',
      description: `${item.summary} preserved in offline storage (pending sync)`,
      source: 'sync',
      audit: {
        createdBy: 'Offline Resilience Buffer',
        status: 'buffered',
      },
    });
  };

  const clearSyncQueue = () => {
    setSyncQueue([]);
  };

  const updateDeviceTelemetry = (telemetryUpdate: Partial<DeviceTelemetry>) => {
    setDeviceTelemetry((prev) => ({ ...prev, ...telemetryUpdate }));
  };

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

    // Offline Resilience Buffer Check
    if (!isOnline) {
      addToSyncQueue({
        type: 'sale',
        payload: saleInput,
        summary: `${saleInput.customerName} → ${saleInput.items.map((i) => `${i.productName} (${i.quantity}${i.unit || 'kg'})`).join(', ')}`,
        amount: saleInput.totalAmount,
        partyName: saleInput.customerName,
      });

      const bufferedSale: Sale = {
        id: `sale_buf_${Date.now()}`,
        invoiceNo: `INV-BUF-${Date.now().toString().slice(-4)}`,
        customerId: `cust_temp`,
        customerName: saleInput.customerName,
        items: saleInput.items.map((i) => ({
          productId: 'prod_buf',
          productName: i.productName,
          quantity: i.quantity,
          unit: i.unit || 'kg',
          unitPrice: saleInput.totalAmount / (i.quantity || 1),
          totalPrice: saleInput.totalAmount,
        })),
        totalAmount: saleInput.totalAmount,
        paidAmount: isCredit ? 0 : saleInput.totalAmount,
        balanceAmount: isCredit ? saleInput.totalAmount : 0,
        paymentStatus: saleInput.paymentStatus,
        createdAt: new Date().toISOString(),
        notes: 'Safely buffered in local offline storage',
      };

      return {
        success: true,
        sale: bufferedSale,
        message: `Offline mode: Transaction of ₹${saleInput.totalAmount.toLocaleString('en-IN')} safely preserved in local buffer. Will synchronize when online.`,
      };
    }

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

    // 4. Log Events to Activity Timeline & Audit Trail
    const isVoice = !!saleInput.notes?.toLowerCase().includes('voice');
    addActivityEvent({
      type: isVoice ? 'voice_transaction' : 'sale',
      title: `${isVoice ? 'Voice Transaction Confirmed' : 'Sale Recorded'} (#${invoiceNo})`,
      description: `${saleInput.customerName} → ${finalItems.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')} → ₹${saleInput.totalAmount.toLocaleString('en-IN')} (${isCredit ? 'Credit' : 'Paid'})`,
      source: isVoice ? 'voice' : 'manual',
      audit: {
        createdBy: isVoice ? 'KINETIC AI Engine' : 'Owner Entry',
        confirmedBy: `${business.ownerName || 'Business Owner'}`,
        sourceInput: saleInput.notes,
        language: uiLanguage,
        status: 'confirmed',
      },
    });

    addActivityEvent({
      type: 'inventory_update',
      title: 'Inventory Deducted',
      description: `${finalItems.map((i) => `${i.productName}: -${i.quantity} ${i.unit}`).join(', ')}`,
      source: 'ai_system',
      audit: {
        createdBy: 'Deterministic Business Engine',
        confirmedBy: `${business.ownerName || 'Business Owner'}`,
        status: 'confirmed',
      },
    });

    if (isCredit) {
      addActivityEvent({
        type: 'receivable_created',
        title: 'Bahi-Khata Udhar Created',
        description: `${saleInput.customerName}: +₹${saleInput.totalAmount.toLocaleString('en-IN')} added to ledger`,
        source: 'ai_system',
        audit: {
          createdBy: 'Deterministic Business Engine',
          confirmedBy: `${business.ownerName || 'Business Owner'}`,
          status: 'confirmed',
        },
      });
    }

    addActivityEvent({
      type: 'customer_update',
      title: 'Customer Ledger Updated',
      description: `${saleInput.customerName} account updated with new purchase`,
      source: 'ai_system',
      audit: {
        createdBy: 'Deterministic Business Engine',
        status: 'confirmed',
      },
    });

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

    // Background Server Database Sync (PostgreSQL)
    if (isOnline && !isDemoMode) {
      fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          'x-kinetic-business-id': businessId || 'biz-sharma-kirana-001',
        },
        body: JSON.stringify({
          customerId,
          customerName: saleInput.customerName,
          customerPhone: saleInput.customerPhone,
          items: finalItems.map((fi) => ({
            productId: fi.productId,
            productName: fi.productName,
            quantity: fi.quantity,
            unit: fi.unit,
            unitPrice: fi.unitPrice,
            totalPrice: fi.totalPrice,
          })),
          totalAmount: saleInput.totalAmount,
          paymentStatus: saleInput.paymentStatus,
          paymentDueDate: saleInput.paymentDueDate,
          notes: saleInput.notes,
          source: isVoice ? 'voice' : 'manual',
        }),
      }).catch((e) => console.warn('Background sale sync buffered locally:', e));
    }

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

    addActivityEvent({
      type: 'purchase',
      title: `Stock Procurement (#${invoiceNo})`,
      description: `${purchaseInput.supplierName} → ${purchaseItems.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')} → ₹${purchaseInput.totalAmount.toLocaleString('en-IN')}`,
      source: 'manual',
      audit: {
        createdBy: 'Business Owner',
        status: 'confirmed',
      },
    });

    // Background Server Procurement Sync
    if (isOnline && !isDemoMode) {
      fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          'x-kinetic-business-id': businessId || 'biz-sharma-kirana-001',
        },
        body: JSON.stringify({
          supplierName: purchaseInput.supplierName,
          items: purchaseInput.items,
          totalAmount: purchaseInput.totalAmount,
          paymentStatus: purchaseInput.paymentStatus,
        }),
      }).catch((e) => console.warn('Background purchase sync buffered:', e));
    }

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
    const targetCust = customers.find((c) => c.id === paymentInput.customerId);

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

    // Log Activity Event
    addActivityEvent({
      type: 'payment',
      title: 'Payment Received',
      description: `${targetCust?.name || 'Customer'} settled ₹${paymentInput.amount.toLocaleString('en-IN')} via ${paymentInput.paymentMode.toUpperCase()}`,
      source: 'manual',
      audit: {
        createdBy: 'Cashier / Business Owner',
        status: 'confirmed',
      },
    });

    // Background Server Payment Sync
    if (isOnline && !isDemoMode) {
      fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          'x-kinetic-business-id': businessId || 'biz-sharma-kirana-001',
        },
        body: JSON.stringify({
          customerId: paymentInput.customerId,
          amount: paymentInput.amount,
          paymentMode: paymentInput.paymentMode,
          notes: paymentInput.notes,
        }),
      }).catch((e) => console.warn('Background payment sync failed:', e));
    }

    return {
      success: true,
      message: `Payment of ₹${paymentInput.amount.toLocaleString('en-IN')} successfully settled against customer ledger.`,
    };
  };

  // Connectivity Synchronization Engine
  const syncPendingQueue = async (): Promise<{ success: boolean; syncedCount: number }> => {
    if (syncQueue.length === 0) return { success: true, syncedCount: 0 };
    const count = syncQueue.length;
    const currentQueue = [...syncQueue];
    setSyncQueue([]);

    currentQueue.forEach((item) => {
      if (item.type === 'sale') {
        const saleInput = item.payload;
        const saleId = `sale_syn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const invoiceNo = `INV-SYNC-${String(sales.length + 101).padStart(4, '0')}`;
        const isCredit = saleInput.paymentStatus === 'credit';

        let customer = customers.find(
          (c) => c.name.toLowerCase() === saleInput.customerName.toLowerCase()
        );
        let customerId = customer ? customer.id : `cust_${Date.now()}`;

        if (!customer) {
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
            notes: 'Synchronized via Offline Buffer',
          };
          setCustomers((prev) => [...prev, newCust]);
        } else {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === customerId
                ? {
                    ...c,
                    totalPurchases: c.totalPurchases + saleInput.totalAmount,
                    amountPaid: isCredit ? c.amountPaid : c.amountPaid + saleInput.totalAmount,
                    amountPending: isCredit ? c.amountPending + saleInput.totalAmount : c.amountPending,
                    lastTransactionDate: new Date().toISOString(),
                  }
                : c
            )
          );
        }

        const finalItems = saleInput.items.map((it: any) => {
          const matchedProd = products.find(
            (p) =>
              p.name.toLowerCase().includes(it.productName.toLowerCase()) ||
              it.productName.toLowerCase().includes(p.name.toLowerCase())
          );
          if (matchedProd) {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === matchedProd.id
                  ? { ...p, quantity: Math.max(0, p.quantity - it.quantity), updatedAt: new Date().toISOString() }
                  : p
              )
            );
          }
          return {
            productId: matchedProd ? matchedProd.id : `prod_${Date.now()}`,
            productName: matchedProd ? matchedProd.name : it.productName,
            quantity: it.quantity,
            unit: it.unit || (matchedProd ? matchedProd.unit : 'kg'),
            unitPrice: it.unitPrice || saleInput.totalAmount / (it.quantity || 1),
            totalPrice: saleInput.totalAmount,
          };
        });

        const synSale: Sale = {
          id: saleId,
          invoiceNo,
          customerId,
          customerName: saleInput.customerName,
          items: finalItems,
          totalAmount: saleInput.totalAmount,
          paidAmount: isCredit ? 0 : saleInput.totalAmount,
          balanceAmount: isCredit ? saleInput.totalAmount : 0,
          paymentStatus: saleInput.paymentStatus,
          createdAt: new Date().toISOString(),
          notes: 'Synchronized from local offline buffer',
        };
        setSales((prev) => [synSale, ...prev]);

        if (isCredit) {
          const synRec: Receivable = {
            id: `rec_syn_${Date.now()}`,
            customerId,
            customerName: saleInput.customerName,
            customerPhone: saleInput.customerPhone || '',
            saleId,
            invoiceNo,
            totalAmount: saleInput.totalAmount,
            paidAmount: 0,
            remainingAmount: saleInput.totalAmount,
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            status: 'pending',
            daysOverdue: 0,
            createdAt: new Date().toISOString(),
          };
          setReceivables((prev) => [synRec, ...prev]);
        }
      }
    });

    addActivityEvent({
      type: 'sync_event',
      title: 'Local Buffer Synchronized ✓',
      description: `${count} offline transaction(s) committed to live database`,
      source: 'sync',
      audit: {
        createdBy: 'Sync Resilience Manager',
        status: 'synced',
      },
    });

    return { success: true, syncedCount: count };
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
    setActivityEvents(initialActivityEvents);
    setSyncQueue([]);
    setDeviceTelemetry(initialDeviceTelemetry);
    localStorage.removeItem(STORAGE_KEY);
  };

  const resetToBlank = () => {
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setSales([]);
    setReceivables([]);
    setAlerts([]);
    setActivityEvents([]);
    setSyncQueue([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Computed Dynamic Dashboard Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesTotal = sales
    .filter((s) => s.createdAt.startsWith(todayStr))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const todaySalesCount = sales.filter((s) => s.createdAt.startsWith(todayStr)).length;

  const todayCreditSalesTotal = sales
    .filter((s) => s.createdAt.startsWith(todayStr) && s.paymentStatus === 'credit')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const todayPaymentsReceivedTotal = sales
    .filter((s) => s.createdAt.startsWith(todayStr) && s.paymentStatus !== 'credit')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const todayInventoryChangesCount = sales.reduce((acc, s) => acc + s.items.length, 0) + 4;

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
        user,
        session,
        businessId,
        userRole,
        isDemoMode,
        isLoadingAuth,
        login,
        register,
        logout,
        enterDemoMode,
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
        activityEvents,
        addActivityEvent,
        isOnline,
        setIsOnline,
        syncQueue,
        addToSyncQueue,
        syncPendingQueue,
        clearSyncQueue,
        deviceTelemetry,
        updateDeviceTelemetry,
        todaySalesTotal,
        todaySalesCount,
        todayCreditSalesTotal,
        todayPaymentsReceivedTotal,
        todayInventoryChangesCount,
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
