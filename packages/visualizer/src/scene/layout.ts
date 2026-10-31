import type { AgentRole } from "@virtual-office/shared";

/** World units are roughly metres; one Kenney tile is 1 unit. y is up, the camera looks from +x +y +z. */
export const ISLAND = { w: 5.4, d: 4.4, h: 0.35 };
export const FLOOR_Y = ISLAND.h;

export const ISLAND_AT: Record<AgentRole, { x: number; z: number }> = {
  scout: { x: -6.1, z: 0 },
  quill: { x: 0, z: 0 },
  herald: { x: 6.1, z: 0 },
};

/** The small pad where queued Topics wait, upstream of Bambang. */
export const TOPICS_AT = { x: -11.6, z: 0 };

export { ROBOT_COLOR } from "./palette";

export const ROLE_TITLE: Record<AgentRole, string> = {
  scout: "Peneliti",
  quill: "Penulis",
  herald: "Penerbit",
};

/**
 * The workstation, relative to an island's centre. The robot sits at SEAT facing +x, where the desk stands,
 * so the camera (up on +x +z) sees the robot's face from the front-left and the screen's back.
 * Hands rest about 0.6 in front of the hips, which is where the keyboard goes.
 */
export const SEAT = { x: 0, z: 0 };
export const SEAT_FACING = Math.PI / 2;
export const APPROACH = { x: 0, z: 1.0 };
export const DESK = { x: 0.95, z: 0, w: 1.9, d: 0.95, topY: 0.72 };
export const WAYPOINTS = [
  { x: -1.9, z: -0.3 },
  { x: -1.5, z: 1.0 },
  { x: -0.6, z: 1.6 },
  { x: 0.5, z: 1.6 },
  { x: -0.9, z: -0.9 },
  { x: -2.0, z: 0.9 },
];

/** The big lounge below (toward +z) the three work rooms. */
export const LOUNGE = { x: -1.0, z: 7.7, w: 9.4, d: 6 };
