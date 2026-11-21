/**
 * Bereich `aufgabenA` - Portugiesisch (pt, Portugal). Aufgaben-Erzeuger in `etappen.ts`:
 * kp1 bis kp13, Stufe 2 (Haltebogen bis Triole) und Welt 1 „Ouvidos atentos". Funktionen = Texte
 * mit eingesetzten Wörtern. Kinder werden geduzt (tu), Lehrkraft-Texte unpersönlich.
 */
import type { aufgabenA as De } from "../de/aufgabenA";

export const aufgabenA: typeof De = {
  gemeinsam: {
    taktstrichZelle: "Barra de compasso - a barra de espaço",
    zahlzeichen: "o sinal numérico",
    obereZahl: (n: number): string => `o ${n} (número de cima)`,
    tiefeZahl: (n: number): string => `o ${n} como número de baixo`,
    /** Schlagzahl lesbar machen („1,5" statt „1.5"). */
    schlagzahl: (b: number): string => (Number.isInteger(b) ? String(b) : String(b).replace(".", ",")),
  },
  hilfe: {
    schreibNote: (ton: string, wert: string): string => `Escreve: ${ton} - ${wert}.`,
    welcheNote: "Que nota é esta? Ouve com atenção e sente a célula.",
    dasWar: (ton: string, wert: string): string => `Era ${ton} - ${wert}.`,
  },
  kp1: {
    zweiHoeher: "Dois sons. Qual era o mais alto?",
    dreiHoechster: "Três sons. Qual era o mais alto de todos?",
    ordinale: ["O primeiro", "O segundo", "O terceiro"],
    hoechsterErklaer: (i: number): string =>
      `${["O primeiro", "O segundo", "O terceiro"][i]} som era o mais alto.`,
    leiter: "Uma escala pequena. Subiu ou desceu?",
    leiterWahl: ["Subiu", "Desceu"],
    leiterRauf: "Subiu.",
    leiterRunter: "Desceu.",
  },
  kp2: {
    prompt: (len: number): string =>
      `Ouve o ritmo e bate-o com a barra de espaço - ${len} batidas.`,
  },
  kp3: {
    grundform: " (A forma básica é a colcheia.)",
  },
  kp4: {
    prompt: "Ouve a melodia e escreve-a nota a nota.",
  },
  kp5: {
    viertelHinweis: " (Semínima = acrescenta o ponto 6 - como o ponto 3 em k a t.)",
    melodie: "Escreve a melodia - só semínimas.",
    frage: "Colcheia ou semínima?",
    wahl: ["Colcheia", "Semínima"],
    erklaerAchtel: "Sem ponto extra em baixo: uma colcheia.",
    erklaerViertel: "Com o ponto 6 acrescentado: uma semínima.",
  },
  kp6: {
    halbeHinweis: " (Mínima = acrescenta o ponto 3.)",
    ganzeHinweis: " (Semibreve = acrescenta os pontos 3 e 6.)",
    frage: "Qual é o valor desta nota?",
    erklaer: (wert: string): string => `Era uma ${wert}.`,
  },
  kp7: {
    schreibPause: (pause: string): string => `Escreve: ${pause}.`,
    taktart: "Que fórmula de compasso aparece aqui?",
    taktartErklaer: (a: number, b: number): string =>
      `Era o compasso ${a}/${b}: sinal numérico, ${a} em cima, ${b} como número de baixo em baixo.`,
    taktstrich: (ton1: string, ton2: string): string =>
      `Escreve: ${ton1} mínima, barra de compasso (barra de espaço), ${ton2} mínima.`,
    taktstrichErklaer: "A barra de compasso é, em braille, um espaço.",
  },
  kp8: {
    prompt: (ton: string, wert: string): string =>
      `Escreve: ${ton} - ${wert} pontuada. (O ponto de prolongação é o ponto 3 numa célula PRÓPRIA.)`,
    punktZelle: "O ponto de prolongação - ponto 3",
  },
  kp9: {
    prompt: (vorzeichen: string, ton: string): string =>
      `Escreve: ${vorzeichen}, depois ${ton} como semínima. (O acidente fica mesmo ANTES da nota.)`,
  },
  kp10: {
    lage: "Em que posição soa isto?",
    lageWahl: ["Grave (oitava pequena)", "Médio (de uma linha)", "Agudo (de duas linhas)"],
    lageErklaer: (oktave: string): string => `Era a ${oktave}.`,
    schreib: (ton: string, oktave: string): string =>
      `Escreve como PRIMEIRA nota de um trecho: ${ton} na ${oktave}, semínima. (Primeiro o sinal de oitava, depois a nota.)`,
    zeichenZelle: (oktave: string): string => `o sinal de oitava da ${oktave}`,
  },
  kp11: {
    gleich: "a mesma nota",
    sekundeTerz: "uma segunda ou uma terceira",
    quarteQuinte: "uma quarta ou uma quinta",
    sexteMehr: "uma sexta ou mais",
    regelKlein: "A segunda e a terceira NUNCA precisam de sinal de oitava.",
    regelMittel: "A quarta e a quinta precisam dele SÓ se a oitava mudar.",
    regelGross: "A partir da sexta, a nota PRECISA SEMPRE de sinal de oitava.",
    prompt: (ton1: string, oktave1: string, ton2: string, oktave2: string): string =>
      `Primeira nota: ${ton1}, ${oktave1}. Depois: ${ton2}, ${oktave2}. A segunda nota precisa de sinal de oitava?`,
    wahl: ["Sim", "Não"],
    erklaer: (sprung: string, regel: string): string => `O salto é ${sprung}. ${regel}`,
  },
  kp12: {
    grossPrompt: "Num compasso de 4/4, UMA única célula enche o compasso inteiro. Semibreve ou semicolcheia?",
    grossWahl: ["Uma semibreve", "Uma semicolcheia"],
    grossErklaer:
      "Uma célula sozinha que tem de encher quatro tempos é o valor GRANDE: a semibreve. Uma semicolcheia seria muito curta.",
    kleinPrompt: "Num compasso de 2/4, há OITO células iguais seguidas. Semibreves ou semicolcheias?",
    kleinWahl: ["Semibreves", "Semicolcheias"],
    kleinErklaer:
      "Oito semibreves nunca cabem em dois tempos - têm de ser os valores PEQUENOS: semicolcheias. O compasso e o contexto decidem.",
  },
  kp13: {
    similePrompt: "Escreve o sinal braille de repetição de compasso (tocar o compasso inteiro outra vez).",
    simileZelle: "O sinal de repetição de compasso - pontos 2, 3, 5, 6",
    simileErklaer: "Esta abreviatura só existe em braille - mais esperta do que a impressa!",
    startPrompt: "Escreve: início de repetição (duas células).",
    startZellen: ["primeira célula - pontos 1, 2, 6", "segunda célula - pontos 2, 3, 5, 6"],
    endePrompt: "Escreve: fim de repetição (duas células).",
    endeZellen: ["primeira célula - pontos 1, 2, 6", "segunda célula - pontos 2, 3"],
    schluss: "A barra final (fim da peça)",
    anfang: "Início de repetição",
    ende: "Fim de repetição",
    erkennenPrompt: "Que sinal de forma é este?",
    erkannt: (zeichen: string): string => `Era: ${zeichen}.`,
  },
  haltebogen: {
    hoerenPrompt: "Duas mínimas no mesmo som. Tocado uma vez ou duas vezes?",
    hoerenWahl: ["Uma vez - ligado (ligadura de prolongamento)", "Duas vezes - separado"],
    hoerenGebunden: "Só uma ataque: a ligadura de prolongamento junta as duas notas num único som longo.",
    hoerenGetrennt: "Dois ataques: aqui não havia ligadura - cada nota começa de novo.",
    schreibPrompt: (ton: string): string =>
      `Escreve: ${ton} mínima, ligadura de prolongamento (duas células: ponto 4, depois 1 e 4), outra vez ${ton} mínima.`,
    zelle1: "Ligadura de prolongamento, primeira célula - ponto 4",
    zelle2: "Ligadura de prolongamento, segunda célula - pontos 1, 4",
    klingtWeiter: (note: string): string => `${note} - continua a soar, sem novo ataque`,
    schreibErklaer: "A ligadura de prolongamento fica logo DEPOIS da primeira nota.",
    taktPrompt: (ton: string): string =>
      `Ligar através da barra de compasso: ${ton} mínima, ligadura de prolongamento, barra de compasso (barra de espaço), ${ton} mínima.`,
    taktErklaer: "Assim, um som continua a soar para além da barra de compasso.",
  },
  auftakt: {
    vollPrompt: (a: number, b: number): string =>
      `Compasso ${a}/${b}. Ouve o compasso e conta: está completo?`,
    vollWahl: ["Completo", "Incompleto - uma anacruse ou um compasso parcial"],
    vollJa: (ziel: string): string => `Dá certo: ${ziel} tempos.`,
    vollNein: (summe: string, ziel: string): string =>
      `Falta alguma coisa: só ${summe} de ${ziel} tempos - um compasso parcial. No início de uma peça chama-se anacruse.`,
    bindestrichPrompt: "O compasso ainda não está completo no fim da linha. Escreve o hífen musical (ponto 5).",
    bindestrichZelle: "O hífen musical - ponto 5",
    bindestrichErklaer: "O ponto 5 no fim da linha diz: este compasso continua na linha seguinte.",
    schreibPrompt: (ton: string): string =>
      `Escreve a anacruse: ${ton} semínima, barra de compasso (barra de espaço), depois o compasso completo.`,
    auftaktZelle: (note: string): string => `${note} - a anacruse`,
    schreibErklaer: "Uma anacruse é um primeiro compasso incompleto - escreve-se de forma completamente normal.",
  },
  pausen2: {
    vielePrompt: (n: number): string => `Escreve: ${n} compassos de pausa - sinal numérico, o ${n}, depois a pausa de semibreve.`,
    zahlzeichenZelle: "O sinal numérico - pontos 3, 4, 5, 6",
    zahlZelle: (n: number): string => `o número ${n}`,
    ganzePauseZelle: "A pausa de semibreve - pontos 1, 3, 4",
    vieleErklaer: "A partir de quatro compassos vazios, o braille escreve o número antes da pausa de semibreve.",
    kleinPrompt: (n: number): string =>
      `Escreve: ${n} compassos vazios - até três compassos basta repetir a pausa de semibreve ${n === 2 ? "duas" : "três"} vezes.`,
    kleinZelle: (i: number): string => `pausa de semibreve ${i} - um compasso vazio inteiro`,
    kleinErklaer: "A pausa de semibreve enche SEMPRE um compasso inteiro - seja qual for a fórmula de compasso.",
    lesenPrompt: "Quantos compassos de silêncio há aqui?",
    takte: (n: number): string => `${n} compassos`,
    lesenKlein: (n: number): string => `${n} pausas de semibreve seguidas = ${n} compassos vazios.`,
    lesenGross: (n: number): string => `Sinal numérico + ${n} + pausa de semibreve = ${n} compassos de silêncio seguidos.`,
    stillePrompt: "Três compassos - um deles é completamente silencioso. Qual?",
    stilleWahl: ["No início", "No meio", "No fim"],
    stilleErklaer: (i: number): string =>
      `O silêncio estava ${["no início", "no meio", "no fim"][i]} - um compasso inteiro de pausa.`,
  },
  tonart: {
    keyNames: {
      kreuz: ["Sol maior", "Ré maior", "Lá maior", "Mi maior"],
      be: ["Fá maior", "Si bemol maior", "Mi bemol maior", "Lá bemol maior"],
    },
    kreuz: "Sustenido",
    be: "Bemol",
    kreuze: "Sustenidos",
    bes: "Bemóis",
    lesenPrompt: (mehrzahl: string): string =>
      `No início do trecho está esta armadura. Quantos ${mehrzahl} são?`,
    lesenErklaer: (n: number, name: string, tonart: string, ab4: boolean): string =>
      `${n} ${name} - a armadura de ${tonart}. ${
        ab4 ? "A partir de quatro, o número fica escrito antes do sinal." : "Até três, o sinal repete-se simplesmente."
      }`,
    schreibKlein: (n: number, name: string, zeichen: string): string =>
      `Escreve a armadura: ${n} ${name} - o sinal de ${zeichen} simplesmente ${n === 1 ? "uma vez" : n === 2 ? "duas vezes" : "três vezes"}.`,
    schreibGross: (n: number, mehrzahl: string, zeichen: string): string =>
      `Escreve a armadura: ${n} ${mehrzahl} - a partir de quatro com sinal numérico: sinal numérico, o ${n}, depois o sinal de ${zeichen}.`,
    zeichenZelle: (name: string, i: number, punkte: string): string => `${name} ${i} - pontos ${punkte}`,
    zahlzeichenZelle: "O sinal numérico - pontos 3, 4, 5, 6",
    zahlZelle: (n: number): string => `o número ${n}`,
    dasZeichen: (name: string): string => `o ${name}`,
    istVorzeichnung: (tonart: string): string => `Esta é a armadura de ${tonart}.`,
    kopfPrompt: (n: number, name: string, a: number, b: number): string =>
      `Escreve o cabeçalho da peça: primeiro a armadura (${n} ${name}), logo a seguir a fórmula de compasso ${a}/${b} - sem espaço entre elas.`,
    kopfZelle: (name: string, i: number): string => `${name} ${i}`,
    kopfErklaer: "Tonalidade e fórmula de compasso ficam juntas no início da peça - primeiro os acidentes, depois o compasso.",
    regelPrompt: "A armadura no início da peça - até quando vale?",
    regelWahl: ["Para a peça inteira", "Só para o primeiro compasso", "Só para a primeira nota"],
    regelErklaer:
      "A armadura vale para a peça inteira - um acidente a meio do compasso, pelo contrário, só vale até à barra de compasso.",
  },
  taktwechsel: {
    sonderPrompt: "Que fórmula de compasso é esta?",
    sonderWahl: ["C - o compasso de quatro quartos", "Alla breve - o compasso de dois tempos", "O compasso de 3/4"],
    sonderErklaerC: "Pontos 4, 6 antes do c: o C do compasso de quatro quartos.",
    sonderErklaerAb: "Pontos 4, 5, 6 antes do c: alla breve - as mínimas marcam o compasso.",
    sonderSchreibenC: "Escreve o sinal de compasso C: pontos 4 e 6, depois o c (pontos 1, 4).",
    sonderSchreibenAb: "Escreve alla breve: pontos 4, 5 e 6, depois o c (pontos 1, 4).",
    vorzeichenC: "o sinal - pontos 4, 6",
    vorzeichenAb: "o sinal - pontos 4, 5, 6",
    dasC: "o c - pontos 1, 4",
    wechselPrompt: "Depois de algumas notas aparece uma SEGUNDA fórmula de compasso. O que significa?",
    wechselWahl: (a: number, b: number): string[] => [
      `A fórmula de compasso muda para ${a}/${b}`,
      "A tonalidade muda",
      "A peça acaba",
    ],
    wechselErklaer: (a: number, b: number): string =>
      `Uma nova fórmula de compasso a meio da peça quer dizer: a partir daqui vale o compasso ${a}/${b}.`,
    wechselSchreiben: (a: number, b: number): string =>
      `A meio da peça o compasso muda: escreve a barra de compasso (barra de espaço), depois a nova fórmula ${a}/${b}.`,
  },
  schluessel: {
    lesenPrompt: "Que clave aparece aqui (três células)?",
    lesenErklaer: (schluessel: string): string =>
      `Era a ${schluessel}. Todas as claves começam com os pontos 3, 4, 5 e acabam com os pontos 1, 2, 3 - o meio é que as distingue.`,
    mitteViolin: "Pontos 3, 4",
    mitteBass: "Pontos 3, 4, 5, 6",
    schreibPrompt: (schluessel: string, mitte: string): string =>
      `Escreve a ${schluessel} - três células: pontos 3, 4, 5 · ${mitte} · pontos 1, 2, 3.`,
    ankuendigung: "o anúncio da clave - pontos 3, 4, 5",
    gZeichen: "o sinal de G - pontos 3, 4",
    fZeichen: "o sinal de F - pontos 3, 4, 5, 6",
    abschluss: "o fecho - pontos 1, 2, 3",
    wissenPrompt: "O braille musical precisa de claves para determinar a altura das notas?",
    wissenWahl: ["Não - os sinais de oitava indicam a posição", "Sim - sem clave não há nada a fazer"],
    wissenErklaer:
      "Em braille, os sinais de clave são apenas uma informação sobre a imagem impressa - a posição é sempre determinada pelos sinais de oitava.",
  },
  sechzehntel: {
    hoerenPrompt: "Uma pequena passagem rápida. Colcheias - ou as semicolcheias, duas vezes mais rápidas?",
    hoerenWahl: ["Colcheias", "Semicolcheias"],
    hoerenSchnell: "Eram semicolcheias - quatro num tempo.",
    hoerenLangsam: "Eram colcheias - duas num tempo.",
    gruppePrompt:
      "Escreve o grupo de quatro semicolcheias: só a PRIMEIRA nota leva os pontos 3 e 6; as outras três escreves como colcheias (agrupamento).",
    ersteZelle: (ton: string): string => `${ton} como semicolcheia - com os pontos 3 e 6`,
    andereZelle: (ton: string): string => `${ton} - escrita como colcheia (pertence ao grupo)`,
    gruppeErklaer: "O agrupamento torna as passagens rápidas legíveis: pontos de valor só na primeira nota do grupo.",
    regelPrompt:
      "Quatro semicolcheias num tempo, escritas como grupo: quantas células levam os pontos de valor 3 e 6?",
    regelWahl: ["Só a primeira", "As quatro", "A primeira e a última"],
    regelErklaer:
      "Só a primeira nota do grupo mostra o valor - o resto parece colcheias. É o equivalente braille da barra de agrupamento na impressão.",
    einzelnPrompt: (ton: string): string =>
      `Escreve: ${ton} como semicolcheia. (Atenção - é a mesma célula da semibreve; o compasso decide!)`,
  },
  triolen: {
    hoerenPrompt: "Entre duas batidas calmas: quantos sons dividem UM tempo - dois ou três?",
    hoerenWahl: ["Dois - colcheias normais", "Três - um terceto"],
    hoerenTriole: "Três sons de igual duração num tempo: um terceto.",
    hoerenZwei: "Duas colcheias - a divisão normal.",
    schreibPrompt: "Escreve o terceto: primeiro o sinal de terceto (pontos 2, 3), depois as três colcheias.",
    triolenZeichen: "O sinal de terceto - pontos 2, 3",
    achtelZelle: (ton: string): string => `${ton}, colcheia - um terço do tempo`,
    schreibErklaer: "O sinal de terceto fica UMA vez antes do grupo - transforma duas colcheias em três.",
    lesenPrompt: "Antes de três colcheias está esta primeira célula (pontos 2, 3). O que significa?",
    lesenWahl: ["Um terceto - três sons num tempo", "Uma pausa de colcheia", "Um sinal de oitava"],
    lesenErklaer: "Pontos 2, 3 antes de um grupo de notas = terceto.",
  },
  puls: {
    klopfPrompt: (n: number): string =>
      `Sente o pulso e bate-o regularmente com a barra de espaço - ${n} tempos seguidos.`,
    metrumPrompt: "Ouve os tempos acentuados: isto marcha em dois ou valsa em três?",
    metrumWahl: ["Marcha - em dois", "Valsa - em três"],
    metrumDrei: "Acentua-se sempre o primeiro de três tempos: um compasso ternário - o passo da valsa.",
    metrumZwei: "Acentua-se sempre o primeiro de dois tempos: um compasso binário - o passo da marcha.",
    abstandPrompt: "Conta os tempos de um acento ao seguinte: quantos são?",
    abstandWahl: ["2 tempos", "3 tempos", "4 tempos"],
    abstandErklaer: (n: number): string => `De acento a acento são ${n} tempos - um compasso de ${n}/4.`,
  },
  dauer: {
    vergleichPrompt: "Dois sons seguidos. Qual soou mais tempo?",
    vergleichWahl: ["O primeiro", "O segundo"],
    vergleichErster: "O primeiro era uma mínima - o dobro da duração das semínimas a seguir.",
    vergleichZweiter: "O segundo era uma mínima - o dobro da duração das semínimas antes.",
    schlaegePrompt: "Primeiro dois tempos de pulso, depois um som longo: quantos tempos durou?",
    schlaegeWahl: ["1 tempo - uma semínima", "2 tempos - uma mínima", "4 tempos - uma semibreve"],
    schlaegeErklaer: (wert: string, zahl: number): string =>
      `Era uma ${wert} - ${zahl} ${zahl === 1 ? "tempo" : "tempos"} de duração.`,
    paarPrompt: "Dois sons: de igual duração - ou o segundo com o dobro do tempo?",
    paarWahl: ["Igualmente longos", "O segundo com o dobro do tempo"],
    paarGleich: "Duas semínimas de igual duração.",
    paarDoppelt: "Primeiro uma semínima, depois uma mínima - com o dobro da duração.",
  },
  dynamik: {
    lautPrompt: "Ouve a pequena frase: tocada forte ou suave?",
    lautWahl: ["Forte", "Suave"],
    lautErklaer: "Tocado com força - isso chama-se mais tarde forte.",
    leiseErklaer: "Tocado com muita delicadeza - isso chama-se mais tarde piano.",
    rampePrompt: "A frase fica mais forte ou mais suave?",
    rampeWahl: ["Mais forte", "Mais suave"],
    cresc: "De suave para forte - mais tarde isto chama-se crescendo.",
    decresc: "De forte para suave - mais tarde isto chama-se decrescendo.",
    akzentPrompt: "Um som é especialmente acentuado. Onde estava?",
    akzentWahl: ["No início", "No meio", "No fim"],
    akzentErklaer: (i: number): string =>
      `O som acentuado estava ${["no início", "no meio", "no fim"][i]}.`,
  },
  inst: {
    merk: {
      klavier: "Piano - percutido, ataque claro com prolongamento.",
      gitarre: "Guitarra - dedilhada, percutida e com cordas.",
      sax: "Saxofone - soprado, sustentado e com timbre de palheta.",
      floete: "Flauta transversal - soprada, suave e clara.",
    },
    hoerenPrompt: "Que instrumento toca aqui?",
    vergleichPrompt: "Dois motivos seguidos: mesmo instrumento ou instrumentos diferentes?",
    vergleichWahl: ["Mesmo instrumento", "Instrumentos diferentes"],
    vergleichGleich: "Os dois motivos vieram do mesmo instrumento.",
    vergleichErklaer: (a: string, b: string): string => `Primeiro ${a}, depois ${b}.`,
    zuerstPrompt: "Dois instrumentos seguidos. Qual tocou primeiro?",
    zuerstErklaer: (a: string): string => `Primeiro veio o ${a}.`,
  },
  echo: {
    prompt: (len: number): string =>
      `Jogo do eco: ouve os ${len} sons e toca-os no teclado - D F G H J K L são dó ré mi fá sol lá si. Conta apenas a sequência de sons; o ritmo é livre.`,
    erklaer: "Toca os sons pela ordem em que os ouviste.",
  },
  memory: {
    prompt:
      "Memória de melodias: eu toco uma sequência de sons, tu tocas-a de volta (D F G H J K L = dó ré mi fá sol lá si). Se conseguires, entra mais um som - até onde chegas?",
  },
};
