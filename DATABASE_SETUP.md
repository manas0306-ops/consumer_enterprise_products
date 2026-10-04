# KINETIC Database & Supabase Backend Setup Guide

This document guides you through setting up the production-grade PostgreSQL backend with Supabase for **KINETIC — AI-Powered Business Operating System for MSMEs**.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Set your project name to `kinetic-msme-os` (or your preferred name).
4. Set a strong database password and choose your region (e.g. `ap-south-1` Mumbai for Indian MSMEs).
5. Wait for the database provisioning to complete (typically ~1-2 minutes).

---

## 2. Obtain API Credentials

In your Supabase project dashboard:
1. Navigate to **Project Settings** → **API**.
2. Locate the following keys:
   - **Project URL**: `https://<your-project-id>.supabase.co`
   - **Project API keys**:
     - `anon` / `public`: Client-safe key for frontend authentication and RLS queries.
     - `service_role` / `secret`: Admin key for server-side atomic business transactions and migrations.

---

## 3. Configure Local Environment Variables

Create or update `.env.local` in the root of your project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...<your-service-role-key>

# Google Gemini API for Multilingual Voice NLP Reasoning (Optional)
GEMINI_API_KEY=AIzaSy...<your-gemini-key>
```

*(A template is also provided in `.env.example`)*

---

## 4. Run Database Migrations

1. In your Supabase Dashboard, go to **SQL Editor**.
2. Click **New query**.
3. Open `lib/supabase/schema.sql` from this repository.
4. Copy the entire contents of `lib/supabase/schema.sql` into the SQL Editor.
5. Click **Run**.
6. Verify that the following 16 tables were created in the `public` schema:
   - `profiles`
   - `businesses`
   - `business_members`
   - `customers`
   - `products`
   - `suppliers`
   - `sales`
   - `sale_items`
   - `purchases`
   - `purchase_items`
   - `receivables`
   - `payments`
   - `inventory_movements`
   - `activity_logs`
   - `audit_logs`
   - `sync_queue`

---

## 5. Row Level Security (RLS)

All tables have **Row Level Security (RLS)** automatically enabled by the script.
- The `is_member_of_business(business_id)` database function ensures that merchants can **only** read and write data belonging to their own business.
- Cashier vs Owner role permissions are enforced at the database layer.

---

## 6. Authentication Setup

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Email**.
2. Ensure **Enable Email provider** is turned **ON**.
3. For local hackathon testing, you can disable **Confirm email** under **Auth Providers** → **Email** so registered users can log in immediately without waiting for verification emails.

---

## 7. Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to launch KINETIC!
- Visit `/register` to create a new merchant account and business.
- Visit `/login` to sign in to an existing business.
- Visit `/` or click "Demo Mode" on the landing page to run the self-contained 60-second hackathon presentation mode.
