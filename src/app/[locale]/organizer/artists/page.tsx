"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Plus, Trash2, Edit2, Music, ArrowLeft, X } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPost, apiPut, apiDelete, getAuthToken } from "@/lib/api";
import type { Artist } from "@/types/type";

export default function OrganizerArtistsPage() {
  const router = useRouter();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/organizer/login");
      return;
    }

    async function loadArtists() {
      setLoading(true);
      try {
        const data = await apiGet<Artist[]>("/organizer/artists");
        setArtists(data || []);
      } catch {
        setArtists([
          { id: 1, name: "TRUST Orchestra", genre: "Symphonic Orchestra", photo_url: "", bio: "Ansambel orkestra independen terkemuka di Indonesia." },
          { id: 2, name: "Sheila on 7", genre: "Pop Rock", photo_url: "", bio: "Band legendaris Indonesia dengan jutaan penggemar setia." },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadArtists();
  }, [router]);

  function handleOpenCreate() {
    setEditingArtist(null);
    setName("");
    setGenre("");
    setBio("");
    setModalOpen(true);
  }

  function handleOpenEdit(artist: Artist) {
    setEditingArtist(artist);
    setName(artist.name);
    setGenre(artist.genre);
    setBio(artist.bio);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        genre: genre || "Pop",
        photo_url: "",
        bio: bio || "Musisi profesional",
      };

      if (editingArtist) {
        const updated = await apiPut<Artist>(`/organizer/artists/${editingArtist.id}`, payload);
        toast.success("Artis berhasil diperbarui!");
        setArtists((prev) => prev.map((a) => (a.id === editingArtist.id ? updated : a)));
      } else {
        const created = await apiPost<Artist>("/organizer/artists", payload);
        toast.success("Artis berhasil ditambahkan!");
        setArtists((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal menyimpan data artis");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus musisi ini?")) return;
    try {
      await apiDelete(`/organizer/artists/${id}`);
      toast.success("Musisi berhasil dihapus.");
      setArtists((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal menghapus musisi");
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
            <span className="text-xs font-bold text-[#FF5470]">Manajemen Artis</span>
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
            <h1 className="font-display text-2xl font-extrabold text-[#1B1A3A]">Daftar Musisi & Penampil</h1>
            <p className="text-xs text-[#6B6875]">Kelola profil musisi dan grup musik yang tampil pada event Anda.</p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF5470] px-5 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Tambah Musisi
          </button>
        </div>

        {/* Artists Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#EDEBF2] bg-white p-12 text-center space-y-3">
            <Music className="h-12 w-12 text-[#8B889C] mx-auto" />
            <h3 className="text-base font-bold text-[#1B1A3A]">Belum Ada Musisi</h3>
            <p className="text-xs text-[#6B6875]">Tambahkan artis pertama Anda untuk dikaitkan dengan event konser.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((art) => (
              <div
                key={art.id}
                className="flex flex-col justify-between rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B1A3A] to-[#FF5470] text-white">
                    <Music className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1B1A3A]">{art.name}</h3>
                    <span className="inline-block rounded-full bg-[#1B1A3A]/5 px-2.5 py-0.5 text-[10px] font-bold text-[#FF5470] mt-1">
                      {art.genre}
                    </span>
                    <p className="text-xs text-[#6B6875] mt-2 line-clamp-2">{art.bio}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#EDEBF2] pt-4">
                  <button
                    onClick={() => handleOpenEdit(art)}
                    className="flex items-center gap-1 rounded-xl border border-[#EDEBF2] px-3 py-1.5 text-xs font-bold text-[#1B1A3A] hover:bg-gray-50"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(art.id)}
                    className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Add / Edit Artist */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDEBF2] pb-3">
              <h3 className="font-display text-xl font-bold text-[#1B1A3A]">
                {editingArtist ? "Edit Musisi" : "Tambah Musisi Baru"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="rounded-full bg-gray-100 p-1 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-bold text-[#1B1A3A]">Nama Musisi / Band</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dewa 19 / NIKI"
                  className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none focus:border-[#FF5470]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A3A]">Genre Musik</label>
                <input
                  type="text"
                  required
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Contoh: Pop Rock / Jazz / Symphonic"
                  className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none focus:border-[#FF5470]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A3A]">Biografi Singkat</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Profil singkat musisi..."
                  className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 outline-none focus:border-[#FF5470]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-2xl border border-[#EDEBF2] py-3 font-bold text-[#6B6875]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-[#1B1A3A] py-3 font-bold text-white shadow hover:bg-black disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Musisi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
