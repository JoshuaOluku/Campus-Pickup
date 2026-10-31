import { supabase } from '../../lib/supabase/client'
import type { CartItem } from '../cart/CartContext'

export interface CheckoutPayload {
  vendorId: string
  campusId: string
  pickupSlot: string
  items: CartItem[]
}

export async function createPendingOrder(payload: CheckoutPayload) {
  if (!payload.items.length) throw new Error('Your cart is empty.')
  const vendorIds = new Set(payload.items.map(item => item.vendor_id))
  if (vendorIds.size !== 1 || !vendorIds.has(payload.vendorId)) {
    throw new Error('Please order from one vendor at a time.')
  }
  const serverItems = payload.items.map(item => ({ product_id: item.id, quantity: item.quantity }))
  const { data, error } = await supabase.rpc('create_order', {
    p_vendor_id: payload.vendorId,
    p_campus_id: payload.campusId,
    p_pickup_slot: payload.pickupSlot,
    p_items: serverItems
  })
  if (error) throw error
  return data
}
