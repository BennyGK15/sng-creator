import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SongBeamer Song-Editor",
  description:
    "Erstelle SongBeamer .sng-Dateien einfach im Browser – inkl. Metadaten, mehrsprachigen Texten und Export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="focus:bg-background sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Zum Hauptinhalt springen
        </a>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
