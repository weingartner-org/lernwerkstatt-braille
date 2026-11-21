/**
 * Bereich `aufgabenC` - Portugiesisch (pt, Portugal): Aufgabentexte der Welten 7 (Parque da teoria),
 * 8 (Conhece os instrumentos) und 9 (Palco das canções) aus `etappen.ts`.
 * Reihenfolge der Auswahllisten = Reihenfolge im Code (fester Zufall).
 */
import type { aufgabenC as De } from "../de/aufgabenC";

export const aufgabenC: typeof De = {
  /** Beschriftungen einzelner Braille-Zellen beim Schreiben (auch Lieder-Zeilen). */
  zellen: {
    oktavzeichenDer: (oktave: string): string => `o sinal de oitava da ${oktave}`,
    oktavzeichen: "o sinal de oitava",
    vorzeichen: "o acidente",
    verlaengerungspunkt: "O ponto de prolongação - ponto 3",
    taktstrich: "Barra de compasso - a barra de espaço",
  },

  // --- Welt 7 „Parque da teoria" -------------------------------------------
  tonleitern: {
    spielNach:
      "Toca a escala de dó maior ascendente: dó ré mi fá sol lá si dó - no teclado D F G H J K L, depois oitava acima e outra vez D.",
    spielNachErkl: "Oito graus de dó até ao dó seguinte.",
    durMollFrage: "Ouve a escala - maior (claro) ou menor (escuro)?",
    durMollWahl: ["Maior", "Menor"],
    durMollErklMoll: "O terceiro grau está abaixado - menor natural.",
    durMollErklDur: "Escala maior pura.",
    fehlerFrage: "Nesta escala maior, UM som saiu do lugar. Qual grau estava errado?",
    fehlerWahl: ["Grau 3", "Grau 4", "Grau 5", "Grau 6", "Grau 7"],
    fehlerErkl: (stufe: number): string => `O ${stufe}.º grau soava alto demais.`,
    schreibe:
      "Escreve a escala de sol maior: sol lá si dó ré mi depois fá sustenido - ou seja, um sustenido antes do fá (é o único acidente de sol maior).",
    schreibeErkl: "Sol maior tem um sustenido: o fá passa a fá sustenido.",
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
    lesenFrage: "Lê a armadura em braille - qual é a tonalidade?",
    lesenErkl: (name: string): string => `Esta armadura pertence a ${name}.`,
  },

  rhythmusdiktat: {
    blattFrage: "Lê o ritmo na pauta e bate-o com a barra de espaço - à primeira vista.",
    diktatFrage: (rhythm: boolean): string =>
      `Ditado de ritmo: eu bato um compasso no som sol. Escreve os valores que ouves${rhythm ? " (a linguagem do ritmo está ligada)" : ""}. A nota inicial é sol. Ouve quantas vezes quiseres.`,
    diktatErkl: "Conta os tempos de cada som: semínima = um tempo, mínima = dois.",
  },

  melodiediktat: {
    frage: (startton: string, anzahl: number): string =>
      `Ditado de melodia: a nota inicial é ${startton}. Ouve os ${anzahl} sons e escreve-os - andam por pequenos passos. Ouve quantas vezes quiseres.`,
    erkl: "Compara som a som com a nota inicial: sobe ou desce?",
  },

  detektiv: {
    frage: "Lê a linha braille e ouve a gravação. Em que ponto o som se afasta das notas?",
    note: (n: number): string => `Nota ${n}`,
    allesRichtig: "Tudo certo",
    erklRichtig: "Tudo batia certo - o som e as notas eram iguais.",
    erklAnders: (n: number): string => `A nota ${n} soou diferente do que está escrito.`,
  },

  baumeister: {
    dreiViertel: "Constrói um compasso completo de 3/4: escreve notas e pausas com f d s j k l até os tempos darem exatamente 3. Enter verifica.",
    mitPause: "Constrói um compasso de 4/4 com pelo menos UMA pausa. Enter verifica.",
    mitNoten: "Constrói um compasso de 4/4 com pelo menos TRÊS notas. Enter verifica.",
    sechsAchtel: "Desafio: constrói um compasso completo de 6/8 (seis tempos de colcheia). Enter verifica.",
  },

  spielwiese: {
    frage:
      "Recreio sonoro: sobre o bordão suave podes tocar livremente - com D F G J K (pentatónica). Nenhum som pode estar errado. Conta uma pequena história: primeiro baixinho, depois alto. A partir de 30 sons, a oficina fica visitada.",
  },

  kadenzen: {
    schlussFrage: "Dois acordes como final - soa acabado ou continua?",
    schlussWahl: ["Acabado - um final verdadeiro", "Aberto - continua"],
    schlussErklOffen: "Na dominante (V) fica aberto - meia cadência.",
    schlussErklZu: "Da dominante de volta ao acorde fundamental - soa acabado (cadência perfeita).",
    artFrage: "Que cadência é esta?",
    artWahl: ["Autêntica - da dominante (V) para o acorde fundamental", "Plagal - o final „Amém“ da subdominante (IV)"],
    artErklPlagal: "IV para I - o final suave „Amém“ (plagal).",
    artErklAuth: "V para I - o final forte, autêntico.",
    funktionFrage: "Que função tem este acorde em dó maior?",
    funktionWahl: ["Tónica (grau I)", "Subdominante (grau IV)", "Dominante (grau V)"],
    funktionErkl: [
      "Tónica (T) - o acorde fundamental no grau I.",
      "Subdominante (S) - grau IV.",
      "Dominante (D) - grau V.",
    ],
  },

  komponier: {
    frage:
      "Oficina de composição: escreve livremente com f d s j k l, ouve a tua obra e guarda-a (até 5). A oficina fica visitada assim que guardares uma obra.",
  },

  // --- Welt 8 „Conhece os instrumentos" ------------------------------------
  fingersatz: {
    lesenFrage: "Lê a nota e a digitação: que dedo deve tocar a nota? (A digitação está DEPOIS da nota.)",
    lesenErkl: (finger: string): string => `O pequeno algarismo depois da nota é o ${finger}.`,
    schreibenFrage: (ton: string, finger: string): string =>
      `Escreve a nota ${ton} e acrescenta a digitação do ${finger} - fica DEPOIS da nota.`,
    fingerZelle: (finger: string): string => `${finger} - a digitação`,
    schreibenErkl: (finger: string): string => `O ${finger} recebe o seu algarismo logo a seguir à nota.`,
    positionFrage: "Onde fica a digitação - antes ou depois da nota?",
    positionWahl: ["Depois da nota", "Antes da nota"],
    positionErkl: "Ao contrário da articulação, a digitação fica DEPOIS da nota (antes de uma eventual ligadura de prolongamento).",
  },

  klavier: {
    /** Am Mac „Wahl + Q": der Code reicht den Text durch `altAnzeige`. */
    zweiFrage:
      "Duas linhas - em cima a mão direita (clave de sol), em baixo a mão esquerda (clave de fá). Quantos sons toca a mão ESQUERDA? Com Alt + Q podes ver e ouvir uma mão sozinha em grande.",
    zweiWahl: (n: number): string => `${n} sons`,
    zweiErkl: "Conta as cabeças das notas na linha de baixo - ou ouve a mão grave sozinha (Alt + Q).",
    handFrage: "Esta linha começa com um sinal de mão. Para que mão é?",
    handWahl: ["Mão direita", "Mão esquerda"],
    handErklLinks: "Pontos 4, 5, 6 e depois 3, 4, 5: o sinal da mão esquerda.",
    handErklRechts: "Pontos 4, 6 e depois 3, 4, 5: o sinal da mão direita.",
    melodieFrage:
      "Duas mãos seguidas: uma toca a melodia (mais aguda, móvel), a outra acompanha mais grave. Qual foi a melodia?",
    melodieWahl: ["A voz tocada primeiro", "A segunda voz"],
    melodieErkl: "A melodia é a voz mais aguda e móvel - em geral a mão direita.",
    rechteHandFrage: (ton: string): string =>
      `Escreve o sinal da mão direita (pontos 4, 6 · 3, 4, 5) e depois a nota ${ton} com sinal de oitava.`,
    rechteHandZellen: ["mão direita, primeira célula - pontos 4, 6", "mão direita, segunda célula - pontos 3, 4, 5"],
    rechteHandErkl: "Depois do sinal de mão, a voz começa com um sinal de oitava.",
    pedalFrage: "Que sinal de pedal é este - e fica antes ou depois da nota?",
    pedalWahl: ["Pedal em baixo - ANTES da nota", "Pedal levantado - DEPOIS da nota"],
    pedalErklNieder: "Pedal em baixo (pontos 1, 2, 6 · 1, 4) fica antes da nota em que se começa a pisar.",
    pedalErklAuf: "Pedal levantado (pontos 1, 6 · 1, 4) fica depois da nota em que se solta.",
  },

  gesang: {
    melismaFrage: "Na sílaba „lá“ - quantos sons canta a voz? (Vários sons numa só sílaba chamam-se melisma.)",
    melismaWahl: ["Um som", "Dois sons", "Três sons"],
    melismaErkl: (n: number): string =>
      `A sílaba recebe ${n} sons - um melisma. Em braille, a ligadura de sílaba (pontos 1, 4) junta-os.`,
    bogenFrage:
      "Uma sílaba em dois sons: escreve a primeira nota, a ligadura de sílaba (pontos 1, 4) e a segunda nota.",
    bogenZelle: "Ligadura de sílaba - pontos 1, 4",
    bogenErkl: "A ligadura de sílaba diz: os dois sons pertencem a uma só sílaba.",
    atemFrage: "Nesta linha há um sinal de respiração. Depois de que som se respira?",
    atemWahl: ["Depois do primeiro som", "Depois do segundo som", "Depois do terceiro som"],
    atemErkl: "O meio sinal de respiração (pontos 3, 4, 5 · 2) fica logo depois do primeiro som.",
    zeilenFrage: "No canto alternam linhas de texto e linhas musicais. Que prefixo anuncia uma linha de TEXTO?",
    zeilenWahl: ["Prefixo de texto (pontos 5, 6 · 2, 3)", "Prefixo musical (ponto 6 · 3)"],
    zeilenErkl: "A linha de texto tem o prefixo pontos 5, 6 · 2, 3; a linha musical, ponto 6 · ponto 3.",
  },

  gitarre: {
    saiteFrage:
      "O sinal de corda (pontos 1, 4, 6) e um algarismo dizem em que corda se toca. Que corda é esta?",
    saiteWahl: (s: number): string => `${s}.ª corda`,
    saiteErkl: (s: number): string => `Sinal de corda mais o algarismo ${s}: a ${s}.ª corda.`,
    schreibenFrage: (saite: number, ton: string): string =>
      `Escreve a indicação para a ${saite}.ª corda e depois a nota ${ton}: primeiro o sinal de corda (pontos 1, 4, 6), depois o algarismo, depois a nota.`,
    saitenzeichenZelle: "Sinal de corda - pontos 1, 4, 6",
    ziffernZelle: (saite: number): string => `o algarismo ${saite} - a ${saite}.ª corda`,
    schreibenErkl: "O sinal de corda fica antes da nota; a seguir NÃO vem sinal de oitava.",
    akkordSorten: { dur: "Tríade maior", moll: "Tríade menor", sept: "Acorde de sétima de dominante (7 em itálico)" },
    akkordFrage:
      "Ouve o acorde arpejado - que tipo é? (O círculo, o triângulo e o 7 em itálico são internacionais; os símbolos com letras, como „C7“, cada país os escreve de maneira um pouco diferente.)",
    akkordErkl: (sorte: string): string => `Era uma ${sorte}.`,
  },

  generalbass: {
    aussetzungFrage:
      "A nota do baixo tem um 6 como cifra. Que harmonização soa certa - com sexta ou com quinta sobre o baixo?",
    aussetzungWahl: ["Terceira e sexta sobre o baixo", "Terceira e quinta sobre o baixo"],
    aussetzungErklSext: "Um 6 pede a sexta sobre o baixo - o acorde de sexta.",
    aussetzungErklQuint: "Sem cifra (ou 5/3), o acorde fundamental soa com a quinta.",
    stufeFrage: "O baixo cifrado pensa em graus. Que grau principal ouves aqui?",
    stufeWahl: ["Tónica (grau I)", "Subdominante (grau IV)", "Dominante (grau V)"],
    stufeErkl: [
      "Era a tónica (grau I) - a ponte da cadência para o baixo cifrado.",
      "Era a subdominante (grau IV) - a ponte da cadência para o baixo cifrado.",
      "Era a dominante (grau V) - a ponte da cadência para o baixo cifrado.",
    ],
    schreibenFrage:
      "Escreve uma nota de baixo com cifra: o dó e por baixo a cifra 6 (sinal numérico e o algarismo grave 6).",
    zahlzeichenZelle: "Sinal numérico - pontos 3, 4, 5, 6",
    ziffer6Zelle: "O algarismo grave 6 - pontos 2, 3, 5",
    schreibenErkl: "Os algarismos do baixo cifrado ficam atrás do sinal numérico como algarismos GRAVES.",
  },

  partitur: {
    auftakt: {
      frage: "Uma peça começa com uma anacruse. Que número tem este primeiro compasso incompleto?",
      wahl: ["Compasso 0", "Compasso 1", "Compasso 2"],
      erkl: "A anacruse conta como compasso 0 - o primeiro compasso completo é então o compasso 1.",
    },
    taktzahl: {
      frage: "Assim é um número de compasso na margem (aqui: 16). Há antes dele um sinal numérico?",
      wahl: ["Não - os números de compasso ficam sem sinal numérico", "Sim - sempre com sinal numérico"],
      erkl: "Os números de compasso na margem ficam sem sinal numérico - só os próprios algarismos.",
    },
    format: {
      frage: "Como dispõe a partitura braille duas mãos ou vozes, para se poderem comparar compasso a compasso?",
      wahl: ["Por secções, linha sobre linha (bar-over-bar)", "Tudo numa única linha comprida"],
      erkl: "No formato bar-over-bar, as vozes ficam por secções umas por cima das outras - compasso ao lado do compasso, legível.",
    },
    quellen: {
      frage: "Onde se obtêm edições prontas de partituras em braille para ler?",
      wahl: ["Em bibliotecas para cegos como a ONCE ou a Fundação Louis Braille", "Só copiando sozinho"],
      erkl: "Bibliotecas como a ONCE (Espanha) e a Biblioteca para cegos em Portugal têm milhares de títulos em notação braille.",
    },
  },

  orchester: {
    /** Familien der Instrumente (angeschlagen / gezupft / geblasen). */
    familieKlavier: "Cordofones (percutidos)",
    familieGitarre: "Cordofones (dedilhados)",
    familieBlas: "Aerofones (soprados)",
    hoerenFrage: "Ouve o pequeno motivo - a que família de instrumentos pertence este som?",
    hoerenWahl: ["Cordofones - dedilhados ou percutidos", "Aerofones - soprados", "Membranofones - batidos"],
    hoerenErkl: (instrument: string, familie: string): string => `${instrument}: ${familie}.`,
    /** Familie-Fragen: richtige Antwort und falsche (Reihenfolge wie im Code, fester Zufall). */
    fragen: [
      { frage: "A que família pertence o tambor (segundo Hornbostel-Sachs)?", richtig: "Membranofones", falsch: ["Cordofones", "Aerofones"] },
      { frage: "A que família pertence o violino?", richtig: "Cordofones", falsch: ["Aerofones", "Membranofones"] },
      { frage: "A que família pertence a flauta de bisel?", richtig: "Aerofones", falsch: ["Membranofones", "Idiofones"] },
      { frage: "A que família pertence o triângulo?", richtig: "Idiofones", falsch: ["Membranofones", "Cordofones"] },
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
      "Concerto de leitura: lê a linha braille (NÃO é tocada antes!), grava-a na memória e prime „Lido“. Depois toca os sons de memória no teclado.",
    erkl: "Ler, memorizar, tocar - é exatamente assim que se lê música braille no instrumento.",
  },

  liederquiz: {
    hoerenFrage: "Ouve o início - que canção é esta?",
    hoerenErkl: (titel: string): string => `Era o início de „${titel}“.`,
    lesenFrage: "Lê a linha inicial em braille - sem som! Que canção reconheces?",
    lesenErkl: (titel: string): string => `Esta linha é o início de „${titel}“ - leitura silenciosa com o ouvido interior.`,
  },

  /** Lied-Zeile schreiben (auch Kapitel 14, Lieder-Werkstatt). */
  liedZeile: {
    frage: (titel: string, zeile: number): string =>
      `${titel}, linha ${zeile}: primeiro ouve, depois escreve nota a nota - agora COM sinais de oitava.`,
  },
};
