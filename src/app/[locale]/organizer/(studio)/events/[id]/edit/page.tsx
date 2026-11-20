"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import type { StudioEventDetail } from "@/lib/organizer";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { AsyncContent } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { EventForm } from "@/components/studio/event-form";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("Studio.form");
  const authed = !!useAuthToken();
  const event = useApiResource(authed ? `studio-event-${id}` : null, () => apiGet<StudioEventDetail>(`/organizer/events/${id}`));

  return (
    <>
      <StudioPageHeader
        title={t("editTitle")}
        description={event.data?.title}
        back={
          <Link href={`/organizer/events/${id}`} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
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
