import { ChevronLeft, ChevronRight, Lock, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
    getLanguageScale,
    getLineGroupSpacing,
} from "@/components/slide-preview-dialog/slide-utils";
import type { PreviewSlide } from "@/components/slide-preview-dialog/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { VerseOrderItem } from "./types";

type VerseOrderListProps = {
    items: VerseOrderItem[];
    availableMarkers: string[];
    previewSlidesByMarker: Record<string, PreviewSlide[]>;
    langCount: number;
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
    previewSlidesByMarker,
    langCount,
    onAddMarker,
    onSetRepeat,
    onMoveItem,
    onRemoveItem,
    onReset,
    onAddAll,
    serializedOrder,
}: VerseOrderListProps) {
    const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
    const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
    const closeTimeoutRef = useRef<number | null>(null);

    function cancelPendingClose() {
        if (closeTimeoutRef.current !== null) {
            window.clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }

    function scheduleClosePreview() {
        cancelPendingClose();
        closeTimeoutRef.current = window.setTimeout(() => {
            setHoveredMarker(null);
        }, 140);
    }

    const hoveredSlides = useMemo(() => {
        if (!hoveredMarker) return null;
        return previewSlidesByMarker[hoveredMarker] ?? [];
    }, [hoveredMarker, previewSlidesByMarker]);

    useEffect(() => {
        setPreviewSlideIndex(0);
    }, [hoveredMarker]);

    useEffect(() => {
        if (!hoveredSlides?.length) return;
        setPreviewSlideIndex((current) => Math.min(Math.max(current, 0), hoveredSlides.length - 1));
    }, [hoveredSlides]);

    useEffect(() => {
        return () => {
            cancelPendingClose();
        };
    }, []);

    const hoveredSlide = hoveredSlides?.[previewSlideIndex] ?? null;

    return (
        <>
            <div className="relative" onMouseLeave={scheduleClosePreview}>
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
                            onMouseEnter={() => {
                                cancelPendingClose();
                                setHoveredMarker(marker);
                            }}
                            onFocus={() => setHoveredMarker(marker)}
                            onBlur={() =>
                                setHoveredMarker((current) => (current === marker ? null : current))
                            }
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

                {hoveredMarker && (
                    <div
                        className="absolute top-full left-0 z-30 mt-2 w-[min(44rem,92vw)] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 shadow-xl"
                        onMouseEnter={cancelPendingClose}
                        onMouseLeave={scheduleClosePreview}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] tracking-[0.16em] text-zinc-400 uppercase">
                                Vorschau: {hoveredMarker}
                            </p>
                            {hoveredSlides && hoveredSlides.length > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPreviewSlideIndex((prev) => Math.max(0, prev - 1))
                                        }
                                        disabled={previewSlideIndex === 0}
                                        className={cn(
                                            "rounded border border-zinc-600 p-1 transition-colors",
                                            previewSlideIndex === 0
                                                ? "cursor-not-allowed opacity-40"
                                                : "hover:bg-zinc-800"
                                        )}
                                        aria-label="Vorherige Folie anzeigen"
                                        title="Vorherige Folie"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>
                                    <p className="text-[11px] text-zinc-400 tabular-nums">
                                        {previewSlideIndex + 1} / {hoveredSlides.length}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPreviewSlideIndex((prev) =>
                                                Math.min((hoveredSlides?.length ?? 1) - 1, prev + 1)
                                            )
                                        }
                                        disabled={previewSlideIndex === hoveredSlides.length - 1}
                                        className={cn(
                                            "rounded border border-zinc-600 p-1 transition-colors",
                                            previewSlideIndex === hoveredSlides.length - 1
                                                ? "cursor-not-allowed opacity-40"
                                                : "hover:bg-zinc-800"
                                        )}
                                        aria-label="Nächste Folie anzeigen"
                                        title="Nächste Folie"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {hoveredSlide ? (
                            <>
                                {hoveredSlide.sectionSlideCount > 1 && (
                                    <p className="mt-0.5 text-[11px] text-zinc-400">
                                        Folie {hoveredSlide.slideInSection} /{" "}
                                        {hoveredSlide.sectionSlideCount}
                                    </p>
                                )}
                                <div className="mt-2 space-y-0.5 text-center font-semibold tracking-tight">
                                    {hoveredSlide.lines.map((line, idx) => (
                                        <p
                                            key={`${hoveredMarker}-${idx}-${line}`}
                                            style={{
                                                fontSize: `${16 * getLanguageScale(langCount > 1 ? idx % langCount : 0)}px`,
                                                lineHeight: 1.22,
                                                marginTop: `${getLineGroupSpacing(idx, langCount)}px`,
                                            }}
                                            className="break-normal whitespace-nowrap"
                                        >
                                            {line || "\u00a0"}
                                        </p>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="mt-2 text-xs text-zinc-400">
                                Keine darstellbaren Folien.
                            </p>
                        )}
                    </div>
                )}
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
                Gespeichert als:{" "}
                <span className="bg-muted rounded px-1 py-0.5 font-mono">{serializedOrder}</span>
            </p>
        </>
    );
}
