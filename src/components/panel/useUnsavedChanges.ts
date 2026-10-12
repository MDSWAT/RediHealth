"use client";
import { useEffect } from "react";

export function useUnsavedChanges(dirty: boolean, message: string) {
  useEffect(() => {
    if (!dirty) return;
    let currentUrl = window.location.href;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const click = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest("a");
      if (!anchor || anchor.hasAttribute("download") || anchor.target === "_blank" || /^(mailto:|tel:|#)/.test(anchor.getAttribute("href") || "")) return;
      if (anchor.href !== window.location.href && !window.confirm(message)) { event.preventDefault(); event.stopPropagation(); }
    };
    const pop = () => {
      if (!window.confirm(message)) window.history.pushState(null, "", currentUrl);
      else currentUrl = window.location.href;
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", pop);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", click, true); window.removeEventListener("popstate", pop); };
  }, [dirty, message]);
}
