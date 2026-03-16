import { Check, Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type ExportDialogActionsProps = {
    copied: boolean;
    onCopy: () => void;
    onDownloadTxt: () => void;
    onDownloadBoth: () => void;
    onDownloadSng: () => void;
};

export function ExportDialogActions({
    copied,
    onCopy,
    onDownloadTxt,
    onDownloadBoth,
    onDownloadSng,
}: ExportDialogActionsProps) {
    return (
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
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

            <Button variant="outline" onClick={onCopy} className="w-full sm:w-auto">
                {copied ? (
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                ) : (
                    <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Kopiert" : "Kopieren"}
            </Button>

            <Button variant="outline" onClick={onDownloadTxt} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                .txt
            </Button>

            <Button variant="outline" onClick={onDownloadBoth} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                .sng + .txt
            </Button>

            <Button onClick={onDownloadSng} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                .sng
            </Button>
        </div>
    );
}
