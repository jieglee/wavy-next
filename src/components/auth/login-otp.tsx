"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { apiPost, ApiError, setAuthToken, setAuthUser } from "@/lib/api";
import { NAME_MAX, nameError, updateProfile } from "@/lib/profile";
import { useErrorMessage } from "@/lib/error-message";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { LocaleToggle } from "@/components/i18n/locale-switcher";
import { WavyIconAnimated } from "../landing/wavy-icon-animated";

// satu alur masuk/daftar: email -> OTP -> (akun baru / nama kosong) isi nama
type Step = "email" | "otp" | "name";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

interface VerifyResult {
    access_token: string;
    customer: { id: number; name: string | null; email: string };
    needs_name: boolean;
}

async function sendOtp(email: string): Promise<void> {
    await apiPost("/auth/send-otp", { email });
}

async function verifyOtp(email: string, otp: string): Promise<VerifyResult | null> {
    try {
        const res = await apiPost<VerifyResult>("/auth/verify-otp", { email, code: otp });
        setAuthToken(res.access_token, "customer", res.customer);
        await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: res.access_token, customer: res.customer }),
        });
        return res;
    } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
    }
}

export default function LoginOtpCard() {
    const t = useTranslations("Auth");
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendIn, setResendIn] = useState(0);
    const [name, setName] = useState("");
    const errorMessage = useErrorMessage();
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const [showBrandName, setShowBrandName] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowBrandName(true), 500);
        return () => clearTimeout(timer);
    }, []);

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault();
        if (!emailValid) {
            setError(t("invalidEmail"));
            return;
        }
        setError("");
        setLoading(true);
        try {
            await sendOtp(email);
            toast.success(t("otpSentToast"));
            setStep("otp");
            setResendIn(RESEND_SECONDS);
            setTimeout(() => inputsRef.current[0]?.focus(), 100);
        } catch {
            setError(t("otpSendFailed"));
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
            setError(t("invalidOtp"));
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await verifyOtp(email, code);
            if (!res) {
                setError(t("otpWrong"));
                return;
            }
            if (res.needs_name) {
                setStep("name");
                return;
            }
            toast.success(t("loginSuccess"));
            router.replace("/home");
        } catch {
            setError(t("otpVerifyFailed"));
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveName(e: React.FormEvent) {
        e.preventDefault();
        const invalid = nameError(name);
        if (invalid) {
            setError(t(invalid, { max: NAME_MAX }));
            return;
        }
        setError("");
        setLoading(true);
        try {
            const profile = await updateProfile({ name: name.trim() });
            setAuthUser({ id: profile.id, name: profile.name, email: profile.email });
            toast.success(t("welcomeNew", { name: profile.name ?? "" }));
            router.replace("/home");
        } catch (err) {
            setError(errorMessage(err));
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
        } catch {
            setError(t("otpSendFailed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Panel kiri: full-bleed, background foto */}
            <div
                className="relative hidden w-[55%] items-center justify-center overflow-hidden md:flex"
                style={{ backgroundImage: "url(/images/login-otp.png)", backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <motion.div layout className="relative z-10 flex items-center gap-3">
                    <motion.div layout transition={{ duration: 0.6, ease: "easeOut" }}>
                        <WavyIconAnimated
                            size={48}
                            color="var(--primary-foreground)"
                            drawDuration={1.1}
                            onFirstDrawComplete={() => setShowBrandName(true)}
                        />
                    </motion.div>
                    <AnimatePresence>
                        {showBrandName && (
                            <motion.span
                                key="brand-name"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-lg"
                            >
                                Wavy
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Panel kanan: form */}
            <div className="flex w-full flex-col bg-background px-8 sm:px-16 md:w-[45%] md:px-20">
                <div className="flex items-center justify-between gap-3 pt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        {t("back")}
                    </button>
                    <LocaleToggle />
                </div>
                <div className="flex flex-1 items-center">
                    <div className="w-full max-w-sm pb-10">

                    <div className="mb-8 flex items-center justify-between md:hidden">
                        <div className="flex items-center gap-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M3 15 Q6 8, 9 15 T15 15 T21 15" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                                <circle cx="19" cy="6" r="2.2" fill="var(--primary)" />
                            </svg>
                            <span className="font-display text-lg font-bold tracking-tight text-foreground">Wavy</span>
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
                                    <WavyIcon size={28} />
                                    <span className="font-display text-xl font-bold tracking-tight text-foreground">Wavy</span>
                                </div>
                                <h1 className="font-display text-2xl font-bold text-foreground">
                                    {t("welcomeBack")}
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t("emailPrompt")}
                                </p>

                                <form onSubmit={handleSendOtp} className="mt-8 flex flex-col gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("emailLabel")}</label>
                                        <input
                                            type="email"
                                            autoFocus
                                            placeholder={t("emailPlaceholder")}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError("");
                                            }}
                                            className="w-full rounded-lg bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    {error && <p className="text-xs text-destructive">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading || !emailValid}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        {loading ? t("sending") : t("continue")}
                                    </button>
                                </form>
                            </motion.div>
                        ) : step === "name" ? (
                            <motion.div
                                key="name"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h1 className="font-display text-2xl font-bold text-foreground">{t("nameTitle")}</h1>
                                <p className="mt-2 text-sm text-muted-foreground">{t("namePrompt")}</p>

                                <form onSubmit={handleSaveName} className="mt-8 flex flex-col gap-4" noValidate>
                                    <div>
                                        <label htmlFor="customer-name" className="mb-1.5 block text-sm font-medium text-foreground">
                                            {t("nameLabel")}
                                        </label>
                                        <input
                                            id="customer-name"
                                            autoFocus
                                            autoComplete="name"
                                            maxLength={NAME_MAX}
                                            placeholder={t("namePlaceholder")}
                                            value={name}
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                setError("");
                                            }}
                                            aria-invalid={!!error}
                                            aria-describedby={error ? "customer-name-error" : undefined}
                                            className="w-full rounded-lg bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    {error && (
                                        <p id="customer-name-error" role="alert" className="text-xs text-destructive">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !name.trim()}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        {loading ? t("saving") : t("nameSubmit")}
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
                                    className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    {t("changeEmail")}
                                </button>

                                <h1 className="font-display text-3xl font-bold text-foreground">
                                    {t("enterOtpTitle")}
                                </h1>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {t("otpPrompt")}
                                    <br />
                                    <span className="font-semibold text-primary">{email}</span>
                                </p>

                                <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
                                    <div className="flex gap-2 sm:gap-3">
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
                                                aria-label={t("otpDigit", { n: i + 1 })}
                                                className="h-14 w-full min-w-0 flex-1 rounded-xl border-2 border-border bg-transparent text-center font-mono text-xl text-foreground outline-none transition-colors focus:border-primary"
                                            />
                                        ))}
                                    </div>

                                    {error && <p className="text-xs text-destructive">{error}</p>}

                                    <p className="text-sm text-muted-foreground">
                                        {t("noOtpReceived")}{" "}
                                        {resendIn > 0 ? (
                                            <span className="font-semibold text-primary">
                                                {t("resendIn", { count: resendIn })}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                disabled={loading}
                                                className="font-semibold text-primary hover:underline disabled:opacity-50"
                                            >
                                                {t("resendButton")}
                                            </button>
                                        )}
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-60"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        {loading ? t("verifying") : t("signIn")}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                </div>
            </div>
        </div>
    );
}