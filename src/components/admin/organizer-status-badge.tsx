"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  active: "bg-success/10 text-success",
  suspended: "bg-destructive/10 text-destructive",
  pending_verification: "bg-warning/10 text-warning",
  rejected: "bg-muted text-muted-foreground",
};

export function OrganizerStatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin.status");
  const known = status in STATUS_TONE;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest",
        known ? STATUS_TONE[status] : "bg-muted text-muted-foreground"
      )}
    >
      {known ? t(status as "active") : status}
    </span>
  );
}
