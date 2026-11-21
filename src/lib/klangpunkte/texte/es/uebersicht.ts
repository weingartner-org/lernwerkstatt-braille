/** Bereich `uebersicht` - Spanisch (es, Spanien). */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Ansagen und Meldungen ------------------------------------------------
  kapitelwahlAnsage: "Lista de capítulos. Todos los capítulos están abiertos para elegir; las estrellas muestran hasta dónde has llegado.",
  kapitelAnsage: (nr, welt, i, n, kapitel) => `Mundo sonoro ${nr}, ${welt} - capítulo ${i} de ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel) => `Capítulo: ${kapitel}.`,
  neuesAbzeichen: (name) => `Nueva insignia: ${name}.`,
  neueAbzeichen: (namen) => `Nuevas insignias: ${namen.join(", ")}.`,
  geschafftMitSternen: (sterne) => `¡Hecho! +30 XP · ${sterne} de 3 estrellas en este capítulo`,
  geschafft: "¡Hecho! +30 XP",
  zeichenlisteOffen: "Lista de signos abierta.",
  zeichenlisteZu: "Lista de signos cerrada.",
  weltInArbeit: (nr, name) => `El mundo sonoro ${nr}, ${name}, todavía está en construcción; llegará en una actualización posterior.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Musicografía braille: escuchar, sentir, escribir.",

  // --- Kopfleiste -----------------------------------------------------------
  rangCaption: "Rango",
  rangLabel: (level, rest) => `Rango ${level} - faltan ${rest} XP para el siguiente.`,
  xpHinweis: (xp) => `${xp} XP: 2 por cada respuesta correcta, 30 por cada capítulo.`,
  xpText: (xp) => `${xp} XP`,
  sterneHinweis: (n, max) => `${n} de ${max} estrellas: hasta 3 por capítulo.`,
  weltName: (nr, titel) => `Mundo sonoro ${nr}: ${titel}`,
  weltKopf: (nr, titel, i, n) => `Mundo sonoro ${nr}: ${titel} - capítulo ${i} de ${n}`,
  voriges: "Capítulo anterior",
  naechstes: "Capítulo siguiente",
  kapitelSelect: "Elige un capítulo: muévete entre ellos con las flechas arriba y abajo",
  kapitelOption: (i, titel, sterne) =>
    `Capítulo ${i}: ${titel}${sterne === null ? "" : ` - dominado, ${sterne} de 3 estrellas`}`,
  landkarte: (kapitel, welten) => `${kapitel} capítulos en ${welten} mundos sonoros: todos abiertos para elegir`,
  kapitelwahlKnopf: "Lista de capítulos",
  kapitelwahlTitel: "Todos los mundos sonoros y capítulos con tus estrellas (Alt + U)",
  zeichenlisteKnopf: "Lista de signos",
  zeichenlisteTitel: "Lista de todos los signos musicales, en el orden en que los aprendes (Alt + L)",

  // --- Kapitelwahl ----------------------------------------------------------
  kapitelwahlUeberschrift: "Lista de capítulos: elige lo que quieres practicar",
  mixTitel: "Mezcla del día",
  mixText: "Cinco minutos de tareas variadas de los capítulos que ya dominas, sin estrellas, solo para mantenerte en forma.",
  loslegen: "Empezar",
  mixZuWenig: (n) => `Domina primero unos cuantos capítulos (al menos 3) y entonces tendrás aquí tu mezcla del día. De momento: ${n}.`,
  weltStand: (fertig, n, sterne, max) => `${fertig} de ${n} capítulos dominados · ${sterne} de ${max} estrellas`,
  kapitelZeile: (i, titel) => `Capítulo ${i}: ${titel}`,
  werkeText: (n) => ` · ${n} de 5 piezas`,
  besucht: "✓ visitado",
  srBesucht: "- visitado.",
  srNichtBesucht: "- todavía no visitado.",
  srGemeistert: (sterne) => `- dominado, ${sterne} de 3 estrellas.`,
  srNichtGemeistert: "- todavía no dominado.",

  // --- Abzeichen-Galerie ----------------------------------------------------
  abzeichenTitel: "Insignias",
  abzeichenStand: (verdient, alle) =>
    `${verdient} de ${alle} insignias conseguidas: reúne estrellas, domina mundos, escribe dictados, construye compases y toca canciones de memoria.`,
  geheimAbzeichen: "Insignia secreta",
  geheimBeschreibung: "Todavía bloqueada: ¡descubre cómo abrirla!",
  srVerdient: "conseguida.",
  srGeheim: "secreta, todavía no conseguida.",
  srNichtVerdient: "todavía no conseguida.",

  // --- Tages-Mix ------------------------------------------------------------
  mixIntro:
    "Mezcla del día: una ronda corta y variada de práctica con los capítulos que ya dominas. Con calma: aquí nada cuenta y no hay estrellas.",
  mixStart: (n) => `Mezcla del día iniciada: cinco minutos de práctica con ${n} capítulos dominados.`,
  mixEnde: (vomKind, richtig, gesamt) =>
    `${vomKind ? "Ronda terminada." : "¡Se acabó el tiempo!"} Has acertado ${richtig} de ${gesamt} ${gesamt === 1 ? "tarea" : "tareas"}.`,
  mixGeschafft: "¡Mezcla del día hecha!",
  mixErgebnis: (richtig, gesamt) => `${richtig} de ${gesamt} ${gesamt === 1 ? "tarea correcta" : "tareas correctas"}`,
  mixProzent: (pct) => ` · ${pct} %`,
  mixFein: "Buena práctica: tu progreso se queda como estaba.",
  nochEineRunde: "Otra ronda",
  zurKapitelwahl: "Volver a la lista de capítulos",
  mixBunt: (n) => `Mezclado de ${n} capítulos dominados`,
  mixTimer: (min, sek) => `Quedan ${min} minutos y ${sek} segundos`,
  mixRichtigLabel: (richtig, gesamt) => `${richtig} de ${gesamt} correctas`,
  mixRichtig: "correctas",
  beenden: "Terminar",

  // --- Akustik-Menü ---------------------------------------------------------
  akustikMusik: "Música",
  akustikMusikErklaerung:
    "Los instrumentos tocan las notas de las tareas. Forman parte de la tarea, así que no hay interruptor para apagarlos, solo el volumen.",
  akustikInstrument: "Instrumento",
  akustikInstrumentErklaerung: "Qué instrumento toca las notas. Cuando lo cambias, toca un do para probarlo.",
  akustikLautstaerke: "Volumen de la música",
  akustikLautstaerkeErklaerung:
    "Lo fuerte que tocan los instrumentos. El 100 % es más o menos tan fuerte como la voz. La música solo se queda del todo en silencio con el 0 %.",

  // --- Klassen-Matrix (Lehrkräfte) ------------------------------------------
  matrixSterne: (n) => `${n} ${n === 1 ? "estrella" : "estrellas"}`,
  matrixLaedt: "cargando …",
  matrixKapitelImEinzelnen: "Capítulos en detalle",
  matrixAufklappLabel: (name, offen) => `Capítulos en detalle: ${name} ${offen ? "contraer" : "desplegar"}`,
  matrixAufklappTipp: (name) => `Capítulos de ${name}: cada capítulo con sus estrellas.`,
  matrixWeltSr: (nr, titel, fertig, n, sterne) =>
    `Mundo sonoro ${nr}, ${titel}: ${fertig} de ${n} capítulos dominados, ${sterne}.`,
  matrixGesamtSr: (fertig, n, sterne) => `Total: ${fertig} de ${n} capítulos dominados, ${sterne}.`,
  matrixRegion: (name) => `Capítulos en detalle: ${name}`,
  matrixGemeistert: (sterne) => `dominado, ${sterne}`,
  matrixNichtGemeistert: "todavía no dominado",
  matrixTabelle: "Progreso de la clase en Klangpunkte",
  matrixName: "Nombre",
  matrixWeltKurz: (nr) => `M${nr}`,
  matrixWeltTitel: (nr, titel) => `Mundo sonoro ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr, titel) => `: mundo sonoro ${nr}, ${titel}`,
  matrixGesamt: "Total",
  matrixZuletzt: "Último",
  matrixFuss:
    "Número de cada casilla = capítulos dominados en ese mundo sonoro. La flecha delante del nombre muestra cada capítulo con sus estrellas. Se ve exactamente lo que ve cada alumno sobre sí mismo, y nada más.",
};
