"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Ticket as TicketIcon,
  QrCode,
  Send,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { ApiError, apiGet, apiPost, getAuthToken } from "@/lib/api";
import { useTranslations } from "next-intl";
import { useApiResource } from "@/hooks/use-api-resource";
import { useErrorMessage } from "@/lib/error-message";
import { ErrorState } from "@/components/states/async-states";
import { TicketQr } from "@/components/tickets/ticket-qr";
import type { Ticket } from "@/types/type";

export default function TicketsPage() {
  const router = useRouter();

  const ticketsRes = useApiResource("tickets", () => apiGet<Ticket[]>("/tickets"));
  const tickets = ticketsRes.data ?? [];
  const loading = ticketsRes.loading;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [transferModal, setTransferModal] = useState<Ticket | null>(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const errorMessage = useErrorMessage();
  const tTickets = useTranslations("Tickets");

  useEffect(() => {
    if (!getAuthToken()) router.push("/auth/login");
  }, [router]);

  async function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transferModal || !targetEmail) return;

    setTransferLoading(true);
    try {
      await apiPost(`/tickets/${transferModal.id}/transfer`, { to_email: targetEmail });
      toast.success(`Tiket berhasil ditransfer ke ${targetEmail}!`);
      ticketsRes.mutate((prev) => prev.filter((t) => t.id !== transferModal.id));
      setTransferModal(null);
      setTargetEmail("");
    } catch (err: unknown) {
      // 404 = email penerima belum terdaftar sebagai customer Wavy
      toast.error(err instanceof ApiError && err.status === 404 ? tTickets("transferRecipientNotFound") : errorMessage(err));
    } finally {
      setTransferLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </Link>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Dompet Tiket Saya (Wavy Wallet)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Semua e-tiket resmi Anda tersimpan aman dengan QR code terenkripsi.
            </p>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        ) : ticketsRes.error ? (
          <ErrorState error={ticketsRes.error} onRetry={ticketsRes.reload} />
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white py-16 text-center">
            <TicketIcon className="h-14 w-14 text-muted-foreground/80" />
            <h3 className="mt-3 text-lg font-bold text-foreground">Dompet Tiket Anda Kosong</h3>
            <p className="mt-1 text-sm text-muted-foreground">Anda belum memiliki tiket konser aktif saat ini.</p>
            <Link
              href="/concerts"
              className="mt-5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow hover:brightness-110"
            >
              Jelajahi Konser Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {tickets.map((ticket) => {
              const dateStr = new Date(ticket.date).toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={ticket.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-lg md:flex-row"
                >
                  {/* Left Ticket Info */}
                  <div className="flex-1 p-6 sm:p-8 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-white">
                        {ticket.category}
                      </span>
                      {ticket.is_scanned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Sudah Digunakan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Tiket Aktif / Siap Pakai
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                        {ticket.title}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-foreground" />
                          <span>{ticket.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground/80">
                      ID Tiket: <span className="font-mono font-bold text-foreground">#{ticket.id}</span>
                    </div>
                  </div>

                  {/* Cutout Divider (Ticket perforation style) */}
                  <div className="relative hidden w-0 border-r-2 border-dashed border-border md:block">
                    <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-surface" />
                    <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-surface" />
                  </div>

                  {/* Right Actions / QR Preview */}
                  <div className="flex shrink-0 flex-col justify-center gap-3 border-t border-border bg-surface p-6 md:w-64 md:border-t-0 md:p-8">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-xs font-bold text-white shadow transition-all hover:bg-black"
                    >
                      <QrCode className="h-4 w-4" />
                      Tampilkan QR Code
                    </button>

                    {!ticket.is_scanned && (
                      <button
                        onClick={() => setTransferModal(ticket)}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-2.5 text-xs font-bold text-foreground hover:border-primary/50"
                      >
                        <Send className="h-3.5 w-3.5 text-primary" />
                        Transfer Tiket
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Gate Access Pass
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">{selectedTicket.title}</h3>
              <p className="text-xs text-muted-foreground/80">{selectedTicket.category}</p>
            </div>

            <TicketQr code={selectedTicket.qr_code} used={selectedTicket.is_scanned} />

            <div className="rounded-xl bg-surface p-3 text-xs text-muted-foreground space-y-1">
              <p>Tunjukkan QR Code ini kepada petugas scan gate tiket konser saat check-in.</p>
              <p className="text-[10px] text-muted-foreground/80">ID Tiket: #{selectedTicket.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ticket Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setTransferModal(null)}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Transfer Kepemilikan Tiket</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Pindahkan tiket <strong>{transferModal.title}</strong> ke email akun customer lain secara resmi.
              </p>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-foreground">Email Penerima Tiket</label>
                <input
                  type="email"
                  required
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="contoh: kawan@gmail.com"
                  className="mt-1 w-full rounded-2xl border border-border p-3 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="rounded-2xl bg-amber-50 p-3 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold">Perhatian Penting:</p>
                <p>Setelah ditransfer, tiket akan langsung berpindah ke akun penerima dan QR tiket lama Anda akan otomatis dinonaktifkan.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModal(null)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {transferLoading ? "Mentransfer..." : "Kirim Tiket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
