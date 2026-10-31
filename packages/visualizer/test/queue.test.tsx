import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createSnapshot } from "@virtual-office/shared";
import { App } from "../src/App";
import { fakeApi, scriptedStream } from "./helpers";

afterEach(cleanup);

function setup(api = fakeApi(), snapshot = createSnapshot()) {
  const stream = scriptedStream();
  render(<App connect={stream.connect} api={api} />);
  stream.snapshot(snapshot);
  return { stream, api };
}

function submit(text: string) {
  fireEvent.change(screen.getByLabelText("Topic"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Kirim Topic" }));
}

describe("typing in a Topic", () => {
  it("sends the Topic and confirms it joined the queue", async () => {
    const { api } = setup();

    submit("  Kubernetes untuk tim kecil ");

    expect(await screen.findByText("Topic masuk antrean (AI).")).toBeTruthy();
    expect(api.calls).toEqual(["topic:Kubernetes untuk tim kecil"]);
    expect((screen.getByLabelText("Topic") as HTMLInputElement).value).toBe("");
  });

  it("shows the reason the Agent service gives when it rejects a Topic, and keeps the text", async () => {
    const api = fakeApi({
      submitTopic: async () => ({ ok: false, reason: "out-of-category", message: "Topic harus seputar AI, IT, atau IoT." }),
    });
    setup(api);

    submit("Resep rendang");

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Topic harus seputar AI, IT, atau IoT.");
    expect((screen.getByLabelText("Topic") as HTMLInputElement).value).toBe("Resep rendang");
  });

  it("clears an old message when the next Topic is sent", async () => {
    const api = fakeApi({
      submitTopic: async () => ({ ok: false, reason: "duplicate", message: "Topic ini sudah ada di antrean." }),
    });
    setup(api);
    submit("Topik AI");
    await screen.findByRole("alert");

    api.submitTopic = async (topic) => ({ ok: true, topic, category: "IT" });
    submit("Topik IT");

    expect(await screen.findByText("Topic masuk antrean (IT).")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("the Topic queue list", () => {
  it("says so when the queue is empty", () => {
    setup();

    expect(screen.getByText("Antrean kosong.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Antrean Topic (0/10)" })).toBeTruthy();
  });

  it("follows queue-changed events in order", () => {
    const { stream } = setup();

    stream.emit({
      type: "queue-changed",
      queue: [
        { topic: "Topik pertama", category: "AI" },
        { topic: "Topik kedua", category: "IoT" },
      ],
    });

    const items = within(screen.getByRole("list", { name: "Antrean Topic" })).getAllByRole("listitem");
    expect(items.map((i) => i.textContent)).toEqual(["Topik pertamaAI", "Topik keduaIoT"]);
    expect(screen.getByRole("heading", { name: "Antrean Topic (2/10)" })).toBeTruthy();

    stream.emit({ type: "queue-changed", queue: [{ topic: "Topik kedua", category: "IoT" }] });

    expect(within(screen.getByRole("list", { name: "Antrean Topic" })).getAllByRole("listitem").length).toBe(1);
  });

  it("shows the queue from a snapshot straight away", () => {
    setup(fakeApi(), createSnapshot({ queue: [{ topic: "Topik dari snapshot", category: "IT" }], queueCap: 10 }));

    expect(screen.getByText("Topik dari snapshot")).toBeTruthy();
  });
});
