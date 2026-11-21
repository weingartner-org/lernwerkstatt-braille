/** Bereich `runner` - Französisch (Übungsfläche, Notenzeile, Eingabe per Berührung). */
import type { runner as De } from "../de/runner";

export const runner: typeof De = {
  kopf: {
    anhoeren: "Écouter",
    stopp: "Stop",
    anhoerenTitel: "Écouter l'exercice (Alt + W l'annonce en plus)",
    instrument: "Instrument",
    namenKnopf: "do-ré-mi",
    namenTitel: (a: string, b: string): string => `Noms des notes en ${a} (do fixe) au lieu de ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Langage rythmique : annoncer en plus ta, ti-ti après les valeurs des notes",
    anderesLied: "Autre chanson",
    namenAn: (a: string, b: string, c: string): string => `Noms des notes : ${a}, ${b}, ${c}.`,
    rhythmusAn: "Langage rythmique activé : ta, ti-ti.",
    rhythmusAus: "Langage rythmique désactivé.",
    zurueckLiedauswahl: "Retour au choix de la chanson.",
  },

  aufgabe: {
    liesBrailleZeile: "Lis la ligne en braille.",
    handNurKlavier: "Le changement de main ne vaut que dans le chapitre de piano avec deux lignes.",
    weiter: (prompt: string): string => `On continue. ${prompt}`,
    zeichenlisteHinweis: "Tous les signes de musique de cette étape se trouvent dans la liste des signes : Alt et L.",
    songGanzGeschafft: (titel: string): string => `${titel} - entièrement réussi !`,
    songZeile: (zeile: number, von: number): string => ` · ligne ${zeile} sur ${von}`,
  },

  geschafft: {
    geschafft: "Réussi !",
    mitSternen: (n: number): string => `Réussi ! ${n} étoile${n > 1 ? "s" : ""} sur 3.`,
    alsNaechstesAnsage: (titel: string): string => ` Ensuite : ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Ensuite : ${titel}`,
    weiterUeben: "Continuer à s'exercer",
    weiter: "Continuer",
  },
  fortschritt: {
    caption: "Exercice",
    aria: (n: number, min: number, prozent: number): string =>
      `Progression de l'étape : ${n} exercice${n > 1 ? "s" : ""} sur au moins ${min}, ${prozent} pour cent réussis.`,
    rundeGeschafft: "Série réussie - l'étape est acquise.",
    runde: (n: number, min: number, noch: number): string =>
      `Série : ${n} exercice${n > 1 ? "s" : ""} réussi${n > 1 ? "s" : ""} sur au moins ${min}` +
      (noch > 0 ? `, encore au moins ${noch}.` : ", l'étape sera bientôt acquise."),
  },

  lieder: {
    kinder: "🧒 Chansons d'enfants",
    erwachsene: "🎼 Classiques et grands succès",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - voir et entendre une seule main en grand (" +
      (f === "rh"
        ? "actuellement : main droite seule"
        : f === "lh"
          ? "actuellement : main gauche seule"
          : "actuellement : les deux mains") +
      ")",
  },

  wahl: {
    richtig: "Juste !",
    richtigWaere: (antwort: string): string => `La bonne réponse était : ${antwort}.`,
    antworten: "Réponses (aussi avec les touches 1 à 4)",
  },

  tap: {
    aria: (n: number): string => `Frapper le rythme : barre d'espace. Jusqu'ici ${n} coup${n > 1 ? "s" : ""}.`,
    vor: "Frappe ici avec la ",
    stark: "barre d'espace",
    nach: (n: number, von: number): string => ` - ${n} coup${n > 1 ? "s" : ""} sur ${von}`,
    knopf: (n: number, von: number): string => `Frapper (${n} sur ${von})`,
    puls: "Pas encore tout à fait régulier - sens la pulsation de base et garde-la calmement.",
    kurz: "court",
    lang: "long",
    fast: (muster: string): string => `Presque ! Le motif était : ${muster}. Écoute encore une fois.`,
    genauImPuls: "En plein dans la pulsation !",
    genauImTakt: "En plein dans la mesure !",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Clavier de reprise : D F G H J K L sont ${namen}. La flèche haut ou bas change d'octave. `,
    ariaFrei: (n: number, von: number): string => `Joue librement sur le bourdon - ${n} sons sur ${von}. `,
    ariaMemory: (laenge: number): string => `Longueur actuelle : ${laenge} sons. `,
    ariaTon: (i: number, von: number): string => `Son ${i} sur ${von}. `,
    ariaLesen:
      "Concert de lecture : lis la ligne en braille. Appuie sur Entrée ou sur « Lecture terminée » quand tu l'as en tête.",
    lesenVor: "Lis la ligne en braille - elle ",
    lesenStark: "n'est pas",
    lesenMitte: " jouée. Quand tu l'as en tête, appuie sur ",
    lesenNach: " ou sur « Lecture terminée ».",
    fertigGelesen: "Lecture terminée",
    nachLesen: "Maintenant, rejoue de mémoire - D F G H J K L, la flèche change d'octave.",
    freiVor: "Joue librement avec ",
    freiNach: (n: number, von: number): string => ` (pentatonique) - ${n} sons sur ${von} · sur le bourdon de quinte`,
    nachspielenVor: "Rejoue avec ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Longueur ${n}`,
    tonVon: (i: number, von: number): string => `Son ${i} sur ${von}`,
    oktaveNach: (oktave: string): string => ` Octave (${oktave})`,
    oktaveRauf: "Octave plus haut",
    oktaveRunter: "Octave plus bas",
    freiGeschafft: (n: number): string =>
      `Joli jeu - ${n} sons ! L'atelier est visité. Avec « Continuer à s'exercer », tu continues simplement à jouer.`,
    falscherTon: (gespielt: string, gesucht: string): string => `C'était ${gespielt} - on cherche ${gesucht}.`,
    nichtsMehr: "plus rien",
    memoryWeiter: (n: number): string => `Réussi - ${n} sons ! Maintenant on en ajoute un.`,
    memoryEnde: (best: number): string =>
      `Fin de la série - tu as réussi ${best} son${best > 1 ? "s" : ""} d'affilée. Je rejoue la suite une fois.`,
    genauRichtig: "Exactement juste !",
    fertig: "Terminé.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Saisie braille : f d s et j k l sont les points, la barre d'espace est la barre de mesure. Cellule ${zelle} sur ${von}. Maintenir Maj enfoncée montre et annonce les touches de la cellule.`,
    nochmalAnhoeren: "Écouter encore",
    diktat: "Écoute autant que tu veux - ce n'est pas compté comme une faute. Écris ensuite cellule par cellule ce que tu as entendu.",
    vor: "Écris avec ",
    mitte: (zelle: number, von: number): string => ` - cellule ${zelle} sur ${von} · `,
    umschalt: "⇧ Maj",
    nach: " montre la cellule",
    taktstrichTitel: "Barre de mesure (barre d'espace)",
    gedrueckt: (punkte: string): string => `Appuyé : points ${punkte}`,
    aktuelleStelleLeertaste: "Position actuelle : la barre d'espace - la barre de mesure.",
    genauRichtig: "Exactement juste !",
    fertig: "Terminé.",
  },

  takt: {
    aria: (n: number): string =>
      `Bâtisseur de mesures : écris des notes ou des silences avec f d s j k l ; chacun sonne tout de suite. Retour arrière efface la dernière cellule, Entrée vérifie la mesure. Jusqu'ici ${n} cellule${n > 1 ? "s" : ""}.`,
    vor: "Construis la mesure avec ",
    mitte: " - chaque note ou silence sonne. ",
    loescht: " efface, ",
    pruefen: (a: number, b: number): string => ` vérifie. Chiffrage de mesure ${a}/${b}.`,
    nochLeer: "Encore vide - à toi de jouer.",
    taktPruefen: "Vérifier la mesure (Entrée)",
    loeschen: "Effacer (⌫)",
    pause: "Silence",
    nominativ: (dativ: string): string => dativ,
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "Ce n'est pas une cellule de note ou de silence. Prends une note (f d s j k l) ou un silence.",
    alsGelesen: (wert: string): string => ` - lu comme ${wert}, parce que cela convient encore`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Ensemble ${summe} sur ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Dernière cellule effacée. Maintenant : ${anzahl} ${einheit}.`,
    fehlen: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `Il manque encore ${anzahl} ${einheit} pour avoir une mesure complète.`,
    zuViel: (_einzahl: boolean, anzahl: string, einheit: string): string =>
      `C'est ${anzahl} ${einheit} de trop. Enlève quelque chose.`,
    mindestensNoten: (n: number): string => `La mesure est complète, mais elle doit contenir au moins ${n} notes.`,
    mindestensPause: "La mesure est complète - mais elle doit contenir au moins un silence.",
    voll: "Mesure complète ! Écoute-la.",
    vollSauber: "Exactement complète - une mesure propre ! Écoute-la.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Atelier de composition : écris librement avec f d s j k l, la barre d'espace est la barre de mesure. Écouter, effacer et enregistrer avec les boutons. Jusqu'ici ${zellen} cellule${zellen > 1 ? "s" : ""}, ${werke} œuvre${werke > 1 ? "s" : ""} sur 5 enregistrée${werke > 1 ? "s" : ""}.`,
    vor: "Écris librement avec ",
    mitte: " - barre d'espace = barre de mesure, ",
    nach: " efface la dernière cellule.",
    leeresBlatt: "Feuille vide - compose à ta guise.",
    anhoeren: "Écouter",
    loeschen: "Effacer",
    nameFuerWerk: "Nom de ton œuvre",
    speichern: "Enregistrer",
    nochNichtsGeschrieben: "Rien d'écrit pour l'instant - écris d'abord quelques notes.",
    geleert: "Atelier vidé.",
    schonFuenf: "Tu as déjà enregistré cinq œuvres. Supprime-en une, et ça marchera de nouveau.",
    nochNichtsSpeichern: "Rien à enregistrer pour l'instant.",
    meinWerk: (n: number): string => `Mon œuvre ${n}`,
    gespeichert: (name: string, n: number): string => `« ${name} » enregistrée. Tu as maintenant ${n} œuvre${n > 1 ? "s" : ""} sur 5.`,
    gespeicherteListe: (namen: string, n: number): string => `Enregistrées : ${namen} (${n} sur 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Main droite seule (en haut, clé de sol)",
      lh: "Main gauche seule (en bas, clé de fa)",
      both: "Les deux mains",
    },
    rechteHand: "Main droite · clé de sol",
    linkeHand: "Main gauche · clé de fa",
  },

  touch: {
    gruppe: "Saisie par toucher",
    anleitungVor: "Touche les points de la cellule, puis ",
    zelleSetzen: "Poser la cellule",
    anleitungNach: ".",
    punkteGruppe: "Les six points d'une cellule",
    punkt: (p: number): string => `Point ${p}`,
    taktstrich: "Barre de mesure",
    pause: "Silence",
    letzteLoeschen: "Effacer la dernière cellule",
    taktPruefen: "Vérifier la mesure",
    bsiTitel: "Saisie braille à l'écran de VoiceOver",
    bsiHinweis:
      "Mets le rotor sur la saisie braille à l'écran et tape les cellules dans ce champ. Un balayage vers la droite avec un doigt donne la barre de mesure, vers la gauche efface la dernière cellule.",
    testen: "Tester la saisie braille - qu'est-ce qui arrive ?",
    nochNichts: "Rien n'a encore été saisi.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `« ${text} » (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "aucune cellule reconnue",
    nochKeinPunkt: "Aucun point choisi pour l'instant. Touche d'abord les points, puis Poser la cellule.",
    unbekannt: (zeichen: string): string =>
      `Je ne peux pas lire le caractère ${zeichen} comme des points. Utilise les boutons des points.`,
  },
};
