import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "react-hot-toast";
import { poppins } from "@/lib/fonts";
import AosProvider from "@/components/aos-provider";
import { routing } from "@/i18n/routing";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "id" | "en")) {
    return { title: "Wavy" };
  }

  setRequestLocale(locale);
  const t = await getTranslations("Metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "id" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${poppins.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <AosProvider>{children}</AosProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
