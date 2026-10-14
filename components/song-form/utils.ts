import {
    generateId,
    getSectionMarker,
    parseVerseOrder,
    serializeVerseOrder,
} from "@/lib/sng/markers";
import type { SongFormData } from "@/lib/sng/types";

export const DEFAULT_LANG_COUNT = 1;

export function newSection(
    type: string,
    number: string,
    langCount: number
): SongFormData["sections"][number] {
    return {
        id: generateId(),
        type: type as SongFormData["sections"][number]["type"],
        number,
        texts: Array.from({ length: Math.max(langCount, 1) }, () => ""),
    };
}

export function createDefaultValues(): SongFormData {
    return {
        metadata: {
            title: "",
            titleLang2: "",
            titleLang3: "",
            langCount: DEFAULT_LANG_COUNT,
            lang1: "Deutsch",
            lang2: "Englisch",
            lang3: "",
            originalTitle: "",
            author: "",
            melody: "",
            translation: "",
            publisher: "",
            rights: "",
            ccli: "",
            key: "",
            transpose: "",
            categories: [],
            tempo: "",
            verseOrder: "",
            books: "",
            bible: "",
            keywords: "",
            id: "",
            comments: "",
            quickFinder: "",
            churchSongId: "",
        },
        sections: [newSection("Vers", "", DEFAULT_LANG_COUNT)],
    };
}

export function getNormalizedSectionNumbers(sections: SongFormData["sections"]): string[] {
    const countsByType = new Map<string, number>();
    sections.forEach((sec) => {
        countsByType.set(sec.type, (countsByType.get(sec.type) ?? 0) + 1);
    });

    const seenByType = new Map<string, number>();
    return sections.map((sec) => {
        const totalOfType = countsByType.get(sec.type) ?? 0;
        if (totalOfType <= 1) return "";
        const next = (seenByType.get(sec.type) ?? 0) + 1;
        seenByType.set(sec.type, next);
        return String(next);
    });
}

function normalizeSections(sections: SongFormData["sections"]): SongFormData["sections"] {
    const normalizedNumbers = getNormalizedSectionNumbers(sections);
    return sections.map((section, index) => ({
        ...section,
        number: normalizedNumbers[index] ?? "",
    }));
}

export function reorderVerseOrderForSectionMove(
    currentRaw: string,
    previousSections: SongFormData["sections"],
    nextSections: SongFormData["sections"]
): string | null {
    const previousNormalizedSections = normalizeSections(previousSections);
    const nextNormalizedSections = normalizeSections(nextSections);
    const currentMarkers = parseVerseOrder(currentRaw);

    if (currentMarkers.length === 0) {
        return serializeVerseOrder(nextNormalizedSections.map(getSectionMarker));
    }

    const previousMarkersById = new Map(
        previousNormalizedSections.map((section) => [section.id, getSectionMarker(section)])
    );
    const repeatCountsById = new Map<string, number>();
    let currentIndex = 0;

    for (const section of previousNormalizedSections) {
        const marker = previousMarkersById.get(section.id);
        if (!marker) continue;

        let repeatCount = 0;
        while (currentMarkers[currentIndex] === marker) {
            repeatCount += 1;
            currentIndex += 1;
        }

        repeatCountsById.set(section.id, repeatCount);
    }

    if (currentIndex !== currentMarkers.length) {
        return null;
    }

    const nextMarkers: string[] = [];
    nextNormalizedSections.forEach((section) => {
        const marker = getSectionMarker(section);
        const repeatCount = repeatCountsById.get(section.id) ?? 0;
        const occurrences = repeatCount > 0 ? repeatCount : 1;

        for (let index = 0; index < occurrences; index += 1) {
            nextMarkers.push(marker);
        }
    });

    return serializeVerseOrder(nextMarkers);
}

export function mergeVerseOrderWithSections(
    currentRaw: string,
    sections: SongFormData["sections"]
): string {
    const available = sections.map(getSectionMarker);
    const availableSet = new Set(available);
    const current = parseVerseOrder(currentRaw).filter((marker) => availableSet.has(marker));

    if (current.length === 0) {
        return serializeVerseOrder(available);
    }

    const currentSet = new Set(current);
    const missingMarkers = available.filter((marker) => !currentSet.has(marker));

    return serializeVerseOrder([...current, ...missingMarkers]);
}
