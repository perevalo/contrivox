"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;
    let url = window.location.origin + pathname;
    if (searchParams.toString()) url += `?${searchParams.toString()}`;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      ui_host: "https://us.posthog.com",
      capture_pageview: false,   // manual via PageViewTracker
      capture_pageleave: true,
      autocapture: false,        // explicit events only — no noise
      session_recording: {
        maskAllInputs: true,     // privacy: hide email, phone, contract text
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });

    // GA4
    const gaId = process.env.NEXT_PUBLIC_GA4_ID;
    if (gaId) {
      const ga = document.createElement("script");
      ga.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      ga.async = true;
      document.head.appendChild(ga);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) { window.dataLayer.push(args); };
      window.gtag("js", new Date());
      window.gtag("config", gaId);
    }

    // Facebook Pixel
    const fbId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    if (fbId) {
      (function (
        f: Window & typeof globalThis,
        b: Document,
        e: string,
        v: string,
      ) {
        if (f.fbq) return;
        const n: ((...a: unknown[]) => void) & {
          callMethod?: (...a: unknown[]) => void;
          queue: unknown[];
          loaded: boolean;
          version: string;
          push: (...a: unknown[]) => void;
          _fbq?: unknown;
        } = Object.assign(
          function (...a: unknown[]) {
            if (n.callMethod) n.callMethod(...a);
            else n.queue.push(a);
          },
          { queue: [], loaded: true, version: "2.0", push: (...a: unknown[]) => n.queue.push(a) },
        );
        f.fbq = n;
        f._fbq = n;
        const t = b.createElement(e) as HTMLScriptElement;
        t.async = true;
        t.src = v;
        const s = b.getElementsByTagName(e)[0];
        s.parentNode?.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq?.("init", fbId);
      window.fbq?.("track", "PageView");
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
