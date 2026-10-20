/**
 * /go — QR landing page on café tables. One screen, no scrolling.
 * Payment: Stripe Express Checkout Element (Apple Pay / Google Pay, deferred
 * intent) with a hosted-Checkout card fallback. Keep this route stable:
 * printed QR codes point here.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";

import { site } from "@/config/site";
import { HeartIcon, socialIcons } from "@/components/site/ui";

const STRIPE_JS = "https://js.stripe.com/v3/";
const AMOUNT = 300; // 10 TND, charged as 3.00 EUR

type Mode = "loading" | "wallet" | "card" | "paid";

declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

export const Route = createFileRoute("/go")({
  validateSearch: (search: Record<string, unknown>) => ({
    paid: search.paid === 1 || search.paid === "1" ? 1 : undefined,
    redirect_status:
      typeof search.redirect_status === "string" ? search.redirect_status : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Support mysidibou | 10 TND for Sidi Bou Saïd" },
      {
        name: "description",
        content:
          "ENAU Sidi Bou Saïd students protecting our UNESCO World Heritage. Support the student project with 10 TND.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://js.stripe.com" },
      { rel: "preload", as: "script", href: STRIPE_JS },
    ],
  }),
  component: GoPage,
});

function loadStripeJs(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${STRIPE_JS}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = STRIPE_JS;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Stripe.js failed to load")));
  });
}

function GoPage() {
  const { paid, redirect_status } = Route.useSearch();
  const returnedPaid = paid === 1 && redirect_status !== "failed";
  const [mode, setMode] = useState<Mode>(returnedPaid ? "paid" : "loading");
  const [error, setError] = useState<string | null>(
    redirect_status === "failed" ? "Payment failed. Please try again." : null,
  );
  const [busy, setBusy] = useState(false);
  const eceRef = useRef<HTMLDivElement>(null);
  const InstagramIcon = socialIcons.instagram;

  const payWithCard = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error);
      window.location.href = data.url;
    } catch {
      setError("Card payment is unavailable right now. Please try again.");
      setBusy(false);
    }
  }, []);

  // Back from Stripe Checkout via the browser back button (bfcache): re-enable buttons.
  useEffect(() => {
    const onShow = () => setBusy(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  useEffect(() => {
    if (returnedPaid) return;
    let cancelled = false;
    let element: any;
    // If Stripe never reports back (blocked script, slow network), show the card button.
    const fallback = window.setTimeout(() => {
      if (!cancelled) setMode((m) => (m === "loading" ? "card" : m));
    }, 8000);

    (async () => {
      try {
        const [config] = await Promise.all([
          fetch("/api/config").then((r) => r.json()),
          loadStripeJs(),
        ]);
        if (cancelled || !config.publishableKey || !window.Stripe || !eceRef.current) {
          throw new Error("not ready");
        }
        const stripe = window.Stripe(config.publishableKey);
        const elements = stripe.elements({
          mode: "payment",
          amount: AMOUNT,
          currency: "eur",
          appearance: { variables: { borderRadius: "12px" } },
        });
        element = elements.create("expressCheckout", {
          buttonType: { applePay: "donate", googlePay: "donate" },
          buttonTheme: { applePay: "black", googlePay: "black" },
          buttonHeight: 50,
          layout: { maxColumns: 1, maxRows: 1, overflow: "never" },
          paymentMethods: { link: "never", paypal: "never", amazonPay: "never", klarna: "never" },
        });

        element.on("ready", ({ availablePaymentMethods }: { availablePaymentMethods?: Record<string, boolean> }) => {
          if (cancelled) return;
          const hasWallet =
            !!availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean);
          setMode(hasWallet ? "wallet" : "card");
        });

        element.on("confirm", async (event: any) => {
          setError(null);
          const { error: submitError } = await elements.submit();
          if (submitError) {
            setError(submitError.message ?? "Payment could not be started.");
            return;
          }
          try {
            const res = await fetch("/api/create-payment-intent", { method: "POST" });
            const data = await res.json();
            if (!res.ok || !data.client_secret) throw new Error(data.error);

            const { error: confirmError } = await stripe.confirmPayment({
              elements,
              clientSecret: data.client_secret,
              redirect: "if_required",
              confirmParams: { return_url: `${window.location.origin}/go?paid=1` },
            });
            if (confirmError) throw new Error(confirmError.message);
            setMode("paid");
          } catch (err) {
            event.paymentFailed?.({ reason: "fail" });
            setError(
              err instanceof Error && err.message && err.message !== "not_configured"
                ? err.message
                : "Payment failed. Please try again.",
            );
          }
        });

        element.mount(eceRef.current);
      } catch {
        if (!cancelled) setMode("card");
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      element?.destroy?.();
    };
  }, [returnedPaid]);

  return (
    <main className="go">
      <header className="go__top">
        <p className="go__badge">
          <CheckIcon className="go__badge-icon" />
          <span>
            <strong>Official project</strong>
            <span className="go__badge-line">Member of the Scientific Committee · UNESCO 2027</span>
          </span>
        </p>
        <p className="go__brand">
          mysidibou
          <HeartIcon className="go__brand-heart" />
        </p>
        <h1 className="go__headline">Love Sidi Bou Saïd?</h1>
        <p className="go__sub">ENAU Sidi Bou Saïd students protecting our UNESCO World Heritage.</p>
      </header>

      <section aria-live="polite" className="go__bottom">
        <a
          className="go-btn go-btn--outline"
          href={site.social.instagram}
          rel="noopener noreferrer"
          target="_blank"
        >
          <InstagramIcon className="go-btn__icon go-btn__icon--insta" />
          Follow us on Instagram
        </a>

        {mode === "paid" ? (
          <div className="go-thanks">
            <HeartIcon className="go-thanks__heart" />
            <p className="go-thanks__title">Thank you!</p>
            <p className="go-thanks__text">Your €3 protect Sidi Bou Saïd.</p>
          </div>
        ) : (
          <>
            <p className="go__ask">
              Support us with less than a coffee <span className="go__ask-price">(€3)</span>
            </p>

            <div className={`go-pay ${mode === "card" ? "is-hidden" : ""}`}>
              <div className={`go-pay__ece ${mode === "wallet" ? "is-ready" : ""}`} ref={eceRef} />
              {mode === "loading" && <div aria-hidden="true" className="go-pay__skeleton" />}
            </div>

            <button
              className={`go-btn ${mode === "card" ? "go-btn--solid" : "go-btn--outline"}`}
              disabled={busy}
              onClick={payWithCard}
              type="button"
            >
              <CardIcon className="go-btn__icon" />
              {busy ? "Opening…" : "Pay with card"}
            </button>

            {error && (
              <p className="go-pay__error" role="alert">
                {error}
              </p>
            )}
          </>
        )}

        <p className="go__secure">
          <LockIcon className="go__secure-icon" />
          Secure payment by Stripe
        </p>
        <p className="go__credit">
          Paul Brinkmann · Architect &amp; Founder ·{" "}
          <a href="https://brinkmannpaul.com" rel="noopener" target="_blank">
            brinkmannpaul.com ↗
          </a>
        </p>
      </section>
    </main>
  );
}

function CardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2.25" />
      <path d="M2.75 9.75h18.5M6.5 15h3" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" {...props}>
      <path d="M12 2.5l2.4 1.8 3-.1.9 2.9 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-.9 2.9-3-.1L12 21.5l-2.4-1.8-3 .1-.9-2.9-2.4-1.8.9-2.9-.9-2.9 2.4-1.8.9-2.9 3 .1z" />
      <path d="M8.3 12.2l2.5 2.5 4.9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
