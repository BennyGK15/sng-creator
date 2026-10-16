import { afterEach, describe, expect, it, vi } from "vitest";

import {
    buildContentStats,
    copyToClipboard,
    downloadText,
    getLanguageAbbreviation,
} from "@/components/export-dialog/utils";
import {
    buildSlides,
    getLanguageScale,
    getLineGroupSpacing,
} from "@/components/slide-preview-dialog/slide-utils";
import { formSchema } from "@/components/song-form/schema";
import { createDefaultValues } from "@/components/song-form/utils";
import { buildAvailableMarkers } from "@/components/verse-order-editor/utils";
import { cn } from "@/lib/utils";
import type { SongFormData, SongSection } from "@/lib/sng/types";

function song(
    sections: Array<Pick<SongSection, "type" | "number" | "texts">>,
    metadata: Partial<SongFormData["metadata"]> = {}
): SongFormData {
    const data = createDefaultValues();
    data.metadata = { ...data.metadata, title: "Testlied", ...metadata };
    data.sections = sections.map((section, index) => ({ ...section, id: String(index) }));
    return data;
}

describe("buildSlides", () => {
    it("folgt der Abspielreihenfolge inklusive Wiederholungen", () => {
        const data = song(
            [
                { type: "Vers", number: "", texts: ["Strophe"] },
                { type: "Refrain", number: "", texts: ["Kehrvers"] },
            ],
            { verseOrder: "Vers,Refrain,Refrain,STOP" }
        );

        expect(buildSlides(data).map((slide) => [slide.marker, slide.lines])).toEqual([
            ["Vers", ["Strophe"]],
            ["Refrain", ["Kehrvers"]],
            ["Refrain", ["Kehrvers"]],
        ]);
    });

    it("nutzt die Abschnittsreihenfolge, wenn keine Abspielreihenfolge passt", () => {
        const data = song(
            [
                { type: "Vers", number: "", texts: ["A"] },
                { type: "Bridge", number: "", texts: ["B"] },
            ],
            { verseOrder: "Unbekannt 9,STOP" }
        );

        expect(buildSlides(data).map((slide) => slide.marker)).toEqual(["Vers", "Bridge"]);
    });

    it("teilt Abschnitte an -- in Folien und nummeriert sie", () => {
        const [first, second] = buildSlides(
            song([{ type: "Vers", number: "1", texts: ["A\n\nB\n--\n--\nC"] }])
        );

        expect(first).toMatchObject({ lines: ["A", "B"], slideInSection: 1, sectionSlideCount: 2 });
        expect(second).toMatchObject({ lines: ["C"], slideInSection: 2, sectionSlideCount: 2 });
    });

    it("verschränkt Sprachen zeilenweise und füllt fehlende Zeilen auf", () => {
        const [slide] = buildSlides(
            song([{ type: "Vers", number: "", texts: ["A\nB", "a"] }], { langCount: 2 })
        );

        expect(slide.lines).toEqual(["A", "a", "B"]);
    });

    it("zeigt leere Abschnitte als eine leere Folie und liefert ohne Daten nichts", () => {
        expect(buildSlides(song([{ type: "Instrumental", number: "", texts: [""] }]))).toEqual([
            { marker: "Instrumental", lines: [""], slideInSection: 1, sectionSlideCount: 1 },
        ]);
        expect(buildSlides(null)).toEqual([]);
    });

    it("verkleinert weitere Sprachen und setzt Abstand zwischen Zeilengruppen", () => {
        expect([0, 1, 2].map(getLanguageScale)).toEqual([1, 0.72, 0.58]);
        expect(getLineGroupSpacing(3, 1)).toBe(0);
        expect([0, 1, 2, 3].map((index) => getLineGroupSpacing(index, 2))).toEqual([0, 0, 8, 0]);
    });
});

describe("formSchema", () => {
    it("akzeptiert ein vollständiges Lied", () => {
        expect(
            formSchema.safeParse(song([{ type: "Vers", number: "", texts: ["Text"] }])).success
        ).toBe(true);
    });

    it("verlangt einen Titel und mindestens einen Liedtext", () => {
        const withoutTitle = formSchema.safeParse(
            song([{ type: "Vers", number: "", texts: ["Text"] }], { title: "" })
        );
        const withoutLyrics = formSchema.safeParse(
            song([
                { type: "Vers", number: "", texts: ["  "] },
                { type: "Instrumental", number: "", texts: [""] },
            ])
        );

        expect(withoutTitle.error?.issues[0].message).toBe("Titel ist ein Pflichtfeld");
        expect(withoutLyrics.error?.issues[0].message).toMatch(/Liedtext/);
    });

    it("erlaubt leere Abschnitte, solange ein anderer Text hat", () => {
        const data = song([
            { type: "Intro", number: "", texts: [""] },
            { type: "Vers", number: "", texts: ["Text"] },
        ]);
        expect(formSchema.safeParse(data).success).toBe(true);
    });
});

describe("buildAvailableMarkers", () => {
    it("listet jeden Abschnitt einmal in Liedreihenfolge", () => {
        const markers = buildAvailableMarkers(
            song([
                { type: "Vers", number: "1", texts: [""] },
                { type: "Refrain", number: "", texts: [""] },
                { type: "Refrain", number: "", texts: [""] },
            ]).sections
        );
        expect(markers).toEqual(["Vers 1", "Refrain"]);
        expect(buildAvailableMarkers()).toEqual([]);
    });
});

describe("Export-Hilfsfunktionen", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("bildet Sprachkürzel auch aus kurzen oder leeren Namen", () => {
        expect(getLanguageAbbreviation("Français", 0)).toBe("FR");
        expect(getLanguageAbbreviation("X", 1)).toBe("XX");
        expect(getLanguageAbbreviation("", 2)).toBe("L3");
    });

    it("zählt Zeilen und Bytes (UTF-8)", () => {
        expect(buildContentStats("Größe\r\nZeile")).toEqual({ lines: 2, bytes: 14 });
    });

    function fakeDocument() {
        const element = {
            href: "",
            download: "",
            value: "",
            click: vi.fn(),
            select: vi.fn(),
            remove: vi.fn(),
        };
        const document = {
            createElement: vi.fn(() => element),
            body: { appendChild: vi.fn() },
            execCommand: vi.fn(),
        };
        vi.stubGlobal("document", document);
        return { document, element };
    }

    it("lädt Dateien mit BOM herunter und gibt die URL erst danach frei", async () => {
        vi.useFakeTimers();
        const { element } = fakeDocument();
        const revokeObjectURL = vi.fn();
        let blob: Blob | undefined;
        vi.stubGlobal("URL", {
            createObjectURL: (value: Blob) => {
                blob = value;
                return "blob:test";
            },
            revokeObjectURL,
        });
        vi.stubGlobal("window", { setTimeout });

        downloadText("Lied.sng", "#Title=Lied");

        expect(element).toMatchObject({ href: "blob:test", download: "Lied.sng" });
        expect(element.click).toHaveBeenCalled();
        expect(element.remove).toHaveBeenCalled();
        expect(revokeObjectURL).not.toHaveBeenCalled();
        vi.runAllTimers();
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
        // UTF-8-BOM (EF BB BF), damit SongBeamer Umlaute korrekt liest
        const bytes = new Uint8Array(await blob!.arrayBuffer());
        expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
        expect(new TextDecoder().decode(bytes)).toBe("#Title=Lied");
    });

    it("kopiert über die Clipboard-API, wenn vorhanden", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { clipboard: { writeText } });

        await copyToClipboard("Text");

        expect(writeText).toHaveBeenCalledWith("Text");
    });

    it("weicht ohne Clipboard-API (HTTP im lokalen Netz) auf execCommand aus", async () => {
        vi.stubGlobal("navigator", {});
        const { document, element } = fakeDocument();

        await copyToClipboard("Text");

        expect(element.value).toBe("Text");
        expect(document.execCommand).toHaveBeenCalledWith("copy");
        expect(element.remove).toHaveBeenCalled();
    });

    it("weicht auch aus, wenn die Clipboard-API die Berechtigung verweigert", async () => {
        vi.stubGlobal("navigator", {
            clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
        });
        const { document } = fakeDocument();

        await copyToClipboard("Text");

        expect(document.execCommand).toHaveBeenCalledWith("copy");
    });
});

describe("cn", () => {
    it("führt Klassen zusammen und löst Tailwind-Konflikte auf", () => {
        expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
    });
});
