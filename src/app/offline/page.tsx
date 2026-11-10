import { OfflineWorkspace } from "@/components/offline/OfflineWorkspace";

export const metadata = {
  title: "Encrypted offline workspace - RediHealth",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineWorkspace />;
}
