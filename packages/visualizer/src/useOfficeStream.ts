import { useEffect, useState } from "react";
import { SSE_PATH, applyEvent, type ServerEvent, type Snapshot } from "@virtual-office/shared";

export interface StreamHandlers {
  onEvent(event: ServerEvent): void;
  onDisconnect(): void;
}

/** Opens the event stream and returns a function that closes it. */
export type Connect = (handlers: StreamHandlers) => () => void;

const RECONNECT_DELAY_MS = 1000;

/** Real connection to the Agent service. Reconnects on its own; every reconnect starts with a fresh snapshot. */
export const connectEventSource: Connect = ({ onEvent, onDisconnect }) => {
  let source: EventSource | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  const open = () => {
    source = new EventSource(SSE_PATH);
    source.onmessage = (message) => onEvent(JSON.parse(message.data) as ServerEvent);
    source.onerror = () => {
      source?.close();
      onDisconnect();
      if (!closed) retry = setTimeout(open, RECONNECT_DELAY_MS);
    };
  };
  open();

  return () => {
    closed = true;
    clearTimeout(retry);
    source?.close();
  };
};

/** The Visualizer's whole view: it is rebuilt purely from what the Agent service announces. */
export function useOfficeStream(connect: Connect): Snapshot | null {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(
    () =>
      connect({
        onEvent: (event) => {
          // A snapshot replaces everything; any other event only makes sense on top of one.
          setSnapshot((current) => (event.type === "snapshot" ? event.snapshot : current && applyEvent(current, event)));
        },
        onDisconnect: () => setSnapshot(null),
      }),
    [connect],
  );

  return snapshot;
}
