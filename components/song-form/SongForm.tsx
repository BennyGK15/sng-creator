"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { ExportDialog } from "@/components/export-dialog";
import { SlidePreviewDialog } from "@/components/slide-preview-dialog";
import { generateSng } from "@/lib/sng/generateSng";
import { parseSng } from "@/lib/sng/parseSng";
import type { SongFormData } from "@/lib/sng/types";

import { SongActionButtons } from "./SongActionButtons";
import { SongMetadataCard } from "./SongMetadataCard";
import { SongSectionsCard } from "./SongSectionsCard";
import { SongTourOverlay } from "./SongTourOverlay";
import { formSchema, type FormSchema } from "./schema";
import { TOUR_STEPS } from "./tour";
import {
    createDefaultValues,
    getNormalizedSectionNumbers,
    mergeVerseOrderWithSections,
    newSection,
    reorderVerseOrderForSectionMove,
} from "./utils";

export function SongForm({ tourStartSignal = 0 }: { tourStartSignal?: number }) {
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
        resolver: zodResolver(formSchema) as unknown as Resolver<SongFormData>,
        defaultValues: createDefaultValues(),
        mode: "onSubmit",
    });

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
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
    const watchedCategories = useWatch({ control, name: "metadata.categories" }) ?? [];
    const watchedLang1 = useWatch({ control, name: "metadata.lang1" }) || "Sprache 1";
    const watchedLang2 = useWatch({ control, name: "metadata.lang2" }) || "Sprache 2";
    const watchedLang3 = useWatch({ control, name: "metadata.lang3" }) || "Sprache 3";

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function startTour() {
        setActiveTab("allgemein");
        setTourStepIndex(0);
        setIsTourRunning(true);
    }

    function endTour() {
        setIsTourRunning(false);
        setActiveTab("allgemein");
    }

    function nextTourStep() {
        setTourStepIndex((prev) => {
            if (prev >= TOUR_STEPS.length - 1) {
                endTour();
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
            const content = await file.text();
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

    function handleLangCountChange(value: string | null) {
        if (!value) return;

        const count = Number(value);
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

    function toggleCategory(category: string) {
        const current = getValues("metadata.categories");
        const next = current.includes(category)
            ? current.filter((value) => value !== category)
            : [...current, category];
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
        if (!tourStartSignal) return;
        startTour();
    }, [tourStartSignal]);

    useEffect(() => {
        if (!isTourRunning) return;

        const step = TOUR_STEPS[tourStepIndex];
        if (step?.tab) {
            setActiveTab(step.tab);
        }

        const targetElement = document.querySelector(step.targetSelector);
        if (!targetElement) return;

        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [isTourRunning, tourStepIndex]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
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
                                ? "border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
                                : "border-primary/20 bg-primary/5 text-foreground rounded-lg border px-4 py-3 text-sm"
                        }
                    >
                        {importState.message}
                    </div>
                )}

                <SongMetadataCard
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    langCount={Number(langCount)}
                    watchedTitle={watchedTitle}
                    watchedLang2={watchedLang2}
                    watchedLang3={watchedLang3}
                    watchedCategories={watchedCategories}
                    onToggleCategory={toggleCategory}
                    onLangCountChange={handleLangCountChange}
                    getTourFocusClass={getTourFocusClass}
                />

                <SongActionButtons
                    isImporting={isImporting}
                    onOpenImportPicker={handleOpenImportPicker}
                    onRestart={handleRestart}
                    onOpenPreview={handleOpenPreview}
                    getTourFocusClass={getTourFocusClass}
                />

                <SongSectionsCard
                    sectionsErrorMessage={
                        errors.sections && !Array.isArray(errors.sections)
                            ? errors.sections.message
                            : undefined
                    }
                    fields={fields}
                    control={control}
                    remove={remove}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onAddSection={handleAddSection}
                    getTourFocusClass={getTourFocusClass}
                />

                <SongActionButtons
                    withTourTargets
                    isImporting={isImporting}
                    onOpenImportPicker={handleOpenImportPicker}
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
