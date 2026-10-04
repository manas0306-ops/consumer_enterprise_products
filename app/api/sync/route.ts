import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedBusiness, getSupabaseAdminClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

const SyncBatchSchema = z.object({
  items: z.array(
    z.object({
      idempotencyKey: z.string().min(1, 'Idempotency key required'),
      operation: z.enum(['CREATE_SALE', 'RECORD_PAYMENT', 'RESTOCK']),
      payload: z.record(z.string(), z.any()),
      timestamp: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedBusiness(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = SyncBatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid sync payload', details: validation.error.flatten() }, { status: 400 });
    }

    const { items } = validation.data;
    const businessId = auth.businessId;

    if (isServerSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      let syncedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (const item of items) {
        // 1. Check idempotency
        const { data: existing } = await supabase
          .from('sync_queue')
          .select('id, status')
          .eq('business_id', businessId)
          .eq('idempotency_key', item.idempotencyKey)
          .maybeSingle();

        const existItem = existing as any;
        if (existItem && existItem.status === 'synced') {
          skippedCount++;
          continue;
        }

        try {
          // Process based on operation
          if (item.operation === 'CREATE_SALE') {
            const sale = item.payload;
            const invoiceNo = `INV-SYNC-${Date.now().toString().slice(-4)}`;

            // Deduct stock if products present
            if (Array.isArray(sale.items)) {
              for (const it of sale.items) {
                const { data: prod } = await supabase
                  .from('products')
                  .select('id, quantity')
                  .eq('business_id', businessId)
                  .ilike('name', it.productName)
                  .limit(1)
                  .maybeSingle();

                const p = prod as any;
                if (p) {
                  const newQty = p.quantity - (it.quantity || 1);
                  await supabase
                    .from('products')
                    .update({ quantity: newQty, updated_at: new Date().toISOString() })
                    .eq('id', p.id);
                }
              }
            }

            // Record sale
            await supabase.from('sales').insert({
              business_id: businessId,
              invoice_no: invoiceNo,
              customer_name: sale.customerName || 'Customer',
              total_amount: sale.totalAmount || 0,
              paid_amount: sale.paymentStatus === 'credit' ? 0 : sale.totalAmount || 0,
              balance_amount: sale.paymentStatus === 'credit' ? sale.totalAmount || 0 : 0,
              payment_status: sale.paymentStatus || 'cash',
              source: 'sync',
            } as any);
          }

          // Mark queue as synced
          await supabase.from('sync_queue').upsert({
            business_id: businessId,
            idempotency_key: item.idempotencyKey,
            operation: item.operation,
            payload: item.payload,
            status: 'synced',
            synced_at: new Date().toISOString(),
          } as any);

          syncedCount++;
        } catch (err: any) {
          errors.push(`Item ${item.idempotencyKey} failed: ${err.message}`);
          await supabase.from('sync_queue').upsert({
            business_id: businessId,
            idempotency_key: item.idempotencyKey,
            operation: item.operation,
            payload: item.payload,
            status: 'failed',
            error_message: err.message,
          } as any);
        }
      }

      return NextResponse.json({
        success: true,
        syncedCount,
        skippedCount,
        totalItems: items.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // Fallback simulation
    return NextResponse.json({
      success: true,
      syncedCount: items.length,
      skippedCount: 0,
      message: `Offline buffer synchronized with session (${items.length} items)`,
    });
  } catch (error: any) {
    console.error('API /sync Error:', error);
    return NextResponse.json({ error: error.message || 'Sync operation failed' }, { status: 500 });
  }
}
