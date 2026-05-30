import { verifyHbarPayment } from "@hbar-kit/payments"

const result = await verifyHbarPayment({
  network: "testnet",
  receiver: process.env.HBARKIT_RECEIVER ?? "0.0.12345",
  amount: process.env.HBARKIT_AMOUNT ?? "25",
  memo: process.env.HBARKIT_MEMO,
  after: new Date(Date.now() - 30 * 60 * 1000),
})

console.log(result.matched ? "PAID" : "NOT PAID", result)
if (result.matched) console.log("Explorer:", result.explorerUrl)
