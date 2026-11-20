import type { SalesStatus } from "@/types/type";
import { useSalesText } from "@/hooks/use-sales-text";

const tone: Record<SalesStatus, string> = {
  open: "bg-success/10 text-success",
  sold_out: "bg-destructive/10 text-destructive",
  upcoming: "bg-warning/10 text-warning",
  closed: "bg-muted text-muted-foreground",
};

export default function SalesBadge({ status }: { status: SalesStatus }) {
  const sales = useSalesText();
  return (
    <span className={`shrink-0 rounded-md px-3 py-1 text-[12px] font-medium ${tone[status]}`}>{sales.badge(status)}</span>
  );
}
