/**
 * Bereich `kapitel` - Portugiesisch (pt, Portugal). Titel, Einführungen und Beschriftungen der
 * Kapitel (`KLANG_ETAPPEN`). `introDu` spricht das Kind mit „tu" an, `introSie` ist der Text für
 * Lehrkräfte (unpersönlich, Quellenangaben wie im Bestand).
 */
import type { kapitel as De } from "../de/kapitel";

export const kapitel: typeof De = {
  /** „c als Achtelnote" - Einheit aus Ton und Notenwert. */
  noteSatz: (ton: string, wert: string): string => `${ton} como ${wert}`,
  noteWert: {
    achtel: "colcheia",
    viertel: "semínima",
    halbe: "mínima",
    ganze: "semibreve",
    sechzehntel: "semicolcheia (mesma célula que a semibreve)",
  },
  kap: {
    "kp1": {
      titel: "Agudo ou grave? - Ouvidos atentos",
      introDu: "Antes de sentir notas, vamos treinar o mais importante: ouvir com atenção. Mais alto ou mais baixo, para cima ou para baixo - o teu ouvido decide.",
      introSie: "Prontidão musical antes da escrita (Taesch, Phase One): discriminação auditiva de altura e direção como base da leitura de notas.",
      einheiten: {},
    },
    "kp2": {
      titel: "Bate o ritmo",
      introDu: "A música tem um batimento cardíaco. Ouve o padrão de sons longos e curtos e bate-o com a barra de espaço.",
      introSie: "Reprodução rítmica antes do plano simbólico (RNIB: uma mão lê, a outra bate - aqui como forma preparatória com a barra de espaço).",
      einheiten: {},
    },
    "kp3": {
      titel: "As notas são velhas conhecidas",
      introDu: "Surpresa: as notas já as conheces! dó ré mi fá sol lá si são as letras braille d e f g h i j - o alfabeto, avançado um passo. A forma básica é a colcheia.",
      introSie: "Núcleo da analogia de décadas (Workshop Schmid/BBI): alturas c-h = letras d-j; a forma de colcheia como forma básica de sinais (Krolick, §1-1).",
      einheiten: {},
    },
    "kp4": {
      titel: "Primeiras melodias",
      introDu: "Agora é que é música: pequenas melodias com as tuas novas notas - ouvir, acompanhar com o dedo, escrever de novo. Cada nota certa soa!",
      introSie: "Significado precoce: motivos curtos em vez de sinais isolados (princípio de Hadley: áudio em cada exercício).",
      einheiten: {},
    },
    "kp5": {
      titel: "Semínimas - acrescenta o ponto 6",
      introDu: "O truque dos valores: para uma semínima basta acrescentar o ponto 6 - tal como no alfabeto de a a j surge a série seguinte. Mesma nota, som mais longo.",
      introSie: "Valores de nota pela mecânica das décadas (ponto 6 = semínima), De Garmo, cap. 3.",
      einheiten: {},
    },
    "kp6": {
      titel: "Mínimas e semibreves",
      introDu: "O ponto 3 acrescentado = mínima. Os pontos 3 E 6 = semibreve. Assim conheces os quatro valores básicos - e ouves como soam de duração diferente.",
      introSie: "Completar os graus de valor (De Garmo, cap. 4-5): mínima (+3), semibreve (+3+6).",
      einheiten: {},
    },
    "kp7": {
      titel: "Pausas e compasso",
      introDu: "Também o silêncio é música: as quatro pausas. E o mais louco nas notas braille: a barra de compasso é simplesmente o espaço!",
      introSie: "Sinais de pausa (Krolick, Tabela 1A) + fórmula de compasso e barra de compasso (§3-6, §1-7): a barra de compasso é um espaço.",
      einheiten: {
        "r:ganze": "pausa de semibreve",
        "r:halbe": "pausa de mínima",
        "r:viertel": "pausa de semínima",
        "r:achtel": "pausa de colcheia",
        "sig:4/4": "compasso de quatro quartos",
        "sig:3/4": "compasso de três quartos",
      },
    },
    "kp8": {
      titel: "Notas com ponto",
      introDu: "Um ponto torna a nota uma vez e meia mais longa. Em braille recebe uma célula PRÓPRIA: o ponto 3, logo a seguir à nota.",
      introSie: "Ponto de prolongação como célula seguinte (Krolick, §1-2).",
      einheiten: {
        "dot": "Ponto de prolongação (nota pontuada)",
      },
    },
    "kp9": {
      titel: "Sustenido, bemol e bequadro",
      introDu: "Às vezes uma nota sobe meio tom: o sustenido sobe, o bemol desce, o bequadro desfaz isso. O sinal fica mesmo ANTES da nota.",
      introSie: "Acidentes antes da nota (Krolick, cap. III; De Garmo, cap. 6 - de propósito ANTES dos sinais de oitava).",
      einheiten: {
        "acc:kreuz": "Sustenido",
        "acc:be": "Bemol",
        "acc:aufloesung": "Bequadro",
      },
    },
    "kp10": {
      titel: "Sinais de oitava - a posição",
      introDu: "Em braille não há clave! Em vez disso, os sinais de oitava dizem QUÃO alta está uma nota. A primeira nota de um trecho recebe sempre um.",
      introSie: "Sinais de oitava em vez de clave (Krolick, §1-8/1-9; De Garmo, cap. 7 - depois dos graus de valor).",
      einheiten: {
        "oct:3": "Sinal de oitava: oitava pequena",
        "oct:4": "Sinal de oitava: oitava de uma linha",
        "oct:5": "Sinal de oitava: oitava de duas linhas",
      },
    },
    "kp11": {
      titel: "Sinais de oitava - as regras",
      introDu: "Quando é que uma nota precisa de sinal de oitava? Segunda e terceira: nunca. Quarta e quinta: só se a oitava mudar. A partir da sexta: sempre. Torna-te detetive das oitavas!",
      introSie: "Regras de colocação (Krolick, §1-10) como tarefas de decisão - a dificuldade técnica mais frequente documentada (NLS).",
      einheiten: {},
    },
    "kp12": {
      titel: "Semibreve ou semicolcheia?",
      introDu: "Um segredo das notas braille: a mesma célula pode significar semibreve OU semicolcheia! O compasso diz-te o que se quer dizer. Trabalho de detetive!",
      introSie: "Ambiguidade de valores (Krolick, cap. 1, Whole Note or 16th?): desambiguação pela fórmula de compasso e pelo contexto.",
      einheiten: {},
    },
    "kp13": {
      titel: "Repetição e forma",
      introDu: "A música gosta de se repetir - e o braille abrevia com esperteza: um sinal próprio diz: toca este compasso outra vez! Além disso: as chavetas de repetição e a barra final.",
      introSie: "Sinais de repetição e de forma (Krolick, cap. IX): simile como abreviatura própria do braille, repetições, barra final.",
      einheiten: {
        "sim": "Repetição de compasso (simile)",
        "rep-start": "Início de repetição",
        "rep-end": "Fim de repetição",
        "final": "Barra final",
      },
    },
    "kp14": {
      titel: "Oficina de canções",
      introDu: "Agora tocas música a sério! Escolhe uma canção - ouvir, ler em braille, escrever de memória. Primeiro ler, depois ouvir na cabeça, depois tocar.",
      introSie: "Aplicação ao repertório real: ler-memorizar-tocar (RNIB) + ditado de melodias (Taesch); duas estantes (canções infantis / clássicos e êxitos), todas as melodias de domínio público, transcrições próprias.",
      einheiten: {},
    },
    "kp-haltebogen": {
      titel: "A ligadura de prolongamento",
      introDu: "Duas notas iguais, UM som longo: a ligadura de prolongamento junta-as - a segunda não é atacada de novo. Em braille são duas células logo depois da nota.",
      introSie: "Ligadura de prolongamento (Krolick, cap. VI): ⠈⠉ depois da nota; primeiro a distinção auditiva ligado/separado, depois a forma escrita (De Garmo associa as ligaduras cedo às mínimas, cap. 4).",
      einheiten: {
        "tie": "Ligadura de prolongamento (duas células: ponto 4, depois pontos 1 e 4)",
      },
    },
    "kp-auftakt": {
      titel: "Anacruse e compassos incompletos",
      introDu: "Nem todo o compasso está completo: no início pode haver uma pequena anacruse, no fim um compasso residual. E se a linha acabar a meio do compasso, ajuda o hífen musical.",
      introSie: "Compassos parciais / anacruse + hífen musical (Krolick, cap. III/IX; De Garmo: compassos incompletos): cálculo de compassos como exercício de audição e escrita.",
      einheiten: {
        "hyphen": "Hífen musical (o compasso continua na linha seguinte)",
      },
    },
    "kp-pausen2": {
      titel: "Silêncio prolongado",
      introDu: "Quando muitos compassos estão em silêncio, o braille conta com esperteza: até três compassos vazios basta repetir a pausa de semibreve - a partir de quatro, o número fica escrito antes dela.",
      introSie: "Pausas de vários compassos (Krolick, §1-7): ⠍⠍⠍ ou número + pausa de semibreve; exercícios de contagem, escrita e audição.",
      einheiten: {
        "mrest:4": "Pausa de vários compassos (sinal numérico, número, pausa de semibreve)",
      },
    },
    "kp-tonart": {
      titel: "A tonalidade fica à frente",
      introDu: "Sustenidos ou bemóis logo no início valem para a peça INTEIRA: a armadura. Até três repete-se o sinal; a partir de quatro, fica um número à frente - e logo a seguir vem a fórmula de compasso.",
      introSie: "Armadura de tonalidade (Krolick, §3-4; De Garmo, cap. 6): forma repetida até 3, forma numérica a partir de 4; cabeçalho da peça = tonalidade + fórmula de compasso juntas (§3-5).",
      einheiten: {
        "key:2:kreuz": "Armadura: dois sustenidos (ré maior)",
        "key:2:be": "Armadura: dois bemóis (si bemol maior)",
        "key:4:kreuz": "Armadura: quatro sustenidos - a partir de quatro com sinal numérico (mi maior)",
      },
    },
    "kp-taktwechsel": {
      titel: "O compasso muda",
      introDu: "A meio da peça pode aparecer uma nova fórmula de compasso - a partir daí conta-se de outra maneira. Além disso, dois sinais especiais: o C (compasso de quatro quartos) e o alla breve (compasso de dois tempos).",
      introSie: "Mudança de fórmula + fórmulas especiais C/alla breve (Krolick, §3-6/3-8; De Garmo, cap. 10).",
      einheiten: {
        "csig": "C - o compasso de quatro quartos",
        "acsig": "Alla breve - o compasso de dois tempos",
      },
    },
    "kp-schluessel": {
      titel: "Claves - só para saber",
      introDu: "Clave de sol e clave de fá também existem em braille - mas só como informação sobre a imagem impressa! A posição indicam-na sempre os sinais de oitava. Bom saber para conversar com músicos que vêem e para o MuseScore.",
      introSie: "Sinais de clave (Krolick, cap. II - expressamente informativos; contraprova music21): ponte para a notação impressa.",
      einheiten: {
        "clef:violin": "Clave de sol (três células)",
        "clef:bass": "Clave de fá (três células)",
        "clef:alt": "Clave de dó (três células)",
      },
    },
    "kp-sechzehntel": {
      titel: "Semicolcheias ágeis",
      introDu: "As semicolcheias usam a MESMA célula que a semibreve - esse truque já conheces de „Semibreve ou semicolcheia?“. Novo: em grupos, só a PRIMEIRA nota leva os pontos de valor; o resto parece colcheias.",
      introSie: "Valores pequenos + regra de agrupamento (Krolick, §4-2; De Garmo, cap. 15): pontos de valor só na primeira nota do grupo - o equivalente braille da barra de agrupamento.",
      einheiten: {},
    },
    "kp-triolen": {
      titel: "Tercetos e grupos irregulares",
      introDu: "Três sons dividem um tempo onde normalmente vivem dois: o terceto. Em braille, o seu sinal (pontos 2, 3) fica uma vez antes do grupo.",
      introSie: "Grupos irregulares (Krolick, cap. IV; De Garmo, cap. 16): sinal de terceto ⠆; duole e terceto distinguidos primeiro auditivamente.",
      einheiten: {
        "tri": "Sinal de terceto (uma vez antes do grupo de três)",
      },
    },
    "kp-puls": {
      titel: "Apanhar o pulso",
      introDu: "Toda a música tem um batimento cardíaco - o tempo. Apanha-o: bate-o regularmente, ouve os tempos acentuados e distingue a marcha (dois tempos) da valsa (três tempos).",
      introSie: "Sentido de pulso antes da escrita (KOMU MKe, ABRSM Aural G1): manter o tempo, distinguir dois/três tempos pela acentuação - ancorado no movimento (prática com cegos: bater, não só ouvir).",
      einheiten: {},
    },
    "kp-lauschen-dauer": {
      titel: "Longo ou curto?",
      introDu: "Antes de escreveres valores de notas, ouves-os: qual som soou mais tempo? Quantos tempos durou? O teu ouvido aprende semínima, mínima e semibreve como SOM.",
      introSie: "Som antes do sinal (Taesch): comparar e nomear durações por audição (KOMU MKe, prévio aos valores kp5/kp6).",
      einheiten: {},
    },
    "kp-lauschen-dynamik": {
      titel: "Forte e suave",
      introDu: "A música vive da alternância entre forte e suave. Ouve: forte ou suave? Fica mais forte ou mais suave? Onde está o som acentuado? É o exercício preparatório da dinâmica em braille.",
      introSie: "Preparação auditiva da dinâmica (Aural G1): forte/piano, crescendo/decrescendo e acento primeiro ouvidos - antes de o Mundo 4 trazer os seus sinais.",
      einheiten: {},
    },
    "kp-instrumente": {
      titel: "Que instrumento é?",
      introDu: "Piano, guitarra, saxofone ou flauta transversal - cada um soa diferente. Ouve o timbre: que instrumento toca? Dois motivos são do mesmo ou de instrumentos diferentes?",
      introSie: "Discriminação de timbres (KOMU MKe): percutido, dedilhado, soprado - com as quatro vozes sintéticas.",
      einheiten: {},
    },
    "kp-echo": {
      titel: "Jogo do eco",
      introDu: "Eu toco, tu tocas de volta! Ouve uma pequena sequência de sons e toca-a no teclado - D F G H J K L são dó ré mi fá sol lá si. Só contam os sons; o ritmo é livre.",
      introSie: "Eco como primeiro degrau da escada de competências (Gordon, aural/oral): âmbito sol-mi → +lá → pentatónica (Kodály), a entrada tocada de volta audível.",
      einheiten: {},
    },
    "kp-melodie-memory": {
      titel: "Memória de melodias",
      introDu: "Como na memória, só que com sons: se conseguires a sequência, entra mais um som. Até onde chegas? Um jogo de memória para o ouvido interior.",
      introSie: "Memória de audiação (princípio de Simon, Gordon): tocar sequências de sons crescentes; estrelas pelo comprimento máximo (§12).",
      einheiten: {},
    },
    "kp-bindebogen": {
      titel: "A ligadura de expressão (legato)",
      introDu: "A ligadura de expressão diz: toca estes sons ligados suavemente, legato. Não confundir com a ligadura de prolongamento! Esta junta sons iguais num só - a de expressão liga sons diferentes.",
      introSie: "Fraseado (Krolick, cap. VI, §6-2/3): ligadura de expressão ⠉ depois de cada nota exceto a última, duplicação em mais de quatro notas; a confusão entre ligadura de prolongamento e de expressão é contrastada ativamente.",
      einheiten: {
        "slur": "Ligadura de expressão (pontos 1, 4 - depois de cada nota exceto a última)",
        "slur-bracket": "Arco de frase em forma de parênteses (só para reconhecer)",
      },
    },
    "kp-artikulation": {
      titel: "Staccato, acento e companhia",
      introDu: "Como se ataca um som? Curto e destacado (staccato), sustentado até ao fim (tenuto) ou acentuado (acento)? Estes sinais ficam ANTES da nota - só a fermata, que mantém o final, fica depois.",
      introSie: "Articulação (Krolick, cap. X, vocabulário KOMU-MK1): staccato/tenuto/acento antes da nota (duplicação a partir de 4), fermata depois da nota e nunca duplicada.",
      einheiten: {
        "art:staccato": "Staccato (pontos 2, 3, 6 - antes da nota)",
        "art:tenuto": "Tenuto (pontos 4, 5, 6 · pontos 2, 3, 6)",
        "art:akzent": "Acento (pontos 4, 6 · pontos 2, 3, 6)",
        "fermate": "Fermata (depois da nota: pontos 1, 2, 6 · pontos 1, 2, 3)",
      },
    },
    "kp-dynamik": {
      titel: "Forte e suave em braille",
      introDu: "Agora a intensidade recebe os seus sinais: antes de cada palavra de expressão vem o sinal de palavra (pontos 3, 4, 5), depois seguem f (forte), p (piano) e companhia. E as forquilhas mostram crescendo e decrescendo.",
      introSie: "Dinâmica em braille (Krolick, cap. X, §10-2…6): sinal de palavra + letras literárias, forquilhas cresc/decr; assenta na audição de 1.5.",
      einheiten: {
        "dyn:p": "Piano (sinal de palavra e p)",
        "dyn:f": "Forte (sinal de palavra e f)",
        "dyn:mf": "Mezzoforte (sinal de palavra, m, f)",
        "dyn:pp": "Pianissimo (sinal de palavra e p duas vezes)",
        "dyn:ff": "Fortissimo (sinal de palavra e f duas vezes)",
        "dyn:cr": "Início da forquilha de crescendo (345-14)",
        "dyn:decr": "Início da forquilha de decrescendo (345-145)",
      },
    },
    "kp-tempo": {
      titel: "Palavras de andamento e metrónomo",
      introDu: "Largo, andante, presto - as palavras de andamento dizem quão depressa se toca. Ouve-as, aprende o seu significado e escreve a indicação exata do metrónomo „Semínima igual a 60“.",
      introSie: "Andamento (lista KOMU-MK1 + accel/rit): como vocabulário de audição e de conhecimento; indicação do metrónomo (Krolick, §14-17: célula de figura, sinal de igualdade, sinal numérico, algarismos).",
      einheiten: {
        "metronom": "Indicação do metrónomo (semínima, sinal de igualdade, sinal numérico, algarismos)",
      },
    },
    "kp-verzierungen1": {
      titel: "Ornamentos I - apogiatura e trilo",
      introDu: "Pequenos sons de ornamento enfeitam a melodia: a apogiatura (um som antes) e o trilo (alternância rápida). Os seus sinais ficam sempre ANTES da nota.",
      introSie: "Ornamentos (Krolick, cap. XI, §11-3/6/7): apogiatura curta/longa, trilo - som através de ornamentToEvents, sinal antes da nota.",
      einheiten: {
        "orn:vorschlag": "Apogiatura curta (pontos 2, 6)",
        "orn:vorschlag-lang": "Apogiatura longa (pontos 5 · pontos 2, 6)",
        "orn:triller": "Trilo (pontos 2, 3, 5)",
      },
    },
    "kp-verzierungen2": {
      titel: "Ornamentos II - grupeto, mordente, trémolo",
      introDu: "Mais enfeites: o grupeto envolve o som, o trilo curto e o mordente tocam-no brevemente, o trémolo faz repetir o som depressa. Guarda na memória onde fica cada sinal.",
      introSie: "Ornamentos adicionais (Krolick, cap. XI/VII, extra): grupeto/trilo curto/mordente antes da nota, repetição de trémolo depois, alternância entre as notas.",
      einheiten: {
        "orn:doppelschlag": "Grupeto (pontos 2, 5, 6)",
        "orn:pralltriller": "Trilo curto (pontos 5 · pontos 2, 3, 5)",
        "orn:mordent": "Mordente (pontos 5 · pontos 2, 3, 5 · pontos 1, 2, 3)",
        "trem:rep8": "Repetição de trémolo em colcheias (pontos 4, 5 · pontos 1, 2)",
        "trem:alt8": "Trémolo de alternância em colcheias (pontos 4, 6 · pontos 1, 2)",
      },
    },
    "kp-ausdruck-lied": {
      titel: "Com sentimento! - numa canção",
      introDu: "Agora juntas tudo: pega no início de uma canção a sério e ouve-o ou escreve-o COM expressão - ora ligado, ora curto, ora com uma palavra de expressão antes. Assim a música soa viva.",
      introSie: "Whole-part-whole (regra 4): aplicar os sinais de expressão do Mundo 4 a canções reais das estantes; comparar seco vs. com expressão.",
      einheiten: {},
    },
    "kp-braillerepeats": {
      titel: "O braille poupa trabalho",
      introDu: "O braille é esperto: em vez de escrever de novo um compasso igual, usa o sinal de simile - e com um número a seguir até diz quantas vezes. Mas atenção: nunca no primeiro tempo de uma linha!",
      introSie: "Abreviatura de repetições (Krolick, cap. IX, §9-15/36): regras de simile aprofundadas, repetição contada 2356-3456-N; abreviatura própria do braille.",
      einheiten: {
        "count-rep": "Repetição contada (simile, sinal numérico, número)",
      },
    },
    "kp-volten": {
      titel: "Casas, Da capo e Segno",
      introDu: "Como se leem as placas de sinalização da forma? A casa 1 e a casa 2 (as casas) dão à repetição um novo final; o segno e a coda marcam pontos de salto; e „D.C.“ quer dizer: do princípio!",
      introSie: "Sinais de forma (Krolick, cap. IX, §9-6/8/9): casa com algarismos INFERIORES, segno/coda, regra do da capo como texto; ordem de execução como puzzle.",
      einheiten: {
        "volta:1": "Casa 1, primeira vez (sinal numérico, grave 1)",
        "volta:2": "Casa 2, segunda vez (sinal numérico, grave 2)",
        "segno": "Segno (pontos 3, 4, 6)",
        "coda": "Coda (pontos 3, 4, 6 · pontos 1, 2, 3)",
      },
    },
    "kp-formen": {
      titel: "Ouvir formas",
      introDu: "A música tem plantas: o início volta (A-B-A)? Quantas vezes regressa o refrão no rondó? A repetição é exata - ou é uma variação? Ouve a forma.",
      introSie: "Forma musical (plano curricular Sek I, 2.º ano; ABRSM Aural G2): forma de canção, rondó, variação ouvida sobre blocos de motivos.",
      einheiten: {},
    },
    "kp-intervalle1": {
      titel: "Ouvir intervalos I",
      introDu: "Dois sons - a que distância estão um do outro? Primeiro o contraste entre uníssono, quinta e oitava; depois entram as terceiras. Guarda na memória a terceira do cuco e a quarta de Amazing Grace.",
      introSie: "Ouvir intervalos (KOMU MK1, canções de memória): primeiro uníssono/quinta/oitava, depois terceiras, quarta, sexta - sucessivamente, depois em simultâneo.",
      einheiten: {},
    },
    "kp-intervalle2": {
      titel: "Intervalos em braille",
      introDu: "Agora escreves intervalos de duas notas: na voz superior escreve-se a nota MAIS ALTA, e o sinal de intervalo conta para baixo. Assim um só sinal traz o segundo som.",
      introSie: "Sinais de intervalo (Krolick, cap. V, Tab. 5A): 34/346/3456/35/356/25/36 e a direção de leitura do discante (nota mais alta, intervalos para baixo).",
      einheiten: {
        "int:2": "Segunda (pontos 3, 4)",
        "int:3": "Terceira (pontos 3, 4, 6)",
        "int:4": "Quarta (pontos 3, 4, 5, 6)",
        "int:5": "Quinta (pontos 3, 5)",
        "int:6": "Sexta (pontos 3, 5, 6)",
        "int:7": "Sétima (pontos 2, 5)",
        "int:8": "Oitava (pontos 3, 6)",
      },
    },
    "kp-intervalle3": {
      titel: "Ouvir intervalos II",
      introDu: "Desafio: agora entram os intervalos que rangem - segunda e sétima - e tu estimas se um som é maior ou menor do que uma quinta. Para cima e para baixo.",
      introSie: "Determinação fina de intervalos (KOMU MK2): segunda/sétima/trítono, ascendentes e descendentes, tarefas de estimativa em torno da quinta.",
      einheiten: {},
    },
    "kp-akkorde1": {
      titel: "Maior ou menor?",
      introDu: "Três sons juntos são uma tríade. Soa clara (maior) ou escura (menor)? E os sons vêm um a um (arpejados) ou todos ao mesmo tempo? O teu ouvido aprende a cor dos acordes.",
      introSie: "Ouvir acordes (KOMU MK1): distinguir maior/menor, arpejado vs. simultâneo, desafio diminuto.",
      einheiten: {},
    },
    "kp-akkorde2": {
      titel: "Escrever acordes",
      introDu: "Uma tríade escreve-se como um intervalo: a nota mais alta, depois os sinais de intervalo de terceira e quinta para baixo. Um som, dois sinais - e o acorde está pronto.",
      introSie: "Notação de acordes (Krolick, cap. V): fundamental mais sinais de intervalo (regra do discante: nota mais alta, terceira e quinta para baixo), duplicação de oitava.",
      einheiten: {},
    },
    "kp-inakkord": {
      titel: "Duas vozes, uma linha",
      introDu: "Como se escrevem duas vozes numa só linha braille? O sinal In-Accord separa-as: primeiro a voz superior, depois o sinal, depois a voz inferior - ambas com sinal de oitava próprio.",
      introSie: "In-Accord (Krolick, cap. V, §5-11/12): In-Accord de compasso inteiro 126-345, depois novo sinal de oitava; porta para a música de piano.",
      einheiten: {
        "inacc": "In-Accord de compasso inteiro (pontos 1, 2, 6 · pontos 3, 4, 5)",
        "inacc-teil": "In-Accord de compasso parcial (ponto 5 · ponto 2)",
      },
    },
    "kp-tonleitern": {
      titel: "Escalas",
      introDu: "Oito graus de um som ao seguinte igual: a escala. Toca a escala de dó maior, ouve a diferença entre maior e menor e encontra o grau que saiu do lugar.",
      introSie: "Escalas (ABRSM G1, KOMU MK1): tocar dó maior, ouvir maior/menor, encontrar o grau errado, escrever sol maior com sustenido.",
      einheiten: {},
    },
    "kp-quintenzirkel": {
      titel: "Rali do círculo de quintas",
      introDu: "Um rali pelas tonalidades: quantos sustenidos tem sol maior? Que tonalidade tem dois bemóis? Aprende as armaduras até quatro sustenidos e quatro bemóis - para a frente e para trás.",
      introSie: "Círculo de quintas (núcleo KOMU MK1): tonalidade ↔ número de acidentes até 4♯/4♭, ler a armadura em braille.",
      einheiten: {},
    },
    "kp-rhythmusdiktat": {
      titel: "Ditado de ritmo",
      introDu: "Eu bato um compasso - tu escreves os valores. Só conta o ritmo; a altura fica igual. E ao contrário: lê um ritmo à primeira vista e bate-o de volta.",
      introSie: "Ditado rítmico (KOMU MKe→MK1): anotar valores por audição (ditado) e bater à primeira vista (inverso); linguagem do ritmo na resolução.",
      einheiten: {},
    },
    "kp-melodiediktat": {
      titel: "Ditado de melodia",
      introDu: "O exercício rei: eu toco uma pequena melodia, tu escreves. Começa com pequenos passos, a nota inicial é sempre dita, e podes ouvir quantas vezes quiseres.",
      introSie: "Ditado melódico (KOMU MK1→MK2): 3-5 notas vizinhas a partir de uma nota inicial anunciada, graus até saltos de terceira/valores; audição ilimitada sem penalização.",
      einheiten: {},
    },
    "kp-detektiv": {
      titel: "Detetive de erros",
      introDu: "Sê um detetive da correção: lê a linha braille e ouve a gravação. Num único ponto o som afasta-se das notas - ou tudo está certo. Encontras o ponto?",
      introSie: "Leitura de correção (prática com cegos: confrontar notação e som): encontrar um desvio - competência-alvo da leitura braille.",
      einheiten: {},
    },
    "kp-baumeister": {
      titel: "Construtor de compassos",
      introDu: "Constrói os teus próprios compassos: escreve notas e pausas até os tempos baterem certo com a fórmula. Faltam? Sobram? O teu compasso diz-to - e se estiver certo, soa.",
      introSie: "Construtor de compassos (motor build, §4.4): células livres de notas/pausas, soma dos valores == fórmula, ambiguidade segundo a lógica de leitura de kp12; criativo + cálculo de compassos.",
      einheiten: {},
    },
    "kp-spielwiese": {
      titel: "Recreio sonoro",
      introDu: "Jogo livre sobre um bordão suave: com as teclas da pentatónica nenhum som pode soar errado. Conta uma pequena história - ora baixinho, ora alto. Experimenta à vontade.",
      introSie: "Improvisação Orff (§7.7): pentatónica sobre bordão de quinta, nenhum som errado, sem estrelas - visto a partir dos 30 sons tocados (§12).",
      einheiten: {},
    },
    "kp-kadenzen": {
      titel: "Assunto do final",
      introDu: "Como soa um final? A música fica aberta (meia cadência) ou assenta (cadência perfeita)? E é o final forte da dominante ou o suave final „Amém“?",
      introSie: "Cadências (ABRSM Aural G5, KOMU MK2): meia vs. cadência perfeita, plagal vs. autêntica, funções T/S/D.",
      einheiten: {},
    },
    "kp-komponier": {
      titel: "Oficina de composição",
      introDu: "A tua própria folha: escreve livremente, ouve a tua obra e guarda-a. Cabem até cinco obras na estante. A oficina fica visitada assim que guardares a primeira.",
      introSie: "Oficina de composição (motor sandbox, §4.5): escrita livre, audição, guardar até 5 obras; sem estrelas - visto a partir da primeira obra (§12).",
      einheiten: {},
    },
    "kp-fingersatz": {
      titel: "Digitação",
      introDu: "Que dedo toca que nota? O pequeno algarismo DEPOIS da nota diz: 1 é o polegar, 5 o dedo mínimo. Assim a mão sabe sempre para onde ir.",
      introSie: "Digitação (Krolick, cap. XV, Tab. 15): dedos 1-5 = 1/12/123/2/13, DEPOIS da nota (antes de uma ligadura de prolongamento).",
      einheiten: {
        "finger:1": "Polegar, 1.º dedo (ponto 1)",
        "finger:2": "Indicador, 2.º dedo (pontos 1, 2)",
        "finger:3": "Médio, 3.º dedo (pontos 1, 2, 3)",
        "finger:4": "Anelar, 4.º dedo (ponto 2)",
        "finger:5": "Dedo mínimo, 5.º dedo (pontos 1, 3)",
      },
    },
    "kp-klavier": {
      titel: "Música de piano",
      introDu: "Duas mãos, dois sinais: a mão direita toca em geral a melodia, a esquerda acompanha mais grave. Um sinal de mão no início da linha diz qual mão entra - e o pedal dá mais plenitude ao som.",
      introSie: "Notação de piano (Krolick, cap. XV, Tab. 15A): sinais de mão 46-345 / 456-345 (+ sinal de oitava depois), pedal 126-14 (antes) / 16-14 (depois).",
      einheiten: {
        "hand:r": "Mão direita (pontos 4, 6 · pontos 3, 4, 5)",
        "hand:l": "Mão esquerda (pontos 4, 5, 6 · pontos 3, 4, 5)",
        "pedal:ab": "Pedal em baixo (pontos 1, 2, 6 · pontos 1, 4)",
        "pedal:auf": "Pedal levantado (pontos 1, 6 · pontos 1, 4)",
      },
    },
    "kp-gesang": {
      titel: "Cantar com braille",
      introDu: "Ao cantar, sons e sílabas andam juntos: vários sons numa sílaba unem-se com a ligadura de sílaba, e os sinais de respiração dizem onde se respira. As linhas de texto e as musicais alternam.",
      introSie: "Notação vocal (Krolick, cap. XVI): ligadura de sílaba 14, respiração 345-2 / 6-34, 2 sílabas por nota 12, prefixos de linha 56-23 / 6-3.",
      einheiten: {
        "vocal:silbenbogen": "Ligadura de sílaba (pontos 1, 4)",
        "vocal:atem-halb": "Meio sinal de respiração (pontos 3, 4, 5 · ponto 2)",
        "vocal:atem-voll": "Sinal de respiração completo (ponto 6 · pontos 3, 4)",
        "vocal:silben2": "Duas sílabas numa nota (pontos 1, 2)",
      },
    },
    "kp-gitarre": {
      titel: "Guitarra e símbolos de acordes",
      introDu: "Na guitarra contam a corda e a posição: um sinal de corda com algarismo diz qual corda se dedilha, o sinal de posição diz onde a mão aperta. E os símbolos de acordes (círculo, triângulo, 7 em itálico) revelam o tipo de acorde.",
      introSie: "Notação de guitarra (Krolick, cap. XVII, Tab. 17A-C): cordas 146+algarismo, posições 345+sinal de intervalo (7.ª posição caso especial 6-345-25), pestana 456/45; símbolos de acordes internacionais (§3-INCERTO-3: os símbolos com letras variam de país para país).",
      einheiten: {
        "string:3": "3.ª corda (sinal de corda e pontos 1, 2, 3)",
        "fret:5": "5.ª posição (sinal de posição e quinta)",
        "fret:7": "7.ª posição - caso especial com ponto 6 extra",
        "barre:voll": "Pestana completa (pontos 4, 5, 6)",
        "chordsym:sept": "Acorde de sétima de dominante, 7 em itálico",
      },
    },
    "kp-generalbass": {
      titel: "Baixo cifrado e graus",
      introDu: "O baixo cifrado é uma abreviatura para quem acompanha: uma nota de baixo com cifra diz quais os sons que soam por cima. E tudo pensa em graus - tónica, subdominante, dominante.",
      introSie: "Baixo cifrado (Krolick, cap. XII, §12-15…27): prefixo de parte 56-345, cifras = sinal numérico + algarismos GRAVES (o algarismo inferior da impressão primeiro); graus I-IV-V como ponte para a cadência.",
      einheiten: {
        "gb": "Prefixo de baixo cifrado (pontos 5, 6 · pontos 3, 4, 5)",
      },
    },
    "kp-partitur": {
      titel: "Partitura e imagem impressa",
      introDu: "Como está construída uma partitura braille? Os números de compasso ficam sem sinal numérico na margem (a anacruse é o compasso 0), e as vozes dispõem-se por secções umas por cima das outras. Assim encontras o caminho.",
      introSie: "Conhecimento da partitura (Krolick, cap. XIV, §14-10…13): números de compasso sem sinal numérico, anacruse = compasso 0, formato bar-over-bar, fontes (dzb lesen, SBS). Conhecimento puro.",
      einheiten: {
        "taktnr:1": "Número de compasso (algarismos superiores, sem sinal numérico)",
      },
    },
    "kp-orchester": {
      titel: "Sopros, percussão e companhia",
      introDu: "Os instrumentos podem ser arrumados em famílias: cordofones, aerofones, membranofones e idiofones - conforme aquilo que produz o som. Ouve e associa os timbres.",
      introSie: "Conhecimento dos instrumentos (KOMU MK2, Hornbostel-Sachs adaptado às crianças): famílias de instrumentos + associação auditiva com as quatro vozes sintéticas. Panorama, não treino de sinais.",
      einheiten: {},
    },
    "kp-lieder2": {
      titel: "Canções com expressão",
      introDu: "As mesmas canções, agora com sentimento: ligadas ou curtas, suaves ou fortes. Ouve a diferença entre a versão seca e a expressiva - e acompanha as linhas com a escrita.",
      introSie: "Canções com expressão (§9.2): terceira estante com dinâmica/articulação/ligaduras; ditado de expressão (seco vs. com expressão) + escrita de linhas. Extensão de parseLine.",
      einheiten: {},
    },
    "kp-lesekonzert": {
      titel: "Concerto de leitura",
      introDu: "A disciplina rainha: lê uma linha braille sem a ouvir, grava-a na memória - e depois toca-a de memória. É exatamente assim que se toca à primeira vista, porque ao tocar não se pode ler.",
      introSie: "Concerto de leitura (§9.3, RNIB „read–memorise–play“): mostrar braille → ler → tocar de memória no teclado → confrontar com o modelo. Conta a sequência de sons, não o tempo de leitura (§12).",
      einheiten: {},
    },
    "kp-liederquiz": {
      titel: "Quiz de canções",
      introDu: "Reconheces uma canção só pela sua linha braille - sem um único som? Ou encontras, a partir da melodia ouvida, a canção certa? É leitura silenciosa com o ouvido interior.",
      introSie: "Quiz de canções (§9.4): ler a linha inicial em braille → nomear a canção, e ouvir a melodia → nomear a canção. Coroação da leitura fluente de notação braille.",
      einheiten: {},
    },
  },
};
