import {
  AUTOPILOT_PAUSE_PATH,
  AUTOPILOT_RESUME_PATH,
  TOPICS_PATH,
  type AutopilotMode,
  type SubmitResult,
} from "@virtual-office/shared";

/** What a User can ask of the Agent service. Everything else the Visualizer only watches. */
export interface OfficeApi {
  submitTopic(topic: string): Promise<SubmitResult>;
  setAutopilot(mode: AutopilotMode): Promise<void>;
}

const UNAVAILABLE: SubmitResult = {
  ok: false,
  reason: "unavailable",
  message: "Tidak dapat menghubungi kantor. Coba lagi sebentar lagi.",
};

export const httpApi: OfficeApi = {
  async submitTopic(topic) {
    try {
      const res = await fetch(TOPICS_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      return (await res.json()) as SubmitResult;
    } catch {
      return UNAVAILABLE;
    }
  },
  async setAutopilot(mode) {
    await fetch(mode === "on" ? AUTOPILOT_RESUME_PATH : AUTOPILOT_PAUSE_PATH, { method: "POST" }).catch(() => {});
  },
};
