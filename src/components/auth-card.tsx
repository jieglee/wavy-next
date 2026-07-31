"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconUser, IconLock, IconMail } from "@tabler/icons-react";

type Mode = "login" | "register";
type Phase = "idle" | "covering" | "settling";

const COVER_DURATION = 0.45; // pink expand nutupin semua
const SETTLE_DURATION = 0.55; // pink ngerut ke sisi baru

export default function AuthCard({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  // pas idle pakai `mode`, pas lagi covering/settling pakai `pendingMode` buat nentuin sisi tujuan
  const activeMode = phase === "idle" ? mode : pendingMode ?? mode;
  const panelSide = activeMode === "login" ? "right" : "left"; // login -> pink kanan, register -> pink kiri

  function requestSwitch(newMode: Mode) {
    if (phase !== "idle" || newMode === mode) return;
    setPendingMode(newMode);
    setPhase("covering");
  }

  const panelTarget =
    phase === "covering"
      ? { left: "0%", width: "100%" }
      : panelSide === "right"
      ? { left: "50%", width: "50%" }
      : { left: "0%", width: "50%" };

  const clipPath =
    phase === "covering"
      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)" // pas nutup semua, jadi kotak rata (gasempet diagonal)
      : panelSide === "right"
      ? "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)"
      : "polygon(0 0, 85% 0, 100% 100%, 0% 100%)";

  const formLeft = panelSide === "right" ? "0%" : "50%";

  return (
    <div className="flex min-h-screen items-center justify-center bg-wavy-bg px-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-wavy-surface shadow-[0_0_60px_rgba(255,84,112,0.25)]">
        <div className="relative min-h-[420px]">
          {/* PANEL PINK */}
          <motion.div
            className="absolute inset-y-0 z-20 flex items-center justify-center p-10"
            style={{ background: "linear-gradient(135deg, #FF5470 0%, #C6395A 100%)" }}
            animate={{
              left: panelTarget.left,
              width: panelTarget.width,
              clipPath,
              rotateZ: phase === "covering" ? [0, -5, 0] : 0, // efek "muter" pas expand
            }}
            transition={{
              duration: phase === "covering" ? COVER_DURATION : SETTLE_DURATION,
              ease: [0.76, 0, 0.24, 1],
            }}
            onAnimationComplete={() => {
              if (phase === "covering" && pendingMode) {
                setMode(pendingMode); // konten form ikut ganti pas panel lagi nutup penuh
                setPhase("settling");
              } else if (phase === "settling") {
                setPhase("idle");
                setPendingMode(null);
              }
            }}
          >
            {/* konten pink cuma keliatan pas idle; begitu klik, dia exit turun+fade duluan sebelum panel expand */}
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.25 }}
                  className="text-center text-wavy-bg"
                >
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    {mode === "login" ? "Welcome Back!" : "Halo, Pencari Konser!"}
                  </h2>
                  <p className="mt-3 text-sm text-wavy-bg/80">
                    {mode === "login"
                      ? "Masuk buat lanjutin war tiket favorit lo."
                      : "Daftar sekarang, jangan sampe kehabisan tiket."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FORM */}
          <motion.div
            className="absolute inset-y-0 z-10 w-1/2 p-10"
            animate={{ left: formLeft }}
            transition={{
              duration: phase === "covering" ? COVER_DURATION : SETTLE_DURATION,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h1 className="font-display text-2xl font-bold text-wavy-text-primary">
                    {mode === "login" ? "Login" : "Sign Up"}
                  </h1>

                  <div className="mt-8 flex flex-col gap-6">
                    <Field icon={<IconUser className="h-4 w-4" />} label="Username" />
                    {mode === "register" && (
                      <Field icon={<IconMail className="h-4 w-4" />} label="Email" type="email" />
                    )}
                    <Field icon={<IconLock className="h-4 w-4" />} label="Password" type="password" />
                  </div>

                  <button className="mt-8 w-full rounded-lg bg-wavy-accent py-3 text-sm font-semibold text-wavy-bg transition-colors hover:brightness-110">
                    {mode === "login" ? "Login" : "Sign Up"}
                  </button>

                  <p className="mt-4 text-center text-sm text-wavy-text-secondary">
                    {mode === "login" ? (
                      <>
                        Belum punya akun?{" "}
                        <button
                          onClick={() => requestSwitch("register")}
                          className="font-semibold text-wavy-accent hover:underline"
                        >
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        Udah punya akun?{" "}
                        <button
                          onClick={() => requestSwitch("login")}
                          className="font-semibold text-wavy-accent hover:underline"
                        >
                          Login
                        </button>
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-wavy-border pb-2 focus-within:border-wavy-accent">
      <input
        type={type}
        placeholder={label}
        className="w-full bg-transparent text-sm text-wavy-text-primary placeholder:text-wavy-text-secondary focus:outline-none"
      />
      <span className="text-wavy-text-secondary">{icon}</span>
    </div>
  );
}