import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createSnapshot, type Platform, type Post } from "@virtual-office/shared";
import { App } from "../src/App";
import { fakeApi, scriptedStream } from "./helpers";

afterEach(cleanup);

const shapes = { X: "thread", LinkedIn: "long-post", Instagram: "carousel", TikTok: "video-script" } as const;
function post(platform: Platform, topic: string, n = 0): Post {
  return {
    id: `${topic}-${platform}-${n}`,
    platform,
    shape: shapes[platform],
    topic,
    category: "AI",
    body: [`Bagian satu ${platform}`, `Bagian dua ${platform}`],
    publishedAt: n,
  };
}

function setup(feedCap?: number) {
  const stream = scriptedStream();
  render(<App connect={stream.connect} api={fakeApi()} />);
  stream.snapshot(createSnapshot(feedCap ? { feedCap } : {}));
  return stream;
}

describe("the Feed", () => {
  it("lists Posts newest first with their Platform and Topic", () => {
    const stream = setup();

    stream.emit(
      { type: "post-published", post: post("X", "Topik A", 1) },
      { type: "post-published", post: post("LinkedIn", "Topik A", 2) },
    );

    const items = within(screen.getByRole("list", { name: "Feed" })).getAllByRole("listitem");
    expect(items.map((i) => i.textContent)).toEqual([
      expect.stringContaining("LinkedIn"),
      expect.stringContaining("X"),
    ]);
    expect(items[0]!.textContent).toContain("Topik A");
  });

  it("opens a Post to read its full content", () => {
    const stream = setup();
    stream.emit({ type: "post-published", post: post("Instagram", "Topik B") });

    fireEvent.click(screen.getByRole("button", { name: /Instagram.*Topik B/ }));

    const open = screen.getByRole("article", { name: "Isi Post" });
    expect(within(open).getByText("Bagian satu Instagram")).toBeTruthy();
    expect(within(open).getByText("Bagian dua Instagram")).toBeTruthy();
  });

  it("never shows more Posts than the Feed limit", () => {
    const stream = setup(2);

    stream.emit(
      { type: "post-published", post: post("X", "Topik C", 1) },
      { type: "post-published", post: post("LinkedIn", "Topik C", 2) },
      { type: "post-published", post: post("Instagram", "Topik C", 3) },
    );

    const items = within(screen.getByRole("list", { name: "Feed" })).getAllByRole("listitem");
    expect(items.length).toBe(2);
    expect(screen.queryByRole("button", { name: /^X/ })).toBeNull();
  });

  it("shows a snapshot's existing Feed straight away", () => {
    const stream = scriptedStream();
    render(<App connect={stream.connect} api={fakeApi()} />);

    stream.snapshot(createSnapshot({ feed: [post("TikTok", "Topik D", 9)] }));

    expect(screen.getByRole("button", { name: /TikTok.*Topik D/ })).toBeTruthy();
  });

  it("says so when nothing has been published yet", () => {
    setup();

    expect(screen.getByText("Belum ada Post.")).toBeTruthy();
  });
});
