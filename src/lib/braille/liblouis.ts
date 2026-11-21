/**
 * Main-Thread-Proxy für den liblouis Web-Worker (P3.5).
 * Eigene cwrap-Bindings auf LGPL-Core — KEIN GPL-JS-Wrapper im Bundle.
 *
 * Lizenz-Garantie: Der Worker importiert nur das Emscripten-Glue (MIT/NCSA)
 * + die LGPL-WASM/asm.js-Bibliothek. Der GPL-3.0-Wrapper (liblouis-js Easy-API)
 * ist weder im Worker noch im Main-Thread. CLI-Tools (GPLv3+) nur build-/test-time.
 */
import type { LouRequest, LouResponse, LouTable } from "./liblouis.types";
import { cellsToUnicode, textToCells } from "./engine";
import type { BrailleSystem } from "./tables";
import KURZ_CELLS from "./generated/kurz-cells.generated.json";
import { tabelleFuer } from "./sprachen/register";

// ─── Vorgerechnete Aufgaben ─────────────────────────────────────────────────
/**
 * ★ Alle Aufgaben, die Punktgenau selbst stellt, sind beim Bauen schon
 * übersetzt: 1.540 in Kurzschrift (de-g2), 515 in UEB (en-ueb-g2).
 * Erzeugen: `npm run kurz:cells` · Wächter: `npm run kurz:check`.
 *
 * Warum (Befund 20.09.2026): Die Lösung kam bis dahin bei JEDER Aufgabe aus dem
 * liblouis-Worker. Der liegt in einem Nachlade-Paket (408 KB gepackt) und kann
 * scheitern - nach einem Deploy heißen die Paketdateien anders, auf einem
 * langsamen Gerät greift die 8-Sekunden-Grenze, ein Worker kann gar nicht
 * starten. Gemessen: fiel er aus, bekam das Kind in 294 von 294 geprüften
 * Kurzschrift-Aufgaben VOLLSCHRIFT vorgesetzt („das" als ⠙⠁⠎ statt ⠙).
 *
 * Die Tabelle stammt aus derselben liblouis-Quelle - an der Richtigkeit ändert
 * sich also nichts, nur daran, WANN gerechnet wird. liblouis bleibt für freien
 * Text (eigene Übung der Lehrkraft) und wird dafür weiter nachgeladen.
 */
const VORGERECHNET: Partial<Record<LouTable, Record<string, string>>> = {
  "de-g2": KURZ_CELLS.de_g2,
  "en-ueb-g2": KURZ_CELLS.en_ueb_g2,
};

/** Fertige Übersetzung aus der Tabelle - oder null, wenn der Text frei ist. */
export function vorgerechnet(text: string, table: LouTable): string | null {
  return VORGERECHNET[table]?.[text] ?? null;
}

/**
 * Stehen ALLE diese Aufgaben schon in der Tabelle? Dann braucht dieses Level
 * den liblouis-Worker gar nicht und muss ihn auch nicht vorladen.
 */
export function alleVorgerechnet(items: readonly string[], table: LouTable): boolean {
  return items.every((i) => vorgerechnet(i, table) !== null);
}

// ─── Konstanten ─────────────────────────────────────────────────────────────
/** Gepinnte liblouis-Version / js-build HEAD 0ae2413 (asm.js utf32, 3.38.0). */
export const LIBLOUIS_VERSION = "3.38.0-jsb-HEAD-0ae2413";

/** Timeout je translate/init-Request; danach reject + Eigenbau-Fallback. */
export const LIBLOUIS_TIMEOUT_MS = 8000;

// ─── Interne Proxy-Mechanik ──────────────────────────────────────────────────
let singleton: Promise<LiblouisHandle> | null = null;
let worker: Worker | null = null;
let seq = 0;
const pending = new Map<
  number,
  { resolve: (v: LouResponse) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }
>();

function postToWorker(req: LouRequest): Promise<LouResponse> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(req.id);
      reject(new Error(`liblouis timeout nach ${LIBLOUIS_TIMEOUT_MS}ms (kind=${req.kind})`));
    }, LIBLOUIS_TIMEOUT_MS);
    pending.set(req.id, { resolve, reject, timer });
    worker!.postMessage(req);
  });
}

function handleWorkerMessage(ev: MessageEvent<LouResponse>) {
  const r = ev.data;
  const entry = pending.get(r.id);
  if (!entry) return;
  pending.delete(r.id);
  clearTimeout(entry.timer);
  if (r.kind === "error") {
    entry.reject(new Error(r.message));
  } else {
    entry.resolve(r);
  }
}

// ─── Öffentliche API ─────────────────────────────────────────────────────────
export interface LiblouisHandle {
  /** Text → Braille-Unicode (U+2800-Block). Einzige Prüf-/Lösungsquelle. */
  translate(text: string, table: LouTable): Promise<string>;
  /** liblouis-Version (für Diagnose/Telemetrie). */
  version(): Promise<string>;
  /** true, sobald `ready` empfangen wurde. */
  readonly isReady: boolean;
}

/**
 * Lädt (lazy) den Worker + asm.js und initialisiert liblouis.
 * Mehrfachaufruf = derselbe Promise (Singleton).
 * Wirft NIE synchron; Fehler landen im Promise.
 */
export function loadLiblouis(): Promise<LiblouisHandle> {
  if (singleton) return singleton;

  singleton = (async (): Promise<LiblouisHandle> => {
    // Vite-Worker-Import: eigene Datei, kein externer URL
    worker = new Worker(new URL("./liblouis.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = handleWorkerMessage;
    worker.onerror = (ev) => {
      // Worker-Boot-Fehler: alle pending requests rejecten
      for (const entry of pending.values()) {
        clearTimeout(entry.timer);
        entry.reject(new Error(`liblouis Worker-Fehler: ${ev.message}`));
      }
      pending.clear();
      singleton = null;
      worker = null;
    };

    let ready = false;
    const id = ++seq;
    const resp = await postToWorker({ id, kind: "init" });
    if (resp.kind !== "ready") {
      throw new Error("liblouis init: unerwartete Antwort");
    }
    ready = true;

    const handle: LiblouisHandle = {
      get isReady() { return ready; },

      async translate(text: string, table: LouTable): Promise<string> {
        const r = await postToWorker({ id: ++seq, kind: "translate", text, table });
        if (r.kind !== "translated") throw new Error("Unexpected response: " + r.kind);
        return r.braille;
      },

      async version(): Promise<string> {
        const r = await postToWorker({ id: ++seq, kind: "version" });
        if (r.kind !== "version") throw new Error("Unexpected response: " + r.kind);
        return r.version;
      },
    };
    return handle;
  })();

  // Bei Fehler Singleton zurücksetzen, damit Retry möglich
  singleton.catch(() => { singleton = null; });
  return singleton;
}

/** True, wenn der Worker schon geladen ist. */
export function liblouisLoaded(): boolean {
  return singleton !== null && worker !== null;
}

/** Teardown (Tab-Wechsel / Tests). Nächstes loadLiblouis() bootet neu. */
export function disposeLiblouis(): void {
  worker?.terminate();
  worker = null;
  singleton = null;
  for (const entry of pending.values()) {
    clearTimeout(entry.timer);
    entry.reject(new Error("liblouis disposed"));
  }
  pending.clear();
}

// ─── Engine-Integration ──────────────────────────────────────────────────────

// Seit 06.11.2026 aus dem Register der Sprachen gelesen (sprachen/register.ts) -
// dieselben Tabellen wie vorher: voll → de-g1, computer → de-comp8.
const SYSTEM_TO_TABLE: Partial<Record<BrailleSystem, LouTable>> = {
  voll:     tabelleFuer("de", "voll") ?? "de-g1",
  computer: tabelleFuer("de", "computer") ?? "de-comp8",
};

/**
 * Liefert die liblouis-Soll-Lösung für das gegebene Text-Item im Worker.
 * Gibt null zurück bei Fehler/Timeout (→ Eigenbau-Fallback, kein Crash).
 * `basis` verwendet nie liblouis (Eigenbau `engine.ts` ist maßgeblich).
 */
export async function solveTarget(
  text: string,
  system: BrailleSystem,
): Promise<string | null> {
  const table = SYSTEM_TO_TABLE[system];
  if (!table) return null; // basis: Eigenbau zuständig

  try {
    const handle = await loadLiblouis();
    return await handle.translate(text, table);
  } catch {
    return null; // Degradation: Eigenbau-Fallback, kein Throw
  }
}

/**
 * Kurzschrift-Übersetzung via de-g2 (P4).
 * Gibt null zurück bei Fehler/Timeout.
 */
export async function solveKurz(text: string): Promise<string | null> {
  const fertig = vorgerechnet(text, "de-g2");
  if (fertig !== null) return fertig; // kein Worker, kein Nachladen, keine Wartezeit
  try {
    const handle = await loadLiblouis();
    return await handle.translate(text, "de-g2");
  } catch {
    return null;
  }
}

// ─── P4-Kanonische API (Modul-Spec II.8 §2) ──────────────────────────────────
// Diese drei Funktionen sind die in der P4-Spec festgelegten Namen. Sie sind
// dünne Aliase auf die P3.5-Proxy-Mechanik (loadLiblouis/translate) und werfen
// — bewusst — bei echtem Fehler, damit der Aufrufer Lade-/Übersetzungsfehler
// unterscheiden kann (anders als das tolerante solveKurz, das null liefert).

/**
 * Lädt WASM+Tabellen einmal, idempotent (Worker-Singleton). Wird beim Betreten
 * der ERSTEN Kurzschrift-Welt (K1) aufgerufen — vorher bleibt das Bundle leer
 * (lazy, Akzeptanzkriterium §6.6). Wirft, wenn der Worker nicht startet.
 */
export async function ensureLouLoaded(): Promise<void> {
  await loadLiblouis();
}

/** Tabellen-Kennungen, die `toBraille` annimmt (inkl. liblouis-Dateialias). */
export type ToBrailleTable = "de-g2" | "de-g1" | "de-comp8" | "de-de-comp8";

function normalizeTable(table: ToBrailleTable): LouTable {
  return table === "de-de-comp8" ? "de-comp8" : table;
}

/**
 * Text → Unicode-Braille (U+2800-Block) über die angegebene Tabelle.
 * EINZIGE Prüfrichtung der Kurzschrift (Stellungsregeln laufen unsichtbar in
 * liblouis). Wirft bei Worker-/Übersetzungsfehler (kein stilles null —
 * der Kurzschrift-Generator behandelt das mit Retry/Fallback).
 */
export async function toBraille(text: string, table: ToBrailleTable): Promise<string> {
  const ziel = normalizeTable(table);
  const fertig = vorgerechnet(text, ziel);
  if (fertig !== null) return fertig;
  const handle = await loadLiblouis();
  return handle.translate(text, ziel);
}

/**
 * UEB Grade 2 Übersetzung via en-ueb-g2 (P5).
 * Gibt null zurück bei Fehler/Timeout.
 */
export async function solveUeb(text: string): Promise<string | null> {
  const fertig = vorgerechnet(text, "en-ueb-g2");
  if (fertig !== null) return fertig;
  try {
    const handle = await loadLiblouis();
    return await handle.translate(text, "en-ueb-g2");
  } catch {
    return null;
  }
}

/**
 * Rückübersetzung Braille→Text — NUR als Lern-Feedback-Anzeige, NIE als
 * richtig/falsch-Instanz. de-g2-Rückübersetzung ist laut Tabellen-Kommentar
 * mehrdeutig; deshalb gibt es bislang keine Back-Translation im Worker und wir
 * liefern den Soll-Text durchgereicht zurück (Platzhalter-Feedback). Die
 * Signatur ist stabil, damit eine spätere echte Back-Translation andocken kann.
 */
export async function explainBack(brl: string, _table: "de-g2"): Promise<string> {
  // Bewusst keine echte Rückübersetzung (mehrdeutig, nie Gate). Der Aufrufer
  // zeigt diesen Text als „so könnte man das auch lesen" — Feedback, kein Urteil.
  return brl;
}

// ─── Rückwärtskompatibilität (P2-Stub-Schnittstelle) ─────────────────────────

/** Lazy-Init: lädt den Worker einmalig. No-op, wenn schon geladen. */
export async function ensureLiblouis(): Promise<void> {
  await loadLiblouis().catch(() => { /* Degradation: still OK */ });
}

/**
 * Text → Braille-Unicode via liblouis de-g1 (Worker).
 * Gibt null zurück, wenn Worker/Tabelle nicht verfügbar.
 */
export async function liblouisTranslate(text: string): Promise<string | null> {
  return solveTarget(text, "voll");
}

/**
 * Vergleicht Eigenbau (engine.transcribe → Unicode) mit liblouis de-g1.
 * `agree: true` wenn louis === null (kein Urteil) ODER beide übereinstimmen.
 * Nie Gate für Sterne/Mastery — nur stilles Telemetrie-/Lern-Feedback.
 */
export async function crossCheckVoll(
  text: string,
): Promise<{ agree: boolean; ours: string; louis: string | null }> {
  const ours = cellsToUnicode(textToCells(text, { system: "voll" }));
  const louis = await liblouisTranslate(text);
  const agree = louis === null || ours === louis;
  return { agree, ours, louis };
}
