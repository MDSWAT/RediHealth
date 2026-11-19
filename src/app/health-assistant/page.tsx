import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HealthAssistant } from "@/components/health-assistant/HealthAssistant";
import { getAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { withLangPrefix } from "@/lib/i18n/routing";
import { getRequestLang } from "@/lib/i18n/server-routing";

export async function generateMetadata(): Promise<Metadata> {
  const option = getAssistantCopy(await getRequestLang()).tree.options.navigation;
  return {
    title: `${option.plainTitle} - RediHealth`,
    description: option.subtitle,
  };
}

// Older links and QR codes opened a step of the removed step-by-step guide; send them to the tool that replaced it.
const PATHWAY_PAGES: Record<string, string> = {
  symptoms: "/health-check",
  prescription: "/prescription-review",
};

export default async function HealthAssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ pathway?: string | string[] }>;
}) {
  const { pathway } = await searchParams;
  const target = PATHWAY_PAGES[Array.isArray(pathway) ? pathway[0] : pathway ?? ""];
  if (target) redirect(withLangPrefix(target, await getRequestLang()));

  return <HealthAssistant />;
}
