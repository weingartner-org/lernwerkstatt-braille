/**
 * Bereich `aufgabenA` - Polski. Zadania z `etappen.ts`: kp1 do kp13, etap 2 (łuk przedłużający
 * do trioli) i świat 1 „Uszy na baczność". Funkcje = teksty z wstawionymi słowami.
 * Fachwörter: polnische Musiktheorie (ósemka, ćwierćnuta, półnuta, cała nuta, szesnastka,
 * krzyżyk, bemol, kasownik, znaki przykluczowe, metrum, miara). Wartości nut są rodzaju żeńskiego.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { aufgabenA as De } from "../de/aufgabenA";

/** Liczba mnoga po polsku: 1 / 2-4 (bez 12-14) / 5+. */
const lm = (n: number, jeden: string, kilka: string, wiele: string): string => {
  if (n === 1) return jeden;
  const r10 = n % 10;
  const r100 = n % 100;
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? kilka : wiele;
};

const POZYCJA = ["na początku", "w środku", "na końcu"];

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "kreska taktowa - spacja",
    zahlzeichen: "znak liczby",
    obereZahl: (n: number): string => `${n} (górna liczba)`,
    tiefeZahl: (n: number): string => `${n} jako dolna liczba`,
    schlagzahl: (b: number): string => (Number.isInteger(b) ? String(b) : String(b).replace(".", ",")),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Zapisz: ${ton} - ${wert}.`,
    welcheNote: "Jaka to nuta? Posłuchaj i poczuj komórkę.",
    dasWar: (ton: string, wert: string): string => `To było ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Dwa dźwięki. Który był wyższy?",
    dreiHoechster: "Trzy dźwięki. Który był najwyższy?",
    ordinale: ["Pierwszy", "Drugi", "Trzeci"],
    hoechsterErklaer: (i: number): string =>
      `${["Pierwszy", "Drugi", "Trzeci"][i]} dźwięk był najwyższy.`,
    leiter: "Mała gama. Idzie w górę czy w dół?",
    leiterWahl: ["W górę", "W dół"],
    leiterRauf: "Szła w górę.",
    leiterRunter: "Szła w dół.",
  },
  kp2: {
    prompt: (len: number): string =>
      `Posłuchaj rytmu i wystukaj go spacją - ${len} ${lm(len, "uderzenie", "uderzenia", "uderzeń")}.`,
  },
  kp3: {
    grundform: " (Podstawową formą jest ósemka.)",
  },
  kp4: {
    prompt: "Posłuchaj melodii i zapisz ją nuta po nucie.",
  },
  kp5: {
    viertelHinweis: " (Ćwierćnuta = dochodzi punkt 6 - jak przy literach od k do t punkt 3.)",
    melodie: "Zapisz melodię - same ćwierćnuty.",
    frage: "Ósemka czy ćwierćnuta?",
    wahl: ["Ósemka", "Ćwierćnuta"],
    erklaerAchtel: "Bez dodatkowego punktu na dole: ósemka.",
    erklaerViertel: "Z dodanym punktem 6: ćwierćnuta.",
  },
  kp6: {
    halbeHinweis: " (Półnuta = dochodzi punkt 3.)",
    ganzeHinweis: " (Cała nuta = dochodzą punkty 3 i 6.)",
    frage: "Jaka to wartość nuty?",
    erklaer: (wert: string): string => `To była ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Zapisz: ${pause}.`,
    taktart: "Jakie metrum tu stoi?",
    taktartErklaer: (a: number, b: number): string =>
      `To było metrum ${a}/${b}: znak liczby, ${a} u góry, ${b} jako dolna liczba na dole.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Zapisz: ${ton1} półnuta, kreska taktowa (spacja), ${ton2} półnuta.`,
    taktstrichErklaer: "Kreska taktowa w brajlu to odstęp.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Zapisz: ${ton} - ${wert} z kropką. (Kropka przedłużająca to punkt 3 we WŁASNEJ komórce.)`,
    punktZelle: "kropka przedłużająca - punkt 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Zapisz: ${vorzeichen}, potem ${ton} jako ćwierćnutę. (Znak chromatyczny stoi tuż PRZED nutą.)`,
  },
  kp10: {
    lage: "W jakim położeniu to brzmi?",
    lageWahl: ["Nisko (oktawa mała)", "Średnio (oktawa razkreślna)", "Wysoko (oktawa dwukreślna)"],
    lageErklaer: (oktave: string): string => `To była ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Zapisz jako PIERWSZĄ nutę utworu: ${ton} (${oktave}), ćwierćnuta. (Najpierw znak oktawowy, potem nuta.)`,
    zeichenZelle: (oktave: string): string => `znak oktawowy - ${oktave}`,
  },
  kp11: {
    gleich: "ta sama nuta",
    sekundeTerz: "sekunda albo tercja",
    quarteQuinte: "kwarta albo kwinta",
    sexteMehr: "seksta albo więcej",
    regelKlein: "Sekunda i tercja NIGDY nie potrzebują znaku oktawowego.",
    regelMittel: "Kwarta i kwinta potrzebują go TYLKO wtedy, gdy zmienia się oktawa.",
    regelGross: "Od seksty nuta ZAWSZE potrzebuje znaku oktawowego.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Pierwsza nuta: ${ton1}, ${oktave1}. Potem: ${ton2}, ${oktave2}. Czy druga nuta potrzebuje znaku oktawowego?`,
    wahl: ["Tak", "Nie"],
    erklaer: (sprung: string, regel: string): string => `Skok to ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "W metrum 4/4 JEDNA jedyna komórka wypełnia cały takt. Cała nuta czy szesnastka?",
    grossWahl: ["Cała nuta", "Szesnastka"],
    grossErklaer:
      "Pojedyncza komórka, która musi wypełnić cztery miary, to DUŻA wartość: cała nuta. Szesnastka byłaby o wiele za krótka.",
    kleinPrompt: "W metrum 2/4 stoi OSIEM takich samych komórek jedna za drugą. Całe nuty czy szesnastki?",
    kleinWahl: ["Całe nuty", "Szesnastki"],
    kleinErklaer:
      "Osiem całych nut nigdy nie zmieści się w dwóch miarach - to muszą być MAŁE wartości: szesnastki. Decydują takt i kontekst.",
  },
  kp13: {
    similePrompt: "Zapisz brajlowski znak powtórzenia taktu (cały takt zagrać jeszcze raz).",
    simileZelle: "znak powtórzenia taktu - punkty 2, 3, 5, 6",
    simileErklaer: "Ten skrót jest tylko w brajlu - sprytniejszy niż druk!",
    startPrompt: "Zapisz: POCZĄTEK repetycji (dwie komórki).",
    startZellen: ["pierwsza komórka - punkty 1, 2, 6", "druga komórka - punkty 2, 3, 5, 6"],
    endePrompt: "Zapisz: KONIEC repetycji (dwie komórki).",
    endeZellen: ["pierwsza komórka - punkty 1, 2, 6", "druga komórka - punkty 2, 3"],
    schluss: "Kreska końcowa (koniec utworu)",
    anfang: "Początek repetycji",
    ende: "Koniec repetycji",
    erkennenPrompt: "Jaki to znak formy?",
    erkannt: (zeichen: string): string => `To był znak: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Dwie półnuty na tym samym dźwięku. Zagrane raz czy dwa razy?",
    hoerenWahl: ["Raz - połączone (łuk przedłużający)", "Dwa razy - oddzielnie"],
    hoerenGebunden: "Tylko jedno uderzenie: łuk przedłużający łączy dwie nuty w JEDEN długi dźwięk.",
    hoerenGetrennt: "Dwa uderzenia: tu nie było łuku przedłużającego - każda nuta zaczyna się od nowa.",
    schreibPrompt: (ton: string): string =>
      `Zapisz: ${ton} półnuta, łuk przedłużający (dwie komórki: punkt 4, potem 1 i 4), jeszcze raz ${ton} półnuta.`,
    zelle1: "łuk przedłużający, pierwsza komórka - punkt 4",
    zelle2: "łuk przedłużający, druga komórka - punkty 1, 4",
    klingtWeiter: (note: string): string => `${note} - brzmi dalej, bez nowego uderzenia`,
    schreibErklaer: "Łuk przedłużający stoi tuż PO pierwszej nucie.",
    taktPrompt: (ton: string): string =>
      `Połącz przez kreskę taktową: ${ton} półnuta, łuk przedłużający, kreska taktowa (spacja), ${ton} półnuta.`,
    taktErklaer: "Tak dźwięk brzmi dalej ponad kreską taktową.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `Metrum ${a}/${b}. Posłuchaj taktu i licz: czy jest pełny?`,
    vollWahl: ["Pełny", "Niepełny - przedtakt albo takt niepełny"],
    vollJa: (ziel: string): string => `Zgadza się co do miary - liczba miar: ${ziel}, dokładnie tyle, ile trzeba.`,
    vollNein: (summe: string, ziel: string): string =>
      `Czegoś brakuje: tylko ${summe} z ${ziel} miar - to takt niepełny. Na początku utworu nazywa się przedtaktem.`,
    bindestrichPrompt: "Na końcu linijki takt nie jest jeszcze skończony. Zapisz muzyczny łącznik (punkt 5).",
    bindestrichZelle: "muzyczny łącznik - punkt 5",
    bindestrichErklaer: "Punkt 5 na końcu linijki mówi: ten takt ciągnie się w następnej linijce.",
    schreibPrompt: (ton: string): string =>
      `Zapisz przedtakt: ${ton} ćwierćnuta, kreska taktowa (spacja), potem pełny takt.`,
    auftaktZelle: (note: string): string => `${note} - przedtakt`,
    schreibErklaer: "Przedtakt to niepełny pierwszy takt - zapisuje się go całkiem normalnie.",
  },
  pausen2: {
    vielePrompt: (n: number): string =>
      `Zapisz: pauza przez ${n} ${lm(n, "takt", "takty", "taktów")} - znak liczby, liczba ${n}, potem pauza całonutowa.`,
    zahlzeichenZelle: "znak liczby - punkty 3, 4, 5, 6",
    zahlZelle: (n: number): string => `liczba ${n}`,
    ganzePauseZelle: "pauza całonutowa - punkty 1, 3, 4",
    vieleErklaer: "Od czterech pustych taktów brajl zapisuje ich liczbę przed pauzą całonutową.",
    kleinPrompt: (n: number): string =>
      `Zapisz: ${n} ${lm(n, "pusty takt", "puste takty", "pustych taktów")} - do trzech taktów po prostu pauza całonutowa ${n === 2 ? "dwa razy" : "trzy razy"}.`,
    kleinZelle: (i: number): string => `pauza całonutowa ${i} - cały pusty takt`,
    kleinErklaer: "Pauza całonutowa ZAWSZE wypełnia cały takt - bez względu na metrum.",
    lesenPrompt: "Ile cichych taktów tu stoi?",
    takte: (n: number): string => `${n} ${lm(n, "takt", "takty", "taktów")}`,
    lesenKlein: (n: number): string =>
      `${n} ${lm(n, "pauza całonutowa", "pauzy całonutowe", "pauz całonutowych")} jedna po drugiej = ${n} ${lm(n, "pusty takt", "puste takty", "pustych taktów")}.`,
    lesenGross: (n: number): string =>
      `Znak liczby + ${n} + pauza całonutowa = ${n} ${lm(n, "takt", "takty", "taktów")} ciszy z rzędu.`,
    stillePrompt: "Trzy takty - jeden z nich jest całkiem cichy. Gdzie?",
    stilleWahl: ["Na początku", "W środku", "Na końcu"],
    stilleErklaer: (i: number): string =>
      `Cisza była ${POZYCJA[i]} - cały takt pauzy.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["G-dur", "D-dur", "A-dur", "E-dur"],
      be: ["F-dur", "B-dur", "Es-dur", "As-dur"],
    },
    kreuz: "krzyżyk",
    be: "bemol",
    kreuze: "krzyżyki",
    bes: "bemole",
    lesenPrompt: (mehrzahl: string): string =>
      `Na początku utworu stoją te znaki przykluczowe. Policz ${mehrzahl} - ile ich jest?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - znaki przykluczowe tonacji ${tonart}. ${
        ab4 ? "Od czterech ich liczba stoi przed nimi." : "Do trzech znak po prostu się powtarza."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Zapisz znaki przykluczowe: ${n} ${name} - ${zeichen} po prostu ${n === 1 ? "raz" : n === 2 ? "dwa razy" : "trzy razy"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Zapisz znaki przykluczowe: ${n} ${mehrzahl} - od czterech ze znakiem liczby: znak liczby, liczba ${n}, potem ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - punkty ${punkte}`,
    zahlzeichenZelle: "znak liczby - punkty 3, 4, 5, 6",
    zahlZelle: (n: number): string => `liczba ${n}`,
    dasZeichen: (name: string): string => `znak: ${name}`,
    istVorzeichnung: (tonart: string): string => `To są znaki przykluczowe tonacji ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Zapisz początek utworu: najpierw znaki przykluczowe (${n} ${name}), zaraz za nimi metrum ${a}/${b} - bez odstępu pomiędzy.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Tonacja i metrum stoją razem na początku utworu - najpierw znaki przykluczowe, potem metrum.",
    regelPrompt: "Znaki przykluczowe na początku utworu - jak długo obowiązują?",
    regelWahl: ["W całym utworze", "Tylko w pierwszym takcie", "Tylko dla pierwszej nuty"],
    regelErklaer:
      "Znaki przykluczowe obowiązują w całym utworze - a znak chromatyczny w środku taktu tylko do kreski taktowej.",
  },
  taktwechsel: {
    sonderPrompt: "Jakie to oznaczenie metrum?",
    sonderWahl: ["C - takt na cztery czwarte", "Alla breve - takt na dwie półnuty", "Metrum 3/4"],
    sonderErklaerC: "Punkty 4, 6 przed c: C taktu na cztery czwarte.",
    sonderErklaerAb: "Punkty 4, 5, 6 przed c: alla breve - półnuty wyznaczają takt.",
    sonderSchreibenC: "Zapisz znak metrum C: punkty 4 i 6, potem c (punkty 1, 4).",
    sonderSchreibenAb: "Zapisz alla breve: punkty 4, 5 i 6, potem c (punkty 1, 4).",
    vorzeichenC: "znak wstępny - punkty 4, 6",
    vorzeichenAb: "znak wstępny - punkty 4, 5, 6",
    dasC: "c - punkty 1, 4",
    wechselPrompt: "Po kilku nutach stoi DRUGIE oznaczenie metrum. Co to znaczy?",
    wechselWahl: (a: number, b: number): string[] => [
      `Metrum zmienia się na ${a}/${b}`,
      "Zmienia się tonacja",
      "Utwór się kończy",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Nowe oznaczenie metrum w środku utworu znaczy: od tego miejsca obowiązuje metrum ${a}/${b} (tak się liczy dalej).`,
    wechselSchreiben: (a: number, b: number): string =>
      `W środku utworu zmienia się metrum: zapisz kreskę taktową (spacja), potem nowe metrum ${a}/${b} (bez odstępu).`,
  },
  schluessel: {
    lesenPrompt: "Jaki klucz tu stoi (trzy komórki)?",
    lesenErklaer: (schluessel: string): string =>
      `To był ${schluessel}. Wszystkie klucze zaczynają się punktami 3, 4, 5 i kończą punktami 1, 2, 3 - różni je środek.`,
    mitteViolin: "punkty 3, 4",
    mitteBass: "punkty 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Zapisz: ${schluessel} - trzy komórki: punkty 3, 4, 5 · ${mitte} · punkty 1, 2, 3.`,
    ankuendigung: "zapowiedź klucza - punkty 3, 4, 5",
    gZeichen: "znak G - punkty 3, 4",
    fZeichen: "znak F - punkty 3, 4, 5, 6",
    abschluss: "zakończenie - punkty 1, 2, 3",
    wissenPrompt: "Czy brajlowski zapis nutowy potrzebuje kluczy, żeby określić wysokość dźwięku?",
    wissenWahl: ["Nie - położenie mówią znaki oktawowe", "Tak - bez klucza nic nie działa"],
    wissenErklaer:
      "Znaki kluczy są w brajlu tylko informacją o zapisie w druku - położenie zawsze określają znaki oktawowe.",
  },
  sechzehntel: {
    hoerenPrompt: "Mały przebieg. Ósemki - czy dwa razy szybsze szesnastki?",
    hoerenWahl: ["Ósemki", "Szesnastki"],
    hoerenSchnell: "To były szesnastki - cztery na jedną miarę.",
    hoerenLangsam: "To były ósemki - dwie na jedną miarę.",
    gruppePrompt:
      "Zapisz grupę czterech szesnastek: tylko PIERWSZA nuta dostaje punkty 3 i 6, pozostałe trzy piszesz jak ósemki (grupowanie).",
    ersteZelle: (ton: string): string => `${ton} jako szesnastka - z punktami 3 i 6`,
    andereZelle: (ton: string): string => `${ton} - zapisane jak ósemka (należy do grupy)`,
    gruppeErklaer: "Grupowanie sprawia, że szybkie przebiegi da się czytać: punkty wartości tylko na pierwszej nucie grupy.",
    regelPrompt:
      "Cztery szesnastki na jedną miarę, zapisane jako grupa: ile komórek ma punkty wartości 3 i 6?",
    regelWahl: ["Tylko pierwsza", "Wszystkie cztery", "Pierwsza i ostatnia"],
    regelErklaer:
      "Tylko pierwsza nuta grupy pokazuje wartość - reszta wygląda jak ósemki. To brajlowski odpowiednik belkowania w druku.",
    einzelnPrompt: (ton: string): string =>
      `Zapisz: ${ton} jako szesnastkę. (Uwaga - ta sama komórka co cała nuta; decyduje takt!)`,
  },
  triolen: {
    hoerenPrompt: "Między dwiema spokojnymi miarami: ile dźwięków dzieli się JEDNĄ miarą - dwa czy trzy?",
    hoerenWahl: ["Dwa - zwykłe ósemki", "Trzy - triola"],
    hoerenTriole: "Trzy równie długie dźwięki na jedną miarę: triola.",
    hoerenZwei: "Dwie ósemki - zwykły podział.",
    schreibPrompt: "Zapisz triolę: najpierw znak trioli (punkty 2, 3), potem trzy ósemki.",
    triolenZeichen: "znak trioli - punkty 2, 3",
    achtelZelle: (ton: string): string => `${ton}, ósemka - jedna trzecia miary`,
    schreibErklaer: "Znak trioli stoi RAZ przed grupą - robi z dwóch ósemek trzy.",
    lesenPrompt: "Przed trzema ósemkami stoi ta pierwsza komórka (punkty 2, 3). Co ona znaczy?",
    lesenWahl: ["Triola - trzy dźwięki na jedną miarę", "Pauza ósemkowa", "Znak oktawowy"],
    lesenErklaer: "Punkty 2, 3 przed grupą nut = triola.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Poczuj puls i wystukuj go równo spacją - przez ${n} ${lm(n, "uderzenie", "uderzenia", "uderzeń")}.`,
    metrumPrompt: "Posłuchaj akcentowanych miar: to maszeruje na dwa czy wiruje jak walc na trzy?",
    metrumWahl: ["Marsz - na dwa", "Walc - na trzy"],
    metrumDrei: "Zawsze pierwsza z trzech miar jest akcentowana: metrum na trzy - krok walca.",
    metrumZwei: "Zawsze pierwsza z dwóch miar jest akcentowana: metrum na dwa - krok marszu.",
    abstandPrompt: "Policz miary od jednego akcentu do następnego: ile ich jest?",
    abstandWahl: ["2 miary", "3 miary", "4 miary"],
    abstandErklaer: (n: number): string =>
      `Od akcentu do akcentu są ${n} ${lm(n, "miara", "miary", "miar")} - to metrum ${n}/4 (tak liczy się takt).`,
  },
  dauer: {
    vergleichPrompt: "Dwa dźwięki po kolei. Który brzmiał dłużej?",
    vergleichWahl: ["Pierwszy", "Drugi"],
    vergleichErster: "Pierwszy był półnutą - dwa razy dłuższą niż ćwierćnuta po nim.",
    vergleichZweiter: "Drugi był półnutą - dwa razy dłuższą niż ćwierćnuta przed nim.",
    schlaegePrompt: "Najpierw dwa uderzenia pulsu, potem długi dźwięk: ile miar brzmiał?",
    schlaegeWahl: ["1 miara - ćwierćnuta", "2 miary - półnuta", "4 miary - cała nuta"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `To była ${wert} - ${zahl} ${lm(zahl, "miara", "miary", "miar")} długości.`,
    paarPrompt: "Dwa dźwięki: równie długie - czy drugi dwa razy dłuższy?",
    paarWahl: ["Równie długie", "Drugi dwa razy dłuższy"],
    paarGleich: "Dwie równie długie ćwierćnuty.",
    paarDoppelt: "Najpierw ćwierćnuta, potem półnuta - dwa razy dłuższa.",
  },
  dynamik: {
    lautPrompt: "Posłuchaj krótkiej frazy: zagrana głośno czy cicho?",
    lautWahl: ["Głośno", "Cicho"],
    lautErklaer: "Zagrane mocno - później nazwiemy to forte.",
    leiseErklaer: "Zagrane bardzo delikatnie - później nazwiemy to piano.",
    rampePrompt: "Fraza robi się głośniejsza czy cichsza?",
    rampeWahl: ["Głośniejsza", "Cichsza"],
    cresc: "Od cicho do głośno - później nazwiemy to crescendo.",
    decresc: "Od głośno do cicho - później nazwiemy to decrescendo.",
    akzentPrompt: "Jeden dźwięk jest szczególnie zaakcentowany. Gdzie był?",
    akzentWahl: ["Na początku", "W środku", "Na końcu"],
    akzentErklaer: (i: number): string =>
      `Akcentowany dźwięk był ${POZYCJA[i]}.`,
  },
  inst: {
    merk: {
      klavier: "Fortepian - uderzany, jasny atak z wybrzmieniem.",
      gitarre: "Gitara - szarpana, perkusyjna i strunowa.",
      sax: "Saksofon - dęty, śpiewny, z barwą stroika.",
      floete: "Flet poprzeczny - dęty, miękki i czysty.",
    },
    hoerenPrompt: "Jaki instrument tu gra?",
    vergleichPrompt: "Dwa motywy po kolei: ten sam instrument czy różne?",
    vergleichWahl: ["Ten sam instrument", "Różne instrumenty"],
    vergleichGleich: "Oba motywy pochodziły z tego samego instrumentu.",
    vergleichErklaer: (a: string, b: string): string => `Najpierw: ${a}, potem: ${b}.`,
    zuerstPrompt: "Dwa instrumenty po kolei. Który grał pierwszy?",
    zuerstErklaer: (a: string): string => `Pierwszy instrument: ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Gra w echo: posłuchaj ${len} ${lm(len, "dźwięku", "dźwięków", "dźwięków")} i zagraj je na klawiaturze - D F G H J K L to c d e f g a h. Liczy się tylko kolejność dźwięków, rytm jest dowolny.`,
    erklaer: "Zagraj dźwięki w usłyszanej kolejności.",
  },
  memory: {
    prompt:
      "Pamięć melodii: ja gram ciąg dźwięków, ty go powtarzasz (D F G H J K L = c d e f g a h). Gdy się uda, dochodzi jeden dźwięk - jak daleko dojdziesz?",
  },
};
