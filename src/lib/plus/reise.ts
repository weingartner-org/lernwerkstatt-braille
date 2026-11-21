/**
 * Die Reise - was am Ende einer Etappe des Jahresweges steht.
 *
 * Entwurf: (Entwurf, nicht veröffentlicht) (16.10.2026,
 * Johannes: „Passt. Baue Die Reise ...").
 *
 * Eine Etappe ist ein Paket der Stufe, das jetzt SITZT (`jahresweg.ts`). Wer
 * eine Etappe schafft, liest eine kurze Szene. Zwei Tonlagen, weil dasselbe
 * Wort für ein Kind der 2. und eines der 7. Schulstufe nicht gleich ankommt:
 *
 *   · Stufe 1-4 eine Geschichte (Ort für Ort zum Leuchtturm),
 *   · Stufe 5-8 eine Fallreihe (Akten), sachlich, ohne Lob und ohne Märchen.
 *
 * ★ Alles ist Text und steht in der Live-Region wie in der Karte. Es gibt
 * keine Zeit, keine Reihung und nichts, das verfällt: Die Szene ist eine
 * Belohnung für das Geschaffte, kein Druck, weiterzumachen.
 *
 * ★ In den Szenen stehen KEINE Rechnungen. Rechenzeilen haben eine feste
 * Schreibweise (CLAUDE.md), und eine Szene, die sie nachahmt, könnte von ihr
 * abweichen. Der Stoff der Etappe steht als Paketname daneben.
 */
import { paket, paketeDerStufe } from "./stoffplan";

export type Tonlage = "geschichte" | "akte";

export interface Szene {
  ort: string;
  text: string[];
}

/** Bis zur 4. Schulstufe eine Geschichte, danach Akten. */
export function tonlage(stufe: number): Tonlage {
  return stufe <= 4 ? "geschichte" : "akte";
}

const GESCHICHTE: readonly Szene[] = [
  { ort: "Der Hafen", text: ["Du stehst im Hafen.", "Ein altes Boot wartet auf dich."] },
  { ort: "Die Insel", text: ["Das Boot bringt dich auf eine Insel.", "Dort steht ein Leuchtturm."] },
  { ort: "Die schwere Tür", text: ["Die Tür des Turms klemmt.", "Du schiebst mit aller Kraft. Sie geht auf."] },
  { ort: "Die Muscheln", text: ["Im Flur liegen viele Muscheln.", "Du sammelst sie in Körbe."] },
  { ort: "Die Treppe", text: ["Die Treppe hat viele Stufen.", "Du zählst leise mit."] },
  { ort: "Die Werkstatt", text: ["Hier liegen Zahnräder und Draht.", "Etwas fehlt noch."] },
  { ort: "Das Fernrohr", text: ["Du schaust durch das Fernrohr.", "Weit draußen blinkt ein Licht."] },
  { ort: "Die Karte", text: ["In einer Kiste liegt eine Karte.", "Sie zeigt einen geheimen Raum."] },
  { ort: "Der geheime Raum", text: ["Hinter dem Regal ist eine Tür.", "Dahinter liegt eine Glaslinse."] },
  { ort: "Die Linse", text: ["Die Linse ist staubig.", "Du putzt sie, bis sie glänzt."] },
  { ort: "Die Lampe", text: ["Du setzt die Linse in die Lampe.", "Sie wackelt noch ein bisschen."] },
  { ort: "Das Licht", text: ["Die Lampe leuchtet!", "Das Licht reicht weit aufs Meer.", "Eine neue Reise beginnt."] },
];

const AKTEN: readonly Szene[] = [
  { ort: "Der Auftrag", text: ["Ein Archiv meldet einen Fehler.", "Eine Akte ist verschwunden."] },
  { ort: "Das Besucherbuch", text: ["Das Buch zeigt zwei Einträge ohne Namen.", "Beide stammen vom selben Tag."] },
  { ort: "Der Keller", text: ["Im Keller brennt noch Licht.", "Jemand war vor kurzem hier."] },
  { ort: "Der Brief", text: ["Im Regal liegt ein Brief ohne Absender.", "Auf dem Umschlag steht nur eine Zahl."] },
  { ort: "Die Spur", text: ["Die Zahl führt zu einem Schließfach im Bahnhof.", "Der Schlüssel fehlt."] },
  { ort: "Der Schlüssel", text: ["Der Schlüssel steckt in einem Buch.", "Das Buch steht an der falschen Stelle."] },
  { ort: "Das Schließfach", text: ["Im Fach liegt ein Foto.", "Auf der Rückseite steht ein Datum."] },
  { ort: "Das Datum", text: ["Das Datum passt zu keinem Eintrag.", "Eine Seite muss ausgetauscht worden sein."] },
  { ort: "Die Druckerei", text: ["Die Seite wurde in einer Druckerei gesetzt.", "Die Betreiberin erinnert sich."] },
  { ort: "Die Aussage", text: ["Sie beschreibt eine Person im grauen Mantel.", "Mehr weiß sie nicht."] },
  { ort: "Der Mantel", text: ["Der Mantel hängt in der Garderobe des Archivs.", "In der Tasche steckt die Akte."] },
  { ort: "Der Abschluss", text: ["Die Akte ist wieder da.", "Der Fall ist gelöst.", "Ein neuer Auftrag liegt im Postfach."] },
];

/**
 * Die Szene der n-ten Etappe (ab 1). Hat die Stufe mehr Etappen, als die
 * Reihe Szenen hat, beginnt die Reihe von vorn - die Orte heißen dann gleich,
 * die Zählung läuft weiter.
 */
export function szene(stufe: number, nr: number): Szene {
  const reihe = tonlage(stufe) === "geschichte" ? GESCHICHTE : AKTEN;
  return reihe[(Math.max(1, nr) - 1) % reihe.length];
}

/** Das Wort für eine Etappe: „Etappe" in der Geschichte, „Fall" in den Akten. */
export function etappenWort(stufe: number): string {
  return tonlage(stufe) === "geschichte" ? "Etappe" : "Fall";
}

/** Die Überschrift der Szene: „Ort 4: Die Muscheln" oder „Akte 4: Der Brief". */
export function szenenTitel(stufe: number, nr: number): string {
  const wort = tonlage(stufe) === "geschichte" ? "Ort" : "Akte";
  return `${wort} ${nr}: ${szene(stufe, nr).ort}`;
}

export interface EtappeFertig {
  stufe: number;
  /** Nummer der Etappe in der Stufe, ab 1. */
  nr: number;
  gesamt: number;
  paketName: string;
  /** Der Stoff der nächsten Etappe - leer, wenn die Stufe fertig ist. */
  naechste: string;
}

/**
 * Welche Etappe ist neu geschafft? `vorher` sind die Pakete, die vor der Runde
 * schon saßen, `jetzt` die, die jetzt sitzen. Kommen mehrere zugleich dazu,
 * zählt die erste in der Reihenfolge des Stoffplans.
 */
export function neueEtappe(vorher: ReadonlySet<string>, jetzt: ReadonlySet<string>): EtappeFertig | null {
  const neu = [...jetzt].filter((id) => !vorher.has(id));
  if (neu.length === 0) return null;
  const stufe = Number(neu[0].split("-")[0]);
  const liste = paketeDerStufe(stufe);
  const erste = liste.find((p) => neu.includes(p.id));
  if (!erste) return null;
  const nr = liste.findIndex((p) => p.id === erste.id) + 1;
  const weiter = liste.slice(nr).find((p) => !jetzt.has(p.id));
  return { stufe, nr, gesamt: liste.length, paketName: paket(erste.id).name, naechste: weiter?.name ?? "" };
}

/** Der Satz für die Live-Region und die Braillezeile - kurz. */
export function etappenSatz(e: EtappeFertig): string {
  return `${etappenWort(e.stufe)} ${e.nr} von ${e.gesamt} geschafft: ${e.paketName}.`;
}

/** Alle Szenen bis zur n-ten, für „Die Reise bisher lesen". */
export function reiseBisher(stufe: number, bis: number): { titel: string; text: string }[] {
  const liste: { titel: string; text: string }[] = [];
  for (let nr = 1; nr <= bis; nr += 1) {
    liste.push({ titel: szenenTitel(stufe, nr), text: szene(stufe, nr).text.join(" ") });
  }
  return liste;
}
