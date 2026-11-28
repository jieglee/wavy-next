import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["id", "en"],
    defaultLocale: "id",
    // pilihan bahasa diingat 1 tahun (default next-intl: cookie sesi)
    localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});