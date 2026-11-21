/** Bereich `uebersicht` - Französisch: Shell, Akustik-Menü und Klassen-Matrix für Lehrkräfte. */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Annonces et messages -------------------------------------------------
  kapitelwahlAnsage: "Choix du chapitre. Tous les chapitres sont libres - les étoiles montrent où tu en es.",
  kapitelAnsage: (nr: number, welt: string, i: number, n: number, kapitel: string) =>
    `Monde sonore ${nr}, ${welt} - chapitre ${i} sur ${n} : ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel: string) => `Chapitre : ${kapitel}.`,
  neuesAbzeichen: (name: string) => `Nouveau badge : ${name} !`,
  neueAbzeichen: (namen: string[]) => `Nouveaux badges : ${namen.join(", ")} !`,
  geschafftMitSternen: (sterne: number) => `Réussi ! +30 XP · ${sterne} étoile${sterne > 1 ? "s" : ""} sur 3 pour ce chapitre`,
  geschafft: "Réussi ! +30 XP",
  zeichenlisteOffen: "Liste des signes ouverte.",
  zeichenlisteZu: "Liste des signes fermée.",
  weltInArbeit: (nr: number, name: string) =>
    `Le monde sonore ${nr}, ${name}, est encore en préparation - il arrivera dans une prochaine étape.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Notes en braille : écouter, sentir, écrire.",

  // --- Barre d'en-tête ------------------------------------------------------
  rangCaption: "Rang",
  rangLabel: (level: number, rest: number) => `Rang ${level} - encore ${rest} XP jusqu'au suivant.`,
  xpHinweis: (xp: number) => `${xp} XP - 2 par bonne réponse, 30 par chapitre.`,
  xpText: (xp: number) => `${xp} XP`,
  sterneHinweis: (n: number, max: number) => `${n} étoiles sur ${max} - jusqu'à 3 par chapitre.`,
  weltName: (nr: number, titel: string) => `Monde sonore ${nr} : ${titel}`,
  weltKopf: (nr: number, titel: string, i: number, n: number) =>
    `Monde sonore ${nr} : ${titel} - chapitre ${i} sur ${n}`,
  voriges: "Chapitre précédent",
  naechstes: "Chapitre suivant",
  kapitelSelect: "Choisir un chapitre - feuilleter avec les flèches haut et bas",
  kapitelOption: (i: number, titel: string, sterne: number | null) =>
    `Chapitre ${i} : ${titel}${sterne === null ? "" : ` - maitrisé, ${sterne} étoile${sterne > 1 ? "s" : ""} sur 3`}`,
  landkarte: (kapitel: number, welten: number) => `${kapitel} chapitres dans ${welten} mondes sonores - tous libres`,
  kapitelwahlKnopf: "Choix du chapitre",
  kapitelwahlTitel: "Tous les mondes sonores et chapitres avec ton nombre d'étoiles (Alt + U)",
  zeichenlisteKnopf: "Liste des signes",
  zeichenlisteTitel: "Liste de tous les signes de musique, classés selon ton parcours (Alt + L)",

  // --- Choix du chapitre ----------------------------------------------------
  kapitelwahlUeberschrift: "Choix du chapitre - choisis ce que tu veux travailler",
  mixTitel: "Mix du jour",
  mixText: "Cinq minutes de mélange varié - des exercices tirés de tes chapitres maitrisés, sans étoiles, juste pour rester en forme.",
  loslegen: "C'est parti",
  mixZuWenig: (n: number) =>
    `Maitrise d'abord quelques chapitres (au moins 3), et ton mix du jour apparaitra ici. Pour l'instant : ${n}.`,
  weltStand: (fertig: number, n: number, sterne: number, max: number) =>
    `${fertig} chapitre${fertig > 1 ? "s" : ""} maitrisé${fertig > 1 ? "s" : ""} sur ${n} · ${sterne} étoile${sterne > 1 ? "s" : ""} sur ${max}`,
  kapitelZeile: (i: number, titel: string) => `Chapitre ${i} : ${titel}`,
  werkeText: (n: number) => ` · ${n} œuvre${n > 1 ? "s" : ""} sur 5`,
  besucht: "✓ visité",
  srBesucht: "- visité.",
  srNichtBesucht: "- pas encore visité.",
  srGemeistert: (sterne: number) => `- maitrisé, ${sterne} étoile${sterne > 1 ? "s" : ""} sur 3.`,
  srNichtGemeistert: "- pas encore maitrisé.",

  // --- Galerie des badges ---------------------------------------------------
  abzeichenTitel: "Badges",
  abzeichenStand: (verdient: number, alle: number) =>
    `${verdient} badge${verdient > 1 ? "s" : ""} gagné${verdient > 1 ? "s" : ""} sur ${alle} - récolte des étoiles, maitrise des mondes, écris des dictées, construis des mesures et joue des chansons de mémoire.`,
  geheimAbzeichen: "Badge secret",
  geheimBeschreibung: "Encore verrouillé - à toi de le découvrir !",
  srVerdient: "gagné.",
  srGeheim: "secret, pas encore gagné.",
  srNichtVerdient: "pas encore gagné.",

  // --- Mix du jour ----------------------------------------------------------
  mixIntro:
    "Mix du jour - une courte série de révision variée à travers tes chapitres maitrisés. Reste détendu : ici rien ne compte, il n'y a pas d'étoiles.",
  mixStart: (n: number) => `Mix du jour lancé - cinq minutes de révision à travers ${n} chapitres maitrisés.`,
  mixEnde: (vomKind: boolean, richtig: number, gesamt: number) =>
    `${vomKind ? "Série terminée." : "Le temps est écoulé !"} Tu as réussi ${richtig} exercice${richtig > 1 ? "s" : ""} sur ${gesamt}.`,
  mixGeschafft: "Mix du jour réussi !",
  mixErgebnis: (richtig: number, gesamt: number) =>
    `${richtig} exercice${richtig > 1 ? "s" : ""} réussi${richtig > 1 ? "s" : ""} sur ${gesamt}`,
  mixProzent: (pct: number) => ` · ${pct} %`,
  mixFein: "Belle révision - la progression reste telle qu'elle était.",
  nochEineRunde: "Encore une série",
  zurKapitelwahl: "Vers le choix du chapitre",
  mixBunt: (n: number) => `Mélange varié de ${n} chapitres maitrisés`,
  mixTimer: (min: number, sek: number) => `Encore ${min} minute${min > 1 ? "s" : ""} et ${sek} seconde${sek > 1 ? "s" : ""}`,
  mixRichtigLabel: (richtig: number, gesamt: number) => `${richtig} réussi${richtig > 1 ? "s" : ""} sur ${gesamt}`,
  mixRichtig: "réussis",
  beenden: "Terminer",

  // --- Menu acoustique ------------------------------------------------------
  akustikMusik: "Musique",
  akustikMusikErklaerung:
    "Les instruments jouent les notes des exercices. Ils font partie de l'exercice - c'est pourquoi il n'y a pas d'interrupteur, seulement le volume.",
  akustikInstrument: "Instrument",
  akustikInstrumentErklaerung: "Avec quel instrument les notes sonnent. Après le changement, il joue un do pour essayer.",
  akustikLautstaerke: "Volume de la musique",
  akustikLautstaerkeErklaerung:
    "À quel volume jouent les instruments. 100 % correspond à peu près au volume de la voix. La musique ne devient tout à fait silencieuse qu'à 0 %.",

  // --- Matrice de la classe (enseignants) -----------------------------------
  matrixSterne: (n: number) => `${n} ${n === 1 ? "étoile" : "étoiles"}`,
  matrixLaedt: "chargement …",
  matrixKapitelImEinzelnen: "Détail des chapitres",
  matrixAufklappLabel: (name: string, offen: boolean) =>
    `Détail des chapitres : ${name} ${offen ? "replier" : "déplier"}`,
  matrixAufklappTipp: (name: string) => `Chapitres de ${name} - chaque chapitre avec son nombre d'étoiles.`,
  matrixWeltSr: (nr: number, titel: string, fertig: number, n: number, sterne: string) =>
    `Monde sonore ${nr}, ${titel} : ${fertig} chapitre${fertig > 1 ? "s" : ""} maitrisé${fertig > 1 ? "s" : ""} sur ${n}, ${sterne}.`,
  matrixGesamtSr: (fertig: number, n: number, sterne: string) =>
    `Total : ${fertig} chapitre${fertig > 1 ? "s" : ""} maitrisé${fertig > 1 ? "s" : ""} sur ${n}, ${sterne}.`,
  matrixRegion: (name: string) => `Détail des chapitres : ${name}`,
  matrixGemeistert: (sterne: string) => `maitrisé, ${sterne}`,
  matrixNichtGemeistert: "pas encore maitrisé",
  matrixTabelle: "Progression de la classe dans Klangpunkte",
  matrixName: "Nom",
  matrixWeltKurz: (nr: number) => `M${nr}`,
  matrixWeltTitel: (nr: number, titel: string) => `Monde sonore ${nr} : ${titel}`,
  matrixWeltSpalteSr: (nr: number, titel: string) => ` : monde sonore ${nr}, ${titel}`,
  matrixGesamt: "Total",
  matrixZuletzt: "Dernière fois",
  matrixFuss:
    "Le nombre dans chaque case = chapitres maitrisés de ce monde sonore. La flèche devant le nom montre chaque chapitre avec son nombre d'étoiles. Vous voyez exactement ce que l'enfant voit de lui-même - rien de plus.",
};
