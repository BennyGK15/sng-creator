"use client";

import { useState } from "react";
import { Compass } from "lucide-react";

import { SongForm } from "@/components/song-form";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [tourStartSignal, setTourStartSignal] = useState(0);
  const impressumUrl = "https://dascredo.de/impressum";
  const datenschutzUrl = "https://dascredo.de/datenschutz";

  return (
    <main id="main-content" className="bg-background flex min-h-screen flex-col pt-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              SongBeamer Song-Editor
            </h1>
            <p className="text-muted-foreground mt-1">
              Erstelle .sng-Dateien für SongBeamer ohne Formatkenntnisse.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTourStartSignal((prev) => prev + 1)}
            className="shrink-0"
          >
            <Compass className="mr-2 h-4 w-4" />
            Produkttour starten
          </Button>
        </div>
        <SongForm tourStartSignal={tourStartSignal} />
      </div>

      <footer className="bg-muted/40 text-muted-foreground mt-10 w-full border-t text-sm">
        <div className="mx-auto flex w-full max-w-4xl justify-between px-4 py-4">
          <span>© Benjamin Esenwein</span>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-4 gap-y-2">
            <a
              href={impressumUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground underline-offset-4 hover:underline"
              aria-label="Impressum (öffnet in neuem Tab)"
            >
              Impressum
            </a>
            <a
              href={datenschutzUrl}
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
    </main>
  );
}
