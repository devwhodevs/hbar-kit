# Concepts

| Concept            | Notes                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Account / Token ID | `shard.realm.num`, e.g. `0.0.12345`.                                               |
| Transaction ID     | SDK form `0.0.x@sss.nnn`; Mirror form `0.0.x-sss-nnn`. hbar-kit converts for you.  |
| Memo               | Free-text on the transfer; how you correlate an order/invoice. Public, not unique. |
| Tinybar            | 1 HBAR = 100,000,000 tinybars. All HBAR amounts are bigint tinybars internally.    |
| HTS decimals       | Token amounts are smallest-unit integers; divide by 10^decimals to display.        |
| Mirror Node        | Public read API for ledger data. hbar-kit reads here; it never signs.              |
