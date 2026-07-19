# devcircles industry insight report

sveltekit site listing products built by the devcircles community. collection `i` on qdrant, tenant `s='adca'`, type `t='p'`.

## payload schema

| key | meaning |
| --- | --- |
| s | tenant, always `adca` |
| t | type, always `p` (product) |
| g | slug |
| n | product name |
| u | url |
| l | link label |
| r | status: `l` live, `p` preview, `u` unverified |
| c | sector char (see below) |
| o | one-liner |
| w | what it does |
| h | why it matters |
| x | where it can grow |
| j | created, epoch seconds |
| d | launch date text |
| q | users / signups / downloads text |
| m | revenue: `y` / `n` / empty |
| a | revenue amount text |
| z | team size text |
| k | proudest metric text |
| b | builder contact object: `{ n name, e email, p phone, l linkedin, c location }` |

## sector chars

| char | sector |
| --- | --- |
| f | fintech (money & payments) |
| m | commerce |
| a | ai |
| b | saas |
| d | devtools |
| z | social |
| e | education |
| v | services |
| y | early |

## dev

```sh
pnpm install
pnpm check
node scripts/seed.mjs
```

env vars in `.env`: `QDRANT_URL`, `QDRANT_KEY`.
