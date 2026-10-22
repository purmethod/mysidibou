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
const normalizedText = (element) => element.textContent.replace(/\s+/g, ' ').trim();
function amountChoice(app, label) {
  const button=[...app.div.querySelectorAll('button.go-amount')].find(element=>normalizedText(element)===label);
  assert.ok(button,`missing contribution choice: ${label}`);
  return button;
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

function donationHarness({search={}, verified={paid:false}, intentStatus='succeeded', realCoffee=false, intentResponse={}, languages=['de-DE','en'], deferQuotes=false, deferMenu=false, menuFailureOnce=false, customFailure}={}) {
  const elements = [], events = [], requests = [], wallets=[], confirms=[];
  const quotes=new Map(),pendingQuotes=[],pendingMenus=[];
  let intentAmount=300;
  let intentCurrency='eur';
  let menuRequests=0, serverCurrency=null;
  Object.defineProperty(navigator,'languages',{configurable:true,value:languages});
  let cancelled = 0;
  const stripe = {elements(options) {
    const handlers = {};
    const group = {options, updates:[], update(value){this.updates.push(value)}, submit:async()=>({}), create() { return { on(event,handler){handlers[event]=handler}, mount(){handlers.ready?.({availablePaymentMethods:{applePay:true}})}, destroy(){cancelled++} }; }};
    elements.push(group); events.push(handlers); return group;
  }, confirmPayment: async(options)=>{confirms.push(options);return {paymentIntent:{status:intentStatus,amount:intentAmount,currency:intentCurrency}}},
  paymentRequest(options) {
    const handlers={};
    const wallet={options,handlers,showCalls:0,on(name,handler){handlers[name]=handler},off(name){delete handlers[name]},canMakePayment:async()=>({applePay:true}),show(){this.showCalls++}};
    wallets.push(wallet);return wallet;
  },confirmCardPayment:async()=>({paymentIntent:{status:'succeeded'}})};
  window.Stripe = () => stripe;
  globalThis.fetch = async (url, options) => {
    requests.push({url, body:options?.body ? JSON.parse(options.body):null, signal:options?.signal});
    if (url === '/api/config') return response({publishableKey:'pk_test', merchantCountry:'DE'});
    if (String(url).startsWith('/api/coffee-quote')) return response({amount:300,currency:'eur',baseAmount:10000,baseCurrency:'tnd',fallbackReason:null,token:'signed-token',expiresAt:Date.now()+1800000});
    if (String(url).startsWith('/api/donation-quote')) {
      const query=new URL(url,'https://mysidibou.com').searchParams;
      const locale=query.get('locale');
      const currency=serverCurrency??(locale==='ja-JP'?'jpy':'eur');
      if(query.get('menu')==='1') {
        if(++menuRequests===1 && menuFailureOnce)throw new Error('temporary quote network failure');
        const choices=[10,20,50,80].map(amountTnd=>{
          const amount=currency==='jpy'?Math.ceil(amountTnd*50):Math.ceil(amountTnd*(currency==='usd'?0.35:0.3))*100;
          const token=`donation-${locale}-${currency}-${amountTnd}`;
          const quote={amount,currency,baseAmount:amountTnd*1000,baseCurrency:'tnd',fallbackReason:null,token,expiresAt:Date.now()+1800000};
          quotes.set(token,quote);
          return quote;
        });
        const menu={choices,customMax:currency==='jpy'?500000:300000};
        if(deferMenu)return new Promise(resolve=>pendingMenus.push({locale,menu,release:()=>resolve(response(menu))}));
        return response(menu);
      }
      assert.equal(query.get('currency'),currency,'custom quotes must retain the menu currency');
      assert.equal(query.has('amountTnd'),false,'custom input must be sent in local units');
      const amountLocal=Number(query.get('amountLocal'));
      if(customFailure && amountLocal===customFailure.amount && currency==='eur') {
        serverCurrency=customFailure.nextCurrency;
        return response({error:customFailure.error},false);
      }
      const amount=amountLocal*(currency==='jpy'?1:100);
      const token=`custom-${locale}-${currency}-${amountLocal}`;
      const quote={amount,currency,custom:true,baseAmount:amount,baseCurrency:currency,fallbackReason:null,token,expiresAt:Date.now()+1800000};
      quotes.set(token,quote);
      if(deferQuotes) return new Promise(resolve=>pendingQuotes.push({amountLocal,quote,signal:options?.signal,release:()=>resolve(response(quote))}));
      return response(quote);
    }
    if (String(url).startsWith('/api/payment-status')) return response(verified);
    if (url === '/api/checkout') return response({error:'mock checkout blocked'},false);
    if (url === '/api/create-payment-intent') {
      const body=JSON.parse(options.body);
      if(body.purpose==='coffee') return response({client_secret:'pi_test_secret_test',amount:300,currency:'eur'});
      const quote=quotes.get(body.quote);
      assert.ok(quote,'donation must submit a token returned by the quote endpoint');
      intentAmount=quote.amount;intentCurrency=quote.currency;
      return response({client_secret:'pi_test_secret_test',amount:quote.amount,currency:quote.currency,purpose:'donation',...intentResponse});
    }
    throw new Error(`Unexpected URL ${url}`);
  };
  const load = loader({
    '@tanstack/react-router':{createFileRoute:() => config => ({...config, useSearch:()=>search, useLoaderData:()=>({lang:'de'})})},
    '@tanstack/react-start':{createServerFn:()=>({handler:()=>()=>({})})},
    '@/lib/rate.server':{contributionCents:async()=>300,tndToEurRate:async()=>0.3}, '@/lib/lang.server':{visitorLang:()=> 'de'},
    ...(!realCoffee?{'@/components/site/coffee-button':{CoffeeButton:({completed})=>completed?React.createElement('div',{'data-coffee-completed':true},`${completed.amount}:${completed.currency}`):null}}:{}),
    '@/lib/go-stripe':{STRIPE_JS:'https://js.stripe.com/v3/',loadStripeJs:async()=>{}},
  });
  return {Component:load(path.join(root,'src/routes/go.tsx')).Route.component, elements, events, requests, wallets, confirms, quotes, pendingQuotes, pendingMenus, cancelled:()=>cancelled};
}

test('landing shows four compact actions with independent coffee and deferred donation controls',async()=>{
  const h=donationHarness({realCoffee:true}),app=await mounted(h.Component);
  try {
    assert.deepEqual([...app.div.querySelectorAll('.go__links .go-insta__text')].map(el=>el.textContent.trim()),['Kaufe dem Team einen Kaffee','INSTAGRAM','MYSIDIBOU.COM','SUPPORT']);
    const toggle=app.div.querySelector('#go-support-toggle');
    assert.equal(toggle.getAttribute('aria-expanded'),'false');
    assert.equal(toggle.getAttribute('aria-controls'),'go-support-panel');
    assert.equal(app.div.querySelector('.go-amounts'),null);
    assert.equal(app.div.querySelector('.go-pay__ece'),null);
    assert.equal(app.div.querySelector('.go-tile'),null);
    const coffee=app.div.querySelector('.go-coffee');
    assert.ok(coffee,'coffee must be available before SUPPORT opens');
    assert.ok(coffee.closest('.go__links'));
    assert.equal(coffee.closest('#go-support-panel'),null);
    assert.ok(coffee.querySelector('.go-coffee__icon'));
    assert.equal(coffee.querySelector('.go-coffee__price'),null,'the compact landing bar must not show a price');
    assert.equal(coffee.querySelector('.go-insta__text').textContent.trim(),'Kaufe dem Team einen Kaffee');
    assert.match(coffee.querySelector('button').getAttribute('aria-label'),/3\s*€/,'the accessible label retains the actual wallet charge');
    assert.equal(h.wallets.length,1,'the independent coffee wallet must prepare on the closed landing');
    assert.equal(h.wallets[0].options.total.amount,300);
    assert.equal(h.elements.length,0,'closed SUPPORT must not initialize the donation wallet');
    assert.equal(h.requests.some(request=>String(request.url).startsWith('/api/coffee-quote')),true);
    assert.equal(h.requests.some(request=>String(request.url).startsWith('/api/donation-quote')),false);
    const panel=await openSupport(app);
    assert.ok(panel.querySelector('.go-amounts'));
    assert.ok(panel.querySelector('.go-pay__ece'));
    assert.ok(panel.querySelector('.go-tile'));
    assert.equal(panel.querySelector('.go-coffee'),null,'the coffee action must remain outside the donation panel');
    await act(async()=>toggle.click());
    assert.equal(toggle.getAttribute('aria-expanded'),'false');
    assert.equal(panel.hidden,true,'closed panel must hide the donation controls');
    assert.equal(coffee.closest('[hidden]'),null,'closing SUPPORT must not hide the independent coffee action');
  } finally {await app.close();}
});

test('coffee opens its prepared wallet synchronously while SUPPORT remains closed',async()=>{
  const h=donationHarness({realCoffee:true}),app=await mounted(h.Component);
  try {
    const toggle=app.div.querySelector('#go-support-toggle');
    const button=app.div.querySelector('.go-coffee__button');
    const wallet=h.wallets[0];
    assert.equal(button.disabled,false);
    assert.equal(wallet.options.currency,'eur');assert.equal(wallet.options.total.amount,300);
    const requestCount=h.requests.length;
    act(()=>{
      button.click();
      assert.equal(wallet.showCalls,1,'show must run in the original user click');
      assert.equal(toggle.getAttribute('aria-expanded'),'false');
    });
    assert.equal(h.requests.length,requestCount,'opening coffee must not await a new server request');
    assert.equal(app.div.querySelector('.go-amounts'),null);
    assert.equal(h.elements.length,0);
    await act(async()=>wallet.handlers.cancel());
  } finally {await app.close();}
});

test('closing and reopening SUPPORT preserves confirmed coffee and prevents another charge',async()=>{
  const h=donationHarness({realCoffee:true}),app=await mounted(h.Component);
  try {
    const wallet=h.wallets[0],button=app.div.querySelector('.go-coffee__button');
    assert.equal(wallet.options.total.amount,300);
    await act(async()=>button.click());
    await act(async()=>wallet.handlers.paymentmethod({paymentMethod:{id:'pm_test'},complete:()=>{}}));
    assert.equal(button.disabled,true);
    assert.match(app.div.querySelector('.go-coffee').textContent,/Danke für den Kaffee/);
    await openSupport(app);
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

test('local custom amount mounts, focuses and selects synchronously in the click', async()=>{
  const h=donationHarness(), app=await mounted(h.Component);
  try {
    await openSupport(app);
    const button=amountChoice(app,'24 €+');
    act(()=>{
      button.click();
      const input=app.div.querySelector('.go-amount input');
      assert.ok(input, 'input must exist before click returns');
      assert.equal(document.activeElement,input,'input must be focused before click returns');
      assert.equal(input.value,'24');
      assert.ok(input.getAttribute('aria-label'),'custom amount must have an accessible label');
      assert.doesNotMatch(input.getAttribute('aria-label'),/TND|Dinar/i);
      assert.equal(input.selectionStart,0); assert.equal(input.selectionEnd,2);
    });
  } finally {await app.close();}
});

test('local preset chips use one signed menu and submit exactly the displayed local amount',async()=>{
  const h=donationHarness(),app=await mounted(h.Component);
  try {
    await openSupport(app);
    assert.deepEqual([...app.div.querySelectorAll('button.go-amount')].map(normalizedText),['3 €','6 €','15 €','24 €+']);
    assert.doesNotMatch(app.div.querySelector('#go-support-panel').textContent,/TND|Dinar/i);
    for(const [baseAmount,eurCents,label] of [[10000,300,'3 €'],[20000,600,'6 €'],[50000,1500,'15 €']]) {
      await act(async()=>amountChoice(app,label).click());
      await settle();
      const group=h.elements.at(-1);
      assert.equal(group.options.currency,'eur','wallet must use the displayed currency');
      assert.equal(group.updates.at(-1)?.amount??group.options.amount,eurCents);
      await act(async()=>app.div.querySelector('.go-tile').click());await settle();
      const submitted=h.requests.filter(request=>request.url==='/api/checkout').at(-1).body;
      assert.equal(submitted.purpose,'donation');
      assert.equal(h.quotes.get(submitted.quote).baseAmount,baseAmount);
      assert.equal(submitted.amount,eurCents);
      assert.equal(submitted.currency,'eur');
    }
    const pricingRequests=h.requests.filter(request=>String(request.url).startsWith('/api/donation-quote'));
    assert.equal(pricingRequests.length,1,'preset selection must reuse a single menu conversion');
    assert.equal(new URL(pricingRequests[0].url,'https://mysidibou.com').searchParams.get('menu'),'1');
  } finally {await app.close();}
});

test('donation controls and wallet wait for the local-currency menu before initializing',async()=>{
  const h=donationHarness({deferMenu:true}),app=await mounted(h.Component);
  try {
    await openSupport(app);
    assert.equal(app.div.querySelector('.go-tile').disabled,true);
    assert.equal(h.elements.length,0,'Stripe must not initialize with an assumed EUR amount');
    assert.equal(h.pendingMenus.length,1);
    act(()=>app.div.querySelector('.go-tile').click());
    assert.equal(h.requests.filter(request=>request.url==='/api/checkout').length,0);
    await act(async()=>h.pendingMenus[0].release());await settle();
    assert.deepEqual([...app.div.querySelectorAll('button.go-amount')].map(normalizedText),['3 €','6 €','15 €','24 €+']);
    assert.equal(app.div.querySelector('.go-tile').disabled,false);
    assert.equal(h.elements.at(-1).options.currency,'eur');
    assert.equal(h.elements.at(-1).options.amount,300);
  } finally {for(const menu of h.pendingMenus)menu.release();await app.close();}
});

test('a failed donation menu can recover through Retry without reopening SUPPORT',async()=>{
  const h=donationHarness({menuFailureOnce:true}),app=await mounted(h.Component);
  try {
    await openSupport(app);
    assert.equal(app.div.querySelector('.go-tile').disabled,true);
    assert.equal(h.elements.length,0,'a failed menu must not initialize payment with a guessed price');
    const retry=app.div.querySelector('.go-support__retry');
    assert.ok(retry,'network failure must leave an accessible retry action');
    await act(async()=>retry.click());await settle();
    assert.equal(app.div.querySelector('#go-support-toggle').getAttribute('aria-expanded'),'true');
    assert.equal(app.div.querySelector('.go-support__retry'),null);
    assert.deepEqual([...app.div.querySelectorAll('button.go-amount')].map(normalizedText),['3 €','6 €','15 €','24 €+']);
    assert.equal(app.div.querySelector('.go-tile').disabled,false);
    assert.equal(h.elements.at(-1).options.currency,'eur');assert.equal(h.elements.at(-1).options.amount,300);
    const menus=h.requests.filter(request=>String(request.url).includes('menu=1'));
    assert.equal(menus.length,2,'Retry must fetch one replacement menu');
    await act(async()=>app.div.querySelector('.go-tile').click());await settle();
    const submitted=h.requests.find(request=>request.url==='/api/checkout').body;
    assert.equal(submitted.currency,'eur');assert.equal(submitted.amount,300);
  } finally {await app.close();}
});

test('retry after a rejected custom quote refreshes currency and clears the old custom amount',async()=>{
  for(const error of ['currency_changed','invalid_donation_amount']) {
    const h=donationHarness({customFailure:{amount:25,error,nextCurrency:'usd'}}),app=await mounted(h.Component);
    try {
      await openSupport(app);
      await act(async()=>amountChoice(app,'24 €+').click());await settle();
      const input=app.div.querySelector('.go-amount input');
      await act(async()=>inputValue(input,'25'));await settle();
      assert.equal(input.value,'25');
      assert.equal(app.div.querySelector('.go-tile').disabled,true,`${error} must block payment`);
      const retry=app.div.querySelector('.go-support__retry');
      assert.ok(retry,`${error} must allow recovery`);
      await act(async()=>retry.click());await settle();
      assert.equal(app.div.querySelector('.go-amount input'),null,'the previous EUR custom input must be cleared when the menu changes currency');
      assert.equal(app.div.querySelector('.go-support__retry'),null);
      assert.equal(app.div.querySelector('.go-tile').disabled,false);
      const selected=app.div.querySelector('button.go-amount[aria-checked="true"]');
      assert.ok(selected);
      assert.equal(normalizedText(selected),'4 $','currency changes must reset to the first preset');
      const group=h.elements.at(-1);
      assert.equal(group.options.currency,'usd');assert.equal(group.options.amount,400);
      const unsafe=h.requests.filter(request=>{
        if(!String(request.url).startsWith('/api/donation-quote'))return false;
        const query=new URL(request.url,'https://mysidibou.com').searchParams;
        return query.get('amountLocal')==='25' && query.get('currency')==='usd';
      });
      assert.equal(unsafe.length,0,'25 EUR must never be reinterpreted as 25 USD');
      assert.equal(h.requests.filter(request=>String(request.url).includes('menu=1')).length,2);
      await act(async()=>app.div.querySelector('.go-tile').click());await settle();
      const submitted=h.requests.find(request=>request.url==='/api/checkout').body;
      assert.equal(submitted.currency,'usd');assert.equal(submitted.amount,400);
      assert.equal(h.quotes.get(submitted.quote).baseAmount,10000);
      await act(async()=>amountChoice(app,'28 $+').click());await settle();
      assert.equal(app.div.querySelector('.go-amount input').value,'28','reopening custom must start from the new currency minimum');
    } finally {await app.close();}
  }
});

test('a slower earlier custom quote cannot replace the currently entered local amount',async()=>{
  const h=donationHarness({deferQuotes:true}),app=await mounted(h.Component);
  try {
    await openSupport(app);
    await act(async()=>amountChoice(app,'24 €+').click());await settle();
    const input=app.div.querySelector('.go-amount input');
    await act(async()=>inputValue(input,'25'));await settle();
    const old=h.pendingQuotes.find(item=>item.amountLocal===25);
    assert.ok(old,'typing 25 EUR must request an exact local quote');
    assert.equal(app.div.querySelector('.go-tile').disabled,true);
    await act(async()=>inputValue(input,'26'));await settle();
    const current=h.pendingQuotes.find(item=>item.amountLocal===26);
    assert.ok(current);
    assert.equal(old.signal?.aborted,true,'superseded custom requests should be aborted');
    act(()=>app.div.querySelector('.go-tile').click());
    assert.equal(h.requests.filter(request=>request.url==='/api/checkout').length,0);
    await act(async()=>current.release());await settle();
    assert.equal(app.div.querySelector('.go-tile').disabled,false);
    const group=h.elements.at(-1);
    assert.equal(group.options.amount,2600);assert.equal(group.options.currency,'eur');
    const initialized=h.elements.length;
    await act(async()=>old.release());await settle();
    assert.equal(input.value,'26');
    assert.equal(h.elements.length,initialized,'a late stale quote must not reinitialize the wallet');
    await act(async()=>app.div.querySelector('.go-tile').click());await settle();
    const submitted=h.requests.find(request=>request.url==='/api/checkout').body;
    assert.equal(submitted.quote,current.quote.token);assert.equal(submitted.amount,2600);assert.equal(submitted.currency,'eur');
  } finally {for(const quote of h.pendingQuotes)quote.release();await app.close();}
});

test('invalid custom input cannot pay and a valid 25 EUR input charges exactly 25 EUR', async()=>{
  const h=donationHarness(), app=await mounted(h.Component);
  try {
    await openSupport(app);
    await act(async()=>amountChoice(app,'24 €+').click());await settle();
    const input=app.div.querySelector('.go-amount input');
    for (const value of ['', '23', '3001', '24.5', '24,5', '-25', '2e2']) {
      await act(async()=>inputValue(input,value));
      assert.equal(input.getAttribute('aria-invalid'),'true',`invalid local amount ${JSON.stringify(value)} must not become a different payable amount`);
      assert.equal(app.div.querySelector('.go-tile').disabled,true);
      assert.equal(app.div.querySelector('.go-pay__slot').hasAttribute('inert'),true);
      let resolved=false, failed=false;
      h.events.at(-1).click({resolve:()=>resolved=true});
      await h.events.at(-1).confirm({paymentFailed:()=>failed=true});
      assert.equal(resolved,false); assert.equal(failed,true);
      assert.equal(h.requests.filter(x=>x.url==='/api/create-payment-intent'||x.url==='/api/checkout').length,0);
    }
    await act(async()=>inputValue(input,'25'));await settle();
    assert.equal(input.getAttribute('aria-invalid'),'false');
    assert.equal(app.div.querySelector('.go-tile').disabled,false);
    const group=h.elements.at(-1);
    assert.equal(group.updates.at(-1)?.amount??group.options.amount,2500,'25 EUR must remain exactly 25 EUR');
    assert.equal(group.options.currency,'eur');
    assert.doesNotMatch(app.div.querySelector('#go-support-panel').textContent,/TND|Dinar/i);
    await act(async()=>app.div.querySelector('.go-tile').click()); await settle();
    const submitted=h.requests.find(x=>x.url==='/api/checkout').body;
    assert.equal(submitted.amount,2500);
    assert.equal(submitted.currency,'eur');
    const quote=h.quotes.get(submitted.quote);
    assert.equal(quote.custom,true);assert.equal(quote.baseAmount,2500);assert.equal(quote.baseCurrency,'eur');
  } finally {await app.close();}
});

test('donation wallet submits the selected signed quote and confirms only the disclosed amount',async()=>{
  const h=donationHarness(),app=await mounted(h.Component);
  try {
    await openSupport(app);
    await act(async()=>amountChoice(app,'6 €').click());
    await settle();
    await act(async()=>h.events.at(-1).confirm({paymentFailed:()=>{throw Error('valid conversion must not fail')}}));
    const body=h.requests.find(request=>request.url==='/api/create-payment-intent').body;
    assert.equal(body.purpose,'donation');assert.equal(h.quotes.get(body.quote).baseAmount,20000);
    assert.equal(body.amount,600);assert.equal(body.currency,'eur');
    assert.equal(h.confirms.length,1);
    assert.ok(app.div.querySelector('.go-thanks'));
  } finally {await app.close();}
});

test('donation wallet refuses a stale amount or mismatched currency before confirmation',async()=>{
  for(const intentResponse of [{amount:601,currency:'eur'},{amount:600,currency:'usd'}]) {
    const h=donationHarness({intentResponse}),app=await mounted(h.Component);
    try {
      await openSupport(app);
      await act(async()=>amountChoice(app,'6 €').click());
      await settle();
      let failed=false;
      await act(async()=>h.events.at(-1).confirm({paymentFailed:()=>failed=true}));
      assert.equal(failed,true);
      assert.equal(h.confirms.length,0,'the visitor must never authorize a different amount or currency');
      assert.equal(app.div.querySelector('.go-thanks'),null);
      assert.ok(app.div.querySelector('.go-support__error'));
    } finally {await app.close();}
  }
});

test('Japanese phone locale displays only JPY chips and charges exact custom yen',async()=>{
  const h=donationHarness({languages:['ja-JP']}),app=await mounted(h.Component);
  try {
    await openSupport(app);
    const yen=amount=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',minimumFractionDigits:0,maximumFractionDigits:0}).format(amount);
    assert.deepEqual([...app.div.querySelectorAll('button.go-amount')].map(normalizedText),[yen(500),yen(1000),yen(2500),`${yen(4000)}+`]);
    const group=h.elements.at(-1);
    assert.equal(group.options.currency,'jpy');assert.equal(group.options.amount,500);
    assert.doesNotMatch(app.div.querySelector('#go-support-panel').textContent,/TND|Dinar|EUR|€/i);
    await act(async()=>amountChoice(app,`${yen(4000)}+`).click());await settle();
    const input=app.div.querySelector('.go-amount input');
    assert.equal(input.value,'4000');
    await act(async()=>inputValue(input,'4201'));await settle();
    assert.equal(h.elements.at(-1).options.currency,'jpy');assert.equal(h.elements.at(-1).options.amount,4201);
    await act(async()=>h.events.at(-1).confirm({paymentFailed:()=>{throw Error('valid JPY quote must not fail')}}));
    const body=h.requests.find(request=>request.url==='/api/create-payment-intent').body;
    assert.equal(body.amount,4201);assert.equal(body.currency,'jpy');
    const quote=h.quotes.get(body.quote);
    assert.equal(quote.custom,true);assert.equal(quote.baseCurrency,'jpy');assert.equal(quote.baseAmount,4201);
    assert.equal(h.confirms.length,1);
    assert.ok(app.div.querySelector('.go-thanks'),'a successful non-EUR donation must show its confirmation');
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

function coffeeHarness({available=true, mismatch=false, quoteLife=1800000, confirmResult={paymentIntent:{status:'succeeded'}}, capability, showBehavior, configFailure=false, missingStripe=false}={}) {
  const requests=[], wallets=[], confirms=[];
  const quote={amount:300,currency:'eur',baseAmount:10000,baseCurrency:'tnd',fallbackReason:null,token:'signed-token',expiresAt:Date.now()+quoteLife};
  globalThis.fetch=async(url,options)=>{
    requests.push({url,body:options?.body?JSON.parse(options.body):null});
    if(String(url).startsWith('/api/coffee-quote')) return response({...quote});
    if(url==='/api/config') {
      if(configFailure) throw new Error('config network unavailable');
      return response({publishableKey:'pk_test',merchantCountry:'DE'});
    }
    if(url==='/api/create-payment-intent') return response({client_secret:'pi_test_secret',amount:mismatch?400:300,currency:'eur'});
    if(url==='/api/checkout') return response({error:'mock unavailable'},false);
    throw Error(`Unexpected URL ${url}`);
  };
  window.Stripe = () => ({
    paymentRequest(options) {
      const handlers={};
      const wallet={options, handlers, showCalls:0, offCalls:[], on(name,fn){handlers[name]=fn}, off(name){this.offCalls.push(name);delete handlers[name]},
        canMakePayment:async()=>capability?capability():typeof available==='object'?available:available?{applePay:true}:null,
        show(){this.showCalls++; return showBehavior?showBehavior():Promise.resolve()}};
      wallets.push(wallet); return wallet;
    },
    confirmCardPayment:async(...args)=>{confirms.push(args);return typeof confirmResult==='function'?confirmResult():confirmResult},
  });
  const load=loader({'@/lib/go-stripe':{loadStripeJs:async()=>{if(missingStripe)delete window.Stripe}}});
  return {Component:load(path.join(root,'src/components/site/coffee-button.tsx')).CoffeeButton,requests,wallets,confirms,quote};
}

test('coffee opens prepared Apple Pay synchronously and ignores duplicate taps',async()=>{
  const h=coffeeHarness(),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    const wallet=h.wallets[0],button=app.div.querySelector('button');
    assert.equal(wallet.options.currency,'eur');assert.equal(wallet.options.total.amount,300);assert.equal(wallet.options.country,'DE');
    assert.match(button.textContent,/Kaufe dem Team einen Kaffee/);
    assert.equal(normalizedText(app.div.querySelector('.go-coffee__price')),'3 €');
    assert.doesNotMatch(button.textContent,/TND|Dinar/i);
    const before=h.requests.length;
    act(()=>{button.click();assert.equal(wallet.showCalls,1);button.click();assert.equal(wallet.showCalls,1)});
    assert.equal(h.requests.length,before,'opening wallet must not await network');
    await act(async()=>wallet.handlers.cancel());
    assert.equal(button.disabled,false);
  } finally {await app.close();}
});

test('coffee opens available Google Pay synchronously without starting Checkout',async()=>{
  const h=coffeeHarness({available:{googlePay:true,applePay:false}}),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    const before=h.requests.length;
    const wallet=h.wallets[0];
    act(()=>{
      app.div.querySelector('button').click();
      assert.equal(wallet.showCalls,1,'Google Pay must open inside the original tap');
    });
    assert.equal(h.requests.length,before);
    assert.equal(h.requests.filter(request=>request.url==='/api/checkout').length,0);
    await act(async()=>wallet.handlers.cancel());
  } finally {await app.close();}
});

function assertOneCoffeeCheckout(h) {
  const checkouts=h.requests.filter(request=>request.url==='/api/checkout');
  assert.equal(checkouts.length,1,'one tap must create exactly one hosted Checkout request');
  assert.equal(checkouts[0].body.purpose,'coffee');
  assert.equal(checkouts[0].body.quote,h.quote.token);
  assert.match(checkouts[0].body.paymentRequestId,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(h.requests.filter(request=>request.url==='/api/create-payment-intent').length,0);
  return checkouts[0].body;
}

test('unavailable wallets or wallet setup failures fall back directly to hosted coffee Checkout',async()=>{
  const scenarios=[
    ['no supported wallet',{available:false}],
    ['capability rejection',{capability:()=>Promise.reject(new Error('wallet capability unavailable'))}],
    ['config fetch failure',{configFailure:true}],
    ['Stripe script without a usable Stripe global',{missingStripe:true}],
  ];
  for(const [name,options] of scenarios) {
    const h=coffeeHarness(options),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
    try {
      const button=app.div.querySelector('button');
      assert.equal(button.disabled,false,`${name}: the valid signed quote must keep Checkout available`);
      await act(async()=>button.click());await settle();
      assertOneCoffeeCheckout(h);
      assert.equal(h.wallets.reduce((count,wallet)=>count+wallet.showCalls,0),0,`${name}: an unavailable wallet must not open`);
    } finally {await app.close();}
  }
});

test('technical wallet show errors fall back on the same tap and keep the original payment attempt',async()=>{
  for(const behavior of ['throw','reject']) {
    const h=coffeeHarness({showBehavior:()=>{
      const error=new Error('wallet could not open');
      if(behavior==='throw')throw error;
      return Promise.reject(error);
    }}),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
    const original=globalThis.crypto.randomUUID;
    const attempts=[];
    globalThis.crypto.randomUUID=function(){const id=original.call(this);attempts.push(id);return id};
    try {
      act(()=>{
        app.div.querySelector('button').click();
        assert.equal(h.wallets[0].showCalls,1);
      });
      await settle();
      const body=assertOneCoffeeCheckout(h);
      assert.equal(attempts.length,1,'wallet failure must not create a second payment attempt');
      assert.equal(body.paymentRequestId,attempts[0]);
    } finally {globalThis.crypto.randomUUID=original;await app.close();}
  }
});

test('wallet cancellation and AbortError never redirect the visitor into Checkout',async()=>{
  for(const behavior of ['cancel','abortThrow','abortReject']) {
    const h=coffeeHarness({showBehavior:()=>{
      if(behavior==='cancel')return Promise.resolve();
      const error=Object.assign(new Error('user canceled the wallet'),{name:'AbortError'});
      if(behavior==='abortThrow')throw error;
      return Promise.reject(error);
    }}),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
    try {
      await act(async()=>app.div.querySelector('button').click());
      if(behavior==='cancel')await act(async()=>h.wallets[0].handlers.cancel());
      await settle();
      assert.equal(h.requests.filter(request=>request.url==='/api/checkout').length,0,`${behavior}: cancellation must not launch another payment flow`);
      assert.equal(h.requests.filter(request=>request.url==='/api/create-payment-intent').length,0);
      assert.equal(app.div.querySelector('button').disabled,false,'cancellation must permit an intentional later retry');
    } finally {await app.close();}
  }
});

test('a canceled wallet attempt cannot redirect or unlock a newer active attempt after a late rejection',async()=>{
  const pending=[];
  const h=coffeeHarness({showBehavior:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))});
  const app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    const button=app.div.querySelector('button'),wallet=h.wallets[0];
    act(()=>button.click());
    assert.equal(pending.length,1);
    assert.equal(button.disabled,true);
    await act(async()=>wallet.handlers.cancel());
    assert.equal(button.disabled,false);
    act(()=>button.click());
    assert.equal(pending.length,2);
    assert.equal(button.disabled,true);
    await act(async()=>pending[0].reject(new Error('the canceled wallet failed late')));
    await settle();
    assert.equal(h.requests.filter(request=>request.url==='/api/checkout').length,0,'an old rejection must not launch Checkout for the new attempt');
    assert.equal(h.requests.filter(request=>request.url==='/api/create-payment-intent').length,0);
    assert.equal(button.disabled,true,'the newer wallet must remain locked while it is open');
    act(()=>button.click());
    assert.equal(wallet.showCalls,2,'the active wallet must still reject duplicate taps');
    await act(async()=>{pending[1].resolve();wallet.handlers.cancel();});
  } finally {await app.close();}
});

test('unresponsive wallet detection becomes a usable Checkout fallback within a bounded wait',async()=>{
  const h=coffeeHarness({capability:()=>new Promise(()=>{})}),app=await mounted(h.Component,{locale:'de-DE',lang:'de'});
  try {
    await act(async()=>new Promise(resolve=>setTimeout(resolve,3200)));
    assert.equal(app.div.querySelector('button').disabled,false,'wallet detection must not block the signed quote indefinitely');
    await act(async()=>app.div.querySelector('button').click());await settle();
    assertOneCoffeeCheckout(h);
    assert.equal(h.wallets[0].showCalls,0);
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
