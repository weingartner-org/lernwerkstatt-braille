/** Bereich `aufgabenA` - Französisch: kp1 bis kp13, Stufe 2 (Haltebogen bis Triole) und Welt 1 „Oreilles fines". */
import type { aufgabenA as De } from "../de/aufgabenA";

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "Barre de mesure - la barre d'espace",
    zahlzeichen: "le signe numérique",
    obereZahl: (n: number): string => `le ${n} (chiffre haut)`,
    tiefeZahl: (n: number): string => `le ${n} en chiffre bas`,
    schlagzahl: (b: number): string => (Number.isInteger(b) ? String(b) : String(b).replace(".", ",")),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Écris : ${ton} - ${wert}.`,
    welcheNote: "Quelle est cette note ? Écoute et sens la cellule.",
    dasWar: (ton: string, wert: string): string => `C'était ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Deux sons. Lequel était le plus aigu ?",
    dreiHoechster: "Trois sons. Lequel était le plus aigu ?",
    ordinale: ["Le premier", "Le deuxième", "Le troisième"],
    hoechsterErklaer: (i: number): string =>
      `Le ${["premier", "deuxième", "troisième"][i]} son était le plus aigu.`,
    leiter: "Une petite gamme. Monte-t-elle ou descend-elle ?",
    leiterWahl: ["Elle monte", "Elle descend"],
    leiterRauf: "Elle montait.",
    leiterRunter: "Elle descendait.",
  },
  kp2: {
    prompt: (len: number): string =>
      `Écoute le rythme et frappe-le avec la barre d'espace - ${len} coups.`,
  },
  kp3: {
    grundform: " (La forme de base est la croche.)",
  },
  kp4: {
    prompt: "Écoute la mélodie et écris-la note par note.",
  },
  kp5: {
    viertelHinweis: " (Noire = ajouter le point 6 - comme le point 3 pour k à t.)",
    melodie: "Écris la mélodie - uniquement des noires.",
    frage: "Croche ou noire ?",
    wahl: ["Croche", "Noire"],
    erklaerAchtel: "Sans point supplémentaire en bas : une croche.",
    erklaerViertel: "Avec le point 6 en plus : une noire.",
  },
  kp6: {
    halbeHinweis: " (Blanche = ajouter le point 3.)",
    ganzeHinweis: " (Ronde = ajouter les points 3 et 6.)",
    frage: "Quelle est cette valeur de note ?",
    erklaer: (wert: string): string => `C'était une ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Écris : ${pause}.`,
    taktart: "Quel chiffrage de mesure figure ici ?",
    taktartErklaer: (a: number, b: number): string =>
      `C'était la mesure à ${a}/${b} : signe numérique, ${a} en haut, ${b} en chiffre bas.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Écris : ${ton1} blanche, barre de mesure (barre d'espace), ${ton2} blanche.`,
    taktstrichErklaer: "En braille, la barre de mesure est un espace.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Écris : ${ton} - ${wert} pointée. (Le point de prolongation est le point 3 dans SA PROPRE cellule.)`,
    punktZelle: "le point de prolongation - point 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Écris : ${vorzeichen}, puis ${ton} en noire. (L'altération se place juste AVANT la note.)`,
  },
  kp10: {
    lage: "À quelle hauteur sonne cette note ?",
    lageWahl: ["Grave (octave 3)", "Médium (octave 4)", "Aigu (octave 5)"],
    lageErklaer: (oktave: string): string => `C'était l'${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Écris comme PREMIÈRE note d'un morceau : ${ton} dans l'${oktave}, noire. (D'abord le signe d'octave, puis la note.)`,
    zeichenZelle: (oktave: string): string => `le signe de l'${oktave}`,
  },
  kp11: {
    gleich: "la même note",
    sekundeTerz: "une seconde ou une tierce",
    quarteQuinte: "une quarte ou une quinte",
    sexteMehr: "une sixte ou plus",
    regelKlein: "Seconde et tierce n'ont JAMAIS besoin d'un signe d'octave.",
    regelMittel: "Quarte et quinte n'en ont besoin QUE si l'octave change.",
    regelGross: "À partir de la sixte, la note a TOUJOURS besoin d'un signe d'octave.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Première note : ${ton1}, ${oktave1}. Ensuite : ${ton2}, ${oktave2}. La deuxième note a-t-elle besoin d'un signe d'octave ?`,
    wahl: ["Oui", "Non"],
    erklaer: (sprung: string, regel: string): string => `Le saut est : ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "À 4/4, UNE seule cellule remplit toute la mesure. Ronde ou double croche ?",
    grossWahl: ["Une ronde", "Une double croche"],
    grossErklaer:
      "Une cellule isolée qui doit remplir quatre temps est la GRANDE valeur : la ronde. Une double croche serait beaucoup trop courte.",
    kleinPrompt: "À 2/4, HUIT cellules identiques se suivent. Rondes ou doubles croches ?",
    kleinWahl: ["Des rondes", "Des doubles croches"],
    kleinErklaer:
      "Huit rondes ne tiennent jamais en deux temps - ce doivent être les PETITES valeurs : des doubles croches. La mesure et le contexte décident.",
  },
  kp13: {
    similePrompt: "Écris le signe braille de répétition de mesure (rejouer toute la mesure une fois de plus).",
    simileZelle: "le signe de répétition de mesure - points 2, 3, 5, 6",
    simileErklaer: "Cette abréviation n'existe qu'en braille - plus malin que l'imprimé !",
    startPrompt: "Écris : DÉBUT de reprise (deux cellules).",
    startZellen: ["première cellule - points 1, 2, 6", "deuxième cellule - points 2, 3, 5, 6"],
    endePrompt: "Écris : FIN de reprise (deux cellules).",
    endeZellen: ["première cellule - points 1, 2, 6", "deuxième cellule - points 2, 3"],
    schluss: "La barre finale (fin du morceau)",
    anfang: "Début de reprise",
    ende: "Fin de reprise",
    erkennenPrompt: "Quel est ce signe de forme ?",
    erkannt: (zeichen: string): string => `C'était : ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Deux blanches sur le même son. Attaquées une fois ou deux fois ?",
    hoerenWahl: ["Une fois - liées (liaison de prolongation)", "Deux fois - séparées"],
    hoerenGebunden: "Une seule attaque : la liaison de prolongation relie les deux notes en UN seul son long.",
    hoerenGetrennt: "Deux attaques : il n'y avait pas de liaison de prolongation - chaque note recommence.",
    schreibPrompt: (ton: string): string =>
      `Écris : ${ton} blanche, liaison de prolongation (deux cellules : point 4, puis 1 et 4), encore ${ton} blanche.`,
    zelle1: "Liaison de prolongation, première cellule - point 4",
    zelle2: "Liaison de prolongation, deuxième cellule - points 1, 4",
    klingtWeiter: (note: string): string => `${note} - continue de sonner, sans nouvelle attaque`,
    schreibErklaer: "La liaison de prolongation se place juste APRÈS la première note.",
    taktPrompt: (ton: string): string =>
      `Lier par-dessus la barre de mesure : ${ton} blanche, liaison de prolongation, barre de mesure (barre d'espace), ${ton} blanche.`,
    taktErklaer: "Ainsi un son continue de sonner par-dessus la barre de mesure.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `Mesure à ${a}/${b}. Écoute la mesure et compte avec : est-elle complète ?`,
    vollWahl: ["Complète", "Incomplète - une anacrouse ou une mesure partielle"],
    vollJa: (ziel: string): string => `Elle tombe juste : ${ziel} temps.`,
    vollNein: (summe: string, ziel: string): string =>
      `Il manque quelque chose : seulement ${summe} temps sur ${ziel} - une mesure partielle. Au début du morceau, on l'appelle anacrouse.`,
    bindestrichPrompt: "La mesure n'est pas encore finie à la fin de la ligne. Écris le trait d'union musical (point 5).",
    bindestrichZelle: "le trait d'union musical - point 5",
    bindestrichErklaer: "Le point 5 en fin de ligne dit : cette mesure continue sur la ligne suivante.",
    schreibPrompt: (ton: string): string =>
      `Écris l'anacrouse : ${ton} noire, barre de mesure (barre d'espace), puis la mesure complète.`,
    auftaktZelle: (note: string): string => `${note} - l'anacrouse`,
    schreibErklaer: "Une anacrouse est une première mesure incomplète - on l'écrit tout à fait normalement.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Écris : ${n} mesures de silence - signe numérique, le ${n}, puis la pause.`,
    zahlzeichenZelle: "le signe numérique - points 3, 4, 5, 6",
    zahlZelle: (n: number): string => `le nombre ${n}`,
    ganzePauseZelle: "la pause - points 1, 3, 4",
    vieleErklaer: "À partir de quatre mesures vides, le braille écrit le nombre sous forme de chiffre devant la pause.",
    kleinPrompt: (n: number): string =>
      `Écris : ${n} mesures vides - jusqu'à trois mesures, on répète simplement la pause ${n === 2 ? "deux fois" : "trois fois"}.`,
    kleinZelle: (i: number): string => `pause ${i} - une mesure entière vide`,
    kleinErklaer: "La pause remplit TOUJOURS une mesure entière - quel que soit le chiffrage de mesure.",
    lesenPrompt: "Combien de mesures silencieuses y a-t-il ici ?",
    takte: (n: number): string => `${n} mesures`,
    lesenKlein: (n: number): string => `${n} pauses de suite = ${n} mesures vides.`,
    lesenGross: (n: number): string => `Signe numérique + ${n} + pause = ${n} mesures de silence d'affilée.`,
    stillePrompt: "Trois mesures - l'une d'elles est tout à fait silencieuse. Laquelle ?",
    stilleWahl: ["Au début", "Au milieu", "À la fin"],
    stilleErklaer: (i: number): string =>
      `Le silence était ${["au début", "au milieu", "à la fin"][i]} - une mesure entière de pause.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["sol majeur", "ré majeur", "la majeur", "mi majeur"],
      be: ["fa majeur", "si bémol majeur", "mi bémol majeur", "la bémol majeur"],
    },
    kreuz: "dièse",
    be: "bémol",
    kreuze: "dièses",
    bes: "bémols",
    lesenPrompt: (mehrzahl: string): string =>
      `Au début du morceau figure cette armure. Combien de ${mehrzahl} y a-t-il ?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - l'armure de ${tonart}. ${
        ab4 ? "À partir de quatre, le nombre figure devant sous forme de chiffre." : "Jusqu'à trois, le signe est simplement répété."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Écris l'armure : ${n} ${name} - le signe du ${zeichen} simplement ${n === 1 ? "une fois" : n === 2 ? "deux fois" : "trois fois"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Écris l'armure : ${n} ${mehrzahl} - à partir de quatre avec le signe numérique : signe numérique, le ${n}, puis le ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - points ${punkte}`,
    zahlzeichenZelle: "le signe numérique - points 3, 4, 5, 6",
    zahlZelle: (n: number): string => `le nombre ${n}`,
    dasZeichen: (name: string): string => `le ${name}`,
    istVorzeichnung: (tonart: string): string => `C'est l'armure de ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Écris l'en-tête du morceau : d'abord l'armure (${n} ${name}), juste derrière le chiffrage de mesure ${a}/${b} - sans espace entre les deux.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Tonalité et mesure figurent ensemble au début du morceau - d'abord les altérations, puis la mesure.",
    regelPrompt: "L'armure au début du morceau - jusqu'où vaut-elle ?",
    regelWahl: ["Pour tout le morceau", "Seulement pour la première mesure", "Seulement pour la première note"],
    regelErklaer:
      "L'armure vaut pour tout le morceau - une altération au milieu d'une mesure, en revanche, seulement jusqu'à la barre de mesure.",
  },
  taktwechsel: {
    sonderPrompt: "Quelle indication de mesure est-ce ?",
    sonderWahl: ["C - la mesure à quatre temps", "Alla breve - la mesure à deux blanches", "La mesure à 3/4"],
    sonderErklaerC: "Points 4, 6 avant le c : le C de la mesure à quatre temps.",
    sonderErklaerAb: "Points 4, 5, 6 avant le c : alla breve - les blanches battent la mesure.",
    sonderSchreibenC: "Écris le signe de mesure C : points 4 et 6, puis le c (points 1, 4).",
    sonderSchreibenAb: "Écris alla breve : points 4, 5 et 6, puis le c (points 1, 4).",
    vorzeichenC: "le signe préalable - points 4, 6",
    vorzeichenAb: "le signe préalable - points 4, 5, 6",
    dasC: "le c - points 1, 4",
    wechselPrompt: "Après quelques notes figure une DEUXIÈME indication de mesure. Qu'est-ce que cela signifie ?",
    wechselWahl: (a: number, b: number): string[] => [
      `La mesure change pour ${a}/${b}`,
      "La tonalité change",
      "Le morceau est terminé",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Une nouvelle indication de mesure au milieu du morceau signifie : à partir d'ici, la mesure à ${a}/${b} s'applique.`,
    wechselSchreiben: (a: number, b: number): string =>
      `Au milieu du morceau, la mesure change : écris la barre de mesure (barre d'espace), puis la nouvelle indication de mesure ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Quelle clé figure ici (trois cellules) ?",
    lesenErklaer: (schluessel: string): string =>
      `C'était la ${schluessel}. Toutes les clés commencent par les points 3, 4, 5 et se terminent par les points 1, 2, 3 - le milieu les distingue.`,
    mitteViolin: "points 3, 4",
    mitteBass: "points 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Écris la ${schluessel} - trois cellules : points 3, 4, 5 · ${mitte} · points 1, 2, 3.`,
    ankuendigung: "l'annonce de la clé - points 3, 4, 5",
    gZeichen: "le signe du sol - points 3, 4",
    fZeichen: "le signe du fa - points 3, 4, 5, 6",
    abschluss: "la fin - points 1, 2, 3",
    wissenPrompt: "Le braille musical a-t-il besoin de clés pour déterminer la hauteur ?",
    wissenWahl: ["Non - les signes d'octave disent la hauteur", "Oui - sans clé, rien ne marche"],
    wissenErklaer:
      "En braille, les signes de clé ne sont qu'une information sur la partition imprimée - la hauteur est toujours déterminée par les signes d'octave.",
  },
  sechzehntel: {
    hoerenPrompt: "Une petite course. Des croches - ou des doubles croches deux fois plus rapides ?",
    hoerenWahl: ["Croches", "Doubles croches"],
    hoerenSchnell: "C'étaient des doubles croches - quatre sur un temps.",
    hoerenLangsam: "C'étaient des croches - deux sur un temps.",
    gruppePrompt:
      "Écris le groupe de quatre doubles croches : seule la PREMIÈRE note reçoit les points 3 et 6, les trois autres s'écrivent comme des croches (groupement).",
    ersteZelle: (ton: string): string => `${ton} en double croche - avec les points 3 et 6`,
    andereZelle: (ton: string): string => `${ton} - écrit comme une croche (fait partie du groupe)`,
    gruppeErklaer: "Le groupement rend les courses rapides lisibles : points de valeur seulement sur la première note du groupe.",
    regelPrompt:
      "Quatre doubles croches sur un temps, écrites en groupe : combien de cellules portent les points de valeur 3 et 6 ?",
    regelWahl: ["Seulement la première", "Les quatre", "La première et la dernière"],
    regelErklaer:
      "Seule la première note du groupe montre la valeur - le reste ressemble à des croches. C'est l'équivalent braille du groupe lié par une ligature dans l'imprimé.",
    einzelnPrompt: (ton: string): string =>
      `Écris : ${ton} en double croche. (Attention - même cellule que la ronde ; c'est la mesure qui décide !)`,
  },
  triolen: {
    hoerenPrompt: "Entre deux temps calmes : combien de sons se partagent UN temps - deux ou trois ?",
    hoerenWahl: ["Deux - croches normales", "Trois - un triolet"],
    hoerenTriole: "Trois sons de même durée sur un temps : un triolet.",
    hoerenZwei: "Deux croches - la division normale.",
    schreibPrompt: "Écris le triolet : d'abord le signe de triolet (points 2, 3), puis les trois croches.",
    triolenZeichen: "le signe de triolet - points 2, 3",
    achtelZelle: (ton: string): string => `${ton}, croche - un tiers du temps`,
    schreibErklaer: "Le signe de triolet figure UNE FOIS avant le groupe - il fait de deux croches trois.",
    lesenPrompt: "Devant trois croches figure cette première cellule (points 2, 3). Que signifie-t-elle ?",
    lesenWahl: ["Un triolet - trois sons sur un temps", "Un demi-soupir", "Un signe d'octave"],
    lesenErklaer: "Points 2, 3 devant un groupe de notes = triolet.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Sens la pulsation de base et frappe-la régulièrement avec la barre d'espace - ${n} coups.`,
    metrumPrompt: "Écoute les temps accentués : est-ce que cela marche à deux temps ou valse à trois temps ?",
    metrumWahl: ["Marche - à deux temps", "Valse - à trois temps"],
    metrumDrei: "Le premier de trois temps est toujours accentué : un ternaire - le pas de valse.",
    metrumZwei: "Le premier de deux temps est toujours accentué : un binaire - le pas de marche.",
    abstandPrompt: "Compte les temps d'un accent au suivant : combien y en a-t-il ?",
    abstandWahl: ["2 temps", "3 temps", "4 temps"],
    abstandErklaer: (n: number): string => `D'un accent au suivant, il y a ${n} temps - une mesure à ${n}/4.`,
  },
  dauer: {
    vergleichPrompt: "Deux sons l'un après l'autre. Lequel a duré plus longtemps ?",
    vergleichWahl: ["Le premier", "Le deuxième"],
    vergleichErster: "Le premier était une blanche - deux fois plus long que les noires qui suivent.",
    vergleichZweiter: "Le deuxième était une blanche - deux fois plus long que les noires d'avant.",
    schlaegePrompt: "D'abord deux temps de pulsation, puis un son long : combien de temps a-t-il duré ?",
    schlaegeWahl: ["1 temps - une noire", "2 temps - une blanche", "4 temps - une ronde"],
    schlaegeErklaer: (wert: string, zahl: number): string => `C'était une ${wert} - ${zahl} temps de long.`,
    paarPrompt: "Deux sons : de même durée - ou le deuxième deux fois plus long ?",
    paarWahl: ["De même durée", "Le deuxième deux fois plus long"],
    paarGleich: "Deux noires de même durée.",
    paarDoppelt: "D'abord une noire, puis une blanche - deux fois plus long.",
  },
  dynamik: {
    lautPrompt: "Écoute la petite phrase : jouée fort ou doux ?",
    lautWahl: ["Fort", "Doux"],
    lautErklaer: "Joué avec force - plus tard, cela s'appellera forte.",
    leiseErklaer: "Joué très délicatement - plus tard, cela s'appellera piano.",
    rampePrompt: "La phrase devient-elle plus forte ou plus douce ?",
    rampeWahl: ["Plus forte", "Plus douce"],
    cresc: "De doux à fort - plus tard, cela s'appelle crescendo.",
    decresc: "De fort à doux - plus tard, cela s'appelle decrescendo.",
    akzentPrompt: "Un son est particulièrement appuyé. Où était-il ?",
    akzentWahl: ["Au début", "Au milieu", "À la fin"],
    akzentErklaer: (i: number): string =>
      `Le son appuyé se trouvait ${["au début", "au milieu", "à la fin"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Piano - frappé, attaque claire avec résonance.",
      gitarre: "Guitare - pincée, percussive et cordée.",
      sax: "Saxophone - soufflé, tenu et à la couleur d'anche.",
      floete: "Flute traversière - soufflée, douce et claire.",
    },
    hoerenPrompt: "Quel instrument joue ici ?",
    vergleichPrompt: "Deux motifs l'un après l'autre : le même instrument ou des instruments différents ?",
    vergleichWahl: ["Le même instrument", "Des instruments différents"],
    vergleichGleich: "Les deux motifs venaient du même instrument.",
    vergleichErklaer: (a: string, b: string): string => `D'abord ${a}, puis ${b}.`,
    zuerstPrompt: "Deux instruments l'un après l'autre. Lequel a joué en premier ?",
    zuerstErklaer: (a: string): string => `${a} a joué en premier.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Jeu d'écho : écoute les ${len} sons et rejoue-les au clavier - D F G H J K L sont do ré mi fa sol la si. Seule la suite des sons compte, le rythme est libre.`,
    erklaer: "Rejoue les sons dans l'ordre où tu les as entendus.",
  },
  memory: {
    prompt:
      "Mémoire mélodique : je joue une suite de sons, tu la rejoues (D F G H J K L = do ré mi fa sol la si). Si tu réussis, un son s'ajoute - jusqu'où iras-tu ?",
  },
};
