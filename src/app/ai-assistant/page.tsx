import type { Metadata } from "next";
import { AiChatAssistant } from "@/components/health-assistant/AiChatAssistant";
import { AI_CHAT_COPY } from "@/components/health-assistant/ai-chat-copy";
import { getRequestLang } from "@/lib/i18n/server-routing";

export async function generateMetadata(): Promise<Metadata> {
  const copy = AI_CHAT_COPY[await getRequestLang()] ?? AI_CHAT_COPY.ro;
  return { title: `${copy.title} - RediHealth`, description: copy.metaDescription };
}

export default function AiAssistantPage() {
  return <AiChatAssistant />;
}
