import { verifyHtsPayment } from "@hbar-kit/payments"

const result = await verifyHtsPayment({
  network: "testnet",
  receiver: process.env.HBARKIT_RECEIVER ?? "0.0.12345",
  tokenId: process.env.HBARKIT_TOKEN ?? "0.0.456858",
  amount: process.env.HBARKIT_AMOUNT ?? "10",
  memo: process.env.HBARKIT_MEMO,
})

console.log(result.matched ? "PAID" : "NOT PAID", result)
