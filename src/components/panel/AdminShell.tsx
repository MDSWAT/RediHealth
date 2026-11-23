"use client";

import { PanelLink as Link, usePanelPathname as usePathname, usePanelRuntime } from "./PanelRuntime";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { analyticsTranslations } from "@/lib/i18n/analytics-translations";
import {
  ActivityIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  ClockIcon,
  FileTextIcon,
  LogOutIcon,
  MessageDotsIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  StethoscopeIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { CountrySwitcher } from "@/components/panel/CountrySwitcher";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { feedbackAdminCopy } from "@/lib/i18n/feedback-translations";
import { institutesAdminTranslations } from "@/lib/i18n/institutes-admin-translations";
import { settingsTranslations } from "@/lib/i18n/settings-translations";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";
import { CreatePatientModal } from "./CreatePatientModal";
import { hasOfflineVault } from "@/lib/offline-vault";
import "./panel.css";
import "./panel-workspace.css";

/** Desktop sidebar "Administration" group, in this order: staff, feedback, then statistics under it. */
const ADMINISTRATION_HREFS = new Set(["/panel/workers", "/panel/feedback", "/panel/analytics"]);

type AdminShellProps = {
  children: ReactNode;
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  pendingCount?: number;
  mobilePatientCreation?: { isRomania: boolean };
};

type PageShellOptions = Pick<AdminShellProps, "pendingCount" | "mobilePatientCreation">;

/** Staff roles are stored in English; show them in the reader's language (same wording as the worker form). */
const ROLE_LABELS: Record<Lang, Record<string, string>> = {
  ru: { doctor: "Врач", mediator: "Медиатор", nurse: "Медсестра", administrator: "Администратор", "healthcare worker": "Медицинский работник", "case worker": "Сотрудник дела", "general practitioner": "Семейный врач", "super admin": "Суперадминистратор", superadmin: "Суперадминистратор" },
  en: { doctor: "Doctor", mediator: "Mediator", nurse: "Nurse", administrator: "Administrator", "healthcare worker": "Health worker", "case worker": "Case worker", "general practitioner": "Family doctor", "super admin": "Super admin", superadmin: "Super admin" },
  ro: { doctor: "Medic", mediator: "Mediator", nurse: "Asistent medical", "case worker": "Responsabil de caz", "general practitioner": "Medic de familie", administrator: "Administrator", "super admin": "Super administrator", superadmin: "Super administrator", "healthcare worker": "Personal medical" },
  sq: { doctor: "Mjek", mediator: "Mediator", nurse: "Infermier", "case worker": "Përgjegjës rasti", "general practitioner": "Mjek familje", administrator: "Administrator", "super admin": "Super administrator", superadmin: "Super administrator", "healthcare worker": "Punonjës shëndetësor" },
  it: { doctor: "Medico", mediator: "Mediatore", nurse: "Infermiere", "case worker": "Referente del caso", "general practitioner": "Medico di base", administrator: "Amministratore", "super admin": "Super amministratore", superadmin: "Super amministratore", "healthcare worker": "Operatore sanitario" },
  hr: { doctor: "Liječnik", mediator: "Zdravstveni medijator", nurse: "Medicinska sestra", "case worker": "Voditelj slučaja", "general practitioner": "Obiteljski liječnik", administrator: "Administrator", "super admin": "Super administrator", superadmin: "Super administrator", "healthcare worker": "Zdravstveni radnik" },
  rom: { doctor: "Doktori", mediator: "Sastipnasko mediatori", nurse: "Sastipnaski phen", "case worker": "Manush e kazosko", "general practitioner": "Familijako doktori", administrator: "Administratoro", "super admin": "Super administratoro", superadmin: "Super administratoro", "healthcare worker": "Sastipnasko bukyarno" },
};

const PersistentShellContext = createContext<((options: PageShellOptions) => void) | null>(null);

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

function useDialogFocusTrap(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocusRef?: React.RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const first = containerRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key === "Tab" && containerRef.current) {
        const focusable = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      opener?.focus?.();
    };
  }, [isOpen, containerRef, initialFocusRef]);
}

export function PersistentPanelShell(props: AdminShellProps) {
  const [pageOptions, setPageOptions] = useState<PageShellOptions>({
    pendingCount: props.pendingCount,
    mobilePatientCreation: props.mobilePatientCreation,
  });
  return (
    <PersistentShellContext.Provider value={setPageOptions}>
      <AdminShellFrame {...props} {...pageOptions} />
    </PersistentShellContext.Provider>
  );
}

function PageShellContent({
  children,
  pendingCount = 0,
  mobilePatientCreation,
  update,
}: AdminShellProps & {
  update: (options: PageShellOptions) => void;
}) {
  const creationAvailable = mobilePatientCreation !== undefined;
  const isRomania = mobilePatientCreation?.isRomania ?? false;
  useEffect(() => {
    update({ pendingCount, mobilePatientCreation: creationAvailable ? { isRomania } : undefined });
  }, [update, pendingCount, creationAvailable, isRomania]);
  return children;
}

export function AdminShell(props: AdminShellProps) {
  const update = useContext(PersistentShellContext);
  return update ? <PageShellContent {...props} update={update} /> : <AdminShellFrame {...props} />;
}

type CommandEntry = {
  id: string;
  group: "nav" | "action";
  label: string;
  shortcut?: string;
  icon: typeof FileTextIcon;
  execute: () => void;
};

function AdminShellFrame({
  children,
  userEmail,
  userRole = "Administrator",
  isAdmin = true,
  pendingCount = 0,
  mobilePatientCreation,
}: AdminShellProps) {
  const pathname = usePathname();
  const { request: fetch, demo, offline, signOut: offlineSignOut, canOpen } = usePanelRuntime();
  const { lang } = useLanguage();
  const t = panelTranslations[lang].adminShell;
  const copy = panelDesignTranslations[lang];
  const crm = crmTranslations[lang];
  const feedbackCopy = feedbackAdminCopy[lang] ?? feedbackAdminCopy.ro;
  const institutesCopy = institutesAdminTranslations[lang];
  const settingsCopy = settingsTranslations[lang];
  const analyticsCopy = analyticsTranslations[lang];
  const currentPath = stripLangFromPathname(pathname);
  const role = userRole.trim().toLowerCase();
  const isSuperAdmin = role === "super admin" || role === "superadmin";
  const isMediatorOnly = role === "mediator" && !isAdmin;
  const isPatientProfile = /^\/panel\/patients\/[^/]+/.test(currentPath);
  const roleLabel = ROLE_LABELS[lang][role] || userRole;

  const [mobileAccountSheetOpen, setMobileAccountSheetOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [reportEmail, setReportEmail] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [showMobileFab, setShowMobileFab] = useState(true);

  useEffect(() => {
    if (!isMediatorOnly || !mobilePatientCreation || isPatientProfile) return;
    const syncFab = () => {
      setShowMobileFab(window.scrollY > 240);
    };
    syncFab();
    window.addEventListener("scroll", syncFab, { passive: true });
    return () => window.removeEventListener("scroll", syncFab);
  }, [isMediatorOnly, mobilePatientCreation, isPatientProfile, currentPath]);

  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);

  const reportFieldId = useId();
  const commandDialogId = useId();
  const mobileSheetRef = useRef<HTMLElement | null>(null);
  const reportDialogRef = useRef<HTMLDivElement | null>(null);
  const commandDialogRef = useRef<HTMLDivElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  const closeMobileAccountSheet = useCallback(() => {
    setMobileAccountSheetOpen(false);
  }, [setMobileAccountSheetOpen]);

  const closeReportDialog = useCallback(() => {
    if (!reportSubmitting) setReportIssueOpen(false);
  }, [reportSubmitting, setReportIssueOpen]);

  const closeCommandPalette = useCallback(() => {
    setCommandOpen(false);
    setCommandQuery("");
  }, [setCommandOpen, setCommandQuery]);

  useDialogFocusTrap(mobileAccountSheetOpen, mobileSheetRef, closeMobileAccountSheet);
  useDialogFocusTrap(reportIssueOpen, reportDialogRef, closeReportDialog);
  useDialogFocusTrap(commandOpen, commandDialogRef, closeCommandPalette, commandInputRef);

  // All desktop items
  const desktopItems = useMemo(
    () =>
      [
        { label: crm.requests, href: "/panel", icon: FileTextIcon, chord: "G R" },
        { label: t.patients, href: "/panel/patients", icon: UsersIcon, chord: "G P" },
        { label: t.calendar, href: "/panel/calendar", icon: CalendarIcon, chord: "G C" },
        { label: crm.meetings, href: "/panel/meet", icon: CameraIcon, chord: undefined },
        { label: t.workers, href: "/panel/workers", icon: StethoscopeIcon, chord: undefined },
        { label: feedbackCopy.navLabel, href: "/panel/feedback", icon: MessageDotsIcon, chord: undefined },
        { label: analyticsCopy.navLabel, href: "/panel/analytics", icon: ActivityIcon, chord: undefined },
      ].filter((item) => {
        if (["/panel/workers", "/panel/feedback", "/panel/analytics"].includes(item.href) && !isAdmin) return false;
        // The demo has no analytics data of its own.
        if (item.href === "/panel/analytics" && demo) return false;
        return canOpen(item.href);
      }),
    [crm.requests, crm.meetings, t.patients, t.calendar, t.workers, feedbackCopy.navLabel, analyticsCopy.navLabel, isAdmin, demo, canOpen],
  );

  // Mobile App Bottom Navigation Bar items (primary quick tabs)
  const mobilePrimaryTabs = [
    { label: crm.requests, href: "/panel", icon: FileTextIcon },
    { label: t.patients, href: "/panel/patients", icon: UsersIcon },
    { label: t.calendar, href: "/panel/calendar", icon: CalendarIcon },
    { label: crm.meetings, href: "/panel/meet", icon: CameraIcon },
  ].filter((item) => canOpen(item.href));

  const userInitial = (userEmail || "U").charAt(0).toUpperCase();

  // Extra links for the mobile "More" sheet, excluding anything already in the bottom tab bar.
  const sheetQuickLinks = [
    { label: t.reportIssue, href: "#report-issue", icon: AlertCircleIcon },
    ...(isAdmin ? [{ label: t.workers, href: "/panel/workers", icon: StethoscopeIcon }] : []),
    ...(isAdmin ? [{ label: feedbackCopy.navLabel, href: "/panel/feedback", icon: MessageDotsIcon }] : []),
    ...(isAdmin && !demo ? [{ label: analyticsCopy.navLabel, href: "/panel/analytics", icon: ActivityIcon }] : []),
    ...(isSuperAdmin ? [{ label: t.logs, href: "/panel/logs", icon: ClockIcon }] : []),
    ...(isSuperAdmin ? [{ label: institutesCopy.navLabel, href: "/panel/institutes", icon: PinIcon }] : []),
    ...(isSuperAdmin ? [{ label: settingsCopy.navLabel, href: "/panel/settings", icon: BellIcon }] : []),
  ].filter((link) => !mobilePrimaryTabs.some((tab) => tab.href === link.href));

  const reportCopyByLang = {
  ru: {
      title: "Сообщить о проблеме",
      subtitle: "Расскажите нам, что пошло не так. Мы рассмотрим это.",
      email: "Ваш email (необязательно)",
      message: "Что случилось",
      send: "Отправить отчет",
      sending: "Отправка...",
      cancel: "Отмена",
      success: "Спасибо. Ваш отчет отправлен.",
      genericError: "Не удалось отправить отчет. Попробуйте еще раз.",
      detailError: "Напишите не менее 10 символов, чтобы мы могли понять проблему.",
      placeholder: "Что вы делали, чего ожидали и что произошло?",
      offline: "Работайте офлайн на этом устройстве",
      offlineCheckError: "Не удалось проверить изменения в автономном режиме. Прежде чем выйти из системы, откройте автономный режим.",
    },

    en: {
      title: "Report a problem",
      subtitle: "Tell us what went wrong. We will look into it.",
      email: "Your email (optional)",
      message: "What happened",
      send: "Send report",
      sending: "Sending...",
      cancel: "Cancel",
      success: "Thanks. Your report has been sent.",
      genericError: "Could not send the report. Try again.",
      detailError: "Write at least 10 characters so we can understand the problem.",
      placeholder: "What did you do, what did you expect, and what happened?",
      offline: "Work offline on this device",
      offlineCheckError: "Could not check offline changes. Open offline mode before you sign out.",
    },
    ro: {
      title: "Raportează o problemă",
      subtitle: "Spune-ne ce nu a mers. Ne uităm noi.",
      email: "Emailul tău (opțional)",
      message: "Ce s-a întâmplat",
      send: "Trimite raportul",
      sending: "Se trimite...",
      cancel: "Anulează",
      success: "Mulțumim. Raportul a fost trimis.",
      genericError: "Raportul nu a putut fi trimis. Încearcă din nou.",
      detailError: "Scrie cel puțin 10 caractere ca să înțelegem problema.",
      placeholder: "Ce ai făcut, ce te așteptai și ce s-a întâmplat?",
      offline: "Lucrează offline pe acest dispozitiv",
      offlineCheckError: "Nu am putut verifica modificările offline. Deschide modul offline înainte să ieși din cont.",
    },
    sq: {
      title: "Raporto një problem",
      subtitle: "Na trego çfarë nuk shkoi. Do ta shohim ne.",
      email: "Emaili yt (nëse do)",
      message: "Çfarë ndodhi",
      send: "Dërgo raportin",
      sending: "Duke dërguar...",
      cancel: "Anulo",
      success: "Faleminderit. Raporti u dërgua.",
      genericError: "Raporti nuk u dërgua. Provo përsëri.",
      detailError: "Shkruaj të paktën 10 shkronja që ta kuptojmë problemin.",
      placeholder: "Çfarë bëre, çfarë prisje dhe çfarë ndodhi?",
      offline: "Puno pa internet në këtë pajisje",
      offlineCheckError: "Nuk i kontrolluam dot ndryshimet pa internet. Hap modalitetin pa internet para se të dalësh.",
    },
    it: {
      title: "Segnala un problema",
      subtitle: "Dicci cosa non ha funzionato. Ci pensiamo noi.",
      email: "La tua email (facoltativa)",
      message: "Cosa è successo",
      send: "Invia segnalazione",
      sending: "Invio...",
      cancel: "Annulla",
      success: "Grazie. La segnalazione è stata inviata.",
      genericError: "Impossibile inviare la segnalazione. Riprova.",
      detailError: "Scrivi almeno 10 caratteri così capiamo il problema.",
      placeholder: "Cosa hai fatto, cosa ti aspettavi e cosa è successo?",
      offline: "Lavora offline su questo dispositivo",
      offlineCheckError: "Impossibile controllare le modifiche offline. Apri la modalità offline prima di uscire.",
    },
    hr: {
      title: "Prijavi problem",
      subtitle: "Reci nam što nije radilo. Provjerit ćemo.",
      email: "Tvoj email (neobavezno)",
      message: "Što se dogodilo",
      send: "Pošalji prijavu",
      sending: "Slanje...",
      cancel: "Odustani",
      success: "Hvala. Tvoja prijava je poslana.",
      genericError: "Slanje prijave nije uspjelo. Pokušaj ponovno.",
      detailError: "Napiši barem 10 znakova kako bismo razumjeli problem.",
      placeholder: "Što si učinio, što si očekivao i što se dogodilo?",
      offline: "Šifrirani izvanmrežni radni prostor",
      offlineCheckError: "Provjera izvanmrežnih promjena nije uspjela. Otvori izvanmrežni način prije odjave.",
    },
    rom: {
      title: "Phen ekh pharimos",
      subtitle: "Phen amenge so na gelo mishto. Ame ka dikhas.",
      email: "Cho email (te kames)",
      message: "So kerdilyas",
      send: "Bichhal o raporto",
      sending: "Bichhalel...",
      cancel: "Mekh",
      success: "Nais tuke. Cho raporto sas bichhaldo.",
      genericError: "Nashti bichhaldo o raporto. Zumav pale.",
      detailError: "Lekhar may hari 10 harfurya te halovas o pharimos.",
      placeholder: "So kerdyan, so uzhardyan thaj so kerdilyas?",
      offline: "Garavdo bi-internetesko than",
      offlineCheckError: "Nashti dikhle le bi-interneteske paruvimata. Putar o garavdo bi-internetesko than angla te inkljes avri.",
    },
  } as const;

  const reportText = reportCopyByLang[lang];

  const triggerPanelNavigation = useCallback(
    (panelHref: string) => {
      if (!canOpen(panelHref)) return;
      const candidates = [
        withLangPrefix(panelHref, lang),
        withLangPrefix(panelHref.replace(/^\/panel(?=\/|$)/, "/demo"), lang),
        withLangPrefix(panelHref.replace(/^\/panel(?=\/|$)/, "/offline"), lang),
      ];
      const anchors = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('[data-panel-sidebar-nav="true"] a[href]'),
      );
      const match = anchors.find((a) => {
        const attr = a.getAttribute("href") ?? "";
        return candidates.includes(attr);
      });
      if (match) {
        match.click();
        return;
      }
      window.location.assign(withLangPrefix(panelHref, lang));
    },
    [canOpen, lang],
  );

  const handleSignOut = useCallback(async () => {
    if (offline && offlineSignOut) {
      offlineSignOut();
      return;
    }
    if (demo) {
      window.location.assign(withLangPrefix("/", lang));
      return;
    }
    try {
      if (await hasOfflineVault()) {
        window.location.assign(withLangPrefix("/offline?signout=1", lang));
        return;
      }
    } catch (error) {
      console.error("Could not check offline sign-out protection", error);
      window.alert(reportText.offlineCheckError);
      return;
    }
    const target = withLangPrefix("/sign-in", lang);
    void signOut({ redirect: false })
      .catch(() => undefined)
      .finally(() => {
        // Hard same-origin navigation so sign-out does not depend on AUTH_URL.
        window.location.assign(target);
      });
  }, [offline, offlineSignOut, demo, lang, reportText.offlineCheckError]);

  // Global Cmd+K / Ctrl+K + keyboard navigation chords (G+R, G+P, G+C, [)
  useEffect(() => {
    let gArmedUntil = 0;

    function onGlobalKeyDown(event: KeyboardEvent) {
      const keyLower = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && keyLower === "k") {
        event.preventDefault();
        setMobileAccountSheetOpen(false);
        setCommandOpen((prev) => {
          const next = !prev;
          if (next) {
            setCommandQuery("");
            setCommandIndex(0);
          }
          return next;
        });
        return;
      }

      if (
        commandOpen ||
        mobileAccountSheetOpen ||
        reportIssueOpen ||
        creatingPatient ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableElement(event.target)
      ) {
        return;
      }

      if (event.key === "[") {
        event.preventDefault();
        setDesktopSidebarCollapsed((prev) => !prev);
        gArmedUntil = 0;
        return;
      }

      const now = Date.now();
      if (now <= gArmedUntil) {
        gArmedUntil = 0;
        if (keyLower === "r" && canOpen("/panel")) {
          event.preventDefault();
          triggerPanelNavigation("/panel");
          return;
        }
        if (keyLower === "p" && canOpen("/panel/patients")) {
          event.preventDefault();
          triggerPanelNavigation("/panel/patients");
          return;
        }
        if (keyLower === "c" && canOpen("/panel/calendar")) {
          event.preventDefault();
          triggerPanelNavigation("/panel/calendar");
          return;
        }
      }

      if (keyLower === "g" && !event.shiftKey) {
        gArmedUntil = now + 900;
      }
    }

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [
    commandOpen,
    mobileAccountSheetOpen,
    reportIssueOpen,
    creatingPatient,
    canOpen,
    triggerPanelNavigation,
  ]);

  const commandEntries: CommandEntry[] = [];

  for (const item of desktopItems) {
    commandEntries.push({
      id: `nav-${item.href}`,
      group: "nav",
      label: item.label,
      shortcut: item.chord,
      icon: item.icon,
      execute: () => triggerPanelNavigation(item.href),
    });
  }

  if (isSuperAdmin) {
    commandEntries.push(
      {
        id: "nav-logs",
        group: "nav",
        label: t.logs,
        icon: ClockIcon,
        execute: () => triggerPanelNavigation("/panel/logs"),
      },
      {
        id: "nav-institutes",
        group: "nav",
        label: institutesCopy.navLabel,
        icon: PinIcon,
        execute: () => triggerPanelNavigation("/panel/institutes"),
      },
      {
        id: "nav-settings",
        group: "nav",
        label: settingsCopy.navLabel,
        icon: BellIcon,
        execute: () => triggerPanelNavigation("/panel/settings"),
      },
    );
  }

  if (!demo && !offline && ["doctor", "mediator"].includes(role)) {
    commandEntries.push({
      id: "nav-offline",
      group: "nav",
      label: reportText.offline,
      icon: StethoscopeIcon,
      execute: () => window.location.assign(withLangPrefix("/offline", lang)),
    });
  }

  if (isMediatorOnly && mobilePatientCreation) {
    commandEntries.push({
      id: "act-create-patient",
      group: "action",
      label: createPatientModalTranslations[lang].titleCreate,
      icon: PlusIcon,
      execute: () => setCreatingPatient(true),
    });
  }

  commandEntries.push(
    {
      id: "act-toggle-sidebar",
      group: "action",
      label: copy.commandToggleSidebar,
      shortcut: "[",
      icon: desktopSidebarCollapsed ? ChevronRightIcon : ChevronLeftIcon,
      execute: () => setDesktopSidebarCollapsed((prev) => !prev),
    },
    {
      id: "act-report-issue",
      group: "action",
      label: t.reportIssue,
      icon: AlertCircleIcon,
      execute: () => {
        setReportError(null);
        setReportSuccess(null);
        setReportIssueOpen(true);
      },
    },
    {
      id: "act-return-site",
      group: "action",
      label: t.returnToWebsite,
      icon: ArrowRightIcon,
      execute: () => window.location.assign(withLangPrefix("/", lang)),
    },
    {
      id: "act-sign-out",
      group: "action",
      label: t.signOut,
      icon: LogOutIcon,
      execute: () => {
        void handleSignOut();
      },
    },
  );

  const normalizedCommandQuery = commandQuery.trim().toLowerCase();
  const filteredCommands = normalizedCommandQuery
    ? commandEntries.filter(
        (entry) =>
          entry.label.toLowerCase().includes(normalizedCommandQuery) ||
          Boolean(entry.shortcut && entry.shortcut.toLowerCase().includes(normalizedCommandQuery)),
      )
    : commandEntries;

  const activeCommandIdx =
    filteredCommands.length === 0
      ? -1
      : Math.min(commandIndex, filteredCommands.length - 1);

  async function handleSubmitIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReportError(null);
    setReportSuccess(null);

    if (reportMessage.trim().length < 10) {
      setReportError(reportText.detailError);
      return;
    }

    setReportSubmitting(true);
    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: reportEmail.trim(),
          message: reportMessage.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setReportError(data.error || reportText.genericError);
        return;
      }

      setReportEmail("");
      setReportMessage("");
      setReportSuccess(reportText.success);
    } catch {
      setReportError(reportText.genericError);
    } finally {
      setReportSubmitting(false);
    }
  }

  const superAdminItems = [
    {
      label: t.logs,
      href: "/panel/logs",
      icon: ClockIcon,
      active: currentPath === "/panel/logs" || currentPath.startsWith("/panel/logs/"),
    },
    {
      label: institutesCopy.navLabel,
      href: "/panel/institutes",
      icon: PinIcon,
      active: currentPath === "/panel/institutes" || currentPath.startsWith("/panel/institutes/"),
    },
    {
      label: settingsCopy.navLabel,
      href: "/panel/settings",
      icon: BellIcon,
      active: currentPath === "/panel/settings" || currentPath.startsWith("/panel/settings/"),
    },
  ];

  const primaryDesktopItems = desktopItems.filter((item) => !ADMINISTRATION_HREFS.has(item.href));
  const adminDesktopItems = desktopItems.filter((item) => ADMINISTRATION_HREFS.has(item.href));
  const fabAvailable = isMediatorOnly && Boolean(mobilePatientCreation) && !isPatientProfile;

  return (
    <div className="care-panel min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:whitespace-nowrap focus:rounded-lg focus:border focus:border-(--panel-line) focus:bg-(--panel-surface) focus:px-4 focus:py-2 focus:font-semibold focus:text-primary"
      >
        {copy.skip}
      </a>

      {/* Mobile Native-style Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-(--panel-line) bg-(--panel-surface) px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <Logo href={withLangPrefix("/", lang)} className="[&_img]:h-7 [&_img]:w-7 text-sm" />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCommandQuery("");
              setCommandIndex(0);
              setCommandOpen(true);
            }}
            aria-label={copy.commandTrigger}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-(--panel-line) bg-(--panel-subtle) text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink)"
          >
            <SearchIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileAccountSheetOpen(true)}
            aria-label={copy.account}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--panel-selection) text-xs font-semibold text-primary transition-colors hover:bg-(--panel-selection)"
          >
            {userInitial}
          </button>
        </div>
      </header>

      {/* Mobile Account Bottom Sheet */}
      {mobileAccountSheetOpen ? (
        <div className="panel-scrim fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setMobileAccountSheetOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={mobileSheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={copy.account}
            className="app-sheet-slide-up relative max-h-[85dvh] w-full overflow-y-auto rounded-t-xl border-t border-(--panel-line) bg-(--panel-surface) p-5 text-(--panel-ink) care-panel-bottom-bar"
          >
            <div className="mb-3">
              <CountrySwitcher />
            </div>

            <div className="flex items-center justify-between border-b border-(--panel-line) pb-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--panel-selection) text-base font-semibold text-primary"
                >
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-(--panel-ink)">{roleLabel}</p>
                  <p className="truncate text-xs text-(--panel-muted)" title={userEmail}>
                    {userEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileAccountSheetOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink)"
                aria-label={t.closeMenu}
              >
                <CloseIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Quick Navigation Links */}
            <div className="mt-4 space-y-1">
              {sheetQuickLinks.length > 0 ? (
                <>
                  <p className="mb-1.5 px-2 text-xs font-medium text-(--panel-muted)">
                    {copy.quickActions}
                  </p>

                  {sheetQuickLinks.map((link) => {
                    const Icon = link.icon;
                    const isReportIssueLink = link.href === "#report-issue";
                    return isReportIssueLink ? (
                      <button
                        key={link.href}
                        type="button"
                        onClick={() => {
                          setMobileAccountSheetOpen(false);
                          setReportIssueOpen(true);
                          setReportError(null);
                          setReportSuccess(null);
                        }}
                        className="flex min-h-11 w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 text-left text-sm font-medium text-(--panel-ink) transition-colors hover:bg-(--panel-selection)"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate">{link.label}</span>
                        </span>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-(--panel-muted)" aria-hidden="true" />
                      </button>
                    ) : (
                      <Link
                        key={link.href}
                        href={withLangPrefix(link.href, lang)}
                        onClick={() => setMobileAccountSheetOpen(false)}
                        className="flex min-h-11 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium text-(--panel-ink) transition-colors hover:bg-(--panel-selection)"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate">{link.label}</span>
                        </span>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-(--panel-muted)" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </>
              ) : null}

              <Link
                href={withLangPrefix("/", lang)}
                onClick={() => setMobileAccountSheetOpen(false)}
                className="flex min-h-11 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium text-(--panel-ink) transition-colors hover:bg-(--panel-selection)"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <ArrowRightIcon className="h-5 w-5 shrink-0 rotate-180 text-(--panel-muted)" aria-hidden="true" />
                  <span className="truncate">{t.returnToWebsite}</span>
                </span>
              </Link>
            </div>

            <div className="mt-4 border-t border-(--panel-line) pt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-(--panel-control-border) bg-(--panel-surface) px-4 text-sm font-semibold text-(--panel-ink) transition-colors hover:bg-(--panel-selection)"
              >
                <LogOutIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t.signOut}</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Desktop Sticky Sidebar */}
      <div className={`panel-sidebar-layout lg:grid ${desktopSidebarCollapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)]"}`}>
        <aside className={`panel-desktop-sidebar hidden border-r border-(--panel-line) bg-(--panel-surface) lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col ${desktopSidebarCollapsed ? "lg:w-[72px]" : ""}`}>
          <div className={`flex h-14 shrink-0 items-center border-b border-(--panel-line) ${desktopSidebarCollapsed ? "justify-center px-2" : "justify-between gap-2 pl-4 pr-2"}`}>
            {desktopSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setDesktopSidebarCollapsed(false)}
                aria-label={copy.expandSidebar}
                title={copy.expandSidebar}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink)"
              >
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : (
              <>
                <div className="min-w-0">
                  <Logo href={withLangPrefix("/", lang)} className="[&_img]:h-7 [&_img]:w-7 text-[15px]" />
                  <span className="sr-only">{copy.workspace}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDesktopSidebarCollapsed(true)}
                  aria-label={copy.collapseSidebar}
                  title={`${copy.collapseSidebar} ([)`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink)"
                >
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {/* Cmd+K Command Palette Trigger */}
          <div className={`shrink-0 border-b border-(--panel-line) py-1.5 ${desktopSidebarCollapsed ? "px-2" : "px-3"}`}>
            <button
              type="button"
              onClick={() => {
                setCommandQuery("");
                setCommandIndex(0);
                setCommandOpen(true);
              }}
              aria-label={copy.commandTrigger}
              title={`${copy.commandTrigger} (⌘K)`}
              className={`flex min-h-11 w-full items-center whitespace-nowrap rounded-lg border border-(--panel-line) bg-(--panel-subtle) text-[13px] font-medium text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink) ${
                desktopSidebarCollapsed ? "justify-center px-2" : "justify-between gap-2 px-3"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!desktopSidebarCollapsed ? (
                  <span className="truncate">{copy.commandTrigger}</span>
                ) : null}
              </span>
              {!desktopSidebarCollapsed ? (
                <kbd className="shrink-0 font-mono text-[11px] font-medium text-(--panel-muted) tabular-nums">
                  ⌘K
                </kbd>
              ) : null}
            </button>
          </div>

          <nav
            data-panel-sidebar-nav="true"
            aria-label={copy.navigation}
            className={`panel-sidebar-nav flex-1 overflow-y-auto py-2 ${desktopSidebarCollapsed ? "panel-sidebar-nav-collapsed px-2" : "px-3"}`}
          >
            <ul className="space-y-0.5">
              {primaryDesktopItems.map((item) => {
                const active =
                  item.href === "/panel"
                    ? currentPath === "/panel"
                    : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={withLangPrefix(item.href, lang)}
                      aria-current={active ? "page" : undefined}
                      title={desktopSidebarCollapsed ? item.label : undefined}
                      aria-label={`${item.label}${item.href === "/panel" && pendingCount > 0 ? `, ${t.pendingRequests(pendingCount)}` : ""}`}
                      className={`panel-nav-link flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-lg text-[13.5px] font-medium transition-colors ${
                        desktopSidebarCollapsed ? "relative justify-center px-2" : "px-3"
                      } ${
                        active
                          ? "bg-primary font-semibold text-white"
                          : "text-(--panel-muted) hover:bg-(--panel-selection) hover:text-(--panel-ink)"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      {!desktopSidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
                      {item.href === "/panel" && pendingCount > 0 ? (
                        <span
                          className={`${desktopSidebarCollapsed ? "absolute right-1 top-1 text-[10px]" : "ml-auto shrink-0 text-xs"} font-semibold tabular-nums ${
                            active ? "text-white/90" : "text-(--panel-ink)"
                          }`}
                          aria-label={t.pendingRequests(pendingCount)}
                        >
                          {pendingCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {adminDesktopItems.length > 0 ? (
              <>
                <p
                  aria-hidden={desktopSidebarCollapsed || undefined}
                  className={`mt-3 mb-1 px-3 text-[11px] font-medium text-(--panel-muted) ${desktopSidebarCollapsed ? "invisible" : ""}`}
                >
                  {crm.administration}
                </p>
                <ul className="space-y-0.5">
                  {adminDesktopItems.map((item) => {
                    const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={withLangPrefix(item.href, lang)}
                          aria-current={active ? "page" : undefined}
                          title={desktopSidebarCollapsed ? item.label : undefined}
                          aria-label={item.label}
                          className={`panel-nav-link flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-lg text-[13.5px] font-medium transition-colors ${
                            desktopSidebarCollapsed ? "justify-center px-2" : "px-3"
                          } ${
                            active
                              ? "bg-primary font-semibold text-white"
                              : "text-(--panel-muted) hover:bg-(--panel-selection) hover:text-(--panel-ink)"
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                          {!desktopSidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}

            {isSuperAdmin ? (
              <ul className="mt-2 space-y-0.5 border-t border-(--panel-line) pt-2">
                {superAdminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={withLangPrefix(item.href, lang)}
                        aria-current={item.active ? "page" : undefined}
                        title={desktopSidebarCollapsed ? item.label : undefined}
                        aria-label={item.label}
                        className={`panel-nav-link flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-lg text-[13.5px] font-medium transition-colors ${
                          desktopSidebarCollapsed ? "justify-center px-2" : "px-3"
                        } ${
                          item.active
                            ? "bg-primary font-semibold text-white"
                            : "text-(--panel-muted) hover:bg-(--panel-selection) hover:text-(--panel-ink)"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                        {!desktopSidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <div className="mt-2 border-t border-(--panel-line) pt-2">
              <button
                type="button"
                onClick={() => {
                  setReportIssueOpen(true);
                  setReportError(null);
                  setReportSuccess(null);
                }}
                aria-label={t.reportIssue}
                title={desktopSidebarCollapsed ? t.reportIssue : undefined}
                className={`flex min-h-11 w-full items-center gap-2.5 whitespace-nowrap rounded-lg text-left text-[13.5px] font-medium text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink) ${
                  desktopSidebarCollapsed ? "justify-center px-2" : "px-3"
                }`}
              >
                <AlertCircleIcon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                {!desktopSidebarCollapsed ? <span className="truncate">{t.reportIssue}</span> : null}
              </button>
            </div>
          </nav>

          {/* Flat, spacious, hairline-separated sidebar footer */}
          <div className={`shrink-0 border-t border-(--panel-line) bg-(--panel-surface) ${desktopSidebarCollapsed ? "space-y-1.5 px-2 py-2" : "space-y-1.5 px-3 py-2.5"}`}>
            <CountrySwitcher compact={desktopSidebarCollapsed} />
            <div
              title={desktopSidebarCollapsed ? `${roleLabel} — ${userEmail}` : undefined}
              className={`flex items-center ${desktopSidebarCollapsed ? "justify-center py-1" : "gap-2.5 px-1 py-1"}`}
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--panel-selection) text-xs font-semibold text-primary"
              >
                {userInitial}
              </span>
              {!desktopSidebarCollapsed ? (
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13px] font-semibold text-(--panel-ink)">{roleLabel}</p>
                  <p className="truncate text-[11px] text-(--panel-muted)" title={userEmail}>
                    {userEmail}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-0.5 border-t border-(--panel-line)/70 pt-1">
              <Link
                href={withLangPrefix("/", lang)}
                aria-label={t.returnToWebsite}
                title={desktopSidebarCollapsed ? t.returnToWebsite : undefined}
                className={`flex min-h-11 w-full items-center whitespace-nowrap rounded-lg text-[13px] font-medium text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink) ${
                  desktopSidebarCollapsed ? "justify-center" : "justify-between gap-2 px-2.5"
                }`}
              >
                {!desktopSidebarCollapsed ? <span className="truncate">{t.returnToWebsite}</span> : null}
                <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label={t.signOut}
                title={desktopSidebarCollapsed ? t.signOut : undefined}
                className={`flex min-h-11 w-full items-center whitespace-nowrap rounded-lg text-[13px] font-medium text-(--panel-muted) transition-colors hover:bg-(--panel-selection) hover:text-(--panel-ink) ${
                  desktopSidebarCollapsed ? "justify-center" : "justify-between gap-2 px-2.5"
                }`}
              >
                {!desktopSidebarCollapsed ? <span className="truncate">{t.signOut}</span> : null}
                <LogOutIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area - with bottom padding for mobile app bar (and scroll clearance when FAB is active) */}
        <div className={`min-w-0 flex-1 ${fabAvailable ? "pb-36 lg:pb-0" : "pb-20 lg:pb-0"}`}>
          {!demo && !offline && ["doctor", "mediator"].includes(role) && (
            <div className="border-b border-(--panel-line) bg-(--panel-surface) px-4 py-1 text-right text-sm">
              <a
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-2 font-medium text-primary hover:underline"
                href={withLangPrefix("/offline", lang)}
              >
                {reportText.offline}
              </a>
            </div>
          )}
          {children}
        </div>
      </div>

      {/* Native App Bottom Tab Bar (Mobile only) */}
      <nav
        aria-label={copy.navigation}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-(--panel-line) bg-(--panel-surface) lg:hidden care-panel-bottom-bar"
      >
        <ul className="flex h-14 items-center justify-around px-1">
          {mobilePrimaryTabs.map((item) => {
            const active =
              item.href === "/panel"
                ? currentPath === "/panel"
                : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const showCount = item.href === "/panel" && pendingCount > 0;
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={withLangPrefix(item.href, lang)}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${item.label}${showCount ? `, ${t.pendingRequests(pendingCount)}` : ""}`}
                  className={`flex min-h-11 flex-col items-center justify-center whitespace-nowrap py-1 text-center transition-colors ${
                    active ? "font-semibold text-primary" : "text-(--panel-muted) hover:text-(--panel-ink)"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="mt-0.5 block max-w-[84px] truncate text-[11px] tabular-nums tracking-tight">
                    {showCount ? `${item.label} (${pendingCount})` : item.label}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Account / More tab */}
          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMobileAccountSheetOpen(true)}
              aria-label={copy.more}
              className={`flex min-h-11 w-full flex-col items-center justify-center whitespace-nowrap py-1 text-center transition-colors ${
                mobileAccountSheetOpen
                  ? "font-semibold text-primary"
                  : "text-(--panel-muted) hover:text-(--panel-ink)"
              }`}
            >
              <UserIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="mt-0.5 block max-w-[84px] truncate text-[11px] tracking-tight">
                {copy.more}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {fabAvailable && mobilePatientCreation ? (
        <>
          {showMobileFab && !mobileAccountSheetOpen && !reportIssueOpen && !creatingPatient && !commandOpen ? (
            <button
              type="button"
              aria-label={createPatientModalTranslations[lang].titleCreate}
              title={createPatientModalTranslations[lang].titleCreate}
              onClick={() => setCreatingPatient(true)}
              className="fixed right-5 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:hidden"
            >
              <PlusIcon aria-hidden="true" className="h-8 w-8 shrink-0" />
            </button>
          ) : null}
          {creatingPatient ? (
            <CreatePatientModal
              isRomania={mobilePatientCreation.isRomania}
              isAdmin={isAdmin}
              onClose={() => setCreatingPatient(false)}
            />
          ) : null}
        </>
      ) : null}

      {/* Zero-dependency Cmd+K Clinical Command Palette */}
      {commandOpen ? (
        <div className="panel-scrim fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 p-4 pt-16 sm:pt-24">
          <div
            className="fixed inset-0"
            onClick={() => {
              setCommandOpen(false);
              setCommandQuery("");
            }}
            aria-hidden="true"
          />
          <div
            ref={commandDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${commandDialogId}-title`}
            className="app-sheet-slide-up relative w-full max-w-lg overflow-hidden rounded-xl border border-(--panel-line) bg-(--panel-surface) text-(--panel-ink) shadow-2xl"
          >
            <h2 id={`${commandDialogId}-title`} className="sr-only">
              {copy.commandTitle}
            </h2>

            <div className="flex items-center gap-2.5 border-b border-(--panel-line) px-4 py-2.5">
              <SearchIcon className="h-4 w-4 shrink-0 text-(--panel-muted)" aria-hidden="true" />
              <input
                ref={commandInputRef}
                type="search"
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setCommandIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (filteredCommands.length > 0) {
                      setCommandIndex((prev) => (prev + 1) % filteredCommands.length);
                    }
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (filteredCommands.length > 0) {
                      setCommandIndex((prev) =>
                        prev <= 0 ? filteredCommands.length - 1 : prev - 1,
                      );
                    }
                  } else if (e.key === "Enter" && activeCommandIdx >= 0) {
                    e.preventDefault();
                    const chosen = filteredCommands[activeCommandIdx];
                    setCommandOpen(false);
                    setCommandQuery("");
                    chosen?.execute();
                  }
                }}
                placeholder={copy.commandPlaceholder}
                aria-label={copy.commandPlaceholder}
                className="min-h-11 flex-1 rounded-md border-0 bg-transparent px-2 text-base text-(--panel-ink) placeholder:text-(--panel-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setCommandOpen(false);
                  setCommandQuery("");
                }}
                aria-label={t.closeMenu}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-(--panel-muted) hover:bg-(--panel-selection) hover:text-(--panel-ink)"
              >
                <CloseIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-(--panel-muted)">
                  {copy.commandEmpty}
                </p>
              ) : (
                (["nav", "action"] as const).map((groupKey) => {
                  const groupItems = filteredCommands.filter(
                    (item) => item.group === groupKey,
                  );
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={groupKey} className="mb-2 last:mb-0">
                      <p className="px-2.5 py-1 text-xs font-medium text-(--panel-muted)">
                        {groupKey === "nav"
                          ? copy.commandGroupNav
                          : copy.commandGroupActions}
                      </p>
                      <ul role="listbox" aria-label={copy.commandTitle}>
                        {groupItems.map((entry) => {
                          const flatIndex = filteredCommands.indexOf(entry);
                          const isHighlighted = flatIndex === activeCommandIdx;
                          const Icon = entry.icon;
                          return (
                            <li key={entry.id} role="option" aria-selected={isHighlighted}>
                              <button
                                type="button"
                                onMouseEnter={() => setCommandIndex(flatIndex)}
                                onClick={() => {
                                  setCommandOpen(false);
                                  setCommandQuery("");
                                  entry.execute();
                                }}
                                className={`flex min-h-11 w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  isHighlighted
                                    ? "bg-(--panel-selection) font-semibold text-primary"
                                    : "text-(--panel-ink) hover:bg-(--panel-subtle)"
                                }`}
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                  <span className="truncate">{entry.label}</span>
                                </span>
                                {entry.shortcut ? (
                                  <kbd className="shrink-0 font-mono text-[11px] font-medium text-(--panel-muted) tabular-nums">
                                    {entry.shortcut}
                                  </kbd>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-(--panel-line) bg-(--panel-subtle) px-4 py-2 text-[11px] text-(--panel-muted)">
              {copy.commandFooterHint}
            </div>
          </div>
        </div>
      ) : null}

      {reportIssueOpen ? (
        <div className="panel-scrim fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setReportIssueOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={reportDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${reportFieldId}-title`}
            className="app-sheet-slide-up relative w-full max-w-2xl rounded-t-xl border-t border-(--panel-line) bg-(--panel-surface) p-5 text-(--panel-ink) shadow-xl sm:rounded-xl sm:border sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-(--panel-line) pb-4 sm:items-center">
              <div className="min-w-0">
                <h2 id={`${reportFieldId}-title`} className="text-base font-semibold text-(--panel-ink) sm:text-lg">
                  {reportText.title}
                </h2>
                <p className="text-sm text-(--panel-muted)">{reportText.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setReportIssueOpen(false)}
                aria-label={reportText.cancel}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-(--panel-muted) hover:bg-(--panel-selection) hover:text-(--panel-ink)"
              >
                <CloseIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div>
                <label htmlFor={`${reportFieldId}-email`} className="mb-1 block text-xs font-semibold text-(--panel-ink)">
                  {reportText.email}
                </label>
                <input
                  id={`${reportFieldId}-email`}
                  type="email"
                  autoComplete="email"
                  value={reportEmail}
                  onChange={(event) => setReportEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="min-h-11 w-full rounded-lg border border-(--panel-control-border) bg-(--panel-surface) px-3 py-2 text-base text-(--panel-ink) placeholder:text-(--panel-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor={`${reportFieldId}-message`} className="mb-1 block text-xs font-semibold text-(--panel-ink)">
                  {reportText.message}
                </label>
                <textarea
                  id={`${reportFieldId}-message`}
                  required
                  minLength={10}
                  rows={7}
                  value={reportMessage}
                  onChange={(event) => setReportMessage(event.target.value)}
                  placeholder={reportText.placeholder}
                  className="w-full rounded-lg border border-(--panel-control-border) bg-(--panel-surface) px-3 py-2 text-base text-(--panel-ink) placeholder:text-(--panel-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                />
              </div>

              {reportError ? (
                <p role="alert" className="rounded-lg border border-(--panel-danger-border) bg-(--panel-danger-soft) px-3 py-2 text-sm text-(--panel-danger)">
                  {reportError}
                </p>
              ) : null}

              {reportSuccess ? (
                <p role="status" className="rounded-lg border border-(--panel-line) bg-(--panel-selection) px-3 py-2 text-sm text-(--panel-ink)">
                  {reportSuccess}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportIssueOpen(false)}
                  className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-4 text-sm font-semibold text-(--panel-ink) transition-colors hover:bg-(--panel-selection)"
                >
                  {reportText.cancel}
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:bg-(--panel-subtle) disabled:text-(--panel-muted)"
                >
                  {reportSubmitting ? reportText.sending : reportText.send}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
