"use client";

import { Calendar, MapPin, QrCode, Send } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types/type";

/** Status tiket — badge mono uppercase (DESIGN §6). */
export function TicketStatusBadge({ used, className }: { used: boolean; className?: string }) {
  const t = useTranslations("Tickets");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest",
        used ? "bg-muted text-muted-foreground" : "bg-success/10 text-success",
        className
      )}
    >
      {used ? t("status.used") : t("status.active")}
    </span>
  );
}

/** Garis perforasi horizontal dengan dua takik — memisahkan badan tiket dan sobekan. */
export function Perforation({ notchClass = "bg-surface" }: { notchClass?: string }) {
  return (
    <div className="relative h-0 border-t-2 border-dashed border-border" aria-hidden>
      <span className={cn("absolute -left-3 -top-3 h-6 w-6 rounded-full border border-border", notchClass)} />
      <span className={cn("absolute -right-3 -top-3 h-6 w-6 rounded-full border border-border", notchClass)} />
    </div>
  );
}

/** Kartu tiket berbentuk tiket fisik untuk grid "Tiket saya" (DESIGN §4 Modular). */
export function TicketStub({ ticket, onTransfer }: { ticket: Ticket; onTransfer: (ticket: Ticket) => void }) {
  const t = useTranslations("Tickets");
  const format = useFormatter();
  const date = format.dateTime(new Date(ticket.date), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--primary-glow)]">
      <div className="flex-1 space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {ticket.category}
          </span>
          <TicketStatusBadge used={ticket.is_scanned} />
        </div>
        <h2 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground">{ticket.title}</h2>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="font-mono">{date}</span>
          </p>
          <p className="flex items-start gap-1.5">
            <MapPin className="mt-px h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0">{ticket.venue}</span>
          </p>
        </div>
      </div>

      <Perforation />

      <div className="flex items-center justify-between gap-2 bg-surface px-5 py-4">
        <span className="font-mono text-xs font-bold text-foreground">{t("code", { id: ticket.id })}</span>
        <div className="flex items-center gap-2">
          {!ticket.is_scanned && (
            <button
              type="button"
              onClick={() => onTransfer(ticket)}
              aria-label={t("transfer.action")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:border-primary/50"
            >
              <Send className="h-4 w-4 text-primary" />
            </button>
          )}
          <Link
            href={`/tickets/${ticket.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-bold text-background hover:opacity-90"
          >
            <QrCode className="h-4 w-4" />
            {t("showQr")}
          </Link>
        </div>
      </div>
    </article>
  );
}
