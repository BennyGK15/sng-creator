import { Lock, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { VerseOrderItem } from "./types";

type VerseOrderListProps = {
    items: VerseOrderItem[];
    availableMarkers: string[];
    onAddMarker: (marker: string) => void;
    onSetRepeat: (index: number, repeat: 1 | 2 | 3) => void;
    onMoveItem: (index: number, dir: -1 | 1) => void;
    onRemoveItem: (index: number) => void;
    onReset: () => void;
    onAddAll: () => void;
    serializedOrder: string;
};

export function VerseOrderList({
    items,
    availableMarkers,
    onAddMarker,
    onSetRepeat,
    onMoveItem,
    onRemoveItem,
    onReset,
    onAddAll,
    serializedOrder,
}: VerseOrderListProps) {
    return (
        <>
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
                            onClick={() => onAddMarker(marker)}
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

            <div>
                <p className="text-muted-foreground mb-1.5 text-xs">Festgelegte Reihenfolge:</p>
                {items.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">
                        Noch leer — Abschnitte oben anklicken, um sie hinzuzufügen.
                    </p>
                ) : (
                    <ol className="space-y-1">
                        {items.map((item, idx) => (
                            <li key={`${item.marker}-${idx}`} className="group flex items-center gap-1.5">
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
                                            onClick={() => onSetRepeat(idx, count as 1 | 2 | 3)}
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
                                    onClick={() => onMoveItem(idx, -1)}
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
                                    onClick={() => onMoveItem(idx, 1)}
                                    disabled={idx === items.length - 1}
                                    className={cn(
                                        "tooltip-instant hover:bg-muted rounded px-1 text-xs transition-colors",
                                        idx === items.length - 1 && "pointer-events-none opacity-30"
                                    )}
                                    data-tooltip="Nach unten"
                                    aria-label="Nach unten verschieben"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemoveItem(idx)}
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

                <div className="mt-1 flex items-center gap-1.5 opacity-60">
                    <span className="text-muted-foreground w-5 text-right text-xs tabular-nums select-none">
                        {items.length + 1}.
                    </span>
                    <span className="bg-muted flex flex-1 items-center gap-1.5 rounded px-2 py-0.5 text-sm font-medium">
                        <Lock className="h-3 w-3" />
                        STOP
                    </span>
                    <span className="text-muted-foreground pr-1 text-xs italic">immer gesetzt</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {availableMarkers.length > 0 && items.length === 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={onAddAll}>
                        Alle hinzufügen
                    </Button>
                )}
                {items.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={onReset}
                    >
                        Reihenfolge leeren
                    </Button>
                )}
            </div>

            <p className="text-muted-foreground text-xs">
                Gespeichert als: <span className="bg-muted rounded px-1 py-0.5 font-mono">{serializedOrder}</span>
            </p>
        </>
    );
}
