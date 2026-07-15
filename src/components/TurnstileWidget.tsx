"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileInstance = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
      action?: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [scriptReady, setScriptReady] = useState(false);

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    if (
      !scriptReady ||
      !siteKey ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(
      containerRef.current,
      {
        sitekey: siteKey,
        theme: "auto",
        size: "flexible",
        action: "voting_login",

        callback: (token: string) => {
          onVerify(token);
        },

        "expired-callback": () => {
          onVerify("");
          onExpire?.();
        },

        "error-callback": () => {
          onVerify("");
          onError?.();
        },
      }
    );

    return () => {
      if (
        widgetIdRef.current &&
        window.turnstile
      ) {
        window.turnstile.remove(
          widgetIdRef.current
        );

        widgetIdRef.current = null;
      }
    };
  }, [
    scriptReady,
    siteKey,
    onVerify,
    onExpire,
    onError,
  ]);

  if (!siteKey) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
        Chýba Turnstile Site Key.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />

      <div
        ref={containerRef}
        className="flex min-h-[65px] w-full items-center justify-center"
      />
    </>
  );
}