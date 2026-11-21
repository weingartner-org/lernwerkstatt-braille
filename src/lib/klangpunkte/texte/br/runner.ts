/**
 * Bereich `runner` - Portugiesisch (br, Brasilien). Die Ansagen der Übungsfläche, der Notenzeile
 * und der Berührungseingabe. Aufgabentexte (`prompt`, `explain`) stehen in den Aufgaben-Bereichen.
 */
import type { runner as De } from "../de/runner";

export const runner: typeof De = {
  /** Kopfzeile der Übungsfläche: Anhören, Instrument, Namen, Rhythmussprache, Lied. */
  kopf: {
    anhoeren: "Ouvir",
    stopp: "Parar",
    anhoerenTitel: "Ouvir a tarefa (Alt + W também a fala em voz alta)",
    instrument: "Instrumento",
    namenKnopf: "dó-ré-mi",
    /** a = „do, re, mi", b = „c, d, e" (je Sprache aus den Tonnamen). */
    namenTitel: (a: string, b: string): string => `Nomes das notas como ${a} (solmização fixa) em vez de ${b}`,
    rhythmusKnopf: "ta ti-ti",
    rhythmusTitel: "Linguagem do ritmo: falar também ta, ti-ti depois dos valores das notas",
    anderesLied: "Outra canção",
    /** Ansagen beim Umschalten (a, b, c = die ersten drei Tonnamen der jeweiligen Schreibweise). */
    namenAn: (a: string, b: string, c: string): string => `Nomes das notas: ${a}, ${b}, ${c}.`,
    rhythmusAn: "Linguagem do ritmo ligada: ta, ti-ti.",
    rhythmusAus: "Linguagem do ritmo desligada.",
    zurueckLiedauswahl: "De volta à escolha de canções.",
  },

  /** Ansagen rund um die Aufgabe und das Vorspielen. */
  aufgabe: {
    liesBrailleZeile: "Leia a linha braille.",
    handNurKlavier: "A troca de mão só vale no capítulo de piano com duas linhas.",
    weiter: (prompt: string): string => `Vamos continuar. ${prompt}`,
    zeichenlisteHinweis: "Todos os sinais de notação desta etapa você encontra na lista de sinais: Alt e L.",
    songGanzGeschafft: (titel: string): string => `${titel} - tudo concluído!`,
    songZeile: (zeile: number, von: number): string => ` · Linha ${zeile} de ${von}`,
  },

  /** Ergebnis-Karte „Geschafft", Sterne und Fortschritt. */
  geschafft: {
    geschafft: "Conseguiu!",
    mitSternen: (n: number): string => `Conseguiu! ${n} de 3 estrelas.`,
    alsNaechstesAnsage: (titel: string): string => ` A seguir: ${titel}.`,
    alsNaechstesKarte: (titel: string): string => `A seguir: ${titel}`,
    weiterUeben: "Continuar treinando",
    weiter: "Próximo",
  },
  fortschritt: {
    caption: "Exercício",
    aria: (n: number, min: number, prozent: number): string =>
      `Progresso da etapa: ${n} de pelo menos ${min} tarefas, ${prozent} por cento feitos.`,
    rundeGeschafft: "Rodada concluída - a etapa está firme.",
    runde: (n: number, min: number, noch: number): string =>
      `Rodada: ${n} de pelo menos ${min} tarefas feitas` +
      (noch > 0 ? `, faltam pelo menos ${noch}.` : ", a etapa fica firme logo em seguida."),
  },

  /** Liedauswahl (Lieder-Werkstatt). */
  lieder: {
    kinder: "🧒 Canções infantis",
    erwachsene: "🎼 Clássicos e sucessos",
  },

  /** Hand-Fokus (Alt + Q) in der zweizeiligen Klavier-Ansicht. */
  hand: {
    /** Der Satz unter der Notenzeile, hinter der Tastenbeschriftung. */
    hinweis: (f: "both" | "rh" | "lh"): string =>
      " - ver uma mão sozinha em destaque e ouvi-la (" +
      (f === "rh"
        ? "agora: só a mão direita"
        : f === "lh"
          ? "agora: só a mão esquerda"
          : "agora: as duas mãos") +
      ")",
  },

  /** Antwort-Aufgaben (choice). */
  wahl: {
    richtig: "Certo!",
    richtigWaere: (antwort: string): string => `A resposta certa era: ${antwort}.`,
    antworten: "Responder (também com as teclas numéricas 1 a 4)",
  },

  /** Klopf-Aufgaben (tap). */
  tap: {
    aria: (n: number): string => `Bater o ritmo: barra de espaço. Até agora ${n} batidas.`,
    vor: "Bata aqui com a ",
    stark: "barra de espaço",
    nach: (n: number, von: number): string => ` - ${n} de ${von} batidas`,
    knopf: (n: number, von: number): string => `Bater (${n} de ${von})`,
    puls: "Ainda não está completamente regular - sinta a pulsação e mantenha-a calma.",
    kurz: "curto",
    lang: "longo",
    fast: (muster: string): string => `Quase! O padrão era: ${muster}. Escute de novo com atenção.`,
    genauImPuls: "Exatamente no pulso!",
    genauImTakt: "Exatamente no compasso!",
  },

  /** Nachspiel-Klaviatur (play) mit Lese-Konzert, Memory und Spielwiese. */
  spielen: {
    /** `namen` = „c d e f g a h" (je Sprache). */
    ariaKlaviatur: (namen: string): string =>
      `Teclado de eco: D F G H J K L são ${namen}. A seta para cima e para baixo muda a oitava. `,
    ariaFrei: (n: number, von: number): string => `Toque livremente sobre o bordão - ${n} de ${von} sons. `,
    ariaMemory: (laenge: number): string => `Comprimento atual: ${laenge} sons. `,
    ariaTon: (i: number, von: number): string => `Som ${i} de ${von}. `,
    ariaLesen:
      "Concerto de leitura: leia a linha braille. Pressione Enter ou „Lido“ quando a tiver na cabeça.",
    lesenVor: "Leia a linha em braille - ela será tocada ",
    lesenStark: "não",
    lesenMitte: " antes. Quando você a tiver na cabeça, ",
    lesenNach: " ou „Lido“.",
    fertigGelesen: "Lido",
    nachLesen: "Agora toque de memória - D F G H J K L, a seta muda a oitava.",
    freiVor: "Toque livremente com ",
    freiNach: (n: number, von: number): string => ` (pentatônica) - ${n} de ${von} sons · sobre o bordão de quinta`,
    nachspielenVor: "Toque em seguida com ",
    nachspielenMitte: " - ",
    laenge: (n: number): string => `Comprimento ${n}`,
    tonVon: (i: number, von: number): string => `Som ${i} de ${von}`,
    oktaveNach: (oktave: string): string => ` Oitava (${oktave})`,
    oktaveRauf: "Oitava acima",
    oktaveRunter: "Oitava abaixo",
    freiGeschafft: (n: number): string =>
      `Muito bem tocado - ${n} sons! A oficina está visitada. Com „Continuar treinando“ você segue tocando.`,
    falscherTon: (gespielt: string, gesucht: string): string => `Era ${gespielt} - o procurado é ${gesucht}.`,
    nichtsMehr: "nada mais",
    memoryWeiter: (n: number): string => `Conseguiu - ${n} sons! Agora vem mais um.`,
    memoryEnde: (best: number): string =>
      `Sequência encerrada - você conseguiu ${best} ${best === 1 ? "som" : "sons"} seguidos. Vou tocar a sequência de novo.`,
    genauRichtig: "Exatamente certo!",
    fertig: "Pronto.",
  },

  /** Schreib-Aufgaben (write) und Diktat. */
  schreiben: {
    aria: (zelle: number, von: number): string =>
      `Entrada braille: f d s e j k l são os pontos, a barra de espaço é a barra de compasso. Célula ${zelle} de ${von}. Manter a tecla Shift pressionada mostra e fala as teclas da célula.`,
    nochmalAnhoeren: "Ouvir de novo",
    diktat: "Ouça quantas vezes quiser - não conta como erro. Depois escreva célula por célula o que você ouviu.",
    vor: "Escreva com ",
    mitte: (zelle: number, von: number): string => ` - célula ${zelle} de ${von} · `,
    umschalt: "⇧ Shift",
    nach: " mostra a célula",
    taktstrichTitel: "Barra de compasso (barra de espaço)",
    gedrueckt: (punkte: string): string => `Pressionado: pontos ${punkte}`,
    aktuelleStelleLeertaste: "Posição atual: a barra de espaço - a barra de compasso.",
    genauRichtig: "Exatamente certo!",
    fertig: "Pronto.",
  },

  /** Takt-Baumeister (build). */
  takt: {
    aria: (n: number): string =>
      `Construtor de compassos: escreva com f d s j k l notas ou pausas; cada uma soa logo. A tecla Backspace apaga a última célula, Enter confere o compasso. Até agora ${n} células.`,
    vor: "Construa o compasso com ",
    mitte: " - cada nota ou pausa soa. ",
    loescht: " apaga, ",
    pruefen: (a: number, b: number): string => ` confere. Fórmula de compasso ${a}/${b}.`,
    nochLeer: "Ainda vazio - comece.",
    taktPruefen: "Conferir compasso (Enter)",
    loeschen: "Apagar (⌫)",
    pause: "Pausa",
    /** Nominativ der Zähl-Einheit („2 Schläge"); die Einheit kommt im Dativ („Schlägen"). */
    nominativ: (dativ: string): string => dativ,
    /** Eine Pause aus dem Notenwort bilden. Im Portugiesischen steht das Pausenwort fest in `tonnamen.ts`. */
    pauseAus: (_notenwort: string, pausenwort: string): string => pausenwort,
    keineZelle: "Isto não é uma célula de nota nem de pausa. Escolha uma nota (f d s j k l) ou uma pausa.",
    alsGelesen: (wert: string): string => ` - lida como ${wert}, porque ainda cabe`,
    zusammen: (label: string, ambi: string, summe: string, ganz: string, einheit: string): string =>
      `${label}${ambi}. Juntas ${summe} de ${ganz} ${einheit}.`,
    letzteGeloescht: (anzahl: string, einheit: string): string => `Última célula apagada. Agora: ${anzahl} ${einheit}.`,
    fehlen: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `Ainda ${einzahl ? "falta" : "faltam"} ${anzahl} ${einheit} até o compasso completo.`,
    zuViel: (einzahl: boolean, anzahl: string, einheit: string): string =>
      `${einzahl ? "É" : "São"} ${anzahl} ${einheit} a mais. Tire alguma coisa.`,
    mindestensNoten: (n: number): string => `O compasso está cheio, mas devem ser pelo menos ${n} notas.`,
    mindestensPause: "O compasso está cheio - mas deve haver pelo menos uma pausa.",
    voll: "Compasso completo! Ouça.",
    vollSauber: "Exatamente cheio - um compasso limpo! Ouça.",
  },

  /** Komponier-Werkstatt (sandbox). */
  werkstatt: {
    aria: (zellen: number, werke: number): string =>
      `Oficina de composição: escreva livremente com f d s j k l; a barra de espaço é a barra de compasso. Ouvir, apagar e guardar pelos botões. Até agora ${zellen} células, ${werke} de 5 obras guardadas.`,
    vor: "Escreva livremente com ",
    mitte: " - barra de espaço = barra de compasso, ",
    nach: " apaga a última célula.",
    leeresBlatt: "Folha em branco - componha à vontade.",
    anhoeren: "Ouvir",
    loeschen: "Apagar",
    nameFuerWerk: "Nome para a sua obra",
    speichern: "Salvar",
    nochNichtsGeschrieben: "Ainda nada escrito - escreva primeiro algumas notas.",
    geleert: "Oficina esvaziada.",
    schonFuenf: "Você já salvou cinco obras. Apague uma, e então volta a funcionar.",
    nochNichtsSpeichern: "Ainda nada para salvar.",
    meinWerk: (n: number): string => `Minha obra ${n}`,
    gespeichert: (name: string, n: number): string => `„${name}“ salva. Agora você tem ${n} de 5 obras.`,
    gespeicherteListe: (namen: string, n: number): string => `Salvas: ${namen} (${n} de 5)`,
  },

  /** Beschriftungen der Notenzeile (`NotenZeile.tsx`). */
  notenzeile: {
    handFokus: {
      rh: "Só a mão direita (em cima, clave de sol)",
      lh: "Só a mão esquerda (embaixo, clave de fá)",
      both: "As duas mãos",
    },
    rechteHand: "Mão direita · clave de sol",
    linkeHand: "Mão esquerda · clave de fá",
  },

  /** Eingabe per Berührung (`KlangpunkteTouchEingabe.tsx`). */
  touch: {
    gruppe: "Entrada por toque",
    anleitungVor: "Toque nos pontos da célula e depois em ",
    zelleSetzen: "Definir célula",
    anleitungNach: ".",
    punkteGruppe: "Os seis pontos de uma célula",
    punkt: (p: number): string => `Ponto ${p}`,
    taktstrich: "Barra de compasso",
    pause: "Pausa",
    letzteLoeschen: "Apagar a última célula",
    taktPruefen: "Conferir compasso",
    bsiTitel: "Entrada de tela braille do VoiceOver",
    bsiHinweis:
      "Coloque o rotor em entrada de tela braille e escreva as células neste campo. Deslizar para a direita com um dedo é a barra de compasso; para a esquerda, apaga a última célula.",
    testen: "Testar a entrada braille - o que chega?",
    nochNichts: "Ainda nada escrito.",
    verlauf: (text: string, codepoints: string, ergebnis: string): string => `„${text}“ (${codepoints}) → ${ergebnis}`,
    keineZelleErkannt: "nenhuma célula reconhecida",
    nochKeinPunkt: "Ainda não escolheu nenhum ponto. Toque primeiro nos pontos, depois em definir célula.",
    unbekannt: (zeichen: string): string =>
      `Não consigo ler o sinal ${zeichen} como pontos. Use os botões de ponto.`,
  },
};
