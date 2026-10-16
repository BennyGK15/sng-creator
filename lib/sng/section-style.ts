import type { CSSProperties } from "react";

import { SECTION_TYPES, type SectionType } from "./types";

/**
 * Gruppiert Abschnittstypen nach ihrer Rolle im Lied, damit Strophen,
 * Refrains, Bridges usw. im Editor auf einen Blick unterscheidbar sind.
 */
export type SectionFamily = "verse" | "chorus" | "bridge" | "frame" | "instrumental";

const FAMILY_BY_TYPE: Record<SectionType, SectionFamily> = {
    Vers: "verse",
    Strophe: "verse",
    Teil: "verse",
    Chorus: "chorus",
    Refrain: "chorus",
    "Pre-Refrain": "chorus",
    Bridge: "bridge",
    "Pre-Bridge": "bridge",
    Intro: "frame",
    Outro: "frame",
    Ending: "frame",
    Coda: "frame",
    "Pre-Coda": "frame",
    Misc: "frame",
    Unbekannt: "frame",
    Zwischenspiel: "instrumental",
    Instrumental: "instrumental",
    Vamp: "instrumental",
};

export function getSectionFamily(type: string | undefined): SectionFamily {
    return FAMILY_BY_TYPE[type as SectionType] ?? "frame";
}

/** Leitet den Abschnittstyp aus einem Marker wie „Vers 2“ ab. */
export function getSectionTypeFromMarker(marker: string): string {
    // Nummer am Ende abtrennen, ohne Regex mit Backtracking-Risiko
    const lastSpace = marker.lastIndexOf(" ");
    const suffix = marker.slice(lastSpace + 1);
    const type =
        lastSpace > 0 && /^\d+$/.test(suffix) ? marker.slice(0, lastSpace).trimEnd() : marker;
    return (SECTION_TYPES as readonly string[]).includes(type) ? type : "Unbekannt";
}

/**
 * Setzt `--section` auf die Farbe der Abschnittsfamilie. Komponenten nutzen
 * die Variable dann z. B. über `border-(--section)` oder `bg-(--section)/10`.
 */
export function getSectionStyle(type: string | undefined): CSSProperties {
    return { "--section": `var(--section-${getSectionFamily(type)})` } as CSSProperties;
}
