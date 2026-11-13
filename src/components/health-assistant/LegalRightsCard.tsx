"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
import { speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

interface LegalRightsCardProps {
  className?: string;
}

export function LegalRightsCard({ className = "" }: LegalRightsCardProps) {
  const { lang } = useLanguage();
  const voiceEnabled = isVoiceEnabled(lang);
  const [isPlaying, setIsPlaying] = useState(false);

  const content: Record<
    Lang,
    {
      heading: string;
      lawRef: string;
      body: string;
      keyRights: string[];
      listenLabel: string;
      stopLabel: string;
      speechLang: string;
    }
  > = {
ru: {
      heading: "Закон гарантирует бесплатную неотложную медицинскую помощь",
      lawRef: "Закон Румынии о здравоохранении №. 95/2006, статья 236",
      body: "В соответствии с Законом Румынии о здравоохранении №. 95/2006, больницы должны оказывать неотложную медицинскую помощь любому человеку, даже без удостоверения личности, страховки или денег.",
      keyRights: [
        "Ни одно отделение неотложной помощи не сможет отказать вам, если вы серьезно больны или испытываете сильную боль.",
        "Чтобы получить неотложную помощь, вам не нужны деньги или медицинская карта.",
        "Медицинский персонал не может вызвать полицию, поскольку у вас нет документов.",
      ],
      listenLabel: "Слушайте свои права",
      stopLabel: "Хватит слушать",
      speechLang: "ru-RU",
    },

    en: {
      heading: "The law guarantees you free emergency medical care",
      lawRef: "Romanian Health Law no. 95/2006, Article 236",
      body: "Under Romania's Health Law no. 95/2006, hospitals must give emergency medical care to anyone, even without an identity card, proof of insurance or money.",
      keyRights: [
        "No emergency department can turn you away when you are seriously ill or in bad pain.",
        "You do not need money or a health card to get emergency help.",
        "Medical staff may not call the police because you have no papers.",
      ],
      listenLabel: "Listen to your rights",
      stopLabel: "Stop listening",
      speechLang: "en-GB",
    },
    ro: {
      heading: "Legea îți garantează îngrijirea de urgență gratuită",
      lawRef: "Legea sănătății nr. 95/2006, art. 236",
      body: "Conform Legii sănătății nr. 95/2006, spitalele sunt obligate să ofere îngrijire medicală de urgență oricărei persoane, chiar dacă nu are buletin, adeverință de asigurat sau bani.",
      keyRights: [
        "Nicio cameră de gardă nu te poate refuza când ești grav bolnav sau te doare foarte tare.",
        "Nu ai nevoie de bani sau de card de sănătate ca să primești ajutor de urgență.",
        "Personalul medical nu are voie să cheme poliția pentru că nu ai acte.",
      ],
      listenLabel: "Ascultă drepturile tale",
      stopLabel: "Oprește",
      speechLang: "ro-RO",
    },
    sq: {
      heading: "Ligji të garanton kujdes mjekësor urgjent falas",
      lawRef: "Ligji rumun i shëndetësisë nr. 95/2006, neni 236",
      body: "Sipas Ligjit rumun të shëndetësisë nr. 95/2006, spitalet janë të detyruara t'i ofrojnë kujdes mjekësor urgjent çdo personi, edhe nëse nuk ka letërnjoftim, dëshmi sigurimi ose para.",
      keyRights: [
        "Asnjë urgjencë nuk mund të të refuzojë kur je rëndë ose ke dhimbje të forta.",
        "Nuk të duhen para ose kartë shëndetësore për të marrë ndihmë urgjente.",
        "Stafi mjekësor nuk lejohet të thërrasë policinë sepse nuk ke dokumente.",
      ],
      listenLabel: "Dëgjo të drejtat e tua",
      stopLabel: "Ndalo zërin",
      speechLang: "sq-AL",
    },
    it: {
      heading: "La legge ti garantisce cure d'emergenza gratuite",
      lawRef: "Legge sanitaria romena n. 95/2006, art. 236",
      body: "Secondo la Legge sanitaria romena n. 95/2006, gli ospedali devono fornire assistenza medica d'emergenza a chiunque, anche senza carta d'identità, prova di assicurazione o denaro.",
      keyRights: [
        "Nessun pronto soccorso può rifiutarti se stai male gravemente o hai un dolore acuto.",
        "Non servono soldi né tessera sanitaria per ricevere aiuto d'emergenza.",
        "Il personale sanitario non può chiamare la polizia perché non hai documenti.",
      ],
      listenLabel: "Ascolta i tuoi diritti",
      stopLabel: "Ferma",
      speechLang: "it-IT",
    },
    hr: {
      heading: "Zakon ti jamči besplatnu hitnu medicinsku pomoć",
      lawRef: "Zakon o zdravstvenoj zaštiti i prava u sustavu HZZO-a, hitna služba 112",
      body: "Prema propisima o zdravstvenoj zaštiti i pravilima HZZO-a, bolnice i hitna medicinska služba na broju 112 moraju pružiti hitnu skrb svakoj osobi, čak i bez osobne iskaznice, iskaznice HZZO-a ili novca.",
      keyRights: [
        "Nijedan hitni bolnički prijem ne smije te odbiti kada si teško bolestan ili imaš jake bolove.",
        "Za hitnu pomoć na 112 ne trebaš novac ni zdravstvenu iskaznicu.",
        "Zdravstveno osoblje ne smije zvati policiju zato što nemaš dokumente, a možeš zatražiti i zdravstvenog medijatora.",
      ],
      listenLabel: "Poslušaj svoja prava",
      stopLabel: "Zaustavi",
      speechLang: "hr-HR",
    },
    rom: {
      heading: "O zakono garantinel tuke bi lovengo sigardiari sastipnasko azhutimos",
      lawRef: "Chachipen pe sigardiari azhutimos 112 thaj sastipnasko mediatori",
      body: "Svako manush si les chachipen te lel sigardiari sastipnasko azhutimos ko 112 thaj and-i bolnitsa, vi te na-i les lila, sastipnaski karta vaj love. Shaj manges vi bi lovengo azhutimos katar jekh sastipnasko mediatori.",
      keyRights: [
        "Nijekh sigardiari ki bolnitsa nashti phenel tuke na kana san phares nasvalo vaj si tut bari dukh.",
        "Na trebul tut love vaj sastipnaski karta te les sigardiari azhutimos ko 112.",
        "Le sastipnaske bucarne nashti akharen i policia soske na-i tut lila, thaj jekh sastipnasko mediatori shaj djal tusa.",
      ],
      listenLabel: "Ashun chire chachimata",
      stopLabel: "Astav",
      speechLang: "ro-RO",
    },
  };
  const t = content[lang] || content[DEFAULT_LANG];

  useEffect(() => {
    return () => {
      if (isPlaying) {
        speechEngine.stop();
      }
    };
  }, [isPlaying]);

  function handleToggleAudio() {
    if (isPlaying) {
      speechEngine.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Read the card in the page language, not a fixed Romanian text.
      speechEngine.speak([t.heading, t.body, ...t.keyRights].join(" "), {
        lang: t.speechLang,
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  }

  return (
    <section className={`border-t border-border pt-6 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-balance text-base font-semibold text-foreground">{t.heading}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.lawRef}</p>
        </div>
        {voiceEnabled && (
          <button
            type="button"
            onClick={handleToggleAudio}
            aria-pressed={isPlaying}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-xl border border-border-control bg-card px-4 py-2 text-sm font-semibold text-foreground press-row transition-[background-color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/60 hover:bg-sapphire-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {isPlaying ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
            <span>{isPlaying ? t.stopLabel : t.listenLabel}</span>
          </button>
        )}
      </div>

      <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground">{t.body}</p>

      <ul className="mt-4 space-y-2">
        {t.keyRights.map((right) => (
          <li key={right} className="flex items-start gap-2.5 text-base leading-relaxed text-foreground">
            <CheckCircleIcon className="mt-1 h-4.5 w-4.5 shrink-0 text-sapphire dark:text-sapphire-border" />
            <span>{right}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
