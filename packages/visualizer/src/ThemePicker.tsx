import { THEMES, THEME_IDS, type ThemeId } from "./theme";

/** Three round swatches; each previews its theme's colours. */
export function ThemePicker({ current, onPick }: { current: ThemeId; onPick: (id: ThemeId) => void }) {
  return (
    <div className="theme-picker" role="radiogroup" aria-label="Tema warna">
      {THEME_IDS.map((id) => {
        const theme = THEMES[id];
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={id === current}
            aria-label={`Tema ${theme.name}`}
            title={`Tema ${theme.name}`}
            className="theme-swatch"
            onClick={() => onPick(id)}
          >
            <span style={{ background: theme.swatch[0] }} />
            <span style={{ background: theme.swatch[1] }} />
            <span style={{ background: theme.swatch[2] }} />
          </button>
        );
      })}
    </div>
  );
}
