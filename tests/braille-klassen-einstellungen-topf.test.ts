/**
 * ★★★★★ EIN HÄKCHEN IN PUNKTGENAU LÖSCHTE DEN UNTERRICHTSTAG DER KLASSE.
 *
 * Gemessen am 07.09.2026 beim Bau der Wochenaufgabe.
 *
 * `tt_classes.settings` ist EIN JSON-Feld für die ganze Klasse, und zwei
 * Programme legen etwas hinein:
 *
 *   Tastenflow (bis 18.09.2026)    unterrichtstag · unterrichtstagAbMs ·
 *                                  unterrichtsende  ⇒ die WOCHENGRENZE
 *   Punktgenau                     extendedNumbers · extendedNumbers ·
 *                                  expressComputer  ⇒ der Lernweg
 *
 * Punktgenau schrieb beim Speichern das GANZE Feld neu - mit genau seinen drei
 * Schaltern. Wer also im Punktgenau-Reiter „Etappen frei wählbar“ anhakte,
 * löschte damit den Unterrichtstag: Tastenflows Wochenaufgabe fiel still auf
 * „Montag bis Sonntag“ zurück, und niemand hätte den Zusammenhang gesehen.
 *
 * Tastenflow selbst führte an seiner Schreibstelle korrekt zusammen. Es fehlte
 * nicht das Wissen - es fehlte, dass die zweite Stelle davon wusste
 * ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
 *
 * Seither gibt es EINE Umsetzung, die beide Wege benutzen. Dieser Wächter
 * prüft sie und zusätzlich den lokalen Weg von Ende zu Ende.
 *
 * ★★★★★ AUFGERÄUMT (19.09.2026): Der Unterrichtstag selbst ist seither
 * abgeschafft (`WOCHENZIEL_GRENZE`, fest Montag 08:00, für beide Programme) -
 * die drei Felder bleiben aber ein gutes, WIRKLICH vorkommendes Beispiel für
 * einen Tastenflow-Schlüssel neben einem Punktgenau-Schlüssel im selben Topf,
 * und bestehende Klassen tragen sie unverändert weiter (kein Datenwechsel).
 * Dieser Wächter prüft darum weiterhin die MISCH-Regel selbst, liest die drei
 * Werte aber nur noch roh zurück, statt sie (wie bis 18.09.2026) durch
 * `rhythmusAusEinstellungen` zu schicken - die Funktion gibt es nicht mehr.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  createClass,
  einstellungenZusammenfuehren,
  getClassSettings,
  registerTeacher,
  updateClassSettings,
} from "../src/lib/braille/account";

beforeEach(() => {
  localStorage.clear();
});

describe("Der gemeinsame Einstellungs-Topf", () => {
  it("★★★★★ ein Punktgenau-Schalter lässt den Unterrichtstag stehen", () => {
    const vorher = {
      unterrichtstag: 3,
      unterrichtstagAbMs: 1_756_000_000_000,
      unterrichtsende: 840,
      extendedNumbers: false,
    };

    const nachher = einstellungenZusammenfuehren(vorher, { extendedNumbers: true });

    expect(nachher.extendedNumbers).toBe(true);
    // ★ LEGACY-Werte (das Häkchen betrifft ein anderes Programm): sie
    // bleiben stehen, auch wenn sie seit dem 19.09.2026 (`WOCHENZIEL_GRENZE`)
    // nirgends mehr gelesen werden - das ist die Zahl, an der es in der
    // Praxis aufgefallen wäre.
    expect(nachher.unterrichtstag).toBe(3);
    expect(nachher.unterrichtsende).toBe(840);
  });

  it("★★★ ein nicht mitgeschickter Schlüssel gilt nicht als gelöscht", () => {
    // Sonst hieße „speichere den Wochenplan“ nebenbei „lösche alles andere“.
    const nachher = einstellungenZusammenfuehren(
      { expressComputer: true, extendedNumbers: true },
      { punktgenau: { wochenaufgabe: { minuten: 20, aufgaben: 0, etappen: 0 } } },
    );
    expect(nachher.extendedNumbers).toBe(true);
    expect(nachher.extendedNumbers).toBe(true);
    expect(nachher.punktgenau).toBeTruthy();
  });

  it("verträgt einen leeren oder fehlenden Topf", () => {
    expect(einstellungenZusammenfuehren(null, { extendedNumbers: true })).toEqual({
      extendedNumbers: true,
    });
    expect(einstellungenZusammenfuehren(undefined, {})).toEqual({});
  });

  it("★★ von Ende zu Ende: zweimal speichern, nichts geht verloren", () => {
    const lehrkraft = registerTeacher("Frau A", "a@b.at", "geheim1");
    expect(lehrkraft.ok).toBe(true);
    if (!lehrkraft.ok) return;
    const klasse = createClass(lehrkraft.value.id, "3B");
    expect(klasse.ok).toBe(true);
    if (!klasse.ok) return;
    const code = klasse.value.code;

    // ★ LEGACY: So schrieb Tastenflow bis zum 18.09.2026 den (seither
    // abgeschafften) Unterrichtstag der Klasse - eine bestehende Klasse mit
    // diesen Werten darf sie durch ein fremdes Häkchen trotzdem nicht verlieren.
    updateClassSettings(lehrkraft.value.id, code, {
      unterrichtstag: 3,
      unterrichtstagAbMs: 1_756_000_000_000,
      unterrichtsende: 840,
    });
    // Und jetzt legt die Lehrkraft im Punktgenau-Reiter ein Häkchen um.
    updateClassSettings(lehrkraft.value.id, code, { extendedNumbers: true });

    const gelesen = getClassSettings(code);
    expect(gelesen?.extendedNumbers).toBe(true);
    expect(gelesen?.unterrichtstag).toBe(3);
    expect(gelesen?.unterrichtstagAbMs).toBe(1_756_000_000_000);
    expect(gelesen?.unterrichtsende).toBe(840);
  });
});
