/**
 * Terme vergleichen - gleichwertig UND in der verlangten Form.
 *
 * ★ Gemessen am 23.09.2026: Terme wurden nur als Text verglichen. `10x +14y`
 * statt `14y +10x` war „Noch nicht", und in 7-14 war das zusammengefasste
 * `6y -36x` falsch, weil die Lösung `36y -30y -36x` hieß. Ein Kind, das
 * besser gerechnet hat als die Lösung, verlor.
 *
 * Gleichwertig heißt hier: an mehreren Stellen eingesetzt, derselbe Wert.
 * Dafür gibt es einen kleinen Rechner für die Schreibweise von Plus - kein
 * `eval`, nur Zahlen, Buchstaben, `+ - * / ^` und Klammern.
 *
 * ★★ Die FORM bleibt die Aufgabe. Wer die Angabe abschreibt, hat nichts
 * gerechnet. Deshalb:
 *   · Steht die Lösung ohne Klammer (zusammenfassen, ausmultiplizieren), darf
 *     auch die Antwort keine haben - und nicht mehr Glieder als die Lösung.
 *     Weniger dürfen es sein: wer weiter zusammenfasst, rechnet besser.
 *   · Steht die Lösung mit Klammer (herausheben, binomische Formel), muss die
 *     Antwort eine haben - und der Faktor davor muss der ganze sein.
 */

type Token =
  | { art: "zahl"; wert: number }
  | { art: "var"; name: string }
  | { art: "op"; zeichen: "+" | "-" | "*" | "/" | "^" }
  | { art: "auf" }
  | { art: "zu" };

/** Zerlegt einen Term in Zeichen. `null`, wenn etwas Fremdes darin steht. */
function zerlege(text: string): Token[] | null {
  const s = text.replace(/\s+/g, "").replace(/\./g, ",");
  const raus: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    // ★ Ein Bruch ohne Abstand ist EINE Zahl: `5/2a` ist fünf Halbe a, nicht
    // fünf durch zwei a (Stanetty S. 35: vor dem Bruchstrich kein Abstand).
    const zahl = /^(\d+(?:,\d+)?)(?:\/(\d+)(?![,\d]))?/.exec(rest);
    if (zahl) {
      const z = Number(zahl[1].replace(",", "."));
      raus.push({ art: "zahl", wert: zahl[2] ? z / Number(zahl[2]) : z });
      i += zahl[0].length;
      continue;
    }
    const c = s[i];
    if (/[a-z]/.test(c)) raus.push({ art: "var", name: c });
    else if ("+-*/^".includes(c)) raus.push({ art: "op", zeichen: c as "+" });
    else if (c === "(") raus.push({ art: "auf" });
    else if (c === ")") raus.push({ art: "zu" });
    else return null;
    i++;
  }
  return raus;
}

/** Rechnet einen Term aus - mit Werten für die Buchstaben. `null` bei Unsinn. */
function rechne(tokens: Token[], werte: Record<string, number>): number | null {
  let p = 0;
  const schau = () => tokens[p];
  const istOp = (z: string) => schau()?.art === "op" && (schau() as { zeichen: string }).zeichen === z;

  function summe(): number | null {
    let links = produkt();
    while (links !== null && (istOp("+") || istOp("-"))) {
      const plus = istOp("+");
      p++;
      const rechts = produkt();
      if (rechts === null) return null;
      links = plus ? links + rechts : links - rechts;
    }
    return links;
  }

  function produkt(): number | null {
    let links = vorzeichen();
    while (links !== null) {
      if (istOp("*") || istOp("/")) {
        const mal = istOp("*");
        p++;
        const rechts = vorzeichen();
        if (rechts === null) return null;
        links = mal ? links * rechts : links / rechts;
        continue;
      }
      // Ohne Zeichen dazwischen wird malgenommen: `5x`, `2(x +1)`, `(a)(b)`.
      const t = schau();
      if (t && (t.art === "zahl" || t.art === "var" || t.art === "auf")) {
        const rechts = potenz();
        if (rechts === null) return null;
        links *= rechts;
        continue;
      }
      break;
    }
    return links;
  }

  function vorzeichen(): number | null {
    if (istOp("-")) { p++; const w = vorzeichen(); return w === null ? null : -w; }
    if (istOp("+")) { p++; return vorzeichen(); }
    return potenz();
  }

  function potenz(): number | null {
    const basis = grund();
    if (basis === null) return null;
    if (istOp("^")) {
      p++;
      const hoch = vorzeichen();
      return hoch === null ? null : basis ** hoch;
    }
    return basis;
  }

  function grund(): number | null {
    const t = schau();
    if (!t) return null;
    if (t.art === "zahl") { p++; return t.wert; }
    if (t.art === "var") { p++; return werte[t.name] ?? null; }
    if (t.art === "auf") {
      p++;
      const innen = summe();
      if (innen === null || schau()?.art !== "zu") return null;
      p++;
      return innen;
    }
    return null;
  }

  const w = summe();
  return p === tokens.length && w !== null && Number.isFinite(w) ? w : null;
}

/** Stellen, an denen verglichen wird - krumm genug, dass nichts zufällig passt. */
const STELLEN: Record<string, number>[] = [
  { x: 1.37, y: -0.83, z: 2.11, a: 0.59, b: -1.73, c: 3.07 },
  { x: -2.29, y: 1.61, z: -0.47, a: 2.53, b: 0.71, c: -1.19 },
  { x: 0.43, y: 2.87, z: 1.93, a: -1.31, b: 1.47, c: 0.67 },
];

function gleichwertig(a: Token[], b: Token[]): boolean {
  const werte = (w: Record<string, number>) => {
    const s: Record<string, number> = {};
    for (const k of "abcdefghijklmnopqrstuvwxyz") s[k] = w[k] ?? 1.3 + k.charCodeAt(0) / 97;
    return s;
  };
  return STELLEN.every((stelle) => {
    const x = rechne(a, werte(stelle));
    const y = rechne(b, werte(stelle));
    if (x === null || y === null) return false;
    return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  });
}

/** Wie viele Glieder hat ein Term ohne Klammer? `3x -2y +4` hat drei. */
function glieder(tokens: Token[]): number {
  let n = 1;
  tokens.forEach((t, i) => {
    if (t.art === "op" && (t.zeichen === "+" || t.zeichen === "-") && i > 0 && tokens[i - 1].art !== "op") n++;
  });
  return n;
}

/** Der Faktor vor der ersten Klammer: `8 *(…)` und `8(…)` ergeben 8. */
function faktorVorn(tokens: Token[]): number | null {
  let i = 0;
  let vz = 1;
  if (tokens[0]?.art === "op" && tokens[0].zeichen === "-") { vz = -1; i++; }
  const t = tokens[i];
  if (t?.art !== "zahl") return null;
  const weiter = tokens[i + 1];
  if (weiter?.art === "auf" || (weiter?.art === "op" && weiter.zeichen === "*" && tokens[i + 2]?.art === "auf")) {
    return vz * t.wert;
  }
  return null;
}

/**
 * Ist die Antwort ein gleichwertiger Term in der verlangten Form?
 * Nur für Aufgaben, deren Lösung ein Term ist.
 */
export function gleicherTerm(eingabe: string, loesung: string): boolean {
  // ★ Nur wo die Lösung wirklich ein Term ist. 5-03 trägt `op: "term"` und
  // hat die Lösung 28 - dort wäre sonst die abgeschriebene Angabe `1 *4 *7`
  // „gleichwertig" gewesen. Gemessen am 23.09.2026.
  if (!/[a-z]/.test(loesung)) return false;
  const e = zerlege(eingabe);
  const l = zerlege(loesung);
  if (!e || !l || !e.length) return false;
  if (!gleichwertig(e, l)) return false;

  const klammerL = l.some((t) => t.art === "auf");
  const klammerE = e.some((t) => t.art === "auf");
  if (!klammerL) return !klammerE && glieder(e) <= glieder(l);

  if (!klammerE) return false;
  const fl = faktorVorn(l);
  if (fl === null) return true;
  const fe = faktorVorn(e);
  return fe !== null && Math.abs(fe) === Math.abs(fl);
}
