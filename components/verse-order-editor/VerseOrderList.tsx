import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Lock, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
    getLanguageScale,
    getLineGroupSpacing,
} from "@/components/slide-preview-dialog/slide-utils";
import type { PreviewSlide } from "@/components/slide-preview-dialog/types";
import { Button } from "@/components/ui/button";
import { getSectionStyle, getSectionTypeFromMarker } from "@/lib/sng/section-style";
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

function markerStyle(marker: string) {
    return getSectionStyle(getSectionTypeFromMarker(marker));
}

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

    function showPreview(marker: string) {
        cancelPendingClose();
        if (marker !== hoveredMarker) setPreviewSlideIndex(0);
        setHoveredMarker(marker);
    }

    const hoveredSlides = useMemo(() => {
        if (!hoveredMarker) return null;
        return previewSlidesByMarker[hoveredMarker] ?? [];
    }, [hoveredMarker, previewSlidesByMarker]);

    useEffect(() => {
        return () => {
            cancelPendingClose();
        };
    }, []);

    const slideCount = hoveredSlides?.length ?? 0;
    // Index begrenzen, falls die Vorschau nach einer Textänderung weniger Folien hat
    const slideIndex = Math.min(previewSlideIndex, Math.max(slideCount - 1, 0));
    const hoveredSlide = hoveredSlides?.[slideIndex] ?? null;

    return (
        <>
            <div className="relative" onMouseLeave={scheduleClosePreview}>
                <p className="text-muted-foreground mb-2 text-xs">
                    Zum Hinzufügen anklicken. Beim Darüberfahren siehst du eine Vorschau.
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
                            onMouseEnter={() => showPreview(marker)}
                            onFocus={() => showPreview(marker)}
                            onBlur={() =>
                                setHoveredMarker((current) => (current === marker ? null : current))
                            }
                            style={markerStyle(marker)}
                            className="focus-visible:ring-ring/50 inline-flex h-7 items-center gap-1 rounded-full border border-(--section)/40 bg-(--section)/8 pr-3 pl-2 text-xs font-medium transition-colors select-none hover:bg-(--section)/18 focus-visible:ring-3 focus-visible:outline-none"
                            aria-label={`Abschnitt ${marker} zur Reihenfolge hinzufügen`}
                        >
                            <Plus className="size-3.5 text-(--section)" />
                            {marker}
                        </button>
                    ))}
                </div>

                {hoveredMarker && (
                    <div
                        className="absolute top-full left-0 z-30 mt-2 w-[min(44rem,calc(100vw-2rem))] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 shadow-xl"
                        onMouseEnter={cancelPendingClose}
                        onMouseLeave={scheduleClosePreview}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-zinc-400">
                                Vorschau: <span className="text-zinc-200">{hoveredMarker}</span>
                                {hoveredSlide && hoveredSlide.sectionSlideCount > 1 && (
                                    <span>
                                        {` · Folie ${hoveredSlide.slideInSection} von ${hoveredSlide.sectionSlideCount}`}
                                    </span>
                                )}
                            </p>
                            {slideCount > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPreviewSlideIndex(Math.max(0, slideIndex - 1))
                                        }
                                        disabled={slideIndex === 0}
                                        className="rounded border border-zinc-600 p-1 transition-colors enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Vorherige Folie anzeigen"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>
                                    <p className="text-[11px] text-zinc-400 tabular-nums">
                                        {slideIndex + 1} / {slideCount}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPreviewSlideIndex(
                                                Math.min(slideCount - 1, slideIndex + 1)
                                            )
                                        }
                                        disabled={slideIndex === slideCount - 1}
                                        className="rounded border border-zinc-600 p-1 transition-colors enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Nächste Folie anzeigen"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {hoveredSlide ? (
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
                                        {line || " "}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-xs text-zinc-400">
                                Dieser Abschnitt hat noch keinen Text.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-muted-foreground text-xs">Festgelegte Reihenfolge</p>
                    {availableMarkers.length > 0 && items.length === 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={onAddAll}>
                            Alle der Reihe nach hinzufügen
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

                <ol className="space-y-1">
                    {items.length === 0 && (
                        <li className="text-muted-foreground rounded-md border border-dashed px-3 py-3 text-xs">
                            Noch leer. Klicke oben auf einen Abschnitt, um ihn hinzuzufügen.
                        </li>
                    )}
                    {items.map((item, idx) => (
                        <li
                            key={`${item.marker}-${idx}`}
                            style={markerStyle(item.marker)}
                            className="flex items-center gap-1.5"
                        >
                            <span className="text-muted-foreground w-5 text-right text-xs tabular-nums select-none">
                                {idx + 1}.
                            </span>
                            <span className="flex h-7 flex-1 items-center gap-2 rounded-md bg-(--section)/10 px-2 text-sm font-medium">
                                <span
                                    aria-hidden="true"
                                    className="size-2 shrink-0 rounded-full bg-(--section)"
                                />
                                {item.marker}
                            </span>
                            <span
                                role="group"
                                aria-label={`Wiederholungen für ${item.marker}`}
                                className="inline-flex items-center overflow-hidden rounded-md border"
                            >
                                {[1, 2, 3].map((count) => (
                                    <button
                                        key={count}
                                        type="button"
                                        onClick={() => onSetRepeat(idx, count as 1 | 2 | 3)}
                                        aria-pressed={item.repeat === count}
                                        className={cn(
                                            "h-7 px-2 text-xs tabular-nums transition-colors",
                                            "border-r last:border-r-0",
                                            item.repeat === count
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-background hover:bg-muted"
                                        )}
                                        aria-label={`${count}x wiederholen`}
                                    >
                                        {count}×
                                    </button>
                                ))}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onMoveItem(idx, -1)}
                                disabled={idx === 0}
                                className="tooltip-instant"
                                data-tooltip="Nach oben"
                                aria-label="Nach oben verschieben"
                            >
                                <ChevronUp />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onMoveItem(idx, 1)}
                                disabled={idx === items.length - 1}
                                className="tooltip-instant"
                                data-tooltip="Nach unten"
                                aria-label="Nach unten verschieben"
                            >
                                <ChevronDown />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onRemoveItem(idx)}
                                className="tooltip-instant text-muted-foreground hover:text-destructive"
                                data-tooltip="Entfernen"
                                aria-label="Aus Reihenfolge entfernen"
                            >
                                <X />
                            </Button>
                        </li>
                    ))}

                    <li className="flex items-center gap-1.5 opacity-60">
                        <span className="text-muted-foreground w-5 text-right text-xs tabular-nums select-none">
                            {items.length + 1}.
                        </span>
                        <span className="bg-muted flex h-7 flex-1 items-center gap-2 rounded-md px-2 text-sm font-medium">
                            <Lock className="h-3 w-3" />
                            STOP
                        </span>
                        <span className="text-muted-foreground pr-1 text-xs">immer am Ende</span>
                    </li>
                </ol>
            </div>

            <p className="text-muted-foreground text-xs">
                In der Datei gespeichert als:{" "}
                <code className="bg-muted rounded px-1 py-0.5 break-all">{serializedOrder}</code>
            </p>
        </>
    );
}
