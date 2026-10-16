import { describe, expect, it } from "vitest";

import { countSlides, generateId, parseVerseOrder, serializeVerseOrder } from "../markers";
import { getSectionFamily, getSectionStyle, getSectionTypeFromMarker } from "../section-style";

describe("countSlides", () => {
    it("zählt Folien anhand von --", () => {
        expect(countSlides("A\nB")).toBe(1);
        expect(countSlides("A\n--\nB")).toBe(2);
        expect(countSlides("A\n  --  \nB\n---\nC")).toBe(3);
    });

    it("ignoriert leere Folien und zählt leeren Text als eine Folie", () => {
        expect(countSlides("")).toBe(1);
        expect(countSlides("--\nA\n--\n--\n\nB\n--")).toBe(2);
    });
});

describe("Abspielreihenfolge", () => {
    it("entfernt STOP und Leerstellen und hängt STOP wieder an", () => {
        expect(parseVerseOrder(" Vers 1, ,Refrain,STOP ")).toEqual(["Vers 1", "Refrain"]);
        expect(serializeVerseOrder(["Vers 1", "Refrain"])).toBe("Vers 1,Refrain,STOP");
        expect(serializeVerseOrder([])).toBe("STOP");
    });
});

describe("generateId", () => {
    it("liefert eindeutige UUIDs", () => {
        const ids = new Set(Array.from({ length: 50 }, generateId));
        expect(ids.size).toBe(50);
        expect([...ids][0]).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        );
    });
});

describe("Abschnittsfarben", () => {
    it("leitet den Typ aus Markern ab", () => {
        expect(getSectionTypeFromMarker("Vers 2")).toBe("Vers");
        expect(getSectionTypeFromMarker("Refrain")).toBe("Refrain");
        expect(getSectionTypeFromMarker("Pre-Bridge 12")).toBe("Pre-Bridge");
        expect(getSectionTypeFromMarker("Strophe 1a")).toBe("Unbekannt");
        expect(getSectionTypeFromMarker("Irgendwas")).toBe("Unbekannt");
    });

    it("ordnet Typen ihrer Familie zu", () => {
        expect(getSectionFamily("Strophe")).toBe("verse");
        expect(getSectionFamily("Chorus")).toBe("chorus");
        expect(getSectionFamily("Pre-Bridge")).toBe("bridge");
        expect(getSectionFamily("Vamp")).toBe("instrumental");
        expect(getSectionFamily(undefined)).toBe("frame");
        expect(getSectionStyle("Refrain")).toEqual({ "--section": "var(--section-chorus)" });
    });
});
