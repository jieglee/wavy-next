"use client";

import { useEffect } from "react";
import { ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet, getAuthToken } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { OrderHistoryList } from "@/components/orders/order-history-list";
import type { Order } from "@/types/type";

export default function OrdersPage() {
  const router = useRouter();
  const t = useTranslations("Orders");
  const authed = !!useAuthToken();
  const orders = useApiResource(authed ? "orders-history" : null, () => apiGet<Order[]>("/orders/history"));

  useEffect(() => {
    if (!getAuthToken()) router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{t("eyebrow")}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("title")}</h1>
        </header>
        <AsyncContent
          resource={orders}
          loadingRows={4}
          empty={
            <EmptyState
              icon={<ReceiptText className="h-10 w-10" />}
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
          {(list) => <OrderHistoryList orders={list} />}
        </AsyncContent>
      </main>
      <Footer />
    </div>
  );
}
