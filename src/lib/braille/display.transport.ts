/**
 * Phase X — echte Hardware-Anbindung der Braillezeile (Web Bluetooth + WebHID).
 *
 * ⚠️ SPIKE-STAND: Die Verbindungs-/Schreib-/Lese-Logik ist implementiert und
 * typsicher, aber OHNE echtes Gerät NICHT verifiziert
 * (siehe braille-spec/SPIKE-BRAILLEZEILE-ERGEBNIS.md → Ergebnis „gelb").
 * Ohne Browser-Unterstützung oder Gerät degradiert jeder Aufruf SAUBER
 * (kein Throw) auf `{ ok:false, reason }`, damit der Audio-/Bildschirmpfad
 * niemals blockiert wird.
 *
 * Die reine, getestete Mapping-/Capability-Logik liegt in `display.ts`.
 *
 * Hinweise zur Realität (Spike-Erkenntnisse):
 *  - Web Bluetooth & WebHID gibt es NUR in Chromium (Chrome/Edge/Opera) am
 *    Desktop — nicht in Safari/Firefox und nicht auf dem iPad.
 *  - `requestDevice()` MUSS aus einer Nutzergeste (Klick) heraus aufgerufen
 *    werden, sonst wirft der Browser. Daher ist `connectBrailleDisplay` als
 *    Einstieg für einen „Koppeln"-Button gedacht.
 *  - Es gibt KEINEN universellen Braille-GATT-Dienst. Viele BT-Zeilen sprechen
 *    ein serielles Protokoll über Nordic UART (NUS); das Zell-Byte-Format ist
 *    teils vendor-spezifisch. Für USB ist die HID-Braille-Usage-Page (0x41)
 *    standardisiert und der direkte Weg.
 */
import { brailleDisplayCapability, DEFAULT_DISPLAY_CELLS } from "./display";

// --- Minimal-Typen für die wirklich genutzte Browser-Oberfläche ---------------
// (Kein @types/web-bluetooth/@types/w3c-web-hid im Projekt; nur was wir aufrufen.)

interface HidInputReportEvent {
  data: DataView;
  reportId: number;
}
interface HidDevice {
  open(): Promise<void>;
  close(): Promise<void>;
  sendReport(reportId: number, data: Uint8Array): Promise<void>;
  addEventListener(
    type: "inputreport",
    listener: (e: HidInputReportEvent) => void,
  ): void;
  removeEventListener(
    type: "inputreport",
    listener: (e: HidInputReportEvent) => void,
  ): void;
}
interface HidApi {
  requestDevice(opts: {
    filters: Array<{ usagePage?: number }>;
  }): Promise<HidDevice[]>;
}

interface BleCharacteristic {
  writeValueWithoutResponse?(value: Uint8Array): Promise<void>;
  writeValue(value: Uint8Array): Promise<void>;
  startNotifications(): Promise<BleCharacteristic>;
  addEventListener(
    type: "characteristicvaluechanged",
    listener: (e: Event) => void,
  ): void;
  value?: DataView;
}
interface BleService {
  getCharacteristic(uuid: string): Promise<BleCharacteristic>;
}
interface BleGatt {
  connected: boolean;
  connect(): Promise<BleGatt>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<BleService>;
}
interface BleDevice {
  name?: string;
  gatt?: BleGatt;
}
interface BluetoothApi {
  requestDevice(opts: {
    filters?: Array<{ services?: string[] }>;
    optionalServices?: string[];
    acceptAllDevices?: boolean;
  }): Promise<BleDevice>;
}

interface NavWithDisplays {
  bluetooth?: unknown;
  hid?: unknown;
}

// --- Konstanten ---------------------------------------------------------------

/** Nordic UART Service — häufigster serieller BLE-Transport für Zeilen. */
const NUS_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
/** NUS RX — App schreibt an die Zeile (Zellen-Ausgabe). */
const NUS_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
/** NUS TX — Zeile meldet Tasten an die App (Notifications). */
const NUS_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
/** Standardisierte HID-Usage-Page für Braille-Displays. */
const HID_BRAILLE_USAGE_PAGE = 0x41;
/** Report-ID 0 = Geräte ohne Report-IDs. */
const HID_REPORT_ID = 0;

// --- Öffentliche Schnittstelle ------------------------------------------------

/** Eine Tasteneingabe der Zeile (Roh-Report; Dekodierung treiberspezifisch). */
export interface BrailleKeyReport {
  raw: Uint8Array;
}

/** Verbundene Braillezeile — einheitliche API über beide Transporte. */
export interface BrailleDisplayHandle {
  kind: "bluetooth" | "hid";
  /** Zellenzahl der physischen Zeile (Fallback DEFAULT_DISPLAY_CELLS). */
  numCells: number;
  /** Zellen-Bytes (aus `display.cellsToDeviceBytes`) an die Zeile schreiben. */
  write(bytes: Uint8Array): Promise<void>;
  /** Tasten-Reports abonnieren; Rückgabe = Abmelde-Funktion. */
  onKeys(cb: (report: BrailleKeyReport) => void): () => void;
  /** Verbindung trennen (idempotent, kein Throw). */
  disconnect(): Promise<void>;
}

export type ConnectResult =
  | { ok: true; handle: BrailleDisplayHandle }
  | { ok: false; reason: string };

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Braillezeile koppeln. Aus einer Nutzergeste (Klick) aufrufen.
 * Gibt bei fehlender Browser-Unterstützung sauber `{ ok:false }` zurück
 * (kein Throw). `prefer` wählt den primären Transport; `nav` ist injizierbar.
 */
export async function connectBrailleDisplay(
  prefer: "bluetooth" | "hid" = "bluetooth",
  nav: NavWithDisplays | undefined = globalThis.navigator as
    | NavWithDisplays
    | undefined,
): Promise<ConnectResult> {
  const cap = brailleDisplayCapability(nav);
  if (!cap.supported || !nav) return { ok: false, reason: cap.reason };

  const useHid = cap.hid && (prefer === "hid" || !cap.bluetooth);
  if (useHid) return connectHid(nav.hid as HidApi);
  return connectBluetooth(nav.bluetooth as BluetoothApi);
}

// --- WebHID (USB-Zeilen) ------------------------------------------------------

async function connectHid(api: HidApi): Promise<ConnectResult> {
  let devices: HidDevice[];
  try {
    devices = await api.requestDevice({
      filters: [{ usagePage: HID_BRAILLE_USAGE_PAGE }],
    });
  } catch (e) {
    return { ok: false, reason: `USB-Kopplung fehlgeschlagen: ${errMsg(e)}` };
  }
  const device = devices[0];
  if (!device) return { ok: false, reason: "Keine HID-Braillezeile ausgewählt." };
  try {
    await device.open();
  } catch (e) {
    return { ok: false, reason: `Gerät ließ sich nicht öffnen: ${errMsg(e)}` };
  }

  const listeners = new Set<(r: BrailleKeyReport) => void>();
  const onInput = (e: HidInputReportEvent): void => {
    const view = e.data;
    const raw = new Uint8Array(
      view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength),
    );
    for (const cb of listeners) cb({ raw });
  };
  device.addEventListener("inputreport", onInput);

  const handle: BrailleDisplayHandle = {
    kind: "hid",
    numCells: DEFAULT_DISPLAY_CELLS,
    async write(bytes) {
      await device.sendReport(HID_REPORT_ID, bytes);
    },
    onKeys(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async disconnect() {
      device.removeEventListener("inputreport", onInput);
      listeners.clear();
      try {
        await device.close();
      } catch {
        /* idempotent */
      }
    },
  };
  return { ok: true, handle };
}

// --- Web Bluetooth (BLE-Zeilen über Nordic UART) ------------------------------

async function connectBluetooth(api: BluetoothApi): Promise<ConnectResult> {
  let device: BleDevice;
  try {
    device = await api.requestDevice({
      filters: [{ services: [NUS_SERVICE] }],
      optionalServices: [NUS_SERVICE],
    });
  } catch (e) {
    return { ok: false, reason: `Bluetooth-Kopplung fehlgeschlagen: ${errMsg(e)}` };
  }
  const gatt = device.gatt;
  if (!gatt) return { ok: false, reason: "Gerät bietet keinen GATT-Zugang." };

  let rx: BleCharacteristic;
  let tx: BleCharacteristic;
  try {
    await gatt.connect();
    const service = await gatt.getPrimaryService(NUS_SERVICE);
    rx = await service.getCharacteristic(NUS_RX);
    tx = await service.getCharacteristic(NUS_TX);
    await tx.startNotifications();
  } catch (e) {
    try {
      gatt.disconnect();
    } catch {
      /* ignore */
    }
    return { ok: false, reason: `Dienst nicht gefunden: ${errMsg(e)}` };
  }

  const listeners = new Set<(r: BrailleKeyReport) => void>();
  const onValue = (e: Event): void => {
    const target = e.target as { value?: DataView } | null;
    const view = target?.value;
    if (!view) return;
    const raw = new Uint8Array(
      view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength),
    );
    for (const cb of listeners) cb({ raw });
  };
  tx.addEventListener("characteristicvaluechanged", onValue);

  const handle: BrailleDisplayHandle = {
    kind: "bluetooth",
    numCells: DEFAULT_DISPLAY_CELLS,
    async write(bytes) {
      if (rx.writeValueWithoutResponse) await rx.writeValueWithoutResponse(bytes);
      else await rx.writeValue(bytes);
    },
    onKeys(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async disconnect() {
      listeners.clear();
      try {
        gatt.disconnect();
      } catch {
        /* idempotent */
      }
    },
  };
  return { ok: true, handle };
}
