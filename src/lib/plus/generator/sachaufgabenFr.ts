/**
 * Rechengeschichten für Französisch - NEU geschrieben, nicht übersetzt
 * (Bauplan 2026-11-06 §5 Nr. 4: „Textaufgaben je Sprache neu, mit Namen und
 * Dingen, die dort üblich sind").
 *
 * ★ Dieselben Pakete, Zahlenräume und Rechenwege wie `sachaufgabenEn.ts` und
 *   `sachaufgaben.ts` (je Stufe), gleiche Regeln: kurze Sätze, jeder Satz eine
 *   Zeile, die Zahlen als Ziffern, Namen ohne Rollenbild.
 * ★ Frankreich: Euro (€) und Centimes, Kilometer, Madeleines, Baguette, Cars.
 *   Das Dezimalzeichen ist das Komma (`2,50 €`); `{b},{c}` setzt es im Text.
 *   Kein Rechner nötig (Plus hat bewusst keine Taschenrechner-Aufgaben).
 * ★★ DIE ANTWORT IST EINE BLOSSE ZAHL. Die Frage nennt die Einheit („Combien
 *   d'euros ... ?"). Grund: Für Einheiten-Buchstaben und das Eurozeichen hat die
 *   gelesene Norm keine eindeutige Zelle (Kopf von `braille/mathFr.ts`).
 * ★ Kein Rest, keine Anrede mit Geschlecht: Sätze brauchen keine Angleichung an
 *   den Namen (kein „est allé"), und der Name steht nie nach „de"/„à"
 *   (Elision bei Vokalen).
 * ★ Nur die neue Rechtschreibung (Wächter `tests/tastenflow-neue-rechtschreibung-fr.test.ts`):
 *   kein Zirkumflex auf i und u, „boite", „vaut" statt „coute".
 */
import type { SachVorlage } from "./sachaufgaben";

/** Namen aus Frankreich - kurz, verschieden, ohne Rollenbild. */
export const NAMEN_FR = [
  "Léa", "Hugo", "Emma", "Lucas", "Jade", "Louis", "Chloé", "Nathan", "Inès", "Jules",
  "Manon", "Gabriel", "Lina", "Léo", "Zoé", "Adam", "Sofia", "Karim", "Alice", "Tom",
];

const STUFE1: SachVorlage[] = [
  { text: "{n} a {a} marrons. {n} en trouve {b} de plus. Combien de marrons maintenant ?",
    op: "plus", a: [3, 12], b: [2, 8], rechne: (a, b) => a + b },
  { text: "Il y a {a} biscuits dans l'assiette. {n} en mange {b}. Combien de biscuits reste-t-il ?",
    op: "minus", a: [6, 18], b: [2, 6], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} a {a} cartes de foot. Un ami en ajoute {b}. Combien de cartes en tout ?",
    op: "plus", a: [5, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "{a} enfants jouent dans la cour. {b} rentrent en classe. Combien d'enfants restent dehors ?",
    op: "minus", a: [8, 20], b: [2, 8], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} a {a} centimes. {n} en trouve {b}. Combien de centimes en tout ?",
    op: "plus", a: [4, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "{a} personnes sont dans le bus. {b} descendent à l'arrêt. Combien de personnes restent dans le bus ?",
    op: "minus", a: [8, 20], b: [2, 7], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} fait cuire {a} madeleines. Puis {b} de plus. Combien de madeleines en tout ?",
    op: "plus", a: [5, 12], b: [3, 8], rechne: (a, b) => a + b },
  { text: "{n} a besoin de {a} perles. {n} en a {b}. Combien de perles manque-t-il ?",
    op: "minus", a: [10, 20], b: [3, 9], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{a} canards nagent sur l'étang. {b} s'en vont. Combien de canards restent ?",
    op: "minus", a: [9, 20], b: [3, 8], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "Il y a {a} vaches dans le pré. {b} de plus arrivent. Combien de vaches maintenant ?",
    op: "plus", a: [4, 12], b: [2, 8], rechne: (a, b) => a + b },
];

const STUFE2: SachVorlage[] = [
  { text: "La classe a {a} livres. {b} de plus arrivent. Combien de livres maintenant ?",
    op: "plus", a: [20, 70], b: [10, 30], rechne: (a, b) => a + b },
  { text: "{n} a mis {a} centimes de côté. {n} en dépense {b}. Combien de centimes reste-t-il ?",
    op: "minus", a: [30, 95], b: [10, 28], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "Un sac contient {a} noix. {n} en sort {b}. Combien de noix restent dans le sac ?",
    op: "minus", a: [40, 99], b: [12, 35], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{n} court {a} mètres. Puis encore {b} mètres. Combien de mètres en tout ?",
    op: "plus", a: [20, 60], b: [15, 40], rechne: (a, b) => a + b },
  { text: "{n} met {b} œufs dans chaque boite. {a} boites sont pleines. Combien d'œufs en tout ?",
    op: "mal", a: [3, 9], b: [2, 10], rechne: (a, b) => a * b },
  { text: "On range {a} biscuits sur {b} assiettes. Combien de biscuits sur une assiette ?",
    op: "geteilt", a: [12, 60], b: [2, 6], rechne: (a, b) => a / b, passt: (a, b) => a % b === 0 },
  { text: "Chaque rangée a {b} chaises. Il y a {a} rangées. Combien de chaises en tout ?",
    op: "mal", a: [3, 9], b: [3, 10], rechne: (a, b) => a * b },
  { text: "{n} a {a} cartes. {n} en perd {b}. Combien de cartes reste-t-il ?",
    op: "minus", a: [40, 90], b: [15, 30], rechne: (a, b) => a - b, passt: (a, b) => a > b },
  { text: "{b} enfants se partagent {a} pommes. Combien de pommes pour chaque enfant ?",
    op: "geteilt", a: [12, 60], b: [3, 6], rechne: (a, b) => a / b, passt: (a, b) => a % b === 0 },
  { text: "{n} a lu {a} pages. Le livre a {b} pages. Combien de pages reste-t-il à lire ?",
    op: "minus", a: [20, 60], b: [70, 99], rechne: (a, b) => b - a, passt: (a, b) => b > a },
  { text: "Un bus transporte {a} personnes. {b} de plus montent. Combien de personnes sont dans le bus ?",
    op: "plus", a: [20, 60], b: [8, 25], rechne: (a, b) => a + b },
];

const STUFE3: SachVorlage[] = [
  { text: "Une école a {a} enfants. {b} viennent en bus. {c} viennent à pied. Combien viennent à vélo ?",
    op: "minus", a: [300, 900], b: [80, 300], c: [50, 250], rechne: (a, b, c) => a - b - c,
    passt: (a, b, c) => a - b - c > 0 },
  { text: "{n} marque {a} points. Puis {b} de plus. Puis {n} en perd {c}. Combien de points reste-t-il ?",
    op: "gemischt", a: [120, 500], b: [60, 300], c: [40, 200], rechne: (a, b, c) => a + b - c,
    passt: (a, b, c) => a + b - c > 0 && a + b <= 1000 },
  { text: "Un livre a {a} pages. {n} en lit {b}. Le lendemain, {n} en lit {c}. Combien de pages reste-t-il ?",
    op: "minus", a: [200, 900], b: [50, 200], c: [40, 180], rechne: (a, b, c) => a - b - c,
    passt: (a, b, c) => a - b - c > 0 },
  { text: "Un magasin a {a} bouteilles. {b} caisses de {c} bouteilles arrivent. Combien de bouteilles maintenant ?",
    op: "gemischt", a: [100, 400], b: [3, 9], c: [6, 12], rechne: (a, b, c) => a + b * c,
    passt: (a, b, c) => a + b * c <= 1000 },
  { text: "{n} a {a} centimes. {n} achète {b} crayons à {c} centimes. Combien de centimes reste-t-il ?",
    op: "gemischt", a: [50, 200], b: [3, 8], c: [4, 12], rechne: (a, b, c) => a - b * c,
    passt: (a, b, c) => a - b * c > 0 },
  { text: "Une salle a {b} rangées de {c} chaises. {a} chaises sont prises. Combien sont libres ?",
    op: "gemischt", a: [50, 300], b: [8, 20], c: [10, 25], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 && b * c <= 1000 },
  { text: "On range {a} pommes dans {b} caisses. Combien de pommes dans une caisse ?",
    op: "geteilt", a: [120, 600], b: [4, 10], c: [0, 0], rechne: (a, b) => a / b,
    passt: (a, b) => a % b === 0 },
  { text: "{n} met {c} centimes de côté par semaine. Cela dure {b} semaines. Puis {n} reçoit {a} centimes. Combien de centimes en tout ?",
    op: "gemischt", a: [20, 150], b: [5, 15], c: [4, 20], rechne: (a, b, c) => a + b * c,
    passt: (a, b, c) => a + b * c <= 1000 },
  { text: "Un train a {b} wagons de {c} places. {a} places sont prises. Combien sont libres ?",
    op: "gemischt", a: [50, 300], b: [5, 12], c: [20, 60], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 && b * c <= 1000 },
  { text: "{a} enfants partent en sortie. Chaque car prend {b} enfants. Combien de cars faut-il ?",
    op: "geteilt", a: [60, 400], b: [20, 50], c: [0, 0], rechne: (a, b) => Math.ceil(a / b),
    passt: (a, b) => a > b },
];

const STUFE4: SachVorlage[] = [
  { text: "Une ville a {a} habitants. {b} arrivent et {c} partent. Combien d'habitants maintenant ?",
    op: "gemischt", a: [20000, 90000], b: [500, 4000], c: [400, 3000], rechne: (a, b, c) => a + b - c },
  { text: "Une usine fait {b} roues par jour. Combien de roues en {c} jours ?",
    op: "mal", a: [0, 0], b: [120, 900], c: [10, 40], rechne: (_a, b, c) => b * c },
  { text: "On répartit {a} tracts dans {b} écoles. Combien de tracts pour chaque école ?",
    op: "geteilt", a: [1200, 90000], b: [4, 25], c: [0, 0], rechne: (a, b) => a / b,
    passt: (a, b) => a % b === 0 },
  { text: "{n} compte les visiteurs : {a}, {b} et {c}. Quelle est la moyenne ?",
    op: "gemischt", a: [300, 5000], b: [300, 5000], c: [300, 5000], rechne: (a, b, c) => (a + b + c) / 3,
    passt: (a, b, c) => (a + b + c) % 3 === 0 },
  { text: "Un champ mesure {b} mètres de long et {c} mètres de large. Combien de mètres carrés cela fait-il ?",
    op: "mal", a: [0, 0], b: [40, 400], c: [20, 200], rechne: (_a, b, c) => b * c },
  { text: "{n} roule {b} kilomètres pour aller et {b} pour revenir. Cela se répète {c} fois par an. Combien de kilomètres en tout ?",
    op: "gemischt", a: [0, 0], b: [40, 500], c: [4, 20], rechne: (_a, b, c) => 2 * b * c },
  { text: "Une salle a {a} places. {b} places sont prises. Combien de places sont libres ?",
    op: "minus", a: [2000, 60000], b: [500, 1900], c: [0, 0], rechne: (a, b) => a - b,
    passt: (a, b) => a > b },
  { text: "Une caisse pèse {c} kilogrammes. Un camion porte {b} caisses. Combien de kilogrammes en tout ?",
    op: "mal", a: [0, 0], b: [50, 400], c: [8, 40], rechne: (_a, b, c) => b * c },
  { text: "{a} personnes viennent à une fête. Chacune paie {b} euros. Combien d'euros en tout ?",
    op: "mal", a: [200, 3000], b: [3, 25], c: [0, 0], rechne: (a, b) => a * b },
  { text: "Un livre vaut {b} euros. L'école en prend {c}. Elle a {a} euros de remise. Combien d'euros paie-t-elle ?",
    op: "gemischt", a: [50, 400], b: [10, 40], c: [20, 120], rechne: (a, b, c) => b * c - a,
    passt: (a, b, c) => b * c - a > 0 },
];

const STUFE5: SachVorlage[] = [
  { text: "Une baguette vaut {b},{c} €. {n} achète {a} baguettes. Combien d'euros en tout ?",
    op: "mal", a: [2, 6], b: [2, 5], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "{n} fait {b} tours de {c} mètres. Combien de kilomètres en tout ?",
    op: "gemischt", a: [0, 0], b: [4, 12], c: [250, 800],
    rechne: (_a, b, c) => (b * c) / 1000, passt: (_a, b, c) => (b * c) % 100 === 0, nachkomma: 2 },
  { text: "Un sac de pommes de terre pèse {b},{c} kilogrammes. {n} achète {a} sacs. Combien de kilogrammes en tout ?",
    op: "mal", a: [2, 5], b: [3, 12], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "Un film dure {b} minutes. {n} regarde {a} épisodes. Combien de minutes en tout ?",
    op: "mal", a: [3, 8], b: [22, 55], c: [0, 0], rechne: (a, b) => a * b },
  { text: "{n} a {a} €. Une bande dessinée vaut {b},{c} €. Combien de bandes dessinées peut-on acheter ?",
    op: "geteilt", a: [10, 40], b: [1, 4], c: [20, 80],
    rechne: (a, b, c) => Math.floor(a / (b + c / 100)), passt: (_a, _b, c) => c % 10 === 0 },
  { text: "Un morceau de tissu mesure {b},{c} mètres. {n} a besoin de {a} morceaux. Combien de mètres en tout ?",
    op: "mal", a: [2, 5], b: [1, 6], c: [10, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "{a} litres de jus vont dans des bouteilles de {b} litres. Combien de bouteilles se remplissent ?",
    op: "geteilt", a: [6, 40], b: [1, 3], c: [0, 0], rechne: (a, b) => Math.floor(a / b) },
  { text: "Le trajet dure {b} heures et {c} minutes. {n} fait l'aller et le retour. Combien de minutes en tout ?",
    op: "mal", a: [0, 0], b: [1, 4], c: [10, 50],
    rechne: (_a, b, c) => 2 * (b * 60 + c), passt: (_a, _b, c) => c % 5 === 0 },
  { text: "Un kilogramme de pommes vaut {b},{c} €. {n} prend {a} kilogrammes. Combien d'euros faut-il payer ?",
    op: "mal", a: [2, 6], b: [1, 4], c: [20, 90],
    rechne: (a, b, c) => a * (b + c / 100), passt: (_a, _b, c) => c % 10 === 0, nachkomma: 2 },
  { text: "{n} fait {b} pas de {c} centimètres. Combien de mètres cela fait-il ?",
    op: "gemischt", a: [0, 0], b: [200, 900], c: [50, 80],
    rechne: (_a, b, c) => (b * c) / 100, passt: (_a, b, c) => (b * c) % 10 === 0, nachkomma: 1 },
];

const STUFE6: SachVorlage[] = [
  { text: "Un manteau vaut {a} €. Il y a {b} % de remise. Combien d'euros vaut-il maintenant ?",
    op: "prozent", a: [40, 300], b: [10, 50], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Sur {a} enfants, {b} % viennent à vélo. Combien d'enfants cela fait-il ?",
    op: "prozent", a: [50, 400], b: [10, 60], c: [0, 0],
    rechne: (a, b) => (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "{n} lit les {b}/4 d'un livre de {a} pages. Combien de pages cela fait-il ?",
    op: "bruch", a: [40, 400], b: [1, 3], c: [0, 0],
    rechne: (a, b) => (a * b) / 4, passt: (a, b) => (a * b) % 4 === 0 },
  { text: "Un champ mesure {a} mètres carrés. On plante les {b}/5. Combien de mètres carrés cela fait-il ?",
    op: "bruch", a: [100, 900], b: [1, 4], c: [0, 0],
    rechne: (a, b) => (a * b) / 5, passt: (a, b) => (a * b) % 5 === 0 },
  { text: "Un prix de {a} € augmente de {b} %. Combien d'euros vaut-il maintenant ?",
    op: "prozent", a: [40, 400], b: [5, 30], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Il y a {a} litres de jus. {n} en boit les {b}/8. Combien de litres reste-t-il ?",
    op: "bruch", a: [8, 40], b: [1, 5], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 8, passt: (a, b) => (a * b) % 8 === 0 },
  { text: "{b} % d'une classe, cela fait {c} enfants. Combien d'enfants a la classe ?",
    op: "prozent", a: [0, 0], b: [20, 50], c: [4, 15],
    rechne: (_a, b, c) => (c * 100) / b, passt: (_a, b, c) => (c * 100) % b === 0 },
  { text: "Un chemin mesure {a} kilomètres. {n} a fait les {b}/3. Combien de kilomètres cela fait-il ?",
    op: "bruch", a: [9, 90], b: [1, 2], c: [0, 0],
    rechne: (a, b) => (a * b) / 3, passt: (a, b) => (a * b) % 3 === 0 },
  { text: "{n} donne {b} % de {a} € à une association. Combien d'euros reste-t-il ?",
    op: "prozent", a: [50, 500], b: [5, 40], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Une boite contient {a} bonbons. Les {b}/10 sont rouges. Combien de bonbons sont rouges ?",
    op: "bruch", a: [20, 300], b: [1, 7], c: [0, 0],
    rechne: (a, b) => (a * b) / 10, passt: (a, b) => (a * b) % 10 === 0 },
];

const STUFE7: SachVorlage[] = [
  { text: "Un nombre fois {b}, plus {c}, fait {a}. Quel est ce nombre ?",
    op: "gemischt", a: [20, 400], b: [2, 9], c: [3, 40],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => a - c > 0 && (a - c) % b === 0 },
  { text: "Deux nombres ont pour somme {a}. L'un a {b} de plus que l'autre. Quel est le plus petit ?",
    op: "gemischt", a: [40, 400], b: [4, 60], c: [0, 0],
    rechne: (a, b) => (a - b) / 2, passt: (a, b) => (a - b) > 0 && (a - b) % 2 === 0 },
  { text: "{n} paie {a} € pour {b} billets et {c} € de frais. Combien d'euros pour un billet ?",
    op: "gemischt", a: [50, 400], b: [3, 12], c: [2, 20],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => (a - c) > 0 && (a - c) % b === 0 },
  { text: "Un rectangle a un périmètre de {a} mètres. Un côté mesure {b} mètres. Combien mesure l'autre côté ?",
    op: "gemischt", a: [20, 200], b: [4, 40], c: [0, 0],
    rechne: (a, b) => a / 2 - b, passt: (a, b) => a % 2 === 0 && a / 2 - b > 0 },
  { text: "{n} a {b} ans. Sa mère a trois fois cet âge. Quel âge a-t-elle dans {c} ans ?",
    op: "gemischt", a: [0, 0], b: [8, 16], c: [2, 10],
    rechne: (_a, b, c) => 3 * b + c, passt: () => true },
  { text: "Un nombre moins {b} fait trois fois {c}. Quel est ce nombre ?",
    op: "gemischt", a: [0, 0], b: [5, 60], c: [3, 30],
    rechne: (_a, b, c) => b + 3 * c, passt: () => true },
  { text: "{a} litres remplissent {b} bidons. Il reste {c} litres. Combien de litres dans un bidon ?",
    op: "gemischt", a: [40, 400], b: [3, 10], c: [1, 15],
    rechne: (a, b, c) => (a - c) / b, passt: (a, b, c) => (a - c) > 0 && (a - c) % b === 0 },
  { text: "Le double d'un nombre, plus {b}, fait {a}. Quel est ce nombre ?",
    op: "gemischt", a: [20, 300], b: [4, 50], c: [0, 0],
    rechne: (a, b) => (a - b) / 2, passt: (a, b) => (a - b) > 0 && (a - b) % 2 === 0 },
];

const STUFE8: SachVorlage[] = [
  { text: "Un téléphone vaut {a} €. On ajoute {b} % de TVA. Combien d'euros en tout ?",
    op: "prozent", a: [100, 900], b: [10, 20], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "{n} place {a} € à la banque, à {b} % par an. Combien d'euros après un an ?",
    op: "prozent", a: [500, 9000], b: [1, 6], c: [0, 0],
    rechne: (a, b) => a + (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Une voiture consomme {b} litres pour 100 kilomètres. Combien de litres pour {a} kilomètres ?",
    op: "gemischt", a: [200, 900], b: [4, 9], c: [0, 0],
    rechne: (a, b) => (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
  { text: "Une pièce mesure {b} m de long, {c} m de large et {a} m de haut. Combien de mètres cubes d'air ?",
    op: "mal", a: [2, 4], b: [3, 8], c: [3, 7], rechne: (a, b, c) => a * b * c },
  { text: "{a} personnes se partagent {b} € à parts égales. Combien d'euros pour chaque personne ?",
    op: "geteilt", a: [3, 25], b: [120, 9000], c: [0, 0],
    rechne: (a, b) => b / a, passt: (a, b) => b % a === 0 },
  { text: "Un prix passe de {a} € à {b} €. De combien de pour cent baisse-t-il ?",
    op: "prozent", a: [100, 100], b: [10, 90], c: [0, 0],
    rechne: (a, b) => ((a - b) * 100) / a, passt: (a, b) => a > b },
  { text: "Un rouleau a {a} mètres de fil. {n} coupe {b} morceaux de {c} mètres. Combien de mètres reste-t-il ?",
    op: "gemischt", a: [50, 500], b: [3, 15], c: [2, 20],
    rechne: (a, b, c) => a - b * c, passt: (a, b, c) => a - b * c > 0 },
  { text: "Un réservoir contient {a} litres. Il est plein à {b} %. Combien de litres manquent ?",
    op: "prozent", a: [50, 900], b: [20, 80], c: [0, 0],
    rechne: (a, b) => a - (a * b) / 100, passt: (a, b) => (a * b) % 100 === 0 },
];

/** Alle französischen Vorlagen, nach Paket - dieselben Schlüssel wie `SACHAUFGABEN`. */
export const SACHAUFGABEN_FR: Record<string, SachVorlage[]> = {
  "1-18": STUFE1,
  "2-21": STUFE2,
  "3-21": STUFE3,
  "4-18": STUFE4,
  "5-19": STUFE5,
  "6-24": STUFE6,
  "7-20": STUFE7,
  "8-20": STUFE8,
};
