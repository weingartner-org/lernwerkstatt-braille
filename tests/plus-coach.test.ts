/**
 * Wächter für den Coach.
 *
 * Jede Regel hier steht in „Plus - Der Coach" (22.09.2026). Der Test fragt
 * nicht, ob der Code tut, was er tut, sondern ob er tut, was dort steht -
 * und vor allem: ob er die Dinge LÄSST, die dort ausgeschlossen sind.
 */
import { describe, expect, it } from "vitest";
import { zufall } from "../src/lib/plus/aufgabe";
import { paket, paketeDerStufe } from "../src/lib/plus/stoffplan";
import {
  AUFSTIEG, KARTEI_TAGE, LAUFGRENZE_JE_PAKET, START_ELO, TAGESGRENZE, tagesgrenze, ZIELQUOTE,
  baustelle, einstufung, erwartung, faellig, nachAntwort, nachLauf, neuerStand,
  schrittweite, standVon, stelleLauf, ueberschreibe, uebersicht, voraussetzungFuer,
  type Stand,
} from "../src/lib/plus/coach";

const rng = () => zufall(2026)();

/** Ein Kind, das ein Paket sicher kann. */
function koennen(stand: Stand, id: string, mal = 8): Stand {
  let s = stand;
  for (let i = 0; i < mal; i++) s = nachAntwort(s, { paketId: id, richtig: true });
  return nachLauf(s, id, 10, 10);
}

describe("Das Niveau", () => {
  it("rückt anfangs schnell und später träge", () => {
    expect(schrittweite(0)).toBeGreaterThan(schrittweite(15));
    expect(schrittweite(15)).toBeGreaterThan(schrittweite(100));
  });

  it("beginnt bei gleicher Stärke mit einer Aussicht von 50 Prozent", () => {
    expect(erwartung(START_ELO, START_ELO)).toBeCloseTo(0.5, 5);
  });

  it("zielt auf drei von vier - nicht auf 85 Prozent", () => {
    // Die 85-Prozent-Regel stammt aus Ja-Nein-Versuchen, nicht aus dem
    // Rechenunterricht. 0,75 ist mit 3 648 Kindern erprobt.
    expect(ZIELQUOTE).toBe(0.75);
  });

  it("hebt das Können nach richtigen Antworten und senkt es nach falschen", () => {
    const hoch = koennen(neuerStand(), "1-08");
    expect(hoch.koennen.plus ?? 0).toBeGreaterThan(START_ELO);
    let runter = neuerStand();
    for (let i = 0; i < 5; i++) runter = nachAntwort(runter, { paketId: "1-08", richtig: false });
    expect(runter.koennen.plus ?? 0).toBeLessThan(START_ELO);
  });

  it("zählt die richtigen in Folge - und die falsche Antwort setzt sie zurück", () => {
    let s = koennen(neuerStand(), "1-08", 3);
    expect(standVon(s, "1-08").richtigeInFolge).toBe(3);
    s = nachAntwort(s, { paketId: "1-08", richtig: false });
    expect(standVon(s, "1-08").richtigeInFolge).toBe(0);
  });
});

describe("Der Aufstieg", () => {
  it("nimmt die Quoten des Stoffplans", () => {
    expect(AUFSTIEG.fakten).toEqual({ quote: 0.875, laeufe: 2 });    // 7 von 8
    expect(AUFSTIEG.strategie).toEqual({ quote: 0.7, laeufe: 2 });   // 7 von 10
    expect(AUFSTIEG.zahlbegriff.laeufe).toBe(1);                      // wird verstanden
  });

  it("braucht zwei Läufe hintereinander und drei richtige in Folge", () => {
    let s = koennen(neuerStand(), "1-08", 3);      // ein guter Lauf
    expect(standVon(s, "1-08").geschafft).toBe(false);
    s = nachLauf(s, "1-08", 10, 10);               // der zweite
    expect(standVon(s, "1-08").geschafft).toBe(true);
  });

  it("setzt die Reihe zurück, wenn ein Lauf dazwischen schwach war", () => {
    let s = koennen(neuerStand(), "1-08", 3);
    s = nachLauf(s, "1-08", 4, 10);
    expect(standVon(s, "1-08").guteLaeufe).toBe(0);
    expect(standVon(s, "1-08").geschafft).toBe(false);
  });

  it("kennt für Sachaufgaben gar keinen Aufstieg über die Quote", () => {
    // „Ein Sachaufgaben-Paket gilt als bearbeitet, wenn acht Aufgaben gelöst
    // und begründet wurden. Es bleibt danach jederzeit offen."
    const sach = paketeDerStufe(1).find((p) => p.art === "sach");
    expect(sach, "Stufe 1 hat kein Sachaufgaben-Paket").toBeTruthy();
    let s = neuerStand();
    for (let i = 0; i < 3; i++) s = nachLauf(s, sach!.id, 10, 10);
    expect(standVon(s, sach!.id).geschafft).toBe(false);
  });
});

describe("Die Kartei", () => {
  it("wächst gleichmäßig: 1, 3, 7, 21, 60 Tage", () => {
    // Nicht steiler - im Langzeitvergleich schlägt das die steigenden Abstände.
    expect(KARTEI_TAGE).toEqual([1, 3, 7, 21, 60]);
  });

  it("legt ein geschafftes Paket in die Kartei und meldet es zur Zeit zurück", () => {
    let s = koennen(neuerStand(100), "1-08", 3);
    s = nachLauf(s, "1-08", 10, 10, 100);
    const stand = standVon(s, "1-08");
    expect(stand.kartei).toBeGreaterThan(0);
    expect(faellig(s, 100)).not.toContain("1-08");
    expect(faellig(s, stand.faellig!)).toContain("1-08");
  });
});

describe("Die Auswahl - Mein Training", () => {
  it("stellt einen Lauf aus mehreren Paketen zusammen, nie aus einem", () => {
    // Geblockte Drill-Serien einer Rechenart sind ausdrücklich ausgeschlossen.
    const s = koennen(koennen(neuerStand(), "1-01"), "1-02");
    const plan = stelleLauf(s, { stufe: 1, anzahl: 12, rng });
    expect(plan.pakete).toHaveLength(12);
    expect(new Set(plan.pakete).size).toBeGreaterThan(1);
  });

  it("gibt der Baustelle höchstens ein Viertel des Laufs", () => {
    // „Deine Vorgabe - nie mehr davon."
    let s = neuerStand();
    for (const p of paketeDerStufe(1).slice(0, 3)) s = koennen(s, p.id);
    const plan = stelleLauf(s, { stufe: 1, anzahl: 12, rng });
    const bau = Object.entries(plan.herkunft).find(([, w]) => w === "baustelle")?.[0];
    if (bau) expect(plan.pakete.filter((id) => id === bau).length).toBeLessThanOrEqual(3);
  });

  it("nimmt nie zweimal dasselbe Paket hintereinander", () => {
    const s = koennen(koennen(neuerStand(), "1-01"), "1-02");
    const plan = stelleLauf(s, { stufe: 1, anzahl: 20, rng });
    for (let i = 1; i < plan.pakete.length; i++) {
      expect(plan.pakete[i], `Stelle ${i}`).not.toBe(plan.pakete[i - 1]);
    }
  });

  it("bleibt im Stufenstoff - der Einschub ist kurz und eine echte Voraussetzung", () => {
    // Eine Auswertung über 100 000 Klassen: wer Kinder zum Nachholen aus dem
    // Stufenstoff nimmt, macht es schlechter. Das Coach-Dokument lässt den
    // kurzen Einschub aus einer tieferen Stufe ausdrücklich zu (3-11 → 1-14) -
    // aber als Einschub, nicht als Umzug.
    let s = neuerStand();
    for (const p of paketeDerStufe(4).slice(0, 4)) s = koennen(s, p.id);
    const plan = stelleLauf(s, { stufe: 4, anzahl: 16, rng });
    const fremd = plan.pakete.filter((id) => !id.startsWith("4-"));
    expect(fremd.length, "Der Einschub darf den Lauf nicht übernehmen").toBeLessThanOrEqual(3);
    for (const id of new Set(fremd)) {
      expect(plan.herkunft[id], `${id} ist kein Einschub`).toBe("voraussetzung");
    }
  });

  it("schickt nach zehn Läufen an einem Paket kein elftes, sondern die Voraussetzung", () => {
    let s = neuerStand();
    const bau = baustelle(s, 3);
    expect(bau).toBeTruthy();
    for (let i = 0; i < LAUFGRENZE_JE_PAKET; i++) s = nachLauf(s, bau!, 2, 10);
    const plan = stelleLauf(s, { stufe: 3, anzahl: 12, rng });
    expect(plan.pakete).not.toContain(bau);
  });

  it("hält die Tagesgrenze eines Pakets ein", () => {
    let s = koennen(koennen(neuerStand(), "1-01"), "1-02");
    s = { ...s, heuteJePaket: { ...s.heuteJePaket, "1-03": tagesgrenze("1-03") } };
    const plan = stelleLauf(s, { stufe: 1, anzahl: 12, rng });
    expect(plan.pakete).not.toContain("1-03");
  });

  it("★★★ die Grenze hängt an der Art des Pakets, nicht an einer Zahl für alle", () => {
    // Johannes, 23.09.2026: „wer 1x1 automatisieren kann soll 50-100
    // rechnungen machen, wer textaufgaben lösen soll wird nach 4 genug haben".
    expect(TAGESGRENZE.fakten).toBeGreaterThanOrEqual(50);
    expect(TAGESGRENZE.sach).toBe(4);
    expect(tagesgrenze("1-03")).toBe(TAGESGRENZE.fakten);   // Zahlen zerlegen
    expect(tagesgrenze("2-21")).toBe(TAGESGRENZE.sach);     // Rechengeschichten
    // Je mehr Denkarbeit je Aufgabe, desto weniger am Tag - lückenlos.
    const reihe = [TAGESGRENZE.fakten, TAGESGRENZE.zahlbegriff, TAGESGRENZE.groessen,
      TAGESGRENZE.strategie, TAGESGRENZE.schriftlich, TAGESGRENZE.sach];
    expect(reihe).toEqual([...reihe].sort((a, b) => b - a));
  });

  it("★★ ein Kind darf das Einmaleins wirklich automatisieren", () => {
    // Bis 23.09.2026 war nach zehn Aufgaben Schluss - mitten im Üben.
    let s = koennen(koennen(neuerStand(), "1-01"), "1-02");
    s = { ...s, heuteJePaket: { ...s.heuteJePaket, "1-03": 40 } };
    const plan = stelleLauf(s, { stufe: 1, anzahl: 12, rng });
    expect(plan.pakete).toContain("1-03");
  });

  it("vergisst die Tageszähler am nächsten Tag - die Kartei behält sie", () => {
    let s = koennen(neuerStand(100), "1-01");
    s = nachAntwort(s, { paketId: "1-01", richtig: true, tag: 101 });
    expect(s.heuteJePaket["1-01"]).toBe(1);
    expect(standVon(s, "1-01").kartei).toBeGreaterThan(0);
  });

  it("mischt eine andere Rechenart dazu - das Verschachteln", () => {
    // 61 gegen 38 Prozent in einer Klassenstudie, gegenüber geblockten Serien.
    let s = neuerStand();
    for (const p of paketeDerStufe(3).slice(0, 8)) s = koennen(s, p.id, 5);
    const plan = stelleLauf(s, { stufe: 3, anzahl: 16, rng });
    const arten = new Set(plan.pakete.map((id) => paket(id).op));
    expect(arten.size).toBeGreaterThan(1);
  });
});

describe("Die Lücke", () => {
  it("geht einen Schritt zurück, nicht an den Anfang", () => {
    const s = neuerStand();
    const zurueck = voraussetzungFuer(s, "3-11");
    expect(zurueck).toBeTruthy();
    // Es ist eine echte Voraussetzung aus der Kette, kein beliebiges Paket.
    expect(paket("3-11").braucht.length).toBeGreaterThan(0);
  });

  it("findet nichts, wenn alle Voraussetzungen sitzen", () => {
    let s = neuerStand();
    for (const v of paket("3-11").braucht) s = koennen(s, v);
    for (const v of paket("3-11").braucht) {
      for (const vv of paket(v).braucht) s = koennen(s, vv);
    }
    expect(voraussetzungFuer(s, "3-11")).toBeNull();
  });
});

describe("Was die Lehrkraft sieht - und ändern darf", () => {
  it("stuft in drei Worte ein: sitzt, wackelt, offen", () => {
    const s = koennen(neuerStand(), "1-08");
    expect(einstufung(s, "1-08")).toBe("sitzt");
    expect(einstufung(s, "1-16")).toBe("offen");
  });

  it("lässt jede Einstufung überschreiben - das ist Pflicht, nicht Freundlichkeit", () => {
    // Eine rein automatische Entscheidung über einen Menschen ist nach der
    // Datenschutz-Grundverordnung nicht zulässig.
    let s = neuerStand();
    expect(einstufung(s, "1-08")).toBe("offen");
    s = ueberschreibe(s, "1-08", "sitzt");
    expect(einstufung(s, "1-08")).toBe("sitzt");
    s = ueberschreibe(s, "1-08", "offen");
    expect(einstufung(s, "1-08")).toBe("offen");
  });

  it("zeigt die ganze Stufe auf einen Blick", () => {
    const liste = uebersicht(neuerStand(), 2);
    expect(liste).toHaveLength(paketeDerStufe(2).length);
    expect(liste.every((z) => z.name.length > 0)).toBe(true);
  });
});

describe("Jede Stufe lässt sich trainieren", () => {
  it("baut für alle acht Stufen einen vollen Lauf", () => {
    for (let stufe = 1; stufe <= 8; stufe++) {
      const plan = stelleLauf(neuerStand(), { stufe, anzahl: 12, rng });
      expect(plan.pakete.length, `Stufe ${stufe}`).toBe(12);
      expect(Object.keys(plan.herkunft).length, `Stufe ${stufe}`).toBeGreaterThan(0);
    }
  });
});

describe("★★★ Die Tagesgrenze gilt auch innerhalb eines Laufs", () => {

  it("ein Lauf bietet nie mehr Rechengeschichten an, als am Tag erlaubt sind", () => {
    // Stufe 2 hat genau ein Sachaufgaben-Paket (2-21) - es darf im Lauf
    // höchstens viermal vorkommen, auch wenn zwölf Aufgaben gewünscht sind.
    let s = neuerStand();
    for (const p of paketeDerStufe(2)) s = koennen(s, p.id, 5);
    const plan = stelleLauf(s, { stufe: 2, anzahl: 16, rng });
    const sachPakete = plan.pakete.filter((id) => paket(id).art === "sach");
    expect(sachPakete.length).toBeLessThanOrEqual(TAGESGRENZE.sach);
  });

  it("wer heute schon fast am Limit ist, bekommt nur noch den Rest", () => {
    let s = neuerStand();
    for (const p of paketeDerStufe(2)) s = koennen(s, p.id, 5);
    s = { ...s, heuteJePaket: { ...s.heuteJePaket, "2-21": TAGESGRENZE.sach - 1 } };
    const plan = stelleLauf(s, { stufe: 2, anzahl: 16, rng });
    expect(plan.pakete.filter((id) => id === "2-21").length).toBeLessThanOrEqual(1);
  });
});
