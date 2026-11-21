/**
 * ════════════════════════════════════════════════════════════════════════════
 * PORTUGIESISCH (pt, br) - DER LEHRGANG „GRAFIA BRAILLE" (Bauplan 2026-11-06 §4)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Eine Fabrik für BEIDE Varianten: `pt/lehrgang.ts` (Portugal) und `br/lehrgang.ts` (Brasilien) rufen sie
 * mit ihren eigenen Wortvorräten auf. Die Zeichen und die Engine sind gemeinsam (die Norm ist eine); GETRENNT
 * sind Wortvorrat, Etappen-Ids (`pt-…` / `br-…`), Anrede der Texte (pt „tu", br „você") und Wortwahl.
 *
 * Gleiche Etappen-Logik wie die deutsche Basisschrift (`etappen.ts`) und der spanische Lehrgang: kleine Gruppen neuer
 * Zeichen, danach Wörter und Sätze nur aus dem, was schon gelernt ist, am Ende ganze Texte.
 *
 * ★ REIHENFOLGE DER BUCHSTABEN = HÄUFIGKEIT IM PORTUGIESISCHEN. Quelle: Wikipedia en, „Letter frequency", Spalte
 *   Portugiesisch, nach „Frequência da ocorrência de letras no Português" (numaboa.com, abgerufen 16.06.2009; Wikipedia
 *   abgerufen 07.11.2026): a e o s r i d m n t c u l p v g h q b f z x j w k y. Die Quelle unterscheidet NICHT zwischen
 *   Portugal und Brasilien: beide Lehrgänge haben dieselbe Reihenfolge. Die Quelle kennt keine Buchstaben mit
 *   Diakritikum: ç ã õ á é í ó ú à ê ô â kommen nach den 26 Buchstaben (diese Einordnung ist EIGENE Entscheidung, keine Messung).
 * ★ SCHRIFTART: „Grafia Braille para a Língua Portuguesa" (so heißt die Norm), hier ohne jede Kürzung
 *   (die Estenografia ist Kurzschrift und nicht Teil dieses Auftrags). Zeichen und Regeln: `zeichen.ts`, `engine.ts`.
 * ★ ZAHLEN: Zahlzeichen 3-4-5-6 und die Buchstaben a-j (Grafia 2018, § 12, S. 29); Rechenzeichen ohne Zwischenraum
 *   (§ 22, S. 36), jede Zahl mit eigenem Zahlzeichen: 7+2 = #g6#b.
 * ★ ANREDE: pt Kinder „tu" (wie Tastenflow auf pt, `curriculumPt.ts`), br „você" (`curriculumBr.ts`); Lehrkraft: Höflichkeitsform.
 */
import {
  type BuchstabenGruppe,
  einheitenAus,
  lehrgangBauer,
  namenMit,
  saetzeMit,
  woerterMit,
  type Wortvorraete,
} from "../lehrgangBauen";

/** Reihenfolge der Buchstaben: Häufigkeit (siehe Kopf). */
export const PT_BUCHSTABEN_REIHENFOLGE = "aeosridmntculpvghqbfzxjwkyçãõáéíóúàêôâ";

/** Sprechbare Namen (für Vorlesen und Merkhilfe), wie man sie auf Portugiesisch sagt. */
const BUCHSTABENNAME: Record<string, string> = {
  a: "a", b: "bê", c: "cê", d: "dê", e: "e", f: "efe", g: "gê", h: "agá", i: "i", j: "jota", k: "capa",
  l: "ele", m: "eme", n: "ene", o: "o", p: "pê", q: "quê", r: "erre", s: "esse", t: "tê", u: "u",
  v: "vê", w: "dáblio", x: "xis", y: "ípsilon", z: "zê", ç: "cê cedilha", ã: "a com til", õ: "o com til",
  á: "a com acento agudo", é: "e com acento agudo", í: "i com acento agudo", ó: "o com acento agudo",
  ú: "u com acento agudo", à: "a com acento grave", ê: "e com acento circunflexo",
  ô: "o com acento circunflexo", â: "a com acento circunflexo",
};
const ZEICHENNAME: Record<string, string> = {
  ".": "ponto", ",": "vírgula", "?": "ponto de interrogação", "!": "ponto de exclamação",
  ";": "ponto e vírgula", ":": "dois-pontos", "-": "hífen", "(": "abre parênteses", ")": "fecha parênteses",
  '"': "aspas", "«": "abre aspas angulares", "»": "fecha aspas angulares",
  "+": "mais", "−": "menos", "=": "igual", "×": "vezes", "÷": "dividido por",
  NUM: "sinal de número", "1": "um", "2": "dois", "3": "três", "4": "quatro", "5": "cinco", "6": "seis",
  "7": "sete", "8": "oito", "9": "nove", "0": "zero",
  MAJ: "sinal de maiúscula",
};
const einheiten = einheitenAus({ ...BUCHSTABENNAME, ...ZEICHENNAME });

const R = PT_BUCHSTABEN_REIHENFOLGE;
const bis = (n: number): string => R.slice(0, n);
/** Die ersten `n` Buchstaben der Reihenfolge. */
export const ptBuchstabenBis = bis;

export type PtVariante = "pt" | "br";

/** Zwei Wortlaute: Portugal (tu) und Brasilien (você). */
type Zwei = (pt: string, br: string) => string;

export function ptBrLehrgang(v: PtVariante, pool: Wortvorraete) {
  const z: Zwei = (pt, br) => (v === "pt" ? pt : br);
  const id = (s: string): string => `${v}-${s}`;
  const B = lehrgangBauer(v);
  const { dazu } = B;
  const WOERTER = pool.woerter;
  const NAMEN = pool.namen;
  const SAETZE = pool.saetze;
  const TEXTE = pool.texte;

  const GRUPPEN: BuchstabenGruppe[] = [
    {
      id: id("1"), bis: 4, titel: "a, e, o, s: as primeiras letras",
      du: z(
        "Começamos com quatro letras muito frequentes em português: a, e, o e s. Com elas já escreves «asa», «osso» e «essa». Escreve com os pontos: ouves logo se está certo.",
        "Começamos com quatro letras muito frequentes em português: a, e, o e s. Com elas você já escreve «asa», «osso» e «essa». Escreva com os pontos: você ouve logo se está certo.",
      ),
      sie: "As letras ensinam-se por ordem de frequência em português (Wikipedia, Letter frequency, a partir de numaboa.com): a, e, o, s. As mais frequentes vêm primeiro para que apareçam palavras reais muito cedo.",
    },
    {
      id: id("2"), bis: 8, titel: "r, i, d, m: palavras a sério",
      du: z(
        "Mais quatro letras: r, i, d e m. Já escreves «rosa», «mesa» e «medida». Repara bem na forma de cada célula.",
        "Mais quatro letras: r, i, d e m. Agora você escreve «rosa», «mesa» e «medida». Repare bem no formato de cada célula.",
      ),
      sie: "Continua a ordem de frequência: r, i, d, m. Com oito letras já se formam muitas palavras curtas.",
    },
    {
      id: id("3"), bis: 12, titel: "n, t, c, u: doze letras",
      du: z(
        "Com n, t, c e u tens doze letras. Agora escreves «nata», «cinco» e «tinta». O d, o c e o u parecem-se ao tacto: leva o teu tempo.",
        "Com n, t, c e u você tem doze letras. Agora escreve «nata», «cinco» e «tinta». O d, o c e o u se parecem ao tato: vá com calma.",
      ),
      sie: "Continua a ordem de frequência: n, t, c, u. O c (1-4), o d (1-4-5) e o u (1-3-6) confundem-se com facilidade ao tacto; por isso comparam-se nas etapas seguintes.",
    },
    {
      id: id("4"), bis: 16, titel: "l, p, v, g: mais palavras",
      du: z(
        "Agora l, p, v e g. Escreves «lua», «livro» e «gelo». Segue o teu ritmo: cada célula certa leva-te à seguinte.",
        "Agora l, p, v e g. Você escreve «lua», «livro» e «gelo». Siga o seu ritmo: cada célula certa leva você à seguinte.",
      ),
      sie: "Continua a ordem de frequência: l, p, v, g. Com dezasseis letras o vocabulário de exercício alarga-se a centenas de palavras.",
    },
    {
      id: id("5"), bis: 20, titel: "h, q, b, f: vinte letras",
      du: z(
        "Mais quatro letras: h, q, b e f. Escreves «hotel», «queda», «bola» e «faca». Faltam só algumas letras pouco frequentes.",
        "Mais quatro letras: h, q, b e f. Você escreve «hotel», «queda», «bola» e «faca». Faltam só algumas letras pouco frequentes.",
      ),
      sie: "Continua a ordem de frequência: h, q, b, f. Com vinte letras leem-se quase todas as palavras curtas.",
    },
  ];

  const GRUPPEN_NACH_MAJ: BuchstabenGruppe[] = [
    {
      id: id("6"), bis: 23, titel: "z, x, j: letras raras",
      du: z(
        "Três letras mais raras: z, x e j. Escreves «zero», «caixa» e «janela».",
        "Três letras mais raras: z, x e j. Você escreve «zero», «caixa» e «janela».",
      ),
      sie: "Continua a ordem de frequência: z, x, j.",
    },
    {
      id: id("7"), bis: 26, titel: "w, k, y: letras de outras línguas",
      du: z(
        "Mais três letras: w (pontos 2-4-5-6), k e y. Vêm de outras línguas e fazem parte do alfabeto português. Escreves «kiwi», «yoga» e «show».",
        "Mais três letras: w (pontos 2-4-5-6), k e y. Elas vêm de outras línguas e fazem parte do alfabeto português. Você escreve «kiwi», «yoga» e «show».",
      ),
      sie: "Continua a ordem de frequência: w, k, y. Fazem parte do alfabeto de 26 letras (Grafia Braille 2018, § 8, p. 23). Com elas completam-se as letras sem diacrítico.",
    },
    {
      id: id("8"), bis: 29, titel: "ç, ã, õ: cedilha e til",
      du: z(
        "Aqui vêm o ç (pontos 1-2-3-4-6), o ã (3-4-5) e o õ (2-4-6). Escreves «maçã», «mãe» e «limões». Cada letra com cedilha ou til é uma única célula.",
        "Aqui vêm o ç (pontos 1-2-3-4-6), o ã (3-4-5) e o õ (2-4-6). Você escreve «maçã», «mãe» e «limões». Cada letra com cedilha ou til é uma única célula.",
      ),
      sie: "ç (12346), ã (345) e õ (246): em braille são sinais próprios, não uma letra seguida de um acento (Grafia Braille 2018, § 8, p. 23). A ordem entre as letras com diacrítico é uma decisão própria: a fonte de frequência não as inclui.",
    },
    {
      id: id("9"), bis: 32, titel: "á, é, í: acento agudo",
      du: z(
        "Três vogais com acento agudo: á (1-2-3-5-6), é (1-2-3-4-5-6) e í (3-4). Escreves «água», «café» e «tímido». O é tem seis pontos: é a célula cheia.",
        "Três vogais com acento agudo: á (1-2-3-5-6), é (1-2-3-4-5-6) e í (3-4). Você escreve «água», «café» e «tímido». O é tem seis pontos: é a célula cheia.",
      ),
      sie: "Á, é, í (12356, 123456, 34): sinais próprios (Grafia Braille 2018, § 8, p. 23). Atenção: o é português (123456) não é o é espanhol (2346).",
    },
    {
      id: id("10"), bis: 35, titel: "ó, ú, à: mais três letras",
      du: z(
        "Mais três: ó (3-4-6), ú (2-3-4-5-6) e à (1-2-4-6). Escreves «avó», «último» e «à tarde».",
        "Mais três: ó (3-4-6), ú (2-3-4-5-6) e à (1-2-4-6). Você escreve «avó», «último» e «à tarde».",
      ),
      sie: "Ó, ú, à (346, 23456, 1246): sinais próprios (Grafia Braille 2018, § 8, p. 23). O à (acento grave) só se usa na contração da preposição a com o artigo.",
    },
    {
      id: id("11"), bis: 38, titel: "ê, ô, â: acento circunflexo",
      du: z(
        "As últimas: ê (1-2-6), ô (1-4-5-6) e â (1-6). Escreves «pêra», «avô» e «lâmpada». Já conheces todas as letras do português!",
        "As últimas: ê (1-2-6), ô (1-4-5-6) e â (1-6). Você escreve «pêra», «avô» e «lâmpada». Agora você conhece todas as letras do português!",
      ),
      sie: "Ê, ô, â (126, 1456, 16): últimos sinais do alfabeto (Grafia Braille 2018, § 8, p. 23). Depois desta etapa conhecem-se todas as letras.",
    },
  ];

  // ─── Etappen und Levels ────────────────────────────────────────────────────
  let vorher = 0;
  for (const g of GRUPPEN) {
    const neu = R.slice(vorher, g.bis);
    dazu({
      id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
      legend: [...neu].join(" "), kind: "words", items: woerterMit(WOERTER, bis(g.bis)),
    });
    vorher = g.bis;
  }

  dazu({
    id: id("maj"), title: "As maiúsculas: os nomes",
    introducedUnits: [{ key: "CAPS", spoken: ZEICHENNAME.MAJ }],
    introDu: z(
      "Em braille não existe o A maiúsculo. Os pontos 4 e 6 avisam: «agora vem uma maiúscula». Escrevem-se mesmo antes da letra: assim «lia» passa a «Lia». Praticas com nomes.",
      "Em braille não existe o A maiúsculo. Os pontos 4 e 6 avisam: «agora vem uma maiúscula». Eles são escritos logo antes da letra: assim «lia» vira «Lia». Você pratica com nomes.",
    ),
    introSie:
      "Sinal de maiúscula (pontos 4-6) imediatamente antes de cada letra maiúscula (Grafia Braille 2018, § 10, p. 27). Palavras e siglas só com maiúsculas levam o sinal composto 4-6 4-6 (§ 10.1 e § 11, p. 27-28); não se ensinam nesta etapa.",
    legend: "Lia = ⠨ l i a",
    kind: "words",
    items: namenMit(NAMEN, bis(20)),
  });

  for (const g of GRUPPEN_NACH_MAJ) {
    const neu = R.slice(vorher, g.bis);
    dazu({
      id: g.id, title: g.titel, introducedUnits: einheiten(neu), introDu: g.du, introSie: g.sie,
      legend: [...neu].join(" "), kind: "words", items: woerterMit(WOERTER, bis(g.bis)),
    });
    vorher = g.bis;
  }

  dazu({
    id: id("gemischt"), title: "Todas as letras, misturadas",
    introducedUnits: [],
    introDu: z(
      "Já conheces todas as letras. Aqui há palavras variadas: reconhece cada célula.",
      "Você já conhece todas as letras. Aqui há palavras variadas: reconheça cada célula.",
    ),
    introSie: "Etapa de consolidação: todas as palavras, sem nenhum sinal novo.",
    legend: "",
    kind: "words",
    items: () => woerterMit(WOERTER, R)().filter((w) => w.length >= 3),
  });

  dazu({
    id: id("satz1"), title: "O ponto e a vírgula",
    introducedUnits: einheiten(".,"),
    introDu: z(
      "O ponto (ponto 3) e a vírgula (ponto 2) ficam colados à palavra, sem espaço antes. Agora escreves frases de verdade.",
      "O ponto (ponto 3) e a vírgula (ponto 2) ficam colados na palavra, sem espaço antes. Agora você escreve frases de verdade.",
    ),
    introSie:
      "Ponto 3 e vírgula 2 (Grafia Braille 2018, § 8, p. 24). O sinal de ponto (3) também é apóstrofo e ponto abreviativo (§ 34-35, p. 47-48); a vírgula (2) é também a vírgula decimal (§ 13, p. 29).",
    legend: ". ,",
    zeichen: [".", ","],
    kind: "sentences",
    items: saetzeMit(SAETZE, R, ".,", ".,", 60),
  });

  dazu({
    id: id("satz2"), title: "? e !: perguntas e exclamações",
    introducedUnits: einheiten("?!"),
    introDu: z(
      "O ponto de interrogação (pontos 2-6) e o ponto de exclamação (2-3-5) vêm no fim da frase, colados à última palavra. Em português só se escrevem no fim.",
      "O ponto de interrogação (pontos 2-6) e o ponto de exclamação (2-3-5) vêm no fim da frase, colados na última palavra. Em português eles só se escrevem no fim.",
    ),
    introSie:
      "Ponto de interrogação 2-6 e ponto de exclamação 2-3-5 (Grafia Braille 2018, § 8, p. 24; § 33, p. 47). Ao contrário do espanhol, não há sinais de abertura.",
    legend: "? !",
    zeichen: ["?", "!"],
    kind: "sentences",
    items: saetzeMit(SAETZE, R, ".,?!", "?!", 60),
  });

  dazu({
    id: id("satz3"), title: ": ; e hífen",
    introducedUnits: einheiten(":;-"),
    introDu: z(
      "Os dois-pontos (pontos 2-5), o ponto e vírgula (2-3) e o hífen (3-6). O hífen liga as partes de uma palavra, como em «guarda-chuva».",
      "Os dois-pontos (pontos 2-5), o ponto e vírgula (2-3) e o hífen (3-6). O hífen liga as partes de uma palavra, como em «guarda-chuva».",
    ),
    introSie:
      "Dois-pontos 2-5, ponto e vírgula 2-3 e hífen 3-6 (Grafia Braille 2018, § 8, p. 24). O travessão (3-6 3-6, § 39, p. 57) não se ensina nesta etapa: os textos de teclado usam o hífen para o travessão, o que a norma escreve de outra forma.",
    legend: ": ; -",
    zeichen: [":", ";", "-"],
    kind: "sentences",
    items: saetzeMit(SAETZE, R, ".,?!:;-", ":;-", 70),
  });

  dazu({
    id: id("satz4"), title: "( ) parênteses",
    introducedUnits: einheiten("()"),
    introDu: z(
      "Os parênteses têm duas células cada: abre é pontos 1-2-6 e depois o ponto 3; fecha é o ponto 6 e depois 3-4-5. Escreves uma palavra entre parênteses.",
      "Os parênteses têm duas células cada: abre é pontos 1-2-6 e depois o ponto 3; fecha é o ponto 6 e depois 3-4-5. Você escreve uma palavra entre parênteses.",
    ),
    introSie:
      "Forma composta, a usada no texto corrente: abre 126 3, fecha 6 345 (Grafia Braille 2018, § 37.2, p. 53). A forma simples (126 e 345) só se usa junto de números (§ 37.1, p. 50-52) e não se pratica aqui.",
    legend: "( )",
    zeichen: ["(", ")"],
    kind: "sentences",
    items: saetzeMit(SAETZE, R, ".,?!:;-()", "()", 70),
  });

  dazu({
    id: id("satz5"), title: "Aspas",
    introducedUnits: einheiten(v === "pt" ? '"«»' : '"'),
    introDu: z(
      "As aspas \" \" escrevem-se todas com os mesmos pontos, tanto ao abrir como ao fechar: 2-3-6. As aspas angulares « » levam o ponto 5-6 antes: 5-6 e 2-3-6.",
      "As aspas \" \" são escritas todas com os mesmos pontos, tanto ao abrir como ao fechar: 2-3-6. Você vai ver as aspas muitas vezes nas falas das histórias.",
    ),
    introSie:
      v === "pt"
        ? "Aspas “ ” \" \" = 2-3-6; aspas angulares « » = 5-6 2-3-6 (Grafia Braille 2018, § 38, p. 54). Atenção: o liblouis e a World Braille Usage 2013 escrevem « » com 6 2-3-6; vale a norma."
        : "Aspas “ ” \" \" = 2-3-6 (Grafia Braille 2018, § 38, p. 54). As aspas simples (6 2-3-6) e as angulares (5-6 2-3-6) não se praticam nesta etapa.",
    legend: v === "pt" ? "\" « »" : "\"",
    zeichen: v === "pt" ? ['"', "«", "»"] : ['"'],
    kind: "sentences",
    items: saetzeMit(SAETZE, R, ".,?!:;-()\"«»", v === "pt" ? '"«»' : '"', 70),
  });

  const ZAHLEN = ["1", "2", "5", "8", "10", "12", "20", "42", "100", "2026", "3,5", "7", "9", "15", "36", "1999", "300", "64"];
  dazu({
    id: id("zahlen"), title: "Os números",
    introducedUnits: [{ key: "#", spoken: ZEICHENNAME.NUM }, ...einheiten("1234567890")],
    introDu: z(
      "Para os números pões primeiro o sinal de número (pontos 3-4-5-6) e depois as letras de a a j: a é 1, b é 2 ... i é 9 e j é 0. O sinal de número escreve-se uma só vez antes do número todo: 2026 é «sinal de número, b, j, b, f».",
      "Para os números você coloca primeiro o sinal de número (pontos 3-4-5-6) e depois as letras de a a j: a é 1, b é 2 ... i é 9 e j é 0. O sinal de número é escrito uma só vez antes do número todo: 2026 é «sinal de número, b, j, b, f».",
    ),
    introSie:
      "Sinal de número (3-4-5-6) antes dos caracteres da 1.ª série, só antes do primeiro algarismo (Grafia Braille 2018, § 12, p. 29). A vírgula decimal escreve-se com o ponto 2 (§ 13). O ponto separador de classes (3) só se usa com mais de quatro algarismos (§ 14, p. 30) e não se pratica aqui. Se uma letra de a a j se segue ao número, leva antes o ponto 5 (§ 16 c, p. 31).",
    legend: "1 2 3 4 5 6 7 8 9 0",
    zeichen: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    kind: "words",
    items: () => ZAHLEN,
  });

  dazu({
    id: id("plus"), title: "Mais, menos e igual",
    introducedUnits: einheiten("+="),
    introDu: z(
      "Os sinais de cálculo: mais (pontos 2-3-5) e igual (2-3-5-6). O menos é o mesmo sinal do hífen (3-6). Escrevem-se sem espaços e cada número leva o seu sinal de número: «2+3=5».",
      "Os sinais de cálculo: mais (pontos 2-3-5) e igual (2-3-5-6). O menos é o mesmo sinal do hífen (3-6). Eles são escritos sem espaços e cada número leva o seu sinal de número: «2+3=5».",
    ),
    introSie:
      "Sinais de adição 2-3-5, subtração 3-6 e igualdade 2-3-5-6 (Grafia Braille 2018, § 8, p. 25; § 22, p. 36). Escrevem-se em geral sem espaços e depois de cada sinal o número leva de novo o sinal de número. Subtração e hífen têm o mesmo sinal (3-6).",
    legend: "+ - =",
    zeichen: ["+", "="],
    kind: "words",
    items: () => ["2+3=5", "7-4=3", "6+6=12", "9-5=4", "10+5=15", "8-3=5", "1+1=2", "20-10=10"],
  });

  dazu({
    id: id("mal"), title: "Vezes e dividido por",
    introducedUnits: einheiten("×÷"),
    introDu: z(
      "Mais dois sinais: «vezes» × (pontos 2-3-6) e «dividido por» ÷ (pontos 2-5-6). Escrevem-se como os outros sinais de cálculo: «3×4=12», «6÷3=2».",
      "Mais dois sinais: «vezes» × (pontos 2-3-6) e «dividido por» ÷ (pontos 2-5-6). Eles são escritos como os outros sinais de cálculo: «3×4=12», «6÷3=2».",
    ),
    introSie:
      "Multiplicação 2-3-6 e divisão 2-5-6 (Grafia Braille 2018, § 8, p. 25; § 22, p. 36). O sinal de multiplicação (2-3-6) é igual ao das aspas; o contexto decide.",
    legend: "× ÷",
    zeichen: ["×", "÷"],
    kind: "words",
    items: () => ["3×4=12", "2×5=10", "6÷3=2", "8÷2=4", "5×5=25", "9÷3=3", "7×2=14", "12÷4=3"],
  });

  dazu({
    id: id("texte"), title: "Ler e escrever textos inteiros",
    introducedUnits: [],
    introDu: z(
      "Muito bem, já conheces todo o braille básico! Agora lês e escreves pequenos textos inteiros.",
      "Muito bem, você já conhece todo o braille básico! Agora você lê e escreve pequenos textos inteiros.",
    ),
    introSie:
      "Etapa final: textos contínuos que reúnem todos os sinais ensinados (letras, acentos, maiúsculas, pontuação habitual).",
    legend: "",
    kind: "text",
    items: () => [...TEXTE],
  });

  return { etappen: B.etappen, levels: B.levels, pool: { woerter: WOERTER, namen: NAMEN, saetze: SAETZE, texte: TEXTE } };
}
