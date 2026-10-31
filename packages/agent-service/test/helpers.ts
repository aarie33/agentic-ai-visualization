import { SSE_PATH, type ServerEvent } from "@virtual-office/shared";

export interface EventStream {
  /** Every event received so far, in order. The first is always the snapshot. */
  events: ServerEvent[];
  /** Resolves with the index of the first event at or after `from` that matches. */
  until(predicate: (e: ServerEvent) => boolean, from?: number, timeoutMs?: number): Promise<number>;
  close(): void;
}

/** Opens the SSE stream of a running Agent service and collects its events. */
export async function openStream(port: number): Promise<EventStream> {
  const controller = new AbortController();
  const res = await fetch(`http://127.0.0.1:${port}${SSE_PATH}`, { signal: controller.signal });
  if (!res.headers.get("content-type")?.includes("text/event-stream")) throw new Error("not an event stream");

  const events: ServerEvent[] = [];
  const waiters = new Set<() => void>();

  void (async () => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        let end: number;
        while ((end = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);
          const data = frame
            .split("\n")
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim())
            .join("");
          if (data) events.push(JSON.parse(data) as ServerEvent);
        }
        waiters.forEach((w) => w());
      }
    } catch {
      /* aborted by close() */
    }
  })();

  return {
    events,
    until(predicate, from = 0, timeoutMs = 8000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          waiters.delete(check);
          reject(new Error(`timed out waiting for event; saw ${events.map((e) => e.type).join(", ")}`));
        }, timeoutMs);
        function check() {
          const i = events.findIndex((e, idx) => idx >= from && predicate(e));
          if (i !== -1) {
            clearTimeout(timer);
            waiters.delete(check);
            resolve(i);
          }
        }
        waiters.add(check);
        check();
      });
    },
    close: () => controller.abort(),
  };
}

export async function postJson(port: number, path: string, body?: unknown) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

/** Accelerated timing for tests. */
export const FAST = { stepDurationMs: [1, 3] as [number, number], handoffMs: 1, autopilotGapMs: 0 };
