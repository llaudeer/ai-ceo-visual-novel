import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATS, HUD_STATS, CRITICAL_BUG_FLAGS,
  initialState, applyEffects, resolveEffects, resolveBranch, pickEnding, criticalBugs
} from '../src/game/state.js';
import { ORDER } from '../src/game/story.data.js';

test('초기 자금은 100,000 CR', () => {
  assert.equal(initialState().funds, 100000);
});

test('초기 스탯은 대본이 요구하는 넷뿐', () => {
  const s = initialState();
  for (const key of ['funds', 'trust', 'quality', 'aiDependence']) {
    assert.equal(typeof s[key], 'number', `${key}가 있어야 한다`);
  }
  assert.equal(STATS.length, 4);
});

test('초기 씬은 첫 번째 씬', () => {
  assert.equal(initialState().sceneId, ORDER[0]);
});

test('applyEffects는 원본을 변경하지 않는다', () => {
  const s = initialState();
  const before = s.funds;
  applyEffects(s, { funds: -5000 });
  assert.equal(s.funds, before);
});

test('숫자 효과가 더해진다', () => {
  const s = applyEffects(initialState(), { funds: -12000, trust: +5 });
  assert.equal(s.funds, 88000);
  assert.equal(s.trust, 55);
});

test('flag 효과는 flags에 들어간다', () => {
  const s = applyEffects(initialState(), { flag: 'bug01Unfixed' });
  assert.equal(s.flags.bug01Unfixed, true);
});

test('flag는 배열로 여러 개를 한 번에 세울 수 있다', () => {
  const s = applyEffects(initialState(), { flag: ['a', 'b'] });
  assert.equal(s.flags.a, true);
  assert.equal(s.flags.b, true);
});

test('max가 있는 스탯은 0..max로 clamp 된다', () => {
  assert.equal(applyEffects(initialState(), { aiDependence: +500 }).aiDependence, 100);
  assert.equal(applyEffects(initialState(), { trust: -500 }).trust, 0);
});

test('자금은 음수가 될 수 있다 — ZERO CR 엔딩 판정에 필요하다', () => {
  assert.equal(applyEffects(initialState(), { funds: -150000 }).funds, -50000);
});

test('숫자가 아닌 효과값은 무시된다', () => {
  const s = applyEffects(initialState(), { funds: '많이' });
  assert.equal(s.funds, 100000);
});

test('HUD에 상시 노출되는 스탯은 자금과 AI 의존도 둘뿐', () => {
  assert.deepEqual(HUD_STATS, ['funds', 'aiDependence']);
});

test('criticalBugs는 세워진 치명적 버그 플래그 수를 센다', () => {
  assert.equal(criticalBugs(initialState()), 0);
  const s = applyEffects(initialState(), { flag: ['bug01Unfixed', 'bug02Risk'] });
  assert.equal(criticalBugs(s), 2);
});

test('치명적 버그가 아닌 플래그는 세지 않는다', () => {
  const s = applyEffects(initialState(), { flag: ['storyClue', 'publisherDeal'] });
  assert.equal(criticalBugs(s), 0);
});

test('CRITICAL_BUG_FLAGS는 스토리가 실제로 세우는 플래그여야 한다', async () => {
  const { SCENES } = await import('../src/game/story.data.js');
  const raised = new Set();
  for (const sc of Object.values(SCENES)) {
    for (const c of sc.choices ?? []) {
      for (const f of [].concat(c.effects?.flag ?? [])) raised.add(f);
    }
  }
  for (const f of CRITICAL_BUG_FLAGS) {
    assert.ok(raised.has(f), `${f} 를 세우는 선택지가 스토리에 없다 — 영원히 안 걸리는 엔딩 조건`);
  }
});

test('resolveEffects는 플래그가 서 있을 때 효과를 합친다', () => {
  const choice = {
    effects: { trust: +5 },
    mod: { flag: 'storyClue', effects: { trust: +5 } }
  };
  const plain = resolveEffects(initialState(), choice);
  assert.equal(plain.trust, 5);

  const withFlag = resolveEffects(applyEffects(initialState(), { flag: 'storyClue' }), choice);
  assert.equal(withFlag.trust, 10);
});

test('resolveBranch는 gate가 없으면 항상 통과한다', () => {
  const r = resolveBranch(initialState(), { effects: { trust: +5 }, after: [{ n: 'x' }] });
  assert.equal(r.passed, true);
  assert.equal(r.effects.trust, 5);
});

test('resolveBranch는 gate를 통과하면 성공 효과를 쓴다', () => {
  const choice = {
    gate: s => s.trust >= 55,
    effects: { funds: +30000 }, after: [{ n: '성공' }],
    failEffects: { trust: -10 }, failAfter: [{ n: '실패' }]
  };
  const s = applyEffects(initialState(), { trust: +10 });   // 60
  const r = resolveBranch(s, choice);
  assert.equal(r.passed, true);
  assert.equal(r.effects.funds, 30000);
  assert.deepEqual(r.after, [{ n: '성공' }]);
});

test('resolveBranch는 gate에 걸리면 실패 효과와 실패 대사를 쓴다', () => {
  const choice = {
    gate: s => s.trust >= 55,
    effects: { funds: +30000 }, after: [{ n: '성공' }],
    failEffects: { trust: -10 }, failAfter: [{ n: '실패' }]
  };
  const s = applyEffects(initialState(), { trust: -10 });   // 40
  const r = resolveBranch(s, choice);
  assert.equal(r.passed, false);
  assert.equal(r.effects.funds, undefined, '실패하면 자금이 들어오면 안 된다');
  assert.deepEqual(r.after, [{ n: '실패' }]);
});

test('pickEnding은 위에서부터 첫 번째로 맞는 엔딩을 고른다', () => {
  const endings = [
    { id: 'a', test: s => s.funds <= 0 },
    { id: 'b', test: () => true }
  ];
  assert.equal(pickEnding({ funds: -1 }, endings).id, 'a');
  assert.equal(pickEnding({ funds: 100 }, endings).id, 'b');
});

test('폴백 엔딩이 없으면 throw', () => {
  assert.throws(() => pickEnding({ funds: 100 }, [{ id: 'a', test: () => false }]), /폴백/);
});
