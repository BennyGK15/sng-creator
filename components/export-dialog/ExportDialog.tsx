"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Copy, Download, FileText, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { buildContentStats, buildSafeFilename, copyToClipboard, downloadText } from "./utils";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sngContent: string;
    songTitle: string;
    langCount: number;
    languages: string[];
}

type Feedback = "downloaded" | "copied" | null;

export function ExportDialog({
    open,
    onOpenChange,
    sngContent,
    songTitle,
    langCount,
    languages,
}: Readonly<ExportDialogProps>) {
    const [feedback, setFeedback] = useState<Feedback>(null);
    const feedbackTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (feedbackTimeoutRef.current !== null)
                window.clearTimeout(feedbackTimeoutRef.current);
        };
    }, []);

    const safeFilename = useMemo(
        () => buildSafeFilename(songTitle, langCount, languages),
        [songTitle, langCount, languages]
    );
    const txtFilename = safeFilename.replace(/\.sng$/, ".txt");

    const stats = useMemo(() => buildContentStats(sngContent), [sngContent]);

    function showFeedback(next: Feedback) {
        setFeedback(next);
        if (feedbackTimeoutRef.current !== null) window.clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), 6000);
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) setFeedback(null);
        onOpenChange(nextOpen);
    }

    async function handleCopy() {
        await copyToClipboard(sngContent);
        showFeedback("copied");
    }

    function handleDownloadSng() {
        downloadText(safeFilename, sngContent);
        showFeedback("downloaded");
    }

    function handleDownloadTxt() {
        downloadText(txtFilename, sngContent);
        showFeedback("downloaded");
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
                <DialogHeader className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-accent flex size-10 shrink-0 items-center justify-center rounded-lg">
                            <PartyPopper className="text-accent-foreground size-5" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-lg leading-tight">
                                Dein Lied ist fertig
                            </DialogTitle>
                            <DialogDescription className="mt-0.5">
                                Lade die Datei herunter und öffne sie mit SongBeamer.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Separator />

                <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-5 sm:px-6">
                    <div className="space-y-2">
                        <Button
                            size="lg"
                            onClick={handleDownloadSng}
                            className="h-11 w-full text-base"
                        >
                            <Download className="size-5" />
                            Datei für SongBeamer herunterladen
                        </Button>
                        <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
                            <FileText className="size-4 shrink-0" />
                            <span className="truncate">{safeFilename}</span>
                        </p>
                        <div
                            role="status"
                            aria-live="polite"
                            className="min-h-5 text-center text-sm"
                        >
                            {feedback === "downloaded" && (
                                <span className="text-success inline-flex items-center gap-1.5 font-medium">
                                    <Check className="size-4" />
                                    Heruntergeladen – du findest die Datei meist im Ordner
                                    „Downloads“.
                                </span>
                            )}
                            {feedback === "copied" && (
                                <span className="text-success inline-flex items-center gap-1.5 font-medium">
                                    <Check className="size-4" />
                                    Text in die Zwischenablage kopiert.
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-muted/60 rounded-lg p-4">
                        <p className="font-medium">So geht es weiter</p>
                        <ol className="text-muted-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm">
                            <li>Datei mit dem Button oben herunterladen.</li>
                            <li>Die Datei per Doppelklick öffnen – sie startet in SongBeamer.</li>
                            <li>
                                Damit das Lied dauerhaft in deiner Liedauswahl erscheint, kopiere
                                die Datei in deinen SongBeamer-Liederordner.
                            </li>
                        </ol>
                    </div>

                    <div>
                        <p className="text-muted-foreground mb-2 text-sm">Weitere Möglichkeiten</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                variant="outline"
                                onClick={handleDownloadTxt}
                                className="sm:flex-1"
                            >
                                <Download />
                                Als Textdatei (.txt)
                            </Button>
                            <Button variant="outline" onClick={handleCopy} className="sm:flex-1">
                                <Copy />
                                Text kopieren
                            </Button>
                        </div>
                    </div>

                    <details className="group rounded-lg border">
                        <summary className="hover:bg-muted/60 flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm select-none [&::-webkit-details-marker]:hidden">
                            <ChevronRight className="text-muted-foreground size-4 transition-transform group-open:rotate-90" />
                            Dateiinhalt anzeigen
                            <span className="text-muted-foreground ml-auto text-xs">
                                für Fortgeschrittene
                            </span>
                        </summary>
                        <div className="border-t">
                            <p className="text-muted-foreground px-3 pt-2 text-xs">
                                {stats.lines} Zeilen · {stats.bytes} Bytes · UTF-8
                            </p>
                            <pre
                                aria-label="Inhalt der .sng-Datei"
                                className="text-foreground/90 max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed whitespace-pre select-all"
                            >
                                {sngContent}
                            </pre>
                        </div>
                    </details>
                </div>
            </DialogContent>
        </Dialog>
    );
}
