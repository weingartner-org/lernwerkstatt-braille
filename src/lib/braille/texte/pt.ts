/**
 * Punktgenau em português de Portugal - a interface (Bauplan 2026-11-06 §4, Schritt 3, Portugiesisch (Portugal)).
 *
 * ★ Dieselben Bereiche und Schlüssel wie `fr.ts` (der Typ `PgTexte` kommt von dort). Erzeugt aus EINER Vorlage für pt und br:
 *   die Stellen, an denen die Varianten sich unterscheiden (Anrede, Wortwahl), sind getrennt gesetzt.
 * ★ Anrede: Punktgenau ist für Kinder - „tu", wie Tastenflow auf pt (`typing/curriculumPt.ts`).
 *   Wo die Oberfläche auch Erwachsene anspricht („address" = "sie"), steht die Höflichkeitsform („o senhor / a senhora" wird vermieden:
 *   Befehlsform in der 3. Person, „Escreva").
 * ★ Schreibregeln: nur „-" (kein „—"), echte Akzente, Person zuerst, keine Maus-Wörter
 *   („prime / escolhe / ativa", nie „clica").
 * ★ Wörter wie die Norm (Grafia Braille 2018): „célula", „pontos 1-2-4", „etapa". Wortwahl Portugals, nicht Brasiliens.
 * ★ Nicht übersetzt (bleibt deutsch, im Sprach-Modus nicht erreichbar oder gesondert): Konto,
 *   Klassen, Lehrkraft, Statistik, Challenge, Klassenmatch, Abzeichen-Regal, Wochenaufgabe.
 */
import type { PgTexte } from "./index";

const adresse = (a: "du" | "sie", du: string, sie: string): string => (a === "du" ? du : sie);

const plural = (n: number, eins: string, mehr: string): string => (n > 1 ? mehr : eins);

export const pt: PgTexte = {
  /** Kopfzeile der Seite (`PunktgenauPage`). */
  kopf: {
    zeichenliste: "Lista de caracteres",
    zeichenlisteTipp: "Lista de todos os caracteres desta área (Alt + L)",
    logoBeschreibung:
      "O logótipo do Punktgenau: uma ficha vermelho-púrpura de cantos arredondados. Lá dentro, um grande P branco; na haste do P, três pontos azul-escuros um por baixo do outro, na curva um quarto - juntos, os pontos braille da letra p.",
    klangUndVorlesen: "Som e leitura em voz alta",
    klangTipp: (alt: string) => `Ajustar o som e a leitura em voz alta (${alt} liga ou desliga a leitura)`,
    titelHilfe: "Punktgenau - Ajuda",
    titelKurztasten: "Atalhos de teclado",
    vorlesenAn: "A leitura em voz alta está ligada.",
    vorlesenAnKurz: "Leitura em voz alta ligada.",
    vorlesenAus: "A leitura em voz alta está desligada.",
    vorlesenAusKurz: "Leitura em voz alta desligada.",
    macHinweis: "Alt + tecla - no Mac: tecla Option (⌥) + tecla.",
    screenreaderHinweis: (alt: string) =>
      `Já tens um leitor de ecrã (NVDA, VoiceOver)? Então deixa a leitura em voz alta (${alt}) desligada: o leitor de ecrã já lê todos os avisos.`,
  },

  /** Kopfleiste in `Punktgenau.tsx`: Rang, Etappe, Richtung. */
  leiste: {
    rang: "Nível geral",
    rangAria: (stufe: number, rest: number) => `Nível geral ${stufe} - faltam ${rest} XP para o seguinte.`,
    stufe: "Dificuldade",
    abzeichen: "Distintivos",
    heute: "Hoje",
    heuteGeuebt: (zeit: string) => `Praticado hoje: ${zeit}.`,
    richtung: "Sentido do exercício",
    schreiben: "Escrever",
    lesen: "Ler",
    schrift: "Escrita:",
    schriftWahl: "Escolher o sistema braille (área)",
    etappeZurueck: "Etapa anterior",
    etappeWeiter: "Etapa seguinte",
    etappeWahl: "Escolher um capítulo (etapa) - percorre com as setas para cima e para baixo",
    gemeistert: " - concluída",
    gesperrt: " - ainda bloqueada",
    etappeOption: (nr: number, titel: string, marke: string) => `Etapa ${nr}: ${titel}${marke}`,
    tipp: {
      rang: "Nível geral - até onde já chegaste no total. Sobe com os teus XP.",
      xp: "XP - 2 por cada exercício certo, 30 por cada etapa concluída.",
      sterne: "Estrelas - até 3 por etapa, conforme a segurança que ganhaste.",
      stufe: "Dificuldade - o grau dos exercícios agora. Adapta-se a ti, tu não a ajustas.",
      schreiben: "Escrever - recebes uma palavra e escreves em braille.",
      lesen: "Ler - recebes braille e escreves a palavra com letras normais.",
      schrift: "Escrita - o sistema braille que estás a praticar. Alt + 1 leva-te diretamente.",
      etappenListe: "Etapa - a parte que estás a praticar. Percorre-as com as setas para cima e para baixo.",
      etappeZurueck: "Uma etapa para trás",
      etappeWeiter: "Uma etapa para a frente",
      wochenaufgabe: "Tarefa da semana - o que o teu professor te pediu esta semana e como vais.",
      abzeichen: "Distintivos - as tuas medalhas ganhas e os teus próximos objetivos.",
      uebezeit: "Tempo praticado hoje. Conta a escrita e a leitura dos teus exercícios, não a espera entre um e outro.",
    },
    bereichAnsage: (label: string, nr: number, von: number, titel?: string) =>
      `${label}, etapa ${nr} de ${von}${titel ? `: ${titel}` : ""}.`,
    neuesAbzeichen: (name: string, beschreibung: string) => `Novo distintivo: ${name}. ${beschreibung}`,
    geschafft: (letzte: boolean) => `Certo! +30 XP${letzte ? " · área concluída!" : " · etapa seguinte aberta"}`,
    zeichenlisteAnsage: (auf: boolean) => (auf ? "Lista de caracteres aberta." : "Lista de caracteres fechada."),
    einstellungenAnsage: (auf: boolean) => (auf ? "Definições abertas." : "Definições fechadas."),
    abzeichenAnsage: (auf: boolean) => (auf ? "Distintivos abertos." : "Distintivos fechados."),
    kapitelAuswahlAnsage: "Escolha do capítulo. Com as setas para cima e para baixo percorre as etapas.",
    schreibenAnsage: "Escrever.",
    lesenAnsage: "Ler.",
    grossAnsage: (an: boolean) => (an ? "Sinal de maiúscula ligado." : "Sinal de maiúscula desligado."),
  },

  /** Übungsfläche (`BrailleTrainer.tsx`). */
  trainer: {
    rundeWort: "Série",
    pause: "Pausa - Alt+P para continuar",
    eingabefeld: "Campo de entrada braille",
    tasten: "Teclas:",
    tastenRegel: "prime todas ao mesmo tempo e solta. Quando a célula está certa, a seguinte vem sozinha.",
    altW: "Alt e W",
    leertaste: "Espaço",
    leertasteBedeutung: "espaço entre duas palavras",
    loeschen: "apagar a última célula",
    meineTasten: "As minhas teclas: os caracteres novos desta etapa",
    meineTastenKurz: "As minhas teclas:",
    schreibPrompt: (a: "du" | "sie") => adresse(a, "Escreve em braille:", "Escreva em braille:"),
    schreibHilfe:
      "Prime ao mesmo tempo as teclas f d s e j k l, e solta: isso dá uma célula. Quando a célula está certa, a seguinte vem sozinha. Barra de espaço para separar palavras, retrocesso para apagar. Mantém o Shift premido para ouvir a célula seguinte.",
    aktuelleStelleLeer: "Posição atual: espaço - a separação entre duas palavras.",
    aktuelleStelleAria: "posição atual: prime a barra de espaço",
    richtigesZeichenLabel: (punkte: string) => `caráter certo: ${punkte} - para repetir`,
    aktuelleZelle: "célula atual",
    aktuelleZelleKopf: (nr: number, von: number) => `Célula atual (${nr} de ${von}):`,
    lueckeKlammer: "(espaço)",
    richtigesZeichen: "É o caráter certo - escreve-o tu também.",
    geschafftWeiter: "Certo! Segue …",
    weiter: "Segue …",
    lesenAufgabe: "Lê e escreve a palavra.",
    frage: (a: "du" | "sie") =>
      adresse(a, "O que está escrito? Escreve com letras normais:", "O que está escrito? Escreva com letras normais:"),
    liesPrompt: (a: "du" | "sie") => adresse(a, "Lê o braille:", "Leia o braille:"),
    vorlageAria: "Modelo braille, célula a célula",
    vorlageHinweis: (altW: string) =>
      `O modelo braille está mesmo por cima do campo de entrada - lê-o célula a célula. ${altW} repete-o.`,
    richtigGelesenAria: (frage: string) => `Bem lido. ${frage}`,
    loesung: (a: "du" | "sie") => adresse(a, "A tua solução …", "A sua solução …"),
    pruefen: "Verificar",
    richtigGelesen: "Bem lido! Segue …",
    richtigWaere: "A resposta certa:",
    richtigWaereAria: (prompt: string) => `A resposta certa: ${prompt}. Outra vez`,
    nochmal: "Outra vez",
    runde: (gemeistert: boolean, geschafft: number, gesamt: number, rest: number) =>
      gemeistert
        ? "Série concluída - a etapa está concluída."
        : `Série: ${geschafft} exercícios certos de pelo menos ${gesamt}` +
          (rest > 0 ? `, faltam pelo menos ${rest}.` : ", a etapa fica concluída já a seguir."),
    stufeAria: (n: number, max: number, prozent: number) =>
      `Dificuldade ${n} de ${max} - adapta-se à tua segurança. Etapa dominada a ${prozent} por cento.`,
    geschafft: "Conseguido - já dominas!",
    sterne: (n: number) => `${n} ${plural(n, "estrela", "estrelas")} de 3`,
    zuverlaessig: (titel: string) => `${titel}: reconhecido com segurança.`,
    naechsteFrei: "A etapa seguinte está agora aberta.",
    weiterUeben: "Podes continuar a praticar.",
    geschafftAria1: "Conseguido, já dominas. Continuar a praticar",
    weiterUebenKnopf: "Continuar a praticar",
    geschafftAria2: "Conseguido, já dominas. Etapa seguinte",
    naechstesLevel: "Etapa seguinte →",
    neueZeichen: "Caracteres novos desta etapa",
    doppelpunkt: ":",
    // Texte (ganze Texte)
    textKopf: "Texto",
    textWort: (nr: number, von: number) => `Palavra ${nr} de ${von}`,
    textNr: (nr: number, von: number) => `Texto ${nr} de ${von}`,
    geschriebeneZellen: "Células escritas, célula a célula",
    textHilfe:
      "Prime ao mesmo tempo as teclas dos pontos e solta; entre duas palavras, a barra de espaço. Com o retrocesso podes corrigir - um erro conta na mesma.",
    textSchreiben: "Escrever o texto em braille",
    hierTippen: "Escreve aqui … Prime ao mesmo tempo as teclas dos pontos e solta.",
    textGeschafft: "Texto concluído!",
    textErgebnis: (fehler: number, zeit: string, zeichen: number) =>
      `${fehler === 0 ? "Sem erros" : `${fehler} ${plural(fehler, "erro", "erros")}`} · tempo ${zeit} · ${zeichen} caracteres`,
    textErgebnisSatz: (fehler: number) =>
      `Texto concluído. ${fehler === 0 ? "Sem erros" : `${fehler} ${plural(fehler, "erro", "erros")}`}.`,
    gleichenText: "Repetir o mesmo texto",
    naechsterTextOhnePfeil: "Texto seguinte",
    naechsterText: "Texto seguinte →",
    textLesenAufgabe: "Lê o texto e escreve-o.",
    allesRichtigSatz: "Tudo bem lido.",
    wortSatz: (richtig: number, von: number) => `${richtig} palavras certas de ${von}.`,
    wortSatzKurz: (richtig: number, von: number) => `${richtig} palavras certas de ${von}`,
    textLiesPrompt: (a: "du" | "sie") =>
      adresse(a, "Lê o texto todo e escreve-o com letras normais:", "Leia o texto todo e escreva com letras normais:"),
    textLoesung: (a: "du" | "sie") => adresse(a, "A tua solução (texto inteiro):", "A sua solução (texto inteiro):"),
    textPlatzhalter: "Escreve aqui o texto lido …",
    allesRichtig: "Tudo bem lido!",
  },

  /** Ansagen (`announce.ts`). */
  announce: {
    lesenAufgabe: "Lê e escreve a palavra.",
    und: "e",
    richtig: "Certo.",
    leertaste: "Barra de espaço.",
    /** Zusatz hinter den Punkten der Soll-Zelle (Fehler-Tipp). */
    unterschied: (fehlt: number[], zuViel: number[]): string => {
      const pos: Record<number, string> = {
        1: "em cima à esquerda", 2: "ao meio à esquerda", 3: "em baixo à esquerda",
        4: "em cima à direita", 5: "ao meio à direita", 6: "em baixo à direita",
        7: "mesmo em baixo à esquerda", 8: "mesmo em baixo à direita",
      };
      if (fehlt.length === 1 && zuViel.length === 0) return `. Falta o ponto ${fehlt[0]} - ${pos[fehlt[0]]}.`;
      if (zuViel.length === 1 && fehlt.length === 0) return `. Sobra o ponto ${zuViel[0]} - ${pos[zuViel[0]]}.`;
      const teile: string[] = [];
      if (fehlt.length) teile.push(fehlt.length === 1 ? `falta o ponto ${fehlt[0]}` : `faltam os pontos ${fehlt.join(", ")}`);
      if (zuViel.length) teile.push(zuViel.length === 1 ? `sobra o ponto ${zuViel[0]}` : `sobram os pontos ${zuViel.join(", ")}`);
      if (!teile.length) return "";
      const satz = teile.join(" e ");
      return `. ${satz.charAt(0).toUpperCase()}${satz.slice(1)}.`;
    },
    stern: (n: number) => `Mais uma estrela - ${n} de 3.`,
    schneller: "Estás a ficar mais rápido.",
    freischaltung: (titel: string) => `Muito bem! Abre-se uma porta nova: ${titel}.`,
    levelDone: (sterne: number, naechster?: string) =>
      `Conseguido! ${sterne} ${plural(sterne, "estrela", "estrelas")} de 3.` + (naechster ? ` A seguir: ${naechster}.` : ""),
    textDone: (fehler: number) => (fehler === 0 ? "Texto concluído. Sem erros." : `Texto concluído. ${fehler} ${plural(fehler, "erro", "erros")}.`),
    cellHint: (tasten: string, punkte: string) => `Célula atual: ${tasten}. ${punkte}.`,
    pause: "Pausa. Prime Alt e P para continuar.",
    keineNeuenZeichen: "Aqui não há caracteres novos.",
  },

  /** Hilfe-Fenster (kurz; die deutsche Hilfe erklärt das deutsche System). */
  hilfe: {
    tastaturTitel: "O teclado como máquina de escrever braille",
    tastaturText:
      "Seis teclas correspondem aos seis pontos de uma célula braille. Se premires várias teclas ao mesmo tempo, obténs um caráter:",
    punkteLinks: "pontos 1, 2, 3 (à esquerda)",
    punkteRechts: "pontos 4, 5, 6 (à direita)",
    leertasteAlsLuecke: "espaço",
    zeichenErklaerung: [
      { zeichen: "␣", bedeutung: "aqui há um espaço - prime a barra de espaço." },
      { zeichen: "·", bedeutung: "separa duas teclas ou duas indicações que andam juntas." },
      { zeichen: "⌫", bedeutung: "o retrocesso - apaga a última célula." },
      { zeichen: "→", bedeutung: "depois, ou: é isto que resulta." },
    ] as Array<{ zeichen: string; bedeutung: string }>,
    zeichenTitel: "Estes sinais aparecem no texto",
    warumTitel: "Para que serve uma linha braille?",
    warumText:
      "O braille é uma escrita tátil: lê-se com a ponta dos dedos, não com os olhos. No ecrã vês os pontos; isso ajuda a escrever e a reconhecer as formas. Mas o braille só se aprende a ler a sério quando se sentem os pontos. Uma linha braille faz subir pequenas hastes por baixo de cada célula e o caráter mostrado torna-se palpável. O Punktgenau consegue controlar uma linha ligada onde o navegador o permitir.",
    bereicheTitel: "Área e etapas",
    bereicheText:
      "Em cima, a área é «Grafia Braille»: cada letra escreve-se na sua própria célula, sem nenhuma abreviatura. As etapas seguem-se uma a uma: cada uma traz caracteres novos e só abre a seguinte quando está bem dominada.",
    reihenfolgeTitel: "Porquê esta ordem das letras?",
    reihenfolgeText:
      "As letras chegam por ordem de frequência em português: a, e, o, s, r, i, d, m, n, t … Assim aparecem palavras a sério muito cedo. As maiúsculas, a pontuação e os números vêm depois; as letras com cedilha, til e acentos chegam no fim das letras. As palavras de exercício vêm dos textos do Tastenflow em português.",
    normTitel: "Que norma?",
    normText:
      "Os caracteres seguem a Grafia Braille para a Língua Portuguesa, 3.ª edição, 2018 (Ministério da Educação do Brasil, elaborada com a Comissão de Braille de Portugal) - a mesma norma para Portugal e para o Brasil. Os números escrevem-se com o sinal de número (pontos 3-4-5-6) e as letras de a a j. Nesta versão não há abreviaturas.",
    kontoTitel: "Conta e progresso",
    kontoText: "Sem te registares, o teu progresso fica guardado neste dispositivo.",
    tastenkombinationen: "Atalhos de teclado",
  },

  /** Tastenkürzel (`ShortcutList`). */
  kurztasten: [
    ["Esc", "Fecha tudo o que estiver aberto - ajuda, atalhos, lista de caracteres - e o cursor volta sempre ao campo do exercício. Mesmo que nada esteja aberto, Esc leva-te de volta ao exercício"],
    ["Alt + 1", "Área «Grafia Braille»"],
    ["Alt + E", "Cursor no campo do exercício (o mesmo destino que Esc, sem fechar nada)"],
    ["Alt + U", "Ir para a escolha do capítulo - depois percorrer com ↑ ↓"],
    ["Alt + W", "Repetir o exercício"],
    ["Shift, duas vezes seguidas", "Repetir o exercício, como Alt + W"],
    ["Alt + M", "Ir para «As minhas teclas» (caracteres novos desta etapa)"],
    ["Alt + Z", "Anunciar a série: quantos exercícios estão certos e quantos faltam - Esc volta ao campo de entrada"],
    ["Alt + L", "Lista de caracteres: abrir / fechar todos os caracteres da área"],
    ["Alt + O", "Definições: abrir / fechar"],
    ["Alt + P", "Pausa ligada / desligada - no Klassenmatch: dizer todos os lugares"],
    ["Alt + V", "Leitura em voz alta ligada / desligada"],
    ["Alt + K", "Cores e contraste: abrir / fechar"],
    ["Alt + J", "A minha conta: abrir / fechar"],
    ["Alt + H", "Ajuda: abrir / fechar"],
    ["Alt + T", "Lista de atalhos: abrir / fechar"],
    ["Alt + +", "Zona de exercício maior"],
    ["Alt + −", "Zona de exercício menor"],
    ["Alt + 0", "Tamanho normal (voltar a 100 %)"],
    ["⇧ Shift", "Mantido premido: mostra e diz as teclas da célula atual"],
  ] as Array<[string, string]>,

  /** Zeichenliste (`BrailleZeichenliste.tsx`). */
  zeichenliste: {
    leereZelle: "célula vazia",
    ansage: (bereich: string, nr?: number, titel?: string) =>
      `Lista de caracteres ${bereich} aberta.` + (titel ? ` Estás na etapa ${nr}: ${titel}.` : ""),
    titel: (bereich: string) => `Todos os caracteres - ${bereich}`,
    einfuehrung:
      "A lista segue exatamente o teu percurso: etapa a etapa, pela ordem em que os caracteres chegam. Estás na etapa que praticas neste momento.",
    suchen: "Procurar um caráter:",
    platzhalter: "p. ex. ç, ã, ou pontos como 1, 4",
    keineTreffer: "Nenhum resultado.",
    einTreffer: "1 resultado.",
    treffer: (n: number) => `${n} resultados.`,
    etappe: (nr: number, titel: string, aktuell: boolean, fertig: boolean) =>
      `Etapa ${nr}: ${titel}${aktuell ? " - estás aqui" : fertig ? " - concluída" : ""}`,
    laedt: "A carregar os pontos …",
    keineEigenen: "Esta área não introduz caracteres próprios.",
  },

  /** Einstellungen (`PunktgenauEinstellungen.tsx`). */
  einstellungen: {
    titel: "Definições - Punktgenau",
    zurueck: "Voltar ao exercício",
    grossTitel: "Sinal de maiúscula",
    grossHinweis:
      "Antes de cada maiúscula há uma célula de aviso (pontos 4-6). Podes desligá-la e voltar a ligá-la mais tarde.",
    grossAn: "Sinal de maiúscula ligado",
    grossAus: "Sinal de maiúscula desligado",
    klasse: (an: boolean) =>
      `O teu professor ajusta isto para a turma. O sinal de maiúscula está agora ${an ? "ligado" : "desligado"}.`,
    klangTitel: "Som e leitura em voz alta",
    klangText: (alt: string) =>
      `A leitura em voz alta, a velocidade, a voz, a ajuda em caso de erro, os sons e o volume ajustam-se no menu por baixo do altifalante, no cabeçalho. ${alt} liga ou desliga diretamente a leitura em voz alta.`,
  },

  /** Meine Verwechslungen (`PunktgenauPage`, `BrailleConfusionPanel.tsx`). Merktipps nur für die Buchstaben;
   *  die deutschen Kurzschrift-Tipps (un/und, ei/ie …) gibt es hier nicht. */
  verwechslungen: {
    knopfZeigen: "▼ Mostrar as minhas confusões",
    knopfAusblenden: "▲ Ocultar as minhas confusões",
    laedt: "A carregar as confusões …",
    leerLehrkraft: "Ainda não há confusões registadas.",
    leerKind: "Ainda não confundiste nenhum carácter. Muito bem!",
    listeName: "As minhas confusões",
    zeile: (prozent: number, mit: string) => `${prozent} % de erros, confundido com ${mit}.`,
    tipp: "Dica:",
    tabelleName: "Matriz de confusões",
    tabelleBeschreibung: "Matriz de confusões: carácter certo, percentagem de erros e confusões mais frequentes",
    spalteSoll: "Carácter certo",
    spalteQuote: "Percentagem de erros",
    spalteMit: "Confundido com",
    spalteTipp: "Dica",
    merktipps: {
      "d|f": "d e f têm os dois os pontos 1 e 4 - d tem ainda o ponto 5 (à direita), f o ponto 2 (à esquerda).",
      "e|i": "e está em cima (pontos 1·5), i está mais abaixo (pontos 2·4).",
      "r|w": "r são os pontos 1·2·3·5, w os pontos 2·4·5·6 - w é a diferente, mesmo no fim.",
      "m|u": "m está em cima (pontos 1·3·4), u está em baixo (pontos 1·3·6).",
      "h|j": "h são os pontos 1·2·5, j os pontos 2·4·5 - j escorrega para a direita.",
      "n|z": "n são os pontos 1·3·4·5, z os pontos 1·3·5·6.",
    },
  },
};
