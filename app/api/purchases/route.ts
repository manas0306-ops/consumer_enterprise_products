import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedBusiness, getSupabaseAdminClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

const PurchaseItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().default('kg'),
  unitPrice: z.number().nonnegative().default(0),
});

const PurchaseRequestSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required'),
  items: z.array(PurchaseItemSchema).min(1, 'At least one purchase item is required'),
  totalAmount: z.number().nonnegative(),
  paymentStatus: z.enum(['cash', 'upi', 'credit', 'partial']).default('cash'),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedBusiness(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Valid business session required' }, { status: 401 });
    }

    const body = await req.json();
    const validation = PurchaseRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid purchase schema', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const purchaseData = validation.data;
    const businessId = auth.businessId;
    const invoiceNo = `PO-${Date.now().toString().slice(-6)}`;

    if (isServerSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();

      // 1. Insert Purchase
      const { data: createdPurchase, error: purErr } = await supabase
        .from('purchases')
        .insert({
          business_id: businessId,
          invoice_no: invoiceNo,
          supplier_name: purchaseData.supplierName,
          total_amount: purchaseData.totalAmount,
          paid_amount: purchaseData.paymentStatus === 'credit' ? 0 : purchaseData.totalAmount,
          payment_status: purchaseData.paymentStatus,
        })
        .select()
        .single();

      if (purErr) throw new Error(`Purchase record error: ${purErr.message}`);
      const purRecord = createdPurchase as any;

      // 2. Process Items and Increment Stock
      for (const item of purchaseData.items) {
        // Insert purchase item
        await supabase.from('purchase_items').insert({
          purchase_id: purRecord?.id,
          business_id: businessId,
          product_name: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total_price: item.quantity * item.unitPrice,
        } as any);

        // Find or create product
        const { data: existingProd } = await supabase
          .from('products')
          .select('id, quantity, name')
          .eq('business_id', businessId)
          .ilike('name', item.productName.trim())
          .limit(1)
          .maybeSingle();

        const exProd = existingProd as any;
        if (exProd) {
          const newQty = (exProd.quantity || 0) + item.quantity;
          await supabase
            .from('products')
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq('id', exProd.id);

          await supabase.from('inventory_movements').insert({
            business_id: businessId,
            product_id: exProd.id,
            product_name: exProd.name,
            quantity_change: item.quantity,
            resulting_quantity: newQty,
            movement_type: 'purchase',
            reference_id: invoiceNo,
          } as any);
        } else {
          const { data: newProd } = await supabase
            .from('products')
            .insert({
              business_id: businessId,
              name: item.productName.trim(),
              category: 'General',
              sku: `SKU-${Date.now().toString().slice(-5)}`,
              quantity: item.quantity,
              unit: item.unit,
              purchase_price: item.unitPrice,
              selling_price: Math.round(item.unitPrice * 1.2),
              reorder_level: 10,
              supplier_name: purchaseData.supplierName,
            } as any)
            .select('id, name')
            .single();

          const createdNewProd = newProd as any;
          if (createdNewProd) {
            await supabase.from('inventory_movements').insert({
              business_id: businessId,
              product_id: createdNewProd.id,
              product_name: createdNewProd.name,
              quantity_change: item.quantity,
              resulting_quantity: item.quantity,
              movement_type: 'purchase',
              reference_id: invoiceNo,
            } as any);
          }
        }
      }

      // 3. Activity log
      await supabase.from('activity_logs').insert({
        business_id: businessId,
        title: `Restock Procurement (${purchaseData.supplierName})`,
        description: `Purchased ${purchaseData.items.map((i) => `${i.productName} (${i.quantity}${i.unit})`).join(', ')} • ₹${purchaseData.totalAmount}`,
        event_type: 'purchase_created',
        source: 'manual',
        metadata: { invoiceNo, totalAmount: purchaseData.totalAmount },
      });

      return NextResponse.json({
        success: true,
        purchase: createdPurchase,
        invoiceNo,
        message: `Purchase order ${invoiceNo} recorded and stock replenished`,
      });
    }

    // Fallback simulation
    return NextResponse.json({
      success: true,
      invoiceNo,
      message: `Purchase order ${invoiceNo} recorded successfully (Local Session)`,
    });
  } catch (error: any) {
    console.error('API /purchases Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record purchase procurement' },
      { status: 500 }
    );
  }
}
