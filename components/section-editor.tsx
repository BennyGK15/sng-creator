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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SECTION_TYPES, SECTION_TYPE_LABELS, type SongFormData } from "@/lib/sng/types";

interface SectionEditorProps {
    index: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: any;
    totalSections: number;
    onRemove: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}

export function SectionEditor({
    index,
    control,
    totalSections,
    onRemove,
    onMoveUp,
    onMoveDown,
}: SectionEditorProps) {
    const { register, setValue, control: formControl } = useFormContext<SongFormData>();
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
    const typeLabelId = `sections.${index}.type-label`;
    const typeTriggerId = `sections.${index}.type`;
    const numberId = `sections.${index}.number`;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: sectionId,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
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

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="border-2 py-0">
                <CardHeader className="flex flex-row items-center gap-2 p-3">
                    {/* Drag-Handle */}
                    <button
                        type="button"
                        className="tooltip-instant text-muted-foreground hover:text-foreground cursor-grab touch-none"
                        {...attributes}
                        {...listeners}
                        aria-label={`Abschnitt ${label} verschieben`}
                        data-tooltip="Abschnitt verschieben"
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>

                    {/* Titel (Vorschau) */}
                    <span className="flex-1 truncate text-sm font-medium">{label}</span>

                    {/* Verschiebe-Buttons */}
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="tooltip-instant"
                        disabled={index === 0}
                        onClick={() => onMoveUp(index)}
                        aria-label="Nach oben verschieben"
                        data-tooltip="Nach oben verschieben"
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
                        data-tooltip="Nach unten verschieben"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    {/* Löschen */}
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="tooltip-instant text-destructive hover:text-destructive"
                        onClick={() => onRemove(index)}
                        aria-label="Abschnitt löschen"
                        data-tooltip="Abschnitt löschen"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-3 p-3 pt-0">
                    {/* Typ + Nummer */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label
                                id={typeLabelId}
                                htmlFor={typeTriggerId}
                                className="text-muted-foreground mb-1 block text-xs"
                            >
                                Abschnittstyp
                            </Label>
                            <Select value={sectionType} onValueChange={handleTypeChange}>
                                <SelectTrigger
                                    id={typeTriggerId}
                                    aria-labelledby={typeLabelId}
                                    className="h-9 w-32"
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
                        </div>
                        <div className="w-32">
                            <Label
                                htmlFor={numberId}
                                className="text-muted-foreground mb-1 block text-xs"
                            >
                                Nummer
                            </Label>
                            <Input
                                id={numberId}
                                {...register(`sections.${index}.number`)}
                                className="h-9"
                                readOnly
                                placeholder="Automatisch"
                                title="Wird automatisch anhand der Abschnittsanzahl vergeben"
                            />
                        </div>
                    </div>

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
                                    className="text-muted-foreground mb-1 block text-xs"
                                >
                                    {Number(langCount) > 1
                                        ? (langLabels[l] ?? `Sprache ${l + 1}`)
                                        : "Liedtext"}
                                    {l === 0 && Number(langCount) === 1 && (
                                        <span className="ml-1 font-normal">
                                            (-- = neue Folienseite (gleicher Vers/Strophe))
                                        </span>
                                    )}
                                </Label>
                                <Controller
                                    control={formControl}
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
                                                l === 0 && Number(langCount) === 1
                                                    ? "Zeile 1\nZeile 2\n--\nZeile 1 (neue Folie)"
                                                    : "Zeile 1\nZeile 2"
                                            }
                                        />
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                    {Number(langCount) > 1 && (
                        <p className="text-muted-foreground -mt-1 text-xs">
                            Jede Zeile pro Spalte entspricht einer Präsentationszeile — die Sprachen
                            werden im Export zeilenweise verschränkt.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
