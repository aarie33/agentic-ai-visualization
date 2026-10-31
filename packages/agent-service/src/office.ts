import {
  AGENT_ROLES,
  PLATFORMS,
  SHAPE_OF,
  applyEvent,
  createSnapshot,
  type AutopilotMode,
  type Category,
  type ServerEvent,
  type Snapshot,
  type SubmitResult,
} from "@virtual-office/shared";
import type { AgentServiceConfig } from "./config";
import { angles, between, composePost, pick, stepLabels, writeDraft, type Draft, type Rng } from "./content";
import { detectCategory, dummyTopics } from "./topics";

export interface OfficeOptions {
  config: AgentServiceConfig;
  random?: Rng;
  now?: () => number;
}

type Listener = (event: ServerEvent) => void;

const rejected = (reason: Extract<SubmitResult, { ok: false }>["reason"], message: string): SubmitResult => ({
  ok: false,
  reason,
  message,
});

/**
 * The Agent service's core: owns the Runs and all their timing, keeps the snapshot true by folding every
 * event it announces through `applyEvent`, and tells subscribers about each change.
 */
export class Office {
  private state: Snapshot;
  private readonly listeners = new Set<Listener>();
  private readonly config: AgentServiceConfig;
  private readonly random: Rng;
  private readonly now: () => number;
  private runCount = 0;
  private readonly stopController = new AbortController();
  private loop: Promise<void> | undefined;
  private wake: (() => void) | undefined;

  constructor({ config, random = Math.random, now = Date.now }: OfficeOptions) {
    this.config = config;
    this.random = random;
    this.now = now;
    this.state = createSnapshot({ queueCap: config.queueCap, feedCap: config.feedCap });
  }

  snapshot(): Snapshot {
    return this.state;
  }

  /** The snapshot and every later event, with nothing missed in between. */
  subscribe(listener: Listener): { snapshot: Snapshot; unsubscribe(): void } {
    this.listeners.add(listener);
    return { snapshot: this.state, unsubscribe: () => this.listeners.delete(listener) };
  }

  /** Validates a typed-in Topic and, when it passes, puts it at the back of the Topic queue. */
  submitTopic(text: string): SubmitResult {
    const topic = text.trim().replace(/\s+/g, " ");
    if (!topic) return rejected("empty", "Topic tidak boleh kosong.");

    const category = detectCategory(topic);
    if (!category) return rejected("out-of-category", "Topic harus seputar AI, IT, atau IoT.");

    const { queue, queueCap } = this.state;
    if (queue.some((q) => q.topic.toLowerCase() === topic.toLowerCase())) {
      return rejected("duplicate", "Topic ini sudah ada di antrean.");
    }
    if (queue.length >= queueCap) {
      return rejected("queue-full", `Antrean penuh (maksimal ${queueCap} Topic). Coba lagi nanti.`);
    }

    this.emit({ type: "queue-changed", queue: [...queue, { topic, category }] });
    this.wake?.();
    return { ok: true, topic, category };
  }

  setAutopilot(mode: AutopilotMode): void {
    if (this.state.autopilot === mode) return;
    this.emit({ type: "autopilot-changed", autopilot: mode });
    this.wake?.();
  }

  start(): void {
    this.loop ??= this.runLoop();
  }

  async stop(): Promise<void> {
    this.stopController.abort();
    this.wake?.();
    await this.loop;
  }

  private emit(event: ServerEvent): void {
    this.state = applyEvent(this.state, event);
    for (const listener of this.listeners) listener(event);
  }

  private get stopped(): boolean {
    return this.stopController.signal.aborted;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.stopped) return resolve();
      const timer = setTimeout(done, ms);
      const signal = this.stopController.signal;
      function done() {
        clearTimeout(timer);
        signal.removeEventListener("abort", done);
        resolve();
      }
      signal.addEventListener("abort", done);
    });
  }

  private stepPause(): Promise<void> {
    const [min, max] = this.config.stepDurationMs;
    return this.sleep(between(min, max, this.random));
  }

  /** Resolves when something might have changed what the office should do next (or on stop). */
  private idle(): Promise<void> {
    return new Promise((resolve) => {
      this.wake = () => {
        this.wake = undefined;
        resolve();
      };
    });
  }

  /** Queued Topics always go first, even while Autopilot is paused; only random Topics need Autopilot on. */
  private takeNextTopic(): { topic: string; category: Category } | null {
    const [next, ...rest] = this.state.queue;
    if (next) {
      this.emit({ type: "queue-changed", queue: rest });
      return next;
    }
    return this.state.autopilot === "on" ? pick(dummyTopics, this.random) : null;
  }

  private async runLoop(): Promise<void> {
    await this.sleep(this.config.autopilotGapMs);
    while (!this.stopped) {
      const next = this.takeNextTopic();
      if (!next) {
        await this.idle();
        continue;
      }
      await this.run(next.topic, next.category);
      await this.sleep(this.config.autopilotGapMs);
    }
  }

  private async run(topic: string, category: Category): Promise<void> {
    const runId = ++this.runCount;
    this.emit({ type: "run-started", topic, category });
    const angle = pick(angles[category], this.random);
    let draft: Draft | undefined;

    for (const [i, role] of AGENT_ROLES.entries()) {
      if (this.stopped) return;
      const previous = AGENT_ROLES[i - 1];
      if (previous) {
        this.emit({ type: "handoff", from: previous, to: role });
        await this.sleep(this.config.handoffMs);
      }
      this.emit({ type: "task-started", role });

      if (role === "herald") {
        for (const platform of PLATFORMS) {
          this.emit({ type: "step-started", role, label: `Memposting ke ${platform}…` });
          await this.stepPause();
          if (this.stopped) return;
          this.emit({
            type: "post-published",
            post: {
              id: `run${runId}-${platform}`,
              platform,
              shape: SHAPE_OF[platform],
              topic,
              category,
              body: composePost(platform, draft!, category),
              publishedAt: this.now(),
            },
          });
        }
      } else {
        for (const label of stepLabels(role, topic, category, angle, this.random)) {
          this.emit({ type: "step-started", role, label });
          await this.stepPause();
          if (this.stopped) return;
        }
        if (role === "quill") draft = writeDraft(topic, category, angle, this.random);
      }

      this.emit({ type: "task-finished", role });
    }

    this.emit({ type: "run-finished" });
  }
}
