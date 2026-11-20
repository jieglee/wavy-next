"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Mic2, Pencil, Plus, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import type { StudioArtist } from "@/lib/organizer";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { useStudioError } from "@/hooks/use-studio-error";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn, inputCls, labelCls } from "@/components/studio/studio-ui";

type Draft = { name: string; genre: string; photo_url: string; bio: string };
const empty: Draft = { name: "", genre: "", photo_url: "", bio: "" };

export default function StudioArtistsPage() {
  const t = useTranslations("Studio.artists");
  const studioError = useStudioError();
  const authed = !!useAuthToken();
  const artists = useApiResource(authed ? "studio-artists" : null, () => apiGet<StudioArtist[]>("/organizer/artists"));
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open(a?: StudioArtist) {
    setError(null);
    setEditing(a ? a.id : "new");
    setDraft(a ? { name: a.name, genre: a.genre ?? "", photo_url: a.photo_url ?? "", bio: a.bio ?? "" } : empty);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return setError(t("errName"));
    setSaving(true);
    setError(null);
    const body = { name: draft.name.trim(), genre: draft.genre.trim(), photo_url: draft.photo_url.trim(), bio: draft.bio.trim() };
    try {
      if (editing === "new") {
        const created = await apiPost<StudioArtist>("/organizer/artists", body);
        artists.mutate((list) => [created, ...list]);
        toast.success(t("added"));
      } else {
        const updated = await apiPut<StudioArtist>(`/organizer/artists/${editing}`, body);
        artists.mutate((list) => list.map((a) => (a.id === updated.id ? updated : a)));
        toast.success(t("updated"));
      }
      setEditing(null);
    } catch (err) {
      setError(studioError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(a: StudioArtist) {
    if (!window.confirm(t("confirmDelete", { name: a.name }))) return;
    setError(null);
    try {
      await apiDelete(`/organizer/artists/${a.id}`);
      artists.mutate((list) => list.filter((x) => x.id !== a.id));
      toast.success(t("deleted"));
    } catch (err) {
      setError(studioError(err));
    }
  }

  const addBtn = (
    <button type="button" className={btn.primary} onClick={() => open()} disabled={editing !== null}>
      <Plus className="h-4 w-4" />
      {t("add")}
    </button>
  );

  return (
    <>
      <StudioPageHeader title={t("title")} description={t("subtitle")} actions={addBtn} />

      {error && editing === null && (
        <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {editing !== null && (
        <form onSubmit={save} className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2 sm:p-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground sm:col-span-2">
            {editing === "new" ? t("formNew") : t("formEdit")}
          </h2>
          <div>
            <label htmlFor="ar-name" className={labelCls}>{t("name")}</label>
            <input id="ar-name" className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
          </div>
          <div>
            <label htmlFor="ar-genre" className={labelCls}>{t("genre")}</label>
            <input id="ar-genre" className={inputCls} value={draft.genre} onChange={(e) => setDraft({ ...draft, genre: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ar-photo" className={labelCls}>{t("photo")}</label>
            <input id="ar-photo" type="url" className={inputCls} value={draft.photo_url} onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })} placeholder="https://" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ar-bio" className={labelCls}>{t("bio")}</label>
            <textarea id="ar-bio" rows={3} className={inputCls} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" className={btn.outline} onClick={() => setEditing(null)}>{t("cancel")}</button>
            <button type="submit" disabled={saving} className={btn.primary}>{saving ? t("saving") : t("save")}</button>
          </div>
        </form>
      )}

      <AsyncContent resource={artists} empty={<EmptyState icon={<Mic2 className="h-10 w-10" />} title={t("emptyTitle")} description={t("emptyText")} />}>
        {(list) => (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((a) => (
              <li key={a.id} className="flex gap-4 rounded-xl border border-border bg-background p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stage font-display text-lg font-bold text-primary-foreground">
                  {a.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photo_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    a.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{a.name}</p>
                  {a.genre && <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{a.genre}</p>}
                  {a.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.bio}</p>}
                  <div className="mt-2 flex gap-1">
                    <button type="button" className={btn.ghost} onClick={() => open(a)} disabled={editing !== null}>
                      <Pencil className="h-3.5 w-3.5" />
                      {t("edit")}
                    </button>
                    <button type="button" className={`${btn.ghost} hover:text-destructive`} onClick={() => remove(a)} disabled={editing !== null}>
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AsyncContent>
    </>
  );
}
