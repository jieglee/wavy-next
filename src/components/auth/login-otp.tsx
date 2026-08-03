"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Step = "email" | "otp";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

// TODO: ganti isi 2 fungsi ini pas backend udah siap
async function sendOtp(email: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 900));
    console.log("OTP dikirim ke", email);
}

async function verifyOtp(email: string, otp: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 900));
    return otp === "123456"; // dummy, hapus pas connect backend asli
}

export default function LoginOtpCard() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendIn, setResendIn] = useState(0);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault();
        if (!emailValid) {
            setError("Masukkan email yang valid.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await sendOtp(email);
            setStep("otp");
            setResendIn(RESEND_SECONDS);
            setTimeout(() => inputsRef.current[0]?.focus(), 100);
        } catch {
            setError("Gagal mengirim OTP. Coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    function handleOtpChange(index: number, value: string) {
        if (!/^[0-9]?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        setError("");
        if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    }

    function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    }

    function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        e.preventDefault();
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((d, i) => (next[i] = d));
        setOtp(next);
        inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    }

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < OTP_LENGTH) {
            setError("Masukkan 6 digit kode OTP.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const ok = await verifyOtp(email, code);
            if (!ok) {
                setError("Kode OTP salah atau kedaluwarsa.");
                return;
            }
            // TODO: redirect setelah login berhasil
            console.log("Login berhasil untuk", email);
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (resendIn > 0) return;
        setLoading(true);
        try {
            await sendOtp(email);
            setResendIn(RESEND_SECONDS);
            setOtp(Array(OTP_LENGTH).fill(""));
            inputsRef.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Panel kiri: full-bleed, dekorasi lingkaran */}
            <div className="relative hidden w-[55%] items-center justify-center overflow-hidden bg-wavy-accent md:flex">
                {/* Lingkaran konsentris dekoratif */}
                <div className="pointer-events-none absolute -bottom-1/3 -left-1/4 h-[140%] w-[140%] rounded-full bg-white/[0.06]" />
                <div className="pointer-events-none absolute -bottom-1/4 -left-[10%] h-[110%] w-[110%] rounded-full bg-white/[0.07]" />
                <div className="pointer-events-none absolute -bottom-[10%] left-[10%] h-[80%] w-[80%] rounded-full bg-white/[0.08]" />

                <div className="relative z-10 flex items-center gap-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M3 15 Q6 8, 9 15 T15 15 T21 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <circle cx="19" cy="6" r="2.2" fill="white" />
                    </svg>
                    <span className="font-display text-4xl font-bold tracking-tight text-white">Wavy</span>
                </div>
            </div>

            {/* Panel kanan: form */}
            <div className="flex w-full items-center bg-wavy-bg px-8 sm:px-16 md:w-[45%] md:px-20">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex items-center justify-between md:hidden">
                        <div className="flex items-center gap-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M3 15 Q6 8, 9 15 T15 15 T21 15" stroke="#FF5470" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                                <circle cx="19" cy="6" r="2.2" fill="#FF5470" />
                            </svg>
                            <span className="font-display text-lg font-bold tracking-tight text-wavy-text-primary">Wavy</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === "email" ? (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="mb-6 flex items-center gap-2">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 15 Q6 8, 9 15 T15 15 T21 15" stroke="#FF5470" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                                        <circle cx="19" cy="6" r="2.2" fill="#FF5470" />
                                    </svg>
                                    <span className="font-display text-xl font-bold tracking-tight text-wavy-text-primary">Wavy</span>
                                </div>
                                <h1 className="font-display text-2xl font-bold text-wavy-text-primary">
                                    Selamat datang kembali!
                                </h1>
                                <p className="mt-2 text-sm text-wavy-text-secondary">
                                    Masukkan email untuk lanjut ke akun kamu.
                                </p>

                                <form onSubmit={handleSendOtp} className="mt-8 flex flex-col gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-wavy-text-primary">Email</label>
                                        <input
                                            type="email"
                                            autoFocus
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError("");
                                            }}
                                            className="w-full rounded-lg bg-wavy-surface px-4 py-3 text-sm text-wavy-text-primary placeholder:text-wavy-text-secondary/60 outline-none focus:ring-2 focus:ring-wavy-accent"
                                        />
                                    </div>

                                    {error && <p className="text-xs text-red-400">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading || !emailValid}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-wavy-accent py-3.5 text-sm font-semibold text-wavy-bg transition-colors hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        {loading ? "Mengirim..." : "Lanjutkan"}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.25 }}
                            >
                                <button
                                    onClick={() => {
                                        setStep("email");
                                        setOtp(Array(OTP_LENGTH).fill(""));
                                        setError("");
                                    }}
                                    className="mb-4 flex items-center gap-1 text-xs text-wavy-text-secondary hover:text-wavy-text-primary"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Ganti email
                                </button>

                                <h1 className="font-display text-2xl font-bold text-wavy-text-primary">Masukkan Kode OTP</h1>
                                <p className="mt-2 text-sm text-wavy-text-secondary">
                                    Kode 6 digit sudah dikirim ke <span className="font-mono text-wavy-text-primary">{email}</span>
                                </p>

                                <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
                                    <div className="flex justify-between gap-2">
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => {
                                                    inputsRef.current[i] = el;
                                                }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                onPaste={handleOtpPaste}
                                                className="h-12 w-10 rounded-lg bg-wavy-surface text-center font-mono text-lg text-wavy-text-primary outline-none focus:ring-2 focus:ring-wavy-accent"
                                            />
                                        ))}
                                    </div>

                                    {error && <p className="text-xs text-red-400">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-wavy-accent py-3.5 text-sm font-semibold text-wavy-bg transition-colors hover:brightness-110 disabled:opacity-60"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendIn > 0 || loading}
                                        className="text-xs text-wavy-text-secondary disabled:opacity-50"
                                    >
                                        {resendIn > 0 ? `Kirim ulang dalam ${resendIn}s` : "Kirim ulang kode"}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}