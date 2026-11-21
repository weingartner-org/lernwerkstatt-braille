/**
 * Zahlen-Detektiv - Hinweise, bis genau eine Zahl übrig bleibt.
 *
 * Beleg: BEFUND-2026-09-25-SCHULBUECHER-NEUE-FORMATE.md, B3 - „Zwischen 30
 * und 39. Durch 3 bleibt Rest 1." (Beleg im Ursprungs-Repository×).
 *
 * ★★★ Eindeutigkeit wird nicht behauptet, sondern DURCHSUCHT: ein Hinweis
 * kommt nur in die Angabe, wenn er die Kandidatenmenge tatsächlich
 * verkleinert - nie ein überflüssiger Hinweis. Reicht das fachliche
 * Repertoire nicht aus (z. B. bei Stufe 1 nur gerade/ungerade), zieht sich das
 * anfängliche Zahlenfenster enger zusammen: für ganze Zahlen schließt
 * „größer als n-1 und kleiner als n+1" IMMER genau eine Zahl ein.
 */
import type { Aufgabe } from "../aufgabe";
import { ganz, eines, gemischt } from "../aufgabe";
import { ohneWiederholung } from "./hilfen";

function quersumme(n: number): number {
  return String(Math.abs(n)).split("").reduce((s, z) => s + Number(z), 0);
}

function istPrim(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function istQuadratzahl(n: number): boolean {
  const w = Math.round(Math.sqrt(n));
  return w * w === n;
}

function teilerVon(n: number): number[] {
  const t: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i);
  return t;
}

/**
 * Der Zahlenraum, in dem gesucht wird - wächst mit der Schulstufe.
 * ★ Stufe 1 bleibt ganz unter 20 - auch die Fenstergrenzen selbst, nicht nur
 * die gesuchte Zahl.
 */
function zahlenraum(stufe: number): [number, number] {
  if (stufe <= 1) return [5, 19];
  if (stufe === 2) return [10, 40];
  if (stufe <= 4) return [20, 150];
  if (stufe <= 6) return [10, 300];
  return [10, 1000];
}

interface Hinweis { text: string; test: (x: number) => boolean }

/** Nur Hinweise, die für DIESE Zahl auch wahr sind - ein Rätsel lügt nicht. */
function hinweisPool(n: number, stufe: number, rng: () => number): Hinweis[] {
  const pool: Hinweis[] = [
    n % 2 === 0
      ? { text: "Ich bin gerade.", test: (x) => x % 2 === 0 }
      : { text: "Ich bin ungerade.", test: (x) => x % 2 !== 0 },
  ];
  // Stufe 3-4: Rest beim Teilen und Ziffernsumme (Steckbrief-Stil aus Beleg im Ursprungs-Repository/Beleg im Ursprungs-Repository).
  if (stufe >= 3 && stufe <= 4) {
    const teiler = eines(rng, [3, 4, 5, 6, 7, 9]);
    const rest = n % teiler;
    pool.push({
      text: rest === 0 ? `Ich bin durch ${teiler} teilbar.` : `Teile ich durch ${teiler}, bleibt ${rest} Rest.`,
      test: (x) => x % teiler === rest,
    });
    pool.push({ text: `Meine Quersumme ist ${quersumme(n)}.`, test: (x) => quersumme(x) === quersumme(n) });
  }
  // Stufe 5-8: Teiler, Vielfache, Quadratzahl, Primzahl.
  if (stufe >= 5) {
    const k = ganz(rng, 2, 5);
    const vielfaches = n * k;
    pool.push({ text: `Ich bin ein Teiler von ${vielfaches}.`, test: (x) => x > 0 && vielfaches % x === 0 });
    const teilerVonN = teilerVon(n).filter((d) => d > 1 && d < n);
    if (teilerVonN.length) {
      const d = eines(rng, teilerVonN);
      pool.push({ text: `Ich bin ein Vielfaches von ${d}.`, test: (x) => x % d === 0 });
    }
    if (istQuadratzahl(n)) pool.push({ text: "Ich bin eine Quadratzahl.", test: istQuadratzahl });
    if (istPrim(n)) pool.push({ text: "Ich bin eine Primzahl.", test: istPrim });
  }
  return pool;
}

export function zahlenDetektiv(stufe: number, rng: () => number, bekannt?: readonly string[]): Aufgabe {
  return ohneWiederholung(bekannt, () => {
    const [von, bis] = zahlenraum(stufe);
    const n = ganz(rng, von, bis);

    // Das erste Zahlenfenster - mit Mindestabstand auf beiden Seiten, damit
    // danach IMMER noch mindestens ein weiterer Hinweis nötig ist. Ein
    // Fenster, das die Zahl schon allein einschließt, wäre kein Rätsel mehr,
    // nur eine Behauptung.
    const breite = stufe <= 1 ? 4 : stufe === 2 ? 6 : stufe <= 4 ? 10 : stufe <= 6 ? 15 : 30;
    let a = Math.max(von - 1, n - ganz(rng, 2, breite));
    let b = Math.min(bis + 1, n + ganz(rng, 2, breite));
    let kandidaten: number[] = [];
    for (let x = von; x <= bis; x++) if (x > a && x < b) kandidaten.push(x);
    // Nahe am Rand des Zahlenraums kann das Fenster geklappt werden - dann
    // lieber den ganzen Raum zeigen und die Eigenschafts-Hinweise arbeiten
    // lassen (die Parität schneidet einen zusammenhängenden Bereich immer).
    if (kandidaten.length < 3) {
      a = von - 1;
      b = bis + 1;
      kandidaten = [];
      for (let x = von; x <= bis; x++) kandidaten.push(x);
    }

    const hinweise = [`Ich bin größer als ${a} und kleiner als ${b}.`];
    const pool = gemischt(rng, hinweisPool(n, stufe, rng));
    for (const h of pool) {
      if (kandidaten.length <= 1) break;
      const neu = kandidaten.filter(h.test);
      // ★ Nur aufnehmen, wenn der Hinweis wirklich etwas ausschließt.
      if (neu.length < kandidaten.length && neu.length >= 1) {
        kandidaten = neu;
        hinweise.push(h.text);
      }
    }
    if (kandidaten.length > 1) {
      // Fallback, der IMMER greift: eine EINSEITIGE Grenze direkt neben der
      // gesuchten Zahl - „Ich bin kleiner als 7.", nötigenfalls dazu „Ich bin
      // größer als 3.". ★ Nie ein zweites, enges Fenster „größer als 4 und
      // kleiner als 6": das verriet die Zahl und machte die Hinweise davor
      // überflüssig (Probelauf 26.09.2026, Stufe 1).
      const drueber = kandidaten.filter((x) => x > n);
      const drunter = kandidaten.filter((x) => x < n);
      if (drueber.length) {
        const grenze = Math.min(...drueber);
        hinweise.push(`Ich bin kleiner als ${grenze}.`);
        kandidaten = kandidaten.filter((x) => x < grenze);
      }
      if (drunter.length) {
        const grenze = Math.max(...drunter);
        hinweise.push(`Ich bin größer als ${grenze}.`);
        kandidaten = kandidaten.filter((x) => x > grenze);
      }
    }

    const angabe = [...hinweise, "Wer bin ich?", "Die Zahl =[]"].join("\n");
    const tipp = stufe <= 2
      ? "Streich Zahlen, bis nur eine bleibt."
      : stufe <= 4
        ? "Schreib alle passenden Zahlen auf und streiche der Reihe nach."
        : stufe <= 6
          ? "Schreib die passenden Zahlen auf und streiche mit jedem Hinweis."
          : "Schreib dir alle passenden Zahlen auf und streiche mit jedem Hinweis, bis nur eine bleibt.";
    const aufgabe: Aufgabe = {
      paket: `raetsel-${stufe}`, art: "knobel", op: "zahlen", titel: "Zahlen-Detektiv",
      angabe, loesung: String(n), zahlen: [n],
      tipp,
      erklaerung: `Nur ${n} passt zu allen Hinweisen gleichzeitig.`,
    };
    return aufgabe;
  });
}
