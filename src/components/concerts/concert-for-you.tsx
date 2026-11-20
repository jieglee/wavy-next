"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";
interface DisplayEvent { id: number; title: string; organizer: string; location: string; price: string | null; gradient: string; poster_url?: string; }
// dekorasi kartu tanpa poster (bukan data)
const GRADIENTS = ["linear-gradient(135deg,#7DD3E8,#4A90D9)", "linear-gradient(135deg,#8B0000,#2B0000)", "linear-gradient(135deg,#3D3D3D,#0A0A0A)", "linear-gradient(135deg,var(--foreground),#0D0C1F)", "linear-gradient(135deg,var(--primary),#211F2B)", "linear-gradient(135deg,#C6395A,#14131C)"];
const extractConcerts = (data: unknown): Concert[] => {
  if (Array.isArray(data)) return data as Concert[];
  if (data && typeof data === "object") { const d = data as Record<string, unknown>; if (Array.isArray(d.concerts)) return d.concerts as Concert[]; if (Array.isArray(d.data)) return d.data as Concert[]; if (Array.isArray(d.events)) return d.events as Concert[]; if (d.concerts && typeof d.concerts === "object" && Array.isArray((d.concerts as Record<string, unknown>).data)) return (d.concerts as Record<string, unknown>).data as Concert[]; }
  return [];
};
const toDisplay = (c: Concert, idx: number): DisplayEvent => ({ id: c.id, title: c.title, organizer: c.organizer_name || c.artist_name || "", location: c.venue || "", price: c.min_price ? Number(c.min_price).toLocaleString("id-ID") : null, gradient: GRADIENTS[idx % GRADIENTS.length], poster_url: c.poster_url });
// /concerts dulu; kalau kosong pakai /homepage. Tanpa data karangan.
async function loadForYou(excludeId: string | number): Promise<DisplayEvent[]> {
  const notSelf = (c: Concert) => String(c.id) !== String(excludeId);
  const concerts = extractConcerts(await apiGet<unknown>("/concerts")).filter(notSelf);
  const list = concerts.length > 0 ? concerts : extractConcerts(await apiGet<unknown>("/homepage")).filter(notSelf);
  return list.slice(0, 8).map(toDisplay);
}
function ArrowLeftIcon({ className }: { className?: string }) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className}><path fill="currentColor" d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0" /></svg>; }
function ArrowRightIcon({ className }: { className?: string }) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className} style={{ transform: "scaleX(-1)" }}><path fill="currentColor" d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0" /></svg>; }
export default function ConcertForYou({ excludeId }: { excludeId: string | number }) {
  const t = useTranslations("FeaturedEvents");
  const tDetail = useTranslations("ConcertDetail");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const forYou = useApiResource(`for-you-${excludeId}`, () => loadForYou(excludeId));
  const events = forYou.data ?? [];
  const updateArrows = useCallback(() => { const el = scrollerRef.current; if (!el) return; setCanScrollLeft(el.scrollLeft > 4); setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4); }, []);
  useEffect(() => { updateArrows(); const el = scrollerRef.current; if (!el) return; el.addEventListener("scroll", updateArrows, { passive: true }); window.addEventListener("resize", updateArrows); return () => { el.removeEventListener("scroll", updateArrows); window.removeEventListener("resize", updateArrows); }; }, [updateArrows, events.length]);
  const scrollByCard = (dir: number) => { const el = scrollerRef.current; if (!el) return; const card = el.firstElementChild as HTMLElement | null; const gap = 16; const cardWidth = card?.offsetWidth ?? (window.innerWidth < 640 ? 290 : 320); el.scrollBy({ left: dir * (cardWidth + gap), behavior: "smooth" }); };
  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6 shrink-0 text-primary" strokeWidth={3} />
        <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{tDetail("forYou")}</h2>
      </div>
      {forYou.loading ? <LoadingState /> : forYou.error ? <ErrorState error={forYou.error} onRetry={forYou.reload} /> : events.length === 0 ? <EmptyState title={t("empty")} /> : (
      <div className="relative">
        {canScrollLeft && <button onClick={() => scrollByCard(-1)} aria-label={t("prev")} className="absolute left-0 sm:-left-4 top-15.75 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 sm:top-17.5"><ArrowLeftIcon className="h-4 w-4" /></button>}
        {canScrollRight && <button onClick={() => scrollByCard(1)} aria-label={t("next")} className="absolute right-0 sm:-right-4 top-15.75 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 sm:top-17.5"><ArrowRightIcon className="h-4 w-4" /></button>}
        <div ref={scrollerRef} className="scrollbar-hide -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-2 py-4">
          {events.slice(0, 8).map((event) => (
            <Link key={event.id} href={`/concerts/${event.id}`} className="group w-72.5 shrink-0 snap-start sm:w-80">
              <div className="transition-transform duration-300 ease-out group-hover:-translate-y-2">
                <div className="relative aspect-16/7 overflow-hidden rounded-xl border border-border shadow-[0_4px_14px_color-mix(in_oklab,var(--foreground)_12%,transparent)] transition-all duration-300 group-hover:shadow-[0_16px_32px_-8px_color-mix(in_oklab,var(--foreground)_28%,transparent)] group-hover:border-primary/30">
                  {event.poster_url ? <img src={event.poster_url} alt={event.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" /> : <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105" style={{ background: event.gradient }} />}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground/80">{event.location}</p>
              <h3 className="mt-1 block w-full truncate font-display text-sm font-bold text-foreground transition-all duration-300 group-hover:text-primary">{event.title}</h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{t("byOrganizer", { organizer: event.organizer })}</p>
              <div className="mt-3 border-t border-border pt-2.5">{event.price ? (<><p className="text-[0.65rem] text-muted-foreground/80">{t("startingFrom")}</p><p className="font-mono text-sm font-bold text-foreground">Rp{event.price}</p></>) : (<p className="text-xs text-muted-foreground">{t("priceUnavailable")}</p>)}</div>
            </Link>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
