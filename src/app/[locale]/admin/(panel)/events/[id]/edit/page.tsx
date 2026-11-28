"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminGet } from "@/lib/admin-session";
import type { StudioEventDetail } from "@/lib/backoffice";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AsyncContent } from "@/components/states/async-states";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { EventForm } from "@/components/admin/event-form";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("Studio.form");
  const authed = useAdminSession().ready;
  const event = useApiResource(authed ? `studio-event-${id}` : null, () => adminGet<StudioEventDetail>(`/admin/events/${id}`));

  return (
    <>
      <AdminPageHeader
        title={t("editTitle")}
        description={event.data?.title}
        back={
          <Link href={`/admin/events/${id}`} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToDetail")}
          </Link>
        }
      />
      <AsyncContent resource={event} isEmpty={() => false}>
        {(ev) => <EventForm key={ev.id} event={ev} />}
      </AsyncContent>
    </>
  );
}
