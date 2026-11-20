"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { EventForm } from "@/components/studio/event-form";

export default function NewEventPage() {
  const t = useTranslations("Studio.form");
  return (
    <>
      <StudioPageHeader
        title={t("newTitle")}
        description={t("newSubtitle")}
        back={
          <Link href="/organizer/events" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToEvents")}
          </Link>
        }
      />
      <EventForm />
    </>
  );
}
