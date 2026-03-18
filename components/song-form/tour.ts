export type TourStep = {
    targetSelector: string;
    title: string;
    description: string;
    tab?: string;
};

export const TOUR_STEPS: TourStep[] = [
    {
        targetSelector: "#tour-metadata-card",
        title: "Metadaten",
        description:
            "Hier pflegst du Titel, Copyright, Musikdaten und weitere Song-Infos über die Tabs.",
    },
    {
        targetSelector: "#tour-tabs-list",
        tab: "allgemein",
        title: "Tabs nutzen",
        description: "Wechsle durch die Bereiche, um alle Metadaten strukturiert zu erfassen.",
    },
    {
        targetSelector: "#tour-title-input",
        tab: "allgemein",
        title: "Titel eintragen",
        description:
            "Beginne mit dem Liedtitel. Das Feld ist Pflicht und wird auch für den Dateinamen genutzt.",
    },
    {
        targetSelector: "#tour-tab-copyright",
        tab: "copyright",
        title: "Tab: Copyright",
        description: "Hier trägst du Autor, Komponist, Verlag und CCLI-Infos ein.",
    },
    {
        targetSelector: "#tour-tab-musik",
        tab: "musik",
        title: "Tab: Musik",
        description: "In diesem Bereich legst du Tonart, Tempo und musikalische Zusatzdaten fest.",
    },
    {
        targetSelector: "#tour-tab-kategorien",
        tab: "kategorien",
        title: "Tab: Kategorien",
        description: "Hier ordnest du das Lied per Kategorien und Stichwörtern thematisch ein.",
    },
    {
        targetSelector: "#tour-tab-abspielreihenfolge",
        tab: "abspielreihenfolge",
        title: "Tab: Abspielreihenfolge",
        description:
            "Dort steuerst du, in welcher Reihenfolge Verse und Refrains abgespielt werden.",
    },
    {
        targetSelector: "#tour-tab-erweitert",
        tab: "erweitert",
        title: "Tab: Erweitert",
        description:
            "Im erweiterten Bereich pflegst du interne IDs, Liederbuchangaben und Kommentare.",
    },
    {
        targetSelector: "#tour-sections-card",
        title: "Liedtext bearbeiten",
        description:
            "Hier erstellst und sortierst du Verse, Refrains und weitere Abschnitte per Drag-and-drop.",
    },
    {
        targetSelector: "#tour-add-section",
        title: "Abschnitte hinzufügen",
        description: "Mit diesem Button legst du schnell neue Textabschnitte an.",
    },
    {
        targetSelector: "#tour-preview-btn",
        title: "Folienvorschau prüfen",
        description:
            "Vor dem Export kannst du dir ansehen, wie die Folien später dargestellt werden.",
    },
    {
        targetSelector: "#tour-export-btn",
        title: "Datei exportieren",
        description: "Wenn alles passt, exportierst du hier die fertige .sng-Datei.",
    },
] as const;
