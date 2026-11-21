/**
 * Bereich `aufgabenC` - Portugiesisch (br, Brasilien): Aufgabentexte der Welten 7 (Parque da teoria),
 * 8 (Conheça os instrumentos) und 9 (Palco das canções) aus `etappen.ts`.
 * Reihenfolge der Auswahllisten = Reihenfolge im Code (fester Zufall).
 */
import type { aufgabenC as De } from "../de/aufgabenC";

export const aufgabenC: typeof De = {
  /** Beschriftungen einzelner Braille-Zellen beim Schreiben (auch Lieder-Zeilen). */
  zellen: {
    oktavzeichenDer: (oktave: string): string => `o sinal de oitava da ${oktave}`,
    oktavzeichen: "o sinal de oitava",
    vorzeichen: "o acidente",
    verlaengerungspunkt: "O ponto de prolongamento - ponto 3",
    taktstrich: "Barra de compasso - a barra de espaço",
  },

  // --- Welt 7 „Parque da teoria" -------------------------------------------
  tonleitern: {
    spielNach:
      "Toque a escala de dó maior ascendente: dó ré mi fá sol lá si dó - no teclado D F G H J K L, depois oitava acima e de novo D.",
    spielNachErkl: "Oito graus de dó até o dó seguinte.",
    durMollFrage: "Ouça a escala - maior (claro) ou menor (escuro)?",
    durMollWahl: ["Maior", "Menor"],
    durMollErklMoll: "O terceiro grau está abaixado - menor natural.",
    durMollErklDur: "Escala maior pura.",
    fehlerFrage: "Nesta escala maior, UM som saiu do lugar. Qual grau estava errado?",
    fehlerWahl: ["Grau 3", "Grau 4", "Grau 5", "Grau 6", "Grau 7"],
    fehlerErkl: (stufe: number): string => `O ${stufe}º grau soou agudo demais.`,
    schreibe:
      "Escreva a escala de sol maior: sol lá si dó ré mi e depois fá sustenido - ou seja, um sustenido antes do fá (é o único acidente de sol maior).",
    schreibeErkl: "Sol maior tem um sustenido: o fá vira fá sustenido.",
  },

  quintenzirkel: {
    /** Vorzeichen-Wort je Art: Einzahl / Mehrzahl. */
    vz: {
      kreuz: { ein: "sustenido", mehr: "sustenidos" },
      be: { ein: "bemol", mehr: "bemóis" },
    },
    anzahlFrage: (name: string, mehr: string): string => `Estação: ${name}. Quantos ${mehr} tem esta tonalidade?`,
    anzahlErkl: (name: string, n: number, wort: string): string => `${name} tem ${n} ${wort}.`,
    nameFrage: (n: number, wort: string): string => `${n} ${wort} - qual é a tonalidade maior?`,
    nameErkl: (n: number, wort: string, name: string): string => `${n} ${wort}: é ${name}.`,
    lesenFrage: "Leia a armadura em braille - qual é a tonalidade?",
    lesenErkl: (name: string): string => `Esta armadura pertence a ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Leia o ritmo na pauta e bata-o com a barra de espaço - à primeira vista.",
    diktatFrage: (rhythm: boolean): string =>
      `Ditado de ritmo: eu bato um compasso no som sol. Escreva os valores que você ouvir${rhythm ? " (a linguagem do ritmo está ligada)" : ""}. A nota inicial é sol. Ouça quantas vezes quiser.`,
    diktatErkl: "Conte os tempos de cada som: semínima = um tempo, mínima = dois.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Ditado de melodia: a nota inicial é ${startton}. Ouça os ${anzahl} sons e escreva-os - eles andam por pequenos passos. Ouça quantas vezes quiser.`,
    erkl: "Compare som a som com a nota inicial: sobe ou desce?",
  },

  detektiv: {
    frage: "Leia a linha braille e ouça a gravação. Em qual ponto o som se afasta das notas?",
    note: (n: number): string => `Nota ${n}`,
    allesRichtig: "Tudo certo",
    erklRichtig: "Tudo batia - o som e as notas eram iguais.",
    erklAnders: (n: number): string => `A nota ${n} soou diferente do que está escrito.`,
  },

  baumeister: {
    dreiViertel: "Construa um compasso completo de 3/4: escreva notas e pausas com f d s j k l, até os tempos darem exatamente 3. Enter confere.",
    mitPause: "Construa um compasso de 4/4 com pelo menos UMA pausa. Enter confere.",
    mitNoten: "Construa um compasso de 4/4 com pelo menos TRÊS notas. Enter confere.",
    sechsAchtel: "Desafio: construa um compasso completo de 6/8 (seis tempos de colcheia). Enter confere.",
  },

  spielwiese: {
    frage:
      "Recreio sonoro: sobre o bordão suave você pode tocar livremente - com D F G J K (pentatônica). Nenhum som pode estar errado. Conte uma pequena história: primeiro baixinho, depois alto. A partir de 30 sons, a oficina fica visitada.",
  },

  kadenzen: {
    schlussFrage: "Dois acordes como final - soa terminado ou continua?",
    schlussWahl: ["Terminado - um final de verdade", "Aberto - continua"],
    schlussErklOffen: "Na dominante fica aberto - meia cadência.",
    schlussErklZu: "Da dominante de volta ao acorde fundamental - soa terminado (cadência perfeita).",
    artFrage: "Qual cadência é esta?",
    artWahl: ["Autêntica - da dominante (V) para o acorde fundamental", "Plagal - o final „Amém“ da subdominante (IV)"],
    artErklPlagal: "IV para I - o final suave „Amém“ (plagal).",
    artErklAuth: "V para I - o final forte, autêntico.",
    funktionFrage: "Qual função este acorde tem em dó maior?",
    funktionWahl: ["Tônica (grau I)", "Subdominante (grau IV)", "Dominante (grau V)"],
    funktionErkl: [
      "Tônica (T) - o acorde fundamental no grau I.",
      "Subdominante (S) - grau IV.",
      "Dominante (D) - grau V.",
    ],
  },

  komponier: {
    frage:
      "Oficina de composição: escreva livremente com f d s j k l, ouça a sua obra e salve-a (até 5). A oficina fica visitada assim que você salvar uma obra.",
  },

  // --- Welt 8 „Conheça os instrumentos" ------------------------------------
  fingersatz: {
    lesenFrage: "Leia a nota e a digitação: qual dedo deve tocar a nota? (A digitação fica DEPOIS da nota.)",
    lesenErkl: (finger: string): string => `O pequeno algarismo depois da nota é o ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Escreva a nota ${ton} e acrescente a digitação do ${finger} - ela fica DEPOIS da nota.`,
    fingerZelle: (finger: string): string => `${finger} - a digitação`,
    schreibenErkl: (finger: string): string => `O ${finger} recebe o seu algarismo logo depois da nota.`,
    positionFrage: "Onde fica a digitação - antes ou depois da nota?",
    positionWahl: ["Depois da nota", "Antes da nota"],
    positionErkl: "Ao contrário da articulação, a digitação fica DEPOIS da nota (antes de uma eventual ligadura de prolongamento).",
  },

  klavier: {
    /** Am Mac „Wahl + Q": der Code reicht den Text durch `altAnzeige`. */
    zweiFrage:
      "Duas linhas - em cima a mão direita (clave de sol), embaixo a mão esquerda (clave de fá). Quantos sons toca a mão ESQUERDA? Com Alt + Q você pode ver e ouvir uma mão sozinha em destaque.",
    zweiWahl: (n: number): string => `${n} sons`,
    zweiErkl: "Conte as cabeças das notas na linha de baixo - ou ouça a mão grave sozinha (Alt + Q).",
    handFrage: "Esta linha começa com um sinal de mão. Para qual mão ele é?",
    handWahl: ["Mão direita", "Mão esquerda"],
    handErklLinks: "Pontos 4, 5, 6 e depois 3, 4, 5: o sinal da mão esquerda.",
    handErklRechts: "Pontos 4, 6 e depois 3, 4, 5: o sinal da mão direita.",
    melodieFrage:
      "Duas mãos seguidas: uma toca a melodia (mais aguda, móvel), a outra acompanha mais grave. Qual foi a melodia?",
    melodieWahl: ["A voz tocada primeiro", "A segunda voz"],
    melodieErkl: "A melodia é a voz mais aguda e móvel - em geral a mão direita.",
    rechteHandFrage: (ton: string): string =>
      `Escreva o sinal da mão direita (pontos 4, 6 · 3, 4, 5) e depois a nota ${ton} com sinal de oitava.`,
    rechteHandZellen: ["mão direita, primeira célula - pontos 4, 6", "mão direita, segunda célula - pontos 3, 4, 5"],
    rechteHandErkl: "Depois do sinal de mão, a voz começa com um sinal de oitava.",
    pedalFrage: "Qual sinal de pedal é este - e ele fica antes ou depois da nota?",
    pedalWahl: ["Pedal pressionado - ANTES da nota", "Pedal solto - DEPOIS da nota"],
    pedalErklNieder: "Pedal pressionado (pontos 1, 2, 6 · 1, 4) fica antes da nota em que se começa a pisar.",
    pedalErklAuf: "Pedal solto (pontos 1, 6 · 1, 4) fica depois da nota em que se solta.",
  },

  gesang: {
    melismaFrage: "Na sílaba „lá“ - quantos sons a voz canta? (Vários sons numa só sílaba se chamam melisma.)",
    melismaWahl: ["Um som", "Dois sons", "Três sons"],
    melismaErkl: (n: number): string =>
      `A sílaba recebe ${n} sons - um melisma. Em braille, a ligadura de sílaba (pontos 1, 4) os junta.`,
    bogenFrage:
      "Uma sílaba em dois sons: escreva a primeira nota, a ligadura de sílaba (pontos 1, 4) e a segunda nota.",
    bogenZelle: "Ligadura de sílaba - pontos 1, 4",
    bogenErkl: "A ligadura de sílaba diz: os dois sons pertencem a uma só sílaba.",
    atemFrage: "Nesta linha há um sinal de respiração. Depois de qual som se respira?",
    atemWahl: ["Depois do primeiro som", "Depois do segundo som", "Depois do terceiro som"],
    atemErkl: "O meio sinal de respiração (pontos 3, 4, 5 · 2) fica logo depois do primeiro som.",
    zeilenFrage: "No canto alternam linhas de texto e linhas musicais. Qual prefixo anuncia uma linha de TEXTO?",
    zeilenWahl: ["Prefixo de texto (pontos 5, 6 · 2, 3)", "Prefixo musical (ponto 6 · 3)"],
    zeilenErkl: "A linha de texto tem o prefixo pontos 5, 6 · 2, 3; a linha musical, ponto 6 · ponto 3.",
  },

  gitarre: {
    saiteFrage:
      "O sinal de corda (pontos 1, 4, 6) e um algarismo dizem em qual corda se toca. Qual corda é esta?",
    saiteWahl: (s: number): string => `${s}ª corda`,
    saiteErkl: (s: number): string => `Sinal de corda mais o algarismo ${s}: a ${s}ª corda.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Escreva a indicação para a ${saite}ª corda e depois a nota ${ton}: primeiro o sinal de corda (pontos 1, 4, 6), depois o algarismo, depois a nota.`,
    saitenzeichenZelle: "Sinal de corda - pontos 1, 4, 6",
    ziffernZelle: (saite: number): string => `o algarismo ${saite} - a ${saite}ª corda`,
    schreibenErkl: "O sinal de corda fica antes da nota; em seguida NÃO vem sinal de oitava.",
    akkordSorten: { dur: "Tríade maior", moll: "Tríade menor", sept: "Acorde de sétima de dominante (7 em itálico)" },
    akkordFrage:
      "Ouça o acorde arpejado - que tipo é? (O círculo, o triângulo e o 7 em itálico são internacionais; os símbolos com letras, como „C7“, cada país escreve de um jeito um pouco diferente.)",
    akkordErkl: (sorte: string): string => `Era um ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "A nota do baixo tem um 6 como cifra. Qual harmonização soa certa - com sexta ou com quinta sobre o baixo?",
    aussetzungWahl: ["Terça e sexta sobre o baixo", "Terça e quinta sobre o baixo"],
    aussetzungErklSext: "Um 6 pede a sexta sobre o baixo - o acorde de sexta.",
    aussetzungErklQuint: "Sem cifra (ou 5/3), o acorde fundamental soa com a quinta.",
    stufeFrage: "O baixo cifrado pensa em graus. Qual grau principal você ouve aqui?",
    stufeWahl: ["Tônica (grau I)", "Subdominante (grau IV)", "Dominante (grau V)"],
    stufeErkl: [
      "Era a tônica (grau I) - a ponte da cadência para o baixo cifrado.",
      "Era a subdominante (grau IV) - a ponte da cadência para o baixo cifrado.",
      "Era a dominante (grau V) - a ponte da cadência para o baixo cifrado.",
    ],
    schreibenFrage:
      "Escreva uma nota de baixo com cifra: o dó e embaixo a cifra 6 (sinal numérico e o algarismo grave 6).",
    zahlzeichenZelle: "Sinal numérico - pontos 3, 4, 5, 6",
    ziffer6Zelle: "O algarismo grave 6 - pontos 2, 3, 5",
    schreibenErkl: "Os algarismos do baixo cifrado ficam atrás do sinal numérico como algarismos GRAVES.",
  },

  partitur: {
    auftakt: {
      frage: "Uma peça começa com uma anacruse. Qual número tem este primeiro compasso incompleto?",
      wahl: ["Compasso 0", "Compasso 1", "Compasso 2"],
      erkl: "A anacruse conta como compasso 0 - o primeiro compasso completo é então o compasso 1.",
    },
    taktzahl: {
      frage: "Assim é um número de compasso na margem (aqui: 16). Há antes dele um sinal numérico?",
      wahl: ["Não - os números de compasso ficam sem sinal numérico", "Sim - sempre com sinal numérico"],
      erkl: "Os números de compasso na margem ficam sem sinal numérico - só os próprios algarismos.",
    },
    format: {
      frage: "Como a partitura braille organiza duas mãos ou vozes, para que se possam comparar compasso a compasso?",
      wahl: ["Por seções, linha sobre linha (bar-over-bar)", "Tudo numa única linha comprida"],
      erkl: "No formato bar-over-bar, as vozes ficam por seções umas em cima das outras - compasso ao lado do compasso, legível.",
    },
    quellen: {
      frage: "Onde se conseguem edições prontas de partituras em braille para ler?",
      wahl: ["Em bibliotecas para cegos, como a Fundação Dorina Nowill", "Só copiando sozinho"],
      erkl: "Bibliotecas para cegos, como a Fundação Dorina Nowill (São Paulo), têm milhares de títulos em notação braille.",
    },
  },

  orchester: {
    /** Familien der Instrumente (angeschlagen / gezupft / geblasen). */
    familieKlavier: "Cordofones (percutidos)",
    familieGitarre: "Cordofones (dedilhados)",
    familieBlas: "Aerofones (soprados)",
    hoerenFrage: "Ouça o pequeno motivo - a qual família de instrumentos pertence este som?",
    hoerenWahl: ["Cordofones - dedilhados ou percutidos", "Aerofones - soprados", "Membranofones - batidos"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    /** Familie-Fragen: richtige Antwort und falsche (Reihenfolge wie im Code, fester Zufall). */
    fragen: [
      { frage: "A qual família pertence o tambor (segundo Hornbostel-Sachs)?", richtig: "Membranofones", falsch: ["Cordofones", "Aerofones"] },
      { frage: "A qual família pertence o violino?", richtig: "Cordofones", falsch: ["Aerofones", "Membranofones"] },
      { frage: "A qual família pertence a flauta doce?", richtig: "Aerofones", falsch: ["Membranofones", "Idiofones"] },
      { frage: "A qual família pertence o triângulo?", richtig: "Idiofones", falsch: ["Membranofones", "Cordofones"] },
    ],
    familieErkl: (richtig: string): string => `Certo: ${richtig}.`,
  },

  // --- Welt 9 „Palco das canções" ------------------------------------------
  lieder2: {
    dazuWahl: [
      "Ficou mais forte - um crescendo",
      "Os sons ficaram curtos - staccato",
      "Os sons fluíram suavemente uns para os outros - legato",
    ],
    dazuDynamikFrage: (titel: string): string => `„${titel}“ - primeiro seco, depois com expressão. O que foi acrescentado?`,
    dazuDynamikErkl: "A segunda versão ficou mais forte - um crescendo.",
    dazuStaccatoFrage: (titel: string): string => `„${titel}“ - o que foi acrescentado à versão seca?`,
    dazuStaccatoErkl: "Os sons ficaram curtos e secos - staccato.",
    dazuLegatoFrage: (titel: string): string => `„${titel}“ - o que foi acrescentado?`,
    dazuLegatoErkl: "Os sons foram suavemente ligados - legato, a ligadura de expressão.",
    articFrage: (titel: string): string => `„${titel}“ - tocado ligado (legato) ou curto (staccato)?`,
    articWahl: ["Ligado - legato", "Curto - staccato"],
    articErklLegato: "Os sons fluíram uns para os outros - legato.",
    articErklStaccato: "Cada som curto e destacado - staccato.",
  },

  lesekonzert: {
    frage:
      "Concerto de leitura: leia a linha braille (ela NÃO é tocada antes!), grave-a na memória e pressione „Lido“. Depois toque os sons de memória no teclado.",
    erkl: "Ler, memorizar, tocar - é exatamente assim que se lê música braille no instrumento.",
  },

  liederquiz: {
    hoerenFrage: "Ouça o começo - qual canção é esta?",
    hoerenErkl: (titel: string): string => `Era o começo de „${titel}“.`,
    lesenFrage: "Leia a linha inicial em braille - sem som! Qual canção você reconhece?",
    lesenErkl: (titel: string): string => `Esta linha é o começo de „${titel}“ - leitura silenciosa com o ouvido interno.`,
  },

  /** Lied-Zeile schreiben (auch Kapitel 14, Lieder-Werkstatt). */
  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, linha ${zeile}: primeiro ouça, depois escreva nota por nota - agora COM sinais de oitava.`,
  },
};
