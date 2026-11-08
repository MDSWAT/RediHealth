"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import {
  CAPTION_LABELS,
  SynchronizedCaptionsOverlay,
  type SubtitleCue,
} from "./SynchronizedCaptionsOverlay";
import { VisualComicFallbackCard } from "./VisualComicFallbackCard";
import type { ExplainerScene } from "./explainers/types";
import {
  buildNoCookieEmbedUrl,
  formatTrackDuration,
  type ShortMediaSource,
} from "@/lib/media/topic-media-registry";

interface ShortMediaCopy {
  cardLabel: string;
  playVideo: string;
  pauseVideo: string;
  unmute: string;
  mute: string;
  tapToPlay: string;
  tapToPause: string;
  /** Use {channel}. */
  videoSource: string;
  youtubeNotice: string;
}

const SHORT_MEDIA_COPY: Record<Lang, ShortMediaCopy> = {
  ro: {
    cardLabel: "Video scurt",
    playVideo: "Redă video",
    pauseVideo: "Pauză video",
    unmute: "Activează sunetul",
    mute: "Oprește sunetul",
    tapToPlay: "Apasă ca să pornești",
    tapToPause: "Apasă ca să oprești",
    videoSource: "Video: {channel}",
    youtubeNotice: "Videoclipul se încarcă de pe YouTube (Google) doar după ce apeși Redă.",
  },
  en: {
    cardLabel: "Short video",
    playVideo: "Play video",
    pauseVideo: "Pause video",
    unmute: "Turn sound on",
    mute: "Turn sound off",
    tapToPlay: "Tap to play",
    tapToPause: "Tap to pause",
    videoSource: "Video: {channel}",
    youtubeNotice: "The video loads from YouTube (Google) only after you press Play.",
  },
  sq: {
    cardLabel: "Video e shkurtër",
    playVideo: "Luaj videon",
    pauseVideo: "Ndalo videon",
    unmute: "Aktivizo zërin",
    mute: "Fike zërin",
    tapToPlay: "Prek për ta luajtur",
    tapToPause: "Prek për ta ndalur",
    videoSource: "Video: {channel}",
    youtubeNotice: "Videoja ngarkohet nga YouTube (Google) vetëm pasi të shtypësh Luaj.",
  },
  it: {
    cardLabel: "Video breve",
    playVideo: "Riproduci il video",
    pauseVideo: "Metti in pausa il video",
    unmute: "Attiva l'audio",
    mute: "Disattiva l'audio",
    tapToPlay: "Tocca per riprodurre",
    tapToPause: "Tocca per mettere in pausa",
    videoSource: "Video: {channel}",
    youtubeNotice: "Il video si carica da YouTube (Google) solo dopo che premi Riproduci.",
  },
};

export interface VerticalShortMediaCardProps {
  title: string;
  topicTag: string;
  durationLabel?: string;
  /** Defaults to the topic scene driven by the caption clock. */
  source?: ShortMediaSource;
  /** The topic's explainer scene, drawn inside the frame in "scene" mode. */
  Scene?: ExplainerScene | null;
  subtitles?: SubtitleCue[];
  lang?: Lang;
  className?: string;
}

const CONTROL_CLASS =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-card/95 text-sapphire shadow-2xs hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire";

function PlayGlyph({ playing, className = "h-5 w-5" }: { playing: boolean; className?: string }) {
  return playing ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

export function VerticalShortMediaCard({
  title,
  topicTag,
  durationLabel,
  source = { kind: "scene" },
  Scene,
  subtitles = [],
  lang = "ro",
  className = "",
}: VerticalShortMediaCardProps) {
  const copy = SHORT_MEDIA_COPY[lang] ?? SHORT_MEDIA_COPY.ro;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [youtubeLoaded, setYoutubeLoaded] = useState(false);
  const [useComicFallback, setUseComicFallback] = useState(() => {
    if (typeof navigator !== "undefined") {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      return !!(conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g");
    }
    return false;
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clockRef = useRef(0);

  // Captions always come from the caller (the topic media registry). There is
  // deliberately no built-in fallback track, so one topic's captions can never
  // appear on another topic's page.
  const trackDuration = subtitles.length > 0 ? subtitles[subtitles.length - 1].end : 0;
  const resolvedDurationLabel = durationLabel ?? formatTrackDuration(subtitles);
  const usesCaptionClock = source.kind === "scene";

  // In scene mode a lightweight caption clock drives playback so captions and
  // the scene advance together when the user presses play.
  useEffect(() => {
    if (!usesCaptionClock || !isPlaying) return;
    const tickSeconds = 0.1;
    let elapsed = clockRef.current;
    const id = window.setInterval(() => {
      elapsed = Math.min(elapsed + tickSeconds, trackDuration);
      clockRef.current = elapsed;
      setCurrentTime(elapsed);
      if (elapsed >= trackDuration) {
        window.clearInterval(id);
        setIsPlaying(false);
      }
    }, tickSeconds * 1000);
    return () => window.clearInterval(id);
  }, [usesCaptionClock, isPlaying, trackDuration]);

  const togglePlay = () => {
    if (usesCaptionClock) {
      if (isPlaying) {
        setIsPlaying(false);
      } else if (trackDuration > 0) {
        if (clockRef.current >= trackDuration) {
          clockRef.current = 0;
          setCurrentTime(0);
        }
        setIsPlaying(true);
      }
      return;
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => setUseComicFallback(true));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (useComicFallback) {
    return (
      <VisualComicFallbackCard
        topicTitle={topicTag}
        lang={lang}
        onSwitchToVideo={() => setUseComicFallback(false)}
        className={className}
      />
    );
  }

  const captionLabels = CAPTION_LABELS[lang] ?? CAPTION_LABELS.ro;
  const frameClass = `relative flex aspect-[9/16] w-full max-w-[280px] sm:max-w-[320px] flex-col justify-between overflow-hidden rounded-lg border border-border bg-surface-elevated p-4 shadow-xs ${className}`;

  // External clip: click-to-load facade. No request reaches Google until Play.
  if (source.kind === "youtube") {
    return (
      <div className={frameClass} aria-label={`${copy.cardLabel}: ${title}`} data-media-mode="youtube">
        {youtubeLoaded ? (
          <iframe
            src={buildNoCookieEmbedUrl(source)}
            title={title}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setYoutubeLoaded(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire"
            aria-label={`${copy.playVideo}: ${title}`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-foreground text-white">
              <PlayGlyph playing={false} className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold leading-snug text-foreground">{title}</span>
            <span className="text-xs font-semibold text-foreground">
              {copy.videoSource.replace("{channel}", source.channel)}
            </span>
            <span className="text-[11px] leading-snug text-muted-foreground">{copy.youtubeNotice}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={frameClass} aria-label={`${copy.cardLabel}: ${title}`} data-media-mode={source.kind}>
      {/* Clean top metadata row — zero floating pill badges */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <span className="text-sm font-semibold text-foreground">{topicTag}</span>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">{resolvedDurationLabel}</span>
      </div>

      {/* Central visual stage — zero duplicate topic title */}
      {source.kind === "selfHosted" ? (
        <div className="my-3 flex-1 overflow-hidden rounded-md bg-surface-subtle">
          <video
            ref={videoRef}
            src={source.src}
            poster={source.poster}
            preload="none"
            playsInline
            muted={isMuted}
            onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
            onEnded={() => setIsPlaying(false)}
            className="h-full w-full object-cover"
            onClick={togglePlay}
          />
        </div>
      ) : (
        <div
          onClick={togglePlay}
          className="my-3 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-md bg-surface-subtle/60 px-4 py-5 text-center transition-colors hover:bg-surface-subtle"
        >
          {Scene ? (
            <div className="aspect-square w-full max-w-[230px]" aria-hidden="true">
              <LazyMotion features={domAnimation} strict>
                <Scene step={0} playing={isPlaying} lang={lang} />
              </LazyMotion>
            </div>
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-card text-foreground">
              <PlayGlyph playing={isPlaying} className="h-6 w-6" />
            </span>
          )}
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            {isPlaying ? copy.tapToPause : copy.tapToPlay}
          </p>
        </div>
      )}

      {/* Synchronized captions + unified bottom transport bar */}
      <div className="space-y-3">
        <SynchronizedCaptionsOverlay
          cues={subtitles}
          currentTime={currentTime}
          isVisible={showCaptions}
          onToggleVisible={() => setShowCaptions(!showCaptions)}
          lang={lang}
          inline
        />

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            aria-label={isPlaying ? copy.pauseVideo : copy.playVideo}
          >
            <PlayGlyph playing={isPlaying} className="h-4 w-4" />
            <span>{isPlaying ? copy.pauseVideo : copy.playVideo}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {source.kind === "selfHosted" && (
              <button
                type="button"
                onClick={toggleMute}
                className={CONTROL_CLASS}
                aria-label={isMuted ? copy.unmute : copy.mute}
              >
                {isMuted ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCaptions(!showCaptions)}
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                showCaptions
                  ? "border-foreground bg-surface-subtle text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
              aria-label={showCaptions ? captionLabels.turnOff : captionLabels.turnOn}
              aria-pressed={showCaptions}
            >
              {showCaptions ? captionLabels.activeBadge : "CC"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
