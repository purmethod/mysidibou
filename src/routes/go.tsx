/**
 * /go — QR landing page on café tables. One screen, no scrolling.
 * Payment: Stripe Express Checkout Element (Apple Pay / Google Pay, deferred
 * intent) with a hosted-Checkout card fallback. Keep this route stable:
 * printed QR codes point here.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

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
          buttonTheme: { applePay: "white", googlePay: "white" },
          buttonHeight: 48,
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
      <p className="go__brand">
        mysidibou
        <HeartIcon className="go__brand-heart" />
      </p>

      <div className="go__intro">
        <h1 className="go__headline">Love Sidi Bou Saïd?</h1>
        <p className="go__sub">ENAU Sidi Bou Saïd students protecting our UNESCO World Heritage.</p>
      </div>

      <div className="go__cards">
        <a
          className="go-card go-card--insta"
          href={site.social.instagram}
          rel="noopener noreferrer"
          target="_blank"
        >
          <InstagramIcon className="go-card__icon" />
          <span className="go-card__title">Follow on Instagram</span>
          <span className="go-card__meta">{site.social.instagramHandle}</span>
        </a>

        <section aria-live="polite" className="go-card go-card--support">
          {mode === "paid" ? (
            <div className="go-thanks">
              <HeartIcon className="go-thanks__heart" />
              <p className="go-thanks__title">Thank you!</p>
              <p className="go-thanks__text">Your 10 TND protect Sidi Bou Saïd.</p>
            </div>
          ) : (
            <>
              <h2 className="go-card__title">Support our UNESCO student project</h2>
              <p className="go-price">
                <span className="go-price__main">10 TND</span>
                <span className="go-price__eur">≈ €3</span>
              </p>

              <div className="go-pay">
                <div
                  className={`go-pay__ece ${mode === "wallet" ? "is-ready" : ""} ${mode === "card" ? "is-hidden" : ""}`}
                  ref={eceRef}
                />
                {mode === "loading" && <div aria-hidden="true" className="go-pay__skeleton" />}
                {mode === "card" && (
                  <button className="go-pay__card" disabled={busy} onClick={payWithCard} type="button">
                    {busy ? "Opening…" : "Pay with card"}
                  </button>
                )}
              </div>

              {mode === "wallet" && (
                <button className="go-pay__link" disabled={busy} onClick={payWithCard} type="button">
                  {busy ? "opening card payment…" : "or pay with card"}
                </button>
              )}
              {error && (
                <p className="go-pay__error" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <footer className="go__footer">
        <p className="go__footer-lead">A small contribution for you, a big help for us.</p>
        <p>Paul Brinkmann · Architect &amp; Founder · Germany</p>
        <a href="https://brinkmannpaul.com" rel="noopener" target="_blank">
          brinkmannpaul.com ↗
        </a>
      </footer>
    </main>
  );
}
