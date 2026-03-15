export const SECTION_TYPES = [
    "Intro",
    "Vers",
    "Strophe",
    "Pre-Refrain",
    "Refrain",
    "Pre-Bridge",
    "Bridge",
    "Zwischenspiel",
    "Instrumental",
    "Pre-Coda",
    "Coda",
    "Outro",
    "Ending",
    "Teil",
    "Vamp",
    "Unbekannt",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
    Intro: "Intro (Einleitung)",
    Vers: "Vers / Strophe",
    Strophe: "Strophe",
    "Pre-Refrain": "Pre-Refrain",
    Refrain: "Refrain",
    "Pre-Bridge": "Pre-Bridge",
    Bridge: "Bridge",
    Zwischenspiel: "Zwischenspiel",
    Instrumental: "Instrumental",
    "Pre-Coda": "Pre-Coda",
    Coda: "Coda",
    Outro: "Outro",
    Ending: "Ending (Ende)",
    Teil: "Teil",
    Vamp: "Vamp",
    Unbekannt: "Unbekannt",
};

export const CATEGORIES = [
    "Anbetung",
    "Lobpreis",
    "Weihnachten",
    "Ostern",
    "Adventszeit",
    "Pfingsten",
    "Taufe",
    "Abendmahl",
    "Gebet",
    "Gemeinschaft",
    "Jugend",
    "Klassisch",
    "Hoffnung",
    "Glaube",
    "Stille",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MUSICAL_KEYS = [
    "C",
    "C#",
    "Db",
    "D",
    "D#",
    "Eb",
    "E",
    "F",
    "F#",
    "Gb",
    "G",
    "G#",
    "Ab",
    "A",
    "A#",
    "Bb",
    "B",
    "Cm",
    "C#m",
    "Dm",
    "D#m",
    "Ebm",
    "Em",
    "Fm",
    "F#m",
    "Gm",
    "G#m",
    "Abm",
    "Am",
    "A#m",
    "Bbm",
    "Bm",
] as const;

export type MusicalKey = (typeof MUSICAL_KEYS)[number];

export const TEMPO_OPTIONS = [
    "Langsam",
    "Mittel",
    "Schnell",
    "Sehr langsam",
    "Sehr schnell",
] as const;

/** Eine einzelne Sektion (Vers, Refrain, Bridge etc.) im Song */
export interface SongSection {
    /** Eindeutige ID für React-Key und DnD */
    id: string;
    /** Typ der Sektion (Vers, Refrain …) */
    type: SectionType;
    /** Optionale Nummer oder Buchstabe z.B. "1", "2", "1a" */
    number: string;
    /**
     * Texte je Sprache (0-basierter Index).
     * texts[0] = Sprache 1, texts[1] = Sprache 2, texts[2] = Sprache 3.
     * Jeder Eintrag ist ein mehrzeiliger String (Zeilenumbrüche = \n).
     */
    texts: string[];
}

/** Alle Metadaten eines Songs */
export interface SongMetadata {
    /** Pflichtfeld: Liedtitel */
    title: string;
    /** Titel in Sprache 2 (nur bei mehrsprachig) */
    titleLang2: string;
    /** Titel in Sprache 3 (nur bei mehrsprachig) */
    titleLang3: string;
    /** Anzahl der Sprachen (1–3) */
    langCount: number;
    /** Bezeichnung Sprache 1, z.B. „Deutsch" */
    lang1: string;
    /** Bezeichnung Sprache 2, z.B. „Englisch" */
    lang2: string;
    /** Bezeichnung Sprache 3 */
    lang3: string;
    /** Originaltitel (falls abweichend) */
    originalTitle: string;
    /** Textdichter / Autor */
    author: string;
    /** Komponist / Melodie */
    melody: string;
    /** Übersetzer */
    translation: string;
    /** Verlag / Rechteinhaber */
    publisher: string;
    /** Rechte / Originalkatalog */
    rights: string;
    /** CCLI-Liednummer */
    ccli: string;
    /** Tonart */
    key: string;
    /** Transposition in Halbtönen */
    transpose: string;
    /** Kategorien (Mehrfachauswahl) */
    categories: string[];
    /** Tempo */
    tempo: string;
    /** Abspielreihenfolge der Abschnitte, z.B. "Vers 1,Refrain,Vers 2,Refrain" */
    verseOrder: string;
    /** Liederbuch-Referenz */
    books: string;
    /** Bibelstelle */
    bible: string;
    /** Stichwörter */
    keywords: string;
    /** Interne Lied-ID */
    id: string;
    /** Bemerkungen / Kommentare */
    comments: string;
    /** Schnellsuche-Buchstaben */
    quickFinder: string;
    /** Gemeindeinterne Liednummer */
    churchSongId: string;
}

/** Gesamt-Formulardaten */
export interface SongFormData {
    metadata: SongMetadata;
    sections: SongSection[];
}
