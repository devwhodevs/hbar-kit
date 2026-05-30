import { defineConfig } from "vitepress"

export default defineConfig({
  title: "hbar-kit",
  description: "viem-like DX for native Hedera apps",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/payments" },
    ],
    sidebar: {
      "/guide/": [
        { text: "Introduction", items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Concepts", link: "/guide/concepts" },
        ] },
        { text: "Payments", items: [
          { text: "Verify an HBAR payment", link: "/guide/verify-hbar" },
          { text: "Verify an HTS token payment", link: "/guide/verify-hts" },
          { text: "Wait for a payment", link: "/guide/wait-for-payment" },
          { text: "Use a custom Mirror Node", link: "/guide/custom-mirror-node" },
          { text: "Partial & duplicate payments", link: "/guide/partial-and-duplicate" },
          { text: "Amount precision & decimals", link: "/guide/amounts-and-decimals" },
          { text: "Production notes", link: "/guide/production-notes" },
        ] },
        { text: "Roadmap", items: [
          { text: "Wallet (Phase 2)", link: "/guide/wallet" },
          { text: "React (Phase 3)", link: "/guide/react" },
          { text: "Next.js (Phase 4)", link: "/guide/next" },
          { text: "Indexer (Phase 5)", link: "/guide/indexer" },
        ] },
      ],
      "/reference/": [
        { text: "Reference", items: [
          { text: "@hbar-kit/payments", link: "/reference/payments" },
          { text: "@hbar-kit/mirror", link: "/reference/mirror" },
          { text: "@hbar-kit/core", link: "/reference/core" },
        ] },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/devwhodevs/hbar-kit" }],
  },
})
