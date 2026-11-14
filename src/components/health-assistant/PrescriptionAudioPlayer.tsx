"use client";

import { ListenButton } from "@/components/ui/ListenButton";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";

interface PrescriptionAudioPlayerProps {
  speechText: string;
  className?: string;
}

/**
 * Thin wrapper around unified `ListenButton` for prescription explanations.
 */
export function PrescriptionAudioPlayer({
  speechText,
  className,
}: PrescriptionAudioPlayerProps) {
  const { lang } = useLanguage();
  if (!isVoiceEnabled(lang)) return null;

  return (
    <div className={className}>
      <ListenButton text={speechText} uiLang={lang} />
    </div>
  );
}
