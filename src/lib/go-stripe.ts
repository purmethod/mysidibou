export const STRIPE_JS = 'https://js.stripe.com/v3/';
let scriptPromise: Promise<void> | undefined;
export function loadStripeJs(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${STRIPE_JS}"]`);
    const timer = window.setTimeout(() => finish(new Error('Stripe.js timeout')), 10000);
    const finish = (error?: Error) => {
      window.clearTimeout(timer);
      script?.removeEventListener('load', onLoad);
      script?.removeEventListener('error', onError);
      if (error) { script?.remove(); reject(error); } else resolve();
    };
    const onLoad = () => finish();
    const onError = () => finish(new Error('Stripe.js failed to load'));
    if (!script) {
      script = document.createElement('script');
      script.src = STRIPE_JS;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
  }).catch((error) => { scriptPromise = undefined; throw error; });
  return scriptPromise;
}
