import { applyScenePalette, type ScenePalette } from "./scene/palette";

export type ThemeId = "terakota" | "hutan" | "malam";

export interface Theme {
  id: ThemeId;
  name: string;
  dark: boolean;
  /** Three colours that show what the theme feels like, for the picker. */
  swatch: [string, string, string];
  /** CSS custom properties, without the leading `--`. */
  css: Record<string, string>;
  scene: ScenePalette;
}

const platforms = { "pf-x": "#2b1d14", "pf-linkedin": "#0a66c2", "pf-instagram": "#c2287f", "pf-tiktok": "#0f8a8f" };

export const THEMES: Record<ThemeId, Theme> = {
  /** Warm sand with bright azure furniture and teal accents. */
  terakota: {
    id: "terakota",
    name: "Terakota",
    dark: false,
    swatch: ["#f1d6b3", "#1f7fe0", "#2b8c7d"],
    css: {
      "bg-top": "#fbeedd", "bg-bottom": "#efcfa9", "bg-glow": "#fff8ec",
      ink: "#3b2417", muted: "#7b5a46", faint: "#a28572", line: "rgba(59, 36, 23, 0.13)",
      card: "rgba(255, 249, 240, 0.9)", "card-border": "rgba(255, 255, 255, 0.7)",
      surface: "#fffaf2", "surface-2": "#f7e8d3", "surface-3": "#f9ecda", "surface-hover": "#f2dcc0",
      primary: "#1a73d9", "primary-hover": "#135fb8", "primary-ink": "#ffffff", "primary-soft": "#d6e7fa", "primary-ring": "rgba(26, 115, 217, 0.32)",
      pop: "#1f8a7a", "pop-ink": "#ffffff", "pop-shadow": "rgba(31, 138, 122, 0.35)",
      tag: "#a8385a", good: "#2f7d4f", danger: "#b3261e",
      "cat-ai-bg": "#d6e7fa", "cat-ai-fg": "#0d4f9e", "cat-it-bg": "#dcead3", "cat-it-fg": "#3f6a2c", "cat-iot-bg": "#cfe9e4", "cat-iot-fg": "#17695d",
      "shadow-rgb": "110 60 30", ...platforms,
    },
    scene: {
      color: {
        wood: "#d8b98f", woodDark: "#8c6c4e", white: "#fbf3e6", paper: "#fffaf0",
        blue: "#1f7fe0", blueSoft: "#9fcdf7", navy: "#0b3d78", orange: "#2b8c7d", mustard: "#f2c14e", pink: "#d9708a", teal: "#7d8f3c",
        green: "#6f9a45", greenDark: "#4d7230", gray: "#a08a74", ink: "#3b2417", cork: "#d6b07c",
      },
      island: { top: "#f7e6cf", side: "#fbf0df", base: "#c6a57e", walkway: "#ead2b0", loungeFloor: "#efd2a8", rug: "#bcd9f5", rugBorder: "#7fb4e6" },
      robot: { body: "#f7ead6", joint: "#1f7fe0", visor: "#132238", eye: "#7fffe9", antenna: "#a08a74" },
      role: { scout: "#2b8c7d", quill: "#a8385a", herald: "#2f86e8" },
      light: { ambient: 1.1, ambientColor: "#fff1de", hemiSky: "#fff4e6", hemiGround: "#d8b48c", hemiIntensity: 0.5, sun: 1.1, sunColor: "#fff0d9" },
      texture: "/models/Textures/colormap-terakota.png",
    },
  },

  /** Pale sage and forest green, with coral accents. */
  hutan: {
    id: "hutan",
    name: "Hutan",
    dark: false,
    swatch: ["#c9ddc4", "#2c7a58", "#e06a3c"],
    css: {
      "bg-top": "#e9f1e2", "bg-bottom": "#c4dac0", "bg-glow": "#f6faef",
      ink: "#1b3a2c", muted: "#4f6f5e", faint: "#7c9987", line: "rgba(27, 58, 44, 0.13)",
      card: "rgba(247, 252, 243, 0.9)", "card-border": "rgba(255, 255, 255, 0.7)",
      surface: "#fbfdf7", "surface-2": "#e6f0df", "surface-3": "#edf5e6", "surface-hover": "#dcebd3",
      primary: "#2c7a58", "primary-hover": "#226246", "primary-ink": "#ffffff", "primary-soft": "#cfe6d6", "primary-ring": "rgba(44, 122, 88, 0.3)",
      pop: "#d8582b", "pop-ink": "#ffffff", "pop-shadow": "rgba(216, 88, 43, 0.35)",
      tag: "#b93a52", good: "#1d7a4e", danger: "#b3261e",
      "cat-ai-bg": "#d8eddf", "cat-ai-fg": "#17603f", "cat-it-bg": "#f9e0c9", "cat-it-fg": "#8f420f", "cat-iot-bg": "#f3e6a6", "cat-iot-fg": "#6d5400",
      "shadow-rgb": "30 70 50", ...platforms, "pf-x": "#1b3a2c",
    },
    scene: {
      color: {
        wood: "#d3a672", woodDark: "#9c6d3f", white: "#f6f6e9", paper: "#fdfdf4",
        blue: "#2f6f5a", blueSoft: "#8fc4a8", navy: "#1d4234", orange: "#e06a3c", mustard: "#efbf4a", pink: "#e58a7a", teal: "#4aa38c",
        green: "#5aa05a", greenDark: "#3b7a45", gray: "#8f9f8e", ink: "#1b3a2c", cork: "#d2a46a",
      },
      island: { top: "#eaf0d4", side: "#f4f7e4", base: "#9db894", walkway: "#d6e3c4", loungeFloor: "#efe3bf", rug: "#f3cdb0", rugBorder: "#e29a77" },
      robot: { body: "#f6f4e4", joint: "#e06a3c", visor: "#17302a", eye: "#8bffd8", antenna: "#8f9f8e" },
      role: { scout: "#2f9a6b", quill: "#d98a1f", herald: "#d9534a" },
      light: { ambient: 1.1, ambientColor: "#f4fff0", hemiSky: "#f2ffee", hemiGround: "#a9c9a0", hemiIntensity: 0.5, sun: 1.1, sunColor: "#fffbe8" },
      texture: "/models/Textures/colormap-hutan.png",
    },
  },

  /** Deep plum with mint and coral glow. */
  malam: {
    id: "malam",
    name: "Malam",
    dark: true,
    swatch: ["#2e1a4a", "#56e0b2", "#ff7a59"],
    css: {
      "bg-top": "#1b1230", "bg-bottom": "#36205c", "bg-glow": "#4a2d7a",
      ink: "#f5eeff", muted: "#c3b3e0", faint: "#9a88bd", line: "rgba(245, 238, 255, 0.14)",
      card: "rgba(36, 24, 62, 0.84)", "card-border": "rgba(255, 255, 255, 0.1)",
      surface: "#2f2150", "surface-2": "#3a2a63", "surface-3": "#2c1f4b", "surface-hover": "#433172",
      primary: "#56e0b2", "primary-hover": "#3fcf9f", "primary-ink": "#0f2b22", "primary-soft": "rgba(86, 224, 178, 0.18)", "primary-ring": "rgba(86, 224, 178, 0.4)",
      pop: "#ff7a59", "pop-ink": "#2b120b", "pop-shadow": "rgba(255, 122, 89, 0.4)",
      tag: "#ff4f8b", good: "#5ee6b5", danger: "#ff8a80",
      "cat-ai-bg": "rgba(255, 122, 89, 0.22)", "cat-ai-fg": "#ffb59f", "cat-it-bg": "rgba(86, 224, 178, 0.2)", "cat-it-fg": "#7df0cc", "cat-iot-bg": "rgba(255, 214, 102, 0.2)", "cat-iot-fg": "#ffdf8a",
      "shadow-rgb": "0 0 0", "pf-x": "#f5eeff", "pf-linkedin": "#6db3ff", "pf-instagram": "#ff7ab8", "pf-tiktok": "#5ef0e6",
    },
    scene: {
      color: {
        wood: "#c58b5c", woodDark: "#8a5a3a", white: "#efe6f7", paper: "#f3edf8",
        blue: "#9b3d8f", blueSoft: "#d58ad0", navy: "#3a1650", orange: "#ff7a59", mustard: "#ffc94a", pink: "#ff6fa5", teal: "#3fe0b8",
        green: "#46c58a", greenDark: "#2e9a6a", gray: "#8f7fb0", ink: "#1b1230", cork: "#b98450",
      },
      island: { top: "#4b3274", side: "#5a3f86", base: "#2a1a4a", walkway: "#5b4690", loungeFloor: "#5b3a63", rug: "#7a3f86", rugBorder: "#a2579f" },
      robot: { body: "#f3ead9", joint: "#ff7a59", visor: "#120b22", eye: "#6dfff0", antenna: "#8f7fb0" },
      role: { scout: "#3fe0b8", quill: "#ff6fa5", herald: "#ffc94a" },
      light: { ambient: 0.8, ambientColor: "#e8d8ff", hemiSky: "#cdb8ff", hemiGround: "#3a2563", hemiIntensity: 0.55, sun: 0.95, sunColor: "#ffe9d6" },
      texture: "/models/Textures/colormap-malam.png",
    },
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
export const DEFAULT_THEME: ThemeId = "terakota";

/** Writes the theme into the page: CSS variables for the cards and the scene palette for the 3D office. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.css)) root.style.setProperty(`--${key}`, value);
  root.style.colorScheme = theme.dark ? "dark" : "light";
  root.dataset.theme = theme.id;
  applyScenePalette(theme.scene);
}

const STORAGE_KEY = "kantor-virtual:tema";

/** `?tema=` wins, then what the User picked last time, then the default. */
export function initialThemeId(): ThemeId {
  try {
    const wanted = new URLSearchParams(window.location.search).get("tema") ?? window.localStorage.getItem(STORAGE_KEY);
    if (wanted && wanted in THEMES) return wanted as ThemeId;
  } catch {
    /* private mode or blocked storage: fall through */
  }
  return DEFAULT_THEME;
}

export function rememberTheme(id: ThemeId): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* not worth failing for */
  }
}
