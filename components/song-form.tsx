"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider, useFieldArray, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SectionEditor } from "@/components/section-editor";
import { ExportDialog } from "@/components/export-dialog";
import { SlidePreviewDialog } from "@/components/slide-preview-dialog";
import { VerseOrderEditor } from "@/components/verse-order-editor";
import { generateSng } from "@/lib/sng/generateSng";
import { CATEGORIES, MUSICAL_KEYS, TEMPO_OPTIONS, type SongFormData } from "@/lib/sng/types";

// ---------------------------------------------------------------------------
// Zod-Schema für die Formularvalidierung
// ---------------------------------------------------------------------------
const sectionSchema = z.object({
    id: z.string(),
    type: z.string().min(1, "Bitte einen Abschnittstyp wählen"),
    number: z.string(),
    texts: z.array(z.string()),
});

const metadataSchema = z.object({
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

const formSchema = z.object({
    metadata: metadataSchema,
    sections: z.array(sectionSchema).min(1, "Mindestens ein Abschnitt ist erforderlich"),
});

// Zod v4 + react-hook-form: expliziter Typ-Cast erforderlich
type FormSchema = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Hilfsfunktion: neue leere Sektion erzeugen
// ---------------------------------------------------------------------------
function newSection(
    type: string,
    number: string,
    langCount: number
): SongFormData["sections"][number] {
    return {
        id: crypto.randomUUID(),
        type: type as SongFormData["sections"][number]["type"],
        number,
        texts: Array.from({ length: Math.max(langCount, 1) }, () => ""),
    };
}

function getNormalizedSectionNumbers(sections: SongFormData["sections"]): string[] {
    const countsByType = new Map<string, number>();
    sections.forEach((sec) => {
        countsByType.set(sec.type, (countsByType.get(sec.type) ?? 0) + 1);
    });

    const seenByType = new Map<string, number>();
    return sections.map((sec) => {
        const totalOfType = countsByType.get(sec.type) ?? 0;
        if (totalOfType <= 1) return "";
        const next = (seenByType.get(sec.type) ?? 0) + 1;
        seenByType.set(sec.type, next);
        return String(next);
    });
}

function sectionMarker(section: SongFormData["sections"][number]): string {
    return `${section.type}${section.number ? ` ${section.number}` : ""}`;
}

function parseVerseOrder(raw: string): string[] {
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s !== "STOP");
}

function serializeVerseOrder(markers: string[]): string {
    return [...markers, "STOP"].join(",");
}

function mergeVerseOrderWithSections(
    currentRaw: string,
    sections: SongFormData["sections"]
): string {
    const available = sections.map(sectionMarker);
    const current = parseVerseOrder(currentRaw);

    // Wiederholungen je Marker aus der aktuellen Reihenfolge übernehmen.
    const repeatByMarker = new Map<string, number>();
    current.forEach((marker) => {
        repeatByMarker.set(marker, (repeatByMarker.get(marker) ?? 0) + 1);
    });

    // Reihenfolge immer exakt wie die Abschnittsreihenfolge; neue Marker standardmäßig 1x.
    const normalized: string[] = [];
    available.forEach((marker) => {
        const repeat = Math.max(1, Math.min(repeatByMarker.get(marker) ?? 1, 3));
        for (let i = 0; i < repeat; i++) {
            normalized.push(marker);
        }
    });

    return serializeVerseOrder(normalized);
}

// ---------------------------------------------------------------------------
// Startwerte
// ---------------------------------------------------------------------------
const DEFAULT_LANG_COUNT = 1;

const defaultValues: SongFormData = {
    metadata: {
        title: "",
        titleLang2: "",
        titleLang3: "",
        langCount: DEFAULT_LANG_COUNT,
        lang1: "Deutsch",
        lang2: "Englisch",
        lang3: "",
        originalTitle: "",
        author: "",
        melody: "",
        translation: "",
        publisher: "",
        rights: "",
        ccli: "",
        key: "",
        transpose: "",
        categories: [],
        tempo: "",
        verseOrder: "",
        books: "",
        bible: "",
        keywords: "",
        id: "",
        comments: "",
        quickFinder: "",
        churchSongId: "",
    },
    sections: [newSection("Vers", "", DEFAULT_LANG_COUNT)],
};

type TourStep = {
    targetSelector: string;
    title: string;
    description: string;
    tab?: string;
};

const TOUR_STEPS: TourStep[] = [
    {
        targetSelector: "#tour-metadata-card",
        title: "Metadaten starten",
        description:
            "Hier pflegst du Titel, Copyright, Musikdaten und weitere Song-Infos über die Tabs.",
    },
    {
        targetSelector: "#tour-title-input",
        tab: "allgemein",
        title: "Titel eintragen",
        description:
            "Beginne mit dem Liedtitel. Das Feld ist Pflicht und wird auch für den Dateinamen genutzt.",
    },
    {
        targetSelector: "#tour-tabs-list",
        title: "Tabs nutzen",
        description: "Wechsle durch die Bereiche, um alle Metadaten strukturiert zu erfassen.",
    },
    {
        targetSelector: "#tour-tab-allgemein",
        tab: "allgemein",
        title: "Tab: Allgemein",
        description: "Im Tab Allgemein pflegst du Titel, Sprachen und grundlegende Liedinfos.",
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

// ---------------------------------------------------------------------------
// Haupt-Komponente
// ---------------------------------------------------------------------------
export function SongForm({ tourStartSignal = 0 }: { tourStartSignal?: number }) {
    const [exportOpen, setExportOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<SongFormData | null>(null);
    const [sngContent, setSngContent] = useState("");
    const [activeTab, setActiveTab] = useState("allgemein");
    const [isTourRunning, setIsTourRunning] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const prevStructureSignatureRef = useRef<string | null>(null);

    function startTour() {
        setActiveTab("allgemein");
        setTourStepIndex(0);
        setIsTourRunning(true);
    }

    function endTour() {
        setIsTourRunning(false);
    }

    function nextTourStep() {
        setTourStepIndex((prev) => {
            if (prev >= TOUR_STEPS.length - 1) {
                setIsTourRunning(false);
                return prev;
            }
            return prev + 1;
        });
    }

    function prevTourStep() {
        setTourStepIndex((prev) => Math.max(0, prev - 1));
    }

    function getTourFocusClass(selector: string): string {
        const isCurrent = isTourRunning && TOUR_STEPS[tourStepIndex]?.targetSelector === selector;
        return isCurrent
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md transition-shadow"
            : "";
    }

    const methods = useForm<SongFormData>({
        resolver: zodResolver(formSchema) as unknown as Resolver<SongFormData>,
        defaultValues,
        mode: "onSubmit",
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = methods;

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "sections",
        keyName: "fieldId",
    });

    const langCount = useWatch({ control, name: "metadata.langCount" }) ?? 1;
    const watchedSections = useWatch({ control, name: "sections" });
    const watchedTitle = useWatch({ control, name: "metadata.title" }) ?? "";
    const watchedCategories = useWatch({ control, name: "metadata.categories" }) ?? [];
    const watchedLang1 = useWatch({ control, name: "metadata.lang1" }) || "Sprache 1";
    const watchedLang2 = useWatch({ control, name: "metadata.lang2" }) || "Sprache 2";
    const watchedLang3 = useWatch({ control, name: "metadata.lang3" }) || "Sprache 3";

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            move(oldIndex, newIndex);
        }
    }

    function handleMoveUp(index: number) {
        if (index > 0) move(index, index - 1);
    }

    function handleMoveDown(index: number) {
        if (index < fields.length - 1) move(index, index + 1);
    }

    function handleAddSection() {
        append(newSection("Vers", "", Number(langCount)));
    }

    useEffect(() => {
        const sections = getValues("sections");
        if (!sections?.length) return;
        const normalized = getNormalizedSectionNumbers(sections);
        normalized.forEach((num, index) => {
            if ((sections[index]?.number ?? "") !== num) {
                setValue(`sections.${index}.number`, num, { shouldDirty: true });
            }
        });
    }, [watchedSections, getValues, setValue]);

    useEffect(() => {
        const sections = getValues("sections");
        const signature = sections.map((s) => `${s.id}|${s.type}|${s.number}`).join("||");

        // Initialzustand nur merken, noch nicht automatisch verändern.
        if (prevStructureSignatureRef.current === null) {
            prevStructureSignatureRef.current = signature;
            return;
        }

        if (prevStructureSignatureRef.current === signature) return;
        prevStructureSignatureRef.current = signature;

        const currentVerseOrder = getValues("metadata.verseOrder") ?? "";
        const nextVerseOrder = mergeVerseOrderWithSections(currentVerseOrder, sections);
        if (nextVerseOrder !== currentVerseOrder) {
            setValue("metadata.verseOrder", nextVerseOrder, { shouldDirty: true });
        }
    }, [watchedSections, getValues, setValue]);

    useEffect(() => {
        if (!tourStartSignal) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        startTour();
    }, [tourStartSignal]);

    useEffect(() => {
        if (!isTourRunning) return;
        const step = TOUR_STEPS[tourStepIndex];
        if (step?.tab) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab(step.tab);
        }
        const target = document.querySelector(step.targetSelector);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [isTourRunning, tourStepIndex]);

    function toggleCategory(cat: string) {
        const current = getValues("metadata.categories");
        const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
        setValue("metadata.categories", next, { shouldDirty: true });
    }

    function onSubmit(data: SongFormData | FormSchema) {
        const content = generateSng(data as SongFormData);
        setSngContent(content);
        setExportOpen(true);
    }

    function handleOpenPreview() {
        setPreviewData(getValues() as SongFormData);
        setPreviewOpen(true);
    }

    // Wenn langCount sich ändert, texts-Arrays anpassen und ggf. Titel leeren
    function handleLangCountChange(val: string | null) {
        if (!val) return;
        const count = Number(val);
        const prevCount = Number(getValues("metadata.langCount"));
        // Titel der entfernten Sprache löschen (nicht Sprache 1)
        if (count < prevCount) {
            if (prevCount >= 3 && count < 3)
                setValue("metadata.titleLang3", "", { shouldDirty: true });
            if (prevCount >= 2 && count < 2)
                setValue("metadata.titleLang2", "", { shouldDirty: true });
        }
        setValue("metadata.langCount", count, { shouldDirty: true });
        const sections = getValues("sections");
        sections.forEach((sec, i) => {
            const current = sec.texts ?? [];
            const updated = Array.from({ length: count }, (_, l) => current[l] ?? "");
            setValue(`sections.${i}.texts`, updated, { shouldDirty: true });
        });
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                {/* ================================================================
            METADATEN
        ================================================================ */}
                <Card id="tour-metadata-card" className={getTourFocusClass("#tour-metadata-card")}>
                    <CardHeader>
                        <CardTitle>Metadaten</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList
                                id="tour-tabs-list"
                                className={`mb-4 h-auto w-full flex-wrap justify-start gap-1 whitespace-normal ${getTourFocusClass("#tour-tabs-list")}`}
                            >
                                <TabsTrigger
                                    id="tour-tab-allgemein"
                                    value="allgemein"
                                    className={getTourFocusClass("#tour-tab-allgemein")}
                                >
                                    Allgemein
                                </TabsTrigger>
                                <TabsTrigger
                                    id="tour-tab-copyright"
                                    value="copyright"
                                    className={getTourFocusClass("#tour-tab-copyright")}
                                >
                                    Copyright
                                </TabsTrigger>
                                <TabsTrigger
                                    id="tour-tab-musik"
                                    value="musik"
                                    className={getTourFocusClass("#tour-tab-musik")}
                                >
                                    Musik
                                </TabsTrigger>
                                <TabsTrigger
                                    id="tour-tab-kategorien"
                                    value="kategorien"
                                    className={getTourFocusClass("#tour-tab-kategorien")}
                                >
                                    Kategorien
                                </TabsTrigger>
                                <TabsTrigger
                                    id="tour-tab-abspielreihenfolge"
                                    value="abspielreihenfolge"
                                    className={getTourFocusClass("#tour-tab-abspielreihenfolge")}
                                >
                                    Abspielreihenfolge
                                </TabsTrigger>
                                <TabsTrigger
                                    id="tour-tab-erweitert"
                                    value="erweitert"
                                    className={getTourFocusClass("#tour-tab-erweitert")}
                                >
                                    Erweitert
                                </TabsTrigger>
                            </TabsList>

                            {/* --- Allgemein --- */}
                            <TabsContent value="allgemein" className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="tour-title-input">
                                            Titel <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="tour-title-input"
                                            {...register("metadata.title")}
                                            placeholder="Liedtitel eingeben …"
                                            className={`mt-1 ${getTourFocusClass("#tour-title-input")}`}
                                            aria-invalid={Boolean(errors.metadata?.title)}
                                            aria-describedby={
                                                errors.metadata?.title ? "title-error" : undefined
                                            }
                                        />
                                        {errors.metadata?.title && (
                                            <p
                                                id="title-error"
                                                role="alert"
                                                className="text-destructive mt-1 text-sm"
                                            >
                                                {errors.metadata.title.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="lang1">Sprachen und Titel</Label>
                                        <div className="mt-1 space-y-2">
                                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground bg-muted w-6 shrink-0 rounded px-1 py-0.5 text-center text-xs font-semibold">
                                                        1
                                                    </span>
                                                    <Input
                                                        id="lang1"
                                                        {...register("metadata.lang1")}
                                                        placeholder="Sprache 1 (z.B. Deutsch)"
                                                        className="h-8 flex-1 text-sm"
                                                    />
                                                </div>
                                                <Input
                                                    aria-label="Titel in Sprache 1"
                                                    value={watchedTitle}
                                                    onChange={(event) =>
                                                        setValue(
                                                            "metadata.title",
                                                            event.target.value,
                                                            {
                                                                shouldDirty: true,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Titel (wie oben) …"
                                                    className="h-8 text-sm"
                                                />
                                            </div>

                                            {Number(langCount) >= 2 && (
                                                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground bg-muted w-6 shrink-0 rounded px-1 py-0.5 text-center text-xs font-semibold">
                                                            2
                                                        </span>
                                                        <Input
                                                            id="lang2"
                                                            {...register("metadata.lang2")}
                                                            placeholder="Sprache 2 (z.B. Englisch)"
                                                            className="h-8 flex-1 text-sm"
                                                        />
                                                    </div>
                                                    <Input
                                                        id="titleLang2"
                                                        {...register("metadata.titleLang2")}
                                                        placeholder={`Titel auf ${watchedLang2} …`}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            )}

                                            {Number(langCount) >= 3 && (
                                                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground bg-muted w-6 shrink-0 rounded px-1 py-0.5 text-center text-xs font-semibold">
                                                            3
                                                        </span>
                                                        <Input
                                                            id="lang3"
                                                            {...register("metadata.lang3")}
                                                            placeholder="Sprache 3"
                                                            className="h-8 flex-1 text-sm"
                                                        />
                                                    </div>
                                                    <Input
                                                        id="titleLang3"
                                                        {...register("metadata.titleLang3")}
                                                        placeholder={`Titel auf ${watchedLang3} …`}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-1">
                                                {Number(langCount) < 3 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleLangCountChange(
                                                                String(Number(langCount) + 1)
                                                            )
                                                        }
                                                    >
                                                        + Sprache hinzufügen
                                                    </Button>
                                                )}
                                                {Number(langCount) > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleLangCountChange(
                                                                String(Number(langCount) - 1)
                                                            )
                                                        }
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        − Sprache entfernen
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="originalTitle">Originaltitel</Label>
                                        <Input
                                            id="originalTitle"
                                            {...register("metadata.originalTitle")}
                                            placeholder="Falls abweichend vom Titel"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- Copyright --- */}
                            <TabsContent value="copyright" className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="author">Autor (Textdichter)</Label>
                                        <Input
                                            id="author"
                                            {...register("metadata.author")}
                                            placeholder="Name des Textdichters"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="melody">Melodie (Komponist)</Label>
                                        <Input
                                            id="melody"
                                            {...register("metadata.melody")}
                                            placeholder="Name des Komponisten"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="translation">Übersetzung</Label>
                                        <Input
                                            id="translation"
                                            {...register("metadata.translation")}
                                            placeholder="Übersetzer (falls vorhanden)"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="publisher">Verlag / Copyright</Label>
                                        <Input
                                            id="publisher"
                                            {...register("metadata.publisher")}
                                            placeholder="Verlagsname, ggf. mit Jahr"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rights">Rechte (Katalog)</Label>
                                        <Input
                                            id="rights"
                                            {...register("metadata.rights")}
                                            placeholder="Originalkatalog / Lizenz"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="ccli">CCLI-Nummer</Label>
                                        <Input
                                            id="ccli"
                                            {...register("metadata.ccli")}
                                            placeholder="z.B. 1234567"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- Musik --- */}
                            <TabsContent value="musik" className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="key">Tonart</Label>
                                        <Select
                                            value={
                                                watchedTitle ? getValues("metadata.key") || "" : ""
                                            }
                                            onValueChange={(v) =>
                                                v != null &&
                                                setValue("metadata.key", v, { shouldDirty: true })
                                            }
                                        >
                                            <SelectTrigger id="key" className="mt-1">
                                                <SelectValue placeholder="Tonart wählen …" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">– keine –</SelectItem>
                                                {MUSICAL_KEYS.map((k) => (
                                                    <SelectItem key={k} value={k}>
                                                        {k}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="transpose">Transponieren (Halbtöne)</Label>
                                        <Input
                                            id="transpose"
                                            {...register("metadata.transpose")}
                                            placeholder="z.B. 2 oder -2"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="tempo">Tempo</Label>
                                        <Select
                                            value={getValues("metadata.tempo") || ""}
                                            onValueChange={(v) =>
                                                v != null &&
                                                setValue("metadata.tempo", v, { shouldDirty: true })
                                            }
                                        >
                                            <SelectTrigger id="tempo" className="mt-1">
                                                <SelectValue placeholder="Tempo wählen …" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">– kein –</SelectItem>
                                                {TEMPO_OPTIONS.map((t) => (
                                                    <SelectItem key={t} value={t}>
                                                        {t}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="bible">Bibelstelle</Label>
                                        <Input
                                            id="bible"
                                            {...register("metadata.bible")}
                                            placeholder="z.B. Ps 150,6"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* --- Kategorien --- */}
                            <TabsContent value="kategorien" className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">
                                        Kategorien (Mehrfachauswahl)
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map((cat) => {
                                            const checked = watchedCategories.includes(cat);
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat)}
                                                    className="focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                    aria-pressed={checked}
                                                    aria-label={`Kategorie ${cat} ${checked ? "ausgewählt" : "nicht ausgewählt"}`}
                                                >
                                                    <Badge
                                                        variant={checked ? "default" : "outline"}
                                                        className="cursor-pointer px-2 py-1 text-sm select-none"
                                                    >
                                                        {cat}
                                                    </Badge>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {watchedCategories.length > 0 && (
                                        <p className="text-muted-foreground mt-2 text-xs">
                                            Gewählt: {watchedCategories.join(", ")}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="keywords">Stichwörter</Label>
                                    <Input
                                        id="keywords"
                                        {...register("metadata.keywords")}
                                        placeholder="Kommagetrennte Stichwörter"
                                        className="mt-1"
                                    />
                                </div>
                            </TabsContent>

                            {/* --- Abspielreihenfolge --- */}
                            <TabsContent value="abspielreihenfolge" className="space-y-4">
                                <VerseOrderEditor control={control} />
                            </TabsContent>

                            {/* --- Erweitert --- */}
                            <TabsContent value="erweitert" className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="books">Liederbuch / Nummer</Label>
                                        <Input
                                            id="books"
                                            {...register("metadata.books")}
                                            placeholder="z.B. Feiert Jesus 123"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="quickFinder">Schnellsuche-Buchstaben</Label>
                                        <Input
                                            id="quickFinder"
                                            {...register("metadata.quickFinder")}
                                            placeholder="z.B. ABCD"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="churchSongId">
                                            Gemeindeinterne Liednummer
                                        </Label>
                                        <Input
                                            id="churchSongId"
                                            {...register("metadata.churchSongId")}
                                            placeholder="Interne Nummer"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="id">Interne ID</Label>
                                        <Input
                                            id="id"
                                            {...register("metadata.id")}
                                            placeholder="Eindeutige Kennung (optional)"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="comments">Bemerkungen</Label>
                                        <Input
                                            id="comments"
                                            {...register("metadata.comments")}
                                            placeholder="Interne Kommentare"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* ================================================================
            LIEDTEXT-ABSCHNITTE
        ================================================================ */}
                <Card id="tour-sections-card" className={getTourFocusClass("#tour-sections-card")}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Liedtext</CardTitle>
                        <Button
                            id="tour-add-section"
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddSection}
                            className={getTourFocusClass("#tour-add-section")}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Abschnitt hinzufügen
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {errors.sections && !Array.isArray(errors.sections) && (
                            <p
                                id="sections-error"
                                role="alert"
                                className="text-destructive text-sm"
                            >
                                {errors.sections.message}
                            </p>
                        )}

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={fields.map((f) => f.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <SectionEditor
                                            key={field.fieldId}
                                            index={index}
                                            control={control}
                                            totalSections={fields.length}
                                            onRemove={remove}
                                            onMoveUp={handleMoveUp}
                                            onMoveDown={handleMoveDown}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {fields.length === 0 && (
                            <div
                                role="status"
                                aria-live="polite"
                                className="text-muted-foreground py-8 text-center text-sm"
                            >
                                Noch keine Abschnitte — klicke auf „Abschnitt hinzufügen“.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ================================================================
            EXPORT
        ================================================================ */}
                <div className="flex justify-end gap-2">
                    <Button
                        id="tour-preview-btn"
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleOpenPreview}
                        className={getTourFocusClass("#tour-preview-btn")}
                    >
                        Folienvorschau
                    </Button>
                    <Button
                        id="tour-export-btn"
                        type="submit"
                        size="lg"
                        className={getTourFocusClass("#tour-export-btn")}
                    >
                        <FileDown className="mr-2 h-5 w-5" />
                        Exportieren
                    </Button>
                </div>
            </form>

            {isTourRunning && (
                <div
                    role="status"
                    aria-live="polite"
                    className="bg-background/95 fixed right-4 bottom-4 z-50 w-[min(92vw,26rem)] rounded-lg border p-4 shadow-xl backdrop-blur"
                >
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Produkttour • Schritt {tourStepIndex + 1} von {TOUR_STEPS.length}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                        {TOUR_STEPS[tourStepIndex].title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {TOUR_STEPS[tourStepIndex].description}
                    </p>
                    <div className="mt-4 flex justify-between gap-2">
                        <Button type="button" variant="ghost" onClick={endTour}>
                            Beenden
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevTourStep}
                                disabled={tourStepIndex === 0}
                            >
                                Zurück
                            </Button>
                            <Button type="button" onClick={nextTourStep}>
                                {tourStepIndex === TOUR_STEPS.length - 1 ? "Fertig" : "Weiter"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <SlidePreviewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                data={previewData}
            />

            <ExportDialog
                open={exportOpen}
                onOpenChange={setExportOpen}
                sngContent={sngContent}
                songTitle={watchedTitle}
                langCount={Number(langCount)}
                languages={[watchedLang1, watchedLang2, watchedLang3]}
            />
        </FormProvider>
    );
}
