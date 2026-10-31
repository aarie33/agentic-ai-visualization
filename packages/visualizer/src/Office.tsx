import { lazy, Suspense, useRef } from "react";
import { AGENT_ROLES, type AgentRole, type AgentView, type Snapshot } from "@virtual-office/shared";
import type { Anchors } from "./scene/Scene3D";
import { ROBOT_COLOR, ROLE_TITLE } from "./scene/layout";

const Scene3D = lazy(() => import("./scene/Scene3D"));

const STATUS_LABEL = { idle: "menganggur", working: "bekerja" } as const;
const NAME: Record<AgentRole, string> = { scout: "Bambang", quill: "Karjo", herald: "Tejo" };

/** Browsers have WebGL; the test environment does not, and then only the DOM layer is drawn. */
const canRenderWebGL = typeof WebGL2RenderingContext !== "undefined" || typeof WebGLRenderingContext !== "undefined";

function AgentChip({ agent, anchors }: { agent: AgentView; anchors: Anchors }) {
  return (
    <div
      className={`chip chip-${agent.role} ${agent.status}`}
      role="img"
      aria-label={`${agent.name}, ${STATUS_LABEL[agent.status]}`}
      ref={(el) => {
        anchors.current[agent.role] = el;
      }}
      style={{ ["--accent" as string]: ROBOT_COLOR[agent.role] }}
    >
      <span className="chip-name">
        <span className="dot" />
        <strong>{agent.name}</strong>
        <span className="role">· {ROLE_TITLE[agent.role]}</span>
      </span>
      {agent.stepLabel ? <span className="chip-step">{agent.stepLabel}</span> : null}
    </div>
  );
}

function Handoff({ handoff }: { handoff: NonNullable<Snapshot["handoff"]> }) {
  return (
    <div className="handoff-toast" role="img" aria-label={`${NAME[handoff.from]} menyerahkan hasil ke ${NAME[handoff.to]}`}>
      <strong>{NAME[handoff.from]}</strong> <span aria-hidden="true">→</span> <strong>{NAME[handoff.to]}</strong>
      <span className="toast-text" aria-hidden="true">
        menyerahkan hasil
      </span>
    </div>
  );
}

type Progress = "selesai" | "bekerja" | "menunggu";

function progressOf(snapshot: Snapshot): Progress[] {
  if (!snapshot.run) return AGENT_ROLES.map(() => "menunggu");
  const workingAt = snapshot.agents.findIndex((a) => a.status === "working");
  const doneUntil = workingAt >= 0 ? workingAt : snapshot.handoff ? AGENT_ROLES.indexOf(snapshot.handoff.to) : 0;
  return AGENT_ROLES.map((_, i) => (i < doneUntil ? "selesai" : i === workingAt ? "bekerja" : "menunggu"));
}

function ProgressStrip({ snapshot }: { snapshot: Snapshot }) {
  const progress = progressOf(snapshot);
  return (
    <ol className="strip" aria-label="Progres Run">
      {snapshot.agents.map((agent, i) => (
        <li key={agent.role} className={`strip-item ${progress[i]}`} style={{ ["--accent" as string]: ROBOT_COLOR[agent.role] }}>
          <span className="strip-no">0{i + 1}</span>
          <span className="strip-name">
            <strong>{agent.name}</strong>
            <span>{ROLE_TITLE[agent.role]}</span>
          </span>
          <span className="strip-state">{progress[i]}</span>
          <span className="strip-bar" />
        </li>
      ))}
    </ol>
  );
}

export function Office({ snapshot }: { snapshot: Snapshot }) {
  const anchors: Anchors = useRef({});
  return (
    <div className={`stage ${canRenderWebGL ? "with-scene" : "no-scene"}`}>
      {canRenderWebGL ? (
        <Suspense fallback={<p className="scene-loading">Memuat kantor…</p>}>
          <Scene3D snapshot={snapshot} anchors={anchors} />
        </Suspense>
      ) : null}
      <div className="chips">
        {snapshot.agents.map((agent) => (
          <AgentChip key={agent.role} agent={agent} anchors={anchors} />
        ))}
        {canRenderWebGL ? (
          <div
            className="chip chip-room"
            ref={(el) => {
              anchors.current.lounge = el;
            }}
          >
            Ruang Santai
          </div>
        ) : null}
        {canRenderWebGL ? (
          <div
            className="chip chip-topics"
            ref={(el) => {
              anchors.current.topics = el;
            }}
          >
            TOPICS · {snapshot.queue.length}
          </div>
        ) : null}
      </div>
      {snapshot.handoff ? <Handoff handoff={snapshot.handoff} /> : null}
      {canRenderWebGL ? <p className="hint">Geser untuk menggeser · scroll untuk zoom</p> : null}
      <ProgressStrip snapshot={snapshot} />
    </div>
  );
}
