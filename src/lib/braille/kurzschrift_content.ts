/**
 * Kurzschrift-Lehrpfad nach der 48-Lektionen-Struktur von „Kurzschrift für alle“
 * (Aldridge/Aldridge/Häni, 3. Aufl. 2019, braille.ch/kfa; Regeln: „Das System
 * der deutschen Brailleschrift“, 2018).
 *
 * REINE DATEN — keine Logik, kein React.
 *
 * WAS aus KFA übernommen ist (Fakten, auf Johannes' Wunsch exakt):
 *  – die Kapitelstruktur (48 Lektionen in dieser Reihenfolge — sie folgt der
 *    Systematik des amtlichen Regelwerks) und
 *  – das Kürzungsinventar je Lektion (KEINE zusätzlichen, KEINE gestrichenen).
 * WAS hier EIGENFORMULIERT ist (Lizenz, Entscheidung 03.07.2026):
 *  – alle Einführungs-/Merktexte (Du/Sie) und alle Übungen
 *    (kurzschrift_material.ts). KEIN Satz aus dem Lehrwerk.
 *
 * Die Punktmuster kommen NIE aus dieser Datei: Lösungen zur Laufzeit aus
 * liblouis `de-g2` (LGPL); Anzeige-Zellen je Kürzung aus
 * generated/kfa-cells.generated.json (build-time aus der LGPL-Tabelle
 * extrahierte Faktenmenge). Jede Übung ist build-time geprüft: Sie braucht
 * ausschließlich Kürzungen bereits gelernter Lektionen (tests/braille-kfa-*).
 *
 * `key` ist STABIL — er geht in `TaskEvent.unit`/`typed` (Verwechsler-Matrix).
 */

import KURZ_KUERZUNGEN from "./generated/kurz-kuerzungen.generated.json";

/**
 * Das Zeichen EINER Kürzung für sich (Legende, Zeichenliste) - aus der
 * liblouis-Regel, nicht aus der Übersetzung der Kürzung als Wort: allein
 * übersetzt gäbe „ll" ⠇⠇ statt ⠟. Erzeugt von `npm run kurz:cells`
 * (scripts/kurz-cells-erzeugen.mts, Begründung dort). Ein „-2"-Schlüssel
 * (erneut gelistete Kürzung) zählt wie seine Druckform.
 */
export function kuerzungsZeichen(printOderKey: string): string | undefined {
  const tabelle: Record<string, string> = KURZ_KUERZUNGEN.kuerzungen;
  return tabelle[printOderKey] ?? tabelle[printOderKey.replace(/-2$/, "")];
}

/** Kürzungs-Kategorie (Systematik des Regelwerks, eigene Kurzlabels). */
export type KfaKind =
  | "wort"        // einformige Wortkürzung
  | "lautgruppe"  // Lautgruppenkürzung
  | "zweiform"    // zweiformige Kürzung (Wortstamm, 2 Zeichen)
  | "komma"       // Kommakürzung (Punkt 2 + Zeichen)
  | "praefix"     // Kürzung vor Wortstämmen (ent-, ver-)
  | "suffix"      // Kürzung nach Wortstämmen (-ung, -heit, …)
  | "stammErw"    // einformig, nur mit Erweiterung (all-, wurd-, …)
  | "umlaut"      // Umlautungspunkt-Form (druck → drück)
  | "zeichen"     // Ankündigungszeichen (Lektion 48, nur Anzeige)
  | "strich"      // Strich-Zeichen (additiv, Etappen "striche01".."striche04")
  | "grenzfall";  // Grenzfall-Wort (additiv, Etappen "grenz01".."grenz04")

export interface KfaUnit {
  /** Stabiler Telemetrie-Schlüssel (bei erneuter Listung mit „-2“-Suffix). */
  key: string;
  /** Druckschrift-Form — Anzeige, liblouis-Prüfung, Zellen-Lookup. */
  print: string;
  kind: KfaKind;
  /** Umlautungspunkt-Formen: die Grundform (drück ← druck). */
  von?: string;
  /** true = Kürzung wurde früher eingeführt und hier mit weiterer
   *  Stellungsregel erneut gelistet (eh, an, ich). */
  wiederholt?: boolean;
}

export interface KfaLesson {
  /** 1..48 — Lektionsnummer wie im Lehrgang. */
  nr: number;
  /** Stabile id "kfa01".."kfa48" (Etappen-/Level-id: "kurz-" + id). */
  id: string;
  /** Eigener Titel (kindgerecht). */
  title: string;
  /** Fachliche Kategorie (Systematik) — für Studi-Ansicht/Zeichenliste. */
  bereich: string;
  /** Kind-Ansprache „Du“ — eigener Text, NIE Lehrwerk-Zitat. */
  introDu: string;
  /** Studi-/Lehrkraft-Ansprache „Sie“ — eigener Text. */
  introSie: string;
  units: KfaUnit[];
}

/** Kompakter Baustein: [key?, print, von?] je Kind. */
function us(kind: KfaKind, prints: (string | [string, string])[]): KfaUnit[] {
  return prints.map((p) => {
    if (Array.isArray(p)) {
      // Umlautungspunkt: [form, grundform]
      return { key: p[0], print: p[0], kind, von: p[1] };
    }
    if (p.endsWith("-2")) {
      const print = p.slice(0, -2);
      return { key: p, print, kind, wiederholt: true };
    }
    return { key: p, print: p, kind };
  });
}

/** Sprechlabel einer Einheit (TTS/ARIA). */
export function kfaSpoken(u: KfaUnit): string {
  switch (u.kind) {
    case "wort": return `die Wortkürzung ${u.print}`;
    case "lautgruppe": return `die Lautgruppenkürzung ${u.print}`;
    case "zweiform": return `die Kürzung ${u.print}`;
    case "komma": return `die Kommakürzung ${u.print}`;
    case "praefix": return `die Vorsilben-Kürzung ${u.print}`;
    case "suffix": return `die Nachsilben-Kürzung ${u.print}`;
    case "stammErw": return `die Kürzung ${u.print} mit Erweiterung`;
    case "umlaut": return `die Kürzung ${u.print}, von ${u.von}`;
    case "zeichen": return u.print;
    case "strich": return `das Beispiel ${u.print}`;
    case "grenzfall": return `der Grenzfall ${u.print}`;
  }
}

export const KFA_LESSONS: KfaLesson[] = [
  {
    nr: 1, id: "kfa01",
    title: "Ein Zeichen, ein Wort (Teil 1)",
    bereich: "Einformige Wortkürzungen — nur allein stehend (sich bis sie)",
    introDu:
      "Jetzt beginnt die Kurzschrift! Neun häufige Wörter schrumpfen auf EIN einziges Zeichen: sich, das, den, kann, lässt, man, oder, der, sie. Wichtig: Das gilt nur, wenn das Wort ganz allein steht — ohne Endung und ohne Anbau.",
    introSie:
      "Einstieg nach dem 48-Lektionen-Aufbau von „Kurzschrift für alle“ (Systematik des Regelwerks 2018, §4.3.1): einformige Wortkürzungen, die ausschließlich allein stehend gelten — keine Endungen, keine Vor-/Nachsilben, keine Wortverbindungen. Die Stellungsregel prüft liblouis de-g2 unsichtbar im Hintergrund.",
    units: us("wort", ["sich", "das", "den", "kann", "lässt", "man", "oder", "der", "sie"]),
  },
  {
    nr: 2, id: "kfa02",
    title: "Ein Zeichen, ein Wort (Teil 2)",
    bereich: "Einformige Wortkürzungen — nur allein stehend (dass bis die)",
    introDu:
      "Zehn weitere Ein-Zeichen-Wörter: dass, ist, als, schon, was, ihm, des, im, auch, die. Auch sie gelten nur allein stehend. Merke: „im“ wird ausgeschrieben, wenn ein Bindestrich dranhängt, und „ihm“ darf nicht neben einem Apostroph stehen.",
    introSie:
      "Fortsetzung der allein stehenden einformigen Wortkürzungen (§4.3.1). Besonderheiten: „im“ wird beim Zusammentreffen mit Bindestrich ausgeschrieben; die Kürzung für „ihm“ ist neben Apostroph unzulässig.",
    units: us("wort", ["dass", "ist", "als", "schon", "was", "ihm", "des", "im", "auch", "die"]),
  },
  {
    nr: 3, id: "kfa03",
    title: "Doppelt hält kürzer: ll, mm, ss, ck",
    bereich: "Kürzungen für Doppelmitlaute",
    introDu:
      "Vier Doppellaute bekommen je ein eigenes Zeichen: ll, mm, ss und ck. Sie dürfen nicht am Wortanfang stehen und nicht über eine Wortfuge hinweg (Öl-lampe bleibt getrennt!). Neu ist auch der Aufhebungspunkt (Punkt 6): Er sagt „das nächste Zeichen ist wieder ein normaler Buchstabe“ — wichtig vor x, q und ß.",
    introSie:
      "Doppelmitlaut-Kürzungen ll/mm/ss/ck (§4.1). Nicht am Wortanfang, nicht über Wortfugen. Zeichen mit neuer Kurzschrift-Bedeutung (l l → „ll“) erhalten bei ursprünglicher Bedeutung den vorangestellten Aufhebungspunkt Punkt 6; ebenso das Eszett. Bei Wahlmöglichkeit hat „ss“ Vorrang vor „st“.",
    units: us("lautgruppe", ["ll", "mm", "ss", "ck"]),
  },
  {
    nr: 4, id: "kfa04",
    title: "Wort und Baustein zugleich: es, ein, er, an, in, ich",
    bereich: "Einformige Kürzungen — als Wort oder als Lautgruppe",
    introDu:
      "Diese sechs Kürzungen können beides: allein als Wort stehen ODER mitten in einem Wort stecken — wie in „Wespe“ (es) oder „Kern“ (er). Zwei Ausnahmen: „an“ nie am Wortende, „ich“ nie am Wortanfang — sonst verwechselt man sie mit Ausrufezeichen und Zahlzeichen.",
    introSie:
      "Einformige Kürzungen mit Doppelfunktion Wort/Lautgruppe (§4.1, §4.3). Positionsregeln: „an“ nicht wortfinal (Kollision Ausrufezeichen), „ich“ nicht wortinitial (Kollision Zahlzeichen); „ich“ vor Interpunktion (außer Punkt, Apostroph, Strichen) ausgeschrieben. Selbstlautverdopplungen (ee) bleiben ausgeschrieben; konsonantische Lautgruppen haben Vorrang.",
    units: us("lautgruppe", ["es", "ein", "er", "an", "in", "ich"]),
  },
  {
    nr: 5, id: "kfa05",
    title: "Bausteine im Wort: en, el, ge, em, un",
    bereich: "Lautgruppenkürzungen — überall im Wort, nicht allein stehend",
    introDu:
      "Fünf fleißige Bausteine: en, el, ge, em, un. Sie dürfen überall im Wort stehen — vorn, mitten, hinten — aber nie allein. Vor c und y brauchst du jetzt manchmal den Aufhebungspunkt. Und: Die Silben chen, lein, ment und tum bleiben immer ganz.",
    introSie:
      "Lautgruppenkürzungen mit freier Position im Wort, allein stehend unzulässig (§4.1). „ge“ hat als Vorsilbe Vorrang bei der Kürzungswahl. Aufhebungspunkt vor c/y bei ursprünglicher Bedeutung; „el“ nicht nach Apostroph. Die Anfangsbuchstaben der Suffixe chen/lein/ment/tum dürfen nicht in eine Kürzung einbezogen werden.",
    units: us("lautgruppe", ["en", "el", "ge", "em", "un"]),
  },
  {
    nr: 6, id: "kfa06",
    title: "Wortkürzungen mit Anbau (Teil 1)",
    bereich: "Einformige Wortkürzungen — allein oder in Wortverbindungen (aber bis so)",
    introDu:
      "Diese Wörter — aber, bei, für, gegen, jetzt, nicht, so — kürzt du auch dann, wenn etwas angebaut ist: „sogar“, „Beilage“, „Nichtschwimmer“. Der Trick: Vor die Kürzung kommt dann ein Ankündigungspunkt (Punkt 2). Die Kürzung gilt nur, wenn das Wort wirklich seine Bedeutung behält.",
    introSie:
      "Einformige Wortkürzungen, die erweitert oder in Wortverbindungen mit vorangestelltem Punkt 2 angekündigt werden (§4.3.2). Anwendung nur bei erhaltener Sinnbindung („Gegend“ enthält kein „gegen“). In Verbindung mit apostrophierten Wörtern entfällt die Ankündigung.",
    units: us("wort", ["aber", "bei", "für", "gegen", "jetzt", "nicht", "so"]),
  },
  {
    nr: 7, id: "kfa07",
    title: "Wortkürzungen mit Anbau (Teil 2)",
    bereich: "Einformige Wortkürzungen — allein oder in Wortverbindungen (voll bis dem)",
    introDu:
      "Acht weitere Anbau-Wörter: voll, mit, und, von, immer, zu, gewesen, dem. Wieder gilt: allein stehend einfach kürzen, mit Anbau kommt Punkt 2 davor — wie in „Vollmond“, „immerzu“ oder „zudem“.",
    introSie:
      "Fortsetzung §4.3.2: voll, mit, und, von, immer, zu, gewesen, dem. Gleiche Ankündigungslogik (Punkt 2 bei Erweiterung/Wortverbindung), gleiche Sinnbindungsregel („Mittag“ enthält kein „mit“, „Zimmer“ kein „immer“).",
    units: us("wort", ["voll", "mit", "und", "von", "immer", "zu", "gewesen", "dem"]),
  },
  {
    nr: 8, id: "kfa08",
    title: "Wortkürzungen mit Anbau (Teil 3)",
    bereich: "Einformige Wortkürzungen — allein oder in Wortverbindungen (auf bis mehr)",
    introDu:
      "Die letzte Gruppe der Anbau-Wörter: auf, wie, durch, über, unter, vor, mehr. Damit kannst du schon richtig viel kürzen: „aufs“, „sowieso“, „durchs“, „drüber“, „runter“, „vorne“, „mehrere“.",
    introSie:
      "Abschluss der Gruppe §4.3.2: auf, wie, durch, über, unter, vor, mehr — allein stehend ohne, erweitert mit Punkt-2-Ankündigung. Sinnbindung beachten („Wiege“ ≠ „wie“, „munter“ ≠ „unter“).",
    units: us("wort", ["auf", "wie", "durch", "über", "unter", "vor", "mehr"]),
  },
  {
    nr: 9, id: "kfa09",
    title: "Zwei Zeichen, ein Stamm: also bis bist",
    bereich: "Zweiformige Kürzungen (also bis bist)",
    introDu:
      "Jetzt kommen die zweiformigen Kürzungen: ZWEI Zeichen stehen für einen ganzen Wortstamm — bleib, beid, brief, bring … Du darfst sie erweitern („bleiben“, „Brieftaube“) und zusammensetzen. Verboten sind sie über Wortfugen hinweg und in Namen.",
    introSie:
      "Einführung der zweiformigen Kürzungen (§4.4): frei erweiterbar und komponierbar, unzulässig über Wortfugen, in Eigennamen und ohne Sinnbindung („abringen“ enthält kein „bring“).",
    units: us("zweiform", ["also", "bleib", "beid", "brief", "bring", "beim", "bis", "bist"]),
  },
  {
    nr: 10, id: "kfa10",
    title: "Verboten am Wortanfang: eh, te, ich, ig, lich, ach",
    bereich: "Einformige Lautgruppenkürzungen — verboten am Wortanfang",
    introDu:
      "Sechs Lautgruppen — eh, te, ich, ig, lich, ach — darfst du NICHT an den Wortanfang setzen, dort behalten die Zeichen ihre alte Bedeutung. Mitten im Wort und am Ende sind sie Gold wert: „sehen“, „rate“, „Licht“, „mutig“, „künstlich“, „Nacht“. Nur „ich“ darf als Wort allein stehen; „eh“ ist auch am Wortende verboten.",
    introSie:
      "Lautgruppenkürzungen mit Anfangsverbot (§4.1): eh, te, ich, ig, lich, ach. „eh“ zusätzlich am Wortende verboten; „eh“ und „te“ nicht nach Apostroph; nur „ich“ auch als allein stehendes Wort.",
    units: us("lautgruppe", ["eh", "te", "ich-2", "ig", "lich", "ach"]),
  },
  {
    nr: 11, id: "kfa11",
    title: "Die da-Familie: dabei bis dir",
    bereich: "Zweiformige Kürzungen (dabei bis dir)",
    introDu:
      "Neun neue Zweizeichen-Kürzungen, fast alle aus der da-Familie: dabei, dadurch, dafür, dagegen, daher, dank, damit, denn, dir. Viele lassen sich verlängern: „dabeibleiben“, „dankbar“, „Gedanke“.",
    introSie:
      "Zweiformige Kürzungen dabei bis dir (§4.4). Übliche Erweiterungs- und Kompositionsregeln; Sinnbindung beachten.",
    units: us("zweiform", ["dabei", "dadurch", "dafür", "dagegen", "daher", "dank", "damit", "denn", "dir"]),
  },
  {
    nr: 12, id: "kfa12",
    title: "Von demokrat bis druck",
    bereich: "Zweiformige Kürzungen (demokrat bis druck)",
    introDu:
      "Weiter geht's: demokrat, davon, dazu, dessen, darauf, doch, deutsch, darüber, druck. Damit schreibst du „Deutschland“, „Drucker“ oder „davonlaufen“ blitzschnell.",
    introSie:
      "Zweiformige Kürzungen demokrat bis druck (§4.4). „dazu“ mit Sonderfall beim erweiterten Infinitiv („dazubleiben“ als da-zu-bleiben).",
    units: us("zweiform", ["demokrat", "davon", "dazu", "dessen", "darauf", "doch", "deutsch", "darüber", "druck"]),
  },
  {
    nr: 13, id: "kfa13",
    title: "Verboten am Wortende: pro, ex, be, al, or, an, eh, ar",
    bereich: "Lautgruppenkürzungen — verboten am Wortende",
    introDu:
      "Diese Bausteine darfst du nicht ans Wortende setzen — dort wären es Satzzeichen! „pro“ und „ex“ gehen sogar NUR am Wortanfang. Dafür glänzen sie sonst überall: „Programm“, „exakt“, „bereits“, „Salat“, „morgen“, „antworten“, „gehen“, „Arm“.",
    introSie:
      "Lautgruppenkürzungen mit Endverbot (§4.1): be, al, or, an, eh, ar (wortfinal behalten die Zeichen ihre Interpunktions-Bedeutung); pro und ex ausschließlich wortinitial. Nur „an“ auch allein stehend; „eh“ zusätzlich am Anfang verboten; „be“ hat als Vorsilbe Vorrang.",
    units: us("lautgruppe", ["pro", "ex", "be", "al", "or", "an-2", "eh-2", "ar"]),
  },
  {
    nr: 14, id: "kfa14",
    title: "Von etwa bis fertig",
    bereich: "Zweiformige Kürzungen (etwa bis fertig)",
    introDu:
      "Neue Zweizeichen-Kürzungen: etwa, denen, ebenso, freund, hoff, folg, führ, fall, fertig. Ganze Wortfamilien auf einen Schlag: „Freundin“, „hoffentlich“, „erfolgreich“, „Führerschein“, „falls“.",
    introSie:
      "Zweiformige Kürzungen etwa bis fertig (§4.4) mit den üblichen Erweiterungsregeln.",
    units: us("zweiform", ["etwa", "denen", "ebenso", "freund", "hoff", "folg", "führ", "fall", "fertig"]),
  },
  {
    nr: 15, id: "kfa15",
    title: "Am Anfang stark: ihr, sein, war",
    bereich: "Einformige Kürzungen — allein stehend oder am Wortanfang",
    introDu:
      "Drei Kürzungen für allein stehende Wörter UND Wortanfänge — ganz ohne Ankündigungspunkt: ihr (ihre, ihrem …), sein (seine, seinem …) und war (waren, warst). Aufgepasst: „ihr“ und „sein“ kürzt man am Anfang nur vor e und i, „war“ nur vor en und st.",
    introSie:
      "Einformige Kürzungen allein stehend oder wortinitial ohne Punkt-2-Ankündigung (§4.3.3): ihr/sein nur vor e und i, war nur vor en und st („warum“, „warten“ bleiben ausgeschrieben).",
    units: us("wort", ["ihr", "sein", "war"]),
  },
  {
    nr: 16, id: "kfa16",
    title: "Von gibt bis ganz",
    bereich: "Zweiformige Kürzungen (gibt bis ganz)",
    introDu:
      "Fünf neue Stämme: gibt, grund, geschäft, gelegen, ganz. Daraus baust du „ergibt“, „Grundwasser“, „geschäftlich“, „gelegentlich“, „ganztägig“.",
    introSie:
      "Zweiformige Kürzungen gibt bis ganz (§4.4). Sinnbindung: „Eleganz“ enthält kein „ganz“.",
    units: us("zweiform", ["gibt", "grund", "geschäft", "gelegen", "ganz"]),
  },
  {
    nr: 17, id: "kfa17",
    title: "Von groß bis glück",
    bereich: "Zweiformige Kürzungen (groß bis glück)",
    introDu:
      "Sechs starke Stämme: groß, gleich, gesellschaft, gegenüber, gegenwart, glück. Ob „Großmutter“, „gleichzeitig“ oder „glücklich“ — zwei Zeichen genügen.",
    introSie:
      "Zweiformige Kürzungen groß bis glück (§4.4) mit den üblichen Regeln.",
    units: us("zweiform", ["groß", "gleich", "gesellschaft", "gegenüber", "gegenwart", "glück"]),
  },
  {
    nr: 18, id: "kfa18",
    title: "Von hand bis ihn",
    bereich: "Zweiformige Kürzungen (hand bis ihn)",
    introDu:
      "Acht neue Kürzungen: hand, haft, haupt, hier, hat, hast, irgend, ihn. Damit gelingen „Handschuh“, „Hauptbahnhof“, „hierher“, „irgendwann“ und „ihnen“ im Nu.",
    introSie:
      "Zweiformige Kürzungen hand bis ihn (§4.4). „nirgends/nirgendwo“ bleiben ohne „irgend“-Kürzung (keine Sinnbindung).",
    units: us("zweiform", ["hand", "haft", "haupt", "hier", "hat", "hast", "irgend", "ihn"]),
  },
  {
    nr: 19, id: "kfa19",
    title: "Vorsilben-Zeichen: ent- und ver-",
    bereich: "Kürzungen vor Wortstämmen; Prä- und Suffixe im Allgemeinen",
    introDu:
      "Zwei Zeichen für zwei häufige Vorsilben: ent- und ver-. Sie stehen nur am Wortanfang vor einem echten Wortstamm: „entlaufen“, „verloren“. Wichtig zu wissen: Vorsilben und Wortstämme dürfen generell nicht durch eine Kürzung verbunden werden — und die Silben chen, lein, ment, tum bleiben immer ganz.",
    introSie:
      "Präfix-Kürzungen ent-/ver- (§4.2.1): nur wortinitial vor Wortstämmen, echte Präfix-Funktion vorausgesetzt („Ente“, „Rente“, „Verse“ bleiben frei). „ver“ nach Bindestrich ausgeschrieben. Allgemein: Kürzungen verbinden weder Präfixe noch unbetonte Suffixe (chen/lein/ment/tum) mit dem Stamm; bei nicht eindeutigem Präfix („reserviert“) sind beide Schreibweisen zulässig. ll/mm/ss bleiben davon unberührt („illegal“).",
    units: us("praefix", ["ent", "ver"]),
  },
  {
    nr: 20, id: "kfa20",
    title: "Die jahr-Familie: jed bis jetzig",
    bereich: "Zweiformige Kürzungen (jed bis jetzig)",
    introDu:
      "Sieben Kürzungen rund um Zeit und j: jed, jahrhundert, jahr, jahrtausend, jahrzehnt, jedoch, jetzig. „Jedes Jahr“ wird herrlich kurz — und sogar „Jahrhundertwende“ schnurrt zusammen.",
    introSie:
      "Zweiformige Kürzungen jed bis jetzig (§4.4), inklusive der Komposita-Bildungen (Neujahr, Frühjahr, jahraus/jahrein).",
    units: us("zweiform", ["jed", "jahrhundert", "jahr", "jahrtausend", "jahrzehnt", "jedoch", "jetzig"]),
  },
  {
    nr: 21, id: "kfa21",
    title: "Von kraft bis kannst",
    bereich: "Zweiformige Kürzungen (kraft bis kannst)",
    introDu:
      "Sechs k-Kürzungen: kraft, kapital, konnt, komm, kurz, kannst. Für „Wasserkraftwerk“, „bekommen“, „kurzweilig“ und „konntest“ brauchst du nur noch wenige Zeichen.",
    introSie:
      "Zweiformige Kürzungen kraft bis kannst (§4.4) mit den üblichen Regeln.",
    units: us("zweiform", ["kraft", "kapital", "konnt", "komm", "kurz", "kannst"]),
  },
  {
    nr: 22, id: "kfa22",
    title: "Von leb bis leicht",
    bereich: "Zweiformige Kürzungen (leb bis leicht)",
    introDu:
      "Vier l-Kürzungen: leb, lang, letzt, leicht. Damit werden „Lebenslauf“, „langweilig“, „letztendlich“ und „erleichtern“ federleicht.",
    introSie:
      "Zweiformige Kürzungen leb bis leicht (§4.4). Sinnbindung: „Kleber“ ohne „leb“, „Schlange“ ohne „lang“, „schleicht“ ohne „leicht“.",
    units: us("zweiform", ["leb", "lang", "letzt", "leicht"]),
  },
  {
    nr: 23, id: "kfa23",
    title: "Mit Endung, ohne Ankündigung: hatt, welch, hätt",
    bereich: "Einformige Kürzungen — allein, mit Endungen oder in Wortverbindungen",
    introDu:
      "Drei besonders bequeme Kürzungen: hatt, welch und hätt. Sie stehen allein, nehmen Endungen an („hatte“, „welches“, „hätten“) und brauchen dafür KEINEN Ankündigungspunkt.",
    introSie:
      "Einformige Kürzungen mit freier Erweiterung ohne Punkt-2-Ankündigung (§4.3.4): hatt, welch, hätt.",
    units: us("wort", ["hatt", "welch", "hätt"]),
  },
  {
    nr: 24, id: "kfa24",
    title: "Von musik bis möglich",
    bereich: "Zweiformige Kürzungen (musik bis möglich)",
    introDu:
      "Acht neue Kürzungen: musik, material, materiell, mir, mittel, muss, maschin, möglich. „Musikinstrument“, „Lebensmittel“, „Nähmaschine“, „möglichst“ — alles wird kurz.",
    introSie:
      "Zweiformige Kürzungen musik bis möglich (§4.4). Sinnbindung: „Mirabelle“ ohne „mir“, „Muße“ ohne „muss“.",
    units: us("zweiform", ["musik", "material", "materiell", "mir", "mittel", "muss", "maschin", "möglich"]),
  },
  {
    nr: 25, id: "kfa25",
    title: "Von neben bis nutz",
    bereich: "Zweiformige Kürzungen (neben bis nutz)",
    introDu:
      "Neun n-Kürzungen: neben, nachdem, nehm, nahm, nur, nichts, natur, nommen, nutz. Jetzt gehen „nebenan“, „angenehm“, „Aufnahme“, „Naturfreund“ und „genommen“ ganz leicht.",
    introSie:
      "Zweiformige Kürzungen neben bis nutz (§4.4) mit den üblichen Erweiterungsregeln.",
    units: us("zweiform", ["neben", "nachdem", "nehm", "nahm", "nur", "nichts", "natur", "nommen", "nutz"]),
  },
  {
    nr: 26, id: "kfa26",
    title: "Von nächst bis ohne",
    bereich: "Zweiformige Kürzungen (nächst bis ohne)",
    introDu:
      "Sechs weitere Kürzungen: nächst, noch, notwendig, natürlich, worden, ohne. „Demnächst“, „dennoch“, „ohnehin“ und „natürlich“ schreiben sich fast von selbst.",
    introSie:
      "Zweiformige Kürzungen nächst bis ohne (§4.4). Sinnbindung: „Knochen“ ohne „noch“, „Bohne“ ohne „ohne“.",
    units: us("zweiform", ["nächst", "noch", "notwendig", "natürlich", "worden", "ohne"]),
  },
  {
    nr: 27, id: "kfa27",
    title: "Nachsilben-Zeichen: -falls bis -wärts",
    bereich: "Kürzungen nach Wortstämmen (Suffixe)",
    introDu:
      "Neun Zeichen für häufige Endungen: falls, heit, keit, mal, ung, nis, sam, schaft, wärts. Sie hängen an Wortstämmen: „ebenfalls“, „Gesundheit“, „Übung“, „einmal“, „auswärts“. Ein paar Wörter bleiben zur Sicherheit ausgeschrieben — zum Beispiel Hoheit und Herrschaft.",
    introSie:
      "Suffix-Kürzungen (§4.2.2): nur nach Wortstämmen, mit Ausnahme von „mal“ echte Suffixe; kombinierbar und mit Endungen erweiterbar; alle außer „mal“/„wärts“ auch wortintern in Komposita. Ausschreibungspflicht zur Verwechslungsvermeidung: Hoheit, Rauheit, Barschaft, Herrschaft sowie „mal“ in dezimal/formal/maximal/minimal/normal/optimal. „mal“ gilt auch in „mals“/„malig“.",
    units: us("suffix", ["falls", "heit", "keit", "mal", "ung", "nis", "sam", "schaft", "wärts"]),
  },
  {
    nr: 28, id: "kfa28",
    title: "Von paragraf bis plötzlich",
    bereich: "Zweiformige Kürzungen (paragraf bis plötzlich)",
    introDu:
      "Sieben p-Kürzungen: paragraf, politik, person, punkt, platz, politisch, plötzlich. „Personal“, „Haltepunkt“, „Sitzplatz“ und „plötzlich“ — zwei Zeichen genügen.",
    introSie:
      "Zweiformige Kürzungen paragraf bis plötzlich (§4.4). Schreibvariante „Paragraph“ (ph) bleibt ungekürzt.",
    units: us("zweiform", ["paragraf", "politik", "person", "punkt", "platz", "politisch", "plötzlich"]),
  },
  {
    nr: 29, id: "kfa29",
    title: "Von rehabilit bis rück",
    bereich: "Zweiformige Kürzungen (rehabilit bis rück)",
    introDu:
      "Sechs r-Kürzungen: rehabilit, regier, republik, herr, recht, rück. Für „Regierung“, „Bundesrepublik“, „herrlich“, „Gerechtigkeit“ und „zurück…“ — Moment, „zurück“ kommt später extra!",
    introSie:
      "Zweiformige Kürzungen rehabilit bis rück (§4.4). Ausnahme: „Herrschaft(en)“ bleibt ausgeschrieben (vgl. Lektion 27); „Brücke“ ohne „rück“.",
    units: us("zweiform", ["rehabilit", "regier", "republik", "herr", "recht", "rück"]),
  },
  {
    nr: 30, id: "kfa30",
    title: "Von sind bis solch",
    bereich: "Zweiformige Kürzungen (sind bis solch)",
    introDu:
      "Neun s-Kürzungen: sind, sag, sozial, sondern, sehr, besser, satz, selbst, solch. „Sagenhaft“, „Verbesserung“, „selbstständig“ und „solcherlei“ gelingen jetzt flott.",
    introSie:
      "Zweiformige Kürzungen sind bis solch (§4.4) mit den üblichen Regeln.",
    units: us("zweiform", ["sind", "sag", "sozial", "sondern", "sehr", "besser", "satz", "selbst", "solch"]),
  },
  {
    nr: 31, id: "kfa31",
    title: "Komma-Kürzungen (Teil 1): dürf bis soll",
    bereich: "Kommakürzungen (dürf bis soll)",
    introDu:
      "Ein neuer Kürzungstyp: Punkt 2 plus ein Zeichen — die Komma-Kürzungen. Zehn Stück auf einmal: dürf, setz, hab, sitz, könn, lass, müss, woll, fahr, soll. Sie stehen allein, in Verbindungen und sogar in Namen: „dürfen“, „Gesetz“, „haben“, „können“, „Fahrrad“.",
    introSie:
      "Kommakürzungen (§4.5): Punkt 2 ist fester Bestandteil der Kürzung. Zulässig allein, in Wortverbindungen und in Eigennamen; Sinnbindung erforderlich („Lasso“ ohne „lass“, „geschwollen“ ohne „woll“).",
    units: us("komma", ["dürf", "setz", "hab", "sitz", "könn", "lass", "müss", "woll", "fahr", "soll"]),
  },
  {
    nr: 32, id: "kfa32",
    title: "Komma-Kürzungen (Teil 2): stell bis einander",
    bereich: "Kommakürzungen (stell bis einander)",
    introDu:
      "Sechs weitere Komma-Kürzungen: stell, sprech, stand, weis, schrieb, einander. Damit meisterst du „Ausstellung“, „besprechen“, „verstanden“, „beweisen“, „miteinander“.",
    introSie:
      "Kommakürzungen stell bis einander (§4.5). Sinnbindung: „Kastell/Pastell“ ohne „stell“, „weiß“ ohne „weis“.",
    units: us("komma", ["stell", "sprech", "stand", "weis", "schrieb", "einander"]),
  },
  {
    nr: 33, id: "kfa33",
    title: "Komma-Kürzungen (Teil 3): ander bis richt",
    bereich: "Kommakürzungen (ander bis richt)",
    introDu:
      "Die letzten sieben Komma-Kürzungen: ander, mög, werd, interess, brauch, spiel, richt. „Anderthalb“, „Vermögen“, „interessant“, „Gebrauchsanweisung“, „Unterricht“ — alles dabei.",
    introSie:
      "Kommakürzungen ander bis richt (§4.5). Sinnbindung: „Salamander“ ohne „ander“, „möglich“ nutzt die eigene Kürzung, „töricht/bricht“ ohne „richt“.",
    units: us("komma", ["ander", "mög", "werd", "interess", "brauch", "spiel", "richt"]),
  },
  {
    nr: 34, id: "kfa34",
    title: "Von treff bis etwas",
    bereich: "Zweiformige Kürzungen (treff bis etwas)",
    introDu:
      "Sechs neue Kürzungen: treff, trag, technik, trotz, technisch, etwas. „Treffen“, „tragbar“, „Techniker“, „trotzdem“ und „etwas“ — kurz und knackig.",
    introSie:
      "Zweiformige Kürzungen treff bis etwas (§4.4) mit den üblichen Regeln.",
    units: us("zweiform", ["treff", "trag", "technik", "trotz", "technisch", "etwas"]),
  },
  {
    nr: 35, id: "kfa35",
    title: "Von verhältnis bis vielleicht",
    bereich: "Zweiformige Kürzungen (verhältnis bis vielleicht)",
    introDu:
      "Fünf v-Kürzungen: verhältnis, volk, viel, vom, vielleicht. „Verhältnismäßig“, „Volksmusik“, „vielerlei“ und „vielleicht“ schrumpfen ordentlich.",
    introSie:
      "Zweiformige Kürzungen verhältnis bis vielleicht (§4.4) mit den üblichen Regeln.",
    units: us("zweiform", ["verhältnis", "volk", "viel", "vom", "vielleicht"]),
  },
  {
    nr: 36, id: "kfa36",
    title: "Von zahl bis zurück",
    bereich: "Zweiformige Kürzungen (zahl bis zurück)",
    introDu:
      "Acht z-Kürzungen: zahl, zum, zunächst, zur, zusammen, zeit, zwischen, zurück. „Bezahlen“, „zusammenkommen“, „rechtzeitig“, „inzwischen“, „zurückgehen“ — fertig ist der z-Baukasten.",
    introSie:
      "Zweiformige Kürzungen zahl bis zurück (§4.4). Sinnbindung: „zumal/zumute“ ohne „zum“, „zureden“ ohne „zur“, „prophezeit“ ohne „zeit“.",
    units: us("zweiform", ["zahl", "zum", "zunächst", "zur", "zusammen", "zeit", "zwischen", "zurück"]),
  },
  {
    nr: 37, id: "kfa37",
    title: "Nur mit Anhang: all-, wurd-, möcht-, würd-, besonder-, dies-",
    bereich: "Einformige Kürzungen — nur mit Erweiterungen",
    introDu:
      "Sechs Stämme, die NUR gekürzt werden, wenn etwas dranhängt: alle, wurde, möchte, würde, besondere, diese. Das nackte Wort ohne Endung („dies“, „all“) bleibt ausgeschrieben. Vorsilben davor sind erlaubt: „zuallererst“.",
    introSie:
      "Einformige Stammkürzungen nur mit Erweiterung (§4.3.5): all-, wurd-, möcht-, würd-, besonder-, dies-. Ohne Endung bzw. mit Apostroph ausgeschrieben; Vorsilben und vorangehende Wortteile zulässig. „würd“ nicht in „würdig“; Sinnbindung („überall“, „Alltag“, „dieselbe“ bleiben frei).",
    units: us("stammErw", ["all", "wurd", "möcht", "würd", "besonder", "dies"]),
  },
  {
    nr: 38, id: "kfa38",
    title: "Von geworden bis charakter",
    bereich: "Zweiformige Kürzungen (geworden bis charakter)",
    introDu:
      "Vier neue Kürzungen: geworden, stets, staat, charakter. „Bundesstaat“, „staatlich“ und „charakterlich“ gehen jetzt zackig.",
    introSie:
      "Zweiformige Kürzungen geworden bis charakter (§4.4) mit den üblichen Regeln.",
    units: us("zweiform", ["geworden", "stets", "staat", "charakter"]),
  },
  {
    nr: 39, id: "kfa39",
    title: "Von schreib bis öffentlich",
    bereich: "Zweiformige Kürzungen (schreib bis öffentlich)",
    introDu:
      "Acht Kürzungen: schreib, schlag, schrift, schließ, schwierig, überhaupt, übrig, öffentlich. Besonders schön: „Blindenschrift“ und „Punktschrift“ werden herrlich kurz!",
    introSie:
      "Zweiformige Kürzungen schreib bis öffentlich (§4.4). „übrig“ vs. „würdig“ auseinanderhalten (nur „übrig“ hat eine Kürzung).",
    units: us("zweiform", ["schreib", "schlag", "schrift", "schließ", "schwierig", "überhaupt", "übrig", "öffentlich"]),
  },
  {
    nr: 40, id: "kfa40",
    title: "Von wird bis will",
    bereich: "Zweiformige Kürzungen (wird bis will)",
    introDu:
      "Sieben w-Kürzungen: wird, weg, wahr, wirk, wohl, wenn, will. „Wegweiser“, „Wahrheit“, „wirklich“, „wohlig“, „freiwillig“ — die w-Familie wächst.",
    introSie:
      "Zweiformige Kürzungen wird bis will (§4.4). Eigennamen bleiben frei („Willi“).",
    units: us("zweiform", ["wird", "weg", "wahr", "wirk", "wohl", "wenn", "will"]),
  },
  {
    nr: 41, id: "kfa41",
    title: "Von wir bis wesentlich",
    bereich: "Zweiformige Kürzungen (wir bis wesentlich)",
    introDu:
      "Sieben weitere w-Kürzungen: wir, weit, wiss, wirst, wirtschaft, wenig, wesentlich. „Weiterhin“, „Wissenschaft“, „wenigstens“ und „im Wesentlichen“ sind jetzt dran.",
    introSie:
      "Zweiformige Kürzungen wir bis wesentlich (§4.4). Sinnbindung: „Wirtshaus“ ohne „wirtschaft“, „Zweitwohnung“ ohne „weit“.",
    units: us("zweiform", ["wir", "weit", "wiss", "wirst", "wirtschaft", "wenig", "wesentlich"]),
  },
  {
    nr: 42, id: "kfa42",
    title: "Von arbeit bis ähnlich",
    bereich: "Zweiformige Kürzungen (arbeit bis ähnlich)",
    introDu:
      "Die letzten vier Grund-Zweiformen: arbeit, wieder, während, ähnlich. „Arbeitsplatz“, „Wiederholung“, „währenddessen“, „Ähnlichkeit“ — geschafft!",
    introSie:
      "Zweiformige Kürzungen arbeit bis ähnlich (§4.4) — Abschluss der Grundmenge vor dem Umlautungspunkt.",
    units: us("zweiform", ["arbeit", "wieder", "während", "ähnlich"]),
  },
  {
    nr: 43, id: "kfa43",
    title: "Der Umlautungspunkt (Teil 1): drück bis jähr",
    bereich: "Umlautungspunkt-Formen (drück bis jähr)",
    introDu:
      "Ein Zauberpunkt: Punkt 5 vor einer Kürzung verwandelt ihren Selbstlaut in einen Umlaut — aus druck wird drück, aus hand wird händ, aus jahr wird jähr. So kannst du „ausdrücklich“, „Hände“ und „jährlich“ kürzen.",
    introSie:
      "Umlautungspunkt Punkt 5 (§4.6): wandelt den Stammvokal zweiformiger Kürzungen in den Umlaut. Nur bei den ausdrücklich zugelassenen Formen dieser Lektionen; bei Kommakürzungen ersetzt Punkt 5 den Punkt 2.",
    units: us("umlaut", [["drück","druck"],["fäll","fall"],["größ","groß"],["gründ","grund"],["gegenwärt","gegenwart"],["gänz","ganz"],["händ","hand"],["häft","haft"],["häupt","haupt"],["jähr","jahr"]]),
  },
  {
    nr: 44, id: "kfa44",
    title: "Der Umlautungspunkt (Teil 2): kräft bis fähr",
    bereich: "Umlautungspunkt-Formen (kräft bis fähr)",
    introDu:
      "Zwölf weitere Umlaut-Formen: kräft, kömm, kürz, läss, läng, nähm, nütz, persön, pünkt, plätz, völl, fähr. Jetzt gehen „kräftig“, „kürzlich“, „nützlich“, „persönlich“, „pünktlich“, „völlig“ und „gefährlich“.",
    introSie:
      "Umlautungspunkt-Formen kräft bis fähr (§4.6). Bei Kommakürzungen (läss von lass, fähr von fahr) ersetzt Punkt 5 den Punkt 2. „völl“ entsteht aus „voll“.",
    units: us("umlaut", [["kräft","kraft"],["kömm","komm"],["kürz","kurz"],["läss","lass"],["läng","lang"],["nähm","nahm"],["nütz","nutz"],["persön","person"],["pünkt","punkt"],["plätz","platz"],["völl","voll"],["fähr","fahr"]]),
  },
  {
    nr: 45, id: "kfa45",
    title: "Der Umlautungspunkt (Teil 3): säg bis bräuch",
    bereich: "Umlautungspunkt-Formen (säg bis bräuch)",
    introDu:
      "Die letzten elf Umlaut-Formen: säg, sätz, träg, völk, zähl, ständ, schläg, änder, währ, wär, bräuch. Damit sind „zusätzlich“, „erzählen“, „ständig“, „Vorschläge“, „ändern“, „Währung“, „wäre“ und „gebräuchlich“ kurz.",
    introSie:
      "Umlautungspunkt-Formen säg bis bräuch (§4.6). „wär“ (von war) wird — anders als „war“ — auch vor nachfolgendem e gekürzt. Sinnbindung: „Länder“ ohne „änder“, „Wärter“ ohne „wär“.",
    units: us("umlaut", [["säg","sag"],["sätz","satz"],["träg","trag"],["völk","volk"],["zähl","zahl"],["ständ","stand"],["schläg","schlag"],["änder","ander"],["währ","wahr"],["wär","war"],["bräuch","brauch"]]),
  },
  {
    nr: 46, id: "kfa46",
    title: "Fremdwort-Bausteine mit Punkt 5: ismus bis ität",
    bereich: "Lautgruppenkürzungen mit Punkt 5",
    introDu:
      "Fünf Bausteine für Fremdwörter, alle mit Punkt 5 davor: ismus, ation, ativ, istisch, ität. „Optimismus“, „Station“, „kreativ“, „realistisch“, „Universität“ — klingt gelehrt, tastet sich kurz.",
    introSie:
      "Lautgruppenkürzungen mit festem Punkt 5 (§4.1): ismus, ation, ativ, istisch, ität — überall außer am Wortanfang zulässig.",
    units: us("lautgruppe", ["ismus", "ation", "ativ", "istisch", "ität"]),
  },
  {
    nr: 47, id: "kfa47",
    title: "Namen richtig kürzen",
    bereich: "Eigennamen — Richtlinien",
    introDu:
      "Namen sind knifflig: Man kürzt nur, was jede Leserin sicher zurückverwandeln kann. Lautgruppen sind meist erlaubt („Heidelberg“), zweiformige Kürzungen in Namen tabu, Wortkürzungen nur in ihrer echten Bedeutung („von“, „der“). Im Zweifel gilt: lieber ausschreiben!",
    introSie:
      "Eigennamen (§4.9.3): Lautgruppenkürzungen zulässig (keine Vokale über Silbengrenzen zusammenfassen); Prä-/Suffix- und zweiformige Kürzungen grundsätzlich nicht; ein- formige Wort- und Kommakürzungen nur bei erhaltener Bedeutung (Frau von der Krone). Grundsatz: Im Zweifel ausschreiben — es kann mehrere korrekte Schreibungen geben (Holland mit oder ohne ll-Kürzung).",
    units: [],
  },
  {
    nr: 48, id: "kfa48",
    title: "Großbuchstaben und fremde Schriften",
    bereich: "Besondere Großschreibung; Einschübe anderer Brailleschriften",
    introDu:
      "Zum Abschluss vier Ankündigungszeichen: für Großbuchstaben mitten im Wort (Punkt 5 + Punkte 4,6), für Buchstaben mit Akzent (Punkt 4, wie in Café), und für Einschübe in Basis- oder Vollschrift (Punkt 6 + Punkt 3 fürs einzelne Wort; Punkte 3,6 + Punkt 3 als Klammer um mehrere Wörter). Regel Nummer eins bleibt: die kürzeste, einfachste Schreibweise wählen.",
    introSie:
      "Sonderzeichen (§2.6.7, §2.8.1, §4.8): Binnengroßbuchstabe (Punkt 5, Punkte 4,6 — bzw. Punkte 4,6 nach Basisschrift-Ankündigung), Akzentbuchstaben mit Punkt 4, Ein-/Ausschaltung von Basis-/Vollschrift-Einschüben (Punkt 6+3 bzw. Punkte 3,6+3 … 6+3). Bei ausgeschlossener Verwechslung ist die Ankündigung verzichtbar.",
    units: [
      { key: "zx-binnengross", print: "Großbuchstabe im Wortinneren", kind: "zeichen" },
      { key: "zx-akzent", print: "Buchstabe mit Akzentzeichen", kind: "zeichen" },
      { key: "zx-einschub-wort", print: "einzelnes Wort in Basis-/Vollschrift", kind: "zeichen" },
      { key: "zx-einschub-start", print: "Beginn mehrerer Wörter in Basis-/Vollschrift", kind: "zeichen" },
      { key: "zx-einschub-ende", print: "Ende des Einschubs", kind: "zeichen" },
    ],
  },
];

/** Feste Anzeige-Punkte der Lektion-48-Zeichen (Syst. §2.6.7/§2.8.1/§4.8) —
 *  diese Zeichen sind keine Kürzungen und nicht über liblouis lösbar. */
export const KFA_ZEICHEN_DOTS: Record<string, number[][]> = {
  "zx-binnengross": [[5], [4, 6]],
  "zx-akzent": [[4]],
  "zx-einschub-wort": [[6], [3]],
  "zx-einschub-start": [[3, 6], [3]],
  "zx-einschub-ende": [[6], [3]],
};

// ─── Abgeleitete Helfer (pure) ───────────────────────────────────────────────

/** Lektion per Nummer (1..48). */
export function kfaLesson(nr: number): KfaLesson | undefined {
  return KFA_LESSONS.find((l) => l.nr === nr);
}

/** Lektion per id ("kfa01"). */
export function kfaLessonById(id: string): KfaLesson | undefined {
  return KFA_LESSONS.find((l) => l.id === id);
}

/** Alle bis inkl. Lektion `nr` eingeführten Druckschrift-Formen (lowercase),
 *  ohne die L48-Anzeigezeichen. Grundlage des Nur-gelernte-Kürzungen-Checks. */
export function kfaFormsUpTo(nr: number): Set<string> {
  const s = new Set<string>();
  for (const l of KFA_LESSONS) {
    if (l.nr > nr) continue;
    for (const u of l.units) {
      if (u.kind === "zeichen") continue;
      s.add(u.print.toLowerCase());
    }
  }
  return s;
}

/** Einheit per key (über alle Lektionen). */
export function kfaUnitByKey(key: string): (KfaUnit & { lessonNr: number }) | undefined {
  for (const l of KFA_LESSONS) {
    const u = l.units.find((x) => x.key === key);
    if (u) return { ...u, lessonNr: l.nr };
  }
  return undefined;
}

// ─── Zusatz-Etappen „Striche" (additiv, 22.09.2026, Auftrag Johannes) ────────
/**
 * Die Striche-Systematik der deutschen Kurzschrift - VIER additive Etappen
 * NACH den 48 eingefrorenen KFA-Lektionen, VOR „kurz-texte" (Begründung: die
 * Striche setzen alle 48 Kürzungs-Lektionen voraus - ein Bindestrich kann
 * jede beliebige gelernte Kürzung berühren -, und „kurz-texte" liest/schreibt
 * zusammenhängende Sachtexte, die genau diese Zeichen enthalten würden, ohne
 * dass sie vorher erklärt wurden).
 *
 * REGELQUELLE (Akademielehrgang Graz Mai 2010, Schwerpunkt Striche/Einschübe;
 * eine Helferin BBI): „06 Striche.doc" und der Übungstext
 * „kurzschrifttexte striche" (dieselbe Sammlung, ca. 657 Wörter Lesestoff).
 * Beide liegen ausserhalb des Repositoriums unter
 * „.../Lernplattform/Programme/Braille/Deutsche Kurzschrift/". Eigenformuliert
 * sind - wie bei KFA_LESSONS - alle Merktexte und alle Übungssätze; KEIN Satz
 * ist aus der Quelle übernommen, nur die Zeichen-Systematik und die
 * Reihenfolge der vier Themen (1. Bindestrich, 2. Ersatzstrich, 3. Gedanken-/
 * Streckenstrich, 4. Schrägstrich - exakt die Reihenfolge der Quelle).
 *
 * Wie bei KFA_LESSONS gilt: Die Punktmuster kommen NIE aus dieser Datei. Jede
 * `print`-Form läuft zur Laufzeit durch liblouis de-g2 (genau wie jede
 * KFA-Kürzung); vorgerechnet in generated/kurz-cells.generated.json (`npm run
 * kurz:cells`). Jede Form/jeder Satz unten wurde vor der Aufnahme händisch
 * gegen den liblouis-de-g2-Übersetzer geprüft (Belege in der Übergabe) und ist
 * zusätzlich in tests/braille-striche.test.ts gegen das exakt erwartete
 * Punktmuster (angekündigt/unangekündigt) abgesichert - dieselbe Sorgfalt wie
 * beim „nur gelernte Kürzungen"-Checker der KFA-Lektionen, nur ohne den
 * Kürzungs-Fortschritt (nach Lektion 48 sind alle Kürzungen ohnehin gelernt).
 *
 * NICHT übernommen, weil liblouis de-g2 die Regel nicht abbildet (kein Fantasie-
 * Zeichen - lieber weniger Inhalt als falscher; Beleg in der Übergabe):
 *  - das Abteilungszeichen bei der Silbentrennung am Zeilenumbruch (braucht
 *    `lou_hyphenate` mit der Trennungstabelle - diese App ruft nirgends etwas
 *    anderes als `lou_translateString` auf, Zeilenumbruch mit veränderter
 *    Kürzung lässt sich damit nicht erzeugen);
 *  - die Gegenüberstellung (Punkt 4,5,6 gefolgt von Punkt 1,2,3, zwischen
 *    Leerzeichen) - in der vendorten de-g2/de-g0-Tabellenkette gibt es dafür
 *    keine passende Regel (das einzige „|"-Zeichen dort löst zu einer anderen,
 *    generischen Zellenfolge auf, nicht zur Gegenüberstellung);
 *  - Hervorhebung/Kursivierung (Punkt 4,5,6 mit Schluss-Punkt 6,3) - liblouis
 *    kennt diese Regel zwar (`emphclass`/`begemphword`/`endemphword` in
 *    de-g0-core.uti), aber nur über eine Typeform-Markierung, die der
 *    `lou_translateString`-Aufruf dieser App nirgends mitgibt (weder im
 *    Worker noch in den Build-Skripten) - ohne sie übersetzt liblouis ein
 *    Markup-Zeichen wie `*` als gewöhnliches Satzzeichen, nicht als Hervor-
 *    hebung. Eine eigene Etappe dafür bräuchte einen Umbau der liblouis-
 *    Anbindung (`liblouis.ts`/`liblouis.worker.ts`) - ausserhalb dieses
 *    Auftrags, siehe Übergabe.
 */
export const STRICHE_LESSONS: KfaLesson[] = [
  {
    nr: 1, id: "striche01",
    title: "Der Bindestrich ohne Ankündigung",
    bereich: "Bindestrich (Punkt 3,6) - in zusammengesetzten Wörtern, Ortsnamen und zwischen Zahlen, ohne Ankündigungspunkt",
    introDu:
      "Ein neuer Baustein: der Bindestrich. In einem zusammengesetzten Wort wie U-Boot oder zwischen zwei Zahlen wie 10-12 bekommt er einfach sein eigenes Zeichen, Punkt 3 und Punkt 6 - ganz ohne Ankündigung davor. Er wird wie ein kleines Leerfeld behandelt: Vor und nach ihm steht nie ein zusätzliches Leerzeichen.",
    introSie:
      "Bindestrich (Punkt 3,6; Regelquelle: Akademielehrgang \"Striche\", Abschnitt 1). In zusammengesetzten Wörtern/Ortsnamen sowie zwischen Zahlen, ohne Leerzeichen und ohne Ankündigungspunkt - liblouis de-g2 löst ihn über den Basisschrift-Zeichensatz automatisch auf (Regel \"hyphen - 36\" in de-g0-core.uti), kein eigener Kürzungseintrag nötig.",
    units: us("strich", ["U-Boot", "Gartenbau-Amt", "Kaffee-Ersatz", "Wien-Favoriten", "10-12"]),
  },
  {
    nr: 2, id: "striche02",
    title: "Der Ersatzstrich",
    bereich: "Ersatzstrich (Auslassungsstrich) - spart ein Wortstück, das direkt daneben schon steht: am Wortende ohne Ankündigung (Punkt 3,6), am Wortanfang mit Ankündigung (Punkt 6, dann Punkt 3,6)",
    introDu:
      "Der Ersatzstrich spart ein Wortstück, das gleich daneben schon steht. Steht das fehlende Stück am ENDE eines Wortes, reicht wieder nur Punkt 3 und Punkt 6 - wie beim Bindestrich, zum Beispiel in Ein- und Ausgang. Steht das fehlende Stück am ANFANG des nächsten Wortes, kommt zuerst Punkt 6 als Ankündigung dazu - wie in Sonnenaufgang und -untergang.",
    introSie:
      "Ersatzstrich/Auslassungsstrich (Regelquelle: Akademielehrgang \"Striche\", Abschnitte 1.3 und 2.3). Am Wortende ohne Ankündigung (identisch zum Bindestrich), am Wortanfang mit vorangestelltem Punkt 6. Beide Formen löst liblouis de-g2 allein aus der Zeichenstellung: ein Leerzeichen unmittelbar davor, aber keins danach, löst die Ankündigung aus (Regel \"\\s- 0-6-36a\" in de-g0-core.uti); ohne diese Stellung bleibt es beim einfachen Bindestrich.",
    units: us("strich", ["Ein- und Ausgang", "Hin- und Rückfahrt", "Sonnenaufgang und -untergang", "Groß- und Kleinschreibung"]),
  },
  {
    nr: 3, id: "striche03",
    title: "Der Gedankenstrich und der Streckenstrich",
    bereich: "Ankündigung durch Punkt 6, dann Bindestrich (Punkt 3,6) - als Gedankenstrich mitten im Satz und als Streckenstrich zwischen zwei Orten",
    introDu:
      "Dasselbe Doppelzeichen wie eben - erst Punkt 6, dann Punkt 3 und 6 - hat noch zwei weitere Aufgaben. Mitten im Satz schiebt es einen Gedanken ein, zum Beispiel: Er kommt - so glaubt sie - morgen wieder. Zwischen zwei Orten zeigt es eine Strecke an, mit dem langen Strich direkt zwischen den beiden Namen (siehe Beispiele unten).",
    introSie:
      "Gedankenstrich und Streckenstrich (Regelquelle: Akademielehrgang \"Striche\", Abschnitte 2.1 und 2.2). Beide bestehen aus Punkt 6 gefolgt von Punkt 3,6. liblouis de-g2 löst dieses Zeichen für den Gedankenstrich unabhängig von der Leerzeichen-Stellung auf; für den Streckenstrich braucht es die typografisch lange Strichform (Halbgeviertstrich), weil der einfache Bindestrich zwischen zwei Ortsnamen sonst unangekündigt bliebe und mit einem zusammengesetzten Namen verwechselt würde.",
    units: us("strich", ["Wien–Berlin", "Hamburg–Köln", "Salzburg–Dornbirn", "Er kommt – so glaubt sie – morgen."]),
  },
  {
    nr: 4, id: "striche04",
    title: "Der Schrägstrich",
    bereich: "Schrägstrich (Punkt 5, Punkt 2) - ohne Leerzeichen, zum Beispiel zwischen Monaten oder Maßeinheiten",
    introDu:
      "Der Schrägstrich bekommt ein eigenes Doppelzeichen: erst Punkt 5, dann Punkt 2 - ganz ohne Leerzeichen davor oder danach. Du findest ihn zum Beispiel zwischen zwei Monaten wie Juli/August oder bei einer Geschwindigkeit wie 130 km/h.",
    introSie:
      "Schrägstrich (Punkt 5, dann Punkt 2; Regelquelle: Akademielehrgang \"Striche\", Abschnitt 4). Ohne Leerzeichen; liblouis de-g2 löst ihn über eine eigene, kontextunabhängige Basisschrift-Regel auf (Regel \"always / 5-2\" in de-g0-core.uti) - nicht über die generische Schrägstrich-Zelle der Zeichentabellen, die hier nicht greift.",
    units: us("strich", ["Juli/August", "Import/Export", "Oktober/November", "130 km/h"]),
  },
];

/** Striche-Lektion per Nummer (1..4). */
export function stricheLesson(nr: number): KfaLesson | undefined {
  return STRICHE_LESSONS.find((l) => l.nr === nr);
}

/** Striche-Lektion per id ("striche01".."striche04"). */
export function stricheLessonById(id: string): KfaLesson | undefined {
  return STRICHE_LESSONS.find((l) => l.id === id);
}

// ═══════════════════════════════════════════════════════════════════════════
// Grenzfälle: wann NICHT gekürzt wird (additiv, 23.09.2026)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Vier Etappen NACH den 48 KFA-Lektionen und nach den Striche-Etappen.
 *
 * QUELLE: Johannes' Wortliste „Wörter und Ausnahmen" / „besondere Wörter zum
 * Üben" (beide Dateien sind zeichengleich, md5 geprüft) aus seinem
 * Kurzschrift-Archiv. Freigabe am 22.09.2026: „wir dürfen das alles
 * verwenden". 92 Wörter, jedes einzeln mit liblouis de-g2 gegen den
 * Lektion-48-Checker geprüft - keines braucht eine Kürzung, die es nicht gibt.
 * Die Einteilung in vier Gruppen ist unsere, die Wörter sind seine.
 *
 * ★ WARUM DIESE LISTE ETWAS KANN, WAS DER REST DES MATERIALS NICHT KANN:
 * Das generierte Material (kfa-material.generated.json) sucht Wörter, die
 * KÜRZEN - das ist der Lernstoff. Diese Liste sucht das Gegenteil: Wörter, in
 * denen die Buchstaben einer Kürzung zwar vorkommen, aber nicht zusammen-
 * gehören. „Bison" sieht nach der Kürzung „is" aus und kürzt trotzdem nicht;
 * „Paragraf" kürzt auf zwei Zellen, „Paragraph" mit ph nicht. Genau daran
 * scheitert, wer Kurzschrift nur nach Aussehen schreibt.
 *
 * ⚠️ Die Etappen behaupten NICHT, dass hier nirgends gekürzt wird - viele
 * dieser Wörter kürzen sehr wohl, nur eben woanders als erwartet. Die Übung
 * ist das genaue Hinsehen, nicht eine Regel zum Auswendiglernen. Die Zellen
 * kommen wie überall zur Laufzeit aus liblouis de-g2.
 *
 * Zwei Wörter der Quelle stehen NICHT hier, sondern bei den Strichen
 * (striche01): „ICE-Versuchsstrecke" und „USA-Versand" - bei ihnen ist der
 * Bindestrich nach einer Abkürzung der Gegenstand, nicht die Kürzung.
 */
export const GRENZFALL_LESSONS: KfaLesson[] = [
  {
    nr: 1, id: "grenz01",
    title: "Vorne im Wort: Vorsilbe oder Wortstamm?",
    bereich: "Grenzfälle am Wortanfang - eine Kürzung darf nie über die Grenze zwischen Vorsilbe und Wortstamm greifen",
    introDu:
      "Jetzt wird es knifflig, und genau das macht dich gut. Eine Kürzung gilt nur dort, wo die Buchstaben wirklich zusammengehören. In „abbringen\" gehört das b zum Stamm bringen, in „abringen\" aber nicht - da steht ab und dann ringen. Dasselbe bei Verena und Veranda: Das sieht nach der Vorsilbe ver aus, ist aber keine. Schreib diese Wörter langsam und denk bei jedem kurz nach, wo es auseinandergeht.",
    introSie:
      "Grenzfälle an der Morphemgrenze am Wortanfang: Kürzungen dürfen eine Präfix-Stamm-Grenze nicht überschreiten (abringen vs. abbringen, Ente vs. Enthusiasmus, Verena/Veranda/Vase vs. Verb). Quelle der Wortauswahl: Johannes' Liste „Wörter und Ausnahmen\"; alle Formen gegen liblouis de-g2 geprüft. Die Übung schult das Segmentieren, nicht das Auswendiglernen einer Ausnahmeliste.",
    units: us("grenzfall", [
      "abringen", "abbringen", "vorbeidrängen", "dazubleiben", "unproduktiv",
      "anprobieren", "unproblematisch", "Ente", "unentgeltlich", "Rente",
      "Enthusiasmus", "Entomologie", "Verena", "Veranda", "Vase", "Verb",
      "hinaus", "aus", "Haus", "Bistum", "Bison", "zuversichtlich", "Sehrest",
      "Nichtsportler", "Spracharten", "Sondernummer", "Emir", "Mirabelle",
    ]),
  },
  {
    nr: 2, id: "grenz02",
    title: "Mitten im Wort: sieht aus wie eine Kürzung",
    bereich: "Grenzfälle im Wortinneren - Buchstabenfolgen, die zufällig wie eine Kürzung aussehen, sowie x und q mit dem Aufhebungspunkt",
    introDu:
      "Manche Wörter tragen die Buchstaben einer Kürzung mitten in sich, ohne dass sie eine wären. Und bei Hexe, Lexikon und mexikanisch kommt etwas dazu, das dich überraschen wird: Dort steht vor dem x der Aufhebungspunkt, Punkt 6 - das Wort wird in Braille also sogar LÄNGER als in Druckschrift. Lass dich davon nicht aus der Ruhe bringen, das ist richtig so.",
    introSie:
      "Grenzfälle im Wortinneren: Buchstabenfolgen ohne Kürzungswert (fragil, Sago, Manna) sowie Formen mit Aufhebungspunkt vor x/q (Hexe = 5 Zellen bei 4 Buchstaben, Lexikon = 8 bei 7). Der Zellzuwachs gegenüber der Druckschrift ist regelkonform und für Lernende der häufigste Anlass zu zweifeln. Alle Formen gegen liblouis de-g2 geprüft.",
    units: us("grenzfall", [
      "Fragment", "fragil", "Eleganz", "nirgendwo", "Schlange", "schleicht",
      "Mannequin", "Manna", "Knochen", "dennoch", "Brücke", "Sago", "Lasso",
      "Salamander", "geschwollen", "Hexe", "mexikanisch", "Lexikon",
      "ex officio", "Hattrick", "hatte",
    ]),
  },
  {
    nr: 3, id: "grenz03",
    title: "Hinten im Wort: echte Nachsilbe oder Zufall?",
    bereich: "Grenzfälle am Wortende - die Nachsilbenkürzungen heit, mal, ung, nis, sam, schaft, icht und lich nur dort, wo wirklich die Nachsilbe steht",
    introDu:
      "Die Nachsilben-Kürzungen sind Gold wert, aber sie gelten nur für echte Nachsilben. In „Hoheit\" ist heit die Nachsilbe - in „heiter\" nicht, da ist es nur der Anfang. „Achtung\" endet auf ung, „Hunger\" sieht ähnlich aus und ist etwas ganz anderes. Ein Tipp: Sprich das Wort langsam mit und spür, ob du die Nachsilbe wirklich anhängst.",
    introSie:
      "Grenzfälle an der Stamm-Suffix-Grenze: die Suffixkürzungen greifen nur bei echtem Suffix (Hoheit/heiter/hoheitlich, Achtung/Hunger, Tennis/Nisse/Anis, Barschaft/Stiefelschaft, bricht/Trichter/töricht). Paarweise angeordnet, damit der Kontrast sichtbar wird. Alle Formen gegen liblouis de-g2 geprüft.",
    units: us("grenzfall", [
      "Hoheit", "heiter", "hoheitlich", "dezimal", "normal", "einmalig",
      "minimal", "schmal", "Schwung", "Achtung", "Hunger", "Tennis", "Nisse",
      "Anis", "Blumensamen", "Gesamtheit", "Stiefelschaft", "Barschaft",
      "Herrschaft", "Trichter", "bricht", "Kehricht", "töricht", "möglich",
      "Beschwerde",
    ]),
  },
  {
    nr: 4, id: "grenz04",
    title: "Nur an der richtigen Stelle",
    bereich: "Grenzfälle der Stellung - Kürzungen, die nur allein oder nur in bestimmter Umgebung gelten, dazu Fremdwort-Endungen und alte gegen neue Schreibung",
    introDu:
      "Zum Schluss die feinste Sorte. „Paragraf\" mit f kürzt auf zwei Zellen, „Paragraph\" mit ph nicht - die Schreibung entscheidet. „All\", „alle\", „Alltag\" und „Allegro\" fangen gleich an und gehen verschieden weiter. Und bei „möchte\" gegen „möcht'\" macht der Apostroph den Unterschied. Nimm dir hier ruhig mehr Zeit als sonst.",
    introSie:
      "Grenzfälle der Stellung und der Schreibung: stellungsgebundene Kürzungen (All/alle/Alltag/allgemein/Allegro, notfalls im Satz), Fremdwortendungen (ion, ismus - Religion kürzt, Spion nicht; Optimismus kürzt, Kürbismus nicht) sowie die Abhängigkeit von der Rechtschreibung (Paragraph 8 Zellen, Paragraf 2). Alle Formen gegen liblouis de-g2 geprüft.",
    units: us("grenzfall", [
      "Spion", "Union", "Religion", "Diskussion", "Kürbismus", "Optimismus",
      "überall", "All", "alle", "Alltag", "allgemein", "Allegro", "notfalls",
      "möchte", "Paragraph", "Paragraf",
    ]),
  },
];

/** Grenzfall-Lektion per id ("grenz01".."grenz04"). */
export function grenzfallLessonById(id: string): KfaLesson | undefined {
  return GRENZFALL_LESSONS.find((l) => l.id === id);
}
