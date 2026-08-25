"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getAuthUser } from "@/lib/api";

export default function WelcomeBanner() {
  const t = useTranslations("Home");
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const user = getAuthUser<{ name?: string; email?: string }>();
    setName(user?.name || user?.email?.split("@")[0] || null);
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-wavy-text-primary sm:text-3xl">
        {name ? t("greeting", { name }) : t("greetingFallback")}
      </h1>
      <p className="mt-1 text-sm text-wavy-text-secondary">{t("subtitle")}</p>
    </section>
  );
}
