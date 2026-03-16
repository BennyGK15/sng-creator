import { FileDown, FileUp, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type SongActionButtonsProps = {
    withTourTargets?: boolean;
    isImporting: boolean;
    onOpenImportPicker: () => void;
    onRestart: () => void;
    onOpenPreview: () => void;
    getTourFocusClass: (selector: string) => string;
};

export function SongActionButtons({
    withTourTargets = false,
    isImporting,
    onOpenImportPicker,
    onRestart,
    onOpenPreview,
    getTourFocusClass,
}: SongActionButtonsProps) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onOpenImportPicker}
                    disabled={isImporting}
                >
                    <FileUp className="mr-2 h-5 w-5" />
                    {isImporting ? "Import läuft …" : "Bestehende .sng importieren"}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    onClick={onRestart}
                    title="Setzt das Formular nach Bestätigung komplett zurück"
                >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Neu starten
                </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    id={withTourTargets ? "tour-preview-btn" : undefined}
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onOpenPreview}
                    className={withTourTargets ? getTourFocusClass("#tour-preview-btn") : undefined}
                >
                    Folienvorschau
                </Button>
                <Button
                    id={withTourTargets ? "tour-export-btn" : undefined}
                    type="submit"
                    size="lg"
                    className={withTourTargets ? getTourFocusClass("#tour-export-btn") : undefined}
                >
                    <FileDown className="mr-2 h-5 w-5" />
                    Exportieren
                </Button>
            </div>
        </div>
    );
}
