import Link from "next/link";

const LEGAL_LINKS = [
    { href: "/ki-hinweis", label: "KI-Hinweis" },
    { href: "/impressum", label: "Impressum" },
    { href: "/datenschutz", label: "Datenschutzerklärung" },
];

export function SiteFooter() {
    return (
        <footer className="text-muted-foreground border-t text-sm">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span>© Benjamin Esenwein · v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
                <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-4 gap-y-2">
                    {/* Neuer Tab, damit ein ungespeichertes Lied im Editor nicht verloren geht */}
                    {LEGAL_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener"
                            className="hover:text-foreground underline-offset-4 hover:underline"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
