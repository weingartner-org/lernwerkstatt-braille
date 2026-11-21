import { LegalShell } from "./LegalShell";

/*
 * Ersatzteil im Paket „Lernwerkstatt Braille": Die Erklärung zur Barrierefreiheit gilt
 * für den Betrieb einer Installation. Wer das Paket betreibt, prüft und
 * erklärt selbst.
 */
export function Barrierefreiheit() {
  return (
    <LegalShell title="Barrierefreiheit">
      <p>
        Lernwerkstatt Braille ist für die Bedienung mit der Tastatur, mit Screenreader und mit Braillezeile gebaut.
        Die Erklärung zur Barrierefreiheit dieser Installation steht in der Datei{" "}
        <code>src/features/legal/Barrierefreiheit.tsx</code>.
      </p>
      <p lang="en">
        Lernwerkstatt Braille is built for keyboard, screen reader and braille display use. The accessibility statement of
        this installation belongs in <code>src/features/legal/Barrierefreiheit.tsx</code>.
      </p>
    </LegalShell>
  );
}
