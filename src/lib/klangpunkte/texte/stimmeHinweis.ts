/**
 * Der ruhige Hinweis in Klangpunkte, wenn „Vorlesen" an ist, aber für die Sprache keine Stimme
 * auf dem Gerät installiert ist (`stimmeFuer(sprache, getVoices())` liefert `null`; `braille/voice.ts`
 * liest dann nicht vor, nie mit einer fremden Stimme).
 *
 * Eine Tabelle für ALLE zwölf Sprachen des Plans (de en fr es it nl sv pt br pl cs hu). Für `de`
 * und `en` steht der Text nur der Vollständigkeit halber da: Dort gilt der alte Weg
 * (`voice.ts` nimmt irgendeine de- bzw. en-Stimme), der Hinweis wird nie gezeigt.
 *
 * Der Hinweis ist KEINE Live-Region und nimmt den Fokus nicht (ein Screenreader liest die
 * Texte ohnehin). Wortlaut je Sprache: Stimme heißt in der Sprache „voix / voz / voce / stem /
 * röst / głos / hlas / hang". Anrede der Kinder wie in den übrigen Klangpunkte-Texten (du-Form).
 */
import type { KlangSprache } from "../tonnamen";

export const STIMME_HINWEIS: Readonly<Record<KlangSprache, string>> = {
  de: "Für diese Sprache ist auf diesem Gerät keine Stimme installiert, darum liest Klangpunkte nicht vor. Eine Stimme lässt sich in den Systemeinstellungen hinzufügen. Ein Screenreader liest die Texte weiterhin vor.",
  en: "No voice for this language is installed on this device, so Klangpunkte is not reading aloud. You can add a voice in your system settings. A screen reader will still read the texts.",
  fr: "Aucune voix pour cette langue n'est installée sur cet appareil, c'est pourquoi Klangpunkte ne lit pas à voix haute. Tu peux ajouter une voix dans les réglages du système. Un lecteur d'écran continue de lire les textes.",
  es: "No hay ninguna voz instalada para este idioma en este dispositivo, por eso Klangpunkte no lee en voz alta. Puedes añadir una voz en los ajustes del sistema. Un lector de pantalla seguirá leyendo los textos.",
  it: "Su questo dispositivo non è installata nessuna voce per questa lingua, perciò Klangpunkte non legge ad alta voce. Puoi aggiungere una voce nelle impostazioni di sistema. Uno screen reader continua a leggere i testi.",
  nl: "Op dit apparaat is geen stem voor deze taal geïnstalleerd, daarom leest Klangpunkte niet voor. Je kunt een stem toevoegen in de systeeminstellingen. Een schermlezer leest de teksten nog steeds voor.",
  sv: "Ingen röst för det här språket är installerad på den här enheten, därför läser Klangpunkte inte upp. Du kan lägga till en röst i systeminställningarna. En skärmläsare läser fortfarande upp texterna.",
  pt: "Não há nenhuma voz instalada para este idioma neste dispositivo, por isso o Klangpunkte não lê em voz alta. Podes adicionar uma voz nas definições do sistema. Um leitor de ecrã continua a ler os textos.",
  br: "Não há nenhuma voz instalada para este idioma neste dispositivo, por isso o Klangpunkte não lê em voz alta. Você pode adicionar uma voz nas configurações do sistema. Um leitor de tela continua lendo os textos.",
  pl: "Na tym urządzeniu nie zainstalowano głosu dla tego języka, dlatego Klangpunkte nie czyta na głos. Głos można dodać w ustawieniach systemu. Czytnik ekranu nadal odczytuje teksty.",
  cs: "V tomto zařízení není nainstalován hlas pro tento jazyk, a proto Klangpunkte nečte nahlas. Hlas můžeš přidat v nastavení systému. Čtečka obrazovky texty čte i nadále.",
  hu: "Ezen az eszközön nincs telepítve hang ehhez a nyelvhez, ezért a Klangpunkte nem olvas fel. A rendszerbeállításokban hozzáadhatsz egy hangot. A képernyőolvasó továbbra is felolvassa a szövegeket.",
};

/** Sprachen, für die der Hinweis nie erscheint (alter Weg in `voice.ts`). */
export const STIMME_HINWEIS_NIE: readonly string[] = ["de", "en"];
