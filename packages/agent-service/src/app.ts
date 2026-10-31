import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { AUTOPILOT_PAUSE_PATH, AUTOPILOT_RESUME_PATH, SSE_PATH, TOPICS_PATH, type ServerEvent } from "@virtual-office/shared";
import type { Office } from "./office";

export function createApp(office: Office) {
  const app = new Hono();
  app.use("*", cors());

  app.get(SSE_PATH, (c) =>
    streamSSE(c, async (stream) => {
      // Writes are chained so events always leave in the order they were announced.
      let writes: Promise<void> = Promise.resolve();
      const send = (event: ServerEvent) => {
        writes = writes.then(() => stream.writeSSE({ data: JSON.stringify(event) })).catch(() => {});
      };

      // Subscribing and reading the snapshot happen in one synchronous step, so no event slips between them.
      const { snapshot, unsubscribe } = office.subscribe(send);
      send({ type: "snapshot", snapshot });

      await new Promise<void>((resolve) => stream.onAbort(resolve));
      unsubscribe();
    }),
  );

  app.post(TOPICS_PATH, async (c) => {
    const body: unknown = await c.req.json().catch(() => null);
    const topic = body && typeof body === "object" && "topic" in body && typeof body.topic === "string" ? body.topic : "";
    const result = office.submitTopic(topic);
    return c.json(result, result.ok ? 201 : 422);
  });

  app.post(AUTOPILOT_PAUSE_PATH, (c) => {
    office.setAutopilot("paused");
    return c.json({ autopilot: office.snapshot().autopilot });
  });
  app.post(AUTOPILOT_RESUME_PATH, (c) => {
    office.setAutopilot("on");
    return c.json({ autopilot: office.snapshot().autopilot });
  });

  return app;
}
