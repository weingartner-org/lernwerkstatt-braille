/**
 * Alle deutschen Texte von Klangpunkte, nach Bereichen. Der Typ `KlangTexte`
 * (siehe `index.ts`) ist `typeof de`: Jede andere Sprache hat genau diese
 * Schlüssel (tsc prüft das). Deutsch ist der Bestand vom 06.11.2026.
 *
 * Bereiche und wer sie benutzt:
 *  - seite        `features/public/KlangpunktePage.tsx`
 *  - uebersicht   `components/klangpunkte/Klangpunkte.tsx`, `KlangpunkteAkustik`, `KlangpunkteKlassenMatrix`
 *  - welten       `lib/klangpunkte/welten.ts`
 *  - abzeichen    `lib/klangpunkte/badges.ts`
 *  - runner       `KlangpunkteRunner.tsx`, `NotenZeile.tsx`, `KlangpunkteTouchEingabe.tsx`
 *  - kapitel      `etappen.ts`: die Kapitel-Liste `KLANG_ETAPPEN` (Titel, Einführung, Zeichen)
 *  - aufgabenA/B/C `etappen.ts`: die Aufgaben-Erzeuger (Aufgabentext, Antworten, Erklärung)
 *  - instrumente  `audio.ts`: Instrumentennamen
 *  - lieder       `songs.ts`: Titel und Herkunft der Lieder
 *  - musik        `notation.ts`: Beschriftungen der Notenzeichen (Töne, Werte: `tonnamen.ts`)
 */
import { musik } from "./de/musik";
import { seite } from "./de/seite";
import { uebersicht } from "./de/uebersicht";
import { welten } from "./de/welten";
import { abzeichen } from "./de/abzeichen";
import { runner } from "./de/runner";
import { kapitel } from "./de/kapitel";
import { aufgabenA } from "./de/aufgabenA";
import { aufgabenB } from "./de/aufgabenB";
import { aufgabenC } from "./de/aufgabenC";
import { instrumente } from "./de/instrumente";
import { lieder } from "./de/lieder";

export const de = { musik, seite, uebersicht, welten, abzeichen, runner, kapitel, aufgabenA, aufgabenB, aufgabenC, instrumente, lieder };
