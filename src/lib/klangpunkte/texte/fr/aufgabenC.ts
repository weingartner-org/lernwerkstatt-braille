/** Bereich `aufgabenC` - Französisch: Aufgabentexte der Welten 7, 8 und 9. */
import type { aufgabenC as De } from "../de/aufgabenC";

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `le signe de l'${oktave}`,
    oktavzeichen: "le signe d'octave",
    vorzeichen: "l'altération",
    verlaengerungspunkt: "le point de prolongation - point 3",
    taktstrich: "Barre de mesure - la barre d'espace",
  },

  // --- Monde 7 « Terrain de jeu de la théorie » -----------------------------
  tonleitern: {
    spielNach:
      "Rejoue la gamme de do majeur en montant : do ré mi fa sol la si do - au clavier D F G H J K L, puis octave plus haut et encore D.",
    spielNachErkl: "Huit degrés d'un do jusqu'au do suivant.",
    durMollFrage: "Écoute la gamme - majeur (clair) ou mineur (sombre) ?",
    durMollWahl: ["Majeur", "Mineur"],
    durMollErklMoll: "Le troisième degré est abaissé - mineur naturel.",
    durMollErklDur: "Une pure gamme majeure.",
    fehlerFrage: "Dans cette gamme majeure, UN son est déplacé. Quel degré était faux ?",
    fehlerWahl: ["Degré 3", "Degré 4", "Degré 5", "Degré 6", "Degré 7"],
    fehlerErkl: (stufe: number): string => `Le degré ${stufe} sonnait trop haut.`,
    schreibe:
      "Écris la gamme de sol majeur : sol la si do ré mi - et puis fa dièse, donc un dièse devant le fa (c'est l'unique altération de sol majeur).",
    schreibeErkl: "Sol majeur a un dièse : le fa devient fa dièse.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "dièse", mehr: "dièses" },
      be: { ein: "bémol", mehr: "bémols" },
    },
    anzahlFrage: (name: string, mehr: string): string => `Étape : ${name}. Combien de ${mehr} cette tonalité a-t-elle ?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} a ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - quelle est cette tonalité majeure ?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort} : c'est ${name}.`,
    lesenFrage: "Lis l'armure en braille - quelle tonalité ?",
    lesenErkl: (name: string): string => `Cette armure appartient à ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Lis le rythme sur la portée et frappe-le avec la barre d'espace - à vue.",
    diktatFrage: (rhythm: boolean): string =>
      `Dictée rythmique : je frappe une mesure sur le son sol. Écris les valeurs que tu entends${rhythm ? " (le langage rythmique est activé)" : ""}. Le son de départ est sol. Écoute autant que tu veux.`,
    diktatErkl: "Compte les temps pour chaque son : noire = un temps, blanche = deux.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Dictée mélodique : le son de départ est ${startton}. Écoute les ${anzahl} sons et écris-les - ils avancent par petits pas. Écoute autant que tu veux.`,
    erkl: "Compare son après son avec le son de départ : monte-t-on ou descend-on ?",
  },

  detektiv: {
    frage: "Lis la ligne braille et écoute l'enregistrement. À quel endroit le son s'écarte-t-il des notes ?",
    note: (n: number): string => `Note ${n}`,
    allesRichtig: "Tout est juste",
    erklRichtig: "Tout était juste - le son et les notes étaient identiques.",
    erklAnders: (n: number): string => `La note ${n} sonnait autrement que ce qui était écrit.`,
  },

  baumeister: {
    dreiViertel: "Construis une mesure à 3/4 complète : écris des notes et des silences avec f d s j k l jusqu'à ce que les temps fassent exactement 3. Entrée vérifie.",
    mitPause: "Construis une mesure à 4/4 avec au moins UN silence. Entrée vérifie.",
    mitNoten: "Construis une mesure à 4/4 avec au moins TROIS notes. Entrée vérifie.",
    sechsAchtel: "Pour aller plus loin : construis une mesure à 6/8 complète (six temps de croche). Entrée vérifie.",
  },

  spielwiese: {
    frage:
      "Terrain de jeu sonore : sur le bourdon doux, tu peux jouer librement - avec D F G J K (pentatonique). Aucun son ne peut être faux. Raconte une petite histoire : d'abord doux, puis fort. À partir de 30 sons, l'atelier est visité.",
  },

  kadenzen: {
    schlussFrage: "Deux accords comme conclusion - est-ce que cela sonne fini ou est-ce que ça continue ?",
    schlussWahl: ["Fini - une vraie conclusion", "Ouvert - ça continue"],
    schlussErklOffen: "Sur la dominante (V), cela reste ouvert - demi-cadence.",
    schlussErklZu: "De la dominante retour à l'accord de base - cela sonne fini (cadence parfaite).",
    artFrage: "Quelle tournure de conclusion est-ce ?",
    artWahl: ["Authentique - de la dominante (V) à l'accord de base", "Plagale - la conclusion « amen » depuis la sous-dominante (IV)"],
    artErklPlagal: "IV vers I - la douce conclusion « amen » (plagale).",
    artErklAuth: "V vers I - la conclusion forte, authentique.",
    funktionFrage: "Quelle fonction cet accord a-t-il en do majeur ?",
    funktionWahl: ["Tonique (degré I)", "Sous-dominante (degré IV)", "Dominante (degré V)"],
    funktionErkl: [
      "Tonique (T) - l'accord de base sur le degré I.",
      "Sous-dominante (S) - degré IV.",
      "Dominante (D) - degré V.",
    ],
  },

  komponier: {
    frage:
      "Atelier de composition : écris librement avec f d s j k l, écoute ton œuvre et enregistre-la (jusqu'à 5). L'atelier est visité dès que tu as enregistré une œuvre.",
  },

  // --- Monde 8 « À la découverte des instruments » --------------------------
  fingersatz: {
    lesenFrage: "Lis la note et le doigté : quel doigt doit jouer la note ? (Le doigté se place APRÈS la note.)",
    lesenErkl: (finger: string): string => `Le petit chiffre après la note, c'est : ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Écris la note ${ton} et ajoute le doigté pour : ${finger} - il se place APRÈS la note.`,
    fingerZelle: (finger: string): string => `${finger} - le doigté`,
    schreibenErkl: (finger: string): string => `Pour ${finger}, le chiffre se place juste derrière la note.`,
    positionFrage: "Où se place le doigté - avant ou après la note ?",
    positionWahl: ["Après la note", "Avant la note"],
    positionErkl: "Contrairement à l'articulation, le doigté se place APRÈS la note (avant une éventuelle liaison de prolongation).",
  },

  klavier: {
    zweiFrage:
      "Deux lignes - en haut la main droite (clé de sol), en bas la main gauche (clé de fa). Combien de sons la main GAUCHE joue-t-elle ? Avec Alt + Q, tu peux voir et entendre une main seule en grand.",
    zweiWahl: (n: number): string => `${n} sons`,
    zweiErkl: "Compte les têtes de notes sur la ligne du bas - ou écoute la main grave seule (Alt + Q).",
    handFrage: "Cette ligne commence par un signe de main. Pour quelle main est-elle ?",
    handWahl: ["Main droite", "Main gauche"],
    handErklLinks: "Points 4, 5, 6 puis 3, 4, 5 : le signe de la main gauche.",
    handErklRechts: "Points 4, 6 puis 3, 4, 5 : le signe de la main droite.",
    melodieFrage:
      "Deux mains l'une après l'autre : l'une joue la mélodie (plus aigüe, mobile), l'autre accompagne dans le grave. Laquelle est venue comme mélodie ?",
    melodieWahl: ["La voix jouée en premier", "La deuxième voix"],
    melodieErkl: "La mélodie est la voix plus aigüe et mobile - le plus souvent la main droite.",
    rechteHandFrage: (ton: string): string =>
      `Écris le signe de la main droite (points 4, 6 · 3, 4, 5) puis la note ${ton} avec son signe d'octave.`,
    rechteHandZellen: ["main droite, première cellule - points 4, 6", "main droite, deuxième cellule - points 3, 4, 5"],
    rechteHandErkl: "Après le signe de main, la voix commence par un signe d'octave.",
    pedalFrage: "Quel est ce signe de pédale - et se place-t-il avant ou après la note ?",
    pedalWahl: ["Pédale enfoncée - AVANT la note", "Pédale relevée - APRÈS la note"],
    pedalErklNieder: "Pédale enfoncée (points 1, 2, 6 · 1, 4) se place avant la note à partir de laquelle on appuie.",
    pedalErklAuf: "Pédale relevée (points 1, 6 · 1, 4) se place après la note avec laquelle on relâche.",
  },

  gesang: {
    melismaFrage: "Sur la syllabe « la » - combien de sons la voix chante-t-elle ? (Plusieurs sons sur une syllabe s'appellent un mélisme.)",
    melismaWahl: ["Un son", "Deux sons", "Trois sons"],
    melismaErkl: (n: number): string =>
      `La syllabe reçoit ${n} sons - un mélisme. En braille, la liaison de syllabe (points 1, 4) les relie.`,
    bogenFrage:
      "Une syllabe sur deux sons : écris la première note, la liaison de syllabe (points 1, 4) et la deuxième note.",
    bogenZelle: "Liaison de syllabe - points 1, 4",
    bogenErkl: "La liaison de syllabe dit : les deux sons appartiennent à une seule syllabe.",
    atemFrage: "Dans cette ligne figure un signe de respiration. Après quel son respire-t-on ?",
    atemWahl: ["Après le premier son", "Après le deuxième son", "Après le troisième son"],
    atemErkl: "Le demi-signe de respiration (points 3, 4, 5 · 2) se place juste après le premier son.",
    zeilenFrage: "Dans le chant, lignes de texte et lignes de musique alternent. Quel préfixe annonce une ligne de TEXTE ?",
    zeilenWahl: ["Préfixe de texte (points 5, 6 · 2, 3)", "Préfixe de musique (point 6 · 3)"],
    zeilenErkl: "La ligne de texte porte le préfixe points 5, 6 · 2, 3 ; la ligne de musique point 6 · point 3.",
  },

  gitarre: {
    saiteFrage:
      "Le signe de corde (points 1, 4, 6) et un chiffre disent sur quelle corde on joue. Quelle corde est-ce ?",
    saiteWahl: (s: number): string => `${s}${s === 1 ? "re" : "e"} corde`,
    saiteErkl: (s: number): string => `Signe de corde plus chiffre ${s} : la ${s}${s === 1 ? "re" : "e"} corde.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Écris l'indication pour la ${saite}${saite === 1 ? "re" : "e"} corde puis la note ${ton} : d'abord le signe de corde (points 1, 4, 6), puis le chiffre, puis la note.`,
    saitenzeichenZelle: "Signe de corde - points 1, 4, 6",
    ziffernZelle: (saite: number): string => `le chiffre ${saite} - la ${saite}${saite === 1 ? "re" : "e"} corde`,
    schreibenErkl: "Le signe de corde se place avant la note ; ensuite ne vient AUCUN signe d'octave.",
    akkordSorten: { dur: "accord parfait majeur", moll: "accord parfait mineur", sept: "accord de septième de dominante (7 en italique)" },
    akkordFrage:
      "Écoute l'accord arpégé - de quelle espèce est-il ? (Cercle, triangle et 7 en italique sont internationaux ; les symboles à lettres comme « C7 » s'écrivent un peu différemment dans chaque pays.)",
    akkordErkl: (sorte: string): string => `C'était un ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "La note de basse est chiffrée d'un 6. Quelle réalisation sonne juste - avec sixte ou avec quinte au-dessus de la basse ?",
    aussetzungWahl: ["Tierce et sixte au-dessus de la basse", "Tierce et quinte au-dessus de la basse"],
    aussetzungErklSext: "Un 6 demande la sixte au-dessus de la basse - l'accord de sixte.",
    aussetzungErklQuint: "Sans chiffrage (ou 5/3), l'accord de base sonne avec la quinte.",
    stufeFrage: "La basse chiffrée pense en degrés. Quel degré principal entends-tu ici ?",
    stufeWahl: ["Tonique (degré I)", "Sous-dominante (degré IV)", "Dominante (degré V)"],
    stufeErkl: [
      "C'était la tonique (degré I) - le pont de la cadence vers la basse chiffrée.",
      "C'était la sous-dominante (degré IV) - le pont de la cadence vers la basse chiffrée.",
      "C'était la dominante (degré V) - le pont de la cadence vers la basse chiffrée.",
    ],
    schreibenFrage:
      "Écris une note de basse chiffrée : le do et dessous le chiffrage 6 (signe numérique et chiffre bas 6).",
    zahlzeichenZelle: "Signe numérique - points 3, 4, 5, 6",
    ziffer6Zelle: "le chiffre bas 6 - points 2, 3, 5",
    schreibenErkl: "Les chiffres de la basse chiffrée se placent comme chiffres BAS derrière le signe numérique.",
  },

  partitur: {
    auftakt: {
      frage: "Un morceau commence par une anacrouse. Quel numéro porte cette première mesure incomplète ?",
      wahl: ["Mesure 0", "Mesure 1", "Mesure 2"],
      erkl: "L'anacrouse compte comme mesure 0 - la première mesure complète est alors la mesure 1.",
    },
    taktzahl: {
      frage: "Voici à quoi ressemble un numéro de mesure en marge de la ligne (ici : 16). Un signe numérique le précède-t-il ?",
      wahl: ["Non - les numéros de mesure se placent sans signe numérique", "Oui - toujours avec le signe numérique"],
      erkl: "Les numéros de mesure en marge se placent sans signe numérique - seulement les chiffres eux-mêmes.",
    },
    format: {
      frage: "Comment la partition braille dispose-t-elle deux mains ou voix pour qu'on puisse les comparer mesure par mesure ?",
      wahl: ["Section par section, ligne sur ligne (bar-over-bar)", "Tout sur une seule longue ligne"],
      erkl: "Dans le format bar-over-bar, les voix sont superposées section par section - mesure à côté de mesure, lisible.",
    },
    quellen: {
      frage: "Où trouve-t-on des éditions de musique braille toutes prêtes à lire ?",
      wahl: ["Dans les bibliothèques pour aveugles comme la dzb lesen ou la SBS", "Seulement en les recopiant soi-même"],
      erkl: "Des bibliothèques comme la dzb lesen (Leipzig) et la SBS (Zurich) tiennent des milliers de titres à disposition en musique braille.",
    },
  },

  orchester: {
    familieKlavier: "instrument à cordes (frappées)",
    familieGitarre: "instrument à cordes (pincées)",
    familieBlas: "instrument à vent (soufflé)",
    hoerenFrage: "Écoute le court motif - à quelle famille d'instruments appartient ce son ?",
    hoerenWahl: ["Cordes - pincées ou frappées", "Vents - soufflés", "Membranes - frappées"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument} : ${familie}.`,
    fragen: [
      { frage: "À quelle famille appartient le tambour (selon Hornbostel-Sachs) ?", richtig: "Membranes", falsch: ["Cordes", "Vents"] },
      { frage: "À quelle famille appartient le violon ?", richtig: "Cordes", falsch: ["Vents", "Membranes"] },
      { frage: "À quelle famille appartient la flute à bec ?", richtig: "Vents", falsch: ["Membranes", "Idiophones"] },
      { frage: "À quelle famille appartient le triangle ?", richtig: "Idiophones", falsch: ["Membranes", "Cordes"] },
    ],
    familieErkl: (richtig: string): string => `Juste : ${richtig}.`,
  },

  // --- Monde 9 « Scène des chansons » ---------------------------------------
  lieder2: {
    dazuWahl: [
      "Cela devenait plus fort - un crescendo",
      "Les sons devenaient courts - staccato",
      "Les sons coulaient doucement les uns dans les autres - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `« ${titel} » - d'abord sec, puis avec expression. Qu'est-ce qui s'est ajouté ?`,
    dazuDynamikErkl: "La deuxième version devenait plus forte - un crescendo.",
    dazuStaccatoFrage: (titel: string): string => `« ${titel} » - qu'est-ce qui s'est ajouté à la version sèche ?`,
    dazuStaccatoErkl: "Les sons devenaient courts et piqués - staccato.",
    dazuLegatoFrage: (titel: string): string => `« ${titel} » - qu'est-ce qui s'est ajouté ?`,
    dazuLegatoErkl: "Les sons étaient doucement liés - legato, la liaison.",
    articFrage: (titel: string): string => `« ${titel} » - joué lié (legato) ou court (staccato) ?`,
    articWahl: ["Lié - legato", "Court - staccato"],
    articErklLegato: "Les sons coulaient les uns dans les autres - legato.",
    articErklStaccato: "Chaque son court et détaché - staccato.",
  },

  lesekonzert: {
    frage:
      "Concert de lecture : lis la ligne braille (elle n'est PAS jouée !), grave-la dans ta mémoire et appuie sur « Lecture terminée ». Puis rejoue les sons de mémoire au clavier.",
    erkl: "Lire, retenir, jouer - c'est exactement ainsi qu'on lit la musique braille à l'instrument.",
  },

  liederquiz: {
    hoerenFrage: "Écoute le début - quelle chanson est-ce ?",
    hoerenErkl: (titel: string): string => `C'était le début de « ${titel} ».`,
    lesenFrage: "Lis la ligne initiale en braille - sans le son ! Quelle chanson reconnais-tu ?",
    lesenErkl: (titel: string): string => `Cette ligne est le début de « ${titel} » - lecture silencieuse avec l'oreille intérieure.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, ligne ${zeile} : d'abord écouter, puis écrire note par note - maintenant AVEC les signes d'octave.`,
  },
};
