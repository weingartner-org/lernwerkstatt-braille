/**
 * Bereich `kapitel` - Magyar: Titel, Einführungen und Beschriftungen der Kapitel (`KLANG_ETAPPEN`).
 * `introDu` für Kinder (tegezés), `introSie` für Erwachsene und Lehrkräfte (unpersönlich, Fachsprache).
 * Fachwörter: ungarische Musiklehre (nyolcad hang, negyed hang, fél hang, egész hang, kereszt, bé,
 * feloldójel, kötőív, legato ív, korona, felütés, előjegyzés, számozott basszus - Grundwörter aus
 * `tonnamen.ts` Eintrag `hu`). Quellenangaben: „fej." = Kapitel, „tábl." = Tabelle.
 * Unsichere Wörter stehen im Bericht unter „Unsicher".
 */
import type { kapitel as De } from "../de/kapitel";

export const kapitel: typeof De = {
  noteSatz: (ton: string, wert: string): string => `${ton}: ${wert}`,
  noteWert: {
    achtel: "nyolcad hang",
    viertel: "negyed hang",
    halbe: "fél hang",
    ganze: "egész hang",
    sechzehntel: "tizenhatod hang (ugyanaz a cella, mint az egész hangé)",
  },
  kap: {
    "kp1": {
      titel: "Magas vagy mély? - Füleket hegyezni",
      introDu: "Mielőtt hangjegyeket tapintanánk, a legfontosabbat gyakoroljuk: a figyelmes hallgatást. Magasabb vagy mélyebb, fel vagy le - a füled dönt.",
      introSie: "Zenei készenlét az írás előtt (Taesch, első szakasz): a hangmagasság és az irány hallás útján történő megkülönböztetése mint a kottaolvasás alapja.",
      einheiten: {},
    },
    "kp2": {
      titel: "Kopogd a ritmust",
      introDu: "A zenének szívverése van. Hallgasd meg a hosszú és rövid hangokból álló mintát, és kopogd vissza a szóközzel.",
      introSie: "Ritmikai visszaadás a jelek szintje előtt (RNIB: egyik kéz olvas, a másik kopog - itt előzetes formában a szóközzel).",
      einheiten: {},
    },
    "kp3": {
      titel: "A hangok régi ismerősök",
      introDu: "Meglepetés: a hangokat már ismered! A c d e f g a h hang a Braille-ábécé d e f g h i j betűje - az ábécé egy lépéssel arrébb tolva. Az alapforma a nyolcad hang.",
      introSie: "A dekád-analógia lényege (Schmid/BBI műhely): a c-h hangmagasság = a d-j betű; a nyolcad forma mint a jelrendszer logikai alapformája (Krolick 1-1. bekezdés).",
      einheiten: {},
    },
    "kp4": {
      titel: "Első dallamok",
      introDu: "Most jön a zene: kis dallamok az új hangjaidból - meghallgatni, követni olvasva, leírni. Minden helyes hang megszólal!",
      introSie: "Korai értelmesség: rövid motívumok elszigetelt jelek helyett (Hadley-elv: hang minden gyakorlathoz).",
      einheiten: {},
    },
    "kp5": {
      titel: "Negyed hangok - jön a 6-os pont",
      introDu: "A trükk az értékekkel: a negyed hanghoz egyszerűen hozzájön a 6-os pont - pont úgy, ahogy az ábécében az a-j betűkből a következő sor lesz. Ugyanaz a hang, hosszabban szól.",
      introSie: "Hangértékek a dekád-mechanikával (6-os pont = negyed), De Garmo 3. fejezet.",
      einheiten: {},
    },
    "kp6": {
      titel: "Fél és egész hangok",
      introDu: "Hozzá a 3-as pont = fél hang. A 3-as ÉS a 6-os pont = egész hang. Így mind a négy alapértéket ismered - és hallod, milyen különböző hosszan szólnak.",
      introSie: "Az értékfokozatok kiegészítése (De Garmo 4-5. fejezet): fél hang (+3), egész hang (+3+6).",
      einheiten: {},
    },
    "kp7": {
      titel: "Szünetek és ütem",
      introDu: "A csend is zene: a négy szünet. És a Braille-kotta legviccesebb dolga: az ütemvonal egyszerűen a szóköz!",
      introSie: "Szünetjelek (Krolick 1A táblázat) + ütemmutató és ütemvonal (3-6. és 1-7. bekezdés): ütemvonal = szóköz.",
      einheiten: {
        "r:ganze": "egész szünet",
        "r:halbe": "fél szünet",
        "r:viertel": "negyed szünet",
        "r:achtel": "nyolcad szünet",
        "sig:4/4": "négynegyedes ütemmutató",
        "sig:3/4": "háromnegyedes ütemmutató",
      },
    },
    "kp8": {
      titel: "Pontozott hangok",
      introDu: "Egy pont másfélszer olyan hosszúvá teszi a hangot. A Braille-ben SAJÁT cellát kap: a 3-as pontot, közvetlenül a hang után.",
      introSie: "A nyújtópont mint következő cella (Krolick 1-2. bekezdés).",
      einheiten: {
        "dot": "nyújtópont (pontozott hang)",
      },
    },
    "kp9": {
      titel: "Kereszt, bé és feloldójel",
      introDu: "Néha egy hang fél lépést elmozdul: a kereszt feljebb viszi, a bé lejjebb, a feloldójel visszacsinálja. A jel közvetlenül a hang ELŐTT áll.",
      introSie: "Módosítójelek a hang előtt (Krolick III. fejezet, De Garmo 6. fejezet - szándékosan az oktávjelek ELŐTT).",
      einheiten: {
        "acc:kreuz": "kereszt",
        "acc:be": "bé",
        "acc:aufloesung": "feloldójel",
      },
    },
    "kp10": {
      titel: "Oktávjelek - a fekvés",
      introDu: "A Braille-kottában nincs kulcs! Helyette az oktávjelek mondják meg, MILYEN magasan van egy hang. Egy darab első hangja mindig kap egyet.",
      introSie: "Oktávjelek kulcs helyett (Krolick 1-8. és 1-9. bekezdés; De Garmo 7. fejezet - az értékfokozatok után).",
      einheiten: {
        "oct:3": "oktávjel: kis oktáv",
        "oct:4": "oktávjel: egyvonalas oktáv",
        "oct:5": "oktávjel: kétvonalas oktáv",
      },
    },
    "kp11": {
      titel: "Oktávjelek - a szabályok",
      introDu: "Mikor kell egy hangnak oktávjel? Szekund és terc: soha. Kvart és kvint: csak oktávváltáskor. Szexttől felfelé: mindig. Légy oktávdetektív!",
      introSie: "Kitételi szabályok (Krolick 1-10. bekezdés) döntési feladatként - a dokumentáltan leggyakoribb technikai akadály (NLS).",
      einheiten: {},
    },
    "kp12": {
      titel: "Egész vagy tizenhatod?",
      introDu: "A Braille-kotta egyik titka: ugyanaz a cella jelenthet egész hangot VAGY tizenhatodot! Az ütem elárulja, melyikről van szó. Igazi detektívmunka!",
      introSie: "Érték-kétértelműség (Krolick 1. fejezet, „Egész hang vagy tizenhatod?”): egyértelműsítés az ütemmutató és a szövegkörnyezet alapján.",
      einheiten: {},
    },
    "kp13": {
      titel: "Ismétlés és forma",
      introDu: "A zene szereti ismételni magát - a Braille pedig okosan rövidít: egy saját jel azt mondja, hogy ezt az ütemet még egyszer! Mellé: ismétlőjelek és a záróvonal.",
      introSie: "Ismétlési és formai jelek (Krolick IX. fejezet): a simile ⠶ mint a Braille saját rövidítő eszköze, ismétlőjelek, záróvonal.",
      einheiten: {
        "sim": "ütemismétlés (simile)",
        "rep-start": "ismétlés kezdete",
        "rep-end": "ismétlés vége",
        "final": "záróvonal",
      },
    },
    "kp14": {
      titel: "Dalműhely",
      introDu: "Most igazi zenét játszol! Válassz egy dalt - meghallgatni, Braille-ben olvasni, emlékezetből leírni. Előbb olvasd el, aztán halld a fejedben, aztán játszd el.",
      introSie: "Alkalmazás valódi repertoáron: elolvasni - megjegyezni - eljátszani (RNIB) + dallamdiktálás (Taesch); két polc (gyerekdalok / klasszikus és örökzöld dalok), minden dallam közkincs, saját átiratok.",
      einheiten: {},
    },
    "kp-haltebogen": {
      titel: "A kötőív",
      introDu: "Két egyforma hang, EGY hosszú hang: a kötőív összeköti őket - a másodikat nem ütöd le újra. A Braille-ben ez két cella közvetlenül a hang után.",
      introSie: "Kötőív (Krolick VI. fejezet): ⠈⠉ a hang után; előbb a kötött és különálló hangok hallás útján történő megkülönböztetése, aztán az írásforma (De Garmo korán, a fél hangokkal együtt vezeti be, 4. fejezet).",
      einheiten: {
        "tie": "kötőív (két cella: 4-es pont, aztán 1-es és 4-es pont)",
      },
    },
    "kp-auftakt": {
      titel: "Felütés és csonka ütemek",
      introDu: "Nem minden ütem teljes: az elején állhat egy rövid felütés, a végén egy maradék ütem. És ha a sor az ütem közepén ér véget, a zenei kötőjel segít.",
      introSie: "Csonka ütemek, felütés + zenei kötőjel (Krolick III. és IX. fejezet; De Garmo: csonka ütemek): ütemszámolás hallás- és írásgyakorlatként.",
      einheiten: {
        "hyphen": "zenei kötőjel (az ütem a következő sorban folytatódik)",
      },
    },
    "kp-pausen2": {
      titel: "Hosszú csend",
      introDu: "Ha sok ütem csendes, a Braille okosan számol: legfeljebb három üres ütemnél egyszerűen többször áll az egész szünet - négytől a szám áll előtte.",
      introSie: "Többütemes szünetek (Krolick 1-7. bekezdés): ⠍⠍⠍, illetve szám + egész szünet; számolási, írási és hallási gyakorlatok.",
      einheiten: {
        "mrest:4": "többütemes szünet (számjel, darabszám, egész szünet)",
      },
    },
    "kp-tonart": {
      titel: "Elöl áll a hangnem",
      introDu: "A legelején álló keresztek vagy bék az EGÉSZ darabra érvényesek: ez az előjegyzés. Háromig a jel ismétlődik, négytől egy szám áll előtte - és utána rögtön jön az ütemmutató.",
      introSie: "Előjegyzés (Krolick 3-4. bekezdés; De Garmo 6. fejezet): ismétlő forma háromig, számos forma négytől; a darab feje = hangnem és ütemmutató együtt (3-5. bekezdés).",
      einheiten: {
        "key:2:kreuz": "előjegyzés: két kereszt (D-dúr)",
        "key:2:be": "előjegyzés: két bé (B-dúr)",
        "key:4:kreuz": "előjegyzés: négy kereszt - négytől számjellel (E-dúr)",
      },
    },
    "kp-taktwechsel": {
      titel: "Változik az ütem",
      introDu: "A darab közepén is állhat új ütemmutató - onnantól másképp számolunk. Mellé két különleges jel: a C (négynegyedes ütem) és az alla breve (kétfeles ütem).",
      introSie: "Ütemmutató-váltás + különleges ütemmutatók: C és alla breve (Krolick 3-6. és 3-8. bekezdés; De Garmo 10. fejezet).",
      einheiten: {
        "csig": "C - a négynegyedes ütem",
        "acsig": "alla breve - a kétfeles ütem",
      },
    },
    "kp-schluessel": {
      titel: "Kulcsok - csak hogy tudd",
      introDu: "Violinkulcs és basszuskulcs a Braille-ben is van - de csak tájékoztatásként a nyomtatott kottáról! A fekvést mindig az oktávjelek mondják meg. Jó ismerni, ha látó zenészekkel beszélgetsz, vagy a MuseScore programmal dolgozol.",
      introSie: "Kulcsjelek (Krolick II. fejezet - kifejezetten tájékoztató jellegű; ellenőrzés: music21): híd a nyomtatott kottához.",
      einheiten: {
        "clef:violin": "violinkulcs (három cella)",
        "clef:bass": "basszuskulcs (három cella)",
        "clef:alt": "C-kulcs (három cella)",
      },
    },
    "kp-sechzehntel": {
      titel: "Fürge tizenhatodok",
      introDu: "A tizenhatodok UGYANAZT a cellát használják, mint az egész hang - a trükköt már ismered az „Egész vagy tizenhatod?” fejezetből. Új: csoportban csak az ELSŐ hang hordozza az értékpontokat, a többi nyolcadnak látszik.",
      introSie: "Kis értékek + csoportosítási szabály (Krolick 4-2. bekezdés; De Garmo 15. fejezet): értékpontok csak a csoport első hangján - a gerendázás Braille-megfelelője.",
      einheiten: {},
    },
    "kp-triolen": {
      titel: "Triolák és szokatlan csoportok",
      introDu: "Három hang osztozik egy ütésen, ahol máskor kettő lakik: ez a triola. A Braille-ben a jele (2-es és 3-as pont) egyszer áll a csoport előtt.",
      introSie: "Szabálytalan csoportok (Krolick IV. fejezet; De Garmo 16. fejezet): triolajel ⠆; a duola és a triola megkülönböztetése először hallás útján.",
      einheiten: {
        "tri": "triolajel (egyszer, a hármas csoport előtt)",
      },
    },
    "kp-puls": {
      titel: "Lüktetésvadász",
      introDu: "Minden zenének van szívverése - az alaplüktetés. Kapd el: kopogd egyenletesen, halld meg a hangsúlyos ütéseket, és különböztesd meg az indulót (kettes) a keringőtől (hármas).",
      introSie: "Lüktetésérzék az írás előtt (KOMU MKe, ABRSM Aural G1): az alaplüktetés tartása, kettes és hármas ütem megkülönböztetése a hangsúly alapján - mozgással rögzítve (látássérült tanulók gyakorlata: kopogni, nem csak hallgatni).",
      einheiten: {},
    },
    "kp-lauschen-dauer": {
      titel: "Hosszú vagy rövid?",
      introDu: "Mielőtt hangértékeket írsz, meghallod őket: melyik hang szólt hosszabban? Hány ütésig tartott? A füled HANGZÁSKÉNT ismeri meg a negyed, a fél és az egész hangot.",
      introSie: "Előbb a hang, aztán a jel (Taesch): hangtartamok összehasonlítása és megnevezése először hallás útján (KOMU MKe, előkészítés a kp5 és kp6 értékeihez).",
      einheiten: {},
    },
    "kp-lauschen-dynamik": {
      titel: "Hangos és halk",
      introDu: "A zene a hangos és a halk váltakozásától él. Figyelj: hangos vagy halk? Hangosabb lesz vagy halkabb? Hol van a hangsúlyos hang? Ez a Braille-dinamika előgyakorlata.",
      introSie: "A dinamika hallás útján történő előkészítése (Aural G1): forte és piano, crescendo és decrescendo, akcentus először hallva - mielőtt a 4. világ behozza a jeleket.",
      einheiten: {},
    },
    "kp-instrumente": {
      titel: "Melyik hangszer?",
      introDu: "Zongora, gitár, szaxofon vagy fuvola - mindegyik másképp szól. Hallgasd a hangszínt: melyik hangszer játszik? Két motívum ugyanattól a hangszertől szól, vagy különbözőktől?",
      introSie: "Hangszínek megkülönböztetése (KOMU MKe): megütött, pengetett, fújt - a négy szintetizált hanggal.",
      einheiten: {},
    },
    "kp-echo": {
      titel: "Visszhangjáték",
      introDu: "Én játszom, te utánam játszod! Hallgass meg egy kis hangsort, és játszd el a billentyűzeten - a D F G H J K L billentyű a c d e f g a h hang. Csak a hangok számítanak, a ritmus szabad.",
      introSie: "Visszhang-utánjátszás mint a készséglépcső első foka (Gordon, hallás és ének): hangterjedelem g-e → +a → pentatónia (Kodály), a bevitel hallhatóan visszajátszva.",
      einheiten: {},
    },
    "kp-melodie-memory": {
      titel: "Dallammemória",
      introDu: "Mint a memóriajáték, csak hangokkal: ha sikerül a sor, jön hozzá még egy hang. Meddig jutsz? Emlékezetjáték a belső fülnek.",
      introSie: "Belső hallás és emlékezet (Simon-elv, Gordon): növekvő hangsorok utánjátszása; csillagok a legjobb hossz alapján (§12).",
      einheiten: {},
    },
    "kp-bindebogen": {
      titel: "A legato ív",
      introDu: "A legato ív azt mondja: játszd ezeket a hangokat lágyan, kötve, legato. Ne keverd össze a kötőívvel! Az egyforma hangokat köti EGGYÉ - a legato ív különböző hangokat kapcsol össze.",
      introSie: "Frazeálás (Krolick VI. fejezet, §6-2 és §6-3): legato ív ⠉ minden hang után az utolsó kivételével, négy hang fölött kettőzve; a kötőív és a legato ív összetévesztését tudatosan szembeállítja.",
      einheiten: {
        "slur": "legato ív (1-es és 4-es pont - minden hang után az utolsó kivételével)",
        "slur-bracket": "frazeálóív zárójeles formában (csak felismerésre)",
      },
    },
    "kp-artikulation": {
      titel: "Staccato, akcentus és társaik",
      introDu: "Hogyan szólaljon meg egy hang? Röviden elválasztva (staccato), teljesen kitartva (tenuto) vagy hangsúlyosan (akcentus)? Ezek a jelek a hang ELŐTT állnak - csak a korona, amely a zárást megtartja, áll utána.",
      introSie: "Artikuláció (Krolick X. fejezet, KOMU MK1 szókincs): staccato, tenuto, akcentus a hang előtt (négytől kettőzve), korona a hang után, soha nem kettőzve.",
      einheiten: {
        "art:staccato": "staccato (2-es, 3-as és 6-os pont - a hang előtt)",
        "art:tenuto": "tenuto (4-es, 5-ös és 6-os pont · 2-es, 3-as és 6-os pont)",
        "art:akzent": "akcentus (4-es és 6-os pont · 2-es, 3-as és 6-os pont)",
        "fermate": "korona (a hang után: 1-es, 2-es és 6-os pont · 1-es, 2-es és 3-as pont)",
      },
    },
    "kp-dynamik": {
      titel: "Hangos és halk a Braille-ben",
      introDu: "Most a hangerő is megkapja a jeleit: minden előadási szó előtt ott áll a szójel (3-as, 4-es és 5-ös pont), utána jön az f (forte), a p (piano) és a többi. A villák pedig a crescendót és a decrescendót mutatják.",
      introSie: "Dinamika a Braille-ben (Krolick X. fejezet, §10-2 - §10-6): szójel + irodalmi betűk, crescendo- és decrescendo-villák; az 1.5 hallásgyakorlataira épül.",
      einheiten: {
        "dyn:p": "piano (szójel és p)",
        "dyn:f": "forte (szójel és f)",
        "dyn:mf": "mezzoforte (szójel, m, f)",
        "dyn:pp": "pianissimo (szójel és kétszer p)",
        "dyn:ff": "fortissimo (szójel és kétszer f)",
        "dyn:cr": "crescendo-villa kezdete (345-14)",
        "dyn:decr": "decrescendo-villa kezdete (345-145)",
      },
    },
    "kp-tempo": {
      titel: "Tempójelzések és metronóm",
      introDu: "Largo, Andante, Presto - a tempójelzések megmondják, milyen gyorsan játsszunk. Hallgasd meg őket, tanuld meg a jelentésüket, és írd le a pontos metronómjelzést: „negyed egyenlő 60”.",
      introSie: "Tempó (KOMU MK1 lista + accelerando és ritardando): hallási és ismereti szókincsként; metronómjelzés (Krolick §14-17: hangcella, egyenlőségjel, számjel, számjegyek).",
      einheiten: {
        "metronom": "metronómjelzés (negyed hang, egyenlőségjel, számjel, számjegyek)",
      },
    },
    "kp-verzierungen1": {
      titel: "Díszítések I - előke és trilla",
      introDu: "Apró díszítőhangok ékesítik a dallamot: az előke (egy hang előtte) és a trilla (gyors váltakozás). A jeleik mindig a hang ELŐTT állnak.",
      introSie: "Díszítések (Krolick XI. fejezet, §11-3, §11-6 és §11-7): rövid és hosszú előke, trilla - a hangzás külön átalakítóval, jel a hang előtt.",
      einheiten: {
        "orn:vorschlag": "rövid előke (2-es és 6-os pont)",
        "orn:vorschlag-lang": "hosszú előke (5-ös pont · 2-es és 6-os pont)",
        "orn:triller": "trilla (2-es, 3-as és 5-ös pont)",
      },
    },
    "kp-verzierungen2": {
      titel: "Díszítések II - gruppetto, mordent, tremolo",
      introDu: "Még több díszítés: a gruppetto körbefonja a hangot, a felső és az alsó mordent röviden megpendíti, a tremolo gyorsan ismételteti. Jegyezd meg, hol áll az egyes jel.",
      introSie: "További díszítések (Krolick XI. és VII. fejezet, szorgalmi): gruppetto, felső mordent, alsó mordent a hang előtt, tremolo-ismétlés utána, tört tremolo a hangok között.",
      einheiten: {
        "orn:doppelschlag": "gruppetto (2-es, 5-ös és 6-os pont)",
        "orn:pralltriller": "felső mordent (5-ös pont · 2-es, 3-as és 5-ös pont)",
        "orn:mordent": "alsó mordent (5-ös pont · 2-es, 3-as és 5-ös pont · 1-es, 2-es és 3-as pont)",
        "trem:rep8": "tremolo-ismétlés nyolcadokkal (4-es és 5-ös pont · 1-es és 2-es pont)",
        "trem:alt8": "tört tremolo nyolcadokkal (4-es és 6-os pont · 1-es és 2-es pont)",
      },
    },
    "kp-ausdruck-lied": {
      titel: "Érzéssel! - dalban",
      introDu: "Most mindent összeraksz: vedd egy igazi dal elejét, és hallgasd vagy írd le KIFEJEZÉSSEL - hol kötve, hol röviden, hol egy előadási szóval előtte. Így szól élőn a zene.",
      introSie: "Egész - rész - egész (4. szabály): a 4. világ kifejezésjeleinek alkalmazása valódi dalokon a polcról; száraz és kifejező változat összehasonlítása.",
      einheiten: {},
    },
    "kp-braillerepeats": {
      titel: "A Braille munkát spórol",
      introDu: "A Braille okos: ahelyett hogy egy egyforma ütemet újra leírna, simile jelet tesz - és egy utána álló számmal azt is megmondja, hányszor. De vigyázz: nem egy sor első ütésén!",
      introSie: "Ismétlés rövidítése (Krolick IX. fejezet, §9-15 és §9-36): a simile szabályai elmélyítve, számolt ismétlés 2356-3456-N; a Braille saját rövidítő eszköze.",
      einheiten: {
        "count-rep": "számolt ismétlés (simile, számjel, darabszám)",
      },
    },
    "kp-volten": {
      titel: "Volták, da capo és segno",
      introDu: "Hogyan olvassuk a forma útjelzőit? Az első és a második volta új befejezést ad az ismétlésnek, a segno és a coda ugrási célokat jelöl, a „D.C.” pedig azt jelenti: elölről!",
      introSie: "Formai jelek (Krolick IX. fejezet, §9-6, §9-8 és §9-9): volta ALSÓ számjegyekkel, segno és coda, da capo szabály szövegként; játszási sorrend kirakósként.",
      einheiten: {
        "volta:1": "első volta (számjel, alsó 1)",
        "volta:2": "második volta (számjel, alsó 2)",
        "segno": "segno (3-as, 4-es és 6-os pont)",
        "coda": "coda (3-as, 4-es és 6-os pont · 1-es, 2-es és 3-as pont)",
      },
    },
    "kp-formen": {
      titel: "Formák hallgatása",
      introDu: "A zenének tervrajza van: visszatér az eleje (A-B-A)? Hányszor tér vissza a refrén a rondóban? Pontos az ismétlés - vagy variáció? Halld meg a formát.",
      introSie: "Zenei forma (alsó középfokú tanterv, ABRSM Aural G2): dalforma, rondó, variáció motívumépítőkből, hallás útján.",
      einheiten: {},
    },
    "kp-intervalle1": {
      titel: "Hangközök hallása I",
      introDu: "Két hang - milyen messze vannak egymástól? Először a prím, a kvint és az oktáv ellentéte, aztán jönnek a tercek. Jegyezd meg a kakukk-tercet és az Amazing Grace kvartját.",
      introSie: "Hangközök hallása (KOMU MK1, emlékeztető dalok): először prím, kvint, oktáv, aztán tercek, kvart, szext - egymás után, aztán egyszerre.",
      einheiten: {},
    },
    "kp-intervalle2": {
      titel: "Hangközök a Braille-ben",
      introDu: "Most kéthangzatokat írsz: a felső szólamban a LEGFELSŐ hang áll, és a hangközjel lefelé számol. Így egyetlen jel hozza hozzá a második hangot.",
      introSie: "Hangközjelek (Krolick V. fejezet, 5A táblázat): 34/346/3456/35/356/25/36 és a diszkant olvasási irány (legfelső hang, hangközök lefelé).",
      einheiten: {
        "int:2": "szekund (3-as és 4-es pont)",
        "int:3": "terc (3-as, 4-es és 6-os pont)",
        "int:4": "kvart (3-as, 4-es, 5-ös és 6-os pont)",
        "int:5": "kvint (3-as és 5-ös pont)",
        "int:6": "szext (3-as, 5-ös és 6-os pont)",
        "int:7": "szeptim (2-es és 5-ös pont)",
        "int:8": "oktáv (3-as és 6-os pont)",
      },
    },
    "kp-intervalle3": {
      titel: "Hangközök hallása II",
      introDu: "Szorgalmi: most jönnek a súrlódó hangközök - a szekund és a szeptim -, és megbecsülöd, hogy egy hangzás nagyobb vagy kisebb-e egy kvintnél. Felfelé és lefelé.",
      introSie: "A hangközök finom meghatározása (KOMU MK2): szekund, szeptim, tritonus, felfelé és lefelé, becslési feladatok a kvint körül.",
      einheiten: {},
    },
    "kp-akkorde1": {
      titel: "Dúr vagy moll?",
      introDu: "Három hang együtt hármashangzatot ad. Világosan szól (dúr) vagy sötéten (moll)? És a hangok egyenként jönnek (tört akkord), vagy mind egyszerre? A füled megtanulja az akkordok színét.",
      introSie: "Akkordok hallása (KOMU MK1): dúr és moll megkülönböztetése, tört és egyszerre szóló akkord, szorgalmi: szűkített.",
      einheiten: {},
    },
    "kp-akkorde2": {
      titel: "Akkordok írása",
      introDu: "A hármashangzatot úgy írod, mint a kéthangzatot: a legfelső hang, aztán a terc és a kvint hangközjele lefelé. Egy hang, két jel - kész az akkord.",
      introSie: "Akkordok lejegyzése (Krolick V. fejezet): alaphang + hangközjelek (diszkant szabály: legfelső hang, terc és kvint lefelé), oktávkettőzés.",
      einheiten: {},
    },
    "kp-inakkord": {
      titel: "Két szólam, egy sor",
      introDu: "Hogyan írunk két szólamot EGY Braille-sorba? Az akkordjel választja el őket: előbb a felső szólam, aztán a jel, aztán az alsó szólam - mindkettő saját oktávjellel.",
      introSie: "Akkordjel, „in accord” (Krolick V. fejezet, §5-11 és §5-12): egész ütemes akkordjel 126-345, utána új oktávjel; kapu a zongorazenéhez.",
      einheiten: {
        "inacc": "egész ütemes akkordjel (1-es, 2-es és 6-os pont · 3-as, 4-es és 5-ös pont)",
        "inacc-teil": "részütemes akkordjel (5-ös pont · 2-es pont)",
      },
    },
    "kp-tonleitern": {
      titel: "Skálák",
      introDu: "Nyolc fok egy hangtól a következő azonos nevű hangig: ez a skála. Játszd el a C-dúr skálát, halld meg a különbséget dúr és moll között, és találd meg az elcsúszott fokot.",
      introSie: "Skálák (ABRSM G1, KOMU MK1): C-dúr eljátszása, dúr és moll hallása, hibás fok megkeresése, G-dúr írása kereszttel.",
      einheiten: {},
    },
    "kp-quintenzirkel": {
      titel: "Kvintkör-rali",
      introDu: "Rali a hangnemeken át: hány keresztje van a G-dúrnak? Melyik hangnemnek van két béje? Tanuld meg az előjegyzéseket négy keresztig és négy béig - előre és visszafelé.",
      introSie: "Kvintkör (KOMU MK1 törzsanyag): hangnem ↔ előjegyzésszám 4♯ és 4♭ között, előjegyzés olvasása Braille-ben.",
      einheiten: {},
    },
    "kp-rhythmusdiktat": {
      titel: "Ritmusdiktálás",
      introDu: "Én kopogok egy ütemet - te leírod az értékeket. Csak a ritmus számít, a hangmagasság ugyanaz marad. És fordítva: olvass le egy ritmust a lapról, és kopogd vissza.",
      introSie: "Ritmusdiktálás (KOMU MKe → MK1): értékek lejegyzése hallás után (diktálás) és kopogás lapról (fordított irány); ritmusnyelv a megoldásnál.",
      einheiten: {},
    },
    "kp-melodiediktat": {
      titel: "Dallamdiktálás",
      introDu: "A királyi gyakorlat: én eljátszom egy kis dallamot, te leírod. Kis lépésekkel indul, a kezdőhangot mindig megmondjuk, és annyiszor hallgathatod meg, ahányszor csak akarod.",
      introSie: "Dallamdiktálás (KOMU MK1 → MK2): 3-5 szomszédos hang a bemondott kezdőhangtól, fokozatosan terclépésekig és értékekig; korlátlan meghallgatás levonás nélkül.",
      einheiten: {},
    },
    "kp-detektiv": {
      titel: "Hibadetektív",
      introDu: "Légy javítódetektív: olvasd el a Braille-sort, és hallgasd meg a felvételt. Pontosan egy helyen eltér a hangzás a kottától - vagy minden rendben van. Megtalálod a helyet?",
      introSie: "Korrektúraolvasás (látássérült tanulók gyakorlata: kotta és hangzás összevetése): egy eltérés megkeresése - a Braille-olvasás célkompetenciája.",
      einheiten: {},
    },
    "kp-baumeister": {
      titel: "Ütemépítő",
      introDu: "Építs saját ütemeket: írj hangokat és szüneteket, amíg az ütések pontosan illenek az ütemmutatóhoz. Túl kevés? Túl sok? Az ütemed megmondja - és ha pontos, megszólal.",
      introSie: "Ütemépítő (építő motor, §4.4): szabad hang- és szünetcellák, értékösszeg = ütemmutató, kétértelműség a kp12 olvasási logikája szerint; kreativitás + ütemszámolás.",
      einheiten: {},
    },
    "kp-spielwiese": {
      titel: "Játékrét",
      introDu: "Szabad játék egy halk bordun fölött: a pentaton billentyűkkel egyetlen hang sem szólhat hamisan. Mesélj el egy kis történetet - hol halkan, hol hangosan. Csak próbáld ki.",
      introSie: "Orff-improvizáció (§7.7): pentatónia kvint-bordun fölött, nincs hamis hang, csillagok nélkül - pipa 30 eljátszott hangtól (§12).",
      einheiten: {},
    },
    "kp-kadenzen": {
      titel: "Zárlatok",
      introDu: "Hogyan szól egy befejezés? Nyitva marad a zene (félzárlat), vagy megnyugszik (egészzárlat)? És a domináns erős zárlata ez, vagy a lágy „ámen”-zárlat?",
      introSie: "Zárlatok (ABRSM Aural G5, KOMU MK2): fél- és egészzárlat, plagális és autentikus, T/S/D funkciók.",
      einheiten: {},
    },
    "kp-komponier": {
      titel: "Zeneszerző műhely",
      introDu: "A saját lapod: írj szabadon, hallgasd meg a művedet, és mentsd el. Legfeljebb öt mű fér a polcra. A műhelyt akkor látogattad meg, amikor elmentetted az elsőt.",
      introSie: "Zeneszerző műhely (szabad írás motorja, §4.5): szabad írás, meghallgatás, legfeljebb 5 mű mentése; csillagok nélkül - pipa az első műtől (§12).",
      einheiten: {},
    },
    "kp-fingersatz": {
      titel: "Ujjrend",
      introDu: "Melyik ujj melyik hangot játssza? A hang UTÁN álló kis számjegy megmondja: az 1 a hüvelykujj, az 5 a kisujj. Így a kéz mindig tudja, hová menjen.",
      introSie: "Ujjrend (Krolick XV. fejezet, 15. táblázat): 1-5. ujj = 1/12/123/2/13, a hang UTÁN (kötőív előtt).",
      einheiten: {
        "finger:1": "hüvelykujj, 1-es ujj (1-es pont)",
        "finger:2": "mutatóujj, 2-es ujj (1-es és 2-es pont)",
        "finger:3": "középső ujj, 3-as ujj (1-es, 2-es és 3-as pont)",
        "finger:4": "gyűrűsujj, 4-es ujj (2-es pont)",
        "finger:5": "kisujj, 5-ös ujj (1-es és 3-as pont)",
      },
    },
    "kp-klavier": {
      titel: "Zongorazene",
      introDu: "Két kéz, két jel: a jobb kéz többnyire a dallamot játssza, a bal mélyebben kísér. A sor elején álló kézjel megmondja, melyik kéz következik - a pedál pedig teltebbé teszi a hangzást.",
      introSie: "Zongora-lejegyzés (Krolick XV. fejezet, 15A táblázat): kézjelek 46-345 / 456-345 (+ utána oktávjel), pedál 126-14 (előtte) / 16-14 (utána).",
      einheiten: {
        "hand:r": "jobb kéz (4-es és 6-os pont · 3-as, 4-es és 5-ös pont)",
        "hand:l": "bal kéz (4-es, 5-ös és 6-os pont · 3-as, 4-es és 5-ös pont)",
        "pedal:ab": "pedál le (1-es, 2-es és 6-os pont · 1-es és 4-es pont)",
        "pedal:auf": "pedál fel (1-es és 6-os pont · 1-es és 4-es pont)",
      },
    },
    "kp-gesang": {
      titel: "Éneklés Braille-lel",
      introDu: "Éneklésnél a hangok és a szótagok összetartoznak: egy szótagon több hangot a szótagív köt össze, a levegővételi jelek pedig megmondják, hol veszünk levegőt. A szöveg- és a zenei sorok váltakoznak.",
      introSie: "Ének-lejegyzés (Krolick XVI. fejezet): szótagív 14, levegővétel 345-2 / 6-34, két szótag egy hangon 12, sor-előjelek (56-23 / 6-3).",
      einheiten: {
        "vocal:silbenbogen": "szótagív (1-es és 4-es pont)",
        "vocal:atem-halb": "fél levegővételi jel (3-as, 4-es és 5-ös pont · 2-es pont)",
        "vocal:atem-voll": "teljes levegővételi jel (6-os pont · 3-as és 4-es pont)",
        "vocal:silben2": "két szótag egy hangon (1-es és 2-es pont)",
      },
    },
    "kp-gitarre": {
      titel: "Gitár és akkordjelzések",
      introDu: "A gitáron a húr és a fekvés számít: a számjeggyel álló húrjel megmondja, melyik húrt pengetjük, a fekvésjel pedig azt, hol fog a kéz. Az akkordjelzések (kör, háromszög, dőlt 7) pedig elárulják az akkord fajtáját.",
      introSie: "Gitár-lejegyzés (Krolick XVII. fejezet, 17A-C táblázat): húrok 146 + számjegy, fekvések 345 + hangközjel (a hetedik fekvés különleges eset: 6-345-25), barré 456/45; nemzetközi akkordjelzések (§3, 3. bizonytalan pont: a betűs jelzések országonként eltérnek).",
      einheiten: {
        "string:3": "3. húr (húrjel és 1-es, 2-es és 3-as pont)",
        "fret:5": "5. fekvés (fekvésjel és kvint)",
        "fret:7": "7. fekvés - különleges eset külön 6-os ponttal",
        "barre:voll": "teljes barré (4-es, 5-ös és 6-os pont)",
        "chordsym:sept": "domináns szeptimakkord, dőlt 7",
      },
    },
    "kp-generalbass": {
      titel: "Számozott basszus és fokok",
      introDu: "A számozott basszus gyorsírás a kísérőknek: egy számozott basszushang megmondja, milyen hangok szólnak fölötte. És minden fokokban gondolkodik - tonika, szubdomináns, domináns.",
      introSie: "Számozott basszus (Krolick XII. fejezet, §12-15 - §12-27): szólam-előjel 56-345, számjegyek = számjel + ALSÓ számjegyek (a legalsó nyomtatott számjegy előbb); I-IV-V fok mint híd a zárlathoz.",
      einheiten: {
        "gb": "számozott basszus előjele (5-ös és 6-os pont · 3-as, 4-es és 5-ös pont)",
      },
    },
    "kp-partitur": {
      titel: "Partitúra és nyomtatott kép",
      introDu: "Hogyan épül fel egy Braille-partitúra? Az ütemszámok számjel nélkül állnak a szélén (a felütés a nulladik ütem), a szólamok pedig szakaszonként egymás fölött vannak. Így lehet eligazodni benne.",
      introSie: "Partitúraismeret (Krolick XIV. fejezet, §14-10 - §14-13): ütemszámok számjel nélkül, felütés = nulladik ütem, ütem ütem fölött elrendezés, beszerzési források (dzb lesen, SBS). Tisztán ismeretanyag.",
      einheiten: {
        "taktnr:1": "ütemszám (felső számjegyek, számjel nélkül)",
      },
    },
    "kp-orchester": {
      titel: "Fúvósok, ütősök és társaik",
      introDu: "A hangszerek családokba rendezhetők: húros, fúvós, hártyás és önhangú hangszerek - aszerint, hogy mi adja a hangot. Figyelj, és rendeld hozzá a hangszíneket.",
      introSie: "Hangszerismeret (KOMU MK2, Hornbostel-Sachs gyerekeknek): hangszercsaládok + hallás utáni besorolás a négy szintetizált hanggal. Áttekintés, nem jelgyakorlás.",
      einheiten: {},
    },
    "kp-lieder2": {
      titel: "Dalok kifejezéssel",
      introDu: "Ugyanazok a dalok, most érzéssel: kötve vagy röviden, halkan vagy hangosan. Halld meg a különbséget a száraz és a kifejező változat között - és írd le a sorokat.",
      introSie: "Dalok kifejezéssel (§9.2): harmadik polc dinamikával, artikulációval és ívekkel; kifejezés-diktálás (száraz és kifejező) + sorok írása. A sorfeldolgozó bővítése.",
      einheiten: {},
    },
    "kp-lesekonzert": {
      titel: "Olvasókoncert",
      introDu: "A királyi szám: olvass el egy Braille-sort anélkül, hogy hallanád, vésd az emlékezetedbe - aztán játszd el emlékezetből. Pontosan így játszik az ember lapról, mert játék közben nem lehet olvasni.",
      introSie: "Olvasókoncert (§9.3, RNIB „elolvasni - megjegyezni - eljátszani”): Braille megjelenítése → olvasás → utánjátszás emlékezetből a billentyűzeten → az elvárt sor ellenőrzésként. A hangsor számít, az olvasási idő nem (§12).",
      einheiten: {},
    },
    "kp-liederquiz": {
      titel: "Dalkvíz",
      introDu: "Felismersz egy dalt csak a Braille-sora alapján - egyetlen hang nélkül? Vagy megtalálod a hallott dallamhoz a megfelelő dalt? Ez csendes olvasás a belső füllel.",
      introSie: "Dalkvíz (§9.4): a Braille kezdősor elolvasása → a dal megnevezése, illetve dallam hallása → a dal megnevezése. A folyékony Braille-kottaolvasás megkoronázása.",
      einheiten: {},
    },
  },
};
