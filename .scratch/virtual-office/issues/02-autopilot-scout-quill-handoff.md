# 02: Autopilot runs Scout then Quill with a Handoff

**What to build:** With nothing typed in, the office works on its own. Autopilot is on by default and starts a Run on a random Topic from a dummy list covering AI, IT and IoT. Scout researches, then hands off to Quill, who writes. Each Task is 3 to 5 Steps of random duration, shown as a status bubble above the Agent (text from per-Category templates, in Indonesian). The Handoff is its own event from the Agent service and is animated between desks. The Visualizer shows the current Topic and its Category. Only one Run is in progress at a time, with a gap between Runs. All timing lives in the Agent service configuration and can be accelerated for tests. The snapshot includes the Run in progress, so a Visualizer opened mid-Run draws the right Agent states.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Autopilot starts Runs on its own on a random Topic with a known Category, with a configured gap between Runs
- [ ] A Run produces Steps for Scout, a Handoff event, then Steps for Quill, in that order
- [ ] Each Task has 3 to 5 Steps with durations inside the configured range
- [ ] Never more than one Run in progress
- [ ] Visualizer shows Step bubbles at the correct Agent, the current Topic and Category, and animates the Handoff from the Handoff event only
- [ ] Snapshot taken mid-Run lets a fresh Visualizer render the correct Agent states
- [ ] Seam A test (accelerated timing): reads a full Scout and Quill sequence from the stream and asserts order, Step counts and one Run at a time
- [ ] Seam B test: a scripted event stream produces the right bubbles and Handoff animation, and a mid-Run snapshot renders correctly
