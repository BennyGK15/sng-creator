import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { legalConfig } from "@/lib/legal";

export const metadata: Metadata = {
    title: "Datenschutzerklärung – SongBeamer Song-Editor",
    description:
        "Datenschutzerklärung des SongBeamer Song-Editors gemäß DSGVO und BDSG.",
};

export default function DatenschutzPage() {
    return (
        <main id="main-content" className="bg-background flex min-h-screen flex-col pt-8 pb-28">
            <div className="mx-auto w-full max-w-4xl space-y-6 px-4">
                {/* Header */}
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
                            <ShieldCheck className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Datenschutzerklärung
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Gemäß Art. 13 und 14 DSGVO · Stand: {legalConfig.effectiveDateLabel}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Verantwortlicher */}
                <Card>
                    <CardHeader>
                        <CardTitle>1. Verantwortlicher</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und
                            des Bundesdatenschutzgesetzes (BDSG) ist:
                        </p>
                        <p>
                            {legalConfig.ownerName}
                            <br />
                            {legalConfig.addressLine1}
                            <br />
                            {legalConfig.addressLine2}
                            <br />
                            E-Mail: {legalConfig.email}
                            <br />
                            Telefon: {legalConfig.phone}
                        </p>
                        <p>
                            Ergänzende Anbieterangaben finden Sie im lokalen{" "}
                            <Link
                                href="/impressum"
                                className="text-foreground underline underline-offset-4 hover:no-underline"
                            >
                                Impressum
                            </Link>.
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Funktionsweise */}
                <Card>
                    <CardHeader>
                        <CardTitle>2. Funktionsweise der Anwendung</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Der SongBeamer Song-Editor ist eine vollständig im Browser ausgeführte
                            Webanwendung. Die Verarbeitung aller eingegebenen Lied- und Metadaten
                            findet ausschließlich lokal auf Ihrem Gerät statt. Es werden{" "}
                            <strong className="text-foreground">
                                keine Eingabedaten an einen Server übermittelt
                            </strong>
                            , gespeichert oder an Dritte weitergegeben.
                        </p>
                        <p>
                            Die Anwendung verwendet keine Cookies, keine lokale Browser-Speicherung
                            (localStorage / sessionStorage / IndexedDB) und keine
                            Sitzungsspeicherung für Nutzerdaten.
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Hosting & Server-Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>3. Hosting und Server-Protokolldaten</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Diese Website wird auf Servern eines externen Hosting-Anbieters
                            betrieben. Beim Abrufen der Seiten werden durch den Hosting-Anbieter
                            automatisch Zugriffsdaten in Server-Protokolldateien gespeichert.
                            Dazu können gehören:
                        </p>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>IP-Adresse des anfragenden Geräts</li>
                            <li>Datum und Uhrzeit des Zugriffs</li>
                            <li>Aufgerufene URL / Seite</li>
                            <li>Übertragene Datenmenge</li>
                            <li>Browsertyp und Betriebssystem (HTTP-Header)</li>
                        </ul>
                        <p>
                            Rechtsgrundlage für diese Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO
                            (berechtigtes Interesse an dem sicheren und fehlerfreien Betrieb der
                            Website). Die Protokolldaten werden nicht mit anderen
                            personenbezogenen Daten zusammengeführt und nach spätestens
                            {" "}{legalConfig.hostingRetentionDays} Tagen gelöscht, sofern keine gesetzliche Aufbewahrungspflicht
                            besteht.
                        </p>
                        <p>Aktuell eingesetzter Hosting-Anbieter: {legalConfig.hostingProvider}.</p>
                    </CardContent>
                </Card>

                {/* 4. Schriften */}
                <Card>
                    <CardHeader>
                        <CardTitle>4. Schriftarten</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Diese Anwendung verwendet die Schriftart <em>Inter</em>. Die Schrift
                            wird beim Build-Prozess heruntergeladen und von unserem Hosting-Server
                            ausgeliefert. Es findet beim Laden der Seite{" "}
                            <strong className="text-foreground">
                                keine Verbindung zu Google-Servern
                            </strong>{" "}
                            statt. Es werden keine personenbezogenen Daten an Google oder andere
                            Dritte übermittelt.
                        </p>
                    </CardContent>
                </Card>

                {/* 5. Keine Tracking-Dienste */}
                <Card>
                    <CardHeader>
                        <CardTitle>5. Analyse- und Tracking-Dienste</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Diese Website verwendet{" "}
                            <strong className="text-foreground">
                                keine Analyse-, Tracking- oder Werbedienste
                            </strong>{" "}
                            (z. B. Google Analytics, Matomo, Meta Pixel o. Ä.) und setzt{" "}
                            <strong className="text-foreground">keine Cookies</strong>. Ein
                            Consent-Banner ist daher nicht erforderlich.
                        </p>
                    </CardContent>
                </Card>

                {/* 6. Externe Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>6. Externe Links</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Diese Seite kann Links zu externen Websites enthalten, etwa zur
                            Hauptwebsite des Anbieters auf{" "}
                            <a
                                href={legalConfig.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-foreground underline underline-offset-4 hover:no-underline"
                            >
                                {legalConfig.websiteLabel}
                            </a>
                            . Für die Inhalte und Datenschutzpraktiken dieser externen Seiten
                            ist der jeweilige Anbieter verantwortlich. Beim Anklicken eines
                            externen Links kann Ihre IP-Adresse an den jeweiligen Anbieter
                            übermittelt werden.
                        </p>
                    </CardContent>
                </Card>

                {/* 7. Betroffenenrechte */}
                <Card>
                    <CardHeader>
                        <CardTitle>7. Ihre Rechte als betroffene Person</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Ihnen stehen gemäß DSGVO folgende Rechte zu, soweit personenbezogene
                            Daten verarbeitet werden:
                        </p>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                <strong className="text-foreground">Auskunftsrecht</strong> über
                                die zu Ihrer Person gespeicherten Daten (Art. 15 DSGVO)
                            </li>
                            <li>
                                <strong className="text-foreground">Recht auf Berichtigung</strong>{" "}
                                unrichtiger Daten (Art. 16 DSGVO)
                            </li>
                            <li>
                                <strong className="text-foreground">Recht auf Löschung</strong>{" "}
                                (Art. 17 DSGVO)
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Recht auf Einschränkung der Verarbeitung
                                </strong>{" "}
                                (Art. 18 DSGVO)
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Recht auf Datenübertragbarkeit
                                </strong>{" "}
                                (Art. 20 DSGVO)
                            </li>
                            <li>
                                <strong className="text-foreground">Widerspruchsrecht</strong>{" "}
                                gegen die Verarbeitung (Art. 21 DSGVO)
                            </li>
                        </ul>
                        <p>
                            Zur Ausübung Ihrer Rechte wenden Sie sich bitte über die im{" "}
                            <Link
                                href="/impressum"
                                className="text-foreground underline underline-offset-4 hover:no-underline"
                            >
                                Impressum
                            </Link>{" "}
                            angegebenen Kontaktdaten an den Verantwortlichen.
                        </p>
                    </CardContent>
                </Card>

                {/* 8. Beschwerderecht */}
                <Card>
                    <CardHeader>
                        <CardTitle>8. Beschwerderecht bei einer Aufsichtsbehörde</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über
                            die Verarbeitung Ihrer personenbezogenen Daten zu beschweren
                            (Art. 77 DSGVO). Die zuständige Aufsichtsbehörde richtet sich nach
                            Ihrem gewöhnlichen Aufenthaltsort, Ihrem Arbeitsort oder dem Ort des
                            mutmaßlichen Verstoßes.
                        </p>
                    </CardContent>
                </Card>

                {/* 9. Aktualität */}
                <Card>
                    <CardHeader>
                        <CardTitle>9. Aktualität und Änderung dieser Erklärung</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                        <p>
                            Diese Datenschutzerklärung hat den Stand {legalConfig.effectiveDateLabel}. Durch die
                            Weiterentwicklung der Anwendung oder geänderte gesetzliche Vorgaben
                            kann eine Anpassung erforderlich werden. Die jeweils aktuelle Fassung
                            ist stets unter dieser URL abrufbar.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
