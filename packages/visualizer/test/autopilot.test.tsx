import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createSnapshot } from "@virtual-office/shared";
import { App } from "../src/App";
import { fakeApi, scriptedStream } from "./helpers";

afterEach(cleanup);

function setup(autopilot: "on" | "paused" = "on") {
  const stream = scriptedStream();
  const api = fakeApi();
  render(<App connect={stream.connect} api={api} />);
  stream.snapshot(createSnapshot({ autopilot }));
  return { stream, api };
}

describe("the Autopilot toggle", () => {
  it("shows Autopilot as on and offers to pause it", () => {
    setup("on");

    expect(screen.getByText("Autopilot: menyala")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Jeda Autopilot" })).toBeTruthy();
  });

  it("asks the Agent service to pause, and only changes once the Agent service announces it", () => {
    const { stream, api } = setup("on");

    fireEvent.click(screen.getByRole("button", { name: "Jeda Autopilot" }));

    expect(api.calls).toEqual(["autopilot:paused"]);
    expect(screen.getByText("Autopilot: menyala")).toBeTruthy();

    stream.emit({ type: "autopilot-changed", autopilot: "paused" });

    expect(screen.getByText("Autopilot: dijeda")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Lanjutkan Autopilot" })).toBeTruthy();
  });

  it("asks the Agent service to resume when paused", () => {
    const { api } = setup("paused");

    expect(screen.getByText("Autopilot: dijeda")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan Autopilot" }));

    expect(api.calls).toEqual(["autopilot:on"]);
  });
});
