"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
import { speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";

interface LegalRightsCardProps {
  className?: string;
}

export function LegalRightsCard({ className = "" }: LegalRightsCardProps) {
  const { lang } = useLanguage();
  const voiceEnabled = isVoiceEnabled(lang);
  const [isPlaying, setIsPlaying] = useState(false);

  const content = {
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
  };
  const t = content[lang as keyof typeof content] || content[DEFAULT_LANG];

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
          <h3 className="text-base font-semibold text-foreground">{t.heading}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.lawRef}</p>
        </div>
        {voiceEnabled && (
          <button
            type="button"
            onClick={handleToggleAudio}
            aria-pressed={isPlaying}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted"
          >
            {isPlaying ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
            <span>{isPlaying ? t.stopLabel : t.listenLabel}</span>
          </button>
        )}
      </div>

      <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground">{t.body}</p>

      <ul className="mt-4 space-y-2">
        {t.keyRights.map((right) => (
          <li key={right} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
            <span>{right}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
