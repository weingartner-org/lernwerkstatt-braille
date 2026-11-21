/**
 * Ersatzteil im Paket „Lernwerkstatt Braille": Das Zeichen eines Lernprogramms. Das Paket
 * enthält Punktgenau, Klangpunkte und Plus. Die Schlüssel anderer Programme sind nur eingetragen,
 * damit der Typ stimmt (`LwProgramKey`); die Klassenverwaltung zeigt sie nicht an.
 */
import { PunktgenauLogo } from "@/components/PunktgenauLogo";
import { KlangpunkteLogo } from "@/components/KlangpunkteLogo";
import { PlusLogo } from "@/components/PlusLogo";
import type { LwProgramKey } from "@/lib/lernwerkstatt/klassen";

type ZeichenBauteil = (p: {
  className?: string;
  beschreibung?: boolean | string;
}) => JSX.Element;

/** Welches Zeichen zu welchem Programm gehört - die EINE Zuordnung. */
export const PROGRAMM_ZEICHEN: Record<LwProgramKey, ZeichenBauteil> = {
  tippen: PunktgenauLogo,
  braille: PunktgenauLogo,
  klangpunkte: KlangpunkteLogo,
  computer: PunktgenauLogo,
  plus: PlusLogo,
  lexami: PunktgenauLogo,
};

export function ProgrammZeichen({
  programm,
  className = "h-5 w-5 shrink-0",
  beschreibung,
}: {
  programm: LwProgramKey;
  className?: string;
  /** Nur setzen, wo KEIN Name danebensteht. */
  beschreibung?: boolean | string;
}) {
  const Zeichen = PROGRAMM_ZEICHEN[programm];
  return <Zeichen className={className} beschreibung={beschreibung} />;
}
