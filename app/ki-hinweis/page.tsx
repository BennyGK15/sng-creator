import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
    title: "KI-Hinweis – SongBeamer Song-Editor",
    description:
        "Informationen zur KI-Unterstützung bei der Entwicklung des SongBeamer Song-Editors.",
};

const models = [
    {
        name: "GitHub Copilot",
        model: "Claude Sonnet 4.5 / Claude Sonnet 4.6 / GPT-5.3-Codex",
        provider:
            "Anthropic (via GitHub Copilot in VS Code) / OpenAI (via GitHub Copilot in VS Code)",
        verwendung:
            "Codegenerierung, Komponentenentwicklung, Architekturentscheidungen, Debugging, Dokumentation und Projektkonfiguration",
    },
];

export default function KiHinweisPage() {
    return (
        <main id="main-content" className="bg-background flex min-h-screen flex-col pt-8">
            <div className="mx-auto w-full max-w-4xl space-y-6 px-4">
                <div>
                    <Link
                        href="/"
                        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                        aria-label="Zurück zur Startseite"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Zurück
                    </Link>

                    <div className="mt-2 flex items-center gap-3">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                            <Bot className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">KI-Hinweis</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Dieses Projekt wurde mit Unterstützung von KI-Modellen entwickelt.
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Über den KI-Einsatz</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Der SongBeamer Song-Editor wurde mithilfe von KI-gestützten
                            Entwicklungswerkzeugen erstellt. KI-Modelle wurden für Codegenerierung,
                            Architekturentscheidungen, Komponenten&shy;entwicklung und Dokumentation
                            eingesetzt.
                        </p>
                        <p>
                            Die inhaltliche Verantwortung für das Projekt, die Auswahl der
                            eingesetzten Werkzeuge sowie die abschließende Prüfung und Freigabe
                            aller Bestandteile liegt bei Benjamin Esenwein.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Eingesetzte Modelle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {models.map((entry, index) => (
                            <div key={entry.name}>
                                {index > 0 && <Separator className="mb-4" />}
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <span className="font-semibold">{entry.name}</span>
                                        <span className="text-muted-foreground text-sm">
                                            {entry.model}
                                        </span>
                                    </div>
                                    <dl className="text-sm">
                                        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                                            <dt className="text-muted-foreground w-28 shrink-0">
                                                Anbieter
                                            </dt>
                                            <dd>{entry.provider}</dd>
                                        </div>
                                        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                                            <dt className="text-muted-foreground w-28 shrink-0">
                                                Verwendung
                                            </dt>
                                            <dd>{entry.verwendung}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
