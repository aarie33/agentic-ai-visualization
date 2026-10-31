import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config";
import { startAgentService, type RunningService } from "../src/server";
import { openStream } from "./helpers";

let service: RunningService | undefined;

afterEach(async () => {
  await service?.stop();
  service = undefined;
});

describe("Agent service SSE stream", () => {
  it("sends a snapshot of the idle office as the first event", async () => {
    // A long gap keeps Autopilot from starting a Run before we connect.
    service = await startAgentService({ port: 0, config: { autopilotGapMs: 60_000 } });
    const stream = await openStream(service.port);
    await stream.until((e) => e.type === "snapshot");
    stream.close();

    const first = stream.events[0]!;
    expect(first.type).toBe("snapshot");
    if (first.type !== "snapshot") return;
    expect(first.snapshot.agents.map((a) => [a.role, a.status])).toEqual([
      ["scout", "idle"],
      ["quill", "idle"],
      ["herald", "idle"],
    ]);
    expect(first.snapshot.run).toBeNull();
  });
});

describe("Agent service configuration", () => {
  it("lets timing be overridden for accelerated tests", async () => {
    service = await startAgentService({ port: 0, config: { stepDurationMs: [1, 2], autopilotGapMs: 60_000 } });

    expect(service.config.stepDurationMs).toEqual([1, 2]);
    expect(service.config.autopilotGapMs).toBe(60_000);
    expect(service.config.queueCap).toBe(10);
    expect(service.config.feedCap).toBe(50);
  });

  it("reads overrides from the environment", () => {
    const config = loadConfig({}, { STEP_MIN_MS: "5", STEP_MAX_MS: "9", QUEUE_CAP: "3" });
    expect(config.stepDurationMs).toEqual([5, 9]);
    expect(config.queueCap).toBe(3);
  });

  it("rejects a Step duration range whose minimum exceeds its maximum", () => {
    expect(() => loadConfig({ stepDurationMs: [9, 5] }, {})).toThrow();
  });
});
