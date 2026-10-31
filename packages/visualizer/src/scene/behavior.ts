export interface Spot {
  x: number;
  z: number;
}

export interface RobotState {
  x: number;
  z: number;
  /** Radians around y; 0 faces +z. */
  heading: number;
  /** 0 standing, 1 fully seated. */
  sit: number;
  mode: "stand" | "stroll" | "to-seat" | "seated" | "rising";
  /** While heading to the chair: first the spot beside it, then the seat itself. */
  stage: "approach" | "seat";
  /** Seconds left standing still before the next stroll. */
  wait: number;
  target: Spot | null;
  /** Advances while walking; drives the swing of limbs. */
  phase: number;
  walking: boolean;
}

export interface RobotLayout {
  /** A spot beside the chair, so the robot slides onto the seat from the side instead of through the backrest. */
  approach?: Spot;
  seat: Spot;
  seatFacing: number;
  waypoints: Spot[];
}

const WALK_SPEED = 1.15;
const TURN_RATE = 9;
const SIT_RATE = 3;

export function createRobot(start: Spot, rand: () => number): RobotState {
  return { x: start.x, z: start.z, heading: 0, sit: 0, mode: "stand", stage: "seat", wait: 0.5 + rand() * 2, target: null, phase: 0, walking: false };
}

function turnToward(current: number, wanted: number, dt: number): number {
  let diff = ((wanted - current + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  const step = Math.min(Math.abs(diff), TURN_RATE * dt);
  return current + Math.sign(diff) * step;
}

/** Walks toward `target`; returns true once there. */
function walk(s: RobotState, target: Spot, dt: number): boolean {
  const dx = target.x - s.x;
  const dz = target.z - s.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.04) {
    s.walking = false;
    return true;
  }
  s.heading = turnToward(s.heading, Math.atan2(dx, dz), dt);
  const step = Math.min(dist, WALK_SPEED * dt);
  s.x += (dx / dist) * step;
  s.z += (dz / dist) * step;
  s.phase += dt * 9;
  s.walking = true;
  return false;
}

/**
 * One frame of a robot's life. Working: walk to the chair, sit, type. Not working: stand a while,
 * stroll to another spot, stand again. Mutates `s` in place because it runs every frame.
 */
export function stepRobot(s: RobotState, working: boolean, layout: RobotLayout, dt: number, rand: () => number): void {
  if (working) {
    if (s.mode === "stand" || s.mode === "stroll" || s.mode === "rising") {
      s.mode = "to-seat";
      s.stage = layout.approach ? "approach" : "seat";
      s.target = layout.seat;
    }
  } else if (s.mode === "to-seat" || s.mode === "seated") {
    s.mode = "rising";
    s.target = null;
  }

  switch (s.mode) {
    case "to-seat": {
      s.sit = Math.max(0, s.sit - SIT_RATE * dt);
      const goal = s.stage === "approach" && layout.approach ? layout.approach : layout.seat;
      if (walk(s, goal, dt)) {
        if (s.stage === "approach") s.stage = "seat";
        else s.mode = "seated";
      }
      break;
    }
    case "seated": {
      s.walking = false;
      s.heading = turnToward(s.heading, layout.seatFacing, dt);
      s.sit = Math.min(1, s.sit + SIT_RATE * dt);
      break;
    }
    case "rising": {
      s.walking = false;
      s.sit = Math.max(0, s.sit - SIT_RATE * dt);
      if (s.sit === 0) {
        // Step out sideways first, then wander off.
        s.mode = layout.approach ? "stroll" : "stand";
        s.target = layout.approach ?? null;
        s.wait = 0.6 + rand() * 1.4;
      }
      break;
    }
    case "stand": {
      s.walking = false;
      s.wait -= dt;
      if (s.wait <= 0) {
        const options = layout.waypoints.filter((w) => Math.hypot(w.x - s.x, w.z - s.z) > 0.8);
        s.target = options[Math.floor(rand() * options.length)] ?? layout.waypoints[0] ?? null;
        s.mode = s.target ? "stroll" : "stand";
      }
      break;
    }
    case "stroll": {
      if (!s.target || walk(s, s.target, dt)) {
        s.mode = "stand";
        s.wait = 1.2 + rand() * 2.8;
        s.walking = false;
      }
      break;
    }
  }
}
