import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlow } from '../src/game/flow.js';

/** 테스트용 최소 스토리. 실제 스토리 데이터에 의존하지 않는다. */
function fixture() {
  return {
    scenes: {
      one: {
        act: '제1장', chapter: '시작', week: 1, bg: 'office_day', cast: ['jihun'],
        beats: [{ n: '나레이션' }, { w: 'jihun', e: 'neutral', t: '대사' }],
        q: '무엇을 할까',
        choices: [
          { label: 'A', hint: 'a', effects: { cash: -100 }, after: [{ n: 'A 결과' }] },
          { label: 'B', hint: 'b', effects: { cash: -200 }, after: [{ n: 'B 결과' }] }
        ]
      },
      two: {
        act: '제2장', chapter: '끝', week: 2, bg: 'office_night', cast: [],
        beats: [{ n: '마지막' }],
        q: '마지막 선택',
        choices: [{ label: 'C', hint: 'c', effects: {}, after: [] }]
      }
    },
    order: ['one', 'two'],
    endings: [
      { id: 'broke', stamp: 'E1', title: '파산', bg: 'x', test: s => s.cash < 0, epi: ['끝'] },
      { id: 'ok', stamp: 'E2', title: '생존', bg: 'x', test: () => true, epi: ['끝'] }
    ],
    state: {
      cash: 1000, revenue: 0, trust: 50, morale: 50, aiDependence: 0,
      reputation: 30, productQuality: 40, sceneId: 'one', flags: {}, history: [], week: 1
    }
  };
}

test('첫 beat에서 시작한다', () => {
  const f = createFlow(fixture());
  assert.equal(f.mode, 'beat');
  assert.deepEqual(f.current(), { n: '나레이션' });
});

test('advance로 다음 beat으로 넘어간다', () => {
  const f = createFlow(fixture());
  f.advance();
  assert.equal(f.current().t, '대사');
});

test('마지막 beat 이후 선택지 모드로 전환된다', () => {
  const f = createFlow(fixture());
  f.advance();
  f.advance();
  assert.equal(f.mode, 'choice');
  assert.equal(f.current(), null);
});

test('선택지 모드에서는 클릭 진행이 잠긴다', () => {
  const f = createFlow(fixture());
  f.advance();
  f.advance();
  assert.equal(f.canAdvance(), false);
});

test('beat 모드에서는 클릭 진행이 열려 있다', () => {
  const f = createFlow(fixture());
  assert.equal(f.canAdvance(), true);
});

test('선택지 모드가 아닐 때 choose를 부르면 throw', () => {
  const f = createFlow(fixture());
  assert.throws(() => f.choose(0), /선택지/);
});

test('choose가 상태에 효과를 반영한다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(0);
  assert.equal(f.state.cash, 900);
});

test('choose 후 after beats가 재생된다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(1);
  assert.equal(f.mode, 'beat');
  assert.deepEqual(f.current(), { n: 'B 결과' });
});

test('after가 끝나면 다음 씬의 첫 beat으로 넘어간다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(0);
  f.advance();
  assert.equal(f.state.sceneId, 'two');
  assert.deepEqual(f.current(), { n: '마지막' });
});

test('after가 비어 있어도 다음 씬으로 넘어간다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance(); f.choose(0);
  f.advance();
  f.advance();
  f.choose(0);
  assert.equal(f.mode, 'ending');
});

test('마지막 씬을 끝내면 엔딩이 판정된다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance(); f.choose(0);
  f.advance();
  f.advance();
  f.choose(0);
  assert.equal(f.ending.id, 'ok', '자금이 남아 있으면 생존 엔딩');
});

test('자금이 음수면 파산 엔딩이 걸린다', () => {
  const fx = fixture();
  fx.state.cash = 50;
  const f = createFlow(fx);
  f.advance(); f.advance();
  f.choose(1);
  f.advance();
  f.advance();
  f.choose(0);
  assert.equal(f.ending.id, 'broke');
});

test('선택 기록이 history에 남는다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(1);
  assert.deepEqual(f.state.history, [{ sceneId: 'one', choice: 1, label: 'B', passed: true }]);
});

test('beat 이벤트가 발행된다', () => {
  const f = createFlow(fixture());
  const seen = [];
  f.on('beat', b => seen.push(b));
  f.advance();
  assert.equal(seen.length, 1);
  assert.equal(seen[0].t, '대사');
});

test('choices 이벤트가 선택지 배열과 함께 발행된다', () => {
  const f = createFlow(fixture());
  let got = null;
  f.on('choices', c => { got = c; });
  f.advance(); f.advance();
  assert.equal(got.length, 2);
  assert.equal(got[0].label, 'A');
});

test('scene 이벤트가 씬 전환 시 발행된다', () => {
  const f = createFlow(fixture());
  const ids = [];
  f.on('scene', (sc, id) => ids.push(id));
  f.advance(); f.advance(); f.choose(0);
  f.advance();
  assert.deepEqual(ids, ['two']);
});

test('ending 이벤트가 발행된다', () => {
  const f = createFlow(fixture());
  let e = null;
  f.on('ending', x => { e = x; });
  f.advance(); f.advance(); f.choose(0);
  f.advance(); f.advance(); f.choose(0);
  assert.equal(e.id, 'ok');
});

test('엔딩 이후 advance는 아무 일도 하지 않는다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance(); f.choose(0);
  f.advance(); f.advance(); f.choose(0);
  assert.equal(f.canAdvance(), false);
  f.advance();
  assert.equal(f.mode, 'ending');
});

import { SCENES, ORDER, ENDINGS } from '../src/game/story.data.js';
import { initialState } from '../src/game/state.js';

test('실제 스토리를 항상 첫 선택지로 완주하면 엔딩에 도달한다', () => {
  const f = createFlow({ scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState() });
  let guard = 0;
  while (f.mode !== 'ending') {
    if (guard++ > 5000) assert.fail('진행이 막혔다 — 무한 루프');
    if (f.mode === 'choice') f.choose(0);
    else f.advance();
  }
  assert.ok(f.ending.id, '엔딩 id가 있어야 한다');
  const choiceScenes = ORDER.filter(id => (SCENES[id].choices ?? []).length > 0).length;
  assert.equal(f.state.history.length, choiceScenes, '선택지가 있는 씬마다 한 번씩 선택했어야 한다');
});

test('선택지가 없는 씬(프롤로그·출시)에서 진행이 막히지 않는다', () => {
  const noChoice = ORDER.filter(id => (SCENES[id].choices ?? []).length === 0);
  assert.ok(noChoice.length > 0, '선택지 없는 씬이 실제로 존재해야 이 테스트가 의미를 갖는다');

  const f = createFlow({ scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState() });
  const visited = new Set();
  let guard = 0;
  while (f.mode !== 'ending') {
    if (guard++ > 5000) assert.fail('진행이 막혔다 — 무한 루프');
    visited.add(f.state.sceneId);
    if (f.mode === 'choice') f.choose(0);
    else f.advance();
  }
  for (const id of noChoice) assert.ok(visited.has(id), `${id} 씬을 지나갔어야 한다`);
});

test('모든 선택지 조합의 첫 수준을 훑어도 막히지 않는다', () => {
  for (let pick = 0; pick < 3; pick++) {
    const f = createFlow({ scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState() });
    let guard = 0;
    while (f.mode !== 'ending') {
      if (guard++ > 5000) assert.fail(`선택 ${pick}에서 진행이 막혔다`);
      if (f.mode === 'choice') {
        const n = f.scene().choices.length;
        f.choose(Math.min(pick, n - 1));
      } else {
        f.advance();
      }
    }
    assert.ok(f.ending.id);
  }
});
