/**
 * Die Reihe der „Eigenen Uebungen" (`eigeneUebung.ts`) - anhaengen statt
 * ersetzen, "fertig" je Kind und je Text, und die Pruefung, ob ein
 * hochgeladener Text zum Schriftbereich des Kindes passt. Vorbild
 * `typing/eigeneUebungReihe.ts`, bewusst dupliziert (siehe Kopfkommentar der
 * geprueften Datei).
 */
import { describe, it, expect } from "vitest";
import {
  EIGENE_UEBUNGEN_HOECHSTENS,
  eigeneUebungenAusRoh,
  reiheMitNeuer,
  reiheOhne,
  hatFertig,
  naechsteOffeneUebung,
  fertigeKinder,
  vonAllenFertig,
  eigeneUebungKurzstand,
  unbekannteZeichen,
  bekannteZeichenImBereich,
  textPasstZuSchriftbereich,
  type EigeneUebungEintrag,
} from "../src/lib/braille/eigeneUebung";
import { AREAS } from "../src/lib/braille/areas";
import { emptyProgress } from "../src/lib/braille/progress";

function eintrag(partial: Partial<EigeneUebungEintrag> = {}): EigeneUebungEintrag {
  return {
    textId: "t1",
    dateiname: "gedicht.txt",
    arbeitsweise: "schreiben",
    bereich: "basis",
    gestartetAm: 1000,
    von: "lehrer1",
    ...partial,
  };
}

describe("eigeneUebungenAusRoh - wehrhaft", () => {
  it("liest eine gueltige Reihe", () => {
    const roh = [eintrag({ textId: "a" }), eintrag({ textId: "b", gestartetAm: 2000 })];
    expect(eigeneUebungenAusRoh(roh)).toHaveLength(2);
  });

  it("kein Array ⇒ leere Reihe", () => {
    expect(eigeneUebungenAusRoh(null)).toEqual([]);
    expect(eigeneUebungenAusRoh({})).toEqual([]);
  });

  it("ein Eintrag ohne textId faellt weg", () => {
    expect(eigeneUebungenAusRoh([{ dateiname: "x" }])).toEqual([]);
  });

  it("eine kaputte Arbeitsweise faellt weg (kein Rateergebnis)", () => {
    const roh = [{ textId: "a", dateiname: "x", arbeitsweise: "tippen", bereich: "basis", gestartetAm: 1 }];
    expect(eigeneUebungenAusRoh(roh)).toEqual([]);
  });

  it("ein fehlender Schriftbereich faellt weg", () => {
    const roh = [{ textId: "a", dateiname: "x", arbeitsweise: "schreiben", gestartetAm: 1 }];
    expect(eigeneUebungenAusRoh(roh)).toEqual([]);
  });

  it("eine doppelte textId zaehlt nur einmal - die fruehere Stelle gilt", () => {
    const roh = [
      { textId: "a", dateiname: "erste", arbeitsweise: "schreiben", bereich: "basis", gestartetAm: 1 },
      { textId: "a", dateiname: "zweite", arbeitsweise: "schreiben", bereich: "basis", gestartetAm: 2 },
    ];
    const reihe = eigeneUebungenAusRoh(roh);
    expect(reihe).toHaveLength(1);
    expect(reihe[0].dateiname).toBe("erste");
  });
});

describe("reiheMitNeuer - anhaengen, nicht ersetzen", () => {
  it("haengt hinten an", () => {
    const reihe = [eintrag({ textId: "a" })];
    const neu = eintrag({ textId: "b", gestartetAm: 2000 });
    const ergebnis = reiheMitNeuer(reihe, neu);
    expect(ergebnis.map((e) => e.textId)).toEqual(["a", "b"]);
  });

  it("dieselbe textId noch einmal aendert nichts", () => {
    const reihe = [eintrag({ textId: "a", dateiname: "alt" })];
    const ergebnis = reiheMitNeuer(reihe, eintrag({ textId: "a", dateiname: "neu" }));
    expect(ergebnis).toHaveLength(1);
    expect(ergebnis[0].dateiname).toBe("alt");
  });

  it(`ueber ${EIGENE_UEBUNGEN_HOECHSTENS} hinaus faellt zuerst die aelteste FERTIGE`, () => {
    let reihe: EigeneUebungEintrag[] = [];
    for (let i = 0; i < EIGENE_UEBUNGEN_HOECHSTENS; i++) {
      reihe = reiheMitNeuer(reihe, eintrag({ textId: `t${i}`, gestartetAm: i }));
    }
    expect(reihe).toHaveLength(EIGENE_UEBUNGEN_HOECHSTENS);
    // t0 ist von allen fertig - faellt beim naechsten Anhaengen weg.
    const ergebnis = reiheMitNeuer(reihe, eintrag({ textId: "neu", gestartetAm: 999 }), ["t0"]);
    expect(ergebnis).toHaveLength(EIGENE_UEBUNGEN_HOECHSTENS);
    expect(ergebnis.some((e) => e.textId === "t0")).toBe(false);
    expect(ergebnis.some((e) => e.textId === "neu")).toBe(true);
  });

  it("ohne eine fertige Uebung faellt die AELTESTE, nie die gerade angehaengte", () => {
    let reihe: EigeneUebungEintrag[] = [];
    for (let i = 0; i < EIGENE_UEBUNGEN_HOECHSTENS; i++) {
      reihe = reiheMitNeuer(reihe, eintrag({ textId: `t${i}`, gestartetAm: i }));
    }
    const ergebnis = reiheMitNeuer(reihe, eintrag({ textId: "neu", gestartetAm: 999 }), []);
    expect(ergebnis.some((e) => e.textId === "t0")).toBe(false);
    expect(ergebnis.some((e) => e.textId === "neu")).toBe(true);
  });
});

describe("reiheOhne", () => {
  it("nimmt genau einen Eintrag heraus", () => {
    const reihe = [eintrag({ textId: "a" }), eintrag({ textId: "b" })];
    expect(reiheOhne(reihe, "a").map((e) => e.textId)).toEqual(["b"]);
  });
});

describe("fertig je Kind und je Text", () => {
  it("hatFertig liest den Fortschritt dieses Kindes", () => {
    expect(hatFertig({ a: { fertig: true } }, "a")).toBe(true);
    expect(hatFertig({ a: { fertig: false } }, "a")).toBe(false);
    expect(hatFertig(undefined, "a")).toBe(false);
    expect(hatFertig(null, "a")).toBe(false);
  });

  it("naechsteOffeneUebung ist die AELTESTE, die dieses Kind noch nicht fertig hat", () => {
    const reihe = [eintrag({ textId: "a" }), eintrag({ textId: "b", gestartetAm: 2000 })];
    expect(naechsteOffeneUebung(reihe, { a: { fertig: true } })?.textId).toBe("b");
    expect(naechsteOffeneUebung(reihe, {})?.textId).toBe("a");
  });

  it("nichts offen ⇒ null", () => {
    const reihe = [eintrag({ textId: "a" })];
    expect(naechsteOffeneUebung(reihe, { a: { fertig: true } })).toBeNull();
  });

  it("fertigeKinder zaehlt ueber mehrere Fortschritte", () => {
    const f = [{ a: { fertig: true } }, { a: { fertig: false } }, { a: { fertig: true } }];
    expect(fertigeKinder("a", f)).toEqual({ fertig: 2, gesamt: 3 });
  });

  it("vonAllenFertig nennt nur textIds, die WIRKLICH jedes Kind fertig hat", () => {
    const reihe = [eintrag({ textId: "a" }), eintrag({ textId: "b" })];
    const f = [{ a: { fertig: true }, b: { fertig: true } }, { a: { fertig: true }, b: { fertig: false } }];
    expect(vonAllenFertig(reihe, f)).toEqual(["a"]);
  });

  it("ohne Fortschritte ist niemand fertig", () => {
    const reihe = [eintrag({ textId: "a" })];
    expect(vonAllenFertig(reihe, undefined)).toEqual([]);
    expect(vonAllenFertig(reihe, [])).toEqual([]);
  });
});

describe("eigeneUebungKurzstand", () => {
  it("nichts zugewiesen", () => {
    expect(eigeneUebungKurzstand([])).toBe("nicht zugewiesen");
  });

  it("genau eine Uebung nennt den Dateinamen", () => {
    expect(eigeneUebungKurzstand([eintrag({ dateiname: "sommer.txt" })])).toBe("zugewiesen: sommer.txt");
  });

  it("mehrere Uebungen nennen die Zahl", () => {
    expect(eigeneUebungKurzstand([eintrag({ textId: "a" }), eintrag({ textId: "b" })])).toBe(
      "2 zugewiesen, der Reihe nach",
    );
  });
});

describe("unbekannteZeichen - reine Zeichenpruefung", () => {
  it("meldet nur Zeichen ausserhalb der bekannten Menge, einmal je Zeichen", () => {
    const bekannt = new Set(["a", "b", " "]);
    expect(unbekannteZeichen("ab ba", bekannt)).toEqual([]);
    expect(unbekannteZeichen("abz zb", bekannt)).toEqual(["z"]);
  });

  it("Gross-/Kleinschreibung ist egal - eine gelernte Zelle deckt beides", () => {
    const bekannt = new Set(["a", "b"]);
    expect(unbekannteZeichen("AB", bekannt)).toEqual([]);
  });

  it("Zeilenumbrueche zaehlen nie mit", () => {
    const bekannt = new Set(["a"]);
    expect(unbekannteZeichen("a\na\r\n", bekannt)).toEqual([]);
  });
});

describe("bekannteZeichenImBereich / textPasstZuSchriftbereich - echte Etappen", () => {
  const basis = AREAS.find((a) => a.key === "basis")!;

  it("mit leerem Fortschritt sind nur die Buchstaben der ersten Etappe bekannt", () => {
    const bekannt = bekannteZeichenImBereich(basis, emptyProgress());
    // b1 fuehrt l, a, i, m ein (Kniese-Reihenfolge) - siehe etappen.ts.
    expect(bekannt.has("l")).toBe(true);
    expect(bekannt.has("a")).toBe(true);
    expect(bekannt.has("i")).toBe(true);
    expect(bekannt.has("m")).toBe(true);
    // Ein Buchstabe aus einer viel spaeteren Etappe ist noch nicht bekannt.
    expect(bekannt.has("z")).toBe(false);
  });

  it("ein Text nur aus bekannten Buchstaben passt", () => {
    const ergebnis = textPasstZuSchriftbereich("lama mia", basis, emptyProgress());
    expect(ergebnis.passt).toBe(true);
    expect(ergebnis.unbekannt).toEqual([]);
  });

  it("ein Text mit einem noch nie gesehenen Zeichen passt NICHT - keine Sackgasse", () => {
    const ergebnis = textPasstZuSchriftbereich("susi zeigt", basis, emptyProgress());
    expect(ergebnis.passt).toBe(false);
    expect(ergebnis.unbekannt.length).toBeGreaterThan(0);
  });
});
