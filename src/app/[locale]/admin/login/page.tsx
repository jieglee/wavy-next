"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Lock, Mail, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiPost, setAuthToken } from "@/lib/api";

export default function AdminLoginPage() {
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
        admin: { id: number; name: string; email: string };
      }>("/admin/login", { email, password });

      setAuthToken(res.access_token, "admin", res.admin);
      toast.success(`Selamat datang, Super Admin ${res.admin.name}!`);
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Email atau password admin salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#14131C] text-white">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <WavyIcon size={32} />
              <span className="font-display text-2xl font-bold tracking-tight">Wavy Admin</span>
            </Link>
            <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5470]/20 text-[#FF5470]">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-extrabold">Login Super Admin</h1>
            <p className="text-xs text-white/60">Akses panel kontrol sistem & manajemen platform Wavy.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-white/90">Email Admin</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 focus-within:border-[#FF5470]">
                <Mail className="h-4 w-4 text-white/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wavy.test"
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-white/90">Kata Sandi</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 focus-within:border-[#FF5470]">
                <Lock className="h-4 w-4 text-white/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#FF5470] py-3.5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Panel Admin"}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
