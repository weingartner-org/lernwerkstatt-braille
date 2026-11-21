/**
 * Bereich `uebersicht` - Polski: wybór rozdziałów, komunikaty, odznaki, Mix dnia, menu dźwięku
 * i tabela klasy dla nauczycieli. Teksty z liczbami i nazwami są funkcjami.
 * Fachwörter: polnische Musiktheorie; unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { uebersicht as De } from "../de/uebersicht";

/** Liczba mnoga po polsku: 1 / 2-4 (bez 12-14) / 5+. */
const lm = (n: number, jeden: string, kilka: string, wiele: string): string => {
  if (n === 1) return jeden;
  const r10 = n % 10;
  const r100 = n % 100;
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? kilka : wiele;
};

export const uebersicht: typeof De = {
  // --- Komunikaty -----------------------------------------------------------
  kapitelwahlAnsage: "Wybór rozdziałów. Wszystkie rozdziały można wybierać dowolnie - gwiazdki pokazują twój stan.",
  kapitelAnsage: (nr: number, welt: string, i: number, n: number, kapitel: string) =>
    `Świat dźwięków ${nr}, ${welt} - rozdział ${i} z ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel: string) => `Rozdział: ${kapitel}.`,
  neuesAbzeichen: (name: string) => `Nowa odznaka: ${name}!`,
  neueAbzeichen: (namen: string[]) => `Nowe odznaki: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne: number) => `Udało się! +30 XP · ${sterne} z 3 gwiazdek za ten rozdział`,
  geschafft: "Udało się! +30 XP",
  zeichenlisteOffen: "Lista znaków otwarta.",
  zeichenlisteZu: "Lista znaków zamknięta.",
  weltInArbeit: (nr: number, name: string) =>
    `Świat dźwięków ${nr}, ${name}, jest jeszcze w budowie - pojawi się w późniejszym etapie.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Nuty brajlowskie: słuchać, czuć, pisać.",

  // --- Pasek górny ----------------------------------------------------------
  rangCaption: "Ranga",
  rangLabel: (level: number, rest: number) => `Ranga ${level} - do następnej brakuje jeszcze ${rest} XP.`,
  xpHinweis: (xp: number) => `${xp} XP - 2 za każdą dobrą odpowiedź, 30 za każdy rozdział.`,
  xpText: (xp: number) => `${xp} XP`,
  sterneHinweis: (n: number, max: number) => `${n} z ${max} gwiazdek - do 3 za każdy rozdział.`,
  weltName: (nr: number, titel: string) => `Świat dźwięków ${nr}: ${titel}`,
  weltKopf: (nr: number, titel: string, i: number, n: number) =>
    `Świat dźwięków ${nr}: ${titel} - rozdział ${i} z ${n}`,
  voriges: "Poprzedni rozdział",
  naechstes: "Następny rozdział",
  kapitelSelect: "Wybierz rozdział - przewijaj strzałką w górę i w dół",
  kapitelOption: (i: number, titel: string, sterne: number | null) =>
    `Rozdział ${i}: ${titel}${sterne === null ? "" : ` - opanowany, ${sterne} z 3 gwiazdek`}`,
  landkarte: (kapitel: number, welten: number) =>
    `${kapitel} ${lm(kapitel, "rozdział", "rozdziały", "rozdziałów")} w ${welten} ${lm(welten, "świecie", "światach", "światach")} dźwięków - wszystkie do wyboru`,
  kapitelwahlKnopf: "Wybór rozdziałów",
  kapitelwahlTitel: "Wszystkie światy dźwięków i rozdziały z twoimi gwiazdkami (Alt + U)",
  zeichenlisteKnopf: "Lista znaków",
  zeichenlisteTitel: "Lista wszystkich znaków nutowych, w kolejności twojej nauki (Alt + L)",

  // --- Wybór rozdziałów -----------------------------------------------------
  kapitelwahlUeberschrift: "Wybór rozdziałów - wybierz, co chcesz ćwiczyć",
  mixTitel: "Mix dnia",
  mixText: "Pięć minut kolorowej mieszanki - zadania ze wszystkich opanowanych rozdziałów, bez gwiazdek, tylko na rozgrzewkę.",
  loslegen: "Zaczynamy",
  mixZuWenig: (n: number) =>
    `Najpierw opanuj kilka rozdziałów (co najmniej 3), a potem pojawi się tu twój Mix dnia. Opanowane do tej pory: ${n} z 3 potrzebnych.`,
  weltStand: (fertig: number, n: number, sterne: number, max: number) =>
    `${fertig} z ${n} rozdziałów opanowanych · ${sterne} z ${max} gwiazdek`,
  kapitelZeile: (i: number, titel: string) => `Rozdział ${i}: ${titel}`,
  werkeText: (n: number) => ` · ${n} z 5 utworów`,
  besucht: "✓ odwiedzony",
  srBesucht: "- odwiedzony.",
  srNichtBesucht: "- jeszcze nie odwiedzony.",
  srGemeistert: (sterne: number) => `- opanowany, ${sterne} z 3 gwiazdek.`,
  srNichtGemeistert: "- jeszcze nie opanowany.",

  // --- Galeria odznak -------------------------------------------------------
  abzeichenTitel: "Odznaki",
  abzeichenStand: (verdient: number, alle: number) =>
    `${verdient} z ${alle} odznak zdobytych - zbieraj gwiazdki, opanuj światy, pisz dyktanda, buduj takty i graj piosenki z pamięci.`,
  geheimAbzeichen: "Tajna odznaka",
  geheimBeschreibung: "Jeszcze zamknięta - odkryj ją!",
  srVerdient: "zdobyta.",
  srGeheim: "tajna, jeszcze nie zdobyta.",
  srNichtVerdient: "jeszcze nie zdobyta.",

  // --- Mix dnia -------------------------------------------------------------
  mixIntro:
    "Mix dnia - krótka, kolorowa runda powtórek ze wszystkich opanowanych rozdziałów. Na luzie: tu nic się nie liczy, nie ma gwiazdek.",
  mixStart: (n: number) =>
    `Mix dnia rozpoczęty - pięć minut powtórek z ${n} ${lm(n, "opanowanego rozdziału", "opanowanych rozdziałów", "opanowanych rozdziałów")}.`,
  mixEnde: (vomKind: boolean, richtig: number, gesamt: number) =>
    `${vomKind ? "Runda zakończona." : "Czas minął!"} Dobrze rozwiązane: ${richtig} z ${gesamt} ${gesamt === 1 ? "zadania" : "zadań"}.`,
  mixGeschafft: "Mix dnia ukończony!",
  mixErgebnis: (richtig: number, gesamt: number) =>
    `${richtig} z ${gesamt} ${gesamt === 1 ? "zadania" : "zadań"} dobrze`,
  mixProzent: (pct: number) => ` · ${pct} %`,
  mixFein: "Dobra powtórka - stan gry zostaje taki, jaki był.",
  nochEineRunde: "Jeszcze jedna runda",
  zurKapitelwahl: "Do wyboru rozdziałów",
  mixBunt: (n: number) =>
    `Kolorowa mieszanka z ${n} ${lm(n, "opanowanego rozdziału", "opanowanych rozdziałów", "opanowanych rozdziałów")}`,
  mixTimer: (min: number, sek: number) =>
    `Zostało jeszcze ${min} ${lm(min, "minuta", "minuty", "minut")} i ${sek} ${lm(sek, "sekunda", "sekundy", "sekund")}`,
  mixRichtigLabel: (richtig: number, gesamt: number) => `${richtig} z ${gesamt} dobrze`,
  mixRichtig: "dobrze",
  beenden: "Zakończ",

  // --- Menu dźwięku ---------------------------------------------------------
  akustikMusik: "Muzyka",
  akustikMusikErklaerung:
    "Instrumenty grają nuty zadań. Są częścią zadania - dlatego nie ma wyłącznika, jest tylko głośność.",
  akustikInstrument: "Instrument",
  akustikInstrumentErklaerung: "Na jakim instrumencie brzmią nuty. Po zmianie instrument gra na próbę dźwięk c.",
  akustikLautstaerke: "Głośność muzyki",
  akustikLautstaerkeErklaerung:
    "Jak głośno grają instrumenty. 100 % to mniej więcej tak głośno jak głos. Muzyka całkiem cichnie dopiero przy 0 %.",

  // --- Tabela klasy (nauczyciele) -------------------------------------------
  matrixSterne: (n: number) => `${n} ${lm(n, "gwiazdka", "gwiazdki", "gwiazdek")}`,
  matrixLaedt: "wczytywanie",
  matrixKapitelImEinzelnen: "Rozdziały szczegółowo",
  matrixAufklappLabel: (name: string, offen: boolean) =>
    `Rozdziały szczegółowo: ${name} ${offen ? "zwiń" : "rozwiń"}`,
  matrixAufklappTipp: (name: string) => `Rozdziały - ${name}: każdy rozdział z gwiazdkami.`,
  matrixWeltSr: (nr: number, titel: string, fertig: number, n: number, sterne: string) =>
    `Świat dźwięków ${nr}, ${titel}: ${fertig} z ${n} rozdziałów opanowanych, ${sterne}.`,
  matrixGesamtSr: (fertig: number, n: number, sterne: string) =>
    `Razem ${fertig} z ${n} rozdziałów opanowanych, ${sterne}.`,
  matrixRegion: (name: string) => `Rozdziały szczegółowo: ${name}`,
  matrixGemeistert: (sterne: string) => `opanowany, ${sterne}`,
  matrixNichtGemeistert: "jeszcze nie opanowany",
  matrixTabelle: "Postępy klasy w Klangpunkte",
  matrixName: "Imię",
  matrixWeltKurz: (nr: number) => `Ś${nr}`,
  matrixWeltTitel: (nr: number, titel: string) => `Świat dźwięków ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr: number, titel: string) => `: świat dźwięków ${nr}, ${titel}`,
  matrixGesamt: "Razem",
  matrixZuletzt: "Ostatnio",
  matrixFuss:
    "Liczba w polu = opanowane rozdziały tego świata dźwięków. Strzałka przed imieniem pokazuje każdy rozdział z gwiazdkami. Widać dokładnie to, co dziecko widzi o sobie - nic więcej.",
};
