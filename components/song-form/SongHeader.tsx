import { Compass, FileUp, Music } from "lucide-react";

import { Button } from "@/components/ui/button";

type SongHeaderProps = {
    isImporting: boolean;
    onOpenImportPicker: () => void;
    onStartTour: () => void;
};

export function SongHeader({ isImporting, onOpenImportPicker, onStartTour }: SongHeaderProps) {
    return (
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
                <div
                    aria-hidden="true"
                    className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
                >
                    <Music className="size-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold sm:text-[1.75rem]">SongBeamer Song-Editor</h1>
                    <p className="text-muted-foreground text-sm">
                        Erstelle .sng-Dateien für SongBeamer ohne Formatkenntnisse.
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenImportPicker}
                    disabled={isImporting}
                    title="Eine vorhandene SongBeamer-Datei (.sng) laden und weiterbearbeiten"
                >
                    <FileUp />
                    {isImporting ? "Wird geöffnet …" : "Lied öffnen"}
                </Button>
                <Button type="button" variant="ghost" onClick={onStartTour}>
                    <Compass />
                    Produkttour
                </Button>
            </div>
        </header>
    );
}
