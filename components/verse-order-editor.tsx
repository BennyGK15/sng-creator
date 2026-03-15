"use client";

import { useMemo } from "react";
import { useWatch, Controller } from "react-hook-form";
import { X, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type SongFormData } from "@/lib/sng/types";

const STOP = "STOP";
const MAX_REPEAT = 3;

type VerseOrderItem = {
    marker: string;
    repeat: 1 | 2 | 3;
};

/**
 * Parst den verseOrder-String in ein Array ohne den abschließenden STOP.
 * Leere Einträge und STOP werden herausgefiltert.
 */
function parseOrder(raw: string): VerseOrderItem[] {
    const tokens = raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s !== STOP);

    const result: VerseOrderItem[] = [];
    for (const marker of tokens) {
        const last = result[result.length - 1];
        if (last && last.marker === marker && last.repeat < MAX_REPEAT) {
            last.repeat = (last.repeat + 1) as 1 | 2 | 3;
            continue;
        }
        result.push({ marker, repeat: 1 });
    }
    return result;
}

/**
 * Serialisiert das Array zurück in einen String und hängt immer STOP an.
 */
function serializeOrder(items: VerseOrderItem[]): string {
    const expanded: string[] = [];
    for (const item of items) {
        for (let i = 0; i < item.repeat; i++) {
            expanded.push(item.marker);
        }
    }
    return [...expanded, STOP].join(",");
}

interface VerseOrderEditorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: any;
}

export function VerseOrderEditor({ control }: VerseOrderEditorProps) {
    // Alle Abschnitte beobachten, um verfügbare Marker zu errechnen
    const sections = useWatch({ control, name: "sections" }) as SongFormData["sections"];

    // Eindeutige Marker in der Reihenfolge wie sie im Song vorkommen
    const availableMarkers = useMemo(() => {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const sec of sections ?? []) {
            const marker = `${sec.type}${sec.number ? ` ${sec.number}` : ""}`;
            if (!seen.has(marker)) {
                seen.add(marker);
                result.push(marker);
            }
        }
        return result;
    }, [sections]);

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

                function removeItem(idx: number) {
                    updateItems(items.filter((_, i) => i !== idx));
                }

                function setRepeat(idx: number, repeat: 1 | 2 | 3) {
                    const next = [...items];
                    if (!next[idx]) return;
                    next[idx] = { ...next[idx], repeat };
                    updateItems(next);
                }

                function moveItem(idx: number, dir: -1 | 1) {
                    const next = [...items];
                    const target = idx + dir;
                    if (target < 0 || target >= next.length) return;
                    [next[idx], next[target]] = [next[target], next[idx]];
                    updateItems(next);
                }

                function reset() {
                    updateItems([]);
                }

                return (
                    <div className="space-y-3">
                        <Label>Abspielreihenfolge</Label>

                        {/* Verfügbare Marker zum Hinzufügen */}
                        <div>
                            <p className="text-muted-foreground mb-1.5 text-xs">
                                Abschnitt hinzufügen — einfach anklicken:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {availableMarkers.length === 0 && (
                                    <span className="text-muted-foreground text-xs italic">
                                        Noch keine Abschnitte angelegt.
                                    </span>
                                )}
                                {availableMarkers.map((marker) => (
                                    <button
                                        key={marker}
                                        type="button"
                                        onClick={() => addMarker(marker)}
                                        className="focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                        title={`„${marker}" zur Reihenfolge hinzufügen`}
                                        aria-label={`Abschnitt ${marker} zur Reihenfolge hinzufügen`}
                                    >
                                        <Badge
                                            variant="outline"
                                            className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors select-none"
                                        >
                                            + {marker}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Aktuelle Reihenfolge */}
                        <div>
                            <p className="text-muted-foreground mb-1.5 text-xs">
                                Festgelegte Reihenfolge:
                            </p>
                            {items.length === 0 ? (
                                <p className="text-muted-foreground text-xs italic">
                                    Noch leer — Abschnitte oben anklicken, um sie hinzuzufügen.
                                </p>
                            ) : (
                                <ol className="space-y-1">
                                    {items.map((item, idx) => (
                                        <li
                                            key={`${item.marker}-${idx}`}
                                            className="group flex items-center gap-1.5"
                                        >
                                            <span className="text-muted-foreground w-5 text-right text-xs tabular-nums select-none">
                                                {idx + 1}.
                                            </span>
                                            <span className="bg-muted flex-1 rounded px-2 py-0.5 text-sm font-medium">
                                                {item.marker}
                                            </span>
                                            <span className="border-border inline-flex items-center overflow-hidden rounded-md border">
                                                {[1, 2, 3].map((count) => (
                                                    <button
                                                        key={count}
                                                        type="button"
                                                        onClick={() =>
                                                            setRepeat(idx, count as 1 | 2 | 3)
                                                        }
                                                        aria-pressed={item.repeat === count}
                                                        className={cn(
                                                            "h-6 px-1.5 text-[11px] tabular-nums transition-colors",
                                                            "border-border border-r last:border-r-0",
                                                            item.repeat === count
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-background hover:bg-muted"
                                                        )}
                                                        title={`${count}x wiederholen`}
                                                        aria-label={`${count}x wiederholen`}
                                                    >
                                                        {count}x
                                                    </button>
                                                ))}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => moveItem(idx, -1)}
                                                disabled={idx === 0}
                                                className={cn(
                                                    "tooltip-instant hover:bg-muted rounded px-1 text-xs tabular-nums transition-colors",
                                                    idx === 0 && "pointer-events-none opacity-30"
                                                )}
                                                data-tooltip="Nach oben"
                                                aria-label="Nach oben verschieben"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveItem(idx, 1)}
                                                disabled={idx === items.length - 1}
                                                className={cn(
                                                    "tooltip-instant hover:bg-muted rounded px-1 text-xs transition-colors",
                                                    idx === items.length - 1 &&
                                                    "pointer-events-none opacity-30"
                                                )}
                                                data-tooltip="Nach unten"
                                                aria-label="Nach unten verschieben"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="tooltip-instant text-muted-foreground hover:text-destructive transition-colors"
                                                data-tooltip="Entfernen"
                                                aria-label="Aus Reihenfolge entfernen"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            )}

                            {/* STOP — immer am Ende, nicht entfernbar */}
                            <div className="mt-1 flex items-center gap-1.5 opacity-60">
                                <span className="text-muted-foreground w-5 text-right text-xs tabular-nums select-none">
                                    {items.length + 1}.
                                </span>
                                <span className="bg-muted flex flex-1 items-center gap-1.5 rounded px-2 py-0.5 text-sm font-medium">
                                    <Lock className="h-3 w-3" />
                                    STOP
                                </span>
                                <span className="text-muted-foreground pr-1 text-xs italic">
                                    immer gesetzt
                                </span>
                            </div>
                        </div>

                        {/* Aktionen */}
                        <div className="flex flex-wrap items-center gap-2">
                            {availableMarkers.length > 0 && items.length === 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        updateItems(
                                            availableMarkers.map((marker) => ({
                                                marker,
                                                repeat: 1,
                                            }))
                                        )
                                    }
                                >
                                    Alle hinzufügen
                                </Button>
                            )}
                            {items.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={reset}
                                >
                                    Reihenfolge leeren
                                </Button>
                            )}
                        </div>

                        <p className="text-muted-foreground text-xs">
                            Gespeichert als:{" "}
                            <code className="bg-muted rounded px-1 py-0.5 font-mono">
                                {serializeOrder(items)}
                            </code>
                        </p>
                    </div>
                );
            }}
        />
    );
}
