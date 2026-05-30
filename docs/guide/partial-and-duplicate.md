# Handling partial and duplicate payments

```ts
const result = await verifyHbarPayment({ network: "testnet", receiver: "0.0.12345", amount: "25" })

if (result.status === "underpaid") {
  const paid = result.amountBase ?? 0n
}
if (result.status === "duplicate") {
  for (const m of result.matches) console.log(m.transactionId, m.net)
}
```

`result.matches` always contains the candidate transactions, so you can build idempotent settlement
keyed on `transactionId`.
