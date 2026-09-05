"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { ArrowRightIcon, BellIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, CloseIcon, FileTextIcon, LogOutIcon, MenuIcon, StethoscopeIcon, UsersIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

type AdminShellProps = {
  children: ReactNode;
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  pendingCount?: number;
  overdueCount?: number;
};

export function AdminShell({
  children,
  userEmail,
  userRole = "Administrator",
  isAdmin = true,
  pendingCount = 0,
  overdueCount = 0,
}: AdminShellProps) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = panelTranslations[lang].adminShell;
  const normalizedPathname = stripLangFromPathname(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminItems = [
    {
      label: t.requests,
      href: "/panel",
      icon: FileTextIcon,
    },
    {
      label: t.patients,
      href: "/panel/patients",
      icon: UsersIcon,
    },
    {
      label: t.workers,
      href: "/panel/workers",
      icon: StethoscopeIcon,
    },
    {
      label: t.followups,
      href: "/panel/followups",
      icon: ClockIcon,
    },
    {
      label: t.calendar,
      href: "/panel/calendar",
      icon: CalendarIcon,
    },
    {
      label: t.mediator,
      href: "/panel/mediator",
      icon: FileTextIcon,
    },
  ];

  const visibleItems = adminItems.filter((item) => {
    if (item.href === "/panel/workers" && !isAdmin) {
      return false;
    }
    if (item.href === "/panel/mediator" && userRole.trim().toLowerCase() !== "mediator" && !isAdmin) {
      return false;
    }
    return true;
  });

  const navigation = (
    <>
      <div className={`flex h-20 items-center border-b border-border ${sidebarCollapsed ? "justify-center px-3" : "px-5"}`}>
        <Logo href={withLangPrefix("/", lang)} className={`[&_img]:h-10 [&_img]:w-10 ${sidebarCollapsed ? "sr-only" : ""}`} />
        <button
          type="button"
          onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground xl:inline-flex ${sidebarCollapsed ? "" : "ml-auto"}`}
          aria-label={sidebarCollapsed ? t.expandNav : t.minimizeNav}
          title={sidebarCollapsed ? t.expandNav : t.minimizeNav}
        >
          {sidebarCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      <nav className={`flex-1 px-3 py-6 ${sidebarCollapsed ? "px-2" : ""}`} aria-label="Admin navigation">
        <p className={`px-3 text-xs font-semibold uppercase text-muted-foreground ${sidebarCollapsed ? "sr-only" : ""}`}>
          {t.manage}
        </p>
        <ul className="mt-2 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/panel"
                ? normalizedPathname === "/panel"
                : normalizedPathname === item.href || normalizedPathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={withLangPrefix(item.href, lang)}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${sidebarCollapsed ? "justify-center px-2" : ""} ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className={sidebarCollapsed ? "sr-only" : ""}>{item.label}</span>
                  {item.href === "/panel" && pendingCount > 0 && !sidebarCollapsed ? (
                    <span
                      className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400"
                      title={t.pendingRequests(pendingCount)}
                    >
                      <BellIcon className="h-3.5 w-3.5" />
                      <span>{pendingCount}</span>
                    </span>
                  ) : item.href === "/panel/followups" && overdueCount > 0 && !sidebarCollapsed ? (
                    <span
                      className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white animate-pulse"
                      title={t.overdueFollowups(overdueCount)}
                    >
                      <BellIcon className="h-3.5 w-3.5" />
                      <span>{overdueCount}</span>
                    </span>
                  ) : active && !sidebarCollapsed ? (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`border-t border-border p-4 space-y-1 ${sidebarCollapsed ? "p-2" : ""}`}>
        <div className={`px-2 pb-2 ${sidebarCollapsed ? "sr-only" : ""}`}>
          <p className="text-xs font-semibold text-foreground">{userRole}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground" title={userEmail}>
            {userEmail}
          </p>
        </div>
        <Link
          href={withLangPrefix("/", lang)}
          className={`flex min-h-11 items-center justify-between rounded-lg px-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground ${sidebarCollapsed ? "justify-center" : ""}`}
          title={sidebarCollapsed ? t.returnToWebsite : undefined}
        >
          <span className={sidebarCollapsed ? "sr-only" : ""}>{t.returnToWebsite}</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: withLangPrefix("/sign-in", lang) })}
          className={`flex min-h-11 w-full items-center justify-between rounded-lg px-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
          title={sidebarCollapsed ? t.signOut : undefined}
        >
          <span className={sidebarCollapsed ? "sr-only" : ""}>{t.signOut}</span>
          <LogOutIcon className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen bg-muted xl:grid ${sidebarCollapsed ? "xl:grid-cols-[80px_minmax(0,1fr)]" : "xl:grid-cols-[248px_minmax(0,1fr)]"}`}>
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card xl:flex">
        {navigation}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:h-16 sm:px-6 xl:hidden">
          <Logo href={withLangPrefix("/", lang)} className="[&_img]:h-9 [&_img]:w-9" />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            aria-label={t.openMenu}
            aria-expanded={menuOpen}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </header>

        {menuOpen ? (
          <div className="fixed inset-0 z-50 xl:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/35"
              aria-label={t.closeMenu}
              onClick={() => setMenuOpen(false)}
            />
            <aside className="relative flex h-full w-[min(86vw,320px)] flex-col bg-card shadow-xl">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="absolute right-3 top-5 inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t.closeMenu}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              {navigation}
            </aside>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
