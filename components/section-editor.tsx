"use client";

import { useCallback } from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineNumberedTextarea } from "@/components/line-numbered-textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSectionStyle } from "@/lib/sng/section-style";
import { SECTION_TYPES, SECTION_TYPE_LABELS, type SongFormData } from "@/lib/sng/types";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
    index: number;
    totalSections: number;
    onRemove: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}

export function SectionEditor({
    index,
    totalSections,
    onRemove,
    onMoveUp,
    onMoveDown,
}: SectionEditorProps) {
    const { getValues, setValue, control } = useFormContext<SongFormData>();
    const sectionId = useWatch({ control, name: `sections.${index}.id` });
    const langCount = useWatch({ control, name: "metadata.langCount" }) ?? 1;
    const lang1 = useWatch({ control, name: "metadata.lang1" }) || "Sprache 1";
    const lang2 = useWatch({ control, name: "metadata.lang2" }) || "Sprache 2";
    const lang3 = useWatch({ control, name: "metadata.lang3" }) || "Sprache 3";
    const langLabels = [lang1, lang2, lang3];
    const sectionType = useWatch({ control, name: `sections.${index}.type` });
    const sectionNumber = useWatch({
        control,
        name: `sections.${index}.number`,
    });
    const texts = useWatch({ control, name: `sections.${index}.texts` });
    // Anzahl Folien dieses Abschnitts (Zeilen mit „--“ beginnen eine neue Folie)
    const slideCount = Math.max(
        1,
        ...(texts ?? []).map(
            (text) =>
                (text ?? "").split(/^\s*--\s*$/m).filter((part) => part.trim().length > 0).length
        )
    );
    const typeLabelId = `sections.${index}.type-label`;
    const typeTriggerId = `sections.${index}.type`;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: sectionId,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative" as const,
    };

    const label = sectionType
        ? `${SECTION_TYPE_LABELS[sectionType as keyof typeof SECTION_TYPE_LABELS] ?? sectionType}${sectionNumber ? ` ${sectionNumber}` : ""}`
        : `Abschnitt ${index + 1}`;

    const handleTypeChange = useCallback(
        (val: string | null) => {
            if (!val) return;
            setValue(`sections.${index}.type`, val as SongFormData["sections"][number]["type"], {
                shouldDirty: true,
            });
        },
        [setValue, index]
    );

    function handleRemove() {
        const texts = getValues(`sections.${index}.texts`) ?? [];
        const hasText = texts.some((text) => text.trim().length > 0);
        if (hasText && !window.confirm(`„${label}“ enthält Text. Abschnitt wirklich löschen?`)) {
            return;
        }
        onRemove(index);
    }

    return (
        <div ref={setNodeRef} style={{ ...style, ...getSectionStyle(sectionType) }}>
            <Card
                className={cn(
                    "relative gap-3 py-0 pl-1 transition-shadow",
                    isDragging && "shadow-lg"
                )}
            >
                {/* Farbleiste der Abschnittsfamilie (Strophe, Refrain, Bridge …) */}
                <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-(--section)" />

                <CardHeader className="flex flex-row items-center gap-1 px-3 pt-3 sm:gap-1.5">
                    {/* Drag-Handle */}
                    <button
                        type="button"
                        className="tooltip-instant text-muted-foreground hover:text-foreground hover:bg-muted -ml-1 flex size-8 cursor-grab touch-none items-center justify-center rounded-md active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                        aria-label={`Abschnitt ${label} verschieben`}
                        data-tooltip="Ziehen zum Verschieben"
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>

                    {/* Typ + automatisch vergebene Nummer */}
                    <Label id={typeLabelId} htmlFor={typeTriggerId} className="sr-only">
                        Abschnittstyp
                    </Label>
                    <Select value={sectionType} onValueChange={handleTypeChange}>
                        <SelectTrigger
                            id={typeTriggerId}
                            aria-labelledby={typeLabelId}
                            className="h-8 min-w-28 font-medium sm:min-w-36"
                        >
                            <SelectValue placeholder="Typ wählen…" />
                        </SelectTrigger>
                        <SelectContent>
                            {SECTION_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {SECTION_TYPE_LABELS[t]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {sectionNumber && (
                        <span
                            className="flex h-6 min-w-6 items-center justify-center rounded-md bg-(--section)/15 px-1.5 text-xs font-semibold tabular-nums"
                            title="Wird automatisch anhand der Abschnittsanzahl vergeben"
                        >
                            <span className="sr-only">Nummer </span>
                            {sectionNumber}
                        </span>
                    )}

                    <span className="text-muted-foreground hidden flex-1 pl-1 text-sm sm:inline">
                        {slideCount === 1 ? "1 Folie" : `${slideCount} Folien`}
                    </span>
                    <span className="flex-1 sm:hidden" />

                    {/* Verschiebe-Buttons */}
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="tooltip-instant"
                        disabled={index === 0}
                        onClick={() => onMoveUp(index)}
                        aria-label="Nach oben verschieben"
                        data-tooltip="Nach oben"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="tooltip-instant"
                        disabled={index === totalSections - 1}
                        onClick={() => onMoveDown(index)}
                        aria-label="Nach unten verschieben"
                        data-tooltip="Nach unten"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    {/* Löschen */}
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="tooltip-instant text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleRemove}
                        aria-label="Abschnitt löschen"
                        data-tooltip="Löschen"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="px-3 pb-3">
                    {/* Textfelder — bei Mehrsprachigkeit nebeneinander */}
                    <div
                        className={
                            Number(langCount) === 3
                                ? "grid gap-3 sm:grid-cols-3"
                                : Number(langCount) === 2
                                  ? "grid gap-3 sm:grid-cols-2"
                                  : ""
                        }
                    >
                        {Array.from({ length: Math.max(Number(langCount), 1) }, (_, l) => (
                            <div key={l}>
                                <Label
                                    htmlFor={`sections.${index}.texts.${l}`}
                                    className={
                                        Number(langCount) > 1
                                            ? "text-muted-foreground mb-1 block text-sm"
                                            : "sr-only"
                                    }
                                >
                                    {Number(langCount) > 1
                                        ? (langLabels[l] ?? `Sprache ${l + 1}`)
                                        : `Liedtext ${label}`}
                                </Label>
                                <Controller
                                    control={control}
                                    name={`sections.${index}.texts.${l}`}
                                    render={({ field }) => (
                                        <LineNumberedTextarea
                                            id={`sections.${index}.texts.${l}`}
                                            name={field.name}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                            rows={6}
                                            placeholder={
                                                l === 0
                                                    ? "Zeile 1\nZeile 2\n--\nZeile 1 (neue Folie)"
                                                    : "Zeile 1\nZeile 2"
                                            }
                                        />
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
