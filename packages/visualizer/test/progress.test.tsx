import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App";
import { fakeApi, scriptedStream } from "./helpers";

afterEach(cleanup);

function setup() {
  const stream = scriptedStream();
  render(<App connect={stream.connect} api={fakeApi()} />);
  stream.snapshot();
  return stream;
}

/** "selesai" | "bekerja" | "menunggu" for Bambang, Karjo and Tejo, as the progress strip shows them. */
function progress(): string[] {
  const items = within(screen.getByRole("list", { name: "Progres Run" })).getAllByRole("listitem");
  return items.map((item) => (["selesai", "bekerja", "menunggu"] as const).find((s) => item.textContent?.includes(s)) ?? "?");
}

describe("the progress strip", () => {
  it("shows every Task as waiting when no Run is in progress", () => {
    setup();

    expect(progress()).toEqual(["menunggu", "menunggu", "menunggu"]);
  });

  it("follows the Run from Bambang to Karjo to Tejo", () => {
    const stream = setup();
    stream.emit({ type: "run-started", topic: "Topik", category: "AI" }, { type: "task-started", role: "scout" });
    expect(progress()).toEqual(["bekerja", "menunggu", "menunggu"]);

    stream.emit({ type: "task-finished", role: "scout" }, { type: "handoff", from: "scout", to: "quill" });
    expect(progress()).toEqual(["selesai", "menunggu", "menunggu"]);

    stream.emit({ type: "task-started", role: "quill" });
    expect(progress()).toEqual(["selesai", "bekerja", "menunggu"]);

    stream.emit({ type: "task-finished", role: "quill" }, { type: "handoff", from: "quill", to: "herald" }, { type: "task-started", role: "herald" });
    expect(progress()).toEqual(["selesai", "selesai", "bekerja"]);

    stream.emit({ type: "task-finished", role: "herald" }, { type: "run-finished" });
    expect(progress()).toEqual(["menunggu", "menunggu", "menunggu"]);
  });
});

describe("the Handoff notice", () => {
  it("names who hands over to whom while the Handoff lasts", () => {
    const stream = setup();
    stream.emit({ type: "run-started", topic: "Topik", category: "IT" });

    stream.emit({ type: "handoff", from: "quill", to: "herald" });

    expect(screen.getByRole("img", { name: "Karjo menyerahkan hasil ke Tejo" })).toBeTruthy();
  });
});
