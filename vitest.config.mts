import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
    },
    test: {
        environment: "node",
        coverage: {
            provider: "v8",
            // Gemessen wird die Logik (Import, Export, Spracherkennung, Hilfsfunktionen).
            // React-Komponenten (*.tsx) werden im Browser geprüft, nicht per Unit-Test.
            include: ["lib/**/*.ts", "components/**/*.ts"],
            exclude: ["**/__tests__/**", "**/index.ts"],
            reporter: ["text", "lcov"],
        },
    },
});
