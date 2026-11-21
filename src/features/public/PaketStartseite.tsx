import { Link } from "react-router-dom";
import { SkipLink } from "@/lib/a11y";
import { PublicHeader } from "@/components/PublicHeader";
import { RechtlichesFusszeile } from "@/components/RechtlichesFusszeile";
import { PunktgenauLogo } from "@/components/PunktgenauLogo";
import { KlangpunkteLogo } from "@/components/KlangpunkteLogo";
import { PlusLogo } from "@/components/PlusLogo";
import { MEINE_KLASSE_PFAD } from "@/lib/adressen";

/*
 * Ersatzteil im Paket „Lernwerkstatt Braille": die Startseite. In der Plattform
 * zeigt die Startseite alle Programme; das Paket bietet genau diese drei an.
 */
const PROGRAMME = [
  {
    pfad: "/programme/punktgenau",
    name: "Punktgenau",
    zeile: "Brailleschrift lernen",
    text: "Zeichen für Zeichen die Brailleschrift lesen und schreiben - mit Braillezeile, Brailleschreibmaschine oder Tastatur.",
    Zeichen: PunktgenauLogo,
  },
  {
    pfad: "/programme/klangpunkte",
    name: "Klangpunkte",
    zeile: "Braille-Noten und Musik",
    text: "Noten in Braille lesen, hören und verstehen - mit Klängen von echten Instrumenten.",
    Zeichen: KlangpunkteLogo,
  },
  {
    pfad: "/programme/plus",
    name: "Plus",
    zeile: "Rechnen im Kopf und auf der Zeile",
    text: "Aufgaben hören oder lesen, im Kopf rechnen und die Antwort eingeben - mit Sprachausgabe und Braillezeile.",
    Zeichen: PlusLogo,
  },
] as const;

export function PaketStartseite() {
  return (
    <div className="min-h-screen">
      <SkipLink />
      <PublicHeader />
      <main id="hauptinhalt" className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <h1 id="seitentitel" className="text-3xl font-bold">
          Lernwerkstatt Braille
        </h1>
        <p className="mt-3 max-w-prose text-lg text-ink-muted">
          Drei Lern-Apps für Kinder mit und ohne Sehbeeinträchtigung. Alles ist ohne Maus bedienbar und mit
          Screenreader und Braillezeile geprüft.
        </p>
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-3">
          {PROGRAMME.map(({ pfad, name, zeile, text, Zeichen }) => (
            <li key={pfad} className="card flex flex-col gap-3 p-5">
              <Zeichen className="h-12 w-12" />
              <h2 className="text-xl font-semibold">
                <Link to={pfad} className="hover:underline underline-offset-2">
                  {name}
                </Link>
              </h2>
              <p className="font-medium">{zeile}</p>
              <p className="text-ink-muted">{text}</p>
            </li>
          ))}
        </ul>
        <section className="mt-10" aria-labelledby="fuer-lehrkraefte">
          <h2 id="fuer-lehrkraefte" className="text-xl font-semibold">
            Für Lehrkräfte
          </h2>
          <p className="mt-2 max-w-prose text-ink-muted">
            In „Meine Klasse“ legen Sie eine Klasse an, tragen Kinder ein und sehen, was jedes Kind in den drei
            Apps geübt hat. Die Kinder melden sich mit Klassencode, Namen und Passwort an.
          </p>
          <Link to={MEINE_KLASSE_PFAD} className="btn-primary mt-4 inline-block">
            Meine Klasse
          </Link>
        </section>
      </main>
      <RechtlichesFusszeile />
    </div>
  );
}
