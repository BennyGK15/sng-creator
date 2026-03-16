import type { SongFormData, SongSection } from "@/lib/sng/types";

import type { PreviewSlide } from "./types";

export function getLanguageScale(langIndex: number): number {
    if (langIndex === 0) return 1;
    if (langIndex === 1) return 0.72;
    return 0.58;
}

export function getLineGroupSpacing(index: number, langCount: number): number {
    if (langCount <= 1) return 0;
    if (index < langCount) return 0;
    return index % langCount === 0 ? 8 : 0;
}

function buildMarker(section: SongSection): string {
    const number = section.number?.trim();
    return number ? `${section.type} ${number}` : section.type;
}

function sectionSequence(data: SongFormData): SongSection[] {
    const byMarker = new Map<string, SongSection>();
    data.sections.forEach((section) => {
        byMarker.set(buildMarker(section), section);
    });

    const fromVerseOrder = (data.metadata.verseOrder || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0 && entry !== "STOP")
        .map((marker) => byMarker.get(marker))
        .filter((section): section is SongSection => Boolean(section));

    if (fromVerseOrder.length > 0) return fromVerseOrder;
    return data.sections;
}

function buildInterleavedLines(section: SongSection, langCount: number): string[] {
    if (langCount <= 1) {
        return (section.texts[0] ?? "").split("\n");
    }

    const langLines: string[][] = [];
    for (let index = 0; index < langCount; index += 1) {
        langLines.push((section.texts[index] ?? "").split("\n"));
    }

    const maxLines = Math.max(...langLines.map((lines) => lines.length), 0);
    const result: string[] = [];

    for (let row = 0; row < maxLines; row += 1) {
        for (let langIndex = 0; langIndex < langCount; langIndex += 1) {
            result.push(langLines[langIndex][row] ?? "");
        }
    }

    return result;
}

function splitSlides(lines: string[]): string[][] {
    const slides: string[][] = [[]];

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed === "---" || trimmed === "--") {
            if (slides[slides.length - 1].length > 0) {
                slides.push([]);
            }
            return;
        }

        slides[slides.length - 1].push(line);
    });

    return slides
        .map((slide) => slide.filter((line) => line.trim().length > 0))
        .filter((slide) => slide.length > 0);
}

export function buildSlides(data: SongFormData | null): PreviewSlide[] {
    if (!data) return [];

    const sequence = sectionSequence(data);
    const result: PreviewSlide[] = [];

    sequence.forEach((section) => {
        const marker = buildMarker(section);
        const interleaved = buildInterleavedLines(section, data.metadata.langCount);
        const slides = splitSlides(interleaved);
        const safeSlides = slides.length > 0 ? slides : [[""]];

        safeSlides.forEach((lines, index) => {
            result.push({
                marker,
                lines,
                slideInSection: index + 1,
                sectionSlideCount: safeSlides.length,
            });
        });
    });

    return result;
}
