/**
 * Der Stoffplan von Plus in Spanisch - NUR, was Spanisch heute anbietet.
 *
 * ★ Ein Paket steht hier und im Generator (`bedienbareFuerSprache`, gemessen):
 *   nur wenn beides stimmt, erscheint es. Fehlt der Name, wird das Paket
 *   nicht angeboten - nie ein deutscher Name in der spanischen Oberfläche.
 *   Der Wächter `tests/plus-es.test.tsx` prüft beide Richtungen.
 * ★ Nicht angeboten (Norm nicht belegt: weglassen): alles mit Buchstaben und
 *   Einheiten, Potenzen und Wurzeln, negativen Zahlen, Rest - siehe Kopf von
 *   `braille/cmuEs.ts`. Dazu die Formen, deren Fragen im Generator deutsch
 *   sind (Zahlenfolge-Fragen, Wahr/Falsch, Fehler finden, Strategiewahl ...).
 * ★ Inhalte und Stufen sind die des Stoffplans; die Namen sind neutrales
 *   Spanisch (España und Latinoamérica) und nennen keine Schulstufe und
 *   keinen Lehrplan.
 */
import type { PlusTexte } from "./typ";

export const STOFF_ES: NonNullable<PlusTexte["stoff"]> = {
  stufen: {
    1: {
      name: "Números hasta 20",
      zahlenraum: "hasta 20",
      leitidee:
        "Aquí se decide todo lo que viene después: si un niño calcula o cuenta. Cada práctica de este nivel ayuda a dejar de contar.",
    },
    2: {
      name: "Números hasta 100",
      zahlenraum: "hasta 100",
      leitidee:
        "Las sumas y restas se vuelven automáticas y se calculan las tablas de multiplicar pequeñas. Se calcula de cabeza y por pasos; las cuentas escritas llegan más tarde.",
    },
    3: {
      name: "Números hasta 1000 y cuentas escritas",
      zahlenraum: "hasta 1000",
      leitidee:
        "Las tablas de multiplicar se vuelven automáticas y aparecen por primera vez las cuentas escritas. Calcular por pasos suele tambalearse después, por eso se practica otra vez.",
    },
    4: {
      name: "Números grandes",
      zahlenraum: "hasta un millón",
      leitidee:
        "Los mismos temas, solo que más grandes. El tamaño de los números crece poco a poco. Los cuatro métodos se repasan en cada paso.",
    },
    5: {
      name: "Decimales, fracciones y prioridad de operaciones",
      zahlenraum: "números enteros, decimales y fracciones, ninguno negativo",
      leitidee:
        "El nivel 5 ordena lo que ya hay: prioridad de operaciones, propiedades del cálculo, decimales y fracciones.",
    },
    6: {
      name: "Fracciones y porcentajes",
      zahlenraum: "fracciones y porcentajes",
      leitidee:
        "El nivel más completo. Se suman, restan, multiplican y dividen fracciones, y se usan con porcentajes en problemas de la vida diaria.",
    },
    7: {
      name: "De los problemas a las ecuaciones",
      zahlenraum: "problemas de varios pasos",
      leitidee: "Ahora las matemáticas se vuelven generales: encontrar la ecuación escondida en una historia.",
    },
    8: {
      name: "Cálculo mental y problemas de la vida diaria",
      zahlenraum: "números grandes y redondos",
      leitidee:
        "El último nivel recupera de qué trata esta aplicación desde el principio: calcular con astucia de cabeza.",
    },
  },
  pakete: {
    "1-03": "Descomponer números hasta 10",
    "1-04": "Completar 10",
    "1-05": "Usar los cincos",
    "1-06": "Dobles hasta 10",
    "1-07": "Mitades hasta 20",
    "1-08": "Sumas básicas, sin pasar la decena",
    "1-09": "Restas básicas, sin pasar la decena",
    "1-10": "Cambiar el orden",
    "1-11": "Operaciones inversas",
    "1-12": "Sumas vecinas",
    "1-13": "Sumar pasando la decena",
    "1-14": "Restar pasando la decena",
    "1-15": "El doble y uno más",
    "1-16": "Completar 20",
    "1-18": "Problemas hasta 20",
    "2-04": "Completar la siguiente decena",
    "2-05": "Completar 100",
    "2-06": "Sumar sin pasar la decena",
    "2-07": "Restar sin pasar la decena",
    "2-08": "Sumar pasando la decena",
    "2-09": "Restar pasando la decena",
    "2-10": "Dobles y mitades hasta 100",
    "2-11": "Tablas de multiplicar: las básicas",
    "2-12": "Cuadrados hasta 10",
    "2-13": "Tablas por duplicación",
    "2-14": "Tablas a partir de una vecina",
    "2-15": "Tablas mezcladas",
    "2-16": "Las tablas de dividir",
    "2-18": "Sumar por pasos",
    "2-19": "Restar por pasos",
    "2-21": "Problemas hasta 100",
    "3-03": "Completar 1000",
    "3-04": "Descomponer 1000",
    "3-05": "Sumar por pasos hasta 1000",
    "3-06": "Restar por pasos hasta 1000",
    "3-10": "Suma escrita hasta 1000",
    "3-11": "Resta escrita, completando",
    "3-12": "Resta escrita, quitando",
    "3-14": "Las tablas con seguridad",
    "3-15": "Por 10, entre 10 y tabla de las decenas",
    "3-16": "Multiplicación escrita por una cifra",
    "3-17": "División entre una cifra",
    "3-19": "Dobles y mitades hasta 1000",
    "3-21": "Problemas hasta 1000",
    "4-03": "Completar un millón",
    "4-05": "Suma escrita con números grandes",
    "4-06": "Resta escrita con números grandes",
    "4-07": "Multiplicación escrita por dos cifras",
    "4-08": "División entre un múltiplo de diez",
    "4-12": "Tablas con valor posicional",
    "4-18": "Problemas con números grandes",
    "5-03": "Prioridad de operaciones sin paréntesis",
    "5-04": "Prioridad de operaciones con paréntesis",
    "5-05": "Usar las propiedades del cálculo",
    "5-07": "Mover la coma decimal",
    "5-14": "Ampliar y simplificar fracciones",
    "5-15": "Ordenar y comparar fracciones",
    "5-19": "Problemas con medidas",
    "6-09": "Sumar fracciones, mismo denominador",
    "6-10": "Sumar fracciones, distinto denominador",
    "6-11": "Restar fracciones, mismo denominador",
    "6-12": "Restar fracciones, distinto denominador",
    "6-13": "Fracción por un número entero",
    "6-14": "Fracción por fracción",
    "6-15": "Fracción entre un número entero",
    "6-16": "Fracción entre fracción",
    "6-17": "Las cuatro operaciones con fracciones",
    "6-24": "Problemas con fracciones y porcentajes",
    "7-20": "De los problemas a las ecuaciones",
    "8-14": "Cálculo mental con números grandes",
    "8-15": "Números redondos",
    "8-16": "El truco del camarero",
    "8-20": "Problemas de la vida diaria",
  },
};
