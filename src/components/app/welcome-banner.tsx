"use client";

import { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/api";

export default function WelcomeBanner() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const user = getAuthUser<{ name?: string; email?: string }>();
    setName(user?.name || user?.email?.split("@")[0] || null);
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-wavy-text-primary sm:text-3xl">
        Halo{name ? `, ${name}` : ""}! 
      </h1>
      <p className="mt-1 text-sm text-wavy-text-secondary">
        Mau menonton konser apa hari ini?
      </p>
    </section>
  );
}
