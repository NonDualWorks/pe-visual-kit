# pe-visual-kit

Visual language for platform engineering and software delivery: static diagrams and animated explainers that share one set of shapes and colors.

| Folder | Status | What |
|---|---|---|
| `excalidraw-kit/` | v0.1 | Excalidraw component libraries (sketchy + clean) and their generator |
| `talks/` | started | Slidev decks; `env-strategy-2026/` is the environments pitch |
| `animator/` | planned | GSAP toolkit for animated scenes |
| `concepts/` | planned | Reference diagrams: topologies, glossary |

## Glossary

**Building blocks**
- **Component**: one microservice.
- **Platform services**: components that make up the platform. Developed and versioned like a library (Platform 2.4).
- **App services**: components that consume the platform.
- **Product**: platform services + app services. What we sell and ship. Reserve "product" for the whole; never use it for the app-services half.

**Manifests**
- **Manifest**: a list of components with pinned versions. May contain references and ranges, e.g. `platform: 2.4.x`.
- **Overlay**: environment- or branch-specific changes on top of a manifest, e.g. `checkout: feat-482`.
- **Release**: a manifest with every reference resolved, every image pinned by digest, and a protected tag (`product/v5.3.0`). Immutable. Release = resolve + pin + tag.

**Environments**
- **Feature env**: a full copy, long-lived and reused. `f01…` for app teams, `p01…` for platform teams. The industry calls this a "preview environment."
- **Hotfix env** (`hf1`): based on the prod release; promotes straight to pre-prod, then back-merges to `master`.
- **CI env**: shared integration environment; one promotion at a time.
- **Baseline** (long term): the shared, always-on environment tracking `main`.
- **Sandbox** (long term, request-routed): only the changed components (an overlay), reached via a routing key.
- **Routing key**: the header/baggage value that selects a sandbox.

Searching the literature: `request-level isolation`, `shared baseline` + `request routing`, Lyft `staging overrides`, Uber `SLATE`.
