/**
 * Anmeldung/Registrierung für den Braille-Trainer (eigene Konten).
 * Lehrkraft: E-Mail + Passwort (mit Registrierung). Schüler:innen seit
 * 09.08.2026 über den gemeinsamen Baustein `SchuelerAnmeldung` (derselbe
 * Wortlaut wie in Tastenflow/eine andere App der Plattform): Klassencode
 * + Name + Passwort (Konten werden von der Lehrkraft angelegt).
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BrailleAccount,
  Result,
  getRememberedClassCode,
} from "@/lib/braille";
import { SchuelerAnmeldung } from "@/components/lernwerkstatt/SchuelerAnmeldung";
import { brailleBackend } from "@/lib/braille/backend";
import { useBrailleAuth } from "./useBrailleAuth";

// Reihenfolge und Default sind bewusst Schüler:in zuerst — das ist die weit
// häufigere Anmeldung, und Screenreader-Nutzer:innen sollen beim Öffnen des
// Formulars ohne Umweg dort landen (NVDA-Test 2026-07-01).
const ROLE_TABS: { id: "schueler" | "lehrkraft"; label: string }[] = [
  { id: "schueler", label: "Schüler:in" },
  { id: "lehrkraft", label: "Lehrkraft" },
];

export function BrailleAuth({ onCancel }: { onCancel: () => void }) {
  const login = useBrailleAuth((s) => s.login);
  const [tab, setTab] = useState<"lehrkraft" | "schueler">("schueler");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [teacherMode, setTeacherMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Felder
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  // Klassencode vom letzten Anmelden auf diesem Gerät vorausfüllen — dann reicht
  // beim nächsten Mal Name + Passwort. `prefilled` merkt sich, OB ein Code
  // gemerkt war: nur dann zeigen wir die kompakte „Klasse: …"-Zeile. Beim ersten
  // Anmelden (kein gemerkter Code) bleibt das Eingabefeld stehen, auch während
  // man tippt.

  const handle = (r: Result<BrailleAccount>) => {
    if (r.ok) {
      setError("");
      login(r.value);
    } else {
      setError(r.error);
    }
  };

  // Anmelden/Registrieren laufen jetzt gegen das Backend (auf dem Server async).
  // `busy` verhindert Doppel-Absenden und zeigt, dass etwas passiert.
  const run = async (p: Promise<Result<BrailleAccount>>) => {
    if (busy) return;
    setBusy(true);
    try {
      handle(await p);
    } finally {
      setBusy(false);
    }
  };

  const selectRole = (id: "schueler" | "lehrkraft") => {
    setTab(id);
    setError("");
  };

  // Öffnet sich dieses Formular (z. B. über den Knopf „Konto"),
  // bewegt sich der DOM-Fokus sonst nirgendwo hin — Screenreader bleiben auf
  // dem auslösenden Button stehen und erkennen die neuen Felder nicht (NVDA-
  // Test 2026-07-01). Fokus geht auf den aktiven Tab, nicht direkt ins erste
  // Feld, damit die Rollenwahl zuerst angesagt wird.
  useEffect(() => {
    tabRefs.current[tab]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = ROLE_TABS.findIndex((t) => t.id === tab);
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = ROLE_TABS[(idx + dir + ROLE_TABS.length) % ROLE_TABS.length];
    selectRole(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="card mx-auto max-w-md space-y-4 p-6">
      <div role="tablist" aria-label="Rolle" className="flex gap-2" onKeyDown={onTabKeyDown}>
        {ROLE_TABS.map(({ id, label }) => (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            type="button"
            id={`role-tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`role-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className={tab === id ? "btn-primary flex-1" : "btn-secondary flex-1"}
            onClick={() => selectRole(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "lehrkraft" ? (
        <form
          id="role-panel-lehrkraft"
          role="tabpanel"
          aria-labelledby="role-tab-lehrkraft"
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            // ★★★ Der Riegel, der `disabled` am Knopf ersetzt (Bauart §3):
            // Zweimal abschicken soll nicht gehen - der Knopf soll aber den
            // Fokus behalten.
            if (busy) return;
            const backend = brailleBackend();
            run(
              teacherMode === "login"
                ? backend.loginTeacher(email, pw)
                : backend.registerTeacher(name, email, pw),
            );
          }}
        >
          {teacherMode === "register" && (
            <div>
              <label className="field-label" htmlFor="t-name">Name</label>
              <input
                id="t-name"
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Frau Berger"
              />
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="t-mail">E-Mail</label>
            <input
              id="t-mail"
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="t-pw">Passwort</label>
            <input
              id="t-pw"
              type="password"
              className="field-input"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete={teacherMode === "login" ? "current-password" : "new-password"}
            />
          </div>
          {/* ★★★ Senden-Knoepfe nie `disabled` (Bauart §14). Wer waehrend des
              Wartens den Fokus verliert, landet am Dokumentenanfang - und muss
              das Anmelde-Formular neu suchen. Der Riegel steht im `onSubmit`. */}
          <button
            type="submit"
            className={"btn-primary w-full" + (busy ? " opacity-40" : "")}
            aria-disabled={busy || undefined}
          >
            {busy
              ? "Bitte warten …"
              : teacherMode === "login"
                ? "Anmelden"
                : "Konto erstellen"}
          </button>
          <p className="m-0 text-center text-sm text-ink-muted">
            {teacherMode === "login" ? "Neu hier? " : "Schon ein Konto? "}
            <button
              type="button"
              className="text-accent underline underline-offset-2"
              onClick={() => {
                setTeacherMode(teacherMode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {teacherMode === "login" ? "Konto erstellen" : "Anmelden"}
            </button>
          </p>
          {teacherMode === "login" && (
            <p className="m-0 text-center text-sm">
              <Link
                to="/lernprogramm-passwort"
                className="text-accent underline underline-offset-2"
              >
                Passwort vergessen?
              </Link>
            </p>
          )}
        </form>
      ) : (
        <div
          id="role-panel-schueler"
          role="tabpanel"
          aria-labelledby="role-tab-schueler"
        >
          <SchuelerAnmeldung
            busy={busy}
            klassenCode={getRememberedClassCode()}
            onFehlerZuruecksetzen={() => setError("")}
            onLokalerFehler={(t: string) => setError(t)}
            onKlassenLogin={(c: string, n: string, p: string) =>
              run(brailleBackend().loginPupil(c, n, p))
            }
            onSelbstLogin={(mail: string, p: string) =>
              run(brailleBackend().loginPupilSelf(mail, p))
            }
            onSelbstRegister={(n: string, mail: string, p: string) =>
              run(brailleBackend().registerPupilSelf(n, mail, p))
            }
          />
        </div>
      )}

      {error && (
        <p role="alert" className="m-0 rounded-xl bg-danger-soft p-3 text-sm text-ink">
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn-ghost w-full"
        onClick={onCancel}
      >
        Ohne Konto weiterüben
      </button>
    </div>
  );
}
