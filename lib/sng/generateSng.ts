import { getSectionMarker, SECTION_SEPARATOR, SLIDE_SEPARATOR } from "./markers";
import type { SongFormData, SongSection, SongMetadata } from "./types";

function isExportSeparator(line: string): boolean {
    const trimmed = line.trim();
    return trimmed === SLIDE_SEPARATOR || trimmed === SECTION_SEPARATOR;
}

function pushSanitizedLine(outputLines: string[], nextLine: string) {
    const previousLine = outputLines.at(-1);
    if (
        previousLine !== undefined &&
        isExportSeparator(previousLine) &&
        isExportSeparator(nextLine) &&
        previousLine.trim() === nextLine.trim()
    ) {
        return;
    }

    outputLines.push(nextLine);
}

const EDITOR_NAME = "SongBeamer - Song Editor by Benjamin Esenwein";

/**
 * Gibt alle Header-Zeilen in der SongBeamer-korrekten Reihenfolge zurück.
 * Optionale Felder ohne Wert werden weggelassen.
 */
function buildHeaders(meta: SongMetadata): string[] {
    const optionalHeaders: Array<[key: string, value: string | undefined]> = [
        // Titel
        ["TitleLang2", meta.langCount >= 2 ? meta.titleLang2 : undefined],
        ["TitleLang3", meta.langCount >= 3 ? meta.titleLang3 : undefined],
        // Mehrsprachigkeit
        ["LangCount", String(meta.langCount)],
        // Copyright / Autoren
        ["OriginalTitle", meta.originalTitle],
        ["Author", meta.author],
        ["Melody", meta.melody],
        ["Translation", meta.translation],
        ["Publisher", meta.publisher],
        ["(c)", meta.publisher],
        ["Rights", meta.rights],
        ["CCLI", meta.ccli],
        // Musikalisch
        ["Key", meta.key],
        ["Transpose", meta.transpose],
        ["Tempo", meta.tempo],
        // Kategorien / Suche
        ["Categories", meta.categories?.join(",")],
        ["Keywords", meta.keywords],
        ["QuickFinder", meta.quickFinder],
        // Reihenfolge
        ["VerseOrder", meta.verseOrder],
        // Referenzen
        ["Bible", meta.bible],
        ["Books", meta.books],
        ["ChurchSongID", meta.churchSongId],
        // Sonstiges
        ["ID", meta.id],
        ["Comments", meta.comments],
        // Editor / Version (vom Editor gesetzt)
        ["Editor", EDITOR_NAME],
        ["Version", "3"],
    ];

    return [
        `#Title=${meta.title}`,
        ...optionalHeaders.filter(([, value]) => value).map(([key, value]) => `#${key}=${value}`),
    ];
}

/**
 * Gibt die Textzeilen einer Sektion zurück, passend zur Anzahl der Sprachen.
 *
 * Bei 1 Sprache: Zeilen direkt ausgeben.
 * Bei 2+ Sprachen: Zeilen werden für jede Position zeilenweise verschränkt:
 *   Zeile 1 Sprache 1 → Zeile 1 Sprache 2 → Zeile 2 Sprache 1 → Zeile 2 Sprache 2 …
 */
function buildSectionLines(section: SongSection, langCount: number): string[] {
    // Sektionsmarker als erste Zeile (SongBeamer-Tag)
    const lines: string[] = [getSectionMarker(section)];

    if (langCount === 1) {
        lines.push(...(section.texts[0] ?? "").split("\n"));
    } else {
        // Mehrsprachig: Zeilen verschränken
        const langLines: string[][] = [];
        for (let l = 0; l < langCount; l++) {
            const txt = section.texts[l] ?? "";
            langLines.push(txt.split("\n"));
        }
        const maxLines = Math.max(...langLines.map((ll) => ll.length));
        for (let i = 0; i < maxLines; i++) {
            for (let l = 0; l < langCount; l++) {
                // Leere Zeilen für fehlende Sprachzeilen hinzufügen
                lines.push(langLines[l][i] ?? "");
            }
        }
    }

    return lines;
}

/**
 * Erzeugt den vollständigen .sng-Dateiinhalt aus den Formulardaten.
 *
 * Format (SongBeamer-konform):
 * 1. Header-Zeilen (#Key=Wert)
 * 2. Leerzeile als Trennzeichen
 * 3. Sektionen, getrennt durch ---
 *    – Erste Zeile jeder Sektion ist der Vers-Marker (z.B. "Vers 1", "Refrain")
 *    – dann der Liedtext (bei Mehrsprachigkeit zeilenweise verschränkt)
 *
 * Zeilenenden: \r\n (Windows / SongBeamer-Standard)
 */
export function generateSng(data: SongFormData): string {
    const { metadata, sections } = data;

    const outputLines: string[] = [];

    // 1. Header
    buildHeaders(metadata).forEach((line) => pushSanitizedLine(outputLines, line));

    // 2. Trennzeile zwischen Header und Liedtext
    pushSanitizedLine(outputLines, SECTION_SEPARATOR);

    // 3. Sektionen
    for (let i = 0; i < sections.length; i++) {
        const sectionLines = buildSectionLines(sections[i], metadata.langCount);
        sectionLines.forEach((line) => pushSanitizedLine(outputLines, line));

        // Abschnittstrennzeichen --- nach jeder Sektion außer der letzten
        if (i < sections.length - 1) {
            pushSanitizedLine(outputLines, SECTION_SEPARATOR);
        }
    }

    // SongBeamer verwendet Windows-Zeilenenden (CRLF)
    return outputLines.join("\r\n");
}
