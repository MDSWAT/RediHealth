"use client";

import Link from "next/link";
import { StethoscopeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

export interface MythDoctorHandoverButtonProps {
  mythId: string;
  mythStatement: string;
  className?: string;
}

/** "Have doubts? Ask an online doctor": hands the myth over to the online doctor page. */
export function MythDoctorHandoverButton({
  mythId,
  mythStatement,
  className = "",
}: MythDoctorHandoverButtonProps) {
  const { lang, t } = useLanguage();

  const queryParams = new URLSearchParams({
    context: `myth_${mythId}`,
    statement: mythStatement,
  });

  const targetHref = withLangPrefix(`/medic-online?${queryParams.toString()}`, lang);

  return (
    <Link
      href={targetHref}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 self-start rounded-lg px-2.5 -ml-2.5 text-sm font-semibold text-sapphire underline decoration-sapphire/35 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-soft/60 hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:self-auto",
        className,
      )}
    >
      <StethoscopeIcon className="h-4 w-4 shrink-0 text-sapphire" />
      <span>{t.quiz.askDoctorHandover}</span>
    </Link>
  );
}
