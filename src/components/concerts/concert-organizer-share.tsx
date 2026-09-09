import { Copy, MessageCircle, Link2 } from "lucide-react";
import toast from "react-hot-toast";

function getUrl() {
  return typeof window !== "undefined" ? window.location.href : "";
}

export default function ConcertOrganizerShare({ eventTitle, inline }: { eventTitle?: string; inline?: boolean }) {
  const url = getUrl();
  const title = eventTitle || "Event di Wavy";
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link event disalin");
  };

  const content = (
    <>
      <h2 className="text-[15px] font-bold text-[#111827]">Bagikan Event</h2>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={handleCopy} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#111827]" aria-label="Salin link">
          <Copy className="h-4 w-4" />
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white" aria-label="WhatsApp">
          <MessageCircle className="h-4 w-4" />
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-sm font-bold text-white" aria-label="Facebook">f</a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${url}`)}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white" aria-label="X">𝕏</a>
      </div>
    </>
  );

  // When used inside sidebar card, render without wrapper
  if (inline) {
    return <div>{content}</div>;
  }

  // Standalone (mobile) — with card wrapper
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      {content}
    </section>
  );
}
