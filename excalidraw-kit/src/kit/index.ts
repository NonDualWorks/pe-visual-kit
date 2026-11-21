// Registry: every library item, grouped by category. The "Category · Name" prefix keeps them grouped in Excalidraw.
import { Style, El } from "./core.js";
import { region, cluster, nsBaseline, nsSandbox, envCard, ENVS } from "./places.js";
import { service, serviceWithSidecar, serviceStack } from "./workloads.js";
import { database, schema, taggedRows, messageLog, message } from "./data.js";
import { mainLine, branch, commit, gitTag, laptop } from "./git.js";
import { meshBoundary, controlPlane } from "./network.js";
import { manifest, MANIFESTS, release, compose, resolveStep } from "./artifacts.js";
import { flow, cdSystem } from "./flow.js";
import { gate, thresholdBar } from "./control.js";
import { badge } from "./annotations.js";

export * from "./core.js";
export * from "./places.js";
export * from "./workloads.js";
export * from "./data.js";
export * from "./git.js";
export * from "./network.js";
export * from "./artifacts.js";
export * from "./flow.js";
export * from "./control.js";
export * from "./annotations.js";

type Item = [string, (s: Style) => El[]];
const states = ["pending", "passed", "blocked"] as const;

export const COMPONENTS: Item[] = [
  // Places
  ["Places · AWS Region", region],
  ["Places · EKS cluster", cluster],
  ["Places · Namespace · baseline", nsBaseline],
  ["Places · Namespace · sandbox (ephemeral)", nsSandbox],
  ...ENVS.map(([n, e]): Item => [`Places · Env · ${n}`, (s) => envCard(s, e)]),
  // Workloads
  ["Workloads · Platform service", (s) => service(s, "platform")],
  ["Workloads · App service", (s) => service(s, "app")],
  ["Workloads · Platform service + envoy", (s) => serviceWithSidecar(s, "platform")],
  ["Workloads · App service + envoy", (s) => serviceWithSidecar(s, "app")],
  ["Workloads · Platform service stack", (s) => serviceStack(s, "platform")],
  ["Workloads · App service stack", (s) => serviceStack(s, "app")],
  // Data
  ["Data · Relational · RDS Aurora", (s) => database(s, "ledger_db\nRDS Aurora", false)],
  ["Data · Relational · Aurora Serverless (ephemeral)", (s) => database(s, "pr482_db\nAurora Serverless", true)],
  ["Data · Relational · Schema", (s) => schema(s, "schema: payments")],
  ["Data · Relational · Schema per PR (ephemeral)", (s) => schema(s, "schema: pr_482", true)],
  ["Data · Relational · Tagged rows", taggedRows],
  ["Data · Messages · Topic", (s) => messageLog(s, "orders")],
  ["Data · Messages · Topic per PR (ephemeral)", (s) => messageLog(s, "orders.pr-482", true)],
  ["Data · Messages · Message", (s) => message(s)],
  ["Data · Messages · Message (tagged)", (s) => message(s, "pr-482")],
  // Network & mesh
  ["Network · Mesh boundary · istio", meshBoundary],
  ["Network · istiod control plane", controlPlane],
  // Artifacts
  ...MANIFESTS.map(([n, m]): Item => [`Artifacts · Manifest · ${n}`, (s) => manifest(s, m)]),
  ["Artifacts · Release (tagged)", release],
  ["Artifacts · Compose (+)", compose],
  ["Artifacts · Resolve · pin · tag", resolveStep],
  // Flow
  ["Flow · Promote", (s) => flow(s, "promote")],
  ["Flow · Sync (forced)", (s) => flow(s, "syncForced")],
  ["Flow · Sync (pull)", (s) => flow(s, "syncPull")],
  ["Flow · Back-merge", (s) => flow(s, "backMerge")],
  ["Flow · Deploy", (s) => flow(s, "deploy")],
  ["Flow · Request", (s) => flow(s, "request")],
  ["Flow · Request (tagged)", (s) => flow(s, "requestTagged")],
  ["Flow · git push", (s) => flow(s, "push")],
  ["Flow · CD system", cdSystem],
  // Git
  ["Git · Main line", (s) => mainLine(s)],
  ["Git · Feature branch", (s) => branch(s)],
  ["Git · Commit", (s) => commit(s)],
  ["Git · Merge commit", (s) => commit(s, "merge")],
  ["Git · Tag", (s) => gitTag(s)],
  ["Git · Dev laptop", (s) => laptop(s)],
  // Control
  ...states.map((st): Item => [`Control · Gate · automated · ${st}`, (s) => gate(s, "automated", st, "must be current")]),
  ...states.map((st): Item => [`Control · Gate · human · ${st}`, (s) => gate(s, "human", st, "RM approval")]),
  ["Control · Threshold bar", thresholdBar],
  // Annotations
  ["Annotations · Badge · neutral", (s) => badge(s, "neutral", "v2.4.3")],
  ["Annotations · Badge · ok", (s) => badge(s, "ok", "contracts OK")],
  ["Annotations · Badge · warn", (s) => badge(s, "warn", "3 behind")],
];
