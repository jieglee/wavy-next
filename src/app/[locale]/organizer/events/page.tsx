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
      try {
        const [evs, arts] = await Promise.allSettled([
          apiGet<OrganizerEvent[]>("/organizer/events"),
          apiGet<Artist[]>("/organizer/artists"),
        ]);

        if (evs.status === "fulfilled" && Array.isArray(evs.value)) {
          setEvents(evs.value);
        } else {
          setEvents([
            {
              id: 1,
              organizer_id: 1,
              artist_id: 1,
              title: "The Legends Infinity World Tour",
              category: "Festival",
              venue: "ICE BSD Hall 1, Tangerang",
              date: "2026-09-15T19:00:00Z",
              poster_url: "",
              description: "Konser simfoni orkestra spektakuler.",
              status: "published",
            },
            {
              id: 2,
              organizer_id: 1,
              artist_id: 2,
              title: "Pop Wave Festival 2026",
              category: "Pop",
              venue: "Stadion Utama GBK, Jakarta",
              date: "2026-11-20T18:00:00Z",
              poster_url: "",
              description: "Festival musik pop terbesar tahun ini.",
              status: "draft",
            },
          ]);
        }

        if (arts.status === "fulfilled" && Array.isArray(arts.value)) {
          setArtists(arts.value);
          if (arts.value.length > 0) setArtistId(arts.value[0].id);
        } else {
          setArtists([
            { id: 1, name: "TRUST Orchestra", genre: "Orchestra", photo_url: "", bio: "" },
            { id: 2, name: "Sheila on 7", genre: "Pop Rock", photo_url: "", bio: "" },
          ]);
          setArtistId(1);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

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
    try {
      const data = await apiGet<TicketCategory[]>(`/organizer/events/${ev.id}/ticket-categories`);
      setCategories(data || []);
    } catch {
      setCategories([
        { id: 1, event_id: ev.id, name: "VIP", price: 750000, quota: 100, sold: 20 },
        { id: 2, event_id: ev.id, name: "Regular", price: 350000, quota: 300, sold: 120 },
      ]);
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
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Top Bar */}
      <header className="border-b border-[#EDEBF2] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <WavyIcon size={26} />
              <span className="font-display text-lg font-bold text-[#1B1A3A]">Wavy EO Portal</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-[#FF5470]">Manajemen Event</span>
          </div>

          <Link
            href="/organizer/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-[#8B889C] hover:text-[#1B1A3A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#1B1A3A]">Daftar Event Konser</h1>
            <p className="text-xs text-[#6B6875]">Kelola konser, atur kategori tiket, dan pantau status publikasi.</p>
          </div>

          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF5470] px-5 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Buat Event Baru
          </button>
        </div>

        {/* Events Table */}
        {loading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-gray-200" />
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#EDEBF2] bg-white p-12 text-center space-y-3">
            <Calendar className="h-12 w-12 text-[#8B889C] mx-auto" />
            <h3 className="text-base font-bold text-[#1B1A3A]">Belum Ada Event</h3>
            <p className="text-xs text-[#6B6875]">Mulai buat event konser pertama Anda sekarang.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#EDEBF2] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#EDEBF2] bg-[#FAFAF8] text-[#8B889C]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Judul Event</th>
                    <th className="px-6 py-4 font-bold">Kategori</th>
                    <th className="px-6 py-4 font-bold">Tanggal & Venue</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEBF2]">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#1B1A3A] text-sm block">{ev.title}</span>
                        <span className="text-[10px] text-[#8B889C]">ID: #{ev.id}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1B1A3A]">{ev.category}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#1B1A3A]">
                          {new Date(ev.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-[10px] text-[#8B889C] truncate max-w-[180px]">{ev.venue}</p>
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
                          className="rounded-xl border border-[#EDEBF2] bg-white px-3 py-1.5 font-bold text-[#1B1A3A] hover:border-[#FF5470]"
                        >
                          <Tag className="inline h-3.5 w-3.5 mr-1 text-[#FF5470]" />
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
            <div className="flex items-center justify-between border-b border-[#EDEBF2] pb-3">
              <h3 className="font-display text-xl font-bold text-[#1B1A3A]">Buat Event Konser Baru</h3>
              <button onClick={() => setCreateModal(false)} className="rounded-full bg-gray-100 p-1 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-bold text-[#1B1A3A]">Judul Event</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jakarta Soundwave 2026"
                  className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none focus:border-[#FF5470]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1B1A3A]">Musisi / Penampil</label>
                  <select
                    value={artistId}
                    onChange={(e) => setArtistId(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none bg-white focus:border-[#FF5470]"
                  >
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.genre})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A3A]">Kategori Musik</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none bg-white focus:border-[#FF5470]"
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
                  <label className="font-bold text-[#1B1A3A]">Lokasi / Venue</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Contoh: Istora Senayan, Jakarta"
                    className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none focus:border-[#FF5470]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1B1A3A]">Tanggal & Waktu</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none focus:border-[#FF5470]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1B1A3A]">Deskripsi Event</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan detail line-up, fasilitas, dan ketentuan konser..."
                  className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none focus:border-[#FF5470]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="flex-1 rounded-2xl border border-[#EDEBF2] py-3 font-bold text-[#6B6875]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-[#FF5470] py-3 font-bold text-white shadow hover:brightness-110 disabled:opacity-50"
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
            <div className="flex items-center justify-between border-b border-[#EDEBF2] pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-[#1B1A3A]">Kategori Tiket</h3>
                <p className="text-xs text-[#8B889C]">{categoryModal.title}</p>
              </div>
              <button onClick={() => setCategoryModal(null)} className="rounded-full bg-gray-100 p-1 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {categories.length === 0 ? (
                <p className="text-center py-4 text-xs text-[#8B889C]">Belum ada kategori tiket.</p>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF8] border border-[#EDEBF2]">
                    <div>
                      <p className="font-bold text-xs text-[#1B1A3A]">{c.name}</p>
                      <p className="text-[11px] text-[#FF5470] font-mono font-bold">
                        Rp{Number(c.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-[#8B889C]">
                      <span>Kuota: {c.quota}</span> &bull; <span>Terjual: {c.sold}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="border-t border-[#EDEBF2] pt-4 space-y-3 text-xs">
              <p className="font-bold text-[#1B1A3A]">Tambah Kategori Baru</p>
              <div>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nama Kategori (misal: VIP, CAT 1, Presale)"
                  className="w-full rounded-2xl border border-[#EDEBF2] p-2.5 outline-none focus:border-[#FF5470]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  value={catPrice}
                  onChange={(e) => setCatPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Harga (Rp)"
                  className="w-full rounded-2xl border border-[#EDEBF2] p-2.5 outline-none focus:border-[#FF5470]"
                />
                <input
                  type="number"
                  required
                  value={catQuota}
                  onChange={(e) => setCatQuota(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Kuota Tiket"
                  className="w-full rounded-2xl border border-[#EDEBF2] p-2.5 outline-none focus:border-[#FF5470]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#1B1A3A] py-2.5 font-bold text-white hover:bg-black"
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
