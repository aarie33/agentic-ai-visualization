import { afterEach, describe, expect, it } from "vitest";
import { AUTOPILOT_PAUSE_PATH, TOPICS_PATH } from "@virtual-office/shared";
import { startAgentService, type RunningService } from "../src/server";
import { FAST, openStream, postJson } from "./helpers";

let service: RunningService | undefined;

afterEach(async () => {
  await service?.stop();
  service = undefined;
});

const settle = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** No Run starts for a minute, so queued Topics stay queued. */
const HELD = { autopilotGapMs: 60_000 };

describe("submitting a Topic", () => {
  it("accepts a Topic, detects its Category and puts it in the queue", async () => {
    service = await startAgentService({ port: 0, config: HELD });
    const stream = await openStream(service.port);

    const res = await postJson(service.port, TOPICS_PATH, { topic: "  Kubernetes untuk tim kecil " });

    expect(res.status).toBe(201);
    expect(res.json).toEqual({ ok: true, topic: "Kubernetes untuk tim kecil", category: "IT" });
    const changed = await stream.until((e) => e.type === "queue-changed");
    stream.close();
    expect(stream.events[changed]).toEqual({
      type: "queue-changed",
      queue: [{ topic: "Kubernetes untuk tim kecil", category: "IT" }],
    });
  });

  it.each([
    ["AI", "Dampak chatbot untuk layanan pelanggan"],
    ["IT", "Praktik terbaik desain API"],
    ["IoT", "Sensor suhu dengan ESP32"],
  ])("detects %s", async (category, topic) => {
    service = await startAgentService({ port: 0, config: HELD });

    const res = await postJson(service.port, TOPICS_PATH, { topic });

    expect(res.json).toMatchObject({ ok: true, category });
  });

  it.each([
    ["", "empty", "Topic tidak boleh kosong."],
    ["    ", "empty", "Topic tidak boleh kosong."],
    ["Resep rendang paling enak", "out-of-category", "Topic harus seputar AI, IT, atau IoT."],
  ])("rejects %j with an Indonesian reason", async (topic, reason, message) => {
    service = await startAgentService({ port: 0, config: HELD });

    const res = await postJson(service.port, TOPICS_PATH, { topic });

    expect(res.status).toBe(422);
    expect(res.json).toEqual({ ok: false, reason, message });
  });

  it("rejects a request with no Topic at all", async () => {
    service = await startAgentService({ port: 0, config: HELD });

    const res = await postJson(service.port, TOPICS_PATH, { nope: 1 });

    expect(res.status).toBe(422);
    expect(res.json).toMatchObject({ ok: false, reason: "empty" });
  });

  it("rejects a duplicate of a Topic already queued, ignoring case and spacing", async () => {
    service = await startAgentService({ port: 0, config: HELD });
    await postJson(service.port, TOPICS_PATH, { topic: "Edge computing untuk pabrik" });

    const res = await postJson(service.port, TOPICS_PATH, { topic: "  edge   COMPUTING untuk pabrik " });

    expect(res.status).toBe(422);
    expect(res.json).toEqual({ ok: false, reason: "duplicate", message: "Topic ini sudah ada di antrean." });
  });

  it("rejects a Topic when the queue already holds 10", async () => {
    service = await startAgentService({ port: 0, config: HELD });
    for (let i = 1; i <= 10; i++) {
      const ok = await postJson(service.port, TOPICS_PATH, { topic: `Topik AI nomor ${i}` });
      expect(ok.json).toMatchObject({ ok: true });
    }

    const res = await postJson(service.port, TOPICS_PATH, { topic: "Topik AI nomor 11" });

    expect(res.status).toBe(422);
    expect(res.json).toEqual({
      ok: false,
      reason: "queue-full",
      message: "Antrean penuh (maksimal 10 Topic). Coba lagi nanti.",
    });
  });
});

describe("the Topic queue", () => {
  it("runs queued Topics first-in-first-out, before any random Topic", async () => {
    service = await startAgentService({ port: 0, config: { ...FAST, autopilotGapMs: 200 } });
    const stream = await openStream(service.port);

    await postJson(service.port, TOPICS_PATH, { topic: "Topik AI pertama" });
    await postJson(service.port, TOPICS_PATH, { topic: "Topik IoT kedua" });

    const first = await stream.until((e) => e.type === "run-started");
    const second = await stream.until((e) => e.type === "run-started", first + 1);
    stream.close();

    expect(stream.events[first]).toMatchObject({ topic: "Topik AI pertama", category: "AI" });
    expect(stream.events[second]).toMatchObject({ topic: "Topik IoT kedua", category: "IoT" });
    // Taking a Topic off the queue is announced.
    const dequeued = stream.events.filter((e) => e.type === "queue-changed").map((e) => e.type === "queue-changed" && e.queue.length);
    expect(dequeued).toEqual([1, 2, 1, 0]);
  });

  it("still runs queued Topics while Autopilot is paused, then goes idle again", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const stream = await openStream(service.port);
    await postJson(service.port, AUTOPILOT_PAUSE_PATH);
    await stream.until((e) => e.type === "autopilot-changed");
    await settle(300); // any Run already going finishes

    const from = stream.events.length;
    await postJson(service.port, TOPICS_PATH, { topic: "Topik AI saat jeda" });
    const started = await stream.until((e) => e.type === "run-started", from);
    const finished = await stream.until((e) => e.type === "run-finished", started);
    await settle(250);
    stream.close();

    expect(stream.events[started]).toMatchObject({ topic: "Topik AI saat jeda" });
    expect(stream.events.slice(finished + 1).some((e) => e.type === "run-started")).toBe(false);
  });

  it("is shared: every connection sees the same queue, also in its snapshot", async () => {
    service = await startAgentService({ port: 0, config: HELD });
    const a = await openStream(service.port);
    const b = await openStream(service.port);

    await postJson(service.port, TOPICS_PATH, { topic: "Topik AI bersama" });
    const ia = await a.until((e) => e.type === "queue-changed");
    const ib = await b.until((e) => e.type === "queue-changed");
    const late = await openStream(service.port);
    await late.until((e) => e.type === "snapshot");
    [a, b, late].forEach((s) => s.close());

    expect(a.events[ia]).toEqual(b.events[ib]);
    expect(late.events[0]).toMatchObject({
      type: "snapshot",
      snapshot: { queue: [{ topic: "Topik AI bersama", category: "AI" }], queueCap: 10 },
    });
  });
});
