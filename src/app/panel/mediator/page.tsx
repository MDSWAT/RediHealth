import { redirect } from "next/navigation";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export default async function MediatorCasesPage() {
  redirect(await withRequestLangPrefix("/panel"));
}