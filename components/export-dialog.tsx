"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Copy, Download, FileText } from "lucide-react";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sngContent: string;
    songTitle: string;
    langCount: number;
    languages: string[];
}

function getLanguageAbbreviation(name: string, index: number): string {
    const cleaned = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
    if (cleaned.length >= 2) return cleaned.slice(0, 2);
    if (cleaned.length === 1) return `${cleaned}X`;
    return `L${index + 1}`;
}

export function ExportDialog({
    open,
    onOpenChange,
    sngContent,
    songTitle,
    langCount,
    languages,
}: ExportDialogProps) {
    const [copied, setCopied] = useState(false);

    const safeFilename = useMemo(() => {
        const base = (songTitle || "song")
            .replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, "")
            .trim()
            .replace(/\s+/g, "-");
        const languageSuffix =
            langCount > 1
                ? `_${languages
                      .slice(0, Math.max(1, langCount))
                      .map((lang, index) => getLanguageAbbreviation(lang, index))
                      .join("-")}`
                : "";
        return `${base}${languageSuffix}.sng`;
    }, [songTitle, langCount, languages]);

    const stats = useMemo(() => {
        const lines = sngContent.split(/\r?\n/).length;
        const bytes = new TextEncoder().encode(sngContent).byteLength;
        return { lines, bytes };
    }, [sngContent]);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(sngContent);
        } catch {
            const el = document.createElement("textarea");
            el.value = sngContent;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }

    function download(filename: string) {
        const bom = "\uFEFF";
        const blob = new Blob([bom + sngContent], {
            type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleDownloadSng() {
        download(safeFilename);
    }

    function handleDownloadTxt() {
        download(safeFilename.replace(/\.sng$/, ".txt"));
    }

    function handleDownloadBoth() {
        handleDownloadSng();
        // kurze Verzögerung, damit Browser nicht beide Blobs gleichzeitig anlegt
        setTimeout(() => handleDownloadTxt(), 150);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-none min-w-1/2 flex-col gap-0 overflow-hidden p-0">
                {/* Header */}
                <DialogHeader className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                <FileText className="text-primary h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="truncate text-base leading-tight">
                                    {safeFilename}
                                </DialogTitle>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                    {stats.lines} Zeilen · {stats.bytes} Bytes · UTF-8
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Separator />

                {/* Code Vorschau */}
                <div className="min-h-0 flex-1 overflow-auto">
                    <pre
                        aria-label="Vorschau des generierten SNG-Inhalts"
                        className="text-foreground/90 p-4 font-mono text-xs leading-relaxed whitespace-pre select-all"
                    >
                        {sngContent}
                    </pre>
                </div>

                <Separator />

                {/* Footer-Aktionen */}
                <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
                    {/* Kopiert-Banner */}
                    {copied && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="flex items-center gap-1.5 text-sm font-medium text-green-600 sm:mr-auto"
                        >
                            <Check className="h-4 w-4" />
                            In Zwischenablage kopiert!
                        </div>
                    )}

                    <Button variant="outline" onClick={handleCopy} className="w-full sm:w-auto">
                        {copied ? (
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                        ) : (
                            <Copy className="mr-2 h-4 w-4" />
                        )}
                        {copied ? "Kopiert" : "Kopieren"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleDownloadTxt}
                        className="w-full sm:w-auto"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        .txt
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleDownloadBoth}
                        className="w-full sm:w-auto"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        .sng + .txt
                    </Button>

                    <Button onClick={handleDownloadSng} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        .sng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
