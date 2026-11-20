"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { fromWibInput, toWibInput, type StudioArtist, type StudioEvent } from "@/lib/organizer";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { useStudioError } from "@/hooks/use-studio-error";
import ConcertCard from "@/components/concerts/concert-card";
import { ErrorState, LoadingState } from "@/components/states/async-states";
import { btn, inputCls, labelCls } from "@/components/studio/studio-ui";

type FormState = {
  title: string;
  artist_id: string;
  category: string;
  venue: string;
  date: string;
  poster_url: string;
  description: string;
  sales_start_at: string;
  sales_end_at: string;
};

const fromEvent = (ev?: StudioEvent): FormState => ({
  title: ev?.title ?? "",
  artist_id: ev?.artist_id ? String(ev.artist_id) : "",
  category: ev?.category ?? "",
  venue: ev?.venue ?? "",
  date: toWibInput(ev?.date),
  poster_url: ev?.poster_url ?? "",
  description: ev?.description ?? "",
  sales_start_at: toWibInput(ev?.sales_start_at),
  sales_end_at: toWibInput(ev?.sales_end_at),
});

const CATEGORY_SUGGESTIONS = ["Music", "Festival", "Concert", "Jazz", "K-Pop", "Rock", "Pop", "EDM"];

/** Form buat/edit event (DESIGN §4: Column — form 8 kolom + preview kartu sticky 4 kolom). */
export function EventForm({ event }: { event?: StudioEvent }) {
  const t = useTranslations("Studio.form");
  const router = useRouter();
  const studioError = useStudioError();
  const authed = !!useAuthToken();
  const artists = useApiResource(authed ? "studio-artists" : null, () => apiGet<StudioArtist[]>("/organizer/artists"));
  const [form, setForm] = useState<FormState>(() => fromEvent(event));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate(): string | null {
    if (!form.title.trim() || !form.artist_id || !form.category.trim() || !form.venue.trim() || !form.date)
      return t("errRequired");
    if (form.sales_start_at && form.sales_end_at && form.sales_end_at <= form.sales_start_at) return t("errSalesOrder");
    if (form.sales_end_at && form.sales_end_at > form.date) return t("errSalesAfterEvent");
    if (form.sales_start_at && form.sales_start_at >= form.date) return t("errSalesStartAfterEvent");
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validate();
    setFormError(invalid);
    if (invalid) return;
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      artist_id: Number(form.artist_id),
      category: form.category.trim(),
      venue: form.venue.trim(),
      date: fromWibInput(form.date),
      poster_url: form.poster_url.trim(),
      description: form.description.trim(),
      sales_start_at: fromWibInput(form.sales_start_at),
      sales_end_at: fromWibInput(form.sales_end_at),
    };
    try {
      if (event) {
        await apiPut<StudioEvent>(`/organizer/events/${event.id}`, payload);
        toast.success(t("updated"));
        router.push(`/organizer/events/${event.id}`);
      } else {
        const created = await apiPost<StudioEvent>("/organizer/events", payload);
        toast.success(t("created"));
        router.push(`/organizer/events/${created.id}`);
      }
    } catch (err) {
      setFormError(studioError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const artistName = artists.data?.find((a) => String(a.id) === form.artist_id)?.name ?? "";

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <Section title={t("sectionInfo")} hint={t("sectionInfoHint")}>
          <Field label={t("title")} htmlFor="ev-title">
            <input id="ev-title" className={inputCls} value={form.title} onChange={set("title")} required maxLength={200} />
          </Field>
          <Field label={t("artist")} htmlFor="ev-artist">
            {artists.loading ? (
              <LoadingState rows={1} className="space-y-0" />
            ) : artists.error !== undefined ? (
              <ErrorState error={artists.error} onRetry={artists.reload} className="py-4" />
            ) : artists.data && artists.data.length > 0 ? (
              <select id="ev-artist" className={inputCls} value={form.artist_id} onChange={set("artist_id")} required>
                <option value="">{t("artistPlaceholder")}</option>
                {artists.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                {t("noArtist")}{" "}
                <Link href="/organizer/artists" className="font-semibold text-primary hover:underline">
                  {t("addArtist")}
                </Link>
              </p>
            )}
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("category")} htmlFor="ev-category">
              <input id="ev-category" list="ev-category-list" className={inputCls} value={form.category} onChange={set("category")} required />
              <datalist id="ev-category-list">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label={t("venue")} htmlFor="ev-venue">
              <input id="ev-venue" className={inputCls} value={form.venue} onChange={set("venue")} required />
            </Field>
          </div>
          <Field label={t("poster")} htmlFor="ev-poster" hint={t("posterHint")}>
            <input id="ev-poster" type="url" inputMode="url" className={inputCls} value={form.poster_url} onChange={set("poster_url")} placeholder="https://" />
          </Field>
          <Field label={t("description")} htmlFor="ev-desc">
            <textarea id="ev-desc" rows={5} className={inputCls} value={form.description} onChange={set("description")} />
          </Field>
        </Section>

        <Section title={t("sectionSchedule")} hint={t("sectionScheduleHint")}>
          <Field label={t("date")} htmlFor="ev-date">
            <input id="ev-date" type="datetime-local" className={`${inputCls} font-mono`} value={form.date} onChange={set("date")} required />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("salesStart")} htmlFor="ev-sales-start" hint={t("salesOptional")}>
              <input id="ev-sales-start" type="datetime-local" className={`${inputCls} font-mono`} value={form.sales_start_at} onChange={set("sales_start_at")} />
            </Field>
            <Field label={t("salesEnd")} htmlFor="ev-sales-end" hint={t("salesOptional")}>
              <input id="ev-sales-end" type="datetime-local" className={`${inputCls} font-mono`} value={form.sales_end_at} onChange={set("sales_end_at")} />
            </Field>
          </div>
        </Section>

        <Section title={t("sectionTickets")} hint={event ? t("ticketsOnDetail") : t("ticketsAfterSave")}>
          {event && (
            <Link href={`/organizer/events/${event.id}`} className={btn.outline}>
              {t("manageTickets")}
            </Link>
          )}
        </Section>

        {formError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={event ? `/organizer/events/${event.id}` : "/organizer/events"} className={btn.outline}>
            {t("cancel")}
          </Link>
          <button type="submit" disabled={submitting} className={btn.primary}>
            {submitting ? t("saving") : event ? t("save") : t("createDraft")}
          </button>
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-6">
          <p className={labelCls}>{t("preview")}</p>
          <div className="pointer-events-none rounded-xl border border-border bg-background p-4" aria-hidden>
            <ConcertCard
              id={event?.id ?? 0}
              title={form.title || t("previewTitle")}
              location={form.venue || t("previewVenue")}
              organizer={artistName || "—"}
              price={null}
              poster_url={form.poster_url || undefined}
            />
          </div>
        </div>
      </aside>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-border bg-background p-4 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
