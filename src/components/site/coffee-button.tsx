import { useEffect, useRef, useState } from 'react';
import { COFFEE_BASE_AMOUNT, formatCoffeePrice, type CoffeeQuote } from '@/lib/coffee';
import { GO_COPY, type GoLanguage } from '@/lib/go-copy';
import { loadStripeJs } from '@/lib/go-stripe';

/** The custom coffee card opens a prepared wallet in the original tap gesture. */
export function CoffeeButton({ locale, lang, completed = null }: { locale: string; lang: GoLanguage; completed?: { amount: number; currency: string } | null }) {
  const copy = GO_COPY[lang];
  const copyRef = useRef(copy);
  copyRef.current = copy;
  const walletRef = useRef<any>(null);
  const busyRef = useRef(false);
  const confirmingRef = useRef(false);
  const paymentLockedRef = useRef(false);
  const attemptRef = useRef<string | undefined>(undefined);
  const [quote, setQuote] = useState<CoffeeQuote | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'busy' | 'paid' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!locale || completed) return;
    let cancelled = false;
    const abort = new AbortController();
    let paymentRequest: any;
    let refreshTimer: ReturnType<typeof setTimeout>;
    walletRef.current = null;
    setStatus('loading');
    setQuote(null);
    (async () => {
      try {
        const [priceResponse, configResponse] = await Promise.all([
          fetch(`/api/coffee-quote?locale=${encodeURIComponent(locale)}`, { signal: abort.signal }),
          fetch('/api/config', { signal: abort.signal }),
        ]);
        if (!priceResponse.ok) throw new Error('quote_unavailable');
        const price: CoffeeQuote = await priceResponse.json();
        if (cancelled) return;
        setQuote(price);
        // A missing wallet still leaves hosted Checkout available.
        try {
          const config = await configResponse.json();
          if (config.publishableKey && config.merchantCountry) {
            await loadStripeJs();
            if (cancelled || !window.Stripe) return;
            const stripe = window.Stripe(config.publishableKey, { locale: lang });
            paymentRequest = stripe.paymentRequest({
              country: config.merchantCountry,
              currency: price.currency,
              total: { label: copyRef.current.coffee, amount: price.amount },
              requestPayerName: true,
              disableWallets: ['link', 'browserCard'],
            });
            paymentRequest.on('cancel', () => {
              if (!cancelled && !confirmingRef.current && !paymentLockedRef.current) { busyRef.current = false; setStatus('ready'); }
            });
            paymentRequest.on('paymentmethod', async (event: any) => {
              if (confirmingRef.current) { event.complete('fail'); return; }
              confirmingRef.current = true;
              let completed = null;
              try {
                const response = await fetch('/api/create-payment-intent', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ purpose: 'coffee', quote: price.token, paymentRequestId: attemptRef.current }),
                });
                const data = await response.json();
                if (!response.ok || !data.client_secret || data.amount !== price.amount || data.currency !== price.currency) throw new Error('payment_unavailable');
                let result = await stripe.confirmCardPayment(data.client_secret, {
                  payment_method: event.paymentMethod.id,
                }, { handleActions: false });
                if (result.error) throw result.error;
                event.complete('success');
                completed = true;
                if (result.paymentIntent?.status === 'requires_action') {
                  result = await stripe.confirmCardPayment(data.client_secret);
                  if (result.error) throw result.error;
                }
                if (!cancelled) {
                  paymentLockedRef.current = result.paymentIntent?.status !== 'requires_payment_method' && result.paymentIntent?.status !== 'canceled';
                  if (paymentLockedRef.current) clearTimeout(refreshTimer);
                  setStatus(result.paymentIntent?.status === 'succeeded' ? 'paid' : paymentLockedRef.current ? 'pending' : 'ready');
                  setMessage(result.paymentIntent?.status === 'succeeded' ? copyRef.current.coffeeThanks : paymentLockedRef.current ? copyRef.current.pending : copyRef.current.error);
                }
              } catch {
                if (!completed) event.complete('fail');
                if (!cancelled) { setStatus('ready'); setMessage(copyRef.current.error); }
              } finally { busyRef.current = false; confirmingRef.current = false; }
            });
            const available = await paymentRequest.canMakePayment();
            if (!cancelled && (available?.applePay || available?.googlePay)) walletRef.current = paymentRequest;
          }
        } catch { /* Hosted Checkout is the explicit fallback for unsupported wallets. */ }
        if (cancelled) return;
        setStatus('ready');
        refreshTimer = setTimeout(() => {
          // Never replace the price while a wallet is open.
          if (!busyRef.current && !paymentLockedRef.current) setRefresh((value) => value + 1);
        }, Math.max(1000, price.expiresAt - Date.now() - 60000));
      } catch {
        if (!cancelled) { setStatus('error'); setMessage(copyRef.current.error); }
      }
    })();
    return () => {
      cancelled = true;
      abort.abort();
      clearTimeout(refreshTimer);
      walletRef.current = null;
      paymentRequest?.off?.('paymentmethod');
      paymentRequest?.off?.('cancel');
    };
  }, [locale, lang, refresh, completed]);

  const openCoffee = () => {
    if (busyRef.current || paymentLockedRef.current) return;
    if (status === 'error' || !quote || quote.expiresAt <= Date.now()) {
      setMessage(copy.retry);
      setRefresh((value) => value + 1);
      return;
    }
    setMessage('');
    attemptRef.current = crypto.randomUUID();
    busyRef.current = true;
    setStatus('busy');
    if (walletRef.current) {
      // No fetch or await here: iOS requires show() in the user's tap handler.
      try {
        Promise.resolve(walletRef.current.show()).catch(() => {
          busyRef.current = false; setStatus('ready'); setMessage(copy.error);
        });
      } catch { busyRef.current = false; setStatus('ready'); setMessage(copy.error); }
      return;
    }
    fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose: 'coffee', quote: quote.token, paymentRequestId: attemptRef.current }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error('checkout_unavailable');
      window.location.assign(data.url);
    }).catch(() => { busyRef.current = false; setStatus('ready'); setMessage(copy.error); });
  };

  useEffect(() => {
    const reset = () => { if (!paymentLockedRef.current && !confirmingRef.current) { busyRef.current = false; setRefresh((value) => value + 1); } };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const price = completed ? formatCoffeePrice(completed, locale || 'en') : quote ? formatCoffeePrice(quote, locale || 'en') : '';
  const displayPrice = completed ? price : price ? `${COFFEE_BASE_AMOUNT / 1000} TND · ${copy.charge} ${price}` : '';
  return (
    <div className="go-coffee" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button className="go-insta go-coffee__button" type="button" onClick={openCoffee}
        disabled={!!completed || status === 'loading' || status === 'busy' || status === 'paid' || status === 'pending'}
        aria-label={`${copy.coffee}${displayPrice ? ` · ${displayPrice}` : ''}`}>
        <span className="go-insta__text">
          {copy.coffee}
          <span className="go-coffee__price">
            {completed ? price : status === 'loading' ? copy.preparing : status === 'busy' ? copy.opening : displayPrice}
            {quote?.fallbackReason ? ` · ${copy.euroFallback}` : ''}
          </span>
        </span>
        <svg className="go-coffee__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM17 9h2a3 3 0 0 1 0 6h-2M7 2v3M11 2v3M15 2v3M3 23h16" />
        </svg>
      </button>
      {(completed || message) && <p className="go-coffee__message" role="status">{completed ? copy.coffeeThanks : message}</p>}
    </div>
  );
}
