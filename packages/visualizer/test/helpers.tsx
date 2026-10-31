import { act } from "@testing-library/react";
import { createSnapshot, type ServerEvent, type Snapshot } from "@virtual-office/shared";
import type { OfficeApi } from "../src/api";
import type { Connect } from "../src/useOfficeStream";

/** A scripted event stream standing in for the Agent service. */
export function scriptedStream() {
  let onEvent: (e: ServerEvent) => void = () => {};
  let onDisconnect: () => void = () => {};
  const connect: Connect = (handlers) => {
    onEvent = handlers.onEvent;
    onDisconnect = handlers.onDisconnect;
    return () => {};
  };
  return {
    connect,
    emit: (...events: ServerEvent[]) => act(() => events.forEach((e) => onEvent(e))),
    snapshot: (snapshot: Snapshot = createSnapshot()) => act(() => onEvent({ type: "snapshot", snapshot })),
    drop: () => act(() => onDisconnect()),
  };
}

/** An API double that records calls and answers as scripted. */
export function fakeApi(overrides: Partial<OfficeApi> = {}): OfficeApi & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    submitTopic: async (topic) => {
      calls.push(`topic:${topic}`);
      return { ok: true, topic, category: "AI" };
    },
    setAutopilot: async (mode) => {
      calls.push(`autopilot:${mode}`);
    },
    ...overrides,
  };
}
