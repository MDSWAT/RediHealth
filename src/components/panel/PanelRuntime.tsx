"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { stripLangFromPathname } from "@/lib/i18n/routing";

export type PanelRuntime = {
  request: typeof fetch;
  demo: boolean;
  offline?: boolean;
  pathname?: string;
  signOut?: () => void;
  navigate: (href: string, replace?: boolean) => void;
  /** Whether this runtime can open a panel route (e.g. a demo role without a calendar). Missing means yes. */
  canOpen?: (panelHref: string) => boolean;
};

const Context = createContext<PanelRuntime | null>(null);
const liveRequest: typeof fetch = (...args) => fetch(...args);
const openAnyPanelRoute = () => true;

export function PanelRuntimeProvider({ value, children }: { value: PanelRuntime; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function demoPanelHref(href: string): string {
  return href.replace(/^(\/(?:en|ro|sq|it))?\/panel(?=\/|\?|$)/, "$1/demo");
}

export function usePanelRuntime() {
  const runtime = useContext(Context);
  return { request: runtime?.request || liveRequest, demo: runtime?.demo || false, offline: runtime?.offline || false, signOut: runtime?.signOut, canOpen: runtime?.canOpen || openAnyPanelRoute };
}

export function usePanelRouter() {
  const router = useRouter();
  const runtime = useContext(Context);
  return {
    push: (href: string) => runtime ? runtime.navigate(runtime.offline ? offlinePanelHref(href) : demoPanelHref(href)) : router.push(href),
    replace: (href: string) => runtime ? runtime.navigate(runtime.offline ? offlinePanelHref(href) : demoPanelHref(href), true) : router.replace(href),
    refresh: () => { if (!runtime) router.refresh(); },
  };
}

export function usePanelPathname() {
  const pathname = usePathname();
  const runtime = useContext(Context);
  return runtime?.pathname || (runtime?.demo ? stripLangFromPathname(pathname).replace(/^\/demo(?=\/|$)/, "/panel") : pathname);
}

export function offlinePanelHref(href: string) {
  return href.replace(/^(\/(?:en|ro|sq|it))?\/panel(?=\/|\?|$)/, "$1/offline");
}

export function PanelLink(props: ComponentProps<typeof NextLink>) {
  const runtime = useContext(Context);
  if (runtime?.offline && typeof props.href === "string" && /^(\/(?:en|ro|sq|it))?\/panel(?=\/|\?|$)/.test(props.href)) {
    const href = offlinePanelHref(props.href);
    return <a href={href} className={props.className} title={props.title} aria-label={props["aria-label"]} aria-current={props["aria-current"]} onClick={(event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      props.onClick?.(event);
      runtime.navigate(href);
    }}>{props.children}</a>;
  }
  const href = runtime?.demo && typeof props.href === "string" ? demoPanelHref(props.href) : props.href;
  return <NextLink {...props} href={href} />;
}
