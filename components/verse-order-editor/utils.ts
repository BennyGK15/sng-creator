import { getSectionMarker, parseVerseOrder, serializeVerseOrder } from "@/lib/sng/markers";
import type { SongFormData } from "@/lib/sng/types";

import { MAX_REPEAT, type VerseOrderItem } from "./types";

export function parseOrder(raw: string): VerseOrderItem[] {
    const tokens = parseVerseOrder(raw);
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
    return serializeVerseOrder(
        items.flatMap((item) => Array.from({ length: item.repeat }, () => item.marker))
    );
}

export function buildAvailableMarkers(sections: SongFormData["sections"] = []): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const section of sections) {
        const marker = getSectionMarker(section);
        if (!seen.has(marker)) {
            seen.add(marker);
            result.push(marker);
        }
    }

    return result;
}
