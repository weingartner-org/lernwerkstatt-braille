/**
 * Abzeichen-System „Punktgenau" (abzeichen.ts): Katalog-Integrität, Vergabe
 * aus dem, was Punktgenau schon misst (Etappen, Sterne, Rang, Tagesserie,
 * Bereiche, fehlerfreie Meisterungen, Trefferserien, aktive Tage/Wochen),
 * Geheim-Abzeichen und der stille Nachtrag für Bestandskonten.
 */
import { describe, it, expect } from "vitest";
import {
  ABZEICHEN,
  KATALOG_VERSION,
  awardAbzeichen,
  naechsteZiele,
  verdienteAbzeichen,
  type AbzeichenEreignis,
} from "../src/lib/braille/abzeichen";
import { emptyProgress, type BrailleProgress, type LevelRecord } from "../src/lib/braille/progress";
import { AREAS, etappeRunId } from "../src/lib/braille/areas";

// Mittag, Wochentag ohne Geheim-Nebenwirkung (kein Wochenende, kein Ferienmonat).
const NOON = new Date(2026, 8, 22, 12, 0, 0).getTime(); // Dienstag, 22.09.2026
const NIGHT = new Date(2026, 8, 22, 21, 30, 0).getTime();
const DAWN = new Date(2026, 8, 22, 6, 30, 0).getTime();
const SAMSTAG = new Date(2026, 8, 19, 10, 0, 0).getTime();
const SONNTAG = new Date(2026, 8, 20, 10, 0, 0).getTime();
const JULI = new Date(2026, 6, 15, 12, 0, 0).getTime();

function ereignis(partial: Partial<AbzeichenEreignis> = {}): AbzeichenEreignis {
  return { areaKey: "basis", richtung: "write", ...partial };
}

/**
 * Ein frisches Konto, dessen allererster Aufruf schon hinter ihm liegt (die
 * Katalog-Fassung ist gestempelt, `abzeichen` bleibt leer - ein neues Kind
 * ohne etwas nachzutragen). AB HIER verhält sich jeder weitere Aufruf wie
 * normales Verdienen, NICHT wie der stille Nachtrag eines Bestandskontos -
 * das ist eigens unten getestet (siehe „Stiller Nachtrag").
 */
function frischesKonto(): BrailleProgress {
  return awardAbzeichen(emptyProgress(), ereignis(), NOON - 86_400_000, AREAS).progress;
}

describe("Abzeichen-Katalog", () => {
  it("IDs sind eindeutig, jede Definition vollständig, Umfang 40-60", () => {
    const ids = new Set(ABZEICHEN.map((b) => b.id));
    expect(ids.size).toBe(ABZEICHEN.length);
    expect(ABZEICHEN.length).toBeGreaterThanOrEqual(40);
    expect(ABZEICHEN.length).toBeLessThanOrEqual(60);
    for (const b of ABZEICHEN) {
      expect(b.name.length).toBeGreaterThan(2);
      expect(b.description.length).toBeGreaterThan(8);
      expect(b.emoji.length).toBeGreaterThan(0);
      expect(b.group.length).toBeGreaterThan(0);
      expect(b.bildbeschreibung.length).toBeGreaterThan(2);
    }
  });

  it("Beschreibungen kommen ohne direkte Anrede aus (gilt für jedes Profil)", () => {
    for (const b of ABZEICHEN) {
      expect(b.description, b.id).not.toMatch(/\b(du|dein\w*|dir|dich|Sie|Ihr[e]?)\b/);
    }
  });

  it("nur echte Umlaute, nie ein langer Strich (Braillezeile)", () => {
    for (const b of ABZEICHEN) {
      // \u2013 und \u2014 als Kürzel, damit die Datei die verbotenen Zeichen
      // nicht selbst enthält - sonst fällt sie über ihre eigene Regel.
      expect(b.name + b.description, b.id).not.toMatch(/[\u2013\u2014]/);
      expect(b.name + b.description, b.id).not.toMatch(/\b(ae|oe|ue)\b/i);
    }
  });

  it("acht Geheim-Abzeichen - vor dem Verdienen verrät nichts die Bedingung", () => {
    const geheim = ABZEICHEN.filter((b) => b.secret);
    expect(geheim.length).toBe(8);
    for (const b of geheim) expect(b.group).toBe("Geheim");
  });

  it("je Bereich genau ein Abzeichen (fünf Bereiche)", () => {
    const bereichsIds = ["bereich-basis", "bereich-voll", "bereich-computer", "bereich-kurzschrift", "bereich-ueb"];
    for (const id of bereichsIds) expect(ABZEICHEN.some((b) => b.id === id)).toBe(true);
  });
});

describe("Etappenpfad (gesamt gemeisterte Etappen)", () => {
  it("Tier-Schwellen 1/5 lösen aus, 15 noch nicht", () => {
    const p: BrailleProgress = {
      ...frischesKonto(),
      gemeistertAm: Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`e${i}`, NOON])),
    };
    const { neu } = awardAbzeichen(p, ereignis(), NOON, AREAS);
    const ids = neu.map((b) => b.id);
    expect(ids).toContain("etappe-1");
    expect(ids).toContain("etappe-5");
    expect(ids).not.toContain("etappe-15");
  });

  it("wird nie doppelt vergeben", () => {
    const p: BrailleProgress = { ...frischesKonto(), gemeistertAm: { e0: NOON } };
    const r1 = awardAbzeichen(p, ereignis(), NOON, AREAS);
    expect(r1.neu.map((b) => b.id)).toContain("etappe-1");
    const r2 = awardAbzeichen(r1.progress, ereignis(), NOON + 1000, AREAS);
    expect(r2.neu.map((b) => b.id)).not.toContain("etappe-1");
  });
});

describe("Sterne und Bestnote (aus levels[].bestStars)", () => {
  it("10 Etappen mit je 3 Sternen: 30 Sterne gesamt UND 10 Bestnoten", () => {
    const levels: Record<string, LevelRecord> = {};
    for (let i = 0; i < 10; i++) levels[`l${i}`] = { completed: true, bestStars: 3, attempts: 1 };
    const p: BrailleProgress = { ...frischesKonto(), levels };
    const { neu } = awardAbzeichen(p, ereignis(), NOON, AREAS);
    const ids = neu.map((b) => b.id);
    expect(ids).toContain("sterne-10");
    expect(ids).toContain("sterne-30");
    expect(ids).toContain("bestnote-1");
    expect(ids).toContain("bestnote-5");
    expect(ids).not.toContain("bestnote-15");
  });
});

describe("Rang (aus der Spielstufe der Gesamt-XP)", () => {
  it("Rang 5 bei 450 XP, Rang 10 noch nicht", () => {
    const p: BrailleProgress = { ...frischesKonto(), xp: 450 };
    const { neu } = awardAbzeichen(p, ereignis(), NOON, AREAS);
    const ids = neu.map((b) => b.id);
    expect(ids).toContain("rang-5");
    expect(ids).not.toContain("rang-10");
  });
});

describe("Tagesserie (streak.bestCount)", () => {
  it(String.raw`3 Tage in Folge bringen „Licht an"`, () => {
    const p: BrailleProgress = {
      ...emptyProgress(),
      streak: { count: 3, bestCount: 3, lastDay: 1000 },
    };
    const { neu } = awardAbzeichen(p, ereignis(), NOON, AREAS);
    expect(neu.map((b) => b.id)).toContain("serie-3");
  });
});

describe("Bereich komplett", () => {
  it(String.raw`die ganze Vollschrift gemeistert bringt „Ganze Vollschrift"`, () => {
    const vollArea = AREAS.find((a) => a.key === "voll")!;
    expect(vollArea.etappen.length).toBeGreaterThan(0);
    const levels: Record<string, LevelRecord> = {};
    for (const et of vollArea.etappen) levels[etappeRunId(et)] = { completed: true, bestStars: 3, attempts: 1 };
    const p: BrailleProgress = { ...frischesKonto(), levels };
    const { neu } = awardAbzeichen(p, ereignis({ areaKey: "voll" }), NOON, AREAS);
    expect(neu.map((b) => b.id)).toContain("bereich-voll");
    // Ein anderer Bereich, der nicht fertig ist, bringt sein Abzeichen nicht mit.
    expect(neu.map((b) => b.id)).not.toContain("bereich-basis");
  });
});

describe("Fehlerfrei (Etappen ohne Fehler im Übungs-Fenster gemeistert)", () => {
  it("zählt nur bei etappeGemeistert UND fehlerfreiGemeistert", () => {
    const p0 = emptyProgress();
    const nicht = awardAbzeichen(p0, ereignis({ etappeGemeistert: true, fehlerfreiGemeistert: false }), NOON, AREAS);
    expect(nicht.progress.abzeichenZaehler?.fehlerfreieMeisterungen ?? 0).toBe(0);

    const doch = awardAbzeichen(
      nicht.progress,
      ereignis({ etappeGemeistert: true, fehlerfreiGemeistert: true }),
      NOON + 1000,
      AREAS,
    );
    expect(doch.progress.abzeichenZaehler?.fehlerfreieMeisterungen).toBe(1);
    expect(doch.neu.map((b) => b.id)).toContain("fehlerfrei-1");
  });

  it("Text-Etappen (ohne Übungs-Fenster) tragen ehrlich nichts bei, wenn `fehlerfreiGemeistert` fehlt", () => {
    const r = awardAbzeichen(emptyProgress(), ereignis({ etappeGemeistert: true }), NOON, AREAS);
    expect(r.progress.abzeichenZaehler?.fehlerfreieMeisterungen ?? 0).toBe(0);
  });
});

describe("Trefferserien (richtige Aufgaben in Folge, über alle Etappen)", () => {
  it("wächst mit jeder richtigen Aufgabe und bricht bei einem Fehler", () => {
    let p = emptyProgress();
    for (let i = 0; i < 10; i++) {
      p = awardAbzeichen(p, ereignis({ aufgabeRichtig: true }), NOON + i * 1000, AREAS).progress;
    }
    expect(p.abzeichenZaehler?.trefferSerie).toBe(10);
    expect(p.abzeichen?.["treffer-10"]).toBeDefined();

    p = awardAbzeichen(p, ereignis({ aufgabeRichtig: false }), NOON + 20_000, AREAS).progress;
    expect(p.abzeichenZaehler?.trefferSerie).toBe(0);
    // Der Bestwert bleibt erhalten (Lebenszeit-Zähler zählt nur aufwärts).
    expect(p.abzeichenZaehler?.besteTrefferSerie).toBe(10);
  });
});

describe("Aktive Tage und aktive Wochen", () => {
  it("zählt verschiedene Kalendertage, nicht Aufgaben", () => {
    let p = emptyProgress();
    for (let tag = 1; tag <= 3; tag++) {
      const ts = new Date(2026, 8, tag, 12, 0, 0).getTime();
      p = awardAbzeichen(p, ereignis(), ts, AREAS).progress;
      // eine zweite Aufgabe am selben Tag zählt NICHT doppelt
      p = awardAbzeichen(p, ereignis(), ts + 60_000, AREAS).progress;
    }
    expect(p.abzeichenZaehler?.tage).toBe(3);
    expect(p.abzeichen?.["tage-3"]).toBeDefined();
  });
});

describe("Geheim-Abzeichen - beim normalen Üben nebenbei", () => {
  it("Nachteule: eine Aufgabe nach 21 Uhr", () => {
    const { neu } = awardAbzeichen(emptyProgress(), ereignis(), NIGHT, AREAS);
    expect(neu.map((b) => b.id)).toContain("geheim-nachteule");
  });

  it("Früher Vogel: eine Aufgabe vor 7 Uhr", () => {
    const { neu } = awardAbzeichen(emptyProgress(), ereignis(), DAWN, AREAS);
    expect(neu.map((b) => b.id)).toContain("geheim-fruehaufsteher");
  });

  it("Wochenend-Schreiber: an einem Samstag UND einem Sonntag geübt", () => {
    const r1 = awardAbzeichen(emptyProgress(), ereignis(), SAMSTAG, AREAS);
    expect(r1.neu.map((b) => b.id)).not.toContain("geheim-wochenende");
    const r2 = awardAbzeichen(r1.progress, ereignis(), SONNTAG, AREAS);
    expect(r2.neu.map((b) => b.id)).toContain("geheim-wochenende");
  });

  it("Zurück im Sattel: nach mehr als 14 Tagen Pause wieder geübt", () => {
    const r1 = awardAbzeichen(emptyProgress(), ereignis(), NOON, AREAS);
    const spaeter = NOON + 20 * 86_400_000;
    const r2 = awardAbzeichen(r1.progress, ereignis(), spaeter, AREAS);
    expect(r2.neu.map((b) => b.id)).toContain("geheim-comeback");
  });

  it("Zwei Wege an einem Tag: an einem Tag geschrieben UND gelesen", () => {
    const r1 = awardAbzeichen(emptyProgress(), ereignis({ richtung: "write" }), NOON, AREAS);
    expect(r1.neu.map((b) => b.id)).not.toContain("geheim-beide-richtungen");
    const r2 = awardAbzeichen(r1.progress, ereignis({ richtung: "read" }), NOON + 1000, AREAS);
    expect(r2.neu.map((b) => b.id)).toContain("geheim-beide-richtungen");
  });

  it("Alle Teile: in jedem der fünf Bereiche schon geübt", () => {
    const bereiche: AbzeichenEreignis["areaKey"][] = ["basis", "voll", "computer", "kurzschrift", "ueb"];
    let p = emptyProgress();
    let letzte: string[] = [];
    for (const bereich of bereiche) {
      const r = awardAbzeichen(p, ereignis({ areaKey: bereich }), NOON, AREAS);
      p = r.progress;
      letzte = r.neu.map((b) => b.id);
    }
    expect(letzte).toContain("geheim-alle-bereiche");
  });

  it("Doppelt gefeiert: zwei Etappen an einem einzigen Tag gemeistert", () => {
    const r1 = awardAbzeichen(emptyProgress(), ereignis({ etappeGemeistert: true }), NOON, AREAS);
    expect(r1.neu.map((b) => b.id)).not.toContain("geheim-doppelt-gemeistert");
    const r2 = awardAbzeichen(r1.progress, ereignis({ etappeGemeistert: true }), NOON + 1000, AREAS);
    expect(r2.neu.map((b) => b.id)).toContain("geheim-doppelt-gemeistert");
  });

  it("Ferienkind: mitten im Sommer geübt", () => {
    const { neu } = awardAbzeichen(emptyProgress(), ereignis(), JULI, AREAS);
    expect(neu.map((b) => b.id)).toContain("geheim-ferienkind");
  });
});

describe("Stiller Nachtrag (Bestandskonto vs. neues Kind)", () => {
  it("ein Bestandskonto holt längst Verdientes einmalig nach, OHNE es als neu zu feiern", () => {
    const bestand: BrailleProgress = {
      ...emptyProgress(),
      xp: 500, // Rang 5
      gemeistertAm: Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`e${i}`, NOON])),
    };
    const { progress, neu } = awardAbzeichen(bestand, ereignis(), NOON, AREAS);
    expect(neu).toEqual([]); // kein Ton, keine Ansage
    expect(progress.abzeichen?.["etappe-1"]).toBeDefined();
    expect(progress.abzeichen?.["etappe-5"]).toBeDefined();
    expect(progress.abzeichen?.["rang-5"]).toBeDefined();
    expect(progress.abzeichenZaehler?.katalog).toBe(KATALOG_VERSION);
  });

  it("ein Konto mit 0 Abzeichen UND ohne jede bisherige Übung ist ein neues Kind - nichts wird nachgetragen", () => {
    const neues = emptyProgress();
    const { progress, neu } = awardAbzeichen(neues, ereignis(), NOON, AREAS);
    expect(progress.abzeichen ?? {}).toEqual({});
    expect(neu).toEqual([]);
  });

  it("der Nachtrag läuft nur EINMAL (die Katalog-Fassung wird gemerkt)", () => {
    const bestand: BrailleProgress = { ...emptyProgress(), xp: 500 };
    const r1 = awardAbzeichen(bestand, ereignis(), NOON, AREAS);
    expect(r1.progress.abzeichenZaehler?.katalog).toBe(KATALOG_VERSION);
    // Ein zweiter Aufruf löst keinen zweiten Nachtrag aus (nichts zu tun, aber
    // vor allem: kein Absturz und keine doppelten Einträge).
    const r2 = awardAbzeichen(r1.progress, ereignis(), NOON + 1000, AREAS);
    expect(Object.keys(r2.progress.abzeichen ?? {}).length).toBe(
      Object.keys(r1.progress.abzeichen ?? {}).length,
    );
  });
});

describe("Nächste Ziele und verdiente Abzeichen", () => {
  it("nennt bis zu drei nächste Ziele mit Zählerstand", () => {
    const ziele = naechsteZiele(emptyProgress(), AREAS);
    expect(ziele.length).toBe(3);
    for (const z of ziele) expect(z.braucht).toBeGreaterThan(0);
  });

  it("verdienteAbzeichen liefert Definitions-Reihenfolge mit Zeitpunkt", () => {
    const p: BrailleProgress = { ...emptyProgress(), abzeichen: { "etappe-5": 123, "etappe-1": 456 } };
    const v = verdienteAbzeichen(p);
    expect(v.map((x) => x.def.id)).toEqual(["etappe-1", "etappe-5"]); // Katalog-Reihenfolge, nicht Einfüge-Reihenfolge
    expect(v.find((x) => x.def.id === "etappe-1")?.ts).toBe(456);
  });
});
