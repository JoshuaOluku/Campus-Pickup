import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, campus_id, pickup_slot, customer_email } = await req.json()
    const authHeader = req.headers.get('Authorization')!
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    // 1. Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Server-authoritative price calculation
    let total_price = 0
    const order_items_payload = []

    for (const item of items) {
      const { data: product, error: prodError } = await supabaseClient
        .from('products')
        .select('price, vendor_id')
        .eq('id', item.product_id)
        .single()

      if (prodError || !product) throw new Error(`Product ${item.product_id} not found`)
      
      total_price += product.price * item.quantity
      order_items_payload.push({ product_id: item.product_id, quantity: item.quantity, unit_price: product.price, vendor_id: product.vendor_id })
    }

    // 3. Create Pending Order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: user.id,
        vendor_id: order_items_payload[0].vendor_id,
        campus_id: campus_id,
        total_price: total_price,
        pickup_slot: pickup_slot,
        status: 'pending_payment',
        payment_reference: 'PAYSTACK_' + Date.now()
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 4. Initialize Paystack Transaction
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.app') || 'http://localhost:5173'
    
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customer_email,
        amount: total_price, // Paystack expects amount in kobo
        reference: order.payment_reference,
        callback_url: `${appUrl}/payment-callback` // Redirects user back to our frontend
      })
    })

    const paystackData = await paystackRes.json()
    if (!paystackData.status) throw new Error('Paystack initialization failed')

    return new Response(
      JSON.stringify({ 
        authorization_url: paystackData.data.authorization_url, 
        reference: order.payment_reference,
        order_id: order.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})