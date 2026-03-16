import type { SongFormData } from "@/lib/sng/types";

import { MAX_REPEAT, STOP, type VerseOrderItem } from "./types";

export function parseOrder(raw: string): VerseOrderItem[] {
    const tokens = raw
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && value !== STOP);

    const result: VerseOrderItem[] = [];

    for (const marker of tokens) {
        const last = result[result.length - 1];
        if (last && last.marker === marker && last.repeat < MAX_REPEAT) {
            last.repeat = (last.repeat + 1) as 1 | 2 | 3;
            continue;
        }

        result.push({ marker, repeat: 1 });
    }

    return result;
}

export function serializeOrder(items: VerseOrderItem[]): string {
    const expanded: string[] = [];

    for (const item of items) {
        for (let index = 0; index < item.repeat; index += 1) {
            expanded.push(item.marker);
        }
    }

    return [...expanded, STOP].join(",");
}

export function buildAvailableMarkers(sections: SongFormData["sections"] = []): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const section of sections) {
        const marker = `${section.type}${section.number ? ` ${section.number}` : ""}`;
        if (!seen.has(marker)) {
            seen.add(marker);
            result.push(marker);
        }
    }

    return result;
}
