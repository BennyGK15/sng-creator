import { SongForm } from "@/components/song-form";

export default function Home() {
    return (
        <main id="main-content" className="flex flex-1 flex-col pt-8 pb-10 sm:pt-12">
            <div className="mx-auto w-full max-w-4xl px-4">
                <SongForm />
            </div>
        </main>
    );
}
