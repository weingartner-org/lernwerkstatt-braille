/**
 * Bereich `kapitel` - Polski. Tytuły, wprowadzenia (introDu: dziecko, „ty"; introSie: dorośli i
 * nauczyciele, bezosobowo) i opisy jednostek rozdziałów (`KLANG_ETAPPEN`).
 * Fachwörter: polnische Musiktheorie (ósemka, ćwierćnuta, półnuta, cała nuta, szesnastka,
 * krzyżyk, bemol, kasownik, pięciolinia, łuk przedłużający, przedtakt). Quellenangaben bleiben.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { kapitel as De } from "../de/kapitel";

export const kapitel: typeof De = {
  noteSatz: (ton: string, wert: string): string => `${ton} jako ${wert}`,
  noteWert: {
    achtel: "ósemka",
    viertel: "ćwierćnuta",
    halbe: "półnuta",
    ganze: "cała nuta",
    sechzehntel: "szesnastka (ta sama komórka co cała nuta)",
  },
  kap: {
    "kp1": {
      titel: "Wysoko czy nisko? - Uszy w gotowości",
      introDu: "Zanim zaczniemy czuć nuty, ćwiczymy to, co najważniejsze: uważne słuchanie. Wyżej czy niżej, w górę czy w dół - decyduje twoje ucho.",
      introSie: "Gotowość muzyczna przed zapisem (Taesch, Phase One): słuchowe rozróżnianie wysokości i kierunku dźwięku jako podstawa czytania nut.",
      einheiten: {},
    },
    "kp2": {
      titel: "Wystukaj rytm",
      introDu: "Muzyka ma bicie serca. Posłuchaj wzoru z długich i krótkich dźwięków i wystukaj go spacją.",
      introSie: "Odtwarzanie rytmu przed poziomem znaków (RNIB: jedna ręka czyta, druga stuka - tutaj jako forma wstępna ze spacją).",
      einheiten: {},
    },
    "kp3": {
      titel: "Nuty to starzy znajomi",
      introDu: "Niespodzianka: nuty już znasz! c d e f g a h to brajlowskie litery d e f g h i j - alfabet przesunięty o jeden krok. Podstawową formą jest ósemka.",
      introSie: "Sedno analogii dekad (warsztat Schmid/BBI): wysokości c-h = litery d-j; forma ósemkowa jako logiczna forma podstawowa znaku (Krolick, par. 1-1).",
      einheiten: {},
    },
    "kp4": {
      titel: "Pierwsze melodie",
      introDu: "Teraz robi się muzyka: małe melodie z twoich nowych nut - posłuchaj, czytaj razem, zapisz. Każda dobra nuta brzmi!",
      introSie: "Wczesny sens: krótkie motywy zamiast pojedynczych znaków (zasada Hadley: dźwięk do każdego ćwiczenia).",
      einheiten: {},
    },
    "kp5": {
      titel: "Ćwierćnuty - dochodzi punkt 6",
      introDu: "Sztuczka z wartościami: do ćwierćnuty dochodzi po prostu punkt 6 - tak samo jak w alfabecie z liter od a do j powstaje następny rząd. Ta sama nuta, dłuższy dźwięk.",
      introSie: "Wartości nut przez mechanikę dekad (punkt 6 = ćwierćnuta), De Garmo, rozdz. 3.",
      einheiten: {},
    },
    "kp6": {
      titel: "Półnuty i całe nuty",
      introDu: "Dochodzi punkt 3 = półnuta. Punkt 3 I 6 = cała nuta. Teraz znasz wszystkie cztery podstawowe wartości - i słyszysz, jak różnie długo brzmią.",
      introSie: "Uzupełnienie wartości (De Garmo, rozdz. 4-5): półnuta (+3), cała nuta (+3+6).",
      einheiten: {},
    },
    "kp7": {
      titel: "Pauzy i takt",
      introDu: "Cisza też jest muzyką: cztery pauzy. A najbardziej zwariowane w nutach brajlowskich: kreska taktowa to po prostu spacja!",
      introSie: "Znaki pauz (Krolick, Table 1A) + oznaczenie metrum i kreska taktowa (par. 3-6, 1-7): kreska taktowa = odstęp.",
      einheiten: {
        "r:ganze": "pauza całonutowa",
        "r:halbe": "pauza półnutowa",
        "r:viertel": "pauza ćwierćnutowa",
        "r:achtel": "pauza ósemkowa",
        "sig:4/4": "metrum cztery czwarte",
        "sig:3/4": "metrum trzy czwarte",
      },
    },
    "kp8": {
      titel: "Nuty z kropką",
      introDu: "Kropka wydłuża nutę o połowę. W brajlu dostaje WŁASNĄ komórkę: punkt 3, zaraz po nucie.",
      introSie: "Kropka przedłużająca jako komórka następna (Krolick, par. 1-2).",
      einheiten: {
        "dot": "kropka przedłużająca (nuta z kropką)",
      },
    },
    "kp9": {
      titel: "Krzyżyk, bemol i kasownik",
      introDu: "Czasem dźwięk przesuwa się o pół tonu: krzyżyk podwyższa, bemol obniża, a kasownik to odwołuje. Znak stoi tuż PRZED nutą.",
      introSie: "Znaki chromatyczne przed nutą (Krolick, rozdz. III, De Garmo, rozdz. 6 - celowo PRZED znakami oktawowymi).",
      einheiten: {
        "acc:kreuz": "krzyżyk",
        "acc:be": "bemol",
        "acc:aufloesung": "kasownik",
      },
    },
    "kp10": {
      titel: "Znaki oktawowe - położenie",
      introDu: "W brajlu nie ma klucza! Zamiast niego znaki oktawowe mówią, JAK wysoko leży nuta. Pierwsza nuta utworu zawsze dostaje taki znak.",
      introSie: "Znaki oktawowe zamiast klucza (Krolick, par. 1-8/1-9; De Garmo, rozdz. 7 - po wartościach nut).",
      einheiten: {
        "oct:3": "znak oktawy małej",
        "oct:4": "znak oktawy razkreślnej",
        "oct:5": "znak oktawy dwukreślnej",
      },
    },
    "kp11": {
      titel: "Znaki oktawowe - zasady",
      introDu: "Kiedy nuta potrzebuje znaku oktawowego? Sekunda i tercja: nigdy. Kwarta i kwinta: tylko przy zmianie oktawy. Od seksty: zawsze. Zostań detektywem oktaw!",
      introSie: "Zasady stawiania (Krolick, par. 1-10) jako zadania decyzyjne - udokumentowana najczęstsza przeszkoda techniczna (NLS).",
      einheiten: {},
    },
    "kp12": {
      titel: "Cała nuta czy szesnastka?",
      introDu: "Tajemnica nut brajlowskich: ta sama komórka może znaczyć całą nutę ALBO szesnastkę! Takt zdradza, o co chodzi. Praca detektywa!",
      introSie: "Wieloznaczność wartości (Krolick, rozdz. 1, Whole Note or 16th?): rozstrzyganie przez metrum i kontekst.",
      einheiten: {},
    },
    "kp13": {
      titel: "Powtórzenie i forma",
      introDu: "Muzyka lubi się powtarzać - a brajl sprytnie skraca: osobny znak mówi: ten takt jeszcze raz! Do tego: znaki repetycji i podwójna kreska końcowa.",
      introSie: "Znaki powtórzeń i formy (Krolick, rozdz. IX): simile ⠶ jako własny brajlowski środek skrótu, repetycje, kreska końcowa.",
      einheiten: {
        "sim": "powtórzenie taktu (simile)",
        "rep-start": "początek repetycji",
        "rep-end": "koniec repetycji",
        "final": "kreska końcowa",
      },
    },
    "kp14": {
      titel: "Warsztat piosenek",
      introDu: "Teraz grasz prawdziwą muzykę! Wybierz piosenkę - posłuchaj, przeczytaj w brajlu, zapisz z pamięci. Najpierw czytaj, potem usłysz w głowie, potem graj.",
      introSie: "Zastosowanie na prawdziwym repertuarze: czytaj - zapamiętaj - zagraj (RNIB) + dyktando melodyczne (Taesch); dwie półki (piosenki dla dzieci / klasyka i znane melodie), wszystkie melodie z domeny publicznej, własne transkrypcje.",
      einheiten: {},
    },
    "kp-haltebogen": {
      titel: "Łuk przedłużający",
      introDu: "Dwie takie same nuty, JEDEN długi dźwięk: łuk przedłużający łączy je razem - drugiej nie gra się od nowa. W brajlu to dwie komórki zaraz po nucie.",
      introSie: "Łuk przedłużający (Krolick, rozdz. VI): ⠈⠉ po nucie; najpierw słuchowe rozróżnienie połączone/oddzielne, potem forma zapisu (De Garmo łączy łuki wcześnie z półnutami, rozdz. 4).",
      einheiten: {
        "tie": "łuk przedłużający (dwie komórki: punkt 4, potem punkty 1 i 4)",
      },
    },
    "kp-auftakt": {
      titel: "Przedtakt i niepełne takty",
      introDu: "Nie każdy takt jest pełny: na początku może stać krótki przedtakt, na końcu takt uzupełniający. A gdy linijka kończy się w środku taktu, pomaga muzyczny łącznik.",
      introSie: "Takty niepełne/przedtakt + muzyczny łącznik (Krolick, rozdz. III/IX; De Garmo: incomplete measures): liczenie taktu jako ćwiczenie słuchowe i pisemne.",
      einheiten: {
        "hyphen": "muzyczny łącznik (takt ciągnie się w następnej linijce)",
      },
    },
    "kp-pausen2": {
      titel: "Długa cisza",
      introDu: "Gdy wiele taktów milczy, brajl liczy sprytnie: do trzech pustych taktów po prostu kilka razy pauza całonutowa - od czterech liczba stoi przed nią.",
      introSie: "Pauzy wielotaktowe (Krolick, par. 1-7): ⠍⠍⠍ albo liczba + pauza całonutowa; ćwiczenia liczenia, pisania i słuchania.",
      einheiten: {
        "mrest:4": "pauza wielotaktowa (znak liczby, liczba, pauza całonutowa)",
      },
    },
    "kp-tonart": {
      titel: "Tonacja stoi na początku",
      introDu: "Krzyżyki albo bemole na samym początku obowiązują w CAŁYM utworze: to znaki przykluczowe. Do trzech znak się powtarza, od czterech stoi przed nim liczba - a zaraz za nimi przychodzi metrum.",
      introSie: "Znaki przykluczowe (Krolick, par. 3-4; De Garmo, rozdz. 6): forma powtórzeń do 3, forma liczbowa od 4; początek utworu = tonacja + metrum razem (par. 3-5).",
      einheiten: {
        "key:2:kreuz": "znaki przykluczowe: dwa krzyżyki (D-dur)",
        "key:2:be": "znaki przykluczowe: dwa bemole (B-dur)",
        "key:4:kreuz": "znaki przykluczowe: cztery krzyżyki - od czterech ze znakiem liczby (E-dur)",
      },
    },
    "kp-taktwechsel": {
      titel: "Metrum się zmienia",
      introDu: "W środku utworu może stać nowe metrum - od tego miejsca liczy się inaczej. Do tego dwa znaki specjalne: C (takt na cztery czwarte) i alla breve (takt na dwie półnuty).",
      introSie: "Zmiana metrum + szczególne oznaczenia C/alla breve (Krolick, par. 3-6/3-8; De Garmo, rozdz. 10).",
      einheiten: {
        "csig": "C - takt na cztery czwarte",
        "acsig": "alla breve - takt na dwie półnuty",
      },
    },
    "kp-schluessel": {
      titel: "Klucze - tylko dla wiedzy",
      introDu: "Klucz wiolinowy i klucz basowy są też w brajlu - ale tylko jako informacja o zapisie w druku! Położenie zawsze mówią ci znaki oktawowe. Dobrze je znać do rozmów z widzącymi muzykami i do programu MuseScore.",
      introSie: "Znaki kluczy (Krolick, rozdz. II - wyraźnie informacyjne; sprawdzenie music21): pomost do zapisu w druku.",
      einheiten: {
        "clef:violin": "klucz wiolinowy (trzy komórki)",
        "clef:bass": "klucz basowy (trzy komórki)",
        "clef:alt": "klucz C (trzy komórki)",
      },
    },
    "kp-sechzehntel": {
      titel: "Zwinne szesnastki",
      introDu: "Szesnastki używają TEJ SAMEJ komórki co cała nuta - tę sztuczkę znasz z rozdziału „Cała nuta czy szesnastka?”. Nowość: w grupach tylko PIERWSZA nuta ma punkty wartości, reszta wygląda jak ósemki.",
      introSie: "Małe wartości + zasada grupowania (Krolick, par. 4-2; De Garmo, rozdz. 15): punkty wartości tylko na pierwszej nucie grupy - brajlowski odpowiednik belkowania.",
      einheiten: {},
    },
    "kp-triolen": {
      titel: "Triole i nieregularne grupy",
      introDu: "Trzy dźwięki dzielą się jedną miarą tam, gdzie zwykle mieszkają dwa: to triola. W brajlu jej znak (punkty 2, 3) stoi raz przed grupą.",
      introSie: "Grupy nieregularne (Krolick, rozdz. IV; De Garmo, rozdz. 16): znak trioli ⠆; duolę i triolę najpierw rozróżniać słuchem.",
      einheiten: {
        "tri": "znak trioli (raz przed grupą trzech nut)",
      },
    },
    "kp-puls": {
      titel: "Łowca pulsu",
      introDu: "Każda muzyka ma bicie serca - puls. Złap go: stukaj równo, usłysz akcentowane miary i odróżnij marsz (na dwa) od walca (na trzy).",
      introSie: "Poczucie pulsu przed zapisem (KOMU MKe, ABRSM Aural G1): utrzymanie pulsu, rozróżnianie metrum dwudzielnego i trójdzielnego przez akcent - zakotwiczone ruchowo (praktyka z niewidomymi: stukać, nie tylko słuchać).",
      einheiten: {},
    },
    "kp-lauschen-dauer": {
      titel: "Długo czy krótko?",
      introDu: "Zanim zapiszesz wartości nut, słyszysz je: który dźwięk brzmiał dłużej? Ile miar trwał? Twoje ucho poznaje ćwierćnutę, półnutę i całą nutę jako DŹWIĘK.",
      introSie: "Dźwięk przed znakiem (Taesch): czas trwania dźwięków najpierw porównywać i nazywać słuchem (KOMU MKe, etap wstępny do wartości kp5/kp6).",
      einheiten: {},
    },
    "kp-lauschen-dynamik": {
      titel: "Głośno i cicho",
      introDu: "Muzyka żyje zmianą między głośno i cicho. Posłuchaj: głośno czy cicho? Robi się głośniej czy ciszej? Gdzie jest akcentowany dźwięk? To ćwiczenie wstępne do dynamiki w brajlu.",
      introSie: "Słuchowe przygotowanie dynamiki (Aural G1): forte/piano, crescendo/decrescendo i akcent najpierw słuchać - zanim świat 4 przyniesie znaki.",
      einheiten: {},
    },
    "kp-instrumente": {
      titel: "Jaki instrument?",
      introDu: "Fortepian, gitara, saksofon albo flet poprzeczny - każdy brzmi inaczej. Posłuchaj barwy: jaki instrument gra? Czy dwa motywy są z tego samego instrumentu, czy z różnych?",
      introSie: "Rozróżnianie barwy (KOMU MKe): uderzane, szarpane, dęte - z czterema głosami syntezatora.",
      einheiten: {},
    },
    "kp-echo": {
      titel: "Gra w echo",
      introDu: "Ja gram, ty powtarzasz! Posłuchaj krótkiego ciągu dźwięków i zagraj go na klawiaturze - D F G H J K L to c d e f g a h. Liczą się tylko dźwięki, rytm jest dowolny.",
      introSie: "Powtarzanie echa jako pierwszy stopień schodów umiejętności (Gordon Aural/Oral): zakres g-e → +a → pentatonika (Kodály), wpisane dźwięki słyszalnie odtwarzane.",
      einheiten: {},
    },
    "kp-melodie-memory": {
      titel: "Pamięć melodii",
      introDu: "Jak w grze w pamięć, tylko z dźwiękami: gdy zagrasz ciąg, dochodzi jeden dźwięk. Jak daleko dojdziesz? Gra pamięciowa dla wewnętrznego ucha.",
      introSie: "Pamięć audiacji (zasada Simon, Gordon): powtarzanie rosnących ciągów dźwięków; gwiazdki za najlepszą długość (§12).",
      einheiten: {},
    },
    "kp-bindebogen": {
      titel: "Łuk legato",
      introDu: "Łuk legato mówi: graj te dźwięki miękko połączone, legato. Nie myl go z łukiem przedłużającym! Tamten łączy takie same dźwięki w JEDEN - łuk legato łączy różne.",
      introSie: "Frazowanie (Krolick, rozdz. VI, §6-2/3): łuk legato ⠉ po każdej nucie oprócz ostatniej, podwojenie przy więcej niż czterech nutach; pomyłka łuk przedłużający/łuk legato jest aktywnie zestawiana.",
      einheiten: {
        "slur": "łuk legato (punkty 1, 4 - po każdej nucie oprócz ostatniej)",
        "slur-bracket": "łuk frazowy w formie nawiasu (tylko do rozpoznania)",
      },
    },
    "kp-artikulation": {
      titel: "Staccato, akcent i inne",
      introDu: "Jak zagrać dźwięk? Krótko i oddzielnie (staccato), przytrzymany do końca (tenuto) czy zaakcentowany (akcent)? Te znaki stoją PRZED nutą - tylko fermata, która zatrzymuje zakończenie, stoi po niej.",
      introSie: "Artykulacja (Krolick, rozdz. X, słownictwo KOMU-MK1): staccato/tenuto/akcent przed nutą (podwojenie od 4), fermata po nucie i nigdy nie podwajana.",
      einheiten: {
        "art:staccato": "staccato (punkty 2, 3, 6 - przed nutą)",
        "art:tenuto": "tenuto (punkty 4, 5, 6 · punkty 2, 3, 6)",
        "art:akzent": "akcent (punkty 4, 6 · punkty 2, 3, 6)",
        "fermate": "fermata (po nucie: punkty 1, 2, 6 · punkty 1, 2, 3)",
      },
    },
    "kp-dynamik": {
      titel: "Głośno i cicho w brajlu",
      introDu: "Teraz głośność dostaje swoje znaki: przed każdym słowem wykonawczym stoi znak słowny (punkty 3, 4, 5), potem przychodzą f (forte), p (piano) i inne. A widełki pokazują crescendo i decrescendo.",
      introSie: "Dynamika w brajlu (Krolick, rozdz. X, §10-2 do 6): znak słowny + litery, widełki cresc/decr; opiera się na słuchaniu z rozdziału 1.5.",
      einheiten: {
        "dyn:p": "piano (znak słowny i p)",
        "dyn:f": "forte (znak słowny i f)",
        "dyn:mf": "mezzoforte (znak słowny, m, f)",
        "dyn:pp": "pianissimo (znak słowny i dwa razy p)",
        "dyn:ff": "fortissimo (znak słowny i dwa razy f)",
        "dyn:cr": "początek widełek crescendo (345-14)",
        "dyn:decr": "początek widełek decrescendo (345-145)",
      },
    },
    "kp-tempo": {
      titel: "Oznaczenia tempa i metronom",
      introDu: "Largo, Andante, Presto - oznaczenia tempa mówią, jak szybko się gra. Posłuchaj ich, poznaj ich znaczenie i zapisz dokładne oznaczenie metronomu „ćwierćnuta równa się 60”.",
      introSie: "Tempo (lista KOMU-MK1 + accel/rit): jako słownictwo słuchowe i wiedza; oznaczenie metronomu (Krolick §14-17: komórka nuty, znak równości, znak liczby, cyfry).",
      einheiten: {
        "metronom": "oznaczenie metronomu (ćwierćnuta, znak równości, znak liczby, cyfry)",
      },
    },
    "kp-verzierungen1": {
      titel: "Ozdobniki I - przednutek i tryl",
      introDu: "Małe dźwięki ozdobne zdobią melodię: przednutek (dźwięk przed nutą) i tryl (szybka zmiana). Ich znaki stoją zawsze PRZED nutą.",
      introSie: "Ozdobniki (Krolick, rozdz. XI, §11-3/6/7): krótki i długi przednutek, tryl - brzmienie przez ornamentToEvents, znak przed nutą.",
      einheiten: {
        "orn:vorschlag": "krótki przednutek (punkty 2, 6)",
        "orn:vorschlag-lang": "długi przednutek (punkt 5 · punkty 2, 6)",
        "orn:triller": "tryl (punkty 2, 3, 5)",
      },
    },
    "kp-verzierungen2": {
      titel: "Ozdobniki II - obiegnik, mordent, tremolo",
      introDu: "Więcej ozdób: obiegnik owija się wokół dźwięku, mordent górny i mordent dolny krótko go szarpią, a tremolo szybko go powtarza. Zapamiętaj, gdzie stoi każdy znak.",
      introSie: "Dalsze ozdobniki (Krolick, rozdz. XI/VII, zakres dodatkowy): obiegnik/mordent górny/mordent dolny przed nutą, tremolo powtarzane po nucie, tremolo przemienne między nutami.",
      einheiten: {
        "orn:doppelschlag": "obiegnik (punkty 2, 5, 6)",
        "orn:pralltriller": "mordent górny (punkt 5 · punkty 2, 3, 5)",
        "orn:mordent": "mordent dolny (punkt 5 · punkty 2, 3, 5 · punkty 1, 2, 3)",
        "trem:rep8": "tremolo powtarzane ósemkami (punkty 4, 5 · punkty 1, 2)",
        "trem:alt8": "tremolo przemienne ósemkami (punkty 4, 6 · punkty 1, 2)",
      },
    },
    "kp-ausdruck-lied": {
      titel: "Z uczuciem! - w piosence",
      introDu: "Teraz łączysz wszystko: weź początek prawdziwej piosenki i posłuchaj albo zapisz go Z wyrazem - raz połączony łukiem, raz krótko, raz ze słowem wykonawczym przed nim. Tak muzyka brzmi żywo.",
      introSie: "Całość - część - całość (zasada 4): znaki ekspresji ze świata 4 stosować na prawdziwych piosenkach z półki; porównanie wersji suchej z wersją z wyrazem.",
      einheiten: {},
    },
    "kp-braillerepeats": {
      titel: "Brajl oszczędza pracę",
      introDu: "Brajl jest sprytny: zamiast pisać jeszcze raz taki sam takt, stawia znak simile - a z liczbą za nim mówi nawet, ile razy. Ale uwaga: nie na pierwszej mierze linijki!",
      introSie: "Skróty powtórzeń (Krolick, rozdz. IX, §9-15/36): zasady simile pogłębione, powtórzenie z liczbą 2356-3456-N; własny brajlowski środek skrótu.",
      einheiten: {
        "count-rep": "powtórzenie z liczbą (simile, znak liczby, liczba)",
      },
    },
    "kp-volten": {
      titel: "Volty, Da Capo i Segno",
      introDu: "Jak czytać drogowskazy formy? Volta 1 i volta 2 dają powtórzeniu nowe zakończenie, Segno i Coda oznaczają cele skoków, a „D.C.” znaczy: od początku!",
      introSie: "Znaki formy (Krolick, rozdz. IX, §9-6/8/9): volta z DOLNYMI cyframi, Segno/Coda, reguła Da Capo jako tekst; kolejność gry jako łamigłówka.",
      einheiten: {
        "volta:1": "volta 1, pierwsze zakończenie (znak liczby, dolna 1)",
        "volta:2": "volta 2, drugie zakończenie (znak liczby, dolna 2)",
        "segno": "Segno (punkty 3, 4, 6)",
        "coda": "Coda (punkty 3, 4, 6 · punkty 1, 2, 3)",
      },
    },
    "kp-formen": {
      titel: "Słuchanie form",
      introDu: "Muzyka ma plany budowy: czy początek wraca (A-B-A)? Ile razy wraca refren w rondzie? Czy powtórzenie jest dokładne - czy to wariacja? Usłysz formę.",
      introSie: "Forma muzyczna (program szkoły średniej I stopnia, klasa 2, ABRSM Aural G2): forma piosenki, rondo, wariacja słuchane przez cegiełki motywów.",
      einheiten: {},
    },
    "kp-intervalle1": {
      titel: "Słuchanie interwałów I",
      introDu: "Dwa dźwięki - jak daleko od siebie leżą? Najpierw kontrast prymy, kwinty i oktawy, potem dochodzą tercje. Zapamiętaj tercję kukułki i kwartę z „Amazing Grace”.",
      introSie: "Słuchanie interwałów (KOMU MK1, piosenki do zapamiętania): najpierw pryma/kwinta/oktawa, potem tercje, kwarta, seksta - po kolei, potem jednocześnie.",
      einheiten: {},
    },
    "kp-intervalle2": {
      titel: "Interwały w brajlu",
      introDu: "Teraz zapisujesz dwudźwięki: w górnym głosie stoi NAJWYŻSZA nuta, a znak interwału liczy w dół. Tak jeden znak dodaje drugi dźwięk.",
      introSie: "Znaki interwałów (Krolick, rozdz. V, tab. 5A): 34/346/3456/35/356/25/36 i kierunek czytania od dyskantu (najwyższa nuta, interwały w dół).",
      einheiten: {
        "int:2": "sekunda (punkty 3, 4)",
        "int:3": "tercja (punkty 3, 4, 6)",
        "int:4": "kwarta (punkty 3, 4, 5, 6)",
        "int:5": "kwinta (punkty 3, 5)",
        "int:6": "seksta (punkty 3, 5, 6)",
        "int:7": "septyma (punkty 2, 5)",
        "int:8": "oktawa (punkty 3, 6)",
      },
    },
    "kp-intervalle3": {
      titel: "Słuchanie interwałów II",
      introDu: "Wyzwanie: teraz dochodzą interwały, które zgrzytają - sekunda i septyma - i oceniasz, czy współbrzmienie jest większe, czy mniejsze od kwinty. W górę i w dół.",
      introSie: "Dokładne określanie interwałów (KOMU MK2): sekunda/septyma/tryton, w górę i w dół, zadania szacunkowe wokół kwinty.",
      einheiten: {},
    },
    "kp-akkorde1": {
      titel: "Dur czy moll?",
      introDu: "Trzy dźwięki razem to trójdźwięk. Brzmi jasno (dur) czy ciemno (moll)? A dźwięki przychodzą osobno (rozłożone) czy wszystkie naraz? Twoje ucho poznaje barwę akordów.",
      introSie: "Słuchanie akordów (KOMU MK1): rozróżnianie dur/moll, rozłożone i jednoczesne, zakres dodatkowy: zmniejszony.",
      einheiten: {},
    },
    "kp-akkorde2": {
      titel: "Zapisywanie akordów",
      introDu: "Trójdźwięk zapisujesz jak dwudźwięk: najwyższa nuta, potem znaki interwałów dla tercji i kwinty w dół. Jeden dźwięk, dwa znaki - akord gotowy.",
      introSie: "Zapis akordów (Krolick, rozdz. V): dźwięk podstawowy plus znaki interwałów (zasada dyskantu: najwyższa nuta, tercja i kwinta w dół), podwojenie oktawy.",
      einheiten: {},
    },
    "kp-inakkord": {
      titel: "Dwa głosy, jedna linijka",
      introDu: "Jak zapisać dwa głosy w JEDNEJ linijce brajla? Znak in-accord je rozdziela: najpierw głos górny, potem znak, potem głos dolny - każdy z własnym znakiem oktawowym.",
      introSie: "In-accord (Krolick, rozdz. V, §5-11/12): in-accord całotaktowy 126-345, po nim nowy znak oktawowy; brama do muzyki fortepianowej.",
      einheiten: {
        "inacc": "in-accord całotaktowy (punkty 1, 2, 6 · punkty 3, 4, 5)",
        "inacc-teil": "in-accord dla części taktu (punkt 5 · punkt 2)",
      },
    },
    "kp-tonleitern": {
      titel: "Gamy",
      introDu: "Osiem stopni od jednego dźwięku do następnego takiego samego: to gama. Zagraj gamę C-dur, usłysz różnicę między dur i moll i znajdź stopień, który się przesunął.",
      introSie: "Gamy (ABRSM G1, KOMU MK1): grać C-dur, słuchać dur/moll, znaleźć błędny stopień, zapisać G-dur z krzyżykiem.",
      einheiten: {},
    },
    "kp-quintenzirkel": {
      titel: "Rajd po kole kwintowym",
      introDu: "Rajd przez tonacje: ile krzyżyków ma G-dur? Która tonacja ma dwa bemole? Poznaj znaki przykluczowe do czterech krzyżyków i czterech bemoli - do przodu i do tyłu.",
      introSie: "Koło kwintowe (rdzeń KOMU MK1): tonacja ↔ liczba znaków do 4♯/4♭, czytanie znaków przykluczowych w brajlu.",
      einheiten: {},
    },
    "kp-rhythmusdiktat": {
      titel: "Dyktando rytmiczne",
      introDu: "Ja wystukuję takt - ty zapisujesz wartości. Liczy się tylko rytm, wysokość dźwięku zostaje ta sama. I odwrotnie: przeczytaj rytm z kartki i go wystukaj.",
      introSie: "Dyktando rytmiczne (KOMU MKe→MK1): zapis wartości ze słuchu (dyktando) i wystukiwanie a vista (odwrócenie); sylaby rytmiczne przy rozwiązaniu.",
      einheiten: {},
    },
    "kp-melodiediktat": {
      titel: "Dyktando melodyczne",
      introDu: "Królewskie ćwiczenie: ja gram małą melodię, ty ją zapisujesz. Zaczyna się małymi krokami, dźwięk początkowy jest zawsze podany, a słuchać możesz, ile razy chcesz.",
      introSie: "Dyktando melodyczne (KOMU MK1→MK2): 3-5 sąsiednich dźwięków od podanego dźwięku początkowego, stopniowanie do skoków tercjowych i wartości; nieograniczone słuchanie bez kary.",
      einheiten: {},
    },
    "kp-detektiv": {
      titel: "Detektyw błędów",
      introDu: "Bądź detektywem korekty: przeczytaj linijkę brajla i posłuchaj nagrania. W dokładnie jednym miejscu dźwięk różni się od nut - albo wszystko się zgadza. Znajdziesz to miejsce?",
      introSie: "Korekta (praktyka z niewidomymi: porównanie zapisu i brzmienia): znalezienie jednej różnicy - umiejętność docelowa czytania brajla.",
      einheiten: {},
    },
    "kp-baumeister": {
      titel: "Budowniczy taktów",
      introDu: "Buduj własne takty: pisz nuty i pauzy, aż miary dokładnie pasują do metrum. Za mało? Za dużo? Twój takt ci to powie - a gdy się zgadza, zabrzmi.",
      introSie: "Budowniczy taktów (silnik build §4.4): dowolne komórki nut i pauz, suma wartości == metrum, wieloznaczność według logiki czytania z kp12; kreatywność + liczenie taktu.",
      einheiten: {},
    },
    "kp-spielwiese": {
      titel: "Dźwiękowy plac zabaw",
      introDu: "Swobodna gra nad cichym burdonem: klawiszami pentatoniki żaden dźwięk nie zabrzmi źle. Opowiedz małą historię - raz cicho, raz głośno. Po prostu próbuj.",
      introSie: "Improwizacja Orffa (§7.7): pentatonika nad burdonem kwintowym, bez błędnych dźwięków, bez gwiazdek - znaczek od 30 zagranych dźwięków (§12).",
      einheiten: {},
    },
    "kp-kadenzen": {
      titel: "Sprawa zakończenia",
      introDu: "Jak brzmi zakończenie? Muzyka zostaje otwarta (półkadencja) czy się uspokaja (kadencja doskonała)? I czy to mocne zakończenie z dominanty, czy miękkie zakończenie „Amen”?",
      introSie: "Kadencje (ABRSM Aural G5, KOMU MK2): półkadencja i kadencja doskonała, plagalna i autentyczna, funkcje T/S/D.",
      einheiten: {},
    },
    "kp-komponier": {
      titel: "Warsztat kompozytora",
      introDu: "Twoja własna kartka: pisz swobodnie, posłuchaj swojego utworu i go zapisz. Na półce mieści się do pięciu utworów. Warsztat jest odwiedzony, gdy tylko zapiszesz pierwszy.",
      introSie: "Warsztat kompozytora (silnik sandbox §4.5): swobodne pisanie, słuchanie, zapisywanie do 5 utworów; bez gwiazdek - znaczek od pierwszego utworu (§12).",
      einheiten: {},
    },
    "kp-fingersatz": {
      titel: "Palcowanie",
      introDu: "Który palec gra którą nutę? Mówi to mała cyfra PO nucie: 1 to kciuk, 5 to mały palec. Tak ręka zawsze wie, dokąd iść.",
      introSie: "Palcowanie (Krolick, rozdz. XV, tab. 15): palce 1-5 = 1/12/123/2/13, PO nucie (przed łukiem przedłużającym).",
      einheiten: {
        "finger:1": "kciuk, palec 1 (punkt 1)",
        "finger:2": "palec wskazujący, palec 2 (punkty 1, 2)",
        "finger:3": "palec środkowy, palec 3 (punkty 1, 2, 3)",
        "finger:4": "palec serdeczny, palec 4 (punkt 2)",
        "finger:5": "mały palec, palec 5 (punkty 1, 3)",
      },
    },
    "kp-klavier": {
      titel: "Muzyka fortepianowa",
      introDu: "Dwie ręce, dwa znaki: prawa ręka gra zwykle melodię, lewa akompaniuje niżej. Znak ręki na początku linijki mówi, która ręka gra - a pedał daje dźwiękowi więcej pełni.",
      introSie: "Zapis fortepianowy (Krolick, rozdz. XV, tab. 15A): znaki rąk 46-345 / 456-345 (+ znak oktawowy po nich), pedał 126-14 (wciśnięcie) / 16-14 (zwolnienie).",
      einheiten: {
        "hand:r": "prawa ręka (punkty 4, 6 · punkty 3, 4, 5)",
        "hand:l": "lewa ręka (punkty 4, 5, 6 · punkty 3, 4, 5)",
        "pedal:ab": "pedał wciśnięty (punkty 1, 2, 6 · punkty 1, 4)",
        "pedal:auf": "pedał zwolniony (punkty 1, 6 · punkty 1, 4)",
      },
    },
    "kp-gesang": {
      titel: "Śpiew z brajlem",
      introDu: "W śpiewie dźwięki i sylaby należą do siebie: kilka dźwięków na jednej sylabie łączy łuk sylabowy, a znaki oddechu mówią, gdzie nabrać powietrza. Linijki tekstu i muzyki się przeplatają.",
      introSie: "Zapis wokalny (Krolick, rozdz. XVI): łuk sylabowy 14, oddech 345-2 / 6-34, 2 sylaby na nutę 12, prefiksy linijek 56-23 / 6-3.",
      einheiten: {
        "vocal:silbenbogen": "łuk sylabowy (punkty 1, 4)",
        "vocal:atem-halb": "półznak oddechu (punkty 3, 4, 5 · punkt 2)",
        "vocal:atem-voll": "pełny znak oddechu (punkt 6 · punkty 3, 4)",
        "vocal:silben2": "dwie sylaby na jednej nucie (punkty 1, 2)",
      },
    },
    "kp-gitarre": {
      titel: "Gitara i symbole akordów",
      introDu: "Na gitarze liczą się struna i pozycja: znak struny z cyfrą mówi, która struna jest szarpana, znak pozycji - gdzie chwyta ręka. A symbole akordów (kółko, trójkąt, 7 kursywą) zdradzają rodzaj akordu.",
      introSie: "Zapis gitarowy (Krolick, rozdz. XVII, tab. 17A-C): struny 146+cyfra, pozycje 345+znak interwału (pozycja 7 jako przypadek szczególny 6-345-25), barré 456/45; międzynarodowe symbole akordów (§3-UNSICHER-3: symbole literowe różnią się w poszczególnych krajach).",
      einheiten: {
        "string:3": "struna 3 (znak struny i punkty 1, 2, 3)",
        "fret:5": "pozycja 5 (znak pozycji i kwinta)",
        "fret:7": "pozycja 7 - przypadek szczególny z dodatkowym punktem 6",
        "barre:voll": "pełne barré (punkty 4, 5, 6)",
        "chordsym:sept": "akord dominanty septymowej, 7 kursywą",
      },
    },
    "kp-generalbass": {
      titel: "Bas cyfrowany i stopnie",
      introDu: "Bas cyfrowany to skrót dla akompaniatorów: nuta basowa z cyframi mówi, które dźwięki brzmią nad nią. A wszystko myśli stopniami - tonika, subdominanta, dominanta.",
      introSie: "Bas cyfrowany (Krolick, rozdz. XII, §12-15 do 27): prefiks partii 56-345, cyfry = znak liczby + DOLNE cyfry (najniższa cyfra z druku najpierw); stopnie I-IV-V jako pomost do kadencji.",
      einheiten: {
        "gb": "prefiks basu cyfrowanego (punkty 5, 6 · punkty 3, 4, 5)",
      },
    },
    "kp-partitur": {
      titel: "Partytura i zapis w druku",
      introDu: "Jak zbudowana jest partytura brajlowska? Numery taktów stoją bez znaku liczby na brzegu (przedtakt to takt zero), a głosy leżą odcinkami jeden nad drugim. Tak łatwo się odnaleźć.",
      introSie: "Wiedza o partyturze (Krolick, rozdz. XIV, §14-10 do 13): numery taktów bez znaku liczby, przedtakt = takt 0, format bar-over-bar, źródła (dzb lesen, SBS). Czysta wiedza.",
      einheiten: {
        "taktnr:1": "numer taktu (górne cyfry, bez znaku liczby)",
      },
    },
    "kp-orchester": {
      titel: "Dęte, perkusja i inne",
      introDu: "Instrumenty można podzielić na rodziny: strunowe, dęte, membranowe i samobrzmiące - według tego, co wytwarza dźwięk. Posłuchaj i przyporządkuj barwy.",
      introSie: "Wiedza o instrumentach (KOMU MK2, Hornbostel-Sachs w wersji dla dzieci): rodziny instrumentów + przyporządkowanie słuchowe z czterema głosami syntezatora. Przegląd, bez musztry znaków.",
      einheiten: {},
    },
    "kp-lieder2": {
      titel: "Piosenki z wyrazem",
      introDu: "Te same piosenki, teraz z uczuciem: legato albo krótko, cicho albo głośno. Usłysz różnicę między wersją suchą a wersją z wyrazem - i zapisuj linijki.",
      introSie: "Piosenki z wyrazem (§9.2): trzecia półka z dynamiką/artykulacją/łukami; dyktando ekspresji (sucho i z wyrazem) + zapis linijek. Rozszerzenie parseLine.",
      einheiten: {},
    },
    "kp-lesekonzert": {
      titel: "Koncert czytania",
      introDu: "Królewska dyscyplina: przeczytaj linijkę brajla bez słuchania, zapamiętaj ją - i zagraj potem z pamięci. Dokładnie tak gra się z nut, bo w czasie gry nie da się czytać.",
      introSie: "Koncert czytania (§9.3, RNIB „czytaj - zapamiętaj - zagraj”): pokazanie brajla → czytanie → gra z pamięci na klawiaturze → wzór do kontroli. Liczy się ciąg dźwięków, nie czas czytania (§12).",
      einheiten: {},
    },
    "kp-liederquiz": {
      titel: "Quiz piosenek",
      introDu: "Rozpoznasz piosenkę tylko po jej linijce brajla - bez jednego dźwięku? A może do usłyszanej melodii znajdziesz właściwą piosenkę? To ciche czytanie wewnętrznym uchem.",
      introSie: "Quiz piosenek (§9.4): czytanie pierwszej linijki brajla → nazwanie piosenki, i słuchanie melodii → nazwanie piosenki. Ukoronowanie płynnego czytania nut brajlowskich.",
      einheiten: {},
    },
  },
};
