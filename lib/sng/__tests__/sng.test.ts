import { describe, expect, it } from "vitest";

import { createDefaultValues } from "@/components/song-form/utils";

import { generateSng } from "../generateSng";
import { decodeSngBytes, parseSng } from "../parseSng";
import type { SongFormData, SongSection } from "../types";

function song(
    sections: Omit<SongSection, "id">[],
    metadata: Partial<SongFormData["metadata"]> = {}
) {
    const data = createDefaultValues();
    data.metadata = { ...data.metadata, title: "Testlied", ...metadata };
    data.sections = sections.map((section, index) => ({ ...section, id: String(index) }));
    return data;
}

function roundTrip(data: SongFormData) {
    return parseSng(generateSng(data));
}

describe("generateSng", () => {
    it("schreibt Header, Marker und Abschnitte mit CRLF", () => {
        const output = generateSng(
            song([
                { type: "Vers", number: "1", texts: ["Zeile A\nZeile B"] },
                { type: "Refrain", number: "", texts: ["Halleluja"] },
            ])
        );

        expect(output.split("\r\n")).toEqual([
            "#Title=Testlied",
            "#LangCount=1",
            "#Editor=SongBeamer - Song Editor by Benjamin Esenwein",
            "#Version=3",
            "---",
            "Vers 1",
            "Zeile A",
            "Zeile B",
            "---",
            "Refrain",
            "Halleluja",
        ]);
    });

    it("verschränkt mehrsprachige Zeilen und schreibt Folienumbrüche nur einmal", () => {
        const output = generateSng(
            song([{ type: "Vers", number: "", texts: ["A\n--\nB", "a\n--\nb"] }], { langCount: 2 })
        );

        expect(output.split("\r\n").slice(-7)).toEqual(["---", "Vers", "A", "a", "--", "B", "b"]);
    });
});

describe("parseSng", () => {
    it("übersteht einen Export-Import-Durchlauf unverändert", () => {
        const data = song(
            [
                { type: "Vers", number: "1", texts: ["Großer Gott\n--\nwir loben dich"] },
                { type: "Refrain", number: "", texts: ["Halleluja"] },
                { type: "Vers", number: "2", texts: ["Herr, wir preisen"] },
            ],
            { author: "Ignaz Franz", ccli: "123", verseOrder: "Vers 1,Refrain,Vers 2,Refrain,STOP" }
        );

        const imported = roundTrip(data);

        expect(imported.metadata.author).toBe("Ignaz Franz");
        expect(imported.metadata.ccli).toBe("123");
        expect(imported.metadata.verseOrder).toBe("Vers 1,Refrain,Vers 2,Refrain,STOP");
        expect(
            imported.sections.map(({ type, number, texts }) => ({ type, number, texts }))
        ).toEqual(data.sections.map(({ type, number, texts }) => ({ type, number, texts })));
    });

    it("ordnet mehrsprachige Zeilen nach einem Folienumbruch der richtigen Sprache zu", () => {
        const data = song([{ type: "Vers", number: "", texts: ["A\nB\n--\nC", "a\nb\n--\nc"] }], {
            langCount: 2,
        });

        expect(roundTrip(data).sections[0].texts).toEqual(["A\nB\n--\nC", "a\nb\n--\nc"]);
    });

    it("unterscheidet Chorus und Refrain", () => {
        const data = song([
            { type: "Chorus", number: "", texts: ["x"] },
            { type: "Refrain", number: "", texts: ["y"] },
        ]);

        expect(roundTrip(data).sections.map((section) => section.type)).toEqual([
            "Chorus",
            "Refrain",
        ]);
    });

    it("behält die erste Zeile, wenn ein Abschnitt keinen Marker hat", () => {
        const imported = parseSng("#Title=X\r\n---\r\nErste Zeile\r\nZweite Zeile");

        expect(imported.sections[0].type).toBe("Unbekannt");
        expect(imported.sections[0].texts).toEqual(["Erste Zeile\nZweite Zeile"]);
    });

    it("hält Liedzeilen, die mit einem Typnamen beginnen, nicht für Marker", () => {
        const imported = parseSng(
            "#Title=X\r\n---\r\nBridge over troubled water\r\nI will lay me down"
        );

        expect(imported.sections[0].texts[0]).toBe(
            "Bridge over troubled water\nI will lay me down"
        );
    });

    it("erkennt englische Marker und Nummern ohne Leerzeichen", () => {
        const imported = parseSng("#Title=X\r\n---\r\nVerse2\r\nText\r\n---\r\nPre-Chorus\r\nText");

        expect(imported.sections.map(({ type, number }) => [type, number])).toEqual([
            ["Vers", "2"],
            ["Pre-Refrain", ""],
        ]);
    });

    it("meldet fehlenden Titel und fehlenden Liedtext", () => {
        expect(() => parseSng("---\r\nVers\r\nText")).toThrow(/Liedtitel/);
        expect(() => parseSng("#Title=X\r\n---")).toThrow(/Liedtext/);
    });
});

describe("decodeSngBytes", () => {
    it("liest UTF-8 inklusive BOM", () => {
        const bytes = new TextEncoder().encode("﻿#Title=Größe");
        expect(decodeSngBytes(bytes.buffer as ArrayBuffer)).toBe("#Title=Größe");
    });

    it("fällt bei ANSI-Dateien auf Windows-1252 zurück", () => {
        // „#Title=Größe“ in Windows-1252: ö = 0xF6, ß = 0xDF
        const bytes = new Uint8Array([
            0x23, 0x54, 0x69, 0x74, 0x6c, 0x65, 0x3d, 0x47, 0x72, 0xf6, 0xdf, 0x65,
        ]);
        expect(decodeSngBytes(bytes.buffer)).toBe("#Title=Größe");
    });
});
