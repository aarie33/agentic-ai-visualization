import { useState } from "react";
import { FaInstagram, FaLinkedinIn, FaTiktok, FaXTwitter } from "react-icons/fa6";
import type { Platform, Post } from "@virtual-office/shared";

const SHAPE_LABEL = {
  thread: "Thread",
  "long-post": "Post panjang",
  carousel: "Carousel",
  "video-script": "Skrip video pendek",
} as const;

const ICON: Record<Platform, typeof FaXTwitter> = { X: FaXTwitter, LinkedIn: FaLinkedinIn, Instagram: FaInstagram, TikTok: FaTiktok };

function PlatformName({ platform }: { platform: Platform }) {
  const Icon = ICON[platform];
  return (
    <span className={`platform platform-${platform}`}>
      <Icon aria-hidden="true" focusable="false" />
      {platform}
    </span>
  );
}

const time = (ms: number) => new Date(ms).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

export function Feed({ posts }: { posts: Post[] }) {
  // The open Post is kept itself, so it stays readable even after the Feed drops it.
  const [open, setOpen] = useState<Post | null>(null);

  return (
    <section className="feed">
      <header className="feed-head">
        <h2>Feed</h2>
        <span className="meta">{posts.length} Post</span>
      </header>
      {posts.length === 0 ? (
        <div className="empty-box">
          <p className="empty">Belum ada Post.</p>
          <p className="empty-hint">Post muncul di sini begitu Tejo selesai memublikasikannya.</p>
        </div>
      ) : (
        <ul aria-label="Feed" className="feed-list">
          {posts.map((post) => (
            <li key={post.id}>
              <button type="button" onClick={() => setOpen(post)} aria-pressed={open?.id === post.id}>
                <PlatformName platform={post.platform} />
                <span className="post-topic">{post.topic}</span>
                <time className="meta" dateTime={new Date(post.publishedAt).toISOString()}>
                  {time(post.publishedAt)}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <article aria-label="Isi Post" className={`post post-${open.shape}`}>
          <header>
            <div>
              <h3>
                <PlatformName platform={open.platform} /> · {SHAPE_LABEL[open.shape]}
              </h3>
              <p className="post-about">{open.topic}</p>
            </div>
            <button type="button" className="ghost small" onClick={() => setOpen(null)}>
              Tutup
            </button>
          </header>
          <div className="post-body">
            {open.body.map((part, i) => (
              <p key={i}>{part}</p>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}
