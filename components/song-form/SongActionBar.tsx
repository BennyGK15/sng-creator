import { FileDown, MonitorPlay, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type SongActionBarProps = {
    onRestart: () => void;
    onOpenPreview: () => void;
    getTourFocusClass: (selector: string) => string;
};

export function SongActionBar({ onRestart, onOpenPreview, getTourFocusClass }: SongActionBarProps) {
    return (
        <div className="bg-background/90 sticky bottom-3 z-40 flex items-center justify-between gap-2 rounded-xl border p-2 shadow-lg shadow-black/5 backdrop-blur sm:bottom-4">
            <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={onRestart}
                className="text-muted-foreground hover:text-destructive"
                title="Setzt das Formular nach Bestätigung komplett zurück"
            >
                <RotateCcw />
                <span className="hidden sm:inline">Neu starten</span>
                <span className="sr-only sm:hidden">Neu starten</span>
            </Button>

            <div className="flex gap-2">
                <Button
                    id="tour-preview-btn"
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onOpenPreview}
                    className={getTourFocusClass("#tour-preview-btn")}
                >
                    <MonitorPlay />
                    Folienvorschau
                </Button>
                <Button
                    id="tour-export-btn"
                    type="submit"
                    size="lg"
                    className={`px-4 ${getTourFocusClass("#tour-export-btn")}`}
                >
                    <FileDown />
                    Exportieren
                </Button>
            </div>
        </div>
    );
}
