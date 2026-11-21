/**
 * Rechengeschichten para español - NEU geschrieben, nicht übersetzt
 * (Bauplan 2026-11-06 §5 Nr. 4: „Textaufgaben je Sprache neu, mit Namen und
 * Dingen, die dort üblich sind").
 *
 * ★ Dieselben Pakete und dieselben Zahlenräume wie `sachaufgaben.ts` (je
 *   Stufe), gleiche Regeln: kurze Sätze, jeder Satz eine Zeile, die Zahlen als
 *   Ziffern, Namen ohne Rollenbild.
 * ★ Spanisch für Spanien UND Lateinamerika: Euro und Céntimos, Kilómetros,
 *   Canicas, Galletas, Autobús. Keine Wörter, die nur eine Region versteht
 *   (kein „cromos", „guagua", „coche/carro" nur als „coche" wo nötig), keine
 *   österreichischen Dinge (kein „Nachlass", keine „dag").
 * ★ Alle Einheiten ausgeschrieben („metros", „kilos"), nie „m" oder „kg" in
 *   der Geschichte: der Text wird vorgelesen und in Braille gelesen.
 * ★★ DIE ANTWORT IST EINE BLOSSE ZAHL. Die Frage nennt die Einheit („¿Cuántos
 *   euros ...?"). Grund: Die CMU hat im Befund keine belegte Seite für das
 *   Eurozeichen und keine Regel für Einheiten-Buchstaben (siehe Kopf von
 *   `braille/cmuEs.ts`) - eine Antwort mit Einheit könnte ein Kind in Braille
 *   nicht schreiben. Der Text steht über dem Feld und läuft in der Tabelle des
 *   Kindes; er braucht keine Mathe-Zellen.
 * ★ Das Dezimalzeichen im Text ist das Komma (`{b},{c} euros`), wie in der Antwort.
 * ★ Bruch im Text als `{b}/5` (Ziffern, kein Wort): „1 cuartos" gäbe es sonst.
 *   Die Sprachausgabe (`sprechen/rechnenEs.ts`) macht „un quinto", „tres quintos".
 * ★ Hauptwörter hinter Zahlen: männlich oder weiblich werden beim Vorlesen
 *   angeglichen (21 -> „veintiún libros", „veintiuna manzanas") - darum keine
 *   männlichen Wörter auf -a („día", „mapa") direkt hinter einer Zahl.
 * ★ Kein Rest: Aufgaben mit Rest gibt es in Spanisch nicht (keine Norm).
 */
import type { SachVorlage } from "./sachaufgaben";

/** Namen aus der spanischsprachigen Welt - kurz, verschieden, ohne Rollenbild. */
export const NAMEN_ES = [
  "Lucía", "Mateo", "Sofía", "Hugo", "Valeria", "Leo", "Daniela", "Martín", "Emma", "Diego",
  "Ana", "Pablo", "Camila", "Santiago", "Julia", "Nico", "Paula", "Andrés", "Marina", "Iván",
];

const STUFE1: SachVorlage[] = [
  { text: "{n} tiene {a} canicas. {n} encuentra {b} más. ¿Cuántas tiene ahora?",
    op: "plus", a: [3, 12], b: [2, 8], rechne: (a, b) => a + b },
  { text: "En el plato hay {a} galletas. {n} se come {b}. ¿Cuántas quedan?",
    op: "minus", a: [6, 18], b: [2, 6], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} tiene {a} pegatinas. Alguien le da {b} más. ¿Cuántas son?",
    op: "plus", a: [5, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "{a} personas juegan en el patio. {b} entran a clase. ¿Cuántas quedan?",
    op: "minus", a: [8, 20], b: [2, 8], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} tiene {a} céntimos. {n} encuentra {b} céntimos. ¿Cuántos céntimos tiene ahora?",
    op: "plus", a: [4, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "En el autobús van {a} personas. En la parada bajan {b}. ¿Cuántas siguen dentro?",
    op: "minus", a: [8, 20], b: [2, 7], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} hornea {a} magdalenas. Luego {b} más. ¿Cuántas magdalenas son?",
    op: "plus", a: [5, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "{n} necesita {a} bolitas. Tiene {b}. ¿Cuántas más necesita?",
    op: "minus", a: [10, 20], b: [3, 9], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{a} patos nadan en el estanque. {b} se van nadando. ¿Cuántos quedan?",
    op: "minus", a: [9, 20], b: [3, 8], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "En el prado hay {a} vacas. Llegan {b} más. ¿Cuántas vacas hay ahora?",
    op: "plus", a: [4, 12], b: [2, 8], rechne: (a, b) => a + b },
];

const STUFE2: SachVorlage[] = [
  { text: "La clase tiene {a} libros. Llegan {b} más. ¿Cuántos libros hay ahora?",
    op: "plus", a: [20, 70], b: [10, 30], rechne: (a, b) => a + b },
  { text: "{n} ha ahorrado {a} céntimos. {n} gasta {b}. ¿Cuántos céntimos quedan?",
    op: "minus", a: [30, 95], b: [10, 28], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "Una bolsa tiene {a} nueces. {n} saca {b}. ¿Cuántas quedan en la bolsa?",
    op: "minus", a: [40, 99], b: [12, 35], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} corre {a} metros. Luego otros {b} metros. ¿Cuántos metros son?",
    op: "plus", a: [20, 60], b: [15, 40], rechne: (a, b) => a + b },
  { text: "{n} pone {b} huevos en cada caja. Hay {a} cajas llenas. ¿Cuántos huevos son?",
    op: "mal", a: [3, 9], b: [2, 10], rechne: (a, b) => a * b },
  { text: "{a} galletas van a {b} platos. ¿Cuántas van a cada plato?",
    op: "geteilt", a: [12, 60], b: [2, 6], rechne: (a, b) => a / b, passt: (a, b) => a % b === 0 },
  { text: "Cada fila tiene {b} sillas. Hay {a} filas. ¿Cuántas sillas son?",
    op: "mal", a: [3, 9], b: [3, 10], rechne: (a, b) => a * b },
  { text: "{n} tiene {a} cartas. {n} pierde {b}. ¿Cuántas cartas quedan?",
    op: "minus", a: [40, 90], b: [15, 30], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{b} personas se reparten {a} manzanas. ¿Cuántas manzanas recibe cada una?",
    op: "geteilt", a: [12, 60], b: [3, 6], rechne: (a, b) => a / b, passt: (a, b) => a % b === 0 },
  { text: "{n} ha leído {a} páginas. El libro tiene {b} páginas. ¿Cuántas páginas faltan?",
    op: "minus", a: [20, 60], b: [70, 99], rechne: (a, b) => b - a, passt: (a, b) => b > a },
  { text: "Un autobús lleva {a} personas. Suben {b} más. ¿Cuántas personas van ahora?",
    op: "plus", a: [20, 60], b: [8, 25], rechne: (a, b) => a + b },
];

const STUFE3: SachVorlage[] = [
  { text: "Una escuela tiene {a} alumnos. {b} vienen en autobús. {c} vienen andando. ¿Cuántos vienen en bici?",
    op: "minus", a: [300, 900], b: [80, 300], c: [50, 250], rechne: (a, b, c) => a - b - c,
    passt: (a, b, c) => a - b - c > 0 },
  { text: "{n} consigue {a} puntos. Luego {b} más. Después {n} pierde {c}. ¿Cuántos puntos quedan?",
    op: "gemischt", a: [120, 500], b: [60, 300], c: [40, 200], rechne: (a, b, c) => a + b - c,
    passt: (a, b, c) => a + b - c > 0 && a + b <= 1000 },
  { text: "Un libro tiene {a} páginas. {n} lee {b}. Al día siguiente lee {c}. ¿Cuántas páginas faltan?",
    op: "minus", a: [200, 900], b: [50, 200], c: [40, 180], rechne: (a, b, c) => a - b - c,
    passt: (a, b, c) => a - b - c > 0 },
  { text: "Una tienda tiene {a} botellas. Llegan {b} cajas de {c} botellas. ¿Cuántas botellas hay ahora?",
    op: "gemischt", a: [100, 400], b: [3, 9], c: [6, 12], rechne: (a, b, c) => a + b * c,
    passt: (a, b, c) => a + b * c <= 1000 },
  { text: "{n} tiene {a} céntimos. {n} compra {b} lápices de {c} céntimos cada uno. ¿Cuántos céntimos quedan?",
    op: "gemischt", a: [50, 200], b: [3, 8], c: [4, 12], rechne: (a, b, c) => a - b * c,
    passt: (a, b, c) => a - b * c > 0 },
  { text: "Una sala tiene {b} filas de {c} sillas. Hay {a} sillas ocupadas. ¿Cuántas están libres?",
    op: "gemischt", a: [50, 300], b: [8, 20], c: [10, 25], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 && b * c <= 1000 },
  { text: "{a} manzanas van a {b} cajas. ¿Cuántas manzanas hay en cada caja?",
    op: "geteilt", a: [120, 600], b: [4, 10], c: [0, 0], rechne: (a, b) => a / b,
    passt: (a, b) => a % b === 0 },
  { text: "{n} ahorra {c} céntimos por semana durante {b} semanas. Luego recibe {a} céntimos. ¿Cuántos céntimos son?",
    op: "gemischt", a: [20, 150], b: [5, 15], c: [4, 20], rechne: (a, b, c) => a + b * c,
    passt: (a, b, c) => a + b * c <= 1000 },
  { text: "Un tren tiene {b} vagones con {c} asientos cada uno. Hay {a} asientos ocupados. ¿Cuántos están libres?",
    op: "gemischt", a: [50, 300], b: [5, 12], c: [20, 60], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 && b * c <= 1000 },
  { text: "{a} personas van de excursión. Cada autocar lleva {b}. ¿Cuántos autocares necesitan?",
    op: "geteilt", a: [60, 400], b: [20, 50], c: [0, 0], rechne: (a, b) => Math.ceil(a / b),
    passt: (a, b) => a > b },
];

const STUFE4: SachVorlage[] = [
  { text: "Una ciudad tiene {a} habitantes. Llegan {b} y se van {c}. ¿Cuántos habitantes tiene ahora?",
    op: "gemischt", a: [20000, 90000], b: [500, 4000], c: [400, 3000], rechne: (a, b, c) => a + b - c },
  { text: "Una fábrica hace {b} ruedas al día. ¿Cuántas ruedas son en {c} días?",
    op: "mal", a: [0, 0], b: [120, 900], c: [10, 40], rechne: (_a, b, c) => b * c },
  { text: "{a} folletos van a {b} colegios. ¿Cuántos folletos recibe cada colegio?",
    op: "geteilt", a: [1200, 90000], b: [4, 25], c: [0, 0], rechne: (a, b) => a / b,
    passt: (a, b) => a % b === 0 },
  { text: "{n} cuenta visitas: {a}, {b} y {c}. ¿Cuál es la media?",
    op: "gemischt", a: [300, 5000], b: [300, 5000], c: [300, 5000], rechne: (a, b, c) => (a + b + c) / 3,
    passt: (a, b, c) => (a + b + c) % 3 === 0 },
  { text: "Un campo mide {b} metros de largo y {c} metros de ancho. ¿Cuántos metros cuadrados son?",
    op: "mal", a: [0, 0], b: [40, 400], c: [20, 200], rechne: (_a, b, c) => b * c },
  { text: "{n} conduce {b} kilómetros de ida. Hace el viaje {c} veces al año, ida y vuelta. ¿Cuántos kilómetros son?",
    op: "gemischt", a: [0, 0], b: [40, 500], c: [4, 20], rechne: (_a, b, c) => 2 * b * c },
  { text: "Un salón tiene {a} plazas. {b} están ocupadas. ¿Cuántas plazas están libres?",
    op: "minus", a: [2000, 60000], b: [500, 1900], c: [0, 0], rechne: (a, b) => a - b,
    passt: (a, b) => a > b },
  { text: "Una caja pesa {c} kilos. Un camión lleva {b} cajas. ¿Cuántos kilos son?",
    op: "mal", a: [0, 0], b: [50, 400], c: [8, 40], rechne: (_a, b, c) => b * c },
  { text: "{a} personas van a una feria. Cada una paga {b} euros. ¿Cuántos euros son?",
    op: "mal", a: [200, 3000], b: [3, 25], c: [0, 0], rechne: (a, b) => a * b },
  { text: "Un libro cuesta {b} euros. Un colegio compra {c}. Le descuentan {a} euros. ¿Cuántos euros paga?",
    op: "gemischt", a: [50, 400], b: [10, 40], c: [20, 120], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 },
];

const STUFE5: SachVorlage[] = [
  { text: "Una barra de pan cuesta {b},{c} euros. {n} compra {a} barras. ¿Cuántos euros son?",
    op: "mal", a: [2, 6], b: [2, 5], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "{n} corre {b} vueltas de {c} metros. ¿Cuántos kilómetros son?",
    op: "gemischt", a: [0, 0], b: [4, 12], c: [250, 800],
    rechne: (_a, b, c) => (b * c) / 1000, passt: (_a, b, c) => (b * c) % 100 === 0, nachkomma: 2 },
  { text: "Una bolsa de patatas pesa {b},{c} kilos. {n} compra {a} bolsas. ¿Cuántos kilos son?",
    op: "mal", a: [2, 5], b: [3, 12], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "Un episodio dura {b} minutos. {n} ve {a} episodios. ¿Cuántos minutos son?",
    op: "mal", a: [3, 8], b: [22, 55], c: [0, 0], rechne: (a, b) => a * b },
  { text: "{n} tiene {a} euros. Un cómic cuesta {b},{c} euros. ¿Cuántos cómics puede comprar?",
    op: "geteilt", a: [10, 40], b: [1, 4], c: [20, 80],
    rechne: (a, b, c) => Math.floor(a / (b + c / 100)), passt: (_a, _b, c) => c % 10 === 0 },
  { text: "Un trozo de tela mide {b},{c} metros. {n} necesita {a} trozos. ¿Cuántos metros son?",
    op: "mal", a: [2, 5], b: [1, 6], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "{a} litros de zumo van a botellas de {b} litros. ¿Cuántas botellas se llenan?",
    op: "geteilt", a: [6, 40], b: [1, 3], c: [0, 0], rechne: (a, b) => Math.floor(a / b) },
  { text: "El viaje dura {b} horas y {c} minutos. {n} va y vuelve. ¿Cuántos minutos son en total?",
    op: "mal", a: [0, 0], b: [1, 4], c: [10, 50],
    rechne: (_a, b, c) => 2 * (b * 60 + c), passt: (_a, _b, c) => c % 5 === 0 },
  { text: "Un kilo de manzanas cuesta {b},{c} euros. {n} compra {a} kilos. ¿Cuántos euros paga?",
    op: "mal", a: [2, 6], b: [1, 4], c: [20, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "{n} da {b} pasos de {c} centímetros. ¿Cuántos metros son?",
    op: "gemischt", a: [0, 0], b: [200, 900], c: [50, 80],
    rechne: (_a, b, c) => (b * c) / 100, passt: (_a, b, c) => (b * c) % 10 === 0, nachkomma: 1 },
];

const STUFE6: SachVorlage[] = [
  { text: "Un abrigo cuesta {a} euros. Tiene un {b} % de descuento. ¿Cuántos euros cuesta ahora?",
    op: "prozent", a: [40, 300], b: [10, 50], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "De {a} personas, el {b} % va en bici al colegio. ¿Cuántas personas son?",
    op: "prozent", a: [50, 400], b: [10, 60], c: [0, 0],
    rechne: (a, b) => (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "{n} lee {b}/4 de un libro de {a} páginas. ¿Cuántas páginas son?",
    op: "bruch", a: [40, 400], b: [1, 3], c: [0, 0],
    rechne: (a, b) => (a * b) / 4, passt: (a, b) => (a * b) % 4 === 0 },
  { text: "Un campo tiene {a} metros cuadrados. Se ha plantado {b}/5. ¿Cuántos metros cuadrados son?",
    op: "bruch", a: [100, 900], b: [1, 4], c: [0, 0],
    rechne: (a, b) => (a * b) / 5, passt: (a, b) => (a * b) % 5 === 0 },
  { text: "Un precio de {a} euros sube un {b} %. ¿Cuántos euros cuesta ahora?",
    op: "prozent", a: [40, 400], b: [5, 30], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Hay {a} litros de zumo. {n} bebe {b}/8. ¿Cuántos litros quedan?",
    op: "bruch", a: [8, 40], b: [1, 5], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 8, passt: (a, b) => (a * b) % 8 === 0 },
  { text: "El {b} % de una clase son {c} personas. ¿Cuántas personas hay en la clase?",
    op: "prozent", a: [0, 0], b: [20, 50], c: [4, 15],
    rechne: (_a, b, c) => (c * 100) / b, passt: (_a, b, c) => (c * 100) % b === 0 },
  { text: "Un camino mide {a} kilómetros. {n} ha andado {b}/3. ¿Cuántos kilómetros son?",
    op: "bruch", a: [9, 90], b: [1, 2], c: [0, 0],
    rechne: (a, b) => (a * b) / 3, passt: (a, b) => (a * b) % 3 === 0 },
  { text: "{n} regala el {b} % de {a} euros. ¿Cuántos euros quedan?",
    op: "prozent", a: [50, 500], b: [5, 40], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Una caja tiene {a} caramelos. {b}/10 son rojos. ¿Cuántos caramelos son rojos?",
    op: "bruch", a: [20, 300], b: [1, 7], c: [0, 0],
    rechne: (a, b) => (a * b) / 10, passt: (a, b) => (a * b) % 10 === 0 },
];

const STUFE7: SachVorlage[] = [
  { text: "Un número por {b}, más {c}, da {a}. ¿Cuál es el número?",
    op: "gemischt", a: [20, 400], b: [2, 9], c: [3, 40],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => a - c > 0 && (a - c) % b === 0 },
  { text: "Dos números suman {a}. Uno es {b} más que el otro. ¿Cuál es el menor?",
    op: "gemischt", a: [40, 400], b: [4, 60], c: [0, 0],
    rechne: (a, b) => (a - b) / 2, passt: (a, b) => (a - b) > 0 && (a - b) % 2 === 0 },
  { text: "{n} paga {a} euros por {b} entradas y {c} euros de gastos. ¿Cuántos euros cuesta una entrada?",
    op: "gemischt", a: [50, 400], b: [3, 12], c: [2, 20],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => (a - c) > 0 && (a - c) % b === 0 },
  { text: "Un rectángulo tiene un perímetro de {a} metros. Un lado mide {b} metros. ¿Cuántos metros mide el otro lado?",
    op: "gemischt", a: [20, 200], b: [4, 40], c: [0, 0],
    rechne: (a, b) => a / 2 - b, passt: (a, b) => a % 2 === 0 && a / 2 - b > 0 },
  { text: "{n} tiene {b} años. Un tío tiene el triple. ¿Cuántos años tendrá el tío dentro de {c} años?",
    op: "gemischt", a: [0, 0], b: [8, 16], c: [2, 10],
    rechne: (_a, b, c) => 3 * b + c, passt: () => true },
  { text: "Un número menos {b} es el triple de {c}. ¿Cuál es el número?",
    op: "gemischt", a: [0, 0], b: [5, 60], c: [3, 30],
    rechne: (_a, b, c) => b + 3 * c, passt: () => true },
  { text: "{a} litros llenan {b} bidones. Sobran {c} litros. ¿Cuántos litros caben en un bidón?",
    op: "gemischt", a: [40, 400], b: [3, 10], c: [1, 15],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => (a - c) > 0 && (a - c) % b === 0 },
  { text: "El doble de un número, más {b}, es {a}. ¿Cuál es el número?",
    op: "gemischt", a: [20, 300], b: [4, 50], c: [0, 0],
    rechne: (a, b) => (a - b) / 2, passt: (a, b) => (a - b) > 0 && (a - b) % 2 === 0 },
];

const STUFE8: SachVorlage[] = [
  { text: "Un móvil cuesta {a} euros. Se suma un {b} % de IVA. ¿Cuántos euros son en total?",
    op: "prozent", a: [100, 900], b: [10, 20], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "{n} ingresa {a} euros en el banco con un {b} % al año. ¿Cuántos euros hay después de un año?",
    op: "prozent", a: [500, 9000], b: [1, 6], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Un coche gasta {b} litros cada 100 kilómetros. ¿Cuántos litros gasta en {a} kilómetros?",
    op: "gemischt", a: [200, 900], b: [4, 9], c: [0, 0],
    rechne: (a, b) => (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Una habitación mide {b} metros de largo, {c} metros de ancho y {a} metros de alto. ¿Cuántos metros cúbicos de aire caben?",
    op: "mal", a: [2, 4], b: [3, 8], c: [3, 7], rechne: (a, b, c) => a * b * c },
  { text: "{a} personas se reparten {b} euros por igual. ¿Cuántos euros recibe cada una?",
    op: "geteilt", a: [3, 25], b: [120, 9000], c: [0, 0],
    rechne: (a, b) => b / a, passt: (a, b) => b % a === 0 },
  { text: "Un precio baja de {a} euros a {b} euros. ¿Qué porcentaje es la rebaja?",
    op: "prozent", a: [100, 100], b: [10, 90], c: [0, 0],
    rechne: (a, b) => ((a - b) * 100) / a, passt: (a, b) => a > b },
  { text: "Un rollo tiene {a} metros de cable. {n} corta {b} trozos de {c} metros. ¿Cuántos metros quedan?",
    op: "gemischt", a: [50, 500], b: [3, 15], c: [2, 20],
    rechne: (a, b, c) => a - b * c, passt: (a, b, c) => a - b * c > 0 },
  { text: "Un depósito tiene {a} litros. Está lleno al {b} %. ¿Cuántos litros faltan?",
    op: "prozent", a: [50, 900], b: [20, 80], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
];

/** Alle spanischen Vorlagen, nach Paket - dieselben Schlüssel wie `SACHAUFGABEN`. */
export const SACHAUFGABEN_ES: Record<string, SachVorlage[]> = {
  "1-18": STUFE1,
  "2-21": STUFE2,
  "3-21": STUFE3,
  "4-18": STUFE4,
  "5-19": STUFE5,
  "6-24": STUFE6,
  "7-20": STUFE7,
  "8-20": STUFE8,
};
