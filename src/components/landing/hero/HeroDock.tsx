"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type CSSProperties, type PointerEvent as ReactPointerEvent, type SVGProps } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getImageProps } from "next/image";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
import {
  ActivityIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  HandHelpingIcon,
  PinIcon,
  PrescriptionIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { HERO_NEED_ORDER, localHref, type HeroCopy, type HeroNeedId } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";
import {
  INNER_STARS,
  OUTER_STARS,
  WHEEL_NODE_ORBIT,
  WHEEL_VIEW,
  WHEEL_VIEW_BOX,
  WheelSpokes,
  WheelStars,
} from "../HealthTopicsWheelArt";
import { WHEEL_ICONS } from "../HealthTopicsWheelIcons";
import { WHEEL_ORDER } from "../health-topics-wheel-config";
import type { TriageView } from "./TriagePanel";
import styles from "./HeroDock.module.css";

const TriagePanel = dynamic(() => import("./TriagePanel").then((mod) => mod.TriagePanel), {
  ssr: false,
});

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
/**
 * Background photos, blurred and cross-faded slowly. All three are from one consultation shoot
 * (hands only, no faces), so the colour stays the same as they change. The first is the one on
 * screen at first paint; the others are fetched at low priority.
 */
const BACKDROP_PHOTOS = ["/images/hero-care.jpg", "/images/hero-consultation.jpg", "/images/hero-desk.jpg"];

/** The grabber's accessible name, per language: what tapping it will do. */
const DOCK_TOGGLE: Record<Lang, { hide: string; show: string; ring: string }> = {
  en: { hide: "Hide the help panel", show: "Show the help panel", ring: "Health topics on the wheel" },
  ro: { hide: "Ascunde panoul de ajutor", show: "Arată panoul de ajutor", ring: "Temele de sănătate pe roată" },
  sq: { hide: "Fshih panelin e ndihmës", show: "Shfaq panelin e ndihmës", ring: "Temat e shëndetit në rrotë" },
  it: { hide: "Nascondi il pannello di aiuto", show: "Mostra il pannello di aiuto", ring: "I temi di salute sulla ruota" },
  hr: { hide: "Sakrij ploču za pomoć", show: "Prikaži ploču za pomoć", ring: "Zdravstvene teme na kotaču" },
  rom: { hide: "Garav o panelo zhutimasko", show: "Sikav o panelo zhutimasko", ring: "E sastipnaske teme pe rota" },
  ru: { hide: "Скрыть панель помощи", show: "Показать панель помощи", ring: "Темы здоровья на колесе" },
};

/** A topic on the wheel, as the caption under the hero's subtitle tells it. */
export type WheelTopicNote = { slug: string; title: string; description: string };

/** An icon "reaches the top" this many pixels before it is exactly at twelve o'clock. */
const TOP_LEAD_PX = 5;
/** A tapped icon keeps the caption this long before the caption follows the ring again. */
const PIN_MS = 4500;

/** Past this share of the travel, or this fast (px per ms), a released drag settles on the other detent. */
const DRAG_COMMIT_SHARE = 0.28;
const DRAG_COMMIT_SPEED = 0.45;
/** A press that moves less than this is a tap on the grabber, not a drag. */
const TAP_SLOP = 6;

/** The full menu's rows: the same needs and icons as the desktop quick options (HeroRoutes). */
const NEED_ICONS: Record<HeroNeedId, ComponentType<SVGProps<SVGSVGElement>>> = {
  problem: ActivityIcon,
  risk: ClipboardCheckIcon,
  doctor: StethoscopeIcon,
  nearby: PinIcon,
  prescription: PrescriptionIcon,
  navigate: HandHelpingIcon,
};

// Option rows, like the chooser's (TriagePanel): a long need may run to a second line rather than shrink.
const FULL_ROW =
  "press-row -mx-2 flex min-h-13 w-[calc(100%+1rem)] items-center gap-3.5 rounded-xl px-2 py-2 text-left text-body leading-snug text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-paper/[0.07] active:bg-paper/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper motion-reduce:transition-none";

type HeroDockProps = {
  copy: HeroCopy;
  lang: Lang;
  /** The wheel's topics in the reader's language, for the caption. */
  topics?: WheelTopicNote[];
  /** Called with the topic the caption should show, or null when the ring icons are hidden. */
  onNote?: (note: WheelTopicNote | null) => void;
};

/**
 * The hero on phones and tablets (below lg), under the headline:
 * - consultation photos as a blurred, darkened background behind the headline, cross-fading slowly,
 *   with the topic wheel (both star rings and the chakra) large and half-risen over the paper;
 * - a paper dock with the question, the one main action, a shortcut for people who feel unwell
 *   now, read-aloud and the mediator route;
 * - the chooser itself (the same TriagePanel as on desktop) in a bottom sheet, mounted on first
 *   use. It is a native modal dialog: focus stays inside, and Escape or Android's back button close it.
 */
export function HeroDock({ copy, lang, topics = [], onNote }: HeroDockProps) {
  const [sheet, setSheet] = useState<{ view: TriageView; visit: number } | null>(null);
  const [mountCyclePhotos, setMountCyclePhotos] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const voiceEnabled = isVoiceEnabled(lang);
  const { panel } = copy;
  const toggleCopy = DOCK_TOGGLE[lang] ?? DOCK_TOGGLE.en;

  /*
   * The dock as a sheet with three detents:
   *   full (-1): grown upward to the whole menu (the six needs and the mediator route);
   *   open  (0): as designed, the question and the one main action;
   *   peek  (1): tucked away, only the grabber and the question showing, the whole wheel in view.
   * One number, --dock-p, drives everything (the dock's slide, the crossfade between the open body
   * and the full menu, the wheel rising into the space the peek frees, and the clip that lets it).
   * A drag moves one detent at a time: from the peek it stops at open, and only a second drag up
   * opens the full menu, so a long swipe never jumps further than the reader meant.
   * Measured lengths (--dock-travel, --dock-grow, --sun-travel, --sun-rise, and --text-lift on the
   * section) are written on resize.
   */
  type Detent = "full" | "open" | "peek";
  const DETENT_P: Record<Detent, number> = { full: -1, open: 0, peek: 1 };
  const [detent, setDetent] = useState<Detent>("open");
  const peek = detent === "peek";
  const full = detent === "full";
  const rootRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const travelRef = useRef(0);
  const growRef = useRef(0);
  const dragRef = useRef<{ id: number; y: number; t: number; from: number; moved: boolean; p: number } | null>(null);
  /** Set when a drag ends, so the click the browser fires after it does not toggle again. */
  const suppressClickRef = useRef(false);


  const measure = useCallback(() => {
    const root = rootRef.current;
    const sun = sunRef.current;
    const dock = dockRef.current;
    const handle = handleRef.current;
    const body = bodyRef.current;
    const menu = menuRef.current;
    const section = root?.closest("section");
    if (!root || !sun || !dock || !handle || !body || !menu || !section) return;
    const wheel = sun.querySelector<HTMLElement>("[data-sun-wheel]");
    // Layout offsets, all against the hero section, so the slide and the scroll drift (transforms)
    // never skew the numbers. The dock is laid out taller than it shows (see .dock).
    const sunTop = sun.offsetTop;
    const sunH = sun.offsetHeight;
    const bodyBox = body.parentElement ?? body;
    const shownH = bodyBox.offsetTop + body.offsetTop + body.offsetHeight + 12;
    // The peek keeps the grabber and the question in view, plus a little air under them.
    const peekH = handle.offsetTop + handle.offsetHeight + 12;
    const travel = Math.max(0, shownH - peekH);
    travelRef.current = travel;
    // The full menu sits where the open body is and runs on below it; the dock rises by the difference.
    const grow = Math.max(0, menu.offsetHeight - body.offsetHeight);
    growRef.current = grow;

    // The drawing does not fill its square: the outer stars reach 452/530 of the half-size, the
    // topic icons (orbit plus their own radius) 500/530. Everything is placed by what is drawn.
    const diameter = wheel?.offsetHeight ?? sunH * 2;
    const radius = diameter / 2;
    const starR = radius * (452 / 530);
    const iconR = radius * ((WHEEL_NODE_ORBIT + WHEEL_VIEW * 0.059) / (WHEEL_VIEW / 2));
    const centreOpen = sunTop + sunH - 24;
    // Open, the star tips may stand a little above the band: the clip leaves them whole.
    const overOpen = Math.max(0, starR - (sunH - 24)) + 4;

    // At the peek the wheel keeps its full size, its icons just clear of the peeking bar.
    const peekTop = dock.offsetTop + travel;
    const centreRing = peekTop - 8 - iconR;
    const text = section.querySelector<HTMLElement>(".hero-phone-drift");
    const cross = section.querySelector<HTMLElement>(".hero-cross-slot");
    const caption = section.querySelector<HTMLElement>(".hero-topic-note");
    const headerH = parseFloat(getComputedStyle(section).paddingTop) || 0;
    let lift = 0;
    let liftRing = 0;
    let plainShift = 0;
    if (text) {
      const textTop = text.offsetTop;
      const textBottom = textTop + text.offsetHeight;
      const room = Math.max(0, textTop - headerH - 8);
      // Icons hidden: the text keeps clear of the star tips. What the text cannot give (it never
      // goes under the header) the wheel takes by settling lower: bare stars need less room than
      // icons, so it can sink by that difference and still clear the bar. It rises again when the
      // icons come out.
      const neededPlain = Math.max(0, textBottom + 8 - (centreRing - starR));
      lift = Math.min(neededPlain, room);
      plainShift = Math.min(neededPlain - lift, iconR - starR);
      // Icons out: the caption hangs under the subtitle and must clear the top icon. The cross
      // gives way to the wheel then, so its room is free too.
      const crossRoom = cross ? cross.offsetHeight + parseFloat(getComputedStyle(cross).marginBottom || "0") : 0;
      const captionH = (caption?.offsetHeight ?? 40) + 12;
      liftRing = Math.min(Math.max(0, textBottom + captionH + 8 - (centreRing - iconR)), room + crossRoom);
    }
    root.style.setProperty("--dock-travel", `${travel}px`);
    root.style.setProperty("--dock-grow", `${grow}px`);
    root.style.setProperty("--sun-travel", `${centreRing - centreOpen}px`);
    root.style.setProperty("--sun-plain-shift", `${plainShift}px`);
    root.style.setProperty("--sun-reach", `${travel + 8}px`);
    root.style.setProperty("--sun-over", `${overOpen}px`);
    root.style.setProperty("--sun-rise", `${Math.max(overOpen, sunTop - (centreRing - iconR) + 8)}px`);
    section.style.setProperty("--text-lift", `${lift}px`);
    section.style.setProperty("--text-lift-ring", `${liftRing}px`);
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    const section = rootRef.current?.closest("section");
    for (const el of [section, dockRef.current, sunRef.current, menuRef.current]) {
      if (el) observer.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  /*
   * The easter egg: tapping the chakra brings the eight topic icons out onto the outer ring (and
   * tapping it again puts them away). While they show, a small caption under the subtitle names
   * the topic whose icon has just reached the top of the ring; it changes when the next icon comes
   * within TOP_LEAD_PX of the top. Hovering or tapping an icon shows that topic for a while.
   */
  const [ringOn, setRingOn] = useState(false);
  const [topIndex, setTopIndex] = useState(0);
  const [pinIndex, setPinIndex] = useState<number | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const pinTimerRef = useRef<number | undefined>(undefined);
  const onNoteRef = useRef(onNote);
  useEffect(() => {
    onNoteRef.current = onNote;
  }, [onNote]);

  useEffect(() => {
    if (!ringOn) return;
    const read = () => {
      const outer = outerRef.current;
      const animation = outer?.getAnimations()[0];
      const timing = animation?.effect?.getComputedTiming();
      const duration = Number(timing?.duration) || 0;
      const time = Number(animation?.currentTime) || 0;
      // The ring turns clockwise; icon i starts at i steps clockwise from the top.
      const turned = duration ? ((time % duration) / duration) * 360 : 0;
      const orbit = ((outer?.offsetHeight ?? 400) * WHEEL_NODE_ORBIT) / WHEEL_VIEW;
      const lead = (TOP_LEAD_PX / Math.max(orbit, 1)) * (180 / Math.PI);
      const step = 360 / WHEEL_ORDER.length;
      let best = 0;
      let bestSince = Infinity;
      WHEEL_ORDER.forEach((_, index) => {
        // Degrees since this icon came within the lead of the top: the smallest is the newest.
        const since = (((index * step + turned + lead) % 360) + 360) % 360;
        if (since < bestSince) {
          bestSince = since;
          best = index;
        }
      });
      setTopIndex(best);
    };
    read();
    const id = window.setInterval(read, 250);
    return () => window.clearInterval(id);
  }, [ringOn]);

  useEffect(() => {
    const section = rootRef.current?.closest("section");
    if (ringOn) section?.setAttribute("data-ring", "");
    else section?.removeAttribute("data-ring");
  }, [ringOn]);

  const shownIndex = pinIndex ?? topIndex;
  useEffect(() => {
    const slug = WHEEL_ORDER[shownIndex];
    onNoteRef.current?.(ringOn ? (topics.find((topic) => topic.slug === slug) ?? null) : null);
    // The caption's height decides how far the text moves up: measure again once it has rendered.
    const frame = window.requestAnimationFrame(() => measure());
    return () => window.cancelAnimationFrame(frame);
  }, [ringOn, shownIndex, topics, measure]);

  const pin = (index: number | null, hold: boolean) => {
    window.clearTimeout(pinTimerRef.current);
    setPinIndex(index);
    if (index !== null && hold) pinTimerRef.current = window.setTimeout(() => setPinIndex(null), PIN_MS);
  };
  useEffect(() => () => window.clearTimeout(pinTimerRef.current), []);

  /** --dock-p lives on the hero section, so the text above the dock can move with it too. */
  const setProgress = (p: number) => rootRef.current?.closest("section")?.style.setProperty("--dock-p", `${p}`);
  const setDragging = (on: boolean) => {
    for (const el of [rootRef.current, rootRef.current?.closest("section")]) {
      if (on) el?.setAttribute("data-dragging", "");
      else el?.removeAttribute("data-dragging");
    }
  };

  const settle = (next: Detent) => {
    setDragging(false);
    setProgress(DETENT_P[next]);
    setDetent(next);
    if (next !== "full") return;
    // On a short phone the hero runs past the screen: once the menu has grown, bring its foot into view.
    window.setTimeout(() => {
      const dock = dockRef.current;
      const menu = menuRef.current;
      if (!dock || !menu) return;
      const overflow = menu.getBoundingClientRect().bottom + 16 - window.innerHeight;
      if (overflow <= 0) return;
      const calm =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.documentElement.hasAttribute("data-calm-motion");
      window.scrollBy({ top: overflow, behavior: calm ? "instant" : "smooth" });
    }, 560);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const from = DETENT_P[detent];
    dragRef.current = { id: event.pointerId, y: event.clientY, t: event.timeStamp, from, moved: false, p: from };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) < TAP_SLOP) return;
    if (!drag.moved) {
      // Only now does the handle take the pointer, so a plain tap still clicks the grabber.
      drag.moved = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // The pointer already ended (or is synthetic): the drag still works without capture.
      }
      setDragging(true);
    }
    // Between open and peek a pixel is a share of the slide; between full and open, of the growth.
    const towardPeek = drag.from > 0 || (drag.from === 0 && dy > 0);
    const unit = (towardPeek ? travelRef.current : growRef.current) || 1;
    let p = drag.from + dy / unit;
    // One detent per drag: past the neighbouring detent the sheet only gives a little, like a
    // rubber band, so a long swipe from the peek stops at open instead of opening the full menu.
    const low = Math.max(-1, drag.from - 1);
    const high = Math.min(1, drag.from + 1);
    if (p < low) p = low - Math.min(0.06, (low - p) * 0.2);
    if (p > high) p = high + Math.min(0.06, (p - high) * 0.2);
    drag.p = p;
    setProgress(p);
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) {
      // A tap on the grabber is its own click (keyboard and screen readers click it too);
      // a tap anywhere else on the peek opens the dock.
      const onGrabber = (event.target as HTMLElement).closest("[data-grabber]");
      if (!onGrabber && peek) settle("open");
      return;
    }
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    const speed = (event.clientY - drag.y) / Math.max(1, event.timeStamp - drag.t);
    const moved = drag.p - drag.from;
    let next = detent;
    if (moved > DRAG_COMMIT_SHARE || speed > DRAG_COMMIT_SPEED) next = detent === "full" ? "open" : "peek";
    else if (moved < -DRAG_COMMIT_SHARE || speed < -DRAG_COMMIT_SPEED) next = detent === "peek" ? "open" : "full";
    settle(next);
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const schedule = () => {
      timeoutId = setTimeout(() => setMountCyclePhotos(true), 1200);
    };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(schedule, { timeout: 2000 });
    } else {
      schedule();
    }
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  // The photo covers a tall box, so it is drawn wider than the screen: ask for a full-width file to keep it crisp.
  const photos = (mountCyclePhotos ? BACKDROP_PHOTOS : BACKDROP_PHOTOS.slice(0, 1)).map((src, index) =>
    getImageProps({
      src,
      alt: "",
      width: 1100,
      height: 619,
      sizes: "100vw",
      loading: index === 0 ? "eager" : "lazy",
      decoding: "async",
      fetchPriority: index === 0 ? "high" : "low",
    }).props,
  );

  const openSheet = (view: TriageView) =>
    setSheet((previous) => ({ view, visit: (previous?.visit ?? 0) + 1 }));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!sheet || !dialog || dialog.open) return;

    // A modal dialog: the browser keeps focus inside, closes it on Escape and, on Android, on the
    // back button, and returns focus to the button that opened it.
    dialog.showModal();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [sheet]);

  return (
    <div ref={rootRef} data-detent={detent} data-ring={ringOn ? "" : undefined} className={`flex flex-col lg:hidden ${styles.sheetRoot}`}>
      {/* Decorative ground for the whole phone hero: photos, then an ink scrim that keeps the text readable. */}
      <div aria-hidden="true" className={styles.backdrop}>
        {photos.map(({ srcSet, sizes, ...photoProps }, index) => (
          // Phones and tablets only: from lg the source never matches, so nothing is requested.
          <picture key={BACKDROP_PHOTOS[index]}>
            <source media="(max-width: 1023px)" srcSet={srcSet} sizes={sizes} />
            <img {...photoProps} src={TRANSPARENT_PIXEL} alt="" className={styles.photo} />
          </picture>
        ))}
        <div className={styles.scrim} />
        {/* A fine film grain over photo and scrim: texture, so the dark ground never reads as flat. */}
        <div className={styles.grain} />
      </div>

      <div ref={sunRef} className={`${styles.sun} ${styles.sunDissolve}`}>
        {/* The wheel and its glow move as one: up and whole into the freed space at the peek. */}
        <div className={styles.sunStage}>
        {/* Warm light on the horizon behind the chakra, breathing slowly. */}
        <div aria-hidden="true" className={styles.glow} />
        <div data-sun-wheel className={styles.wheel}>
          {/* The outer ring and, riding on it, the eight topic icons (as in the footer wheel). The
              icons stay upright as the ring turns; they come out only after a tap on the chakra. */}
          <div ref={outerRef} aria-hidden="true" className={`${styles.layer} ${styles.outer}`}>
            <svg className={styles.layer} viewBox={WHEEL_VIEW_BOX} focusable="false">
              <WheelStars stars={OUTER_STARS} className={styles.star} idPrefix="hero-dock-htw" />
            </svg>
            {WHEEL_ORDER.map((slug, index) => {
              const Icon = WHEEL_ICONS[slug];
              const angle = ((index * 360) / WHEEL_ORDER.length - 90) * (Math.PI / 180);
              const orbit = (WHEEL_NODE_ORBIT / WHEEL_VIEW) * 100;
              return (
                <span
                  key={slug}
                  className={styles.node}
                  data-active={ringOn && index === shownIndex ? "" : undefined}
                  onPointerEnter={(event) => event.pointerType === "mouse" && pin(index, false)}
                  onPointerLeave={(event) => event.pointerType === "mouse" && pin(null, false)}
                  onClick={() => pin(index, true)}
                  style={
                    {
                      "--x": `${(50 + orbit * Math.cos(angle)).toFixed(3)}%`,
                      "--y": `${(50 + orbit * Math.sin(angle)).toFixed(3)}%`,
                      "--node": index,
                    } as CSSProperties
                  }
                >
                  <span className={styles.face}>{Icon ? <Icon className={styles.icon} /> : null}</span>
                </span>
              );
            })}
          </div>
          <svg aria-hidden="true" className={`${styles.layer} ${styles.inner}`} viewBox={WHEEL_VIEW_BOX} focusable="false">
            <WheelStars stars={INNER_STARS} className={styles.star} idPrefix="hero-dock-htw" />
          </svg>
          {/* The Roma chakra at the centre, as in the desktop hero and the footer. It is also the
              switch for the topic icons on the ring: a quiet easter egg, a real button. */}
          <button
            type="button"
            aria-pressed={ringOn}
            aria-label={toggleCopy.ring}
            onClick={() => {
              pin(null, false);
              setRingOn((on) => !on);
            }}
            className={styles.hubButton}
          >
            <svg aria-hidden="true" className={styles.hub} viewBox="-50 -50 100 100" focusable="false">
              <circle r="47" fill="none" stroke="currentColor" strokeWidth="3" />
              <WheelSpokes fill="currentColor" />
            </svg>
          </button>
        </div>
        </div>
      </div>

      {/* A deep blue, translucent dock. The photo shows through it, softened by the backdrop blur;
          a line of light runs along its top edge where the glow meets it. */}
      <div ref={dockRef} className={`hero-dock-in relative -mt-6 rounded-t-3xl bg-ink-950/70 px-5 pt-2 text-paper backdrop-blur-md ${styles.dock}`}>
        <div className="mx-auto max-w-xl">
          {/* The sheet's handle: the grabber and the question. Drag it down to tuck the dock away
              and see the whole wheel, drag or tap it back up; the grabber itself is a button. */}
          <div
            ref={handleRef}
            className={styles.handle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            <button
              type="button"
              data-grabber
              aria-expanded={!peek}
              aria-label={detent === "open" ? toggleCopy.hide : toggleCopy.show}
              title={detent === "open" ? toggleCopy.hide : toggleCopy.show}
              onClick={() => {
                if (suppressClickRef.current) return;
                settle(detent === "open" ? "peek" : "open");
              }}
              className={styles.grabber}
            >
              <span aria-hidden="true" className={styles.grabberBar} />
            </button>
            <h2 className="pb-0.5 text-balance text-title font-bold leading-tight text-paper">{panel.question}</h2>
          </div>

          {/* Under the question, two bodies in one place: the open body (the main action) and the full
              menu (every need and the mediator route), crossfaded by --dock-p. Only the one showing
              is in the tab order. */}
          <div className="relative">
          <div ref={menuRef} inert={!full} aria-hidden={!full} className={styles.fullMenu}>
            <ul className="border-t border-paper/12">
              {HERO_NEED_ORDER.map((id) => {
                const need = panel.needs[id];
                const Icon = NEED_ICONS[id];
                const inner = (
                  <>
                    <Icon className="h-5 w-5 shrink-0 text-paper/60" />
                    <span className={id === "problem" ? "min-w-0 flex-1 text-pretty font-semibold" : "min-w-0 flex-1 text-pretty font-medium"}>
                      {need.label}
                    </span>
                    <ChevronRightIcon className="h-4.5 w-4.5 shrink-0 text-paper/40" />
                  </>
                );
                return (
                  <li key={id} className="border-b border-paper/12">
                    {need.direct ? (
                      <Link href={localHref(need.action.href, lang)} className={FULL_ROW}>
                        {inner}
                      </Link>
                    ) : (
                      <button type="button" aria-haspopup="dialog" onClick={() => openSheet(id)} className={FULL_ROW}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <Link
              href={localHref("/mediatori", lang)}
              className="group mt-2 inline-flex min-h-12 items-center gap-1 whitespace-nowrap rounded-xl px-1 text-body font-semibold text-amber-care-border transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper motion-reduce:transition-none"
            >
              {panel.mediators}
              <ChevronRightIcon className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <div ref={bodyRef} inert={detent !== "open"} className={styles.dockBody}>

          <Button
            type="button"
            variant="action"
            size="lg"
            fullWidth
            onClick={() => openSheet("question")}
            aria-haspopup="dialog"
            className="mt-3.5 min-h-14 justify-between bg-paper! text-ink-950! hover:bg-paper/90! max-[359px]:px-3"
          >
            {copy.primaryCta}
            <ArrowRightIcon className="h-5 w-5 shrink-0 max-[359px]:hidden" />
          </Button>

          <button
            type="button"
            onClick={() => openSheet("problem")}
            aria-haspopup="dialog"
            className="press-row -mx-2 mt-1.5 flex min-h-12 w-[calc(100%+1rem)] items-center gap-3 whitespace-nowrap rounded-xl px-2 text-left text-body font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-paper/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper motion-reduce:transition-none"
          >
            <ActivityIcon className="h-5 w-5 shrink-0 text-paper" />
            <span className="min-w-0 flex-1">{panel.needs.problem.label}</span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-paper/50" />
          </button>

          {/* Whole controls wrap to a second line when both do not fit (long labels on narrow phones). */}
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 border-t border-paper/15 pt-1.5">
            {voiceEnabled && (
              <ListenButton
                uiLang={lang}
                autoRead
                getText={() =>
                  [...copy.mobileTitle, copy.lead.split(/(?<=\.)\s+/)[0], panel.question, copy.primaryCta, panel.needs.problem.label, panel.mediators].join(" ")
                }
                label={panel.listen}
                stopLabel={panel.stopListening}
                className="border-paper/35 bg-transparent text-paper shadow-none hover:border-paper/60 hover:bg-paper/10 active:bg-paper/15 dark:border-paper/35 dark:bg-transparent dark:text-paper dark:hover:bg-paper/10 aria-[pressed=true]:border-paper aria-[pressed=true]:bg-paper/15 aria-[pressed=true]:text-paper dark:aria-[pressed=true]:border-paper dark:aria-[pressed=true]:bg-paper/15 dark:aria-[pressed=true]:text-paper"
                iconClassName="text-paper"
              />
            )}
            <Link
              href={localHref("/mediatori", lang)}
              className="group -mr-1 ml-auto inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-xl px-1 text-body font-semibold text-amber-care-border transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper motion-reduce:transition-none"
            >
              {panel.mediators}
              <ChevronRightIcon className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          </div>
          </div>
        </div>
      </div>

      {sheet && (
        <dialog
          ref={dialogRef}
          aria-label={panel.label}
          className="triage-sheet phone-sheet"
          onClose={() => setSheet(null)}
          onClick={(event) => {
            // A tap on the dimmed page behind the sheet (the dialog's own box) closes it.
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          <div className="mx-auto max-w-xl">
            <TriagePanel
              key={sheet.visit}
              variant="sheet"
              initialView={sheet.view}
              copy={panel}
              alarmSigns={copy.emergency.alarmSigns}
              lang={lang}
              onClose={() => dialogRef.current?.close()}
              closeLabel={copy.emergency.close}
            />
          </div>
        </dialog>
      )}
    </div>
  );
}
