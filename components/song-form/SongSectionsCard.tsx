import {
    DndContext,
    closestCenter,
    type DragEndEvent,
    type SensorDescriptor,
    type SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { UseFieldArrayRemove } from "react-hook-form";

import { SectionEditor } from "@/components/section-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SongFormData } from "@/lib/sng/types";

type SectionField = SongFormData["sections"][number] & {
    fieldId: string;
};

type SongSectionsCardProps = {
    sectionsErrorMessage?: string;
    fields: SectionField[];
    remove: UseFieldArrayRemove;
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onAddSection: () => void;
    langCount: number;
    getTourFocusClass: (selector: string) => string;
};

export function SongSectionsCard({
    sectionsErrorMessage,
    fields,
    remove,
    sensors,
    onDragEnd,
    onMoveUp,
    onMoveDown,
    onAddSection,
    langCount,
    getTourFocusClass,
}: Readonly<SongSectionsCardProps>) {
    return (
        <Card id="tour-sections-card" className={getTourFocusClass("#tour-sections-card")}>
            <CardHeader>
                <CardTitle>Liedtext</CardTitle>
                <CardDescription>
                    Eine Zeile mit <kbd className="bg-muted rounded px-1 text-xs">--</kbd> teilt
                    einen Abschnitt auf mehrere Folien auf.
                    {langCount > 1 &&
                        " Zeilen mit gleicher Nummer gehören zusammen und stehen auf der Folie direkt untereinander."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {sectionsErrorMessage && (
                    <p id="sections-error" role="alert" className="text-destructive text-sm">
                        {sectionsErrorMessage}
                    </p>
                )}

                <DndContext
                    id="song-sections"
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
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
                                    totalSections={fields.length}
                                    onRemove={remove}
                                    onMoveUp={onMoveUp}
                                    onMoveDown={onMoveDown}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {fields.length === 0 && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm"
                    >
                        Noch keine Abschnitte. Lege mit „Abschnitt hinzufügen“ die erste Strophe an.
                    </div>
                )}

                <Button
                    id="tour-add-section"
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onAddSection}
                    className={`text-muted-foreground hover:text-foreground w-full border-dashed ${getTourFocusClass("#tour-add-section")}`}
                >
                    <Plus />
                    Abschnitt hinzufügen
                </Button>
            </CardContent>
        </Card>
    );
}
