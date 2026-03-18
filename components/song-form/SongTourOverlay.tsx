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
}: SongTourOverlayProps) {
    if (!isTourRunning) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="bg-background/95 fixed right-4 bottom-20 z-60 w-[min(92vw,26rem)] rounded-lg border p-4 shadow-xl backdrop-blur sm:bottom-4"
        >
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Produkttour • Schritt {tourStepIndex + 1} von {TOUR_STEPS.length}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{TOUR_STEPS[tourStepIndex].title}</h3>
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
