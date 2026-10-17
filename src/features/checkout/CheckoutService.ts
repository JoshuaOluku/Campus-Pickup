import { supabase } from '../../lib/supabase/client'
import type { CartItem } from '../cart/CartContext'

export interface CheckoutPayload {
  vendorId: string
  campusId: string
  pickupSlot: string
  items: CartItem[]
}

export async function executeDemoCheckout(payload: CheckoutPayload) {
  // 1. Simulate a realistic 1.5s processing delay for the demo UX
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 2. Prepare items for server-authoritative calculation
  const serverItems = payload.items.map(item => ({
    product_id: item.id,
    quantity: item.quantity
  }))

  // 3. Call the secure RPC function (already in your DB from Phase 4/5)
  const { data, error } = await supabase.rpc('create_order', {
    p_vendor_id: payload.vendorId,
    p_campus_id: payload.campusId,
    p_pickup_slot: payload.pickupSlot,
    p_items: serverItems
  })

  if (error) throw error
  return data // Returns { order_id, total_price, pickup_token }
}