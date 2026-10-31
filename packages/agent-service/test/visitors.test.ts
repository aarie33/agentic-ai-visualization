import { afterEach, describe, expect, it } from "vitest";
import { AUTOPILOT_PAUSE_PATH, TOPICS_PATH, applyEvent, type ServerEvent, type Snapshot } from "@virtual-office/shared";
import type { AgentServiceConfig } from "../src/config";
import { startAgentService, type RunningService } from "../src/server";
import { FAST, openStream, postJson, type EventStream } from "./helpers";

let services: RunningService[] = [];

afterEach(async () => {
  await Promise.all(services.map((s) => s.stop()));
  services = [];
});

async function start(config: Partial<AgentServiceConfig> = FAST) {
  const service = await startAgentService({ port: 0, config });
  services.push(service);
  return service;
}

/** The state a Visualizer would hold after seeing the stream up to and including `index`. */
function foldUpTo(stream: EventStream, index: number): Snapshot {
  const [first, ...rest] = stream.events.slice(0, index + 1);
  if (!first || first.type !== "snapshot") throw new Error("stream must start with a snapshot");
  return rest.reduce<Snapshot>(applyEvent, first.snapshot);
}

const sameEvent = (a: ServerEvent, b: ServerEvent) => JSON.stringify(a) === JSON.stringify(b);

describe("visitors who arrive in the middle of things", () => {
  it("get a snapshot plus events that add up to exactly what a long-time visitor sees", async () => {
    const service = await start({ ...FAST, autopilotGapMs: 5 });
    const veteran = await openStream(service.port);
    await veteran.until((e) => e.type === "post-published"); // something already in the Feed
    await postJson(service.port, TOPICS_PATH, { topic: "Topik AI untuk pengunjung" });

    const newcomer = await openStream(service.port);
    // Compare the two at a Post the newcomer saw arrive live, a few Runs later.
    const marker = await newcomer.until((e) => e.type === "post-published", 1);
    await newcomer.until((e) => e.type === "run-finished", marker);
    veteran.close();
    newcomer.close();

    const markerEvent = newcomer.events[marker]!;
    const inVeteran = veteran.events.findIndex((e) => sameEvent(e, markerEvent));
    expect(inVeteran).toBeGreaterThan(0);
    expect(foldUpTo(newcomer, marker)).toEqual(foldUpTo(veteran, inVeteran));
  });

  it("get the whole office in the snapshot: Run, Agents, queue, Autopilot and Feed", async () => {
    const service = await start({ stepDurationMs: [25, 30], handoffMs: 25, autopilotGapMs: 0 });
    await postJson(service.port, TOPICS_PATH, { topic: "Topik IoT dalam antrean" });
    const watcher = await openStream(service.port);
    await watcher.until((e) => e.type === "post-published", 0, 15_000); // Feed has a Post, a Run is still going
    await postJson(service.port, TOPICS_PATH, { topic: "Topik AI menunggu giliran" });
    await postJson(service.port, AUTOPILOT_PAUSE_PATH);

    const visitor = await openStream(service.port);
    await visitor.until((e) => e.type === "snapshot");
    watcher.close();
    visitor.close();

    const snap = visitor.events[0]!;
    if (snap.type !== "snapshot") throw new Error("unexpected");
    expect(snap.snapshot.run).not.toBeNull();
    expect(snap.snapshot.agents.some((a) => a.status === "working")).toBe(true);
    expect(snap.snapshot.queue.map((q) => q.topic)).toContain("Topik AI menunggu giliran");
    expect(snap.snapshot.autopilot).toBe("paused");
    expect(snap.snapshot.feed.length).toBeGreaterThan(0);
  }, 20_000);

  it("get a fresh snapshot after the connection drops and they reconnect", async () => {
    const service = await start({ ...FAST, autopilotGapMs: 5 });
    const first = await openStream(service.port);
    await first.until((e) => e.type === "run-finished");
    first.close();

    const second = await openStream(service.port);
    await second.until((e) => e.type === "snapshot");
    await second.until((e) => e.type === "run-finished");
    second.close();

    const snap = second.events[0]!;
    if (snap.type !== "snapshot") throw new Error("unexpected");
    expect(snap.snapshot.feed.length).toBeGreaterThanOrEqual(4); // the Feed survived the dropped connection
  });
});

describe("the shared office", () => {
  it("shows a Topic typed by one visitor to every other visitor", async () => {
    const service = await start({ autopilotGapMs: 60_000 });
    const a = await openStream(service.port);
    const b = await openStream(service.port);

    await postJson(service.port, TOPICS_PATH, { topic: "Topik IT dari pengunjung A" });

    const seenByB = await b.until((e) => e.type === "queue-changed");
    a.close();
    b.close();
    expect(b.events[seenByB]).toMatchObject({ queue: [{ topic: "Topik IT dari pengunjung A" }] });
  });
});

describe("restarting the Agent service", () => {
  it("starts again with an empty Feed and queue and Autopilot on", async () => {
    const before = await start({ autopilotGapMs: 60_000 });
    await postJson(before.port, TOPICS_PATH, { topic: "Topik AI sebelum restart" });
    await postJson(before.port, AUTOPILOT_PAUSE_PATH);
    await before.stop();
    services = [];

    const after = await start({ autopilotGapMs: 60_000 });
    const stream = await openStream(after.port);
    await stream.until((e) => e.type === "snapshot");
    stream.close();

    expect(stream.events[0]).toMatchObject({
      type: "snapshot",
      snapshot: { queue: [], feed: [], autopilot: "on", run: null },
    });
  });
});
