# The Visualizer only projects Agent service events

The Agent service owns every Run, Task and Step, including their timing, and pushes each change to the Visualizer over Server-Sent Events. The Visualizer never decides durations or order itself: it only animates what it is told. That way the dummy Agents can later be replaced by real ones without touching the Visualizer. We picked SSE over WebSocket because the stream runs one way (server to browser); the few user actions, such as submitting a Topic, go over plain HTTP.
