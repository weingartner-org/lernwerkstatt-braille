# Lernwerkstatt Braille

Lernwerkstatt Braille sind drei barrierefreie Lern-Apps in einer Anwendung - für
Kinder und Jugendliche mit und ohne Sehbeeinträchtigung:

- **Punktgenau** - Brailleschrift lernen (Lesen und Schreiben, Basisschrift, Kurzschrift,
  Computerbraille, mit Braillezeile, Brailleschreibmaschine oder Tastatur).
- **Klangpunkte** - Braille-Noten und Musik hören, lesen und verstehen.
- **Plus** - Rechnen im Kopf und auf der Zeile.

Alles ist mit der Tastatur bedienbar und mit Screenreader und Braillezeile geprüft.
Eine Lehrkraft legt in „Meine Klasse“ eine Klasse an, die Kinder melden sich mit
Klassencode, Namen und Passwort an und üben in allen drei Apps.

Das Paket enthält:

- die drei Apps mit allen Übungen, Klängen und Schriften, die sie benutzen,
- eine schlichte Startseite, die genau diese drei Apps anbietet,
- Anmeldung, Lehrkraft-Konten und Kinder-Konten,
- „Meine Klasse“ mit den Reitern dieser drei Apps: Klassen, Kinder, Co-Lehrkräfte,
  Lernstand, Nachrichten an die Klasse,
- die Übersetzung in Braille mit [liblouis](https://liblouis.io) (Tabellen und WebAssembly-Fassung
  liegen im Paket),
- die Schnittstelle zu [PocketBase](https://pocketbase.io): Sammlungen
  (`pocketbase/setup.mjs`) und Server-Regeln (`pocketbase/pb_hooks/`).

Es ist ein eigenständiger Auszug aus der Lernplattform, in der die Apps entstehen. Die anderen
Programme der Plattform sind nicht Teil dieses Pakets.

## Ausprobieren (ohne Server)

```bash
npm ci
cp .env.example .env    # VITE_BACKEND=mock: Daten bleiben im Browser
npm run dev
```

Die Startseite bietet die drei Apps an. Die Klassenverwaltung liegt unter `/meine-klasse`.

## Mit eigenem PocketBase

Entwickelt und betrieben wird das Paket mit **PocketBase 0.38** (die Server-Regeln sind JavaScript
für PocketBase und nutzen dessen Hook-Schnittstelle). Neuere Versionen bitte zuerst ausprobieren.

1. PocketBase herunterladen, starten, ein Superuser-Konto anlegen.
2. Server-Regeln einbinden: den Ordner `pocketbase/pb_hooks/` als `pb_hooks` der PocketBase
   verwenden (`pocketbase serve --hooksDir pocketbase/pb_hooks`).
3. Sammlungen anlegen. Das Skript ist wiederholbar:
   ```bash
   PB_URL=http://127.0.0.1:8090 PB_SU_EMAIL=<superuser> PB_SU_PASS=<passwort> node pocketbase/setup.mjs
   ```
   Gegen einen entfernten Server verweigert das Skript die eingebauten Entwickler-Zugangsdaten -
   eigene Werte setzen.
4. In den PocketBase-Einstellungen: **Application URL** (die Adresse, unter der die App läuft -
   Links in Mails zeigen darauf) und **Mail-Server und Absender** (für Bestätigung,
   „Passwort vergessen“ und Einladungen).
5. Für die Kinder-Passwörter, die die Lehrkraft in der Liste sieht, braucht der Dienst einen
   Schlüssel in seiner Umgebung (32 Zeichen, zum Beispiel `openssl rand -hex 16`):
   `TT_PASSWORT_SCHLUESSEL=...`. Er liegt nie in der Datenbank.
6. Die App bauen und ausliefern:
   ```bash
   cp .env.example .env.production   # VITE_BACKEND=pocketbase, VITE_POCKETBASE_URL=<Adresse der PocketBase>
   npm run build                     # Ergebnis: dist/
   ```
   `dist/` kann jeder Webserver ausliefern, der unbekannte Pfade auf `index.html` umleitet
   (Einzelseiten-App).

Danach: als Lehrkraft ein Konto anlegen (Anmeldefenster in einer der Apps), die Adresse in der
Bestätigungs-Mail öffnen, in „Meine Klasse“ eine Klasse anlegen, Kinder eintragen - die Kinder
melden sich mit dem Klassencode an.

### Was die Server-Seite mitbringt

- **Sammlungen:** `tt_teachers`, `tt_class_teachers`, `tt_class_teacher_invites`, `tt_classes`,
  `tt_pupils` (Konten und Klassen), `lw_progress`, `lw_events`, `lw_messages` (Lernstand und
  Nachrichten), `br_progress`, `br_events`, `tt_progress`, `tt_events` (Altbestand, als Rückfall
  gelesen), `br_matches`, `br_match_stand`, `br_match_verlauf`, `br_challenges`, `br_eigene_texte`
  (Punktgenau), `plus_staffel` (Plus), `tt_schreibproben`, `tt_eigene_texte`, `appSettings`,
  `mail_bremse`.
- **Server-Regeln:** Klassen und Kinder (Grenzen, Verschieben, Klassencode ändern), Co-Lehrkräfte,
  Klassenmatch von Punktgenau, Schutz geschützter Felder, verschlüsselte Kinder-Passwörter,
  selbstlernende Konten, Konto-Mails in der Sprache des Kontos, Mail-Bremse. Warum jede Datei
  nötig ist, steht in `oeffentlich/pakete/lernwerkstatt-braille.mjs` des Ursprungs-Repositorys
  und im Kopf jeder Datei.

### Was bewusst fehlt

Wochenberichte und Erinnerungs-Mails, Meldefenster an die Entwicklung, Spendenseite, Statistik und
Verwaltung der Gesamtplattform, die Schrift „MM Schuldruck“ und die Braille-Schriften „HBS-6/8“ der
FernUniversität Hagen (keine Lizenz zur Weitergabe; die Seiten benutzen dann die Schrift des
Systems), Aufnahmen mit Stimmen (Lizenz ungeklärt). Impressum, Datenschutz und Barrierefreiheit sind
Platzhalter (`src/features/legal/`): Wer die App betreibt, trägt dort die eigenen Angaben ein.

## Prüfen

```bash
npm run build   # Typ-Check, Prüfung der Übungstexte und Bau
npm test
```

## Lizenz

- **Code:** EUPL 1.2 (`LICENSE`).
- **Texte, Übungen und Bilder des Projekts:** CC BY-SA 4.0 (`LICENSES/CC-BY-SA-4.0.txt`).
- **liblouis** (WebAssembly-Fassung und Braille-Tabellen unter `src/lib/braille/vendor/`):
  LGPL 2.1 oder später (`LICENSES/LGPL-2.1-or-later.txt`). Die Fassung ist unverändert in
  `liblouis-no-deps.mjs` gebündelt; die Tabellen tragen ihre Kopfzeilen.
- **Fremde Teile** behalten ihre Lizenz: Abzeichen-Bilder (Fluent Emoji, MIT), Schriften (SIL OFL,
  Luciole CC BY 4.0, **Primæ CC BY-NC-SA 4.0 - nur nicht kommerziell**), Klänge (Aufnahmen der
  University of Iowa). Welche Datei welche Lizenz hat, steht in `REUSE.toml` und
  `public/fonts/SCHRIFTEN-LIZENZEN.md`.
- **Namen und Logos** sind nicht freigegeben: [NAMEN-UND-MARKEN.md](NAMEN-UND-MARKEN.md).

## Mitmachen

Siehe [CONTRIBUTING.md](CONTRIBUTING.md).

---

## English

Lernwerkstatt Braille bundles three accessible learning apps for children with and without visual
impairment: **Punktgenau** (learning braille), **Klangpunkte** (braille music) and **Plus** (mental
arithmetic, on paper and on a braille display). Everything works with the keyboard and is tested with
screen readers and braille displays. Teachers create classes in "Meine Klasse" (my class), children sign
in with a class code, a name and a password. Braille translation uses
[liblouis](https://liblouis.io) (LGPL 2.1 or later).

The repository contains the three apps (exercises, sounds, fonts), a plain start page, accounts for
teachers and children, the class management and the [PocketBase](https://pocketbase.io) backend
(`pocketbase/setup.mjs` creates the collections, `pocketbase/pb_hooks/` holds the server rules).

**Try it without a server:** `npm ci`, copy `.env.example` to `.env` (`VITE_BACKEND=mock`),
`npm run dev`.

**With your own PocketBase (developed and operated with 0.38):** run PocketBase with
`--hooksDir pocketbase/pb_hooks`, run `node pocketbase/setup.mjs` with your superuser credentials
(`PB_URL`, `PB_SU_EMAIL`, `PB_SU_PASS`), set the application URL and mail settings in PocketBase, set
`TT_PASSWORT_SCHLUESSEL` (32 characters) in the service environment, then build with
`VITE_BACKEND=pocketbase` and `VITE_POCKETBASE_URL=<your server>`.

Imprint, privacy notice and accessibility statement are placeholders - the operator fills them in
(`src/features/legal/`). Code: EUPL-1.2. Project content: CC BY-SA 4.0. liblouis and its tables: LGPL-2.1+.
Third-party parts keep their licenses (`REUSE.toml`); the Primæ typeface is CC BY-NC-SA (non-commercial
only). The names and logos are not licensed - see NAMEN-UND-MARKEN.md.
