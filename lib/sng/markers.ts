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
 * Kontexten (HTTPS/localhost) – im lokalen Netz per HTTP fehlt es.
 */
export function generateId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
