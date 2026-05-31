import { verifyUsdcPayment } from "@hbar-kit/payments"

const network = (process.env.HEDERA_NETWORK ?? "mainnet") as "mainnet" | "testnet" | "previewnet"
const receiver = process.env.RECEIVER ?? "0.0.12345"
const amount = process.env.AMOUNT ?? "25.00"
const memo = process.env.MEMO
const tokenId = process.env.USDC_TOKEN_ID // optional override (dev/testnet mock token)

const result = await verifyUsdcPayment({
  network,
  receiver,
  amount,
  memo,
  tokenId, // undefined → uses the verified canonical USDC token id for `network`
  after: new Date(Date.now() - 30 * 60 * 1000),
})

console.log(result.matched ? "PAID" : "NOT PAID")
console.log("status:        ", result.status)
console.log("transaction id:", result.transactionId ?? "—")
console.log("payer:         ", result.payer ?? "—")
console.log("amount:        ", result.amount ? `${result.amount} USDC` : "—")
if (result.matched) console.log("hashscan:      ", result.explorerUrl)
