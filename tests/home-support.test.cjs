const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const { JSDOM } = require(process.env.MYSIDIBOU_JSDOM_PATH || 'jsdom');
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  url: 'https://mysidibou.com/', pretendToBeVisual: true,
});
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Event']) {
  Object.defineProperty(globalThis, name, { configurable: true, value: dom.window[name] });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = require(path.join(root, 'node_modules/react'));
const { act } = React;
const { createRoot } = require(path.join(root, 'node_modules/react-dom/client'));

// Use the actual components, dictionary and central links; mock only the router host.
function loader() {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = new Module(file, module);
    mod.filename = file;
    mod.paths = Module._nodeModulePaths(path.dirname(file));
    cache.set(file, mod);
    mod.require = (id) => {
      if (id === '@tanstack/react-router') return { createFileRoute: () => config => config };
      const target = id.startsWith('@/') ? path.join(root, 'src', id.slice(2))
        : id.startsWith('.') ? path.resolve(path.dirname(file), id) : null;
      if (target) {
        for (const suffix of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
          const candidate = target + suffix;
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return /\.tsx?$/.test(candidate) ? load(candidate) : require(candidate);
          }
        }
      }
      return Module.createRequire(file)(id);
    };
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    mod._compile(compiled, file);
    return mod.exports;
  }
  return load;
}

const load = loader();
const { I18nProvider, dictionaries } = load(path.join(root, 'src/lib/i18n.tsx'));
const { site } = load(path.join(root, 'src/config/site.ts'));
const { DonatePill } = load(path.join(root, 'src/components/site/nav.tsx'));
const Home = load(path.join(root, 'src/routes/index.tsx')).Route.component;

async function mounted(Component) {
  window.localStorage.clear();
  const div = document.createElement('div'); document.body.appendChild(div);
  const renderer = createRoot(div);
  await act(async () => renderer.render(React.createElement(I18nProvider, null, React.createElement(Component))));
  return { div, close: async () => { await act(async () => renderer.unmount()); div.remove(); } };
}

async function scrollTo(y) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  await act(async () => window.dispatchEvent(new Event('scroll')));
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const normalizedText = element => element.textContent.replace(/\s+/g, ' ').trim();
const approvedReel = 'https://www.instagram.com/reel/Dej34X7scRm/?vrfl=ZmExOHNxdWd2ZXNl';

test('homepage SUPPORT pill appears only after scrolling and hides again at the top', async () => {
  await scrollTo(0);
  const app = await mounted(Home);
  try {
    const pills = app.div.querySelectorAll('.donate-pill');
    assert.equal(pills.length, 1, 'homepage must mount exactly one floating support action');
    const pill = pills[0];
    assert.equal(pill.getAttribute('href'), '/go');
    assert.equal(pill.textContent.trim(), 'Support');
    const expectVisible = (visible) => {
      assert.equal(pill.classList.contains('is-visible'), visible);
      assert.equal(pill.getAttribute('aria-hidden'), String(!visible));
      assert.equal(pill.tabIndex, visible ? 0 : -1, 'hidden support must be excluded from keyboard navigation');
    };
    expectVisible(false);
    await scrollTo(24); expectVisible(false);
    await scrollTo(25); expectVisible(true);
    await scrollTo(180); expectVisible(true);
    await scrollTo(0); expectVisible(false);
  } finally { await app.close(); }
});

test('mission hero keeps its official badge and exposes the approved Support, Like and Share actions', async () => {
  await scrollTo(0);
  const app = await mounted(Home);
  try {
    assert.equal(site.donate.link, '/go', 'all primary donations must use the central support route');
    const hero = app.div.querySelector('.hero');
    assert.ok(hero.classList.contains('hero--mission'));
    assert.equal(hero.querySelector('img, picture, video, iframe'), null, 'the approved mission hero must not load a town image or video');
    const badge = hero.querySelector('.hero__badge');
    assert.ok(badge, 'the hero must display its official membership badge');
    assert.equal(badge.textContent.replace(/\s+/g, ' ').trim(), 'Official Member of the Scientific Committee UNESCO Report 2027');
    assert.equal(badge.closest('a,button'), null, 'the official badge is informational, not a button');
    assert.equal(badge.querySelector('a,button'), null);
    const actions = [...hero.querySelectorAll('.hero-mission__actions a')];
    assert.deepEqual(actions.map(link => link.dataset.action), ['support', 'like', 'share']);
    assert.equal(actions[0].getAttribute('href'), '/go');
    assert.equal(normalizedText(actions[0]), 'Support');
    for (const link of actions.slice(1)) {
      assert.equal(link.getAttribute('href'), approvedReel, 'Like and Share must open the approved Instagram reel');
      assert.equal(link.getAttribute('target'), '_blank');
      assert.ok(link.relList.contains('noopener'));
      assert.ok(link.relList.contains('noreferrer'));
    }
    const seal = badge.querySelector('svg');
    assert.ok(seal, 'the official badge must include the seal');
    assert.equal(seal.getAttribute('aria-hidden'), 'true', 'the seal is decorative beside the badge text');
    assert.equal(seal.querySelectorAll('path').length, 2, 'the seal retains its emblem and white check mark');
    for (const selector of ['#donate .btn-donate', '.finale .btn-donate']) {
      const link = app.div.querySelector(selector);
      assert.ok(link, `missing primary action: ${selector}`);
      assert.equal(link.getAttribute('href'), '/go', selector);
      assert.equal(link.textContent.trim(), 'Support', selector);
      assert.equal(link.querySelector('.ig-mark'), null, 'a Support action must not display the Instagram mark');
    }
    const followLinks = [...app.div.querySelectorAll('.btn-follow')];
    assert.ok(followLinks.length > 0, 'the secondary Instagram action must remain available');
    for (const link of followLinks) {
      assert.equal(link.getAttribute('href'), site.social.instagram);
      assert.equal(link.textContent.trim(), dictionaries.en.cta.follow);
      assert.ok(link.querySelector('.ig-mark'));
    }
    assert.ok(!app.div.textContent.includes(dictionaries.en.donateSection.linkSoon), 'configured payments must not show the donation-link placeholder message');
    assert.equal(app.div.querySelector('a[href*="DONATION_LINK"]'), null);
  } finally { await app.close(); }
});

test('mission hero renders its approved copy and four commitments after every language switch', async () => {
  await scrollTo(0);
  const app = await mounted(Home);
  const communities = {
    en: 'Architects and students worldwide for Sidi Bou Saïd.',
    de: 'Architekten und Studierende weltweit für Sidi Bou Saïd.',
    fr: 'Des architectes et des étudiants du monde entier pour Sidi Bou Saïd.',
    ar: 'معماريون وطلاب من جميع أنحاء العالم من أجل سيدي بوسعيد.',
  };
  try {
    for (const lang of ['de', 'fr', 'ar', 'en']) {
      const language = [...app.div.querySelectorAll('.lang-switch button')].find(button => button.textContent.trim() === lang.toUpperCase());
      assert.ok(language, `missing language switch for ${lang}`);
      await act(async () => language.click());
      assert.equal(language.getAttribute('aria-current'), 'true');
      assert.equal(document.documentElement.lang, lang);
      assert.equal(document.documentElement.dir, lang === 'ar' ? 'rtl' : 'ltr');
      const hero = app.div.querySelector('.hero.hero--mission');
      const copy = dictionaries[lang].homeHero;
      assert.equal(normalizedText(hero.querySelector('.hero-mission__community')), communities[lang]);
      assert.ok(hero.textContent.includes('The World’s Most Beautiful Village.'), 'the approved English tagline must remain unchanged in every language');
      assert.ok(hero.textContent.includes(dictionaries[lang].journey[0].kicker));
      const statement = hero.querySelector('.hero-mission__statement');
      assert.equal(normalizedText(statement), copy.mission);
      assert.equal(normalizedText(hero.querySelector('.hero-mission__identity')), copy.identity);
      const responsibility = hero.querySelector('h1.hero-mission__responsibility');
      assert.ok(responsibility, 'the architectural responsibility must be the main heading');
      for (const phrase of copy.responsibility) {
        assert.ok(responsibility.textContent.includes(phrase), `${lang}: missing responsibility phrase ${phrase}`);
      }
      for (const phrase of [copy.ourRole, copy.work, copy.mission, copy.yourRole, copy.participate, copy.invitation, copy.discover]) {
        assert.ok(hero.textContent.includes(phrase), `${lang}: missing mission copy ${phrase}`);
      }
      const commitments = [...hero.querySelectorAll('.hero-mission__commitments li')];
      assert.equal(commitments.length, 4);
      commitments.forEach((item, index) => {
        assert.equal(item.querySelectorAll('svg').length, 1, 'each commitment must have its own icon');
        assert.equal(item.querySelector('svg').getAttribute('aria-hidden'), 'true');
        assert.ok(item.textContent.includes(copy.commitments[index].first));
        assert.ok(item.textContent.includes(copy.commitments[index].second));
      });
      const support = hero.querySelector('[data-action="support"]');
      assert.equal(support.getAttribute('href'), '/go');
      assert.equal(normalizedText(support), dictionaries[lang].cta.donate);
      for (const action of ['like', 'share']) {
        const link = hero.querySelector(`[data-action="${action}"]`);
        assert.equal(normalizedText(link), copy[action]);
        assert.equal(link.getAttribute('aria-label'), copy[`${action}Label`]);
        assert.equal(link.getAttribute('href'), approvedReel);
        assert.equal(link.getAttribute('target'), '_blank');
        assert.ok(link.relList.contains('noopener') && link.relList.contains('noreferrer'));
      }
      assert.equal(hero.querySelector('img, picture, video, iframe'), null);
      assert.equal(app.div.querySelector('.donate-pill').textContent.trim(), dictionaries[lang].nav.donate);
    }
  } finally { await app.close(); }
});

test('floating SUPPORT handles a restored scroll position and removes its listener on unmount', async () => {
  await scrollTo(100);
  const add = window.addEventListener, remove = window.removeEventListener;
  const added = [], removed = [];
  window.addEventListener = function (type, callback, options) {
    if (type === 'scroll') added.push({ callback, options });
    return add.call(this, type, callback, options);
  };
  window.removeEventListener = function (type, callback, options) {
    if (type === 'scroll') removed.push(callback);
    return remove.call(this, type, callback, options);
  };
  let app;
  try {
    app = await mounted(DonatePill);
    assert.equal(app.div.querySelector('.donate-pill').getAttribute('aria-hidden'), 'false');
    assert.equal(added.length, 1);
    assert.equal(added[0].options.passive, true);
    await app.close(); app = null;
    assert.deepEqual(removed, [added[0].callback], 'unmount must remove the exact registered scroll listener');
  } finally {
    if (app) await app.close();
    window.addEventListener = add; window.removeEventListener = remove;
    await scrollTo(0);
  }
});

(async () => {
  let failures = 0;
  for (const item of tests) {
    try { await item.fn(); console.log(`PASS ${item.name}`); }
    catch (error) { failures++; console.error(`FAIL ${item.name}\n${error.stack}`); }
  }
  dom.window.close();
  console.log(JSON.stringify({ tests: tests.length, passed: tests.length - failures, failed: failures }));
  process.exitCode = failures ? 1 : 0;
})();
