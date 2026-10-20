/**
 * /go — QR landing page on café tables. One white screen, no scrolling.
 * Payment: Stripe Express Checkout Element (deferred intent).
 *  - Wallet button: Apple Pay on Apple devices, Google Pay on Android.
 *  - PayPal button (shows only if PayPal is enabled in the Stripe Dashboard).
 *  - Credit card: hosted Stripe Checkout.
 * Keep this route stable: printed QR codes point here.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";

import { site } from "@/config/site";
import { HeartIcon } from "@/components/site/ui";

const STRIPE_JS = "https://js.stripe.com/v3/";
const AMOUNT = 300; // €3.00

type Slot = "loading" | "on" | "off";

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
      { title: "Support mysidibou | Sidi Bou Saïd" },
      {
        name: "description",
        content:
          "Architecture students protecting our UNESCO World Heritage. Support the project with less than a coffee.",
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

const isAppleDevice = () =>
  /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function GoPage() {
  const { paid, redirect_status } = Route.useSearch();
  const returnedPaid = paid === 1 && redirect_status !== "failed";
  const [isPaid, setPaid] = useState(returnedPaid);
  const [wallet, setWallet] = useState<Slot>("loading");
  const [paypal, setPaypal] = useState<Slot>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    redirect_status === "failed" ? "Payment failed. Please try again." : null,
  );
  const walletRef = useRef<HTMLDivElement>(null);
  const paypalRef = useRef<HTMLDivElement>(null);

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
    const mounted: any[] = [];
    // If Stripe never reports back (blocked script, slow network), leave only the card button.
    const fallback = window.setTimeout(() => {
      if (cancelled) return;
      setWallet((s) => (s === "loading" ? "off" : s));
      setPaypal((s) => (s === "loading" ? "off" : s));
    }, 8000);

    (async () => {
      try {
        const [config] = await Promise.all([
          fetch("/api/config").then((r) => r.json()),
          loadStripeJs(),
        ]);
        if (cancelled || !config.publishableKey || !window.Stripe) throw new Error("not ready");
        const stripe = window.Stripe(config.publishableKey);
        const apple = isAppleDevice();

        // One Express Checkout Element per slot, each in its own Elements group,
        // so the wallet and PayPal buttons can sit in separate tiles.
        const mount = (
          container: HTMLDivElement | null,
          paymentMethods: Record<string, string>,
          setSlot: (s: Slot) => void,
        ) => {
          if (!container) return setSlot("off");
          const elements = stripe.elements({
            mode: "payment",
            amount: AMOUNT,
            currency: "eur",
            appearance: { variables: { borderRadius: "12px" } },
          });
          const element = elements.create("expressCheckout", {
            buttonType: { applePay: "donate", googlePay: "donate", paypal: "paypal" },
            buttonTheme: { applePay: "white", googlePay: "white", paypal: "white" },
            buttonHeight: 50,
            layout: { maxColumns: 1, maxRows: 1 },
            paymentMethods: {
              applePay: "never",
              googlePay: "never",
              paypal: "never",
              link: "never",
              amazonPay: "never",
              klarna: "never",
              ...paymentMethods,
            },
          });

          element.on(
            "ready",
            ({ availablePaymentMethods }: { availablePaymentMethods?: Record<string, boolean> }) => {
              if (cancelled) return;
              const any =
                !!availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean);
              setSlot(any ? "on" : "off");
            },
          );

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
              setPaid(true);
            } catch (err) {
              event.paymentFailed?.({ reason: "fail" });
              setError(
                err instanceof Error && err.message && err.message !== "not_configured"
                  ? err.message
                  : "Payment failed. Please try again.",
              );
            }
          });

          element.mount(container);
          mounted.push(element);
        };

        // iPhone / Mac: Apple Pay only. Android & others: Google Pay.
        mount(walletRef.current, apple ? { applePay: "auto" } : { googlePay: "auto" }, setWallet);
        mount(paypalRef.current, { paypal: "auto" }, setPaypal);
      } catch {
        if (cancelled) return;
        setWallet("off");
        setPaypal("off");
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      mounted.forEach((el) => el.destroy?.());
    };
  }, [returnedPaid]);

  return (
    <main className="go">
      <p className="go__badge">
        <SealIcon className="go__badge-icon" />
        <span>
          <strong>Official project</strong>
          <span className="go__badge-line">Member of the Scientific Committee · UNESCO 2027</span>
        </span>
      </p>

      <header className="go__head">
        <p aria-label="mysidibou" className="go__logo">
          <span className="go__logo-my">MY</span>
          <span className="go__logo-name">SIDIBOU</span>
          <HeartIcon className="go__logo-heart" />
        </p>
        <h1 className="go__headline">Love Sidi Bou Saïd?</h1>
        <p className="go__sub">Architecture students protecting our UNESCO World Heritage.</p>
      </header>

      <div className="go__cards">
        <a
          className="go-insta"
          href={site.social.instagram}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span aria-hidden="true" className="go-insta__logo">
            <InstagramGlyph />
          </span>
          <span className="go-insta__text">Follow on Instagram</span>
          <span aria-hidden="true" className="go-insta__arrow">
            ↗
          </span>
        </a>

        <section aria-live="polite" className="go-support">
          {isPaid ? (
            <div className="go-thanks">
              <HeartIcon className="go-thanks__heart" />
              <p className="go-thanks__title">Thank you!</p>
              <p className="go-thanks__text">Your support protects Sidi Bou Saïd.</p>
            </div>
          ) : (
            <>
              <div className="go-support__head">
                <p className="go-support__title">
                  Support our student project
                  <span>with less than a coffee</span>
                </p>
                <p className="go-support__price">€3</p>
              </div>

              <div className="go-pay">
                <div className={`go-pay__slot is-${wallet}`}>
                  <div className="go-pay__ece" ref={walletRef} />
                </div>
                <div className={`go-pay__row ${paypal === "off" ? "is-single" : ""}`}>
                  <div className={`go-pay__slot is-${paypal}`}>
                    <div className="go-pay__ece" ref={paypalRef} />
                  </div>
                  <button className="go-tile" disabled={busy} onClick={payWithCard} type="button">
                    <CardIcon className="go-tile__icon" />
                    {busy ? "Opening…" : "Credit card"}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="go-support__error" role="alert">
                  {error}
                </p>
              ) : (
                <p className="go-support__secure">
                  <LockIcon className="go-support__lock" />
                  Secure payment by Stripe
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <footer className="go__footer">
        <p className="go__footer-lead">A small contribution for you, a big help for us.</p>
        <p>
          Paul Brinkmann · Architect &amp; Founder · Germany ·{" "}
          <a href="https://brinkmannpaul.com" rel="noopener" target="_blank">
            brinkmannpaul.com ↗
          </a>
        </p>
      </footer>
    </main>
  );
}

function SealIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" {...props}>
      <path d="M12 2.5l2.4 1.8 3-.1.9 2.9 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-.9 2.9-3-.1L12 21.5l-2.4-1.8-3 .1-.9-2.9-2.4-1.8.9-2.9-.9-2.9 2.4-1.8.9-2.9 3 .1z" />
      <path d="M8.3 12.2l2.5 2.5 4.9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.8" />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17.2" cy="6.8" r="1" fill="#fff" stroke="none" />
    </svg>
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
