"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MonitorPlay } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SongFormData, SongSection } from "@/lib/sng/types";

type PreviewSlide = {
    marker: string;
    lines: string[];
    slideInSection: number;
    sectionSlideCount: number;
};

interface SlidePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: SongFormData | null;
}

interface FittedSlideFrameProps {
    slide: PreviewSlide;
    slides: PreviewSlide[];
    langCount: number;
}

function getLanguageScale(langIndex: number): number {
    if (langIndex === 0) return 1;
    if (langIndex === 1) return 0.72;
    return 0.58;
}

function getLineGroupSpacing(index: number, langCount: number): number {
    if (langCount <= 1) return 0;
    if (index < langCount) return 0;
    return index % langCount === 0 ? 8 : 0;
}

function buildMarker(section: SongSection): string {
    const num = section.number?.trim();
    return num ? `${section.type} ${num}` : section.type;
}

function sectionSequence(data: SongFormData): SongSection[] {
    const byMarker = new Map<string, SongSection>();
    data.sections.forEach((section) => {
        byMarker.set(buildMarker(section), section);
    });

    const fromVerseOrder = (data.metadata.verseOrder || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0 && entry !== "STOP")
        .map((marker) => byMarker.get(marker))
        .filter((section): section is SongSection => Boolean(section));

    if (fromVerseOrder.length > 0) return fromVerseOrder;
    return data.sections;
}

function buildInterleavedLines(section: SongSection, langCount: number): string[] {
    if (langCount <= 1) {
        return (section.texts[0] ?? "").split("\n");
    }

    const langLines: string[][] = [];
    for (let i = 0; i < langCount; i++) {
        langLines.push((section.texts[i] ?? "").split("\n"));
    }

    const maxLines = Math.max(...langLines.map((lines) => lines.length), 0);
    const result: string[] = [];
    for (let row = 0; row < maxLines; row++) {
        for (let l = 0; l < langCount; l++) {
            result.push(langLines[l][row] ?? "");
        }
    }
    return result;
}

function splitSlides(lines: string[]): string[][] {
    const slides: string[][] = [[]];

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed === "---" || trimmed === "--") {
            if (slides[slides.length - 1].length > 0) {
                slides.push([]);
            }
            return;
        }
        slides[slides.length - 1].push(line);
    });

    return slides
        .map((slide) => slide.filter((line) => line.trim().length > 0))
        .filter((slide) => slide.length > 0);
}

function buildSlides(data: SongFormData | null): PreviewSlide[] {
    if (!data) return [];

    const sequence = sectionSequence(data);
    const result: PreviewSlide[] = [];

    sequence.forEach((section) => {
        const marker = buildMarker(section);
        const interleaved = buildInterleavedLines(section, data.metadata.langCount);
        const slides = splitSlides(interleaved);
        const safeSlides = slides.length > 0 ? slides : [[""]];

        safeSlides.forEach((lines, index) => {
            result.push({
                marker,
                lines,
                slideInSection: index + 1,
                sectionSlideCount: safeSlides.length,
            });
        });
    });

    return result;
}

function FittedSlideFrame({ slide, slides, langCount }: FittedSlideFrameProps) {
    const textViewportRef = useRef<HTMLDivElement>(null);
    const measureHostRef = useRef<HTMLDivElement>(null);
    const [baseFontSize, setBaseFontSize] = useState(44);

    useLayoutEffect(() => {
        const viewport = textViewportRef.current;
        const measureHost = measureHostRef.current;
        if (!viewport || !measureHost) return;

        const fitText = () => {
            const maxFontSize = 44;
            const minFontSize = 10;
            let nextFontSize = maxFontSize;

            const slideFits = (candidate: number, candidateSlide: PreviewSlide) => {
                measureHost.innerHTML = "";

                const content = document.createElement("div");
                Object.assign(content.style, {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    fontWeight: "600",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.22",
                });

                candidateSlide.lines.forEach((line, idx) => {
                    const p = document.createElement("p");
                    const langIndex = langCount > 1 ? idx % langCount : 0;
                    p.textContent = line || "\u00A0";
                    p.style.whiteSpace = "nowrap";
                    p.style.fontSize = `${candidate * getLanguageScale(langIndex)}px`;
                    p.style.marginTop = `${getLineGroupSpacing(idx, langCount)}px`;
                    content.appendChild(p);
                });

                measureHost.appendChild(content);
                const fits =
                    content.scrollHeight <= viewport.clientHeight &&
                    content.scrollWidth <= viewport.clientWidth;
                measureHost.innerHTML = "";
                return fits;
            };

            while (nextFontSize > minFontSize) {
                const allFit = slides.every((candidateSlide) =>
                    slideFits(nextFontSize, candidateSlide)
                );
                if (allFit) break;
                nextFontSize -= 1;
            }

            setBaseFontSize(nextFontSize);
        };

        fitText();

        const resizeObserver = new ResizeObserver(() => {
            fitText();
        });

        resizeObserver.observe(viewport);
        return () => resizeObserver.disconnect();
    }, [slides, langCount]);

    return (
        <div className="mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-50 shadow-2xl">
            <div className="flex h-full flex-col px-6 py-5 sm:px-10 sm:py-7">
                <p className="shrink-0 text-xs tracking-[0.18em] text-zinc-400 uppercase">
                    {slide.marker}
                    {slide.sectionSlideCount > 1 && (
                        <span>{` • Folie ${slide.slideInSection}/${slide.sectionSlideCount}`}</span>
                    )}
                </p>

                <div ref={textViewportRef} className="relative mt-4 flex-1 overflow-hidden">
                    <div
                        ref={measureHostRef}
                        className="pointer-events-none absolute inset-0 overflow-hidden opacity-0"
                        aria-hidden="true"
                    />
                    <div className="flex h-full flex-col justify-center text-center font-semibold tracking-tight">
                        {slide.lines.map((line, idx) => (
                            <p
                                key={`${idx}-${line}`}
                                style={{
                                    fontSize: `${baseFontSize * getLanguageScale(langCount > 1 ? idx % langCount : 0)}px`,
                                    lineHeight: 1.22,
                                    marginTop: `${getLineGroupSpacing(idx, langCount)}px`,
                                }}
                                className="break-normal whitespace-nowrap"
                            >
                                {line || "\u00a0"}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SlidePreviewDialog({ open, onOpenChange, data }: SlidePreviewDialogProps) {
    const slides = useMemo(() => buildSlides(data), [data]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!open) return;
        const frame = window.requestAnimationFrame(() => {
            setCurrentIndex(0);
        });
        return () => window.cancelAnimationFrame(frame);
    }, [open, slides.length]);

    const currentSlide = slides[currentIndex];
    const hasSlides = slides.length > 0;

    function prevSlide() {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    }

    function nextSlide() {
        setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] min-w-1/2 flex-col gap-0 overflow-hidden p-0">
                <DialogHeader className="px-5 pt-5 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                            <MonitorPlay className="text-primary h-4.5 w-4.5" />
                        </div>
                        <div>
                            <DialogTitle>Folienvorschau</DialogTitle>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                {hasSlides
                                    ? `Folie ${currentIndex + 1} von ${slides.length}`
                                    : "Noch keine Folien vorhanden"}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Separator />

                <div className="min-h-0 flex-1 overflow-auto bg-zinc-950 p-4 sm:p-8">
                    {hasSlides ? (
                        <FittedSlideFrame
                            slide={currentSlide}
                            slides={slides}
                            langCount={data?.metadata.langCount ?? 1}
                        />
                    ) : (
                        <div className="mx-auto flex aspect-video w-full max-w-5xl items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900 text-zinc-400">
                            Es gibt noch keine darstellbaren Folien.
                        </div>
                    )}
                </div>

                <Separator />

                <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-xs">
                        Grundlage: Abschnittsreihenfolge, Abspielreihenfolge und
                        Sprach-Interleaving.
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={prevSlide}
                            disabled={!hasSlides || currentIndex === 0}
                        >
                            <ChevronLeft className="mr-1.5 h-4 w-4" />
                            Zurück
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={nextSlide}
                            disabled={!hasSlides || currentIndex === slides.length - 1}
                        >
                            Weiter
                            <ChevronRight className="ml-1.5 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
