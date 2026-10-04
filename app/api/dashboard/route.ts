import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedBusiness, getSupabaseAdminClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedBusiness(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    const businessId = auth.businessId;

    if (isServerSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      const todayDate = new Date().toISOString().split('T')[0];

      // 1. Fetch Today Sales
      const { data: todaySales } = await supabase
        .from('sales')
        .select('total_amount, payment_status, created_at')
        .eq('business_id', businessId)
        .gte('created_at', `${todayDate}T00:00:00.000Z`);

      const todayTotal = (todaySales as any[])?.reduce((acc: number, s: any) => acc + (Number(s.total_amount) || 0), 0) || 0;
      const todayCount = todaySales?.length || 0;
      const todayCreditTotal =
        (todaySales as any[])?.filter((s: any) => s.payment_status === 'credit').reduce((acc: number, s: any) => acc + (Number(s.total_amount) || 0), 0) || 0;

      // 2. Fetch Receivables
      const { data: receivables } = await supabase
        .from('receivables')
        .select('balance_amount, due_date, status')
        .eq('business_id', businessId)
        .in('status', ['pending', 'partially_paid', 'overdue']);

      const totalReceivables = (receivables as any[])?.reduce((acc: number, r: any) => acc + (Number(r.balance_amount) || 0), 0) || 0;
      const overdueReceivables =
        (receivables as any[])
          ?.filter((r: any) => r.status === 'overdue' || (r.due_date && r.due_date < todayDate))
          .reduce((acc: number, r: any) => acc + (Number(r.balance_amount) || 0), 0) || 0;

      // 3. Fetch Products & Stock Health
      const { data: products } = await supabase
        .from('products')
        .select('id, name, quantity, reorder_level, unit, selling_price, purchase_price')
        .eq('business_id', businessId);

      const allProducts = (products as any[]) || [];
      const lowStockProducts = allProducts.filter((p: any) => p.quantity <= p.reorder_level);
      const criticalProducts = allProducts.filter((p: any) => p.quantity <= 0);
      const healthyProducts = allProducts.filter((p: any) => p.quantity > p.reorder_level);

      // 4. Fetch Recent Activity Logs
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('id, title, description, event_type, source, created_at')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(15);

      return NextResponse.json({
        success: true,
        businessId,
        metrics: {
          todaySalesTotal: todayTotal,
          todaySalesCount: todayCount,
          todayCreditSalesTotal: todayCreditTotal,
          totalReceivables,
          overdueReceivables,
          totalProductsCount: allProducts.length,
          lowStockCount: lowStockProducts.length,
          criticalStockCount: criticalProducts.length,
          healthyStockCount: healthyProducts.length,
          totalInventoryValue: allProducts.reduce((acc: number, p: any) => acc + (Number(p.quantity) || 0) * (Number(p.purchase_price) || 0), 0),
        },
        lowStockItems: lowStockProducts.slice(0, 5),
        activityLogs: activityLogs || [],
      });
    }

    // Default response for local environment
    return NextResponse.json({
      success: true,
      businessId,
      isLocalSession: true,
    });
  } catch (error: any) {
    console.error('API /dashboard Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to aggregate dashboard' }, { status: 500 });
  }
}
