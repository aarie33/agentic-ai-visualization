import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSnapshot, type Post, type ServerEvent } from "@virtual-office/shared";
import { App } from "../src/App";
import { connectEventSource } from "../src/useOfficeStream";
import { fakeApi, scriptedStream } from "./helpers";

afterEach(cleanup);

const aPost: Post = {
  id: "p1",
  platform: "X",
  shape: "thread",
  topic: "Topik lama",
  category: "AI",
  body: ["isi"],
  publishedAt: 1,
};

describe("a new snapshot after a gap", () => {
  it("replaces everything: Run, queue, Autopilot and Feed are not merged with the old ones", () => {
    const stream = scriptedStream();
    render(<App connect={stream.connect} api={fakeApi()} />);
    stream.snapshot(
      createSnapshot({
        run: { topic: "Run lama", category: "AI" },
        queue: [{ topic: "Antrean lama", category: "IT" }],
        autopilot: "paused",
        feed: [aPost],
      }),
    );
    expect(screen.getByText("Run lama")).toBeTruthy();

    stream.drop();
    stream.snapshot(createSnapshot());

    expect(screen.queryByText("Run lama")).toBeNull();
    expect(screen.queryByText("Antrean lama")).toBeNull();
    expect(screen.queryByText("Topik lama")).toBeNull();
    expect(screen.getByText("Autopilot: menyala")).toBeTruthy();
    expect(screen.getByText("Antrean kosong.")).toBeTruthy();
    expect(screen.getByText("Belum ada Post.")).toBeTruthy();
  });

  it("ignores events that arrive before any snapshot, instead of drawing a half-built office", () => {
    const stream = scriptedStream();
    render(<App connect={stream.connect} api={fakeApi()} />);

    stream.emit({ type: "step-started", role: "scout", label: "Terlalu dini…" });

    expect(screen.getByText("Menghubungkan ke kantor…")).toBeTruthy();
    expect(screen.queryByText("Terlalu dini…")).toBeNull();
  });
});

describe("the real connection to the Agent service", () => {
  class FakeEventSource {
    static instances: FakeEventSource[] = [];
    onmessage: ((m: { data: string }) => void) | null = null;
    onerror: (() => void) | null = null;
    closed = false;
    constructor(public url: string) {
      FakeEventSource.instances.push(this);
    }
    close() {
      this.closed = true;
    }
  }

  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal("EventSource", FakeEventSource);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("opens the event stream and passes events on", () => {
    const events: ServerEvent[] = [];
    connectEventSource({ onEvent: (e) => events.push(e), onDisconnect: () => {} });

    FakeEventSource.instances[0]!.onmessage!({ data: JSON.stringify({ type: "snapshot", snapshot: createSnapshot() }) });

    expect(FakeEventSource.instances[0]!.url).toBe("/events");
    expect(events.map((e) => e.type)).toEqual(["snapshot"]);
  });

  it("reports the drop, then reconnects on its own", () => {
    const onDisconnect = vi.fn();
    connectEventSource({ onEvent: () => {}, onDisconnect });

    act(() => FakeEventSource.instances[0]!.onerror!());

    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(FakeEventSource.instances[0]!.closed).toBe(true);
    expect(FakeEventSource.instances.length).toBe(1);

    vi.advanceTimersByTime(1000);

    expect(FakeEventSource.instances.length).toBe(2);
  });

  it("stops for good once closed", () => {
    const close = connectEventSource({ onEvent: () => {}, onDisconnect: () => {} });
    act(() => FakeEventSource.instances[0]!.onerror!());

    close();
    vi.advanceTimersByTime(5000);

    expect(FakeEventSource.instances.length).toBe(1);
  });
});
