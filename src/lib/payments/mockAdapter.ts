export interface PaymentPayload {
  amount: number // in kobo
  reference: string
  email: string
}

export interface PaymentResult {
  success: boolean
  reference: string
  message: string
}

// Simulates a payment gateway (Paystack/Flutterwave)
export async function processMockPayment(payload: PaymentPayload): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(' Mock Payment Processed:', payload)
      resolve({
        success: true,
        reference: payload.reference,
        message: 'Payment successful (Mock)'
      })
    }, 1500) // 1.5s delay to simulate network
  })
}