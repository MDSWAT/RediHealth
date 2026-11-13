"use client";

import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { litProgress, litTopicIndex } from "./health-topics-wheel-config";

export type SpotlightTopic = {
  slug: string;
  title: string;
  description: string;
  image: string;
  href: string;
  /** The wheel button's icon, rendered on the server. */
  icon: ReactNode;
};

type HealthTopicsSpotlightProps = {
  /** In wheel order (clockwise from the top), so an index here is a button on the ring. */
  topics: SpotlightTopic[];
  /** The topic wheel. Desktop only. */
  wheel: ReactNode;
  heading: ReactNode;
  /** Rendered under the heading: the photo grid below desktop, the link to every guide. */
  children: ReactNode;
};

/**
 * Desktop layout for the landing health topics. It fits one screen from about 650px of window
 * height: on screens under 820px tall the card turns sideways (photo left, text right) instead of
 * squashing its photo. The layout: the wheel on the left, and on the right one
 * topic card that follows the wheel or the chosen topic. Under the card every topic is listed by
 * name: pointing at a name, or focusing it, turns the wheel until that topic's button is the lit
 * one. Hovering or focusing anywhere inside the spotlight section pauses the wheel, and once a
 * topic is hovered or focused on either the wheel or list it stays selected after the pointer
 * leaves. Below desktop only the heading and `children` render.
 */
export function HealthTopicsSpotlight({ topics, wheel, heading, children }: HealthTopicsSpotlightProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  const [held, setHeld] = useState(false);

  // Follow the ring's own animation clock, so the card and the lit button never drift apart.
  useEffect(() => {
    const host = wheelRef.current;
    const ring = host?.querySelector<HTMLElement>("[data-wheel-ring]");
    if (!host || !ring || typeof ring.getAnimations !== "function") return;

    let timer: number | undefined;
    const read = () => {
      const progress = ring.getAnimations()[0]?.effect?.getComputedTiming().progress;
      if (typeof progress === "number") setLit(litTopicIndex(progress, topics.length));
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && timer === undefined) {
        read();
        timer = window.setInterval(read, 250);
      } else if (!entry.isIntersecting) {
        stop();
      }
    });
    observer.observe(host);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [topics.length]);

  // A topic chosen by hovering or focusing either a wheel button or a list link. It stays
  // selected after the pointer leaves. Choosing from the list turns the wheel's animation clocks
  // (ring, faces, lit copies) together until that button reaches the highlight angle.
  const [picked, setPicked] = useState<string | null>(null);
  const turnFrame = useRef<number | undefined>(undefined);
  useEffect(() => () => window.cancelAnimationFrame(turnFrame.current ?? 0), []);

  const selectTopic = (slug: string, turnWheel: boolean) => {
    setPicked(slug);
    window.cancelAnimationFrame(turnFrame.current ?? 0);
    const host = wheelRef.current;
    if (!host) return;
    for (const node of host.querySelectorAll<HTMLElement>("[data-topic]")) {
      node.toggleAttribute("data-picked", node.dataset.topic === slug);
    }
    if (!turnWheel) return;
    const index = topics.findIndex((topic) => topic.slug === slug);
    const ring = host.querySelector<HTMLElement>("[data-wheel-ring]");
    const ringClock = ring?.getAnimations?.()[0];
    const turn = Number(ringClock?.effect?.getComputedTiming().duration);
    // No clock under reduced motion: the wheel stays still and only the lit button and card change.
    if (index < 0 || !ring || !ringClock || !Number.isFinite(turn) || turn <= 0) return;

    const now = ((Number(ringClock.currentTime) % turn) + turn) % turn;
    // The short way round, forwards or backwards.
    const delta = ((((litProgress(index, topics.length) * turn - now) % turn) + turn * 1.5) % turn) - turn / 2;
    const clocks = [ring, ...host.querySelectorAll<HTMLElement>("[data-wheel-clock]")]
      .flatMap((element) => element.getAnimations())
      // A clock may not run below zero; one whole turn later looks the same.
      .map((clock) => ({ clock, from: Number(clock.currentTime) + (delta < 0 ? turn : 0) }));
    const duration = 350 + 450 * (Math.abs(delta) / (turn / 2));
    let started: number | undefined;
    const step = (time: number) => {
      started ??= time;
      const t = Math.min((time - started) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      for (const { clock, from } of clocks) clock.currentTime = from + delta * eased;
      if (t < 1) turnFrame.current = window.requestAnimationFrame(step);
    };
    turnFrame.current = window.requestAnimationFrame(step);
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const staysInside = (event: FocusEvent<HTMLElement>) =>
    event.relatedTarget instanceof Node && Boolean(rootRef.current?.contains(event.relatedTarget));

  const selectFromWheelTarget = (target: EventTarget) => {
    const slug = (target as Element).closest?.("[data-topic]")?.getAttribute("data-topic");
    if (slug) selectTopic(slug, false);
  };

  const pickedIndex = picked === null ? -1 : topics.findIndex(({ slug }) => slug === picked);
  const active = pickedIndex >= 0 ? pickedIndex : lit;

  return (
    <div
      ref={rootRef}
      data-wheel-held={held ? "" : undefined}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!staysInside(event)) setHeld(false);
      }}
      className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-x-12 xl:gap-x-16"
    >
      <div
        ref={wheelRef}
        className="hidden lg:block"
        onPointerOver={(event) => selectFromWheelTarget(event.target)}
        onFocus={(event) => selectFromWheelTarget(event.target)}
      >
        {wheel}
      </div>

      <div className="min-w-0">
        {heading}

        <div className="mt-[clamp(1rem,3svh,2rem)] hidden lg:block">
        {/* Every card shares one grid cell, so the tallest sets the height and nothing jumps. */}
        <div className="grid">
          {topics.map(({ slug, title, description, image, href, icon }, index) => {
            const shown = index === active;
            return (
              <Link
                key={slug}
                href={href}
                inert={!shown}
                className={cn(
                  "press-row group col-start-1 row-start-1 flex flex-col [@media(max-height:820px)]:flex-row overflow-hidden rounded-(--radius-surface) border border-sand-line bg-card transition-[opacity,translate,border-color] duration-(--dur-base) ease-(--ease-out-calm) hover:border-sapphire/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:border-white/10 dark:bg-ink-800 dark:hover:border-white/25 dark:focus-visible:ring-paper",
                  shown ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                )}
              >
                <div className="relative h-[clamp(8rem,calc(100svh-43rem),17.5rem)] shrink-0 overflow-hidden bg-surface-subtle [@media(max-height:820px)]:h-auto [@media(max-height:820px)]:min-h-[clamp(9rem,calc(100svh-28rem),15rem)] [@media(max-height:820px)]:w-2/5">
                  <Image src={image} alt="" fill sizes="(min-width: 1024px) 40vw, 1px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 items-start gap-4 p-5 [@media(max-height:820px)]:self-center [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:p-4">
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white [--wheel-face-bg:var(--color-primary)] [&>svg]:h-6 [&>svg]:w-6"
                  >
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-balance text-xl font-semibold leading-snug text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire motion-reduce:transition-none dark:text-paper dark:group-hover:text-sapphire-border">
                      {title}
                    </h3>
                    <p className="mt-1 text-pretty text-body text-muted-foreground dark:text-mist">{description}</p>
                  </div>
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0 text-sapphire transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none dark:text-paper"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Every topic by name, in wheel order. The one on the card is set in bold. */}
        <ul className="mt-[clamp(0.5rem,2svh,1rem)] grid grid-cols-2 gap-x-6">
          {topics.map(({ slug, title, href }, index) => {
            const current = index === active;
            return (
              <li key={slug} className="min-w-0">
                <Link
                  href={href}
                  onPointerEnter={() => selectTopic(slug, true)}
                  onFocus={() => selectTopic(slug, true)}
                  className={cn(
                    "group flex min-h-11 [@media(max-height:820px)]:min-h-9 items-center gap-3 rounded-(--radius-control) py-1 text-body transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:focus-visible:ring-paper",
                    current
                      ? "font-semibold text-foreground dark:text-paper"
                      : "text-muted-foreground hover:text-foreground dark:text-mist dark:hover:text-paper",
                  )}
                >
                  <span className="min-w-0 wrap-break-word">{title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>

        {children}
      </div>
    </div>
  );
}
