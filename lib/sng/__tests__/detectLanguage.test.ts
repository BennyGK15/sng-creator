import { describe, expect, it } from "vitest";

import { detectLanguage, detectSongLanguages, parseLanguagesFromFilename } from "../detectLanguage";
import { parseSng } from "../parseSng";

const SAMPLES: Record<string, string> = {
    Deutsch:
        "Großer Gott, wir loben dich, Herr, wir preisen deine Stärke.\nVor dir neigt die Erde sich und bewundert deine Werke.",
    Englisch:
        "Amazing grace, how sweet the sound that saved a wretch like me.\nI once was lost, but now am found, was blind but now I see.",
    Französisch:
        "À toi la gloire, ô Ressuscité, à toi la victoire pour l'éternité.\nBrillant de lumière, l'ange est descendu, il roule la pierre du tombeau vaincu.",
    Spanisch:
        "Santo, santo, santo, Señor Dios del universo.\nLlenos están los cielos y la tierra de tu gloria. Hosanna en el cielo.",
    Italienisch:
        "Santo, santo, santo il Signore Dio dell'universo.\nI cieli e la terra sono pieni della tua gloria. Osanna nell'alto dei cieli.",
    Niederländisch:
        "Heer, U bent mijn kracht, mijn rots, mijn sterkte.\nIk wil U loven met heel mijn hart, want U bent goed en ook mijn redder.",
    Portugiesisch:
        "Santo, santo, santo é o Senhor Deus do universo.\nOs céus e a terra estão cheios da tua glória. Hosana nas alturas.",
    Polnisch:
        "Pan kiedyś stanął nad brzegiem, szukał ludzi gotowych pójść za Nim.\nO Panie, to Ty na mnie spojrzałeś, Twoje usta dziś wyrzekły me imię.",
    Russisch: "Святой, святой, святой Господь Бог Вседержитель.\nНебо и земля полны славы Твоей.",
    Ukrainisch: "Святий, святий, святий Господь Бог.\nНебо і земля повні Твоєї слави.",
    Griechisch: "Άγιος, άγιος, άγιος Κύριος Σαβαώθ.\nΠλήρης ο ουρανός και η γη της δόξης σου.",
};

describe("detectLanguage", () => {
    it.each(Object.entries(SAMPLES))("erkennt %s", (language, text) => {
        expect(detectLanguage(text)).toBe(language);
    });

    it("rät nicht bei zu wenig Text", () => {
        expect(detectLanguage("Halleluja")).toBeNull();
        expect(detectLanguage("Hosanna, Hosanna")).toBeNull();
        expect(detectLanguage("")).toBeNull();
    });
});

describe("parseLanguagesFromFilename", () => {
    it("liest die Kürzel, die der Editor beim Export anhängt", () => {
        expect(parseLanguagesFromFilename("Licht-meines-Herzens_DE-EN.sng", 2)).toEqual([
            ["Deutsch"],
            ["Englisch"],
        ]);
        expect(parseLanguagesFromFilename("Lied_DE-EN-SP.sng", 3)).toEqual([
            ["Deutsch"],
            ["Englisch"],
            ["Spanisch"],
        ]);
    });

    it("ignoriert Namen ohne passende Kürzelanzahl", () => {
        expect(parseLanguagesFromFilename("Lied_DE-EN.sng", 3)).toBeNull();
        expect(parseLanguagesFromFilename("Amazing Grace.sng", 2)).toBeNull();
    });
});

describe("detectSongLanguages", () => {
    it("nutzt den Text, wenn das Kürzel mehrdeutig ist", () => {
        expect(detectSongLanguages([SAMPLES.Deutsch, SAMPLES.Polnisch], "Lied_DE-PO.sng")).toEqual([
            "Deutsch",
            "Polnisch",
        ]);
    });

    it("bevorzugt ein eindeutiges Kürzel im Dateinamen", () => {
        expect(detectSongLanguages(["Halleluja", "Halleluja"], "Lied_DE-EN.sng")).toEqual([
            "Deutsch",
            "Englisch",
        ]);
    });
});

describe("parseSng mit Spracherkennung", () => {
    const file = [
        "#Title=Großer Gott",
        "#TitleLang2=Holy God",
        "#LangCount=2",
        "---",
        "Vers",
        "Großer Gott, wir loben dich,",
        "Holy God, we praise thy name,",
        "Herr, wir preisen deine Stärke.",
        "Lord of all, we bow before thee.",
        "Vor dir neigt die Erde sich",
        "All on earth thy sceptre claim,",
        "und bewundert deine Werke.",
        "all in heaven above adore thee.",
    ].join("\r\n");

    it("setzt erkannte Sprachnamen", () => {
        const { metadata } = parseSng(file, { fileName: "Grosser-Gott.sng" });
        expect([metadata.lang1, metadata.lang2]).toEqual(["Deutsch", "Englisch"]);
    });

    it("behält die Platzhalter, wenn nichts erkannt wird", () => {
        const { metadata } = parseSng(
            "#Title=X\r\n#LangCount=2\r\n---\r\nVers\r\nHalleluja\r\nHalleluja"
        );
        expect([metadata.lang1, metadata.lang2]).toEqual(["Sprache 1", "Sprache 2"]);
    });
});
