"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Calendar,
  Plus,
  Trash2,
  Tag,
  ArrowLeft,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPost, apiDelete, getAuthToken } from "@/lib/api";
import { ErrorState, LoadingState } from "@/components/states/async-states";
import type { Artist, TicketCategory } from "@/types/type";

interface OrganizerEvent {
  id: number;
  organizer_id: number;
  artist_id: number;
  title: string;
  category: string;
  venue: string;
  date: string;
  poster_url: string;
  description: string;
  status: "draft" | "published" | "closed";
}

export default function OrganizerEventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Event Modal
  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [artistId, setArtistId] = useState<number | "">("");
  const [category, setCategory] = useState("Festival");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Manage Categories Modal
  const [categoryModal, setCategoryModal] = useState<OrganizerEvent | null>(null);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<unknown>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [loadNonce, setLoadNonce] = useState(0);
  const [catName, setCatName] = useState("");
  const [catPrice, setCatPrice] = useState<number | "">("");
  const [catQuota, setCatQuota] = useState<number | "">("");

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/organizer/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      setLoadError(null);
      try {
        const [evs, arts] = await Promise.allSettled([
          apiGet<OrganizerEvent[]>("/organizer/events"),
          apiGet<Artist[]>("/organizer/artists"),
        ]);

        // tanpa event/artis karangan: kegagalan ditampilkan sebagai error
        if (evs.status === "fulfilled" && Array.isArray(evs.value)) setEvents(evs.value);
        else setLoadError(evs.status === "rejected" ? evs.reason : new Error("invalid events response"));

        if (arts.status === "fulfilled" && Array.isArray(arts.value)) {
          setArtists(arts.value);
          if (arts.value.length > 0) setArtistId(arts.value[0].id);
        } else {
          setLoadError(arts.status === "rejected" ? arts.reason : new Error("invalid artists response"));
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, loadNonce]);

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!artistId || !title || !venue || !date) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        artist_id: Number(artistId),
        category,
        venue,
        date: new Date(date).toISOString(),
        poster_url: "",
        description: description || "Konser musik spektakuler di Wavy.",
      };

      const newEv = await apiPost<OrganizerEvent>("/organizer/events", payload);
      toast.success("Event berhasil dibuat sebagai Draft!");
      setEvents((prev) => [newEv, ...prev]);
      setCreateModal(false);
      resetForm();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal membuat event");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle("");
    setVenue("");
    setDate("");
    setDescription("");
  }

  async function handlePublishEvent(evId: number) {
    try {
      await apiPost(`/organizer/events/${evId}/publish`);
      toast.success("Event dipublish! Notifikasi broadcast telah dikirim ke semua follower.");
      setEvents((prev) => prev.map((e) => (e.id === evId ? { ...e, status: "published" } : e)));
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal mempublish event");
    }
  }

  async function handleCloseSales(evId: number) {
    try {
      await apiPost(`/organizer/events/${evId}/close-sales`);
      toast.success("Penjualan tiket event berhasil ditutup.");
      setEvents((prev) => prev.map((e) => (e.id === evId ? { ...e, status: "closed" } : e)));
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal menutup penjualan");
    }
  }

  async function handleDeleteEvent(evId: number) {
    if (!confirm("Yakin ingin menghapus event ini?")) return;
    try {
      await apiDelete(`/organizer/events/${evId}`);
      toast.success("Event berhasil dihapus.");
      setEvents((prev) => prev.filter((e) => e.id !== evId));
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal menghapus event");
    }
  }

  async function openCategoriesModal(ev: OrganizerEvent) {
    setCategoryModal(ev);
    setCategories([]);
    setCategoriesError(null);
    setCategoriesLoading(true);
    try {
      const data = await apiGet<TicketCategory[]>(`/organizer/events/${ev.id}/ticket-categories`);
      setCategories(data || []);
    } catch (err: unknown) {
      setCategoriesError(err);
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryModal || !catName || !catPrice || !catQuota) return;

    try {
      const newCat = await apiPost<TicketCategory>(
        `/organizer/events/${categoryModal.id}/ticket-categories`,
        {
          name: catName,
          price: Number(catPrice),
          quota: Number(catQuota),
        }
      );
      toast.success("Kategori tiket berhasil ditambahkan!");
      setCategories((prev) => [...prev, newCat]);
      setCatName("");
      setCatPrice("");
      setCatQuota("");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal menambahkan kategori tiket");
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <WavyIcon size={26} />
              <span className="font-display text-lg font-bold text-foreground">Wavy EO Portal</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-primary">Manajemen Event</span>
          </div>

          <Link
            href="/organizer/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">Daftar Event Konser</h1>
            <p className="text-xs text-muted-foreground">Kelola konser, atur kategori tiket, dan pantau status publikasi.</p>
          </div>

          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Buat Event Baru
          </button>
        </div>

        {/* Events Table */}
        {loading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-gray-200" />
        ) : loadError ? (
          <ErrorState error={loadError} onRetry={() => setLoadNonce((n) => n + 1)} />
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center space-y-3">
            <Calendar className="h-12 w-12 text-muted-foreground/80 mx-auto" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Event</h3>
            <p className="text-xs text-muted-foreground">Mulai buat event konser pertama Anda sekarang.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface text-muted-foreground/80">
                  <tr>
                    <th className="px-6 py-4 font-bold">Judul Event</th>
                    <th className="px-6 py-4 font-bold">Kategori</th>
                    <th className="px-6 py-4 font-bold">Tanggal & Venue</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground text-sm block">{ev.title}</span>
                        <span className="text-[10px] text-muted-foreground/80">ID: #{ev.id}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">{ev.category}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">
                          {new Date(ev.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 truncate max-w-[180px]">{ev.venue}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                            ev.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : ev.status === "closed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {ev.status === "published" ? "Published" : ev.status === "closed" ? "Closed" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openCategoriesModal(ev)}
                          className="rounded-xl border border-border bg-white px-3 py-1.5 font-bold text-foreground hover:border-primary"
                        >
                          <Tag className="inline h-3.5 w-3.5 mr-1 text-primary" />
                          Kategori Tiket
                        </button>

                        {ev.status === "draft" && (
                          <button
                            onClick={() => handlePublishEvent(ev.id)}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700"
                          >
                            Publish
                          </button>
                        )}

                        {ev.status === "published" && (
                          <button
                            onClick={() => handleCloseSales(ev.id)}
                            className="rounded-xl bg-gray-600 px-3 py-1.5 font-bold text-white hover:bg-gray-700"
                          >
                            Tutup Jual
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-xl font-bold text-foreground">Buat Event Konser Baru</h3>
              <button onClick={() => setCreateModal(false)} className="rounded-full bg-gray-100 p-1 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-bold text-foreground">Judul Event</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jakarta Soundwave 2026"
                  className="mt-1 w-full rounded-2xl border border-border p-3 outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Musisi / Penampil</label>
                  <select
                    value={artistId}
                    onChange={(e) => setArtistId(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-border p-3 outline-none bg-white focus:border-primary"
                  >
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.genre})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-foreground">Kategori Musik</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border p-3 outline-none bg-white focus:border-primary"
                  >
                    <option value="Festival">Festival</option>
                    <option value="Rock">Rock</option>
                    <option value="Pop">Pop</option>
                    <option value="Jazz">Jazz</option>
                    <option value="EDM">EDM</option>
                    <option value="Indie">Indie</option>
                    <option value="K-Pop">K-Pop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Lokasi / Venue</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Contoh: Istora Senayan, Jakarta"
                    className="mt-1 w-full rounded-2xl border border-border p-3 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground">Tanggal & Waktu</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border p-3 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground">Deskripsi Event</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan detail line-up, fasilitas, dan ketentuan konser..."
                  className="mt-1 w-full rounded-2xl border border-border p-3 outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="flex-1 rounded-2xl border border-border py-3 font-bold text-muted-foreground"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-primary py-3 font-bold text-white shadow hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Sebagai Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Categories Modal */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Kategori Tiket</h3>
                <p className="text-xs text-muted-foreground/80">{categoryModal.title}</p>
              </div>
              <button onClick={() => setCategoryModal(null)} className="rounded-full bg-gray-100 p-1 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {categoriesLoading ? (
                <LoadingState />
              ) : categoriesError ? (
                <ErrorState error={categoriesError} onRetry={() => categoryModal && openCategoriesModal(categoryModal)} />
              ) : categories.length === 0 ? (
                <p className="text-center py-4 text-xs text-muted-foreground/80">Belum ada kategori tiket.</p>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
                    <div>
                      <p className="font-bold text-xs text-foreground">{c.name}</p>
                      <p className="text-[11px] text-primary font-mono font-bold">
                        Rp{Number(c.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground/80">
                      <span>Kuota: {c.quota}</span> &bull; <span>Terjual: {c.sold}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="border-t border-border pt-4 space-y-3 text-xs">
              <p className="font-bold text-foreground">Tambah Kategori Baru</p>
              <div>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nama Kategori (misal: VIP, CAT 1, Presale)"
                  className="w-full rounded-2xl border border-border p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  value={catPrice}
                  onChange={(e) => setCatPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Harga (Rp)"
                  className="w-full rounded-2xl border border-border p-2.5 outline-none focus:border-primary"
                />
                <input
                  type="number"
                  required
                  value={catQuota}
                  onChange={(e) => setCatQuota(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Kuota Tiket"
                  className="w-full rounded-2xl border border-border p-2.5 outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-foreground py-2.5 font-bold text-white hover:bg-black"
              >
                + Tambah Kategori
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
