import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import { coffeeCurrencyForLocale, formatCoffeePrice, roundUpCurrencyAmount } from "../src/lib/coffee.ts";
import type { CoffeePrice } from "../src/lib/coffee.ts";
import { DONATION_TND_CHOICES, isDonationTndAmount, tndToEurCents } from "../src/lib/donation.ts";
import { customDonationPriceForLocale, donationPriceForLocale, DONATION_QUOTE_TTL_MS, getDonationMenu, signDonationQuote, verifyDonationQuote } from "../src/lib/donation.server.ts";
import { coffeePriceForLocale, COFFEE_QUOTE_TTL_MS, getEuroRate, signCoffeeQuote, verifyCoffeeQuote } from "../src/lib/coffee.server.ts";
import { coffeeIdempotencyKey, resolvePayment } from "../src/lib/payment.server.ts";
import { checkoutPaymentStatus, verifiedCheckoutStatus } from "../src/lib/payment-status.server.ts";
import { getMerchantCountry, PaymentInputError, stripeRequest } from "../src/lib/stripe.server.ts";

const TEST_KEY = "test-only-quote-key-not-a-stripe-key";
const NOW = 1792573200000;
const eurPrice = { amount: 300, currency: "eur", baseAmount: 10000, baseCurrency: "tnd", fallbackReason: null } as const;
const testTndRate = async () => 0.297;

async function withTestKey(run: () => Promise<void>) {
  const previous = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = TEST_KEY;
  try { await run(); } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previous;
  }
}

test("currency respects explicit device region and supports regionless Japanese/Korean", () => {
  assert.deepEqual(coffeeCurrencyForLocale("de-CH"), { currency: "chf", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("en-GB"), { currency: "gbp", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("fr-CA"), { currency: "cad", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("ja"), { currency: "jpy", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("ko"), { currency: "krw", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("ja-US"), { currency: "usd", fallbackReason: null });
  assert.deepEqual(coffeeCurrencyForLocale("en"), { currency: "eur", fallbackReason: "unknown_region" });
  assert.deepEqual(coffeeCurrencyForLocale("ar-TN"), { currency: "eur", fallbackReason: "unsupported_currency" });
  assert.deepEqual(coffeeCurrencyForLocale("xx-!"), { currency: "eur", fallbackReason: "unknown_region" });
  assert.deepEqual(coffeeCurrencyForLocale("e".repeat(1000)), { currency: "eur", fallbackReason: "unknown_region" });
});

test("charges round UP to the next whole currency unit without a spurious extra unit", () => {
  assert.equal(roundUpCurrencyAmount(3.12, "eur"), 400);
  assert.equal(roundUpCurrencyAmount(536.4, "jpy"), 537);
  assert.equal(roundUpCurrencyAmount(4, "eur"), 400);
  assert.equal(roundUpCurrencyAmount(4.000000000000001, "eur"), 400);
  assert.equal(roundUpCurrencyAmount(537, "jpy"), 537);
  assert.equal(formatCoffeePrice({ amount: 400, currency: "eur" }, "en-US"), "€4");
  assert.equal(formatCoffeePrice({ amount: 312, currency: "eur" }, "en-US"), "€3.12");
  assert.equal(formatCoffeePrice({ amount: 400, currency: "eur" }, "invalid_locale"), "4 EUR");
});

test("coffee fixes a 10 TND base and converts once into the charged currency", async () => {
  assert.deepEqual(await coffeePriceForLocale("de-DE", undefined, testTndRate), eurPrice);
  const usd = await coffeePriceForLocale("en-US", async () => 1.0865, testTndRate);
  assert.equal(usd.amount, 400);
  assert.equal(usd.currency, "usd");
  assert.equal(usd.baseAmount, 10000);
  assert.equal(usd.baseCurrency, "tnd");
  const jpy = await coffeePriceForLocale("ja-JP", async () => 163.78, testTndRate);
  // Converting the rounded €3 intermediate would incorrectly produce ¥492.
  assert.equal(jpy.amount, 487);
  assert.equal(formatCoffeePrice(jpy, "en-US"), "¥487");
});

test("unknown regions never perform a guessed exchange", async () => {
  let called = false;
  const price = await coffeePriceForLocale("fr", async () => { called = true; return 2; }, testTndRate);
  assert.equal(called, false);
  assert.deepEqual(price, { ...eurPrice, fallbackReason: "unknown_region" });
});

test("unavailable or malformed target FX falls back to the EUR equivalent of 10 TND", async () => {
  for (const rate of [null, NaN, Infinity, -1, 0, 1000000]) {
    const price = await coffeePriceForLocale("en-US", async () => rate, testTndRate);
    assert.deepEqual(price, { ...eurPrice, fallbackReason: "rate_unavailable" });
  }
});

test("a signed quote holds the exact displayed price until it expires", () => {
  const quote = signCoffeeQuote(eurPrice, TEST_KEY, NOW);
  assert.equal(quote.expiresAt, NOW + COFFEE_QUOTE_TTL_MS);
  assert.deepEqual(verifyCoffeeQuote(quote.token, TEST_KEY, NOW + 1000), eurPrice);
  assert.throws(() => verifyCoffeeQuote(quote.token, TEST_KEY, quote.expiresAt), /expired_coffee_quote/);
});

test("previous €3 and €5 quotes are rejected even with a valid signature and unexpired lifetime", () => {
  for (const oldAmount of [300, 500]) {
    const oldPrice = { ...eurPrice, amount: oldAmount, baseAmount: oldAmount, baseCurrency: "eur", expiresAt: NOW + COFFEE_QUOTE_TTL_MS };
    const payload = Buffer.from(JSON.stringify(oldPrice)).toString("base64url");
    const signature = createHmac("sha256", TEST_KEY).update(`mysidibou:coffee:v1:${payload}`).digest("base64url");
    assert.throws(() => verifyCoffeeQuote(`${payload}.${signature}`, TEST_KEY, NOW + 1000), /invalid_coffee_quote/);
    assert.throws(() => signCoffeeQuote(oldPrice as unknown as CoffeePrice, TEST_KEY, NOW), /invalid_coffee_quote/);
  }
});

test("previous 5 TND coffee quotes are rejected after the base changes to 10 TND", () => {
  const oldPrice = { ...eurPrice, amount: 200, baseAmount: 5000, expiresAt: NOW + COFFEE_QUOTE_TTL_MS };
  const payload = Buffer.from(JSON.stringify(oldPrice)).toString("base64url");
  const signature = createHmac("sha256", TEST_KEY).update(`mysidibou:coffee:v2:${payload}`).digest("base64url");
  assert.throws(() => verifyCoffeeQuote(`${payload}.${signature}`, TEST_KEY, NOW + 1000), /invalid_coffee_quote/);
  assert.throws(() => signCoffeeQuote(oldPrice as unknown as CoffeePrice, TEST_KEY, NOW), /invalid_coffee_quote/);
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
    assert.equal(result.amount, 300);
    assert.equal(result.currency, "eur");
    assert.equal(result.purpose, "coffee");
    assert.equal(result.metadata.purpose, "coffee");
    assert.equal(result.metadata.base_amount, "10000");
    assert.equal(result.metadata.base_currency, "tnd");
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

test("donations accept 10, 20, 50 TND and whole dinars from 80 through 10000", () => {
  assert.deepEqual(DONATION_TND_CHOICES, [10, 20, 50]);
  for (const amount of [10, 20, 50, 80, 81, 10000]) assert.equal(isDonationTndAmount(amount), true);
  for (const amount of [undefined, 0, -10, 5, 19, 49, 79, 80.5, 10001, "80", NaN, Infinity]) {
    assert.equal(isDonationTndAmount(amount), false);
  }
  assert.equal(tndToEurCents(5, 0.297), 149);
  assert.equal(tndToEurCents(10, 0.297), 297);
  assert.equal(tndToEurCents(20, 0.297), 594);
  assert.equal(tndToEurCents(50, 0.297), 1485);
  assert.equal(tndToEurCents(80, 0.297), 2376);
});

test("donation quotes convert TND tiers into whole local-currency amounts", async () => {
  for (const [amountTnd, amount] of [[10, 300], [20, 600], [50, 1500], [80, 2400], [10000, 297000]]) {
    const price = await donationPriceForLocale("de-DE", amountTnd, undefined, testTndRate);
    assert.equal(price.amount, amount);
    assert.equal(price.currency, "eur");
    assert.equal(price.baseAmount, amountTnd * 1000);
  }
  const yen = await donationPriceForLocale("ja", 10, async () => 163.78, testTndRate);
  assert.equal(yen.currency, "jpy");
  assert.equal(yen.amount, 487);
  const won = await donationPriceForLocale("ko", 10, async () => 1450, testTndRate);
  assert.equal(won.currency, "krw");
  assert.equal(won.amount, 4307);
  for (const amount of [5, 79, 80.5, 10001, "80"]) {
    await assert.rejects(donationPriceForLocale("ja", amount, undefined, testTndRate), /invalid_donation_amount/);
  }
});

test("donation menus return four signed local-currency choices and a matching custom cap", async () => {
  await withTestKey(async () => {
    let tndReads = 0;
    const eur = await getDonationMenu("de-DE", undefined, async () => { tndReads++; return 0.3; });
    assert.equal(tndReads, 1);
    assert.deepEqual(eur.choices.map((quote) => quote.amount), [300, 600, 1500, 2400]);
    assert.deepEqual(eur.choices.map((quote) => quote.baseAmount), [10000, 20000, 50000, 80000]);
    assert.equal(eur.customMax, 300000);
    for (const quote of eur.choices) {
      assert.equal(quote.currency, "eur");
      assert.equal(verifyDonationQuote(quote.token).amount, quote.amount);
    }
    let targetReads = 0;
    const jpy = await getDonationMenu("ja", async () => { targetReads++; return 160; }, async () => 0.3);
    assert.equal(targetReads, 1);
    assert.deepEqual(jpy.choices.map((quote) => quote.amount), [480, 960, 2400, 3840]);
    assert.equal(jpy.customMax, 480000);
    assert.ok(jpy.choices.every((quote) => quote.currency === "jpy"));
  });
});

test("a high-value IDR custom ceiling is capped locally without breaking the menu or currency", async () => {
  await withTestKey(async () => {
    let rateReads = 0;
    const menu = await getDonationMenu("id-ID", async () => { rateReads++; return 10000; }, async () => 0.3);
    assert.equal(rateReads, 1);
    assert.ok(menu.choices.every((quote) => quote.currency === "idr"));
    assert.deepEqual(menu.choices.map((quote) => quote.amount), [3000000, 6000000, 15000000, 24000000]);
    assert.equal(menu.customMax, 99999900);
    const accepted = await customDonationPriceForLocale("id-ID", 999999, "idr", async () => 10000, async () => 0.3);
    assert.equal(accepted.currency, "idr");
    assert.equal(accepted.amount, menu.customMax);
    await assert.rejects(customDonationPriceForLocale("id-ID", 1000000, "idr", async () => 10000, async () => 0.3), /invalid_donation_amount/);
  });
});

test("custom €25 means exactly €25, with bounds from the 80–10000 TND equivalents", async () => {
  const price = await customDonationPriceForLocale("de-DE", 25, "eur", undefined, async () => 0.3);
  assert.deepEqual(price, {
    amount: 2500, currency: "eur", baseAmount: 2500, baseCurrency: "eur", custom: true, fallbackReason: null,
  });
  for (const amount of [24, 3000]) {
    assert.equal((await customDonationPriceForLocale("de-DE", amount, "eur", undefined, async () => 0.3)).amount, amount * 100);
  }
  for (const amount of [23, 3001, 25.5, "25", 0, -1]) {
    await assert.rejects(customDonationPriceForLocale("de-DE", amount, "eur", undefined, async () => 0.3), /invalid_donation_amount/);
  }
  await assert.rejects(customDonationPriceForLocale("de-DE", 25, "usd", undefined, async () => 0.3), /currency_changed/);
  const yen = await customDonationPriceForLocale("ja", 3900, "jpy", async () => 160, async () => 0.3);
  assert.equal(yen.amount, 3900);
  assert.equal(yen.baseAmount, 3900);
  assert.equal(yen.baseCurrency, "jpy");
});

test("signed custom donation retains its exact local base and requires matching echoed amount", async () => {
  await withTestKey(async () => {
    const price = await customDonationPriceForLocale("de-DE", 25, "eur", undefined, async () => 0.3);
    const quote = signDonationQuote(price);
    assert.deepEqual(verifyDonationQuote(quote.token), price);
    const payment = await resolvePayment(new Request("https://example.test/api/checkout", {
      method: "POST", body: JSON.stringify({ purpose: "donation", quote: quote.token, amount: 2500, currency: "eur" }),
    }));
    assert.equal(payment.amount, 2500);
    assert.equal(payment.metadata.base_amount, "2500");
    assert.equal(payment.metadata.base_currency, "eur");
    await assert.rejects(resolvePayment(new Request("https://example.test/api/checkout", {
      method: "POST", body: JSON.stringify({ purpose: "donation", quote: quote.token, amount: 25, currency: "eur" }),
    })), /donation_quote_mismatch/);
    assert.throws(() => signDonationQuote({ ...price, baseCurrency: "tnd" }), /invalid_donation_quote/);
    assert.throws(() => signDonationQuote({ ...price, baseAmount: 2600 }), /invalid_donation_quote/);
  });
});

test("donation quotes lock their exact amount and currency for 30 minutes", async () => {
  const price = await donationPriceForLocale("ja-JP", 10, async () => 163.78, testTndRate);
  const quote = signDonationQuote(price, TEST_KEY, NOW);
  assert.equal(quote.expiresAt, NOW + DONATION_QUOTE_TTL_MS);
  assert.deepEqual(verifyDonationQuote(quote.token, TEST_KEY, NOW + 1000), price);
  assert.throws(() => verifyDonationQuote(quote.token, TEST_KEY, quote.expiresAt), /expired_donation_quote/);
  const [payload, signature] = quote.token.split(".");
  const changed = JSON.parse(Buffer.from(payload, "base64url").toString());
  changed.currency = "eur";
  const tampered = `${Buffer.from(JSON.stringify(changed)).toString("base64url")}.${signature}`;
  assert.throws(() => verifyDonationQuote(tampered, TEST_KEY, NOW), /invalid_donation_quote/);
  assert.throws(() => verifyDonationQuote(signCoffeeQuote(eurPrice, TEST_KEY, NOW).token, TEST_KEY, NOW), /invalid_donation_quote/);
  assert.throws(() => verifyCoffeeQuote(quote.token, TEST_KEY, NOW), /invalid_coffee_quote/);
});

test("donation API charges the signed local currency without recalculating FX", async () => {
  await withTestKey(async () => {
    const price = await donationPriceForLocale("ja", 20, async () => 163.78, testTndRate);
    const quote = signDonationQuote(price);
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => { throw new Error("an approved quote must not recalculate FX"); };
      const payment = await resolvePayment(new Request("https://example.test/api/checkout", {
        method: "POST", body: JSON.stringify({ purpose: "donation", quote: quote.token, amount: quote.amount, currency: quote.currency }),
      }));
      assert.equal(payment.amount, 973);
      assert.equal(payment.currency, "jpy");
      assert.equal(payment.metadata.base_amount, "20000");
      assert.equal(payment.metadata.base_currency, "tnd");
      assert.equal(payment.metadata.purpose, "donation");
    } finally { globalThis.fetch = originalFetch; }
  });
});

test("donation API rejects missing or changed echoed amount and currency", async () => {
  await withTestKey(async () => {
    const quote = signDonationQuote(await donationPriceForLocale("de-DE", 10, undefined, testTndRate));
    for (const echo of [
      {}, { amount: quote.amount }, { currency: quote.currency },
      { amount: 1, currency: quote.currency }, { amount: quote.amount, currency: "usd" },
      { amount: String(quote.amount), currency: quote.currency }, { amount: quote.amount, currency: "EUR" },
    ]) {
      await assert.rejects(resolvePayment(new Request("https://example.test/api/checkout", {
        method: "POST", body: JSON.stringify({ purpose: "donation", quote: quote.token, ...echo }),
      })), /donation_quote_mismatch/);
    }
  });
});

test("legacy amount-only or amountTnd requests cannot charge without a signed donation quote", async () => {
  await withTestKey(async () => {
    for (const body of [{}, { amount: 500 }, { amountTnd: 10, amount: 297 }, { amountTnd: 20, amount: 600, currency: "eur" }]) {
      await assert.rejects(resolvePayment(new Request("https://example.test/api/checkout", {
        method: "POST", body: JSON.stringify(body),
      })), /invalid_donation_quote/);
    }
  });
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
    status: "complete", payment_status: "paid", amount_total: 326, currency: "usd",
    metadata: { project: "mysidibou", source: "qr-go", purpose: "coffee" },
  };
  assert.deepEqual(verifiedCheckoutStatus(session), { paid: true, purpose: "coffee", amount: 326, currency: "usd" });
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
    await stripeRequest("POST", "/payment_intents", { amount: 300 }, { idempotencyKey: "coffee:test-id:intent" });
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
});
