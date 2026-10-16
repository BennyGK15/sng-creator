import { Button } from "@/components/ui/button";

import { TOUR_STEPS } from "./tour";

type SongTourOverlayProps = {
    isTourRunning: boolean;
    tourStepIndex: number;
    onEndTour: () => void;
    onPrevTourStep: () => void;
    onNextTourStep: () => void;
};

export function SongTourOverlay({
    isTourRunning,
    tourStepIndex,
    onEndTour,
    onPrevTourStep,
    onNextTourStep,
}: Readonly<SongTourOverlayProps>) {
    if (!isTourRunning) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="bg-popover fixed right-4 bottom-24 z-60 w-[min(calc(100vw-2rem),26rem)] rounded-xl border p-4 shadow-xl"
        >
            <div className="flex items-center gap-3">
                <div
                    aria-hidden="true"
                    className="bg-muted h-1 flex-1 overflow-hidden rounded-full"
                >
                    <div
                        className="bg-primary h-full rounded-full transition-[width] duration-300"
                        style={{ width: `${((tourStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                    />
                </div>
                <p className="text-muted-foreground text-xs tabular-nums">
                    Schritt {tourStepIndex + 1} von {TOUR_STEPS.length}
                </p>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{TOUR_STEPS[tourStepIndex].title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
                {TOUR_STEPS[tourStepIndex].description}
            </p>
            <div className="mt-4 flex justify-between gap-2">
                <Button type="button" variant="ghost" onClick={onEndTour}>
                    Beenden
                </Button>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onPrevTourStep}
                        disabled={tourStepIndex === 0}
                    >
                        Zurück
                    </Button>
                    <Button type="button" onClick={onNextTourStep}>
                        {tourStepIndex === TOUR_STEPS.length - 1 ? "Fertig" : "Weiter"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
