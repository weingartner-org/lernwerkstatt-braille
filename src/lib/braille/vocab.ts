/**
 * Wortschatz der Nicht-Text-Level (Schreiben/Lesen). Bewusst groß, damit sich
 * innerhalb eines Levels (10 Stufen × 10 Zeilen = 100 Aufgaben) möglichst nichts
 * wiederholt. Generiert + streng geprüft (Zeichenvorrat je System, Lautgruppen,
 * transkribierbar via Engine). Erweitern = Einträge ergänzen (Test wacht).
 */

export const L1_AJ: string[] = ["a","b","c","d","e","f","g","h","i","j","bad","bach","dach","fach","ach","ade","fad","fade","gabe","habe","hieb","dieb","die","ehe","fee","eibe","geige","beige","feige","idee","egge","hai","biege","hege","fege","gib"];

export const L2_KT: string[] = ["k","l","m","n","o","p","q","r","s","t","klima","lampe","stern","rose","liste","palme","nest","post","start","monitor","planet","salat","pilot","motor","radio","tomate","sonate","normal","total","mond","last","mast","rast","ast","kran","plan","brot","gras","hose","sofa","tasse","kanne","ratte","otter","igel","esel","apfel","mantel","kessel","trommel","trompete","nadel","stein","blatt","panther","tropfen","insel","leiter","note","probe","kette","spaten","stiefel","raster","platte","matte","tante","onkel","oma","opa","saal","reise","strand","liter","meter"];

export const L3_REST: string[] = ["u","v","w","x","y","z","ä","ö","ü","ß","blau","Zug","über","grün","süß","Fuß","Bär","Möwe","Wolf","Vogel","Qualle","Xylophon","Yak","Zebra","würde","Glück","Brücke","Wüste","voll","Wasser","Sonne","Auto","Uhu","Vase","Wald","Zaun","Übung","Löwe","Käfer","Hügel","Frühling","Wurzel","Vogelhaus","Wurm","Zwerg","Zwiebel","Würfel","Vater","Wüstenfuchs","Zypresse","Hexe","Box","Taxi","Galaxie","Pyramide","System","Typ","Dynamo","Symbol","Rhythmus","Yoga","Krokus","Kaktus","Kuh","Maus","Haus","Baum","Blume","Wiese","Wind","Winter","Wunder","Wunsch","Vulkan","Möhre","Öl","König","Königin","Mühle","Bühne","Tür","Schüssel","Müll","Hütte","Süden","Würze","Gemüse","Fünf","Hunger","Mund","Stuhl","Schule","Mutter","Bruder","Junge","Luft","Buch","Suppe","Butter","Zucker","Burg","Nuss","Pflug","Drucker","Flügel","Vögel","Käse"];

export const L4_WOERTER: string[] = ["Haus","Maus","Baum","Blume","Sonne","Mond","Stern","Kind","Buch","Tisch","Apfel","Wasser","Freund","Katze","Hund","Vogel","Garten","Schule","Lehrer","Banane","Fenster","Stuhl","Lampe","Brille","Schuh","Jacke","Regen","Wolke","Berg","Fluss","Wald","Wiese","Pferd","Kuh","Schwein","Schaf","Ziege","Hase","Igel","Fuchs","Hirsch","Maulwurf","Biene","Käfer","Schmetterling","Fisch","Frosch","Spinne","Ameise","Eule","Adler","Wolf","Bär","Löwe","Tiger","Elefant","Affe","Giraffe","Auge","Nase","Ohr","Mund","Hand","Fuß","Bein","Arm","Kopf","Haar","Zahn","Herz","Bauch","Rücken","Finger","Knie","Brot","Butter","Käse","Wurst","Milch","Saft","Tee","Kaffee","Zucker","Salz","Suppe","Kuchen","Keks","Eis","Honig","Birne","Traube","Kirsche","Erdbeere","Zitrone","Tomate","Gurke","Kartoffel","Möhre","Zwiebel","Tafel","Kreide","Heft","Stift","Bleistift","Schere","Kleber","Mappe","Ranzen","Pause","Mutter","Vater","Bruder","Schwester","Oma","Opa","Onkel","Tante","Baby","Familie","Tür","Wand","Boden","Decke","Treppe","Keller","Küche","Bett","Sofa","Schrank","Teppich","Regal","Spiegel","Computer","Handy","Maschine","Roboter","Drucker","Bildschirm","Kabel","Akku","Knopf","Hose","Hemd","Kleid","Rock","Mantel","Mütze","Socke","Schal","Pulli","Handschuh","Gürtel","Schnee","Sturm","Donner","Blitz","Nebel","Frost","Hitze","Wind","Sport","Ball","Spiel","Lauf","Sprung","Rad","Boot","Tor","Sieg","Mannschaft","Straße","Stadt","Dorf","Brücke","Auto","Zug","Schiff","Flugzeug","Insel","Meer","See","Stein","Sand","Gras","Blatt","Wurzel","Ast","Nest","Feder"];

// ===========================================================================
// Basisschrift — Wortpools nach der KNIESE-REIHENFOLGE (Punktgenau).
// Belegte Experten-Sequenz, NICHT selbst erfunden: Reihenfolge der ersten zehn
// Zeicheneinführungen l,a,i,m,s,u,o,d,n,e nach der „Fibel für blinde Kinder"
// (Paul-und-Charlotte-Kniese-Stiftung), dokumentiert in Lang/Hofer (Hrsg.),
// „Didaktik des Unterrichts mit blinden und hochgradig sehbehinderten
// Schülerinnen und Schülern" (Kohlhammer), Tab. 1.4. Fortsetzung > 10 Zeichen
// nach taktiler Distinktheit/Häufigkeit (r,t,h · g,b,k · w,f,z · p,v,j · c,q,x,y),
// Umlaute/ß als geschlossene Gruppe. Die Übungswörter sind selbst zusammengestellt
// (kein Lehrwerks-Text kopiert) und so geprüft, dass jedes Wort nur Buchstaben aus
// seiner bis dahin kumulierten Menge enthält. Die einzelne Basis-Etappe (etappen.ts)
// filtert diesen Pool über ihre erlaubte Buchstabenmenge — dadurch entstehen sofort
// echte Wörter (Mama, Lama …) statt isolierter Zeichen (Lang: Ganzwort-Einstieg).
// Eigenständiger Pool: die eingefrorenen Level-Wortlisten (L1_AJ/L2_KT/L3_REST,
// genutzt von den Arbeitsheft-Embeds) bleiben dadurch unverändert.
export const BASIS_KNIESE: string[] = [
  // b1 — l, a, i, m
  "l","a","i","m","mama","lama","mami","mila","lila","aal","lamm",
  // b2 — + s, u, o
  "s","u","o","maus","oma","omi","lisa","mais","mus","sumo","lasso","salami","miso","also","los","aus","uli","susi","moos","soll","sims",
  // b3 — + d, n, e  (Kniese-10 komplett)
  "d","n","e","nadel","dame","nase","mond","ende","limo","dose","made","lade","mode","nudel","sand","insel","esel","sonne","nonne","demo","idee","eis","dino","limonade","mandel",
  // b5 — + r, t, h
  "r","t","h","rad","tante","hand","tier","uhr","hut","tor","rose","rat","mauer","monitor","motor","natur","autor","rate","miete","mieter","herd","draht","naht","hase","hose","mantel",
  // b6 — + g, b, k
  "g","b","k","tag","berg","kind","brot","garten","bagger","kran","krone","gabel","kabel","banane","kino","bohne","gans","gabe","kugel","kamin","klang","korb",
  // b7 — + w, f, z
  "w","f","z","wald","fee","zug","wind","wolf","zahl","zeit","wagen","fenster","wasser","zwerg","wurm","fluss","zwei","waffel","zaun","feder","fett","witz",
  // b8 — + p, v, j
  "p","v","j","apfel","vogel","pilz","januar","juni","juli","vase","vater","vier","pferd","park","puppe","video","pflanze","jaguar","pause","vorhang",
  // b9 — + c, q, x, y  (alle 26 Buchstaben eingeführt)
  "c","q","x","y","quark","qualle","quiz","taxi","boxer","hexe","nixe","axt","yoga","baby","typ","party","cafe","clown","creme","cousin","lyrik",
  // b10 — + ä, ö, ü, ß
  "ä","ö","ü","ß","bär","schön","tür","fuß","käse","größe","füße","löwe","möbel","hände","bäcker","süß","grün","wüste","hügel","mütze","könig","öl","frühling",
];

// b4 — Großbuchstaben über Eigennamen (früh, Lang: Ganzwort/logographemischer
// Einstieg). Nur die zehn Kniese-Buchstaben (l,a,i,m,s,u,o,d,n,e), groß angekündigt.
export const BASIS_NAMEN: string[] = ["Lisa","Mona","Udo","Sina","Nina","Ida","Mia","Elsa","Lena","Lina","Nele","Dino","Anna","Enno","Noa","Mio","Ole","Una","Imo","Aida"];

export const L5_SAETZE: string[] = ["Die Sonne scheint hell.","Ich gehe in die Schule.","Der Hund ist sehr müde.","Wir lesen ein Buch.","Mein Freund spielt im Garten.","Was machst du heute?","Komm schnell zu mir!","Die Katze schläft auf dem Sofa.","Das Wetter ist heute schön.","Es regnet den ganzen Tag.","Der Vogel singt im Baum.","Ich trinke ein Glas Milch.","Die Blume blüht im Frühling.","Wir essen jetzt zu Mittag.","Mein Bruder fährt mit dem Rad.","Die Kinder lachen sehr laut.","Der Lehrer schreibt an die Tafel.","Ich male ein buntes Bild.","Die Maus läuft schnell weg.","Wir gehen heute in den Park.","Das Eis schmeckt mir sehr gut.","Der Ball rollt über die Wiese.","Meine Mutter kocht eine Suppe.","Ich helfe gern im Haushalt.","Die Sterne leuchten am Himmel.","Der Schnee fällt leise herab.","Wir bauen einen großen Turm.","Das Auto fährt durch die Stadt.","Mein Vater liest die Zeitung.","Die Ente schwimmt auf dem See.","Ich höre gern laute Musik.","Der Apfel ist rot und süß.","Wir feiern heute ein Fest.","Die Schule beginnt um acht.","Der Frosch springt ins Wasser.","Ich putze mir die Zähne.","Die Wolken ziehen langsam weg.","Mein Hund bellt sehr laut.","Wir spielen zusammen im Sand.","Das Brot ist noch ganz warm.","Der Wind weht durch die Bäume.","Ich freue mich auf morgen.","Die Biene fliegt von Blume zu Blume.","Wir wandern auf den Berg.","Das Buch ist sehr spannend.","Mein Opa erzählt eine Geschichte.","Die Katze fängt eine Maus.","Ich ziehe meine Jacke an.","Der Zug kommt pünktlich an.","Wir backen einen leckeren Kuchen.","Die Tür ist fest verschlossen.","Mein Freund wohnt ganz nah.","Das Pferd läuft über das Feld.","Ich wasche mir die Hände.","Die Lampe gibt ein warmes Licht.","Wir fahren ans weite Meer.","Der Fisch schwimmt im klaren Wasser.","Mein Bett ist warm und weich.","Die Blätter fallen vom Baum.","Ich packe meinen Ranzen ein.","Der Mond steht hoch am Himmel.","Wir singen ein fröhliches Lied.","Das Kind weint ganz leise.","Die Sonne geht langsam unter.","Mein Bruder isst eine Banane.","Wir gehen früh ins Bett.","Der Garten ist voller Blumen.","Ich lese meiner Oma vor.","Die Schule ist heute aus.","Wir laufen schnell nach Hause.","Das Wasser ist eiskalt.","Mein Hund holt den Ball.","Die Vögel fliegen nach Süden.","Ich trinke heißen Tee.","Der Schmetterling ist sehr bunt.","Wir öffnen das große Fenster.","Das Spiel macht großen Spaß.","Mein Vater repariert das Rad.","Die Katze sitzt am Fenster.","Ich schenke dir eine Blume.","Der Regen hört bald auf.","Wir essen Brot mit Käse.","Das Auto ist ganz neu.","Mein Freund ruft mich an.","Die Kuh steht auf der Weide.","Ich male die Sonne gelb.","Der Tisch ist schon gedeckt.","Wir gehen heute schwimmen.","Das Licht ist viel zu hell.","Mein Schuh ist ganz nass.","Die Uhr zeigt schon zwölf.","Ich freue mich sehr darüber.","Der Hase hoppelt durch das Gras.","Wir lernen heute viel Neues.","Das Haus ist sehr alt."];

export const L7_SATZZEICHEN: string[] = ["Hallo!","Ja, gern.","Was ist das?","Toll!","Komm, wir gehen!","Wirklich?","Achtung: Stufe!","Nein, danke.","Wer bist du?","Oh, schön!","Halt, stopp!","Gut gemacht!","Pass auf!","Na, endlich!","Wie geht es dir?","Vorsicht, heiß!","Super, weiter so!","Warum denn nicht?","Klar, machen wir.","Au, das tut weh!","Schau mal, dort!","Hilfe, schnell!","Wann kommst du?","Bitte, setz dich.","Moment, ich komme!","Wow, fantastisch!","Echt jetzt?","Los, beeil dich!","Hm, vielleicht.","Danke, sehr nett!","Was soll das?","Oje, schade.","Ruhe, bitte!","Aha, verstehe.","Stimmt das?","Mensch, toll!","Komm her!","Lauf, schnell!","Wo bist du?","Hurra, geschafft!","Tja, so ist das.","Ende; aus.","Nun gut.","Achtung: Auto!","Wirklich wahr?","Oh nein!","Ja, klar!","Geht das?","Vorsicht!","Pscht, leise!","Er fragte: Warum?","Bravo, weiter!","Stopp, halt!","Wie bitte?","Na, los!","Ach, schade.","Komm doch!","Hey, du!","Fertig, los!","Igitt, bah!"];

// Basis: erweiterte Satzzeichen (additiv, nach b12). Doppelpunkt, Semikolon,
// Apostroph, Klammern und Anführungszeichen — alle Buchstaben sind nach b11
// bekannt, NEU sind nur diese Satzzeichen (6-Punkt-SYMBOLS_6 kennt sie alle).
export const BASIS_SATZZEICHEN: string[] = ["Lisa fragt: Wer kommt mit?","Achtung: Die Stufe ist hoch!","Merke: Üben hilft immer.","Der Plan ist klar: Wir starten um acht.","Mama ruft: „Komm schnell her!“","Der Lehrer sagt: „Setzt euch bitte.“","Es regnet; wir bleiben heute drinnen.","Tom liest; Mia malt ein Bild.","Erst kommt die Pflicht; dann das Spiel.","Das Haus (es ist sehr alt) steht am See.","Wir treffen uns (wie immer) um drei.","Mein Bruder (er ist zehn) spielt Klavier.","Nimm den Ball (den roten) und wirf ihn!","„Halt, stopp!“, ruft der Mann laut.","„Guten Morgen!“, sagt die nette Frau.","Sie fragt: „Wie heißt du denn?“","Wie geht's dir heute so?","Heut' ist es richtig kalt.","Das gibt's doch gar nicht!","Er hat's mir schon erzählt.","Die Liste: Brot, Milch und Käse.","Ich packe ein: Heft, Stift und Buch.","Vorsicht: Der Boden ist nass!","Anna lacht; Paul weint ganz leise.","Komm her (aber leise) und schau!","„Bravo!“, rufen alle Kinder froh.","Tim sagt: „Das war wirklich toll.“","Frage: Wer hat das gemacht?","Frag ihn: Kommst du heute mit?","Der Topf (er ist heiß) steht da.","„Au!“, ruft das Kind erschrocken.","Hol bitte: Teller, Tasse und Glas."];

// Vollschrift: dieselben Satzzeichen WIEDERHOLT (Johannes: in Basis lernen, in
// Voll festigen), jetzt in Sätzen mit Lautgruppen (ei, ie, au, eu, ch, sch, st).
export const VOLL_SATZZEICHEN: string[] = ["Heidi fragt: „Wer kommt mit?“","Achtung: Der Stein ist scharf!","Schau (ganz leise) aus dem Fenster.","Der Meister sagt: „Schreib es auf.“","Es ist weit; wir laufen ganz schnell.","Die Reise (sie war schön) ist nun aus.","„Steig ein!“, ruft der Mann laut.","Wie heißt dein bester Freund?","Frau Strauß ruft: „Kommt herein!“","Drei Mädchen (sie lachen) spielen froh.","Merke: Eile mit Weile!","Der Zeiger steht auf drei; es ist Zeit.","„Bleib stehen!“, sagt die Frau streng.","Im Eimer (er ist leer) war Wasser.","Peter fragt: „Scheint die Sonne?“","Wir steigen auf; der Weg ist steil.","Das Kleid (es ist weiß) ist sehr schön.","„Schau her!“, ruft das kleine Kind.","Der Reiter ruft: „Lauf schneller!“","Heute regnet's; morgen scheint die Sonne.","Sie schreibt: „Ich freue mich sehr.“","Beeil dich: Der Zug fährt gleich!","„Wie schön!“, ruft die ganze Reihe.","Der Stein (er ist schwer) liegt da.","Der Bauer (er ist alt) mäht das Heu.","„Lauf schnell!“, ruft sie und zeigt hin.","Heute scheint die Sonne; morgen schneit es.","Frag laut: Wer hat das Eis geholt?","Das Reh (es ist scheu) läuft schnell weg.","Der Teich (er ist tief) glänzt im Licht.","Sie liest leise; er schreibt einen Brief."];

export const VOLL_EI_IE: string[] = ["mein","dein","sein","kein","Stein","klein","eins","zwei","drei","Wein","Bein","Reise","Eis","Zeit","Arbeit","Seite","weit","breit","Kleid","Meister","Eimer","Eiche","Eile","leise","heiß","Fleisch","Geist","Kreis","Preis","Reis","weiß","weise","Zweig","Teig","Seil","Heim","Reim","Keim","Beil","frei","reich","weich","Teich","Reich","zeigen","steigen","schreiben","bleiben","treiben","reiben","scheinen","weinen","meinen","feiern","Feier","Leiter","Reiter","beide","Seide","Kreide","Weide","leiten","reiten","breiter","die","Liebe","Wiese","vier","Tier","Brief","fliegen","Spiegel","Riese","Knie","Bier","hier","niemand","Familie","spielen","viele","lieben","liegen","biegen","Ziel","Stiel","Kiel","tief","Dieb","Sieb","Lied","Miete","bieten","Wiege","Fliege","Biene","Schiene","Diele","Ferien","Linie","Studie","sie","wie","nie"];

export const VOLL_AU_EU_AEU: string[] = ["Haus","Baum","blau","Maus","Frau","auch","kaufen","laufen","Auge","Pause","euch","neu","heute","Freund","Leute","Feuer","teuer","Europa","Bäume","Häuser","läuft","träumen","Verkäufer","Mäuse","Säule","Gebäude","Raum","Traum","Zaun","Daumen","Schaum","Pflaume","grau","genau","schlau","faul","Maul","Gaul","sauber","Frauen","Pauke","Schauer","Mauer","Bauer","Auto","August","aus","Laub","Staub","Raub","laut","Haut","Kraut","Braut","brauchen","schauen","bauen","trauen","kauen","saugen","Auswahl","Ausgang","Beute","Heu","treu","neun","Leuchte","Häute","Kräuter","Räuber","Bräute","Zäune","Schläuche","Geräusch","Mäuler","Aufgabe","Augapfel","Eule","Beule"];

export const VOLL_CH_SCH_ST: string[] = ["ich","Buch","machen","Bach","Dach","lachen","Küche","Schule","Tisch","Fisch","Schiff","waschen","Tasche","Mensch","schön","Stern","ist","Fenster","Strand","Stuhl","kosten","beste","Geschichte","Wunsch","Busch","Kirsche","ach","noch","doch","Loch","Koch","kochen","suchen","Tuch","Woche","Kuchen","brechen","sprechen","Licht","Nacht","acht","Bucht","Frucht","Sucht","Schwester","Schnee","Schrank","Schloss","schlafen","schnell","schwer","schwarz","Tschüss","Mischung","Flasche","Dusche","Frosch","rasch","frisch","Wäsche","Kirche","stark","stehen","Stadt","Straße","Stunde","Stück","Stimme","still","stolz","Stiefel","Stoff","Stange","Station","Star","fast","Liste","Kiste","Wurst","Durst","erste","feste","Last","Mast","Most","Post","Rest","Test","Frost","Angst","gestern","beschreiben","verstehen","bestehen","Geschäft"];

export const VOLL_WOERTER: string[] = ["Eis","Haus","Schule","Freund","Stein","Wiese","Bäume","Fisch","heute","Strauß","Reise","Tisch","Wäsche","Steine","Brief","Spiegel","Geschichte","Fenster","Strand","kaufen","laufen","schön","Kirsche","Mensch","Auge","Feuer","Liebe","spielen","Stuhl","Wunsch","Baum","Maus","Blume","Schiff","Stunde","Wasser","Kleider","Sterne","Wolke","Vogel","Apfel","Birne","Traube","Erde","Sonne","Mond","Wald","Berge","Fluss","Straße","Brücke","Garten","Wiesen","Blätter","Wurzel","Pflanze","Schnee","Regen","Wind","Sturm","Wetter","Frühling","Sommer","Herbst","Winter","schreiben","lesen","rechnen","denken","fühlen","hören","sehen","stehen","gehen","kommen","bleiben","suchen","finden","geben","nehmen","tragen","fahren","fliegen","schwimmen","springen","tanzen","singen","lachen","weinen","schlafen","wachen","essen","trinken","kochen","backen","Kuchen","Brot","Milch","Honig","Zucker","Salz","Suppe","Teller","Tasse","Messer","Gabel","Löffel","Schüssel","Küche","Zimmer","Treppe","Decke","Boden","Mauer","Dach","Tür","Schlüssel","Schloss","Kirche","Turm","Glocke","Markt","Laden","Geld","Buch","Heft","Stift","Tafel","Schrift","Lehrer","Schüler","Kinder","Eltern","Bruder","Schwester","Tochter","Junge","Mädchen","Nachbar"];

export const VOLL_SAETZE: string[] = ["Das Haus ist sehr schön.","Ich lese ein gutes Buch.","Wir gehen heute weit weg.","Die Maus läuft sehr schnell.","Mein Freund ist schon hier.","Sie kauft frische Fische.","Der Stein liegt am Strand.","Schau, die Sonne scheint!","Die Kinder spielen im Garten.","Der Vogel singt ein Lied.","Wir essen heute frisches Brot.","Die Wiese ist grün und schön.","Mein Bruder fährt nach Hause.","Das Eis schmeckt sehr gut.","Die Blume steht im Fenster.","Der Hund läuft über die Straße.","Ich schreibe einen langen Brief.","Die Sterne leuchten in der Nacht.","Das Schiff fährt über das Wasser.","Wir bauen ein hohes Haus.","Die Katze schläft auf dem Stuhl.","Der Lehrer liest eine Geschichte vor.","Die Bäume stehen im tiefen Wald.","Mein Wunsch ist eine schöne Reise.","Das Feuer brennt sehr hell.","Die Wolke zieht über den Berg.","Wir suchen den kleinen Schlüssel.","Der Fluss fließt durch das Tal.","Die Schule beginnt am Morgen.","Ich höre die Glocke der Kirche.","Der Wind weht über die Wiese.","Die Schwester kauft frische Birnen.","Wir laufen schnell durch den Schnee.","Das Mädchen singt ein leises Lied.","Der Apfel fällt vom hohen Baum.","Die Steine liegen am kühlen Fluss.","Ich trinke gerne kalte Milch.","Der Junge schwimmt im klaren See.","Die Blätter fallen im Herbst.","Wir sehen den hohen Turm.","Das Kind lacht und spielt gern.","Die Sonne geht früh auf.","Mein Vater liest die Zeitung.","Die Wäsche trocknet im Wind.","Der Strauß steht auf dem Tisch.","Wir gehen durch die schöne Stadt.","Das Wasser ist kühl und klar.","Die Maus sucht ein Stück Brot.","Der Stern leuchtet sehr hell.","Ich kaufe einen frischen Kuchen.","Die Reise war sehr schön.","Der Fisch schwimmt im tiefen Meer.","Wir hören das Lied der Vögel.","Das Schloss steht auf dem Berg.","Die Treppe ist steil und hoch.","Mein Freund schreibt mir oft.","Die Wiese duftet nach Blumen.","Der Schnee fällt leise vom Himmel.","Wir backen einen großen Kuchen.","Das Buch liegt auf dem Tisch.","Die Kirsche schmeckt süß und gut.","Der Mensch braucht frische Luft.","Ich sehe das schöne Bild.","Die Brücke führt über den Fluss.","Wir spielen heute im Sand.","Das Pferd läuft über die Wiese.","Der Garten blüht im Frühling.","Die Eltern lieben ihre Kinder.","Mein Stuhl steht am Fenster.","Die Glocke läutet am Sonntag.","Wir fahren mit dem Schiff.","Das Licht scheint durch das Fenster.","Der Vogel fliegt hoch am Himmel.","Die Schüler lesen ein neues Buch.","Ich öffne die schwere Tür.","Die Blume wächst im warmen Sonnenlicht.","Der Strand liegt am blauen Meer.","Wir wandern durch den dichten Wald.","Das Feuer wärmt das ganze Zimmer.","Die Wäsche hängt an der Leine.","Mein Bruder spielt gern Klavier.","Der Regen fällt auf das Dach.","Wir suchen Beeren im Wald.","Das Mädchen liest eine Geschichte.","Die Steine glänzen in der Sonne.","Der Frühling bringt warme Tage.","Ich freue mich auf den Sommer.","Die Kinder bauen einen Schneemann.","Der Wald ist still und dunkel.","Wir trinken heißen Tee am Abend.","Das Schiff liegt ruhig im Hafen.","Die Wiese ist voller bunter Blumen.","Mein Freund kauft ein neues Heft.","Der Stern fällt vom dunklen Himmel.","Schau, der Hund springt hoch!","Wo ist mein kleiner Schlüssel?"];

export const COMP_BUCHSTABEN: string[] = ["haus","maus","buch","tisch","sonne","computer","tastatur","fenster","garten","blume","katze","hund","vogel","apfel","wasser","schule","banane","stuhl","lampe","brille","über","grün","süß","mädchen","könig","baum","wald","wiese","berg","fluss","meer","strand","himmel","wolke","regen","schnee","wind","feuer","erde","stein","sand","gras","busch","blatt","wurzel","frucht","beere","kirsche","traube","birne","pflaume","gurke","tomate","möhre","zwiebel","salat","brot","butter","käse","milch","saft","kaffee","kuchen","keks","schokolade","zucker","salz","pfeffer","suppe","nudel","reis","kartoffel","fleisch","fisch","huhn","schwein","pferd","kuh","schaf","ziege","ente","gans","biene","ameise","spinne","fliege","mücke","schmetterling","frosch","kröte","schlange","igel","hase","fuchs","wolf","bär","löwe","tiger","affe","elefant","giraffe","zebra","robbe","wal","möwe","türe","wand","decke","boden","treppe","keller","dach","schornstein","fahrrad","auto","zug","schiff","flugzeug","straße","weg","platz","markt","laden","bäcker","arzt","lehrer","schüler","freund","familie","mutter","vater","kind","junge","schwester","bruder","oma","opa","tante","onkel","nachbar","gärtner","koch","bauer","jäger","fischer","maler","sänger","tänzer","musik","lied","tanz","spiel","ball","puppe","würfel","kreide","heft","stift","schere","kleber","farbe","pinsel","papier","mappe","ranzen","jacke","hose","kleid","rock","schuh","socke","mütze","schal","handschuh","gürtel"];

export const COMP_GROSS: string[] = ["Anna","Berlin","Tom","Haus","Maus","Otto","Emil","Bonn","München","Wien","Schule","Familie","Deutschland","Europa","Montag","Januar","Karl","Lisa","Peter","Hamburg","Köln","Österreich","Mathe","Biologie","Maria","Paul","Julia","Felix","Sophie","Max","Hannah","Leon","Marie","Jonas","Laura","David","Sarah","Lukas","Klara","Frankfurt","Stuttgart","Dresden","Leipzig","Bremen","Salzburg","Graz","Linz","Zürich","Genf","Basel","Schweiz","Italien","Frankreich","Spanien","England","Polen","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag","Februar","März","April","Juni","Juli","August","September","Oktober","November","Dezember","Physik","Chemie","Deutsch","Englisch","Geschichte","Erdkunde","Musik","Sport","Kunst","Religion","Goethe","Schiller","Mozart","Beethoven","Einstein","Rhein","Donau","Elbe","Mosel","Alpen","Nordsee","Ostsee","Bodensee"];

export const COMP_SONDERZEICHEN: string[] = ["info@web.de","50%","a+b=c","#tag","x<y","(neu)","http://abc.de","a&b","3*4","1+2=3","max@mail.com","100%","y>x","<html>","a/b","ab-cd","key=value","@home","#1","tom@gmx.de","#2","75%","5-3=2","www.test.de","(alt)","p<q","r>s","name@firma.at","2*8=16","</p>","#top","a*b","c/d","ef-gh","x=10","@work","10+5","99%","(ok)","u<v","https://xy.de","lisa@web.de","#3","4/2=2","<br>","val&ref","key:1","#neu"];

// --- Computerbraille (8-Punkt): NEUE Sonderzeichen-Pools, additiv nach e19. ---
// Alle Zeichen sind in CHAR_TO_CELL_8 (Eurobraille). In Computer-Texten das
// GERADE " (Punkt 4) — die deutschen „ " gibt es nur in 6 Punkt.

// Satzzeichen am Computer: ! ? ' - : ; , in kurzen Ausdrücken.
export const COMP_SATZ: string[] = ["Hallo, Welt!","Wie geht's?","Achtung: Test!","Tom - der Beste","Ja; nein; klar","Wer? Du?","E-Mail: neu","Note: 1-2","Echt jetzt?","Stopp!","Los geht's!","Na: super!","Mega-cool!","Pause - jetzt!","Fertig: ok","Wow!","Hm; nun ja","Warum nicht?","Klar: ja!","Schnell - los!","Test 1: ok","Frage: was?","Halt!","Aha: so!","Nun: weiter","Top - oder?","Hey, du!","Echt: toll!","Mehr? Ja!","Ende: aus","Sehr - sehr gut!","Oh, schön!"];

// Klammern, Vergleiche & Code: [ ] { } < > | \ ~ ^ _ ( ) = & — echte Schnipsel.
export const COMP_CODE: string[] = ["if (a < b)","x = [1, 2, 3]","arr[0]","f(x) { }","a && b","a || b","x >= 10","y <= 5","obj = {}","list = []","a == b","a != b","p && q","~/home","C:\\Users","x^2","a_b_c","key: value","{ id: 1 }","[a, b]","x = y + 1","while (i)","return 0;","a | b","f = (a)","i++","arr[i]","#include","x &= 1","a >> 2","[1..9]","{ x: 0 }"];

// E-Mail, Web & Passwörter: @ . / _ - ! # $ = — authentische technische Eingaben.
export const COMP_NETZ: string[] = ["anna@schule.at","tom.berg@web.de","www.orf.at","info@firma.com","https://abc.de","user_42@mail.com","P@ss!2026","Tk9#mx_42","Son!ne-7","mail: a@b.de","/usr/bin","./start.sh","name_1@uni.at","x_y_z@mail.de","Geheim#99","Blau$tern7","admin@host.de","run-test.js","a-b-c.txt","Max_2026!","port: 8080","key=abc123","#hashtag","@username","www.test.com","login: max","pass: Hu7!","data_2.csv","ok@ok.at","Pw: Re9$t","new@mail.at","ftp://srv.de"];

// Währung & Symbole: € $ § ° % & * + - — Preise und Fachzeichen.
export const COMP_SYM: string[] = ["5 €","10 €","99 €","20 $","100 $","§ 22","§ 1","20 °C","0 °C","50 %","10 %","100 %","Tom & Co","A & B","2 * 3","4 + 5","§ 90","-5 °C","€ 7","$ 15","30 % weg","§ 211","25 °C","R & B","1 * 1","§ 5","75 %","12 €","9 € fix","-3 °C","M & M","§ 7"];

// Kurzschrift-Übungsmaterial siehe kurzschrift_material.ts (48 KFA-Lektionen,
// je Lektion nur bereits gelernte Kürzungen — build-time via liblouis geprüft).

// UEB-Übungsmaterial siehe ueb_material.ts (offizieller Lehrgang L4–L22,
// Australian Training Manual): je Lektion nur bereits gelernte Kürzungen —
// build-time via liblouis en-ueb-g2 geprüft, Rohtext aus dem projekteigenen
// englischen Korpus (typing/corpusEn.ts). Die alten Welt-Wortlisten sind entfallen.

/**
 * ★★★ VOLLSCHRIFT-GRENZFAELLE: hier gilt die Lautgruppe NICHT (23.09.2026)
 *
 * Die acht Vollschrift-Lautgruppen kuerzen nur, wo die Buchstaben wirklich
 * zusammengehoeren - also als EIN Laut gesprochen werden und im selben Wortteil
 * stehen. "Familie" endet auf i-e, aber getrennt gesprochen; "Haustuer" hat ein
 * s und ein t, die zu verschiedenen Wortteilen gehoeren.
 *
 * HERKUNFT DER AUSWAHL: gesucht in childLex (41.742 Woerter aus Kinderbuechern,
 * Altersstufen 6-8 / 9-10 / 11-12) - jedes Wort mit liblouis de-g1 uebersetzt
 * und behalten, wo die Buchstaben der Gruppe dastehen, ihre Zelle aber NICHT.
 * Bevorzugt sind die haeufigsten Woerter der Stufe 6-8. Gemessen, nicht geraten.
 *
 * ⚠️ Fuer "au" gibt es in diesem ganzen Kinderwortschatz KEINEN einzigen Fall -
 * a und u stehen dort immer im selben Wortteil. Die Etappe behauptet deshalb
 * nichts ueber au.
 *
 * Die Gegenstuecke (VOLL_GRENZ_GEGEN) sind Woerter, in denen dieselbe Gruppe
 * sehr wohl kuerzt - ohne sie waere die Etappe eine Ausnahmeliste statt einer
 * Unterscheidungsuebung. Beide Listen sind in
 * tests/braille-voll-grenzfaelle.test.ts Wort fuer Wort abgesichert.
 */
export const VOLL_GRENZ_FALLEN: string[] = [
  // st - der groesste Fall: ss+t und zusammengesetzte Woerter (s | T)
  "musste", "lässt", "isst", "passt", "frisst", "wusste", "vergisst", "müsste",
  "Haustür", "Geburtstag", "Samstag",
  // ie - getrennt gesprochen, meist am Wortende oder vor r/n
  "Familie", "Ferien", "Saurier", "Marienkäfer", "Kastanie", "Linie", "Folie",
  // sch - die Verkleinerung -chen nach einem s
  "bisschen", "Mäuschen", "Häuschen", "Radieschen", "Küsschen",
  // eu - die Vorsilbe be- vor u, und die Endung -eum
  "Museum", "beunruhigt", "Seeufer",
  // ei - die Vorsilben ge- und be- vor i
  "geirrt", "geimpft", "beinhalten",
  // äu und ch - je ein Fall im ganzen Kinderwortschatz
  "Jubiläum", "Comicheft",
];

/** Dieselben Gruppen, aber hier kuerzen sie - die Gegenprobe fuer das Kind. */
export const VOLL_GRENZ_GEGEN: string[] = [
  "Fenster", "Stein", "Stuhl", "Nest", "Stern",
  "Liebe", "Wiese", "vier", "Brief", "Knie", "spielen",
  "Tasche", "Schule", "waschen", "Fisch",
  "neun", "heute", "Freund", "Leute",
  "klein", "Eis", "weit",
  "Häuser", "Bäume", "läuft",
  "Buch", "machen", "Licht",
];

/** Saetze, in denen Falle und Gegenstueck nebeneinander stehen. */
export const VOLL_GRENZ_SAETZE: string[] = [
  "Die Familie liebt den Brief.",
  "Der Saurier frisst vier Blätter.",
  "In den Ferien spielen wir viel.",
  "Das Mäuschen sitzt in der Tasche.",
  "Ein bisschen Fisch ist in der Schule.",
  "Die Haustür ist aus Stein.",
  "Am Samstag musste er zum Fenster.",
  "Das Häuschen hat neun Bäume.",
  "Im Museum ist heute viel los.",
  "Der Marienkäfer läuft über das Buch.",
  "Am Geburtstag passt das Kleid.",
  "Die Linie ist klein und weit.",
];
