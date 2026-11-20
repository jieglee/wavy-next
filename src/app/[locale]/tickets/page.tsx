"use client";

import { useEffect, useState } from "react";
import { Ticket as TicketIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet, getAuthToken } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { TicketStub } from "@/components/tickets/ticket-stub";
import { TransferDialog } from "@/components/tickets/transfer-dialog";
import type { Ticket } from "@/types/type";

// Tiket saya (DESIGN §4 Modular): kartu tiket fisik, 3 -> 2 -> 1 kolom.
export default function TicketsPage() {
  const router = useRouter();
  const t = useTranslations("Tickets");
  const authed = !!useAuthToken();
  const tickets = useApiResource(authed ? "tickets" : null, () => apiGet<Ticket[]>("/tickets"));
  const [transfer, setTransfer] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!getAuthToken()) router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-6 flex flex-col gap-1 sm:mb-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{t("eyebrow")}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </header>

        <AsyncContent
          resource={tickets}
          loadingRows={3}
          empty={
            <EmptyState
              icon={<TicketIcon className="h-10 w-10" />}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              action={
                <Link href="/concerts" className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:brightness-110">
                  {t("browse")}
                </Link>
              }
            />
          }
        >
          {(list) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {list.map((ticket) => (
                <TicketStub key={ticket.id} ticket={ticket} onTransfer={setTransfer} />
              ))}
            </div>
          )}
        </AsyncContent>
      </main>

      {transfer && (
        <TransferDialog
          ticket={transfer}
          onClose={() => setTransfer(null)}
          onTransferred={(done) => {
            tickets.mutate((prev) => prev.filter((x) => x.id !== done.id));
            setTransfer(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
