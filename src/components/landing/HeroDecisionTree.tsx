"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  HandHelpingIcon,
  PrescriptionIcon,
  SparklesIcon,
  VolumeIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

type BranchId = "learn" | "check" | "symptoms" | "prescription" | "navigation";

interface HeroDecisionTreeProps {
  onTriggerEmergency?: () => void;
}

export function HeroDecisionTree({ onTriggerEmergency }: HeroDecisionTreeProps) {
  const [activeBranch, setActiveBranch] = useState<BranchId | null>(null);
  const [plainLanguage, setPlainLanguage] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Pathway 2 interactive risk state
  const [riskAnswers, setRiskAnswers] = useState<Record<number, boolean>>({});

  // Pathway 3 red-flag gate state
  const [symptomWarningTriggered, setSymptomWarningTriggered] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  // Pathway 1 selected topic
  const [selectedTopic, setSelectedTopic] = useState<number>(0);

  const { t } = useLanguage();
  const triage = t.hero.triage;

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Audio speech synthesis helper (Change 31)
  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      return;
    }

    let textToRead = "";
    if (!activeBranch) {
      textToRead = `${triage.question}. ${triage.subQuestion} ${triage.options.map((o) => o.title).join(". ")}`;
    } else if (activeBranch === "learn") {
      textToRead = "Educație medicală de bază. Vaccinurile conțin virus inactivat și învață sistemul imunitar să lupte fără să te îmbolnăvească. Verifică lecțiile validate de medici.";
    } else if (activeBranch === "check") {
      textToRead = "Verificare rapidă a riscului de sănătate în nouăzeci de secunde. Răspunde la cele trei întrebări despre istoricul familial, simptome și stil de viață.";
    } else if (activeBranch === "symptoms") {
      textToRead = "Triage pentru probleme de sănătate. Dacă ai dureri mari în piept, respirație grea sau amorțeală, sună la 112. Pentru simptome ușoare, medicul de gardă este online.";
    } else if (activeBranch === "prescription") {
      textToRead = "Ghid pentru rețetă medicală și tratament. Respectă orarul medicamentelor și nu opri antibioticele înainte de termenul recomandat de medic.";
    } else if (activeBranch === "navigation") {
      textToRead = "Îndrumare pentru drepturi medicale și medic de familie. Urgențele sunt gratuite la spital fără asigurare sau buletin. Mediatorul sanitar te ajută cu actele.";
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "ro-RO";
    utterance.rate = 0.95;
    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = () => setIsAudioPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsAudioPlaying(true);
  };

  const getBranchIcon = (id: string, className = "h-5 w-5") => {
    switch (id) {
      case "learn":
        return <BookIcon className={`${className} text-sapphire`} />;
      case "check":
        return <ClipboardCheckIcon className={`${className} text-[#b45309]`} />;
      case "symptoms":
        return <ActivityIcon className={`${className} text-primary`} />;
      case "prescription":
        return <PrescriptionIcon className={`${className} text-amber-care`} />;
      case "navigation":
      default:
        return <HandHelpingIcon className={`${className} text-sapphire`} />;
    }
  };

  // Risk evaluation calculation
  const yesCount = Object.values(riskAnswers).filter(Boolean).length;
  const riskLevel =
    yesCount === 0
      ? { text: "Risc scăzut: menține stilul de viață sănătos și fă un control anual.", level: "low" }
      : yesCount === 1
      ? { text: "Risc moderat: adoptă măsuri preventive privind alimentația și mișcarea.", level: "moderate" }
      : { text: "Risc ce necesită atenție: îți recomandăm un consult medical preventiv.", level: "high" };

  // Topics for Pathway 1
  const learnTopics = [
    {
      title: "Vaccinuri sigure",
      myth: "Mit: Vaccinul antigripal provoacă gripă.",
      reality: "Realitate: Vaccinul conține virus inactivat care învață sistemul imunitar să lupte fără să te îmbolnăvească.",
    },
    {
      title: "Tensiune și inimă",
      myth: "Mit: Dacă nu mă doare capul, tensiunea mea este bună.",
      reality: "Realitate: Tensiunea mare este adesea silențioasă. Măsurarea regulată și mai puțină sare previn complicațiile.",
    },
    {
      title: "Sănătatea copilului",
      myth: "Mit: Orice febră a copilului se tratează cu antibiotice.",
      reality: "Realitate: Majoritatea virozelor trec cu hidratare și antitermice obișnuite; antibioticele distrug doar bacteriile.",
    },
    {
      title: "Gripă și răceală",
      myth: "Mit: Antibioticele vindecă răceala mai repede.",
      reality: "Realitate: Răceala este virală; antibioticele nu au efect pe virusuri și pot crea rezistență periculoasă.",
    },
  ];

  return (
    <div className="hero-luminous-card relative flex flex-col overflow-hidden border border-border bg-[#f8f9fa] shadow-xl text-foreground">
      <div className="hero-border-beam" aria-hidden="true" />

      {/* Decision Tree Header */}
      <div className="border-b border-border/80 bg-white/70 px-4 sm:px-6 py-3.5 backdrop-blur-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sapphire-soft border border-sapphire-border px-2.5 py-0.5 text-[11px] font-semibold text-sapphire">
            <SparklesIcon className="h-3.5 w-3.5" />
            {triage.badge}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {activeBranch ? "Pasul 2 din 3" : "Pasul 1 din 3"}
          </span>
        </div>

        {/* Accessibility utility buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlainLanguage(!plainLanguage)}
            title="Activează explicațiile în limbaj simplificat"
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
              plainLanguage
                ? "bg-primary text-white"
                : "bg-surface-subtle text-muted-foreground hover:text-foreground"
            }`}
          >
            Limbaj simplu
          </button>
          <button
            type="button"
            onClick={handleToggleAudio}
            aria-label={isAudioPlaying ? "Oprește citirea audio" : "Ascultă opțiunile citite cu voce tare"}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-subtle text-foreground hover:bg-primary-soft hover:text-primary transition"
          >
            {isAudioPlaying ? (
              <span className="flex items-center gap-0.5">
                <span className="soundwave-bar h-2 w-0.5 bg-primary rounded-full" />
                <span className="soundwave-bar h-3.5 w-0.5 bg-primary rounded-full" />
                <span className="soundwave-bar h-2 w-0.5 bg-primary rounded-full" />
              </span>
            ) : (
              <VolumeIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Decision Tree Body */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
        {!activeBranch ? (
          /* ROOT LEVEL: 5 PATHWAY BUTTONS */
          <div>
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {triage.question}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {triage.subQuestion}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {triage.options.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveBranch(option.id as BranchId)}
                  className="group relative flex w-full items-center justify-between rounded-xl border border-border/80 bg-white p-3 sm:p-3.5 text-left shadow-2xs transition-all duration-150 hover:border-primary/40 hover:bg-primary-soft/30 hover:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle shadow-2xs group-hover:bg-white transition-colors">
                      {getBranchIcon(option.id)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {index + 1}. {option.title}
                      </p>
                      <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground leading-snug line-clamp-1">
                        {plainLanguage
                          ? option.id === "prescription"
                            ? "Cum să iei pastilele corect și la ce oră."
                            : option.desc
                          : option.desc}
                      </p>
                    </div>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* IN-SITU BRANCH DRILLDOWN (Step 2) */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <button
                type="button"
                onClick={() => {
                  setActiveBranch(null);
                  setSymptomWarningTriggered(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                {triage.backButton}
              </button>
              <span className="text-[11px] font-medium text-sapphire">
                Ghidaj personalizat
              </span>
            </div>

            {/* BRANCH 1: LEARN ABOUT HEALTH */}
            {activeBranch === "learn" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire">
                    <BookIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Lecții simple și mituri medicale explicate
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Alege un subiect pentru explicații verificate de medici specialiști:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {learnTopics.map((item, idx) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setSelectedTopic(idx)}
                      className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                        selectedTopic === idx
                          ? "bg-sapphire text-white shadow-2xs"
                          : "bg-white border border-border text-foreground hover:bg-surface-subtle"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-sapphire-border bg-sapphire-soft/70 p-3.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sapphire bg-white px-2 py-0.5 rounded-full border border-sapphire-border">
                      <CheckCircleIcon className="h-3 w-3" /> Validat de medici
                    </span>
                  </div>
                  <p className="mt-2 font-bold text-sapphire">
                    {learnTopics[selectedTopic].myth}
                  </p>
                  <p className="mt-1 text-foreground leading-relaxed">
                    {learnTopics[selectedTopic].reality}
                  </p>
                </div>

                <Link
                  href="/health-information"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-sapphire px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sapphire-light transition"
                >
                  Vezi toate lecțiile validate de medici
                </Link>
              </div>
            )}

            {/* BRANCH 2: CHECK HEALTH RISK */}
            {activeBranch === "check" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-care-soft text-amber-care">
                    <ClipboardCheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Verifică riscul tău de sănătate în 90 de secunde
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Răspunde cu Da sau Nu la cele 3 întrebări preventive:
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    "Ai peste 45 de ani sau cazuri de diabet sau tensiune mare în familie?",
                    "Simți oboseală neobișnuită, sete permanentă sau amețeală la efort?",
                    "Fumezi zilnic sau ai o alimentație bogată în grăsimi și sare?",
                  ].map((q, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-white p-2.5 flex items-center justify-between gap-2"
                    >
                      <p className="text-[11px] font-medium text-foreground min-w-0 pr-2">
                        {q}
                      </p>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRiskAnswers((prev) => ({ ...prev, [idx]: true }))}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                            riskAnswers[idx] === true
                              ? "bg-primary text-white"
                              : "bg-surface-subtle text-foreground hover:bg-muted"
                          }`}
                        >
                          Da
                        </button>
                        <button
                          type="button"
                          onClick={() => setRiskAnswers((prev) => ({ ...prev, [idx]: false }))}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                            riskAnswers[idx] === false
                              ? "bg-sapphire text-white"
                              : "bg-surface-subtle text-foreground hover:bg-muted"
                          }`}
                        >
                          Nu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculated Risk Result */}
                <div
                  className={`rounded-xl border p-3 text-xs leading-relaxed ${
                    riskLevel.level === "high"
                      ? "border-primary/40 bg-primary-soft/70 text-foreground"
                      : riskLevel.level === "moderate"
                      ? "border-amber-care-border bg-amber-care-soft text-foreground"
                      : "border-border bg-white text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <span className="micro-status-dot" />
                    <span>Evaluare preliminară instantanee</span>
                  </div>
                  <p className="mt-1 text-[11px]">{riskLevel.text}</p>
                </div>

                <Link
                  href="/health-check"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition"
                >
                  Începe verificarea completă a sănătății
                </Link>
              </div>
            )}

            {/* BRANCH 3: ACUTE SYMPTOM SAFETY CHECK */}
            {activeBranch === "symptoms" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <ActivityIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Verificare siguranță și medic de gardă
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Filtru clinic de siguranță pentru simptome acute:
                    </p>
                  </div>
                </div>

                {/* Mandatory Red-Flag Safety Gate */}
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    symptomWarningTriggered
                      ? "animate-triage-shake border-primary bg-primary-soft"
                      : "border-primary/30 bg-primary-soft/40"
                  }`}
                >
                  <p className="font-bold text-primary">
                    Atenție: ai dureri puternice în piept, respirație grea bruscă, amorțeală pe o parte a corpului sau leșin?
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSymptomWarningTriggered(true);
                        if (onTriggerEmergency) onTriggerEmergency();
                      }}
                      className="flex-1 rounded-lg bg-[#e63946] py-2 text-xs font-bold text-white hover:bg-[#d90429] transition shadow-xs"
                    >
                      Da, am aceste semne grave
                    </button>
                    <button
                      type="button"
                      onClick={() => setSymptomWarningTriggered(false)}
                      className="flex-1 rounded-lg border border-border bg-white py-2 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
                    >
                      Nu, am alte simptome ușoare
                    </button>
                  </div>
                </div>

                {/* Mild Symptom Selector */}
                <div className="rounded-xl border border-border bg-white p-3 text-xs space-y-2">
                  <p className="font-semibold text-foreground">
                    Alege categoria simptomului tău:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {["Febră moderată", "Durere de cap", "Tuse sau gât uscat", "Dureri de stomac"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSymptom(s)}
                        className={`rounded-lg p-2 text-left transition ${
                          selectedSymptom === s
                            ? "bg-sapphire text-white font-bold"
                            : "bg-surface-subtle text-foreground hover:bg-muted"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Doctor on duty real-time status */}
                  <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="micro-status-dot" />
                      Medic de gardă disponibil
                    </span>
                    <span className="font-semibold text-foreground">Așteptare: sub 10 min</span>
                  </div>
                </div>

                <Link
                  href="/get-help?mode=doctor"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition"
                >
                  Intră în legătură cu medicul de gardă
                </Link>
              </div>
            )}

            {/* BRANCH 4: PRESCRIPTION EXPLANATION */}
            {activeBranch === "prescription" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-care-soft text-amber-care">
                    <PrescriptionIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Ghid simplu pentru rețeta ta medicală
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Află cum să iei tratamentul corect și ce greșeli să eviți:
                    </p>
                  </div>
                </div>

                {/* Dosage Schedule Timeline */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="rounded-xl border border-border bg-white p-2.5">
                    <p className="font-bold text-amber-700">Dimineața</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                      După micul dejun cu apă
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-2.5">
                    <p className="font-bold text-amber-700">Prânz</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                      În timpul mesei de zi
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-2.5">
                    <p className="font-bold text-amber-700">Seara</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                      Înainte de culcare
                    </p>
                  </div>
                </div>

                {/* Laser scan animation preview */}
                <div className="relative overflow-hidden rounded-xl border border-amber-care-border bg-amber-care-soft/40 p-3 text-xs">
                  <div className="prescription-scan-line" aria-hidden="true" />
                  <p className="font-bold text-foreground">
                    Regula esențială pentru antibiotice:
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    Nu întrerupe tratamentul cu antibiotice chiar dacă te simți mai bine; ia pastilele până la sfârșitul perioadei indicate de medic.
                  </p>
                </div>

                <Link
                  href="/health-assistant?tab=prescription"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition"
                >
                  Explică rețeta pas cu pas
                </Link>
              </div>
            )}

            {/* BRANCH 5: HEALTHCARE NAVIGATION & CNAS */}
            {activeBranch === "navigation" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire">
                    <HandHelpingIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Drepturi medicale și medic de familie
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Îndrumare clară pentru persoane neasigurate sau fără acte:
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="rounded-xl border border-border bg-white p-2.5">
                    <p className="font-bold text-sapphire">1. Dreptul gratuit la urgență</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                      Orice persoană are dreptul legal la îngrijire de urgență gratuită la spital, chiar dacă nu are asigurare CNAS sau buletin.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-2.5">
                    <p className="font-bold text-sapphire">2. Înscriere la medic de familie</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                      Actele necesare: buletin sau adeverință provizorie și o cerere tip completată direct la cabinetul medicului ales.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-2.5">
                    <p className="font-bold text-sapphire">3. Ajutor de la mediatorul sanitar</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                      Dacă întâmpini dificultăți, mediatorul sanitar din localitatea ta te poate sprijini gratuit cu actele și programarea.
                    </p>
                  </div>
                </div>

                <Link
                  href="/get-help?mode=mediator"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-sapphire px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sapphire-light transition"
                >
                  Cere ajutorul unui mediator sanitar
                </Link>
              </div>
            )}

            {/* MANDATORY UNIVERSAL TERMINAL DOCTOR CONNECTION PROMPT (Change 7) */}
            <div className="mt-4 rounded-xl border border-sapphire-border bg-sapphire-soft p-3.5 sm:p-4 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sapphire sm:text-sm">
                    {triage.doctorPrompt}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-sapphire/85 leading-snug">
                    Consultație gratuită prin apel video sau telefonic, fără programare complicată.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/get-help?mode=doctor"
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-sapphire px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sapphire-light transition text-center"
                >
                  {triage.doctorScheduleCta}
                </Link>
                <Link
                  href="/get-help?mode=duty"
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-sapphire bg-white px-3 py-2 text-xs font-semibold text-sapphire hover:bg-sapphire-soft transition text-center"
                >
                  {triage.doctorOnDutyCta}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer reassurance bar */}
        <div className="mt-4 border-t border-border/60 pt-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            {triage.reassurance}
          </p>
        </div>
      </div>
    </div>
  );
}
