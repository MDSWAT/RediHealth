"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileTextIcon, StethoscopeIcon } from "@/components/ui/icons";

const items = [
  { href: "/health-assistant", label: "Health chat", Icon: StethoscopeIcon },
  { href: "/prescription-review", label: "Prescription review", Icon: FileTextIcon },
];

export function AssistantNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Health assistant" className="mb-6 flex gap-1 border-b border-border">
      {items.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"}`}>
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}