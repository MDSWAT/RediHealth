import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import { findHelpTranslations } from "@/lib/i18n/find-help-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

/**
 * Shown instead of the online doctor where the service is not offered (see
 * `ONLINE_DOCTOR_UNAVAILABLE_LANGS`): what is true, and the two places that can help instead.
 */
export const onlineDoctorUnavailableCopy: Record<Lang, { title: string; body: string }> = {
  ro: {
    title: "Medicul online nu este disponibil în Croația",
    body: "Găsește un medic de familie sau o farmacie aproape ori cere ajutorul unui mediator sanitar.",
  },
  en: {
    title: "The online doctor is not available in Croatia",
    body: "Find a family doctor or pharmacy near you, or ask a health mediator.",
  },
  sq: {
    title: "Mjeku online nuk është i disponueshëm në Kroaci",
    body: "Gjej një mjek familjeje ose një farmaci pranë teje, ose kërko ndihmën e një mediatori shëndetësor.",
  },
  it: {
    title: "Il medico online non è disponibile in Croazia",
    body: "Trova un medico di famiglia o una farmacia vicino a te, oppure chiedi aiuto a un mediatore sanitario.",
  },
  hr: {
    title: "Liječnik online nije dostupan u Hrvatskoj",
    body: "Pronađi obiteljskog liječnika ili ljekarnu u blizini ili zatraži pomoć zdravstvenog medijatora.",
  },
  rom: {
    title: "O doktori online nane ande Kroatiya",
    body: "Arakh familiyako doktori vay farmaciya pashe tute, vay mang azhutipe katar ekh sastipnasko mediatori.",
  },
  ru: {
    title: "Онлайн-врач недоступен в Хорватии",
    body: "Найдите семейного врача или аптеку рядом либо обратитесь к медицинскому медиатору.",
  },
};

export function OnlineDoctorUnavailable({ lang }: { lang: Lang }) {
  const copy = onlineDoctorUnavailableCopy[lang];

  return (
    <section className="border-b border-border bg-background pb-10 sm:pb-14">
      <Container>
        <PageHeader
          title={copy.title}
          lead={copy.body}
          actions={
            <>
              <Button href={withLangPrefix(findHelpHref("gp"), lang)} variant="action" size="lg">
                {findHelpLinks(lang).familyDoctor}
              </Button>
              <Button href={withLangPrefix("/mediatori", lang)} variant="outline" size="lg">
                {findHelpTranslations[lang].page.mediatorButton}
              </Button>
            </>
          }
        />
      </Container>
    </section>
  );
}
