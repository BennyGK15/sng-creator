"use client";

import { forwardRef, useRef, useState, useEffect, useCallback, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    value?: string;
};

/**
 * Textarea mit Zeilennummern-Gutter.
 *
 * - Zeigt links die Nummer jeder logischen Zeile.
 * - Bei Textzeilenumbrüchen (Wrap) erscheint in der Folgezeile keine Nummer.
 * - Der Inhalt des value-Props enthält keine Zeilennummern (Export-sicher).
 * - Zeilenerkennung erfolgt über ein unsichtbares Mirror-Div mit gleicher Breite/Font.
 */
const LineNumberedTextarea = forwardRef<HTMLTextAreaElement, Props>(
    ({ className, value = "", rows = 6, onScroll, ...props }, forwardedRef) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const gutterInnerRef = useRef<HTMLDivElement>(null);
        const mirrorRef = useRef<HTMLDivElement>(null);

        // Expose inner textarea to forwardedRef (e.g. react-hook-form callback ref)
        useImperativeHandle(forwardedRef, () => textareaRef.current!);

        // Visual rows: each entry is a line number (number) or null (wrapped continuation)
        const [lineNums, setLineNums] = useState<Array<number | null>>([1]);
        // Computed line height in px — read from DOM after mount
        const [lh, setLh] = useState(20);

        const recompute = useCallback(() => {
            const ta = textareaRef.current;
            const mirror = mirrorRef.current;
            if (!ta || !mirror) return;

            const cs = window.getComputedStyle(ta);
            const computedLH = parseFloat(cs.lineHeight);
            const resolvedLH = isNaN(computedLH) || computedLH < 1 ? 20 : computedLH;
            setLh(resolvedLH);

            // Mirror must have the same inner width as the textarea content area
            const innerW =
                ta.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            mirror.style.width = `${Math.max(0, innerW)}px`;
            mirror.style.fontFamily = cs.fontFamily;
            mirror.style.fontSize = cs.fontSize;
            mirror.style.fontWeight = cs.fontWeight;
            mirror.style.lineHeight = cs.lineHeight;
            mirror.style.letterSpacing = cs.letterSpacing;
            mirror.style.wordSpacing = cs.wordSpacing;

            // Populate mirror with one <div> per logical line
            const text = typeof value === "string" ? value : "";
            const lines = text.split("\n");
            mirror.innerHTML = "";
            for (const line of lines) {
                const div = document.createElement("div");
                div.style.whiteSpace = "pre-wrap";
                div.style.overflowWrap = "break-word";
                // Use non-breaking space for empty lines so they have measurable height
                div.textContent = line.length > 0 ? line : "\u00A0";
                mirror.appendChild(div);
            }

            // Count visual rows per logical line
            const nums: Array<number | null> = [];
            let n = 1;
            for (const child of Array.from(mirror.children) as HTMLElement[]) {
                const visualRows = Math.max(1, Math.round(child.offsetHeight / resolvedLH));
                nums.push(n++);
                for (let r = 1; r < visualRows; r++) nums.push(null);
            }
            setLineNums(nums);
        }, [value]);

        // Run on value changes & initial mount
        useEffect(() => {
            const frame = window.requestAnimationFrame(() => {
                recompute();
            });
            return () => window.cancelAnimationFrame(frame);
        }, [recompute]);

        // Re-run when the textarea is resized (e.g. window resize, column layout change)
        useEffect(() => {
            const ta = textareaRef.current;
            if (!ta) return;
            const ro = new ResizeObserver(recompute);
            ro.observe(ta);
            return () => ro.disconnect();
        }, [recompute]);

        function handleScroll(e: React.UIEvent<HTMLTextAreaElement>) {
            if (gutterInnerRef.current && textareaRef.current) {
                // Translate the gutter content to match textarea scroll
                gutterInnerRef.current.style.transform = `translateY(-${textareaRef.current.scrollTop}px)`;
            }
            onScroll?.(e);
        }

        return (
            <div
                className={cn(
                    "border-input flex overflow-hidden rounded-md border",
                    "focus-within:ring-ring/50 focus-within:border-ring focus-within:ring-2 focus-within:outline-none",
                    "bg-background"
                )}
            >
                {/* Zeilennummer-Gutter */}
                <div
                    aria-hidden
                    className="bg-muted/50 border-input shrink-0 overflow-hidden border-r select-none"
                    style={{ width: 38 }}
                >
                    <div
                        ref={gutterInnerRef}
                        style={{ paddingTop: 8, paddingBottom: 8, willChange: "transform" }}
                    >
                        {lineNums.map((num, i) => (
                            <div
                                key={i}
                                className="text-muted-foreground/60 pr-2 text-right font-mono tabular-nums"
                                style={{
                                    height: lh,
                                    lineHeight: `${lh}px`,
                                    fontSize: 11,
                                }}
                            >
                                {num !== null ? num : ""}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Eigentliche Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onScroll={handleScroll}
                    rows={rows}
                    className={cn(
                        "flex-1 resize-none bg-transparent px-3 py-2 font-mono text-sm",
                        "focus:outline-none",
                        className
                    )}
                    style={{ lineHeight: `${lh}px` }}
                    {...props}
                />

                {/* Unsichtbares Mirror-Div zum Messen von Zeilenwraps */}
                <div
                    ref={mirrorRef}
                    aria-hidden
                    style={{
                        position: "fixed",
                        top: 0,
                        left: -9999,
                        visibility: "hidden",
                        pointerEvents: "none",
                    }}
                />
            </div>
        );
    }
);

LineNumberedTextarea.displayName = "LineNumberedTextarea";
export { LineNumberedTextarea };
