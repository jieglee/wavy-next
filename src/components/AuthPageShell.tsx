"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, verifyIdentity, resetPasswordByName, loginUser } from "@/lib/auth-api";
import { toast, Toaster } from "@/components/toaster";

interface Props {
    defaultMode?: "login" | "register";
}

const PANEL_GRADIENT = "linear-gradient(135deg, #FF5470 0%, #1B1A3A 100%)";

const WavyIcon = ({ size = 26, className = "" }: { size?: number; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 15 Q6 8, 9 15 T15 15 T21 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="19" cy="6" r="2.2" fill="currentColor" />
    </svg>
);

export default function AuthPageShell({ defaultMode = "login" }: Props) {
    const [mode, setMode] = useState<"login" | "register">(defaultMode);
    const isReg = mode === "register";
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirm, setRegisterConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const router = useRouter();

    const switchTo = (m: "login" | "register") => {
        if (m === mode) return;
        setMode(m);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (isReg) {
                if (registerPassword !== registerConfirm) {
                    toast.error("Konfirmasi kata sandi tidak cocok.");
                    return;
                }
                await registerUser({ name: registerName, email: registerEmail, password: registerPassword });
                toast.success("Registrasi berhasil! Silakan login.");
                setRegisterName(""); setRegisterEmail(""); setRegisterPassword(""); setRegisterConfirm("");
                setTimeout(() => switchTo("login"), 700);
            } else {
                const res = await loginUser(loginEmail, loginPassword);
                if (!res.ok) { toast.error(res.error ?? "Email atau password salah."); return; }
                const role = res.role;
                toast.success("Login berhasil!");
                setLoginEmail(""); setLoginPassword("");
                if (role === "admin" || role === "superadmin") router.replace("/admin");
                else router.replace("/user");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengirim data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
            <div className="relative w-full max-w-3xl h-[500px] overflow-hidden rounded-[1.125rem] border border-[#E5E1DA] bg-white shadow-lg">

                {/* Form wrapper */}
                <div
                    className="absolute bottom-0 top-0 w-1/2 overflow-hidden transition-all duration-[560ms] ease-[cubic-bezier(.77,0,.18,1)]"
                    style={{ left: isReg ? "50%" : "0%" }}
                >
                    <div
                        className="flex h-full w-[200%] transition-transform duration-[560ms] ease-[cubic-bezier(.77,0,.18,1)]"
                        style={{ transform: isReg ? "translateX(-50%)" : "translateX(0)" }}
                    >
                        {/* SLOT LOGIN */}
                        <div className="flex h-full w-1/2 shrink-0 items-center justify-start p-8 translate-x-6">
                            <div className="w-full max-w-65 space-y-4">
                                <Tabs mode={mode} switchTo={switchTo} />
                                <div className="space-y-2">
                                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#FF5470]">Login</p>
                                    <h2 className="text-sm font-semibold text-[#1D1B24]">Selamat datang kembali</h2>
                                    <p className="text-[11px] leading-relaxed text-[#6B6875]">
                                        Gunakan email dan kata sandi yang sudah terdaftar.
                                    </p>
                                </div>
                                <form className="space-y-3" onSubmit={handleSubmit}>
                                    <Field label="Email" type="email" name="email" placeholder="email@domain.com"
                                        value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                                    <Field label="Kata Sandi" type="password" name="password" placeholder="••••••••"
                                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                    <div className="flex items-center justify-between gap-4 text-[10px] text-[#6B6875]">
                                        <label className="inline-flex cursor-pointer items-center gap-1.5">
                                            <input type="checkbox" className="h-3 w-3 accent-[#FF5470]" />
                                            Ingat saya
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgot(true)}
                                            className="cursor-pointer font-medium text-[#FF5470] hover:opacity-70 bg-transparent border-0 p-0 text-[10px]"
                                        >
                                            Lupa kata sandi?
                                        </button>
                                    </div>
                                    <SubmitBtn label="Masuk" loading={loading && !isReg} />
                                    <Note title="Aman dan terpercaya" body="Tiket dan datamu tersimpan aman dalam sistem kami." />
                                </form>
                            </div>
                        </div>

                        {/* SLOT REGISTER */}
                        <div className="flex h-full w-1/2 shrink-0 items-center justify-end p-8 -translate-x-6">
                            <div className="w-full max-w-65 space-y-4">
                                <Tabs mode={mode} switchTo={switchTo} />
                                <div className="space-y-2 text-right">
                                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#FF5470]">Register</p>
                                    <h2 className="text-sm font-semibold text-[#1D1B24]">Buat akun baru</h2>
                                    <p className="text-[11px] leading-relaxed text-[#6B6875]">
                                        Daftar untuk mulai berburu tiket konser favoritmu.
                                    </p>
                                </div>
                                <form className="space-y-3" onSubmit={handleSubmit}>
                                    <Field label="Nama Lengkap" type="text" name="name" placeholder="Nama lengkap"
                                        value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                                    <Field label="Email" type="email" name="email" placeholder="email@domain.com"
                                        value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                                    <Field label="Kata Sandi" type="password" name="password" placeholder="••••••••"
                                        value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                                    <Field label="Konfirmasi Kata Sandi" type="password" name="confirmPassword" placeholder="Ulangi kata sandi"
                                        value={registerConfirm} onChange={(e) => setRegisterConfirm(e.target.value)} />
                                    <SubmitBtn label="Daftar Sekarang" loading={loading && isReg} />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SLIDING PANEL */}
                <div
                    className="absolute bottom-0 top-0 z-20 flex w-1/2 flex-col justify-between overflow-hidden p-10 text-white transition-all duration-[560ms] ease-[cubic-bezier(.77,0,.18,1)]"
                    style={{
                        left: isReg ? "0%" : "50%",
                        background: PANEL_GRADIENT,
                    }}
                >
                    <div className="pointer-events-none absolute inset-0"
                        style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 28px,rgba(255,255,255,.04) 28px,rgba(255,255,255,.04) 56px)" }} />

                    <div className="relative z-10 flex items-center gap-2">
                        <WavyIcon size={24} className="text-white" />
                        <span className="font-display font-extrabold text-[1rem] tracking-[-0.02em]">Wavy</span>
                    </div>

                    <div className="relative z-10">
                        <h2 className="mb-2 text-lg font-medium leading-snug">
                            {isReg ? "Sudah punya akun?" : "Belum punya akun?"}
                        </h2>
                        <p className="max-w-45 text-[11px] leading-7 text-white/65">
                            {isReg
                                ? "Masuk dan lanjutin war tiket konser favoritmu."
                                : "Daftar sekarang, jangan sampai kehabisan tiket."}
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col gap-2">
                        <p className="text-[10px] text-white/40">
                            {isReg ? "Sudah terdaftar?" : "Belum terdaftar?"}
                        </p>
                        <button
                            onClick={() => switchTo(isReg ? "login" : "register")}
                            className="w-fit rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/20"
                        >
                            {isReg ? "Masuk →" : "Daftar →"}
                        </button>
                    </div>
                </div>
            </div>

            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
            <Toaster />
        </div>
    );
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState<"identity" | "reset" | "success">("identity")
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError("")
        try {
            const res = await verifyIdentity(email, name)
            if (res.verified) setStep("reset")
            else setError(res.message ?? "Email dan nama tidak cocok.")
        } catch { setError("Terjadi kesalahan.") }
        finally { setLoading(false) }
    }

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) { setError("Password minimal 6 karakter."); return }
        if (password !== confirm) { setError("Password tidak cocok."); return }
        setLoading(true); setError("")
        try {
            const res = await resetPasswordByName(email, name, password)
            if (res.message?.includes("berhasil")) {
                setStep("success")
                setTimeout(onClose, 2000)
            } else setError(res.message ?? "Gagal mengubah password.")
        } catch { setError("Terjadi kesalahan.") }
        finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-80 max-w-[360px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#E5E1DA] overflow-hidden">
                <div className="h-1" style={{ background: PANEL_GRADIENT }} />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[0.95rem] font-extrabold text-[#1D1B24]">
                            {step === "identity" && "Lupa kata sandi?"}
                            {step === "reset" && "Buat password baru"}
                            {step === "success" && "Berhasil!"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-6 h-6 rounded-full bg-[#F7F4EF] flex items-center justify-center text-[#6B6875] hover:text-[#FF5470] hover:bg-[#FFF0F3] transition-colors border-0 cursor-pointer text-[12px]"
                        >
                            ✕
                        </button>
                    </div>

                    {step === "identity" && (
                        <form onSubmit={handleVerify} className="flex flex-col gap-3">
                            <p className="text-[11px] text-[#6B6875] -mt-1 mb-1">
                                Masukkan email dan nama lengkap yang terdaftar.
                            </p>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[#6B6875]">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                                    placeholder="email@domain.com"
                                    required
                                    className="w-full rounded-lg border border-[#E5E1DA] bg-[#FAFAF8] px-3 py-1.5 text-[11px] text-[#1D1B24] outline-none transition focus:border-[#FF5470] focus:ring-2 focus:ring-[rgba(255,84,112,0.1)]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[#6B6875]">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError("") }}
                                    placeholder="Nama sesuai saat daftar"
                                    required
                                    className="w-full rounded-lg border border-[#E5E1DA] bg-[#FAFAF8] px-3 py-1.5 text-[11px] text-[#1D1B24] outline-none transition focus:border-[#FF5470] focus:ring-2 focus:ring-[rgba(255,84,112,0.1)]"
                                />
                            </div>
                            {error && <p className="text-[10px] text-red-500">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading || !email || !name}
                                className="w-full rounded-lg py-2 text-[11px] font-semibold text-white border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                                style={{ background: PANEL_GRADIENT }}
                            >
                                {loading ? "Memverifikasi..." : "Verifikasi Identitas"}
                            </button>
                        </form>
                    )}

                    {step === "reset" && (
                        <form onSubmit={handleReset} className="flex flex-col gap-3">
                            <p className="text-[11px] text-[#6B6875] -mt-1 mb-1">
                                Untuk akun <span className="font-semibold text-[#1D1B24]">{email}</span>
                            </p>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[#6B6875]">Password Baru</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError("") }}
                                        placeholder="Minimal 6 karakter"
                                        required
                                        className="w-full rounded-lg border border-[#E5E1DA] bg-[#FAFAF8] px-3 py-1.5 pr-8 text-[11px] text-[#1D1B24] outline-none transition focus:border-[#FF5470] focus:ring-2 focus:ring-[rgba(255,84,112,0.1)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6875] hover:text-[#FF5470] border-0 bg-transparent cursor-pointer text-[11px]"
                                    >
                                        {showPw ? "🙈" : "👁"}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-[#6B6875]">Konfirmasi Password</label>
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={confirm}
                                    onChange={(e) => { setConfirm(e.target.value); setError("") }}
                                    placeholder="Ulangi password baru"
                                    required
                                    className="w-full rounded-lg border border-[#E5E1DA] bg-[#FAFAF8] px-3 py-1.5 text-[11px] text-[#1D1B24] outline-none transition focus:border-[#FF5470] focus:ring-2 focus:ring-[rgba(255,84,112,0.1)]"
                                />
                            </div>
                            {confirm && (
                                <p className={`text-[10px] font-semibold ${password === confirm ? "text-emerald-500" : "text-red-400"}`}>
                                    {password === confirm ? "✓ Password cocok" : "✗ Tidak cocok"}
                                </p>
                            )}
                            {error && <p className="text-[10px] text-red-500">{error}</p>}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setStep("identity"); setError(""); setPassword(""); setConfirm("") }}
                                    className="flex-1 rounded-lg py-2 text-[11px] font-semibold text-[#6B6875] border border-[#E5E1DA] bg-white cursor-pointer hover:bg-[#FAFAF8] transition"
                                >
                                    ← Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirm || password !== confirm}
                                    className="flex-1 rounded-lg py-2 text-[11px] font-semibold text-white border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                                    style={{ background: PANEL_GRADIENT }}
                                >
                                    {loading ? "Menyimpan..." : "Simpan Password"}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === "success" && (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 text-2xl">
                                ✓
                            </div>
                            <p className="text-[0.85rem] font-bold text-[#1D1B24] mb-1">Password berhasil diubah!</p>
                            <p className="text-[11px] text-[#6B6875]">Modal akan menutup otomatis...</p>
                        </div>
                    )}

                    {step !== "success" && (
                        <div className="flex items-center justify-center gap-1.5 mt-4">
                            {(["identity", "reset"] as const).map((s) => (
                                <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? "w-5 bg-[#FF5470]" : "w-2.5 bg-[#E5E1DA]"}`} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Tabs({ mode, switchTo }: { mode: "login" | "register"; switchTo: (m: "login" | "register") => void }) {
    return (
        <div className="mb-4 flex gap-1 rounded-lg border border-[#E5E1DA] bg-[#FAFAF8] p-1">
            {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => switchTo(m)}
                    className={`flex-1 rounded-md py-1.5 text-center text-[11px] font-medium transition ${mode === m ? "bg-white text-[#FF5470] shadow-sm" : "text-[#6B6875] hover:text-[#1D1B24]"}`}>
                    {m === "login" ? "Masuk" : "Daftar"}
                </button>
            ))}
        </div>
    );
}

function Field({ label, type, name, placeholder, value, onChange }: {
    label: string; type: string; name: string; placeholder: string;
    value?: string; onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#6B6875]">{label}</label>
            <input type={type} name={name} required placeholder={placeholder} value={value} onChange={onChange}
                className="w-full rounded-lg border border-[#E5E1DA] bg-[#FAFAF8] px-3 py-1.5 text-[11px] text-[#1D1B24] outline-none transition focus:border-[#FF5470] focus:ring-2 focus:ring-[rgba(255,84,112,0.1)]" />
        </div>
    );
}

function SubmitBtn({ label, loading }: { label: string; loading?: boolean }) {
    return (
        <button type="submit" disabled={loading}
            className="w-full rounded-lg py-2 text-[11px] font-semibold text-white transition active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: PANEL_GRADIENT }}>
            {loading ? "Memproses..." : label}
        </button>
    );
}

function Note({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-lg border border-[#E5E1DA] bg-[#FAFAF8] px-3 py-2">
            <p className="text-[10px] font-medium text-[#1D1B24]">{title}</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#6B6875]">{body}</p>
        </div>
    );
}