import type { Metadata } from "next";
import { ContulMeuShowcase } from "@/components/portal/ContulMeuShowcase";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const descriptions: Record<Lang, string> = {
    ru: "См. советы, рецепты и назначения вашего врача. Войдите в систему, используя свой номер телефона.",
    ro: "Vezi sfaturile medicului, rețetele și programările tale. Intri cu numărul de telefon.",
    en: "See your doctor's advice, prescriptions and appointments. Sign in with your phone number.",
    sq: "Shiko këshillat e mjekut, recetat dhe takimet e tua. Hyr me numrin e telefonit.",
    it: "Vedi i consigli del medico, le ricette e gli appuntamenti. Accedi con il numero di telefono.",
    hr: "Pogledaj liječničke upute, recepte i svoje termine. Prijavi se brojem telefona.",
    rom: "Dikh e doktoreske sikavimata, recepte thaj che vrame. Khuves andre che telefoneske ginesa.",
  };

  return {
    title: localizedPageTitle(lang, "contul-meu", "Contul meu - RediHealth"),
    description: descriptions[lang] ?? descriptions.ro,
  };
}

export default async function ContulMeuPage() {
  const lang = await getRequestLang();
  return <ContulMeuShowcase initialLang={lang} />;
}
