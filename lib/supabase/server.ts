import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, UserRole } from './types';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isServerSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseServiceRoleKey || supabaseAnonKey) &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('http')
  );
};

export const getSupabaseAdminClient = (): SupabaseClient<any> => {
  const key = supabaseServiceRoleKey || supabaseAnonKey || 'mock-service-role-key';
  const url = supabaseUrl || 'https://mock-kinetic.supabase.co';
  return createClient<any>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export interface AuthContext {
  userId: string;
  email: string;
  businessId: string;
  role: UserRole;
  isDemoUser?: boolean;
}

/**
 * Resolves the authenticated user and their active business membership
 * from the request's Authorization header (Bearer token) or custom header.
 */
export async function getAuthenticatedBusiness(req: NextRequest): Promise<AuthContext | null> {
  const authHeader = req.headers.get('Authorization');
  const demoBusinessId = req.headers.get('x-kinetic-business-id');

  // If Supabase is not configured or this is an explicit demo session, provide demo auth context
  if (!isServerSupabaseConfigured()) {
    return {
      userId: 'demo-user-001',
      email: 'demo@kinetic-msme.in',
      businessId: demoBusinessId || 'biz-sharma-kirana-001',
      role: 'owner',
      isDemoUser: true,
    };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no bearer token is passed, allow fallback to demo business if specified
    if (demoBusinessId) {
      return {
        userId: 'demo-user-001',
        email: 'demo@kinetic-msme.in',
        businessId: demoBusinessId,
        role: 'owner',
        isDemoUser: true,
      };
    }
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabase = getSupabaseAdminClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return null;
    }

    // Resolve business membership
    const { data: membership, error: memError } = await supabase
      .from('business_members')
      .select('business_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memError || !membership) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
      businessId: membership.business_id,
      role: membership.role as UserRole,
    };
  } catch (err) {
    console.error('Error verifying auth token in server:', err);
    return null;
  }
}
