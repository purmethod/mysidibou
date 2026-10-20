/**
 * /go — QR landing page on café tables. One white screen, no scrolling.
 * Shows "10 TND ≈ €x.xx" at the live rate and charges exactly that in EUR.
 * Payment: Stripe Express Checkout Element (deferred intent) as one big
 * wallet button (Apple Pay on Apple devices, Google Pay on Android), plus
 * hosted Stripe Checkout for card / PayPal. The logo row is informational.
 * Keep this route stable: printed QR codes point here.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";

import { site } from "@/config/site";
import { HeartIcon } from "@/components/site/ui";
import { contributionCents } from "@/lib/rate.server";

const STRIPE_JS = "https://js.stripe.com/v3/";

type Slot = "loading" | "on" | "off";

// Rendered on the server, so the price is in the first paint.
const getContribution = createServerFn({ method: "GET" }).handler(async () => ({
  cents: await contributionCents(),
}));

const euro = (cents: number) => `€${(cents / 100).toFixed(2)}`;
const euroShort = (cents: number) => (cents % 100 === 0 ? `€${cents / 100}` : euro(cents));

// Amount choices: 10 TND (live rate) · €5 · €10 · €20+ (own amount, €20–€500)
type Choice = "tnd" | 500 | 1000 | "custom";
const CUSTOM_MIN = 20;
const CUSTOM_MAX = 500;

declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

export const Route = createFileRoute("/go")({
  validateSearch: (search: Record<string, unknown>) => ({
    paid: search.paid === 1 || search.paid === "1" ? 1 : undefined,
    amt: Number.isInteger(Number(search.amt)) && Number(search.amt) > 0 ? Number(search.amt) : undefined,
    redirect_status:
      typeof search.redirect_status === "string" ? search.redirect_status : undefined,
  }),
  loader: () => getContribution(),
  head: () => ({
    meta: [
      { title: "Support mysidibou | Sidi Bou Saïd" },
      {
        name: "description",
        content:
          "Architecture students protecting our UNESCO World Heritage. Support the project with 10 TND.",
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
  const { paid, amt, redirect_status } = Route.useSearch();
  const { cents } = Route.useLoaderData();
  const returnedPaid = paid === 1 && redirect_status !== "failed";
  const [isPaid, setPaid] = useState(returnedPaid);
  const [paidCents, setPaidCents] = useState<number | undefined>(amt);
  const [choice, setChoice] = useState<Choice>("tnd");
  const [customEuro, setCustomEuro] = useState(String(CUSTOM_MIN));
  const customValue = Math.round(Number(customEuro));
  const customValid = Number.isFinite(customValue) && customValue >= CUSTOM_MIN && customValue <= CUSTOM_MAX;
  const amount =
    choice === "tnd" ? cents : choice === "custom" ? (customValid ? customValue : CUSTOM_MIN) * 100 : choice;
  const amountRef = useRef(amount);
  amountRef.current = amount;
  const groupsRef = useRef<any[]>([]);
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountRef.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error);
      window.location.href = data.url;
    } catch {
      setError("Card payment is unavailable right now. Please try again.");
      setBusy(false);
    }
  }, []);

  // Keep the Apple Pay / Google Pay / PayPal amount in sync with the choice.
  useEffect(() => {
    groupsRef.current.forEach((elements) => elements.update?.({ amount }));
  }, [amount]);

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
    // If Stripe never reports back (blocked script, slow network), leave the card button.
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

        // One Express Checkout Element per button, each in its own Elements group.
        // Tapping it opens the Apple Pay / Google Pay sheet or the PayPal window
        // directly on this page — no detour via a Stripe page.
        const mount = (
          container: HTMLDivElement | null,
          options: Record<string, unknown>,
          setSlot: (s: Slot) => void,
        ) => {
          if (!container) return setSlot("off");
          const elements = stripe.elements({
            mode: "payment",
            amount: amountRef.current,
            currency: "eur",
            appearance: { variables: { borderRadius: "12px" } },
          });
          groupsRef.current.push(elements);
          const element = elements.create("expressCheckout", {
            buttonHeight: 50,
            layout: { maxColumns: 1, maxRows: 1 },
            ...options,
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
              const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountRef.current }),
              });
              const data = await res.json();
              if (!res.ok || !data.client_secret) throw new Error(data.error);

              const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret: data.client_secret,
                redirect: "if_required",
                confirmParams: {
                  return_url: `${window.location.origin}/go?paid=1&amt=${amountRef.current}`,
                },
              });
              if (confirmError) throw new Error(confirmError.message);
              setPaidCents(amountRef.current);
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

        const none = { applePay: "never", googlePay: "never", paypal: "never", link: "never", amazonPay: "never", klarna: "never" };
        // Wallet: iPhone / Mac → Apple Pay, Android → Google Pay. Shown only if the
        // wallet is set up on the device ("auto").
        mount(
          walletRef.current,
          {
            // Apple's button type for giving to projects and causes ("Support with Apple Pay",
            // shown in the visitor's own language). Google has no "support" type.
            buttonType: { applePay: "support", googlePay: "donate" },
            buttonTheme: { applePay: "white", googlePay: "white" },
            paymentMethods: { ...none, ...(apple ? { applePay: "auto" } : { googlePay: "auto" }) },
          },
          setWallet,
        );
        // PayPal: official PayPal logo button (needs PayPal enabled in Stripe).
        mount(
          paypalRef.current,
          {
            buttonType: { paypal: "paypal" },
            buttonTheme: { paypal: "white" },
            paymentMethods: { ...none, paypal: "auto" },
          },
          setPaypal,
        );
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
      groupsRef.current = [];
    };
    // Mount once; later amount changes go through elements.update().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedPaid]);

  const paidLabel =
    !paidCents || Math.abs(paidCents - cents) <= cents * 0.03 ? "10 TND" : euroShort(paidCents);

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
        <p className="go__sub">
          Architecture students protecting
          <br />
          UNESCO World Heritage.
        </p>
      </header>

      <div className="go__cards">
        <div className="go__links">
          <a
            className="go-insta"
            href={site.social.instagram}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="go-insta__text">Follow on Instagram</span>
            <span aria-hidden="true" className="go-insta__logo">
              <img alt="" decoding="async" height="168" src="/assets/instagram-icon.webp" width="168" />
            </span>
          </a>
          <a className="go-insta" href="https://mysidibou.com/">
            <span className="go-insta__text">
              Visit the project
              <span className="go-insta__sub">mysidibou.com</span>
            </span>
            <span aria-hidden="true" className="go-insta__logo is-heart">
              <HeartIcon />
            </span>
          </a>
        </div>

        <section aria-live="polite" className={`go-support ${choice === "custom" ? "has-custom" : ""}`}>
          {isPaid ? (
            <div className="go-thanks">
              <HeartIcon className="go-thanks__heart" />
              <p className="go-thanks__title">Thank you!</p>
              <p className="go-thanks__text">Your {paidLabel} protect Sidi Bou Saïd.</p>
            </div>
          ) : (
            <>
              <div className="go-support__head">
                <p aria-label="Support student project" className="go-support__title">
                  {/* SVG text with a fixed length: always exactly the card's full width */}
                  <svg aria-hidden="true" viewBox="0 0 1000 50">
                    <text
                      fill="currentColor"
                      fontSize="67.9"
                      fontWeight="800"
                      lengthAdjust="spacingAndGlyphs"
                      textLength="1000"
                      x="0"
                      y="49"
                    >
                      SUPPORT STUDENT PROJECT
                    </text>
                  </svg>
                </p>
                <p className="go-support__price">
                  {choice === "tnd" ? `10 TND ≈ ${euro(cents)}` : euroShort(amount)}
                </p>
              </div>

              <div aria-label="Amount" className="go-amounts" role="radiogroup">
                {(
                  [
                    ["tnd", "10 TND"],
                    [500, "€5"],
                    [1000, "€10"],
                    ["custom", "€20+"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    aria-checked={choice === value}
                    className={`go-amount ${choice === value ? "is-active" : ""}`}
                    key={label}
                    onClick={() => setChoice(value)}
                    role="radio"
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              {choice === "custom" && (
                <label className="go-custom">
                  <span>€</span>
                  <input
                    aria-label="Your amount in euro (20 to 500)"
                    inputMode="numeric"
                    max={CUSTOM_MAX}
                    min={CUSTOM_MIN}
                    onChange={(e) => setCustomEuro(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                    pattern="[0-9]*"
                    type="text"
                    value={customEuro}
                  />
                  <small>{customValid ? "your amount" : `€${CUSTOM_MIN}–€${CUSTOM_MAX}`}</small>
                </label>
              )}

              <div className={`go-pay__slot is-${wallet}`}>
                <div className="go-pay__ece" ref={walletRef} />
              </div>
              <div className={`go-pay__row ${paypal === "off" ? "is-single" : ""}`}>
                <button className="go-tile" disabled={busy} onClick={payWithCard} type="button">
                  <CardIcon className="go-tile__icon" />
                  {busy ? "Opening…" : "Card"}
                </button>
                <div className={`go-pay__slot is-${paypal}`}>
                  <div className="go-pay__ece" ref={paypalRef} />
                </div>
              </div>

              <ul aria-label="Accepted payment methods" className="go-methods">
                <li><ApplePayMark /></li>
                <li><GooglePayMark /></li>
                <li><PayPalMark /></li>
                <li><VisaMark /></li>
                <li><MastercardMark /></li>
              </ul>

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
        <p aria-label="mysidibou" className="go__footer-logo">
          <span className="go__logo-my">MY</span>
          <span className="go__logo-name">SIDIBOU</span>
          <HeartIcon className="go__logo-heart" />
        </p>
      </footer>
    </main>
  );
}

function SealIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M12 2.5l2.4 1.8 3-.1.9 2.9 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-.9 2.9-3-.1L12 21.5l-2.4-1.8-3 .1-.9-2.9-2.4-1.8.9-2.9-.9-2.9 2.4-1.8.9-2.9 3 .1z"
      />
      <path d="M8.3 12.2l2.5 2.5 4.9-5" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
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

/* Accepted-methods row: informational marks, not buttons. */
function ApplePayMark() {
  return (
    <svg aria-label="Apple Pay" role="img" viewBox="0 0 52 24">
      <path
        fill="#000"
        transform="translate(1 2) scale(0.82)"
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      />
      <text x="20" y="17.5" fill="#000" fontFamily="-apple-system, Helvetica, Arial, sans-serif" fontSize="14" fontWeight="600">
        Pay
      </text>
    </svg>
  );
}

function GooglePayMark() {
  return (
    <svg aria-label="Google Pay" role="img" viewBox="0 0 52 24">
      <g transform="translate(2 4) scale(0.333)">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </g>
      <text x="21" y="17.5" fill="#3c4043" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="500">
        Pay
      </text>
    </svg>
  );
}

function PayPalMark() {
  return (
    <svg aria-label="PayPal" role="img" viewBox="0 0 58 24">
      <text x="29" y="17" textAnchor="middle" fontFamily="Verdana, Arial, sans-serif" fontSize="13.5" fontStyle="italic" fontWeight="700">
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009cde">Pal</tspan>
      </text>
    </svg>
  );
}

function VisaMark() {
  return (
    <svg aria-label="Visa" role="img" viewBox="0 0 44 24">
      <text x="22" y="17.5" textAnchor="middle" fill="#1a1f71" fontFamily="Arial Black, Arial, sans-serif" fontSize="15" fontStyle="italic" fontWeight="900" letterSpacing="0.5">
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg aria-label="Mastercard" role="img" viewBox="0 0 36 24">
      <circle cx="13" cy="12" r="8" fill="#eb001b" />
      <circle cx="23" cy="12" r="8" fill="#f79e1b" />
      <path fill="#ff5f00" d="M18 5.75a8 8 0 0 1 0 12.5 8 8 0 0 1 0-12.5z" />
    </svg>
  );
}
