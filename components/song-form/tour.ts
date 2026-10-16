export type TourStep = {
    targetSelector: string;
    title: string;
    description: string;
    tab?: string;
};

export const TOUR_STEPS: TourStep[] = [
    {
        targetSelector: "#tour-title-input",
        tab: "allgemein",
        title: "Titel eintragen",
        description:
            "Beginne mit dem Liedtitel. Er ist die einzige Pflichtangabe und wird auch für den Dateinamen verwendet.",
    },
    {
        targetSelector: "#tour-tabs-list",
        tab: "allgemein",
        title: "Weitere Angaben (freiwillig)",
        description:
            "Über diese Reiter kannst du Autor, Tonart, Kategorien und mehr eintragen. Du kannst sie auch einfach leer lassen.",
    },
    {
        targetSelector: "#tour-sections-card",
        title: "Liedtext eingeben",
        description:
            "Jede Strophe und jeder Refrain bekommt einen eigenen Abschnitt. Eine Zeile mit zwei Bindestrichen (--) beginnt eine neue Folie.",
    },
    {
        targetSelector: "#tour-add-section",
        title: "Weitere Strophe oder Refrain",
        description:
            "Mit diesem Button legst du einen neuen Abschnitt an. Die Art (Vers, Refrain, Bridge …) wählst du oben im Abschnitt.",
    },
    {
        targetSelector: "#tour-tab-abspielreihenfolge",
        tab: "abspielreihenfolge",
        title: "Reihenfolge beim Abspielen",
        description:
            "Hier legst du fest, in welcher Reihenfolge SongBeamer die Abschnitte zeigt – z. B. den Refrain nach jeder Strophe. Neue Abschnitte werden automatisch ergänzt.",
    },
    {
        targetSelector: "#tour-preview-btn",
        title: "Folien prüfen",
        description: "Hier siehst du vorab, wie die Folien später in SongBeamer aussehen.",
    },
    {
        targetSelector: "#tour-export-btn",
        title: "Datei herunterladen",
        description:
            "Wenn alles passt, erstellst du hier die fertige Datei für SongBeamer und lädst sie herunter.",
    },
] as const;
