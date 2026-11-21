/**
 * Punktgenau en español - la interfaz (Bauplan 2026-11-06 §4, Schritt 3, Spanisch).
 *
 * ★ Dieselben Bereiche und Schlüssel wie `fr.ts` (der Typ `PgTexte` kommt von dort).
 * ★ Anrede: Punktgenau ist für Kinder - „tú", wie Tastenflow auf Spanisch (`typing/curriculumEs.ts`).
 *   Wo die Oberfläche auch Erwachsene anspricht („address" = "sie"), steht „usted".
 * ★ Schreibregeln: nur „-" (kein „—"), echte Akzente, Person zuerst, keine Maus-Wörter
 *   („pulsa / elige / activa", nie „hacer clic").
 * ★ Wörter wie die Norm (CBE B 2, 2025): „signografía básica", „celda", „puntos 1-2-4", „etapa".
 * ★ Nicht übersetzt (bleibt deutsch, im Spanisch-Modus nicht erreichbar oder gesondert): Konto,
 *   Klassen, Lehrkraft, Statistik, Challenge, Klassenmatch, Abzeichen-Regal, Wochenaufgabe.
 */
import type { PgTexte } from "./index";

const adresse = (a: "du" | "sie", du: string, sie: string): string => (a === "du" ? du : sie);

const plural = (n: number, eins: string, mehr: string): string => (n > 1 ? mehr : eins);

export const es: PgTexte = {
  /** Kopfzeile der Seite (`PunktgenauPage`). */
  kopf: {
    zeichenliste: "Lista de caracteres",
    zeichenlisteTipp: "Lista de todos los caracteres de este ámbito (Alt + L)",
    logoBeschreibung:
      "El logotipo de Punktgenau: una ficha rojo púrpura de esquinas redondeadas. Dentro, una gran P blanca; en el trazo vertical de la P, tres puntos azul oscuro uno debajo de otro, en la curva un cuarto - juntos, los puntos braille de la letra p.",
    klangUndVorlesen: "Sonido y lectura en voz alta",
    klangTipp: (alt: string) => `Ajustar el sonido y la lectura en voz alta (${alt} activa o desactiva la lectura)`,
    titelHilfe: "Punktgenau - Ayuda",
    titelKurztasten: "Atajos de teclado",
    vorlesenAn: "La lectura en voz alta está activada.",
    vorlesenAnKurz: "Lectura en voz alta activada.",
    vorlesenAus: "La lectura en voz alta está desactivada.",
    vorlesenAusKurz: "Lectura en voz alta desactivada.",
    macHinweis: "Alt + tecla - en Mac: tecla Opción (⌥) + tecla.",
    screenreaderHinweis: (alt: string) =>
      `¿Ya tienes un lector de pantalla (NVDA, VoiceOver)? Entonces deja la lectura en voz alta (${alt}) desactivada: el lector de pantalla ya lee todos los avisos.`,
  },

  /** Kopfleiste in `Punktgenau.tsx`: Rang, Etappe, Richtung. */
  leiste: {
    rang: "Rango",
    rangAria: (stufe: number, rest: number) => `Rango ${stufe} - faltan ${rest} XP para el siguiente.`,
    stufe: "Nivel",
    abzeichen: "Insignias",
    heute: "Hoy",
    heuteGeuebt: (zeit: string) => `Practicado hoy: ${zeit}.`,
    richtung: "Sentido del ejercicio",
    schreiben: "Escribir",
    lesen: "Leer",
    schrift: "Escritura:",
    schriftWahl: "Elegir el sistema braille (ámbito)",
    etappeZurueck: "Etapa anterior",
    etappeWeiter: "Etapa siguiente",
    etappeWahl: "Elegir un capítulo (etapa) - recorrer con las flechas arriba y abajo",
    gemeistert: " - superada",
    gesperrt: " - todavía bloqueada",
    etappeOption: (nr: number, titel: string, marke: string) => `Etapa ${nr}: ${titel}${marke}`,
    tipp: {
      rang: "Rango - hasta dónde has llegado en total. Crece con tus XP.",
      xp: "XP - 2 por cada ejercicio acertado, 30 por cada etapa superada.",
      sterne: "Estrellas - hasta 3 por etapa, según la seguridad que hayas ganado.",
      stufe: "Nivel - la dificultad de los ejercicios ahora. Se adapta a ti, tú no lo ajustas.",
      schreiben: "Escribir - recibes una palabra y la escribes en braille.",
      lesen: "Leer - recibes braille y escribes la palabra con letras normales.",
      schrift: "Escritura - el sistema braille que estás practicando. Alt + 1 te lleva directamente.",
      etappenListe: "Etapa - la parte que estás practicando. Recórrelas con las flechas arriba y abajo.",
      etappeZurueck: "Una etapa hacia atrás",
      etappeWeiter: "Una etapa hacia delante",
      wochenaufgabe: "Tarea de la semana - lo que tu profesor te ha pedido esta semana y cómo vas.",
      abzeichen: "Insignias - tus medallas ganadas y tus próximos objetivos.",
      uebezeit: "Tiempo practicado hoy. Cuenta la escritura y la lectura de tus ejercicios, no la espera entre uno y otro.",
    },
    bereichAnsage: (label: string, nr: number, von: number, titel?: string) =>
      `${label}, etapa ${nr} de ${von}${titel ? `: ${titel}` : ""}.`,
    neuesAbzeichen: (name: string, beschreibung: string) => `Nueva insignia: ${name}. ${beschreibung}`,
    geschafft: (letzte: boolean) => `¡Punktgenau! +30 XP${letzte ? " · ¡ámbito terminado!" : " · siguiente etapa abierta"}`,
    zeichenlisteAnsage: (auf: boolean) => (auf ? "Lista de caracteres abierta." : "Lista de caracteres cerrada."),
    einstellungenAnsage: (auf: boolean) => (auf ? "Ajustes abiertos." : "Ajustes cerrados."),
    abzeichenAnsage: (auf: boolean) => (auf ? "Insignias abiertas." : "Insignias cerradas."),
    kapitelAuswahlAnsage: "Elección del capítulo. Con las flechas arriba y abajo recorres las etapas.",
    schreibenAnsage: "Escribir.",
    lesenAnsage: "Leer.",
    grossAnsage: (an: boolean) => (an ? "Signo de mayúscula activado." : "Signo de mayúscula desactivado."),
  },

  /** Übungsfläche (`BrailleTrainer.tsx`). */
  trainer: {
    rundeWort: "Serie",
    pause: "Pausa - Alt+P para continuar",
    eingabefeld: "Campo de entrada braille",
    tasten: "Teclas:",
    tastenRegel: "pulsa todas a la vez y suelta. Cuando la celda es correcta, la siguiente viene sola.",
    altW: "Alt y W",
    leertaste: "Espacio",
    leertasteBedeutung: "espacio entre dos palabras",
    loeschen: "borrar la última celda",
    meineTasten: "Mis teclas: los caracteres nuevos de esta etapa",
    meineTastenKurz: "Mis teclas:",
    schreibPrompt: (a: "du" | "sie") => adresse(a, "Escribe en braille:", "Escriba en braille:"),
    schreibHilfe:
      "Pulsa a la vez las teclas f d s y j k l, y suelta: eso da una celda. Cuando la celda es correcta, la siguiente viene sola. Espacio para separar palabras, retroceso para borrar. Mantén pulsada Mayús para oír la celda siguiente.",
    aktuelleStelleLeer: "Posición actual: espacio - la separación entre dos palabras.",
    aktuelleStelleAria: "posición actual: pulsar la barra espaciadora",
    richtigesZeichenLabel: (punkte: string) => `carácter correcto: ${punkte} - para repetir`,
    aktuelleZelle: "celda actual",
    aktuelleZelleKopf: (nr: number, von: number) => `Celda actual (${nr} de ${von}):`,
    lueckeKlammer: "(espacio)",
    richtigesZeichen: "Es el carácter correcto - escríbelo tú también.",
    geschafftWeiter: "¡Conseguido! Sigue …",
    weiter: "Sigue …",
    lesenAufgabe: "Lee y escribe la palabra.",
    frage: (a: "du" | "sie") =>
      adresse(a, "¿Qué está escrito? Escríbelo con letras normales:", "¿Qué está escrito? Escríbalo con letras normales:"),
    liesPrompt: (a: "du" | "sie") => adresse(a, "Lee el braille:", "Lea el braille:"),
    vorlageAria: "Modelo braille, celda por celda",
    vorlageHinweis: (altW: string) =>
      `El modelo braille está justo encima del campo de entrada - léelo celda por celda. ${altW} lo repite.`,
    richtigGelesenAria: (frage: string) => `Bien leído. ${frage}`,
    loesung: (a: "du" | "sie") => adresse(a, "Tu solución …", "Su solución …"),
    pruefen: "Comprobar",
    richtigGelesen: "¡Bien leído! Sigue …",
    richtigWaere: "La respuesta correcta:",
    richtigWaereAria: (prompt: string) => `La respuesta correcta: ${prompt}. Otra vez`,
    nochmal: "Otra vez",
    runde: (gemeistert: boolean, geschafft: number, gesamt: number, rest: number) =>
      gemeistert
        ? "Serie terminada - la etapa está superada."
        : `Serie: ${geschafft} ejercicios acertados de al menos ${gesamt}` +
          (rest > 0 ? `, faltan al menos ${rest}.` : ", la etapa se superará enseguida."),
    stufeAria: (n: number, max: number, prozent: number) =>
      `Nivel ${n} de ${max} - se adapta a tu seguridad. Etapa dominada al ${prozent} por ciento.`,
    geschafft: "Conseguido - ¡ya lo dominas!",
    sterne: (n: number) => `${n} ${plural(n, "estrella", "estrellas")} de 3`,
    zuverlaessig: (titel: string) => `${titel}: reconocido con seguridad.`,
    naechsteFrei: "La etapa siguiente está ahora abierta.",
    weiterUeben: "Puedes seguir practicando.",
    geschafftAria1: "Conseguido, ya lo dominas. Seguir practicando",
    weiterUebenKnopf: "Seguir practicando",
    geschafftAria2: "Conseguido, ya lo dominas. Etapa siguiente",
    naechstesLevel: "Etapa siguiente →",
    neueZeichen: "Caracteres nuevos de esta etapa",
    doppelpunkt: ":",
    // Texte (ganze Texte)
    textKopf: "Texto",
    textWort: (nr: number, von: number) => `Palabra ${nr} de ${von}`,
    textNr: (nr: number, von: number) => `Texto ${nr} de ${von}`,
    geschriebeneZellen: "Celdas escritas, celda por celda",
    textHilfe:
      "Pulsa a la vez las teclas de los puntos y suelta; entre dos palabras, la barra espaciadora. Con el retroceso puedes corregir - un fallo cuenta igualmente.",
    textSchreiben: "Escribir el texto en braille",
    hierTippen: "Escribe aquí … Pulsa a la vez las teclas de los puntos y suelta.",
    textGeschafft: "¡Texto terminado!",
    textErgebnis: (fehler: number, zeit: string, zeichen: number) =>
      `${fehler === 0 ? "Sin fallos" : `${fehler} ${plural(fehler, "fallo", "fallos")}`} · tiempo ${zeit} · ${zeichen} caracteres`,
    textErgebnisSatz: (fehler: number) =>
      `Texto terminado. ${fehler === 0 ? "Sin fallos" : `${fehler} ${plural(fehler, "fallo", "fallos")}`}.`,
    gleichenText: "Repetir el mismo texto",
    naechsterTextOhnePfeil: "Texto siguiente",
    naechsterText: "Texto siguiente →",
    textLesenAufgabe: "Lee el texto y escríbelo.",
    allesRichtigSatz: "Todo bien leído.",
    wortSatz: (richtig: number, von: number) => `${richtig} palabras correctas de ${von}.`,
    wortSatzKurz: (richtig: number, von: number) => `${richtig} palabras correctas de ${von}`,
    textLiesPrompt: (a: "du" | "sie") =>
      adresse(a, "Lee todo el texto y escríbelo con letras normales:", "Lea todo el texto y escríbalo con letras normales:"),
    textLoesung: (a: "du" | "sie") => adresse(a, "Tu solución (texto entero):", "Su solución (texto entero):"),
    textPlatzhalter: "Escribe aquí el texto leído …",
    allesRichtig: "¡Todo bien leído!",
  },

  /** Ansagen (`announce.ts`). */
  announce: {
    lesenAufgabe: "Lee y escribe la palabra.",
    und: "y",
    richtig: "Correcto.",
    leertaste: "Barra espaciadora.",
    /** Zusatz hinter den Punkten der Soll-Zelle (Fehler-Tipp). */
    unterschied: (fehlt: number[], zuViel: number[]): string => {
      const pos: Record<number, string> = {
        1: "arriba a la izquierda", 2: "en el centro a la izquierda", 3: "abajo a la izquierda",
        4: "arriba a la derecha", 5: "en el centro a la derecha", 6: "abajo a la derecha",
        7: "muy abajo a la izquierda", 8: "muy abajo a la derecha",
      };
      if (fehlt.length === 1 && zuViel.length === 0) return `. Falta el punto ${fehlt[0]} - ${pos[fehlt[0]]}.`;
      if (zuViel.length === 1 && fehlt.length === 0) return `. Sobra el punto ${zuViel[0]} - ${pos[zuViel[0]]}.`;
      const teile: string[] = [];
      if (fehlt.length) teile.push(fehlt.length === 1 ? `falta el punto ${fehlt[0]}` : `faltan los puntos ${fehlt.join(", ")}`);
      if (zuViel.length) teile.push(zuViel.length === 1 ? `sobra el punto ${zuViel[0]}` : `sobran los puntos ${zuViel.join(", ")}`);
      if (!teile.length) return "";
      const satz = teile.join(" y ");
      return `. ${satz.charAt(0).toUpperCase()}${satz.slice(1)}.`;
    },
    stern: (n: number) => `Una estrella más - ${n} de 3.`,
    schneller: "Te estás haciendo más rápido.",
    freischaltung: (titel: string) => `¡Muy bien! Se abre una puerta nueva: ${titel}.`,
    levelDone: (sterne: number, naechster?: string) =>
      `¡Conseguido! ${sterne} ${plural(sterne, "estrella", "estrellas")} de 3.` + (naechster ? ` A continuación: ${naechster}.` : ""),
    textDone: (fehler: number) => (fehler === 0 ? "Texto terminado. Sin fallos." : `Texto terminado. ${fehler} ${plural(fehler, "fallo", "fallos")}.`),
    cellHint: (tasten: string, punkte: string) => `Celda actual: ${tasten}. ${punkte}.`,
    pause: "Pausa. Pulsa Alt y P para continuar.",
    keineNeuenZeichen: "Aquí no hay caracteres nuevos.",
  },

  /** Hilfe-Fenster (kurz; die deutsche Hilfe erklärt das deutsche System). */
  hilfe: {
    tastaturTitel: "El teclado como máquina de escribir braille",
    tastaturText:
      "Seis teclas corresponden a los seis puntos de una celda braille. Si pulsas varias teclas a la vez, obtienes un carácter:",
    punkteLinks: "puntos 1, 2, 3 (a la izquierda)",
    punkteRechts: "puntos 4, 5, 6 (a la derecha)",
    leertasteAlsLuecke: "espacio",
    zeichenErklaerung: [
      { zeichen: "␣", bedeutung: "aquí hay un espacio - pulsas la barra espaciadora." },
      { zeichen: "·", bedeutung: "separa dos teclas o dos indicaciones que van juntas." },
      { zeichen: "⌫", bedeutung: "el retroceso - borra la última celda." },
      { zeichen: "→", bedeutung: "después, o: esto es lo que resulta." },
    ] as Array<{ zeichen: string; bedeutung: string }>,
    zeichenTitel: "Estos signos aparecen en el texto",
    warumTitel: "¿Para qué sirve una línea braille?",
    warumText:
      "El braille es una escritura táctil: se lee con la yema de los dedos, no con los ojos. En la pantalla ves los puntos; eso ayuda a escribir y a reconocer las formas. Pero el braille solo se aprende a leer de verdad cuando se sienten los puntos. Una línea braille hace subir pequeñas varillas bajo cada celda y el carácter mostrado se vuelve palpable. Punktgenau puede manejar una línea conectada allí donde el navegador lo permite.",
    bereicheTitel: "Ámbito y etapas",
    bereicheText:
      "Arriba, el ámbito es «Signografía básica»: cada letra se escribe en su propia celda, sin ninguna abreviatura. Las etapas van una tras otra: cada una aporta caracteres nuevos y solo abre la siguiente cuando está bien dominada.",
    reihenfolgeTitel: "¿Por qué este orden de las letras?",
    reihenfolgeText:
      "Las letras llegan por orden de frecuencia en español (Pratt, 1939): e, a, o, s, r, n, i, d, l, c … Así aparecen palabras de verdad muy pronto. Las mayúsculas, la puntuación y los números vienen después; las vocales con tilde llegan al final de las letras. Las palabras de ejercicio proceden de los textos de Tastenflow en español.",
    normTitel: "¿Qué norma?",
    normText:
      "Los caracteres siguen el Documento técnico B 2: Signografía básica de las lenguas cooficiales españolas, de la Comisión Braille Española (CBE/ONCE), versión 4 (mayo de 2025). Los números se escriben con el signo de número (puntos 3-4-5-6) y las letras de la a a la j. En esta versión no hay abreviaturas.",
    kontoTitel: "Cuenta y progreso",
    kontoText: "Sin registrarte, tu progreso se guarda en este dispositivo.",
    tastenkombinationen: "Atajos de teclado",
  },

  /** Tastenkürzel (`ShortcutList`). */
  kurztasten: [
    ["Esc", "Cierra todo lo que esté abierto - ayuda, atajos, lista de caracteres - y el cursor vuelve siempre al campo del ejercicio. Aunque no haya nada abierto, Esc te lleva de vuelta al ejercicio"],
    ["Alt + 1", "Ámbito «Signografía básica»"],
    ["Alt + E", "Cursor en el campo del ejercicio (mismo destino que Esc, sin cerrar nada)"],
    ["Alt + U", "Ir a la elección del capítulo - luego recorrer con ↑ ↓"],
    ["Alt + W", "Repetir el ejercicio"],
    ["Mayús, dos veces seguidas", "Repetir el ejercicio, como Alt + W"],
    ["Alt + M", "Ir a «Mis teclas» (caracteres nuevos de esta etapa)"],
    ["Alt + Z", "Anunciar la serie: cuántos ejercicios has acertado y cuántos faltan - Esc vuelve al campo de entrada"],
    ["Alt + L", "Lista de caracteres: abrir / cerrar todos los caracteres del ámbito"],
    ["Alt + O", "Ajustes: abrir / cerrar"],
    ["Alt + P", "Pausa activada / desactivada - en el Klassenmatch: anunciar todos los puestos"],
    ["Alt + V", "Lectura en voz alta activada / desactivada"],
    ["Alt + K", "Colores y contraste: abrir / cerrar"],
    ["Alt + J", "Mi cuenta: abrir / cerrar"],
    ["Alt + H", "Ayuda: abrir / cerrar"],
    ["Alt + T", "Lista de atajos: abrir / cerrar"],
    ["Alt + +", "Zona de ejercicio más grande"],
    ["Alt + −", "Zona de ejercicio más pequeña"],
    ["Alt + 0", "Tamaño normal (vuelta al 100 %)"],
    ["⇧ Mayús", "Mantenida: muestra y dice las teclas de la celda actual"],
  ] as Array<[string, string]>,

  /** Zeichenliste (`BrailleZeichenliste.tsx`). */
  zeichenliste: {
    leereZelle: "celda vacía",
    ansage: (bereich: string, nr?: number, titel?: string) =>
      `Lista de caracteres ${bereich} abierta.` + (titel ? ` Estás en la etapa ${nr}: ${titel}.` : ""),
    titel: (bereich: string) => `Todos los caracteres - ${bereich}`,
    einfuehrung:
      "La lista sigue exactamente tu recorrido: etapa tras etapa, en el orden en que llegan los caracteres. Estás en la etapa que practicas ahora mismo.",
    suchen: "Buscar un carácter:",
    platzhalter: "p. ej. ñ, á, o puntos como 1, 4",
    keineTreffer: "Ningún resultado.",
    einTreffer: "1 resultado.",
    treffer: (n: number) => `${n} resultados.`,
    etappe: (nr: number, titel: string, aktuell: boolean, fertig: boolean) =>
      `Etapa ${nr}: ${titel}${aktuell ? " - estás aquí" : fertig ? " - superada" : ""}`,
    laedt: "Cargando los puntos …",
    keineEigenen: "Este ámbito no introduce caracteres propios.",
  },

  /** Einstellungen (`PunktgenauEinstellungen.tsx`). */
  einstellungen: {
    titel: "Ajustes - Punktgenau",
    zurueck: "Volver al ejercicio",
    grossTitel: "Signo de mayúscula",
    grossHinweis:
      "Antes de cada mayúscula hay una celda de aviso (puntos 4-6). Puedes desactivarla y volver a activarla más tarde.",
    grossAn: "Signo de mayúscula activado",
    grossAus: "Signo de mayúscula desactivado",
    klasse: (an: boolean) =>
      `Tu profesor lo ajusta para la clase. El signo de mayúscula está ahora ${an ? "activado" : "desactivado"}.`,
    klangTitel: "Sonido y lectura en voz alta",
    klangText: (alt: string) =>
      `La lectura en voz alta, la velocidad, la voz, la ayuda en caso de error, los sonidos y el volumen se ajustan en el menú bajo el altavoz, en la cabecera. ${alt} activa o desactiva directamente la lectura en voz alta.`,
  },

  /** Meine Verwechslungen (`PunktgenauPage`, `BrailleConfusionPanel.tsx`). Merktipps nur für die Buchstaben;
   *  die deutschen Kurzschrift-Tipps (un/und, ei/ie …) gibt es hier nicht. */
  verwechslungen: {
    knopfZeigen: "▼ Mostrar mis confusiones",
    knopfAusblenden: "▲ Ocultar mis confusiones",
    laedt: "Cargando las confusiones …",
    leerLehrkraft: "Todavía no hay confusiones registradas.",
    leerKind: "Todavía no has confundido ningún carácter. ¡Muy bien!",
    listeName: "Mis confusiones",
    zeile: (prozent: number, mit: string) => `${prozent} % de errores, confundido con ${mit}.`,
    tipp: "Consejo:",
    tabelleName: "Matriz de confusiones",
    tabelleBeschreibung: "Matriz de confusiones: carácter esperado, porcentaje de errores y confusiones más frecuentes",
    spalteSoll: "Carácter esperado",
    spalteQuote: "Porcentaje de errores",
    spalteMit: "Confundido con",
    spalteTipp: "Consejo",
    merktipps: {
      "d|f": "d y f tienen los dos los puntos 1 y 4 - d tiene además el punto 5 (a la derecha), f el punto 2 (a la izquierda).",
      "e|i": "e está arriba (puntos 1·5), i está más abajo (puntos 2·4).",
      "r|w": "r son los puntos 1·2·3·5, w los puntos 2·4·5·6 - w es la rara, al final del todo.",
      "m|u": "m está arriba (puntos 1·3·4), u está abajo (puntos 1·3·6).",
      "h|j": "h son los puntos 1·2·5, j los puntos 2·4·5 - j se desliza a la derecha.",
      "n|z": "n son los puntos 1·3·4·5, z los puntos 1·3·5·6.",
    },
  },
};
