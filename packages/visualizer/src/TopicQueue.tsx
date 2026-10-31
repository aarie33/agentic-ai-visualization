import type { Snapshot } from "@virtual-office/shared";

export function TopicQueue({ queue, cap }: { queue: Snapshot["queue"]; cap: number }) {
  return (
    <section className="queue">
      <h2>
        Antrean Topic <span className="count">({queue.length}/{cap})</span>
      </h2>
      {queue.length === 0 ? (
        <div className="empty-box">
          <p className="empty">Antrean kosong.</p>
          <p className="empty-hint">Topic yang kamu ketik dikerjakan lebih dulu daripada topik acak.</p>
        </div>
      ) : (
        <ol aria-label="Antrean Topic">
          {queue.map((q) => (
            <li key={q.topic}>
              <span>{q.topic}</span>
              <span className={`category category-${q.category}`}>{q.category}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
