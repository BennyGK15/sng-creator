import {
    generateId,
    getSectionMarker,
    parseVerseOrder,
    SECTION_SEPARATOR,
    serializeVerseOrder,
    SLIDE_SEPARATOR,
} from "./markers";
import { type SongFormData, type SongMetadata, type SongSection } from "./types";

const SECTION_TYPE_ALIASES: Array<{
    type: SongSection["type"];
    aliases: string[];
}> = [
    { type: "Vers", aliases: ["Verse", "Vers"] },
    { type: "Strophe", aliases: ["Strophe"] },
    { type: "Refrain", aliases: ["Refrain", "Chorus (Refrain)"] },
    { type: "Chorus", aliases: ["Chorus"] },
    { type: "Pre-Refrain", aliases: ["Pre-Refrain", "Pre-Chorus"] },
    { type: "Pre-Bridge", aliases: ["Pre-Bridge"] },
    { type: "Bridge", aliases: ["Bridge"] },
    { type: "Intro", aliases: ["Intro"] },
    { type: "Zwischenspiel", aliases: ["Zwischenspiel", "Interlude"] },
    { type: "Instrumental", aliases: ["Instrumental"] },
    { type: "Pre-Coda", aliases: ["Pre-Coda"] },
    { type: "Coda", aliases: ["Coda"] },
    { type: "Outro", aliases: ["Outro"] },
    { type: "Ending", aliases: ["Ending", "End"] },
    { type: "Teil", aliases: ["Teil", "Part"] },
    { type: "Vamp", aliases: ["Vamp"] },
    { type: "Misc", aliases: ["Misc"] },
    { type: "Unbekannt", aliases: ["Unbekannt", "Unknown"] },
];

const SECTION_MARKER_PATTERNS = SECTION_TYPE_ALIASES.flatMap(({ type, aliases }) =>
    aliases.map((alias) => ({
        type,
        alias,
        normalizedAlias: alias.toLowerCase(),
    }))
).sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length);

const DEFAULT_IMPORTED_LANGUAGE_NAMES = ["Sprache 1", "Sprache 2", "Sprache 3"] as const;

type ParsedHeaders = Partial<Record<string, string>>;

function normalizeInput(content: string): string {
    return content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function splitHeaderAndBody(lines: string[]): { headerLines: string[]; bodyLines: string[] } {
    const headerLines: string[] = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];
        if (line.startsWith("#")) {
            headerLines.push(line);
            index += 1;
            continue;
        }
        if (line.trim() === "") {
            index += 1;
            break;
        }
        break;
    }

    return {
        headerLines,
        bodyLines: lines.slice(index),
    };
}

function parseHeaders(headerLines: string[]): ParsedHeaders {
    const headers: ParsedHeaders = {};

    headerLines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith("#")) return;

        const separatorIndex = trimmed.indexOf("=");
        const rawKey = separatorIndex >= 0 ? trimmed.slice(1, separatorIndex) : trimmed.slice(1);
        const rawValue = separatorIndex >= 0 ? trimmed.slice(separatorIndex + 1) : "";
        headers[rawKey.trim()] = rawValue.trim();
    });

    return headers;
}

function parseLangCount(headers: ParsedHeaders): number {
    const parsed = Number(headers.LangCount ?? "1");
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 3) {
        return parsed;
    }

    if (headers.TitleLang3) return 3;
    if (headers.TitleLang2) return 2;
    return 1;
}

function splitDelimitedValues(value: string | undefined): string[] {
    if (!value) return [];
    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
}

/**
 * Erkennt Marker wie „Vers 1“, „Refrain“, „Verse2“ oder „Strophe 1a“.
 * Liedzeilen, die nur zufällig mit einem Typnamen beginnen
 * („Bridge over troubled water“), sind keine Marker.
 */
const MARKER_SUFFIX_PATTERN = /^\s*(\d+[a-z]?|[a-z])?$/i;

function parseMarkerToken(markerLine: string): Pick<SongSection, "type" | "number"> | null {
    const trimmedMarker = markerLine.trim();
    const normalizedMarker = trimmedMarker.toLowerCase();

    const matchedPattern = SECTION_MARKER_PATTERNS.find(
        ({ normalizedAlias }) =>
            normalizedMarker.startsWith(normalizedAlias) &&
            MARKER_SUFFIX_PATTERN.test(trimmedMarker.slice(normalizedAlias.length))
    );

    if (!matchedPattern) return null;

    return {
        type: matchedPattern.type,
        number: trimmedMarker.slice(matchedPattern.alias.length).trim(),
    };
}

function toMetadata(headers: ParsedHeaders): SongMetadata {
    const langCount = parseLangCount(headers);

    return {
        title: headers.Title ?? "",
        titleLang2: headers.TitleLang2 ?? "",
        titleLang3: headers.TitleLang3 ?? "",
        langCount,
        lang1: DEFAULT_IMPORTED_LANGUAGE_NAMES[0],
        lang2: DEFAULT_IMPORTED_LANGUAGE_NAMES[1],
        lang3: DEFAULT_IMPORTED_LANGUAGE_NAMES[2],
        originalTitle: headers.OriginalTitle ?? "",
        author: headers.Author ?? "",
        melody: headers.Melody ?? "",
        translation: headers.Translation ?? "",
        publisher: headers.Publisher ?? headers["(c)"] ?? "",
        rights: headers.Rights ?? "",
        ccli: headers.CCLI ?? "",
        key: headers.Key ?? "",
        transpose: headers.Transpose ?? "",
        categories: splitDelimitedValues(headers.Categories),
        tempo: headers.Tempo ?? "",
        verseOrder: headers.VerseOrder ?? "",
        books: headers.Books ?? "",
        bible: headers.Bible ?? "",
        keywords: headers.Keywords ?? "",
        id: headers.ID ?? "",
        comments: headers.Comments ?? "",
        quickFinder: headers.QuickFinder ?? "",
        churchSongId: headers.ChurchSongID ?? "",
    };
}

function splitSectionBlocks(bodyLines: string[]): string[][] {
    const blocks: string[][] = [];
    let currentBlock: string[] = [];

    bodyLines.forEach((line) => {
        if (line.trim() === SECTION_SEPARATOR) {
            if (currentBlock.length > 0) {
                blocks.push(currentBlock);
                currentBlock = [];
            }
            return;
        }

        currentBlock.push(line);
    });

    if (currentBlock.length > 0) {
        blocks.push(currentBlock);
    }

    return blocks.filter((block) => block.some((line) => line.trim().length > 0));
}

function trimTrailingEmptyLines(lines: string[]): string[] {
    let endIndex = lines.length;
    while (endIndex > 0 && lines[endIndex - 1].trim() === "") {
        endIndex -= 1;
    }
    return lines.slice(0, endIndex);
}

function normalizeImportedTextLines(lines: string[]): string[] {
    return trimTrailingEmptyLines(lines).map((line) =>
        line.trim() === "" ? SLIDE_SEPARATOR : line
    );
}

/**
 * Mehrsprachige Abschnitte sind zeilenweise verschränkt (Sprache 1, Sprache 2, …),
 * ein Folienumbruch `--` steht aber nur einmal für alle Sprachen. Die Zuordnung
 * zur Sprache beginnt deshalb nach jedem Umbruch neu.
 */
function parseSectionTexts(contentLines: string[], langCount: number): string[] {
    if (langCount <= 1) {
        return [normalizeImportedTextLines(contentLines).join("\n")];
    }

    const textsByLanguage = Array.from({ length: langCount }, () => [] as string[]);
    let slideLines: string[] = [];

    function flushSlide() {
        slideLines.forEach((line, index) => textsByLanguage[index % langCount].push(line));
        slideLines = [];
    }

    contentLines.forEach((line) => {
        if (line.trim() !== SLIDE_SEPARATOR) {
            slideLines.push(line);
            return;
        }
        flushSlide();
        textsByLanguage.forEach((lines) => lines.push(SLIDE_SEPARATOR));
    });
    flushSlide();

    return textsByLanguage.map((lines) => trimTrailingEmptyLines(lines).join("\n"));
}

function parseSections(bodyLines: string[], langCount: number): SongSection[] {
    const blocks = splitSectionBlocks(bodyLines);

    return blocks.map((block) => {
        // Der Marker ist optional – ohne ihn gehört auch die erste Zeile zum Liedtext.
        const marker = parseMarkerToken(block[0] ?? "");
        const contentLines = marker ? block.slice(1) : block;

        return {
            id: generateId(),
            type: marker?.type ?? "Unbekannt",
            number: marker?.number ?? "",
            texts: parseSectionTexts(contentLines, langCount),
        };
    });
}

function normalizeVerseOrder(rawVerseOrder: string, sections: SongSection[]): string {
    if (!rawVerseOrder.trim()) return "";

    const availableMarkers = new Set(sections.map(getSectionMarker));

    const normalizedTokens = parseVerseOrder(rawVerseOrder).map((token) => {
        const parsed = parseMarkerToken(token);
        const normalized = parsed ? getSectionMarker(parsed) : token;
        return availableMarkers.has(normalized) ? normalized : token;
    });

    return serializeVerseOrder(normalizedTokens);
}

/**
 * Liest den Dateiinhalt als UTF-8. Ältere SongBeamer-Versionen speichern
 * ANSI (Windows-1252) – dann wären Umlaute als „�“ kaputt, daher der Fallback.
 */
export function decodeSngBytes(bytes: ArrayBuffer): string {
    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
        return new TextDecoder("windows-1252").decode(bytes);
    }
}

export function parseSng(content: string): SongFormData {
    const normalized = normalizeInput(content);
    const lines = normalized.split("\n");
    const { headerLines, bodyLines } = splitHeaderAndBody(lines);
    const headers = parseHeaders(headerLines);
    const metadata = toMetadata(headers);
    const sections = parseSections(bodyLines, metadata.langCount);
    metadata.verseOrder = normalizeVerseOrder(metadata.verseOrder, sections);

    if (!metadata.title.trim()) {
        throw new Error("Die Datei enthält keinen #Title-Header.");
    }

    if (sections.length === 0) {
        throw new Error("Die Datei enthält keine importierbaren Liedtext-Abschnitte.");
    }

    return {
        metadata,
        sections,
    };
}
