import type { Snapshot } from "@virtual-office/shared";

export function RunBanner({ run }: { run: Snapshot["run"] }) {
  if (!run) {
    return (
      <p className="run-banner idle">
        <span className="live-dot" aria-hidden="true" />
        Kantor sedang rehat.
      </p>
    );
  }
  return (
    <div className="run-banner">
      <p className="run-label">
        <span className="live-dot on" aria-hidden="true" />
        Sedang dikerjakan
      </p>
      <p className="run-topic">{run.topic}</p>
      <span className={`category category-${run.category}`}>{run.category}</span>
    </div>
  );
}
