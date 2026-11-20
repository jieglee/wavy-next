import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DevChartsDemo } from "./dev-charts-demo";

// Halaman uji internal untuk Bklit UI. Sengaja tidak ditautkan dari mana pun
// dan tidak diindeks mesin pencari.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DevChartsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DevChartsDemo />;
}
