"use client";

import { useEffect, useRef, useState } from "react";
import { VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
import { speechEngine, formatSpeechText } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

interface PrescriptionAudioPlayerProps {
  speechText: string;
  className?: string;
}

export function PrescriptionAudioPlayer({ speechText, className = "" }: PrescriptionAudioPlayerProps) {
  const { lang } = useLanguage();
  const voiceEnabled = isVoiceEnabled(lang);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const dict = {
    en: {
      listen: "Listen to the explanation",
      stop: "Stop listening",
      speechLang: "en-GB",
    },
    ro: {
      listen: "Ascultă explicația",
      stop: "Oprește",
      speechLang: "ro-RO",
    },
    sq: {
      listen: "Dëgjo shpjegimin",
      stop: "Ndalo zërin",
      speechLang: "sq-AL",
    },
    it: {
      listen: "Ascolta la spiegazione",
      stop: "Ferma",
      speechLang: "it-IT",
    },
    hr: {
      listen: "Poslušaj objašnjenje",
      stop: "Zaustavi",
      speechLang: "hr-HR",
    },
    rom: {
      listen: "Ashun o shpjegimos",
      stop: "Astav",
      speechLang: "ro-RO",
    },
  } satisfies Record<Lang, { listen: string; stop: string; speechLang: string }>;
  const t = dict[lang] || dict[DEFAULT_LANG];

  useEffect(() => {
    return () => {
      if (isPlayingRef.current) {
        speechEngine.stop();
        isPlayingRef.current = false;
      }
    };
  }, []);

  function handleToggleSpeech() {
    if (isPlaying) {
      isPlayingRef.current = false;
      speechEngine.stop();
      setIsPlaying(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      speechEngine.speak(formatSpeechText(speechText, t.speechLang), {
        lang: t.speechLang,
        onEnd: () => {
          isPlayingRef.current = false;
          setIsPlaying(false);
        },
        onError: () => {
          isPlayingRef.current = false;
          setIsPlaying(false);
        },
      });
    }
  }

  if (!voiceEnabled) return null;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleToggleSpeech}
        aria-pressed={isPlaying}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted"
      >
        {isPlaying ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
        <span>{isPlaying ? t.stop : t.listen}</span>
      </button>
    </div>
  );
}
