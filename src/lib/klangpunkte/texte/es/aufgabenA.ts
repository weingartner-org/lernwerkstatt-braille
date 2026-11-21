/** Bereich `aufgabenA` - Spanisch (es, Spanien). */
import type { aufgabenA as De } from "../de/aufgabenA";

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "Barra de compás: la barra espaciadora",
    zahlzeichen: "el signo de número",
    obereZahl: (n: number): string => `el ${n} (número de arriba)`,
    tiefeZahl: (n: number): string => `el ${n} como número bajo`,
    schlagzahl: (b: number): string => String(b),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Escribe: ${ton}, ${wert}.`,
    welcheNote: "¿Qué nota es esta? Escucha con atención y siente la celda.",
    dasWar: (ton: string, wert: string): string => `Era ${ton}, ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Dos notas. ¿Cuál era más aguda?",
    dreiHoechster: "Tres notas. ¿Cuál era la más aguda?",
    ordinale: ["La primera", "La segunda", "La tercera"],
    hoechsterErklaer: (i: number): string => `La nota más aguda era ${["la primera", "la segunda", "la tercera"][i]}.`,
    leiter: "Una pequeña escala. ¿Sube o baja?",
    leiterWahl: ["Sube", "Baja"],
    leiterRauf: "Subía.",
    leiterRunter: "Bajaba.",
  },
  kp2: {
    prompt: (len: number): string => `Escucha el ritmo y repítelo con la barra espaciadora: ${len} pulsos.`,
  },
  kp3: {
    grundform: " (La forma básica es la corchea.)",
  },
  kp4: {
    prompt: "Escucha la melodía y escríbela nota por nota.",
  },
  kp5: {
    viertelHinweis: " (Negra = añade el punto 6, igual que el punto 3 en las letras de la k a la t.)",
    melodie: "Escribe la melodía: todo negras.",
    frage: "¿Corchea o negra?",
    wahl: ["Corchea", "Negra"],
    erklaerAchtel: "Sin punto extra abajo: una corchea.",
    erklaerViertel: "Con el punto 6 añadido: una negra.",
  },
  kp6: {
    halbeHinweis: " (Blanca = añade el punto 3.)",
    ganzeHinweis: " (Redonda = añade los puntos 3 y 6.)",
    frage: "¿Qué duración tiene esta nota?",
    erklaer: (wert: string): string => `Era una ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Escribe: ${pause}.`,
    taktart: "¿Qué indicación de compás es esta?",
    taktartErklaer: (a: number, b: number): string =>
      `Era el compás de ${a}/${b}: signo de número, el ${a} arriba y el ${b} como número bajo debajo.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Escribe: ${ton1} blanca, barra de compás (barra espaciadora), ${ton2} blanca.`,
    taktstrichErklaer: "En braille, la barra de compás es un espacio.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Escribe: ${ton}, ${wert} con puntillo. (El punto que alarga una nota es el punto 3 en SU PROPIA celda.)`,
    punktZelle: "el punto que alarga la nota: punto 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Escribe: ${vorzeichen} y después ${ton} como negra. (La alteración va justo ANTES de la nota.)`,
  },
  kp10: {
    lage: "¿En qué octava suena esto?",
    lageWahl: ["Grave (tercera octava)", "Media (cuarta octava)", "Aguda (quinta octava)"],
    lageErklaer: (oktave: string): string => `Era la ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Escribe ${ton} en la ${oktave} como PRIMERA nota de una pieza, una negra. (Primero el signo de octava y después la nota.)`,
    zeichenZelle: (oktave: string): string => `el signo de octava de la ${oktave}`,
  },
  kp11: {
    gleich: "la misma nota",
    sekundeTerz: "una segunda o una tercera",
    quarteQuinte: "una cuarta o una quinta",
    sexteMehr: "una sexta o más",
    regelKlein: "Una segunda o una tercera NUNCA necesita signo de octava.",
    regelMittel: "Una cuarta o una quinta SOLO necesita uno cuando cambia la octava.",
    regelGross: "A partir de una sexta, la nota SIEMPRE necesita signo de octava.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Primera nota: ${ton1}, ${oktave1}. Después: ${ton2}, ${oktave2}. ¿Necesita la segunda nota un signo de octava?`,
    wahl: ["Sí", "No"],
    erklaer: (sprung: string, regel: string): string => `El salto es ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "En compás de 4/4, UNA sola celda llena todo el compás. ¿Redonda o semicorchea?",
    grossWahl: ["Una redonda", "Una semicorchea"],
    grossErklaer:
      "Una sola celda que tiene que llenar cuatro pulsos es la nota LARGA: la redonda. Una semicorchea sería demasiado corta.",
    kleinPrompt: "En compás de 2/4 hay OCHO celdas idénticas seguidas. ¿Redondas o semicorcheas?",
    kleinWahl: ["Redondas", "Semicorcheas"],
    kleinErklaer:
      "Ocho redondas no cabrían nunca en dos pulsos: tienen que ser las notas CORTAS, semicorcheas. Deciden la indicación de compás y el contexto.",
  },
  kp13: {
    similePrompt: "Escribe el signo braille de repetición de compás (tocar otra vez el compás entero).",
    simileZelle: "el signo de repetición de compás: puntos 2, 3, 5, 6",
    simileErklaer: "Este atajo solo existe en braille: ¡más ingenioso que la tinta!",
    startPrompt: "Escribe: INICIO de repetición (dos celdas).",
    startZellen: ["primera celda: puntos 1, 2, 6", "segunda celda: puntos 2, 3, 5, 6"],
    endePrompt: "Escribe: FIN de repetición (dos celdas).",
    endeZellen: ["primera celda: puntos 1, 2, 6", "segunda celda: puntos 2, 3"],
    schluss: "La barra final (fin de la pieza)",
    anfang: "Inicio de repetición",
    ende: "Fin de repetición",
    erkennenPrompt: "¿Qué signo de forma es este?",
    erkannt: (zeichen: string): string => `Era: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Dos blancas sobre la misma nota. ¿Sonaron una vez o dos?",
    hoerenWahl: ["Una vez: unidas", "Dos veces: separadas"],
    hoerenGebunden: "Un solo ataque: la ligadura de unión junta las dos notas en UNA sola nota larga.",
    hoerenGetrennt: "Dos ataques: aquí no había ligadura, cada nota vuelve a empezar.",
    schreibPrompt: (ton: string): string =>
      `Escribe: ${ton} blanca, ligadura de unión (dos celdas: punto 4 y después puntos 1 y 4) y otra vez ${ton} blanca.`,
    zelle1: "ligadura de unión, primera celda: punto 4",
    zelle2: "ligadura de unión, segunda celda: puntos 1, 4",
    klingtWeiter: (note: string): string => `${note}: sigue sonando, sin ataque nuevo`,
    schreibErklaer: "La ligadura de unión va justo DESPUÉS de la primera nota.",
    taktPrompt: (ton: string): string =>
      `Ligadura de unión a través de la barra de compás: ${ton} blanca, ligadura, barra de compás (barra espaciadora), ${ton} blanca.`,
    taktErklaer: "Así sigue sonando una nota a través de la barra de compás.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `Compás de ${a}/${b}. Escucha el compás y cuenta al mismo tiempo: ¿está completo?`,
    vollWahl: ["Completo", "Incompleto: una anacrusa o un compás parcial"],
    vollJa: (ziel: string): string => `Cuadra exactamente: ${ziel} pulsos.`,
    vollNein: (summe: string, ziel: string): string =>
      `Falta algo: solo ${summe} de ${ziel} pulsos, un compás parcial. Al principio de una pieza se llama anacrusa.`,
    bindestrichPrompt: "El compás no termina al final de la línea. Escribe el guion musical (punto 5).",
    bindestrichZelle: "el guion musical: punto 5",
    bindestrichErklaer: "El punto 5 al final de una línea dice: este compás continúa en la línea siguiente.",
    schreibPrompt: (ton: string): string =>
      `Escribe la anacrusa: ${ton} negra, barra de compás (barra espaciadora) y después el compás completo.`,
    auftaktZelle: (note: string): string => `${note}: la anacrusa`,
    schreibErklaer: "Una anacrusa es un primer compás incompleto; se escribe igual que cualquier otro.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Escribe: ${n} compases de silencio: signo de número, el ${n} y después el silencio de redonda.`,
    zahlzeichenZelle: "el signo de número: puntos 3, 4, 5, 6",
    zahlZelle: (n: number): string => `el número ${n}`,
    ganzePauseZelle: "el silencio de redonda: puntos 1, 3, 4",
    vieleErklaer: "A partir de cuatro compases vacíos, el braille escribe la cuenta como un número delante del silencio de redonda.",
    kleinPrompt: (n: number): string =>
      `Escribe: ${n} compases vacíos. Hasta tres compases, escribe sin más el silencio de redonda ${n === 2 ? "dos veces" : "tres veces"}.`,
    kleinZelle: (i: number): string => `silencio de redonda ${i}: un compás vacío entero`,
    kleinErklaer: "El silencio de redonda llena SIEMPRE un compás entero, sea cual sea la indicación de compás.",
    lesenPrompt: "¿Cuántos compases de silencio hay?",
    takte: (n: number): string => `${n} compases`,
    lesenKlein: (n: number): string => `${n} silencios de redonda seguidos = ${n} compases vacíos.`,
    lesenGross: (n: number): string => `Signo de número + ${n} + silencio de redonda = ${n} compases de silencio de una vez.`,
    stillePrompt: "Tres compases, y uno de ellos está completamente en silencio. ¿Cuál?",
    stilleWahl: ["Al principio", "En medio", "Al final"],
    stilleErklaer: (i: number): string =>
      `El silencio estaba ${["al principio", "en medio", "al final"][i]}: un compás entero de silencio.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["sol mayor", "re mayor", "la mayor", "mi mayor"],
      be: ["fa mayor", "si bemol mayor", "mi bemol mayor", "la bemol mayor"],
    },
    kreuz: "sostenido",
    be: "bemol",
    kreuze: "sostenidos",
    bes: "bemoles",
    lesenPrompt: (mehrzahl: string): string =>
      `Esta armadura está al principio de la pieza. ¿Cuántos ${mehrzahl} hay?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name}: la armadura de ${tonart}. ${
        ab4 ? "A partir de cuatro, delante va el número." : "Hasta tres, el signo simplemente se repite."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Escribe la armadura: ${n} ${name}. Escribe el signo de ${zeichen} ${n === 1 ? "una vez" : n === 2 ? "dos veces" : "tres veces"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Escribe la armadura: ${n} ${mehrzahl}. A partir de cuatro, con signo de número: signo de número, el ${n} y después el ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i}: puntos ${punkte}`,
    zahlzeichenZelle: "el signo de número: puntos 3, 4, 5, 6",
    zahlZelle: (n: number): string => `el número ${n}`,
    dasZeichen: (name: string): string => `el ${name}`,
    istVorzeichnung: (tonart: string): string => `Esa es la armadura de ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Escribe el encabezamiento de una pieza: primero la armadura (${n} ${name}) y justo después la indicación de compás ${a}/${b}, sin espacio en medio.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "La armadura y la indicación de compás van juntas al principio de una pieza: primero la armadura y después el compás.",
    regelPrompt: "La armadura al principio de una pieza: ¿cuánto dura?",
    regelWahl: ["Toda la pieza", "Solo el primer compás", "Solo la primera nota"],
    regelErklaer:
      "La armadura dura toda la pieza; en cambio, una alteración en mitad de un compás solo dura hasta la barra de compás.",
  },
  taktwechsel: {
    sonderPrompt: "¿Qué indicación de compás es esta?",
    sonderWahl: ["C: compás de cuatro tiempos (cuatro negras)", "Alla breve: compás de dos tiempos (dos blancas)", "Compás de 3/4"],
    sonderErklaerC: "Puntos 4, 6 delante de la c: la C del compás de cuatro tiempos.",
    sonderErklaerAb: "Puntos 4, 5, 6 delante de la c: alla breve; las blancas llevan el pulso.",
    sonderSchreibenC: "Escribe el signo de compás C: puntos 4 y 6, y después la c (puntos 1, 4).",
    sonderSchreibenAb: "Escribe alla breve: puntos 4, 5 y 6, y después la c (puntos 1, 4).",
    vorzeichenC: "el signo: puntos 4, 6",
    vorzeichenAb: "el signo: puntos 4, 5, 6",
    dasC: "la c: puntos 1, 4",
    wechselPrompt: "Después de unas notas hay una SEGUNDA indicación de compás. ¿Qué significa?",
    wechselWahl: (a: number, b: number): string[] => [
      `La indicación de compás cambia a ${a}/${b}`,
      "Cambia la tonalidad",
      "La pieza ha terminado",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Una nueva indicación de compás en mitad de una pieza significa: desde aquí vale el compás de ${a}/${b}.`,
    wechselSchreiben: (a: number, b: number): string =>
      `La indicación de compás cambia en mitad de la pieza: escribe una barra de compás (barra espaciadora) y después la nueva indicación de compás ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "¿Qué clave es esta (tres celdas)?",
    lesenErklaer: (schluessel: string): string =>
      `Era la ${schluessel}. Todas las claves empiezan con los puntos 3, 4, 5 y terminan con los puntos 1, 2, 3; la celda del medio las distingue.`,
    mitteViolin: "puntos 3, 4",
    mitteBass: "puntos 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Escribe la ${schluessel}: tres celdas: puntos 3, 4, 5 · ${mitte} · puntos 1, 2, 3.`,
    ankuendigung: "el comienzo de la clave: puntos 3, 4, 5",
    gZeichen: "el signo de sol: puntos 3, 4",
    fZeichen: "el signo de fa: puntos 3, 4, 5, 6",
    abschluss: "el final: puntos 1, 2, 3",
    wissenPrompt: "¿Necesita la musicografía braille claves para saber la altura?",
    wissenWahl: ["No: los signos de octava dicen la octava", "Sí: sin clave no funciona nada"],
    wissenErklaer:
      "En braille, los signos de clave solo dan información sobre la página impresa; la octava la fijan siempre los signos de octava.",
  },
  sechzehntel: {
    hoerenPrompt: "Una pequeña carrera de notas. ¿Corcheas, o las semicorcheas, que son el doble de rápidas?",
    hoerenWahl: ["Corcheas", "Semicorcheas"],
    hoerenSchnell: "Eran semicorcheas: cuatro por pulso.",
    hoerenLangsam: "Eran corcheas: dos por pulso.",
    gruppePrompt:
      "Escribe el grupo de cuatro semicorcheas: solo la PRIMERA nota lleva los puntos 3 y 6, y las otras tres se escriben como corcheas (agrupación).",
    ersteZelle: (ton: string): string => `${ton} como semicorchea: con los puntos 3 y 6`,
    andereZelle: (ton: string): string => `${ton}: escrita como corchea (pertenece al grupo)`,
    gruppeErklaer: "La agrupación hace fáciles de leer las carreras rápidas: los puntos de duración solo van en la primera nota del grupo.",
    regelPrompt:
      "Cuatro semicorcheas en un pulso, escritas como grupo: ¿cuántas celdas llevan los puntos de duración 3 y 6?",
    regelWahl: ["Solo la primera", "Las cuatro", "La primera y la última"],
    regelErklaer:
      "Solo la primera nota del grupo muestra la duración; las demás parecen corcheas. Es el equivalente braille del grupo unido con barras en la tinta.",
    einzelnPrompt: (ton: string): string =>
      `Escribe: ${ton} como semicorchea. (Ojo: es la misma celda que la redonda; ¡decide la indicación de compás!)`,
  },
  triolen: {
    hoerenPrompt: "Entre dos pulsos regulares: ¿cuántas notas comparten UN pulso, dos o tres?",
    hoerenWahl: ["Dos: corcheas normales", "Tres: un tresillo"],
    hoerenTriole: "Tres notas de la misma duración en un pulso: un tresillo.",
    hoerenZwei: "Dos corcheas: la división normal.",
    schreibPrompt: "Escribe el tresillo: primero el signo de tresillo (puntos 2, 3) y después las tres corcheas.",
    triolenZeichen: "el signo de tresillo: puntos 2, 3",
    achtelZelle: (ton: string): string => `${ton}, corchea: un tercio del pulso`,
    schreibErklaer: "El signo de tresillo va UNA vez delante del grupo: convierte dos corcheas en tres.",
    lesenPrompt: "Delante de tres corcheas hay esta primera celda (puntos 2, 3). ¿Qué significa?",
    lesenWahl: ["Un tresillo: tres notas en un pulso", "Un silencio de corchea", "Un signo de octava"],
    lesenErklaer: "Los puntos 2, 3 delante de un grupo de notas = tresillo.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Siente el pulso regular y márcalo con uniformidad con la barra espaciadora: ${n} pulsos.`,
    metrumPrompt: "Escucha los pulsos acentuados: ¿esto es una marcha de dos en dos o un vals de tres en tres?",
    metrumWahl: ["Marcha: de dos en dos", "Vals: de tres en tres"],
    metrumDrei: "El primero de cada tres pulsos es fuerte: un compás ternario, el paso del vals.",
    metrumZwei: "El primero de cada dos pulsos es fuerte: un compás binario, el paso de marcha.",
    abstandPrompt: "Cuenta los pulsos de un acento al siguiente: ¿cuántos hay?",
    abstandWahl: ["2 pulsos", "3 pulsos", "4 pulsos"],
    abstandErklaer: (n: number): string => `De acento a acento hay ${n} pulsos: compás de ${n}/4.`,
  },
  dauer: {
    vergleichPrompt: "Dos notas, una después de otra. ¿Cuál sonó más larga?",
    vergleichWahl: ["La primera", "La segunda"],
    vergleichErster: "La primera era una blanca, el doble de larga que la negra siguiente.",
    vergleichZweiter: "La segunda era una blanca, el doble de larga que la negra anterior.",
    schlaegePrompt: "Primero dos pulsos de la pulsación y después una nota larga: ¿cuántos pulsos duró?",
    schlaegeWahl: ["1 pulso: una negra", "2 pulsos: una blanca", "4 pulsos: una redonda"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Era una ${wert}: duraba ${zahl} ${zahl === 1 ? "pulso" : "pulsos"}.`,
    paarPrompt: "Dos notas: ¿de la misma duración o la segunda el doble de larga?",
    paarWahl: ["La misma duración", "La segunda el doble de larga"],
    paarGleich: "Dos negras de la misma duración.",
    paarDoppelt: "Primero una negra y después una blanca, el doble de larga.",
  },
  dynamik: {
    lautPrompt: "Escucha la pequeña frase: ¿tocada fuerte o suave?",
    lautWahl: ["Fuerte", "Suave"],
    lautErklaer: "Tocada con fuerza: más adelante lo llamarás forte.",
    leiseErklaer: "Tocada muy suavemente: más adelante lo llamarás piano.",
    rampePrompt: "¿La frase sube o baja de volumen?",
    rampeWahl: ["Sube de volumen", "Baja de volumen"],
    cresc: "De suave a fuerte: más adelante se llama crescendo.",
    decresc: "De fuerte a suave: más adelante se llama decrescendo.",
    akzentPrompt: "Una nota está acentuada en particular. ¿Dónde estaba?",
    akzentWahl: ["Al principio", "En medio", "Al final"],
    akzentErklaer: (i: number): string =>
      `La nota acentuada estaba ${["al principio", "en medio", "al final"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Piano: percutido, un ataque brillante que sigue sonando.",
      gitarre: "Guitarra: pulsada, percusiva y de cuerdas.",
      sax: "Saxofón: soplado, suave y con sonido de lengüeta.",
      floete: "Flauta: soplada, suave y clara.",
    },
    hoerenPrompt: "¿Qué instrumento está tocando aquí?",
    vergleichPrompt: "Dos melodías pequeñas, una después de otra: ¿el mismo instrumento o instrumentos distintos?",
    vergleichWahl: ["El mismo instrumento", "Instrumentos distintos"],
    vergleichGleich: "Las dos melodías venían del mismo instrumento.",
    vergleichErklaer: (a: string, b: string): string => `Primero ${a} y después ${b}.`,
    zuerstPrompt: "Dos instrumentos, uno después de otro. ¿Cuál tocó primero?",
    zuerstErklaer: (a: string): string => `Primero sonó: ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Juego del eco: escucha las ${len} notas y tócalas de vuelta en el teclado; las teclas D F G H J K L son las notas do re mi fa sol la si. Solo cuenta el orden de las notas; el ritmo es libre.`,
    erklaer: "Toca las notas de vuelta en el orden en que las has oído.",
  },
  memory: {
    prompt:
      "Memoria de melodías: yo toco una serie de notas y tú la repites (las teclas D F G H J K L son las notas do re mi fa sol la si). Si aciertas, se añade una nota más: ¿hasta dónde llegas?",
  },
};
