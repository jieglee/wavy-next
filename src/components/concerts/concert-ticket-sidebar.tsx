import { forwardRef } from "react";
import type { TicketCategory } from "@/types/type";

interface Props {
  categories: TicketCategory[];
  selectedCategory: TicketCategory | null;
  onSelectCategory: (cat: TicketCategory) => void;
  quantity: number;
  onQuantityChange: (n: number) => void;
  onCheckout: () => void;
}

const ConcertTicketSidebar = forwardRef<HTMLDivElement, Props>(
  ({ categories, selectedCategory, onSelectCategory, quantity, onQuantityChange, onCheckout }, ref) => {
    return (
      <div className="lg:col-span-1" ref={ref}>
        <div className="sticky top-24 rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-xl space-y-6">
          <h2 className="font-display text-lg font-bold text-[#1B1A3A]">Pilih Kategori Tiket</h2>

          <div className="space-y-3">
            {categories?.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const isSoldOut = cat.remaining !== undefined && cat.remaining <= 0;
              const priceNum = Number(cat.price);

              return (
                <div
                  key={cat.id}
                  onClick={() => !isSoldOut && onSelectCategory(cat)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-[#FF5470] bg-[#FF5470]/5 shadow-sm"
                      : isSoldOut
                      ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      : "border-[#EDEBF2] hover:border-[#1B1A3A]/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#1B1A3A]">{cat.name}</p>
                      <p className="font-mono text-base font-extrabold text-[#FF5470]">Rp{priceNum.toLocaleString("id-ID")}</p>
                    </div>
                    {isSoldOut ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">Habis</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#8B889C]">Sisa {cat.remaining ?? cat.quota - cat.sold}</span>
                    )}
                  </div>
                  {cat.benefits && (
                    <p className="mt-2 border-t border-[#EDEBF2] pt-2 text-[11px] leading-relaxed text-[#6B6875]">{cat.benefits}</p>
                  )}
                </div>
              );
            })}
          </div>

          {selectedCategory && (
            <div className="flex items-center justify-between border-t border-[#EDEBF2] pt-4">
              <span className="text-xs font-bold text-[#1B1A3A]">Jumlah Tiket (Maks 4)</span>
              <div className="flex items-center gap-3">
                <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEBF2] text-base font-bold text-[#1B1A3A] hover:bg-gray-100">-</button>
                <span className="font-mono font-bold text-sm">{quantity}</span>
                <button onClick={() => onQuantityChange(Math.min(4, quantity + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEBF2] text-base font-bold text-[#1B1A3A] hover:bg-gray-100">+</button>
              </div>
            </div>
          )}

          {selectedCategory && (
            <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#EDEBF2] space-y-1">
              <div className="flex justify-between text-xs text-[#6B6875]"><span>Harga Satuan</span><span>Rp{Number(selectedCategory.price).toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between text-xs text-[#6B6875]"><span>Jumlah</span><span>x {quantity}</span></div>
              <div className="border-t border-[#EDEBF2] pt-2 flex justify-between font-bold text-sm text-[#1B1A3A]">
                <span>Total Pembayaran</span>
                <span className="font-mono text-base text-[#FF5470]">Rp{(Number(selectedCategory.price) * quantity).toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}

          <button
            onClick={onCheckout}
            disabled={!selectedCategory}
            className="w-full rounded-2xl bg-[#FF5470] py-4 text-center text-sm font-extrabold text-white shadow-lg transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
          >
            Masuk Antrean & Beli Tiket
          </button>

          <p className="text-center text-[11px] text-[#8B889C]">Sistem Smart Queue Wavy menjamin antrean tiket yang adil & transparan.</p>
        </div>
      </div>
    );
  }
);
ConcertTicketSidebar.displayName = "ConcertTicketSidebar";
export default ConcertTicketSidebar;