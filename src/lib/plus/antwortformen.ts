/**
 * Antwortformen - was ein Kind hinschreiben darf, und was nur halb ist.
 *
 * ★★★ Übertragen aus dem eine andere App der Plattform  (`src/lib/mathecoach/antwort.ts`, Stand
 * 23.09.2026) - Johannes, 25.09.2026: „untersuche die Ergebnisprüfungen von
 * eine andere App der Plattform  genau, die sind auch noch nicht perfekt, aber schon ganz gut.
 * Übertrage sie auf Plus."
 *
 * Der eine andere App der Plattform  hat seine Prüfung ein Schuljahr lang an echten Blättern und
 * 25.266 Teilaufgaben geschärft. Seine Funde fallen in zwei Töpfe, und beide
 * gelten hier genauso:
 *
 * 1. **Richtig gerechnet, anders geschrieben - und trotzdem ein Kreuz.**
 *    `(-5)` statt `-5`, `3 Rest 2` statt `3 (2 Rest)`, `+85` in einer
 *    Zahlenreihe, `Ja` statt `ja`, `kleiner` statt `<`.
 * 2. **Halb gerechnet - und trotzdem ein Häkchen.** Das ist der teurere Fehler:
 *    „Ein Häkchen für ein Sechstel bringt den Fehler bei." Der Quotient ohne
 *    seinen Rest, die richtige Zahl mit der falschen Einheit.
 *
 * ⚠️ Plus kopiert hier, statt den eine andere App der Plattform  einzubinden. Die beiden Apps
 * haben verschiedene Schreibweisen für dasselbe (der eine andere App der Plattform  kennt Pool,
 * Rundungsregeln aus der Angabe, Messtoleranz; Plus erzeugt seine Aufgaben
 * selbst). Wer hier etwas behebt, sieht im eine andere App der Plattform  nach - und umgekehrt
 * ([[feedback_sprachmotor_kopien_nachziehen]]).
 */

/* ------------------------------------------------------------------ */
/* Zeichen, die gleich aussehen                                         */
/* ------------------------------------------------------------------ */

/**
 * Zeichen, die ein Kind tippt, ohne es zu wollen, auf die Zeichen von Plus
 * bringen.
 *
 * ★ Am Mac macht Wahltaste + Bindestrich einen Halbgeviertstrich `–`, und aus
 * einem PDF kopiert kommt das echte Minuszeichen `−`. Beide meinen Minus.
 * Das Malkreuz `×` und der Malpunkt `·` meinen Mal, `÷` meint Geteilt.
 */
export function zeichenGlaetten(text: string): string {
  return text
    .replace(/[−–‒‐]/g, "-")
    .replace(/[×·⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[   ]/g, " ");
}

/**
 * ★★★★ `(-5)` IST DIESELBE ANTWORT WIE `-5` (eine andere App der Plattform , 08.09.2026).
 *
 * Die BookAccess-Übertragungsrichtlinien schreiben selbst `(-5) +(+3) =(+2)`
 * (§3.7). Ein Kind, das die Klammer so setzt, wie sein Buch es zeigt, bekam
 * dort 645 Kreuze.
 *
 * ⚠️ Zwei Ausnahmen, beide im eine andere App der Plattform  gemessen:
 * - vor einer Hochzahl: `(-2)^2` ist 4, `-2^2` ist -4;
 * - hinter einem Zeichen: bei `'w(64)` gehört die Klammer zur Wurzel.
 */
export function klammerUmZahlWeg(text: string): string {
  return text.replace(
    /\(\s*([+-]?\d+(?:[.,]\d+)?)\s*\)/g,
    (ganz, zahl: string, stelle: number, ganzerText: string) => {
      const davor = stelle > 0 ? ganzerText[stelle - 1] : "";
      if (/[a-zA-Z'\]]/.test(davor)) return ganz;
      const hochzahl = ganzerText[stelle + ganz.length] === "^";
      return /^[+-]/.test(zahl) && hochzahl ? ganz : zahl;
    },
  );
}

/* ------------------------------------------------------------------ */
/* Division mit Rest                                                    */
/* ------------------------------------------------------------------ */

/**
 * Quotient und Rest aus einer Antwort - in jeder Schreibweise, die ein Kind
 * benutzt. `null`, wenn dort keine Division mit Rest steht.
 *
 * ★ Plus schreibt `158 (1 Rest)`, das ist die Form der adaptierten Bücher.
 * Gemessen am 25.09.2026: Paket 2-17 nahm NUR diese Form an - `3 Rest 2`
 * bekam ein Kreuz. In der Schule steht aber genauso `3 R 2` oder `3 Rest 2`.
 */
export function restForm(text: string): { quotient: number; rest: number } | null {
  const s = zeichenGlaetten(text).trim().replace(/\s+/g, " ");
  const formen = [
    /^(\d+) ?\( ?(\d+) ?(?:rest|r)\.? ?\)$/i,           // 158 (1 Rest)
    /^(\d+) ?\( ?(?:rest|r)\.?:? ?(\d+) ?\)$/i,          // 158 (Rest 1)
    /^(\d+),? ?(?:rest|r)\.?:? ?(\d+)$/i,                // 158 Rest 1 · 158 R 1 · 158, Rest: 1
  ];
  for (const f of formen) {
    const m = f.exec(s);
    if (m) return { quotient: Number(m[1]), rest: Number(m[2]) };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Einheiten                                                            */
/* ------------------------------------------------------------------ */

/**
 * Die Einheiten, die in Plus vorkommen - jede mit den Namen, unter denen ein
 * Kind sie schreibt. Der erste Name ist der Schlüssel.
 */
const EINHEITEN: string[][] = [
  ["euro", "eur", "€"], ["cent", "ct"],
  ["%", "prozent"],
  ["h", "std", "stunde", "stunden"], ["min", "minute", "minuten"], ["s", "sek", "sekunde", "sekunden"],
  ["l", "liter"], ["ml", "milliliter"],
  ["kg", "kilo", "kilogramm"], ["g", "gramm"], ["dag", "dekagramm"], ["t", "tonne", "tonnen"],
  ["km", "kilometer"], ["m", "meter"], ["dm", "dezimeter"], ["cm", "zentimeter"], ["mm", "millimeter"],
  /*
   * ★★★★ FLÄCHE UND RAUMINHALT (eine andere App der Plattform Durchsicht, 15.10.2026). Bis dahin
   * kannte Plus `m^2` nicht als Einheit. Gemessen an allen erzeugten Aufgaben:
   * `22724 m²` war FALSCH (0 von 10), und `22724 m` für eine Fläche war
   * RICHTIG (10 von 10) - die Länge statt der Fläche bekam ein Häkchen.
   */
  ["m^2", "quadratmeter"], ["km^2", "quadratkilometer"], ["dm^2", "quadratdezimeter"],
  ["cm^2", "quadratzentimeter"], ["mm^2", "quadratmillimeter"], ["ha", "hektar"],
  ["m^3", "kubikmeter"], ["dm^3", "kubikdezimeter"], ["cm^3", "kubikzentimeter"], ["mm^3", "kubikmillimeter"],
];

/** Die Einheit in ihrer Grundform - oder `null`, wenn es keine bekannte ist. */
export function einheitSchluessel(wort: string): string | null {
  // ★ `m²`, `m2` und `m^2` sind dieselbe Einheit - wie im eine andere App der Plattform .
  const w = wort
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/^([a-z]+)([23])$/, "$1^$2");
  return EINHEITEN.find((namen) => namen.includes(w))?.[0] ?? null;
}

/**
 * Zahl und Einheit einer Antwort: `70 h`, `16,50 EUR`, `40 %`. `null`, wenn
 * dort nicht genau eine Zahl mit höchstens einem Wort dahinter steht.
 *
 * ⚠️ Absichtlich eng, wie im eine andere App der Plattform : `5 h 17 min` ist eine
 * zusammengesetzte Größe und wird als Ganzes verglichen, nicht hier.
 */
export function zahlUndEinheit(text: string): { zahl: string; einheit: string | null; roh: string } | null {
  const glatt = zeichenGlaetten(text);
  /*
   * ★ Das Geld darf VORNE stehen: „€ 1,56", „EUR 7,80" - so steht es auf
   * Preisschildern und Kassenzetteln. Bis zum 29.09.2026 galt nur „1,56 €"
   * (Befund der Durchsicht). Nur beim Geld: „cm 5" schreibt niemand.
   */
  const vorne = /^\s*(€|eur\b|euro\b)\s*(-?\d+(?:[.,]\d+)?)\s*$/i.exec(glatt);
  if (vorne) return { zahl: vorne[2], einheit: "euro", roh: vorne[1] };
  const m = /^\s*(-?\d+(?:[.,]\d+)?(?: \d+\/\d+|\/\d+)?)\s*([a-zA-ZäöüÄÖÜ€%]+(?:\^?[23]|[²³])?\.?)?\s*$/.exec(glatt);
  if (!m) return null;
  return { zahl: m[1], einheit: m[2] ? einheitSchluessel(m[2]) : null, roh: m[2] ?? "" };
}

/**
 * Welche Einheiten nennt die Angabe? Eine Lösung ohne Einheit bekommt ihre
 * Einheit oft aus der Angabe: `1/5 von 410 g =[] g`.
 */
export function einheitenImText(text: string): Set<string> {
  const raus = new Set<string>();
  for (const wort of zeichenGlaetten(text).split(/[^a-zA-ZäöüÄÖÜ€%]+/)) {
    const e = einheitSchluessel(wort);
    if (e) raus.add(e);
  }
  if (text.includes("%")) raus.add("%");
  if (text.includes("€")) raus.add("euro");
  return raus;
}

/* ------------------------------------------------------------------ */
/* Aufzählungen                                                         */
/* ------------------------------------------------------------------ */

/**
 * ★★★★★ IST DIE LÖSUNG EINE AUFZÄHLUNG? (eine andere App der Plattform , 08.09. und 23.09.2026)
 *
 * `-124; -2; 85; 100`, `727 und 729`, `40 und 59`. Im eine andere App der Plattform  genügte bei
 * 38 von 42 Aufzählungen das erste Glied allein - dort wurde die erste Zahl
 * der Lösung mit der letzten der Eingabe verglichen. In Plus war es
 * umgekehrt streng: `-124; -2; +85; 100` oder `-124, -2, 85, 100` bekamen ein
 * Kreuz, obwohl es dieselbe Reihe ist.
 *
 * ⚠️ Das Komma ist im Deutschen beides, Trenner und Dezimalzeichen. Eine
 * Aufzählung mit Komma gilt darum nur, wenn hinter jedem Trennkomma ein
 * Leerzeichen steht - wie im eine andere App der Plattform .
 */
const GLIED = String.raw`[+-]?\d+(?:[.,]\d+)?(?: \d+\/\d+|\/\d+)?`;
const TRENNER = String.raw`(?:\s*;\s*|,\s+|\s+und\s+)`;

export function istAufzaehlung(loesung: string): boolean {
  return new RegExp(`^\\s*${GLIED}(${TRENNER}${GLIED})+\\s*$`).test(loesung);
}

/** Die Glieder einer Aufzählung als Werte. `null`, wenn sie sich nicht lesen lässt. */
function glieder(text: string, wert: (t: string) => number | null, nurGanz: boolean): number[] | null {
  const s = zeichenGlaetten(klammerUmZahlWeg(text)).trim().replace(/\s+und\s+/gi, ";");
  // ★ Am Strichpunkt zuerst, dann am Komma mit Leerzeichen, dann am blossen
  // Leerzeichen - ein Kind an der Braillezeile setzt selten jeden Trenner.
  // Die gemischte Zahl `1 3/4` darf dabei nicht zerfallen.
  const versuche: RegExp[] = [/\s*;\s*/, /\s*;\s*|,\s+/, /\s*;\s*|,\s+|\s+(?!\d+\/)/];
  for (const trenner of versuche) {
    const teile = s.split(trenner).map((x) => x.trim()).filter(Boolean);
    const werte = teile.map(wert);
    if (werte.every((w): w is number => w !== null)) return werte;
  }
  if (nurGanz) {
    // Nur ganze Zahlen in der Lösung: dann trennt auch das Komma ohne Leerzeichen.
    const teile = s.split(/[;,\s]+/).filter(Boolean);
    if (teile.every((t) => /^[+-]?\d+$/.test(t))) return teile.map(Number);
  }
  return null;
}

/**
 * ★★★★★ EINE AUFZÄHLUNG ZÄHLT GANZ - jedes Glied, keines zu viel.
 *
 * Die Reihenfolge zählt nur, wenn sie der Gegenstand ist: „Der Größe nach
 * ordnen", oder Lücken, die der Reihe nach gefüllt werden. Bei „Wie heißen die
 * Nachbarn von 728?" ist `729 und 727` dieselbe richtige Antwort.
 */
export function aufzaehlungStimmt(
  eingabe: string,
  loesung: string,
  wert: (t: string) => number | null,
  ordnungZaehlt: boolean,
): boolean {
  const nurGanz = !/[.,]\d/.test(loesung.replace(/,\s+/g, ";"));
  const soll = glieder(loesung, wert, nurGanz);
  const ist = glieder(eingabe, wert, nurGanz);
  if (!soll || !ist || soll.length !== ist.length) return false;
  const gleich = (x: number, y: number) => Math.abs(x - y) < 1e-9;
  if (ordnungZaehlt) return ist.every((z, i) => gleich(z, soll[i]));
  const a = [...ist].sort((x, y) => x - y);
  const b = [...soll].sort((x, y) => x - y);
  return a.every((z, i) => gleich(z, b[i]));
}

/**
 * ★★★★★ MEHRERE ERGEBNISSE IN EINER ZEILE - JEDES WIRD GEPRÜFT, UND DAS KIND
 * ERFÄHRT, WELCHES NOCH NICHT STIMMT (Johannes, 16.10.2026, zuerst im
 * eine andere App der Plattform : „Antworten mit mehreren Ergebnissen dürfen in einer Zeile sein,
 * aber nur, wenn auch alle Werte überprüft werden" - und für Plus: „all diese
 * Entscheidungen auch in der App Plus").
 *
 * Gemessen vorher an „Wie heißen die Nachbarn von 9?" (Lösung `8 und 10`):
 * `Vorgänger 8, Nachfolger 10` war falsch, `9 -1 =8 und 9 +1 =10` hieß
 * „verändert", und bei `8 und 11` erfuhr das Kind nicht, dass die 8 stimmt.
 *
 * Jeder Teil darf seinen Namen und seinen Rechenweg tragen; gelesen wird die
 * Zahl nach dem letzten `=`, ohne die Wörter davor. `null`, wenn sich die
 * Eingabe so nicht lesen lässt - dann bleibt es beim bisherigen Weg.
 */
export function aufzaehlungUrteil(
  eingabe: string,
  loesung: string,
  wert: (t: string) => number | null,
  ordnungZaehlt: boolean,
): { stimmt: boolean; hinweis?: string } | null {
  const nurGanz = !/[.,]\d/.test(loesung.replace(/,\s+/g, ";"));
  const soll = glieder(loesung, wert, nurGanz);
  if (!soll) return null;
  const teile = zeichenGlaetten(eingabe)
    .split(/\s*;\s*|,\s+|\s+und\s+|\s*\n\s*/i)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const nachGleich = t.includes("=") ? t.slice(t.lastIndexOf("=") + 1) : t;
      return nachGleich.replace(/^[\p{L}\s:.'-]+(?=[+-]?\d)/u, "").trim();
    });
  const ist = teile.map((t) => ({ text: t, w: wert(t) }));
  if (!ist.length || ist.some((x) => x.w === null)) return null;
  const gleich = (x: number, y: number) => Math.abs(x - y) < 1e-9;
  const frei = soll.map(() => true);
  const treffer = ist.map((x, i) => {
    if (ordnungZaehlt) return i < soll.length && gleich(x.w as number, soll[i]);
    const k = soll.findIndex((s, j) => frei[j] && gleich(x.w as number, s));
    if (k < 0) return false;
    frei[k] = false;
    return true;
  });
  const stimmt = ist.length === soll.length && treffer.every(Boolean);
  if (stimmt) return { stimmt };
  const richtig = ist.filter((_, i) => treffer[i]).map((x) => x.text);
  if (!richtig.length) return { stimmt };
  const falsch = ist.filter((_, i) => !treffer[i]).map((x) => x.text);
  const und = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} und ${xs[xs.length - 1]}`);
  const fehlen = soll.length - richtig.length - falsch.length;
  const teil = [`${und(richtig)} ${richtig.length === 1 ? "stimmt" : "stimmen"}`];
  if (falsch.length) teil.push(`${und(falsch)} noch nicht`);
  if (fehlen > 0) teil.push(fehlen === 1 ? "ein Wert fehlt noch" : `${fehlen} Werte fehlen noch`);
  return { stimmt, hinweis: teil.join(", ") };
}

/**
 * Verlangt die Angabe eine Reihenfolge? Gesucht wird das Verb, nicht das Wort
 * „Reihenfolge" (eine andere App der Plattform  `verlangtOrdnung`).
 */
export function verlangtOrdnung(angabe: string): boolean {
  return /\b(ordne|ordnen|sortiere|der\s+(?:größe|groesse|reihe)\s+nach|beginne\s+mit)\b/i.test(angabe);
}

/* ------------------------------------------------------------------ */
/* Wörter                                                               */
/* ------------------------------------------------------------------ */

/**
 * Ist die Lösung ein Wort (`ja`, `echt`, `Verdoppeln`, `b`) - und kein Term,
 * keine Zahl, kein Zeichen?
 */
export function istWortloesung(loesung: string): boolean {
  const l = loesung.trim();
  return !!l && !/\d/.test(l) && /^[a-zA-ZäöüÄÖÜß ,]+$/.test(l);
}

/**
 * Ein Wort zum Vergleichen: klein, ohne Satzzeichen am Rand.
 *
 * ★ `Ja`, `ja.` und `ja!` sind dieselbe Antwort. Gemessen am 25.09.2026:
 * `Ja` mit grossem J bekam in Plus ein Kreuz - Plus hat Zahlen verglichen und
 * die Wörter dabei vergessen. Der eine andere App der Plattform  vergleicht seit August klein.
 *
 * ★ `a)` ist `a` - so steht der Weg in der Angabe, und so schreibt ihn ein
 * Kind ab.
 */
export function wortGeputzt(text: string): string {
  return text.trim().toLowerCase().replace(/^[\s"„“(]+|[\s".!?)“]+$/g, "").replace(/\s+/g, " ");
}

/**
 * Vergleichszeichen dürfen in Worten stehen: `kleiner` ist `<`.
 *
 * ★ Im eine andere App der Plattform  ist genau daran eine ganze Teilaufgabe gescheitert
 * (`plus4u-11`, 04.09.2026): Kein Kind konnte `=` richtig beantworten, auch
 * „gleich" nicht.
 */
/**
 * ★★★★★ JA IST WAHR, NEIN IST FALSCH (eine andere App der Plattform Durchsicht, 15.10.2026 -
 * dort `wahrheitGleich` in `wertpruefung.ts`). Im eine andere App der Plattform  bekamen acht
 * richtige Antworten ein Kreuz, weil `wahr` gegen `ja` stand. In Plus gemessen:
 * `wahr` für `ja` galt in KEINER von 222 Aufgaben, `falsch` für `nein` nur
 * dort, wo der Bauer es eigens in `auchRichtig` schrieb.
 */
const JA = new Set(["ja", "wahr", "richtig", "stimmt", "ja das stimmt", "das stimmt"]);
const NEIN = new Set(["nein", "falsch", "stimmt nicht", "nein das stimmt nicht", "das stimmt nicht"]);

/** `true` für ja, `false` für nein, `null` für alles andere. */
export function wahrheitswert(text: string): boolean | null {
  const w = wortGeputzt(text).replace(/[,!]/g, "");
  if (JA.has(w)) return true;
  if (NEIN.has(w)) return false;
  return null;
}

/* ------------------------------------------------------------------ */
/* Rechnung, Ergebnis, dann die Antwort                                 */
/* ------------------------------------------------------------------ */

/**
 * Rechnet eine einfache Zeile aus: Zahlen mit Komma, `+ - * / :`, Klammern.
 * `null`, wenn dort etwas anderes steht. Nur zum Nachprüfen eines Rechenwegs -
 * nie, um eine Antwort zu erzeugen.
 */
export function rechneEinfach(text: string): number | null {
  const s = zeichenGlaetten(text).replace(/:/g, "/").replace(/\s+/g, "");
  let i = 0;
  const zahl = (): number | null => {
    const m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return Number(m[0].replace(",", "."));
  };
  const faktor = (): number | null => {
    if (s[i] === "-") { i++; const w = faktor(); return w === null ? null : -w; }
    if (s[i] === "+") { i++; return faktor(); }
    if (s[i] === "(") {
      i++;
      const w = summe();
      if (s[i] !== ")") return null;
      i++;
      return w;
    }
    return zahl();
  };
  const produkt = (): number | null => {
    let w = faktor();
    while (w !== null && (s[i] === "*" || s[i] === "/")) {
      const op = s[i++];
      const r = faktor();
      if (r === null || (op === "/" && r === 0)) return null;
      w = op === "*" ? w * r : w / r;
    }
    return w;
  };
  function summe(): number | null {
    let w = produkt();
    while (w !== null && (s[i] === "+" || s[i] === "-")) {
      const op = s[i++];
      const r = produkt();
      if (r === null) return null;
      w = op === "+" ? w + r : w - r;
    }
    return w;
  }
  const w = summe();
  return w !== null && i === s.length && Number.isFinite(w) ? w : null;
}

/**
 * ★★★★ RECHNUNG, ERGEBNIS, DANN DIE ANTWORT OHNE „=" (eine andere App der Plattform Durchsicht,
 * 15.10.2026, `plus3e-016 a`): `2,6 *0,9 =2,34 17,66 €`. Hinter dem letzten
 * `=` stehen zwei Zahlen - das Ergebnis der Rechnung davor und die Antwort.
 * Gibt die Antwort zurück, wenn die erste Zahl die Rechnung davor WIRKLICH
 * abschliesst; sonst `null`.
 */
export function antwortNachRechnung(eingabe: string): string | null {
  const stuecke = zeichenGlaetten(eingabe).replace(/\n+/g, " ").split("=").map((x) => x.trim());
  if (stuecke.length < 2) return null;
  const m = /^(-?\d+(?:[.,]\d+)?)\s+(-?\d+(?:[.,]\d+)?(?:\s*[a-zA-ZäöüÄÖÜ€%]+(?:\^?[23]|[²³])?)?)$/.exec(stuecke[stuecke.length - 1]);
  if (!m) return null;
  const davor = rechneEinfach(stuecke[stuecke.length - 2]);
  const erste = rechneEinfach(m[1]);
  if (davor === null || erste === null || Math.abs(davor - erste) > 1e-9) return null;
  return m[2];
}

export const ZEICHEN_IN_WORTEN: Record<string, string[]> = {
  "<": ["kleiner", "kleiner als", "ist kleiner", "ist kleiner als"],
  ">": ["größer", "groesser", "größer als", "groesser als", "ist größer", "ist größer als"],
  "=": ["gleich", "ist gleich", "gleich gross", "gleich groß"],
};
