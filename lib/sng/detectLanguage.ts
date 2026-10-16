/**
 * Erkennt die Sprache eines Liedtexts – komplett offline, ohne Bibliothek oder API.
 *
 * 1. Eigene Schriften (Kyrillisch, Griechisch, Arabisch …) sind eindeutig.
 * 2. Für lateinische Schrift zählen häufige Funktionswörter („und“, „the“, „le“ …)
 *    und typische Sonderzeichen (ß, ñ, ã, ł …). Liedtexte haben dafür genug Zeilen.
 *
 * Ist das Ergebnis nicht eindeutig, wird bewusst nichts geraten (`null`).
 */

type LatinProfile = {
    name: string;
    /** Häufige, möglichst sprachtypische Wörter (kleingeschrieben). */
    words: string[];
    /** Buchstaben, die fast nur in dieser Sprache vorkommen. */
    chars?: RegExp;
};

const LATIN_PROFILES: LatinProfile[] = [
    {
        name: "Deutsch",
        words: [
            "der",
            "die",
            "das",
            "und",
            "ist",
            "nicht",
            "ich",
            "du",
            "wir",
            "ihr",
            "ein",
            "eine",
            "einen",
            "dem",
            "den",
            "des",
            "mit",
            "auf",
            "für",
            "von",
            "zu",
            "sich",
            "auch",
            "wie",
            "mein",
            "dein",
            "unser",
            "gott",
            "herr",
            "herrn",
            "uns",
            "dich",
            "mich",
            "dir",
            "mir",
            "noch",
            "nur",
            "über",
            "wenn",
            "wird",
            "bist",
            "sind",
            "hat",
            "deine",
            "meine",
            "vor",
            "bei",
            "aus",
            "allen",
            "alle",
            "dass",
            "ewig",
            "liebe",
        ],
        chars: /[ßäöü]/g,
    },
    {
        name: "Englisch",
        words: [
            "the",
            "and",
            "you",
            "is",
            "are",
            "my",
            "your",
            "we",
            "our",
            "of",
            "to",
            "for",
            "with",
            "be",
            "all",
            "his",
            "he",
            "me",
            "us",
            "lord",
            "this",
            "that",
            "it",
            "love",
            "praise",
            "but",
            "now",
            "how",
            "like",
            "who",
            "what",
            "when",
            "there",
            "glory",
            "jesus",
            "king",
            "holy",
            "grace",
            "heart",
            "can",
            "have",
            "been",
            "never",
            "thy",
            "thee",
            "thou",
        ],
    },
    {
        name: "Französisch",
        words: [
            "le",
            "les",
            "et",
            "est",
            "je",
            "nous",
            "vous",
            "elle",
            "un",
            "une",
            "des",
            "du",
            "pour",
            "avec",
            "dans",
            "mon",
            "ton",
            "notre",
            "votre",
            "seigneur",
            "dieu",
            "ne",
            "pas",
            "qui",
            "sur",
            "tout",
            "toi",
            "moi",
            "ma",
            "ta",
            "ses",
            "au",
            "aux",
            "gloire",
            "jamais",
        ],
        chars: /[èëîûœùâêô]/g,
    },
    {
        name: "Spanisch",
        words: [
            "el",
            "los",
            "las",
            "y",
            "yo",
            "nosotros",
            "una",
            "del",
            "con",
            "para",
            "por",
            "mi",
            "su",
            "señor",
            "dios",
            "se",
            "te",
            "al",
            "está",
            "eres",
            "tú",
            "tu",
            "nuestro",
            "gloria",
            "santo",
            "cielos",
            "tierra",
            "siempre",
            "más",
            "como",
            "pero",
        ],
        chars: /[ñ¿¡]/g,
    },
    {
        name: "Italienisch",
        words: [
            "il",
            "lo",
            "gli",
            "è",
            "io",
            "noi",
            "voi",
            "della",
            "dell",
            "nel",
            "nella",
            "alla",
            "per",
            "mio",
            "tuo",
            "tua",
            "nostro",
            "signore",
            "dio",
            "che",
            "non",
            "sono",
            "cieli",
            "pieni",
            "sempre",
            "anche",
            "come",
            "gloria",
        ],
        chars: /[ìò]/g,
    },
    {
        name: "Niederländisch",
        words: [
            "het",
            "een",
            "ik",
            "jij",
            "wij",
            "zijn",
            "niet",
            "met",
            "voor",
            "onze",
            "mijn",
            "jouw",
            "uw",
            "heer",
            "ook",
            "maar",
            "wat",
            "dat",
            "bent",
            "heel",
            "hij",
            "zij",
            "naar",
            "zal",
            "altijd",
            "liefde",
        ],
    },
    {
        name: "Portugiesisch",
        words: [
            "os",
            "uma",
            "dos",
            "das",
            "com",
            "para",
            "por",
            "meu",
            "teu",
            "nosso",
            "senhor",
            "deus",
            "não",
            "você",
            "eu",
            "nós",
            "é",
            "está",
            "são",
            "em",
            "estão",
            "céus",
            "glória",
            "sempre",
            "tua",
        ],
        chars: /[ãõ]/g,
    },
    {
        name: "Polnisch",
        words: [
            "w",
            "z",
            "na",
            "się",
            "jest",
            "że",
            "ty",
            "mój",
            "twój",
            "nasz",
            "pan",
            "bóg",
            "jak",
            "tak",
            "dla",
            "od",
            "za",
            "nad",
            "ciebie",
            "mnie",
            "wszystko",
        ],
        chars: /[ąęłśźżńć]/g,
    },
];

type ScriptProfile = { name: string; pattern: RegExp; refine?: (text: string) => string };

const SCRIPT_PROFILES: ScriptProfile[] = [
    {
        name: "Russisch",
        pattern: /[Ѐ-ӿ]/g,
        // Ukrainisch hat eigene Buchstaben (і, ї, є, ґ)
        refine: (text) => (/[іїєґ]/i.test(text) ? "Ukrainisch" : "Russisch"),
    },
    { name: "Griechisch", pattern: /[Ͱ-Ͽ]/g },
    {
        name: "Arabisch",
        pattern: /[؀-ۿ]/g,
        // Persisch nutzt zusätzliche Buchstaben (پ چ ژ گ)
        refine: (text) => (/[پچژگ]/.test(text) ? "Persisch" : "Arabisch"),
    },
    { name: "Hebräisch", pattern: /[֐-׿]/g },
    { name: "Japanisch", pattern: /[぀-ヿ]/g },
    { name: "Koreanisch", pattern: /[가-힯]/g },
    { name: "Chinesisch", pattern: /[一-鿿]/g },
];

/** Mindestanzahl an Treffern, damit überhaupt eine Sprache gemeldet wird. */
const MIN_SCORE = 3;
/** Wie deutlich die beste Sprache vor der zweitbesten liegen muss. */
const MIN_LEAD = 1.5;

const WORD_SETS = LATIN_PROFILES.map((profile) => new Set(profile.words));

function countMatches(text: string, pattern: RegExp): number {
    return Array.from(text.matchAll(pattern)).length;
}

export function detectLanguage(text: string): string | null {
    const letters = countMatches(text, /\p{L}/gu);
    if (letters === 0) return null;

    for (const script of SCRIPT_PROFILES) {
        const count = countMatches(text, script.pattern);
        if (count / letters >= 0.3) return script.refine?.(text) ?? script.name;
    }

    const tokens = text
        .toLowerCase()
        .split(/[^\p{L}]+/u)
        .filter(Boolean);
    const scores = LATIN_PROFILES.map((profile, index) => {
        const wordHits = tokens.filter((token) => WORD_SETS[index].has(token)).length;
        const charHits = profile.chars ? countMatches(text.toLowerCase(), profile.chars) : 0;
        return { name: profile.name, score: wordHits + charHits * 0.5 };
    });

    scores.sort((a, b) => b.score - a.score);
    const [best, second] = scores;
    if (best.score < MIN_SCORE || best.score < second.score * MIN_LEAD) return null;
    return best.name;
}

/**
 * Liest die Sprachkürzel aus dem Dateinamen, wie dieser Editor sie beim Export
 * anhängt (z. B. „Lied_DE-EN.sng“). Erkannt werden diese Kürzel und ISO-Codes.
 * Liefert pro Sprache einen Namen oder `null`, wenn das Kürzel mehrdeutig ist.
 */
const LANGUAGE_CODES: Record<string, string[]> = {
    DE: ["Deutsch"],
    EN: ["Englisch"],
    FR: ["Französisch"],
    ES: ["Spanisch"],
    SP: ["Spanisch"],
    IT: ["Italienisch"],
    NL: ["Niederländisch"],
    NI: ["Niederländisch"],
    PT: ["Portugiesisch"],
    PL: ["Polnisch"],
    PO: ["Portugiesisch", "Polnisch"],
    RU: ["Russisch"],
    UK: ["Ukrainisch"],
    EL: ["Griechisch"],
    GR: ["Griechisch"],
    AR: ["Arabisch"],
    FA: ["Persisch"],
    PE: ["Persisch"],
    HE: ["Hebräisch"],
    JA: ["Japanisch"],
    KO: ["Koreanisch"],
    ZH: ["Chinesisch"],
    CH: ["Chinesisch"],
};

export function parseLanguagesFromFilename(
    fileName: string,
    langCount: number
): Array<string[] | null> | null {
    const match = /_([a-z]{2}(?:-[a-z]{2}){1,2})\.(?:sng|txt)$/i.exec(fileName);
    if (!match) return null;

    const codes = match[1].toUpperCase().split("-");
    if (codes.length !== langCount) return null;
    return codes.map((code) => LANGUAGE_CODES[code] ?? null);
}

/**
 * Bestimmt die Sprachnamen eines importierten Lieds. Ein eindeutiges Kürzel im
 * Dateinamen gewinnt, sonst entscheidet der Text. Bei mehrdeutigem Kürzel
 * („PO“ = Portugiesisch oder Polnisch) hilft der Text bei der Auswahl.
 */
export function detectSongLanguages(
    textsByLanguage: string[],
    fileName?: string
): Array<string | null> {
    const fromFilename = fileName
        ? parseLanguagesFromFilename(fileName, textsByLanguage.length)
        : null;

    return textsByLanguage.map((text, index) => {
        const candidates = fromFilename?.[index] ?? null;
        if (candidates?.length === 1) return candidates[0];

        const detected = detectLanguage(text);
        if (candidates && detected && !candidates.includes(detected)) return null;
        return detected;
    });
}
