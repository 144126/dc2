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
| hm | headline metric value, the one number shown on the card |
| hl | headline metric label, e.g. `monthly transaction volume` |
| hv | headline verification: `v` verified by devcircles, `s` self-reported |
| sg | stage: `i` idea, `b` in beta, `l` launched, `r` making revenue, `s` scaling |
| ra | raising: `y` / `n` / empty |
| rt | raise target, free text |
| fp | founder photo url |
| ev | evidence: what was checked, or a link to it |
| vd | link last verified, ISO date string |
| hj | epoch seconds when the builder last confirmed their figures |
| co | country, iso 3166-1 alpha-2 lowercase (`ng`, `gh`, `ke`) |
| st | state / region slug within that country (`fct`, `lagos`, `greater-accra`) |
| ci | cover image url, the wide band at the top of the page |
| sc | screenshots, one url per line or comma separated |
| ts | tech stack, comma separated |
| gh | source code url |
| dk | documentation url |

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

## row types

| t | meaning |
| --- | --- |
| p | product |
| sec | sector |
| x | investor interest, `{ pg product slug, nm name, em email, fm firm, ms message, j epoch }` |
| m | message, `{ cv conversation id, mf from email, mt to email, mx text, md epoch ms, pg product slug }` |
| cv | conversation, `{ cv id, ma lower email, mb higher email, pg slug, pn product name, mx last preview, md epoch ms, ua unread for ma, ub unread for mb }` |

`cv`, the conversation id, is `[a, b].sort().join('|')` of the two lowercased emails, so both
sides derive the same string and `ma` is always the lower one. `mx` is stored as plain text
with a Qdrant full-text index, which is what makes search work across every chat at once.
Message and conversation rows are written with `upsert_novec` — never `upsert`, which would
attach a 4096-dim zero vector to every message.

## dev

```sh
pnpm install
pnpm check
node scripts/seed.mjs
```

env vars in `.env`: `QDRANT_URL`, `QDRANT_KEY`.
