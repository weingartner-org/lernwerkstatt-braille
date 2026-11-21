/**
 * Bereich `aufgabenB` - Polski. Zadania światów 4 „Ekspresja", 5 „Budujemy formy"
 * i 6 „Współbrzmienie" z `etappen.ts`.
 * Fachwörter: polnische Musiktheorie (łuk legato, łuk przedłużający, fermata, widełki, przednutek,
 * tryl, obiegnik, mordent górny/dolny, volta, refren, pryma ... oktawa, dur, moll, zmniejszony).
 * Nazwy interwałów są rodzaju żeńskiego. Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenB as De } from "../de/aufgabenB";

/** Liczba mnoga po polsku: 1 / 2-4 (bez 12-14) / 5+. */
const lm = (n: number, jeden: string, kilka: string, wiele: string): string => {
  if (n === 1) return jeden;
  const r10 = n % 10;
  const r100 = n % 100;
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? kilka : wiele;
};

const duza = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const INTERWALY: Record<number, string> = {
  1: "pryma", 2: "sekunda", 3: "tercja", 4: "kwarta", 5: "kwinta", 6: "seksta", 7: "septyma", 8: "oktawa",
};

export const aufgabenB: typeof De = {
  gemeinsam: {
    taktstrich: "kreska taktowa - spacja",
    oktavzeichenDer: (oktave: string): string => `znak oktawowy - ${oktave}`,
    oktavzeichen: "znak oktawowy",
    verlaengerungspunkt: "kropka przedłużająca - punkt 3",
    vorzeichen: "znak wstępny",
    zusatzzelle: "dodatkowa komórka",
    dasM: "m",
    dasF: "f",
    dasP: "p",
    vorDerNote: "Przed nutą",
    nachDerNote: "Po nucie",
  },

  // --- Świat 4: łuk legato --------------------------------------------------
  bindebogen: {
    hoerenPrompt: "Motyw był zagrany legato (połączony) czy oddzielnie?",
    hoerenChoices: ["Połączony - legato", "Oddzielnie"],
    hoerenExplainGebunden: "Dźwięki miękko przechodziły jeden w drugi - legato, łuk legato.",
    hoerenExplainGetrennt: "Każdy dźwięk był wyraźnie oddzielony - bez łuku.",
    welcherHaltePrompt: "Jeden dźwięk, zapisany dwa razy, JEDNO uderzenie - jaki to łuk?",
    welcherBindePrompt: "Dwa RÓŻNE dźwięki, miękko połączone, dwa uderzenia - jaki to łuk?",
    welcherChoices: ["Łuk przedłużający - ta sama wysokość, jeden dźwięk", "Łuk legato - legato między dźwiękami"],
    welcherExplainHalte: "Ta sama wysokość, jedno jedyne uderzenie: łuk przedłużający - punkt 4, potem punkty 1 i 4.",
    welcherExplainBinde: "Różne wysokości, miękko połączone: łuk legato - punkty 1 i 4 po nucie.",
    schreibenPrompt: "Zapisz trzy dźwięki legato: po każdej nucie oprócz ostatniej stoi łuk legato (punkty 1 i 4).",
    bindebogenLabel: "łuk legato - punkty 1, 4",
    letzteFrei: (note: string): string => `${note} - ostatnia nuta zostaje wolna`,
    schreibenExplain: "Łuk legato stoi po każdej połączonej nucie - tylko ostatnia zostaje bez niego.",
    verdopplungPrompt: "Długa fraza ponad czterema nutami: łuk legato stawia się PODWÓJNIE po pierwszej nucie i pojedynczo po przedostatniej.",
    verdopplungErste: "łuk legato podwójny, pierwsza komórka - punkty 1, 4",
    verdopplungZweite: "łuk legato podwójny, druga komórka - punkty 1, 4",
    verdopplungVorletzte: "łuk legato pojedynczy po przedostatniej nucie - punkty 1, 4",
    verdopplungExplain: "Podwojenie: dwa łuki po pierwszej nucie, jeden po przedostatniej - to oszczędza wiele pojedynczych łuków.",
  },

  // --- Świat 4: artykulacja -------------------------------------------------
  artikulation: {
    hoerenPrompt: "Jak był zagrany motyw?",
    hoerenChoices: ["Staccato - krótko, oddzielnie", "Tenuto - wytrzymane do końca", "Akcent - mocno zaakcentowane"],
    hoerenExplainStaccato: "Krótko i oddzielnie: staccato.",
    hoerenExplainTenuto: "Każdy dźwięk wytrzymany do końca: tenuto.",
    hoerenExplainAkzent: "Mocno uderzone: akcent.",
    positionPromptFermate: "Gdzie stoi fermata - przed nutą czy po niej?",
    positionPromptArtic: "Gdzie stoją staccato, tenuto i akcent - przed nutą czy po niej?",
    positionExplainFermate: "Fermata to wyjątek: stoi PO nucie - i nigdy nie jest podwajana.",
    positionExplainArtic: "Znaki artykulacji stoją PRZED nutą. Tylko fermata stoi po niej.",
    staccatoDoppeltErste: "staccato podwójne, pierwsza komórka - punkty 2, 3, 6",
    staccatoDoppeltZweite: "staccato podwójne, druga komórka - punkty 2, 3, 6",
    staccatoEinfachLetzte: "staccato pojedyncze przed ostatnią nutą - punkty 2, 3, 6",
    staccato: "staccato - punkty 2, 3, 6",
    staccatoVierPrompt: "Staccato na wszystkich czterech nutach: od czterech nut znak stawia się PODWÓJNIE przed pierwszą i pojedynczo przed ostatnią.",
    staccatoDreiPrompt: "Zapisz motyw staccato: przed KAŻDĄ nutą stoi znak staccato (punkty 2, 3, 6).",
    staccatoVierExplain: "Podwojenie mówi: wszystkie nuty do przedostatniej są staccato.",
    staccatoDreiExplain: "Każda nuta dostaje przed sobą swój znak staccato.",
    fermateErste: "fermata, pierwsza komórka - punkty 1, 2, 6",
    fermateZweite: "fermata, druga komórka - punkty 1, 2, 3",
    fermatePrompt: "Zapisz motyw i dodaj do ostatniego dźwięku fermatę - stoi PO nucie (punkty 1, 2, 6 · punkty 1, 2, 3).",
    fermateExplain: "Fermata zatrzymuje ostatni dźwięk - jako jedyny znak artykulacji stoi po nucie.",
    zeichenStaccato: "staccato",
    zeichenTenuto: "tenuto",
    zeichenAkzent: "akcent",
    zeichenFermate: "fermata",
    erkennenPrompt: "Jaki to znak?",
    erkennenExplain: (zeichen: string): string => `To był znak: ${zeichen}.`,
  },

  // --- Świat 4: dynamika ----------------------------------------------------
  dynamik: {
    lautPrompt: "Forte czy piano?",
    lautChoices: ["forte - głośno", "piano - cicho"],
    lautExplainLaut: "Głośno - forte, w brajlu znak słowny i f.",
    lautExplainLeise: "Cicho - piano, w brajlu znak słowny i p.",
    rampePrompt: "Crescendo czy decrescendo?",
    rampeChoices: ["crescendo - coraz głośniej", "decrescendo - coraz ciszej"],
    rampeExplainCresc: "Coraz głośniej: crescendo - widełki 345-14 do 345-25.",
    rampeExplainDecr: "Coraz ciszej: decrescendo - widełki 345-145 do 345-256.",
    schreibenPrompt: (sym: "f" | "p", note: string): string =>
      `Zapisz ${sym === "f" ? "forte" : "piano"}, potem nutę ${note}: najpierw znak słowny (punkty 3, 4, 5), potem ${sym === "f" ? "f" : "p"}, potem nutę.`,
    wortzeichen: "znak słowny dynamiki - punkty 3, 4, 5",
    buchstabeF: "f (forte) - punkty 1, 2, 4",
    buchstabeP: "p (piano) - punkty 1, 2, 3, 4",
    schreibenExplain: "Przed każdym słowem wykonawczym stoi znak słowny. Jeśli potem przychodzi nuta z punktami 1, 2 albo 3, później oddziela ją punkt 3 - to poznasz jeszcze dokładniej.",
    gabelAnfang: "początek widełek crescendo - punkty 3, 4, 5",
    gabelAnfangZweite: "początek widełek crescendo, druga komórka - punkty 1, 4",
    gabelEnde: "koniec widełek crescendo - punkty 3, 4, 5",
    gabelEndeZweite: "koniec widełek crescendo, druga komórka - punkty 2, 5",
    gabelPrompt: "Postaw widełki crescendo wokół motywu: początek PRZED pierwszą nutą (345-14), koniec PO ostatniej (345-25).",
    gabelExplain: "Początek widełek stoi przed pierwszą, a koniec widełek po ostatniej nucie miejsca, które robi się głośniejsze.",
    erkennenPrompt: "Jaki to znak dynamiki?",
    erkennenExplain: (zeichen: string): string => `To było ${zeichen}.`,
  },

  // --- Świat 4: tempo -------------------------------------------------------
  tempo: {
    hoerenPrompt: "W jakim tempie brzmi melodia?",
    largo: "Largo - bardzo wolno",
    andante: "Andante - w tempie kroku",
    presto: "Presto - bardzo szybko",
    hoerenExplain: (label: string): string => `To było ${label}.`,
    rampePrompt: "Melodia robi się szybsza czy wolniejsza?",
    rampeChoices: ["Szybsza - accelerando", "Wolniejsza - ritardando"],
    rampeExplainAcc: "Tempo przyspiesza: accelerando.",
    rampeExplainRit: "Tempo się poszerza: ritardando.",
    wissen: [
      { frage: "Co znaczy „a tempo”?", correct: "Powrót do pierwotnego tempa", wrong: ["Coraz szybciej", "Jak najgłośniej"] },
      { frage: "Co znaczy „ritardando”?", correct: "Coraz wolniej", wrong: ["Coraz głośniej", "Coraz szybciej"] },
      { frage: "Co znaczy „Allegro”?", correct: "Szybko i wesoło", wrong: ["Bardzo wolno", "Całkiem cicho"] },
      { frage: "Co znaczy „Adagio”?", correct: "Wolno i spokojnie", wrong: ["Bardzo szybko", "Mocno zaakcentowane"] },
    ],
    wissenExplain: (richtig: string): string => `Dobrze: ${richtig}.`,
    metronomSchreibenPrompt: (bpm: number): string =>
      `Zapisz oznaczenie metronomu „ćwierćnuta równa się ${bpm}”: ćwierćnuta, znak równości (punkty 2, 3, 5, 6), znak liczby, potem cyfry.`,
    metronomBezug: "ćwierćnuta jako odniesienie - punkty 1, 4, 5, 6",
    metronomGleich: "znak równości metronomu - punkty 2, 3, 5, 6",
    zahlzeichen: "znak liczby - punkty 3, 4, 5, 6",
    ziffer: (d: string): string => `cyfra ${d}`,
    metronomSchreibenExplain: (bpm: number): string =>
      `Oznaczenie metronomu mówi: w ciągu minuty ma zabrzmieć ${bpm} ${lm(bpm, "ćwierćnuta", "ćwierćnuty", "ćwierćnut")}.`,
    metronomWahl: (bpm: number): string => `${bpm} ${lm(bpm, "ćwierćnuta", "ćwierćnuty", "ćwierćnut")} na minutę`,
    metronomLesenPrompt: "Jakiego tempa wymaga to oznaczenie metronomu?",
    metronomLesenExplain: (bpm: number): string =>
      `Znak liczby i cyfry dają ${bpm} - tyle ćwierćnut na minutę.`,
  },

  // --- Świat 4: ozdobniki ---------------------------------------------------
  verzierungen: {
    obPurPrompt: "Dźwięk był ozdobiony czy zagrany czysto?",
    obPurChoices: ["Ozdobiony", "Czysto - bez ozdobnika"],
    obPurExplainVerziert: "Był tam mały dźwięk ozdobny.",
    obPurExplainPur: "Pojedynczy, gładki dźwięk - bez ozdobnika.",
    welchePrompt: "Przednutek czy tryl?",
    welcheChoices: ["Krótki przednutek - dźwięk ozdobny przed nutą", "Tryl - szybka zmiana"],
    welcheExplainTriller: "Szybka zmiana z sąsiednim dźwiękiem: tryl (punkty 2, 3, 5).",
    welcheExplainVorschlag: "Pojedynczy dźwięk ozdobny przed dźwiękiem głównym: przednutek (punkty 2, 6).",
    schreibenPrompt: (zeichen: string, note: string): string =>
      `Zapisz znak ozdobnika „${zeichen}” przed nutą ${note}: najpierw znak ozdobnika, potem nuta.`,
    zelleN: (zeichen: string, n: number): string => `${zeichen}, komórka ${n}`,
    zeichenEinzel: (zeichen: string): string => `znak: ${zeichen}`,
    schreibenExplain: "Znaki ozdobników stoją zawsze PRZED nutą, którą zdobią.",
    erkennenPrompt: "Jaki to ozdobnik?",
    erkennenExplain: (zeichen: string): string => `To był: ${zeichen}.`,
    hoerenPrompt: "Jaki ozdobnik słyszysz?",
    hoerenDoppelschlag: "Obiegnik - wokół dźwięku",
    hoerenPralltriller: "Mordent górny - krótko w górę",
    hoerenMordent: "Mordent dolny - krótko w dół",
    zierSchreibenPrompt: (zeichen: string, note: string): string => `Zapisz znak ozdobnika „${zeichen}” przed nutą ${note}.`,
    zierSchreibenExplain: "Także te ozdobniki stoją PRZED nutą.",
    tremoloPrompt: (rep8: boolean, note: string): string =>
      `Tremolo powtarzane (${rep8 ? "ósemki" : "szesnastki"}) - stoi PO nucie: najpierw nuta ${note}, potem znak tremolo.`,
    tremoloErste: "tremolo, pierwsza komórka - punkty 4, 5",
    tremoloZweite: "tremolo, druga komórka",
    tremoloExplain: "Tremolo powtarzane szybko powtarza dźwięk - jego znak stoi po nucie.",
    positionPromptVor: "Gdzie stoi obiegnik albo mordent?",
    positionPromptNach: "Gdzie stoi tremolo powtarzane?",
    positionPromptZwischen: "Gdzie stoi tremolo przemienne?",
    positionChoices: ["Przed nutą", "Po nucie", "Między dwiema nutami"],
    positionExplainVor: "Ozdobniki takie jak obiegnik i mordent stoją przed nutą.",
    positionExplainNach: "Tremolo powtarzane stoi po nucie.",
    positionExplainZwischen: "Tremolo przemienne stoi między dwiema nutami - i nigdy nie jest podwajane.",
  },

  // --- Świat 4: ekspresja w piosence ---------------------------------------
  ausdruckLied: {
    artikPrompt: (titel: string): string => `„${titel}” - początek: zagrany legato czy krótko?`,
    artikChoices: ["Połączony - legato", "Krótko - staccato"],
    artikExplainLegato: "Dźwięki płynęły jeden w drugi - legato.",
    artikExplainStaccato: "Każdy dźwięk krótko oddzielony - staccato.",
    dazuChoices: ["Zrobiło się głośniej - crescendo", "Dźwięki stały się krótkie - staccato", "Zakończenie było przytrzymane - fermata"],
    dazuDynPrompt: (titel: string): string => `„${titel}”: co doszło do suchej wersji?`,
    dazuDynExplain: "To miejsce zrobiło się głośniejsze - crescendo.",
    dazuPrompt: (titel: string): string => `„${titel}”: co doszło?`,
    dazuStaccatoExplain: "Dźwięki stały się krótkie i ostre - staccato.",
    dazuFermateExplain: "Ostatni dźwięk był wytrzymany - jak fermata.",
    schreibenPrompt: (titel: string, sym: "f" | "p" | "mf"): string =>
      `Zapisz początek piosenki „${titel}” z ${sym === "f" ? "forte" : sym === "p" ? "piano" : "mezzoforte"} na początku: najpierw znak słowny i ${sym}, potem dźwięki ze znakami oktawowymi.`,
    schreibenExplain: "Słowo wykonawcze na początku linijki mówi, jak ma brzmieć całe to miejsce.",
  },

  // --- Świat 5: powtórzenia w brajlu ---------------------------------------
  wiederholungen: {
    lesenPrompt: "Jeden takt, potem znaki powtórzenia. Ile razy w sumie brzmi ten takt?",
    lesenChoices: ["2 razy", "3 razy", "4 razy"],
    lesenExplain: (times: number): string =>
      `Zapisany takt plus ${times - 1} ${lm(times - 1, "znak simile", "znaki simile", "znaków simile")} daje w sumie ${times} razy.`,
    countPrompt: "Zapisz takt i każ go powtórzyć jeszcze DWA razy: takt, spacja, simile (punkty 2, 3, 5, 6), znak liczby, liczba 2.",
    countSimile: "simile - punkty 2, 3, 5, 6",
    countZahlzeichen: "znak liczby - punkty 3, 4, 5, 6",
    countZwei: "liczba 2 - tyle razy się powtarza",
    countExplain: "Simile i liczba mówią: ten takt powtórzyć jeszcze tyle razy - dużo krócej niż wszystko wypisywać.",
    regelPromptErlaubt: "W środku linijki cały takt ma zabrzmieć dokładnie jak poprzedni. Czy znak simile może tu stać?",
    regelPromptNein: "Od razu PIERWSZY takt nowej linijki ma być powtórzony. Czy znak simile może tu stać?",
    regelChoices: ["Tak, to dozwolone", "Nie, tutaj nie"],
    regelExplainErlaubt: "Cały taki sam takt w środku linijki można skrócić znakiem simile.",
    regelExplainNein: "Simile nie może stać na pierwszej mierze nowej linijki - tam takt trzeba wypisać.",
    bestePrompt: "Cztery takie same takty jeden po drugim - jak brajl najlepiej to skraca?",
    besteChoices: ["Zapisać pierwszy takt, potem simile z liczbą 4", "Wypisać w pełni wszystkie cztery takty", "Postawić tylko pauzę całonutową"],
    besteExplain: "Jeden takt wypisać, potem simile z liczbą 4 - krótko i jednoznacznie.",
  },

  // --- Świat 5: volty, segno, coda -----------------------------------------
  volten: {
    dacapoPrompt: "Po części A i części B stoi „D.C.” (Da Capo - od początku). W jakiej kolejności brzmią części?",
    reihenfolgeChoices: ["A-A-B", "A-B-A", "A-B-B"],
    dacapoExplain: "Da Capo znaczy „od początku”: po A i B gra się jeszcze raz A - A-B-A.",
    voltaPrompt: "Część A stoi między znakami repetycji, z voltą 1 i voltą 2. W jakiej kolejności brzmi wszystko?",
    voltaExplain: "A się powtarza: za pierwszym razem z voltą 1, za drugim razem z voltą 2 (nowym zakończeniem) - A-A-B.",
    schreibenPrompt: (n: number): string =>
      `Zapisz znak volty ${n}: znak liczby (punkty 3, 4, 5, 6), potem dolną cyfrę ${n} (bez odstępu).`,
    zahlzeichen: "znak liczby - punkty 3, 4, 5, 6",
    tiefeZiffer: (n: number): string => `dolna cyfra ${n} - ${n === 1 ? "punkt 2" : "punkty 2, 3"}`,
    schreibenExplain: (n: number): string =>
      `Volta ${n} używa DOLNEJ cyfry - dlatego ${n === 1 ? "punkt 2" : "punkty 2 i 3"}.`,
    segnoCodaPrompt: "Jaki to znak formy?",
    segnoCodaChoices: ["Segno - znak, do którego się wraca", "Coda - dodatek na zakończenie"],
    segnoExplain: "Segno (punkty 3, 4, 6) oznacza miejsce, do którego się wraca.",
    codaExplain: "Coda (346-123) wprowadza dodatek na zakończenie.",
    dcWissenPrompt: "W utworze stoi „D.C. al Fine”. Co robisz?",
    dcWissenChoices: ["Grasz od początku do słowa „Fine”", "Od razu przestajesz", "Grasz coraz głośniej"],
    dcWissenExplain: "Da Capo al Fine: jeszcze raz od początku - a przy słowie „Fine” jest koniec.",
  },

  // --- Świat 5: formy -------------------------------------------------------
  formen: {
    abaPrompt: "Trzy odcinki. Czy pierwszy wraca na końcu?",
    abaChoices: ["Tak - A-B-A, początek wraca", "Nie - A-B-C, wszystko inne"],
    abaExplainWieder: "Trzecia część była jak pierwsza: A-B-A, forma łukowa.",
    abaExplainNein: "Wszystkie trzy części były różne: A-B-C.",
    rondoPrompt: "Rondo: refren wraca ciągle między innymi częściami. Ile razy go słyszysz?",
    rondoChoices: ["2 razy", "3 razy", "4 razy"],
    rondoExplain: "Refren A przyszedł trzy razy: A-B-A-C-A - to forma ronda.",
    changePrompt: "Ta sama melodia dwa razy - za drugim razem JEDNA rzecz jest inna. Wysokość czy rytm?",
    changeChoices: ["Jedna wysokość była inna", "Jeden rytm był inny"],
    changeExplainRhythmus: "Jeden dźwięk był nagle krótszy - zmienił się rytm.",
    changeExplainTonhoehe: "Jeden dźwięk leżał wyżej albo niżej - zmieniła się wysokość.",
    variationPrompt: "Melodia, potem jeszcze raz: dokładnie tak samo - czy zmieniona (wariacja)?",
    variationChoices: ["Powtórzona dokładnie tak samo", "Zmieniona - wariacja"],
    variationExplainVar: "Za drugim razem coś było inne: wariacja.",
    variationExplainGleich: "Dwa razy dokładnie tak samo - prawdziwe powtórzenie.",
  },

  // --- Świat 6: interwały ---------------------------------------------------
  intervallName: { ...INTERWALY },
  intervallWahl: {
    1: "Pryma", 2: "Sekunda", 3: "Tercja", 4: "Kwarta", 5: "Kwinta", 6: "Seksta", 7: "Septyma", 8: "Oktawa",
  },
  intervalle: {
    wahlMitStufen: (name: string, x: number): string => `${name} (${x} ${lm(x, "stopień", "stopnie", "stopni")})`,
    gleichzeitigPrompt: "Dwa dźwięki jednocześnie - jaki interwał tu brzmi?",
    nacheinanderPrompt: "Dwa dźwięki po kolei - jak daleko od siebie leżą?",
    merkTerz: " Podpowiedź: tercja w dół to wołanie kukułki.",
    merkQuarte: " Podpowiedź: kwarta w górę brzmi jak początek „Amazing Grace”.",
    merkOktave: " Oktawa to ten sam dźwięk, tylko wyżej.",
    erklaerung: (name: string, n: number, merk: string): string =>
      `To była ${name} - ${n} ${lm(n, "stopień", "stopnie", "stopni")}.${merk}`,
    schreibenPrompt: (note: string, name: string): string =>
      `Zapisz dwudźwięk od góry: górna nuta ${note}, a pod nią znak interwału (${name}). W górnym głosie stoi NAJWYŻSZA nuta, interwał liczy się w dół.`,
    intervallzeichenAbwaerts: (label: string): string => `${label} - znak interwału w dół`,
    schreibenExplain: (oben: string, name: string, unten: string): string =>
      `Na górze ${oben}, znak interwału (${name}) dodaje dolny dźwięk ${unten}.`,
    lesenPrompt: "Przeczytaj dwudźwięk w brajlu i posłuchaj go: jaki interwał tu stoi?",
    lesenExplain: (name: string): string => `Górna nuta plus znak interwału: ${name}.`,
    regelPrompt: "W górnym głosie (prawa ręka): którą z dwóch nut się zapisuje, a która dochodzi jako znak interwału?",
    regelChoices: ["NAJWYŻSZĄ nutę - interwały liczą się w dół", "Najniższą nutę - interwały liczą się w górę"],
    regelExplain: "Górny głos: zapisuje się najwyższą nutę, interwały pod nią w dół (klucz koloński).",
    hoerenPrompt: (aufwaerts: boolean): string =>
      `Dwa dźwięki ${aufwaerts ? "w górę" : "w dół"} - jaki interwał? (Sekunda i septyma zgrzytają, kwinta brzmi otwarcie.)`,
    hoerenExplain: (name: string): string => `To była ${name}.`,
    schaetzenPrompt: "Czy ten interwał jest większy, czy mniejszy od kwinty?",
    schaetzenChoices: ["Mniejszy od kwinty", "Większy od kwinty"],
    schaetzenExplain: (name: string, groesser: boolean): string =>
      `${duza(name)} jest ${groesser ? "większa" : "mniejsza"} od kwinty.`,
  },

  // --- Świat 6: akordy ------------------------------------------------------
  akkorde: {
    durMollPrompt: "Trójdźwięk, wszystkie dźwięki naraz - brzmi jasno (dur) czy ciemno (moll)?",
    durMollChoices: ["Dur - jasno", "Moll - ciemno"],
    durMollExplainMoll: "Tercja mała sprawia, że brzmienie jest ciemne - moll.",
    durMollExplainDur: "Tercja wielka sprawia, że brzmienie jest jasne - dur.",
    brechungPrompt: "Trzy dźwięki zabrzmiały po kolei czy wszystkie razem?",
    brechungChoices: ["Po kolei - mała melodia", "Wszystkie razem - akord"],
    brechungExplainGebrochen: "Dźwięki przyszły osobno - rozłożone.",
    brechungExplainAkkord: "Wszystkie trzy naraz - akord.",
    verminderterPrompt: "Trójdźwięk brzmi ciemno (moll) czy napięty (zmniejszony)?",
    verminderterChoices: ["Moll - ciemno, ale spokojnie", "Zmniejszony - napięty"],
    verminderterExplainVermindert: "Także kwinta jest zmniejszona - to brzmi napięcie.",
    verminderterExplainMoll: "Tylko tercja jest mała - moll.",
    schreibenPrompt: (wurzel: string, top: string): string =>
      `Zapisz trójdźwięk durowy od ${wurzel} od GÓRY: najwyższa nuta ${top}, potem znak tercji i znak kwinty w dół.`,
    terzDarunter: (label: string, ton: string): string => `${label} - tercja pod spodem (${ton})`,
    quinteDarunter: (label: string, ton: string): string => `${label} - kwinta pod spodem (${ton})`,
    schreibenExplain: (top: string, terz: string, grund: string): string =>
      `Najwyższa nuta ${top}, znaki tercji i kwinty dodają ${terz} i ${grund}.`,
    lesenPrompt: "Przeczytaj akord w brajlu i posłuchaj go - dur czy moll?",
    lesenChoices: ["Dur", "Moll"],
    lesenExplainMoll: "Ciemno - moll.",
    lesenExplainDur: "Jasno - dur.",
    oktavPrompt: (top: string): string => `Podwój dźwięk podstawowy: zapisz ${top} i dodaj znak interwału oktawy.`,
    oktaveDarunter: (label: string): string => `${label} - oktawa pod spodem`,
    oktavExplain: "Znak interwału oktawy to punkty 3, 6.",
  },

  // --- Świat 6: in-accord ---------------------------------------------------
  inAccord: {
    hoerenPrompt: "Dwa głosy: najpierw osobno, potem razem. Który głos był na górze?",
    hoerenChoices: ["Pierwszy (wyższy) głos", "Drugi (niższy) głos"],
    hoerenExplain: "Wyższy głos to głos górny - w linijce brajla stoi pierwszy.",
    lesenPrompt: "W tej linijce brajla znak in-accord (punkty 1, 2, 6 · 3, 4, 5) oddziela dwa głosy. Ile głosów brzmi w takcie?",
    lesenChoices: ["Jeden głos", "Dwa głosy", "Trzy głosy"],
    lesenExplain: "Znak in-accord mówi: tu zaczyna się drugi głos w tym samym takcie.",
    schreibenPrompt: (ober: string, unter: string): string =>
      `Zapisz dwa głosy w jednym takcie: najpierw głos górny ${ober}, potem znak in-accord, potem głos dolny ${unter} - z własnym znakiem oktawowym.`,
    zeichenErste: "in-accord, pierwsza komórka - punkty 1, 2, 6",
    zeichenZweite: "in-accord, druga komórka - punkty 3, 4, 5",
    schreibenExplain: "Po znaku in-accord drugi głos zaczyna się znowu od znaku oktawowego.",
  },
};
