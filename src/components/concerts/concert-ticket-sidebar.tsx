import { forwardRef } from "react";
import { Minus, Plus, Ticket } from "lucide-react";
import type { TicketCategory } from "@/types/type";
import { formatIDR } from "@/lib/price";

type TicketSidebarProps = {
  categories: TicketCategory[];
  selectedCategory: TicketCategory | null;
  onSelectCategory: (c: TicketCategory) => void;
  quantity: number;
  onQuantityChange: (n: number) => void;
  onCheckout: () => void;
};

const ConcertTicketSidebar = forwardRef<HTMLDivElement, TicketSidebarProps>((props, ref) => {
  const { categories, selectedCategory, onSelectCategory, quantity, onQuantityChange, onCheckout } = props;
  return (
    <section id="sec-ticket" className="scroll-mt-[140px] rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#111827]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1E40AF]">
            <Ticket className="h-4 w-4" />
          </span>
          Pilih Tiket
        </h2>
        <p className="mt-1 text-xs text-[#6B7280]">Kategori tempat duduk bernomor. Harga belum termasuk pajak & fee.</p>
      </div>

      <div ref={ref} className="space-y-3 p-4">
        {categories?.map((cat) => {
          const isSelected = selectedCategory?.id === cat.id;
          const isSoldOut = cat.remaining !== undefined && cat.remaining <= 0;
          const stock = cat.remaining ?? cat.quota - cat.sold;
          return (
            <button
              key={cat.id}
              type="button"
              disabled={isSoldOut}
              onClick={() => !isSoldOut && onSelectCategory(cat)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                isSelected
                  ? "border-[#1E40AF] bg-[#EFF6FF] shadow-sm"
                  : isSoldOut
                    ? "cursor-not-allowed border-[#E5E7EB] bg-[#F9FAFB] opacity-60"
                    : "border-[#E5E7EB] bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFF]"
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-[#1E40AF] bg-[#1E40AF]" : "border-[#D1D5DB] bg-white"}`}>
                {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold leading-tight text-[#111827]">{cat.name}</span>
                {cat.benefits ? <span className="mt-0.5 line-clamp-1 block text-[11px] text-[#6B7280]">{cat.benefits}</span> : null}
                <span className="mt-0.5 block text-[11px] font-medium text-[#6B7280]">{isSoldOut ? "Habis" : `Sisa ${stock} tiket`}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[14px] font-bold text-[#111827]">{formatIDR(Number(cat.price))}</span>
                {isSoldOut && <span className="text-[11px] font-bold text-red-600">Habis</span>}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#374151]">Jumlah tiket</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6]"
                aria-label="Kurangi"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-7 text-center text-sm font-bold text-[#111827]">{quantity}</span>
              <button
                onClick={() => onQuantityChange(Math.min(4, quantity + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6]"
                aria-label="Tambah"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#E5E7EB] pt-3">
            <span className="text-xs text-[#6B7280]">Total</span>
            <span className="text-[18px] font-extrabold text-[#1E40AF]">{formatIDR(Number(selectedCategory.price) * quantity)}</span>
          </div>
          <p className="mt-1 text-right text-[11px] text-[#9CA3AF]">Maks. 4 tiket / transaksi</p>
        </div>
      )}

      <div className="p-4 pt-0">
        <button
          onClick={onCheckout}
          disabled={!selectedCategory}
          className="mt-3 flex w-full items-center justify-center rounded-full bg-[#1E40AF] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Beli Tiket
        </button>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-[#9CA3AF]">Dengan melanjutkan, kamu setuju dengan Syarat & Ketentuan. Harga belum termasuk pajak & platform fee.</p>
      </div>
    </section>
  );
});
ConcertTicketSidebar.displayName = "ConcertTicketSidebar";
export default ConcertTicketSidebar;
