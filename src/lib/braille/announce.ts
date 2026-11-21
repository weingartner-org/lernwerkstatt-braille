/**
 * Braille-Trainer — ARIA-Live-Mapping (Bauvertrag §0 Datei-Konvention).
 * Reine, React-freie Funktionen: Ereignis → { channel, text }.
 * Ansprache durchgängig „Du" (Kinder). Eigene Merksätze — kein BSKDL/KFA-Zitat.
 * Nutzt cellDots/dotsLabel aus cell.ts; testbar ohne DOM.
 */
import { altAnzeige, istMacSystem } from "@/lib/altTaste";
import { BLANK, type Cell } from "./cell";
import { DOT_POSITION, cellDiff, cellToUnicode, dotsLabel } from "./cell";
import { mitZeichenNamen } from "./zeichenSprechen";
import { pgTexte } from "./sprachen/pg";
import { lehrSprache, type LehrSprache } from "./sprachen/aktuell";

/** Live-Region, in die ein Text geschrieben wird. */
export type AnnounceChannel = "task" | "status" | "alert";

export interface AnnouncePayload {
  channel: AnnounceChannel;
  text: string;
  /**
   * Echte Unicode-Braillezeichen (U+2800-Block), die NUR in die Live-Region
   * gehören: eine Braillezeile zeigt sie als tastbares Punktmuster, die eigene
   * Sprachausgabe soll sie NICHT mitsprechen.
   */
  brailleText?: string;
  /** Inhaltssprache (UEB = "en") — steuert Stimme + lang-Attribut der Region. */
  lang?: "de" | "en" | LehrSprache;
  /**
   * false = nur Live-Region, KEIN Self-Voicing. Für Lese-Aufgaben: dort spricht
   * das Panel selbst die komplette Sequenz (Anweisung + Zellen) — spräche
   * zusätzlich speakUi, würde dessen cancel() die Zell-Warteschlange abwürgen.
   */
  voice?: boolean;
  /**
   * Was die eigene Sprachausgabe sagt, wenn es vom Text abweicht - z. B. jedes
   * Satz- und Sonderzeichen beim Namen („Toll Ausrufezeichen"), während die
   * Live-Region und damit die Braillezeile „Toll!" bekommt (07.10.2026).
   */
  spoken?: string;
}

/** E1 — neue Aufgabe. `direction` steuert Schreiben/Lesen. */
export function announceTask(
  prompt: string,
  direction: "write" | "read",
  lang?: "de" | "en",
): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) {
    return {
      channel: "task",
      text: direction === "write" ? prompt : fr.announce.lesenAufgabe,
      ...(direction === "write" ? { spoken: mitZeichenNamen(prompt, lehrSprache()) } : {}),
      lang: lehrSprache(),
      voice: direction === "write",
    };
  }
  if (lang === "en") {
    return {
      channel: "task",
      // Schreiben: nur den Ausdruck selbst ansagen/vorlesen (kein „Write:").
      text: direction === "write" ? prompt : "Read and type the word.",
      ...(direction === "write" ? { spoken: mitZeichenNamen(prompt, "en") } : {}),
      lang,
      // Lesen: das Panel spricht Anweisung + Zellen selbst als EINE Sequenz.
      voice: direction === "write",
    };
  }
  return {
    channel: "task",
    // Schreiben: nur den Ausdruck selbst ansagen/vorlesen (kein „Schreib:").
    text: direction === "write" ? prompt : "Lies und tippe das Wort.",
    // ★ Jedes Zeichen wird vorgelesen (Johannes 07.10.2026) - siehe zeichenSprechen.ts.
    ...(direction === "write" ? { spoken: mitZeichenNamen(prompt, "de") } : {}),
    lang,
    voice: direction === "write",
  };
}

/** E2 — richtig. */
export function announceCorrect(lang?: "de" | "en"): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) return { channel: "status", text: fr.announce.richtig, lang: lehrSprache() };
  return { channel: "status", text: lang === "en" ? "Correct." : "Richtig." };
}

/**
 * E3 — falsch. KEIN Wort-Urteil („falsch"/„richtig") — das übernimmt der Sound.
 * Beim Schreiben wird NUR die richtige (Soll-)Zelle als PUNKTE angesagt
 * (z. B. „Punkte 1, 2, 4") — keine Tastenbuchstaben, in allen Schriftsystemen.
 * Beim Lesen wird nur das richtige Wort genannt.
 */
export function announceWrong(opts: {
  direction: "write" | "read";
  prompt: string;
  typedCell?: Cell;
  targetCell?: Cell;
  lang?: "de" | "en";
  /** Fehler-Tipp (abschaltbar): zusätzlich sagen, welcher Punkt fehlt bzw.
   *  zu viel ist — bei genau EINEM Punkt mit Lage („oben links"). */
  verbose?: boolean;
}): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !opts.lang) {
    if (opts.direction === "read") {
      return { channel: "alert", text: opts.prompt, spoken: mitZeichenNamen(opts.prompt, lehrSprache()), lang: lehrSprache() };
    }
    if (opts.targetCell === undefined) return { channel: "alert", text: "" };
    if (opts.targetCell === BLANK) return { channel: "alert", text: fr.announce.leertaste, lang: lehrSprache() };
    let text = dotsLabel(opts.targetCell);
    if (opts.verbose && opts.typedCell !== undefined && opts.typedCell !== BLANK && opts.typedCell !== opts.targetCell) {
      const { missing, extra } = cellDiff(opts.targetCell, opts.typedCell);
      text += fr.announce.unterschied(missing, extra);
    }
    return { channel: "alert", text, brailleText: cellToUnicode(opts.targetCell), lang: lehrSprache() };
  }
  if (opts.direction === "read") {
    return {
      channel: "alert",
      text: opts.prompt,
      spoken: mitZeichenNamen(opts.prompt, opts.lang ?? "de"),
      lang: opts.lang,
    };
  }
  if (opts.targetCell === undefined) {
    return { channel: "alert", text: "" };
  }
  // Soll ist ein Leerzeichen → „Leertaste" statt des kryptischen „leere Zelle".
  if (opts.targetCell === BLANK) {
    return {
      channel: "alert",
      text: opts.lang === "en" ? "Space bar." : "Leertaste.",
    };
  }
  let text = dotsLabel(opts.targetCell);
  if (
    opts.verbose &&
    opts.typedCell !== undefined &&
    opts.typedCell !== BLANK &&
    opts.typedCell !== opts.targetCell
  ) {
    const { missing, extra } = cellDiff(opts.targetCell, opts.typedCell);
    // So kurz wie sinnvoll: bei genau einem Unterschieds-Punkt die Lage dazu
    // (der Lern-Kick); bei mehreren nur die Nummern.
    if (missing.length === 1 && extra.length === 0) {
      text += `. Es fehlt Punkt ${missing[0]} — ${DOT_POSITION[missing[0]]}.`;
    } else if (extra.length === 1 && missing.length === 0) {
      text += `. Punkt ${extra[0]} — ${DOT_POSITION[extra[0]]} — ist zu viel.`;
    } else if (missing.length || extra.length) {
      const parts: string[] = [];
      if (missing.length)
        parts.push(
          missing.length === 1
            ? `es fehlt Punkt ${missing[0]}`
            : `es fehlen die Punkte ${missing.join(", ")}`,
        );
      if (extra.length)
        parts.push(
          extra.length === 1
            ? `Punkt ${extra[0]} ist zu viel`
            : `die Punkte ${extra.join(", ")} sind zu viel`,
        );
      const hint = parts.join(" und ");
      text += `. ${hint.charAt(0).toUpperCase()}${hint.slice(1)}.`;
    }
  }
  return {
    channel: "alert",
    text,
    // Das ECHTE Zeichen zusätzlich auf die Braillezeile (tastbar) — nur in
    // die Live-Region, nicht in die Sprachausgabe.
    brailleText: cellToUnicode(opts.targetCell),
  };
}

/** E4 — Stern (P0b ruft es). */
export function announceStar(stars: number, lang?: "de" | "en"): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) return { channel: "status", text: fr.announce.stern(stars), lang: lehrSprache() };
  return {
    channel: "status",
    text: lang === "en"
      ? `One more star — ${stars} of 3.`
      : `Ein Stern dazu — ${stars} von 3.`,
  };
}

/** E5 — Tempo/Jingle (P0b). */
export function announceFaster(lang?: "de" | "en"): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) return { channel: "status", text: fr.announce.schneller, lang: lehrSprache() };
  return {
    channel: "status",
    text: lang === "en" ? "You're getting faster." : "Du wirst schneller.",
  };
}

/** E6 — Freischaltung. `unlockedTitle` = Level/Etappen-Titel. */
export function announceUnlock(unlockedTitle: string, lang?: "de" | "en"): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) return { channel: "alert", text: fr.announce.freischaltung(unlockedTitle), lang: lehrSprache() };
  return {
    channel: "alert",
    text: lang === "en"
      ? `Done! New world unlocked: ${unlockedTitle}.`
      : `Geschafft! Neue Tür offen: ${unlockedTitle}.`,
  };
}

/** E7 — Level/Etappe fertig. `nextTitle` = was jetzt frei ist (hörbar machen,
 *  sonst erfahren reine Vorlesen-Nutzer die Freischaltung nie). */
export function announceLevelDone(
  stars: number,
  lang?: "de" | "en",
  nextTitle?: string,
): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) return { channel: "status", text: fr.announce.levelDone(stars, nextTitle), lang: lehrSprache() };
  if (lang === "en") {
    return {
      channel: "status",
      text:
        `World complete. ${stars} of 3 stars.` +
        (nextTitle ? ` Next up: ${nextTitle}.` : ""),
    };
  }
  return {
    channel: "status",
    text:
      `Geschafft! ${stars} von 3 Sternen.` +
      // „Als Nächstes" statt „Jetzt frei": bei Klassen mit freier Etappenwahl
      // war nichts gesperrt — die Formulierung stimmt in beiden Modi (K17,
      // gleiche Änderung wie in Klangpunkte am 09.07.).
      (nextTitle ? ` Als Nächstes: ${nextTitle}.` : ""),
  };
}

/** E8 — Text fertig. */
export function announceTextDone(mistakes: number, lang?: "de" | "en"): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) return { channel: "status", text: fr.announce.textDone(mistakes), lang: lehrSprache() };
  if (lang === "en") {
    return {
      channel: "status",
      text: mistakes === 0 ? "Text complete. No mistakes!" : `Text complete. ${mistakes} mistake(s).`,
    };
  }
  return {
    channel: "status",
    text: mistakes === 0 ? "Text geschafft. Fehlerfrei." : `Text geschafft. ${mistakes} Fehler.`,
  };
}

/** E9 — Hilfe: aktuelle Zelle als Tasten + Punkte (Umschalt-Hint, hörbar). */
export function announceCellHint(
  targetCell: Cell,
  keyLabels: string[],
  lang?: "de" | "en",
): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) {
    return { channel: "status", text: fr.announce.cellHint(keyLabels.join(` ${fr.announce.und} `), dotsLabel(targetCell)), lang: lehrSprache() };
  }
  const keys = keyLabels.join(lang === "en" ? " and " : " und ");
  return {
    channel: "status",
    text: lang === "en"
      ? `Current cell: ${keys}. ${dotsLabel(targetCell)}.`
      : `Aktuelle Zelle: ${keys}. ${dotsLabel(targetCell)}.`,
  };
}

/** E10 — Pause. */
export function announcePaused(lang?: "de" | "en"): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) {
    return { channel: "status", text: altAnzeige(fr.announce.pause, istMacSystem(), "Option"), lang: lehrSprache() };
  }
  return {
    channel: "status",
    // Am Mac „Wahl" bzw. „Option" (18.10.2026, `altAnzeige`).
    text: lang === "en"
      ? altAnzeige("Paused. Press Alt and P to continue.", istMacSystem(), "Option")
      : altAnzeige("Pause. Drück Alt und P, um weiterzumachen.", istMacSystem(), "Wahl"),
  };
}

/** E12 — Alt+M ohne Ziel: diese Etappe/dieser Text führt keine neuen Zeichen ein. */
export function announceNoNewChars(lang?: "de" | "en"): AnnouncePayload {
  const fr = pgTexte();
  if (fr && !lang) return { channel: "status", text: fr.announce.keineNeuenZeichen, lang: lehrSprache() };
  return {
    channel: "status",
    text: lang === "en"
      ? "This one introduces no new characters."
      : "Hier gibt es keine neuen Zeichen.",
  };
}
