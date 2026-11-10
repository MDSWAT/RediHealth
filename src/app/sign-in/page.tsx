import type { Metadata } from "next";
import { SignInPageContent } from "@/components/auth/SignInPageContent";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const descriptions: Record<Lang, string> = {
  ro: "Intră în RediHealth cu un cod primit pe email sau cu contul Google.",
  en: "Sign in to RediHealth with a code sent to your email, or with Google.",
  sq: "Hyr në RediHealth me një kod që vjen në email ose me llogarinë Google.",
  it: "Accedi a RediHealth con un codice ricevuto via email o con Google.",
  hr: "Prijavi se u RediHealth kodom poslanim na e-poštu ili putem Google računa.",
  rom: "Khuves andre ko RediHealth kodosa bichhaldo pe emailo vay Google kontosa.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "sign-in", "Sign in - RediHealth"),
    description: descriptions[lang] ?? descriptions.en,
  };
}

type SignInPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const googleConfigured = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const { error } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;

  const initialError =
    errorCode === "unauthorized-email"
      ? "unauthorized"
      : errorCode === "auth-unavailable"
        ? "unavailable"
        : undefined;

  return (
    <SignInPageContent
      googleConfigured={googleConfigured}
      initialError={initialError}
    />
  );
}
