import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createSnapshot } from "@virtual-office/shared";
import { App } from "../src/App";
import { fakeApi, scriptedStream } from "./helpers";

afterEach(cleanup);

function setup() {
  const stream = scriptedStream();
  render(<App connect={stream.connect} api={fakeApi()} />);
  return stream;
}

describe("the connection", () => {
  it("shows a connecting message until the first snapshot arrives", () => {
    setup();

    expect(screen.getByText("Menghubungkan ke kantor…")).toBeTruthy();
    expect(screen.queryByRole("img", { name: /Bambang/ })).toBeNull();
  });

  it("draws three idle Agents at their desks from the snapshot", () => {
    const stream = setup();

    stream.snapshot();

    for (const name of ["Bambang", "Karjo", "Tejo"]) {
      expect(screen.getByRole("img", { name: `${name}, menganggur` })).toBeTruthy();
    }
    expect(screen.queryByText("Menghubungkan ke kantor…")).toBeNull();
  });

  it("replaces its whole state with a new snapshot after the connection drops and returns", () => {
    const stream = setup();
    stream.snapshot();
    stream.emit({ type: "run-started", topic: "Topic lama", category: "AI" });

    stream.drop();
    expect(screen.getByText("Menghubungkan ke kantor…")).toBeTruthy();

    stream.snapshot(createSnapshot());

    expect(screen.queryByText("Topic lama")).toBeNull();
    expect(screen.getByRole("img", { name: "Bambang, menganggur" })).toBeTruthy();
  });
});

describe("a Run in progress", () => {
  it("shows the current Topic and Category", () => {
    const stream = setup();
    stream.snapshot();

    stream.emit({ type: "run-started", topic: "Kubernetes untuk tim kecil", category: "IT" });

    expect(screen.getByText("Kubernetes untuk tim kecil")).toBeTruthy();
    expect(screen.getByText("IT")).toBeTruthy();
  });

  it("shows a Step bubble at the Agent doing it and clears it when the Task finishes", () => {
    const stream = setup();
    stream.snapshot();
    stream.emit({ type: "run-started", topic: "Topik", category: "AI" }, { type: "task-started", role: "scout" });

    stream.emit({ type: "step-started", role: "scout", label: "Membandingkan 12 sumber…" });

    expect(screen.getByRole("img", { name: "Bambang, bekerja" })).toBeTruthy();
    expect(screen.getByText("Membandingkan 12 sumber…")).toBeTruthy();

    stream.emit({ type: "task-finished", role: "scout" });

    expect(screen.queryByText("Membandingkan 12 sumber…")).toBeNull();
    expect(screen.getByRole("img", { name: "Bambang, menganggur" })).toBeTruthy();
  });

  it("animates a Handoff from the Handoff event until the next Task starts", () => {
    const stream = setup();
    stream.snapshot();
    stream.emit({ type: "run-started", topic: "Topik", category: "AI" });

    stream.emit({ type: "handoff", from: "scout", to: "quill" });

    expect(screen.getByRole("img", { name: "Bambang menyerahkan hasil ke Karjo" })).toBeTruthy();

    stream.emit({ type: "task-started", role: "quill" });

    expect(screen.queryByRole("img", { name: /menyerahkan hasil/ })).toBeNull();
  });

  it("renders a snapshot taken mid-Run with the right Agent states", () => {
    const stream = setup();
    const base = createSnapshot();

    stream.snapshot({
      ...base,
      run: { topic: "Edge computing untuk pabrik", category: "IoT" },
      agents: base.agents.map((a) =>
        a.role === "quill" ? { ...a, status: "working", stepLabel: "Menulis pembuka yang menarik…" } : a,
      ),
    });

    expect(screen.getByText("Edge computing untuk pabrik")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Karjo, bekerja" })).toBeTruthy();
    expect(screen.getByText("Menulis pembuka yang menarik…")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Bambang, menganggur" })).toBeTruthy();
  });
});
