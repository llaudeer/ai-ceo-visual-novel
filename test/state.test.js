import test from 'node:test';
import assert from 'node:assert/strict';
import { STATS, HUD_STATS, initialState, applyEffects, resolveEffects, pickEnding }
  from '../src/game/state.js';

test('초기 자금은 200만 원', () => {
  assert.equal(initialState().cash, 2000000);
});

test('초기 AI 의존도는 0', () => {
  assert.equal(initialState().aiDependence, 0);
});

test('초기 씬은 첫 번째 씬', () => {
  assert.equal(initialState().sceneId, 's01_start');
});

test('applyEffects는 원본을 변경하지 않는다', () => {
  const s = initialState();
  applyEffects(s, { cash: -500000 });
  assert.equal(s.cash, 2000000, '원본이 변했다');
});

test('숫자 효과가 더해진다', () => {
  const s = applyEffects(initialState(), { cash: -300000, trust: 6 });
  assert.equal(s.cash, 1700000);
  assert.equal(s.trust, 56);
});

test('flag 효과는 flags에 들어간다', () => {
  const s = applyEffects(initialState(), { flag: 'outsourcing' });
  assert.equal(s.flags.outsourcing, true);
  assert.equal(s.cash, 2000000, 'flag는 숫자에 영향을 주지 않는다');
});

test('flags는 얕은 복사되어 원본과 분리된다', () => {
  const a = initialState();
  const b = applyEffects(a, { flag: 'x' });
  assert.equal(a.flags.x, undefined);
  assert.equal(b.flags.x, true);
});

test('max가 있는 스탯은 0..max로 clamp 된다', () => {
  const over = applyEffects(initialState(), { trust: 999 });
  assert.equal(over.trust, 100);
  const under = applyEffects(initialState(), { morale: -999 });
  assert.equal(under.morale, 0);
});

test('자금은 음수가 될 수 있다 — 파산 엔딩 판정에 필요하다', () => {
  const s = applyEffects(initialState(), { cash: -9000000 });
  assert.ok(s.cash < 0);
});

test('매출은 0 아래로 내려가지 않는다', () => {
  const s = applyEffects(initialState(), { revenue: -100 });
  assert.equal(s.revenue, 0);
});

test('알 수 없는 키는 무시된다', () => {
  const s = applyEffects(initialState(), { nonsense: 5 });
  assert.equal(s.nonsense, undefined);
});

test('resolveEffects는 플래그가 없으면 원본 effects 그대로', () => {
  const choice = { effects: { cash: -100 }, mod: { flag: 'x', effects: { cash: -900 } } };
  assert.deepEqual(resolveEffects(initialState(), choice), { cash: -100 });
});

test('resolveEffects는 플래그가 서 있으면 보정치를 더한다', () => {
  const s = applyEffects(initialState(), { flag: 'x' });
  const choice = { effects: { cash: -100 }, mod: { flag: 'x', effects: { cash: -900 } } };
  assert.deepEqual(resolveEffects(s, choice), { cash: -1000 });
});

test('pickEnding은 첫 번째로 참인 엔딩을 고른다', () => {
  const endings = [
    { id: 'a', test: s => s.cash < 0 },
    { id: 'b', test: () => true }
  ];
  assert.equal(pickEnding({ cash: -1 }, endings).id, 'a');
  assert.equal(pickEnding({ cash: 100 }, endings).id, 'b');
});

test('pickEnding은 아무것도 안 걸리면 throw — 폴백 누락을 조기에 잡는다', () => {
  assert.throws(() => pickEnding({ cash: 1 }, [{ id: 'a', test: () => false }]), /엔딩/);
});

test('HUD에 상시 노출되는 스탯은 자금과 AI 의존도 둘뿐', () => {
  assert.deepEqual(HUD_STATS, ['cash', 'aiDependence']);
});

test('HUD_STATS의 모든 키가 STATS에 존재한다', () => {
  const keys = new Set(STATS.map(s => s.key));
  for (const k of HUD_STATS) assert.ok(keys.has(k), `${k} 가 STATS에 없다`);
});
