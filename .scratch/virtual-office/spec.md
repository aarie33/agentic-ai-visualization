# Virtual Office

Status: ready-for-agent

## Problem Statement

A content workflow (research, write, publish) is invisible: nobody can see what a team of content-creation Agents is doing or how a Topic becomes Posts. A User wants to watch that work happen as a lively, readable scene, and to steer it a little by suggesting Topics, without any real LLM cost or setup. Today there is nothing to watch.

## Solution

A simulated team of three dummy Agents (Scout, Quill, Herald) run Topics through a pipeline and publish Posts to four Platforms on behalf of the Creator. The work is shown in an isometric office (the Visualizer) where each Agent sits at a desk, shows Step bubbles, and visibly hands work to the next Agent. Users can type in Topics, pause or resume Autopilot, see the Topic queue, and read the Feed of Posts. Everything that happens is owned and timed by the Agent service and pushed to the Visualizer as events; the Visualizer only animates what it is told (ADR 0001).

All terms below follow `GLOSSARY.md`.

## User Stories

1. As a User, I want to see an isometric office with Scout, Quill and Herald at their desks, so that I immediately understand who the team is.
2. As a User, I want each Agent to have a character name and a visible role, so that I can tell them apart at a glance.
3. As a User, I want to see an Agent's status bubble show the current Step (e.g. "Membandingkan 12 sumber…"), so that I know what they are doing right now.
4. As a User, I want idle Agents to look idle, so that I can tell when nothing is running.
5. As a User, I want the office to start working on its own when I open it, so that there is something to watch without any action from me.
6. As a User, I want to see which Topic and Category the current Run is about, so that I can follow the story.
7. As a User, I want Scout to visibly research the Topic first, so that the order of work is obvious.
8. As a User, I want to see a Handoff animation when Scout passes research to Quill, so that I see the work moving between desks.
9. As a User, I want to see a Handoff animation when Quill passes the written content to Herald, so that the pipeline is legible.
10. As a User, I want Herald to publish to X, LinkedIn, Instagram and TikTok one after another, each as its own Step, so that publishing feels like real work and not an instant flip.
11. As a User, I want each Post to appear in the Feed as soon as Herald publishes it, so that the Feed grows live.
12. As a User, I want one Run to produce one Post per Platform from the same writing, so that I see the same idea adapted to each network.
13. As a User, I want each Post shaped for its Platform (thread for X, long post for LinkedIn, carousel for Instagram, short-video script for TikTok), so that the Platforms feel different.
14. As a User, I want Posts written in Indonesian on behalf of the Creator, so that the output reads like a real Indonesian influencer account.
15. As a User, I want to open a Post in the Feed to read its full content, so that I can see what was actually published.
16. As a User, I want the Feed ordered newest first, so that the latest work is on top.
17. As a User, I want the Feed to show which Platform and Topic each Post belongs to, so that I can scan it quickly.
18. As a User, I want the Feed limited to the latest 50 Posts, so that the page stays light and fast.
19. As a User, I want to type in a Topic of my own, so that I can steer what the team works on.
20. As a User, I want a typed-in Topic to go into the Topic queue, so that it waits its turn.
21. As a User, I want queued Topics to run before Autopilot's next random Topic, so that my suggestion is not ignored.
22. As a User, I want the Topic queue to be first-in-first-out, so that it is fair.
23. As a User, I want to see the Topic queue, so that I know what is coming next.
24. As a User, I want a Topic outside AI, IT and IoT to be rejected with a clear message, so that I understand why nothing happened.
25. As a User, I want the Category of my Topic to be detected automatically, so that I only fill one text field.
26. As a User, I want a duplicate of a Topic already in the queue to be rejected with a clear message, so that the queue is not spammed.
27. As a User, I want a full queue (10 Topics) to reject new Topics with a clear message, so that I know to try later.
28. As a User, I want an empty Topic to be rejected, so that I cannot submit blank input by accident.
29. As a User, I want to pause Autopilot, so that no new random Runs start.
30. As a User, I want pausing Autopilot to let the current Run finish, so that nothing is cut off halfway.
31. As a User, I want to resume Autopilot, so that the office keeps working on its own again.
32. As a User, I want to see whether Autopilot is on or paused, so that I understand why the office is idle.
33. As a User, I want the office to stay idle when Autopilot is paused and the queue is empty, so that pause really means pause.
34. As a User, I want a Topic typed in while Autopilot is paused to still run, so that my own input always gets processed.
35. As a User, I want only one Run in progress at a time, so that the scene stays easy to follow.
36. As a User, I want a short pause between Runs, so that the end of one Run is visible before the next begins.
37. As a User, I want the page to show the correct current state when I open it in the middle of a Run, so that I never see a blank or wrong office.
38. As a User, I want the page to recover the correct state if my connection drops and comes back, so that I do not need to refresh.
39. As a User, I want multiple tabs and visitors to see the same Run, queue and Autopilot state, so that it feels like one shared office.
40. As a User, I want a Topic typed in by anyone to show up for everyone's queue, so that the office is truly shared.
41. As a User, I want all on-screen text (Step bubbles, buttons, rejection messages) in Indonesian, so that the experience is consistent with the Posts.
42. As a User, I want Agent names and domain terms such as Autopilot to stay as they are, so that the vocabulary is stable.
43. As a User, I want only four interactive elements (Topic field, Autopilot toggle, Topic queue, Feed), so that the UI stays simple.
44. As a Developer, I want the Agent service to own every Run, Task and Step including all timing, so that the Visualizer never decides durations or order.
45. As a Developer, I want the Agent service to publish changes as Server-Sent Events and receive user actions over plain HTTP, so that the transport matches the one-way data flow.
46. As a Developer, I want the first event on every SSE connection to be a full snapshot, so that late and reconnecting Visualizers need no guessing.
47. As a Developer, I want Handoff to be an explicit event, so that the Visualizer never infers it from Task completion.
48. As a Developer, I want all timing numbers in one configuration of the Agent service, so that pace can be tuned without touching the Visualizer.
49. As a Developer, I want a way to run the Agent service with accelerated timing, so that tests finish quickly and deterministically.
50. As a Developer, I want the dummy Agents replaceable by real ones later without changing the Visualizer, so that the project can grow.
51. As a Developer, I want shared event and snapshot types in one small package used by both sides, so that the contract cannot drift.
52. As a Developer, I want dummy Agent output generated from templates (per Category for research and writing, per Platform for Post shape), so that no LLM is involved.
53. As a Developer, I want Agent Tasks never to fail, so that there is no error state to model in this version.
54. As a Developer, I want all state held in memory, so that there is no database to run.
55. As a Developer, I want a restart of the Agent service to start with an empty Feed and queue and Autopilot on, so that behaviour on restart is predictable.

## Implementation Decisions

**Architecture (extends ADR 0001)**
- One repo with three TypeScript packages: an Agent service (Node, Hono), a Visualizer (Vite, React, isometric scene in SVG/CSS), and a small shared package of event and snapshot types.
- Communication is only SSE (Agent service to Visualizer) and plain HTTP (Visualizer to Agent service). The Visualizer has no other knowledge of the Agent service.
- The Agent service is the single source of truth. The Visualizer holds a projection built purely from snapshot plus events. It never computes durations, order, or derived events such as Handoff.

**Agent service modules**
- *Run engine*: runs one Run at a time through Scout, Quill, Herald. Each Task is a sequence of 3 to 5 Steps. Step duration is random within a configured range (about 2 to 4 seconds). Herald has one Step per Platform in fixed order X, LinkedIn, Instagram, TikTok. A Run takes about 1 to 1.5 minutes.
- *Topic scheduler*: decides the next Topic. The Topic queue (FIFO) always goes before Autopilot's random pick. Autopilot is on by default, waits a configured gap (default 5 seconds) between Runs, and when paused with an empty queue the office stays idle. A Topic queued while Autopilot is paused still runs.
- *Topic intake*: validates typed Topics. Rejects empty text, duplicates of a Topic already queued, and a full queue (maximum 10). Category (AI, IT or IoT) is detected by simple keyword matching; a Topic matching no Category is rejected with a reason. The reason is returned to the caller and not broadcast.
- *Dummy content generator*: produces Scout's research, Quill's writing and each Platform's Post from templates (per Category for research and writing, per Platform for Post shape), with the Topic inserted and light random variation. All Post text and Step labels are Indonesian. No LLM calls.
- *Feed*: in-memory list of Posts, newest first, capped at the latest 50. A Run adds one Post per Platform, one at a time as Herald publishes each.
- *State store*: everything in memory. Restart resets to empty Feed, empty queue, Autopilot on.
- *Event stream*: every SSE connection first receives a full snapshot (current Run and Task and Step, Agent states, Topic queue, Autopilot state, Feed), then incremental events. Incremental events include at least: Run started and finished, Task started and finished, Step started, Handoff, Post published, queue changed, Autopilot changed. No `Last-Event-ID` replay. Reconnect gets a fresh snapshot.
- *Timing configuration*: single configuration object for Step duration range, Autopilot gap, queue cap, Feed cap. Must be overridable (e.g. via environment or startup option) so tests can run with accelerated or near-zero timing.

**HTTP API (user actions)**
- Submit Topic: accepted (returns the queued Topic and its Category) or rejected (returns a reason, in Indonesian, suitable for display).
- Pause Autopilot and resume Autopilot.
- SSE endpoint for the event stream.
- No authentication. All Users have equal rights. There is one shared office.

**Visualizer**
- Renders the isometric office from the projection: three desks, three Agents with idle or working state, Step bubbles, Handoff animation between desks, current Topic and Category.
- Four interactive elements only: Topic field, Autopilot toggle, Topic queue list, Feed panel (Posts openable to read full content). No skip, delete, or settings controls.
- Shows rejection messages returned by the Agent service.
- All user-facing text in Indonesian, except Agent names and glossary-fixed terms.
- On connection loss, reconnects and replaces its projection with the new snapshot.

**Glossary and ADRs**
- `GLOSSARY.md` already updated in this design session (Post per Platform, User, Creator persona, Topic rejection). No new ADR is needed; the snapshot-first SSE rule is an extension of ADR 0001 and is recorded here.

## Testing Decisions

- A good test drives the system only through its external interface and asserts on observable behaviour (events received, DOM rendered), never on internal state or module structure.
- **Seam A: the Agent service over HTTP and SSE.** Start the real service with accelerated timing configuration. A test client submits Topics and toggles Autopilot over HTTP and reads the SSE stream. Assert: event order for a full Run (Scout Steps, Handoff, Quill Steps, Handoff, Herald Steps, one Post per Platform in order); one Run at a time; queue is FIFO and runs before random Topics; queue cap, duplicate, empty and out-of-Category rejection with a reason; Autopilot pause lets the current Run finish and stops new random Runs; a queued Topic runs while paused; snapshot is the first event and is correct mid-Run and after reconnect; Feed capped at 50 and newest first; two simultaneous connections see the same events.
- **Seam B: the Visualizer fed by a scripted event stream.** Feed the Visualizer a prepared snapshot and sequence of events with no Agent service running. Assert on the rendered DOM: Step bubble at the right Agent, Handoff animation triggered by the Handoff event, Feed and queue contents, Autopilot state, rejection message display, correct render from a mid-Run snapshot, replacement of state on a new snapshot after reconnect.
- The shared types package is not tested on its own; it is exercised through both seams.
- No pixel or visual-regression tests of the isometric art.
- Prior art: none, this is a greenfield repo. Choose a test runner idiomatic for the chosen packages.

## Out of Scope

- Any real LLM or real social-network posting.
- Persistence, databases, or surviving a restart.
- Authentication, accounts, per-User state, or roles. The Creator has no account.
- Agent failures, retries, or error states.
- Skipping or deleting Runs, Topics, or Posts; settings UI.
- Replay via `Last-Event-ID`.
- Multiple offices or per-visitor offices.
- Languages other than Indonesian for user-facing text.
- Visual-regression testing.

## Further Notes

- Timing defaults are starting points: Step 2 to 4 seconds, 3 to 5 Steps per Task, Autopilot gap 5 seconds, queue cap 10, Feed cap 50 Posts. All are meant to be easy to change.
- The dummy list of random Topics should cover all three Categories (AI, IT, IoT).
- If real Agents are introduced later, failure handling will need its own ADR and glossary terms.
