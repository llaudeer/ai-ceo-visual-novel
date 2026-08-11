import test from 'node:test';
import assert from 'node:assert/strict';
import { ARIA_STATES, THEME, getTone, applyToneVars } from '../src/ui/theme.js';

test('상태는 정확히 4개', () => {
  assert.deepEqual(ARIA_STATES, ['neutral', 'suggest', 'recommend', 'warn']);
});

test('모든 상태에 톤이 정의되어 있다', () => {
  for (const s of ARIA_STATES) assert.ok(THEME[s], `${s} 톤 없음`);
});

test('key 필드가 상태명과 일치한다', () => {
  for (const s of ARIA_STATES) assert.equal(THEME[s].key, s);
});

test('색상은 6자리 hex', () => {
  for (const s of ARIA_STATES) {
    for (const k of ['hex', 'glow', 'dim']) {
      assert.match(THEME[s][k], /^#[0-9A-Fa-f]{6}$/, `${s}.${k} = ${THEME[s][k]}`);
    }
  }
});

test('rgb는 hex와 일치하는 0..1 정규화 값', () => {
  for (const s of ARIA_STATES) {
    const t = THEME[s];
    const [r, g, b] = t.rgb;
    for (const v of [r, g, b]) {
      assert.ok(v >= 0 && v <= 1, `${s}: rgb 값이 0..1을 벗어남`);
    }
    assert.equal(Math.round(r * 255), parseInt(t.hex.slice(1, 3), 16), `${s}.rgb[0]`);
    assert.equal(Math.round(g * 255), parseInt(t.hex.slice(3, 5), 16), `${s}.rgb[1]`);
    assert.equal(Math.round(b * 255), parseInt(t.hex.slice(5, 7), 16), `${s}.rgb[2]`);
  }
});

test('평상시 상태는 라벨이 없다', () => {
  assert.equal(THEME.neutral.label, null);
});

test('나머지 세 상태는 화면에 띄울 라벨을 갖는다', () => {
  assert.equal(THEME.suggest.label, 'ARIA 제안');
  assert.equal(THEME.recommend.label, 'ARIA 추천');
  assert.equal(THEME.warn.label, 'ARIA 비추천 ⚠');
});

test('네 상태의 색이 서로 다르다', () => {
  const hexes = ARIA_STATES.map(s => THEME[s].hex);
  assert.equal(new Set(hexes).size, 4);
});

test('getTone은 없는 상태에 throw', () => {
  assert.throws(() => getTone('rainbow'), /rainbow/);
});

test('applyToneVars가 CSS 변수를 설정한다', () => {
  const set = {};
  const fakeEl = { style: { setProperty: (k, v) => { set[k] = v; } } };
  applyToneVars(fakeEl, 'warn');
  assert.equal(set['--aria-hex'], THEME.warn.hex);
  assert.equal(set['--aria-glow'], THEME.warn.glow);
  assert.equal(set['--aria-dim'], THEME.warn.dim);
});
