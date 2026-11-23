"use client";

import { useState } from "react";
import { ArrowRightIcon, CalendarIcon, CameraIcon, PlusIcon, StethoscopeIcon, UsersIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import { panelWorkspaceTranslations } from "@/lib/i18n/panel-workspace-translations";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { PanelLink, usePanelRuntime } from "./PanelRuntime";
import { CreatePatientModal } from "./CreatePatientModal";

export function PanelOverview({ isAdmin, isRomania, databaseAvailable }: {
  isAdmin: boolean; isRomania: boolean; databaseAvailable: boolean;
}) {
  const { lang } = useLanguage();
  const { canOpen, demo } = usePanelRuntime();
  const [creating, setCreating] = useState(false);
  const t = panelTranslations[lang].adminShell;
  const design = panelDesignTranslations[lang];
  const copy = panelWorkspaceTranslations[lang];
  const tools = [
    { href: "/panel/patients", label: t.patients, hint: design.patientsHint, icon: UsersIcon },
    { href: "/panel/calendar", label: t.calendar, hint: design.calendarHint, icon: CalendarIcon },
    { href: "/panel/meet", label: design.video, hint: copy.meetingsHint, icon: CameraIcon },
    ...(isAdmin && !demo ? [{ href: "/panel/workers", label: t.workers, hint: copy.teamHint, icon: StethoscopeIcon }] : []),
  ].filter((tool) => canOpen(tool.href));

  return <>
    <header className="panel-overview-heading">
      <div><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      <Button variant="action" disabled={!databaseAvailable} onClick={() => setCreating(true)}>
        <PlusIcon className="h-4 w-4" aria-hidden="true" />{crmTranslations[lang].createPatient}
      </Button>
    </header>
    <nav className="panel-tool-directory" aria-label={copy.tools}>
      {tools.map(({ href, label, hint, icon: Icon }) => <PanelLink key={href} href={withLangPrefix(href, lang)} className="panel-tool-link">
        <div className="panel-tool-title"><Icon className="h-5 w-5" aria-hidden="true" /><span>{label}</span><ArrowRightIcon className="panel-tool-arrow h-4 w-4" aria-hidden="true" /></div>
        <p>{hint}</p>
      </PanelLink>)}
    </nav>
    {creating && <CreatePatientModal isAdmin={isAdmin} isRomania={isRomania} onClose={() => setCreating(false)} />}
  </>;
}
