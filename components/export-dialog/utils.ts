export function getLanguageAbbreviation(name: string, index: number): string {
    const cleaned = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

    if (cleaned.length >= 2) return cleaned.slice(0, 2);
    if (cleaned.length === 1) return `${cleaned}X`;
    return `L${index + 1}`;
}

export function buildSafeFilename(
    songTitle: string,
    langCount: number,
    languages: string[]
): string {
    const base = (songTitle || "song")
        .replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    const languageSuffix =
        langCount > 1
            ? `_${languages
                  .slice(0, Math.max(1, langCount))
                  .map((lang, index) => getLanguageAbbreviation(lang, index))
                  .join("-")}`
            : "";

    return `${base}${languageSuffix}.sng`;
}

export function buildContentStats(sngContent: string): { lines: number; bytes: number } {
    const lines = sngContent.split(/\r?\n/).length;
    const bytes = new TextEncoder().encode(sngContent).byteLength;
    return { lines, bytes };
}

export function downloadText(filename: string, sngContent: string) {
    const bom = "\uFEFF";
    const blob = new Blob([bom + sngContent], {
        type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export async function copyToClipboard(content: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(content);
        return;
    } catch {
        const area = document.createElement("textarea");
        area.value = content;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
    }
}
