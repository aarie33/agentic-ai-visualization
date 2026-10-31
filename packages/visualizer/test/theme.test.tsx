import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../src/App";
import { fakeApi, scriptedStream } from "./helpers";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(cleanup);

function setup() {
  const stream = scriptedStream();
  render(<App connect={stream.connect} api={fakeApi()} />);
  stream.snapshot();
}

const checked = () => screen.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true").map((r) => r.getAttribute("aria-label"));

describe("the colour theme", () => {
  it("starts on Terakota and offers three themes", () => {
    setup();

    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("aria-label"))).toEqual(["Tema Terakota", "Tema Hutan", "Tema Malam"]);
    expect(checked()).toEqual(["Tema Terakota"]);
    expect(document.documentElement.dataset.theme).toBe("terakota");
  });

  it("switches the whole page to the picked theme and remembers it", () => {
    setup();

    fireEvent.click(screen.getByRole("radio", { name: "Tema Malam" }));

    expect(checked()).toEqual(["Tema Malam"]);
    expect(document.documentElement.dataset.theme).toBe("malam");
    expect(document.documentElement.style.getPropertyValue("--bg-top")).toBe("#1b1230");
    expect(window.localStorage.getItem("kantor-virtual:tema")).toBe("malam");
  });

  it("opens in the theme named in the address", () => {
    window.history.replaceState(null, "", "/?tema=hutan");

    setup();

    expect(checked()).toEqual(["Tema Hutan"]);
  });

  it("falls back to Terakota for a theme it does not know", () => {
    window.history.replaceState(null, "", "/?tema=pelangi");

    setup();

    expect(checked()).toEqual(["Tema Terakota"]);
  });
});
