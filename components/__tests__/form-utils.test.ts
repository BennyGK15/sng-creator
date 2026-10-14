import { describe, expect, it } from "vitest";

import { buildSafeFilename } from "@/components/export-dialog/utils";
import {
    getNormalizedSectionNumbers,
    mergeVerseOrderWithSections,
    reorderVerseOrderForSectionMove,
} from "@/components/song-form/utils";
import { parseOrder, serializeOrder } from "@/components/verse-order-editor/utils";
import type { SongSection } from "@/lib/sng/types";

function sections(...specs: Array<[SongSection["type"], string?]>): SongSection[] {
    return specs.map(([type, number = ""], index) => ({
        id: String(index),
        type,
        number,
        texts: [""],
    }));
}

describe("getNormalizedSectionNumbers", () => {
    it("nummeriert nur Typen, die mehrfach vorkommen", () => {
        expect(getNormalizedSectionNumbers(sections(["Vers"], ["Refrain"], ["Vers"]))).toEqual([
            "1",
            "",
            "2",
        ]);
    });
});

describe("mergeVerseOrderWithSections", () => {
    it("entfernt verwaiste Marker und hängt neue Abschnitte an", () => {
        const current = "Vers 1,Refrain,Bridge,Refrain,STOP";
        const next = sections(["Vers", "1"], ["Refrain"], ["Vers", "2"]);

        expect(mergeVerseOrderWithSections(current, next)).toBe(
            "Vers 1,Refrain,Refrain,Vers 2,STOP"
        );
    });
});

describe("reorderVerseOrderForSectionMove", () => {
    it("verschiebt Wiederholungen mit dem Abschnitt", () => {
        const before = sections(["Vers"], ["Refrain"]);
        const after = [before[1], before[0]];

        expect(reorderVerseOrderForSectionMove("Vers,Refrain,Refrain,STOP", before, after)).toBe(
            "Refrain,Refrain,Vers,STOP"
        );
    });

    it("lässt eine frei angepasste Reihenfolge unangetastet", () => {
        const before = sections(["Vers"], ["Refrain"]);

        expect(
            reorderVerseOrderForSectionMove("Refrain,Vers,Refrain,STOP", before, [
                before[1],
                before[0],
            ])
        ).toBeNull();
    });
});

describe("Abspielreihenfolge-Editor", () => {
    it("fasst direkte Wiederholungen zusammen und schreibt sie wieder aus", () => {
        const items = parseOrder("Vers 1,Refrain,Refrain,STOP");

        expect(items).toEqual([
            { marker: "Vers 1", repeat: 1 },
            { marker: "Refrain", repeat: 2 },
        ]);
        expect(serializeOrder(items)).toBe("Vers 1,Refrain,Refrain,STOP");
    });
});

describe("buildSafeFilename", () => {
    it("behält Buchstaben aller Sprachen und entfernt Sonderzeichen", () => {
        expect(buildSafeFilename("Café: Señor / Größe!", 1, [])).toBe("Café-Señor-Größe.sng");
    });

    it("hängt Sprachkürzel an und fällt bei leerem Titel auf „song“ zurück", () => {
        expect(buildSafeFilename("", 2, ["Deutsch", "English"])).toBe("song_DE-EN.sng");
        expect(buildSafeFilename("?!", 1, [])).toBe("song.sng");
    });
});
