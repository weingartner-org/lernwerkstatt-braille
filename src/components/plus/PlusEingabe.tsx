/**
 * Das Eingabefeld von Plus - Zahlen tippen oder Braille greifen.
 *
 * ★ Warum das Feld zwei Gesichter hat: Ein Kind, das auf einer
 * Punktschriftmaschine schreiben gelernt hat, tippt Zahlen anders als eines,
 * das die Zifferntasten benutzt. Mit Alt + B schaltet das Feld um, und zwar
 * auf zwei Arten Braille - Computerbraille (acht Punkte, ein Zeichen ist ein
 * Zeichen) und die Marburger Mathematikschrift (sechs Punkte, mit Zahlzeichen
 * und gesenkten Ziffern). Beide sind gleichwertig; das Kind wählt.
 *
 * ★ Im Feld stehen in der Brailleeingabe die ZELLEN, nicht die Übersetzung.
 * Das ist Absicht: auf der Braillezeile liest das Kind damit genau das, was
 * es gegriffen hat, und kann seinen eigenen Fehler finden. Was Plus daraus
 * liest, steht darunter in einer Zeile - und wird von der Stimme gesagt.
 *
 * Die Mechanik des Griffs kommt aus `useBrailleChord` (Punktgenau): mehrere
 * Tasten gleichzeitig, fertig ist die Zelle, wenn die letzte losgelassen wird.
 *
 * ★★★ DIE RECHNUNG STEHT IM FELD (Johannes, 25.09.2026). Trägt die Aufgabe
 * eine Rechenzeile (`6 +[] =10`, `48 +27 =`), steht sie schon da, wenn das
 * Kind ankommt, und die Schreibmarke sitzt in der Lücke oder hinter dem `=`.
 * Beim schriftlichen Rechnen macht die Eingabetaste eine neue Zeile; geprüft
 * wird dann mit Alt + P (wie im eine andere App der Plattform ) oder Strg + Eingabetaste.
 *
 * ★★ Das Feld ist ein `<textarea>`, auch wenn es einzeilig ist. Gemessen am
 * 10.09.2026 mit echtem NVDA: nur ein mehrzeiliges Feld steht auf der
 * Braillezeile hart links. Vor einem `<input>` schiebt NVDA seinen
 * Fokuskontext („lernen dok spmk Haupt ef"), und die Rechnung rutscht unter
 * den lesenden Fingern weg ([[reference_nvda_fokuskontext_textarea_hart_links]]).
 */
import { altAnzeige } from "@/lib/altTaste";
import { doppelUmschaltSchritt, type DoppelStand } from "@/lib/computer/doppelUmschalt";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { useBrailleChord } from "@/components/braille/useBrailleChord";
import { cellToUnicode } from "@/lib/braille";
import { brailleZuText, zeichenZuBraille } from "@/lib/plus/braille/computerbraille";
import { matheCodeFuer, type MatheCode } from "@/lib/plus/braille/matheCode";
import { plusSprache } from "@/lib/plus/aktuelleSprache";
import { plusTexte, usePlusLang, usePlusTexte } from "@/lib/plus/sprache";
import { BRAILLE_LEER, punkteText, zeichenZuPunkte } from "@/lib/plus/braille/punkte";
import { EINGABEART_NAME, naechsteArt, useEinstellungen, type Eingabeart } from "@/lib/plus/einstellungen";
import { FELDBREITE, brecheUm } from "@/lib/plus/umbruch";
import { laufweiteFeld, laufweiteText, useDeviceZeichenabstand } from "@/lib/typing/zeichenabstand";
import { HakenZeichen, NochmalZeichen } from "./PlusZeichen";

// Die Eingabeart kommt aus den Einstellungen - von hier weiter exportiert,
// weil andere Dateien und Tests sie von dieser Datei importieren.
export type { Eingabeart };
export { EINGABEART_NAME, naechsteArt };

/**
 * Der Mathe-Code der Sprache, in der Plus gerade läuft: de Marburger
 * Mathematikschrift (unverändert), en UEB. Der gespeicherte Name der Eingabeart
 * bleibt `"marburger"` - er heißt „die Mathematikschrift der Sprache".
 */
function aktuellerCode(): MatheCode {
  return matheCodeFuer(plusSprache());
}

/**
 * Was Plus aus den Zellen liest - und was daran auffiel.
 *
 * ★ Zeile für Zeile: beim schriftlichen Rechnen stehen mehrere da, und jede
 * beginnt in der Mathematikschrift neu (ein Zahlzeichen gilt nicht über das
 * Zeilenende hinweg).
 */
export function uebersetze(zellen: string, art: Eingabeart): { text: string; hinweise: string[] } {
  if (zellen.includes("\n")) {
    const teile = zellen.split("\n").map((z) => uebersetze(z, art));
    return { text: teile.map((t) => t.text).join("\n"), hinweise: teile.flatMap((t) => t.hinweise) };
  }
  // ★ Steht Schrift im Feld, die nicht aus Zellen besteht (Text einer Aufgabe, die
  // sich nicht in Punktschrift vorschreiben lässt), geht sie unverändert durch -
  // nur die Zellen dazwischen werden gelesen. Die Braillezeile zeigt diesen Text
  // in der Tabelle des Kindes.
  if (/[^⠀-⣿]/.test(zellen)) {
    const teile = zellen.split(/([⠀-⣿]+)/).filter((t) => t !== "").map((t) =>
      /^[⠀-⣿]+$/.test(t) ? uebersetze(t, art) : { text: t, hinweise: [] as string[] });
    return { text: teile.map((t) => t.text).join(""), hinweise: teile.flatMap((t) => t.hinweise) };
  }
  if (art === "computer") return { text: brailleZuText(zellen), hinweise: [] };
  if (art === "marburger") {
    const l = aktuellerCode().lese(zellen, "streng", plusTexte().hinweise);
    return { text: l.text, hinweise: l.hinweise.map((h) => h.text) };
  }
  return { text: zellen, hinweise: [] };
}

/**
 * Die Rechenzeile in Zellen, so wie ein Kind sie greifen würde - und wo die
 * Schreibmarke dann steht. Seit 19.10.2026 gibt es immer eine Zeile (`null` nur
 * nie): was sich nicht in Zellen schreiben lässt, steht als Text im Feld.
 *
 * ★ Computerbraille ist Zeichen für Zeichen: die Lücke `[]` hat ihre Zellen,
 * und die Schreibmarke kommt zwischen die Klammern wie in der Textzeile.
 *
 * ⚠️ Die Mathematikschrift kennt für den Platzhalter `[]` KEINE Norm (Kap.
 * 15.1, siehe `schreibeMarburger`): die Klammern fallen weg, die Marke sitzt
 * in der Lücke. Wörter und Fragezeichen kann sie nicht - dann steht die Zeile
 * mit den Klammern als Text da.
 *
 * Mit `umbrechen` bricht die Zeile bei 40 Zeichen um (`umbruch.ts`).
 */
export function vorlageInZellen(
  vorlage: string,
  marke: number,
  art: Eingabeart,
  opt?: { umbrechen?: boolean; erwartet?: number; breite?: number },
): { zellen: string; marke: number } | null {
  if (art === "normal") return { zellen: vorlage, marke };
  // ★ Mit Braillezeile ist das Feld höchstens 40 Zeichen breit; die Umbrüche setzt
  // `brecheUm` (gleiche Länge - die Marke bleibt gültig).
  const feldbreite = opt?.breite ?? FELDBREITE;
  const umbruch = (breite: number = feldbreite) => (opt?.umbrechen ? brecheUm(vorlage, opt.erwartet, breite) : vorlage);
  if (art === "computer") {
    const v = umbruch();
    const zellen = [...v].map((z) => (z === "\n" ? "\n" : zeichenZuBraille(z)));
    // ★ Was die Tabelle nicht kennt (`?`, `'`, `|`), lässt sich nicht in Zellen vorschreiben.
    // Dann steht die Zeile als Text im Feld - sie fehlt nie.
    if (zellen.some((z) => z === null)) return { zellen: v, marke };
    return { zellen: zellen.join(""), marke };
  }
  // ★ Die Mathematikschrift hat kein Zeichen für die Lücke - die Klammern
  // fallen weg, die Rechnung steht trotzdem da (`6 +[] =10` ⇒ `6 + =10`),
  // und die Schreibmarke kommt an die Stelle der ersten Lücke. Das Kind
  // greift seine Zahl dort hinein; gelesen wird `6 +4 =10`, und die
  // Prüfung nimmt auch die Zeile ohne Klammern an (Wächter:
  // `tests/plus-marburger-vorlage.test.ts`). Wörter kann sie nicht: dann Text.
  const schreibe = (t: string): string | null => {
    const code = aktuellerCode();
    const zeilen = t.split("\n").map((z) => code.schreibe(z));
    return zeilen.some((z) => z === null) ? null : zeilen.join("\n");
  };
  // Zahlzeichen machen die Zellenzeile länger als den Text: so lange enger umbrechen,
  // bis keine Zeile über 40 Zellen hat.
  let v = umbruch();
  let zellen = schreibe(v.split("[]").join(""));
  for (let breite = feldbreite - 1; opt?.umbrechen && zellen !== null && breite > 12; breite--) {
    if (zellen.split("\n").every((z) => z.length <= feldbreite)) break;
    v = umbruch(breite);
    zellen = schreibe(v.split("[]").join(""));
  }
  if (zellen === null) return { zellen: umbruch(), marke };
  const luecke = v.indexOf("[]");
  if (luecke < 0) return { zellen, marke: zellen.length };
  const davor = schreibe(v.slice(0, luecke));
  return { zellen, marke: Math.min(davor?.length ?? zellen.length, zellen.length) };
}

export interface PlusEingabeProps {
  /** Die Antwort in der Schreibweise von Plus. */
  wert: string;
  onWert: (wert: string) => void;
  art: Eingabeart;
  onArt: (art: Eingabeart) => void;
  /** Eingabetaste (einzeilig), Alt + P oder Strg + Eingabetaste - die Antwort prüfen. */
  onPruefen: () => void;
  /** Die Stimme der App. Ohne sie bleibt es still. */
  ansagen?: (satz: string) => void;
  feldRef?: RefObject<HTMLTextAreaElement>;
  /** Beschriftung des Feldes - sie steht sichtbar darüber. */
  beschriftung?: string;
  /**
   * Die Kennung des Elements, das die Aufgabe trägt.
   *
   * ★ Warum das kein Widerspruch zur Regel „kein `aria-label` am
   * Rechenausdruck" ist: Das Label ERSETZT den Ausdruck und nimmt ihm das
   * Lesen Zeichen für Zeichen. Ein `aria-describedby` am EINGABEFELD lässt
   * den Ausdruck, wie er ist - es sorgt nur dafür, dass eine Sprachausgabe
   * die Aufgabe noch einmal sagt, wenn der Fokus im Feld landet. Ohne das
   * steht ein Kind ohne die Stimme von Plus im Feld und weiß nicht, was zu
   * rechnen ist.
   */
  beschriebenVon?: string;
  /**
   * Die Rechenzeile, die schon im Feld steht, wenn die Aufgabe kommt
   * (`6 +[] =10`). Leer heisst: das Feld beginnt leer.
   */
  vorlage?: string;
  /** Wo die Schreibmarke in der Vorlage steht. Ohne Angabe: am Ende. */
  marke?: number;
  /**
   * Ändert sich dieser Wert, kommt eine neue Aufgabe - und die Vorlage wird
   * neu hingeschrieben. Meist ist es die Aufgabe selbst.
   */
  neuBei?: unknown;
  /**
   * ★ Zählt hoch, wenn die Rechnung zurück ins Feld soll - wie Alt + Z, aber
   * von aussen (Umschalt zweimal, Johannes 17.10.2026: „die Rechnung muss neu
   * im Eingabefeld zurückgestellt werden, nicht nur neu vorgelesen").
   */
  zurueckBei?: number;
  /** Schriftlich rechnen: die Eingabetaste macht eine neue Zeile. */
  mehrzeilig?: boolean;
  /**
   * Wie lang die Antwort voraussichtlich wird (Zeichen der Lösung). Mit
   * Braillezeile setzt `brecheUm` danach den Zeilenumbruch, damit die Zeile mit
   * der Lücke auch mit der Antwort höchstens 40 Zeichen hat.
   */
  erwartet?: number;
  /**
   * Zählt hoch, wenn die Antwort richtig war: der Rahmen blinkt dann kurz
   * grün (Johannes, 12.10.2026). Nur Zusatz - Ton, Ansage und Meldung sagen
   * es auch, Farbe ist nie die einzige Info.
   */
  blitz?: number;
  /**
   * Die Antwort war falsch und steht noch unverändert da: gestrichelter
   * Rand, warmer Grund, kurzes leises Zittern und das Zeichen „noch einmal"
   * (Johannes, 16.10.2026: „bei falscher einen anderen" Effekt). Nur Zusatz -
   * der Satz darunter sagt es auch, Farbe ist nie die einzige Info. Kein Rot,
   * kein Kreuz: es darf noch einmal versucht werden.
   */
  falsch?: boolean;
  /**
   * Die Zeile direkt unter dem Feld - dort steht die Rückmeldung. Es ist die
   * EINE Live-Region der Seite; sie gehört dem Aufrufer, hier liegt nur ihr
   * Platz.
   */
  statusZeile?: ReactNode;
  /** Links neben der Lesung unter dem Feld - etwa „Aufgabe noch einmal ansagen". */
  linksUnten?: ReactNode;
  /** Weitere Zeilen für die Tastenhilfe, die der Aufrufer kennt. */
  tastenExtra?: string[];
  /**
   * ★ Umschalt zweimal im Feld stellt die Rechnung zurück (Vorgabe). Die Übung
   * (`PlusUebung`) setzt `false`: Sie hört selbst seitenweit auf den Griff,
   * sagt die Aufgabe dazu und stellt zurück - sonst geschähe es doppelt.
   */
  umschaltZurueck?: boolean;
}

/** Die Tastenhilfe zu diesem Feld - dieselben Sätze wie bisher, nur aufklappbar. */
export function tastenHinweise(opt: { mehrzeilig: boolean; mitVorlage: boolean; extra?: string[] }): string[] {
  return [
    plusTexte().eingabe.tasteArt,
    plusTexte().eingabe.tasteGroesse,
    ...(opt.mehrzeilig ? [plusTexte().eingabe.tasteZeile] : []),
    ...(opt.mitVorlage && !opt.extra?.some((z) => /Umschalt|Shift/.test(z)) ? [plusTexte().eingabe.tasteZurueck] : []),
    ...(opt.extra ?? []),
  ].map((z) => altAnzeige(z)); // am Mac „Wahl" (18.10.2026)
}

export function PlusEingabe({
  wert, onWert, art, onPruefen, ansagen, feldRef,
  beschriftung: beschriftungProp, beschriebenVon,
  vorlage = "", marke, neuBei, zurueckBei = 0, mehrzeilig = false, erwartet, blitz = 0,
  falsch = false, statusZeile, linksUnten, tastenExtra, umschaltZurueck = true,
}: PlusEingabeProps) {
  const texte = usePlusTexte();
  // ★ Testerin 10.11.2026 (JAWS): das Feld sagt selbst, welche Sprache gefragt ist - auch mit Zellen.
  const lang = usePlusLang();
  const te = texte.eingabe;
  const beschriftung = beschriftungProp ?? te.antwort;
  const [gruen, setGruen] = useState(false);
  useEffect(() => {
    if (!blitz) return;
    setGruen(true);
    // 1,4 s: lang genug, dass man das Häkchen sieht, kurz genug, dass es nicht bleibt.
    const t = window.setTimeout(() => setGruen(false), 1400);
    return () => window.clearTimeout(t);
  }, [blitz]);
  // In der Brailleeingabe führt das Feld die Zellen, nicht den Text.
  const [zellen, setZellen] = useState("");
  const eigenerRef = useRef<HTMLTextAreaElement>(null);
  /** Stand des Doppel-Umschalt-Griffs im Feld (Rechnung zurück). */
  const doppelStand = useRef<DoppelStand>(null);
  const feld = feldRef ?? eigenerRef;
  const braille = art !== "normal";
  const zoom = useEinstellungen((s) => s.zoom);
  const feldbreite = useEinstellungen((s) => s.breite);
  const eingabeweg = useEinstellungen((s) => s.eingabe);
  const cvi = useDeviceZeichenabstand((s) => s.faktor);
  /**
   * Wohin die Schreibmarke nach dem nächsten Zeichnen soll - und ob sie dabei
   * „springen" muss (nur bei einer neuen Aufgabe, siehe unten).
   */
  const markeOffen = useRef<{ stelle: number; springen: boolean } | null>(null);

  const gelesen = useMemo(() => {
    const g = uebersetze(zellen, art);
    // ★ Die Umbrüche, die `brecheUm` setzt, sind nur für die Braillezeile da:
    // die Rechnung ist eine Zeile. Nur beim schriftlichen Rechnen zählen sie.
    return mehrzeilig ? g : { ...g, text: g.text.replace(/\n+/g, " ") };
  }, [zellen, art, mehrzeilig]);

  // Der Wert nach aussen ist immer die Rechenzeile - nie die Zellen.
  useEffect(() => {
    if (braille) onWert(gelesen.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gelesen.text, braille]);

  /** Die Vorlage hinschreiben - in der Art, die gerade gilt. `true`, wenn etwas dasteht. */
  const schreibeVorlage = useCallback((inArt: Eingabeart): boolean => {
    const v = vorlage
      ? vorlageInZellen(vorlage, marke ?? vorlage.length, inArt, { umbrechen: !mehrzeilig, erwartet, breite: feldbreite })
      : null;
    if (inArt === "normal") {
      setZellen("");
      onWert(vorlage);
    } else {
      setZellen(v?.zellen ?? "");
      if (!v) onWert("");
    }
    markeOffen.current = v ? { stelle: v.marke, springen: true } : null;
    return !!v;
  }, [vorlage, marke, onWert, mehrzeilig, erwartet, feldbreite]);

  // ★ Eine neue Aufgabe: die Rechnung steht im Feld, bevor das Kind etwas tut.
  // Dasselbe, wenn die Seite sie zurückholt (`zurueckBei`, Umschalt zweimal).
  useEffect(() => {
    schreibeVorlage(art);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neuBei, vorlage, zurueckBei, feldbreite]);

  /**
   * ★ Die Schreibmarke an ihren Platz - erst nachdem der neue Wert im Feld
   * steht.
   *
   * ⚠️ Gemessen am 12.09.2026 mit echtem NVDA (Tastenflow): NVDA liest einen
   * neuen Wert nur, wenn sich die Schreibmarke BEWEGT. Steht sie vorher und
   * nachher an derselben Stelle - bei zwei gleich langen Rechnungen
   * hintereinander -, bliebe die alte Zeile auf der Braillezeile stehen.
   * Darum erst ein Schritt daneben, dann an die Stelle.
   */
  const markenUhr = useRef<number>();
  useLayoutEffect(() => {
    const ziel = markeOffen.current;
    const el = feld.current;
    if (ziel === null || !el) return;
    const text = braille ? zellen : wert;
    if (el.value !== text) return;
    markeOffen.current = null;
    const stelle = Math.min(ziel.stelle, el.value.length);
    if (!ziel.springen) { el.setSelectionRange(stelle, stelle); return; }
    const daneben = stelle === 0 ? Math.min(1, el.value.length) : 0;
    el.setSelectionRange(daneben, daneben);
    // ⚠️ Kein Aufräumen beim nächsten Zeichnen: das kommt oft innerhalb der
    // 30 ms (der gelesene Wert geht nach aussen), und die Schreibmarke bliebe
    // dann „daneben" stehen.
    window.clearTimeout(markenUhr.current);
    markenUhr.current = window.setTimeout(() => {
      if (el.isConnected) el.setSelectionRange(stelle, stelle);
    }, 30);
  });
  useEffect(() => () => window.clearTimeout(markenUhr.current), []);

  // Beim Umschalten fängt die Eingabe neu an. Zellen und Ziffern lassen sich
  // nicht ineinander überführen, ohne dass etwas verloren geht - also steht
  // die Rechnung wieder da, wie sie kam. Das Umschalten kommt von der Seite
  // (Alt + B) über die Prop `art`; hier wird nur darauf reagiert.
  // ★ Beim allerersten Rendern passiert nichts - nur ein echter Wechsel zählt.
  const zuletzt = useRef<Eingabeart>(art);
  useEffect(() => {
    if (zuletzt.current === art) return;
    zuletzt.current = art;
    const steht = schreibeVorlage(art);
    ansagen?.(te.artAnsage(te.arten[art], steht));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [art]);

  /**
   * Zellen an der Schreibmarke einfügen - nicht am Ende. Die Lücke steht
   * mitten in der Zeile (`6 +[] =10`), und dort wird geschrieben.
   *
   * ★ Gelesen wird der Stand aus dem Feld selbst, nicht aus einem
   * Zustands-Updater: der darf in React zweimal laufen, und dann sagte Plus
   * jedes Zeichen doppelt.
   */
  const einfuegen = (zeichen: string, sagen: boolean) => {
    const el = feld.current;
    const z = el?.value ?? zellen;
    const von = Math.min(el?.selectionStart ?? z.length, z.length);
    const bis = Math.min(el?.selectionEnd ?? von, z.length);
    if (sagen) sageZelle(zeichen, z.slice(0, von));
    markeOffen.current = { stelle: von + zeichen.length, springen: false };
    setZellen(z.slice(0, von) + zeichen + z.slice(bis));
  };

  const loeschen = () => {
    const el = feld.current;
    const z = el?.value ?? zellen;
    const von = Math.min(el?.selectionStart ?? z.length, z.length);
    const bis = Math.min(el?.selectionEnd ?? von, z.length);
    if (von === bis && von === 0) { ansagen?.(z ? te.anfang : te.feldLeer); return; }
    ansagen?.(te.geloescht);
    const ab = von === bis ? von - 1 : von;
    markeOffen.current = { stelle: ab, springen: false };
    setZellen(z.slice(0, ab) + z.slice(bis));
  };

  const sageZelle = (zeichen: string, vorher: string) => {
    // ★ Verglichen wird, was VOR der Schreibmarke steht. Dort ist das neue
    // Zeichen hinzugekommen, auch wenn dahinter noch `] =10` folgt.
    const davor = vorher.slice(vorher.lastIndexOf("\n") + 1);
    const neu = uebersetze(davor + zeichen, art).text;
    const alt = uebersetze(davor, art).text;
    // Ein Zeichen, das nichts schreibt, ist ein Modus - etwa das Zahlzeichen.
    // Dann sagt Plus die Punkte, damit das Kind weiß, dass es angekommen ist.
    if (neu.length > alt.length) ansagen?.(neu.slice(alt.length));
    else ansagen?.(te.punkte(punkteText(zeichenZuPunkte(zeichen)).replace(/-/g, " ")));
  };

  /**
   * ★ Zahlen auf der Tastatur, Ausgabe in Zellen (Johannes, 19.10.2026): Das Kind tippt `5`, im
   * Feld steht die Zelle in seiner Schrift - in 6-Punkt mit Zahlzeichen, wo es eines braucht.
   * Was sich nicht in Zellen schreiben lässt, geht als Zeichen durch.
   */
  const tastatur = braille && eingabeweg === "tastatur";
  const zeichenInZellen = (c: string, davor: string): string => {
    if (art === "computer") return zeichenZuBraille(c) ?? c;
    // Das Zahlzeichen gilt für die ganze Ziffernfolge: aus dem Text davor plus dem neuen
    // Zeichen die Zellen schreiben und nur den Zuwachs nehmen.
    const zeile = davor.slice(davor.lastIndexOf("\n") + 1);
    const text = uebersetze(zeile, art).text;
    const code = aktuellerCode();
    const neu = code.schreibe(text + c);
    const alt = code.schreibe(text);
    if (neu !== null && alt !== null && neu.startsWith(alt)) return neu.slice(alt.length);
    return code.schreibe(c) ?? c;
  };
  const tippe = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (e.key === "Backspace") { e.preventDefault(); loeschen(); return true; }
    if (e.key === "Enter") { e.preventDefault(); if (mehrzeilig) einfuegen("\n", false); else onPruefen(); return true; }
    if (e.key === " ") { e.preventDefault(); einfuegen(BRAILLE_LEER, false); return true; }
    if (e.key.length !== 1) return false;
    e.preventDefault();
    const el = feld.current;
    const z = el?.value ?? zellen;
    const von = Math.min(el?.selectionStart ?? z.length, z.length);
    einfuegen(zeichenInZellen(e.key, z.slice(0, von)), false);
    return true;
  };

  const chord = useBrailleChord({
    enabled: braille && !tastatur,
    eightDot: art === "computer",
    onCommit: (zelle) => einfuegen(cellToUnicode(zelle), true),
    onSpace: () => einfuegen(BRAILLE_LEER, false),
    onBackspace: loeschen,
    onEnter: () => (mehrzeilig ? einfuegen("\n", false) : onPruefen()),
  });

  const aufTaste = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // ★★ Die Rechnung zurückholen (Johannes, 25.09.2026: „wer sich aus
    // Versehen die Angabe löscht, kann sie sich zurückholen - soll eine leichte
    // Tastenkombination sein"). Bis 18.10.2026 Alt + Z (davor Alt + W, bis
    // 28.09. Alt + Leertaste). ★ Seit 18.10.2026 Umschalt zweimal (Johannes:
    // „Alt + Z mach rückgängig" - Alt + Z heißt in allen Lern-Apps „wo bin
    // ich"). In jeder Eingabeart, darum VOR dem Griff; Umschalt allein schreibt
    // nichts, der Griff stört also nichts.
    const schritt = doppelUmschaltSchritt(doppelStand.current, e.nativeEvent, performance.now());
    doppelStand.current = schritt.stand;
    if (schritt.ausgeloest && umschaltZurueck) {
      if (!vorlage) { ansagen?.(te.keineRechnung); return; }
      schreibeVorlage(art);
      ansagen?.(te.rechnungDa);
      return;
    }
    // ★ Alt + P prüft - wie im eine andere App der Plattform , und in jeder Eingabeart. Beim
    // schriftlichen Rechnen ist das der Weg, weil die Eingabetaste eine neue
    // Zeile macht. Strg + Eingabetaste geht auch.
    if ((e.altKey && e.code === "KeyP") || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      onPruefen();
      return;
    }
    if (tastatur) { tippe(e); return; }
    if (braille) { chord.onKeyDown(e); return; }
    if (e.key === "Enter" && !mehrzeilig) { e.preventDefault(); onPruefen(); }
  };

  const inhalt = braille ? zellen : wert;
  // Mit Braillezeile bricht das Feld bei 40 Zeichen um - auch Zeilen, die das Kind länger schreibt.
  const zeilen = braille
    ? inhalt.split("\n").reduce((n, z) => n + Math.max(1, Math.ceil(z.length / feldbreite)), 0)
    : inhalt.split("\n").length;
  // ★ Richtig geht vor falsch: nach einer richtigen Antwort steht die neue
  // Aufgabe da, und das alte „falsch" gehört nicht mehr dazu.
  const tonart = gruen ? "richtig" : falsch ? "falsch" : "offen";
  const hinweise = tastenHinweise({ mehrzeilig, mitVorlage: !!vorlage, extra: tastenExtra });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <label className="block font-bold text-ink" htmlFor="plus-eingabe" style={{ fontSize: `${zoom * 1.25}rem`, lineHeight: 1.25 }}>
          {beschriftung}
        </label>
        {/* ★ Die Eingabeart steht als Marke neben der Beschriftung. Dieselbe Zeile
            beschreibt das Feld (`aria-describedby`), wie vorher die lange Unterzeile. */}
        <span id="plus-eingabe-art" className="rounded-full bg-accent-soft px-3 py-0.5 text-sm font-medium text-accent">
          {te.arten[art]}
        </span>
      </div>
      <div className="relative">
      <textarea
        id="plus-eingabe"
        ref={feld}
        lang={lang}
        // ★ Hier wird gerechnet - die Alt-Kürzel der Kopfzeile (Alt + K, Alt + T)
        // und der Seite (Alt + O, Alt + H, Alt + V) gelten auch im Feld.
        data-kuerzel="an"
        rows={braille ? Math.max(2, zeilen + 1) : mehrzeilig ? Math.max(3, zeilen + 1) : 1}
        wrap={braille ? "soft" : "off"}
        inputMode={braille ? "text" : "decimal"}
        autoComplete="off"
        spellCheck={false}
        data-ton={tonart}
        // Braillezeichen sind als Schriftzeichen klein - wer Restsehen hat,
        // soll die Punkte trotzdem erkennen können. `tt-uebungsschrift`: die
        // Schrift, die das Kind gewählt hat (Tastenflow-Schriftwahl).
        className={
          "tt-uebungsschrift block resize-none rounded-[1.5rem] " +
          (braille ? "overflow-y-auto whitespace-pre-wrap " : "w-full overflow-x-auto whitespace-pre ") +
          "rounded-tr-lg border-[3px] py-3 pl-5 pr-16 font-legible text-ink " +
          (tonart === "richtig"
            ? "plus-fx-richtig border-success bg-success-soft"
            : tonart === "falsch"
              ? "plus-fx-falsch border-dashed border-warning bg-warning-soft"
              : "border-accent bg-surface-raised")
        }
        style={{
          fontSize: `${zoom * (braille ? 2.25 : 1.75)}rem`, lineHeight: 1.3, ...laufweiteFeld(cvi),
          // ★ Mit Braillezeile nie breiter als 40 Zeichen (Johannes, 19.10.2026) - so
          // viel passt auf eine Zeile. Die Breite folgt der Schriftgröße.
          ...(braille ? { width: `calc(${feldbreite}ch + 6.5rem)`, maxWidth: "100%", wordBreak: "break-all" as const } : {}),
          transition: "border-color 150ms, background-color 250ms",
        }}
        value={inhalt}
        onChange={(e) => {
          // Einzeilig bleibt einzeilig, auch wenn etwas mit Zeilenumbruch
          // eingefügt wird.
          // Mit Braillezeile gehören die Umbrüche zum Feld (siehe `brecheUm`).
          const roh = mehrzeilig || braille ? e.target.value : e.target.value.replace(/\n+/g, " ");
          // In der Brailleeingabe kommt der Text aus dem Griff - oder ist die
          // Vorlage selbst (Aufgabentext, den die Punktschrift nicht kennt).
          if (braille) setZellen(roh);
          else onWert(roh);
        }}
        onKeyDown={aufTaste}
        onKeyUp={braille && !tastatur ? chord.onKeyUp : undefined}
        onBlur={braille && !tastatur ? chord.reset : undefined}
        aria-describedby={`${beschriebenVon ? `${beschriebenVon} ` : ""}plus-eingabe-art plus-eingabe-gelesen plus-eingabe-tasten`}
      />
      {/* Das Zeichen im Feld: Häkchen (richtig) oder Pfeil „noch einmal"
          (falsch). Nur fürs Auge; der Satz darunter sagt dasselbe. */}
      {tonart === "richtig" && (
        <span aria-hidden="true" className="plus-fx-zeichen pointer-events-none absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-success text-surface-raised">
          <HakenZeichen />
        </span>
      )}
      {tonart === "falsch" && (
        <span aria-hidden="true" className="plus-fx-zeichen pointer-events-none absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-warning text-surface-raised">
          <NochmalZeichen />
        </span>
      )}
      </div>

      {statusZeile}

      {/* Unter dem Feld: links, was der Aufrufer hinstellt (Ansagen), rechts die
          Lesung der Brailleeingabe - wie eine Antwort-Sprechblase. */}
      {(linksUnten || braille) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">{linksUnten}</div>
          {/* Keine Live-Region: diese Zeile ändert sich bei jedem Zeichen und
              würde die Braillezeile bei jedem Griff überschreiben. Gesagt wird
              das neue Zeichen einzeln, gelesen wird hier in Ruhe. */}
          {braille && (
            <p id="plus-eingabe-gelesen" className="m-0 ml-auto max-w-full rounded-[1.25rem] rounded-br-md bg-accent-soft px-5 py-2 text-lg font-bold text-ink">
              {te.soLese} <span className="tt-uebungsschrift whitespace-pre-line font-legible font-normal" style={laufweiteText(cvi)}>{gelesen.text || te.nochNichts}</span>
            </p>
          )}
        </div>
      )}

      {gelesen.hinweise.length > 0 && (
        <ul className="m-0 list-none space-y-1 p-0 text-sm text-ink-muted">
          {gelesen.hinweise.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}

      {/* ★ Die Tasten stehen weiter da und beschreiben das Feld - nur eingeklappt.
          Wer sie sucht, klappt auf; eine Sprachausgabe liest sie auch zu. */}
      <details className="rounded-2xl border border-hairline bg-surface-raised px-4 py-2 text-ink">
        <summary className="cursor-pointer font-bold">{te.tastenFuer}</summary>
        <ul id="plus-eingabe-tasten" className="m-0 mt-2 list-none space-y-1 p-0 text-sm text-ink-soft">
          {hinweise.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </details>
    </div>
  );
}
