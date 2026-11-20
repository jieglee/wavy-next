"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import { apiGet, getAuthToken } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { AsyncContent } from "@/components/states/async-states";
import { TicketQr } from "@/components/tickets/ticket-qr";
import { Perforation, TicketStatusBadge } from "@/components/tickets/ticket-stub";
import { TransferDialog } from "@/components/tickets/transfer-dialog";
import type { Ticket } from "@/types/type";

// Detail tiket (DESIGN §4 Axial): QR di sumbu tengah, info di atas & bawah, perforasi horizontal.
export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("Tickets");
  const format = useFormatter();
  const authed = !!useAuthToken();
  const ticket = useApiResource(authed ? `ticket-${id}` : null, () => apiGet<Ticket>(`/tickets/${id}`));
  const [transfer, setTransfer] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-dvh bg-surface">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col px-4 pb-10 pt-4 sm:pt-8">
        <Link
          href="/tickets"
          className="mb-4 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back")}
        </Link>

        <AsyncContent resource={ticket} loadingRows={2}>
          {(tk) => {
            const date = new Date(tk.date);
            return (
              <>
                <article className="overflow-hidden rounded-2xl border border-border bg-background text-center">
                  <div className="space-y-2 px-6 pb-6 pt-7">
                    <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-primary">{t("gatePass")}</p>
                    <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground">{tk.title}</h1>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{tk.category}</p>
                    <div className="flex justify-center pt-1">
                      <TicketStatusBadge used={tk.is_scanned} />
                    </div>
                  </div>

                  <Perforation />

                  <div className="flex justify-center px-6 py-8">
                    <TicketQr code={tk.qr_code} used={tk.is_scanned} className="w-full" />
                  </div>

                  <Perforation />

                  <dl className="grid grid-cols-2 gap-4 px-6 py-6 text-left">
                    <div>
                      <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("detail.date")}</dt>
                      <dd className="mt-1 font-mono text-sm text-foreground">
                        {format.dateTime(date, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("detail.time")}</dt>
                      <dd className="mt-1 font-mono text-sm text-foreground">
                        {format.dateTime(date, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" })} WIB
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("detail.venue")}</dt>
                      <dd className="mt-1 text-sm text-foreground">{tk.venue}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("detail.ticket")}</dt>
                      <dd className="mt-1 font-mono text-sm font-bold text-foreground">{t("code", { id: tk.id })}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("detail.order")}</dt>
                      <dd className="mt-1">
                        <Link href={`/orders/${tk.order_id}`} className="font-mono text-sm font-bold text-primary hover:underline">
                          #{tk.order_id}
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </article>

                <p className="mt-4 text-center text-xs text-muted-foreground">{t("gateHint")}</p>

                {!tk.is_scanned && (
                  <button
                    type="button"
                    onClick={() => setTransfer(true)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:border-primary/50"
                  >
                    <Send className="h-4 w-4 text-primary" />
                    {t("transfer.action")}
                  </button>
                )}

                {transfer && (
                  <TransferDialog ticket={tk} onClose={() => setTransfer(false)} onTransferred={() => router.replace("/tickets")} />
                )}
              </>
            );
          }}
        </AsyncContent>
      </main>
    </div>
  );
}
