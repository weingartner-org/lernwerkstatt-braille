/**
 * Phase X — Braillezeile-Kopplung: reine Logik + Capability-Gate.
 *
 * Diese Datei enthält NUR pure, in jsdom voll testbare Logik:
 *   - Unicode-Braille-Zelle (U+2800-Block) → Geräte-Punktmuster-Byte
 *   - Auffüllen/Abschneiden auf die Zellenzahl der Zeile
 *   - faire Tastzeit (zusätzlicher Abzug der taktilen Lesezeit)
 *   - Capability-Erkennung (Web Bluetooth / WebHID) ohne Throw
 *
 * Die echte Hardware-Anbindung liegt in `display.transport.ts` hinter demselben
 * Capability-Gate. So bleibt der Erstlese-Kern testbar, während die
 * hardwareabhängige Schicht sauber auf den Audio-/Bildschirmpfad degradiert.
 *
 * Bit-/Punkt-Reihenfolge: identisch zum Unicode-Braille-Block (cell.ts) und zur
 * standardisierten HID-Braille-Usage-Page (0x41): Bit 0 = Punkt 1 … Bit 7 =
 * Punkt 8. Eine Zelle (0..255) ist damit zugleich das HID-Braille-Geräte-Byte.
 * Vendor-spezifische Bluetooth-Serienprotokolle weichen teils ab → solche
 * Treiber übergeben eine eigene `DotOrder` (siehe SPIKE-BRAILLEZEILE-ERGEBNIS.md).
 */
import type { Cell } from "./cell";
import { unicodeToCells } from "./cell";

/**
 * Abbildung Punkt → Zielbit im Geräte-Byte. Index 0..7 = Punkt 1..8,
 * Wert = Bitposition (0..7) im ausgegebenen Byte.
 * Default = HID-Braille-/Unicode-Standard (Identität).
 */
export type DotOrder = readonly [
  number, number, number, number, number, number, number, number,
];

/** Standard-Reihenfolge: Punkt n → Bit n-1 (HID-Braille, Unicode). */
export const HID_DOT_ORDER: DotOrder = [0, 1, 2, 3, 4, 5, 6, 7];

/** Typische Zellenzahl einer mobilen Braillezeile (Fallback ohne Geräteangabe). */
export const DEFAULT_DISPLAY_CELLS = 40;

/** Eine Zelle (0..255) in ein Geräte-Byte nach Punktreihenfolge übersetzen. Pure. */
export function cellToDeviceByte(cell: Cell, order: DotOrder = HID_DOT_ORDER): number {
  let b = 0;
  for (let dot = 1; dot <= 8; dot++) {
    if (cell & (1 << (dot - 1))) b |= 1 << order[dot - 1];
  }
  return b & 0xff;
}

/** Zellfolge → Geräte-Bytes (eine Zelle = ein Byte). Pure. */
export function cellsToDeviceBytes(cells: readonly Cell[], order?: DotOrder): Uint8Array {
  const out = new Uint8Array(cells.length);
  for (let i = 0; i < cells.length; i++) out[i] = cellToDeviceByte(cells[i], order);
  return out;
}

/** Unicode-Braille-String (U+2800-Block) → Geräte-Bytes. Pure. */
export function unicodeToDeviceBytes(brl: string, order?: DotOrder): Uint8Array {
  return cellsToDeviceBytes(unicodeToCells(brl), order);
}

/**
 * Bytes auf die Zellenzahl der Zeile bringen: rechts mit Leerzellen (0)
 * auffüllen, Überlänge abschneiden. So passt jede Aufgabe auf die physische
 * Zeile, ohne dass der aufrufende Code die Gerätebreite kennen muss. Pure.
 */
export function fitToLine(bytes: Uint8Array, cells: number): Uint8Array {
  const out = new Uint8Array(Math.max(0, cells));
  out.set(bytes.subarray(0, out.length));
  return out;
}

/**
 * Faire Zeit MIT Braillezeile: zieht neben der bereits abgezogenen
 * Vorlese-/Ansagezeit (`spokenMs`) zusätzlich die reine taktile Tastzeit
 * (`tactileMs`) ab. Erst mit echter Zeile sinnvoll (Bauvertrag 0.4 / Konzept).
 * Pure — ergänzt `voice.typingGapMs` um den taktilen Term.
 */
export function fairTactileMs(rawDeltaMs: number, spokenMs: number, tactileMs: number): number {
  return Math.max(0, rawDeltaMs - Math.max(0, spokenMs) - Math.max(0, tactileMs));
}

/** Verfügbarkeit der Braillezeilen-Transporte im aktuellen Browser. */
export interface DisplayCapability {
  /** Web Bluetooth (`navigator.bluetooth`) vorhanden. */
  bluetooth: boolean;
  /** WebHID (`navigator.hid`) vorhanden — für USB-Zeilen. */
  hid: boolean;
  /** Mindestens ein Transport verfügbar. */
  supported: boolean;
  /** Klartext für Lehrkraft/Studi (Anrede „Sie"), warum (nicht) verfügbar. */
  reason: string;
}

interface NavLike {
  bluetooth?: unknown;
  hid?: unknown;
}

/**
 * Capability-Gate: prüft ohne Throw, ob eine Braillezeile koppelbar ist.
 * In jsdom / Safari / Firefox / auf dem iPad gibt es weder `bluetooth` noch
 * `hid` → `supported:false` mit klarer Begründung (saubere Degradation).
 * Der `nav`-Parameter ist injizierbar (Tests).
 */
export function brailleDisplayCapability(
  nav: NavLike | undefined = globalThis.navigator as NavLike | undefined,
): DisplayCapability {
  const bluetooth = !!nav && "bluetooth" in nav && !!nav.bluetooth;
  const hid = !!nav && "hid" in nav && !!nav.hid;
  const supported = bluetooth || hid;
  let reason: string;
  if (!nav) {
    reason = "Keine Browser-Umgebung erkannt.";
  } else if (supported) {
    const via = [bluetooth ? "Bluetooth" : null, hid ? "USB/HID" : null]
      .filter(Boolean)
      .join(" + ");
    reason = `Braillezeile koppelbar (${via}).`;
  } else {
    reason =
      "Dieser Browser unterstützt keine Braillezeilen-Kopplung. Bitte verwenden " +
      "Sie Chrome oder Edge am Computer (Web Bluetooth / WebHID — nicht in " +
      "Safari, Firefox oder auf dem iPad). Der Audio- und Bildschirmpfad bleibt " +
      "wie gewohnt verfügbar.";
  }
  return { bluetooth, hid, supported, reason };
}
