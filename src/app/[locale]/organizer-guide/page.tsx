import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/info/info-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfoPages.organizerGuide" });
  return { title: `${t("title")} · Wavy`, description: t("intro") };
}

export default function OrganizerGuidePage() {
  return <InfoPage page="organizerGuide" cta={{ href: "/organizer/register" }} />;
}
