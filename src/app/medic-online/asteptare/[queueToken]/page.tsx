import { OnCallQueueLauncher } from "@/components/telemed/OnCallQueueLauncher";
import { telemedMetadata } from "@/components/telemed/telemed-metadata";

export const generateMetadata = telemedMetadata("waiting");

export default async function OnCallQueuePage({ params }: { params: Promise<{ queueToken: string }> }) {
  const { queueToken } = await params;
  return (
    <div className="min-h-screen bg-background">
      <OnCallQueueLauncher queueToken={queueToken} />
    </div>
  );
}
