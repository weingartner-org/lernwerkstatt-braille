/** Bereich `runner` - Spanisch (es, Spanien). */
import type { runner as De } from "../de/runner";

export const runner: typeof De = {
  kopf: {
    anhoeren: "Escuchar",
    stopp: "Parar",
    anhoerenTitel: "Escuchar la tarea (Alt + W también la lee en voz alta)",
    instrument: "Instrumento",
    namenKnopf: "do-re-mi",
    namenTitel: (a: string, b: string): string => `Nombres de las notas como ${a} (do fijo) en lugar de ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Palabras de ritmo: di también ta, ti-ti después de las duraciones",
    anderesLied: "Otra canción",
    namenAn: (a: string, b: string, c: string): string => `Nombres de las notas: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Palabras de ritmo activadas: ta, ti-ti.",
    rhythmusAus: "Palabras de ritmo desactivadas.",
    zurueckLiedauswahl: "Volver a la elección de canción.",
  },

  aufgabe: {
    liesBrailleZeile: "Lee la línea en braille.",
    handNurKlavier: "Cambiar de mano solo funciona en el capítulo de piano con dos pentagramas.",
    weiter: (prompt: string): string => `Sigue. ${prompt}`,
    zeichenlisteHinweis: "Encontrarás todos los signos musicales de este capítulo en la lista de signos: Alt y L.",
    songGanzGeschafft: (titel: string): string => `${titel}: ¡todo hecho!`,
    songZeile: (zeile: number, von: number): string => ` · Línea ${zeile} de ${von}`,
  },

  geschafft: {
    geschafft: "¡Hecho!",
    mitSternen: (n: number): string => `¡Hecho! ${n} de 3 estrellas.`,
    alsNaechstesAnsage: (titel: string): string => ` Siguiente: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `Siguiente: ${titel}`,
    weiterUeben: "Seguir practicando",
    weiter: "Siguiente",
  },
  fortschritt: {
    caption: "Práctica",
    aria: (n: number, min: number, prozent: number): string =>
      `Progreso del capítulo: ${n} de al menos ${min} tareas, ${prozent} por ciento completado.`,
    rundeGeschafft: "Ronda terminada: el capítulo está asegurado.",
    runde: (n: number, min: number, noch: number): string =>
      `Ronda: ${n} de al menos ${min} tareas hechas` +
      (noch > 0 ? `, faltan al menos ${noch}.` : ", el capítulo casi está asegurado."),
  },

  lieder: {
    kinder: "🧒 Canciones infantiles",
    erwachsene: "🎼 Clásica y grandes éxitos",
  },

  hand: {
    hinweis: (f: "both" | "rh" | "lh"): string =>
      ": ve y oye una mano por separado, en grande (" +
      (f === "rh"
        ? "ahora: solo la mano derecha"
        : f === "lh"
          ? "ahora: solo la mano izquierda"
          : "ahora: las dos manos") +
      ")",
  },

  wahl: {
    richtig: "¡Correcto!",
    richtigWaere: (antwort: string): string => `La respuesta correcta es: ${antwort}.`,
    antworten: "Respuestas (también puedes pulsar las teclas numéricas del 1 al 4)",
  },

  tap: {
    aria: (n: number): string => `Toca el ritmo: barra espaciadora. De momento ${n} toques.`,
    vor: "Toca aquí con la ",
    stark: "barra espaciadora",
    nach: (n: number, von: number): string => ` - ${n} de ${von} toques`,
    knopf: (n: number, von: number): string => `Tocar (${n} de ${von})`,
    puls: "Todavía no es del todo regular: siente el pulso y mantenlo tranquilo.",
    kurz: "corto",
    lang: "largo",
    fast: (muster: string): string => `¡Casi! El patrón era: ${muster}. Escucha una vez más.`,
    genauImPuls: "¡Justo en el pulso!",
    genauImTakt: "¡Justo en el compás!",
  },

  spielen: {
    ariaKlaviatur: (namen: string): string =>
      `Teclado para repetir la melodía: D F G H J K L son ${namen}. Las flechas arriba y abajo cambian la octava. `,
    ariaFrei: (n: number, von: number): string => `Toca libremente sobre el bordón: ${n} de ${von} notas. `,
    ariaMemory: (laenge: number): string => `Longitud actual: ${laenge} notas. `,
    ariaTon: (i: number, von: number): string => `Nota ${i} de ${von}. `,
    ariaLesen:
      "Concierto de lectura: lee la línea en braille. Pulsa Intro o «He terminado de leer» cuando la tengas en la cabeza.",
    lesenVor: "Lee la línea en braille: ",
    lesenStark: "no",
    lesenMitte: " sonará. Cuando la tengas en la cabeza, pulsa ",
    lesenNach: " o «He terminado de leer».",
    fertigGelesen: "He terminado de leer",
    nachLesen: "Ahora tócala de memoria: D F G H J K L, las flechas cambian la octava.",
    freiVor: "Toca libremente con ",
    freiNach: (n: number, von: number): string => ` (pentatónica) - ${n} de ${von} notas · sobre el bordón de quinta`,
    nachspielenVor: "Repítela con ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Longitud ${n}`,
    tonVon: (i: number, von: number): string => `Nota ${i} de ${von}`,
    oktaveNach: (oktave: string): string => ` Octava (${oktave})`,
    oktaveRauf: "Octava arriba",
    oktaveRunter: "Octava abajo",
    freiGeschafft: (n: number): string =>
      `Qué bien tocas: ¡${n} notas! Has visitado el taller. Pulsa «Seguir practicando» para seguir tocando.`,
    falscherTon: (gespielt: string, gesucht: string): string => `Eso era ${gespielt}; necesitamos ${gesucht}.`,
    nichtsMehr: "nada más",
    memoryWeiter: (n: number): string => `¡Hecho: ${n} notas! Viene una más.`,
    memoryEnde: (best: number): string =>
      `Se acabó: has conseguido ${best} ${best === 1 ? "nota" : "notas"} seguidas. Voy a tocar la secuencia otra vez.`,
    genauRichtig: "¡Exacto!",
    fertig: "Terminado.",
  },

  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Entrada braille: f d s y j k l son los puntos, la barra espaciadora es la barra de compás. Celda ${zelle} de ${von}. Mantén pulsada la tecla Mayús para ver y oír las teclas de la celda.`,
    nochmalAnhoeren: "Escuchar otra vez",
    diktat: "Escucha tantas veces como quieras: no cuenta como error. Después escribe lo que has oído, celda a celda.",
    vor: "Escribe con ",
    mitte: (zelle: number, von: number): string => ` - celda ${zelle} de ${von} · `,
    umschalt: "⇧ Mayús",
    nach: " muestra la celda",
    taktstrichTitel: "Barra de compás (barra espaciadora)",
    gedrueckt: (punkte: string): string => `Pulsado: puntos ${punkte}`,
    aktuelleStelleLeertaste: "Lugar actual: la barra espaciadora, la barra de compás.",
    genauRichtig: "¡Exacto!",
    fertig: "Terminado.",
  },

  takt: {
    aria: (n: number): string =>
      `Constructor de compases: escribe notas o silencios con f d s j k l; cada uno suena enseguida. Retroceso borra la última celda, Intro comprueba el compás. De momento ${n} celdas.`,
    vor: "Construye el compás con ",
    mitte: ": cada nota o silencio suena. ",
    loescht: " borra, ",
    pruefen: (a: number, b: number): string => ` comprueba. Compás de ${a}/${b}.`,
    nochLeer: "Todavía vacío: ¡adelante!",
    taktPruefen: "Comprobar compás (Intro)",
    loeschen: "Borrar (⌫)",
    pause: "Silencio",
    nominativ: (dativ: string): string => dativ,
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "Esa no es una celda de nota ni de silencio. Usa una nota (f d s j k l) o un silencio.",
    alsGelesen: (wert: string): string => ` - leída como ${wert} porque así todavía cabe`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Juntos ${summe} de ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Última celda borrada. Ahora: ${anzahl} ${einheit}.`,
    fehlen: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `Aún ${einzahl ? "falta" : "faltan"} ${anzahl} ${einheit} para llenar el compás.`,
    zuViel: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `${einzahl ? "Sobra" : "Sobran"} ${anzahl} ${einheit}. Quita algo.`,
    mindestensNoten: (n: number): string => `El compás está lleno, pero necesita al menos ${n} notas.`,
    mindestensPause: "El compás está lleno, pero necesita al menos un silencio.",
    voll: "¡Compás lleno! Escúchalo.",
    vollSauber: "Justo lleno: ¡un compás limpio! Escúchalo.",
  },

  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Taller de composición: escribe libremente con f d s j k l, la barra espaciadora es la barra de compás. Usa los botones para escuchar, borrar y guardar. De momento ${zellen} celdas y ${werke} de 5 piezas guardadas.`,
    vor: "Escribe libremente con ",
    mitte: " - barra espaciadora = barra de compás, ",
    nach: " borra la última celda.",
    leeresBlatt: "Hoja vacía: empieza a componer.",
    anhoeren: "Escuchar",
    loeschen: "Borrar",
    nameFuerWerk: "Nombre de tu pieza",
    speichern: "Guardar",
    nochNichtsGeschrieben: "Todavía no has escrito nada: escribe primero unas notas.",
    geleert: "Taller vaciado.",
    schonFuenf: "Ya has guardado cinco piezas. Borra una y volverá a funcionar.",
    nochNichtsSpeichern: "Todavía no hay nada que guardar.",
    meinWerk: (n: number): string => `Mi pieza ${n}`,
    gespeichert: (name: string, n: number): string => `«${name}» guardada. Ya tienes ${n} de 5 piezas.`,
    gespeicherteListe: (namen: string, n: number): string => `Guardadas: ${namen} (${n} de 5)`,
  },

  notenzeile: {
    handFokus: {
      rh: "Solo la mano derecha (arriba, clave de sol)",
      lh: "Solo la mano izquierda (abajo, clave de fa)",
      both: "Las dos manos",
    },
    rechteHand: "Mano derecha · clave de sol",
    linkeHand: "Mano izquierda · clave de fa",
  },

  touch: {
    gruppe: "Entrada táctil",
    anleitungVor: "Toca los puntos de la celda y después ",
    zelleSetzen: "Poner celda",
    anleitungNach: ".",
    punkteGruppe: "Los seis puntos de una celda",
    punkt: (p: number): string => `Punto ${p}`,
    taktstrich: "Barra de compás",
    pause: "Silencio",
    letzteLoeschen: "Borrar la última celda",
    taktPruefen: "Comprobar compás",
    bsiTitel: "Entrada braille en pantalla de VoiceOver",
    bsiHinweis:
      "Pon el rotor en entrada braille en pantalla y escribe las celdas en este campo. Deslizar un dedo hacia la derecha es la barra de compás; deslizarlo hacia la izquierda borra la última celda.",
    testen: "Probar la entrada braille: ¿qué llega?",
    nochNichts: "Todavía no se ha introducido nada.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `«${text}» (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "ninguna celda reconocida",
    nochKeinPunkt: "Todavía no has elegido ningún punto. Toca primero los puntos y después Poner celda.",
    unbekannt: (zeichen: string): string =>
      `No puedo leer el carácter ${zeichen} como puntos. Usa los botones de puntos.`,
  },
};
