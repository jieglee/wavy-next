"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Lock, Mail, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiPost, setAuthToken } from "@/lib/api";

export default function OrganizerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiPost<{
        access_token: string;
        organizer: { id: number; name: string; email: string };
      }>("/auth/organizer/login", { email, password });

      setAuthToken(res.access_token, "organizer", res.organizer);
      toast.success(`Selamat datang, ${res.organizer.name}!`);
      router.push("/organizer/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FDFCFB]">
      {/* Left Decoration (Brand) */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#1B1A3A] p-12 text-white lg:flex relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at top left, #FF5470 0%, transparent 50%), radial-gradient(circle at bottom right, #7DD3E8 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={32} />
            <span className="font-display text-2xl font-bold tracking-tight">Wavy Organizer</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <span className="rounded-full bg-[#FF5470] px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            Portal Mitra Penyelenggara
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Kelola Penjualan Tiket Konser Anda dengan Mudah & Aman.
          </h1>
          <p className="text-sm text-white/70">
            Dapatkan akses penuh ke analitik real-time, manajemen kuota tiket, verifikasi pembayaran kilat, dan scanner gate terintegrasi.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          &copy; {new Date().getFullYear()} Wavy Event Ecosystem. Seluruh hak cipta dilindungi.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 sm:px-12 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B889C] hover:text-[#1B1A3A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-[#1B1A3A]">
              Masuk Portal Organizer
            </h2>
            <p className="mt-1 text-xs text-[#6B6875]">
              Gunakan kredensial Event Organizer terdaftar Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#1B1A3A]">Email Organizer</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-[#EDEBF2] bg-white px-4 py-3 shadow-sm focus-within:border-[#FF5470]">
                <Mail className="h-4 w-4 text-[#8B889C]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="organizer@test.com"
                  className="w-full bg-transparent text-xs text-[#1B1A3A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1B1A3A]">Kata Sandi</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-[#EDEBF2] bg-white px-4 py-3 shadow-sm focus-within:border-[#FF5470]">
                <Lock className="h-4 w-4 text-[#8B889C]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full bg-transparent text-xs text-[#1B1A3A] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1B1A3A] py-3.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-black active:scale-98 disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </button>
          </form>

          {/* Quick Demo Help */}
          <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#EDEBF2] text-[11px] text-[#6B6875] space-y-1">
            <p className="font-bold text-[#1B1A3A]">Akun Uji Coba EO:</p>
            <p>Email: <code className="text-[#FF5470]">organizer@test.com</code> / <code className="text-[#FF5470]">demo.eo@wavy.test</code></p>
            <p>Password: <code className="text-[#FF5470]">password123</code> / <code className="text-[#FF5470]">demo12345</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
