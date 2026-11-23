---
theme: default
title: One baseline, a sandbox per PR
info: |
  Insiders preview of the long-term design: a shared baseline + request-routed PR sandboxes.
  Pictures live in public/images (Excalidraw SVGs with the scene embedded: open them in Excalidraw to edit).
transition: fade
routerMode: hash
fonts:
  provider: none
drawings:
  persist: false
---

# One baseline, a sandbox per PR

The long-term design for our development environments · insiders preview

<div class="abs-bl m-8 text-sm opacity-60">Platform Engineering · 2026 · draft for feedback</div>

<!--
This is the long-term part only. I want your feedback before it goes to a wider audience.
The open questions at the end are the real point of this session.
-->

---

# What we'll cover

<div class="grid grid-cols-2 gap-x-12 text-lg">
<v-clicks>

1. The end state
2. Same pipeline, new plumbing
3. Building the baseline
4. Life of a PR
5. Test suites are components
6. Transition for developers
7. Concourse: the developer's harness
8. Will it scale?
9. Keeping it safe
10. Open questions

</v-clicks>
</div>

<!--
End state first, so the rest has something to hang on. Then how we get there, then the hard parts.
-->

---
layout: section
---

# 1 · The end state

---

# One baseline, request-routed sandboxes

<img src="/images/ins-end-state.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
One shared baseline tracking main, run like a small production. Everyone else's calls go straight to it.
A PR deploys only what it changed, a04′, into its own sandbox namespace.
Purple requests carry the routing key sandbox=pr-482; the mesh sends them to a04′, and a04′'s own calls continue into the baseline.
Tests T01, T02 run inside the sandbox; the e2e suite E01 comes in from outside through the ingress gateway, like a real client.
-->

---

# Words we'll use

| Term | Meaning |
|---|---|
| **Baseline** | The shared environment tracking `main`. What our CI env becomes. |
| **Sandbox** | A namespace per PR with only the changed services (`a04′`) |
| **Routing key** | `sandbox=pr-482`, carried on every call and message |
| **`p01…` / `a01…`** | Platform services / application services |
| **`T01…` / `E01…`** | Test suites in the PR namespace / e2e suites outside the cluster |
| **Tier 1 · 2 · 3** | Service with no data · relational DB · DB + messages |

<!--
"Baseline" is the term sandbox tools use. Lyft calls theirs shared staging. Uber and DoorDash use production itself.
-->

---

# Who already works this way

<v-clicks>

- **Lyft:** full copies per developer → **shared staging** with request overrides (our closest match)
- **Uber** (SLATE, BITS) and **DoorDash** (test tenant): the baseline is **production** itself
- Path in one line: **shared staging first**, production with tenancy maybe one day

</v-clicks>

<div v-click class="mt-8 text-sm opacity-70">The driver isn't the repo layout. It's many services that only meet each other at runtime.</div>

<!--
Lyft and DoorDash are mostly separate repos, like us. The repo layout decides whether you need a merge queue; the microservices decide whether you need a baseline.
-->

---
layout: section
---

# 2 · Same pipeline, new plumbing

---

# Developers keep their harness

<img src="/images/ins-same-pipeline.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
Top: today. The pipeline deploys into f04, a full copy of 100 services with their DBs and queues.
Bottom: the same jobs, the same rerun button, the same logs. One new job creates the sandbox infra, and only a04′ gets deployed.
That's the message: same pipeline, same buttons, same logs. Only what's behind it changes.
-->

---
layout: section
---

# 3 · Building the baseline

---

# Choosing the baseline

<img src="/images/ins-baseline-groups.svg" class="w-full max-h-95 object-contain mx-auto" />

<!--
It doesn't have to be one cluster or one namespace forever.
Start with one. Split by service group, where calls mostly stay inside the group. Split by developer region only when one region's daytime collides with another's maintenance.
-->

---

# Three tiers of services

<img src="/images/ins-tiers.svg" class="w-full max-h-95 object-contain mx-auto" />

<!--
Tier 1: no data at all, REST only, like a gateway. Rare but simplest: a PR needs only a routing rule.
Tier 2: owns a relational schema. A PR may need its own schema in a PR DB.
Tier 3: DB plus SNS/SQS. A PR may need its own queue.
We build the baseline in this order, so we learn on the easy cases.
-->

---
layout: section
---

# 4 · Life of a PR

---

# Ten steps, each a Concourse job

<img src="/images/ins-pr-map.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
This is the map for the next slides. Each step is visible as a job in the PR's pipeline.
-->

---

# 1–2 · PR opened, image published

<img src="/images/ins-life-1-2.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
PR 482 changes a04. CI builds, runs unit and contract tests, dockerizes and publishes the image, pinned by digest.
Nothing exists in the cluster for this PR yet. The baseline is untouched.
(Security scans: optional toggle on the PR; enforced after merge to master.)
-->

---

# 3–4 · Plan, then create the sandbox infra

<img src="/images/ins-life-3-4.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
The plan step reads the diff and picks the tier. A plain code change is Tier 1.
Create sandbox infra: the namespace and the routing rule. The routing rule is always there; DB and queues only when the change needs them.
-->

---

# 5–6 · Deploy the system under test

<img src="/images/ins-life-5-6.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
helm upgrade --install a04 into ns pr-482, image pinned by digest, with --wait and --atomic.
Ready check: pods pass readiness probes and the routing rule is active. Only then do tests start.
-->

---

# 7 · Tests run with the routing key

<img src="/images/ins-life-7.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
T01 and T02 run inside the sandbox; E01 comes from outside through the ingress gateway.
Every call carries sandbox=pr-482. The mesh sends a04 calls to a04′; a04′ calls p01 in the baseline as usual.
Everyone else keeps going straight to the baseline.
-->

---

# 8–9 · Results, then the re-push loop

<img src="/images/ins-life-8-9.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
Results show on the PR as a build status that links to the pipeline.
A new push resets the checks (repo rule), redeploys a04′ in place, and runs the suites again: all, or only the failed ones.
The sandbox stays up between pushes, so the developer can inspect it.
-->

---

# 10 · Merge or close

<img src="/images/ins-life-10.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
On merge, main deploys the new a04 to the baseline. The sandbox and its routing rule are deleted.
On close, the same teardown. The TTL catches anything the close event missed.
-->

---

# When the deploy itself fails

<img src="/images/ins-deploy-failed.svg" class="w-full max-h-95 object-contain mx-auto" />

<!--
--wait makes Helm wait for readiness; --atomic rolls back if it never gets there.
The deploy job is red, the test jobs never start, and the PR check fails with a link to the logs.
Fix and push, or press + on the deploy job if it was a temporary problem.
-->

---

# Tier 2 · the PR gets its own schema

<img src="/images/ins-tier2-sandbox.svg" class="w-full max-h-100 object-contain mx-auto" />

<!--
Same steps. Plan sees a Liquibase changeset, so create-infra adds a PR DB (Aurora Serverless).
Liquibase applies the PR's changesets there before a04′ starts. Purple traffic from a04′ goes to the PR DB; the baseline DB is untouched.
-->

---

# Tier 2 · on merge

<img src="/images/ins-tier2-merge.svg" class="w-full max-h-95 object-contain mx-auto" />

<!--
Order matters: the DDL reaches the baseline DB first, then the new a04.
Migrations only add (expand). Removing old columns waits for a later release (contract).
That's what lets the code roll back while the DB only ever moves forward.
-->

---

# Tier 3 · messages

<img src="/images/ins-tier3-messages.svg" class="w-full max-h-95 object-contain mx-auto" />

<!--
One SNS topic, as today. The PR gets its own SQS queue, subscribed with a filter policy sandbox = pr-482.
The baseline queue's filter skips anything tagged with a sandbox. The tag travels as a message attribute.
-->

---
layout: section
---

# 5 · Test suites are components

---

# Tests are versioned and deployed like services

<img src="/images/ins-tests-components.svg" class="w-full max-h-90 object-contain mx-auto" />

<div class="text-sm opacity-80 mt-2">Which suites run is configuration: an app service runs its own suites; a platform service runs its own <b>plus its main consumers'</b>.</div>

<!--
Our suites live in their own repos. A change to tests is just another component in a sandbox.
A tests-only PR runs the new tests against the plain baseline: it proves the tests pass on main before they merge.
Full e2e runs before merge in the sandbox; after merge only a light check (see Keeping it safe).
-->

---
layout: section
---

# 6 · Transition for developers

---

# Three steps, no big bang

<img src="/images/ins-transition.svg" class="w-full max-h-90 object-contain mx-auto" />

<!--
Step 2 is the key: the same agreed feature branch name across repos, but instead of a full copy we deploy only the repos that have that branch, as one sandbox on the baseline.
Developers change nothing about how they work. Step 3 then moves to per-PR sandboxes.
-->

---

# Linked PRs: one shared name

<img src="/images/ins-linked-prs.svg" class="w-full max-h-90 object-contain mx-auto" />

<div class="text-sm opacity-80 mt-2">The key comes from the <b>branch name</b> (PR title as fallback), is checked against an open Jira issue, and works the same for PRs opened by people or agents.</div>

<!--
PRs don't reference each other. They all carry one link name, like the Jira key FEAT-123, which is today's feature branch name.
The first PR's pipeline creates the sandbox; later ones add their service to it. Order stops mattering.
Since tests live in separate repos, most changes touch two repos, so this must be cheap and automatic.
Merge providers first. The sandbox goes away when the last linked PR closes.
-->

---
layout: section
---

# 7 · Concourse: the developer's harness

---

# Which suite failed, its logs, rerun

<img src="/images/ins-harness.svg" class="w-full max-h-90 object-contain mx-auto" />

<!--
One pipeline per PR, grouped as instances of pr-sandbox in the UI.
Each suite is its own job: a red box shows which failed, its log has the test output (streamed with kubectl logs -f), and + reruns just that suite.
-->

---

# Seeing the service side

<v-clicks>

- **Test output** streams into the Concourse job log
- **Service logs** stay in the log sink. Each job prints a link already filtered by `sandbox=pr-482`
- The shared library puts **routing key, trace ID and span ID** on every log line
- Traces: a small span processor copies the key onto each span, so traces filter by sandbox too

</v-clicks>

<!--
Sending developers to a Kubernetes dashboard is too low-level. One click from a red job to the right events.
-->

---

# Retention

| What | When it goes |
|---|---|
| Sandbox namespace, routing rule, PR DB schema, PR queue | On PR merge or close · **TTL ~48h after last push** as backup |
| PR pipeline | Archived on close (soft delete, still browsable) |
| Archived PR pipelines | Destroyed after **~1 week** by a small scheduled job |
| Build logs | `build_log_retention` per job |

<!--
The PR DB lives outside the cluster, so deleting the namespace doesn't remove it. It needs its own cleanup step.
-->

---
layout: section
---

# 8 · Will it scale?

---

# Rough sizing at peak

| | Estimate |
|---|---|
| New PRs | ~500/day · ~40/hour at peak |
| Pipeline runs | ~1,500/day (≈3 pushes per PR) |
| Live sandboxes at once | ~500–1,000 |
| Sandbox compute | ~250 vCPU idle for 1,000: about today's 12 full copies, for 500 PRs/day |
| Test load on the baseline | ~300 requests/s: tiny next to production |
| Concourse pipelines | ~500 new/day, ~2,500 kept for a week |

<div class="text-xs opacity-60 mt-2">Assumes 100 services, ~5 PRs per service per day, PRs open 1–2 days. Load won't be even: some repos will see 100 PRs a day.</div>

<!--
The baseline's capacity is not the problem. The number of things each PR creates is.
-->

---

# Where it gets tight

<v-clicks>

- **PR DBs:** one Aurora cluster per PR hits the default quota of 40 clusters per region → **one PR DB cluster per domain, a schema per PR**
- **Idle sandboxes:** scale to zero after a few hours, back up on the next push (cuts compute 3–5×)
- **Concourse:** trigger PR pipelines by webhook, not polling; load-test early
- **Istio:** ~1,000 routing rules → limit which sidecars receive each one

</v-clicks>

---

# PR DBs by domain

<img src="/images/ins-domain-prdbs.svg" class="w-full max-h-80 object-contain mx-auto" />

<!--
Domains mostly line up with the dev teams' regions too, so this also hints at how baselines might split later.
-->

---

# Not every PR needs a sandbox

| Change | Path |
|---|---|
| Docs only (`README`, `*.md`) | Lint only. No build, no sandbox |
| Test repo only | New tests against the baseline |
| Config (Helm values, flags) | Reuse main's image digest · render and check the chart · smoke tests only if runtime behavior changes |
| Code | Full path |
| Code + DDL / events | Full path + Tier 2/3 infra |

<!--
The plan step is a router: it classifies the change by the paths it touches and picks the cheapest safe path.
-->

---

# Keeping main green

<v-clicks>

- **Most repos:** branch up to date with `main` + passing sandbox run before merge; a Concourse job auto-rebases and reruns
- **Hot repos** (50–100 PRs/day): a **merge queue** (Bitbucket Cloud has one; it triggers its own Pipelines, so Concourse needs a spike)
- **Across repos:** "latest enough" + contract tests, and the baseline's post-merge check

</v-clicks>

---
layout: section
---

# 9 · Keeping it safe

---

# Service candidate: the baseline stays green

<img src="/images/ins-service-candidate.svg" class="w-full max-h-90 object-contain mx-auto" />

<!--
After merge the new a04 runs next to the live one with no traffic. A light post-merge check (or none, if the baseline hasn't changed since the sandbox run) goes to it with route=a04-candidate.
Same routing mechanism as sandboxes, one key. Shift right away per service; no batches.
A failed candidate is rejected: removed, and main is reverted or fixed fast.
-->

---

# Rollback when the DB already moved

<v-clicks>

- **Code goes back, the DB goes forward.** Redeploy the previous release; never auto-undo DDL on shared DBs
- Works because migrations **only add** (expand/contract)
- Old code must tolerate new data: new enum values, columns, event fields
- Bad data → a **new changeset** that fixes it. Keep data changes separate from DDL
- Baseline only: restoring from a snapshot or reseeding is an acceptable escape hatch

</v-clicks>

---

# Hard cases

| Case | Approach |
|---|---|
| Calls must carry the key | Shared platform library on **OpenTelemetry baggage** (Java + Python); flag requests without it |
| Cron and batch jobs | PR's job sets its own key; batch reads the key from tagged rows |
| DLQ retries · webhooks | Key in message attributes · in the callback URL or a correlation ID |
| Caches · S3 | Prefix keys / paths with the sandbox ID; S3 lifecycle rule expires them |
| Background workers | A sandbox runs one only if the PR changed it, taking only tagged work |

---
layout: section
---

# 10 · Open questions

---

# For you

<div class="text-xs">

1. **Routing key everywhere:** who owns the shared library, and how do we find services that drop the key?
2. **Baseline ownership:** who is on call when it's red? Tests should say "infra blocked", not "your test failed"
3. **Flaky tests:** quarantine rules; separating infra failures from test failures
4. **Linked PRs:** is the feature branch name the right link? Does the test repo declare which service branch it needs?
5. **External dependencies:** vendor sandboxes and API keys shared across all PRs
6. **Baseline moving mid-test:** pause, retry, or accept?
7. **After the baseline:** pre-prod, UAT and perf stay as they are, right?
8. **Inner loop:** route a sandbox's requests to a laptop (mirrord, Telepresence)?
9. **Agent-opened PRs:** limits on live sandboxes per key and per author, a shorter TTL, and what to do with PRs that have no valid key

</div>

<!--
These are the parts I'm least sure about. Pick the ones you have opinions on.
-->

---
layout: center
---

# Thank you

Feedback welcome: what's missing, what's wrong, what scares you.
