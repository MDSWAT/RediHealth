"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileTextIcon, StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

export function AssistantNavigation() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const normalizedPathname = stripLangFromPathname(pathname);
  const t = {
    en: {
      navLabel: "Health assistant",
      chat: "Health chat",
      prescription: "Prescription review",
    },
    ro: {
      navLabel: "Asistent medical",
      chat: "Chat medical",
      prescription: "Revizuire reteta",
    },
    sq: {
      navLabel: "Asistent shendetesor",
      chat: "Bisede shendetesore",
      prescription: "Shqyrtim recete",
    },
    it: {
      navLabel: "Assistente sanitario",
      chat: "Chat sanitario",
      prescription: "Revisione prescrizione",
    },
  }[lang];

  const items = [
    { href: "/health-assistant", label: t.chat, Icon: StethoscopeIcon },
    { href: "/prescription-review", label: t.prescription, Icon: FileTextIcon },
  ];

  return (
    <nav aria-label={t.navLabel} className="mb-6 flex gap-1 border-b border-border">
      {items.map(({ href, label, Icon }) => {
        const isActive = normalizedPathname === href;
        return (
          <Link key={href} href={withLangPrefix(href, lang)} className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"}`}>
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}