import type { AgentRole } from "@virtual-office/shared";

/**
 * The colours of the 3D office. The objects below are mutated in place by `applyScenePalette`, and the scene is
 * re-mounted when the theme changes, so components can simply read them while rendering.
 */
export interface ScenePalette {
  /** Furniture and props. `blue`, `orange`, `teal` are slots, not literal hues: each theme fills them with its own. */
  color: {
    wood: string; woodDark: string; white: string; paper: string;
    blue: string; blueSoft: string; navy: string; orange: string; mustard: string; pink: string; teal: string;
    green: string; greenDark: string; gray: string; ink: string; cork: string;
  };
  island: { top: string; side: string; base: string; walkway: string; loungeFloor: string; rug: string; rugBorder: string };
  robot: { body: string; joint: string; visor: string; eye: string; antenna: string };
  role: Record<AgentRole, string>;
  light: { ambient: number; ambientColor: string; hemiSky: string; hemiGround: string; hemiIntensity: number; sun: number; sunColor: string };
  /** The recoloured Kenney colour map for this theme. */
  texture: string;
}

const base: ScenePalette = {
  color: {
    wood: "#d6a979", woodDark: "#a9784a", white: "#f7f4ee", paper: "#fbfaf6",
    blue: "#3b3fb8", blueSoft: "#8c90ea", navy: "#2a2d6a", orange: "#e8793a", mustard: "#f0be4a", pink: "#e86a92", teal: "#2fa38a",
    green: "#4c9f70", greenDark: "#367a55", gray: "#9b9db5", ink: "#23264f", cork: "#d9a86c",
  },
  island: { top: "#f6f5fc", side: "#fbfaf7", base: "#cfc9dc", walkway: "#e9e5f2", loungeFloor: "#f5eee4", rug: "#cfd4f5", rugBorder: "#aab1ee" },
  robot: { body: "#f4f1ea", joint: "#e8793a", visor: "#1a1f4d", eye: "#6df3ff", antenna: "#9a9aa8" },
  role: { scout: "#2f9e7a", quill: "#8a5fd0", herald: "#e0623a" },
  light: { ambient: 1.15, ambientColor: "#ffffff", hemiSky: "#ffffff", hemiGround: "#b9b4d6", hemiIntensity: 0.5, sun: 1.1, sunColor: "#ffffff" },
  texture: "/models/Textures/colormap.png",
};

export const PALETTE: ScenePalette = structuredClone(base);
export const COLOR = PALETTE.color;
export const SCENE = PALETTE;
/** Per-role accent: chips, chairs, desk trim, robot chest panels. */
export const ROBOT_COLOR = PALETTE.role;

export function applyScenePalette(next: ScenePalette): void {
  Object.assign(PALETTE.color, next.color);
  Object.assign(PALETTE.island, next.island);
  Object.assign(PALETTE.robot, next.robot);
  Object.assign(PALETTE.role, next.role);
  Object.assign(PALETTE.light, next.light);
  PALETTE.texture = next.texture;
}
