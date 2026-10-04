-- ============================================================================
-- KINETIC MSME Business Operating System — Complete Database Schema & RLS
-- PostgreSQL / Supabase Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  business_type TEXT NOT NULL DEFAULT 'Retail Kirana / Grocery',
  currency TEXT NOT NULL DEFAULT 'INR',
  address TEXT,
  gstin TEXT,
  default_language TEXT NOT NULL DEFAULT 'hi-IN',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  allow_negative_stock BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BUSINESS MEMBERS TABLE (Multi-tenant permissions & Roles)
CREATE TYPE user_role AS ENUM ('owner', 'cashier');

CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- 4. CUSTOMERS TABLE (Khata Directory)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 5000.00,
  total_purchases NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  amount_pending NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS & INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_hindi TEXT,
  category TEXT NOT NULL DEFAULT 'Staples',
  sku TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL DEFAULT 'kg',
  purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  reorder_level NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  supplier_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  total_purchased NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  amount_pending NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SALES REGISTER TABLE
CREATE TYPE payment_status AS ENUM ('cash', 'upi', 'credit', 'partial');

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_status payment_status NOT NULL DEFAULT 'cash',
  payment_due_date DATE,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'voice',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_status payment_status NOT NULL DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PURCHASE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. RECEIVABLES TABLE (Udhar Ledger)
CREATE TYPE receivable_status AS ENUM ('paid', 'partially_paid', 'pending', 'overdue');

CREATE TABLE IF NOT EXISTS public.receivables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  due_date DATE NOT NULL,
  status receivable_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. PAYMENTS TABLE (Settlements)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  receivable_id UUID REFERENCES public.receivables(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT NOT NULL DEFAULT 'upi',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. INVENTORY MOVEMENTS AUDIT TRAIL
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity_change NUMERIC(10,2) NOT NULL,
  resulting_quantity NUMERIC(10,2) NOT NULL,
  movement_type TEXT NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ACTIVITY TIMELINE LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'voice',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AUDIT LOGS (Financial and critical entity modifications)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. OFFLINE SYNC QUEUE TABLE (Idempotent replay)
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  operation TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE MULTI-TENANT FILTERING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_biz ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_products_biz ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_biz ON public.sales(business_id);
CREATE INDEX IF NOT EXISTS idx_receivables_biz ON public.receivables(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_biz ON public.payments(business_id);
CREATE INDEX IF NOT EXISTS idx_activity_biz ON public.activity_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_biz ON public.sync_queue(business_id, idempotency_key);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Helper function to check business membership
CREATE OR REPLACE FUNCTION public.is_member_of_business(target_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_business_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Businesses: Members can read, Owners can update
CREATE POLICY "Members can view their business" ON public.businesses
  FOR SELECT USING (public.is_member_of_business(id));

CREATE POLICY "Owners can update their business" ON public.businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = public.businesses.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Business Members
CREATE POLICY "Members can view co-members" ON public.business_members
  FOR SELECT USING (public.is_member_of_business(business_id));

-- Customers RLS
CREATE POLICY "Members can view customers" ON public.customers
  FOR SELECT USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can insert customers" ON public.customers
  FOR INSERT WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY "Members can update customers" ON public.customers
  FOR UPDATE USING (public.is_member_of_business(business_id));

-- Products RLS
CREATE POLICY "Members can view products" ON public.products
  FOR SELECT USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY "Members can update products" ON public.products
  FOR UPDATE USING (public.is_member_of_business(business_id));

-- Sales & Sale Items RLS
CREATE POLICY "Members can view sales" ON public.sales
  FOR SELECT USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can insert sales" ON public.sales
  FOR INSERT WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY "Members can view sale items" ON public.sale_items
  FOR SELECT USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can insert sale items" ON public.sale_items
  FOR INSERT WITH CHECK (public.is_member_of_business(business_id));

-- Receivables & Payments RLS
CREATE POLICY "Members can view receivables" ON public.receivables
  FOR SELECT USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can update receivables" ON public.receivables
  FOR UPDATE USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can view payments" ON public.payments
  FOR SELECT USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can insert payments" ON public.payments
  FOR INSERT WITH CHECK (public.is_member_of_business(business_id));

-- Activity & Audit Logs RLS
CREATE POLICY "Members can view activity" ON public.activity_logs
  FOR SELECT USING (public.is_member_of_business(business_id));

CREATE POLICY "Members can view audits" ON public.audit_logs
  FOR SELECT USING (public.is_member_of_business(business_id));
