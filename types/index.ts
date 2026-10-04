export type PaymentStatus = 'cash' | 'upi' | 'credit' | 'partial';
export type ReceivableStatus = 'paid' | 'partially_paid' | 'pending' | 'overdue';
export type AlertSeverity = 'info' | 'warning' | 'danger' | 'success';
export type AlertType = 'low_stock' | 'out_of_stock' | 'overdue_payment' | 'credit_threshold' | 'unusual_sales';
export type AIModelType = 'local-lightweight' | 'gemini-cloud';
export type LanguageType = string;

export interface TransactionLanguageMeta {
  source_language: string;
  ui_language: string;
  response_languages: string[];
  original_transcript: string;
  translated_text: string;
  english_representation: string;
  detection_confidence: number;
}

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  businessType: string;
  currency: string;
  address?: string;
  gstin?: string;
  languagePreference: LanguageType;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameHindi?: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string; // 'kg', 'g', 'litre', 'packet', 'pcs', 'sack', 'box'
  purchasePrice: number;
  sellingPrice: number;
  reorderLevel: number;
  supplierName?: string;
  supplierId?: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  amountPaid: number;
  amountPending: number;
  creditLimit?: number;
  lastTransactionDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  categories: string[];
  totalPurchased: number;
  amountPending: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  paymentDueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  partyType: 'customer' | 'supplier';
  partyId: string;
  partyName: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  relatedInvoiceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface Receivable {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  saleId: string;
  invoiceNo: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: ReceivableStatus;
  daysOverdue: number;
  lastReminderSent?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  actionableEntity?: {
    type: 'product' | 'customer' | 'receivable';
    id: string;
    name: string;
  };
  actionLabel?: string;
  actionType?: 'reorder' | 'collect_payment' | 'view';
  dismissed: boolean;
  createdAt: string;
}

export interface AIIntentResult {
  intent: 
    | 'CREATE_SALE'
    | 'CREATE_PURCHASE'
    | 'UPDATE_INVENTORY'
    | 'CHECK_INVENTORY'
    | 'CHECK_RECEIVABLE'
    | 'CUSTOMER_LOOKUP'
    | 'SALES_ANALYSIS'
    | 'BUSINESS_SUMMARY'
    | 'CREATE_REMINDER'
    | 'RECORD_PAYMENT'
    | 'GENERAL_BUSINESS_QUERY';
  confidence: number;
  detectedLanguage: LanguageType;
  isAmbiguous: boolean;
  requiresConfirmation: boolean;
  extractedEntities: {
    customerName?: string;
    supplierName?: string;
    productName?: string;
    quantity?: number;
    unit?: string;
    items?: Array<{ productName: string; quantity: number; unit: string; unitPrice?: number; totalPrice?: number }>;
    amount?: number;
    paymentStatus?: PaymentStatus;
    expectedPaymentDate?: string;
    notes?: string;
    customerCandidates?: string[];
    unknownProductMentioned?: string;
  };
  missingFields: string[];
  suggestedResponse: string;
  modelRouting: {
    model: AIModelType;
    latencyMs: number;
    estimatedTokens: number;
    confidenceScore: number;
  };
}

export interface AIInsight {
  id: string;
  category: 'inventory' | 'receivables' | 'sales' | 'customer';
  title: string;
  description: string;
  metricHighlight?: string;
  isEstimation: boolean;
  confidence: number; // 0 to 100
  actionSuggested?: string;
  createdAt: string;
}

export interface ModelTelemetry {
  totalRequests: number;
  localLightweightRequests: number;
  cloudLLMRequests: number;
  estimatedTokensSaved: number;
  avgLatencyMs: number;
  costSavedINR: number;
}

export type ActivityType =
  | 'voice_transaction'
  | 'sale'
  | 'purchase'
  | 'inventory_update'
  | 'receivable_created'
  | 'payment'
  | 'customer_update'
  | 'ai_insight'
  | 'sync_event';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  source: 'voice' | 'manual' | 'ai_system' | 'sync';
  audit?: {
    createdBy: string;
    confirmedBy?: string;
    sourceInput?: string;
    language?: string;
    status: 'confirmed' | 'buffered' | 'synced' | 'pending';
  };
}

export interface SyncQueueItem {
  id: string;
  type: 'sale' | 'payment';
  payload: any;
  summary: string;
  amount: number;
  partyName: string;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced';
}

export interface DeviceTelemetry {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: 'online' | 'offline' | 'buffering';
  isSimulated: boolean;
  wifiStatus: 'connected' | 'disconnected' | 'connecting';
  cellularStatus: 'standby' | 'active' | 'unavailable';
  storageStatus: 'ready' | 'buffering' | 'full';
  micStatus: 'ready' | 'listening' | 'error';
  speakerStatus: 'ready' | 'playing' | 'error';
  displayStatus: 'ready' | 'error';
  batteryPct: number;
  rssi: number;
  uptimeSeconds: number;
  lastPing: string;
}
