import assert from "node:assert/strict";
import { test } from "node:test";

import { coffeeCurrencyForLocale, formatCoffeePrice } from "../src/lib/coffee.ts";
import { coffeePriceForLocale, COFFEE_QUOTE_TTL_MS, getEuroRate, signCoffeeQuote, verifyCoffeeQuote } from "../src/lib/coffee.server.ts";
import { coffeeIdempotencyKey, resolvePayment } from "../src/lib/payment.server.ts";
import { checkoutPaymentStatus, verifiedCheckoutStatus } from "../src/lib/payment-status.server.ts";
import { validDonationCents } from "../src/lib/rate.server.ts";
import { getMerchantCountry, PaymentInputError, stripeRequest } from "../src/lib/stripe.server.ts";

const TEST_KEY = "test-only-quote-key-not-a-stripe-key";
const NOW = 1792573200000;
const eurPrice = { amount: 500, currency: "eur", baseAmount: 500, baseCurrency: "eur", fallbackReason: null } as const;

test("currency follows only an explicit device region, not the language", () => {
  assert.deepEqual(coffeeCurrencyForLocale("de-CH"), { currency: "chf", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("en-GB"), { currency: "gbp", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("fr-CA"), { currency: "cad", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("en"), { currency: "eur", fallbackReason: "unknown_region" });
  assert.deepEqual(coffeeCurrencyForLocale("ar-TN"), { currency: "eur", fallbackReason: "unsupported_currency" });
  assert.deepEqual(coffeeCurrencyForLocale("xx-!"), { currency: "eur", fallbackReason: "unknown_region" });
  assert.deepEqual(coffeeCurrencyForLocale("e".repeat(1000)), { currency: "eur", fallbackReason: "unknown_region" });
});

test("coffee fixes a €5 base and rounds correctly for two- and zero-decimal currencies", async () => {
  const usd = await coffeePriceForLocale("en-US", async () => 1.0865);
  assert.equal(usd.amount, 543);
  assert.equal(usd.currency, "usd");
  assert.equal(usd.baseAmount, 500);
  const jpy = await coffeePriceForLocale("ja-JP", async () => 163.78);
  assert.equal(jpy.amount, 819);
  assert.equal(formatCoffeePrice(jpy, "en-US"), "¥819");
});

test("unknown regions never perform a guessed exchange", async () => {
  let called = false;
  const price = await coffeePriceForLocale("fr", async () => { called = true; return 2; });
  assert.equal(called, false);
  assert.deepEqual(price, { ...eurPrice, fallbackReason: "unknown_region" });
});

test("unavailable or malformed FX falls back explicitly to €5", async () => {
  for (const rate of [null, NaN, Infinity, -1, 0, 1000000]) {
    const price = await coffeePriceForLocale("en-US", async () => rate);
    assert.deepEqual(price, { ...eurPrice, fallbackReason: "rate_unavailable" });
  }
});

test("a signed quote holds the exact displayed price until it expires", () => {
  const quote = signCoffeeQuote(eurPrice, TEST_KEY, NOW);
  assert.equal(quote.expiresAt, NOW + COFFEE_QUOTE_TTL_MS);
  assert.deepEqual(verifyCoffeeQuote(quote.token, TEST_KEY, NOW + 1000), eurPrice);
  assert.throws(() => verifyCoffeeQuote(quote.token, TEST_KEY, quote.expiresAt), /expired_coffee_quote/);
});

test("altering the signed coffee amount or using a different key is rejected", () => {
  const quote = signCoffeeQuote(eurPrice, TEST_KEY, NOW);
  const [payload, signature] = quote.token.split(".");
  const changed = JSON.parse(Buffer.from(payload, "base64url").toString());
  changed.amount = 1;
  const tampered = `${Buffer.from(JSON.stringify(changed)).toString("base64url")}.${signature}`;
  assert.throws(() => verifyCoffeeQuote(tampered, TEST_KEY, NOW), /invalid_coffee_quote/);
  assert.throws(() => verifyCoffeeQuote(quote.token, "different-key", NOW), /invalid_coffee_quote/);
  for (const token of [undefined, "", ".", "abc.def", quote.token + ".extra", "x".repeat(3000)]) {
    assert.throws(() => verifyCoffeeQuote(token, TEST_KEY, NOW), PaymentInputError);
  }
});

test("coffee API ignores a client-supplied amount and currency", async () => {
  const previous = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = TEST_KEY;
  try {
    const quote = signCoffeeQuote(eurPrice);
    const result = await resolvePayment(new Request("https://example.test/api/checkout", {
      method: "POST", body: JSON.stringify({ purpose: "coffee", quote: quote.token, amount: 1, currency: "usd" }),
    }));
    assert.equal(result.amount, 500);
    assert.equal(result.currency, "eur");
    assert.equal(result.purpose, "coffee");
    assert.equal(result.metadata.purpose, "coffee");
    assert.equal(result.metadata.base_amount, "500");
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previous;
  }
});

test("malformed payment bodies and unknown purposes are rejected before any payment call", async () => {
  for (const body of ["invalid json", "null", "[]", JSON.stringify({ purpose: "other" })]) {
    await assert.rejects(resolvePayment(new Request("https://example.test/api/checkout", { method: "POST", body })), PaymentInputError);
  }
});

test("€20+ only accepts whole euros inside the approved range", () => {
  assert.equal(validDonationCents(2000, 297), 2000);
  assert.equal(validDonationCents(5100, 297), 5100);
  assert.equal(validDonationCents(1000000, 297), 1000000);
  for (const amount of [0, -100, 1900, 2050, 1000100, "2000", NaN]) {
    assert.equal(validDonationCents(amount, 297), null);
  }
  assert.equal(validDonationCents(500, 297), 500);
  assert.equal(validDonationCents(1000, 297), 1000);
  assert.equal(validDonationCents(300, 297), 300);
  assert.equal(validDonationCents(330, 297), null);
});

test("merchant country uses the Stripe account, never a visitor locale", async () => {
  const previousCountry = process.env.STRIPE_ACCOUNT_COUNTRY;
  const previousKey = process.env.STRIPE_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  let requests = 0;
  process.env.STRIPE_SECRET_KEY = TEST_KEY;
  try {
    process.env.STRIPE_ACCOUNT_COUNTRY = "fr";
    globalThis.fetch = async () => { throw new Error("explicit country must not fetch"); };
    assert.equal(await getMerchantCountry(), "FR");
    delete process.env.STRIPE_ACCOUNT_COUNTRY;
    globalThis.fetch = async (url) => {
      assert.equal(url, "https://api.stripe.com/v1/account");
      requests++;
      return Response.json({ country: "DE" });
    };
    assert.equal(await getMerchantCountry(), "DE");
    assert.equal(await getMerchantCountry(), "DE");
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousCountry === undefined) delete process.env.STRIPE_ACCOUNT_COUNTRY;
    else process.env.STRIPE_ACCOUNT_COUNTRY = previousCountry;
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
});

test("stale FX responses are rejected and a fresh secondary source is accepted", async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  try {
    globalThis.fetch = async (input) => {
      const url = String(input);
      requests.push(url);
      if (url.includes("open.er-api")) return Response.json({ time_last_update_unix: 1, rates: { USD: 1000 } });
      return Response.json({ date: new Date().toISOString().slice(0, 10), eur: { usd: 1.08 } });
    };
    assert.equal(await getEuroRate("usd"), 1.08);
    assert.equal(requests.length, 2);
    assert.equal(await getEuroRate("usd"), 1.08);
    assert.equal(requests.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Checkout confirmation uses the verified purpose and charged currency", () => {
  const session = {
    status: "complete", payment_status: "paid", amount_total: 543, currency: "usd",
    metadata: { project: "mysidibou", source: "qr-go", purpose: "coffee" },
  };
  assert.deepEqual(verifiedCheckoutStatus(session), { paid: true, purpose: "coffee", amount: 543, currency: "usd" });
  for (const change of [
    { status: "open" }, { payment_status: "unpaid" }, { amount_total: null },
    { currency: null }, { amount_total: -1 },
    { metadata: { project: "other", source: "qr-go", purpose: "coffee" } },
    { metadata: { project: "mysidibou", source: "other", purpose: "coffee" } },
    { metadata: { project: "mysidibou", source: "qr-go", purpose: "other" } },
  ]) {
    assert.deepEqual(verifiedCheckoutStatus({ ...session, ...change }), { paid: false });
  }
});

test("Checkout status rejects malformed IDs before contacting Stripe and returns no customer data", async () => {
  const previousKey = process.env.STRIPE_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  process.env.STRIPE_SECRET_KEY = TEST_KEY;
  let requests = 0;
  try {
    globalThis.fetch = async (url) => {
      requests++;
      assert.equal(url, "https://api.stripe.com/v1/checkout/sessions/cs_test_abcdefgh12345678");
      return Response.json({
        status: "complete", payment_status: "paid", amount_total: 500, currency: "eur",
        metadata: { project: "mysidibou", source: "qr-go", purpose: "donation" },
        customer_details: { email: "private@example.test" },
      });
    };
    for (const id of [undefined, "", "paid=1", "cs_test_short", "cs_test_../../account"]) {
      await assert.rejects(checkoutPaymentStatus(id), PaymentInputError);
    }
    assert.equal(requests, 0);
    assert.deepEqual(await checkoutPaymentStatus("cs_test_abcdefgh12345678"), {
      paid: true, purpose: "donation", amount: 500, currency: "eur",
    });
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
});

test("one coffee attempt has a stable UUID idempotency key, separate purchases have separate keys", () => {
  const one = "716738d6-ab8a-436c-a265-b587c5cf41a0";
  const two = "e438dcd6-4167-46d8-9210-e1252cb17539";
  assert.equal(coffeeIdempotencyKey(one), coffeeIdempotencyKey(one.toUpperCase()));
  assert.notEqual(coffeeIdempotencyKey(one), coffeeIdempotencyKey(two));
  assert.equal(coffeeIdempotencyKey(undefined), undefined);
  for (const id of ["", "arbitrary", "bad\nheader", null, 123]) assert.throws(() => coffeeIdempotencyKey(id), PaymentInputError);
});

test("Stripe receives the coffee idempotency key in the request header", async () => {
  const previousKey = process.env.STRIPE_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  process.env.STRIPE_SECRET_KEY = TEST_KEY;
  try {
    globalThis.fetch = async (_url, init) => {
      assert.equal(new Headers(init?.headers).get("Idempotency-Key"), "coffee:test-id:intent");
      return Response.json({ client_secret: "test-only" });
    };
    await stripeRequest("POST", "/payment_intents", { amount: 500 }, { idempotencyKey: "coffee:test-id:intent" });
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
});
