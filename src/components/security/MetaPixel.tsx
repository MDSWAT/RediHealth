"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { META_PIXEL_ID } from "@/lib/legal-config";
import {
  getCookieConsentSnapshot,
  isMetaPixelAllowedPath,
  subscribeCookieConsent,
} from "@/lib/privacy/cookie-consent";

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    __redihealthMetaPixelInitialized?: string;
  }
}

const META_PIXEL_SCRIPT_ID = "redihealth-meta-pixel";
const META_PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const SERVER_SNAPSHOT = null;

function ensureFbqBootstrap(pixelId: string, nonce?: string): FbqFunction | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  if (!window.fbq) {
    const fbq: FbqFunction = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue?.push(args);
      }
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    if (!window._fbq) {
      window._fbq = fbq;
    }
  }

  if (!document.getElementById(META_PIXEL_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = META_PIXEL_SCRIPT_ID;
    script.async = true;
    script.src = META_PIXEL_SRC;
    if (nonce) {
      script.nonce = nonce;
    }
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  if (window.__redihealthMetaPixelInitialized !== pixelId) {
    window.fbq("consent", "grant");
    window.fbq("init", pixelId);
    window.__redihealthMetaPixelInitialized = pixelId;
  } else {
    window.fbq("consent", "grant");
  }

  return window.fbq;
}

/**
 * Loads Meta Pixel strictly after explicit GDPR cookie consent and only on public informational
 * routes. Sensitive health-input, medical consultation, account and staff pages never initialize
 * or emit Meta Pixel events.
 */
export function MetaPixel({ nonce }: { nonce?: string }) {
  const pathname = usePathname();
  const barePath = stripLangFromPathname(pathname || "/");
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    () => SERVER_SNAPSHOT,
  );
  const marketingAllowed = Boolean(consent?.marketing);
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!marketingAllowed) {
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("consent", "revoke");
      }
      lastTrackedPathRef.current = null;
      return;
    }
    if (!META_PIXEL_ID) return;
    if (!isMetaPixelAllowedPath(barePath)) return;

    const fbq = ensureFbqBootstrap(META_PIXEL_ID, nonce);
    if (!fbq) return;

    const trackKey = pathname || barePath;
    if (lastTrackedPathRef.current === trackKey) return;
    lastTrackedPathRef.current = trackKey;
    fbq("track", "PageView");
  }, [barePath, marketingAllowed, nonce, pathname]);

  return null;
}
