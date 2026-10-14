"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { X } from "lucide-react";

import { ExportDialog } from "@/components/export-dialog";
import { SlidePreviewDialog } from "@/components/slide-preview-dialog";
import { Button } from "@/components/ui/button";
import { generateSng } from "@/lib/sng/generateSng";
import { decodeSngBytes, parseSng } from "@/lib/sng/parseSng";
import type { SongFormData } from "@/lib/sng/types";

import { SongActionBar } from "./SongActionBar";
import { SongHeader } from "./SongHeader";
import { SongMetadataCard } from "./SongMetadataCard";
import { SongSectionsCard } from "./SongSectionsCard";
import { SongTourOverlay } from "./SongTourOverlay";
import { formSchema } from "./schema";
import { TOUR_STEPS } from "./tour";
import {
    createDefaultValues,
    getNormalizedSectionNumbers,
    mergeVerseOrderWithSections,
    newSection,
    reorderVerseOrderForSectionMove,
} from "./utils";

export function SongForm() {
    const [exportOpen, setExportOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<SongFormData | null>(null);
    const [sngContent, setSngContent] = useState("");
    const [activeTab, setActiveTab] = useState("allgemein");
    const [importState, setImportState] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isTourRunning, setIsTourRunning] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);

    const prevStructureSignatureRef = useRef<string | null>(null);
    const importInputRef = useRef<HTMLInputElement | null>(null);

    const methods = useForm<SongFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: createDefaultValues(),
        mode: "onSubmit",
    });

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        setFocus,
        reset,
        formState: { errors, isDirty },
    } = methods;

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "sections",
        keyName: "fieldId",
    });

    const langCount = useWatch({ control, name: "metadata.langCount" }) ?? 1;
    const watchedSections = useWatch({ control, name: "sections" });
    const watchedTitle = useWatch({ control, name: "metadata.title" }) ?? "";
    const watchedLang1 = useWatch({ control, name: "metadata.lang1" }) || "Sprache 1";
    const watchedLang2 = useWatch({ control, name: "metadata.lang2" }) || "Sprache 2";
    const watchedLang3 = useWatch({ control, name: "metadata.lang3" }) || "Sprache 3";

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function goToTourStep(index: number) {
        setTourStepIndex(index);
        const tab = TOUR_STEPS[index]?.tab;
        if (tab) setActiveTab(tab);
    }

    function startTour() {
        setActiveTab("allgemein");
        goToTourStep(0);
        setIsTourRunning(true);
    }

    function endTour() {
        setIsTourRunning(false);
        setActiveTab("allgemein");
    }

    function nextTourStep() {
        if (tourStepIndex >= TOUR_STEPS.length - 1) {
            endTour();
            return;
        }
        goToTourStep(tourStepIndex + 1);
    }

    function prevTourStep() {
        goToTourStep(Math.max(0, tourStepIndex - 1));
    }

    function getTourFocusClass(selector: string): string {
        const isCurrent = isTourRunning && TOUR_STEPS[tourStepIndex]?.targetSelector === selector;
        return isCurrent
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md transition-shadow"
            : "";
    }

    function moveSectionAndVerseOrder(oldIndex: number, newIndex: number) {
        const currentSections = getValues("sections");
        if (
            oldIndex < 0 ||
            newIndex < 0 ||
            oldIndex >= currentSections.length ||
            newIndex >= currentSections.length ||
            oldIndex === newIndex
        ) {
            return;
        }

        const nextSections = arrayMove(currentSections, oldIndex, newIndex);
        const currentVerseOrder = getValues("metadata.verseOrder") ?? "";
        const reorderedVerseOrder = reorderVerseOrderForSectionMove(
            currentVerseOrder,
            currentSections,
            nextSections
        );

        move(oldIndex, newIndex);

        if (reorderedVerseOrder && reorderedVerseOrder !== currentVerseOrder) {
            setValue("metadata.verseOrder", reorderedVerseOrder, { shouldDirty: true });
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            moveSectionAndVerseOrder(oldIndex, newIndex);
        }
    }

    function handleMoveUp(index: number) {
        if (index > 0) moveSectionAndVerseOrder(index, index - 1);
    }

    function handleMoveDown(index: number) {
        if (index < fields.length - 1) moveSectionAndVerseOrder(index, index + 1);
    }

    function handleAddSection() {
        append(newSection("Vers", "", Number(langCount)));
    }

    function handleRestart() {
        if (
            !window.confirm(
                "Alle aktuellen Eingaben werden verworfen und das Formular wird komplett zurückgesetzt. Möchtest du wirklich neu starten?"
            )
        ) {
            return;
        }

        prevStructureSignatureRef.current = null;
        reset(createDefaultValues());
        setActiveTab("allgemein");
        setPreviewOpen(false);
        setPreviewData(null);
        setExportOpen(false);
        setSngContent("");
        setImportState(null);
        endTour();
    }

    function handleOpenImportPicker() {
        importInputRef.current?.click();
    }

    async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (
            isDirty &&
            !window.confirm(
                "Der aktuelle Formularinhalt wird durch den Import ersetzt. Möchtest du fortfahren?"
            )
        ) {
            event.target.value = "";
            return;
        }

        setIsImporting(true);
        setImportState(null);

        try {
            const content = decodeSngBytes(await file.arrayBuffer());
            const importedData = parseSng(content);
            const structureSignature = importedData.sections
                .map((section) => `${section.id}|${section.type}|${section.number}`)
                .join("||");

            prevStructureSignatureRef.current = structureSignature;
            reset(importedData);
            setActiveTab("allgemein");
            setPreviewOpen(false);
            setPreviewData(null);
            setExportOpen(false);
            setSngContent("");
            setImportState({
                type: "success",
                message: `${file.name} wurde importiert und kann jetzt weiterbearbeitet werden.`,
            });
        } catch (error) {
            setImportState({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Die Datei konnte nicht importiert werden.",
            });
        } finally {
            setIsImporting(false);
            event.target.value = "";
        }
    }

    function handleLangCountChange(count: number) {
        const previousCount = Number(getValues("metadata.langCount"));

        if (count < previousCount) {
            if (previousCount >= 3 && count < 3) {
                setValue("metadata.titleLang3", "", { shouldDirty: true });
            }
            if (previousCount >= 2 && count < 2) {
                setValue("metadata.titleLang2", "", { shouldDirty: true });
            }
        }

        setValue("metadata.langCount", count, { shouldDirty: true });
        const sections = getValues("sections");
        sections.forEach((section, index) => {
            const currentTexts = section.texts ?? [];
            const updated = Array.from(
                { length: count },
                (_, textIndex) => currentTexts[textIndex] ?? ""
            );
            setValue(`sections.${index}.texts`, updated, { shouldDirty: true });
        });
    }

    function onSubmit(data: SongFormData) {
        const content = generateSng(data);
        setSngContent(content);
        setExportOpen(true);
    }

    function onInvalid(formErrors: FieldErrors<SongFormData>) {
        // Fehler können in einem gerade nicht sichtbaren Tab liegen – dorthin springen.
        if (formErrors.metadata?.title) {
            setActiveTab("allgemein");
            window.requestAnimationFrame(() => setFocus("metadata.title"));
            return;
        }
        if (formErrors.sections) {
            document
                .getElementById("tour-sections-card")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function handleOpenPreview() {
        setPreviewData(getValues());
        setPreviewOpen(true);
    }

    useEffect(() => {
        const sections = getValues("sections");
        if (!sections?.length) return;

        const normalizedNumbers = getNormalizedSectionNumbers(sections);
        normalizedNumbers.forEach((number, index) => {
            if ((sections[index]?.number ?? "") !== number) {
                setValue(`sections.${index}.number`, number, { shouldDirty: true });
            }
        });
    }, [watchedSections, getValues, setValue]);

    useEffect(() => {
        const sections = getValues("sections");
        const signature = sections
            .map((section) => `${section.id}|${section.type}|${section.number}`)
            .join("||");

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
        if (!isTourRunning) return;

        const targetElement = document.querySelector(TOUR_STEPS[tourStepIndex].targetSelector);
        targetElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [isTourRunning, tourStepIndex]);

    // Warnt vor dem Neuladen oder Schließen des Tabs, solange ungespeicherte Eingaben existieren.
    useEffect(() => {
        if (!isDirty) return;

        function handleBeforeUnload(event: BeforeUnloadEvent) {
            event.preventDefault();
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6">
                <SongHeader
                    isImporting={isImporting}
                    onOpenImportPicker={handleOpenImportPicker}
                    onStartTour={startTour}
                />

                <input
                    ref={importInputRef}
                    type="file"
                    accept=".sng,text/plain"
                    className="sr-only"
                    onChange={handleImportFileChange}
                />

                {importState && (
                    <div
                        role="status"
                        aria-live="polite"
                        className={
                            importState.type === "error"
                                ? "border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 rounded-lg border py-2.5 pr-2 pl-4 text-sm"
                                : "border-primary/25 bg-secondary text-secondary-foreground flex items-start gap-3 rounded-lg border py-2.5 pr-2 pl-4 text-sm"
                        }
                    >
                        <p className="flex-1 py-0.5">{importState.message}</p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setImportState(null)}
                            aria-label="Hinweis schließen"
                        >
                            <X />
                        </Button>
                    </div>
                )}

                <SongMetadataCard
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLangCountChange={handleLangCountChange}
                    getTourFocusClass={getTourFocusClass}
                />

                <SongSectionsCard
                    sectionsErrorMessage={
                        errors.sections && !Array.isArray(errors.sections)
                            ? errors.sections.message
                            : undefined
                    }
                    fields={fields}
                    remove={remove}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onAddSection={handleAddSection}
                    langCount={Number(langCount)}
                    getTourFocusClass={getTourFocusClass}
                />

                <SongActionBar
                    onRestart={handleRestart}
                    onOpenPreview={handleOpenPreview}
                    getTourFocusClass={getTourFocusClass}
                />
            </form>

            <SongTourOverlay
                isTourRunning={isTourRunning}
                tourStepIndex={tourStepIndex}
                onEndTour={endTour}
                onPrevTourStep={prevTourStep}
                onNextTourStep={nextTourStep}
            />

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
