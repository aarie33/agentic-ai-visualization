/** All timing and limits of the Agent service live here, so pace can be tuned without touching the Visualizer. */
export interface AgentServiceConfig {
  /** Min and max duration of one Step, in ms. */
  stepDurationMs: [number, number];
  /** How long a Handoff stays visible before the next Agent starts, in ms. */
  handoffMs: number;
  /** Pause between Runs (and before the first Run), in ms. */
  autopilotGapMs: number;
  /** Maximum Topics waiting in the Topic queue. */
  queueCap: number;
  /** Maximum Posts kept in the Feed. */
  feedCap: number;
}

export const defaultConfig: AgentServiceConfig = {
  stepDurationMs: [2000, 4000],
  handoffMs: 1500,
  autopilotGapMs: 5000,
  queueCap: 10,
  feedCap: 50,
};

/** Defaults, then environment overrides, then explicit overrides. Throws on a nonsensical result. */
export function loadConfig(
  overrides: Partial<AgentServiceConfig> = {},
  env: NodeJS.ProcessEnv = process.env,
): AgentServiceConfig {
  const num = (key: string): number | undefined => {
    const raw = env[key];
    if (raw === undefined || raw === "") return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };
  const config: AgentServiceConfig = {
    stepDurationMs: [
      num("STEP_MIN_MS") ?? defaultConfig.stepDurationMs[0],
      num("STEP_MAX_MS") ?? defaultConfig.stepDurationMs[1],
    ],
    handoffMs: num("HANDOFF_MS") ?? defaultConfig.handoffMs,
    autopilotGapMs: num("AUTOPILOT_GAP_MS") ?? defaultConfig.autopilotGapMs,
    queueCap: num("QUEUE_CAP") ?? defaultConfig.queueCap,
    feedCap: num("FEED_CAP") ?? defaultConfig.feedCap,
    ...overrides,
  };
  const [min, max] = config.stepDurationMs;
  if (min < 0 || min > max) throw new Error(`Invalid Step duration range [${min}, ${max}]`);
  if (config.handoffMs < 0 || config.autopilotGapMs < 0) throw new Error("Durations cannot be negative");
  if (config.queueCap < 1 || config.feedCap < 1) throw new Error("Queue and Feed caps must be at least 1");
  return config;
}
