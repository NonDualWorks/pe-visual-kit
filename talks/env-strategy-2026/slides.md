---
theme: default
title: From full copies to sandboxes
info: |
  Pitch: current state → short term → long term.
  Pictures live in public/images (Excalidraw SVG exports with "Embed scene" on).
transition: fade
routerMode: hash   # lets the built deck open from any folder or static host
fonts:
  provider: none   # no Google Fonts download: works offline for a live talk
drawings:
  persist: false
---

# From full copies to sandboxes

How our feature environments work today, and where they could go

<div class="abs-bl m-8 text-sm opacity-60">Platform Engineering · 2026</div>

<!--
Hi. This is about how we develop and integrate in our feature environments.
Three parts: agree on today, cheap wins, then where a mesh takes us.
-->

---

# The plan for today

<v-clicks>

1. **Current state:** agree on how we work today
2. **Short term:** cheap wins, no new infrastructure
3. **Long term:** a mesh, a shared baseline and request-routed sandboxes

</v-clicks>

<!--
[click] First we agree on the facts. Nothing else works until we do.
[click] Then changes we can make with what we already run.
[click] Then the bigger shift, and why it removes today's trade-offs.
-->

---
layout: section
---

# Part 1 · Current state

---

# We already work like git

<img src="/images/git-a-laptop-vs-env.svg" class="w-full max-h-100 object-contain mx-auto" />

<div v-click class="text-center text-xl mt-2">Same workflow. <span v-mark.circle.orange="1">Very different cost</span> per rebase.</div>

<!--
Everyone knows this flow: a branch on your laptop, push to origin, everyone else rebases.
Our environments are the same flow: a feature env is a branch, promote is push.
[click] The difference is the price. A git rebase takes seconds; ours redeploys a whole stack.
-->

---

# Twelve branches, one master

<img src="/images/git-b-twelve-branches.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
f01 to f12: each feature env is a long-lived branch, and each is a full copy: ~50 services plus a database.
-->

---

# One push, eleven rebases

<img src="/images/git-c-one-push-eleven-rebases.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
f01 finishes first, promotes to ci and merges to master.
Every other env is rebased right away, whether they need it or not: a full redeploy, eleven times.
-->

---

# Where it hurts

<v-clicks>

- **Churn:** every promotion → 11 full redeploys
- **Interruptions:** an env can change in the middle of a test or demo
- **Late conflicts:** integration problems only show up in `ci`
- **Queueing:** `ci` takes one promotion at a time

</v-clicks>

<div v-click class="mt-8 text-sm opacity-60">TODO: real numbers: promotions per week, minutes per redeploy</div>

<!--
[click] Churn grows with team size squared.
[click] Nobody chose to be redeployed.
[click] Git rebases code; nobody refreshes the other 49 services on purpose.
[click] Everyone squeezes through one door.
[click] Numbers make this undeniable. Fill them in before the pitch.
-->

---
layout: section
---

# Part 2 · Short term

---

# Sync when ready: pull, like git

<img src="/images/sync-today-vs-proposed.svg" class="h-88 mx-auto" />

<!--
TODO: replace with the real picture.
Left: today. Right: each env pulls when ready. Teams keep working; nothing changes under them.
"Latest enough is good enough."
-->

---

# Guardrails keep "latest enough" honest

<img src="/images/guardrails-and-hotfix.svg" class="h-80 mx-auto" />

<v-clicks>

- ⚙ **Must be current** before promoting: conflicts are deferred, never skipped
- 👤 Human gates stay where they are: perf, release manager
- Hotfix goes straight to pre-prod, then back-merges to `master`

</v-clicks>

<!--
[click] The gate in front of ci keeps integration safe.
[click] Automated vs human gates: the person icon shows where we wait on people.
[click] Hotfix path, and why it ripples into every feature env today.
-->

---

# Composable manifests

<img src="/images/manifest-composition.svg" class="h-72 mx-auto" />

<v-clicks>

- **Platform manifest** + **app manifest** → resolve · pin · tag → **release** `product/v5.3.0`
- The app manifest references `platform: 2.4.x`, so syncing becomes **a one-line bump**

</v-clicks>

<!--
Component = one service. Platform services and app services are the two halves. Product = both.
[click] A release is a manifest with everything resolved, pinned by digest, and tagged.
[click] This is what makes pull-based sync and skew windows concrete.
-->

---
layout: section
---

# Part 3 · Long term

---

# One baseline, request-routed sandboxes

<img src="/images/mesh-topology.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
One shared baseline tracking main, run like production. A PR deploys only what it changed, into a sandbox namespace.
Same mesh, same cluster.
-->

---

# A PR sandbox

<img src="/images/pr-sandbox-no-ddl.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
Purple is a test request carrying the routing key sandbox=pr-482. Gray is everyone else.
The mesh sends tagged calls to checkout' in the sandbox; everything else stays on the baseline.
Here the PR doesn't change the schema, so it shares the baseline database with a test tenant.
-->

---
layout: section
---

# Data Isolation Strategy

Data = **relational data** + **messages**

<!--
Routing solves compute. Data needs its own strategy, and there are two kinds of data:
rows in databases, and messages on topics and queues. Each has its own ladder of isolation levels.
-->

---

# Relational data: three levels

<img src="/images/data-relational-ladder.svg" class="w-full max-h-100 object-contain mx-auto" />

<v-clicks>

- **L1** instance per PR · **L2** schema per PR · **L3** shared schema, rows tagged with the PR
- A **DDL change** (Liquibase changeset) changes the shape, so it needs **L1 or L2**

</v-clicks>

<!--
Most isolated on the left, cheapest on the right.
[click] The levels.
[click] The rule that matters: if the PR changes the schema, it can't share the schema.
-->

---

# Messages: three levels

<img src="/images/data-messages-ladder.svg" class="w-full max-h-100 object-contain mx-auto" />

<v-clicks>

- **L1** broker per PR · **L2** topic or queue per PR · **L3** shared topic, messages tagged, consumers filter
- An **event shape change** is the messaging version of DDL: it needs **L2**

</v-clicks>

<!--
[click] Messages are data too. L3 is the cheap default: the sandbox consumer takes only tagged messages,
the baseline consumer skips them. If no sandbox exists, the baseline handles tagged ones, so tests still run.
[click] A new or changed event shape needs its own topic.
-->

---

# How a PR picks its level

<img src="/images/data-isolation-decision.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
Developers don't choose. The pipeline looks at what changed: a Liquibase changeset, an event schema change, a new consumer.
Isolated data lives and dies with the sandbox, with a TTL so abandoned PRs clean themselves up.
-->

---

# A PR sandbox with a DDL change

<img src="/images/pr-sandbox-ddl.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
Same sandbox, but checkout' gets its own Aurora Serverless database: seeded from the baseline, then Liquibase applies the PR's changesets.
The baseline database never sees an unmerged migration.
-->

---

# On merge: keep migrations backward compatible

<v-clicks>

- Liquibase applies the change to the **baseline** database when the PR merges
- Baseline, the other sandboxes and both blue/green colors **share** that database
- So every migration is **expand → migrate → contract**: add first, switch readers, remove later

</v-clicks>

<!--
The sandbox protected the baseline until merge. After merge, the old rule still holds:
two versions of code must work against one schema. Expand/contract keeps that true.
-->

---

# Same goal, three generations

| | Stays current? | Cost |
|---|---|---|
| **Today** | always, forced | 11 full redeploys per promotion |
| **Short term** | when you choose | redeploy only on pull |
| **Long term** | always | almost free: only changed services run |

<!--
The short-term step is a stepping stone. The mesh removes the reason we needed it.
-->

---

# What it takes

<v-clicks>

- **Routing context propagation** in every service (HTTP + message headers)
- **Mesh routing rules** for sandboxes
- A **data isolation strategy** for relational data and messages
- **Contracts** on the most-used platform services
- **A baseline run like production:** owned, monitored, fixed fast

</v-clicks>

<!--
These can be adopted in this order, one team at a time. No big bang.
-->

---

# Next steps

<v-clicks>

1. Agree on the current-state numbers
2. Pilot pull-based sync on two feature envs
3. Contract tests on the top 2–3 platform services
4. Spike: one sandbox on a baseline namespace, in a single cluster

</v-clicks>

<!--
Ask for: agreement on 1, volunteers for 2 and 3, time-box for 4.
-->
