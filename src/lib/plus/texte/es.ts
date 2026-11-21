/**
 * Plus en español (neutro: España y Latinoamérica). Gleiche Felder wie `de.ts`
 * (Typ `PlusTexte`).
 *
 * ★ Kinder werden geduzt („tú"), warm und kurz, so wie Tastenflow es sie
 *   anspricht. Nichts Österreichisches: keine „Schulstufe", keine Lehrplan-
 *   Namen - „Nivel" zählt Plus selbst.
 * ★ Die Mathematikschrift heißt hier „braille matemático (CMU, 6 puntos)" -
 *   Código Matemático Unificado para Iberoamérica (`braille/cmuEs.ts`).
 * ★ Dezimalzeichen ist das Komma; die Hinweise des Lesers sagen es so.
 * ★ Stoffplan: `stoffEs.ts` (Stufen und Übungen, nur was Spanisch heute anbietet).
 */
import { ZEICHENABSTAND_LABELS_ES } from "@/lib/typing/zeichenabstand";
import type { PlusTexte } from "./typ";
import { STOFF_ES } from "./stoffEs";

export const es: PlusTexte = {
  sprache: "es",
  stufe: (nr) => `Nivel ${nr}`,
  zurueck: "Atrás",
  logoBeschreibung:
    "El logotipo de Plus: una tecla turquesa con las esquinas redondeadas. Encima, dos bocadillos blancos. " +
    "En el pequeño, al fondo, la palabra plus escrita en braille. En el grande, delante, un signo más.",

  start: {
    hallo: (v) => `¡Hola, ${v}!`,
    willkommen: "¡Te damos la bienvenida a Plus!",
    wiederDa: "Qué bien verte otra vez.",
    neu: "Cálculo mental. Sin reloj, sin prisa.",
    fuerAlleKopf: "Actividad de clase",
    fuerAlleAnzahl: (n) => `${n} preguntas. Todos hacen las mismas.`,
    losGeht: "Vamos",
    trainingMarke: (stufe) => `Mi entrenamiento${stufe !== null ? ` · Nivel ${stufe}` : ""}`,
    trainingSucht: "Plus elige las preguntas.",
    etappe: (nr, name) => `Etapa ${nr}: ${name}`,
    allesGeschafft: "¡Todo hecho!",
    rundeInfo: "8 preguntas por ronda. Sin reloj.",
    weiterrechnen: "Seguir calculando",
    etappenGeschafft: (g, n) => `${g} de ${n} etapas hechas.`,
    wochenzielTitel: "Meta semanal",
    wochenstand: (g, z) => (g >= z ? `Meta semanal lograda: ${g} de ${z}.` : `Esta semana: ${g} de ${z} preguntas.`),
    oder: "¿O prefieres …?",
    wahlTitel: "Yo elijo",
    wahlSatz: "Elige una práctica.",
    spieleTitel: "Juegos",
    spieleSatz: "Matemáticas, pero distintas.",
    sammlungTitel: "Mi colección",
    sammlungLeer: "Insignias y meta semanal.",
    sammlungAnzahl: (n) => `${n} insignias.`,
    anmeldenSatz: "Inicia sesión. Así tu progreso está en cada dispositivo.",
    anmelden: "Iniciar sesión",
  },

  stufenwahl: {
    trainingTitel: "Mi entrenamiento - ¿qué nivel?",
    trainingHinweis: "Plus mezcla la ronda con lo que ya sabes, lo que viene y un poco de repaso.",
  },

  wahl: {
    stufenTitel: "¿Qué nivel?",
    paketTitel: (stufe) => `${stufe} - ¿qué práctica?`,
    offen: (n) => (n === 1 ? "Una práctica de este nivel aún no está lista." : `${n} prácticas de este nivel aún no están listas.`),
    feste: "Tu docente fija el nivel.",
    andere: "Otro nivel",
  },

  seite: {
    bereichTraining: "Mi entrenamiento",
    bereichWahl: "Yo elijo",
    bereichStart: "Inicio",
    bereichFuerAlle: "Actividad de clase",
    einstellungen: "Ajustes",
    einstellungenZurueck: "Volver a las matemáticas",
    stimmeFehlt: "En este dispositivo no hay voz en español.",
    vorlesenAn: "La lectura en voz alta está activada.",
    stimmeHinweis: "Tu lector de pantalla no lee los signos de cálculo. La voz de Plus sí.",
    fuerAlleGestartet: "Tu docente ha empezado una actividad de clase.",
    passwortTitel: "Cambiar contraseña",
    hilfeTitel: "Plus - Ayuda",
    macHinweis: "En un Mac, la tecla Alt se llama Opción (⌥).",
    hilfe: [
      "Mi entrenamiento te lleva por las matemáticas de tu nivel. Etapa por etapa, siempre hacia delante.",
      "También puedes usar: Yo elijo (elegir una práctica). Tus números están en el menú de la cuenta, arriba a la derecha.",
      "Una ronda tiene ocho preguntas. No hay reloj ni prisa.",
      "Puedes escribir la respuesta con números o en braille. Alt + B cambia entre números, braille de ordenador y braille matemático de seis puntos.",
      "La cuenta ya está en el cuadro. Escribes en el hueco o después del signo igual. Si la cuenta ha desaparecido: pulsa dos veces Mayús. Así se repite la pregunta y la cuenta vuelve al cuadro. Alt + W repite la pregunta. Alt + Z dice dónde estás. Alt + E te lleva al cuadro.",
      "Con \"Saltar pregunta\" pasas a la siguiente. Una pregunta saltada no cuenta ni como bien ni como mal.",
      "En la entrada braille, el cuadro muestra lo que has escrito. Debajo ves lo que Plus lee de ello.",
      "En las cuentas escritas puedes pedir ver el desarrollo: paso a paso, tantas veces como quieras.",
      "Alt + V hace que Plus lea todo en voz alta. Ctrl lo detiene al instante. El altavoz de la cabecera abre un menú para ajustar velocidad, volumen y sonidos.",
    ],
    kuerzel: [
      ["Alt + B", "Cambiar tu forma de escribir, desde cualquier sitio: números - braille de ordenador - braille matemático 6 puntos"],
      ["Mayús dos veces", "La pregunta otra vez - y la cuenta vuelve al cuadro"],
      ["Alt + W", "Repetir la pregunta"],
      ["Alt + Z", "Decir dónde estás (pregunta 3 de 8)"],
      ["Alt + E", "Ir al cuadro de respuesta"],
      ["Enter", "Comprobar la respuesta - y, si está bien, seguir"],
      ["Alt + P", "Comprobar - también en cuentas escritas, donde Enter hace una línea nueva"],
      ["Ctrl + Enter", "Comprobar - igual que Alt + P"],
      ["⌫", "En la entrada braille: borrar la última celda"],
      ["F D S  J K L", "Las seis teclas braille (como en una máquina Perkins)"],
      ["A  ;", "Punto 7 y punto 8 - solo en braille de ordenador"],
      ["Esc", "Cerrar una ventana - de vuelta al cuadro de respuesta"],
      ["Alt + G", "Ir al siguiente encabezado"],
      ["Ctrl", "Parar al instante: el mensaje hablado termina. La lectura sigue activada"],
      ["Alt + V", "Lectura en voz alta sí / no - velocidad, volumen y sonidos están en el menú del altavoz"],
      ["Alt + O", "Abrir / cerrar los ajustes"],
      ["Alt + H", "Abrir / cerrar la ayuda"],
      ["Alt + T", "Abrir / cerrar la lista de atajos de teclado"],
      ["Alt + J", "Abrir / cerrar mi cuenta"],
      ["Alt + K", "Abrir / cerrar colores y contraste"],
      ["Alt + +", "Más grande (texto y cuadro de respuesta)"],
      ["Alt + -", "Más pequeño"],
      ["Alt + 0", "Tamaño normal"],
      ["Alt + Mayús + P", "Avisar de un problema - con una imagen de la ventana"],
    ],
  },

  uebung: {
    fallbackTitel: "Mi entrenamiento",
    nochNichts: "Todavía no hay nada.",
    luecke: "Todavía hay un hueco vacío.",
    veraendert: "La cuenta ha cambiado al principio. Pulsa dos veces Mayús para recuperarla.",
    richtig: "Correcto.",
    fastRichtig: (s) => `Casi. Se escribe así: ${s}.`,
    einheit: (h) => `Bien calculado - ${h ?? "fíjate en la unidad"}.`,
    restFehlt: "Bien calculado - falta el resto.",
    nochNicht: (h) => `Todavía no. ${h}`,
    nochNichtLeer: "Todavía no. Míralo otra vez.",
    uebersprungen: "Saltada.",
    aufgabeKurz: (k) => `Pregunta: ${k}`,
    etappeVon: (nr, g) => `Etapa ${nr} de ${g}.`,
    aufgabeVon: (nr, g) => `Pregunta ${nr} de ${g}.`,
    aufgabeLabel: (nr, g) => `Pregunta ${nr} de ${g}`,
    danachRaetsel: "Después viene un acertijo.",
    genug: "Por hoy es suficiente. Vuelve mañana.",
    raetselVorspann: (r, g) => `${r} de ${g} correctas. Ahora viene un acertijo.`,
    geschafft: "Muy bien",
    richtigVon: (r, g) => `${r} de ${g} correctas.`,
    uebersprungenSatz: (n) => ` ${n === 1 ? "Una pregunta saltada" : `${n} preguntas saltadas`}.`,
    rundenBis: (n) => (n === 1 ? "Después de la próxima ronda viene un acertijo." : `Faltan ${n} rondas para el acertijo.`),
    weiterNaechste: "Siguiente ronda",
    andereUebung: "Elegir otra práctica",
    genugHeute: "Suficiente por hoy",
    nochDurchgang: "Otra vez",
    danachMarke: (r) => (r ? "siguiente: acertijo" : "siguiente: resumen"),
    danachSatz: (nr, gesamt, raetsel) => {
      const rest = gesamt - nr;
      const noch = rest === 0 ? "Esta es la última." : rest === 1 ? "Después queda una más." : `Después quedan ${rest} más.`;
      return `${noch}${raetsel ? " Después viene un acertijo." : ""}`;
    },
    merke: "Recuerda:",
    zeigWeg: "Muéstrame el desarrollo",
    nochSchritt: "Un paso más",
    nochmalAnsagen: "Repetir la pregunta",
    tastenExtra: "Tecla Mayús dos veces: la pregunta otra vez - la cuenta vuelve al cuadro",
    weiter: "Siguiente",
    pruefen: "Comprobar",
    loesungEine: (l) => `Una respuesta es ${l}.`,
    loesung: (l) => `La respuesta es ${l}.`,
    nichtWeiter: "No sé seguir",
    ueberspringen: "Saltar pregunta",
    beenden: "Terminar la práctica",
    etappeZeile: (nr, g, name) => `Etapa ${nr} de ${g}: ${name}`,
  },

  eingabe: {
    arten: {
      normal: "Escribir números",
      computer: "Braille de ordenador",
      marburger: "Braille matemático (CMU), 6 puntos",
    },
    antwort: "Tu respuesta",
    tasteArt: "Alt + B cambia tu forma de escribir",
    tasteGroesse: "Alt + Más: más grande · Alt + Menos: más pequeño · Alt + 0: normal",
    tasteZeile: "Enter: línea nueva · Alt + P comprueba",
    tasteZurueck: "Tecla Mayús dos veces: recuperar la cuenta",
    artAnsage: (art, steht) => `${art}. ${steht ? "La cuenta ha vuelto al cuadro." : "El cuadro vuelve a estar vacío."}`,
    anfang: "Al principio de la línea.",
    feldLeer: "El cuadro está vacío.",
    geloescht: "borrado",
    punkte: (p) => `Puntos ${p === "leer" ? "vacío" : p}`,
    keineRechnung: "Aquí no hay ninguna cuenta que recuperar.",
    rechnungDa: "La cuenta ha vuelto.",
    soLese: "Así lo leo yo:",
    nochNichts: "todavía nada",
    tastenFuer: "Teclas de esta práctica",
  },

  einstellungen: {
    gruppeEingabe: "Entrada",
    gruppeAnzeige: "Pantalla",
    gruppeKlang: "Sonido y lectura en voz alta",
    braillezeile: "Trabajar con una línea braille",
    zeilenAn: "Toda la pregunta está en el cuadro de respuesta, también los problemas con texto. Las líneas se cortan para que saltes lo menos posible. Escribes en el hueco.",
    zeilenAus: "La pregunta está arriba y el cuadro de respuesta está vacío. Escribes cifras y signos de cálculo con el teclado.",
    unterwegsVor: "Sobre la marcha,",
    unterwegsNach: " lo cambia.",
    schrift: "Código braille",
    schriftNamen: { computer: "Braille de ordenador (8 puntos)", marburger: "Braille matemático CMU (6 puntos)" },
    schriftErkl: (schrift, eingabe) => {
      const aus = schrift === "computer"
        ? "La pregunta está en el cuadro en braille de ordenador. Tiene ocho puntos y cada signo es una celda, como en tu línea braille."
        : "La pregunta está en el cuadro en braille matemático CMU de seis puntos. Los números llevan delante el signo de número - como en un libro de clase.";
      const ein = eingabe === "tastatur"
        ? "Escribes los números con el teclado y el cuadro los convierte en celdas."
        : schrift === "computer"
          ? "Escribes braille con F D S y J K L, más A y ; para los puntos 7 y 8."
          : "Escribes braille con seis puntos: F D S y J K L.";
      return `${aus} ${ein}`;
    },
    wieDuSchreibst: "Cómo escribes",
    wegNamen: { tastatur: "Números con el teclado", braille: "Escribir braille" },
    breite: "Línea braille de 40 o de 80 caracteres",
    breiteKurz: "Línea braille",
    breiteNamen: { 40: "40 caracteres", 80: "80 caracteres" },
    breiteErkl: {
      40: "El cuadro mide como máximo 40 caracteres, como una línea braille de 40 celdas. Las preguntas largas se cortan más veces.",
      80: "El cuadro mide como máximo 80 caracteres, como una línea braille de 80 celdas. La mayoría de las preguntas caben en una línea.",
    },
    festgelegtNach: ". Tu docente lo ha fijado para ti.",
    an: "sí",
    aus: "no",
    soSteht: (b) => `Así se ve ${b} en el cuadro:`,
    ausschreiben: "Escribir las cuentas con palabras",
    ausschreibenJa: "Sí - con palabras: 48 más 27 es",
    ausschreibenNein: "No - corto: 48 +27 =",
    ausschreibenErkl: "Con palabras es para quien solo escucha. Con línea braille se usa la forma corta: ahí es la mejor.",
    textgroesse: "Tamaño del texto",
    prozent: (n) => `${n} por ciento`,
    groesseA: "Hace más grandes la pregunta y el cuadro de respuesta; el resto del programa se queda como está. ",
    groesseB: " más grande, ",
    groesseC: " más pequeño, ",
    groesseD: " de vuelta a lo normal.",
    abstand: "Espacio entre letras",
    abstandErkl: "Más espacio entre los caracteres si se juntan demasiado (CVI). Vale en este dispositivo, también en Tastenflow.",
    schriftWahlName: "Letra de la pregunta y del cuadro de respuesta",
    schriftWahlHinweis: "Cambia solo la pregunta y tu cuadro de respuesta - el programa se queda como está. Vale en este dispositivo.",
    farbenA: "Colores y contraste: ",
    farbenB: " o el interruptor de color de la cabecera.",
    klangA: "Ajusta la lectura en voz alta, la velocidad, el volumen y los sonidos en el menú del altavoz.",
    klangB: " activa y desactiva la lectura directamente, ",
    klangC: " la detiene al instante.",
    strg: "Ctrl",
    abstandNamen: ZEICHENABSTAND_LABELS_ES,
    region: "País o región",
    regionErkl: "Aquí eliges tu país. Cambian el dinero de los problemas, unas pocas palabras y la voz. Las celdas de braille no cambian.",
    regionNamen: {
      es: "España (euros)", latam: "Latinoamérica (pesos)",
      fr: "Francia (euros)", be: "Bélgica (euros)",
      "ch-huitante": "Suiza: Vaud, Valais, Friburgo (francos, huitante)",
      "ch-quatre-vingts": "Suiza: Ginebra, Neuchâtel, Berna, Jura (francos, quatre-vingts)",
      ca: "Quebec (dólares)",
    },
  },

  akustik: {
    kopf: "Sonido y lectura en voz alta",
    probe: "Así suena Plus.",
    vorlesenTitel: "Plus lee en voz alta",
    vorlesenErkl: (h) => `Plus dice las preguntas y las respuestas con su propia voz. ${h} Alt + V lo activa o desactiva, Ctrl lo detiene al instante.`,
    tempo: "Velocidad de la voz",
    tempoErkl: "Lo rápido que habla la voz de Plus. 100 % es normal, más a la derecha es más rápido.",
    lautStimme: "Volumen de la voz",
    lautStimmeErkl: "Lo alto que habla la voz de Plus. 100 % es el volumen que tiene tu dispositivo - más alto no puede ser.",
    toene: "Sonidos",
    toeneErkl: "Un sonido corto cuando lo has calculado bien. \"Correcto\" siempre se escribe también.",
    lautToene: "Volumen de los sonidos",
    lautToeneErkl: "Lo alto que suenan los avisos. Con 0 % no se oye nada, aunque los sonidos estén activados.",
  },

  hinweise: {
    funktionsname: "Plus aún no conoce nombres de funciones como log o sen.",
    altesGeteilt: "Ese signo de dividir ya no se usa.",
    kommaOhneZahl: "Una coma sin número delante.",
    bruchstrichZahlzeichen: "Después de la raya de fracción, delante del número va el signo de número.",
    griechisch: "Plus no conoce las letras griegas.",
    schliesstOhneOffen: "Esto cierra algo que no está abierto.",
    unbekanntesZeichen: "Plus no conoce este signo.",
    klammerOffen: "Un paréntesis sigue abierto.",
    kommaInZahl: "Una coma dentro de un número: en español es la coma decimal. Plus la entiende así.",
    buchstabeNichtGebaut: "Las letras y las unidades aún no forman parte de este braille matemático.",
  },

  stoff: STOFF_ES,
};
