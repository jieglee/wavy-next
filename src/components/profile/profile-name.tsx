"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { setAuthUser } from "@/lib/api";
import { useErrorMessage } from "@/lib/error-message";
import { NAME_MAX, nameError, updateProfile, type CustomerProfile } from "@/lib/profile";

/** Nama + email di kartu profil; nama bisa diubah lewat PATCH /me (2–80 karakter, dicek juga di backend). */
export function ProfileName({ profile, onSaved }: { profile: CustomerProfile; onSaved: (p: CustomerProfile) => void }) {
  const t = useTranslations("Profile");
  const ta = useTranslations("Auth");
  const errorMessage = useErrorMessage();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const invalid = nameError(name);
    if (invalid) {
      setError(ta(invalid, { max: NAME_MAX }));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile({ name: name.trim() });
      setAuthUser({ id: updated.id, name: updated.name, email: updated.email });
      onSaved(updated);
      setEditing(false);
      toast.success(t("nameSaved"));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!editing)
    return (
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {profile.name || t("defaultName")}
          </h1>
          <button
            type="button"
            onClick={() => {
              setName(profile.name ?? "");
              setEditing(true);
            }}
            aria-label={t("editName")}
            title={t("editName")}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <p className="truncate font-mono text-xs text-muted-foreground">{profile.email}</p>
      </div>
    );

  return (
    <form onSubmit={save} noValidate className="w-full min-w-0 space-y-2 sm:max-w-sm">
      <label htmlFor="profile-name" className="block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {t("nameLabel")}
      </label>
      <input
        id="profile-name"
        autoFocus
        autoComplete="name"
        maxLength={NAME_MAX}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        aria-invalid={!!error}
        aria-describedby={error ? "profile-name-error" : undefined}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      {error && (
        <p id="profile-name-error" role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setEditing(false);
            setError("");
          }}
          className="rounded-lg border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
