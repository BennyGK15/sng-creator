import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="bg-muted text-muted-foreground fixed right-0 bottom-0 left-0 z-50 w-full border-t text-sm">
            <div className="mx-auto flex w-full max-w-4xl justify-between px-4 py-4">
                <span>© Benjamin Esenwein · v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
                <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-4 gap-y-2">
                    <Link href="/ki-hinweis" className="hover:text-foreground underline-offset-4 hover:underline">
                        KI-Hinweis
                    </Link>
                    <a
                        href="https://dascredo.de/impressum"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground underline-offset-4 hover:underline"
                        aria-label="Impressum (öffnet in neuem Tab)"
                    >
                        Impressum
                    </a>
                    <a
                        href="https://dascredo.de/datenschutz"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground underline-offset-4 hover:underline"
                        aria-label="Datenschutzerklärung (öffnet in neuem Tab)"
                    >
                        Datenschutzerklärung
                    </a>
                </nav>
            </div>
        </footer>
    );
}