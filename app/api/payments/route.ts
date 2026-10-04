import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedBusiness, getSupabaseAdminClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

const PaymentRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer']).default('upi'),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedBusiness(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Valid business session required' }, { status: 401 });
    }

    const body = await req.json();
    const validation = PaymentRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payment parameters', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { customerId, amount, paymentMode, notes } = validation.data;
    const businessId = auth.businessId;

    if (isServerSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();

      // 1. Fetch customer details
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .select('id, name, amount_pending, amount_paid')
        .eq('business_id', businessId)
        .eq('id', customerId)
        .single();

      const cust = customer as any;
      if (custErr || !cust) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      // 2. Insert payment record
      const { data: paymentRecord, error: payErr } = await supabase
        .from('payments')
        .insert({
          business_id: businessId,
          customer_id: customerId,
          customer_name: cust.name,
          amount,
          payment_mode: paymentMode,
          notes: notes || null,
          created_by: auth.userId,
        } as any)
        .select()
        .single();

      if (payErr) throw new Error(`Payment record error: ${payErr.message}`);

      // 3. Update customer pending and paid amounts
      const updatedPending = Math.max(0, (cust.amount_pending || 0) - amount);
      const updatedPaid = (cust.amount_paid || 0) + amount;

      await supabase
        .from('customers')
        .update({
          amount_pending: updatedPending,
          amount_paid: updatedPaid,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);

      // 4. Settle oldest active receivables
      const { data: activeReceivables } = await supabase
        .from('receivables')
        .select('id, amount, paid_amount, balance_amount, status')
        .eq('business_id', businessId)
        .eq('customer_id', customerId)
        .in('status', ['pending', 'partially_paid', 'overdue'])
        .order('due_date', { ascending: true });

      const recs = (activeReceivables as any[]) || [];
      if (recs && recs.length > 0) {
        let remainingPayment = amount;
        for (const rec of recs) {
          if (remainingPayment <= 0) break;
          const recBalance = rec.balance_amount || rec.amount;
          if (remainingPayment >= recBalance) {
            remainingPayment -= recBalance;
            await supabase
              .from('receivables')
              .update({
                paid_amount: rec.amount,
                balance_amount: 0,
                status: 'paid',
                updated_at: new Date().toISOString(),
              })
              .eq('id', rec.id);
          } else {
            const newPaid = (rec.paid_amount || 0) + remainingPayment;
            const newBal = recBalance - remainingPayment;
            remainingPayment = 0;
            await supabase
              .from('receivables')
              .update({
                paid_amount: newPaid,
                balance_amount: newBal,
                status: 'partially_paid',
                updated_at: new Date().toISOString(),
              })
              .eq('id', rec.id);
          }
        }
      }

      // 5. Activity log and Audit log
      await supabase.from('activity_logs').insert({
        business_id: businessId,
        title: `Payment Received (${customer.name})`,
        description: `₹${amount.toLocaleString('en-IN')} received via ${paymentMode.toUpperCase()} • Balance: ₹${updatedPending.toLocaleString('en-IN')}`,
        event_type: 'payment_received',
        source: 'manual',
        metadata: { customerId, amount, paymentMode },
      });

      await supabase.from('audit_logs').insert({
        business_id: businessId,
        user_id: auth.userId,
        action: 'COLLECT_PAYMENT',
        entity_type: 'payment',
        entity_id: paymentRecord.id,
        details: { customerName: customer.name, amount, paymentMode },
      });

      return NextResponse.json({
        success: true,
        message: `Payment of ₹${amount} recorded for ${customer.name}`,
        remainingPending: updatedPending,
      });
    }

    // Fallback simulation
    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully (Local Session)`,
    });
  } catch (error: any) {
    console.error('API /payments Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment settlement' },
      { status: 500 }
    );
  }
}
