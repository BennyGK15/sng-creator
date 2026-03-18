import type { SongFormData, SongSection, SongMetadata } from "./types";

/**
 * Baut den Vers-/Sektionsmarker für die erste Zeile eines Abschnitts.
 * Beispiele: "Vers 1", "Refrain", "Bridge", "Intro"
 */
function buildMarker(section: SongSection): string {
    const num = section.number?.trim();
    if (num) {
        return `${section.type} ${num}`;
    }
    return section.type;
}

function isExportSeparator(line: string): boolean {
    const trimmed = line.trim();
    return trimmed === "--" || trimmed === "---";
}

function pushSanitizedLine(outputLines: string[], nextLine: string) {
    const previousLine = outputLines[outputLines.length - 1];
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

/**
 * Gibt alle Header-Zeilen in der SongBeamer-korrekten Reihenfolge zurück.
 */
function buildHeaders(meta: SongMetadata): string[] {
    const h: string[] = [];

    // --- Titel ---
    h.push(`#Title=${meta.title}`);
    if (meta.langCount >= 2 && meta.titleLang2) {
        h.push(`#TitleLang2=${meta.titleLang2}`);
    }
    if (meta.langCount >= 3 && meta.titleLang3) {
        h.push(`#TitleLang3=${meta.titleLang3}`);
    }

    // --- Mehrsprachigkeit ---
    h.push(`#LangCount=${meta.langCount}`);

    // --- Copyright / Autoren ---
    if (meta.originalTitle) h.push(`#OriginalTitle=${meta.originalTitle}`);
    if (meta.author) h.push(`#Author=${meta.author}`);
    if (meta.melody) h.push(`#Melody=${meta.melody}`);
    if (meta.translation) h.push(`#Translation=${meta.translation}`);
    if (meta.publisher) {
        h.push(`#Publisher=${meta.publisher}`);
        h.push(`#(c)=${meta.publisher}`);
    }
    if (meta.rights) h.push(`#Rights=${meta.rights}`);
    if (meta.ccli) h.push(`#CCLI=${meta.ccli}`);

    // --- Musikalisch ---
    if (meta.key) h.push(`#Key=${meta.key}`);
    if (meta.transpose) h.push(`#Transpose=${meta.transpose}`);
    if (meta.tempo) h.push(`#Tempo=${meta.tempo}`);

    // --- Kategorien / Suche ---
    if (meta.categories && meta.categories.length > 0) {
        h.push(`#Categories=${meta.categories.join(",")}`);
    }
    if (meta.keywords) h.push(`#Keywords=${meta.keywords}`);
    if (meta.quickFinder) h.push(`#QuickFinder=${meta.quickFinder}`);

    // --- Reihenfolge ---
    if (meta.verseOrder) h.push(`#VerseOrder=${meta.verseOrder}`);

    // --- Referenzen ---
    if (meta.bible) h.push(`#Bible=${meta.bible}`);
    if (meta.books) h.push(`#Books=${meta.books}`);
    if (meta.churchSongId) h.push(`#ChurchSongID=${meta.churchSongId}`);

    // --- Sonstiges ---
    if (meta.id) h.push(`#ID=${meta.id}`);
    if (meta.comments) h.push(`#Comments=${meta.comments}`);

    // --- Editor / Version (vom Editor gesetzt) ---
    h.push(`#Editor=SongBeamer - Song Editor by Benjamin Esenwein`);
    h.push(`#Version=3`);

    return h;
}

/**
 * Gibt die Textzeilen einer Sektion zurück, passend zur Anzahl der Sprachen.
 *
 * Bei 1 Sprache: Zeilen direkt ausgeben.
 * Bei 2+ Sprachen: Zeilen werden für jede Position zeilenweise verschränkt:
 *   Zeile 1 Sprache 1 → Zeile 1 Sprache 2 → Zeile 2 Sprache 1 → Zeile 2 Sprache 2 …
 */
function buildSectionLines(section: SongSection, langCount: number): string[] {
    const lines: string[] = [];

    // Sektionsmarker als erste Zeile (SongBeamer-Tag)
    lines.push(buildMarker(section));

    if (langCount === 1) {
        const text = section.texts[0] ?? "";
        const textLines = text.split("\n");
        lines.push(...textLines);
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
    pushSanitizedLine(outputLines, "---");

    // 3. Sektionen
    for (let i = 0; i < sections.length; i++) {
        const sectionLines = buildSectionLines(sections[i], metadata.langCount);
        sectionLines.forEach((line) => pushSanitizedLine(outputLines, line));

        // Abschnittstrennzeichen --- nach jeder Sektion außer der letzten
        if (i < sections.length - 1) {
            pushSanitizedLine(outputLines, "---");
        }
    }

    // SongBeamer verwendet Windows-Zeilenenden (CRLF)
    return outputLines.join("\r\n");
}

/**
 * Erzeugt automatisch den #VerseOrder-Wert aus der aktuellen Sektionsliste.
 */
export function generateVerseOrder(sections: SongSection[]): string {
    return sections.map((s) => buildMarker(s)).join(",");
}
