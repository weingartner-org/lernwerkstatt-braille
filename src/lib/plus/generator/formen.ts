/**
 * Plus - die Formen: welche Gestalt eine Rechnung annimmt.
 *
 * Aus einem Kern (48, 27, Plus) wird hier eine Ergebnisaufgabe, eine Lücke,
 * eine Zahlenfolge, eine Probe. Sechzehn Formen stehen im Stoffplan; welche
 * ein Paket benutzt, steht dort bei jedem Paket.
 *
 * Was noch nicht gebaut ist, wirft `NochNichtGebaut` - mit Namen. Ein Test
 * zählt diese Stellen, damit keine stillschweigend offen bleibt.
 */
import {
  LUECKE, ZEICHEN, gemischt, rechnung, rechnungMit, zahl,
  type Aufgabe, type Aufgabenart, type Operation,
} from "../aufgabe";
import type { Kern, Zufall } from "./kerne";
import { weg as zeilenWeg } from "../zeilenrechnen";
import { paket as paketAusPlan } from "../stoffplan";
import { NochNichtGebaut } from "./nochNichtGebaut";
import { BUCHFORMEN } from "./buchformen";

/**
 * Der Zahlenraum eines Pakets aus dem Stoffplan - `0-1000`, `-200 bis 200`.
 * `null`, wo er nicht als Zahlen dasteht („Dezimalzahlen", „Brüche").
 */
function zahlenraum(paketId: string): [number, number] | null {
  let zr: string;
  try { zr = paketAusPlan(paketId).zr; } catch { return null; }
  const m = /^(-?\d+)(?:-| bis )(-?\d+)$/.exec(zr);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export { NochNichtGebaut };

/** Die Formen, die es heute gibt. */
export const GEBAUTE_FORMEN: readonly Aufgabenart[] = [
  "ergebnis", "luecke_zahl", "luecke_zeichen", "probe", "wahr_falsch", "folge", "kette", "mauer",
  "fehler_finden", "strategiewahl", "ueberschlag",
  // Die Rechengeschichte bringt ihren Text selbst mit; die Form reicht ihn
  // durch. Sie steht hier, seit es Vorlagen dafür gibt (23.09.2026).
  "sach",
  // Die Umwandlung ebenso: „5 km = [] m" ist schon die ganze Aufgabe.
  "umwandeln",
  // Das schriftliche Rechnen in Zeilen - die Leitform von 20 Paketen.
  "zeilen",
  // Schätzen und begründen - die Antwort ist ein Bereich, keine Zahl.
  "fermi",
  // Mengenaufgaben: `T(26) = {1; 2; 13; 26}`. Auch sie bringt der Kern mit.
  "menge",
  // Die Formen aus den neuen Schulbüchern (26.09.2026), siehe `buchformen/`.
  ...(Object.keys(BUCHFORMEN) as Aufgabenart[]),
];

/**
 * Die Formen, deren Angabe eine Rechnung IST - an ihnen prüfen die Wächter
 * der Stufen, ob die Zahlen stimmen. Die drei Formen, die den Weg üben
 * (Fehler finden, Strategiewahl, Überschlag), enthalten keine Rechnung zum
 * Nachrechnen; sie werden zentral in `tests/plus-formen.test.ts` geprüft.
 */
export const RECHNENDE_FORMEN: readonly Aufgabenart[] = [
  "ergebnis", "luecke_zahl", "luecke_zeichen", "probe", "wahr_falsch", "folge", "kette", "mauer",
];

/** Das Ergebnis als Text - mit Rest, wenn einer da ist. */
function ergebnisText(k: Extract<Kern, { sorte: "rechnung" }>): string {
  return k.rest ? `${zahl(k.ergebnis)} (${k.rest} Rest)` : zahl(k.ergebnis);
}

export interface FormArgs {
  paket: string;
  art: Aufgabenart;
  kern: Kern;
  rng: Zufall;
  /** Liefert einen weiteren Kern derselben Bauart - für Kette und Mauer. */
  nachschub: () => Kern;
  /**
   * Drei Wege zur Auswahl, der richtige zuerst - für die Strategiewahl.
   * Kommt aus dem Stoffplan; die Form selbst kennt ihn nicht.
   */
  strategien?: string[];
}

export function formeAufgabe({ paket, art, kern: kernEin, rng, nachschub, strategien }: FormArgs): Aufgabe {
  let kern = kernEin;
  if (!GEBAUTE_FORMEN.includes(art)) throw new NochNichtGebaut(paket, art);

  // ★ Die Buchformen bauen sich ihre Zahlen selbst, wo der Kern nicht reicht -
  // sie bekommen deshalb Zahlenraum, Rechenart und Stufe des Pakets mit.
  const buch = BUCHFORMEN[art];
  if (buch) {
    let op: Operation = kern.op;
    try { op = paketAusPlan(paket).op; } catch { /* Paket unbekannt: die Rechenart des Kerns */ }
    return buch({
      paket, art, kern, rng, nachschub, raum: zahlenraum(paket), op,
      stufe: Number(paket.split("-")[0]) || 1,
    });
  }

  // Kerne, die ihre Angabe schon mitbringen. Hat der Kern mehrere Fassungen,
  // wählt die Form eine aus - sonst käme in jeder Form dieselbe Frage.
  if (kern.sorte === "direkt") {
    // ★ Die drei Formen, die den Weg üben, brauchen die Rechnung in ihren
    // Teilen - zwei Zahlen und ein Zeichen. Ein Kern, der seine Frage fertig
    // mitbringt, gibt sie nicht her. Eine Strategiewahl daraus zu bauen hiesse
    // raten, welcher Weg der richtige ist, und das waere schlimmer als gar
    // keine Aufgabe: das Kind lernte einen falschen Weg als den besten.
    // ★ Fünf Arten kann eine Form nicht aus einer fertigen Angabe machen - der
    // Kern muss sie selbst mitbringen. Bringt er eine andere mit, fragen wir
    // nach dem nächsten: viele Bauarten würfeln zwischen zwei Arten (etwa
    // Rechengeschichte und Fermi-Frage, oder Strategiewahl und Fehlersuche).
    //
    // Eine Sachaufgabe ist ein Text. Wer hier eine blanke Rechnung durchreicht,
    // nennt sie nur so - und die Liste der spielbaren Pakete wäre eine
    // Behauptung statt einer Messung.
    const brauchtEigenen = ["strategiewahl", "fehler_finden", "ueberschlag", "fermi", "sach", "menge"];
    if (brauchtEigenen.includes(art)) {
      type Direkt = Extract<Kern, { sorte: "direkt" }>;
      const passt = (k: Direkt) => (art === "sach" ? !!k.geschichte : k.eigeneArt === art);
      let k: Direkt = kern;
      for (let i = 0; i < 10 && !passt(k); i++) {
        const weiter = nachschub?.();
        if (!weiter || weiter.sorte !== "direkt") break;
        k = weiter;
      }
      if (!passt(k)) throw new NochNichtGebaut(paket, art);
      kern = k;
    }
    const fassungen = [{ angabe: kern.angabe, loesung: kern.loesung, auchRichtig: kern.auchRichtig }, ...(kern.varianten ?? [])];
    const f = fassungen[Math.floor(rng() * fassungen.length)];
    return {
      paket, art, op: kern.op, angabe: f.angabe, loesung: f.loesung,
      auchRichtig: f.auchRichtig, bereich: kern.bereich, zahlen: kern.zahlen,
      formZaehlt: kern.formZaehlt,
    };
  }

  if (kern.sorte === "reihe") {
    // Eine Lücke in einer Zahlenfolge IST die Form "folge" - egal, wie das
    // Paket sie nennt.
    if (art !== "folge" && art !== "luecke_zahl" && art !== "ergebnis") throw new NochNichtGebaut(paket, art);
    const weg = Math.floor(rng() * kern.glieder.length);
    const zeile = kern.glieder.map((g, i) => (i === weg ? LUECKE : zahl(g))).join(", ");
    return { paket, art: "folge", op: kern.op, angabe: zeile, loesung: zahl(kern.glieder[weg]), zahlen: kern.glieder };
  }

  const { op, a, b } = kern;
  const zahlen = [a, b];

  switch (art) {
    case "ergebnis":
      return { paket, art, op, angabe: rechnung(a, op, b), loesung: ergebnisText(kern), zahlen, rest: kern.rest };

    case "luecke_zahl": {
      // Mal die erste, mal die zweite Zahl fehlt - sonst lernt das Kind die Stelle, nicht die Sache.
      const linksFehlt = rng() < 0.5;
      const angabe = linksFehlt
        ? rechnungMit(LUECKE, op, b, ergebnisText(kern))
        : rechnungMit(a, op, LUECKE, ergebnisText(kern));
      return { paket, art, op, angabe, loesung: zahl(linksFehlt ? a : b), zahlen, rest: kern.rest };
    }

    case "luecke_zeichen": {
      const angabe = `${zahl(a)} ${LUECKE}${zahl(b)} =${ergebnisText(kern)}`;
      return { paket, art, op, angabe, loesung: ZEICHEN[op], auchRichtig: [wortFuer(op)], zahlen, rest: kern.rest };
    }

    case "probe":
    case "wahr_falsch": {
      // ★ Bei einer Division mit Rest muss das Gezeigte den Rest enthalten.
      // Ohne ihn wäre „12 /5 =2 - stimmt das?" mit „ja" zu beantworten, und
      // das Kind lernte, den Rest zu übersehen.
      const stimmt = rng() < 0.5;
      const gezeigt = stimmt ? ergebnisText(kern) : falscherText(kern, rng);
      const angabe = `${rechnung(a, op, b)}${gezeigt} - stimmt das?`;
      return { paket, art, op, angabe, loesung: stimmt ? "ja" : "nein", auchRichtig: stimmt ? ["stimmt", "richtig"] : ["stimmt nicht", "falsch"], zahlen, rest: kern.rest };
    }

    case "folge": {
      // Operatives Päckchen: dieselbe Rechnung, eine Zahl wandert. Drei Zeilen
      // gerechnet, die vierte offen - das Kind soll das Muster sehen, nicht
      // vier Mal rechnen. Welche Zahl wandert, sagt der Kern.
      // ★ Bei einer Division darf die Zahl nicht um eins wandern - sonst geht
      // die Rechnung nicht mehr auf (813 /90 =9,03...). Sie wandert um den
      // Divisor: 40 /8, 48 /8, 56 /8. Zwei Agenten sind unabhängig voneinander
      // über diese Stelle gestolpert, bevor sie hier behoben war.
      const achse = op === "geteilt" ? "dividend" : (kern.variiere ?? "a");
      const schritt = op === "geteilt" ? b : 1;
      const zeile = (i: number) => {
        const na = achse === "b" ? a : a + i * schritt;
        const nb = achse === "a" || achse === "dividend" ? b : achse === "b" ? b + i : b + i;
        return { na, nb, erg: rechne(op, na, nb) };
      };
      // ★ Läuft die Folge über den Zahlenraum hinaus, beginnt sie früher.
      // Gemessen am 23.09.2026: 1-06 („bis 20") lief bis `12 +12 =24`, 3-19
      // bis `501 +501 =1002`.
      const raum = zahlenraum(paket);
      const drin = (w: number) => !raum || (w >= raum[0] && w <= raum[1]);
      const passt = (versatz: number) => [0, 1, 2, 3].every((i) => {
        const z = zeile(i - versatz);
        return drin(z.na) && drin(z.nb) && drin(z.erg) && z.na >= 0 && z.nb >= (op === "geteilt" ? 1 : 0);
      });
      let versatz = 0;
      while (versatz < 60 && !passt(versatz)) versatz++;
      if (!passt(versatz)) versatz = 0;
      const zeilen: string[] = [];
      let letzte = "";
      for (let i = 0; i < 4; i++) {
        const { na, nb, erg } = zeile(i - versatz);
        if (i < 3) zeilen.push(rechnungMit(na, op, nb, erg));
        else { zeilen.push(rechnung(na, op, nb)); letzte = zahl(erg); }
      }
      return { paket, art, op, angabe: zeilen.join("\n"), loesung: letzte, zahlen };
    }

    case "kette": {
      // Drei Schritte, das Ergebnis des einen ist der Anfang des nächsten.
      // ★ Auch der zweite Schritt bleibt im Zahlenraum des Pakets. Gemessen am
      // 23.09.2026: `703 -511 =[] -198 =[]` ergab -6 in Stufe 3, und
      // `504 +328 =[] +281 =[]` ergab 1113 im Zahlenraum bis 1000.
      // Passt kein zweiter Schritt an den ersten (`26 -20 =6`, dann minus 20),
      // wird auch der erste neu gezogen.
      const raum = zahlenraum(paket);
      let erster: Extract<Kern, { sorte: "rechnung" }> = kern;
      let zweiter = nachschub();
      for (let v = 0; v < 100 && raum && zweiter.sorte === "rechnung"; v++) {
        const e = rechneAn(erster.ergebnis, zweiter);
        if (e >= raum[0] && e <= raum[1]) break;
        if (v % 5 === 4) {
          const neu = nachschub();
          if (neu.sorte === "rechnung") erster = neu;
        }
        zweiter = nachschub();
      }
      if (zweiter.sorte !== "rechnung") throw new NochNichtGebaut(paket, art);
      const zwischen = erster.ergebnis;
      const ende = rechneAn(zwischen, zweiter);
      if (raum && (ende < raum[0] || ende > raum[1])) throw new NochNichtGebaut(paket, art);
      const angabe = `${rechnung(erster.a, erster.op, erster.b)}${LUECKE} ${ZEICHEN[zweiter.op]}${zahl(zweiter.b)} =${LUECKE}`;
      return { paket, art, op, angabe, loesung: `${zahl(zwischen)} und ${zahl(ende)}`, auchRichtig: [`${zahl(zwischen)}, ${zahl(ende)}`, `${zahl(zwischen)} ${zahl(ende)}`], zahlen: [erster.a, erster.b, zweiter.b] };
    }

    case "mauer": {
      // Zwei Steine unten, ihre Summe darüber. Zeilenweise, mit Spaltentrenner -
      // so lösen es die adaptierten Bücher.
      // ★ Auch der oberste Stein bleibt im Zahlenraum. Gemessen am 23.09.2026:
      // in 1-03 („bis 10") stand oben 19, in 3-05 1747.
      const raum = zahlenraum(paket);
      let unten: Extract<Kern, { sorte: "rechnung" }> = kern;
      let zweiter = nachschub();
      for (let v = 0; v < 100 && raum && zweiter.sorte === "rechnung"; v++) {
        const oben = unten.a + 2 * unten.b + Math.abs(zweiter.b);
        if (oben <= raum[1]) break;
        if (v % 3 === 2) {
          const neu = nachschub();
          if (neu.sorte === "rechnung") unten = neu;
        }
        zweiter = nachschub();
      }
      if (zweiter.sorte !== "rechnung") throw new NochNichtGebaut(paket, art);
      const [u1, u2, u3] = [unten.a, unten.b, Math.abs(zweiter.b)];
      const m1 = u1 + u2;
      const m2 = u2 + u3;
      const oben = m1 + m2;
      const angabe = `${LUECKE}\n${zahl(m1)} | ${LUECKE}\n${zahl(u1)} | ${zahl(u2)} | ${zahl(u3)}`;
      return { paket, art, op: "plus", angabe, loesung: `${zahl(oben)} und ${zahl(m2)}`, auchRichtig: [`${zahl(oben)}, ${zahl(m2)}`, `${zahl(oben)} ${zahl(m2)}`], zahlen: [u1, u2, u3] };
    }

    case "fehler_finden": {
      // Drei gerechnete Aufgaben, eine ist falsch. Welche?
      //
      // ★ Der falsche Wert wird nicht gewürfelt, sondern aus einem echten
      // Fehlermuster gebaut (um eins daneben, um zehn daneben, Ziffern
      // vertauscht). Ein zufälliger Unsinn wäre zu leicht zu finden und
      // übte nichts.
      // ★ Die Form sagt, was sie kann: drei Zeilen zum Nachrechnen gehen nur
      // mit ganzen Zahlen. Ein Bruchterm oder eine Vorrangaufgabe liesse sich
      // zwar hinschreiben, aber das „um eins daneben" waere dort kein echter
      // Kinderfehler mehr. Solche Pakete bekommen eine andere Form.
      const kerne = [kern, nachschub(), nachschub()].filter(
        (k): k is Extract<Kern, { sorte: "rechnung" }> =>
          k.sorte === "rechnung" && Number.isInteger(k.a) && Number.isInteger(k.b) && Number.isInteger(k.ergebnis),
      );
      if (kerne.length < 3) throw new NochNichtGebaut(paket, art);
      const falsch = Math.floor(rng() * 3);
      const zeilen = kerne.map((k, i) => {
        const wert = i === falsch
          ? (k.rest !== undefined ? `${zahl(danebenliegend(k.ergebnis, rng))} (${k.rest} Rest)` : zahl(danebenliegend(k.ergebnis, rng)))
          : ergebnisText(k);
        return `${i + 1}) ${rechnung(k.a, k.op, k.b)}${wert}`;
      });
      return {
        paket, art, op,
        angabe: `Welche Zeile stimmt nicht?\n${zeilen.join("\n")}`,
        loesung: String(falsch + 1),
        zahlen: kerne.flatMap((k) => [k.a, k.b]),
      };
    }

    case "strategiewahl": {
      // Der Weg wird gefragt, nicht das Ergebnis.
      //
      // ★ Das ist der Aufgabentyp, den keines der Schulbücher als eigenes
      // Format führt und den die Fachdidaktik am dringendsten fordert:
      // gleiche richtige Ergebnisse können aus sehr verschiedenen Wegen
      // stammen, und der Weg ist das, worauf es ankommt.
      //
      // ★★ Der richtige Weg wird aus den ZAHLEN bestimmt, nicht aus dem
      // Paketnamen. „701 -698" verlangt Ergänzen, „734 -251" nicht - und die
      // Aufgabe wäre wertlos, wenn die Antwort nicht an den Zahlen hinge.
      const wege = wegeFuer(kern, strategien);
      if (wege.length < 2) throw new NochNichtGebaut(paket, art);
      const reihenfolge = gemischt(rng, wege.map((w, i) => ({ w, richtig: i === 0 })));
      const marken = ["a", "b", "c", "d"];
      const zeilen = reihenfolge.map((e, i) => `${marken[i]}) ${e.w}`);
      const richtig = marken[reihenfolge.findIndex((e) => e.richtig)];
      return {
        paket, art, op,
        angabe: `${rechnung(a, op, b)}\nWie rechnest du das am besten?\n${zeilen.join("\n")}`,
        loesung: richtig,
        auchRichtig: [wege[0]],
        zahlen,
      };
    }

    case "zeilen": {
      // ★ Schriftliches Rechnen in Zeilen, keine Spalten. Die Angabe ist die
      // gewöhnliche Zeile; der WEG hängt daran und wird nur auf Wunsch
      // gezeigt. Wer ihn automatisch einblendet, nimmt dem Kind das Rechnen ab.
      const gerechnet = zeilenWeg(a, op, b);
      if (!gerechnet) throw new NochNichtGebaut(paket, art);
      return {
        paket, art, op,
        angabe: rechnung(a, op, b),
        loesung: gerechnet.ergebnis,
        auchRichtig: gerechnet.auchRichtig,
        weg: gerechnet.schritte,
        zahlen,
      };
    }

    case "ueberschlag": {
      // Schranken statt einer Schätzung: die Antwort ist eindeutig prüfbar.
      const stufe = schrankenStufe(kern.ergebnis);
      const unten = Math.floor(kern.ergebnis / stufe) * stufe;
      return {
        paket, art, op,
        angabe: `${rechnung(a, op, b)}\nZwischen welchen ${stufenName(stufe)}?`,
        loesung: `${zahl(unten)} und ${zahl(unten + stufe)}`,
        auchRichtig: [`${zahl(unten)}, ${zahl(unten + stufe)}`, `${zahl(unten)} ${zahl(unten + stufe)}`],
        zahlen,
      };
    }

    default:
      throw new NochNichtGebaut(paket, art);
  }
}

/**
 * Die Wege, unter denen ein Kind wählt - in seiner Sprache, kurz.
 * Der erste ist der richtige; er ergibt sich aus den Zahlen.
 */
const WEGE = {
  verdoppeln: "Verdoppeln",
  nachbar: "Nachbaraufgabe",
  ergaenzen: "Zum Zehner ergänzen",
  glatt: "Auf glatte Zahl runden",
  tausch: "Tauschaufgabe",
  stellen: "In Stellen zerlegen",
  schritt: "Schrittweise rechnen",
  halbieren: "Halbieren",
  reihe: "Aus der Malreihe",
} as const;

/** Wie weit ist die Zahl von der nächsten glatten Zahl entfernt? */
function abstandGlatt(n: number): number {
  const stufe = Math.abs(n) < 100 ? 10 : Math.abs(n) < 1000 ? 100 : 1000;
  const rest = Math.abs(n) % stufe;
  return Math.min(rest, stufe - rest);
}

/**
 * Welcher Weg lohnt bei diesen Zahlen? Die Reihenfolge der Prüfungen ist die
 * didaktische Rangfolge - was am meisten spart, steht oben.
 */
export function besterWeg(k: Extract<Kern, { sorte: "rechnung" }>): keyof typeof WEGE {
  const { op, a, b } = k;
  if (op === "plus" || op === "minus") {
    if (op === "plus" && a === b) return "verdoppeln";
    if (op === "plus" && Math.abs(a - b) === 1 && Math.min(a, b) >= 3) return "nachbar";
    // Ergänzen lohnt, wenn die beiden Zahlen nah beieinander liegen -
    // 701 minus 698 ist ein Ergänzungsweg, 734 minus 251 nicht.
    if (op === "minus" && a - b >= 0 && a - b <= 20 && b >= 20) return "ergaenzen";
    if (op === "minus" && Math.abs(a - b) <= 5) return "ergaenzen";
    if (abstandGlatt(b) <= 3 || abstandGlatt(a) <= 3) return "glatt";
    if (op === "plus" && a < b) return "tausch";
    if (b % 10 === 0 || a % 10 === 0) return "stellen";
    return "schritt";
  }
  if (op === "mal") {
    if (a === 2 || b === 2) return "verdoppeln";
    if (a === 10 || b === 10 || a % 10 === 0 || b % 10 === 0) return "stellen";
    return "reihe";
  }
  if (b === 2) return "halbieren";
  if (b % 10 === 0) return "stellen";
  return "reihe";
}

/**
 * Drei Wege zur Auswahl: der richtige zuerst, dazu zwei, die bei DIESEN
 * Zahlen nicht lohnen. Übergebene Wege gehen vor - so kann ein Paket eigene
 * anbieten.
 */
function wegeFuer(k: Extract<Kern, { sorte: "rechnung" }>, vorgabe?: string[]): string[] {
  if (vorgabe && vorgabe.length >= 3) return vorgabe;
  const richtig = besterWeg(k);
  // ★ Die falschen Wege müssen zur Rechenart passen. „Aus der Malreihe
  // ableiten" als Auswahl bei einer Plusaufgabe wäre keine Wahl, sondern
  // ein Hinweis.
  //
  // ★ Und sie müssen zur RECHENART passen, nicht nur zur Familie: „Verdoppeln"
  // unter einer Minusaufgabe ist kein Weg, sondern ein Fremdkörper - beim
  // Minus heißt der Zwilling „Halbieren". Gemessen am 23.09.2026 in 3-07.
  const plus: (keyof typeof WEGE)[] = ["verdoppeln", "nachbar", "glatt", "tausch", "stellen", "schritt"];
  // ⚠️ Kein „Halbieren" und kein „Verdoppeln" beim Minus: der Stoffplan führt
  // beide unter Plus und Geteilt (1-06, 1-07). Und keine „Tauschaufgabe" -
  // die Subtraktion ist nicht vertauschbar.
  const minus: (keyof typeof WEGE)[] = ["ergaenzen", "nachbar", "glatt", "stellen", "schritt"];
  const punkt: (keyof typeof WEGE)[] = ["verdoppeln", "halbieren", "stellen", "reihe"];
  const familie = k.op === "plus" ? plus : k.op === "minus" ? minus : punkt;
  const andere = familie.filter((w) => w !== richtig);
  // ★ Die Ablenker wechseln mit den Zahlen. Wären es immer dieselben zwei,
  // hätte ein Kind die Aufgabe nach drei Runden durch, ohne je einen Weg
  // angesehen zu haben.
  //
  // ★ Eine GANZE Zahl. Bei Dezimalzahlen war `a + b` krumm, `andere[7.3]`
  // ergab `undefined` - und 5-18 bot „c) undefined" als Weg an (gemessen
  // 23.09.2026).
  const versatz = Math.abs(Math.round((k.a + k.b) * 1000));
  const erste = andere[versatz % andere.length];
  const zweite = andere.filter((w) => w !== erste)[(versatz + 1) % Math.max(1, andere.length - 1)];
  return [WEGE[richtig], WEGE[erste], WEGE[zweite ?? andere[0]]];
}

/** Welche Schranken passen zur Größe des Ergebnisses? */
function schrankenStufe(ergebnis: number): number {
  const betrag = Math.abs(ergebnis);
  if (betrag < 100) return 10;
  if (betrag < 1000) return 100;
  if (betrag < 10000) return 1000;
  return 10000;
}

function stufenName(stufe: number): string {
  return stufe === 10 ? "Zehnern" : stufe === 100 ? "Hundertern" : stufe === 1000 ? "Tausendern" : "Zehntausendern";
}

function wortFuer(op: Operation): string {
  return op === "plus" ? "plus" : op === "minus" ? "minus" : op === "mal" ? "mal" : "durch";
}

/** Eine Rechnung ausführen. */
function rechne(op: Operation, a: number, b: number): number {
  switch (op) {
    case "plus": return a + b;
    case "minus": return a - b;
    case "mal": return a * b;
    case "geteilt": return b === 0 ? a : a / b;
    default: return a;
  }
}

function rechneAn(start: number, k: Extract<Kern, { sorte: "rechnung" }>): number {
  switch (k.op) {
    case "plus": return start + k.b;
    case "minus": return start - k.b;
    case "mal": return start * k.b;
    case "geteilt": return k.b === 0 ? start : start / k.b;
    default: return start;
  }
}

/** Ein falsches Ergebnis - mit Rest, wenn die Aufgabe einen hat. */
function falscherText(k: Extract<Kern, { sorte: "rechnung" }>, rng: Zufall): string {
  if (k.rest !== undefined) {
    // Mal der Quotient daneben, mal der Rest - beides sind echte Kinderfehler.
    return rng() < 0.5
      ? `${zahl(k.ergebnis + 1)} (${k.rest} Rest)`
      : `${zahl(k.ergebnis)} (${k.rest + 1} Rest)`;
  }
  return zahl(danebenliegend(k.ergebnis, rng));
}

/**
 * Ein falsches Ergebnis, das plausibel danebenliegt - nicht irgendeine Zahl.
 * Um eins daneben, um zehn daneben oder Ziffern vertauscht: genau die Fehler,
 * die Kinder wirklich machen.
 */
function danebenliegend(richtig: number, rng: Zufall): number {
  const wege = [richtig + 1, richtig - 1, richtig + 10, richtig - 10, ziffernTausch(richtig)];
  const brauchbar = gemischt(rng, wege).filter((z) => z !== richtig && z >= 0);
  return brauchbar.length ? brauchbar[0] : richtig + 1;
}

function ziffernTausch(n: number): number {
  const s = String(n);
  if (s.length < 2) return n + 1;
  const t = s.slice(0, -2) + s[s.length - 1] + s[s.length - 2];
  return Number(t);
}
