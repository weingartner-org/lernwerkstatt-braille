/**
 * Bereich `aufgabenC` - Polski: zadania światów 7 (Plac zabaw z teorią), 8 (Świat instrumentów)
 * i 9 (Scena piosenek) z `etappen.ts`. Kolejność list wyboru = kolejność w kodzie.
 * Fachwörter: polnische Musiktheorie (gama, koło kwintowe, półkadencja, kadencja doskonała,
 * plagalna, autentyczna, tonika, subdominanta, dominanta, palcowanie, melizmat, bas cyfrowany,
 * instrumenty strunowe/dęte/membranowe/samobrzmiące). Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenC as De } from "../de/aufgabenC";

/** Liczba mnoga po polsku: 1 / 2-4 (bez 12-14) / 5+. */
const lm = (n: number, jeden: string, kilka: string, wiele: string): string => {
  if (n === 1) return jeden;
  const r10 = n % 10;
  const r100 = n % 100;
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? kilka : wiele;
};

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `znak oktawowy - ${oktave}`,
    oktavzeichen: "znak oktawowy",
    vorzeichen: "znak wstępny",
    verlaengerungspunkt: "kropka przedłużająca - punkt 3",
    taktstrich: "kreska taktowa - spacja",
  },

  // --- Świat 7 „Plac zabaw z teorią" ----------------------------------------
  tonleitern: {
    spielNach:
      "Zagraj gamę C-dur w górę: c d e f g a h c - na klawiaturze D F G H J K L, potem oktawa w górę i jeszcze raz D.",
    spielNachErkl: "Osiem stopni od c do następnego c.",
    durMollFrage: "Posłuchaj gamy - dur (jasna) czy moll (ciemna)?",
    durMollWahl: ["Dur", "Moll"],
    durMollErklMoll: "Trzeci stopień jest obniżony - moll naturalny.",
    durMollErklDur: "Czysta gama durowa.",
    fehlerFrage: "W tej gamie durowej JEDEN dźwięk się przesunął. Który stopień był zły?",
    fehlerWahl: ["Stopień 3", "Stopień 4", "Stopień 5", "Stopień 6", "Stopień 7"],
    fehlerErkl: (stufe: number): string => `Stopień ${stufe} brzmiał za wysoko.`,
    schreibe:
      "Zapisz gamę G-dur: g a h c d e - a potem fis, czyli krzyżyk przed f (to jedyny znak przykluczowy G-dur).",
    schreibeErkl: "G-dur ma jeden krzyżyk: f zmienia się w fis.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "krzyżyk", mehr: "krzyżyki" },
      be: { ein: "bemol", mehr: "bemole" },
    },
    anzahlFrage: (name: string, mehr: string): string => `Stacja: ${name}. Policz ${mehr} tej tonacji - ile ich jest?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} ma ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - jaka to tonacja durowa?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: to ${name}.`,
    lesenFrage: "Przeczytaj znaki przykluczowe w brajlu - jaka to tonacja?",
    lesenErkl: (name: string): string => `Te znaki przykluczowe należą do tonacji ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Przeczytaj rytm na pięciolinii i wystukaj go spacją - a vista.",
    diktatFrage: (rhythm: boolean): string =>
      `Dyktando rytmiczne: wystukuję takt na dźwięku g. Zapisz wartości, które słyszysz${rhythm ? " (sylaby rytmiczne są włączone)" : ""}. Dźwięk początkowy to g. Słuchaj, ile razy chcesz.`,
    diktatErkl: "Policz miary każdego dźwięku: ćwierćnuta = jedna miara, półnuta = dwie.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Dyktando melodyczne: dźwięk początkowy to ${startton}. Posłuchaj ${anzahl} ${lm(anzahl, "dźwięku", "dźwięków", "dźwięków")} i zapisz je - idą małymi krokami. Słuchaj, ile razy chcesz.`,
    erkl: "Porównuj dźwięk po dźwięku z dźwiękiem początkowym: idzie w górę czy w dół?",
  },

  detektiv: {
    frage: "Przeczytaj linijkę brajla i posłuchaj nagrania. W którym miejscu dźwięk różni się od nut?",
    note: (n: number): string => `Nuta ${n}`,
    allesRichtig: "Wszystko się zgadza",
    erklRichtig: "Wszystko się zgadzało - dźwięk i nuty były takie same.",
    erklAnders: (n: number): string => `Nuta ${n} brzmiała inaczej, niż jest zapisana.`,
  },

  baumeister: {
    dreiViertel: "Zbuduj pełny takt 3/4: pisz nuty i pauzy klawiszami f d s j k l, aż miary dadzą dokładnie trzy. Enter sprawdza.",
    mitPause: "Zbuduj takt 4/4 z co najmniej JEDNĄ pauzą. Enter sprawdza.",
    mitNoten: "Zbuduj takt 4/4 z co najmniej TRZEMA nutami. Enter sprawdza.",
    sechsAchtel: "Wyzwanie: zbuduj pełny takt 6/8 (sześć miar ósemkowych). Enter sprawdza.",
  },

  spielwiese: {
    frage:
      "Dźwiękowy plac zabaw: nad cichym burdonem możesz grać swobodnie - klawiszami D F G J K (pentatonika). Żaden dźwięk nie może być zły. Opowiedz małą historię: najpierw cicho, potem głośno. Od 30 dźwięków warsztat jest odwiedzony.",
  },

  kadenzen: {
    schlussFrage: "Dwa akordy jako zakończenie - brzmi to skończenie czy idzie dalej?",
    schlussWahl: ["Skończone - prawdziwe zakończenie", "Otwarte - idzie dalej"],
    schlussErklOffen: "Na dominancie (V) zostaje otwarte - półkadencja.",
    schlussErklZu: "Z dominanty z powrotem do akordu tonicznego - to brzmi skończenie (kadencja doskonała).",
    artFrage: "Jaki to zwrot kadencyjny?",
    artWahl: ["Autentyczny - z dominanty (V) do akordu tonicznego", "Plagalny - zakończenie „Amen” z subdominanty (IV)"],
    artErklPlagal: "IV do I - miękkie zakończenie „Amen” (plagalne).",
    artErklAuth: "V do I - mocne, autentyczne zakończenie.",
    funktionFrage: "Jaką funkcję ma ten akord w C-dur?",
    funktionWahl: ["Tonika (stopień I)", "Subdominanta (stopień IV)", "Dominanta (stopień V)"],
    funktionErkl: [
      "Tonika (T) - akord podstawowy na stopniu I.",
      "Subdominanta (S) - stopień IV.",
      "Dominanta (D) - stopień V.",
    ],
  },

  komponier: {
    frage:
      "Warsztat kompozytora: pisz swobodnie klawiszami f d s j k l, posłuchaj swojego utworu i go zapisz (do pięciu). Warsztat jest odwiedzony, gdy tylko zapiszesz jeden utwór.",
  },

  // --- Świat 8 „Świat instrumentów" -----------------------------------------
  fingersatz: {
    lesenFrage: "Przeczytaj nutę i palcowanie: który palec ma zagrać tę nutę? (Palcowanie stoi PO nucie.)",
    lesenErkl: (finger: string): string => `Mała cyfra po nucie to: ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Zapisz nutę ${ton} i dodaj palcowanie (${finger}) - stoi PO nucie.`,
    fingerZelle: (finger: string): string => `${finger} - palcowanie`,
    schreibenErkl: (finger: string): string => `Palcowanie (${finger}) stoi zaraz za nutą.`,
    positionFrage: "Gdzie stoi palcowanie - przed nutą czy po niej?",
    positionWahl: ["Po nucie", "Przed nutą"],
    positionErkl: "Inaczej niż artykulacja palcowanie stoi PO nucie (przed ewentualnym łukiem przedłużającym).",
  },

  klavier: {
    zweiFrage:
      "Dwie linijki - u góry prawa ręka (klucz wiolinowy), na dole lewa ręka (klucz basowy). Ile dźwięków gra LEWA ręka? Klawiszami Alt + Q możesz jedną rękę osobno zobaczyć w powiększeniu i usłyszeć.",
    zweiWahl: (n: number): string => `${n} ${lm(n, "dźwięk", "dźwięki", "dźwięków")}`,
    zweiErkl: "Policz główki nut w dolnej linijce - albo posłuchaj samej niskiej ręki (Alt + Q).",
    handFrage: "Ta linijka zaczyna się od znaku ręki. Dla której ręki jest?",
    handWahl: ["Prawa ręka", "Lewa ręka"],
    handErklLinks: "Punkty 4, 5, 6, a potem 3, 4, 5: znak lewej ręki.",
    handErklRechts: "Punkty 4, 6, a potem 3, 4, 5: znak prawej ręki.",
    melodieFrage:
      "Dwie ręce po kolei: jedna gra melodię (wyżej, ruchliwie), druga akompaniuje nisko. Która była melodią?",
    melodieWahl: ["Głos zagrany jako pierwszy", "Drugi głos"],
    melodieErkl: "Melodia to wyższy, ruchliwy głos - zwykle prawa ręka.",
    rechteHandFrage: (ton: string): string =>
      `Zapisz znak prawej ręki (punkty 4, 6 · 3, 4, 5), a po nim nutę ${ton} ze znakiem oktawowym.`,
    rechteHandZellen: ["prawa ręka, pierwsza komórka - punkty 4, 6", "prawa ręka, druga komórka - punkty 3, 4, 5"],
    rechteHandErkl: "Po znaku ręki głos zaczyna się od znaku oktawowego.",
    pedalFrage: "Jaki to znak pedału - i czy stoi przed nutą, czy po niej?",
    pedalWahl: ["Pedał wciśnięty - PRZED nutą", "Pedał zwolniony - PO nucie"],
    pedalErklNieder: "Pedał wciśnięty (punkty 1, 2, 6 · 1, 4) stoi przed nutą, od której się go naciska.",
    pedalErklAuf: "Pedał zwolniony (punkty 1, 6 · 1, 4) stoi po nucie, przy której się go puszcza.",
  },

  gesang: {
    melismaFrage: "Na sylabie „la” - ile dźwięków śpiewa głos? (Kilka dźwięków na jednej sylabie to melizmat.)",
    melismaWahl: ["Jeden dźwięk", "Dwa dźwięki", "Trzy dźwięki"],
    melismaErkl: (n: number): string =>
      `Sylaba dostaje ${n} ${lm(n, "dźwięk", "dźwięki", "dźwięków")} - to melizmat. W brajlu łączy je łuk sylabowy (punkty 1, 4).`,
    bogenFrage:
      "Jedna sylaba na dwóch dźwiękach: zapisz pierwszą nutę, łuk sylabowy (punkty 1, 4) i drugą nutę.",
    bogenZelle: "łuk sylabowy - punkty 1, 4",
    bogenErkl: "Łuk sylabowy mówi: oba dźwięki należą do jednej sylaby.",
    atemFrage: "W tej linijce stoi znak oddechu. Po którym dźwięku bierze się oddech?",
    atemWahl: ["Po pierwszym dźwięku", "Po drugim dźwięku", "Po trzecim dźwięku"],
    atemErkl: "Półznak oddechu (punkty 3, 4, 5 · 2) stoi zaraz po pierwszym dźwięku.",
    zeilenFrage: "W śpiewie linijki tekstu i linijki muzyki się przeplatają. Który prefiks zapowiada linijkę TEKSTU?",
    zeilenWahl: ["Prefiks tekstu (punkty 5, 6 · 2, 3)", "Prefiks muzyki (punkt 6 · 3)"],
    zeilenErkl: "Linijka tekstu ma prefiks punkty 5, 6 · 2, 3; linijka muzyki punkt 6 · punkt 3.",
  },

  gitarre: {
    saiteFrage:
      "Znak struny (punkty 1, 4, 6) i cyfra mówią, na której strunie się gra. Która to struna?",
    saiteWahl: (s: number): string => `Struna ${s}`,
    saiteErkl: (s: number): string => `Znak struny plus cyfra ${s}: struna numer ${s} (licząc od najcieńszej).`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Zapisz oznaczenie struny numer ${saite}, a potem nutę ${ton}: najpierw znak struny (punkty 1, 4, 6), potem cyfrę, potem nutę.`,
    saitenzeichenZelle: "znak struny - punkty 1, 4, 6",
    ziffernZelle: (saite: number): string => `cyfra ${saite} - struna numer ${saite}`,
    schreibenErkl: "Znak struny stoi przed nutą; po nim NIE ma znaku oktawowego.",
    akkordSorten: { dur: "trójdźwięk durowy", moll: "trójdźwięk molowy", sept: "akord dominanty septymowej (7 kursywą)" },
    akkordFrage:
      "Posłuchaj rozłożonego akordu - jaki to rodzaj? (Kółko, trójkąt i 7 kursywą są międzynarodowe; symbole literowe takie jak „C7” każdy kraj zapisuje trochę inaczej.)",
    akkordErkl: (sorte: string): string => `To był ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "Nuta basowa ma cyfrę 6. Które opracowanie brzmi dobrze - z sekstą czy z kwintą nad basem?",
    aussetzungWahl: ["Tercja i seksta nad basem", "Tercja i kwinta nad basem"],
    aussetzungErklSext: "Cyfra 6 wymaga seksty nad basem - to akord sekstowy.",
    aussetzungErklQuint: "Bez cyfrowania (albo 5/3) brzmi akord podstawowy z kwintą.",
    stufeFrage: "Bas cyfrowany myśli stopniami. Jaki stopień główny tu słyszysz?",
    stufeWahl: ["Tonika (stopień I)", "Subdominanta (stopień IV)", "Dominanta (stopień V)"],
    stufeErkl: [
      "To była tonika (stopień I) - pomost od kadencji do basu cyfrowanego.",
      "To była subdominanta (stopień IV) - pomost od kadencji do basu cyfrowanego.",
      "To była dominanta (stopień V) - pomost od kadencji do basu cyfrowanego.",
    ],
    schreibenFrage:
      "Zapisz nutę basową z cyfrą: c, a pod nim cyfrowanie 6 (znak liczby i dolna cyfra 6).",
    zahlzeichenZelle: "znak liczby - punkty 3, 4, 5, 6",
    ziffer6Zelle: "dolna cyfra 6 - punkty 2, 3, 5",
    schreibenErkl: "Cyfry basu cyfrowanego stoją jako DOLNE cyfry za znakiem liczby.",
  },

  partitur: {
    auftakt: {
      frage: "Utwór zaczyna się od przedtaktu. Jaki numer ma ten pierwszy, niepełny takt?",
      wahl: ["Takt 0", "Takt 1", "Takt 2"],
      erkl: "Przedtakt liczy się jako takt 0 - pierwszy pełny takt to wtedy takt 1.",
    },
    taktzahl: {
      frage: "Tak wygląda numer taktu na brzegu linijki (tutaj: szesnaście). Czy stoi przed nim znak liczby?",
      wahl: ["Nie - numery taktów stoją bez znaku liczby", "Tak - zawsze ze znakiem liczby"],
      erkl: "Numery taktów na brzegu stoją bez znaku liczby - tylko same cyfry.",
    },
    format: {
      frage: "Jak partytura brajlowska układa dwie ręce albo głosy, żeby można je było porównywać takt po takcie?",
      wahl: ["Odcinkami linijka nad linijką (bar-over-bar)", "Wszystko w jednej długiej linijce"],
      erkl: "W formacie bar-over-bar głosy stoją odcinkami jeden nad drugim - takt obok taktu.",
    },
    quellen: {
      frage: "Gdzie można dostać gotowe wydania nut brajlowskich do czytania?",
      wahl: ["W bibliotekach dla niewidomych, takich jak dzb lesen czy SBS", "Tylko przepisując samemu"],
      erkl: "Biblioteki takie jak dzb lesen (Lipsk) i SBS (Zurych) mają tysiące tytułów w nutach brajlowskich.",
    },
  },

  orchester: {
    familieKlavier: "instrument strunowy (uderzany)",
    familieGitarre: "instrument strunowy (szarpany)",
    familieBlas: "instrument dęty",
    hoerenFrage: "Posłuchaj krótkiego motywu - do jakiej rodziny instrumentów należy to brzmienie?",
    hoerenWahl: ["Strunowe - szarpane albo uderzane", "Dęte - z powietrzem", "Membranowe - uderzane w membranę"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument} to ${familie}.`,
    fragen: [
      { frage: "Do jakiej rodziny należy bęben (według Hornbostela-Sachsa)?", richtig: "Membranowe", falsch: ["Strunowe", "Dęte"] },
      { frage: "Do jakiej rodziny należą skrzypce?", richtig: "Strunowe", falsch: ["Dęte", "Membranowe"] },
      { frage: "Do jakiej rodziny należy flet prosty?", richtig: "Dęte", falsch: ["Membranowe", "Samobrzmiące"] },
      { frage: "Do jakiej rodziny należy trójkąt?", richtig: "Samobrzmiące", falsch: ["Membranowe", "Strunowe"] },
    ],
    familieErkl: (richtig: string): string => `Dobrze: ${richtig}.`,
  },

  // --- Świat 9 „Scena piosenek" ---------------------------------------------
  lieder2: {
    dazuWahl: [
      "Zrobiło się głośniej - crescendo",
      "Dźwięki stały się krótkie - staccato",
      "Dźwięki miękko płynęły jeden w drugi - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `„${titel}” - najpierw sucho, potem z wyrazem. Co doszło?`,
    dazuDynamikErkl: "Druga wersja zrobiła się głośniejsza - crescendo.",
    dazuStaccatoFrage: (titel: string): string => `„${titel}” - co doszło do suchej wersji?`,
    dazuStaccatoErkl: "Dźwięki stały się krótkie i ostre - staccato.",
    dazuLegatoFrage: (titel: string): string => `„${titel}” - co doszło?`,
    dazuLegatoErkl: "Dźwięki zostały miękko połączone - legato, łuk legato.",
    articFrage: (titel: string): string => `„${titel}” - zagrane legato (połączone) czy krótko (staccato)?`,
    articWahl: ["Połączone - legato", "Krótko - staccato"],
    articErklLegato: "Dźwięki płynęły jeden w drugi - legato.",
    articErklStaccato: "Każdy dźwięk krótko oddzielony - staccato.",
  },

  lesekonzert: {
    frage:
      "Koncert czytania: przeczytaj linijkę brajla (NIE będzie zagrana!), zapamiętaj ją i naciśnij „Przeczytane”. Potem zagraj dźwięki z pamięci na klawiaturze.",
    erkl: "Czytać, zapamiętać, zagrać - dokładnie tak czyta się nuty brajlowskie przy instrumencie.",
  },

  liederquiz: {
    hoerenFrage: "Posłuchaj początku - jaka to piosenka?",
    hoerenErkl: (titel: string): string => `To był początek piosenki „${titel}”.`,
    lesenFrage: "Przeczytaj pierwszą linijkę w brajlu - bez dźwięku! Jaką piosenkę rozpoznajesz?",
    lesenErkl: (titel: string): string => `Ta linijka to początek piosenki „${titel}” - ciche czytanie wewnętrznym uchem.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, linijka ${zeile}: najpierw posłuchaj, potem zapisz nuta po nucie - teraz ZE znakami oktawowymi.`,
  },
};
