/** Bereich `aufgabenC` - Spanisch (es, Spanien): Welten 7, 8 y 9. */
import type { aufgabenC as De } from "../de/aufgabenC";

/** Primera letra en mayúscula (el nombre de una tonalidad al comienzo de una frase). */
const gross = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const aufgabenC: typeof De = {
  zellen: {
    oktavzeichenDer: (oktave: string): string => `el signo de octava de la ${oktave}`,
    oktavzeichen: "el signo de octava",
    vorzeichen: "la alteración",
    verlaengerungspunkt: "el punto que alarga la nota: punto 3",
    taktstrich: "barra de compás: la barra espaciadora",
  },

  // --- Mundo 7 "Parque de teoría" -------------------------------------------
  tonleitern: {
    spielNach:
      "Toca la escala de do mayor ascendente: do re mi fa sol la si do, con las teclas D F G H J K L; después sube una octava y vuelve a pulsar la D.",
    spielNachErkl: "Ocho grados desde un do hasta el do siguiente.",
    durMollFrage: "Escucha la escala: ¿mayor (clara) o menor (oscura)?",
    durMollWahl: ["Mayor", "Menor"],
    durMollErklMoll: "El tercer grado está rebajado: escala menor natural.",
    durMollErklDur: "Una escala mayor normal.",
    fehlerFrage: "En esta escala mayor SE HA DESVIADO una nota. ¿Qué grado era el equivocado?",
    fehlerWahl: ["Grado 3", "Grado 4", "Grado 5", "Grado 6", "Grado 7"],
    fehlerErkl: (stufe: number): string => `El grado ${stufe} sonaba demasiado agudo.`,
    schreibe:
      "Escribe la escala de sol mayor: sol la si do re mi y después fa sostenido, es decir, un sostenido delante del fa (el único sostenido de la tonalidad de sol mayor).",
    schreibeErkl: "Sol mayor tiene un sostenido: el fa se convierte en fa sostenido.",
  },

  quintenzirkel: {
    vz: {
      kreuz: { ein: "sostenido", mehr: "sostenidos" },
      be: { ein: "bemol", mehr: "bemoles" },
    },
    anzahlFrage: (name: string, mehr: string): string =>
      `Parada en el círculo de quintas: ${name}. ¿Cuántos ${mehr} tiene esta tonalidad?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${gross(name)} tiene ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort}: ¿qué tonalidad mayor es?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: es ${name}.`,
    lesenFrage: "Lee la armadura en braille: ¿qué tonalidad es?",
    lesenErkl: (name: string): string => `Esta armadura corresponde a ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Lee el ritmo en el pentagrama y márcalo con la barra espaciadora, directamente desde la página.",
    diktatFrage: (rhythm: boolean): string =>
      `Dictado rítmico: yo toco un compás sobre la nota sol. Escribe los valores que oyes${rhythm ? " (las sílabas rítmicas están activadas)" : ""}. La nota de partida es sol. Escucha tantas veces como quieras.`,
    diktatErkl: "Cuenta los pulsos de cada nota: negra = un pulso, blanca = dos.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Dictado melódico: la nota de partida es ${startton}. Escucha las ${anzahl} notas y escríbelas; se mueven por grados conjuntos. Escucha tantas veces como quieras.`,
    erkl: "Compara nota por nota con la nota de partida: ¿sube o baja?",
  },

  detektiv: {
    frage: "Lee la línea braille y escucha la grabación. ¿Dónde se diferencia el sonido de las notas?",
    note: (n: number): string => `Nota ${n}`,
    allesRichtig: "Todo correcto",
    erklRichtig: "Todo coincidía: el sonido y las notas eran iguales.",
    erklAnders: (n: number): string => `La nota ${n} sonaba distinta de lo escrito.`,
  },

  baumeister: {
    dreiViertel:
      "Construye un compás de 3/4 completo: escribe notas y silencios con f d s j k l hasta que los pulsos sumen exactamente 3. Intro lo comprueba.",
    mitPause: "Construye un compás de 4/4 con al menos UN silencio. Intro lo comprueba.",
    mitNoten: "Construye un compás de 4/4 con al menos TRES notas. Intro lo comprueba.",
    sechsAchtel: "Reto: construye un compás de 6/8 completo (seis pulsos de corchea). Intro lo comprueba.",
  },

  spielwiese: {
    frage:
      "Parque sonoro: sobre el bordón suave puedes tocar con libertad, con D F G J K (escala pentatónica). Ninguna nota puede estar mal. Cuenta una pequeña historia: primero suave y después fuerte. Tras 30 notas el taller cuenta como visitado.",
  },

  kadenzen: {
    schlussFrage: "Dos acordes como final: ¿suena terminado o sigue?",
    schlussWahl: ["Terminado: un final de verdad", "Abierto: sigue"],
    schlussErklOffen: "Quedarse en la dominante (V) se siente abierto: una semicadencia.",
    schlussErklZu: "De la dominante de vuelta al acorde de casa suena terminado (una cadencia perfecta).",
    artFrage: "¿Qué clase de final es este?",
    artWahl: [
      "Perfecta: de la dominante (V) al acorde de casa",
      "Plagal: el final del «Amén», desde la subdominante (IV)",
    ],
    artErklPlagal: "IV a I: el suave final del «Amén» (plagal).",
    artErklAuth: "V a I: el final fuerte y perfecto.",
    funktionFrage: "¿Qué función cumple este acorde en do mayor?",
    funktionWahl: ["Tónica (acorde I)", "Subdominante (acorde IV)", "Dominante (acorde V)"],
    funktionErkl: [
      "Tónica (T): el acorde de casa, acorde I.",
      "Subdominante (S): acorde IV.",
      "Dominante (D): acorde V.",
    ],
  },

  komponier: {
    frage:
      "Taller de composición: escribe libremente con f d s j k l, escucha tu pieza y guárdala (hasta 5). El taller cuenta como visitado en cuanto has guardado una pieza.",
  },

  // --- Mundo 8 "Instrumentos" -----------------------------------------------
  fingersatz: {
    lesenFrage: "Lee la nota y la digitación: ¿qué dedo debe tocar la nota? (La digitación va DESPUÉS de la nota.)",
    lesenErkl: (finger: string): string => `El número pequeño después de la nota indica: ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Escribe la nota ${ton} y añade la digitación para: ${finger}. Va DESPUÉS de la nota.`,
    fingerZelle: (finger: string): string => `${finger}: la digitación`,
    schreibenErkl: (finger: string): string => `Dedo: ${finger}. Su número va justo después de la nota.`,
    positionFrage: "¿Dónde va la digitación, antes o después de la nota?",
    positionWahl: ["Después de la nota", "Antes de la nota"],
    positionErkl: "A diferencia del signo de articulación, la digitación va DESPUÉS de la nota (antes de una ligadura, si la hay).",
  },

  klavier: {
    zweiFrage:
      "Dos líneas: arriba la mano derecha (clave de sol) y abajo la mano izquierda (clave de fa). ¿Cuántas notas toca la mano IZQUIERDA? Con Alt + Q puedes ver y oír una mano por separado, en grande.",
    zweiWahl: (n: number): string => `${n} notas`,
    zweiErkl: "Cuenta las cabezas de nota de la línea de abajo, o escucha la mano grave por separado (Alt + Q).",
    handFrage: "Esta línea empieza con un signo de mano. ¿Para qué mano es?",
    handWahl: ["Mano derecha", "Mano izquierda"],
    handErklLinks: "Puntos 4, 5, 6 y después 3, 4, 5: el signo de la mano izquierda.",
    handErklRechts: "Puntos 4, 6 y después 3, 4, 5: el signo de la mano derecha.",
    melodieFrage:
      "Dos manos una después de otra: una toca la melodía (más aguda, con movimiento) y la otra acompaña abajo. ¿Cuál era la melodía?",
    melodieWahl: ["La parte que sonó primero", "La segunda parte"],
    melodieErkl: "La melodía es la parte más aguda y con movimiento, normalmente la mano derecha.",
    rechteHandFrage: (ton: string): string =>
      `Escribe el signo de la mano derecha (puntos 4, 6 y después 3, 4, 5) y después la nota ${ton} con su signo de octava.`,
    rechteHandZellen: ["mano derecha, primera celda: puntos 4, 6", "mano derecha, segunda celda: puntos 3, 4, 5"],
    rechteHandErkl: "Después del signo de mano, la parte empieza con un signo de octava.",
    pedalFrage: "¿Qué signo de pedal es este y va antes o después de la nota?",
    pedalWahl: ["Pedal pisado: ANTES de la nota", "Pedal levantado: DESPUÉS de la nota"],
    pedalErklNieder: "El pedal pisado (puntos 1, 2, 6 y después 1, 4) va antes de la nota en la que se pisa el pedal.",
    pedalErklAuf: "El pedal levantado (puntos 1, 6 y después 1, 4) va después de la nota en la que se suelta el pedal.",
  },

  gesang: {
    melismaFrage: "En la sílaba «la»: ¿cuántas notas canta la voz? (Varias notas en una sílaba se llaman melisma.)",
    melismaWahl: ["Una nota", "Dos notas", "Tres notas"],
    melismaErkl: (n: number): string =>
      `La sílaba lleva ${n} notas: un melisma. En braille, la ligadura de sílaba (puntos 1, 4) las une.`,
    bogenFrage:
      "Una sílaba sobre dos notas: escribe la primera nota, la ligadura de sílaba (puntos 1, 4) y la segunda nota.",
    bogenZelle: "ligadura de sílaba: puntos 1, 4",
    bogenErkl: "La ligadura de sílaba dice: las dos notas pertenecen a una sola sílaba.",
    atemFrage: "Esta línea tiene un signo de respiración. ¿Después de qué nota respiras?",
    atemWahl: ["Después de la primera nota", "Después de la segunda nota", "Después de la tercera nota"],
    atemErkl: "El signo de media respiración (puntos 3, 4, 5 y después 2) va justo después de la primera nota.",
    zeilenFrage: "En la música vocal se alternan líneas de palabras y líneas de música. ¿Qué prefijo anuncia una línea de TEXTO?",
    zeilenWahl: ["Prefijo de texto (puntos 5, 6 y después 2, 3)", "Prefijo de música (punto 6 y después 3)"],
    zeilenErkl: "La línea de texto lleva el prefijo puntos 5, 6 y después 2, 3; la línea de música, el punto 6 y después el punto 3.",
  },

  gitarre: {
    saiteFrage:
      "El signo de cuerda (puntos 1, 4, 6) y un número te dicen qué cuerda tocar. ¿Qué cuerda es esta?",
    saiteWahl: (s: number): string => `Cuerda ${s}`,
    saiteErkl: (s: number): string => `Signo de cuerda más el número ${s}: cuerda ${s}.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Escribe el signo de la cuerda ${saite} y después la nota ${ton}: primero el signo de cuerda (puntos 1, 4, 6), después el número y después la nota.`,
    saitenzeichenZelle: "signo de cuerda: puntos 1, 4, 6",
    ziffernZelle: (saite: number): string => `el número ${saite}: cuerda ${saite}`,
    schreibenErkl: "El signo de cuerda va antes de la nota; NO le sigue ningún signo de octava.",
    akkordSorten: { dur: "acorde mayor", moll: "acorde menor", sept: "acorde de séptima de dominante (7 en cursiva)" },
    akkordFrage:
      "Escucha el acorde arpegiado: ¿de qué clase es? (El círculo, el triángulo y el 7 en cursiva son internacionales; los símbolos de letras como «C7» se escriben un poco distinto en cada país.)",
    akkordErkl: (sorte: string): string => `Era un ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "La nota del bajo lleva la cifra 6. ¿Qué realización suena bien: con una sexta o con una quinta sobre el bajo?",
    aussetzungWahl: ["Tercera y sexta sobre el bajo", "Tercera y quinta sobre el bajo"],
    aussetzungErklSext: "Un 6 pide la sexta sobre el bajo: el acorde en primera inversión.",
    aussetzungErklQuint: "Sin cifras (o con 5/3) suena el acorde en estado fundamental, con la quinta.",
    stufeFrage: "El bajo cifrado piensa en acordes construidos sobre los grados de la escala. ¿Qué acorde principal oyes aquí?",
    stufeWahl: ["Tónica (acorde I)", "Subdominante (acorde IV)", "Dominante (acorde V)"],
    stufeErkl: [
      "Era la tónica (acorde I): el puente de las cadencias al bajo cifrado.",
      "Era la subdominante (acorde IV): el puente de las cadencias al bajo cifrado.",
      "Era la dominante (acorde V): el puente de las cadencias al bajo cifrado.",
    ],
    schreibenFrage:
      "Escribe una nota de bajo con cifras: el do y debajo la cifra 6 (el signo de número y el dígito bajo 6).",
    zahlzeichenZelle: "signo de número: puntos 3, 4, 5, 6",
    ziffer6Zelle: "el dígito bajo 6: puntos 2, 3, 5",
    schreibenErkl: "Los números del bajo cifrado se escriben como dígitos BAJOS después del signo de número.",
  },

  partitur: {
    auftakt: {
      frage: "Una pieza empieza con una anacrusa. ¿Qué número tiene este primer compás incompleto?",
      wahl: ["Compás 0", "Compás 1", "Compás 2"],
      erkl: "La anacrusa cuenta como compás 0; el primer compás completo es entonces el compás 1.",
    },
    taktzahl: {
      frage: "Así se ve un número de compás en el margen de la línea (aquí: 16). ¿Lleva delante signo de número?",
      wahl: ["No: los números de compás no llevan signo de número", "Sí: siempre con signo de número"],
      erkl: "Los números de compás del margen no llevan signo de número, solo las cifras.",
    },
    format: {
      frage: "¿Cómo dispone una partitura braille completa dos manos o dos partes para poder compararlas compás a compás?",
      wahl: ["Sección por sección, línea sobre línea (compás sobre compás)", "Todo en una sola línea larga"],
      erkl: "En el formato compás sobre compás, las partes se colocan una encima de otra sección por sección: compás junto a compás, fácil de leer.",
    },
    quellen: {
      frage: "¿Dónde se consigue música braille ya hecha para leer?",
      wahl: ["En bibliotecas para personas ciegas, como las de la ONCE, dzb lesen o la SBS", "Solo copiándola uno mismo"],
      erkl: "Bibliotecas como dzb lesen (Leipzig) y la SBS (Zúrich) tienen miles de títulos en musicografía braille.",
    },
  },

  orchester: {
    familieKlavier: "instrumento de cuerda (percutida)",
    familieGitarre: "instrumento de cuerda (pulsada)",
    familieBlas: "instrumento de viento (soplado)",
    hoerenFrage: "Escucha la melodía corta: ¿a qué familia de instrumentos pertenece este sonido?",
    hoerenWahl: ["Instrumentos de cuerda: pulsada o percutida", "Instrumentos de viento: soplados", "Instrumentos de membrana: golpeados"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    fragen: [
      { frage: "¿A qué familia pertenece el tambor (en el sistema Hornbostel-Sachs)?", richtig: "Instrumentos de membrana", falsch: ["Instrumentos de cuerda", "Instrumentos de viento"] },
      { frage: "¿A qué familia pertenece el violín?", richtig: "Instrumentos de cuerda", falsch: ["Instrumentos de viento", "Instrumentos de membrana"] },
      { frage: "¿A qué familia pertenece la flauta dulce?", richtig: "Instrumentos de viento", falsch: ["Instrumentos de membrana", "Instrumentos de sonido propio (idiófonos)"] },
      { frage: "¿A qué familia pertenece el triángulo?", richtig: "Instrumentos de sonido propio (idiófonos)", falsch: ["Instrumentos de membrana", "Instrumentos de cuerda"] },
    ],
    familieErkl: (richtig: string): string => `Correcto: ${richtig}.`,
  },

  // --- Mundo 9 "Escenario de canciones" --------------------------------------
  lieder2: {
    dazuWahl: [
      "Subió el volumen: un crescendo",
      "Las notas se hicieron cortas: staccato",
      "Las notas fluían suavemente unas hacia otras: legato",
    ],
    dazuDynamikFrage: (titel: string): string => `«${titel}»: primero sencilla y luego con expresión. ¿Qué se añadió?`,
    dazuDynamikErkl: "La segunda versión subió de volumen: un crescendo.",
    dazuStaccatoFrage: (titel: string): string => `«${titel}»: ¿qué se añadió a la versión sencilla?`,
    dazuStaccatoErkl: "Las notas se hicieron cortas y ligeras: staccato.",
    dazuLegatoFrage: (titel: string): string => `«${titel}»: ¿qué se añadió?`,
    dazuLegatoErkl: "Las notas se unieron con suavidad: legato, la ligadura de expresión.",
    articFrage: (titel: string): string => `«${titel}»: ¿tocada bien unida (legato) o corta (staccato)?`,
    articWahl: ["Bien unida: legato", "Corta: staccato"],
    articErklLegato: "Las notas fluían unas hacia otras: legato.",
    articErklStaccato: "Cada nota estaba cortada: staccato.",
  },

  lesekonzert: {
    frage:
      "Concierto de lectura: lee la línea braille (¡NO se reproduce!), apréndela de memoria y pulsa «He terminado de leer». Después toca las notas de memoria en el teclado.",
    erkl: "Leer, recordar, tocar: así se lee exactamente la musicografía braille ante un instrumento.",
  },

  liederquiz: {
    hoerenFrage: "Escucha el comienzo: ¿qué canción es?",
    hoerenErkl: (titel: string): string => `Era el comienzo de «${titel}».`,
    lesenFrage: "Lee la primera línea en braille, ¡sin sonido! ¿Qué canción reconoces?",
    lesenErkl: (titel: string): string => `Esta línea es el comienzo de «${titel}»: lectura silenciosa con tu oído interior.`,
  },

  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, línea ${zeile}: primero escucha y después escríbela nota por nota, ahora CON signos de octava.`,
  },
};
