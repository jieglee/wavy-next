"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  const t = useTranslations("Studio.form");
  return (
    <>
      <AdminPageHeader
        title={t("newTitle")}
        description={t("newSubtitle")}
        back={
          <Link href="/admin/events" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToEvents")}
          </Link>
        }
      />
      <EventForm />
    </>
  );
}
