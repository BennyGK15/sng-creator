"use client";

import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";

import { buildSlides } from "@/components/slide-preview-dialog/slide-utils";
import type { PreviewSlide } from "@/components/slide-preview-dialog/types";
import { Label } from "@/components/ui/label";
import type { SongFormData } from "@/lib/sng/types";

import { VerseOrderList } from "./VerseOrderList";
import type { VerseOrderItem } from "./types";
import { buildAvailableMarkers, parseOrder, serializeOrder } from "./utils";

interface VerseOrderEditorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: any;
}

export function VerseOrderEditor({ control }: VerseOrderEditorProps) {
    const sections = useWatch({ control, name: "sections" }) as SongFormData["sections"];
    const langCount = (useWatch({ control, name: "metadata.langCount" }) as number) || 1;

    const availableMarkers = useMemo(() => buildAvailableMarkers(sections), [sections]);
    const previewSlidesByMarker = useMemo<Record<string, PreviewSlide[]>>(() => {
        const result: Record<string, PreviewSlide[]> = {};

        availableMarkers.forEach((marker) => {
            const previewData = {
                metadata: {
                    langCount,
                    verseOrder: `${marker},STOP`,
                },
                sections,
            } as SongFormData;

            result[marker] = buildSlides(previewData);
        });

        return result;
    }, [availableMarkers, langCount, sections]);

    return (
        <Controller
            control={control}
            name="metadata.verseOrder"
            render={({ field }) => {
                const items = parseOrder(field.value ?? "");

                function updateItems(next: VerseOrderItem[]) {
                    field.onChange(serializeOrder(next));
                }

                function addMarker(marker: string) {
                    updateItems([...items, { marker, repeat: 1 }]);
                }

                function removeItem(index: number) {
                    updateItems(items.filter((_, itemIndex) => itemIndex !== index));
                }

                function setRepeat(index: number, repeat: 1 | 2 | 3) {
                    const next = [...items];
                    if (!next[index]) return;
                    next[index] = { ...next[index], repeat };
                    updateItems(next);
                }

                function moveItem(index: number, dir: -1 | 1) {
                    const next = [...items];
                    const target = index + dir;
                    if (target < 0 || target >= next.length) return;
                    [next[index], next[target]] = [next[target], next[index]];
                    updateItems(next);
                }

                function reset() {
                    updateItems([]);
                }

                function addAll() {
                    updateItems(
                        availableMarkers.map((marker) => ({
                            marker,
                            repeat: 1,
                        }))
                    );
                }

                return (
                    <div className="space-y-3">
                        <Label>Abspielreihenfolge</Label>
                        <VerseOrderList
                            items={items}
                            availableMarkers={availableMarkers}
                            previewSlidesByMarker={previewSlidesByMarker}
                            langCount={langCount}
                            onAddMarker={addMarker}
                            onSetRepeat={setRepeat}
                            onMoveItem={moveItem}
                            onRemoveItem={removeItem}
                            onReset={reset}
                            onAddAll={addAll}
                            serializedOrder={serializeOrder(items)}
                        />
                    </div>
                );
            }}
        />
    );
}
