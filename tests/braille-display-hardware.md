# Phase X — Manuelles Geräte-Protokoll: Braillezeile

**Kein Vitest.** Diese Checkliste wird an **echter Hardware** abgearbeitet und
im Repo versioniert (analog zu `braille-a11y-regression.md`). Sie schließt die
Lücke, die der automatisierte Test prinzipbedingt nicht abdeckt: den realen
Verbindungs-/Ausgabe-/Tast-Round-Trip an einer handelsüblichen Braillezeile.

> Voraussetzung: **Chrome oder Edge am Computer** (Web Bluetooth / WebHID).
> Safari, Firefox und iPad unterstützen die APIs nicht — dort ist nur der
> Audio-/Bildschirmpfad zu erwarten (das ist korrektes Verhalten, kein Fehler).

---

## 0. Testumgebung dokumentieren (bei jedem Durchlauf ausfüllen)

| Feld | Wert |
|---|---|
| Datum |  |
| Tester:in |  |
| Braillezeile (Hersteller/Modell, Zellenzahl) |  |
| Transport | ☐ Bluetooth (BLE)  ☐ USB (HID) |
| Browser + Version |  |
| Betriebssystem |  |
| Commit (`git rev-parse --short HEAD`) |  |

---

## 1. Capability / Gate

- [ ] In Chrome/Edge: `brailleDisplayCapability()` meldet `supported:true` (Konsole oder Koppeln-Button aktiv).
- [ ] In Safari/Firefox: `supported:false` + Klartext „Chrome oder Edge …". Trainer bleibt voll bedienbar (Audio/Bildschirm).
- [ ] iPad: kein Koppeln-Angebot, kein Crash.

## 2. Verbindung herstellen (`connectBrailleDisplay`)

- [ ] Klick auf „Braillezeile koppeln" öffnet den Browser-Geräte-Dialog (Nutzergeste vorhanden).
- [ ] Gerät auswählen → `ok:true`, `handle.kind` korrekt (`bluetooth`/`hid`).
- [ ] `handle.numCells` plausibel (oder bewusst Default 40 — notieren, ob die echte Zellenzahl gebraucht wird).
- [ ] Abbruch des Dialogs → `ok:false` mit verständlichem `reason`, **kein** Crash.

## 3. Ausgabe (Zellen schreiben)

- [ ] Bekanntes Wort als U+2800-String → `unicodeToDeviceBytes` → `fitToLine` → `handle.write`.
- [ ] **Visuelle Prüfung an der Zeile:** Stimmen die getasteten Punkte mit der Vorlage überein?
  - Testmuster 1: `a` (Punkt 1) → erste Zelle nur oben links.
  - Testmuster 2: voller 8-Punkt (`⣿`, 0xFF) → alle 8 Punkte oben.
  - Testmuster 3: ganzes Wort, z. B. „Ball".
- [ ] **Byte-Format:** Falls die Punkte verdreht/verschoben erscheinen → DotOrder/Frame des Treibers notieren und in `display.ts`/Treiber justieren. Erwartung HID: Identität (passt).
- [ ] Auffüllen: kurzes Wort auf 40 Zellen → Rest leer, keine Geisterpunkte.

## 4. Eingabe (Tasten der Zeile lesen)

- [ ] `handle.onKeys` abonnieren, an der Zeile tasten/Cursor-Routing drücken → Roh-Report kommt an.
- [ ] Roh-Report-Bytes dokumentieren (je gedrückter Taste/Punkt) → Grundlage für die Dekodierung auf Perkins-Akkord.
- [ ] Abmelden (Rückgabe von `onKeys`) → keine weiteren Reports.

## 5. Trennung

- [ ] `handle.disconnect()` → Zeile getrennt, kein Crash.
- [ ] Erneutes Koppeln nach Trennung funktioniert.
- [ ] Browser-Tab schließen während verbunden → kein hängender Zustand beim nächsten Start.

## 6. Faire Zeit (taktil)

- [ ] Taktiler Lese-Durchlauf: gemessene Tastzeit wird via `fairTactileMs` zusätzlich zur Vorlesezeit abgezogen (sobald der Modus verdrahtet ist).

## 7. Akzeptanz Phase X (SPEC QA-5)

- [ ] Verbindung herstellbar **und** trennbar ohne Crash.
- [ ] Aktuelle Zelle/Zeile **korrekt** auf der Hardware sichtbar.
- [ ] Taktiler Lese-Modus erlaubt **einen vollständigen Aufgabendurchlauf** rein über Zeile + Akkord (kein Bildschirm, kein Audio nötig).
- [ ] Degradation auf den Audio-Pfad, wenn keine Zeile vorhanden.

---

## Ergebnis dieses Durchlaufs

| Punkt | Ergebnis (grün/gelb/rot) | Notiz |
|---|---|---|
| Verbindung |  |  |
| Ausgabe |  |  |
| Eingabe |  |  |
| Trennung |  |  |
| Byte-Format bestätigt |  |  |

**Gesamt:** ☐ grün  ☐ gelb  ☐ rot
**Nächster Schritt:** ____________________________________________
