/**
 * Bereich `runner` - Polski: pole ćwiczeń (nagłówek, komunikaty, wybór, stukanie, klawiatura,
 * pisanie, Budowniczy taktów, Warsztat kompozytora, pięciolinia, wprowadzanie dotykiem).
 * Fachwörter: polnische Musiktheorie (miara, metrum, kreska taktowa, burdon, pentatonika).
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { runner as De } from "../de/runner";

/** Liczba mnoga po polsku: 1 / 2-4 (bez 12-14) / 5+. */
const lm = (n: number, jeden: string, kilka: string, wiele: string): string => {
  if (n === 1) return jeden;
  const r10 = n % 10;
  const r100 = n % 100;
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? kilka : wiele;
};

/** Jednostka liczenia w dopełniaczu liczby pojedynczej („miara" -> „miary", „pół miary"). */
const dopelniacz = (einheit: string): string =>
  einheit.startsWith("miara") ? einheit.replace("miara", "miary").replace("ósemkowa", "ósemkowej") : einheit;

export const runner: typeof De = {
  kopf: {
    anhoeren: "Posłuchaj",
    stopp: "Stop",
    anhoerenTitel: "Posłuchaj zadania (Alt + W dodatkowo je odczytuje)",
    instrument: "Instrument",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Nazwy nut jako ${a} (stała solmizacja) zamiast ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Sylaby rytmiczne: dodatkowo mów ta, ti-ti po wartościach nut",
    anderesLied: "Inna piosenka",
    namenAn: (a: string, b: string, c: string): string => `Nazwy nut: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Sylaby rytmiczne włączone: ta, ti-ti.",
    rhythmusAus: "Sylaby rytmiczne wyłączone.",
    zurueckLiedauswahl: "Powrót do wyboru piosenek.",
  },

  aufgabe: {
    liesBrailleZeile: "Przeczytaj linijkę brajlowską.",
    handNurKlavier: "Zmiana ręki działa tylko w rozdziale fortepianowym z dwiema linijkami.",
    weiter: (prompt: string): string => `Idziemy dalej. ${prompt}`,
    zeichenlisteHinweis: "Wszystkie znaki nutowe tego etapu są na liście znaków: Alt i L.",
    songGanzGeschafft: (titel: string): string => `${titel} - zagrane do końca!`,
    songZeile: (zeile: number, von: number): string => ` · linijka ${zeile} z ${von}`,
  },

  geschafft: {
    geschafft: "Udało się!",
    mitSternen: (n: number): string => `Udało się! ${n} z 3 gwiazdek.`,
    alsNaechstesAnsage: (titel: string): string => ` Następny: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Następny: ${titel}`,
    weiterUeben: "Ćwicz dalej",
    weiter: "Dalej",
  },
  fortschritt: {
    caption: "Ćwiczenie",
    aria: (n: number, min: number, prozent: number): string =>
      `Postęp etapu: ${n} z co najmniej ${min} zadań, ukończono ${prozent} procent.`,
    rundeGeschafft: "Runda ukończona - etap opanowany.",
    runde: (n: number, min: number, noch: number): string =>
      `Runda: ${n} z co najmniej ${min} zadań wykonanych` +
      (noch > 0
        ? `, potrzeba jeszcze co najmniej ${noch} ${noch === 1 ? "zadania" : "zadań"}.`
        : ", za chwilę etap będzie opanowany."),
  },

  lieder: {
    kinder: "🧒 Piosenki dla dzieci",
    erwachsene: "🎼 Klasyka i znane melodie",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - jedną rękę osobno widzieć w powiększeniu i słyszeć (" +
      (f === "rh"
        ? "teraz: tylko prawa ręka"
        : f === "lh"
          ? "teraz: tylko lewa ręka"
          : "teraz: obie ręce") +
      ")",
  },

  wahl: {
    richtig: "Dobrze!",
    richtigWaere: (antwort: string): string => `Dobra odpowiedź to: ${antwort}.`,
    antworten: "Odpowiedzi (także klawisze cyfr od 1 do 4)",
  },

  tap: {
    aria: (n: number): string => `Wystukaj rytm: spacja. Do tej pory ${n} ${lm(n, "uderzenie", "uderzenia", "uderzeń")} w sumie.`,
    vor: "Stukaj tutaj ",
    stark: "spacją",
    nach: (n: number, von: number): string => ` - ${n} z ${von} uderzeń`,
    knopf: (n: number, von: number): string => `Stukaj (${n} z ${von})`,
    puls: "Jeszcze nie całkiem równo - poczuj puls i trzymaj go spokojnie.",
    kurz: "krótko",
    lang: "długo",
    fast: (muster: string): string => `Prawie! Wzór był taki: ${muster}. Posłuchaj jeszcze raz.`,
    genauImPuls: "Dokładnie w pulsie!",
    genauImTakt: "Dokładnie w takcie!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Klawiatura do powtarzania: D F G H J K L to ${namen}. Strzałka w górę i w dół zmienia oktawę. `,
    ariaFrei: (n: number, von: number): string => `Graj swobodnie nad burdonem - ${n} z ${von} dźwięków. `,
    ariaMemory: (laenge: number): string => `Obecna długość: ${laenge} ${lm(laenge, "dźwięk", "dźwięki", "dźwięków")}. `,
    ariaTon: (i: number, von: number): string => `Dźwięk ${i} z ${von}. `,
    ariaLesen:
      "Koncert czytania: przeczytaj linijkę brajlowską. Naciśnij Enter albo „Przeczytane”, gdy masz ją w głowie.",
    lesenVor: "Przeczytaj linijkę w brajlu - ",
    lesenStark: "nie",
    lesenMitte: " będzie zagrana. Gdy masz ją w głowie, ",
    lesenNach: " albo „Przeczytane\".",
    fertigGelesen: "Przeczytane",
    nachLesen: "Teraz zagraj z pamięci - D F G H J K L, strzałka zmienia oktawę.",
    freiVor: "Graj swobodnie klawiszami ",
    freiNach: (n: number, von: number): string => ` (pentatonika) - ${n} z ${von} dźwięków · nad burdonem kwintowym`,
    nachspielenVor: "Zagraj za mną klawiszami ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Długość ${n}`,
    tonVon: (i: number, von: number): string => `Dźwięk ${i} z ${von}`,
    oktaveNach: (oktave: string): string => ` oktawa (${oktave})`,
    oktaveRauf: "Oktawa w górę",
    oktaveRunter: "Oktawa w dół",
    freiGeschafft: (n: number): string =>
      `Pięknie zagrane - ${n} ${lm(n, "dźwięk", "dźwięki", "dźwięków")}! Warsztat jest odwiedzony. Przez „Ćwicz dalej” po prostu grasz dalej.`,
    falscherTon: (gespielt: string, gesucht: string): string => `To było ${gespielt} - właściwy dźwięk to: ${gesucht}.`,
    nichtsMehr: "już nic",
    memoryWeiter: (n: number): string =>
      `Udało się - ${n} ${lm(n, "dźwięk", "dźwięki", "dźwięków")}! Teraz dochodzi jeszcze jeden.`,
    memoryEnde: (best: number): string =>
      `Koniec serii - udało ci się zagrać pod rząd ${best} ${lm(best, "dźwięk", "dźwięki", "dźwięków")}. Zagram ci ten ciąg jeszcze raz.`,
    genauRichtig: "Dokładnie dobrze!",
    fertig: "Gotowe.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Wpisywanie brajla: f d s i j k l to punkty, spacja to kreska taktowa. Komórka ${zelle} z ${von}. Przytrzymanie klawisza Shift pokazuje i mówi klawisze komórki.`,
    nochmalAnhoeren: "Posłuchaj jeszcze raz",
    diktat: "Słuchaj, ile chcesz - to nie liczy się jako błąd. Potem zapisz komórka po komórce to, co słyszysz.",
    vor: "Pisz klawiszami ",
    mitte: (zelle: number, von: number): string => ` - komórka ${zelle} z ${von} · `,
    umschalt: "⇧ Shift",
    nach: " pokazuje komórkę",
    taktstrichTitel: "Kreska taktowa (spacja)",
    gedrueckt: (punkte: string): string => `Naciśnięte: punkty ${punkte}`,
    aktuelleStelleLeertaste: "Bieżące miejsce: spacja - kreska taktowa.",
    genauRichtig: "Dokładnie dobrze!",
    fertig: "Gotowe.",
  },

  takt: {
    aria: (n: number): string =>
      `Budowniczy taktów: pisz klawiszami f d s j k l nuty albo pauzy; każda od razu brzmi. Backspace usuwa ostatnią komórkę, Enter sprawdza takt. Do tej pory ${n} ${lm(n, "komórka", "komórki", "komórek")} w takcie.`,
    vor: "Zbuduj takt klawiszami ",
    mitte: " - każda nuta i pauza brzmi. ",
    loescht: " usuwa, ",
    pruefen: (a: number, b: number): string => ` sprawdza takt (metrum ${a}/${b}).`,
    nochLeer: "Jeszcze pusto - zaczynaj.",
    taktPruefen: "Sprawdź takt (Enter)",
    loeschen: "Usuń (⌫)",
    pause: "Pauza",
    nominativ: (dativ: string): string => dativ,
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "To nie jest komórka nuty ani pauzy. Weź nutę (f d s j k l) albo pauzę.",
    alsGelesen: (wert: string): string => ` - odczytane jako ${wert}, bo to jeszcze pasuje`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Razem ${summe} z ${ganz} ${dopelniacz(einheit)}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string =>
      `Ostatnia komórka usunięta. W takcie jest teraz ${anzahl} ${dopelniacz(einheit)} w sumie.`,
    fehlen: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `Do pełnego taktu brakuje jeszcze ${anzahl} ${einzahl ? dopelniacz(einheit) : einheit}.`,
    zuViel: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `Za dużo - nadmiar ${anzahl} ${einzahl ? dopelniacz(einheit) : einheit}. Zabierz coś.`,
    mindestensNoten: (n: number): string =>
      `Takt jest pełny, ale potrzeba w nim co najmniej ${n} ${n === 1 ? "nuty" : "nut"}.`,
    mindestensPause: "Takt jest pełny - ale musi w nim być co najmniej jedna pauza.",
    voll: "Pełny takt! Posłuchaj go.",
    vollSauber: "Dokładnie pełny - czysty takt! Posłuchaj go.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Warsztat kompozytora: pisz swobodnie klawiszami f d s j k l, spacja to kreska taktowa. Słuchanie, usuwanie i zapisywanie przyciskami. Do tej pory ${zellen} ${lm(zellen, "komórka", "komórki", "komórek")}, zapisane utwory: ${werke} z 5.`,
    vor: "Pisz swobodnie klawiszami ",
    mitte: " - spacja = kreska taktowa, ",
    nach: " usuwa ostatnią komórkę.",
    leeresBlatt: "Pusta kartka - komponuj śmiało.",
    anhoeren: "Posłuchaj",
    loeschen: "Usuń",
    nameFuerWerk: "Nazwa twojego utworu",
    speichern: "Zapisz",
    nochNichtsGeschrieben: "Jeszcze nic nie napisane - najpierw napisz kilka nut.",
    geleert: "Warsztat wyczyszczony.",
    schonFuenf: "Masz już zapisane pięć utworów. Usuń jeden, a znowu się uda.",
    nochNichtsSpeichern: "Jeszcze nie ma czego zapisać.",
    meinWerk: (n: number): string => `Mój utwór ${n}`,
    gespeichert: (name: string, n: number): string => `„${name}" zapisany. Masz teraz ${n} z 5 utworów.`,
    gespeicherteListe: (namen: string, n: number): string => `Zapisane: ${namen} (${n} z 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Tylko prawa ręka (u góry, klucz wiolinowy)",
      lh: "Tylko lewa ręka (na dole, klucz basowy)",
      both: "Obie ręce",
    },
    rechteHand: "Prawa ręka · klucz wiolinowy",
    linkeHand: "Lewa ręka · klucz basowy",
  },

  touch: {
    gruppe: "Wpisywanie dotykiem",
    anleitungVor: "Dotknij punktów komórki, a potem ",
    zelleSetzen: "Wstaw komórkę",
    anleitungNach: ".",
    punkteGruppe: "Sześć punktów jednej komórki",
    punkt: (p: number): string => `Punkt ${p}`,
    taktstrich: "Kreska taktowa",
    pause: "Pauza",
    letzteLoeschen: "Usuń ostatnią komórkę",
    taktPruefen: "Sprawdź takt",
    bsiTitel: "Wprowadzanie brajla na ekranie w VoiceOver",
    bsiHinweis:
      "Ustaw pokrętło (rotor) na wprowadzanie brajla na ekranie i wpisuj komórki w to pole. Przesunięcie jednym palcem w prawo to kreska taktowa, w lewo usuwa ostatnią komórkę.",
    testen: "Sprawdź wpisywanie brajla - co dociera?",
    nochNichts: "Jeszcze nic nie wpisano.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `„${text}" (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "nie rozpoznano komórki",
    nochKeinPunkt: "Nie wybrano jeszcze żadnego punktu. Najpierw dotknij punktów, potem Wstaw komórkę.",
    unbekannt: (zeichen: string): string =>
      `Znaku ${zeichen} nie potrafię odczytać jako punktów. Użyj przycisków punktów.`,
  },
};
