/// <reference path="../pb_data/types.d.ts" />
//
// Braille-Klassenmatch - Konstanten und Regeln, die MEHRERE Handler brauchen
// (Zubau 22.09.2026, Verdrahtung der Datenschicht aus `klassenmatch.ts`)
// ==============================================================================
// ★★★★★ WARUM EINE EIGENE DATEI: Ein PocketBase-Handler (`onRecordCreateRequest`,
// `onRecordUpdateRequest`, `cronAdd`) läuft in einem eigenen Gültigkeitsbereich
// und sieht NICHTS aus dem Kopf seiner Datei - keine Konstante, keine Funktion
// ([[reference_pocketbase_hook_scope]]). Gemessen am Live-Server bei
// Tastenflows Klassenmatch, 11.09.2026, 17:51: `ReferenceError:
// BR_MATCH_DAUER_MIN is not defined` beim ersten echten Klick. Dieselbe Bauart
// wie dort (`tt_match_lib.pb.js`) - jeder Handler holt sich diese Datei selbst:
// `const L = require(`${__hooks}/br_match_lib.pb.js`)`. Innerhalb DIESER Datei
// dürfen sich die Funktionen gegenseitig sehen - `require` wertet sie als
// Ganzes aus.
//
// ⚠️ ZWEI ÜBERGÄNGE-TABELLEN, EINE WAHRHEIT: Diese Konstanten spiegeln
// `BR_MATCH_DAUER_MIN`/`MATCH_COUNTDOWN_MS`/`MATCH_UEBERGAENGE` aus
// `src/lib/braille/klassenmatch.ts` (dort die REINE Logik, ungeändert - siehe
// Dateihoheit im Bau-Bericht). Wer dort etwas an Zustand, Frist oder Übergang
// ändert, ändert es HIER genauso - der Wächter
// `tests/braille-match-hook.test.ts` lädt diese Datei wie goja sie sieht und
// vergleicht sie funktional gegen `klassenmatch.ts`.
//
// ⚠️ Der Name muss auf `.pb.js` enden, sonst kopiert der Deploy-Glob sie nicht.
// ⚠️ `module` gibt es nur beim `require`; beim Auto-Laden als Hook ist es
//    undefined - darum der Guard ganz unten.

/** Dauer eines Matches in Minuten - `BR_MATCH_DAUER_MIN` in `klassenmatch.ts`. */
/* ★★★★★ ALLE Namen in dieser Datei tragen das Praefix `BR_`/`br` - und das ist
   kein Schoenheitsfehler, sondern Pflicht. PocketBase laedt ALLE Hook-Dateien in
   EINEN globalen Namensraum. Ohne Praefix kollidierten `MATCH_DAUER_MIN`,
   `COUNTDOWN_MS`, `UEBERGAENGE`, `standVomServer`, `matchMussEsGeben` mit
   `tt_match_lib.pb.js` (Tastenflow), und PocketBase brach die Datei beim Laden
   ab: „SyntaxError: Identifier 'MATCH_DAUER_MIN' has already been declared".
   ⚠️ GEMESSEN am 22.09.2026 beim ersten Deploy - der Hook war stillschweigend
   tot, die Seite lief weiter. Wer hier einen Namen ohne Praefix ergaenzt,
   legt den ganzen Braille-Klassenmatch lahm, ohne dass es auffaellt. */
const BR_MATCH_DAUER_MIN = 5;
/** Countdown vor dem Start - `MATCH_COUNTDOWN_MS` in `klassenmatch.ts`. */
const BR_COUNTDOWN_MS = 10 * 1000;

/**
 * Erlaubte Übergänge - alles andere wird abgewiesen. ⚠️ ANDERS ALS
 * Tastenflows `tt_match_lib.pb.js`: dort darf `countdown` auch direkt nach
 * `fertig` (ein Rest aus dem alten Ablauf dort) - `klassenmatch.ts` (Punktgenau)
 * kennt diesen Übergang NICHT (`MATCH_UEBERGAENGE`), darum fehlt er hier
 * bewusst. Der Cron weiter unten darf ein abgelaufenes „countdown"-Match
 * trotzdem auf „fertig" setzen - er schreibt über `$app.save()` direkt am
 * Modell vorbei an dieser Tabelle (die gilt nur für Anfragen von Kindern).
 */
const BR_UEBERGAENGE = {
  einladung: ["countdown", "abgebrochen"],
  countdown: ["laeuft", "abgebrochen"],
  laeuft: ["fertig", "abgebrochen"],
  fertig: [],
  abgebrochen: [],
};

// --- Stand-Zeilen: die Zeit UND DER NAME gehören dem Server -----------------
// Dieselbe Begründung wie bei Tastenflow (`tt_match_lib.pb.js`): Die ZAHLEN
// darf das Kind schreiben (die Regeln in `setup.mjs` lassen nur SEINE Zeile
// in SEINER Klasse zu, und der Spielstand wird nach einer Stunde gelöscht -
// F10). Der NAME ist die Ausnahme: er kommt aus dem Kind-Datensatz, nie aus
// dem Rumpf - sonst könnte ein Kind unter fremdem Namen in der Rangliste der
// ganzen Klasse stehen.
function brStandVomServer(e) {
  let kind = null;
  try {
    const auth = e.auth;
    if (auth && auth.collection().name === "_superusers") {
      e.next();
      return true;
    }
    if (auth && auth.collection().name === "tt_pupils") kind = auth;
  } catch (_) {
    kind = null;
  }
  e.record.set("updatedMs", Date.now());
  // Ohne Kind-Anmeldung kommt hier ohnehin niemand durch (die Regeln), aber
  // fail-closed ist billiger als eine Annahme: kein Konto, kein Name.
  e.record.set("name", kind ? String(kind.getString("name") || "") : "");
  return false;
}

// ★★★ ZU JEDER STAND-ZEILE MUSS ES DAS MATCH GEBEN - dieselbe Absicherung wie
// bei Tastenflow (dort am 11.09.2026 nachgezogen): Die createRule von
// `br_match_stand` prüft `pupilUid` und `classCode`, aber nicht `matchId`.
// Ohne diese Prüfung könnte ein Kind Zeilen zu frei erfundenen Kennungen
// anlegen - für niemanden sichtbar (gelesen wird nach `matchId` gefiltert)
// und vom Cron nie aufgeräumt (der räumt ausschliesslich über SEIN Match ab).
// Reines Wachstum in einer Datenbank, das niemand mehr findet.
function brMatchMussEsGeben(e) {
  let kind = null;
  try {
    const auth = e.auth;
    if (auth && auth.collection().name === "tt_pupils") kind = auth;
  } catch (_) {
    kind = null;
  }
  if (!kind) return; // ohne Kind kommt hier niemand durch (createRule)

  const matchId = String(e.record.getString("matchId") || "").trim();
  if (!matchId) throw new BadRequestError("Zu dieser Zeile gibt es kein Klassenmatch.");

  let match = null;
  try {
    match = e.app.findRecordById("br_matches", matchId);
  } catch (err) {
    match = null;
  }
  if (!match) throw new BadRequestError("Dieses Klassenmatch gibt es nicht (mehr).");

  const meine = String(kind.getString("classCode") || "");
  if (String(match.getString("classCode") || "") !== meine) {
    throw new BadRequestError("Dieses Klassenmatch gehört zu einer anderen Klasse.");
  }

  const status = String(match.getString("status") || "");
  if (status === "fertig" || status === "abgebrochen") {
    throw new BadRequestError("Dieses Klassenmatch ist schon vorbei.");
  }
}

/**
 * Hat die Lehrkraft das Klassenmatch für diese Klasse abgeschaltet? Anders
 * als bei Tastenflow (eigene Spalte `tt_classes.klassenmatchAus`) liegt das
 * Häkchen bei Punktgenau IM JSON-Topf `tt_classes.settings.punktgenau.
 * klassenmatchAus` (`account.ts`, `setChallengePlan`/`setKlassenmatchAus`) -
 * ein eigenes Feld je Programm im selben Topf, siehe
 * [[feedback_zwei_stellen_die_voneinander_nichts_wissen]]. `getString` liefert
 * ein JSON-Feld nur als TEXT ([[reference_pocketbase_hook_scope]]-Fallstrick
 * Nummer zwei) - darum `JSON.parse` statt direktem Feldzugriff.
 *
 * ⚠️ FAIL-OPEN wie beim Vorbild: Lässt sich die Klasse nicht lesen, gilt
 * „erlaubt" - eine kaputte Abfrage darf einem Kind nicht das Spiel nehmen.
 */
function brKlassenmatchAbgeschaltet(app, classCode) {
  try {
    const klasse = app.findFirstRecordByFilter("tt_classes", "code = {:c}", { c: classCode });
    if (!klasse) return false;
    const settings = JSON.parse(String(klasse.getString("settings") || "{}"));
    return !!(settings && settings.punktgenau && settings.punktgenau.klassenmatchAus === true);
  } catch (_) {
    return false;
  }
}

// --- EIN KIND, EIN MATCH (02.10.2026) ---------------------------------------
// Nachgezogen aus Tastenflow (`tt_match_lib.pb.js`, `einKindEinMatch`), Johannes
// für Punktgenau: „ja, mach Punktgenau genauso". Klasse CSS6, 02.10.2026: ein
// Kind legte zwei Matches im Abstand von 13 Sekunden an, drei Kinder steckten
// in zwei Matches zugleich. Mehrere Matches je Klasse bleiben erlaubt - aber
// EIN Kind steckt in höchstens EINEM offenen Match, als Gastgeber oder mit
// einer Zeile auf `dabei`/`schreibt`.
//
// ★★★ Das Gerät prüft dasselbe (`useBrailleKlassenmatch`), aber es weiss es
// nur, solange die Seite offen ist - nach einem Neuladen nicht sicher. Das
// NETZ ist darum hier. Die Sätze stehen wortgleich in
// `src/lib/braille/klassenmatch.ts` (`MATCH_SPERRE_*`, ein Wächter vergleicht).
//
// ⚠️ ALLE Namen mit `BR_`/`br` (siehe oben: EIN globaler Namensraum mit
// `tt_match_lib.pb.js`, das `einKindEinMatch`, `standSperre`, `nimmtTeil`,
// `offenAmServer`, `SPERRE_*` schon trägt).
// ⚠️ FAIL-OPEN bei einem Lesefehler (wie `brKlassenmatchAbgeschaltet`): Eine
// kaputte Abfrage darf einem Kind nicht das Spiel nehmen.
const BR_SPERRE_GASTGEBER =
  "Du hast schon ein Klassenmatch ausgeschrieben, das noch offen ist. Ein zweites geht erst, wenn es vorbei ist.";
const BR_SPERRE_DABEI =
  "Du bist schon in einem anderen Klassenmatch dabei. Ein zweites geht erst, wenn es vorbei ist.";

/** Offen = Einladung, oder Countdown/Lauf, dessen Ende noch nicht vorbei ist. */
function brOffenAmServer(match, jetzt) {
  const status = String(match.getString("status") || "");
  if (status === "einladung") return true;
  if (status !== "countdown" && status !== "laeuft") return false;
  const ende = match.getFloat("endeMs");
  return !(ende > 0) || ende > jetzt;
}

// Leer heisst „frei", sonst der Satz, mit dem abgewiesen wird.
// `ausserMatchId`: das Match, um das es gerade geht (beim Beitreten).
function brEinKindEinMatch(app, kindId, classCode, ausserMatchId) {
  const jetzt = Date.now();
  // 1) Gastgeber eines anderen offenen Matches?
  let gehostet = [];
  try {
    gehostet = app.findRecordsByFilter(
      "br_matches",
      "classCode = {:c} && hostUid = {:k} && (status = 'einladung' || status = 'countdown' || status = 'laeuft')",
      "",
      50,
      0,
      { c: classCode, k: kindId },
    );
  } catch (err) {
    gehostet = [];
  }
  for (const m of gehostet) {
    if (m.id === ausserMatchId || !brOffenAmServer(m, jetzt)) continue;
    // Wer sein eigenes Match mittendrin verlassen hat (eigene Zeile `fertig`),
    // ist frei - die anderen spielen weiter.
    let eigene = null;
    try {
      eigene = app.findFirstRecordByFilter(
        "br_match_stand",
        "matchId = {:m} && pupilUid = {:k}",
        { m: m.id, k: kindId },
      );
    } catch (err) {
      eigene = null;
    }
    if (eigene && String(eigene.getString("status") || "") === "fertig") continue;
    return BR_SPERRE_GASTGEBER;
  }
  // 2) In einem anderen offenen Match dabei?
  let zeilen = [];
  try {
    zeilen = app.findRecordsByFilter(
      "br_match_stand",
      "classCode = {:c} && pupilUid = {:k} && (status = 'dabei' || status = 'schreibt')",
      "",
      50,
      0,
      { c: classCode, k: kindId },
    );
  } catch (err) {
    zeilen = [];
  }
  for (const z of zeilen) {
    const mid = String(z.getString("matchId") || "");
    if (!mid || mid === ausserMatchId) continue;
    let m = null;
    try {
      m = app.findRecordById("br_matches", mid);
    } catch (err) {
      m = null;
    }
    if (m && brOffenAmServer(m, jetzt)) return BR_SPERRE_DABEI;
  }
  return "";
}

// Eine Stand-Zeile, die NEU auf `dabei`/`schreibt` geht, prüft die Sperre.
// `eingeladen` und `abgelehnt` sind keine Teilnahme und gehen immer durch;
// das Fortschreiben derselben Teilnahme (`schreibt`, alle 800 ms) kostet keine
// einzige Abfrage.
function brStandSperre(e, alsAenderung) {
  let kind = null;
  try {
    const auth = e.auth;
    if (auth && auth.collection().name === "tt_pupils") kind = auth;
  } catch (_) {
    kind = null;
  }
  if (!kind) return;
  const neu = String(e.record.getString("status") || "");
  if (neu !== "dabei" && neu !== "schreibt") return;
  if (alsAenderung) {
    let vorher = "";
    try {
      vorher = String(e.record.original().getString("status") || "");
    } catch (_) {
      try {
        vorher = String(e.app.findRecordById("br_match_stand", e.record.id).getString("status") || "");
      } catch (err) {
        vorher = "";
      }
    }
    if (vorher === "dabei" || vorher === "schreibt") return;
  }
  const satz = brEinKindEinMatch(
    e.app,
    kind.id,
    String(kind.getString("classCode") || ""),
    String(e.record.getString("matchId") || ""),
  );
  if (satz) throw new BadRequestError(satz);
}

// Nimmt diese Stand-Zeile am Match teil? `eingeladen`/`abgelehnt` nicht -
// sie dürfen NIRGENDS als Teilnahme zählen (Verlauf, `anzahl`).
function brNimmtTeil(stand) {
  const status = String(stand.getString("status") || "");
  return status !== "eingeladen" && status !== "abgelehnt";
}

if (typeof module !== "undefined") {
  module.exports = {
    BR_MATCH_DAUER_MIN: BR_MATCH_DAUER_MIN,
    BR_COUNTDOWN_MS: BR_COUNTDOWN_MS,
    BR_UEBERGAENGE: BR_UEBERGAENGE,
    brStandVomServer: brStandVomServer,
    brMatchMussEsGeben: brMatchMussEsGeben,
    brKlassenmatchAbgeschaltet: brKlassenmatchAbgeschaltet,
    BR_SPERRE_GASTGEBER: BR_SPERRE_GASTGEBER,
    BR_SPERRE_DABEI: BR_SPERRE_DABEI,
    brOffenAmServer: brOffenAmServer,
    brEinKindEinMatch: brEinKindEinMatch,
    brStandSperre: brStandSperre,
    brNimmtTeil: brNimmtTeil,
  };
}
