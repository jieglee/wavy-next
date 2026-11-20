import { Copy, MessageCircle, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

function getUrl() {
  return typeof window !== "undefined" ? window.location.href : "";
}

export default function ConcertOrganizerShare({ eventTitle, inline }: { eventTitle?: string; inline?: boolean }) {
  const t = useTranslations("ConcertDetail.share");
  const url = getUrl();
  const title = eventTitle || t("fallbackTitle");
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  const content = (
    <>
      <h2 className="text-[15px] font-bold text-foreground">{t("title")}</h2>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={handleCopy} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground/85 hover:border-foreground" aria-label={t("copy")}>
          <Copy className="h-4 w-4" />
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white" aria-label="WhatsApp">
          <MessageCircle className="h-4 w-4" />
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-sm font-bold text-white" aria-label="Facebook">f</a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${url}`)}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background" aria-label="X">𝕏</a>
      </div>
    </>
  );

  // When used inside sidebar card, render without wrapper
  if (inline) {
    return <div>{content}</div>;
  }

  // Standalone (mobile) — with card wrapper
  return (
    <section className="rounded-2xl border border-border bg-background p-5 sm:p-6">
      {content}
    </section>
  );
}
