"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  HeartHandshakeIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { HeroEmergencyNotice } from "@/components/landing/HeroEmergencyNotice";
import { HeroDecisionTree } from "@/components/landing/HeroDecisionTree";
import { HeroPortals } from "@/components/landing/HeroPortals";

export function Hero({ showAssistantCta }: { showAssistantCta?: boolean }) {
  const { t } = useLanguage();
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const handleScrollToDecisionTree = () => {
    const el = document.getElementById("hero-decision-tree-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#fcfbf9]">
      {/* Persistent 112 Emergency Apex Ribbon */}
      <HeroEmergencyNotice
        isOpen={emergencyModalOpen}
        onOpenChange={setEmergencyModalOpen}
      />

      {/* Ambient Aceternity Spotlight Illumination */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-[48rem] rounded-full bg-gradient-to-b from-sapphire/15 via-primary/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative py-8 sm:py-12 lg:py-14">
        {/* Top utility row with dual audience pills and trust badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-care-border bg-amber-care-soft/80 px-3.5 py-1 text-xs font-semibold text-amber-700">
            <HeartHandshakeIcon className="h-3.5 w-3.5 text-amber-care" />
            <span>{t.hero.trustBadge}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/get-help?mode=doctor"
              className="inline-flex items-center gap-1.5 rounded-full border border-sapphire-border bg-sapphire-soft px-3 py-1 text-xs font-medium text-sapphire transition hover:bg-sapphire hover:text-white"
            >
              <VideoIcon className="h-3.5 w-3.5" />
              {t.hero.telemedicinePill}
            </Link>
            <Link
              href="/panel"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-care-border bg-amber-care-soft px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-care hover:text-white"
            >
              <UsersIcon className="h-3.5 w-3.5" />
              {t.hero.mediatorPill}
            </Link>
          </div>
        </div>

        {/* 1280x800 Viewport Fold Layout: Two Column Grid */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,1fr)] lg:gap-12 xl:gap-16">
          {/* Left Column: Narrative, Primary CTAs and Dual Portals */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Bilingual cultural greeting */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground">
                <span>Bună ziua</span>
                <span className="text-border">·</span>
                <span className="text-amber-care">Lacho dive</span>
                <span className="text-border">·</span>
                <span>Hello</span>
              </div>

              {/* Main Headline strictly following sentence casing */}
              <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
                <span className="block">{t.hero.titleLine1}</span>
                <span className="block text-foreground/90">{t.hero.titleLine2}</span>
                <span className="block text-primary">{t.hero.titleLine3}</span>
              </h1>

              {/* Description Paragraph */}
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
                {t.hero.paragraph}
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button
                  onClick={handleScrollToDecisionTree}
                  size="lg"
                  className="bg-primary hover:bg-primary-hover text-white shadow-md font-bold"
                >
                  {t.hero.cta}
                </Button>

                {(showAssistantCta || t.hero.assistantAlwaysVisible) && (
                  <Link
                    href={t.hero.assistantHref}
                    className="inline-flex min-h-11 items-center text-xs sm:text-sm font-semibold text-foreground underline decoration-primary/60 underline-offset-4 hover:text-primary transition"
                  >
                    {t.hero.assistantCta}
                  </Link>
                )}
              </div>
            </div>

            {/* Dual Audience Portals for Telemedicine and Mediators */}
            <HeroPortals />
          </div>

          {/* Right Column: Interactive 3-Click Decision Tree Engine */}
          <div id="hero-decision-tree-anchor" className="scroll-mt-24">
            <HeroDecisionTree
              onTriggerEmergency={() => setEmergencyModalOpen(true)}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
