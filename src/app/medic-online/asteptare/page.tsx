import { OnCallQueueLauncher } from "@/components/telemed/OnCallQueueLauncher";
import { OnlineDoctorUnavailable } from "@/components/telemed/OnlineDoctorUnavailable";
import { telemedMetadata } from "@/components/telemed/telemed-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { isOnlineDoctorAvailable } from "@/lib/online-doctor";

export const generateMetadata = telemedMetadata("waiting");

export default async function DefaultOnCallQueuePage() {
  const lang = await getRequestLang();
  if (!isOnlineDoctorAvailable(lang)) {
    return (
      <main id="main-content" className="min-h-screen bg-background">
        <OnlineDoctorUnavailable lang={lang} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OnCallQueueLauncher queueToken="LIVE-101" initialPosition={2} />
    </div>
  );
}
