/**
 * Abzeichen-Regal von „Punktgenau" - verdiente Medaillen, die drei nächsten
 * Ziele und eine aufklappbare Voll-Liste je Familie.
 *
 * Bauart wie das Abzeichen-Regal des Tipptrainers (`components/typing/
 * BadgeShelf.tsx`), aber eigenständig und schlank: kein Zoom-Dialog, keine
 * Sprachausgabe-Ansage beim Öffnen - dieser Baustein ZEIGT nur, er meldet
 * sich nicht selbst zu Wort. `BadgeMedal.tsx` lässt sich nicht ohne Änderung
 * benutzen (es hängt fest an `BADGES`/der Tastenflow-Familienliste), darum
 * eine eigene, schlanke Medaille hier im selben Baustein.
 *
 * ★ Eigenständiger Baustein: nimmt nur `progress` und `areas` entgegen und
 * hat keine Meinung, WO es steht - heute hinter dem Zahnrad der Punktgenau-
 * Kopfleiste (`Punktgenau.tsx`), später ebenso in einer Kind-Statistik, die
 * es noch nicht gibt.
 *
 * Barrierefreiheit:
 * - Die Medaille ist rein dekorativ (`aria-hidden`); Name, Bedingung UND ein
 *   Satz, wie die Medaille aussieht (Metall + Band + Motiv, < 120 Zeichen -
 *   Braillezeile), stehen als Text/`sr-only` daneben.
 * - Geheim-Abzeichen zeigen vor dem Verdienen nur „???" - auch der
 *   sr-only-Satz verrät weder Bedingung noch Motiv.
 * - Kein Klick ohne Fokus-Ziel: Die einzelnen Abzeichen sind reine Anzeige
 *   (kein Schalter, keine Falle); der „Alle Abzeichen"-Aufklapper bleibt nach
 *   dem Betätigen selbst der Fokus - wie im Vorbild.
 * - Keine Farbe als einzige Information: Metall/Band sind Schmuck, die
 *   Auskunft steht immer als Wort daneben.
 */
import { useId, useState } from "react";
import { Aufklappen } from "@/components/Aufklappen";
import { useContrast, type ContrastMode } from "@/lib/contrast";
import { motivBild } from "@/lib/abzeichen/motivBild";
import type { Area } from "@/lib/braille/areas";
import type { BrailleProgress } from "@/lib/braille/progress";
import {
  ABZEICHEN,
  naechsteZiele,
  verdienteAbzeichen,
  type AbzeichenDef,
} from "@/lib/braille/abzeichen";

// --- Die schlanke Medaille --------------------------------------------------

type Metall = "bronze" | "silber" | "gold" | "diamant" | "grau";

const METALL_FARBEN: Record<Metall, { rand: string; randDunkel: string; flaeche: string; hell: string; detail: string }> = {
  bronze: { rand: "#c98a4b", randDunkel: "#8a5a28", flaeche: "#c98c50", hell: "#f2cfa6", detail: "#5a3714" },
  silber: { rand: "#bfc7d2", randDunkel: "#828e9d", flaeche: "#aab4c0", hell: "#edf1f6", detail: "#4c545c" },
  gold: { rand: "#e5b83a", randDunkel: "#a8801a", flaeche: "#d9a92c", hell: "#f9e196", detail: "#5a4108" },
  diamant: { rand: "#9ed3e8", randDunkel: "#6ba9c2", flaeche: "#c2e6f3", hell: "#eaf8fd", detail: "#2f6178" },
  grau: { rand: "#b3b8bf", randDunkel: "#878d95", flaeche: "#c3c8ce", hell: "#e3e6ea", detail: "#54585d" },
};

/** Bandfarbe je Familie - gedeckte, gut unterscheidbare Töne. */
const BAND_FARBEN: Record<string, { hell: string; dunkel: string; wort: string }> = {
  Etappenpfad: { hell: "#8fae5c", dunkel: "#5f7e39", wort: "moosgrünem" },
  Bereiche: { hell: "#5f95dc", dunkel: "#3d6fb0", wort: "blauem" },
  Sterne: { hell: "#a084d6", dunkel: "#7d5cbf", wort: "violettem" },
  Bestnote: { hell: "#e0bd5a", dunkel: "#cfa227", wort: "goldgelbem" },
  Rang: { hell: "#dd7cae", dunkel: "#c2538f", wort: "pinkem" },
  Tagesserie: { hell: "#f0a05e", dunkel: "#e0812f", wort: "orangem" },
  Fehlerfrei: { hell: "#5cb0b0", dunkel: "#2f8f8f", wort: "blaugrünem" },
  Trefferserien: { hell: "#e57979", dunkel: "#d64d4d", wort: "rotem" },
  "Aktive Tage": { hell: "#7cbb81", dunkel: "#4c9d52", wort: "grünem" },
  "Aktive Wochen": { hell: "#4a91b0", dunkel: "#1f6f8f", wort: "meerblauem" },
  Geheim: { hell: "#8271ab", dunkel: "#5b4b8a", wort: "dunkelviolettem" },
};
const BAND_VERBORGEN = { hell: "#a9adb3", dunkel: "#888d94", wort: "grauem" };

const METALL_WORT: Record<Metall, string> = {
  bronze: "Bronzene Medaille",
  silber: "Silberne Medaille",
  gold: "Goldene Medaille",
  diamant: "Diamantene Medaille",
  grau: "Graue Medaille",
};

/** Zwei-Farb-Darstellung je Kontrastmodus (dieselben Modi wie `contrast.ts`). */
const KONTRAST_MEDAILLE: Record<
  Exclude<ContrastMode, "hell" | "dunkel">,
  { grund: string; strich: string; invertiert: boolean }
> = {
  sw: { grund: "#fffdf0", strich: "#000000", invertiert: false },
  sg: { grund: "#ffec8c", strich: "#000000", invertiert: false },
  ws: { grund: "#000000", strich: "#ffffff", invertiert: true },
  gs: { grund: "#000000", strich: "#ffd600", invertiert: true },
  gb: { grund: "#132e78", strich: "#ffd600", invertiert: true },
};

/** Familiengröße + Position eines Abzeichens (für die Metall-Stufe). */
function familieVon(def: AbzeichenDef): { groesse: number; index: number } {
  const fam = ABZEICHEN.filter((b) => b.group === def.group);
  return { groesse: fam.length, index: Math.max(0, fam.findIndex((b) => b.id === def.id)) };
}

/**
 * Metall-Stufe: Steigerungs-Familien Bronze → Silber → Gold → Diamant
 * (die letzte Stufe bleibt bei Diamant, auch bei fünf Mitgliedern). Die
 * fünf Bereichs-Abzeichen und die Geheim-Abzeichen haben keine natürliche
 * Reihenfolge und tragen darum einheitlich Gold.
 */
function metallFuer(def: AbzeichenDef): Metall {
  if (def.group === "Geheim" || def.group === "Bereiche") return "gold";
  const { groesse, index } = familieVon(def);
  const stufen: Metall[] = groesse >= 4 ? ["bronze", "silber", "gold", "diamant"] : ["bronze", "silber", "gold"];
  return stufen[Math.min(index, stufen.length - 1)];
}

/**
 * Die Medaille als Satz für die Sprachausgabe - Metall, Band und Motiv,
 * zusammen unter 120 Zeichen (Braillezeile). Geheim-Abzeichen vor dem
 * Verdienen verraten weder Metall noch Motiv.
 */
export function medaillenSatz(def: AbzeichenDef, geheimVerborgen: boolean): string {
  if (geheimVerborgen) return "Graue Medaille mit grauem Band und einem Fragezeichen.";
  const metall = METALL_WORT[metallFuer(def)];
  const band = BAND_FARBEN[def.group] ?? BAND_FARBEN.Geheim;
  return `${metall} mit ${band.wort} Band, darauf ${def.bildbeschreibung}.`;
}

export interface AbzeichenMedailleProps {
  def: AbzeichenDef;
  /** Verdient? Sonst hängt die Medaille entsättigt da. */
  verdient?: boolean;
  /** Geheim-Abzeichen vor dem Verdienen: graue „?"-Medaille. */
  geheimVerborgen?: boolean;
  /** Höhe in px (Breite ergibt sich aus dem Seitenverhältnis). */
  groesse?: number;
  className?: string;
}

/** Die schlanke Medaille - rein dekorativ, aria-hidden. */
export function AbzeichenMedaille({
  def,
  verdient = true,
  geheimVerborgen = false,
  groesse = 40,
  className,
}: AbzeichenMedailleProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const modus = useContrast((s) => s.mode);
  const kontrast = modus !== "hell" && modus !== "dunkel" ? KONTRAST_MEDAILLE[modus] : null;

  const m = METALL_FARBEN[geheimVerborgen ? "grau" : metallFuer(def)];
  const band = geheimVerborgen ? BAND_VERBORGEN : (BAND_FARBEN[def.group] ?? BAND_FARBEN.Geheim);

  const nichtVerdient = kontrast ? { filter: "opacity(0.55)" } : { filter: "grayscale(0.85) opacity(0.5)" };

  return (
    <svg
      viewBox="0 0 60 76"
      width={Math.round((groesse * 60) / 76)}
      height={groesse}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={verdient ? undefined : nichtVerdient}
    >
      {!kontrast && (
        <defs>
          <radialGradient id={`${uid}-f`} cx="36%" cy="30%" r="80%">
            <stop offset="0%" stopColor={m.hell} />
            <stop offset="100%" stopColor={m.flaeche} />
          </radialGradient>
        </defs>
      )}
      {/* Band (zwei Streifen, V-Form) */}
      <path d="M14 0 L27 0 L30 23 L20 27 Z" fill={kontrast ? kontrast.strich : band.hell} />
      <path
        d="M46 0 L33 0 L30 23 L40 27 Z"
        fill={kontrast ? kontrast.grund : band.dunkel}
        stroke={kontrast ? kontrast.strich : undefined}
        strokeWidth={kontrast ? 1.1 : undefined}
      />
      {/* Medaillon */}
      <circle
        cx="30"
        cy="50"
        r="24"
        fill={kontrast ? kontrast.grund : m.rand}
        stroke={kontrast ? kontrast.strich : m.randDunkel}
        strokeWidth={kontrast ? 1.4 : 1}
      />
      <circle
        cx="30"
        cy="50"
        r="18.5"
        fill={kontrast ? kontrast.grund : `url(#${uid}-f)`}
        stroke={kontrast ? kontrast.strich : m.randDunkel}
        strokeWidth={kontrast ? 1.1 : 0.7}
      />
      {geheimVerborgen ? (
        <text
          x="30"
          y="51"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
          fill={kontrast ? kontrast.strich : m.detail}
        >
          ?
        </text>
      ) : (
        <image
          href={motivBild(def.emoji, !!kontrast)}
          x="18"
          y="38"
          width="24"
          height="24"
          preserveAspectRatio="xMidYMid meet"
          style={
            kontrast
              ? kontrast.invertiert
                ? { filter: "invert(1)" }
                : undefined
              : { filter: `drop-shadow(0 0 1px ${m.randDunkel})` }
          }
        />
      )}
    </svg>
  );
}

// --- Das Regal ---------------------------------------------------------------

function fmtDatum(ts: number): string {
  return new Date(ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export interface AbzeichenRegalProps {
  progress: BrailleProgress;
  /** Die tatsächlich freigeschalteten Bereiche der Klasse (`buildAreas()`/`AREAS`). */
  areas: readonly Area[];
  /** Ich-Perspektive (Kind sieht die eigene Statistik)? Steuert nur die Überschrift. */
  selfView?: boolean;
}

/** Abzeichen-Regal: verdiente Medaillen, die drei nächsten Ziele, Voll-Liste. */
export function AbzeichenRegal({ progress, areas, selfView = true }: AbzeichenRegalProps) {
  const verdient = verdienteAbzeichen(progress);
  const ziele = naechsteZiele(progress, areas);
  const earnedIds = new Set(verdient.map((v) => v.def.id));
  const [alleOffen, setAlleOffen] = useState(false);

  // Familien in Definitions-Reihenfolge gruppieren (wie im Vorbild).
  const gruppen: Array<{ group: string; defs: AbzeichenDef[] }> = [];
  for (const b of ABZEICHEN) {
    const g = gruppen[gruppen.length - 1];
    if (g && g.group === b.group) g.defs.push(b);
    else gruppen.push({ group: b.group, defs: [b] });
  }

  return (
    <div className="space-y-3" data-abzeichen-regal>
      <h3 className="m-0 text-sm font-semibold text-ink">
        {selfView ? "Meine Abzeichen" : "Abzeichen"}{" "}
        <span className="font-normal text-ink-muted">
          ({verdient.length} von {ABZEICHEN.length})
        </span>
      </h3>

      {verdient.length > 0 ? (
        <div className="flex flex-wrap items-start gap-2" role="list" aria-label="Verdiente Abzeichen">
          {verdient.map(({ def, ts }) => (
            <div key={def.id} role="listitem" className="flex w-16 flex-col items-center gap-1 text-center">
              <AbzeichenMedaille def={def} verdient groesse={40} />
              {/* Testerin 19.11.2026 (Tastenflow-Regal): lange Namen („Kettenreaktion") laufen sonst in die
                  Nachbar-Kachel - Silbentrennung (lang nötig), sonst Umbruch an jeder Stelle. */}
              <span
                lang="de"
                data-abzeichen-name
                className="min-w-0 max-w-full text-[11px] leading-tight text-ink-muted [hyphens:auto] [overflow-wrap:anywhere]"
                aria-hidden="true"
              >
                {def.name}
              </span>
              <span className="sr-only">
                {def.name}: {def.description} {medaillenSatz(def, false)} Verdient am {fmtDatum(ts)}.
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 text-sm text-ink-muted">
          {selfView
            ? "Noch keine Abzeichen - schon die erste Etappe bringt dir eines!"
            : "Noch keine Abzeichen - die erste gemeisterte Etappe bringt das erste."}
        </p>
      )}

      {ziele.length > 0 && (
        <div className="space-y-1" role="list" aria-label="Nächste Ziele">
          <h4 className="m-0 text-sm font-semibold text-ink-muted">Nächste Ziele</h4>
          {ziele.map((z) => (
            <p key={z.def.id} role="listitem" className="m-0 flex items-center gap-1.5 text-sm text-ink-soft">
              <AbzeichenMedaille def={z.def} verdient={false} groesse={26} />
              <span>
                <span className="font-medium text-ink-muted">Nächstes Ziel:</span> <strong>{z.def.name}</strong> -{" "}
                {z.einheit}: {Math.min(z.hat, z.braucht)} von {z.braucht}
              </span>
            </p>
          ))}
        </div>
      )}

      <div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md text-left text-sm font-semibold text-ink-soft"
          aria-expanded={alleOffen}
          onClick={() => setAlleOffen((o) => !o)}
        >
          <span aria-hidden="true">{alleOffen ? "▾" : "▸"}</span>
          Alle Abzeichen anzeigen
        </button>
        {/* Bewegung beim Aufklappen wie im Vorbild: der Rest rutscht mit. */}
        <Aufklappen offen={alleOffen}>
          <div className="mt-1.5 space-y-2">
            {gruppen.map((g) => (
              <div key={g.group}>
                <h4 className="m-0 mb-1 text-sm font-semibold text-ink-muted">
                  {g.group}{" "}
                  <span className="font-normal">
                    ({g.defs.filter((b) => earnedIds.has(b.id)).length} von {g.defs.length})
                  </span>
                </h4>
                <ul className="m-0 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2">
                  {g.defs.map((b) => {
                    const hat = earnedIds.has(b.id);
                    const verborgen = !!b.secret && !hat;
                    return (
                      <li
                        key={b.id}
                        className={
                          "flex items-center gap-2 rounded-lg border px-2 py-1 text-sm " +
                          (hat
                            ? "border-accent bg-accent-soft text-ink"
                            : "border-hairline bg-surface-sunken text-ink-muted")
                        }
                      >
                        <AbzeichenMedaille def={b} verdient={hat} geheimVerborgen={verborgen} groesse={30} />
                        <span>
                          <strong>{verborgen ? "???" : b.name}</strong>
                          {" - "}
                          {verborgen ? "Ein Geheim-Abzeichen. Finde selbst heraus, wie es zu holen ist!" : b.description}
                          <span className="sr-only">
                            {" "}
                            {medaillenSatz(b, verborgen)} {hat ? "(verdient)" : "(noch nicht verdient)"}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Aufklappen>
      </div>
    </div>
  );
}
