import { afterEach, describe, expect, it } from "vitest";
import { AUTOPILOT_PAUSE_PATH, AUTOPILOT_RESUME_PATH } from "@virtual-office/shared";
import { startAgentService, type RunningService } from "../src/server";
import { FAST, openStream, postJson } from "./helpers";

let service: RunningService | undefined;

afterEach(async () => {
  await service?.stop();
  service = undefined;
});

const settle = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("pausing and resuming Autopilot", () => {
  it("lets the Run in progress finish, then starts no new Run", async () => {
    service = await startAgentService({ port: 0, config: { ...FAST, stepDurationMs: [10, 15] } });
    const stream = await openStream(service.port);

    const start = await stream.until((e) => e.type === "run-started");
    const paused = await postJson(service.port, AUTOPILOT_PAUSE_PATH);
    expect(paused.json).toMatchObject({ autopilot: "paused" });

    const end = await stream.until((e) => e.type === "run-finished", start);
    await settle(250);
    stream.close();

    expect(stream.events.slice(start, end + 1).some((e) => e.type === "post-published")).toBe(true);
    expect(stream.events.slice(end + 1).some((e) => e.type === "run-started")).toBe(false);
    expect(stream.events.some((e) => e.type === "autopilot-changed" && e.autopilot === "paused")).toBe(true);
  });

  it("starts random Runs again after resuming", async () => {
    service = await startAgentService({ port: 0, config: FAST });
    const stream = await openStream(service.port);
    await postJson(service.port, AUTOPILOT_PAUSE_PATH);
    const paused = await stream.until((e) => e.type === "autopilot-changed" && e.autopilot === "paused");
    await settle(300); // let any Run that was in progress finish

    const quietFrom = stream.events.length;
    await settle(150);
    expect(stream.events.slice(quietFrom).some((e) => e.type === "run-started")).toBe(false);

    await postJson(service.port, AUTOPILOT_RESUME_PATH);
    await stream.until((e) => e.type === "run-started", paused + 1);
    stream.close();

    expect(stream.events.some((e) => e.type === "autopilot-changed" && e.autopilot === "on")).toBe(true);
  });

  it("is on by default and shows its state in the snapshot", async () => {
    service = await startAgentService({ port: 0, config: { autopilotGapMs: 60_000 } });
    const first = await openStream(service.port);
    await first.until((e) => e.type === "snapshot");
    first.close();
    expect(first.events[0]).toMatchObject({ type: "snapshot", snapshot: { autopilot: "on" } });

    await postJson(service.port, AUTOPILOT_PAUSE_PATH);
    const second = await openStream(service.port);
    await second.until((e) => e.type === "snapshot");
    second.close();
    expect(second.events[0]).toMatchObject({ type: "snapshot", snapshot: { autopilot: "paused" } });
  });

  it("announces a change once, not when the state is already that", async () => {
    service = await startAgentService({ port: 0, config: { autopilotGapMs: 60_000 } });
    const stream = await openStream(service.port);

    await postJson(service.port, AUTOPILOT_PAUSE_PATH);
    await postJson(service.port, AUTOPILOT_PAUSE_PATH);
    await settle(100);
    stream.close();

    expect(stream.events.filter((e) => e.type === "autopilot-changed").length).toBe(1);
  });
});
