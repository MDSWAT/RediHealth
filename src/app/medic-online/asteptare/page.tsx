import { OnCallQueueLauncher } from "@/components/telemed/OnCallQueueLauncher";
import { telemedMetadata } from "@/components/telemed/telemed-metadata";

export const generateMetadata = telemedMetadata("waiting");

export default function DefaultOnCallQueuePage() {
  return (
    <div className="min-h-screen bg-background">
      <OnCallQueueLauncher queueToken="LIVE-101" initialPosition={2} />
    </div>
  );
}
