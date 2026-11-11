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
  className,
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
        "press-row -ml-2.5 inline-flex min-h-11 items-center gap-2 rounded-(--radius-control) px-2.5 text-[15px] font-medium text-sapphire underline decoration-sapphire/30 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-soft/60 hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <StethoscopeIcon className="h-4 w-4 shrink-0" />
      <span>{t.quiz.askDoctorHandover}</span>
    </Link>
  );
}
