import { redirect } from "@/i18n/navigation";
import { SHOW_TRAVELER_MODE } from "@/lib/features";
import HotelDetailPage from "./hotel-detail";

export default async function HotelPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;

  if (!SHOW_TRAVELER_MODE) {
    redirect({ href: "/", locale });
  }

  return <HotelDetailPage params={Promise.resolve({ id })} />;
}
