const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const { JSDOM } = require(process.env.MYSIDIBOU_JSDOM_PATH || 'jsdom');
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {url:'https://mysidibou.com/go', pretendToBeVisual:true});
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'Event', 'MouseEvent', 'InputEvent', 'getComputedStyle']) {
  Object.defineProperty(globalThis, name, {configurable:true, value: name === 'getComputedStyle' ? dom.window.getComputedStyle.bind(dom.window) : dom.window[name]});
}
Object.defineProperty(navigator, 'languages', {configurable:true, value:['de-DE', 'en']});
Object.defineProperty(navigator, 'userAgent', {configurable:true, value:'iPhone'});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver = class { observe(){} disconnect(){} };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
const React = require(path.join(root, 'node_modules/react'));
const { act } = React;
const { createRoot } = require(path.join(root, 'node_modules/react-dom/client'));

function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = new Module(file, module);
    mod.filename = file;
    mod.paths = Module._nodeModulePaths(path.dirname(file));
    cache.set(file, mod);
    mod.require = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      let target = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id.startsWith('.') ? path.resolve(path.dirname(file), id) : null;
      if (target) {
        for (const suffix of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
          const candidate = target + suffix;
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            if (/\.tsx?$/.test(candidate)) return load(candidate);
            return require(candidate);
          }
        }
      }
      return Module.createRequire(file)(id);
    };
    const compiled = ts.transpileModule(fs.readFileSync(file,'utf8'), {fileName:file, compilerOptions:{target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX, esModuleInterop:true}}).outputText;
    mod._compile(compiled, file);
    return mod.exports;
  }
  return load;
}

const tick = () => new Promise(resolve => setImmediate(resolve));
async function settle() { await act(async () => { await tick(); await tick(); }); }
async function mounted(Component, props={}) {
  const div = document.createElement('div'); document.body.appendChild(div);
  const renderer = createRoot(div);
  await act(async () => { renderer.render(React.createElement(Component, props)); });
  await settle();
  return {div, render: async newProps => { await act(async () => renderer.render(React.createElement(Component,newProps))); await settle(); }, close: async () => {await act(async () => renderer.unmount()); div.remove();}};
}
function response(data, ok=true) { return {ok, json: async () => data}; }
function inputValue(input, value) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new Event('input',{bubbles:true}));
}
async function openSupport(app) {
  const toggle=app.div.querySelector('#go-support-toggle');
  assert.ok(toggle,'the landing must provide a SUPPORT toggle');
  if(toggle.getAttribute('aria-expanded')!=='true') await act(async()=>toggle.click());
  await settle();
  assert.equal(toggle.getAttribute('aria-expanded'),'true');
  const panel=app.div.querySelector('#go-support-panel');
  assert.ok(panel,'opening SUPPORT must reveal its payment panel');
  assert.equal(panel.hidden,false);
  return panel;
}
const tests = [];
function test(name, fn) { tests.push({name,fn}); }

function donationHarness({search={}, verified={paid:false}, intentStatus='succeeded', realCoffee=false}={}) {
  const elements = [], events = [], requests = [], wallets=[];
  let cancelled = 0;
  const stripe = {elements(options) {
    const handlers = {};
    const group = {options, updates:[], update(value){this.updates.push(value)}, submit:async()=>({}), create() { return { on(event,handler){handlers[event]=handler}, mount(){handlers.ready?.({availablePaymentMethods:{applePay:true}})}, destroy(){cancelled++} }; }};
    elements.push(group); events.push(handlers); return group;
  }, confirmPayment: async()=>({paymentIntent:{status:intentStatus, amount:3500}}),
  paymentRequest(options) {
    const handlers={};
    const wallet={options,handlers,showCalls:0,on(name,handler){handlers[name]=handler},off(name){delete handlers[name]},canMakePayment:async()=>({applePay:true}),show(){this.showCalls++}};
    wallets.push(wallet);return wallet;
  },confirmCardPayment:async()=>({paymentIntent:{status:'succeeded'}})};
  window.Stripe = () => stripe;
  globalThis.fetch = async (url, options) => {
    requests.push({url, body:options?.body ? JSON.parse(options.body):null});
    if (url === '/api/config') return response({publishableKey:'pk_test', merchantCountry:'DE'});
    if (String(url).startsWith('/api/coffee-quote')) return response({amount:300,currency:'eur',baseAmount:300,baseCurrency:'eur',fallbackReason:null,token:'signed-token',expiresAt:Date.now()+1800000});
    if (String(url).startsWith('/api/payment-status')) return response(verified);
    if (url === '/api/checkout') return response({error:'mock checkout blocked'},false);
    if (url === '/api/create-payment-intent') return response({client_secret:'pi_test_secret_test',...(JSON.parse(options.body).purpose==='coffee'?{amount:300,currency:'eur'}:{})});
    throw new Error(`Unexpected URL ${url}`);
  };
  const load = loader({
    '@tanstack/react-router':{createFileRoute:() => config => ({...config, useSearch:()=>search, useLoaderData:()=>({cents:304,lang:'de'})})},
    '@tanstack/react-start':{createServerFn:()=>({handler:()=>()=>({})})},
    '@/lib/rate.server':{contributionCents:async()=>304}, '@/lib/lang.server':{visitorLang:()=> 'de'},
    ...(!realCoffee?{'@/components/site/coffee-button':{CoffeeButton:({completed})=>completed?React.createElement('div',{'data-coffee-completed':true},`${completed.amount}:${completed.currency}`):null}}:{}),
    '@/lib/go-stripe':{STRIPE_JS:'https://js.stripe.com/v3/',loadStripeJs:async()=>{}},
  });
  return {Component:load(path.join(root,'src/routes/go.tsx')).Route.component, elements, events, requests, wallets, cancelled:()=>cancelled};
}

test('landing shows three compact actions and mounts payments only after SUPPORT opens',async()=>{
  const h=donationHarness({realCoffee:true}),app=await mounted(h.Component);
  try {
    assert.deepEqual([...app.div.querySelectorAll('.go__links .go-insta__text')].map(el=>el.textContent.trim()),['INSTAGRAM','MYSIDIBOU.COM','SUPPORT']);
    const toggle=app.div.querySelector('#go-support-toggle');
    assert.equal(toggle.getAttribute('aria-expanded'),'false');
    assert.equal(toggle.getAttribute('aria-controls'),'go-support-panel');
    assert.equal(app.div.querySelector('.go-amounts'),null);
    assert.equal(app.div.querySelector('.go-pay__ece'),null);
    assert.equal(app.div.querySelector('.go-tile'),null);
    assert.equal(app.div.querySelector('.go-coffee'),null);
    assert.equal(h.elements.length,0,'closed landing should not initialize a payment wallet');
    assert.equal(h.requests.some(request=>String(request.url).startsWith('/api/coffee-quote')),false);
    const panel=await openSupport(app);
    assert.ok(panel.querySelector('.go-amounts'));
    assert.ok(panel.querySelector('.go-pay__ece'));
    assert.ok(panel.querySelector('.go-tile'));
    assert.ok(panel.querySelector('.go-coffee'));
    await act(async()=>toggle.click());
    assert.equal(toggle.getAttribute('aria-expanded'),'false');
    assert.equal(panel.hidden,true,'closed panel must hide every payment control');
  } finally {await app.close();}
});

test('closing and reopening SUPPORT preserves confirmed coffee and prevents another charge',async()=>{
  const h=donationHarness({realCoffee:true}),app=await mounted(h.Component);
  try {
    await openSupport(app);
    const wallet=h.wallets[0],button=app.div.querySelector('.go-coffee__button');
    assert.equal(wallet.options.total.amount,300);
    await act(async()=>button.click());
    await act(async()=>wallet.handlers.paymentmethod({paymentMethod:{id:'pm_test'},complete:()=>{}}));
    assert.equal(button.disabled,true);
    assert.match(app.div.querySelector('.go-coffee').textContent,/Danke für den Kaffee/);
    await act(async()=>app.div.querySelector('#go-support-toggle').click());
    await openSupport(app);
    assert.equal(app.div.querySelector('.go-coffee__button').disabled,true);
    assert.match(app.div.querySelector('.go-coffee').textContent,/Danke für den Kaffee/);
    assert.equal(h.wallets.length,1,'reopening must retain the confirmed wallet state');
    act(()=>app.div.querySelector('.go-coffee__button').click());
    assert.equal(wallet.showCalls,1);
    assert.equal(h.requests.filter(request=>request.url==='/api/create-payment-intent').length,1);
  } finally {await app.close();}
});

test('€20+ mounts, focuses and selects the amount synchronously in the click', async()=>{
  const h=donationHarness(), app=await mounted(h.Component);
  try {
    await openSupport(app);
    const button=[...app.div.querySelectorAll('button')].find(x=>x.textContent==='€20+');
    act(()=>{
      button.click();
      const input=app.div.querySelector('.go-amount input');
      assert.ok(input, 'input must exist before click returns');
      assert.equal(document.activeElement,input,'input must be focused before click returns');
      assert.equal(input.value,'20');
      assert.equal(input.selectionStart,0); assert.equal(input.selectionEnd,2);
    });
  } finally {await app.close();}
});

test('invalid custom amount cannot start Card or wallet payment; valid input updates Stripe', async()=>{
  const h=donationHarness(), app=await mounted(h.Component);
  try {
    await openSupport(app);
    await act(async()=>[...app.div.querySelectorAll('button')].find(x=>x.textContent==='€20+').click());
    const input=app.div.querySelector('.go-amount input');
    for (const value of ['', '19', '10001']) {
      await act(async()=>inputValue(input,value));
      assert.equal(input.getAttribute('aria-invalid'),'true');
      assert.equal(app.div.querySelector('.go-tile').disabled,true);
      assert.equal(app.div.querySelector('.go-pay__slot').hasAttribute('inert'),true);
      let resolved=false, failed=false;
      h.events.at(-1).click({resolve:()=>resolved=true});
      await h.events.at(-1).confirm({paymentFailed:()=>failed=true});
      assert.equal(resolved,false); assert.equal(failed,true);
      assert.equal(h.requests.filter(x=>x.url==='/api/create-payment-intent'||x.url==='/api/checkout').length,0);
    }
    await act(async()=>inputValue(input,'35'));
    assert.equal(input.getAttribute('aria-invalid'),'false');
    assert.equal(app.div.querySelector('.go-tile').disabled,false);
    assert.deepEqual(h.elements.at(-1).updates.at(-1),{amount:3500});
    await act(async()=>app.div.querySelector('.go-tile').click()); await settle();
    assert.equal(h.requests.find(x=>x.url==='/api/checkout').body.amount,3500);
  } finally {await app.close();}
});

test('forged paid query cannot show a success message',async()=>{
  const h=donationHarness({search:{paid:1,amt:1000}}),app=await mounted(h.Component);
  try {
    assert.equal(app.div.querySelector('.go-thanks'),null);
    assert.equal(app.div.querySelector('#go-support-toggle').getAttribute('aria-expanded'),'false');
    await openSupport(app);
    assert.ok(app.div.querySelector('.go-amounts'));
    assert.equal(app.div.querySelector('.go-thanks'),null);
  } finally {await app.close();}
});

test('verified donation and coffee Checkout returns use separate thank-you states',async()=>{
  for(const purpose of ['donation','coffee']) {
    const amount=purpose==='coffee'?300:500;
    const h=donationHarness({search:{session_id:'cs_test_123'},verified:{paid:true,purpose,amount,currency:'eur'}}),app=await mounted(h.Component);
    try {
      assert.equal(app.div.querySelector('#go-support-toggle').getAttribute('aria-expanded'),'true','payment returns must open SUPPORT automatically');
      assert.equal(app.div.querySelector('#go-support-panel').hidden,false);
      if(purpose==='donation'){assert.ok(app.div.querySelector('.go-thanks'));assert.equal(app.div.querySelector('[data-coffee-completed]'),null);}
      else {assert.equal(app.div.querySelector('.go-thanks'),null);assert.equal(app.div.querySelector('[data-coffee-completed]').textContent,'300:eur');}
    } finally {await app.close();}
  }
});

test('processing donation wallet result does not claim successful payment',async()=>{
  const h=donationHarness({intentStatus:'processing'}),app=await mounted(h.Component);
  try {
    await openSupport(app);
    await act(async()=>h.events.at(-1).confirm({paymentFailed:()=>{}}));
    assert.equal(app.div.querySelector('.go-thanks'),null);
    assert.match(app.div.textContent,/wird verarbeitet/);
    assert.equal(app.div.querySelector('.go-tile').disabled,true);
    assert.equal(app.div.querySelector('.go-amount').disabled,true);
  } finally {await app.close();}
});

function coffeeHarness({available=true, mismatch=false, quoteLife=1800000, confirmResult={paymentIntent:{status:'succeeded'}}}={}) {
  const requests=[], wallets=[], confirms=[];
  const quote={amount:300,currency:'eur',baseAmount:300,baseCurrency:'eur',fallbackReason:null,token:'signed-token',expiresAt:Date.now()+quoteLife};
  globalThis.fetch=async(url,options)=>{
    requests.push({url,body:options?.body?JSON.parse(options.body):null});
    if(String(url).startsWith('/api/coffee-quote')) return response({...quote});
    if(url==='/api/config') return response({publishableKey:'pk_test',merchantCountry:'DE'});
    if(url==='/api/create-payment-intent') return response({client_secret:'pi_test_secret',amount:mismatch?400:300,currency:'eur'});
    if(url==='/api/checkout') return response({error:'mock unavailable'},false);
    throw Error(`Unexpected URL ${url}`);
  };
  window.Stripe = () => ({
    paymentRequest(options) {
      const handlers={};
      const wallet={options, handlers, showCalls:0, offCalls:[], on(name,fn){handlers[name]=fn}, off(name){this.offCalls.push(name);delete handlers[name]}, canMakePayment:async()=>available?{applePay:true}:null, show(){this.showCalls++; return Promise.resolve()}};
      wallets.push(wallet); return wallet;
    },
    confirmCardPayment:async(...args)=>{confirms.push(args);return typeof confirmResult==='function'?confirmResult():confirmResult},
  });
  const load=loader({'@/lib/go-stripe':{loadStripeJs:async()=>{}}});
  return {Component:load(path.join(root,'src/components/site/coffee-button.tsx')).CoffeeButton,requests,wallets,confirms,quote};
}

test('coffee opens prepared Apple Pay synchronously and ignores duplicate taps',async()=>{
  const h=coffeeHarness(),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    const wallet=h.wallets[0],button=app.div.querySelector('button');
    assert.equal(wallet.options.currency,'eur');assert.equal(wallet.options.total.amount,300);assert.equal(wallet.options.country,'DE');
    assert.match(button.textContent,/Kaufe dem Team einen Kaffee/);
    const before=h.requests.length;
    act(()=>{button.click();assert.equal(wallet.showCalls,1);button.click();assert.equal(wallet.showCalls,1)});
    assert.equal(h.requests.length,before,'opening wallet must not await network');
    await act(async()=>wallet.handlers.cancel());
    assert.equal(button.disabled,false);
  } finally {await app.close();}
});

test('coffee confirms signed quote and only marks succeeded payment as paid',async()=>{
  const h=coffeeHarness(),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    const statuses=[];
    await act(async()=>app.div.querySelector('button').click());
    await act(async()=>h.wallets[0].handlers.paymentmethod({paymentMethod:{id:'pm_test'},complete:status=>statuses.push(status)}));
    const payload=h.requests.find(x=>x.url==='/api/create-payment-intent').body;
    assert.equal(payload.purpose,'coffee'); assert.equal(payload.quote,'signed-token');
    assert.match(payload.paymentRequestId,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.equal(h.confirms.length,1);assert.deepEqual(statuses,['success']);
    assert.equal(app.div.querySelector('button').disabled,true);
    assert.match(app.div.textContent,/Danke für den Kaffee/);
  } finally {await app.close();}
});

test('late wallet cancel after authorized coffee cannot re-enable a paid button',async()=>{
  const h=coffeeHarness(),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    await act(async()=>app.div.querySelector('button').click());
    await act(async()=>h.wallets[0].handlers.paymentmethod({paymentMethod:{id:'pm_test'},complete:()=>{}}));
    await act(async()=>h.wallets[0].handlers.cancel());
    assert.equal(app.div.querySelector('button').disabled,true,'late cancel must not override confirmed success');
  } finally {await app.close();}
});

test('cancel while coffee confirmation is pending cannot unlock a second payment',async()=>{
  let release;
  const pending=new Promise(resolve=>release=resolve);
  const h=coffeeHarness({confirmResult:()=>pending}),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    await act(async()=>app.div.querySelector('button').click());
    let confirmation;
    await act(async()=>{confirmation=h.wallets[0].handlers.paymentmethod({paymentMethod:{id:'pm_test'},complete:()=>{}});await tick();});
    await act(async()=>h.wallets[0].handlers.cancel());
    assert.equal(app.div.querySelector('button').disabled,true,'cancel during confirmation must retain busy state');
    act(()=>app.div.querySelector('button').click());
    assert.equal(h.wallets[0].showCalls,1);
    await act(async()=>{release({paymentIntent:{status:'succeeded'}});await confirmation;});
    assert.equal(app.div.querySelector('button').disabled,true);
  } finally {release?.({paymentIntent:{status:'succeeded'}});await app.close();}
});

test('processing coffee payment stays locked against accidental duplicate donation',async()=>{
  const h=coffeeHarness({confirmResult:{paymentIntent:{status:'processing'}}}),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    await act(async()=>app.div.querySelector('button').click());
    await act(async()=>h.wallets[0].handlers.paymentmethod({paymentMethod:{id:'pm_test'},complete:()=>{}}));
    assert.match(app.div.textContent,/wird verarbeitet/);
    assert.equal(app.div.querySelector('button').disabled,true,'processing intent could still succeed, so do not start another');
  } finally {await app.close();}
});

test('coffee rejects server quote mismatch without confirming a payment',async()=>{
  const h=coffeeHarness({mismatch:true}),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    const statuses=[];
    await act(async()=>app.div.querySelector('button').click());
    await act(async()=>h.wallets[0].handlers.paymentmethod({paymentMethod:{id:'pm_test'},complete:status=>statuses.push(status)}));
    assert.equal(h.confirms.length,0);assert.deepEqual(statuses,['fail']);
    assert.equal(app.div.querySelector('button').disabled,false);
  } finally {await app.close();}
});

test('locale switch detaches old wallet handlers and prepares translated replacement',async()=>{
  const h=coffeeHarness(),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    const old=h.wallets[0];
    await app.render({locale:'fr-FR',lang:'fr'});
    assert.deepEqual(old.offCalls.sort(),['cancel','paymentmethod']);
    assert.equal(h.wallets.length,2);
    assert.match(app.div.textContent,/Offrez un café/);
    act(()=>app.div.querySelector('button').click());
    assert.equal(old.showCalls,0); assert.equal(h.wallets[1].showCalls,1);
  } finally {await app.close();}
});

test('expired coffee quote refreshes before showing a wallet',async()=>{
  const h=coffeeHarness(),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  const now=Date.now;
  try {
    Date.now=()=>h.quote.expiresAt+1;
    h.quote.expiresAt+=1800000;
    // Force time past original displayed quote but not the replacement returned by fetch.
    const expiredTime=h.quote.expiresAt-1799999;
    Date.now=()=>expiredTime;
    await act(async()=>app.div.querySelector('button').click()); await settle();
    assert.equal(h.wallets[0].showCalls,0);
    assert.equal(h.requests.filter(x=>String(x.url).startsWith('/api/coffee-quote')).length,2);
    assert.equal(h.wallets.length,2);
  } finally {Date.now=now;await app.close();}
});

test('Stripe script loader shares concurrent load and retries after an error',async()=>{
  delete window.Stripe;
  for(const script of document.querySelectorAll('script[src="https://js.stripe.com/v3/"]'))script.remove();
  const {loadStripeJs}=loader()(path.join(root,'src/lib/go-stripe.ts'));
  const first=loadStripeJs(), second=loadStripeJs();
  assert.equal(first,second);assert.equal(document.querySelectorAll('script[src="https://js.stripe.com/v3/"]').length,1);
  document.querySelector('script[src="https://js.stripe.com/v3/"]').dispatchEvent(new Event('error'));
  await assert.rejects(first,/failed to load/); await assert.rejects(second,/failed to load/);
  const third=loadStripeJs();
  assert.equal(document.querySelectorAll('script[src="https://js.stripe.com/v3/"]').length,1);
  window.Stripe=()=>({});document.querySelector('script[src="https://js.stripe.com/v3/"]').dispatchEvent(new Event('load'));
  await third;
});

(async()=>{
  let failures=0;
  for(const t of tests) {
    try {await t.fn();console.log(`PASS ${t.name}`)}catch(error){failures++;console.error(`FAIL ${t.name}\n${error.stack}`)}
  }
  dom.window.close();
  console.log(JSON.stringify({tests:tests.length,passed:tests.length-failures,failed:failures}));
  process.exitCode=failures?1:0;
})();
