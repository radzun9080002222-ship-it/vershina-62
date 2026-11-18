import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/metrika.js', import.meta.url), 'utf8');
function setup() {
  const listeners = {}, scripts = [];
  const window = { location: { href: 'https://vershina-62.ru/' } };
  const document = { addEventListener: (name, fn) => listeners[name] = fn, createElement: () => ({}), head: { appendChild: s => scripts.push(s) } };
  const context = vm.createContext({ window, document, URL, Date });
  vm.runInContext(source, context);
  return { window, listeners, scripts, context, calls: () => Array.from(window.ym.a, args => Array.from(args)) };
}
function target(matches = {}) { return { closest: selector => matches[selector] || null }; }

test('initializes only the new counter and does not duplicate listeners or tag', () => {
  const s = setup();
  assert.equal(s.calls()[0][0], 114341477);
  assert.equal(s.calls()[0][1], 'init');
  assert.equal(s.calls()[0][2].webvisor, true);
  assert.equal(s.scripts[0].src, 'https://mc.yandex.ru/metrika/tag.js');
  const before = s.listeners.click;
  vm.runInContext(source, s.context);
  assert.equal(s.scripts.length, 1);
  assert.equal(s.calls().length, 1);
  assert.equal(s.listeners.click, before);
  assert.ok(!source.includes('112587504'));
});
test('tracks the four contacts including clicks on nested icons', () => {
  for (const [href, name] of [['tel:+79224539145','click_phone'],['https://wa.me/79224539145','click_whatsapp'],['https://t.me/vershina_cleaning','click_telegram'],['https://max.ru/u/example','click_max']]) {
    const s = setup();
    s.listeners.click({ target: target({ 'a[href]': { getAttribute: () => href } }) });
    assert.deepEqual(s.calls().slice(1), [[114341477, 'reachGoal', name]]);
  }
});
test('tracks calculator buttons/range/select but not page load or irrelevant elements', () => {
  const s = setup();
  s.listeners.click({ target: target({ '#calc button': {} }) });
  s.listeners.input({ target: target({ '#calc input': {} }) });
  s.listeners.change({ target: target({ '#calc select': {} }) });
  s.listeners.change({ target: target({ '#calc input': {} }) }); // No duplicate range change goal.
  s.listeners.click({ target: target() });
  s.listeners.input({ target: target() });
  s.listeners.click({ target: null });
  assert.deepEqual(s.calls().slice(1), Array.from({length:3}, () => [114341477,'reachGoal','calc_interaction']));
});
test('does not classify similar malicious/unrelated host names as contacts', () => {
  const s = setup();
  for (const href of ['https://max.ru.example.org/','https://example.org/?next=t.me','#calc','/privacy.html']) {
    s.listeners.click({ target: target({ 'a[href]': { getAttribute: () => href } }) });
  }
  assert.equal(s.calls().length, 1);
});
