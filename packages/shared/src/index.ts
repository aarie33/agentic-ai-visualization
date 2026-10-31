export type AgentRole = "scout" | "quill" | "herald";
export const AGENT_ROLES: readonly AgentRole[] = ["scout", "quill", "herald"];

export type AgentStatus = "idle" | "working";

export type Category = "AI" | "IT" | "IoT";
export const CATEGORIES: readonly Category[] = ["AI", "IT", "IoT"];

export type Platform = "X" | "LinkedIn" | "Instagram" | "TikTok";
/** The fixed order Tejo publishes in. */
export const PLATFORMS: readonly Platform[] = ["X", "LinkedIn", "Instagram", "TikTok"];

export type PostShape = "thread" | "long-post" | "carousel" | "video-script";
export const SHAPE_OF: Record<Platform, PostShape> = {
  X: "thread",
  LinkedIn: "long-post",
  Instagram: "carousel",
  TikTok: "video-script",
};

export interface AgentView {
  role: AgentRole;
  name: string;
  status: AgentStatus;
  /** Label of the Step the Agent is on, shown as its status bubble. */
  stepLabel: string | null;
}

export interface Post {
  id: string;
  platform: Platform;
  shape: PostShape;
  topic: string;
  category: Category;
  /** The parts of the Post: tweets of a thread, paragraphs, carousel slides or script scenes. */
  body: string[];
  publishedAt: number;
}

export interface QueuedTopic {
  topic: string;
  category: Category;
}

export type AutopilotMode = "on" | "paused";

/** Everything a Visualizer needs to draw the office at one moment. */
export interface Snapshot {
  agents: AgentView[];
  /** The Run in progress, if any. */
  run: { topic: string; category: Category } | null;
  /** A Handoff happening right now, if any. */
  handoff: { from: AgentRole; to: AgentRole } | null;
  queue: QueuedTopic[];
  queueCap: number;
  autopilot: AutopilotMode;
  /** Posts published so far, newest first, never more than `feedCap`. */
  feed: Post[];
  feedCap: number;
}

export type ServerEvent =
  | { type: "snapshot"; snapshot: Snapshot }
  | { type: "run-started"; topic: string; category: Category }
  | { type: "run-finished" }
  | { type: "task-started"; role: AgentRole }
  | { type: "step-started"; role: AgentRole; label: string }
  | { type: "task-finished"; role: AgentRole }
  | { type: "handoff"; from: AgentRole; to: AgentRole }
  | { type: "post-published"; post: Post }
  | { type: "queue-changed"; queue: QueuedTopic[] }
  | { type: "autopilot-changed"; autopilot: AutopilotMode };

export const SSE_PATH = "/events";
export const TOPICS_PATH = "/topics";
export const AUTOPILOT_PAUSE_PATH = "/autopilot/pause";
export const AUTOPILOT_RESUME_PATH = "/autopilot/resume";

export type RejectReason = "empty" | "out-of-category" | "duplicate" | "queue-full";

export type SubmitResult =
  | { ok: true; topic: string; category: Category }
  | { ok: false; reason: RejectReason | "unavailable"; message: string };

const AGENT_NAMES: Record<AgentRole, string> = { scout: "Bambang", quill: "Karjo", herald: "Tejo" };

export function createSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    agents: AGENT_ROLES.map((role) => ({ role, name: AGENT_NAMES[role], status: "idle", stepLabel: null })),
    run: null,
    handoff: null,
    queue: [],
    queueCap: 10,
    autopilot: "on",
    feed: [],
    feedCap: 50,
    ...overrides,
  };
}

function withAgent(s: Snapshot, role: AgentRole, patch: Partial<AgentView>): Snapshot {
  return { ...s, agents: s.agents.map((a) => (a.role === role ? { ...a, ...patch } : a)) };
}

/**
 * The one place that turns events into a snapshot. The Agent service folds its own events through it
 * to keep its snapshot true; the Visualizer folds the same events to build its view. Neither can drift.
 */
export function applyEvent(s: Snapshot, e: ServerEvent): Snapshot {
  switch (e.type) {
    case "snapshot":
      return e.snapshot;
    case "run-started":
      return { ...s, agents: createSnapshot().agents, handoff: null, run: { topic: e.topic, category: e.category } };
    case "run-finished":
      return { ...s, run: null, handoff: null, agents: createSnapshot().agents };
    case "task-started":
      return { ...withAgent(s, e.role, { status: "working", stepLabel: null }), handoff: null };
    case "step-started":
      return withAgent(s, e.role, { status: "working", stepLabel: e.label });
    case "task-finished":
      return withAgent(s, e.role, { status: "idle", stepLabel: null });
    case "handoff":
      return { ...s, handoff: { from: e.from, to: e.to } };
    case "post-published":
      return { ...s, feed: [e.post, ...s.feed].slice(0, s.feedCap) };
    case "queue-changed":
      return { ...s, queue: e.queue };
    case "autopilot-changed":
      return { ...s, autopilot: e.autopilot };
  }
}
