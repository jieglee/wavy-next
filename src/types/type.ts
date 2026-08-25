export interface Concert {
  id: number;
  title: string;
  category: string;
  venue: string;
  date: string;
  poster_url: string;
  status: string;
  artist_name: string;
  organizer_name: string;
  min_price: string | number | null;
  remaining: number;
}

export interface TicketCategory {
  id: number;
  event_id: number;
  name: string;
  price: string | number;
  quota: number;
  sold: number;
  remaining?: number;
}

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
  status: "pending_payment" | "paid" | "rejected" | "refunded";
  expires_at: string;
  created_at: string;
  event_title?: string;
  category_name?: string;
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

export interface AdminStats {
  organizer_count: number;
  customer_count: number;
  event_count: number;
  order_count: number;
  revenue: number;
  ticket_sold: number;
}

export interface AdminCustomer {
  id: number;
  name: string | null;
  email: string;
  created_at: string;
  order_count: number;
  spend: number;
}

export interface AdminOrganizer {
  id: number;
  name: string;
  email: string;
  status: "active" | "suspended";
  created_at: string;
  event_count: number;
  revenue: number;
}
