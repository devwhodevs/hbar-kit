"use client"
import { useState } from "react"

export default function Home() {
  const [status, setStatus] = useState<string>("idle")
  async function check() {
    setStatus("checking…")
    const r = await fetch("/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paymentId: "order_6471727153206" }),
    })
    const data = await r.json()
    setStatus(data.matched ? "PAID" : "NOT PAID")
  }
  return (
    <main style={{ padding: 40 }}>
      <button onClick={check}>Check payment</button>
      <p>Status: {status}</p>
    </main>
  )
}
