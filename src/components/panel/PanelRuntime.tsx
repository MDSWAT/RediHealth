"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { stripLangFromPathname } from "@/lib/i18n/routing";

export type PanelRuntime = {
  request: typeof fetch;
  demo: boolean;
  navigate: (href: string, replace?: boolean) => void;
};

const Context = createContext<PanelRuntime | null>(null);
const liveRequest: typeof fetch = (...args) => fetch(...args);

export function PanelRuntimeProvider({ value, children }: { value: PanelRuntime; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function demoPanelHref(href: string): string {
  return href.replace(/^(\/(?:en|ro|sq|it))?\/panel(?=\/|\?|$)/, "$1/demo");
}

export function usePanelRuntime() {
  const runtime = useContext(Context);
  return { request: runtime?.request || liveRequest, demo: runtime?.demo || false };
}

export function usePanelRouter() {
  const router = useRouter();
  const runtime = useContext(Context);
  return {
    push: (href: string) => runtime ? runtime.navigate(demoPanelHref(href)) : router.push(href),
    replace: (href: string) => runtime ? runtime.navigate(demoPanelHref(href), true) : router.replace(href),
    refresh: () => { if (!runtime) router.refresh(); },
  };
}

export function usePanelPathname() {
  const pathname = usePathname();
  const runtime = useContext(Context);
  return runtime?.demo ? stripLangFromPathname(pathname).replace(/^\/demo(?=\/|$)/, "/panel") : pathname;
}

export function PanelLink(props: ComponentProps<typeof NextLink>) {
  const runtime = useContext(Context);
  const href = runtime?.demo && typeof props.href === "string" ? demoPanelHref(props.href) : props.href;
  return <NextLink {...props} href={href} />;
}
