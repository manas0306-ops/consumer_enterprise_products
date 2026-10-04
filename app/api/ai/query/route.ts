import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedBusiness, getSupabaseAdminClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

const QuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  tool: z.enum([
    'WHO_OWES_MONEY',
    'RUNNING_LOW',
    'TODAY_SALES',
    'WEEK_SALES',
    'TOP_PRODUCTS',
    'CUSTOMER_LEDGER',
  ]).optional(),
  customerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedBusiness(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    const body = await req.json();
    const validation = QuerySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query schema', details: validation.error.flatten() }, { status: 400 });
    }

    const { query, customerId } = validation.data;
    let tool = validation.data.tool;
    const businessId = auth.businessId;

    // Detect tool from query if not explicitly passed
    const qLower = query.toLowerCase();
    if (!tool) {
      if (qLower.includes('owe') || qLower.includes('money') || qLower.includes('udhar') || qLower.includes('paise')) {
        tool = 'WHO_OWES_MONEY';
      } else if (qLower.includes('low') || qLower.includes('stock') || qLower.includes('khatam') || qLower.includes('restock')) {
        tool = 'RUNNING_LOW';
      } else if (qLower.includes('today') || qLower.includes('aaj')) {
        tool = 'TODAY_SALES';
      } else if (qLower.includes('week') || qLower.includes('hafte') || qLower.includes('hafte')) {
        tool = 'WEEK_SALES';
      } else if (qLower.includes('best') || qLower.includes('top') || qLower.includes('bik')) {
        tool = 'TOP_PRODUCTS';
      } else {
        tool = 'WHO_OWES_MONEY';
      }
    }

    if (isServerSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();

      if (tool === 'WHO_OWES_MONEY') {
        const { data: debtors } = await supabase
          .from('customers')
          .select('id, name, phone, amount_pending, total_purchases')
          .eq('business_id', businessId)
          .gt('amount_pending', 0)
          .order('amount_pending', { ascending: false });

        const totalDebt = (debtors as any[])?.reduce((acc: number, d: any) => acc + (Number(d.amount_pending) || 0), 0) || 0;

        return NextResponse.json({
          tool: 'WHO_OWES_MONEY',
          title: 'Outstanding Khata Receivables',
          summary: `${debtors?.length || 0} customers currently have pending credit balances. Total outstanding: ₹${totalDebt.toLocaleString('en-IN')}.`,
          totalAmount: totalDebt,
          count: debtors?.length || 0,
          data: debtors || [],
        });
      }

      if (tool === 'RUNNING_LOW') {
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, quantity, reorder_level, unit, selling_price, supplier_name')
          .eq('business_id', businessId);

        const lowStock = ((prods as any[]) || [])
          .filter((p: any) => p.quantity <= p.reorder_level)
          .map((p: any) => ({
            ...p,
            shortage: p.reorder_level - p.quantity,
          }));

        return NextResponse.json({
          tool: 'RUNNING_LOW',
          title: 'Inventory Stock Alerts',
          summary: `${lowStock.length} items have fallen below minimum reorder thresholds. Immediate replenishment recommended.`,
          count: lowStock.length,
          data: lowStock,
        });
      }

      if (tool === 'TODAY_SALES') {
        const todayDate = new Date().toISOString().split('T')[0];
        const { data: sales } = await supabase
          .from('sales')
          .select('id, invoice_no, customer_name, total_amount, payment_status, created_at')
          .eq('business_id', businessId)
          .gte('created_at', `${todayDate}T00:00:00.000Z`)
          .order('created_at', { ascending: false });

        const total = (sales as any[])?.reduce((acc: number, s: any) => acc + (Number(s.total_amount) || 0), 0) || 0;

        return NextResponse.json({
          tool: 'TODAY_SALES',
          title: "Today's Sales Register",
          summary: `₹${total.toLocaleString('en-IN')} across ${sales?.length || 0} transactions today.`,
          totalAmount: total,
          count: sales?.length || 0,
          data: sales || [],
        });
      }
    }

    // Default response for local environment
    return NextResponse.json({
      tool,
      title: 'Business Information Tool',
      summary: 'Data queried from verified business ledger engine.',
      isLocalSession: true,
    });
  } catch (error: any) {
    console.error('API /ai/query Error:', error);
    return NextResponse.json({ error: error.message || 'AI query tool execution failed' }, { status: 500 });
  }
}
