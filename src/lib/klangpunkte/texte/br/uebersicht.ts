/**
 * Bereich `uebersicht` - Portugiesisch (br, Brasilien): die Shell (Kapitelwahl, Ansagen,
 * Distintivos, Mix do dia), das Menü der Akustik und die Turmatrix für Lehrkräfte.
 * Texte mit Zahlen/Namen sind Funktionen.
 */
import type { uebersicht as De } from "../de/uebersicht";

export const uebersicht: typeof De = {
  // --- Avisos e mensagens ---------------------------------------------------
  kapitelwahlAnsage: "Escolha de capítulos. Todos os capítulos podem ser escolhidos livremente - as estrelas mostram o seu progresso.",
  kapitelAnsage: (nr: number, welt: string, i: number, n: number, kapitel: string) =>
    `Mundo sonoro ${nr}, ${welt} - capítulo ${i} de ${n}: ${kapitel}.`,
  kapitelAnsageOhneWelt: (kapitel: string) => `Capítulo: ${kapitel}.`,
  neuesAbzeichen: (name: string) => `Novo distintivo: ${name}!`,
  neueAbzeichen: (namen: string[]) => `Novos distintivos: ${namen.join(", ")}!`,
  geschafftMitSternen: (sterne: number) => `Conseguiu! +30 XP · ${sterne} de 3 estrelas para este capítulo`,
  geschafft: "Conseguiu! +30 XP",
  zeichenlisteOffen: "Lista de sinais aberta.",
  zeichenlisteZu: "Lista de sinais fechada.",
  weltInArbeit: (nr: number, name: string) =>
    `O mundo sonoro ${nr}, ${name}, ainda está em preparação - chega numa etapa posterior.`,
  zeichenAreaLabel: "Klangpunkte",
  zeichenAreaBlurb: "Notas em braille: ouvir, sentir, escrever.",

  // --- Cabeçalho ------------------------------------------------------------
  rangCaption: "Nível",
  rangLabel: (level: number, rest: number) => `Nível ${level} - faltam ${rest} XP para o próximo.`,
  xpHinweis: (xp: number) => `${xp} XP - 2 por cada resposta certa, 30 por cada capítulo.`,
  xpText: (xp: number) => `${xp} XP`,
  sterneHinweis: (n: number, max: number) => `${n} de ${max} estrelas - até 3 por cada capítulo.`,
  weltName: (nr: number, titel: string) => `Mundo sonoro ${nr}: ${titel}`,
  weltKopf: (nr: number, titel: string, i: number, n: number) =>
    `Mundo sonoro ${nr}: ${titel} - capítulo ${i} de ${n}`,
  voriges: "Capítulo anterior",
  naechstes: "Próximo capítulo",
  kapitelSelect: "Escolher capítulo - com a seta para cima e para baixo para percorrer",
  kapitelOption: (i: number, titel: string, sterne: number | null) =>
    `Capítulo ${i}: ${titel}${sterne === null ? "" : ` - dominado, ${sterne} de 3 estrelas`}`,
  landkarte: (kapitel: number, welten: number) => `${kapitel} capítulos em ${welten} mundos sonoros - todos à escolha`,
  kapitelwahlKnopf: "Escolha de capítulos",
  kapitelwahlTitel: "Todos os mundos sonoros e capítulos com o seu número de estrelas (Alt + U)",
  zeichenlisteKnopf: "Lista de sinais",
  zeichenlisteTitel: "Lista de todos os sinais de notação, em ordem do seu caminho de aprendizagem (Alt + L)",

  // --- Escolha de capítulos -------------------------------------------------
  kapitelwahlUeberschrift: "Escolha de capítulos - escolha o que quer treinar",
  mixTitel: "Mix do dia",
  mixText: "Cinco minutos variados - tarefas de todos os seus capítulos dominados, sem estrelas, só para manter o treino.",
  loslegen: "Começar",
  mixZuWenig: (n: number) =>
    `Domine primeiro alguns capítulos (pelo menos 3) e depois aparece aqui o seu mix do dia. Até agora: ${n}.`,
  weltStand: (fertig: number, n: number, sterne: number, max: number) =>
    `${fertig} de ${n} capítulos dominados · ${sterne} de ${max} estrelas`,
  kapitelZeile: (i: number, titel: string) => `Capítulo ${i}: ${titel}`,
  werkeText: (n: number) => ` · ${n} de 5 obras`,
  besucht: "✓ visitado",
  srBesucht: "- visitado.",
  srNichtBesucht: "- ainda não visitado.",
  srGemeistert: (sterne: number) => `- dominado, ${sterne} de 3 estrelas.`,
  srNichtGemeistert: "- ainda não dominado.",

  // --- Galeria de distintivos -----------------------------------------------
  abzeichenTitel: "Distintivos",
  abzeichenStand: (verdient: number, alle: number) =>
    `${verdient} de ${alle} distintivos conquistados - junte estrelas, domine mundos, escreva ditados, construa compassos e toque canções de memória.`,
  geheimAbzeichen: "Distintivo secreto",
  geheimBeschreibung: "Ainda fechado - descubra!",
  srVerdient: "conquistado.",
  srGeheim: "secreto, ainda não conquistado.",
  srNichtVerdient: "ainda não conquistado.",

  // --- Mix do dia -----------------------------------------------------------
  mixIntro:
    "Mix do dia - uma rodada curta e variada de revisão por todos os seus capítulos dominados. Fique à vontade: aqui nada conta, não há estrelas.",
  mixStart: (n: number) => `Mix do dia começou - cinco minutos de revisão por ${n} capítulos dominados.`,
  mixEnde: (vomKind: boolean, richtig: number, gesamt: number) =>
    `${vomKind ? "Rodada encerrada." : "Tempo esgotado!"} Você resolveu ${richtig} de ${gesamt} ${gesamt === 1 ? "tarefa" : "tarefas"} corretamente.`,
  mixGeschafft: "Mix do dia concluído!",
  mixErgebnis: (richtig: number, gesamt: number) =>
    `${richtig} de ${gesamt} ${gesamt === 1 ? "tarefa" : "tarefas"} certas`,
  mixProzent: (pct: number) => ` · ${pct} %`,
  mixFein: "Boa revisão - o progresso ficou como estava.",
  nochEineRunde: "Mais uma rodada",
  zurKapitelwahl: "Voltar à escolha de capítulos",
  mixBunt: (n: number) => `Mistura variada de ${n} capítulos dominados`,
  mixTimer: (min: number, sek: number) => `Faltam ${min} minutos e ${sek} segundos`,
  mixRichtigLabel: (richtig: number, gesamt: number) => `${richtig} de ${gesamt} certas`,
  mixRichtig: "certas",
  beenden: "Encerrar",

  // --- Menu de acústica -----------------------------------------------------
  akustikMusik: "Música",
  akustikMusikErklaerung:
    "Os instrumentos tocam as notas das tarefas. Eles fazem parte da tarefa - por isso não há um botão para desligar, apenas o volume.",
  akustikInstrument: "Instrumento",
  akustikInstrumentErklaerung: "Com qual instrumento soam as notas. Depois da troca, o instrumento toca um dó como ensaio.",
  akustikLautstaerke: "Volume da música",
  akustikLautstaerkeErklaerung:
    "Quão alto tocam os instrumentos. 100 % é mais ou menos tão alto quanto a voz. Só a 0 % a música fica completamente silenciosa.",

  // --- Matriz de turmas (professores) ---------------------------------------
  matrixSterne: (n: number) => `${n} ${n === 1 ? "estrela" : "estrelas"}`,
  matrixLaedt: "carregando …",
  matrixKapitelImEinzelnen: "Capítulos em detalhe",
  matrixAufklappLabel: (name: string, offen: boolean) =>
    `Capítulos em detalhe: ${name} ${offen ? "recolher" : "expandir"}`,
  matrixAufklappTipp: (name: string) => `Capítulos de ${name} - cada capítulo com o número de estrelas.`,
  matrixWeltSr: (nr: number, titel: string, fertig: number, n: number, sterne: string) =>
    `Mundo sonoro ${nr}, ${titel}: ${fertig} de ${n} capítulos dominados, ${sterne}.`,
  matrixGesamtSr: (fertig: number, n: number, sterne: string) =>
    `Total: ${fertig} de ${n} capítulos dominados, ${sterne}.`,
  matrixRegion: (name: string) => `Capítulos em detalhe: ${name}`,
  matrixGemeistert: (sterne: string) => `dominado, ${sterne}`,
  matrixNichtGemeistert: "ainda não dominado",
  matrixTabelle: "Progresso da turma no Klangpunkte",
  matrixName: "Nome",
  matrixWeltKurz: (nr: number) => `M${nr}`,
  matrixWeltTitel: (nr: number, titel: string) => `Mundo sonoro ${nr}: ${titel}`,
  matrixWeltSpalteSr: (nr: number, titel: string) => `: Mundo sonoro ${nr}, ${titel}`,
  matrixGesamt: "Total",
  matrixZuletzt: "Última vez",
  matrixFuss:
    "Número por campo = capítulos dominados deste mundo sonoro. A seta antes do nome mostra cada capítulo com o número de estrelas. O professor vê exatamente o que a criança vê sobre si mesma - nem mais, nem menos.",
};
