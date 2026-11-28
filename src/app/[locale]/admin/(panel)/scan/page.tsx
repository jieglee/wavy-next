"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Camera, CameraOff, CheckCircle2, Keyboard, XCircle } from "lucide-react";
import type QrScannerType from "qr-scanner";
import { adminPost } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import { formatWib } from "@/lib/backoffice";
import { useAdminError } from "@/hooks/use-admin-error";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { btn, inputCls, labelCls } from "@/components/admin/admin-ui";

type ScanTicket = { id: number; order_id: number; event_id: number; title: string; date: string; venue: string; category_name?: string };
type Result = { ok: true; ticket: ScanTicket; at: Date } | { ok: false; message: string; at: Date };
type CameraState = "idle" | "starting" | "on" | "denied" | "unavailable";

/** Scan tiket (DESIGN §4: Axial) — kamera di tengah, hasil valid/invalid besar di bawahnya. */
export default function StudioScanPage() {
  const t = useTranslations("Studio.scan");
  const locale = useLocale();
  const adminError = useAdminError();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerType | null>(null);
  const busyRef = useRef(false);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);
  const [camera, setCamera] = useState<CameraState>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [manual, setManual] = useState("");
  const [checking, setChecking] = useState(false);

  const validate = useCallback(
    async (code: string) => {
      const qr = code.trim();
      if (!qr || busyRef.current) return;
      // kamera membaca QR yang sama berkali-kali per detik: abaikan ulangan < 3 detik
      const now = Date.now();
      if (lastCodeRef.current && lastCodeRef.current.code === qr && now - lastCodeRef.current.at < 3000) return;
      lastCodeRef.current = { code: qr, at: now };
      busyRef.current = true;
      setChecking(true);
      let r: Result;
      try {
        const res = await adminPost<{ message: string; ticket: ScanTicket }>("/admin/scan/validate", { qr_code: qr });
        r = { ok: true, ticket: res.ticket, at: new Date() };
        navigator.vibrate?.(80);
      } catch (err) {
        r = { ok: false, message: adminError(err), at: new Date() };
        navigator.vibrate?.([60, 60, 60]);
      }
      setResult(r);
      setHistory((h) => [r, ...h].slice(0, 10));
      setChecking(false);
      busyRef.current = false;
    },
    [adminError]
  );

  async function startCamera() {
    if (!videoRef.current) return;
    setCamera("starting");
    try {
      const { default: QrScanner } = await import("qr-scanner");
      if (!(await QrScanner.hasCamera())) {
        setCamera("unavailable");
        return;
      }
      scannerRef.current?.destroy();
      const scanner = new QrScanner(videoRef.current, (res) => void validate(res.data), {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
      });
      scannerRef.current = scanner;
      await scanner.start();
      setCamera("on");
    } catch {
      // izin ditolak, bukan HTTPS/localhost, atau kamera dipakai aplikasi lain
      setCamera("denied");
    }
  }

  function stopCamera() {
    scannerRef.current?.stop();
    setCamera("idle");
  }

  useEffect(() => () => scannerRef.current?.destroy(), []);

  async function onManual(e: React.FormEvent) {
    e.preventDefault();
    lastCodeRef.current = null;
    await validate(manual);
    setManual("");
  }

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("subtitle")} />

      <div className="mx-auto flex max-w-md flex-col items-stretch gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-stage">
          <video ref={videoRef} className={cn("h-full w-full object-cover", camera !== "on" && "invisible")} muted playsInline />
          {camera !== "on" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <CameraOff className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {camera === "denied" ? t("cameraDenied") : camera === "unavailable" ? t("cameraUnavailable") : t("cameraOff")}
              </p>
              <button type="button" onClick={startCamera} disabled={camera === "starting"} className={btn.primary}>
                <Camera className="h-4 w-4" />
                {camera === "starting" ? t("starting") : t("startCamera")}
              </button>
            </div>
          )}
        </div>
        {camera === "on" && (
          <button type="button" onClick={stopCamera} className={btn.outline}>
            <CameraOff className="h-4 w-4" />
            {t("stopCamera")}
          </button>
        )}

        <div aria-live="assertive" className="min-h-32">
          {checking ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-background text-sm text-muted-foreground" role="status">
              {t("checking")}
            </div>
          ) : result ? (
            <ResultCard result={result} locale={locale} />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center text-sm text-muted-foreground">
              {t("waiting")}
            </div>
          )}
        </div>

        <form onSubmit={onManual} className="rounded-2xl border border-border bg-background p-4">
          <label htmlFor="scan-manual" className={labelCls}>
            <Keyboard className="mr-1 inline h-3.5 w-3.5" />
            {t("manualLabel")}
          </label>
          <div className="flex gap-2">
            <input id="scan-manual" className={`${inputCls} font-mono`} value={manual} onChange={(e) => setManual(e.target.value)} placeholder={t("manualPlaceholder")} autoComplete="off" />
            <button type="submit" disabled={!manual.trim() || checking} className={btn.dark}>
              {t("check")}
            </button>
          </div>
        </form>

        {history.length > 1 && (
          <section>
            <h2 className={labelCls}>{t("history")}</h2>
            <ul className="divide-y divide-border rounded-xl border border-border bg-background">
              {history.slice(1).map((h, i) => (
                <li key={i} className="flex items-center gap-2 px-3 py-2 text-xs">
                  {h.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                  <span className="min-w-0 flex-1 truncate text-foreground">{h.ok ? `${h.ticket.title} · #${h.ticket.id}` : h.message}</span>
                  <span className="font-mono text-muted-foreground">{h.at.toLocaleTimeString(locale === "en" ? "en-GB" : "id-ID")}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function ResultCard({ result, locale }: { result: Result; locale: string }) {
  const t = useTranslations("Studio.scan");
  if (!result.ok)
    return (
      <div role="alert" className="flex flex-col items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="font-display text-2xl font-bold tracking-tight text-destructive">{t("invalid")}</p>
        <p className="text-sm text-foreground">{result.message}</p>
      </div>
    );
  const tk = result.ticket;
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
      <CheckCircle2 className="h-12 w-12 text-success" />
      <p className="font-display text-2xl font-bold tracking-tight text-success">{t("valid")}</p>
      <p className="text-sm font-semibold text-foreground">{tk.title}</p>
      <p className="font-mono text-xs text-muted-foreground">
        {[tk.category_name, `#${tk.id}`, `${t("order")} #${tk.order_id}`].filter(Boolean).join(" · ")}
      </p>
      <p className="font-mono text-xs text-muted-foreground">{formatWib(tk.date, locale)} · {tk.venue}</p>
    </div>
  );
}
