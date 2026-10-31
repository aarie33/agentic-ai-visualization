import { useState } from "react";
import { httpApi, type OfficeApi } from "./api";
import { Controls } from "./Controls";
import { Feed } from "./Feed";
import { Office } from "./Office";
import { RunBanner } from "./RunBanner";
import { THEMES, applyTheme, initialThemeId, rememberTheme, type ThemeId } from "./theme";
import { ThemePicker } from "./ThemePicker";
import { connectEventSource, useOfficeStream, type Connect } from "./useOfficeStream";

export function App({ connect = connectEventSource, api = httpApi }: { connect?: Connect; api?: OfficeApi }) {
  const snapshot = useOfficeStream(connect);
  // The palette is written before the first render so nothing flashes in the wrong colours.
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const id = initialThemeId();
    applyTheme(THEMES[id]);
    return id;
  });
  const pickTheme = (id: ThemeId) => {
    applyTheme(THEMES[id]);
    rememberTheme(id);
    setThemeId(id);
  };
  return (
    <main className="app">
      {snapshot ? (
        <>
          <Office key={themeId} snapshot={snapshot} />
          <aside className="card card-left">
            <header className="title">
              <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
                <path className="mark-body" d="M16 3 28 10v12l-12 7L4 22V10z" />
                <path className="mark-top" d="M16 3 28 10 16 17 4 10z" />
                <path className="mark-side" d="M16 17v12L4 22V10z" />
                <path className="mark-spark" d="M22 13.5v6l-4 2.3v-6z" />
              </svg>
              <div>
                <h1>Kantor Virtual</h1>
                <p>Tiga agen mengubah satu topik menjadi Post untuk empat Platform.</p>
              </div>
            </header>
            <RunBanner run={snapshot.run} />
            <Controls snapshot={snapshot} api={api} />
          </aside>
          <aside className="card card-right">
            <Feed posts={snapshot.feed} />
          </aside>
          <ThemePicker current={themeId} onPick={pickTheme} />
        </>
      ) : (
        <div className="card card-center">
          <h1>Kantor Virtual</h1>
          <p className="connecting">Menghubungkan ke kantor…</p>
        </div>
      )}
    </main>
  );
}
