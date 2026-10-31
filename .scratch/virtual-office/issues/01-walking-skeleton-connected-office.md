# 01: Walking skeleton: an empty office that is connected

**What to build:** A User opens the Visualizer and sees the isometric office with Scout, Quill and Herald idle at their desks. The Agent service accepts an SSE connection and sends a full snapshot as the first event, and the Visualizer builds its whole view from that snapshot. This is the foundation of the project: one repo with three packages (Agent service, Visualizer, shared event and snapshot types), following ADR 0001 (the Visualizer only projects what the Agent service announces). All user-facing text is in Indonesian, except Agent names and glossary terms. The test harness for both test seams is in place with one passing test each.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Repo has an Agent service, a Visualizer and a shared types package; both sides import event and snapshot types from the shared package
- [ ] Connecting to the SSE endpoint yields a snapshot as the first event
- [ ] Visualizer renders the isometric office with three desks and Scout, Quill and Herald in an idle state, built only from the snapshot
- [ ] Visualizer recovers from a dropped connection by reconnecting and replacing its state with the new snapshot
- [ ] Agent service timing is read from one configuration that can be overridden (used by later tickets)
- [ ] Seam A test: a client connects to the running Agent service over SSE and asserts the first event is a valid snapshot
- [ ] Seam B test: the Visualizer is fed a scripted snapshot with no Agent service and the rendered DOM shows three idle Agents
