import { PublicVideoConsultationRoom } from "@/components/telemed/PublicVideoConsultationRoom";
import { telemedMetadata } from "@/components/telemed/telemed-metadata";

export const generateMetadata = telemedMetadata("room");

export default async function PublicMeetingRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <PublicVideoConsultationRoom roomId={roomId} />;
}
