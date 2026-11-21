# TODO

## Order of work
1. **Phanidhar:** try the starter deck (`talks/env-strategy-2026`): run it, swap in real pictures, fill in TODO numbers.
2. **Close the presentation (deliverable):** add the PR sandbox overlay proposal to Part 3: product PR and platform PR flows, overlays on the baseline, data/async isolation, contracts; then record.
3. **Then the animation track:** Module 1 (GSAP basics) using the kit; bridge kit components → named SVG groups → GSAP (`animator/`).

## Pitch storyline (in this order)
1. Capture and agree on the current state: a dozen preview envs (full copies), first finisher promotes to CI env and merges to `master`, everyone else rebases.
2. Short-term enhancements.
3. Medium and long term: introduce a mesh → baseline + request-routed sandboxes.

## Scenes to build later
- [ ] Topology options A / B / C as three small scenes, side by side:
  - A: one region, one cluster: baseline + sandbox namespaces, single-cluster mesh
  - B: one baseline per region, local sandboxes, single-cluster mesh in each region
  - C: one baseline, sandboxes in another region: cross-region multi-cluster mesh (most complex)
- [ ] Two-region scene: east-west gateways, shared-CA badge, Aurora Global Database (writer/reader, async replication ~1s, global writer endpoint)

## Excalidraw kit: next batch
- [ ] Routing: routing-key tag, tagged-request arrow, normal-traffic arrow, mTLS call
- [ ] Multi-cluster: east-west gateway, shared-CA badge
- [ ] Contracts: contract, broker
- [ ] Environment labels: preview, pre-prod, prod
- [ ] Aurora Global: writer / reader cylinders, replication connector, global writer endpoint tag

## Open questions
- Why are dev environments in two regions today? (latency for teams, capacity, data residency, DR rehearsal) This decides option A vs B.
