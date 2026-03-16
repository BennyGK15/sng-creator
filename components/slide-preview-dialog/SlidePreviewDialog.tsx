"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MonitorPlay } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { FittedSlideFrame } from "./FittedSlideFrame";
import { buildSlides } from "./slide-utils";
import type { SlidePreviewDialogProps } from "./types";

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
                        Grundlage: Abschnittsreihenfolge, Abspielreihenfolge und Sprach-Interleaving.
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
