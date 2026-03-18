import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { legalConfig } from "@/lib/legal";

export const metadata: Metadata = {
    title: "Impressum – SongBeamer Song-Editor",
    description: "Impressum des SongBeamer Song-Editors gemäß § 5 DDG und § 18 Abs. 2 MStV.",
};

export default function ImpressumPage() {
    return (
        <main id="main-content" className="bg-background flex min-h-screen flex-col pt-8 pb-28">
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
                            <FileText className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Impressum
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Angaben gemäß § 5 DDG und § 18 Abs. 2 MStV
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Angaben zum Anbieter</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            {legalConfig.ownerName}
                            <br />
                            {legalConfig.addressLine1}
                            <br />
                            {legalConfig.addressLine2}
                        </p>
                        <p>
                            E-Mail: {legalConfig.email}
                            <br />
                            Telefon: {legalConfig.phone}
                        </p>
                        {legalConfig.websiteUrl !== "https://example.com" && (
                            <p>
                                Website:{" "}
                                <a
                                    href={legalConfig.websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-foreground underline underline-offset-4 hover:no-underline"
                                >
                                    {legalConfig.websiteLabel}
                                </a>
                            </p>
                        )}
                        {legalConfig.vatId && <p>Umsatzsteuer-ID: {legalConfig.vatId}</p>}
                        {legalConfig.representedBy && (
                            <p>Vertreten durch: {legalConfig.representedBy}</p>
                        )}
                    </CardContent>
                </Card>

                {legalConfig.entityType === "church" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Kirchlicher Träger</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                            <p>
                                Diese Website wird von einer kirchlichen Einrichtung oder
                                Kirchengemeinde bereitgestellt.
                            </p>
                            {legalConfig.churchBody && (
                                <p>Zugehörige Körperschaft / Träger: {legalConfig.churchBody}</p>
                            )}
                            {legalConfig.churchSupervisoryAuthority && (
                                <p>
                                    Zuständige kirchliche Aufsicht:{" "}
                                    {legalConfig.churchSupervisoryAuthority}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Verantwortlich für den Inhalt</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm leading-relaxed">
                        <p>
                            Verantwortlich gemäß § 18 Abs. 2 MStV:
                            <br />
                            {legalConfig.responsibleForContent}
                            <br />
                            {legalConfig.addressLine1}
                            <br />
                            {legalConfig.addressLine2}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hinweis zur Kontaktaufnahme</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm leading-relaxed">
                        <p>
                            Bei Anfragen zu dieser Anwendung oder zu rechtlichen Angaben nutzen Sie
                            bitte die oben genannten Kontaktdaten.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Technische Entwicklung der Anwendung</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm leading-relaxed">
                        <p>
                            Die grundlegende technische Anwendung wurde entwickelt von{" "}
                            {legalConfig.appDeveloper}.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
