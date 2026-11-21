/**
 * Marburger Mathematikschrift (6 Punkte) - vom Braillezeichen zur Rechenzeile.
 *
 * Quelle: „Das System der Mathematikschrift in der Deutschen Brailleschrift",
 * BSKDL, Beschlüsse Basel 30.11.2013, 1. Auflage 2015. Die Fundstellen stehen
 * an jeder Regel; die ausführliche Fassung liegt im PLUS-Ordner als
 * „Marburger Mathematikschrift - Spezifikation.md".
 *
 * ★ Der Unterschied zu `computerbraille.ts`, an dem alles hängt: dort ist ein
 * Zeichen ein Zeichen. Hier nicht. `⠼` ist kein Zeichen, sondern ein MODUS -
 * es schaltet `⠁` bis `⠚` von Buchstaben auf Ziffern um, läuft über Komma und
 * Gliederungspunkt weiter und endet an jedem Leerzeichen. `⠆` heißt gesenkte
 * Zwei ODER Bruchanfang, `⠶` heißt gleich ODER gesenkte Sieben. Welches, das
 * entscheidet allein der Zustand. Deshalb ist das hier ein Automat und keine
 * Tabelle.
 *
 * ★ Nichts ist geraten. Was im Regelwerk nicht steht, steht auch nicht hier -
 * es kommt als `?` zurück und als Hinweis dazu. Drei Stellen sind meine
 * Entscheidung und keine Regel; sie sind im Text als solche gekennzeichnet:
 * die Klammern um mehrgliedrige Exponenten, die Schreibweise `'w[3](` für die
 * dritte Wurzel und das Verwerfen der Schriftwechselzeichen am Rand.
 *
 * NICHT gebaut, weil ausserhalb der Schulstufen 1-8 (Abschnitt 9.9 der
 * Spezifikation): Mengenlehre, Logik, Pfeile, Integrale, Trigonometrie,
 * Vektoren, griechische und römische Zahlen, Währungssymbole, Platzhalter
 * (für die gibt es laut Kap. 15.1 gar keine Norm). Ebenfalls nicht: der
 * Apostroph `⠠` unmittelbar hinter dem Zahlzeichen (Kap. 2.1.1, Z. 1090) -
 * die Schweizer Tausendertrennung kommt in Plus nicht vor.
 */

/* ------------------------------------------------------------------ */
/* Die Tabellen                                                         */
/* ------------------------------------------------------------------ */

/** Ziffern in Standardschreibweise - gültig nur im Zahlmodus (Kap. 2.1.1). */
const STANDARD: Record<string, string> = {
  "⠁": "1", "⠃": "2", "⠉": "3", "⠙": "4", "⠑": "5",
  "⠋": "6", "⠛": "7", "⠓": "8", "⠊": "9", "⠚": "0",
};

/** Ziffern eine Punktreihe tiefer - Nenner, Exponent, Index (Kap. 2.1.2). */
const GESENKT: Record<string, string> = {
  "⠂": "1", "⠆": "2", "⠒": "3", "⠲": "4", "⠢": "5",
  "⠖": "6", "⠶": "7", "⠦": "8", "⠔": "9", "⠴": "0",
};

/** Umgekehrt: die Ziffer zu ihrer gesenkten Zelle - für den Schreiber. */
const GESENKT_ZU_ZELLE: Record<string, string> = Object.fromEntries(
  Object.entries(GESENKT).map(([zelle, ziffer]) => [ziffer, zelle]),
);

/** Lateinische Kleinbuchstaben (Abschnitt 7.3 der Spezifikation). */
const BUCHSTABEN: Record<string, string> = {
  "⠁": "a", "⠃": "b", "⠉": "c", "⠙": "d", "⠑": "e", "⠋": "f", "⠛": "g",
  "⠓": "h", "⠊": "i", "⠚": "j", "⠅": "k", "⠇": "l", "⠍": "m", "⠝": "n",
  "⠕": "o", "⠏": "p", "⠟": "q", "⠗": "r", "⠎": "s", "⠞": "t", "⠥": "u",
  "⠧": "v", "⠺": "w", "⠭": "x", "⠽": "y", "⠵": "z",
};

interface Fund {
  /** Was ausgegeben wird. Leer heißt: nur Zustand, keine Ausgabe. */
  text: string;
  /** Ein Operationszeichen bekommt ein Leerzeichen davor - `48 +27`. */
  op?: boolean;
  /** Wie viele Braillezellen verbraucht sind. */
  laenge: number;
}

/**
 * Zeichen aus mehreren Zellen. Sie werden VOR den Einzelzeichen geprüft -
 * aber erst, nachdem der Zustand eine gesenkte Ziffer ausgeschlossen hat.
 * Sonst würde der Nenner 37 (`⠒⠶`) als „definitionsgemäß gleich" gelesen
 * (Fallstrick F10 der Spezifikation).
 */
const MEHRZELLIG: Record<string, Fund> = {
  "⠸⠼⠚⠴⠴": { text: "%%", laenge: 5 },          // Promille, Kap. 4.2 Z. 2205
  "⠸⠼⠚⠴": { text: "%", laenge: 4 },            // Prozent, Kap. 4.2 Z. 2204
  "⠸⠈⠔⠔": { text: "''", laenge: 4 },           // Winkelsekunde, Kap. 4.3
  "⠸⠈⠴": { text: "°", laenge: 3 },             // Grad, Kap. 4.3 Z. 2219
  "⠸⠈⠔": { text: "'", laenge: 3 },             // Winkelminute, Kap. 4.3 Z. 2220
  "⠄⠄⠄": { text: "...", laenge: 3 },           // Auslassung, Bsp. 15.1 B01
  "⠐⠷": { text: "{", laenge: 2 },              // Kap. 6 Z. 2789
  "⠐⠾": { text: "}", laenge: 2 },
  "⠨⠷": { text: "<", laenge: 2 },              // spitze Klammer, Kap. 6 Z. 2791
  "⠨⠾": { text: ">", laenge: 2 },
  "⠠⠷": { text: "(", laenge: 2 },              // stumpfwinklig, Kap. 6 Z. 2793
  "⠠⠾": { text: ")", laenge: 2 },
  "⠈⠇": { text: "|", laenge: 2 },              // Betrag, Kap. 6 Z. 2825
  "⠈⠿": { text: "||", laenge: 2 },             // Doppelstrich, Kap. 6 Z. 2826
  "⠐⠦": { text: "*", op: true, laenge: 2 },    // Malstern, Kap. 5 Z. 2525
  "⠖⠤": { text: "+-", op: true, laenge: 2 },   // Kap. 5 Z. 2521
  "⠤⠖": { text: "-+", op: true, laenge: 2 },   // Kap. 5 Z. 2522
  "⠔⠶": { text: "!=", op: true, laenge: 2 },   // Kap. 5 Z. 2541
  "⠕⠶": { text: ">=", op: true, laenge: 2 },   // Kap. 5 Z. 2558
  "⠪⠶": { text: "<=", op: true, laenge: 2 },   // Kap. 5 Z. 2561
  "⠕⠂": { text: ">", op: true, laenge: 2 },    // Kap. 5 Z. 2516
  "⠪⠄": { text: "<", op: true, laenge: 2 },    // Kap. 5 Z. 2516
  "⠢⠢": { text: "~=", op: true, laenge: 2 },   // ungefähr, Kap. 5 Z. 2555
  "⠶⠶": { text: "==", op: true, laenge: 2 },   // identisch, Kap. 5 Z. 2542
  "⠒⠶": { text: ":=", op: true, laenge: 2 },   // Kap. 5 Z. 2546
  "⠠⠂": { text: ",", laenge: 2 },              // Satzkomma, Kap. 3.7 Z. 2085
  "⠠⠒": { text: ":", laenge: 2 },              // Satz-Doppelpunkt, Kap. 3.7
};

/** Die Längen, in denen mehrzellige Zeichen vorkommen - längste zuerst. */
const MEHRZELLIG_LAENGEN = [5, 4, 3, 2];

/* ------------------------------------------------------------------ */
/* Was herauskommt                                                      */
/* ------------------------------------------------------------------ */

export interface Hinweis {
  /** Die Stelle in der Eingabe, gezählt in Braillezellen ab 0. */
  stelle: number;
  /** Ein Satz für das Kind - kurz, ohne Vorwurf. */
  text: string;
}

export interface Lesung {
  /** Die Rechenzeile in der Schreibweise von Plus. */
  text: string;
  /** Was auffiel. Leer heißt: alles sauber gelesen. */
  hinweise: Hinweis[];
}

/**
 * Zwei Lesearten.
 *
 * `streng` ist der Normalfall: ohne Zahlzeichen sind `⠁` bis `⠚` Buchstaben.
 * `rechenblatt` ist der Ausnahmefall aus Anhang A1 (Z. 5812-5818): in
 * Rechenaufstellungen darf das Zahlzeichen fehlen, damit die Ziffernspalten
 * nicht verrutschen. Dort gelten `⠁` bis `⠚` immer als Ziffern - Variablen
 * sind in diesem Modus nicht lesbar, deshalb ist er kein Standard.
 */
export type Lesemodus = "streng" | "rechenblatt";

type ProjektivArt = "hoch" | "tief" | "wurzel";

interface Projektiv {
  art: ProjektivArt;
  /** 0 = einfach, 1 = `⠨` verstärkt, 2 = `⠐` verstärkt (Kap. 10.2). */
  stufe: 0 | 1 | 2;
  /** Wo der Inhalt in der Ausgabe beginnt. */
  start: number;
  /** Klammertiefe beim Öffnen - für „schließende Klammer beendet das Projektiv". */
  klammernBeimOeffnen: number;
  /** Steht im Projektiv bisher nur eine gesenkte Zahl (ggf. mit Minus)? */
  nurGesenkt: boolean;
  /** Ist überhaupt schon etwas drin? */
  inhalt: boolean;
}

/* ------------------------------------------------------------------ */
/* Der Automat                                                          */
/* ------------------------------------------------------------------ */

/**
 * Eine Brailleeingabe in die Rechenzeile übersetzen.
 *
 * Die Zielschreibweise ist die von Plus: `48 +27 =75`, Bruch `3/4`, Potenz
 * `2^3`, Wurzel `w(9)`, Leerzeichen vor dem Rechenzeichen, keines danach.
 * Dass die Marburger Schrift genau diese Asymmetrie kennt (Kap. 5, Z. 2639:
 * „Vor beinahe allen Operations- und Relationszeichen ist ein Leerzeichen zu
 * setzen, nach ihnen dagegen nicht"), ist kein Zufall - beide Schreibweisen
 * stammen aus derselben Tradition.
 */
export function leseMarburger(eingabe: string, modus: Lesemodus = "streng"): Lesung {
  const zellen = [...eingabe];
  const hinweise: Hinweis[] = [];
  const projektive: Projektiv[] = [];

  let aus = "";
  let zahlmodus = modus === "rechenblatt";
  let ziffern = 0;          // Ziffern seit dem Zahlzeichen
  let gesenkt = false;      // wir lesen gerade eine gesenkte Zahl
  let zusammenhalt = false; // das letzte Zeichen war `⠈`
  let strichZiffer = false; // hinter dem Bruchstrich fehlt das Zahlzeichen (F12)
  let gross: "aus" | "alle" | "eins" = "aus";
  let einheit = false;
  let klammern = 0;
  let brueche = 0;

  const merke = (stelle: number, text: string) => hinweise.push({ stelle, text });

  /** Steht am Ende der Ausgabe ein fertiger Term? Dann braucht das Zeichen Luft. */
  const termende = () => /[0-9a-zA-Z)\]}%!°'|]/.test(aus.slice(-1));

  const schreib = (s: string) => { aus += s; };

  /** Ein Rechenzeichen: Leerzeichen davor, keines danach - ausser am Termanfang. */
  const schreibOp = (s: string) => { aus += termende() ? " " + s : s; };

  const oben = () => (projektive.length ? projektive[projektive.length - 1] : null);

  /** Im laufenden Projektiv steht jetzt Inhalt. */
  const markiere = (gesenktBleibt = false) => {
    const p = oben();
    if (!p) return;
    p.inhalt = true;
    if (!gesenktBleibt) p.nurGesenkt = false;
  };

  /**
   * Braucht der Inhalt eines Exponenten Klammern?
   *
   * ★ Meine Entscheidung, keine Regel: die Schreibweise von Plus kennt nur
   * `2^3` und `x^2` - für `x^(n +1)` gibt es in den adaptierten Schulbüchern
   * keine belegte Form. Eine Zahl und ein einzelner Buchstabe bleiben deshalb
   * nackt, alles andere bekommt Klammern, damit nichts zusammenläuft.
   */
  const brauchtKlammer = (inhalt: string) =>
    inhalt.length > 1 && !/^-?\d+$/.test(inhalt) && !/^[a-zA-Z]$/.test(inhalt);

  const schliesseProjektiv = () => {
    const p = projektive.pop();
    if (!p) return;
    if (p.art === "wurzel") { schreib(")"); klammern = Math.max(0, klammern - 1); return; }
    const inhalt = aus.slice(p.start);
    if (brauchtKlammer(inhalt)) aus = aus.slice(0, p.start) + "(" + inhalt + ")";
  };

  /** Ein Leerzeichen, ein Bruchstrich, ein Zeilenende beenden jedes EINFACHE Projektiv. */
  const schliesseEinfache = () => {
    while (projektive.length && projektive[projektive.length - 1].stufe === 0) {
      schliesseProjektiv();
    }
  };

  const beendeZahl = () => {
    zahlmodus = modus === "rechenblatt";
    ziffern = 0;
    gesenkt = false;
  };

  /**
   * Welche Rolle hat dieses gesenkte Zeichen hier?
   *
   * Das ist der Kern des Automaten. `⠆` ist gesenkte Zwei oder Bruchanfang,
   * `⠶` ist Sieben oder Gleichheitszeichen - der Zustand entscheidet, und nur er.
   */
  const gesenkteRolle = (
    z: string, naechstes: string, zusammen: boolean,
  ): "nenner" | "projektiv" | "weiter" | null => {
    if (!GESENKT[z]) return null;
    if (zusammen) return null;               // `⠈` erzwingt die andere Lesart (F2)
    if (gesenkt || strichZiffer) return "weiter";
    const p = oben();
    if (p && p.art !== "wurzel" && p.nurGesenkt) return "projektiv";
    if (zahlmodus && ziffern > 0) {
      // `⠼⠊⠂⠆` ist 9/12, `⠼⠃⠂⠉⠙` ist 2,34 - ein Blick nach vorn trennt sie.
      if (z === "⠂" && !GESENKT[naechstes]) return null;
      return "nenner";
    }
    return null;
  };

  /** Eine gesenkte Zahl endet - und beendet damit ein einfaches Projektiv (F6). */
  const pruefeGesenktEnde = () => {
    const p = oben();
    if (p && p.stufe === 0 && p.art !== "wurzel" && p.inhalt && p.nurGesenkt) {
      schliesseProjektiv();
    }
  };

  /** Ein neues Projektiv beendet ein offenes einfaches (F7 - `⠩⠭⠌⠝` ist `w(x)^n`). */
  const weichtNeuemProjektiv = () => {
    const p = oben();
    if (p && p.stufe === 0 && p.inhalt) schliesseProjektiv();
  };

  const oeffneProjektiv = (art: ProjektivArt, stufe: 0 | 1 | 2, kopf: string) => {
    weichtNeuemProjektiv();
    markiere();
    schreib(kopf);
    projektive.push({
      art, stufe, start: aus.length, klammernBeimOeffnen: klammern,
      nurGesenkt: art !== "wurzel", inhalt: false,
    });
    beendeZahl();
  };

  for (let i = 0; i < zellen.length; i++) {
    const z = zellen[i];
    const naechstes = zellen[i + 1] ?? "";
    const zusammen = zusammenhalt;
    zusammenhalt = false;
    const strichVorher = strichZiffer;
    let grossBleibt = false;

    /* -- Die Ränder: Schriftwechsel ------------------------------------ */
    // ★ Meine Entscheidung: Kinder, die aus Braillebüchern abschreiben, tippen
    // die Zeichen mit. Im Rechenfeld ist der Modus ohnehin schon gesetzt
    // (Kap. 1.1.5: das Layout grenzt den Geltungsbereich ebenso ab), also
    // verwerfen statt anmeckern. Nur ganz am Rand - in der Mitte wäre `⠠⠄`
    // ein angekündigtes Satzzeichen.
    if (i === 0 && z === "⠐" && naechstes === "⠂") { i++; continue; }
    if (i === zellen.length - 2 && z === "⠠" && naechstes === "⠄") { i++; continue; }

    /* -- 1. Gesenkte Ziffern: sie haben Vorrang vor jeder Tabelle ------- */
    const rolle = gesenkteRolle(z, naechstes, zusammen);
    if (rolle) {
      if (rolle === "nenner") schreib("/");
      strichZiffer = false;
      schreib(GESENKT[z]);
      markiere(true);
      gesenkt = true;
      continue;
    }

    // Ab hier ist es keine gesenkte Ziffer - eine laufende endet also.
    if (gesenkt) { pruefeGesenktEnde(); gesenkt = false; }

    /* -- 2. Mehrzellige Zeichen, längste zuerst ------------------------- */
    // Auch hier entscheidet der Zustand zuerst: in einem eben geöffneten
    // Exponenten ist `⠤⠖` kein Minus-Plus, sondern das Minus der gesenkten
    // Sechs - `10^-6`. Die Tabelle würde den längeren Treffer nehmen (F16).
    const imGesenkten = (() => {
      const p = oben();
      return !!p && p.art !== "wurzel" && p.nurGesenkt && !p.inhalt;
    })();
    let gefunden: Fund | null = null;
    if (imGesenkten && z === "⠤" && GESENKT[naechstes]) gefunden = null;
    else for (const laenge of MEHRZELLIG_LAENGEN) {
      const folge = zellen.slice(i, i + laenge).join("");
      if (folge.length === laenge && MEHRZELLIG[folge]) { gefunden = MEHRZELLIG[folge]; break; }
    }
    if (gefunden) {
      pruefeGesenktEnde();
      beendeZahl();
      markiere();
      if (gefunden.op) schreibOp(gefunden.text);
      else if (gefunden.text === "%" || gefunden.text === "%%" || gefunden.text === "°") {
        // Die Einheit hängt in Braille am Wert, in der Schreibweise von Plus
        // steht ein Leerzeichen dazwischen: `25 %` (Kap. 4.1, Z. 2168).
        schreib(termende() ? " " + gefunden.text : gefunden.text);
      } else {
        if (gefunden.text === "(" || gefunden.text === "{") klammern++;
        if (gefunden.text === ")" || gefunden.text === "}") klammern = Math.max(0, klammern - 1);
        schreib(gefunden.text);
      }
      i += gefunden.laenge - 1;
      continue;
    }

    /* -- 3. Die Wurzel mit Wurzelexponent: `⠌` + gesenkte Ziffer + `⠩` -- */
    // Kap. 10.4, Z. 4783: „Zahlen, die anzeigen, dass es sich um eine dritte,
    // vierte oder andere Wurzel handelt, werden als vordere obere Indizes am
    // Wurzelzeichen dargestellt."
    if (z === "⠌" && GESENKT[naechstes]) {
      const drittes = zellen[i + 2] ?? "";
      const viertes = zellen[i + 3] ?? "";
      let stufe: 0 | 1 | 2 | null = null;
      let weiter = 0;
      if (drittes === "⠩") { stufe = 0; weiter = 2; }
      else if (drittes === "⠨" && viertes === "⠩") { stufe = 1; weiter = 3; }
      else if (drittes === "⠐" && viertes === "⠩") { stufe = 2; weiter = 3; }
      if (stufe !== null) {
        // ★★★ `'w[3](27)` ist die Schreibweise der Bücher, nicht meine -
        // Johannes hat sie am 23.09.2026 aus der Zeichenerklärung belegt:
        // „'w()  Quadratwurzel aus ( ); 'w[n]()  n-te Wurzel aus ( )".
        // Der eine andere App der Plattform  schreibt sie seit jeher genauso (§5).
        oeffneProjektiv("wurzel", stufe, `'w[${GESENKT[naechstes]}](`);
        klammern++;
        i += weiter;
        continue;
      }
    }

    /* -- 4. Verstärkte Projektive und ihre Schlusszeichen --------------- */
    if ((z === "⠨" || z === "⠐") && (naechstes === "⠩" || naechstes === "⠌" || naechstes === "⠡" || naechstes === "⠱")) {
      const stufe: 1 | 2 = z === "⠨" ? 1 : 2;
      if (naechstes === "⠱") {
        // Schlusszeichen: erst alles Einfache darüber, dann die eigene Ebene.
        schliesseEinfache();
        const p = oben();
        if (p && p.stufe === stufe) schliesseProjektiv();
        else merke(i, "Hier schließt ein Zeichen, das nichts offen hat.");
      } else if (naechstes === "⠩") {
        oeffneProjektiv("wurzel", stufe, "'w(");
        klammern++;
      } else {
        oeffneProjektiv(naechstes === "⠌" ? "hoch" : "tief", stufe, naechstes === "⠌" ? "^" : "_");
      }
      i++;
      continue;
    }

    /* -- 5. Sammelschlüsse ---------------------------------------------- */
    if (z === "⠿" && naechstes === "⠰") {           // alle Brüche, Kap. 9.4
      while (brueche > 0) { schreib(")"); brueche--; klammern = Math.max(0, klammern - 1); }
      beendeZahl();
      i++;
      continue;
    }
    if (z === "⠿" && naechstes === "⠱") {           // alle Projektive, Kap. 10
      while (projektive.length) schliesseProjektiv();
      beendeZahl();
      i++;
      continue;
    }

    /* -- 6. Die Einzelzeichen ------------------------------------------- */
    switch (z) {
      /* --- Steuerzeichen ohne Ausgabe --- */
      case "⠼": {                                    // Zahlzeichen, Kap. 2.1.1
        if (zahlmodus && ziffern > 0) {
          // F13: die gemischte Zahl trägt zwei Zahlzeichen. `⠼⠙⠼⠁⠲` ist 4 1/4,
          // nicht 41/4 - wer das zweite überliest, verrechnet sich um Faktor 10.
          schreib(" ");
          ziffern = 0;
        } else {
          zahlmodus = true;
          ziffern = 0;
        }
        // Ein `⠼` ganz am Ende ist die Leerstelle für das Ergebnis
        // (Kap. 2.1.6, Anmerkung zu B07, Z. 1432) - es schreibt nichts.
        break;
      }
      case "⠈": {                                    // Zusammenhaltepunkt, Kap. 1.2
        zusammenhalt = true;                         // ersetzt ein Leerzeichen,
        break;                                       // ohne einen Modus zu beenden
      }
      case "⠠": {                                    // Ankündigung, Kap. 3.2
        beendeZahl();                                // was folgt, ist Buchstabe
        break;                                       // oder Satzzeichen
      }
      case "⠘": {                                    // Grossbuchstaben, Kap. 3.1
        gross = "alle";
        grossBleibt = true;
        beendeZahl();
        break;
      }
      case "⠨": {                                    // ein Grosser, dann Kleine
        gross = "eins";
        grossBleibt = true;
        beendeZahl();
        break;
      }
      case "⠸": {                                    // Einheitenkennzeichen, Kap. 4.1
        beendeZahl();
        if (termende()) schreib(" ");
        einheit = true;
        grossBleibt = true;
        break;
      }

      /* --- Leerzeichen: es trägt Bedeutung (F19) --- */
      case "⠀": {
        schliesseEinfache();
        beendeZahl();
        einheit = false;
        if (aus.length && !aus.endsWith(" ")) schreib(" ");
        break;
      }

      /* --- Rechenzeichen --- */
      case "⠖": { pruefeGesenktEnde(); markiere(); beendeZahl(); schreibOp("+"); break; }
      case "⠤": {                                    // Minus oder Füllstrich (F20)
        const p = oben();
        const fuellstrich = zellen[i - 1] === "⠼" || (zahlmodus && aus.endsWith(","));
        if (fuellstrich) {
          schreib("-");                              // `100,-` - kein Vorzeichen
        } else if (p && !p.inhalt) {
          markiere(true);                            // `x^-3`: Minus im Exponenten
          schreib("-");                              // bleibt bei der gesenkten Zahl
        } else {
          pruefeGesenktEnde();
          markiere();
          beendeZahl();
          schreibOp("-");
        }
        break;
      }
      case "⠦": { pruefeGesenktEnde(); markiere(); beendeZahl(); schreibOp("*"); break; } // Malkreuz
      case "⠒": { pruefeGesenktEnde(); markiere(); beendeZahl(); schreibOp("/"); break; } // geteilt durch
      case "⠶": { pruefeGesenktEnde(); markiere(); beendeZahl(); schreibOp("="); break; }
      case "⠫": {                                    // Fakultät, Kap. 5 Z. 2665
        if (BUCHSTABEN[naechstes]) {
          merke(i, "Funktionsnamen wie log oder sin kennt Plus noch nicht.");
          schreib("?");
        } else {
          markiere();
          schreib("!");
        }
        beendeZahl();
        break;
      }
      case "⠲": {                                    // gestrichenes Divisionszeichen
        // Kap. 5, Hinweis Z. 2694: aus dem Zeichenbestand gestrichen. Ältere
        // Bücher haben es noch - lesen ja, selbst schreiben nie.
        merke(i, "Das alte Geteiltzeichen gilt nicht mehr. Nimm den Doppelpunkt.");
        markiere();
        beendeZahl();
        schreibOp("/");
        break;
      }
      case "⠄": {                                    // Punkt 3: fünf Bedeutungen (F4)
        if (zahlmodus && ziffern > 0 && STANDARD[naechstes]) {
          // Gliederungszeichen. Plus schreibt keine Tausendertrennung - also
          // nichts ausgeben und den Zahlmodus weiterlaufen lassen (Kap. 2.1.5).
        } else {
          pruefeGesenktEnde();
          markiere();
          beendeZahl();
          schreibOp("*");                            // Malpunkt, Kap. 5 Z. 2511
        }
        break;
      }
      case "⠂": {                                    // Dezimalkomma, Kap. 2.1.3
        if (zahlmodus) { schreib(","); }             // der Zahlmodus überlebt es
        else { merke(i, "Ein Komma ohne Zahl davor."); schreib("?"); }
        break;
      }

      /* --- Klammern --- */
      case "⠣": {                                    // rund auf, Kap. 6 Z. 2785
        markiere();
        klammern++;
        schreib("(");
        // Im Zahlmodus ist es die Periodenklammer - der Modus läuft weiter
        // (Kap. 2.1.1, Z. 1090). Sonst beginnt hier ein neuer Term.
        if (!(zahlmodus && ziffern > 0)) beendeZahl();
        break;
      }
      case "⠜": {                                    // rund zu
        // Kap. 10.1: eine schliessende Klammer beendet ein Projektiv, wenn die
        // öffnende nicht mit drin war.
        pruefeGesenktEnde();
        const p = oben();
        if (p && p.stufe === 0 && p.klammernBeimOeffnen >= klammern) schliesseProjektiv();
        klammern = Math.max(0, klammern - 1);
        beendeZahl();
        schreib(")");
        break;
      }
      case "⠷": { markiere(); klammern++; beendeZahl(); schreib("["); break; }
      case "⠾": { klammern = Math.max(0, klammern - 1); beendeZahl(); schreib("]"); break; }

      /* --- Brüche --- */
      case "⠳": {                                    // Bruchstrich, Kap. 9.2
        schliesseEinfache();
        beendeZahl();
        markiere();
        schreib("/");
        // F12: nach jedem Strich braucht eine Zahl wieder ein Zahlzeichen.
        if (GESENKT[naechstes] && !STANDARD[naechstes]) {
          merke(i + 1, "Nach dem Bruchstrich gehört ein Zahlzeichen vor die Zahl.");
          strichZiffer = true;                       // trotzdem lesen, nicht raten
        }
        break;
      }
      case "⠆": {                                    // Bruchanfang, Kap. 9.3
        markiere();
        brueche++;
        klammern++;
        beendeZahl();
        schreib("(");
        break;
      }
      case "⠰": {                                    // Bruchende - oder Griechisch (F3)
        if (brueche > 0) {
          brueche--;
          klammern = Math.max(0, klammern - 1);
          beendeZahl();
          schreib(")");
        } else {
          merke(i, "Griechische Buchstaben kennt Plus nicht.");
          schreib("?");
        }
        break;
      }

      /* --- Potenz, Index, Wurzel --- */
      case "⠌": { oeffneProjektiv("hoch", 0, "^"); break; }
      case "⠡": { oeffneProjektiv("tief", 0, "_"); break; }
      case "⠩": { oeffneProjektiv("wurzel", 0, "'w("); klammern++; break; }
      case "⠱": {                                    // Schlusszeichen, Kap. 10.1
        const p = oben();
        if (p && p.stufe === 0) schliesseProjektiv();
        else merke(i, "Hier schließt ein Zeichen, das nichts offen hat.");
        break;
      }

      /* --- Ziffern und Buchstaben --- */
      default: {
        if (zahlmodus && STANDARD[z]) {
          markiere();
          schreib(STANDARD[z]);
          ziffern++;
          break;
        }
        const b = BUCHSTABEN[z];
        if (b) {
          markiere();
          beendeZahl();
          if (einheit) { schreib(b); grossBleibt = true; break; }
          if (gross === "alle") { schreib(b.toUpperCase()); grossBleibt = true; break; }
          if (gross === "eins") { schreib(b.toUpperCase()); break; }
          schreib(b);
          break;
        }
        merke(i, "Dieses Zeichen kennt Plus nicht.");
        schreib("?");
        beendeZahl();
      }
    }

    if (strichVorher && strichZiffer) strichZiffer = false;
    if (!grossBleibt) gross = "aus";
    if (z !== "⠸" && !BUCHSTABEN[z] && z !== "⠈") einheit = false;
  }

  /* -- Was offen blieb ------------------------------------------------- */
  while (projektive.length) schliesseProjektiv();
  while (brueche > 0) { schreib(")"); brueche--; }
  if (klammern > 0) merke(zellen.length, "Eine Klammer ist noch offen.");

  return { text: aus.trimEnd(), hinweise };
}

/** Die Kurzform, wenn nur der Text gebraucht wird. */
export function marburgerZuText(eingabe: string, modus: Lesemodus = "streng"): string {
  return leseMarburger(eingabe, modus).text;
}

/* ------------------------------------------------------------------ */
/* Der Weg zurück                                                       */
/* ------------------------------------------------------------------ */

const ZU_STANDARD: Record<string, string> = {
  "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙", "5": "⠑",
  "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊", "0": "⠚",
};

const ZU_GESENKT: Record<string, string> = {
  "1": "⠂", "2": "⠆", "3": "⠒", "4": "⠲", "5": "⠢",
  "6": "⠖", "7": "⠶", "8": "⠦", "9": "⠔", "0": "⠴",
};

const ZU_BUCHSTABE: Record<string, string> = Object.fromEntries(
  Object.entries(BUCHSTABEN).map(([braille, buchstabe]) => [buchstabe, braille]),
);

/** Die Einheiten von Plus, längste zuerst - `min` darf nicht als `m` enden. */
const EINHEITEN = [
  "Cent", "EUR", "dag", "min", "cm", "dm", "km", "mm", "ml", "kg",
  "t", "g", "m", "l", "h", "s",
];

/**
 * Eine Rechenzeile in Marburger Braille schreiben - oder `null`.
 *
 * ★ Wozu das gut ist: es ist die Gegenprobe. Jede Aufgabe, die der Generator
 * baut, wird geschrieben und wieder gelesen; kommt nicht dasselbe heraus,
 * würde ein Kind, das richtig tippt, eine falsche Rückmeldung bekommen. Der
 * Test misst das über alle Pakete, statt es zu behaupten.
 *
 * `null` heißt: diese Zeile kann der Schreiber nicht - Wörter, Platzhalter
 * `[]` (für die gibt es laut Kap. 15.1 gar keine Norm), Spaltentrenner. Das
 * ist Absicht und wird gemessen, nicht überspielt.
 */
export function schreibeMarburger(zeile: string): string | null {
  let aus = "";
  let i = 0;
  const klammern: Array<"rund" | "wurzel"> = [];
  const buchstabenFolge = (w: string) => [...w].map((c) => ZU_BUCHSTABE[c.toLowerCase()] ?? "").join("");
  const gesenkteFolge = (n: string) => [...n].map((c) => ZU_GESENKT[c]).join("");
  const standardFolge = (n: string) => [...n].map((c) => ZU_STANDARD[c]).join("");

  /** Steht hier eine Einheit? Dann klebt sie in Braille am Wert (Kap. 4.1). */
  const einheitAb = (stelle: number): string | null => {
    for (const e of EINHEITEN) {
      if (zeile.startsWith(e, stelle) && !/[a-zA-Z]/.test(zeile[stelle + e.length] ?? "")) return e;
    }
    return null;
  };

  while (i < zeile.length) {
    const z = zeile[i];

    if (z === " ") {
      // Vor Einheit und Prozent kein Leerzeichen: sie schliessen an den Wert an.
      const naechstes = zeile[i + 1] ?? "";
      if (naechstes === "%" || einheitAb(i + 1)) { i++; continue; }
      aus += "⠀";
      i++;
      continue;
    }

    // ★ Die n-te Wurzel: das Apostroph trägt kein eigenes Braillezeichen - es
    // weist auf der Zeile nur aus, dass eine Buchstabenfolge ein Rechenzeichen
    // ist. Die Mathematikschrift hat dafür ihr eigenes Zeichen.
    const nteWurzel = /^'w\[(\d)\]\(/.exec(zeile.slice(i));
    if (nteWurzel) {
      aus += `⠌${GESENKT_ZU_ZELLE[nteWurzel[1]]}⠨⠩`;
      klammern.push("wurzel");
      i += nteWurzel[0].length;
      continue;
    }
    if (zeile.startsWith("'w(", i)) { aus += "⠨⠩"; klammern.push("wurzel"); i += 3; continue; }
    if (z === "(") { aus += "⠣"; klammern.push("rund"); i++; continue; }
    if (z === ")") {
      // Die verstärkte Wurzel braucht ihr Schlusszeichen (Kap. 10.2, Z. 4367).
      aus += klammern.pop() === "wurzel" ? "⠨⠱" : "⠜";
      i++;
      continue;
    }
    if (z === "{") { aus += "⠐⠷"; klammern.push("rund"); i++; continue; }
    if (z === "}") { aus += "⠐⠾"; klammern.pop(); i++; continue; }
    if (z === ">") { aus += "⠕⠂"; i++; continue; }
    if (z === "<") { aus += "⠪⠄"; i++; continue; }
    if (z === "%") { aus += "⠸⠼⠚⠴"; i++; continue; }

    if (z === "^") {
      i++;
      let vorzeichen = "";
      if (zeile[i] === "-") { vorzeichen = "⠤"; i++; }
      const hoch = /^\d+/.exec(zeile.slice(i));
      if (!hoch) return null;
      aus += "⠌" + vorzeichen + gesenkteFolge(hoch[0]);
      i += hoch[0].length;
      continue;
    }

    if (z === "+" || z === "-" || z === "*" || z === "=") {
      aus += { "+": "⠖", "-": "⠤", "*": "⠄", "=": "⠶" }[z];
      i++;
      continue;
    }
    if (z === "/") {
      // `56 /8` ist eine Division (Doppelpunkt `⠒`), `2a/12a` ein Bruch
      // (Bruchstrich `⠳`). Das Leerzeichen davor trennt die beiden - dieselbe
      // Unterscheidung, die auch die Vorlesefunktion trifft.
      aus += zeile[i - 1] === " " ? "⠒" : "⠳";
      i++;
      continue;
    }

    const zahl = /^(\d+)(?:,(\d+))?/.exec(zeile.slice(i));
    if (zahl) {
      const rest = zeile.slice(i + zahl[0].length);
      const bruch = !zahl[2] && /^\/\d+(?![\d,])/.exec(rest);
      const gemischt = !zahl[2] && /^ (\d+)\/(\d+)(?![\d,])/.exec(rest);
      if (gemischt) {
        // F13: beide Teile tragen ein Zahlzeichen, dazwischen kein Leerzeichen.
        aus += "⠼" + standardFolge(zahl[1]) + "⠼" + standardFolge(gemischt[1]) + gesenkteFolge(gemischt[2]);
        i += zahl[0].length + gemischt[0].length;
      } else if (bruch) {
        aus += "⠼" + standardFolge(zahl[1]) + gesenkteFolge(bruch[0].slice(1));
        i += zahl[0].length + bruch[0].length;
      } else {
        aus += "⠼" + standardFolge(zahl[1]) + (zahl[2] ? "⠂" + standardFolge(zahl[2]) : "");
        i += zahl[0].length;
      }
      // Ein Buchstabe a bis j würde jetzt als weitere Ziffer gelesen (Kap. 3.2).
      if (/^[a-j]/.test(zeile.slice(i))) aus += "⠠";
      continue;
    }

    const einheit = einheitAb(i);
    if (einheit) {
      aus += "⠸";
      if (einheit === "EUR") aus += "⠘";
      else if (einheit === "Cent") aus += "⠨";
      aus += buchstabenFolge(einheit);
      i += einheit.length;
      continue;
    }

    if (/[a-z]/.test(z) && !/[a-z]/.test(zeile[i + 1] ?? "")) {
      aus += ZU_BUCHSTABE[z];
      i++;
      continue;
    }

    // ★ Der Doppelpunkt im Verhältnis (`3 : 7`) fehlt mit Absicht: das
    // Regelwerk kennt dafür nur `⠒` - dasselbe Zeichen wie „geteilt durch"
    // (Kap. 5, Z. 2512). Wer ihn schriebe, könnte ihn nicht zurücklesen.
    // Für das Eingabefeld heißt das: bei Verhältnis-Aufgaben muss die Antwort
    // beide Schreibweisen gelten lassen.
    return null;   // Wörter, Platzhalter, Spalten, Aufzählungen mit Strichpunkt.
  }

  return aus;
}
