type LegalConfig = {
    entityType: "general" | "church";
    ownerName: string;
    appDeveloper: string;
    addressLine1: string;
    addressLine2: string;
    email: string;
    phone: string;
    websiteUrl: string;
    websiteLabel: string;
    vatId: string;
    responsibleForContent: string;
    representedBy: string;
    churchBody: string;
    churchSupervisoryAuthority: string;
    hostingProvider: string;
    hostingRetentionDays: string;
    effectiveDateLabel: string;
};

function readEnv(name: string, fallback: string): string {
    const value = process.env[name]?.trim();
    return value && value.length > 0 ? value : fallback;
}

function readEntityType(): "general" | "church" {
    return readEnv("LEGAL_ENTITY_TYPE", "general") === "church" ? "church" : "general";
}

export const legalConfig: LegalConfig = {
    entityType: readEntityType(),
    ownerName: readEnv("LEGAL_OWNER_NAME", "Benjamin Esenwein"),
    appDeveloper: "Benjamin Esenwein",
    addressLine1: readEnv(
        "LEGAL_ADDRESS_LINE_1",
        "Bitte per Umgebungsvariable LEGAL_ADDRESS_LINE_1 setzen"
    ),
    addressLine2: readEnv(
        "LEGAL_ADDRESS_LINE_2",
        "Bitte per Umgebungsvariable LEGAL_ADDRESS_LINE_2 setzen"
    ),
    email: readEnv("LEGAL_EMAIL", "Bitte per Umgebungsvariable LEGAL_EMAIL setzen"),
    phone: readEnv("LEGAL_PHONE", "Bitte per Umgebungsvariable LEGAL_PHONE setzen"),
    websiteUrl: readEnv("LEGAL_WEBSITE_URL", "https://example.com"),
    websiteLabel: readEnv("LEGAL_WEBSITE_LABEL", "example.com"),
    vatId: readEnv("LEGAL_VAT_ID", ""),
    responsibleForContent: readEnv("LEGAL_RESPONSIBLE_FOR_CONTENT", "Benjamin Esenwein"),
    representedBy: readEnv("LEGAL_REPRESENTED_BY", ""),
    churchBody: readEnv("LEGAL_CHURCH_BODY", ""),
    churchSupervisoryAuthority: readEnv("LEGAL_CHURCH_SUPERVISORY_AUTHORITY", ""),
    hostingProvider: readEnv("LEGAL_HOSTING_PROVIDER", "Ihr Hosting-Anbieter"),
    hostingRetentionDays: readEnv("LEGAL_HOSTING_LOG_RETENTION_DAYS", "30"),
    effectiveDateLabel: readEnv("LEGAL_EFFECTIVE_DATE", "März 2026"),
};
