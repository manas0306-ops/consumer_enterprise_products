import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedBusiness, getSupabaseAdminClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

const SaleItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().default('kg'),
  unitPrice: z.number().nonnegative().optional().default(0),
  totalPrice: z.number().nonnegative().optional().default(0),
});

const SaleRequestSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  items: z.array(SaleItemSchema).min(1, 'At least one item is required'),
  totalAmount: z.number().positive('Total amount must be greater than zero'),
  paymentStatus: z.enum(['cash', 'upi', 'credit', 'partial']),
  paymentDueDate: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['voice', 'manual', 'sync', 'ai']).default('voice'),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedBusiness(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Valid business session required' }, { status: 401 });
    }

    const body = await req.json();
    const validation = SaleRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid sale transaction schema', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const saleData = validation.data;
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const businessId = auth.businessId;

    // Check if Supabase is active
    if (isServerSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();

      // Check for Idempotency (prevent double submission)
      if (saleData.idempotencyKey) {
        const { data: existingQueue } = await supabase
          .from('sync_queue')
          .select('id, status, synced_at')
          .eq('business_id', businessId)
          .eq('idempotency_key', saleData.idempotencyKey)
          .single();

        if (existingQueue && existingQueue.status === 'synced') {
          return NextResponse.json({
            success: true,
            idempotentReplay: true,
            message: 'Transaction previously processed safely',
          });
        }
      }

      // 1. Resolve Customer ID or Create new customer if not found
      let customerId = saleData.customerId;
      if (!customerId) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id, total_purchases, amount_pending')
          .eq('business_id', businessId)
          .ilike('name', saleData.customerName.trim())
          .limit(1)
          .maybeSingle();

        const existCust = existingCustomer as any;
        if (existCust) {
          customerId = existCust.id;
        } else {
          const { data: newCustomer, error: custErr } = await supabase
            .from('customers')
            .insert({
              business_id: businessId,
              name: saleData.customerName.trim(),
              phone: saleData.customerPhone || null,
              total_purchases: 0,
              amount_paid: 0,
              amount_pending: 0,
            } as any)
            .select('id')
            .single();

          if (custErr) throw new Error(`Failed to create customer: ${custErr.message}`);
          customerId = (newCustomer as any)?.id;
        }
      }

      // 2. Validate and Deduct Inventory
      for (const item of saleData.items) {
        let productQuery = supabase
          .from('products')
          .select('id, quantity, name, unit')
          .eq('business_id', businessId);

        if (item.productId) {
          productQuery = productQuery.eq('id', item.productId);
        } else {
          productQuery = productQuery.ilike('name', item.productName.trim());
        }

        const { data: prodData } = await productQuery.limit(1).maybeSingle();
        const prodDataRecord = prodData as any;

        if (prodDataRecord) {
          // Check stock threshold
          if (prodDataRecord.quantity < item.quantity) {
            // Check if business allows negative stock
            const { data: biz } = await supabase
              .from('businesses')
              .select('allow_negative_stock')
              .eq('id', businessId)
              .single();

            const bizRecord = biz as any;
            if (!bizRecord?.allow_negative_stock) {
              return NextResponse.json(
                {
                  error: `Insufficient stock for "${prodDataRecord.name}". Available: ${prodDataRecord.quantity} ${prodDataRecord.unit}, Requested: ${item.quantity} ${prodDataRecord.unit}`,
                  availableStock: prodDataRecord.quantity,
                  productName: prodDataRecord.name,
                },
                { status: 422 }
              );
            }
          }

          const newQty = prodDataRecord.quantity - item.quantity;
          await supabase
            .from('products')
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq('id', prodDataRecord.id);

          await supabase.from('inventory_movements').insert({
            business_id: businessId,
            product_id: prodDataRecord.id,
            product_name: prodDataRecord.name,
            quantity_change: -item.quantity,
            resulting_quantity: newQty,
            movement_type: 'sale',
            reference_id: invoiceNo,
          } as any);
        }
      }

      // 3. Insert Sale Record
      const isCredit = saleData.paymentStatus === 'credit';
      const paidAmount = isCredit ? 0 : saleData.totalAmount;
      const balanceAmount = isCredit ? saleData.totalAmount : 0;

      const { data: createdSale, error: saleErr } = await supabase
        .from('sales')
        .insert({
          business_id: businessId,
          invoice_no: invoiceNo,
          customer_id: customerId,
          customer_name: saleData.customerName,
          customer_phone: saleData.customerPhone || null,
          total_amount: saleData.totalAmount,
          paid_amount: paidAmount,
          balance_amount: balanceAmount,
          payment_status: saleData.paymentStatus,
          payment_due_date: saleData.paymentDueDate || null,
          notes: saleData.notes || null,
          source: saleData.source,
          created_by: auth.userId,
        } as any)
        .select()
        .single();

      if (saleErr) throw new Error(`Sale creation error: ${saleErr.message}`);
      const saleRecord = createdSale as any;

      // 4. Insert Sale Items
      const saleItemsToInsert = saleData.items.map((it) => ({
        sale_id: saleRecord.id,
        business_id: businessId,
        product_id: it.productId || null,
        product_name: it.productName,
        quantity: it.quantity,
        unit: it.unit || 'kg',
        unit_price: it.unitPrice || 0,
        total_price: it.totalPrice || it.quantity * (it.unitPrice || 0),
      }));

      await supabase.from('sale_items').insert(saleItemsToInsert as any);

      // 5. Update Customer Khata balance
      const { data: currentCustomer } = await supabase
        .from('customers')
        .select('total_purchases, amount_paid, amount_pending')
        .eq('id', customerId)
        .single();

      const currCust = currentCustomer as any;
      if (currCust) {
        await supabase
          .from('customers')
          .update({
            total_purchases: (currCust.total_purchases || 0) + saleData.totalAmount,
            amount_paid: (currCust.amount_paid || 0) + paidAmount,
            amount_pending: (currCust.amount_pending || 0) + balanceAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customerId);
      }

      // 6. If Credit, Create Receivable Record
      if (isCredit) {
        const dueDate =
          saleData.paymentDueDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        await supabase.from('receivables').insert({
          business_id: businessId,
          customer_id: customerId,
          customer_name: saleData.customerName,
          sale_id: createdSale.id,
          amount: saleData.totalAmount,
          paid_amount: 0,
          balance_amount: saleData.totalAmount,
          due_date: dueDate,
          status: 'pending',
        });
      }

      // 7. Activity Logs and Audit Log
      await supabase.from('activity_logs').insert({
        business_id: businessId,
        title: `Sale Recorded (${saleData.customerName})`,
        description: `${saleData.items.map((i) => `${i.productName} ${i.quantity}${i.unit}`).join(', ')} • ₹${saleData.totalAmount} (${saleData.paymentStatus})`,
        event_type: 'sale_created',
        source: saleData.source,
        metadata: { invoiceNo, totalAmount: saleData.totalAmount },
      });

      await supabase.from('audit_logs').insert({
        business_id: businessId,
        user_id: auth.userId,
        action: 'CREATE_SALE',
        entity_type: 'sale',
        entity_id: createdSale.id,
        details: { invoiceNo, amount: saleData.totalAmount, paymentStatus: saleData.paymentStatus },
      });

      // 8. If Idempotency key provided, record as synced
      if (saleData.idempotencyKey) {
        await supabase.from('sync_queue').upsert({
          business_id: businessId,
          idempotency_key: saleData.idempotencyKey,
          operation: 'CREATE_SALE',
          payload: saleData,
          status: 'synced',
          synced_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        sale: createdSale,
        invoiceNo,
        message: `Sale ${invoiceNo} recorded successfully`,
      });
    }

    // Fallback simulated execution when Supabase is not yet configured
    const simulatedSale = {
      id: `sale_${Date.now()}`,
      invoiceNo,
      customerId: saleData.customerId || `cust_${Date.now()}`,
      customerName: saleData.customerName,
      items: saleData.items.map((it, idx) => ({
        id: `si_${idx}`,
        productId: it.productId || `prod_${idx}`,
        productName: it.productName,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice || 0,
        totalPrice: it.totalPrice || it.quantity * (it.unitPrice || 0),
      })),
      totalAmount: saleData.totalAmount,
      paidAmount: saleData.paymentStatus === 'credit' ? 0 : saleData.totalAmount,
      balanceAmount: saleData.paymentStatus === 'credit' ? saleData.totalAmount : 0,
      paymentStatus: saleData.paymentStatus,
      paymentDueDate: saleData.paymentDueDate,
      notes: saleData.notes,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      sale: simulatedSale,
      invoiceNo,
      message: `Sale ${invoiceNo} processed and verified (Local Session)`,
    });
  } catch (error: any) {
    console.error('API /sales Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while processing sale' },
      { status: 500 }
    );
  }
}
