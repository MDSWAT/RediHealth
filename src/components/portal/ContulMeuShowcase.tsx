"use client";

import Link from "next/link";
import { contulMeuCopy, type PortalPreviewFeatureId } from "@/components/portal/contul-meu-copy";
import { mediatorStaffStripCopy } from "@/components/mediator/mediator-page-copy";
import { SmsPhoneAuthModal } from "@/components/portal/SmsPhoneAuthModal";
import { Container } from "@/components/ui/Container";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FileTextIcon,
  PrescriptionIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import "./patient-cabinet.css";
import { translations, type Lang } from "@/lib/i18n/translations";

const FEATURE_ICONS: Record<PortalPreviewFeatureId, typeof PrescriptionIcon> = {
  plan: PrescriptionIcon,
  appointments: CalendarIcon,
  family: FileTextIcon,
};

function useSafeLanguage(initialLang: Lang) {
  try {
    return useLanguage();
  } catch {
    return {
      lang: initialLang,
      t: translations[initialLang] ?? translations.ro,
      setLang: () => {},
    };
  }
}

export function ContulMeuShowcase({ initialLang = "ro" }: { initialLang?: Lang }) {
  const { lang: activeLang } = useSafeLanguage(initialLang);
  const lang = activeLang ?? initialLang;
  const copy = contulMeuCopy[lang] ?? contulMeuCopy.ro;
  const staffStrip = mediatorStaffStripCopy[lang] ?? mediatorStaffStripCopy.ro;

  return <main id="main-content" className="cabinet-entry">
    <Container>
      <div className="mx-auto max-w-[1080px]"><Link href={withLangPrefix("/", lang)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground"><ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />{copy.backHome}</Link></div>
      <div className="cabinet-entry-layout">
        <div><SmsPhoneAuthModal initialLang={lang} embedded /></div>
        <section className="cabinet-entry-benefits" aria-labelledby="portal-preview-heading"><h2 id="portal-preview-heading">{copy.previewRegionLabel}</h2><p>{copy.whoFor}</p>
          <ul>{copy.features.map((feature) => { const Icon = FEATURE_ICONS[feature.id]; return <li key={feature.id}><Icon className="h-5 w-5" aria-hidden="true" /><div><h3>{feature.title}</h3><p>{feature.body}</p></div></li>; })}</ul>
        </section>
      </div>
      <section className="cabinet-staff-entry" aria-label={staffStrip.regionLabel}><p>{staffStrip.prompt}</p><Link href={withLangPrefix("/sign-in", lang)} className="inline-flex min-h-11 items-center rounded-lg border border-border-control px-4 font-semibold text-foreground">{staffStrip.signIn}</Link></section>
    </Container>
  </main>;
}
