export interface Concert {
  id: number;
  title: string;
  category: string;
  venue: string;
  date: string;
  poster_url: string;
  banner_url?: string;
  status: string;
  artist_name: string;
  min_price: string | number | null;
  remaining: number;
  /** dihitung backend (GET /concerts dan /concerts/:id) */
  sales_status?: SalesStatus;
}

export interface TicketCategory {
  id: number;
  event_id: number;
  name: string;
  price: string | number;
  quota: number;
  sold: number;
  remaining?: number;
  benefits?: string;
  // dikirim GET /concerts/:id; tidak ada di endpoint organizer
  sales_status?: SalesStatus;
}

// status penjualan dari backend (wavy-backend src/utils/sales-status.ts)
export type SalesStatus = "upcoming" | "open" | "closed" | "sold_out";

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name: string;
  customer_id?: number;
  event_id?: number;
}

export interface ConcertDetail extends Concert {
  organizer_id: number;
  artist_id: number;
  description: string;
  genre: string;
  photo_url: string;
  bio: string;
  countdown_seconds: number;
  gallery?: string[];
  seatmap?: { name: string; images: string[] } | null;
  terms_conditions?: string | null;
  sales_status: SalesStatus;
  sales_start_at: string | null; // null = tanpa batas awal
  sales_end_at: string | null; // null = tanpa batas akhir
  ticket_categories: TicketCategory[];
  reviews: Review[];
  avg_rating: number;
  review_count: number;
}

export interface Order {
  id: number;
  customer_id: number;
  event_id: number;
  ticket_category_id: number;
  quantity: number;
  total_price: string | number;
  status: OrderStatus;
  expires_at: string | null;
  created_at: string;
  // join dari backend (LEFT JOIN: null jika event/kategori sudah dihapus)
  event_title?: string | null;
  category_name?: string | null;
  poster_url?: string | null;
  event_date?: string | null;
  venue?: string | null;
  full_name?: string;
  email?: string;
  phone?: string;
  id_number?: string;
  birth_date?: string | null;
  gender?: string | null;
  wa_consent?: string | null;
}

// status order dari backend; "expired" = pending yang lewat 15 menit (lazy expiry)
export type OrderStatus = "pending_payment" | "paid" | "rejected" | "refunded" | "expired";

export interface FavoritesResponse {
  organizers: { favorite_id: number; id: number; name: string }[];
  artists: { favorite_id: number; id: number; name: string; genre: string; photo_url: string }[];
}

export interface Ticket {
  id: number;
  order_id: number;
  owner_id: number;
  qr_code: string;
  is_scanned: boolean;
  event_id: number;
  title: string;
  date: string;
  venue: string;
  category: string;
  poster_url: string;
}

export interface CustomerLevel {
  attended_concerts: number;
  level: number;
  level_label: string;
}

export interface Artist {
  id: number;
  organizer_id?: number;
  name: string;
  genre: string;
  photo_url: string;
  bio: string;
  follower_count?: number;
}

export interface Organizer {
  id: number;
  name: string;
  email?: string;
  status?: "active" | "suspended";
  created_at?: string;
  follower_count?: number;
  event_count?: number;
  revenue?: number;
}

export interface NotificationItem {
  id: number;
  customer_id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface OrganizerDashboardStats {
  revenue: number;
  ticket_sold: number;
  remaining_ticket: number;
  popular_category: string;
  peak_purchase_hour: number;
}

// GET /admin/stats
export interface AdminStats {
  organizer_count: number;
  active_organizer_count: number;
  pending_organizer_count: number;
  suspended_organizer_count: number;
  rejected_organizer_count: number;
  customer_count: number;
  event_count: number;
  published_event_count: number;
  order_count: number;
  paid_order_count: number;
  revenue: number;
  ticket_sold: number;
  orders_by_status: Record<"pending_payment" | "paid" | "expired" | "rejected" | "refunded", number>;
}

// GET /admin/stats/daily?days=
export interface AdminDailyPoint {
  date: string; // YYYY-MM-DD (WIB)
  orders: number;
  tickets: number;
  revenue: number;
}

// GET /admin/stats/top-events
export interface AdminTopEvent {
  id: number;
  title: string;
  status: string;
  organizer_name: string;
  tickets_sold: number;
  revenue: number;
}

// GET /admin/orders/recent
export interface AdminRecentOrder {
  id: number;
  status: string;
  quantity: number;
  total_price: number;
  created_at: string;
  paid_at: string | null;
  event_id: number;
  event_title: string;
  organizer_name: string;
  customer_name: string;
}

export interface AdminCustomer {
  id: number;
  name: string | null;
  email: string;
  created_at: string;
  order_count: number;
  spend: number;
}

export type OrganizerStatus = "active" | "suspended" | "pending_verification" | "rejected";

// field verifikasi (PATCH /admin/organizers/:id): email_verified_at dari OTP pendaftaran,
// reviewed_at = waktu admin setujui/tolak, rejection_reason = alasan yang dikirim ke EO
type OrganizerReview = {
  email_verified_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
};

export interface AdminOrganizer extends OrganizerReview {
  id: number;
  name: string;
  email: string;
  status: OrganizerStatus;
  created_at: string;
  whatsapp: string;
  event_types: string;
  social_link: string;
  event_count: number;
  revenue: number;
}

export interface SetOrganizerStatusResult {
  message: string;
  status: OrganizerStatus;
  previous_status: OrganizerStatus;
  email_sent: boolean | null;
}

// GET /admin/organizers/:id
export interface AdminOrganizerDetail {
  organizer: OrganizerReview & {
    id: number;
    name: string;
    email: string;
    status: OrganizerStatus;
    created_at: string;
    whatsapp: string;
    event_types: string;
    social_link: string;
  };
  events: {
    id: number;
    title: string;
    category: string;
    venue: string;
    date: string | null;
    status: "draft" | "published" | "closed";
    poster_url: string | null;
    quota: number;
    sold: number;
    revenue: number;
  }[];
  summary: {
    event_count: number;
    published_count: number;
    paid_order_count: number;
    pending_order_count: number;
    ticket_sold: number;
    revenue: number;
  };
}
