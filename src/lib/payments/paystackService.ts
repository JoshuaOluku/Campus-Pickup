import { supabase } from '../supabase/client'
import type { CartItem } from '../../features/cart/CartContext'

export interface CheckoutPayload {
  vendorId: string
  campusId: string
  pickupSlot: string
  items: CartItem[]
  customerEmail: string
}

export async function initializePaystackPayment(payload: CheckoutPayload) {
  const { data, error } = await supabase.functions.invoke('initialize-payment', {
    body: {
      items: payload.items.map(item => ({ product_id: item.id, quantity: item.quantity })),
      campus_id: payload.campusId,
      pickup_slot: payload.pickupSlot,
      customer_email: payload.customerEmail
    }
  })

  if (error) throw error
  return data
}

export async function verifyPaystackPayment(reference: string) {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { reference }
  })

  if (error) throw error
  return data
}