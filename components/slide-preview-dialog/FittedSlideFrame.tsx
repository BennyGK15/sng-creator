import { useLayoutEffect, useRef, useState } from "react";

import { getLanguageScale, getLineGroupSpacing } from "./slide-utils";
import type { FittedSlideFrameProps, PreviewSlide } from "./types";

export function FittedSlideFrame({ slide, slides, langCount }: FittedSlideFrameProps) {
    const textViewportRef = useRef<HTMLDivElement>(null);
    const measureHostRef = useRef<HTMLDivElement>(null);
    const [baseFontSize, setBaseFontSize] = useState(44);

    useLayoutEffect(() => {
        const viewport = textViewportRef.current;
        const measureHost = measureHostRef.current;
        if (!viewport || !measureHost) return;

        const fitText = () => {
            const maxFontSize = 44;
            const minFontSize = 10;
            let nextFontSize = maxFontSize;

            const slideFits = (candidate: number, candidateSlide: PreviewSlide) => {
                measureHost.innerHTML = "";

                const content = document.createElement("div");
                Object.assign(content.style, {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    fontWeight: "600",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.22",
                });

                candidateSlide.lines.forEach((line, idx) => {
                    const paragraph = document.createElement("p");
                    const langIndex = langCount > 1 ? idx % langCount : 0;
                    paragraph.textContent = line || "\u00A0";
                    paragraph.style.whiteSpace = "nowrap";
                    paragraph.style.fontSize = `${candidate * getLanguageScale(langIndex)}px`;
                    paragraph.style.marginTop = `${getLineGroupSpacing(idx, langCount)}px`;
                    content.appendChild(paragraph);
                });

                measureHost.appendChild(content);
                const fits =
                    content.scrollHeight <= viewport.clientHeight &&
                    content.scrollWidth <= viewport.clientWidth;
                measureHost.innerHTML = "";
                return fits;
            };

            while (nextFontSize > minFontSize) {
                const allFit = slides.every((candidateSlide) =>
                    slideFits(nextFontSize, candidateSlide)
                );
                if (allFit) break;
                nextFontSize -= 1;
            }

            setBaseFontSize(nextFontSize);
        };

        fitText();

        const resizeObserver = new ResizeObserver(() => {
            fitText();
        });

        resizeObserver.observe(viewport);
        return () => resizeObserver.disconnect();
    }, [slides, langCount]);

    return (
        <div className="mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-50 shadow-2xl">
            <div className="flex h-full flex-col px-6 py-5 sm:px-10 sm:py-7">
                <p className="shrink-0 text-xs tracking-[0.18em] text-zinc-400 uppercase">
                    {slide.marker}
                    {slide.sectionSlideCount > 1 && (
                        <span>{` • Folie ${slide.slideInSection}/${slide.sectionSlideCount}`}</span>
                    )}
                </p>

                <div ref={textViewportRef} className="relative mt-4 flex-1 overflow-hidden">
                    <div
                        ref={measureHostRef}
                        className="pointer-events-none absolute inset-0 overflow-hidden opacity-0"
                        aria-hidden="true"
                    />
                    <div className="flex h-full flex-col justify-center text-center font-semibold tracking-tight">
                        {slide.lines.map((line, idx) => (
                            <p
                                key={`${idx}-${line}`}
                                style={{
                                    fontSize: `${baseFontSize * getLanguageScale(langCount > 1 ? idx % langCount : 0)}px`,
                                    lineHeight: 1.22,
                                    marginTop: `${getLineGroupSpacing(idx, langCount)}px`,
                                }}
                                className="break-normal whitespace-nowrap"
                            >
                                {line || "\u00a0"}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
