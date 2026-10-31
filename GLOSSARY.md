# Virtual Office

A simulated team of content-creation agents, and an isometric office where you watch them work. The agents are dummies: they act out the work without calling any LLM.

## Language

### The team

**Agent**:
One simulated worker with a fixed role, a character name and a desk in the office.
_Avoid_: Bot, worker, employee

**Bambang**:
The Agent that researches: it finds and picks an angle for the Topic.
_Avoid_: Researcher (role name only)

**Karjo**:
The Agent that writes the content from Bambang's research.
_Avoid_: Writer, creator

**Tejo**:
The Agent that publishes the finished content as a Post on every Platform.
_Avoid_: Publisher, poster

### The work

**Topic**:
The subject a Run is about, always from the world of AI, IT or IoT. Picked automatically from a dummy list or typed in by a User. A typed-in Topic that fits no Category is rejected.
_Avoid_: Prompt, brief

**Category**:
The field a Topic belongs to: AI, IT or IoT.
_Avoid_: Tag, genre

**Autopilot**:
The mode that keeps starting Runs on random Topics. Pausing it stops new random Runs but lets the current Run finish.
_Avoid_: Auto mode, loop

**Topic queue**:
Topics typed in by Users, waiting their turn. They go before Autopilot's next random Topic.
_Avoid_: Backlog

**Run**:
One Topic passing through Bambang, then Karjo, then Tejo. Only one Run is in progress at a time.
_Avoid_: Job, pipeline, session

**Task**:
One Agent's share of a Run. Its output becomes the next Agent's input.
_Avoid_: Job, stage

**Step**:
A labelled unit of a Task, shown as the Agent's status bubble (e.g. "Comparing 12 sources…").
_Avoid_: Action, subtask

**Handoff**:
The moment one Agent passes its finished Task output to the next Agent.
_Avoid_: Transfer

**Post**:
The dummy piece of content Tejo publishes to one Platform, written in Indonesian on behalf of the Creator. Every Run ends with one Post per Platform, all adapted from the same piece of Karjo's writing.
_Avoid_: Content, output, article

**Creator**:
The fictional influencer who owns the Agents and on whose behalf every Post is published. Has no account and never interacts with the Visualizer.
_Avoid_: User, author, owner

**User**:
A visitor to the Visualizer. Can type in a Topic and pause or resume Autopilot. All Users have the same rights.
_Avoid_: Viewer, visitor, Creator

**Platform**:
A social network a Run publishes to: X, LinkedIn, Instagram or TikTok. Every Run publishes to all four. Each Platform decides its Post's shape: thread, long post, carousel or short-video script.
_Avoid_: Channel, network

**Feed**:
The list of Posts published so far, newest first. A Run adds one Post per Platform.
_Avoid_: Timeline, history

### The two sides

**Agent service**:
The side that owns the Runs and all their timing, and announces every change as an event.
_Avoid_: Backend, engine

**Visualizer**:
The isometric office that only shows what the Agent service announces.
_Avoid_: Dashboard, frontend, UI
