// Baris kategori konser: category, lalu genre artis hanya kalau berbeda (tanpa beda huruf besar/kecil).
// Tidak ada fallback: field kosong tidak ditampilkan.
export function categoryLabels(category?: string | null, genre?: string | null): string[] {
  const cat = category?.trim() ?? "";
  const gen = genre?.trim() ?? "";
  const labels = cat ? [cat] : [];
  if (gen && gen.toLowerCase() !== cat.toLowerCase()) labels.push(gen);
  return labels;
}
