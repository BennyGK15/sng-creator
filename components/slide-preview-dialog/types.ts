import type { SongFormData } from "@/lib/sng/types";

export type PreviewSlide = {
    marker: string;
    lines: string[];
    slideInSection: number;
    sectionSlideCount: number;
};

export interface SlidePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: SongFormData | null;
}

export interface FittedSlideFrameProps {
    slide: PreviewSlide;
    slides: PreviewSlide[];
    langCount: number;
}
