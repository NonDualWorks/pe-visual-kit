// Registry: every library item, grouped by category. The "Category · Name" prefix keeps them grouped in Excalidraw.
import { Style, El } from "./core.js";
import { region, cluster, nsBaseline, nsSandbox, envCard, ENVS } from "./places.js";
import { service, serviceWithSidecar, serviceStack } from "./workloads.js";
import { database, schema, taggedRows, messageLog, message, snsTopic, sqsQueue } from "./data.js";
import { mainLine, branch, commit, gitTag, laptop, pullRequest } from "./git.js";
import { meshBoundary, controlPlane, routingRule, ingressGateway } from "./network.js";
import { manifest, MANIFESTS, release, compose, resolveStep } from "./artifacts.js";
import { flow, cdSystem } from "./flow.js";
import { gate, thresholdBar, sandboxInfra, ttl } from "./control.js";
import { badge, step } from "./annotations.js";
import { testSuite, testResult } from "./testing.js";
import { job, resource, rerun, prPipeline } from "./ci.js";

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
export * from "./testing.js";
export * from "./ci.js";

type Item = [string, (s: Style) => El[]];
const states = ["pending", "passed", "blocked"] as const;

export const COMPONENTS: Item[] = [
  // Places
  ["Places · AWS Region", region],
  ["Places · EKS cluster", cluster],
  ["Places · Namespace · baseline", nsBaseline],
  ["Places · Namespace · sandbox (ephemeral)", nsSandbox],
  ...ENVS.map(([n, e]): Item => [`Places · Env · ${n}`, (s) => envCard(s, e)]),
  // Workloads (names: p01… platform, a01… app, a04′ = a04 as changed in a PR)
  ["Workloads · Platform service · p01", (s) => service(s, "platform")],
  ["Workloads · App service · a04", (s) => service(s, "app")],
  ["Workloads · App service · a04′ (PR version)", (s) => service(s, "app", "a04′", true)],
  ["Workloads · Platform service + envoy", (s) => serviceWithSidecar(s, "platform")],
  ["Workloads · App service + envoy", (s) => serviceWithSidecar(s, "app")],
  ["Workloads · App service + envoy · a04′ (PR version)", (s) => serviceWithSidecar(s, "app", "a04′", true)],
  ["Workloads · Platform service stack", (s) => serviceStack(s, "platform")],
  ["Workloads · App service stack", (s) => serviceStack(s, "app")],
  // Data
  ["Data · Relational · Baseline DB (RDS Aurora)", (s) => database(s, "Baseline DB\nRDS Aurora", false)],
  ["Data · Relational · PR DB (Aurora Serverless)", (s) => database(s, "PR DB\nAurora Serverless", true)],
  ["Data · Relational · Schema", (s) => schema(s, "schema: payments")],
  ["Data · Relational · Schema per PR (ephemeral)", (s) => schema(s, "schema: pr_482", true)],
  ["Data · Relational · Tagged rows", taggedRows],
  ["Data · Messages · Topic", (s) => messageLog(s, "orders")],
  ["Data · Messages · Topic per PR (ephemeral)", (s) => messageLog(s, "orders.pr-482", true)],
  ["Data · Messages · Message", (s) => message(s)],
  ["Data · Messages · Message (tagged)", (s) => message(s, "pr-482")],
  ["Data · Messages · SNS topic", (s) => snsTopic(s)],
  ["Data · Messages · SQS queue · baseline", (s) => sqsQueue(s, "orders-a04", "filter: no sandbox")],
  ["Data · Messages · SQS queue · PR (ephemeral)", (s) => sqsQueue(s, "orders-a04-pr-482", "filter: sandbox = pr-482", true)],
  // Network & mesh
  ["Network · Mesh boundary · istio", meshBoundary],
  ["Network · istiod control plane", controlPlane],
  ["Network · Ingress gateway", ingressGateway],
  ["Network · Routing rule · PR sandbox", (s) => routingRule(s)],
  ["Network · Routing rule · service candidate", (s) => routingRule(s, "route=a04-candidate", "a04 v2 (ns baseline)")],
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
  ["Git · Pull request", (s) => pullRequest(s)],
  // Control
  ...states.map((st): Item => [`Control · Gate · automated · ${st}`, (s) => gate(s, "automated", st, "must be current")]),
  ...states.map((st): Item => [`Control · Gate · human · ${st}`, (s) => gate(s, "human", st, "RM approval")]),
  ["Control · Threshold bar", thresholdBar],
  ["Control · Sandbox infra · full", (s) => sandboxInfra(s)],
  ["Control · Sandbox infra · routing only", (s) => sandboxInfra(s, "pr-482", false, false)],
  ["Control · TTL", (s) => ttl(s)],
  // Testing
  ["Testing · Suite · T01 contract (in PR namespace)", (s) => testSuite(s, "T01", "contract")],
  ["Testing · Suite · T02 api (in PR namespace)", (s) => testSuite(s, "T02", "api")],
  ["Testing · Suite · E01 e2e (outside cluster)", (s) => testSuite(s, "E01", "e2e", true)],
  ["Testing · Result · passed", (s) => testResult(s, "passed")],
  ["Testing · Result · failed", (s) => testResult(s, "blocked")],
  ["Testing · Result · running", (s) => testResult(s, "pending")],
  // CI · Concourse (the developer's harness)
  ["CI · Concourse · Job · pending", (s) => job(s, "deploy a04′", "pending")],
  ["CI · Concourse · Job · started", (s) => job(s, "deploy a04′", "started")],
  ["CI · Concourse · Job · succeeded", (s) => job(s, "deploy a04′", "succeeded")],
  ["CI · Concourse · Job · failed", (s) => job(s, "deploy a04′", "failed")],
  ["CI · Concourse · Resource", (s) => resource(s, "pr-482 (git)")],
  ["CI · Concourse · Rerun (+)", rerun],
  ["CI · Concourse · PR pipeline · passing", (s) => prPipeline(s, "passing")],
  ["CI · Concourse · PR pipeline · test failed", (s) => prPipeline(s, "test-failed")],
  ["CI · Concourse · PR pipeline · deploy failed", (s) => prPipeline(s, "deploy-failed")],
  // Annotations
  ["Annotations · Badge · neutral", (s) => badge(s, "neutral", "v2.4.3")],
  ["Annotations · Badge · ok", (s) => badge(s, "ok", "contracts OK")],
  ["Annotations · Badge · warn", (s) => badge(s, "warn", "3 behind")],
  ["Annotations · Step number", (s) => step(s, 1)],
];
