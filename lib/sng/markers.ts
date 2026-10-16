import type { SongSection } from "./types";

/** Abschlussmarker jeder SongBeamer-Abspielreihenfolge. */
export const STOP = "STOP";

/** Zeile, die innerhalb eines Abschnitts eine neue Folie beginnt. */
export const SLIDE_SEPARATOR = "--";

/** Zeile, die zwei Abschnitte (und den Header vom Liedtext) trennt. */
export const SECTION_SEPARATOR = "---";

/**
 * Baut den Marker eines Abschnitts, wie er in der .sng-Datei und in
 * `#VerseOrder` steht. Beispiele: „Vers 1“, „Refrain“, „Bridge“.
 */
export function getSectionMarker(section: Pick<SongSection, "type" | "number">): string {
    const number = section.number?.trim();
    return number ? `${section.type} ${number}` : section.type;
}

/**
 * Zählt die Folien eines Abschnittstexts: Zeilen mit `--` (oder `---`) beginnen
 * eine neue Folie, leere Folien zählen nicht. Ein leerer Text ergibt eine Folie.
 */
export function countSlides(text: string): number {
    let slides = 0;
    let currentHasText = false;

    for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (trimmed === SLIDE_SEPARATOR || trimmed === SECTION_SEPARATOR) {
            if (currentHasText) slides += 1;
            currentHasText = false;
        } else if (trimmed.length > 0) {
            currentHasText = true;
        }
    }
    if (currentHasText) slides += 1;

    return Math.max(slides, 1);
}

/** Zerlegt einen `#VerseOrder`-Wert in seine Marker (ohne `STOP`). */
export function parseVerseOrder(raw: string): string[] {
    return raw
        .split(",")
        .map((token) => token.trim())
        .filter((token) => token.length > 0 && token !== STOP);
}

/** Setzt Marker zu einem `#VerseOrder`-Wert zusammen und hängt `STOP` an. */
export function serializeVerseOrder(markers: string[]): string {
    return [...markers, STOP].join(",");
}

/**
 * Erzeugt eine eindeutige ID. `crypto.randomUUID` gibt es nur in sicheren
 * Kontexten; `crypto.getRandomValues` funktioniert auch im lokalen Netz per HTTP.
 */
export function generateId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
        throw new TypeError("A cryptographically secure random number generator is unavailable.");
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
