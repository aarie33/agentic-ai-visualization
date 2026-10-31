# 05: Users type in Topics: intake, validation and the Topic queue

**What to build:** A User types a Topic into a single field. The Agent service detects its Category by simple keyword matching and puts it into the Topic queue. The queue is first-in-first-out and always goes before Autopilot's next random Topic, and a queued Topic still runs while Autopilot is paused. Topics are rejected with a clear Indonesian reason, shown to the User, when they are empty, a duplicate of one already queued, outside AI, IT and IoT, or when the queue already holds 10 Topics. The Visualizer shows the queue. The queue is in the snapshot and shared by all visitors.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] HTTP action to submit a Topic returns either the queued Topic with its Category or a rejection with a displayable reason
- [ ] Rejections: empty, duplicate of a queued Topic, matches no Category, queue full (10)
- [ ] Queue is FIFO and queued Topics run before any random Topic
- [ ] With Autopilot paused and an empty queue the office stays idle; a Topic submitted then still runs, and afterwards the office goes idle again
- [ ] Queue changes are events and the queue is in the snapshot
- [ ] Visualizer has the Topic field, shows the queue list, and shows the rejection reason; no other new controls
- [ ] Seam A test: valid Topic accepted with Category; each rejection returns its reason; FIFO order; queued Topic runs while paused; two connections see the same queue
- [ ] Seam B test: scripted queue events update the list; a rejection response renders its message
