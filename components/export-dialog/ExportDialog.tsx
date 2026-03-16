"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { ExportDialogActions } from "./ExportDialogActions";
import { buildContentStats, buildSafeFilename, copyToClipboard, downloadText } from "./utils";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sngContent: string;
    songTitle: string;
    langCount: number;
    languages: string[];
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

    const safeFilename = useMemo(
        () => buildSafeFilename(songTitle, langCount, languages),
        [songTitle, langCount, languages]
    );

    const stats = useMemo(() => buildContentStats(sngContent), [sngContent]);

    async function handleCopy() {
        await copyToClipboard(sngContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }

    function handleDownloadSng() {
        downloadText(safeFilename, sngContent);
    }

    function handleDownloadTxt() {
        downloadText(safeFilename.replace(/\.sng$/, ".txt"), sngContent);
    }

    function handleDownloadBoth() {
        handleDownloadSng();
        setTimeout(() => handleDownloadTxt(), 150);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-none min-w-1/2 flex-col gap-0 overflow-hidden p-0">
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

                <div className="min-h-0 flex-1 overflow-auto">
                    <pre
                        aria-label="Vorschau des generierten SNG-Inhalts"
                        className="text-foreground/90 p-4 font-mono text-xs leading-relaxed whitespace-pre select-all"
                    >
                        {sngContent}
                    </pre>
                </div>

                <Separator />

                <ExportDialogActions
                    copied={copied}
                    onCopy={handleCopy}
                    onDownloadTxt={handleDownloadTxt}
                    onDownloadBoth={handleDownloadBoth}
                    onDownloadSng={handleDownloadSng}
                />
            </DialogContent>
        </Dialog>
    );
}
