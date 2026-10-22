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

test('hero shows a non-clickable official badge while lower Support and Instagram links remain', async () => {
  await scrollTo(0);
  const app = await mounted(Home);
  try {
    assert.equal(site.donate.link, '/go', 'all primary donations must use the central support route');
    const hero = app.div.querySelector('.hero');
    const badge = hero.querySelector('.hero__badge');
    assert.ok(badge, 'the hero must display its official membership badge');
    assert.equal(badge.textContent.replace(/\s+/g, ' ').trim(), 'Official Member of the Scientific Committee UNESCO Report 2027');
    assert.equal(badge.closest('a,button'), null, 'the official badge is informational, not a button');
    assert.equal(badge.querySelector('a,button'), null);
    assert.equal(hero.querySelector('.btn-donate, a[href="/go"]'), null, 'the previous hero Support CTA must be removed');
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
