/// <reference lib="webworker" />
/**
 * liblouis Web-Worker (P3.5-Spike).
 * Eigene cwrap-Bindings auf LGPL-Core — KEIN GPL-JS-Wrapper.
 *
 * Architektur: Main-Thread → Worker (über liblouis.ts-Proxy).
 * Tabellen werden build-time als ?raw-Imports gebündelt und boot-time
 * in MEMFS geschrieben (kein enableOnDemandTableLoading, kein XHR).
 */
import type { LouRequest, LouResponse, LouTable } from "./liblouis.types";
import liblouisModule from "./vendor/liblouis-no-deps.mjs";

// ─── Konstanten ────────────────────────────────────────────────────────────
const WIDECHAR_BITS = 32; // utf32-Build: HEAPU32 + String.fromCodePoint
const BYTES_PER_WCHAR = WIDECHAR_BITS / 8; // 4

/** Whitelist: LouTable → MEMFS-Pfad (Pfad-Sanitizing per Whitelist).
 *  unicode.dis MUSS als erste Datei stehen (First-Wins bei Display-Definitionen).
 *  Ohne Präfix liefert de-eurobrl6.dis Eurobraille-ASCII statt U+2800-Block. */
const TABLE_PATH: Record<LouTable, string> = {
  "de-g0":     "/tables/unicode.dis,/tables/de-g0.utb",
  "de-g1":     "/tables/unicode.dis,/tables/de-g1.ctb",
  "de-g2":     "/tables/unicode.dis,/tables/de-g2.ctb",
  "de-comp8":  "/tables/unicode.dis,/tables/de-de-comp8.ctb",
  "en-ueb-g1": "/tables/unicode.dis,/tables/en-ueb-g1.ctb",
  "en-ueb-g2": "/tables/unicode.dis,/tables/en-ueb-g2.ctb",
  // Welle 1 der Sprachen-Apps: liblouis 3.39.0 in eigenem Ordner (/tables39),
  // damit die 3.38-Dateien von Deutsch/UEB unberührt bleiben.
  "fr-bfu-comp6": "/tables39/unicode.dis,/tables39/fr-bfu-comp6.utb",
  "es-g1":        "/tables39/unicode.dis,/tables39/es-g1.ctb",
  "it-it-comp6":  "/tables39/unicode.dis,/tables39/it-it-comp6.utb",
  "sv-g0":        "/tables39/unicode.dis,/tables39/sv-g0.utb",
  "nl-NL-g0":     "/tables39/unicode.dis,/tables39/nl-NL-g0.utb",
  "pt-pt-g1":     "/tables39/unicode.dis,/tables39/pt-pt-g1.utb",
};

// ─── Tabellen-Imports (build-time gebündelt als raw strings) ────────────────
// de-g2 + alle transitiven Includes (15 Dateien, Spike: nur de-g2-Kette)
import unicodeDis from "./vendor/tables/unicode.dis?raw";
import deG2 from "./vendor/tables/de-g2.ctb?raw";
import deG0 from "./vendor/tables/de-g0.utb?raw";
import deEurobrl6 from "./vendor/tables/de-eurobrl6.dis?raw";
import deChardefs6 from "./vendor/tables/de-chardefs6.cti?raw";
import spaces from "./vendor/tables/spaces.uti?raw";
import digits6 from "./vendor/tables/digits6DotsPlusDot6.uti?raw";
import latinLetterDef from "./vendor/tables/latinLetterDef6Dots.uti?raw";
import deAccents from "./vendor/tables/de-accents.cti?raw";
import deG0core from "./vendor/tables/de-g0-core.uti?raw";
import litDigits from "./vendor/tables/litdigits6Dots.uti?raw";
import countries from "./vendor/tables/countries.cti?raw";
import latinLower from "./vendor/tables/latinLowercase.uti?raw";
import deG2core from "./vendor/tables/de-g2-core.cti?raw";
import deG2corePatterns from "./vendor/tables/de-g2-core-patterns.dic?raw";
// de-g1 (Vollschrift): bis 20.09.2026 fehlten diese drei Dateien - die Tabelle
// war im TABLE_PATH eingetragen, aber nie eingebunden, also schlug jeder
// de-g1-Aufruf fehl und die Vollschrift lief ungeprueft auf dem Eigenbau.
import deG1 from "./vendor/tables/de-g1.ctb?raw";
import deG1core from "./vendor/tables/de-g1-core.cti?raw";
import deG1corePatterns from "./vendor/tables/de-g1-core-patterns.dic?raw";
import braillePatterns from "./vendor/tables/braille-patterns.cti?raw";
// UEB Grade 2 (P5): en-ueb-g2.ctb + transitive Includes (6 Dateien)
import uebG2 from "./vendor/tables/en-ueb-g2.ctb?raw";
import uebG1 from "./vendor/tables/en-ueb-g1.ctb?raw";
import uebChardefs from "./vendor/tables/en-ueb-chardefs.uti?raw";
import uebMath from "./vendor/tables/en-ueb-math.ctb?raw";
import textNabcc from "./vendor/tables/text_nabcc.dis?raw";
import latinUppercomp6 from "./vendor/tables/latinUppercaseComp6.uti?raw";

/** Alle bekannten Tabellen-Dateien: Dateiname → Inhalt. */
const TABLE_FILES: Record<string, string> = {
  "unicode.dis":            unicodeDis,
  "de-g2.ctb":              deG2,
  "de-g0.utb":              deG0,
  "de-eurobrl6.dis":        deEurobrl6,
  "de-chardefs6.cti":       deChardefs6,
  "spaces.uti":             spaces,
  "digits6DotsPlusDot6.uti": digits6,
  "latinLetterDef6Dots.uti": latinLetterDef,
  "de-accents.cti":         deAccents,
  "de-g0-core.uti":         deG0core,
  "litdigits6Dots.uti":     litDigits,
  "countries.cti":           countries,
  "latinLowercase.uti":     latinLower,
  "de-g2-core.cti":         deG2core,
  "de-g2-core-patterns.dic": deG2corePatterns,
  "de-g1.ctb":              deG1,
  "de-g1-core.cti":         deG1core,
  "de-g1-core-patterns.dic": deG1corePatterns,
  "braille-patterns.cti":   braillePatterns,
  // P5 — UEB
  "en-ueb-g2.ctb":            uebG2,
  "en-ueb-g1.ctb":            uebG1,
  "en-ueb-chardefs.uti":      uebChardefs,
  "en-ueb-math.ctb":          uebMath,
  "text_nabcc.dis":           textNabcc,
  "latinUppercaseComp6.uti":  latinUppercomp6,
};

// liblouis 3.39.0 (Welle 1): alle Dateien aus ./vendor/tables39, build-time
// gebündelt (Vite-Glob statt 24 einzelner Imports).
const TABLES_39 = import.meta.glob("./vendor/tables39/*.{ctb,utb,uti,cti,dis,dic}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// ─── Zustand ────────────────────────────────────────────────────────────────
let initialized = false;
let louVersion = "unknown";

// ─── Initialisierung ────────────────────────────────────────────────────────
function initLiblouis(): string {
  if (initialized) return louVersion;

  // Tabellen-Verzeichnis in MEMFS anlegen und alle Dateien schreiben
  liblouisModule.FS.mkdir("/tables");
  for (const [name, content] of Object.entries(TABLE_FILES)) {
    liblouisModule.FS.writeFile(`/tables/${name}`, content, { encoding: "utf8" });
  }

  // 3.39-Tabellen (Welle 1) in eigenen Ordner
  liblouisModule.FS.mkdir("/tables39");
  for (const [pfad, content] of Object.entries(TABLES_39)) {
    liblouisModule.FS.writeFile(`/tables39/${pfad.split("/").pop()}`, content, { encoding: "utf8" });
  }

  // liblouis-Version abfragen (beweist, dass ccall funktioniert)
  louVersion = liblouisModule.ccall("lou_version", "string", [], []) as string;
  initialized = true;
  return louVersion;
}

// ─── Übersetzungs-Kern (cwrap-Bindings, eigene Puffer-Verwaltung) ────────────
/**
 * Übersetzt `text` mit der angegebenen Tabelle via lou_translateString.
 * Widechar-Breite: utf32 (HEAPU32 + String.fromCodePoint).
 *
 * C-Signatur:
 *   int lou_translateString(const char *tableList,
 *                           const widechar *inbuf, int *inlen,
 *                           widechar *outbuf,      int *outlen,
 *                           formtype *typeform, char *spacing, int mode)
 */
function louTranslateImpl(tableList: string, text: string): string {
  const mod = liblouisModule;
  const inLen = text.length;
  const maxOutLen = Math.max(inLen * 3, 64); // Braille kann länger als Input sein

  // Speicher allokieren
  const pInLen = mod._malloc(4);
  const pOutLen = mod._malloc(4);
  const pInBuf = mod._malloc((inLen + 1) * BYTES_PER_WCHAR);
  const pOutBuf = mod._malloc((maxOutLen + 1) * BYTES_PER_WCHAR);

  try {
    // Längen setzen
    mod.HEAP32[pInLen >> 2] = inLen;
    mod.HEAP32[pOutLen >> 2] = maxOutLen;

    // Text als UTF-32 in den Input-Puffer schreiben
    for (let i = 0; i < inLen; i++) {
      mod.HEAPU32[(pInBuf >> 2) + i] = text.codePointAt(i) ?? 0;
    }
    mod.HEAPU32[(pInBuf >> 2) + inLen] = 0; // Null-Terminator

    // lou_translateString aufrufen (LGPL-Kern)
    const ret = mod.ccall(
      "lou_translateString",
      "number",
      ["string", "number", "number", "number", "number", "number", "number", "number"],
      [tableList, pInBuf, pInLen, pOutBuf, pOutLen, 0, 0, 0],
    ) as number;

    if (ret === 0) {
      throw new Error(`lou_translateString returned 0 (Fehler) für Tabelle ${tableList}`);
    }

    // Ausgabe-Länge lesen
    const outLen = mod.HEAP32[pOutLen >> 2];

    // Braille als UTF-32 → String lesen (U+2800-Block)
    let braille = "";
    for (let i = 0; i < outLen; i++) {
      braille += String.fromCodePoint(mod.HEAPU32[(pOutBuf >> 2) + i]);
    }
    return braille;
  } finally {
    mod._free(pInLen);
    mod._free(pOutLen);
    mod._free(pInBuf);
    mod._free(pOutBuf);
  }
}

// ─── Worker-Message-Handler ─────────────────────────────────────────────────
function post(r: LouResponse): void {
  (self as unknown as Worker).postMessage(r);
}

self.onmessage = (ev: MessageEvent<LouRequest>) => {
  const req = ev.data;
  try {
    if (req.kind === "init") {
      const version = initLiblouis();
      post({ id: req.id, kind: "ready", version });

    } else if (req.kind === "translate") {
      if (!initialized) initLiblouis();
      // Pfad-Sanitizing via Whitelist (kein freier String vom Aufrufer)
      const path = TABLE_PATH[req.table];
      if (!path) {
        post({ id: req.id, kind: "error", message: `Unbekannte Tabelle: ${req.table}` });
        return;
      }
      const braille = louTranslateImpl(path, req.text);
      post({ id: req.id, kind: "translated", braille });

    } else if (req.kind === "version") {
      if (!initialized) initLiblouis();
      post({ id: req.id, kind: "version", version: louVersion });
    }
  } catch (e) {
    post({ id: req.id, kind: "error", message: String((e as Error).message ?? e) });
  }
};
