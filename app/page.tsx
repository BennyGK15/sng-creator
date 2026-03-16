"use client";

import { useState } from "react";
import { Compass } from "lucide-react";

import { SongForm } from "@/components/song-form";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [tourStartSignal, setTourStartSignal] = useState(0);

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
    </main>
  );
}
