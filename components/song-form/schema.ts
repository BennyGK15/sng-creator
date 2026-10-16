import { z } from "zod";

import { SECTION_TYPES } from "@/lib/sng/types";

export const sectionSchema = z.object({
    id: z.string(),
    type: z.enum(SECTION_TYPES, { error: "Bitte einen Abschnittstyp wählen" }),
    number: z.string(),
    texts: z.array(z.string()),
});

export const metadataSchema = z.object({
    title: z.string().min(1, "Titel ist ein Pflichtfeld"),
    titleLang2: z.string(),
    titleLang3: z.string(),
    langCount: z.number().int().min(1).max(3),
    lang1: z.string(),
    lang2: z.string(),
    lang3: z.string(),
    originalTitle: z.string(),
    author: z.string(),
    melody: z.string(),
    translation: z.string(),
    publisher: z.string(),
    rights: z.string(),
    ccli: z.string(),
    key: z.string(),
    transpose: z.string(),
    categories: z.array(z.string()),
    tempo: z.string(),
    verseOrder: z.string(),
    books: z.string(),
    bible: z.string(),
    keywords: z.string(),
    id: z.string(),
    comments: z.string(),
    quickFinder: z.string(),
    churchSongId: z.string(),
});

export const formSchema = z.object({
    metadata: metadataSchema,
    sections: z
        .array(sectionSchema)
        .min(1, "Lege mindestens einen Abschnitt an.")
        .refine(
            (sections) => sections.some((section) => section.texts.some((text) => text.trim())),
            "Bitte gib zuerst einen Liedtext ein – mindestens ein Abschnitt braucht Text."
        ),
});
