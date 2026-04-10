const getEnvVar = (key: string, fallback?: string): string => {
    const value = process.env[key] ?? fallback;

    if (value === undefined) {
        throw new Error(
            `[env] Missing required environment variable: ${key}\n` +
            `      Add it to your .env.local file.`
        );
    }

    return value;
};

export const env = {
    // ─── API ────────────────────────────────────────────────────────────────
    API_BASE_URL: getEnvVar("NEXT_PUBLIC_API_URL", "http://localhost:4000"),

    // ─── App ────────────────────────────────────────────────────────────────
    NODE_ENV: getEnvVar("NODE_ENV", "development"),
    APP_URL: getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

    // ─── Derived helpers ────────────────────────────────────────────────────
    IS_DEV: process.env.NODE_ENV === "development",
    IS_PROD: process.env.NODE_ENV === "production",
} as const;