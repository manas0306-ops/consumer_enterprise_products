export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'owner' | 'cashier';
export type PaymentStatus = 'cash' | 'upi' | 'credit' | 'partial';
export type ReceivableStatus = 'paid' | 'partially_paid' | 'pending' | 'overdue';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          owner_name: string;
          phone: string | null;
          business_type: string;
          currency: string;
          address: string | null;
          gstin: string | null;
          default_language: string;
          tax_rate: number;
          allow_negative_stock: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_name: string;
          phone?: string | null;
          business_type?: string;
          currency?: string;
          address?: string | null;
          gstin?: string | null;
          default_language?: string;
          tax_rate?: number;
          allow_negative_stock?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          owner_name?: string;
          phone?: string | null;
          business_type?: string;
          currency?: string;
          address?: string | null;
          gstin?: string | null;
          default_language?: string;
          tax_rate?: number;
          allow_negative_stock?: boolean;
          updated_at?: string;
        };
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          role?: UserRole;
        };
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string | null;
          address: string | null;
          credit_limit: number;
          total_purchases: number;
          amount_paid: number;
          amount_pending: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone?: string | null;
          address?: string | null;
          credit_limit?: number;
          total_purchases?: number;
          amount_paid?: number;
          amount_pending?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
          address?: string | null;
          credit_limit?: number;
          total_purchases?: number;
          amount_paid?: number;
          amount_pending?: number;
          notes?: string | null;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          name_hindi: string | null;
          category: string;
          sku: string;
          quantity: number;
          unit: string;
          purchase_price: number;
          selling_price: number;
          reorder_level: number;
          supplier_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          name_hindi?: string | null;
          category?: string;
          sku: string;
          quantity?: number;
          unit?: string;
          purchase_price?: number;
          selling_price?: number;
          reorder_level?: number;
          supplier_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          name_hindi?: string | null;
          category?: string;
          sku?: string;
          quantity?: number;
          unit?: string;
          purchase_price?: number;
          selling_price?: number;
          reorder_level?: number;
          supplier_name?: string | null;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string | null;
          categories: string[];
          total_purchased: number;
          amount_pending: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone?: string | null;
          categories?: string[];
          total_purchased?: number;
          amount_pending?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
          categories?: string[];
          total_purchased?: number;
          amount_pending?: number;
        };
      };
      sales: {
        Row: {
          id: string;
          business_id: string;
          invoice_no: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          total_amount: number;
          paid_amount: number;
          balance_amount: number;
          payment_status: PaymentStatus;
          payment_due_date: string | null;
          notes: string | null;
          source: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          invoice_no: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone?: string | null;
          total_amount: number;
          paid_amount?: number;
          balance_amount?: number;
          payment_status?: PaymentStatus;
          payment_due_date?: string | null;
          notes?: string | null;
          source?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          paid_amount?: number;
          balance_amount?: number;
          payment_status?: PaymentStatus;
          payment_due_date?: string | null;
          notes?: string | null;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          business_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit: string;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          business_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit?: string;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      purchases: {
        Row: {
          id: string;
          business_id: string;
          invoice_no: string;
          supplier_name: string;
          total_amount: number;
          paid_amount: number;
          payment_status: PaymentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          invoice_no: string;
          supplier_name: string;
          total_amount: number;
          paid_amount?: number;
          payment_status?: PaymentStatus;
          created_at?: string;
        };
        Update: {
          supplier_name?: string;
          total_amount?: number;
          paid_amount?: number;
          payment_status?: PaymentStatus;
        };
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          business_id: string;
          product_name: string;
          quantity: number;
          unit: string;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          business_id: string;
          product_name: string;
          quantity: number;
          unit?: string;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          product_name?: string;
          quantity?: number;
          unit?: string;
          unit_price?: number;
          total_price?: number;
        };
      };
      receivables: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          customer_name: string;
          sale_id: string | null;
          amount: number;
          paid_amount: number;
          balance_amount: number;
          due_date: string;
          status: ReceivableStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          customer_name: string;
          sale_id?: string | null;
          amount: number;
          paid_amount?: number;
          balance_amount?: number;
          due_date: string;
          status?: ReceivableStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          paid_amount?: number;
          balance_amount?: number;
          status?: ReceivableStatus;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          customer_name: string;
          receivable_id: string | null;
          amount: number;
          payment_mode: 'cash' | 'upi' | 'bank_transfer';
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          customer_name: string;
          receivable_id?: string | null;
          amount: number;
          payment_mode: 'cash' | 'upi' | 'bank_transfer';
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          amount?: number;
          payment_mode?: 'cash' | 'upi' | 'bank_transfer';
          notes?: string | null;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          business_id: string;
          product_id: string;
          product_name: string;
          quantity_change: number;
          resulting_quantity: number;
          movement_type: 'sale' | 'purchase' | 'manual_adjustment' | 'return';
          reference_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          product_id: string;
          product_name: string;
          quantity_change: number;
          resulting_quantity: number;
          movement_type: 'sale' | 'purchase' | 'manual_adjustment' | 'return';
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          quantity_change?: number;
          resulting_quantity?: number;
          notes?: string | null;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          description: string;
          event_type: string;
          source: 'voice' | 'manual' | 'sync' | 'ai';
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          description: string;
          event_type: string;
          source?: 'voice' | 'manual' | 'sync' | 'ai';
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          event_type?: string;
          metadata?: Json;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          action?: string;
          details?: Json;
        };
      };
      sync_queue: {
        Row: {
          id: string;
          business_id: string;
          idempotency_key: string;
          operation: string;
          payload: Json;
          status: 'pending' | 'syncing' | 'synced' | 'failed';
          retry_count: number;
          error_message: string | null;
          created_at: string;
          synced_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          idempotency_key: string;
          operation: string;
          payload: Json;
          status?: 'pending' | 'syncing' | 'synced' | 'failed';
          retry_count?: number;
          error_message?: string | null;
          created_at?: string;
          synced_at?: string | null;
        };
        Update: {
          status?: 'pending' | 'syncing' | 'synced' | 'failed';
          retry_count?: number;
          error_message?: string | null;
          synced_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      payment_status: PaymentStatus;
      receivable_status: ReceivableStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
