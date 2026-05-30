import { verifyHbarPayment } from "@hbar-kit/payments"

export async function POST(req: Request) {
  const { paymentId } = await req.json()
  // In production: look up amount + receiver from your DB by paymentId, never trust the client.
  const expected = { receiver: "0.0.12345", amount: "25", memo: paymentId }

  const result = await verifyHbarPayment({ network: "testnet", ...expected })
  return Response.json(result)
}
