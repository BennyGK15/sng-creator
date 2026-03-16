import {
    DndContext,
    closestCenter,
    type DragEndEvent,
    type SensorDescriptor,
    type SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Control, UseFieldArrayRemove } from "react-hook-form";

import { SectionEditor } from "@/components/section-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SongFormData } from "@/lib/sng/types";

type SectionField = SongFormData["sections"][number] & {
    fieldId: string;
};

type SongSectionsCardProps = {
    sectionsErrorMessage?: string;
    fields: SectionField[];
    control: Control<SongFormData>;
    remove: UseFieldArrayRemove;
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onAddSection: () => void;
    getTourFocusClass: (selector: string) => string;
};

export function SongSectionsCard({
    sectionsErrorMessage,
    fields,
    control,
    remove,
    sensors,
    onDragEnd,
    onMoveUp,
    onMoveDown,
    onAddSection,
    getTourFocusClass,
}: SongSectionsCardProps) {
    return (
        <Card id="tour-sections-card" className={getTourFocusClass("#tour-sections-card")}>
            <CardHeader>
                <CardTitle>Liedtext</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {sectionsErrorMessage && (
                    <p id="sections-error" role="alert" className="text-destructive text-sm">
                        {sectionsErrorMessage}
                    </p>
                )}

                <DndContext
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
                                    control={control}
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
                        className="text-muted-foreground py-8 text-center text-sm"
                    >
                        Noch keine Abschnitte — klicke auf „Abschnitt hinzufügen“.
                    </div>
                )}

                <div className="flex justify-center pt-2">
                    <Button
                        id="tour-add-section"
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddSection}
                        className={getTourFocusClass("#tour-add-section")}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Abschnitt hinzufügen
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
