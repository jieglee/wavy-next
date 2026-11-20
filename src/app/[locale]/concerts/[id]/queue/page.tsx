import { redirect } from "@/i18n/navigation";
import { SHOW_QUEUE } from "@/lib/features";
import WaitingRoomPage from "./waiting-room";

export default async function QueuePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;

  if (!SHOW_QUEUE) {
    redirect({ href: `/concerts/${id}`, locale });
  }

  return <WaitingRoomPage params={Promise.resolve({ id })} />;
}
