/**
 * Der Stoffplan von Plus auf Französisch - NUR, was Französisch heute anbietet.
 *
 * ★ Ein Paket steht hier und im Generator (`bedienbareFuerSprache`, gemessen):
 *   nur wenn beides stimmt, erscheint es. Fehlt der Name, wird das Paket
 *   nicht angeboten - nie ein deutscher Name in der französischen Oberfläche.
 *   Der Wächter `tests/plus-fr.test.tsx` prüft beide Richtungen.
 * ★ Nicht angeboten (Norm nicht eindeutig gelesen: weglassen): alles mit
 *   Buchstaben und Einheiten, Potenzen und Wurzeln, negativen Zahlen, Rest,
 *   gemischten Zahlen, Tausendertrennung - siehe Kopf von `braille/mathFr.ts`.
 *   Dazu die Formen, deren Fragen im Generator deutsch sind.
 * ★ Inhalte und Stufen sind die des Stoffplans; die Namen sind französisch und
 *   nennen keine Schulstufe und keinen Lehrplan.
 */
import type { PlusTexte } from "./typ";

export const STOFF_FR: NonNullable<PlusTexte["stoff"]> = {
  stufen: {
    1: {
      name: "Nombres jusqu'à 20",
      zahlenraum: "jusqu'à 20",
      leitidee:
        "C'est ici que tout se joue : l'enfant calcule-t-il ou compte-t-il ? Chaque exercice de ce niveau aide à quitter le comptage.",
    },
    2: {
      name: "Nombres jusqu'à 100",
      zahlenraum: "jusqu'à 100",
      leitidee:
        "Les additions et les soustractions deviennent automatiques et la petite table de multiplication se construit. On calcule de tête et par étapes - le calcul posé vient plus tard.",
    },
    3: {
      name: "Nombres jusqu'à 1000 et calcul posé",
      zahlenraum: "jusqu'à 1000",
      leitidee:
        "Les tables deviennent automatiques et le calcul posé apparait pour la première fois. Le calcul par étapes vacille souvent ensuite, alors on le retravaille.",
    },
    4: {
      name: "Grands nombres",
      zahlenraum: "jusqu'à un million",
      leitidee:
        "Les mêmes thèmes, en plus grand. Le domaine des nombres grandit par étapes. Les quatre opérations sont rejouées à chaque étape.",
    },
    5: {
      name: "Nombres décimaux, fractions et priorités de calcul",
      zahlenraum: "nombres entiers, décimaux et fractions, sans nombres négatifs",
      leitidee:
        "Le niveau 5 met de l'ordre dans ce qui existe : les priorités de calcul, les lois du calcul, les décimaux et les fractions.",
    },
    6: {
      name: "Fractions et pourcentages",
      zahlenraum: "fractions et pourcentages",
      leitidee:
        "Le niveau le plus riche. On calcule avec des fractions : additions, soustractions, multiplications, divisions. On les utilise avec les pourcentages dans la vie de tous les jours.",
    },
    7: {
      name: "Des problèmes aux équations",
      zahlenraum: "problèmes en plusieurs étapes",
      leitidee: "Maintenant le calcul devient général : trouver l'équation cachée dans une histoire.",
    },
    8: {
      name: "Calcul mental et problèmes du quotidien",
      zahlenraum: "grands nombres et nombres ronds",
      leitidee:
        "Le dernier niveau retrouve ce que cette application veut depuis le début : calculer malin, de tête.",
    },
  },
  pakete: {
    "1-03": "Décomposer les nombres jusqu'à 10",
    "1-04": "Faire 10",
    "1-05": "S'appuyer sur les cinq",
    "1-06": "Les doubles jusqu'à 10",
    "1-07": "Les moitiés jusqu'à 20",
    "1-08": "Additions, sans passer la dizaine",
    "1-09": "Soustractions, sans passer la dizaine",
    "1-10": "Changer l'ordre",
    "1-11": "Calculs inverses",
    "1-12": "Calculs voisins",
    "1-13": "Passer la dizaine en additionnant",
    "1-14": "Passer la dizaine en soustrayant",
    "1-15": "Le double plus un",
    "1-16": "Faire 20",
    "1-18": "Problèmes jusqu'à 20",
    "2-04": "Faire la dizaine suivante",
    "2-05": "Faire 100",
    "2-06": "Additionner sans passer la dizaine",
    "2-07": "Soustraire sans passer la dizaine",
    "2-08": "Additionner en passant la dizaine",
    "2-09": "Soustraire en passant la dizaine",
    "2-10": "Doubles et moitiés jusqu'à 100",
    "2-11": "Les tables : les faits de base",
    "2-12": "Les carrés jusqu'à 10",
    "2-13": "Les tables avec les doubles",
    "2-14": "Les tables avec un fait voisin",
    "2-15": "Les tables mélangées",
    "2-16": "Les tables de division",
    "2-18": "Additionner par étapes",
    "2-19": "Soustraire par étapes",
    "2-21": "Problèmes jusqu'à 100",
    "3-03": "Faire 1000",
    "3-04": "Décomposer 1000",
    "3-05": "Additionner par étapes jusqu'à 1000",
    "3-06": "Soustraire par étapes jusqu'à 1000",
    "3-10": "Addition posée jusqu'à 1000",
    "3-11": "Soustraction posée, en complétant",
    "3-12": "Soustraction posée, en retirant",
    "3-14": "Les tables avec assurance",
    "3-15": "Fois 10, divisé par 10, table des dizaines",
    "3-16": "Multiplication posée, multiplicateur à un chiffre",
    "3-17": "Division par un nombre à un chiffre",
    "3-19": "Doubles et moitiés jusqu'à 1000",
    "3-21": "Problèmes jusqu'à 1000",
    "4-03": "Faire un million",
    "4-05": "Addition posée avec de grands nombres",
    "4-06": "Soustraction posée avec de grands nombres",
    "4-07": "Multiplication posée, multiplicateur à deux chiffres",
    "4-08": "Division par un multiple de dix",
    "4-12": "Tables et valeur de position",
    "4-18": "Problèmes avec de grands nombres",
    "5-03": "Priorités de calcul sans parenthèses",
    "5-04": "Priorités de calcul avec parenthèses",
    "5-05": "Utiliser les lois du calcul",
    "5-07": "Déplacer la virgule",
    "5-14": "Agrandir et simplifier des fractions",
    "5-15": "Ranger et comparer des fractions",
    "5-19": "Problèmes avec des mesures",
    "6-09": "Additionner des fractions, même dénominateur",
    "6-10": "Additionner des fractions, dénominateurs différents",
    "6-11": "Soustraire des fractions, même dénominateur",
    "6-12": "Soustraire des fractions, dénominateurs différents",
    "6-13": "Fraction fois un nombre entier",
    "6-14": "Fraction fois une fraction",
    "6-15": "Fraction divisée par un nombre entier",
    "6-16": "Fraction divisée par une fraction",
    "6-17": "Mélanger les quatre opérations avec des fractions",
    "6-24": "Problèmes avec fractions et pourcentages",
    "7-20": "Des problèmes aux équations",
    "8-14": "Calcul mental avec de grands nombres",
    "8-15": "Nombres ronds",
    "8-16": "L'astuce du serveur",
    "8-20": "Problèmes du quotidien",
  },
};
