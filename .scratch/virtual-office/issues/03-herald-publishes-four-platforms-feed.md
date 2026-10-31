# 03: Herald publishes to four Platforms and the Feed grows

**What to build:** After Quill's Handoff to Herald, Herald publishes one Post per Platform, in the fixed order X, LinkedIn, Instagram, TikTok, each as its own Step. Every Post is adapted from the same writing and shaped for its Platform (thread, long post, carousel, short-video script), written in Indonesian on behalf of the Creator, from templates with no LLM. Each Post appears in the Feed as soon as it is published. The Feed panel lists Posts newest first, shows Platform and Topic, lets a User open a Post to read it in full, and is capped at the latest 50 Posts. The snapshot includes the Feed.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] After the Quill to Herald Handoff, Herald has one Step per Platform in order X, LinkedIn, Instagram, TikTok
- [ ] Each Post is published as its own event and added to the Feed immediately
- [ ] Each Run adds exactly four Posts, one per Platform, with the Platform's shape and Indonesian text
- [ ] Feed is newest first and never holds more than 50 Posts
- [ ] Visualizer Feed panel shows Platform and Topic per Post and opens a Post to show its full content
- [ ] Snapshot includes the Feed
- [ ] Seam A test: a full Run's stream ends with four Post events in Platform order; after more than 12 Runs the Feed holds 50 Posts, newest first
- [ ] Seam B test: scripted Post events fill the Feed in order, and opening a Post shows its content
