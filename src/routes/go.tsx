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
import { flushSync } from "react-dom";
import { CoffeeButton } from "@/components/site/coffee-button";
import { GO_COPY, goLanguage } from "@/lib/go-copy";
import { STRIPE_JS, loadStripeJs } from "@/lib/go-stripe";

import { site } from "@/config/site";
import { HeartIcon } from "@/components/site/ui";
import { contributionCents } from "@/lib/rate.server";
import { visitorLang } from "@/lib/lang.server";


type Slot = "loading" | "on" | "off";

// Rendered on the server, so the price is in the first paint.
const getContribution = createServerFn({ method: "GET" }).handler(async () => ({
  cents: await contributionCents(),
  lang: visitorLang(),
}));

const euro = (cents: number) => `€${(cents / 100).toFixed(2)}`;
const euroShort = (cents: number) => (cents % 100 === 0 ? `€${cents / 100}` : euro(cents));

// Amount choices: 10 TND (live rate) · €5 · €10 · €20+ (own amount, €20–€10,000)
type Choice = "tnd" | 500 | 1000 | "custom";
const CUSTOM_MIN = 20;
const CUSTOM_MAX = 10000;

declare global {
  interface Window {
    Stripe?: (key: string, options?: Record<string, unknown>) => any;
  }
}

export const Route = createFileRoute("/go")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === 'string' && /^cs_(test_|live_)?[A-Za-z0-9]+$/.test(search.session_id) ? search.session_id : undefined,
    payment_intent: typeof search.payment_intent === 'string' ? search.payment_intent : undefined,
    payment_intent_client_secret: typeof search.payment_intent_client_secret === 'string' ? search.payment_intent_client_secret : undefined,
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

const isAppleDevice = () =>
  /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function GoPage() {
  const { session_id, payment_intent, payment_intent_client_secret, redirect_status } = Route.useSearch();
  const { cents, lang: serverLang } = Route.useLoaderData();
  const [locale, setLocale] = useState('');
  const [lang, setLang] = useState(goLanguage([serverLang]));
  useEffect(() => {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    setLocale(languages[0] || 'en');
    setLang(goLanguage(languages));
  }, []);
  const copy = GO_COPY[lang];
  const supportUs = copy.support;
  const hasPaymentReturn = !!(session_id || payment_intent_client_secret);
  const [supportOpen, setSupportOpen] = useState(hasPaymentReturn);
  // Keep an opened payment panel mounted so closing it cannot reset payment locks.
  const [supportMounted, setSupportMounted] = useState(hasPaymentReturn);
  const [isPaid, setPaid] = useState(false);
  const [coffeePaid, setCoffeePaid] = useState<{ amount: number; currency: string } | null>(null);
  const [paidCents, setPaidCents] = useState<number | undefined>();
  const [choice, setChoice] = useState<Choice>("tnd");
  const [customEuro, setCustomEuro] = useState(String(CUSTOM_MIN));
  const customInputRef = useRef<HTMLInputElement>(null);
  const customValue = Math.round(Number(customEuro));
  const customValid = customEuro.trim() !== "" && Number.isFinite(customValue) && customValue >= CUSTOM_MIN && customValue <= CUSTOM_MAX;
  const amount =
    choice === "tnd" ? cents : choice === "custom" ? (customValid ? customValue : CUSTOM_MIN) * 100 : choice;
  const amountRef = useRef(amount);
  amountRef.current = amount;
  const groupsRef = useRef<any[]>([]);
  const amountValid = choice !== 'custom' || customValid;
  const amountValidRef = useRef(amountValid);
  amountValidRef.current = amountValid;
  const chooseAmount = (value: Choice) => {
    if (value === 'custom') {
      // Commit and focus within the tap: an effect runs too late for the iOS keyboard.
      flushSync(() => setChoice(value));
      customInputRef.current?.focus({ preventScroll: true });
      customInputRef.current?.select();
    } else setChoice(value);
  };
  const screenRef = useRef<HTMLElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);

  // Self-adjusting single screen: if the content is taller than the phone's
  // visible area (small phone, in-app browser, enlarged text), scale it down
  // proportionally; if there is room, the free space is spread between blocks.
  useEffect(() => {
    const screen = screenRef.current;
    const box = fitRef.current;
    if (!screen || !box) return;
    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cs = getComputedStyle(screen);
        const avail = screen.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const kids = [...box.children].filter((k) => (k as HTMLElement).offsetHeight > 0) as HTMLElement[];
        const gap = parseFloat(getComputedStyle(box).rowGap) || 0;
        const need = kids.reduce((sum, k) => sum + k.offsetHeight, 0) + gap * Math.max(0, kids.length - 1);
        if (need <= avail) {
          box.style.height = `${avail}px`;
          box.style.transform = "";
        } else {
          box.style.height = `${need}px`;
          box.style.transform = `scale(${Math.max(0.6, avail / need)})`;
        }
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(screen);
    [...box.children].forEach((k) => ro.observe(k));
    window.addEventListener("orientationchange", fit);
    document.fonts?.ready.then(fit);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("orientationchange", fit);
    };
  }, []);
  const [wallet, setWallet] = useState<Slot>("loading");
  const [busy, setBusy] = useState(false);
  const paymentPendingRef = useRef(false);
  const busyRef = useRef(false);
  busyRef.current = busy;
  const [error, setError] = useState<string | null>(
    redirect_status === "failed" ? "Payment failed. Please try again." : null,
  );
  const walletRef = useRef<HTMLDivElement>(null);

  // Only a Stripe-verified status may produce a thank-you message.
  useEffect(() => {
    if (!session_id && !payment_intent_client_secret) return;
    let cancelled = false;
    (async () => {
      try {
        if (session_id) {
          const response = await fetch(`/api/payment-status?session_id=${encodeURIComponent(session_id)}`);
          if (!response.ok) throw new Error('status_unavailable');
          const result = await response.json();
          if (!cancelled && result.paid) {
            if (result.purpose === 'coffee') setCoffeePaid({ amount: result.amount, currency: result.currency });
            else if (result.purpose === 'donation' && result.currency === 'eur') {
              setPaidCents(result.amount); setPaid(true);
            }
          }
        } else {
          const [config] = await Promise.all([fetch('/api/config').then((response) => response.json()), loadStripeJs()]);
          if (!window.Stripe || !config.publishableKey) throw new Error('not_configured');
          const stripe = window.Stripe(config.publishableKey);
          const result = await stripe.retrievePaymentIntent(payment_intent_client_secret);
          const intent = result.paymentIntent;
          if (result.error) throw result.error;
          if (!cancelled && intent?.id === payment_intent && intent.status === 'succeeded' && intent.currency === 'eur') {
            setPaidCents(intent.amount); setPaid(true);
          }
        }
      } catch { if (!cancelled) setError(GO_COPY[lang].error); }
    })();
    return () => { cancelled = true; };
  }, [session_id, payment_intent, payment_intent_client_secret, lang]);


  const payWithCard = useCallback(async () => {
    if (!amountValidRef.current) return;
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
    const onShow = () => { if (!paymentPendingRef.current) setBusy(false); };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  useEffect(() => {
    if (!supportMounted || isPaid) return;
    let cancelled = false;
    const mounted: any[] = [];
    // If Stripe never reports back (blocked script, slow network), leave the card button.
    const fallback = window.setTimeout(() => {
      if (cancelled) return;
      setWallet((s) => (s === "loading" ? "off" : s));
    }, 8000);

    (async () => {
      try {
        const [config] = await Promise.all([
          fetch("/api/config").then((r) => r.json()),
          loadStripeJs(),
        ]);
        if (cancelled || !config.publishableKey || !window.Stripe) throw new Error("not ready");
        const stripe = window.Stripe(config.publishableKey, { locale: lang });
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
            // Name shown in the Apple Pay / Google Pay sheet ("Pay MYSIDIBOU").
            // Set here so it never falls back to an older Stripe account name.
            business: { name: "MYSIDIBOU" },
            billingAddressRequired: true,
            // Slightly flatter buttons on short screens so the page never scrolls
            buttonHeight: window.innerHeight < 620 ? 44 : 50,
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

          element.on("click", (event: any) => {
            if (!amountValidRef.current) return;
            event.resolve();
          });
          element.on("confirm", async (event: any) => {
            if (!amountValidRef.current) { event.paymentFailed?.({ reason: 'fail' }); return; }
            const paymentAmount = amountRef.current;
            setBusy(true);
            setError(null);
            const { error: submitError } = await elements.submit();
            if (submitError) {
              setError(submitError.message ?? "Payment could not be started.");
              setBusy(false);
              return;
            }
            try {
              const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: paymentAmount }),
              });
              const data = await res.json();
              if (!res.ok || !data.client_secret) throw new Error(data.error);

              const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret: data.client_secret,
                redirect: "if_required",
                confirmParams: {
                  return_url: `${window.location.origin}/go`,
                },
              });
              if (confirmError) throw new Error(confirmError.message);
              if (paymentIntent?.status === 'succeeded') {
                setPaidCents(paymentIntent.amount);
                setPaid(true);
              } else { paymentPendingRef.current = true; setError(GO_COPY[lang].pending); }
            } catch (err) {
              event.paymentFailed?.({ reason: "fail" });
              setBusy(false);
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
      } catch {
        if (cancelled) return;
        setWallet("off");
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
  }, [isPaid, lang, supportMounted]);

  const paidLabel =
    !paidCents || Math.abs(paidCents - cents) <= cents * 0.03 ? "10 TND" : euroShort(paidCents);

  return (
    <main className="go" ref={screenRef}>
      <div className="go__fit" ref={fitRef}>
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
        <h1 className="go__headline">ENAU · UNESCO World Heritage</h1>
        <p className="go__sub">Architecture students<br />protecting Sidi Bou Saïd</p>
      </header>

      <div className="go__cards">
        <div className="go__links">
          <a
            className="go-insta go-insta--nav"
            href={site.social.instagram}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="go-insta__text">INSTAGRAM</span>
            <span aria-hidden="true" className="go-insta__logo">
              <img alt="" decoding="async" height="168" src="/assets/instagram-icon.webp" width="168" />
            </span>
          </a>
          <a className="go-insta go-insta--nav" href="https://mysidibou.com/">
            <span className="go-insta__text">MYSIDIBOU.COM</span>
            <span aria-hidden="true" className="go-insta__logo is-heart">
              <HeartIcon />
            </span>
          </a>
          <button
            id="go-support-toggle"
            className="go-insta go-insta--nav go-support-toggle"
            type="button"
            aria-expanded={supportOpen}
            aria-controls="go-support-panel"
            onClick={() => { setSupportMounted(true); setSupportOpen((open) => !open); }}
          >
            <span className="go-insta__text">SUPPORT</span>
            <svg className="go-support-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>

        <div id="go-support-panel" className="go-support-panel" hidden={!supportOpen}>
        {supportMounted && <>
        <section aria-live="polite" className="go-support">
          {isPaid ? (
            <div className="go-thanks">
              <HeartIcon className="go-thanks__heart" />
              <p className="go-thanks__title">Thank you!</p>
              <p className="go-thanks__text">Your {paidLabel} protect Sidi Bou Saïd.</p>
            </div>
          ) : (
            <>
              <div className="go-support__head">
                <p className="go-support__title" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
                  {supportUs}
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
                ).map(([value, label]) =>
                  value === "custom" && choice === "custom" ? (
                    // Own amount, typed right inside the chip: no extra row needed
                    <label className="go-amount is-active is-input" key={label}>
                      €
                      <input
                        ref={customInputRef}
                        disabled={busy}
                        aria-label={copy.custom}
                        aria-invalid={!customValid}
                        aria-describedby={!customValid ? 'custom-amount-error' : undefined}
                        inputMode="numeric"
                        onChange={(e) => setCustomEuro(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                        pattern="[0-9]*"
                        type="text"
                        value={customEuro}
                      />
                    </label>
                  ) : (
                    <button
                      aria-checked={choice === value}
                      disabled={busy}
                      className={`go-amount ${choice === value ? "is-active" : ""}`}
                      key={label}
                      onClick={() => chooseAmount(value)}
                      role="radio"
                      type="button"
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>

              {!amountValid && <p id="custom-amount-error" className="go-support__error" role="alert">{copy.range}</p>}
              <div className={`go-pay__slot is-${wallet}`} inert={!amountValid || busy} aria-disabled={!amountValid || busy}>
                <div className="go-pay__ece" ref={walletRef} />
              </div>
              <div className="go-pay__row is-single">
                <button className="go-tile" disabled={busy || !amountValid} onClick={payWithCard} type="button" aria-label={`Card ${copy.or} PayPal`}>
                  <CardIcon className="go-tile__icon" />
                  {busy ? copy.opening : <><span>Card</span><span className="go-tile__or">{copy.or}</span><span className="go-tile__paypal"><PayPalMark /></span></>}
                </button>
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
        <CoffeeButton locale={locale} lang={lang} completed={coffeePaid} />
        </>}
        </div>
      </div>

      <footer className="go__footer">
        {supportOpen && <p className="go__footer-lead">A small contribution for you, a big help for us.</p>}
        <p aria-label="mysidibou" className="go__footer-logo">
          <span className="go__logo-my">MY</span>
          <span className="go__logo-name">SIDIBOU</span>
          <HeartIcon className="go__logo-heart" />
        </p>
      </footer>
      </div>
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
