// Tipe & helper Creator Studio. Bentuk respons mengikuti backend
// wavy-backend fix/organizer-rules + feat/organizer-api.
import type { SalesStatus } from "@/types/type";

export type EventStatus = "draft" | "published" | "closed";

export interface StudioEvent {
  id: number;
  organizer_id: number;
  artist_id: number;
  artist_name?: string | null;
  title: string;
  category: string;
  venue: string;
  date: string;
  poster_url: string;
  description: string;
  status: EventStatus;
  sales_start_at: string | null;
  sales_end_at: string | null;
  sales_status?: SalesStatus;
  total_quota?: number;
  total_sold?: number;
  total_pending?: number;
  total_remaining?: number;
}

export interface StudioCategory {
  id: number;
  event_id: number;
  name: string;
  price: string | number;
  quota: number;
  sold: number;
  pending?: number;
  remaining?: number;
  sales_status?: SalesStatus;
}

export interface StudioEventDetail extends StudioEvent {
  ticket_categories: StudioCategory[];
}

export interface StudioArtist {
  id: number;
  name: string;
  genre: string;
  photo_url: string;
  bio: string;
}

export type OrderStatus = "pending_payment" | "paid" | "expired" | "rejected" | "refunded" | "cancelled";

export interface StudioOrder {
  id: number;
  customer_id: number;
  event_id: number;
  ticket_category_id: number;
  quantity: number;
  total_price: string | number;
  status: OrderStatus;
  expires_at: string | null;
  created_at: string;
  paid_at?: string | null;
  event_title?: string;
  category_name?: string;
  customer_name?: string | null;
  customer_email?: string | null;
}

export interface StudioOrderDetail extends StudioOrder {
  tickets?: { id: number; is_scanned: boolean }[];
  [key: string]: unknown;
}

export interface DashboardKpi {
  revenue: number;
  tickets_sold: number;
  pending_reserved: number;
  checked_in: number;
  revenue_7d: number;
  revenue_prev_7d: number;
  sold_7d: number;
  sold_prev_7d: number;
}

export interface DashboardCategory {
  event_id: number;
  event_title: string;
  category_id: number;
  name: string;
  quota: number;
  sold: number;
  pending: number;
  remaining: number;
  revenue: number;
}

/** GET /admin/dashboard — kuota per kategori, check-in, tren 7 hari. */
export interface SalesDashboard {
  revenue: number;
  ticket_sold: number;
  remaining_ticket: number;
  popular_category: string;
  peak_purchase_hour: number;
  kpi?: DashboardKpi;
  per_category?: DashboardCategory[];
  recent_orders?: StudioOrder[];
}

export interface SalesPoint {
  date: string;
  tickets: number;
  revenue: number;
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** ISO (UTC/offset apa pun) -> nilai <input type="datetime-local"> dalam WIB. */
export function toWibInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 16);
}

/** Nilai datetime-local (dianggap WIB) -> ISO 8601 dengan offset +07:00, atau null. */
export function fromWibInput(value: string): string | null {
  if (!value) return null;
  return `${value}:00+07:00`;
}

/** Format tanggal-jam WIB untuk tampilan (mono). */
export function formatWib(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleString(locale === "en" ? "en-GB" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  })} WIB`;
}

export const toNumber = (v: string | number | null | undefined) => (v === null || v === undefined ? 0 : Number(v));
