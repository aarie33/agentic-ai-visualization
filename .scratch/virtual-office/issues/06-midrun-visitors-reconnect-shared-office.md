# 06: Visitors mid-Run, reconnect and a shared office

**What to build:** Whenever a User opens the Visualizer, even in the middle of a Run, or the connection drops and returns, the page shows the correct current state straight away from a full snapshot (Run, Agent states and Step bubbles, queue, Autopilot, Feed), with no blank or wrong office and no page refresh. Several tabs and visitors share one office: the same Run, queue, Autopilot state and Feed. This ticket verifies that behaviour end to end and fixes any gap earlier tickets left in what the snapshot contains.

**Blocked by:** 03, 05

**Status:** ready-for-agent

- [ ] A connection opened mid-Run receives a snapshot that fully describes the current Run, Agents, queue, Autopilot and Feed, followed by incremental events with none missing or duplicated
- [ ] After a dropped connection the Visualizer reconnects by itself and replaces its state with the new snapshot
- [ ] Two or more simultaneous connections receive the same events and the same snapshot content
- [ ] A Topic submitted from one connection shows up in the queue on all connections
- [ ] Agent service restart yields an empty Feed and queue with Autopilot on
- [ ] Seam A test: connect mid-Run and after a forced disconnect and assert the snapshot content and event continuity; two concurrent connections see identical streams
- [ ] Seam B test: a Visualizer given a new snapshot after a gap replaces, not merges, its previous state
