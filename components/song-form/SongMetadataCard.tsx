import type { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";

import { VerseOrderEditor } from "@/components/verse-order-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, MUSICAL_KEYS, TEMPO_OPTIONS, type SongFormData } from "@/lib/sng/types";

type SongMetadataCardProps = {
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
    langCount: number;
    watchedTitle: string;
    watchedLang2: string;
    watchedLang3: string;
    watchedCategories: string[];
    onToggleCategory: (category: string) => void;
    onLangCountChange: (value: string | null) => void;
    getTourFocusClass: (selector: string) => string;
};

export function SongMetadataCard({
    activeTab,
    setActiveTab,
    langCount,
    watchedTitle,
    watchedLang2,
    watchedLang3,
    watchedCategories,
    onToggleCategory,
    onLangCountChange,
    getTourFocusClass,
}: SongMetadataCardProps) {
    const {
        register,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext<SongFormData>();

    return (
        <Card id="tour-metadata-card" className={getTourFocusClass("#tour-metadata-card")}>
            <CardHeader>
                <CardTitle>Metadaten</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList
                        id="tour-tabs-list"
                        className={`mb-4 h-auto w-full flex-wrap justify-start gap-1 whitespace-normal ${getTourFocusClass("#tour-tabs-list")}`}
                    >
                        <TabsTrigger
                            id="tour-tab-allgemein"
                            value="allgemein"
                            className={getTourFocusClass("#tour-tab-allgemein")}
                        >
                            Allgemein
                        </TabsTrigger>
                        <TabsTrigger
                            id="tour-tab-copyright"
                            value="copyright"
                            className={getTourFocusClass("#tour-tab-copyright")}
                        >
                            Copyright
                        </TabsTrigger>
                        <TabsTrigger
                            id="tour-tab-musik"
                            value="musik"
                            className={getTourFocusClass("#tour-tab-musik")}
                        >
                            Musik
                        </TabsTrigger>
                        <TabsTrigger
                            id="tour-tab-kategorien"
                            value="kategorien"
                            className={getTourFocusClass("#tour-tab-kategorien")}
                        >
                            Kategorien
                        </TabsTrigger>
                        <TabsTrigger
                            id="tour-tab-abspielreihenfolge"
                            value="abspielreihenfolge"
                            className={getTourFocusClass("#tour-tab-abspielreihenfolge")}
                        >
                            Abspielreihenfolge
                        </TabsTrigger>
                        <TabsTrigger
                            id="tour-tab-erweitert"
                            value="erweitert"
                            className={getTourFocusClass("#tour-tab-erweitert")}
                        >
                            Erweitert
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="allgemein" className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="tour-title-input">
                                    Titel <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="tour-title-input"
                                    {...register("metadata.title")}
                                    placeholder="Liedtitel eingeben …"
                                    className={`mt-1 ${getTourFocusClass("#tour-title-input")}`}
                                    aria-invalid={Boolean(errors.metadata?.title)}
                                    aria-describedby={errors.metadata?.title ? "title-error" : undefined}
                                />
                                {errors.metadata?.title && (
                                    <p id="title-error" role="alert" className="text-destructive mt-1 text-sm">
                                        {errors.metadata.title.message}
                                    </p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="lang1">Sprachen und Titel</Label>
                                <div className="mt-1 space-y-2">
                                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground bg-muted w-6 shrink-0 rounded px-1 py-0.5 text-center text-xs font-semibold">
                                                1
                                            </span>
                                            <Input
                                                id="lang1"
                                                {...register("metadata.lang1")}
                                                placeholder="Sprache 1 (z.B. Deutsch)"
                                                className="h-8 flex-1 text-sm"
                                            />
                                        </div>
                                        <Input
                                            aria-label="Titel in Sprache 1"
                                            value={watchedTitle}
                                            onChange={(event) =>
                                                setValue("metadata.title", event.target.value, {
                                                    shouldDirty: true,
                                                })
                                            }
                                            placeholder="Titel (wie oben) …"
                                            className="h-8 text-sm"
                                        />
                                    </div>

                                    {langCount >= 2 && (
                                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground bg-muted w-6 shrink-0 rounded px-1 py-0.5 text-center text-xs font-semibold">
                                                    2
                                                </span>
                                                <Input
                                                    id="lang2"
                                                    {...register("metadata.lang2")}
                                                    placeholder="Sprache 2 (z.B. Englisch)"
                                                    className="h-8 flex-1 text-sm"
                                                />
                                            </div>
                                            <Input
                                                id="titleLang2"
                                                {...register("metadata.titleLang2")}
                                                placeholder={`Titel auf ${watchedLang2} …`}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    )}

                                    {langCount >= 3 && (
                                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground bg-muted w-6 shrink-0 rounded px-1 py-0.5 text-center text-xs font-semibold">
                                                    3
                                                </span>
                                                <Input
                                                    id="lang3"
                                                    {...register("metadata.lang3")}
                                                    placeholder="Sprache 3"
                                                    className="h-8 flex-1 text-sm"
                                                />
                                            </div>
                                            <Input
                                                id="titleLang3"
                                                {...register("metadata.titleLang3")}
                                                placeholder={`Titel auf ${watchedLang3} …`}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        {langCount < 3 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onLangCountChange(String(langCount + 1))}
                                            >
                                                + Sprache hinzufügen
                                            </Button>
                                        )}
                                        {langCount > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onLangCountChange(String(langCount - 1))}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                − Sprache entfernen
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="originalTitle">Originaltitel</Label>
                                <Input
                                    id="originalTitle"
                                    {...register("metadata.originalTitle")}
                                    placeholder="Falls abweichend vom Titel"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="copyright" className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="author">Autor (Textdichter)</Label>
                                <Input
                                    id="author"
                                    {...register("metadata.author")}
                                    placeholder="Name des Textdichters"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="melody">Melodie (Komponist)</Label>
                                <Input
                                    id="melody"
                                    {...register("metadata.melody")}
                                    placeholder="Name des Komponisten"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="translation">Übersetzung</Label>
                                <Input
                                    id="translation"
                                    {...register("metadata.translation")}
                                    placeholder="Übersetzer (falls vorhanden)"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="publisher">Verlag / Copyright</Label>
                                <Input
                                    id="publisher"
                                    {...register("metadata.publisher")}
                                    placeholder="Verlagsname, ggf. mit Jahr"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="rights">Rechte (Katalog)</Label>
                                <Input
                                    id="rights"
                                    {...register("metadata.rights")}
                                    placeholder="Originalkatalog / Lizenz"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="ccli">CCLI-Nummer</Label>
                                <Input
                                    id="ccli"
                                    {...register("metadata.ccli")}
                                    placeholder="z.B. 1234567"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="musik" className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="key">Tonart</Label>
                                <Select
                                    value={watchedTitle ? getValues("metadata.key") || "" : ""}
                                    onValueChange={(v) =>
                                        v != null && setValue("metadata.key", v, { shouldDirty: true })
                                    }
                                >
                                    <SelectTrigger id="key" className="mt-1">
                                        <SelectValue placeholder="Tonart wählen …" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">– keine –</SelectItem>
                                        {MUSICAL_KEYS.map((key) => (
                                            <SelectItem key={key} value={key}>
                                                {key}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="transpose">Transponieren (Halbtöne)</Label>
                                <Input
                                    id="transpose"
                                    {...register("metadata.transpose")}
                                    placeholder="z.B. 2 oder -2"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="tempo">Tempo</Label>
                                <Select
                                    value={getValues("metadata.tempo") || ""}
                                    onValueChange={(v) =>
                                        v != null && setValue("metadata.tempo", v, { shouldDirty: true })
                                    }
                                >
                                    <SelectTrigger id="tempo" className="mt-1">
                                        <SelectValue placeholder="Tempo wählen …" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">– kein –</SelectItem>
                                        {TEMPO_OPTIONS.map((tempo) => (
                                            <SelectItem key={tempo} value={tempo}>
                                                {tempo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="bible">Bibelstelle</Label>
                                <Input
                                    id="bible"
                                    {...register("metadata.bible")}
                                    placeholder="z.B. Ps 150,6"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="kategorien" className="space-y-4">
                        <div>
                            <Label className="mb-2 block">Kategorien (Mehrfachauswahl)</Label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((category) => {
                                    const checked = watchedCategories.includes(category);
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => onToggleCategory(category)}
                                            className="focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                            aria-pressed={checked}
                                            aria-label={`Kategorie ${category} ${checked ? "ausgewählt" : "nicht ausgewählt"}`}
                                        >
                                            <Badge
                                                variant={checked ? "default" : "outline"}
                                                className="cursor-pointer px-2 py-1 text-sm select-none"
                                            >
                                                {category}
                                            </Badge>
                                        </button>
                                    );
                                })}
                            </div>
                            {watchedCategories.length > 0 && (
                                <p className="text-muted-foreground mt-2 text-xs">
                                    Gewählt: {watchedCategories.join(", ")}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="keywords">Stichwörter</Label>
                            <Input
                                id="keywords"
                                {...register("metadata.keywords")}
                                placeholder="Kommagetrennte Stichwörter"
                                className="mt-1"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="abspielreihenfolge" className="space-y-4">
                        <VerseOrderEditor control={control} />
                    </TabsContent>

                    <TabsContent value="erweitert" className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="books">Liederbuch / Nummer</Label>
                                <Input
                                    id="books"
                                    {...register("metadata.books")}
                                    placeholder="z.B. Feiert Jesus 123"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="quickFinder">Schnellsuche-Buchstaben</Label>
                                <Input
                                    id="quickFinder"
                                    {...register("metadata.quickFinder")}
                                    placeholder="z.B. ABCD"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="churchSongId">Gemeindeinterne Liednummer</Label>
                                <Input
                                    id="churchSongId"
                                    {...register("metadata.churchSongId")}
                                    placeholder="Interne Nummer"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="id">Interne ID</Label>
                                <Input
                                    id="id"
                                    {...register("metadata.id")}
                                    placeholder="Eindeutige Kennung (optional)"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="comments">Bemerkungen</Label>
                                <Input
                                    id="comments"
                                    {...register("metadata.comments")}
                                    placeholder="Interne Kommentare"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
