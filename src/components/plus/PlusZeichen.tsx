/**
 * Die kleinen Zeichen der Übung - nur fürs Auge, darum immer `aria-hidden`.
 * Was sie sagen, steht daneben als Text (Farbe und Zeichen sind nie die
 * einzige Auskunft).
 */
interface ZeichenProps {
  groesse?: number;
  strich?: number;
}

const gemeinsam = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: false as const,
};

/** Das Häkchen: „richtig". */
export function HakenZeichen({ groesse = 24, strich = 3 }: ZeichenProps) {
  return (
    <svg {...gemeinsam} width={groesse} height={groesse} strokeWidth={strich}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Der Pfeil „noch einmal": die Antwort stimmt noch nicht, es darf wieder versucht werden. */
export function NochmalZeichen({ groesse = 24, strich = 2.6 }: ZeichenProps) {
  return (
    <svg {...gemeinsam} width={groesse} height={groesse} strokeWidth={strich}>
      <path d="M4 12a8 8 0 102.6-5.9" />
      <path d="M4 4v4.6h4.6" />
    </svg>
  );
}

/** Der Lautsprecher: „ansagen". */
export function LautsprecherZeichen({ groesse = 24, strich = 2 }: ZeichenProps) {
  return (
    <svg {...gemeinsam} width={groesse} height={groesse} strokeWidth={strich}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a8 8 0 010 11" />
    </svg>
  );
}
