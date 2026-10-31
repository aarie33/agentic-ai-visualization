import { afterEach, describe, expect, it } from "vitest";
import type { ServerEvent } from "@virtual-office/shared";
import { startAgentService, type RunningService } from "../src/server";
import { FAST, openStream } from "./helpers";

let service: RunningService | undefined;

afterEach(async () => {
  await service?.stop();
  service = undefined;
});

const types = (events: ServerEvent[]) => events.map((e) => e.type);

describe("a Run by Autopilot: Bambang then Karjo", () => {
  it("has 3 to 5 Steps per Task with a Handoff from Bambang to Karjo in between", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const stream = await openStream(service.port);

    const start = await stream.until((e) => e.type === "run-started");
    const handoff = await stream.until((e) => e.type === "handoff", start);
    const afterKarjo = await stream.until((e) => e.type === "task-finished" && e.role === "quill", handoff);
    stream.close();

    const run = stream.events.slice(start, afterKarjo + 1);
    const steps = (role: string) => run.filter((e) => e.type === "step-started" && e.role === role);
    expect(steps("scout").length).toBeGreaterThanOrEqual(3);
    expect(steps("scout").length).toBeLessThanOrEqual(5);
    expect(steps("quill").length).toBeGreaterThanOrEqual(3);
    expect(steps("quill").length).toBeLessThanOrEqual(5);

    const kinds = types(run);
    expect(kinds[0]).toBe("run-started");
    const handoffAt = run.findIndex((e) => e.type === "handoff");
    const scoutDone = run.findIndex((e) => e.type === "task-finished" && e.role === "scout");
    const firstKarjoStep = run.findIndex((e) => e.type === "step-started" && e.role === "quill");
    const lastBambangStep = run.map((e) => e.type === "step-started" && e.role === "scout").lastIndexOf(true);
    expect(lastBambangStep).toBeLessThan(scoutDone);
    expect(scoutDone).toBeLessThan(handoffAt);
    expect(handoffAt).toBeLessThan(firstKarjoStep);
    expect(run[handoffAt]).toMatchObject({ type: "handoff", from: "scout", to: "quill" });
  });

  it("announces a Topic with a known Category and Indonesian Step labels", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const stream = await openStream(service.port);

    const start = await stream.until((e) => e.type === "run-started");
    await stream.until((e) => e.type === "step-started", start);
    stream.close();

    const started = stream.events[start]!;
    if (started.type !== "run-started") throw new Error("unexpected");
    expect(started.topic.length).toBeGreaterThan(0);
    expect(["AI", "IT", "IoT"]).toContain(started.category);
    const step = stream.events.find((e) => e.type === "step-started");
    expect(step && step.type === "step-started" && step.label.length > 0).toBe(true);
  });

  it("never has more than one Run in progress", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const stream = await openStream(service.port);

    let from = 0;
    for (let i = 0; i < 3; i++) from = (await stream.until((e) => e.type === "run-finished", from)) + 1;
    stream.close();

    let inProgress = 0;
    for (const e of stream.events.slice(0, from)) {
      if (e.type === "snapshot" && e.snapshot.run) inProgress = 1;
      if (e.type === "run-started") inProgress += 1;
      if (e.type === "run-finished") inProgress -= 1;
      expect(inProgress).toBeLessThanOrEqual(1);
      expect(inProgress).toBeGreaterThanOrEqual(0);
    }
  });

  it("waits the configured gap before and between Runs", async () => {
    service = await startAgentService({ port: 0, config: { ...FAST, autopilotGapMs: 150 } });
    const began = Date.now();
    const stream = await openStream(service.port);

    await stream.until((e) => e.type === "run-started");
    stream.close();

    expect(Date.now() - began).toBeGreaterThanOrEqual(120);
  });

  it("gives a connection mid-Run a snapshot describing that Run", async () => {
    service = await startAgentService({
      port: 0,
      config: { stepDurationMs: [30, 40], handoffMs: 30, autopilotGapMs: 0 },
    });
    const live = await openStream(service.port);
    const start = await live.until((e) => e.type === "run-started");
    const started = live.events[start]!;
    if (started.type !== "run-started") throw new Error("unexpected");
    await live.until((e) => e.type === "step-started", start);

    const late = await openStream(service.port);
    await late.until((e) => e.type === "snapshot");
    live.close();
    late.close();

    const snap = late.events[0]!;
    if (snap.type !== "snapshot") throw new Error("unexpected");
    expect(snap.snapshot.run).toEqual({ topic: started.topic, category: started.category });
    expect(snap.snapshot.agents.some((a) => a.status === "working" && a.stepLabel)).toBe(true);
  });
});

describe("Tejo publishes to every Platform", () => {
  it("hands off to Tejo, then posts to X, LinkedIn, Instagram and TikTok in that order, one Step each", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const stream = await openStream(service.port);

    const start = await stream.until((e) => e.type === "run-started");
    const end = await stream.until((e) => e.type === "run-finished", start);
    stream.close();

    const run = stream.events.slice(start, end + 1);
    const handoffs = run.filter((e) => e.type === "handoff").map((e) => e.type === "handoff" && `${e.from}>${e.to}`);
    expect(handoffs).toEqual(["scout>quill", "quill>herald"]);

    const heraldSteps = run.filter((e) => e.type === "step-started" && e.role === "herald");
    expect(heraldSteps.map((e) => (e.type === "step-started" ? e.label : ""))).toEqual([
      "Memposting ke X…",
      "Memposting ke LinkedIn…",
      "Memposting ke Instagram…",
      "Memposting ke TikTok…",
    ]);

    const posts = run.flatMap((e) => (e.type === "post-published" ? [e.post] : []));
    expect(posts.map((p) => p.platform)).toEqual(["X", "LinkedIn", "Instagram", "TikTok"]);
    expect(posts.map((p) => p.shape)).toEqual(["thread", "long-post", "carousel", "video-script"]);
    // A Post follows its Step: the Step for a Platform starts before that Platform's Post.
    heraldSteps.forEach((step, i) => {
      expect(run.indexOf(step)).toBeLessThan(run.findIndex((e) => e.type === "post-published" && e.post.platform === posts[i]!.platform));
    });
  });

  it("adapts one piece of writing for every Platform, in Indonesian, on the Run's Topic", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const stream = await openStream(service.port);

    const start = await stream.until((e) => e.type === "run-started");
    const end = await stream.until((e) => e.type === "run-finished", start);
    stream.close();

    const run = stream.events.slice(start, end + 1);
    const started = run[0]!;
    if (started.type !== "run-started") throw new Error("unexpected");
    const posts = run.flatMap((e) => (e.type === "post-published" ? [e.post] : []));

    expect(new Set(posts.map((p) => p.id)).size).toBe(4);
    for (const post of posts) {
      expect(post.topic).toBe(started.topic);
      expect(post.category).toBe(started.category);
      expect(post.body.length).toBeGreaterThan(0);
      expect(post.body.join(" ")).toContain(started.topic);
    }
    // Thread, carousel and script are split into several parts; the long post has paragraphs too.
    expect(posts.find((p) => p.platform === "X")!.body.length).toBeGreaterThanOrEqual(3);
    expect(posts.find((p) => p.platform === "Instagram")!.body.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps the Feed newest first and never above 50 Posts", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const live = await openStream(service.port);

    let from = 0;
    let finished = 0;
    while (finished < 14) {
      from = (await live.until((e) => e.type === "run-finished", from, 20_000)) + 1;
      finished += 1;
    }
    const late = await openStream(service.port);
    await late.until((e) => e.type === "snapshot");
    live.close();
    late.close();

    const snap = late.events[0]!;
    if (snap.type !== "snapshot") throw new Error("unexpected");
    expect(snap.snapshot.feed.length).toBe(50);
    const times = snap.snapshot.feed.map((p) => p.publishedAt);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
    expect(new Set(snap.snapshot.feed.map((p) => p.id)).size).toBe(50);
  }, 30_000);
});
