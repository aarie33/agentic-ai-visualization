import { serve } from "@hono/node-server";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";
import { loadConfig, type AgentServiceConfig } from "./config";
import { Office } from "./office";

export interface RunningService {
  port: number;
  config: AgentServiceConfig;
  stop(): Promise<void>;
}

export async function startAgentService(
  options: { port?: number; config?: Partial<AgentServiceConfig>; random?: () => number } = {},
): Promise<RunningService> {
  const config = loadConfig(options.config);
  const office = new Office({ config, random: options.random });
  const app = createApp(office);
  const server = await new Promise<ReturnType<typeof serve>>((resolve) => {
    const s = serve({ fetch: app.fetch, port: options.port ?? 3001, hostname: "127.0.0.1" }, () => resolve(s));
  });
  office.start();
  const { port } = server.address() as AddressInfo;
  return {
    port,
    config,
    stop: async () => {
      await office.stop();
      await new Promise<void>((resolve) => {
        (server as unknown as { closeAllConnections?: () => void }).closeAllConnections?.();
        server.close(() => resolve());
      });
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3001);
  startAgentService({ port }).then((s) => console.log(`Agent service listening on :${s.port}`));
}
