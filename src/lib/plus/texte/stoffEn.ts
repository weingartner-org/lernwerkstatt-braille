/**
 * Der Stoffplan von Plus in Englisch - NUR, was Englisch heute anbietet.
 *
 * ★ Ein Paket steht hier und im Generator (`bedienbareFuerSprache`, gemessen):
 *   nur wenn beides stimmt, erscheint es. Fehlt der Name, wird das Paket
 *   nicht angeboten - nie ein deutscher Name in der englischen Oberfläche.
 *   Der Wächter `tests/plus-en.test.tsx` prüft beide Richtungen.
 * ★ Nicht angeboten (Befund-Regel „Norm nicht eindeutig: weglassen"): alles mit
 *   Buchstaben und Einheiten, Potenzen und Wurzeln, negativen Zahlen, Rest,
 *   Tausendertrennung - siehe Kopf von `braille/ueb.ts`. Dazu die Formen, deren
 *   Fragen im Generator deutsch sind (Zahlenfolge-Fragen, Wahr/Falsch, Fehler
 *   finden, Strategiewahl ...).
 * ★ Inhalte und Stufen sind die des Stoffplans; die Namen sind britisches
 *   Englisch und nennen keine Schulstufe und keinen Lehrplan.
 */
import type { PlusTexte } from "./typ";

export const STOFF_EN: NonNullable<PlusTexte["stoff"]> = {
  stufen: {
    1: {
      name: "Numbers up to 20",
      zahlenraum: "up to 20",
      leitidee:
        "This is where everything later is decided: whether a child calculates or counts. Every practice at this level works towards leaving counting behind.",
    },
    2: {
      name: "Numbers up to 100",
      zahlenraum: "up to 100",
      leitidee:
        "The adding and subtracting facts become automatic and the small times table is worked out. Sums are done in the head and in steps - written methods come later.",
    },
    3: {
      name: "Numbers up to 1000 and written methods",
      zahlenraum: "up to 1000",
      leitidee:
        "The times table becomes automatic and written methods appear for the first time. Working in steps usually wobbles afterwards, so it is practised again.",
    },
    4: {
      name: "Big numbers",
      zahlenraum: "up to one million",
      leitidee:
        "The same topics, only bigger. The range of numbers grows in steps. All four methods are played through again at every step.",
    },
    5: {
      name: "Decimals, fractions and the order of operations",
      zahlenraum: "whole numbers, decimals and fractions, none negative",
      leitidee:
        "Level 5 sorts out what is already there: the order of operations, laws of arithmetic, decimals and fractions.",
    },
    6: {
      name: "Fractions and percentages",
      zahlenraum: "fractions and percentages",
      leitidee:
        "The fullest level. Fractions are added, subtracted, multiplied and divided, and used with percentages in everyday problems.",
    },
    7: {
      name: "Word problems into equations",
      zahlenraum: "problems with several steps",
      leitidee: "Now the maths turns general: working out the equation hidden in a story.",
    },
    8: {
      name: "Mental maths and everyday problems",
      zahlenraum: "large and round numbers",
      leitidee:
        "The last level brings back what this app is about from the start: calculating cleverly in your head.",
    },
  },
  pakete: {
    "1-03": "Splitting numbers up to 10",
    "1-04": "Making 10",
    "1-05": "Using fives",
    "1-06": "Doubling up to 10",
    "1-07": "Halving up to 20",
    "1-08": "Adding facts, no bridging",
    "1-09": "Subtracting facts, no bridging",
    "1-10": "Swapping the order",
    "1-11": "Inverse sums",
    "1-12": "Neighbour sums",
    "1-13": "Bridging ten when adding",
    "1-14": "Bridging ten when subtracting",
    "1-15": "Doubling plus one",
    "1-16": "Making 20",
    "1-18": "Word problems up to 20",
    "2-04": "Making the next ten",
    "2-05": "Making 100",
    "2-06": "Adding without bridging ten",
    "2-07": "Subtracting without bridging ten",
    "2-08": "Adding with bridging ten",
    "2-09": "Subtracting with bridging ten",
    "2-10": "Doubling and halving up to 100",
    "2-11": "Times table: the core facts",
    "2-12": "Square numbers up to 10",
    "2-13": "Times tables by doubling",
    "2-14": "Times tables from a neighbour fact",
    "2-15": "Mixed times tables",
    "2-16": "The division tables",
    "2-18": "Adding in steps",
    "2-19": "Subtracting in steps",
    "2-21": "Word problems up to 100",
    "3-03": "Making 1000",
    "3-04": "Splitting 1000",
    "3-05": "Adding in steps up to 1000",
    "3-06": "Subtracting in steps up to 1000",
    "3-10": "Written addition up to 1000",
    "3-11": "Written subtraction, adding on",
    "3-12": "Written subtraction, taking away",
    "3-14": "Times table with confidence",
    "3-15": "Times 10, divide by 10, tens times table",
    "3-16": "Written multiplication, one-digit multiplier",
    "3-17": "Division by a one-digit number",
    "3-19": "Doubling and halving up to 1000",
    "3-21": "Word problems up to 1000",
    "4-03": "Making a million",
    "4-05": "Written addition with big numbers",
    "4-06": "Written subtraction with big numbers",
    "4-07": "Written multiplication, two-digit multiplier",
    "4-08": "Division by a multiple of ten",
    "4-12": "Place-value times tables",
    "4-18": "Word problems with big numbers",
    "5-03": "Order of operations without brackets",
    "5-04": "Order of operations with brackets",
    "5-05": "Using the laws of arithmetic",
    "5-07": "Moving the decimal point",
    "5-14": "Enlarging and simplifying fractions",
    "5-15": "Ordering and comparing fractions",
    "5-19": "Word problems with measures",
    "6-09": "Adding fractions, same denominator",
    "6-10": "Adding fractions, different denominators",
    "6-11": "Subtracting fractions, same denominator",
    "6-12": "Subtracting fractions, different denominators",
    "6-13": "Fraction times a whole number",
    "6-14": "Fraction times a fraction",
    "6-15": "Fraction divided by a whole number",
    "6-16": "Fraction divided by a fraction",
    "6-17": "Mixing the four operations with fractions",
    "6-24": "Word problems with fractions and percentages",
    "7-20": "Word problems into equations",
    "8-14": "Mental maths with big numbers",
    "8-15": "Round numbers",
    "8-16": "The waiter's trick",
    "8-20": "Everyday word problems",
  },
};
