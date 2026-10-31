# 04: Pause and resume Autopilot

**What to build:** A User can pause Autopilot with a button and see whether Autopilot is on or paused. Pausing stops new random Runs but lets the Run in progress finish; the office then stays idle. Resuming starts random Runs again. The Autopilot state is part of the snapshot, so every visitor sees the same state.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] HTTP actions to pause and resume Autopilot, with no authentication
- [ ] Pausing mid-Run lets that Run finish and no new random Run starts afterwards
- [ ] Resuming starts random Runs again
- [ ] An Autopilot-changed event is sent and Autopilot state is in the snapshot
- [ ] Visualizer shows the toggle and a clear on or paused state, with Indonesian labels
- [ ] Seam A test: pause during a Run, assert the Run completes and no further Run starts; resume, assert Runs start again
- [ ] Seam B test: scripted Autopilot events flip the toggle state; a snapshot with Autopilot paused renders as paused
