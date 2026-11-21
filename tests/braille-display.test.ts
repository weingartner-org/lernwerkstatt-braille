import { describe, expect, it, vi } from "vitest";
import {
  HID_DOT_ORDER,
  DEFAULT_DISPLAY_CELLS,
  cellToDeviceByte,
  cellsToDeviceBytes,
  unicodeToDeviceBytes,
  fitToLine,
  fairTactileMs,
  brailleDisplayCapability,
} from "@/lib/braille/display";
import { dots, cellToUnicode } from "@/lib/braille/cell";
import { connectBrailleDisplay } from "@/lib/braille/display.transport";

describe("Phase X — display.ts: Unicode-Zelle → Geräte-Byte (Golden)", () => {
  it("Standard-Reihenfolge ist die Identität (HID-Braille = Unicode-Bitlage)", () => {
    expect(HID_DOT_ORDER).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    // Punkt n → Bit n-1: jede Einzel-Punkt-Zelle = 1<<(n-1)
    for (let dot = 1; dot <= 8; dot++) {
      const cell = dots(dot);
      expect(cellToDeviceByte(cell)).toBe(1 << (dot - 1));
    }
  });

  it("Golden je Bitmaske: bekannte Buchstaben-Zellen", () => {
    // a = Punkt 1 = 0x01; b = 1,2 = 0x03; l = 1,2,3 = 0x07; voller 8-Punkt = 0xFF
    expect(cellToDeviceByte(dots(1))).toBe(0x01);
    expect(cellToDeviceByte(dots(1, 2))).toBe(0x03);
    expect(cellToDeviceByte(dots(1, 2, 3))).toBe(0x07);
    expect(cellToDeviceByte(dots(1, 2, 4))).toBe(0x0b); // m
    expect(cellToDeviceByte(dots(1, 2, 3, 4, 5, 6, 7, 8))).toBe(0xff);
    expect(cellToDeviceByte(0)).toBe(0x00); // Leerzelle
  });

  it("alternative DotOrder remappt die Bits korrekt", () => {
    // Spiegel-Reihenfolge: Punkt 1→Bit7, Punkt 2→Bit6, …, Punkt 8→Bit0
    const mirror = [7, 6, 5, 4, 3, 2, 1, 0] as const;
    expect(cellToDeviceByte(dots(1), mirror)).toBe(1 << 7); // 0x80
    expect(cellToDeviceByte(dots(8), mirror)).toBe(1 << 0); // 0x01
    expect(cellToDeviceByte(dots(1, 2, 3), mirror)).toBe(0xe0);
  });

  it("unicodeToDeviceBytes: U+2800-String → Bytefolge", () => {
    const brl = cellToUnicode(dots(1)) + cellToUnicode(dots(1, 2)) + cellToUnicode(0);
    const bytes = unicodeToDeviceBytes(brl);
    expect(Array.from(bytes)).toEqual([0x01, 0x03, 0x00]);
  });

  it("cellsToDeviceBytes liefert ein Byte je Zelle", () => {
    const bytes = cellsToDeviceBytes([dots(1), dots(1, 4), dots(2, 5)]);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(3);
  });
});

describe("Phase X — display.ts: fitToLine (Zeilenbreite)", () => {
  it("füllt rechts mit Leerzellen auf", () => {
    const out = fitToLine(Uint8Array.from([1, 2, 3]), 5);
    expect(Array.from(out)).toEqual([1, 2, 3, 0, 0]);
  });
  it("schneidet Überlänge ab", () => {
    const out = fitToLine(Uint8Array.from([1, 2, 3, 4, 5]), 3);
    expect(Array.from(out)).toEqual([1, 2, 3]);
  });
  it("Breite 0 ergibt leere Zeile, kein Throw", () => {
    expect(Array.from(fitToLine(Uint8Array.from([1, 2]), 0))).toEqual([]);
    expect(() => fitToLine(Uint8Array.from([1]), -5)).not.toThrow();
  });
  it("DEFAULT_DISPLAY_CELLS ist 40", () => {
    expect(DEFAULT_DISPLAY_CELLS).toBe(40);
  });
});

describe("Phase X — display.ts: faire taktile Zeit", () => {
  it("zieht Vorlese- UND Tastzeit ab", () => {
    expect(fairTactileMs(10000, 2000, 3000)).toBe(5000);
  });
  it("nie negativ", () => {
    expect(fairTactileMs(1000, 2000, 3000)).toBe(0);
  });
  it("negative Abzüge werden auf 0 geklammert (robust)", () => {
    expect(fairTactileMs(5000, -100, -100)).toBe(5000);
  });
});

describe("Phase X — display.ts: Capability-Gate / saubere Degradation", () => {
  it("jsdom-Default-Navigator (ohne bluetooth/hid): nicht unterstützt, kein Throw", () => {
    // Default-Parameter = globalThis.navigator (in jsdom vorhanden, aber ohne
    // bluetooth/hid) → exakt der reale Safari/Firefox/iPad-Degradationsfall.
    const cap = brailleDisplayCapability();
    expect(cap.supported).toBe(false);
    expect(cap.bluetooth).toBe(false);
    expect(cap.hid).toBe(false);
    expect(cap.reason).toMatch(/Chrome oder Edge/);
  });

  it("leerer navigator (jsdom): nicht unterstützt, klare Begründung", () => {
    const cap = brailleDisplayCapability({});
    expect(cap.supported).toBe(false);
    expect(cap.reason).toMatch(/Chrome oder Edge/);
    expect(cap.reason).toMatch(/Audio-/);
  });

  it("erkennt Bluetooth", () => {
    const cap = brailleDisplayCapability({ bluetooth: {} });
    expect(cap.bluetooth).toBe(true);
    expect(cap.supported).toBe(true);
    expect(cap.reason).toMatch(/Bluetooth/);
  });

  it("erkennt HID", () => {
    const cap = brailleDisplayCapability({ hid: {} });
    expect(cap.hid).toBe(true);
    expect(cap.supported).toBe(true);
    expect(cap.reason).toMatch(/USB\/HID/);
  });

  it("erkennt beide Transporte", () => {
    const cap = brailleDisplayCapability({ bluetooth: {}, hid: {} });
    expect(cap.supported).toBe(true);
    expect(cap.reason).toMatch(/Bluetooth \+ USB\/HID/);
  });
});

describe("Phase X — display.transport.ts: connect degradiert ohne Hardware", () => {
  it("ohne navigator: { ok:false }, kein Throw", async () => {
    const res = await connectBrailleDisplay("bluetooth", undefined);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/Browser-Umgebung|Chrome/);
  });

  it("leerer navigator: { ok:false } mit Klartext", async () => {
    const res = await connectBrailleDisplay("bluetooth", {});
    expect(res.ok).toBe(false);
  });

  it("mock-HID: connect, write, onKeys, disconnect verdrahtet korrekt", async () => {
    // Fake-HID-Gerät — testet die Glue-Logik (echtes Gerät bleibt unverifiziert)
    const sent: Array<{ id: number; bytes: number[] }> = [];
    // Holder-Objekt: vermeidet Control-Flow-Narrowing auf null im Closure.
    const hook: { input?: (e: { data: DataView; reportId: number }) => void } = {};
    const fakeDevice = {
      open: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
      sendReport: vi.fn(async (id: number, data: Uint8Array) => {
        sent.push({ id, bytes: Array.from(data) });
      }),
      addEventListener: vi.fn((_t: string, l: (e: { data: DataView; reportId: number }) => void) => {
        hook.input = l;
      }),
      removeEventListener: vi.fn(),
    };
    const fakeHid = { requestDevice: vi.fn(async () => [fakeDevice]) };

    const res = await connectBrailleDisplay("hid", { hid: fakeHid });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.handle.kind).toBe("hid");
    expect(res.handle.numCells).toBe(DEFAULT_DISPLAY_CELLS);

    await res.handle.write(Uint8Array.from([0x01, 0x03]));
    expect(sent).toHaveLength(1);
    expect(sent[0].bytes).toEqual([0x01, 0x03]);

    const keys: number[][] = [];
    const off = res.handle.onKeys((r) => keys.push(Array.from(r.raw)));
    const buf = Uint8Array.from([0x42, 0x00]).buffer;
    hook.input?.({ data: new DataView(buf), reportId: 0 });
    expect(keys).toEqual([[0x42, 0x00]]);

    off();
    hook.input?.({ data: new DataView(buf), reportId: 0 });
    expect(keys).toHaveLength(1); // nach Abmeldung kein weiterer Report

    await res.handle.disconnect();
    expect(fakeDevice.close).toHaveBeenCalled();
  });

  it("mock-HID ohne Geräteauswahl: { ok:false }", async () => {
    const fakeHid = { requestDevice: vi.fn(async () => []) };
    const res = await connectBrailleDisplay("hid", { hid: fakeHid });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/ausgewählt/);
  });

  it("mock-HID requestDevice-Abbruch: { ok:false }, kein Throw", async () => {
    const fakeHid = {
      requestDevice: vi.fn(async () => {
        throw new Error("Abgebrochen");
      }),
    };
    const res = await connectBrailleDisplay("hid", { hid: fakeHid });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/fehlgeschlagen|Abgebrochen/);
  });
});
