import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper standar shadcn. Tetap kompatibel dengan pemakaian lama
// cn("a", cond && "b", null, undefined) — clsx mengabaikan nilai falsy,
// tailwind-merge menyelesaikan kelas Tailwind yang bentrok.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
