import { Clock, Bell } from "lucide-react";

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

export default function ConcertCountdown({
  countdown,
  isNotified,
  onNotify,
}: {
  countdown: Countdown;
  isNotified: boolean;
  onNotify: () => void;
}) {
  const total = countdown.days + countdown.hours + countdown.minutes + countdown.seconds;
  if (total <= 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#1E40AF] md:inline-flex">
        <Clock className="h-3.5 w-3.5" />
        <span className="tabular-nums">
          {countdown.days}h {String(countdown.hours).padStart(2, "0")}j {String(countdown.minutes).padStart(2, "0")}m {String(countdown.seconds).padStart(2, "0")}d
        </span>
      </span>
      <button
        onClick={onNotify}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
          isNotified ? "bg-emerald-600 text-white" : "border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#1E40AF] hover:text-[#1E40AF]"
        }`}
      >
        <Bell className="h-3.5 w-3.5" />
        {isNotified ? "Aktif" : "Ingatkan Saya"}
      </button>
    </div>
  );
}
