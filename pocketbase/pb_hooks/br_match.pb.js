/// <reference path="../pb_data/types.d.ts" />
//
// DAS BRAILLE-KLASSENMATCH AM SERVER (Zubau 22.09.2026)
// =======================================================================
// Verdrahtung der reinen Logik aus `src/lib/braille/klassenmatch.ts` (dort
// unverändert benutzt, siehe Bau-Bericht) - Muster 1:1 aus Tastenflows
// `tt_match.pb.js`/`tt_match_lib.pb.js` übernommen, für EIGENE Collections
// (`br_matches`/`br_match_stand`/`br_match_verlauf`, siehe `setup.mjs`).
// Tastenflows Klassenmatch ist live in Benutzung - eine Änderung am Spielablauf
// gehört an BEIDE Stellen ([[feedback_zwei_stellen_die_voneinander_nichts_wissen]]).
//
// Die Regeln stehen in `setup.mjs` (Kinder derselben Klasse lesen; schreiben
// nur die eigene Zeile bzw. der Gastgeber sein Match; KEINE Lehrkraft-Regel -
// F10-Muster: „Es gibt keine Statistik; Lehrer wissen nicht, wer wie oft ein
// Match macht"). Diese Datei ist das, was Regeln nicht können:
//
//   1. WAS DER SERVER SETZT. `hostName`, `status`, `startMs`, `endeMs` und
//      `createdMs` kommen NIE aus dem Browser.
//   2. DIE GRENZE. Kein Match, wo die Lehrkraft es abgeschaltet hat
//      (`tt_classes.settings.punktgenau.klassenmatchAus`).
//   3. DIE ÜBERGÄNGE. einladung → countdown → laeuft → fertig/abgebrochen.
//   4. DAS AUFRÄUMEN. Ein Lauf je Minute: abgelaufene Matches schliessen,
//      unbeantwortete Einladungen abbrechen, alles eine Stunde nach dem Ende
//      löschen - ZUERST eine Zeile je Kind in `br_match_verlauf` (nur die
//      Teilnahme, keine Client-Regel - siehe Kopfkommentar `MatchVerlaufZeile`
//      in `klassenmatch.ts`).
//
// ── ⚠️ DIE UHR LÄUFT HIER NICHT ────────────────────────────────────────────
// Der Cron tickt einmal je Minute und ist für ein Fünf-Minuten-Spiel viel zu
// grob. Das ENDE rechnet jeder Client selbst aus `startMs`/`endeMs` (dieselben
// zwei Zahlen bei allen), und der Gastgeber setzt `status` auf `fertig`. Der
// Cron ist nur das Netz für den Fall, dass niemand mehr da ist, der es täte.
//
// Deploy: Datei nach pb_hooks/ + Neustart → »Update LMS (komplett)«. Rein
// additiv zum Schema, das `setup.mjs` ohnehin mitbringt.
// Siehe [[reference_pocketbase_hook_scope]].

// --- Anlegen: der Server schreibt, was ihm gehört ---------------------------
onRecordCreateRequest((e) => {
  const L = require(`${__hooks}/br_match_lib.pb.js`);
  let kind = null;
  let vonSuperuser = false;
  try {
    const auth = e.auth;
    if (auth && auth.collection().name === "_superusers") vonSuperuser = true;
    else if (auth && auth.collection().name === "tt_pupils") kind = auth;
  } catch (_) {
    kind = null;
  }
  if (vonSuperuser) {
    e.next();
    return;
  }
  if (!kind) throw new BadRequestError("Ein Klassenmatch kann nur ein Kind einer Klasse ausschreiben.");

  const code = String(kind.getString("classCode") || "").trim();
  if (!code) throw new BadRequestError("Ein Klassenmatch gibt es nur in einer Klasse.");

  // --- Hat die Lehrkraft das Match abgeschaltet? -----------------------------
  if (L.brKlassenmatchAbgeschaltet(e.app, code)) {
    throw new BadRequestError(
      "Eure Lehrkraft hat das Klassenmatch für diese Klasse ausgeschaltet.",
    );
  }

  // --- Ein Kind, ein Match (02.10.2026) -------------------------------------
  // Wer schon Gastgeber eines offenen Matches ist oder in einem dabei ist,
  // legt kein zweites an. Begründung in `br_match_lib.pb.js` (`brEinKindEinMatch`).
  const sperre = L.brEinKindEinMatch(e.app, kind.id, code, "");
  if (sperre) throw new BadRequestError(sperre);

  // --- Was der Server setzt ------------------------------------------------
  e.record.set("classCode", code);
  e.record.set("hostUid", kind.id);
  // ★ Der NAME kommt aus dem Kind-Datensatz, nicht aus dem Rumpf - sonst
  // könnte ein Kind eine Einladung im Namen eines anderen ausschreiben.
  e.record.set("hostName", String(kind.getString("name") || ""));
  e.record.set("status", "einladung");
  e.record.set("startMs", 0);
  e.record.set("endeMs", 0);
  e.record.set("dauerMin", L.BR_MATCH_DAUER_MIN);
  e.record.set("createdMs", Date.now());
  e.next();
}, "br_matches");

// --- Ändern: nur erlaubte Übergänge, Zeiten vom Server -----------------------
onRecordUpdateRequest((e) => {
  const L = require(`${__hooks}/br_match_lib.pb.js`);
  let vonSuperuser = false;
  try {
    vonSuperuser = !!e.auth && e.auth.collection().name === "_superusers";
  } catch (_) {
    vonSuperuser = false;
  }
  if (vonSuperuser) {
    e.next();
    return;
  }

  const alt = e.app.findRecordById("br_matches", e.record.id);
  const vorher = String(alt.getString("status") || "einladung");
  const nachher = String(e.record.getString("status") || "");

  if (nachher !== vorher) {
    const erlaubt = L.BR_UEBERGAENGE[vorher] || [];
    if (erlaubt.indexOf(nachher) < 0) {
      throw new BadRequestError("Dieses Klassenmatch lässt sich so nicht ändern.");
    }
  }

  // ★★★ DIE ZEITEN SETZT DER SERVER, genau einmal: beim Übergang nach
  // „countdown" - alle Geräte rechnen danach von derselben Zahl.
  if (nachher === "countdown" && vorher === "einladung") {
    const dauerMin = alt.getFloat("dauerMin") > 0 ? alt.getFloat("dauerMin") : L.BR_MATCH_DAUER_MIN;
    const start = Date.now() + L.BR_COUNTDOWN_MS;
    e.record.set("startMs", start);
    e.record.set("endeMs", start + Math.round(dauerMin * 60 * 1000));
    e.record.set("dauerMin", dauerMin);
  } else {
    // In jedem anderen Fall bleiben die Zeiten stehen - ein Kind gibt sich
    // weder mehr Zeit noch zieht es das Ende der anderen vor.
    e.record.set("startMs", alt.getFloat("startMs"));
    e.record.set("endeMs", alt.getFloat("endeMs"));
    e.record.set("dauerMin", alt.getFloat("dauerMin"));
  }
  // Identität, Arbeitsweise/Bereich und Anlegezeit gehören dem Server, immer.
  e.record.set("classCode", alt.getString("classCode"));
  e.record.set("hostUid", alt.getString("hostUid"));
  e.record.set("hostName", alt.getString("hostName"));
  e.record.set("arbeitsweise", alt.getString("arbeitsweise"));
  e.record.set("bereich", alt.getString("bereich"));
  e.record.set("createdMs", alt.getFloat("createdMs"));
  e.next();
}, "br_matches");

// --- Stand-Zeilen: Name vom Server, Match muss es geben ----------------------
// ★ 02.10.2026: dazu „Ein Kind, ein Match" (`brStandSperre`) - wer NEU auf
// `dabei`/`schreibt` geht, darf in keinem anderen offenen Match stecken.
onRecordCreateRequest((e) => {
  const L = require(`${__hooks}/br_match_lib.pb.js`);
  if (L.brStandVomServer(e)) return;
  L.brMatchMussEsGeben(e);
  L.brStandSperre(e, false);
  e.next();
}, "br_match_stand");
onRecordUpdateRequest((e) => {
  const L = require(`${__hooks}/br_match_lib.pb.js`);
  if (L.brStandVomServer(e)) return;
  L.brStandSperre(e, true);
  e.next();
}, "br_match_stand");

// --- Aufräumen: jede Minute -------------------------------------------------
cronAdd("br_match_aufraeumen", "* * * * *", () => {
  // ⚠️ [[reference_pocketbase_hook_scope]] - cronAdd sieht nichts aus dem
  // Dateikopf, darum stehen die Fristen hier noch einmal.
  const EINLADUNG_FRIST = 60 * 1000;
  // Einladung, der schon Kinder gefolgt sind: erst nach zehn Minuten (s. unten).
  const EINLADUNG_MIT_KINDERN_FRIST = 10 * 60 * 1000;
  const AUFRAEUMEN_NACH = 60 * 60 * 1000;
  const jetzt = Date.now();
  const L = require(`${__hooks}/br_match_lib.pb.js`);

  // 1) Einladungen, aus denen nichts geworden ist.
  try {
    const alt = $app.findRecordsByFilter(
      "br_matches",
      "status = 'einladung' && createdMs > 0 && createdMs < {:frist}",
      "",
      200,
      0,
      { frist: jetzt - EINLADUNG_FRIST },
    );
    for (const rec of alt) {
      /*
        ★★ 02.10.2026 (wie `tt_match.pb.js`): Nur eine Einladung, der NIEMAND
        gefolgt ist, endet nach einer Minute. Bis dahin brach dieser Lauf JEDE
        Einladung nach einer Minute ab - auch mit fünf Kindern im
        Wartefenster. Seit der Gastgeber vor dem Start auf Unentschiedene
        warten kann („Trotzdem starten?" - „Warten"), wäre das Match dabei
        verloren gegangen. Mit Mitspielenden gilt darum
        EINLADUNG_MIT_KINDERN_FRIST: nur noch das Netz für eine geschlossene
        Seite.
      */
      if (rec.getFloat("createdMs") > jetzt - EINLADUNG_MIT_KINDERN_FRIST) {
        let mitKindern = false;
        try {
          const staende = $app.findRecordsByFilter(
            "br_match_stand",
            "matchId = {:m} && pupilUid != {:host}",
            "",
            200,
            0,
            { m: rec.id, host: rec.getString("hostUid") },
          );
          // ⚠️ Nur wer WARTET (`dabei`/`schreibt`) - nicht `brNimmtTeil`: Das
          // zählt auch `fertig`, also ein Kind, das im Wartefenster „Doch
          // nicht" gedrückt hat. `eingeladen`/`abgelehnt` warten ebenfalls nicht.
          for (const s of staende) {
            const st = String(s.getString("status") || "");
            if (st === "dabei" || st === "schreibt") mitKindern = true;
          }
        } catch (err) {
          $app.logger().warn("[br-match] Stände nicht lesbar", "id", rec.id, "error", String(err));
        }
        if (mitKindern) continue;
      }
      rec.set("status", "abgebrochen");
      try {
        $app.save(rec);
      } catch (err) {
        $app.logger().warn("[br-match] Einladung nicht abbrechbar", "id", rec.id, "error", String(err));
      }
    }
  } catch (err) {
    $app.logger().warn("[br-match] Einladungen nicht lesbar", "error", String(err));
  }

  // 2) Matches, deren Zeit um ist (Netz - normalerweise war der Gastgeber
  //    schneller). ⚠️ Dieser Schreibzugriff geht über `$app.save()` direkt am
  //    Modell vorbei an `br_match_lib.pb.js`'s `BR_UEBERGAENGE` (die gilt nur für
  //    Anfragen VON KINDERN) - ein „countdown"-Match darf der Cron darum auch
  //    ohne den Umweg über „laeuft" schliessen, genau wie beim Tastenflow-Vorbild.
  try {
    const vorbei = $app.findRecordsByFilter(
      "br_matches",
      "(status = 'countdown' || status = 'laeuft') && endeMs > 0 && endeMs < {:jetzt}",
      "",
      200,
      0,
      { jetzt: jetzt },
    );
    for (const rec of vorbei) {
      rec.set("status", "fertig");
      try {
        $app.save(rec);
      } catch (err) {
        $app.logger().warn("[br-match] Match nicht schliessbar", "id", rec.id, "error", String(err));
      }
    }
  } catch (err) {
    $app.logger().warn("[br-match] Laufende Matches nicht lesbar", "error", String(err));
  }

  // 3) Löschen, eine Stunde nach dem Ende. ZUERST eine dauerhafte Zeile je
  //    Kind in `br_match_verlauf` - seit 14.11.2026 NUR NOCH DIE TEILNAHME
  //    (Johannes: „welcher Schüler wie viele Matches spielt, aber nicht, wer
  //    gewonnen hat"; siehe `MatchVerlaufZeile` in `klassenmatch.ts`): kein
  //    Platz, keine Ergebnisse, keine Arbeitsweise. Ohne jede Client-Regel.
  //    Erst DANACH die Stand-Zeilen und das Match selbst löschen.
  try {
    const weg = $app.findRecordsByFilter(
      "br_matches",
      "(status = 'fertig' || status = 'abgebrochen') && createdMs > 0 && createdMs < {:frist}",
      "",
      200,
      0,
      { frist: jetzt - AUFRAEUMEN_NACH },
    );
    for (const rec of weg) {
      try {
        const staende = $app.findRecordsByFilter(
          "br_match_stand",
          "matchId = {:m}",
          "",
          200,
          0,
          { m: rec.id },
        );

        // ★★★ 02.10.2026: `eingeladen`/`abgelehnt` sind KEINE Teilnahme - sie
        // kommen nicht in den Verlauf (sonst stünde dort je Kind, bei dem nur
        // das Fenster aufging, eine Null-Zeile, und `anzahl` zählte es mit).
        // Gelöscht werden unten trotzdem ALLE Zeilen des Matches.
        const teilnehmer = staende.filter((s) => L.brNimmtTeil(s));
        const startMs = rec.getFloat("startMs");
        const endeMs = rec.getFloat("endeMs");

        for (const s of teilnehmer) {
          try {
            const verlauf = new Record($app.findCollectionByNameOrId("br_match_verlauf"));
            verlauf.set("matchId", rec.id);
            verlauf.set("classCode", rec.getString("classCode"));
            verlauf.set("pupilUid", s.getString("pupilUid"));
            verlauf.set("anzahl", teilnehmer.length);
            verlauf.set("startMs", startMs);
            verlauf.set("endeMs", endeMs);
            verlauf.set("createdMs", jetzt);
            $app.save(verlauf);
          } catch (err) {
            // Eine Zeile, die sich nicht festhalten lässt, darf das Aufräumen
            // nicht aufhalten - sie ist Statistik, kein Spielstand.
            $app.logger().warn("[br-match] Verlauf nicht schreibbar", "stand", s.id, "error", String(err));
          }
        }

        for (const s of staende) $app.delete(s);
        $app.delete(rec);
      } catch (err) {
        $app.logger().warn("[br-match] Aufräumen fehlgeschlagen", "id", rec.id, "error", String(err));
      }
    }
  } catch (err) {
    $app.logger().warn("[br-match] Alte Matches nicht lesbar", "error", String(err));
  }
});
