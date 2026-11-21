/**
 * Punktgenau auf Französisch - die Oberfläche (Bauplan 2026-11-06 §4, Teil B5).
 *
 * ★ Das ist die VORLAGE für die nächsten Sprachen: dieselben Bereiche, dieselben Schlüssel.
 *   Eine Sprache legt `texte/<sprache>.ts` mit `export const es: PgTexte = { ... }` an (Typ aus
 *   `./index`); Funktionen bekommen dieselben Parameter wie hier.
 * ★ Anrede: Punktgenau ist für Kinder - „tu", wie Tastenflow auf Französisch
 *   (`typing/curriculumFr.ts`). Wo die Oberfläche auch Erwachsene anspricht („address" = "sie"),
 *   steht die Höflichkeitsform „vous".
 * ★ Schreibregeln: nur „-" (kein „—" in NEUEN Texten), echte Akzente, Person zuerst,
 *   keine Maus-Wörter („appuyer / choisir / activer", nie „cliquer").
 * ★ Wörter wie die Norm (CBFU 2008): „braille intégral", „cellule", „points 1-2-4", „étape".
 * ★ Nicht übersetzt (bleibt deutsch, im Französisch-Modus nicht erreichbar oder gesondert): Konto,
 *   Klassen, Lehrkraft, Statistik, Challenge, Klassenmatch, Abzeichen-Regal, Wochenaufgabe.
 *   Siehe BEFUND-2026-11-07-PUNKTGENAU-FR-NORM.md, Abschnitt „Oberfläche".
 */
const adresse = (a: "du" | "sie", du: string, sie: string): string => (a === "du" ? du : sie);

const plural = (n: number, eins: string, mehr: string): string => (n > 1 ? mehr : eins);

export const fr = {
  /** Kopfzeile der Seite (`PunktgenauPage`). */
  kopf: {
    zeichenliste: "Liste des caractères",
    zeichenlisteTipp: "Liste de tous les caractères de ce domaine (Alt + L)",
    logoBeschreibung:
      "Le logo de Punktgenau : une touche rouge pourpre aux coins arrondis. Dedans, un grand P blanc ; dans le trait vertical du P, trois points bleu foncé l'un sous l'autre, dans la courbe un quatrième - ensemble, les points braille de la lettre p.",
    klangUndVorlesen: "Son et lecture à voix haute",
    klangTipp: (alt: string) => `Régler le son et la lecture à voix haute (${alt} active ou désactive la lecture)`,
    titelHilfe: "Punktgenau - Aide",
    titelKurztasten: "Raccourcis clavier",
    vorlesenAn: "La lecture à voix haute est activée.",
    vorlesenAnKurz: "Lecture à voix haute activée.",
    vorlesenAus: "La lecture à voix haute est désactivée.",
    vorlesenAusKurz: "Lecture à voix haute désactivée.",
    macHinweis: "Alt + touche - sur Mac : touche Option (⌥) + touche.",
    screenreaderHinweis: (alt: string) =>
      `Tu as déjà un lecteur d'écran (NVDA, VoiceOver) ? Alors laisse la lecture à voix haute (${alt}) désactivée : le lecteur d'écran lit déjà toutes les annonces.`,
  },

  /** Kopfleiste in `Punktgenau.tsx`: Rang, Etappe, Richtung. */
  leiste: {
    rang: "Rang",
    rangAria: (stufe: number, rest: number) => `Rang ${stufe} - encore ${rest} XP avant le suivant.`,
    stufe: "Niveau",
    abzeichen: "Badges",
    heute: "Aujourd'hui",
    heuteGeuebt: (zeit: string) => `Exercé aujourd'hui : ${zeit}.`,
    richtung: "Sens de l'exercice",
    schreiben: "Écrire",
    lesen: "Lire",
    schrift: "Écriture :",
    schriftWahl: "Choisir le système braille (domaine)",
    etappeZurueck: "Étape précédente",
    etappeWeiter: "Étape suivante",
    etappeWahl: "Choisir un chapitre (étape) - parcourir avec les flèches haut et bas",
    gemeistert: " - réussie",
    gesperrt: " - encore verrouillée",
    etappeOption: (nr: number, titel: string, marke: string) => `Étape ${nr} : ${titel}${marke}`,
    tipp: {
      rang: "Rang - jusqu'où tu es arrivé en tout. Il grandit avec tes XP.",
      xp: "XP - 2 pour chaque exercice réussi, 30 pour une étape réussie.",
      sterne: "Étoiles - jusqu'à 3 pour chaque étape, selon la sûreté acquise.",
      stufe: "Niveau - la difficulté des exercices en ce moment. Il s'adapte à toi, tu ne le règles pas.",
      schreiben: "Écrire - tu reçois un mot et tu le tapes en braille.",
      lesen: "Lire - tu reçois du braille et tu tapes le mot en lettres ordinaires.",
      schrift: "Écriture - le système braille que tu travailles. Alt + 1 y mène directement.",
      etappenListe: "Étape - la partie que tu travailles. Parcours-les avec les flèches haut et bas.",
      etappeZurueck: "Une étape en arrière",
      etappeWeiter: "Une étape en avant",
      wochenaufgabe: "Tâche de la semaine - ce que ton enseignant t'a demandé cette semaine et où tu en es.",
      abzeichen: "Badges - tes médailles gagnées et tes prochains objectifs.",
      uebezeit: "Temps exercé aujourd'hui. Il compte l'écriture et la lecture de tes exercices, pas l'attente entre deux.",
    },
    bereichAnsage: (label: string, nr: number, von: number, titel?: string) =>
      `${label}, étape ${nr} sur ${von}${titel ? ` : ${titel}` : ""}.`,
    neuesAbzeichen: (name: string, beschreibung: string) => `Nouveau badge : ${name}. ${beschreibung}`,
    geschafft: (letzte: boolean) => `Punktgenau ! +30 XP${letzte ? " · domaine terminé !" : " · étape suivante ouverte"}`,
    zeichenlisteAnsage: (auf: boolean): string => (auf ? "Liste des caractères ouverte." : "Liste des caractères fermée."),
    einstellungenAnsage: (auf: boolean): string => (auf ? "Réglages ouverts." : "Réglages fermés."),
    abzeichenAnsage: (auf: boolean): string => (auf ? "Badges ouverts." : "Badges fermés."),
    kapitelAuswahlAnsage: "Choix du chapitre. Avec les flèches haut et bas, tu parcours les étapes.",
    schreibenAnsage: "Écrire.",
    lesenAnsage: "Lire.",
    grossAnsage: (an: boolean): string => (an ? "Indicateur de majuscule activé." : "Indicateur de majuscule désactivé."),
  },

  /** Übungsfläche (`BrailleTrainer.tsx`). */
  trainer: {
    rundeWort: "Série",
    pause: "Pause - Alt+P pour continuer",
    eingabefeld: "Champ de saisie braille",
    tasten: "Touches :",
    tastenRegel: "appuie sur toutes en même temps, puis relâche. Quand la cellule est juste, la suite vient toute seule.",
    altW: "Alt et W",
    leertaste: "Espace",
    leertasteBedeutung: "espace entre deux mots",
    loeschen: "effacer la dernière cellule",
    meineTasten: "Mes touches : les nouveaux caractères de cette étape",
    meineTastenKurz: "Mes touches :",
    schreibPrompt: (a: "du" | "sie") => adresse(a, "Écris en braille :", "Écrivez en braille :"),
    schreibHilfe:
      "Appuie en même temps sur les touches f d s et j k l, puis relâche : cela donne une cellule. Quand la cellule est juste, la suite vient toute seule. Espace pour séparer les mots, retour arrière pour effacer. Maintiens Maj enfoncée pour entendre la cellule suivante.",
    aktuelleStelleLeer: "Position actuelle : espace - la séparation entre deux mots.",
    aktuelleStelleAria: "position actuelle : appuyer sur la barre d'espace",
    richtigesZeichenLabel: (punkte: string) => `bon caractère : ${punkte} - à retaper`,
    aktuelleZelle: "cellule actuelle",
    aktuelleZelleKopf: (nr: number, von: number) => `Cellule actuelle (${nr} sur ${von}) :`,
    lueckeKlammer: "(espace)",
    richtigesZeichen: "C'est le bon caractère - tape-le à ton tour.",
    geschafftWeiter: "Réussi ! Suite …",
    weiter: "Suite …",
    lesenAufgabe: "Lis et tape le mot.",
    frage: (a: "du" | "sie") =>
      adresse(a, "Qu'est-ce qui est écrit ? Tape-le en lettres ordinaires :", "Qu'est-ce qui est écrit ? Tapez-le en lettres ordinaires :"),
    liesPrompt: (a: "du" | "sie") => adresse(a, "Lis le braille :", "Lisez le braille :"),
    vorlageAria: "Modèle braille, cellule par cellule",
    vorlageHinweis: (altW: string) =>
      `Le modèle braille est juste au-dessus du champ de saisie - lis-le cellule par cellule. ${altW} le répète.`,
    richtigGelesenAria: (frage: string) => `Bien lu. ${frage}`,
    loesung: (a: "du" | "sie") => adresse(a, "Ta solution …", "Votre solution …"),
    pruefen: "Vérifier",
    richtigGelesen: "Bien lu ! Suite …",
    richtigWaere: "La bonne réponse :",
    richtigWaereAria: (prompt: string) => `La bonne réponse : ${prompt}. Encore`,
    nochmal: "Encore",
    runde: (gemeistert: boolean, geschafft: number, gesamt: number, rest: number) =>
      gemeistert
        ? "Série terminée - l'étape est acquise."
        : `Série : ${geschafft} exercices réussis sur au moins ${gesamt}` +
          (rest > 0 ? `, encore au moins ${rest}.` : ", l'étape sera bientôt acquise."),
    stufeAria: (n: number, max: number, prozent: number) =>
      `Niveau ${n} sur ${max} - s'adapte à ta sûreté. Étape maitrisée à ${prozent} pour cent.`,
    geschafft: "Réussi - c'est acquis !",
    sterne: (n: number) => `${n} ${plural(n, "étoile", "étoiles")} sur 3`,
    zuverlaessig: (titel: string) => `${titel} : reconnu à coup sûr.`,
    naechsteFrei: "L'étape suivante est maintenant ouverte.",
    weiterUeben: "Tu peux continuer à t'entrainer.",
    geschafftAria1: "Réussi, c'est acquis. Continuer à s'entrainer",
    weiterUebenKnopf: "Continuer à s'entrainer",
    geschafftAria2: "Réussi, c'est acquis. Étape suivante",
    naechstesLevel: "Étape suivante →",
    neueZeichen: "Nouveaux caractères de cette étape",
    doppelpunkt: " :",
    // Texte (ganze Texte)
    textKopf: "Texte",
    textWort: (nr: number, von: number) => `Mot ${nr} sur ${von}`,
    textNr: (nr: number, von: number) => `Texte ${nr} sur ${von}`,
    geschriebeneZellen: "Cellules écrites, cellule par cellule",
    textHilfe:
      "Appuie en même temps sur les touches de points, puis relâche ; entre deux mots, la barre d'espace. Avec le retour arrière, tu peux corriger - une faute est tout de même comptée.",
    textSchreiben: "Écrire le texte en braille",
    hierTippen: "Tape ici … Appuie en même temps sur les touches de points, puis relâche.",
    textGeschafft: "Texte réussi !",
    textErgebnis: (fehler: number, zeit: string, zeichen: number) =>
      `${fehler === 0 ? "Sans faute" : `${fehler} ${plural(fehler, "faute", "fautes")}`} · temps ${zeit} · ${zeichen} caractères`,
    textErgebnisSatz: (fehler: number) =>
      `Texte réussi. ${fehler === 0 ? "Sans faute" : `${fehler} ${plural(fehler, "faute", "fautes")}`}.`,
    gleichenText: "Refaire le même texte",
    naechsterTextOhnePfeil: "Texte suivant",
    naechsterText: "Texte suivant →",
    textLesenAufgabe: "Lis le texte et tape-le.",
    allesRichtigSatz: "Tout est bien lu.",
    wortSatz: (richtig: number, von: number) => `${richtig} mots justes sur ${von}.`,
    wortSatzKurz: (richtig: number, von: number) => `${richtig} mots justes sur ${von}`,
    textLiesPrompt: (a: "du" | "sie") =>
      adresse(a, "Lis tout le texte et tape-le en lettres ordinaires :", "Lisez tout le texte et tapez-le en lettres ordinaires :"),
    textLoesung: (a: "du" | "sie") => adresse(a, "Ta solution (texte entier) :", "Votre solution (texte entier) :"),
    textPlatzhalter: "Tape ici le texte lu …",
    allesRichtig: "Tout est bien lu !",
  },

  /** Ansagen (`announce.ts`). */
  announce: {
    lesenAufgabe: "Lis et tape le mot.",
    und: "et",
    richtig: "Juste.",
    leertaste: "Barre d'espace.",
    /** Zusatz hinter den Punkten der Soll-Zelle (Fehler-Tipp). */
    unterschied: (fehlt: number[], zuViel: number[]): string => {
      const pos: Record<number, string> = {
        1: "en haut à gauche", 2: "au milieu à gauche", 3: "en bas à gauche",
        4: "en haut à droite", 5: "au milieu à droite", 6: "en bas à droite",
        7: "tout en bas à gauche", 8: "tout en bas à droite",
      };
      if (fehlt.length === 1 && zuViel.length === 0) return `. Il manque le point ${fehlt[0]} - ${pos[fehlt[0]]}.`;
      if (zuViel.length === 1 && fehlt.length === 0) return `. Le point ${zuViel[0]} - ${pos[zuViel[0]]} - est en trop.`;
      const teile: string[] = [];
      if (fehlt.length) teile.push(fehlt.length === 1 ? `il manque le point ${fehlt[0]}` : `il manque les points ${fehlt.join(", ")}`);
      if (zuViel.length) teile.push(zuViel.length === 1 ? `le point ${zuViel[0]} est en trop` : `les points ${zuViel.join(", ")} sont en trop`);
      if (!teile.length) return "";
      const satz = teile.join(" et ");
      return `. ${satz.charAt(0).toUpperCase()}${satz.slice(1)}.`;
    },
    stern: (n: number) => `Une étoile de plus - ${n} sur 3.`,
    schneller: "Tu deviens plus rapide.",
    freischaltung: (titel: string) => `Bravo ! Une nouvelle porte s'ouvre : ${titel}.`,
    levelDone: (sterne: number, naechster?: string) =>
      `Réussi ! ${sterne} ${plural(sterne, "étoile", "étoiles")} sur 3.` + (naechster ? ` Ensuite : ${naechster}.` : ""),
    textDone: (fehler: number) => (fehler === 0 ? "Texte réussi. Sans faute." : `Texte réussi. ${fehler} ${plural(fehler, "faute", "fautes")}.`),
    cellHint: (tasten: string, punkte: string) => `Cellule actuelle : ${tasten}. ${punkte}.`,
    pause: "Pause. Appuie sur Alt et P pour continuer.",
    keineNeuenZeichen: "Il n'y a pas de nouveaux caractères ici.",
  },

  /** Hilfe-Fenster (kurz; die deutsche Hilfe erklärt das deutsche System). */
  hilfe: {
    tastaturTitel: "Le clavier comme machine à écrire le braille",
    tastaturText:
      "Six touches correspondent aux six points d'une cellule braille. En appuyant sur plusieurs touches en même temps, tu obtiens un caractère :",
    punkteLinks: "points 1, 2, 3 (à gauche)",
    punkteRechts: "points 4, 5, 6 (à droite)",
    leertasteAlsLuecke: "espace",
    zeichenErklaerung: [
      { zeichen: "␣", bedeutung: "ici, il y a un espace - tu appuies sur la barre d'espace." },
      { zeichen: "·", bedeutung: "sépare deux touches ou deux indications qui vont ensemble." },
      { zeichen: "⌫", bedeutung: "le retour arrière - il efface la dernière cellule." },
      { zeichen: "→", bedeutung: "puis, ou : voilà ce que cela donne." },
    ] as Array<{ zeichen: string; bedeutung: string }>,
    zeichenTitel: "Ces signes apparaissent dans le texte",
    warumTitel: "Pourquoi une plage braille ?",
    warumText:
      "Le braille est une écriture tactile : on la lit du bout des doigts, pas avec les yeux. À l'écran, tu vois les points ; cela aide à écrire et à reconnaitre les formes. Mais on n'apprend vraiment à lire le braille que lorsqu'on sent les points. Une plage braille fait monter de petites tiges sous chaque cellule, et le caractère affiché devient palpable. Punktgenau peut piloter une plage branchée là où le navigateur le permet.",
    bereicheTitel: "Domaine et étapes",
    bereicheText:
      "En haut, le domaine est « Braille intégral » : chaque lettre s'écrit dans sa propre cellule, sans aucune abréviation. Les étapes se suivent : chacune apporte de nouveaux caractères et n'ouvre la suivante que lorsqu'elle est bien acquise.",
    reihenfolgeTitel: "Pourquoi cet ordre des lettres ?",
    reihenfolgeText:
      "Les lettres viennent dans l'ordre de leur fréquence en français (corpus WikipédiaFR 2008, CLLE-ERSS) : e, a, i, s, n, r, t, o, l, u … Ainsi, de vrais mots apparaissent très vite. Les majuscules, les accents, la ponctuation et les chiffres suivent. Les mots d'exercice viennent des textes de Tastenflow en français.",
    normTitel: "Quelle norme ?",
    normText:
      "Les caractères suivent le Code braille français uniformisé (CBFU, 2e édition, septembre 2008), braille intégral. Les chiffres s'écrivent en notation Antoine : d'abord le point 6, puis le chiffre. Il n'y a pas d'abréviations dans cette version.",
    kontoTitel: "Compte et progression",
    kontoText: "Sans inscription, ta progression reste enregistrée sur cet appareil.",
    tastenkombinationen: "Raccourcis clavier",
  },

  /** Tastenkürzel (`ShortcutList`). */
  kurztasten: [
    ["Esc", "Ferme tout ce qui est ouvert - aide, raccourcis, liste des caractères - et le curseur revient toujours dans le champ d'exercice. Même si rien n'est ouvert, Esc te ramène à l'exercice"],
    ["Alt + 1", "Domaine « Braille intégral »"],
    ["Alt + E", "Curseur dans le champ de l'exercice (même cible que Esc, sans rien fermer)"],
    ["Alt + U", "Aller au choix du chapitre - puis parcourir avec ↑ ↓"],
    ["Alt + W", "Redire l'exercice"],
    ["Maj, deux fois de suite", "Redire l'exercice, comme Alt + W"],
    ["Alt + M", "Aller à « Mes touches » (nouveaux caractères de cette étape)"],
    ["Alt + Z", "Annoncer la série : combien d'exercices tu as réussis et combien il en reste - Esc revient dans le champ de saisie"],
    ["Alt + L", "Liste des caractères : ouvrir / fermer tous les caractères du domaine"],
    ["Alt + O", "Réglages : ouvrir / fermer"],
    ["Alt + P", "Pause activée / désactivée - dans le Klassenmatch : annoncer toutes les places"],
    ["Alt + V", "Lecture à voix haute activée / désactivée"],
    ["Alt + K", "Couleurs et contraste : ouvrir / fermer"],
    ["Alt + J", "Mon compte : ouvrir / fermer"],
    ["Alt + H", "Aide : ouvrir / fermer"],
    ["Alt + T", "Liste des raccourcis : ouvrir / fermer"],
    ["Alt + +", "Zone d'exercice plus grande"],
    ["Alt + −", "Zone d'exercice plus petite"],
    ["Alt + 0", "Taille normale (retour à 100 %)"],
    ["⇧ Maj", "Maintenue : montre et dit les touches de la cellule actuelle"],
  ] as Array<[string, string]>,

  /** Zeichenliste (`BrailleZeichenliste.tsx`). */
  zeichenliste: {
    leereZelle: "cellule vide",
    ansage: (bereich: string, nr?: number, titel?: string) =>
      `Liste des caractères ${bereich} ouverte.` + (titel ? ` Tu es à l'étape ${nr} : ${titel}.` : ""),
    titel: (bereich: string) => `Tous les caractères - ${bereich}`,
    einfuehrung:
      "La liste suit exactement ton parcours : étape après étape, dans l'ordre où les caractères arrivent. Tu es à l'étape que tu travailles en ce moment.",
    suchen: "Chercher un caractère :",
    platzhalter: "p. ex. é, ç, ou des points comme 1, 4",
    keineTreffer: "Aucun résultat.",
    einTreffer: "1 résultat.",
    treffer: (n: number) => `${n} résultats.`,
    etappe: (nr: number, titel: string, aktuell: boolean, fertig: boolean) =>
      `Étape ${nr} : ${titel}${aktuell ? " - tu travailles ici" : fertig ? " - réussie" : ""}`,
    laedt: "Chargement des points …",
    keineEigenen: "Ce domaine n'introduit pas de caractères propres.",
  },

  /** Einstellungen (`PunktgenauEinstellungen.tsx`). */
  einstellungen: {
    titel: "Réglages - Punktgenau",
    zurueck: "Retour à l'exercice",
    grossTitel: "Indicateur de majuscule",
    grossHinweis:
      "Avant chaque majuscule, il y a une cellule d'annonce (points 4-6). Tu peux la désactiver, puis la réactiver plus tard.",
    grossAn: "Indicateur de majuscule activé",
    grossAus: "Indicateur de majuscule désactivé",
    klasse: (an: boolean) =>
      `Ton enseignant règle cela pour la classe. L'indicateur de majuscule est actuellement ${an ? "activé" : "désactivé"}.`,
    klangTitel: "Son et lecture à voix haute",
    klangText: (alt: string) =>
      `La lecture à voix haute, la vitesse, la voix, l'aide en cas d'erreur, les sons et le volume se règlent dans le menu sous le haut-parleur, dans l'en-tête. ${alt} active ou désactive directement la lecture à voix haute.`,
  },

  /** Meine Verwechslungen (`PunktgenauPage`, `BrailleConfusionPanel.tsx`). Merktipps nur für die Buchstaben;
   *  die deutschen Kurzschrift-Tipps (un/und, ei/ie …) gibt es hier nicht. */
  verwechslungen: {
    knopfZeigen: "▼ Afficher mes confusions",
    knopfAusblenden: "▲ Masquer mes confusions",
    laedt: "Chargement des confusions …",
    leerLehrkraft: "Aucune confusion enregistrée pour l'instant.",
    leerKind: "Tu n'as encore confondu aucun caractère. Bravo !",
    listeName: "Mes confusions",
    zeile: (prozent: number, mit: string) => `${prozent} % d'erreurs, confondu avec ${mit}.`,
    tipp: "Astuce :",
    tabelleName: "Matrice des confusions",
    tabelleBeschreibung: "Matrice des confusions : caractère attendu, taux d'erreurs et confusions les plus fréquentes",
    spalteSoll: "Caractère attendu",
    spalteQuote: "Taux d'erreurs",
    spalteMit: "Confondu avec",
    spalteTipp: "Astuce",
    merktipps: {
      "d|f": "d et f ont tous les deux les points 1 et 4 - d a en plus le point 5 (à droite), f le point 2 (à gauche).",
      "e|i": "e est en haut (points 1·5), i est plus bas (points 2·4).",
      "r|w": "r, c'est les points 1·2·3·5, w les points 2·4·5·6 - w est l'original tout à la fin.",
      "m|u": "m est en haut (points 1·3·4), u est en bas (points 1·3·6).",
      "h|j": "h, c'est les points 1·2·5, j les points 2·4·5 - j glisse vers la droite.",
      "n|z": "n, c'est les points 1·3·4·5, z les points 1·3·5·6.",
    },
  },
};
