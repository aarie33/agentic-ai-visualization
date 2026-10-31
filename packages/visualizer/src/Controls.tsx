import type { Snapshot } from "@virtual-office/shared";
import type { OfficeApi } from "./api";
import { TopicForm } from "./TopicForm";
import { TopicQueue } from "./TopicQueue";

export function Controls({ snapshot, api }: { snapshot: Snapshot; api: OfficeApi }) {
  const on = snapshot.autopilot === "on";
  return (
    <section className="controls">
      <div className="autopilot">
        <p className={`autopilot-state ${on ? "on" : "paused"}`}>
          <span className="live-dot" aria-hidden="true" />
          {on ? "Autopilot: menyala" : "Autopilot: dijeda"}
        </p>
        {/* The label only follows what the Agent service announces; the click just asks. */}
        <button type="button" className="ghost" onClick={() => void api.setAutopilot(on ? "paused" : "on")}>
          {on ? "Jeda Autopilot" : "Lanjutkan Autopilot"}
        </button>
      </div>
      <TopicForm api={api} />
      <TopicQueue queue={snapshot.queue} cap={snapshot.queueCap} />
    </section>
  );
}
