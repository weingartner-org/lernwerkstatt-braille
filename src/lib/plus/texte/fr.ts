/**
 * Plus en français. Gleiche Felder wie `de.ts` (Typ `PlusTexte`).
 *
 * ★ Kinder werden geduzt („tu"), warm und kurz, so wie Tastenflow fr sie
 *   anspricht. Nichts Österreichisches: keine „Schulstufe", keine Lehrplan-Namen
 *   - „Niveau" zählt Plus selbst.
 * ★ Wörter wie in Tastenflow fr: „plage braille", „lecteur d'écran", „raccourcis
 *   clavier", „Réglages". Die Mathematikschrift heißt hier „braille mathématique"
 *   (Notation mathématique braille, CEBF/INJA/AVH 2007).
 * ★ Nur die neue Rechtschreibung (Wächter `tests/tastenflow-neue-rechtschreibung-fr.test.ts`):
 *   „entrainement", „connait" - kein Zirkumflex auf i und u.
 * ★ Stoffplan: `stoffFr.ts` (Stufen und Übungen, nur was Französisch heute anbietet).
 */
import { ZEICHENABSTAND_LABELS_FR } from "@/lib/typing/zeichenabstand";
import type { PlusTexte } from "./typ";
import { STOFF_FR } from "./stoffFr";

export const fr: PlusTexte = {
  sprache: "fr",
  stufe: (nr) => `Niveau ${nr}`,
  zurueck: "Retour",
  logoBeschreibung:
    "Le logo de Plus : une touche turquoise aux coins arrondis. Dessus, deux bulles blanches. " +
    "Dans la petite, derrière, le mot plus est écrit en braille. Dans la grande, devant, il y a un signe plus.",

  start: {
    hallo: (v) => `Bonjour ${v} !`,
    willkommen: "Bienvenue dans Plus !",
    wiederDa: "Content de te revoir.",
    neu: "Du calcul mental. Sans minuterie, sans pression.",
    fuerAlleKopf: "Exercice pour la classe",
    fuerAlleAnzahl: (n) => `${n} questions. Tout le monde fait les mêmes.`,
    losGeht: "C'est parti",
    trainingMarke: (stufe) => `Mon entrainement${stufe !== null ? ` · Niveau ${stufe}` : ""}`,
    trainingSucht: "Plus choisit les questions.",
    etappe: (nr, name) => `Étape ${nr} : ${name}`,
    allesGeschafft: "Tout est fait !",
    rundeInfo: "8 questions par série. Pas de minuterie.",
    weiterrechnen: "Continuer",
    etappenGeschafft: (g, n) => `${g} sur ${n} étapes réussies.`,
    wochenzielTitel: "Objectif de la semaine",
    wochenstand: (g, z) => (g >= z ? `Objectif de la semaine atteint : ${g} sur ${z}.` : `Cette semaine : ${g} questions sur ${z}.`),
    oder: "Ou plutôt …",
    wahlTitel: "Je choisis",
    wahlSatz: "Choisis un exercice.",
    spieleTitel: "Jeux",
    spieleSatz: "Du calcul, mais autrement.",
    sammlungTitel: "Ma collection",
    sammlungLeer: "Badges et objectif de la semaine.",
    sammlungAnzahl: (n) => `${n} badges.`,
    anmeldenSatz: "Connecte-toi. Alors ta progression est sur chaque appareil.",
    anmelden: "Se connecter",
  },

  stufenwahl: {
    trainingTitel: "Mon entrainement - quel niveau ?",
    trainingHinweis: "Plus mélange la série : ce que tu sais déjà, la suite et un peu de révision.",
  },

  wahl: {
    stufenTitel: "Quel niveau ?",
    paketTitel: (stufe) => `${stufe} - quel exercice ?`,
    offen: (n) => (n === 1 ? "Un exercice de ce niveau n'est pas encore prêt." : `${n} exercices de ce niveau ne sont pas encore prêts.`),
    feste: "Ton enseignant règle le niveau.",
    andere: "Autre niveau",
  },

  seite: {
    bereichTraining: "Mon entrainement",
    bereichWahl: "Je choisis",
    bereichStart: "Accueil",
    bereichFuerAlle: "Exercice pour la classe",
    einstellungen: "Réglages",
    einstellungenZurueck: "Retour au calcul",
    stimmeFehlt: "Aucune voix française n'est installée sur cet appareil.",
    vorlesenAn: "La lecture à voix haute est activée.",
    stimmeHinweis: "Ton lecteur d'écran ne lit pas les signes de calcul. La voix de Plus, si.",
    fuerAlleGestartet: "Ton enseignant a lancé un exercice pour la classe.",
    passwortTitel: "Changer le mot de passe",
    hilfeTitel: "Plus - Aide",
    macHinweis: "Sur un Mac, la touche Alt s'appelle Option (⌥).",
    hilfe: [
      "Mon entrainement te guide dans le calcul de ton niveau. Étape après étape, toujours plus loin.",
      "Tu peux aussi utiliser : Je choisis (choisir un exercice). Tes chiffres sont dans le menu du compte, en haut à droite.",
      "Une série compte huit questions. Il n'y a ni minuterie ni pression.",
      "Tu peux écrire la réponse avec des chiffres ou la saisir en braille. Alt + B change de mode : chiffres, braille informatique, braille mathématique à six points.",
      "Le calcul est déjà dans le champ. Tu écris dans le trou ou après le signe égal. Si le calcul a disparu : appuie deux fois sur Maj. Plus redit la question et remet le calcul dans le champ. Alt + W redit la question. Alt + Z dit où tu en es. Alt + E te mène au champ.",
      "Avec « Passer la question », tu vas à la question suivante. Une question passée ne compte ni comme juste ni comme fausse.",
      "En saisie braille, le champ montre ce que tu as saisi. Dessous, tu vois ce que Plus en lit.",
      "Dans les calculs posés, tu peux demander à voir le détail : étape par étape, aussi souvent que tu veux.",
      "Alt + V fait tout lire à voix haute par Plus. Ctrl l'arrête tout de suite. Le haut-parleur de l'en-tête ouvre un menu pour régler la vitesse, le volume et les sons.",
    ],
    kuerzel: [
      ["Alt + B", "Changer le mode d'écriture, de partout : chiffres - braille informatique - braille mathématique 6 points"],
      ["Maj deux fois", "La question encore une fois - et le calcul revient dans le champ"],
      ["Alt + W", "Redire la question"],
      ["Alt + Z", "Dire où tu en es (question 3 sur 8)"],
      ["Alt + E", "Aller au champ de réponse"],
      ["Entrée", "Vérifier la réponse - et après une bonne réponse, continuer"],
      ["Alt + P", "Vérifier - aussi dans les calculs posés, où Entrée fait une nouvelle ligne"],
      ["Ctrl + Entrée", "Vérifier - comme Alt + P"],
      ["⌫", "En saisie braille : effacer la dernière cellule"],
      ["F D S  J K L", "Les six touches braille (comme sur une machine braille)"],
      ["A  ;", "Point 7 et point 8 - seulement en braille informatique"],
      ["Échap", "Fermer une fenêtre - retour au champ de réponse"],
      ["Alt + G", "Aller au titre suivant"],
      ["Ctrl", "Arrêter tout de suite : le message parlé s'arrête. La lecture reste activée"],
      ["Alt + V", "Lecture à voix haute activée / désactivée - vitesse, volume et sons sont dans le menu du haut-parleur"],
      ["Alt + O", "Ouvrir / fermer les réglages"],
      ["Alt + H", "Ouvrir / fermer l'aide"],
      ["Alt + T", "Ouvrir / fermer la liste des raccourcis clavier"],
      ["Alt + J", "Ouvrir / fermer mon compte"],
      ["Alt + K", "Ouvrir / fermer les couleurs et le contraste"],
      ["Alt + +", "Plus grand (texte et champ de réponse)"],
      ["Alt + -", "Plus petit"],
      ["Alt + 0", "Taille normale"],
      ["Alt + Maj + P", "Signaler un problème - avec une image de la fenêtre"],
    ],
  },

  uebung: {
    fallbackTitel: "Mon entrainement",
    nochNichts: "Rien pour l'instant.",
    luecke: "Un trou est encore vide.",
    veraendert: "Le calcul a changé au début. Appuie deux fois sur Maj pour le remettre.",
    richtig: "Juste.",
    fastRichtig: (s) => `Presque juste. On l'écrit : ${s}.`,
    einheit: (h) => `Bien calculé - ${h ?? "pense à l'unité"}.`,
    restFehlt: "Bien calculé - le reste manque encore.",
    nochNicht: (h) => `Pas encore. ${h}`,
    nochNichtLeer: "Pas encore. Regarde encore une fois.",
    uebersprungen: "Passée.",
    aufgabeKurz: (k) => `Question : ${k}`,
    etappeVon: (nr, g) => `Étape ${nr} sur ${g}.`,
    aufgabeVon: (nr, g) => `Question ${nr} sur ${g}.`,
    aufgabeLabel: (nr, g) => `Question ${nr} sur ${g}`,
    danachRaetsel: "Une énigme suit.",
    genug: "C'est assez pour aujourd'hui. Reviens demain.",
    raetselVorspann: (r, g) => `${r} sur ${g} justes. Maintenant, une énigme.`,
    geschafft: "Bravo",
    richtigVon: (r, g) => `${r} sur ${g} justes.`,
    uebersprungenSatz: (n) => ` ${n === 1 ? "Une question passée" : `${n} questions passées`}.`,
    rundenBis: (n) => (n === 1 ? "Une énigme arrive après la prochaine série." : `Encore ${n} séries avant l'énigme.`),
    weiterNaechste: "Série suivante",
    andereUebung: "Choisir un autre exercice",
    genugHeute: "Assez pour aujourd'hui",
    nochDurchgang: "Encore une fois",
    danachMarke: (r) => (r ? "ensuite : énigme" : "ensuite : bilan"),
    danachSatz: (nr, gesamt, raetsel) => {
      const rest = gesamt - nr;
      const noch = rest === 0 ? "C'est la dernière." : rest === 1 ? "Une de plus après celle-ci." : `${rest} de plus après celle-ci.`;
      return `${noch}${raetsel ? " Une énigme suit." : ""}`;
    },
    merke: "À retenir :",
    zeigWeg: "Montre-moi le détail",
    nochSchritt: "Encore une étape",
    nochmalAnsagen: "Redire la question",
    tastenExtra: "Touche Maj deux fois : la question encore une fois - le calcul revient dans le champ",
    weiter: "Suivant",
    pruefen: "Vérifier",
    loesungEine: (l) => `Une réponse est ${l}.`,
    loesung: (l) => `La réponse est ${l}.`,
    nichtWeiter: "Je bloque",
    ueberspringen: "Passer la question",
    beenden: "Terminer l'exercice",
    etappeZeile: (nr, g, name) => `Étape ${nr} sur ${g} : ${name}`,
  },

  eingabe: {
    arten: {
      normal: "Écrire les chiffres",
      computer: "Braille informatique",
      marburger: "Braille mathématique, 6 points",
    },
    antwort: "Ta réponse",
    tasteArt: "Alt + B change le mode d'écriture",
    tasteGroesse: "Alt + Plus agrandit · Alt + Moins réduit · Alt + 0 remet",
    tasteZeile: "Entrée : nouvelle ligne · Alt + P vérifie",
    tasteZurueck: "Touche Maj deux fois : remettre le calcul",
    artAnsage: (art, steht) => `${art}. ${steht ? "Le calcul est dans le champ." : "Le champ est de nouveau vide."}`,
    anfang: "Au début de la ligne.",
    feldLeer: "Le champ est vide.",
    geloescht: "effacé",
    punkte: (p) => `Points ${p === "leer" ? "vide" : p}`,
    keineRechnung: "Il n'y a pas de calcul à remettre ici.",
    rechnungDa: "Le calcul est revenu.",
    soLese: "Voici comment je lis :",
    nochNichts: "rien pour l'instant",
    tastenFuer: "Touches de cet exercice",
  },

  einstellungen: {
    gruppeEingabe: "Saisie",
    gruppeAnzeige: "Affichage",
    gruppeKlang: "Son et lecture à voix haute",
    braillezeile: "Travailler avec une plage braille",
    zeilenAn: "Toute la question est dans le champ de réponse, même les problèmes. Les lignes passent à la ligne pour que tu sautes le moins possible. Tu écris dans le trou.",
    zeilenAus: "La question est en haut et le champ de réponse est vide. Tu tapes les chiffres et les signes de calcul au clavier.",
    unterwegsVor: "En route,",
    unterwegsNach: " le change.",
    schrift: "Code braille",
    schriftNamen: { computer: "Braille informatique (8 points)", marburger: "Braille mathématique (6 points)" },
    schriftErkl: (schrift, eingabe) => {
      const aus = schrift === "computer"
        ? "La question est dans le champ en braille informatique. Il a huit points et chaque signe tient dans une cellule, comme sur ta plage braille."
        : "La question est dans le champ en braille mathématique à six points. Chaque chiffre est un signe avec le point 6 - comme dans un livre d'école.";
      const ein = eingabe === "tastatur"
        ? "Tu tapes les chiffres au clavier et le champ les transforme en cellules."
        : schrift === "computer"
          ? "Tu saisis le braille avec F D S et J K L. A et ; donnent les points 7 et 8."
          : "Tu saisis le braille avec six points : F D S et J K L.";
      return `${aus} ${ein}`;
    },
    wieDuSchreibst: "Comment tu écris",
    wegNamen: { tastatur: "Chiffres au clavier", braille: "Saisie braille" },
    breite: "Plage braille de 40 ou 80 caractères",
    breiteKurz: "Plage braille",
    breiteNamen: { 40: "40 caractères", 80: "80 caractères" },
    breiteErkl: {
      40: "Le champ fait au plus 40 caractères de large, comme une plage braille de 40 cellules. Les longues questions passent plus souvent à la ligne.",
      80: "Le champ fait au plus 80 caractères de large, comme une plage braille de 80 cellules. La plupart des questions tiennent sur une ligne.",
    },
    festgelegtNach: ". Ton enseignant l'a réglé pour toi.",
    an: "activé",
    aus: "désactivé",
    soSteht: (b) => `Voici à quoi ressemble ${b} dans le champ :`,
    ausschreiben: "Écrire les calculs en toutes lettres",
    ausschreibenJa: "Oui - en mots : quarante-huit plus vingt-sept égale",
    ausschreibenNein: "Non - court : 48 +27 =",
    ausschreibenErkl: "En toutes lettres, c'est pour les enfants qui écoutent seulement. Avec une plage braille, la forme courte est meilleure.",
    textgroesse: "Taille du texte",
    prozent: (n) => `${n} pour cent`,
    groesseA: "Agrandit la question et le champ de réponse ; le reste du programme ne change pas. ",
    groesseB: " plus grand, ",
    groesseC: " plus petit, ",
    groesseD: " retour à la normale.",
    abstand: "Espacement des lettres",
    abstandErkl: "Plus d'espace entre les caractères s'ils se confondent (CVI). Valable sur cet appareil, dans Tastenflow aussi.",
    schriftWahlName: "Police de la question et du champ de réponse",
    schriftWahlHinweis: "Ne change que la question et ton champ de réponse - le programme reste comme il est. Valable sur cet appareil.",
    farbenA: "Couleurs et contraste : ",
    farbenB: " ou le bouton de couleurs dans l'en-tête.",
    klangA: "Tu règles la lecture à voix haute, la vitesse, le volume et les sons dans le menu du haut-parleur, dans l'en-tête.",
    klangB: " active ou désactive la lecture directement, ",
    klangC: " l'arrête tout de suite.",
    strg: "Ctrl",
    abstandNamen: ZEICHENABSTAND_LABELS_FR,
    region: "Pays ou région",
    regionErkl: "Ici, tu choisis ton pays. Cela change l'argent des problèmes, la façon de dire 70, 80 et 90, et la voix. Les cellules braille ne changent pas.",
    regionNamen: {
      es: "Espagne (euros)", latam: "Amérique latine (pesos)",
      fr: "France (euros, soixante-dix, quatre-vingts)",
      be: "Belgique (euros, septante, quatre-vingts, nonante)",
      "ch-huitante": "Suisse : Vaud, Valais, Fribourg (francs, septante, huitante, nonante)",
      "ch-quatre-vingts": "Suisse : Genève, Neuchâtel, Berne, Jura (francs, septante, quatre-vingts, nonante)",
      ca: "Québec (dollars, soixante-dix, quatre-vingts)",
    },
  },

  akustik: {
    kopf: "Son et lecture à voix haute",
    probe: "Voici comment sonne Plus.",
    vorlesenTitel: "Plus lit à voix haute",
    vorlesenErkl: (h) => `Plus dit les questions et les retours avec sa propre voix. ${h} Alt + V l'active, Ctrl l'arrête tout de suite.`,
    tempo: "Vitesse de parole",
    tempoErkl: "La vitesse de la voix de Plus. 100 % est normal, plus à droite va plus vite.",
    lautStimme: "Volume de la voix",
    lautStimmeErkl: "Le volume de la voix de Plus. 100 % correspond au volume réglé sur ton appareil - pas plus fort.",
    toene: "Sons",
    toeneErkl: "Un petit carillon quand tu as bien calculé. « Juste » est toujours écrit aussi.",
    lautToene: "Volume des sons",
    lautToeneErkl: "Le volume des carillons. À 0 %, c'est silencieux, même si les sons sont activés.",
  },

  hinweise: {
    funktionsname: "Plus ne connait pas encore les noms de fonctions comme log ou sin.",
    altesGeteilt: "Ce vieux signe de division n'est plus utilisé.",
    kommaOhneZahl: "Une virgule sans nombre devant.",
    bruchstrichZahlzeichen: "Après la barre de fraction, il manque le signe de nombre.",
    griechisch: "Plus ne connait pas les lettres grecques.",
    schliesstOhneOffen: "Ceci ferme quelque chose qui n'est pas ouvert.",
    unbekanntesZeichen: "Plus ne connait pas ce signe.",
    klammerOffen: "Une parenthèse est encore ouverte.",
    kommaInZahl: "Une virgule dans un nombre : Plus ne sait pas si c'est une virgule décimale ou un séparateur de milliers. Utilise la virgule décimale.",
    buchstabeNichtGebaut: "Les lettres et les unités ne font pas encore partie de ce braille mathématique.",
  },

  stoff: STOFF_FR,
};
