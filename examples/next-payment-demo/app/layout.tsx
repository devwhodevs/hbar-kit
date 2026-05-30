import type { ReactNode } from "react"

export const metadata = {
  title: "hbar-kit · Next.js payment demo",
  description: "Verify HBAR payments against the Hedera Mirror Node.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
