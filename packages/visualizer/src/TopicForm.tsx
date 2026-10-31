import { useState, type FormEvent } from "react";
import type { SubmitResult } from "@virtual-office/shared";
import type { OfficeApi } from "./api";

export function TopicForm({ api }: { api: OfficeApi }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setResult(null);
    const outcome = await api.submitTopic(text.trim());
    setSending(false);
    setResult(outcome);
    if (outcome.ok) setText("");
  }

  return (
    <form className="topic-form" onSubmit={onSubmit}>
      <label htmlFor="topic-input">Topic</label>
      <div className="topic-row">
        <input
          id="topic-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="AI, IT, atau IoT"
          autoComplete="off"
          aria-invalid={result && !result.ok ? true : undefined}
        />
        <button type="submit" className="primary" disabled={sending}>
          Kirim Topic
        </button>
      </div>
      {result?.ok ? <p className="form-note ok">Topic masuk antrean ({result.category}).</p> : null}
      {result && !result.ok ? (
        <p role="alert" className="form-note error">
          {result.message}
        </p>
      ) : null}
    </form>
  );
}
