import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, ORDER, ENDINGS, QUESTIONS } from '../src/game/story.data.js';
import { CHARACTERS } from '../src/game/characters.data.js';
import { ARIA_STATES } from '../src/ui/theme.js';
import { createFlow } from '../src/game/flow.js';
import { initialState } from '../src/game/state.js';

const CHOICE_SCENES = ORDER.filter(id => (SCENES[id].choices ?? []).length > 0);

test('ORDER의 모든 씬이 SCENES에 있다', () => {
  for (const id of ORDER) assert.ok(SCENES[id], `${id} 씬이 없다`);
});

test('SCENES의 모든 씬이 ORDER에 있다 — 고아 씬 금지', () => {
  for (const id of Object.keys(SCENES)) assert.ok(ORDER.includes(id), `${id}가 ORDER에 없다`);
});

test('ORDER는 프롤로그로 시작해 출시로 끝난다', () => {
  assert.equal(ORDER[0], 'p01_city');
  assert.equal(ORDER.at(-1), 'release');
});

test('7주가 모두 등장한다', () => {
  const weeks = new Set(ORDER.map(id => SCENES[id].week));
  for (let w = 1; w <= 7; w++) assert.ok(weeks.has(w), `WEEK ${w} 씬이 없다`);
});

test('모든 씬이 필수 필드를 갖는다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    assert.equal(typeof sc.act, 'string', `${id}.act`);
    assert.equal(typeof sc.chapter, 'string', `${id}.chapter`);
    assert.equal(typeof sc.week, 'number', `${id}.week`);
    assert.equal(typeof sc.bg, 'string', `${id}.bg`);
    assert.ok(Array.isArray(sc.cast), `${id}.cast`);
    assert.ok(Array.isArray(sc.beats) && sc.beats.length > 0, `${id}.beats가 비었다`);
    assert.ok(Array.isArray(sc.choices), `${id}.choices는 배열이어야 한다`);
  }
});

test('모든 beat은 나레이션이거나 대사이거나 표시다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    const all = [...sc.beats, ...(sc.choices ?? []).flatMap(c => [...(c.after ?? []), ...(c.failAfter ?? [])])];
    for (const b of all) {
      const kind = b.n != null ? 'n' : b.t != null ? 't' : b.hud != null ? 'hud' : null;
      assert.ok(kind, `${id}에 정체를 알 수 없는 beat: ${JSON.stringify(b)}`);
      if (kind === 't') assert.ok(b.w, `${id}의 대사에 화자가 없다`);
    }
  }
});

test('모든 화자가 실제 캐릭터다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    const all = [...sc.beats, ...(sc.choices ?? []).flatMap(c => [...(c.after ?? []), ...(c.failAfter ?? [])])];
    for (const b of all) {
      if (b.w) assert.ok(CHARACTERS[b.w], `${id}에 알 수 없는 화자: ${b.w}`);
    }
  }
});

test('beat과 씬이 지정하는 ARIA 색은 theme.js의 4상태 중 하나다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    if (sc.aria) assert.ok(ARIA_STATES.includes(sc.aria), `${id}.aria = ${sc.aria}`);
    const all = [...sc.beats, ...(sc.choices ?? []).flatMap(c => [...(c.after ?? []), ...(c.failAfter ?? [])])];
    for (const b of all) {
      if (b.aria) assert.ok(ARIA_STATES.includes(b.aria), `${id}에 알 수 없는 ARIA 상태: ${b.aria}`);
    }
  }
});

test('모든 선택지가 label, effects, after를 갖는다', () => {
  for (const id of CHOICE_SCENES) {
    for (const c of SCENES[id].choices) {
      assert.equal(typeof c.label, 'string', `${id}의 선택지에 label이 없다`);
      assert.equal(typeof c.effects, 'object', `${id}: ${c.label}에 effects가 없다`);
      assert.ok(Array.isArray(c.after), `${id}: ${c.label}에 after가 없다`);
    }
  }
});

test('gate가 있는 선택지는 실패 경로를 반드시 갖는다', () => {
  for (const id of CHOICE_SCENES) {
    for (const c of SCENES[id].choices) {
      if (!c.gate) continue;
      assert.equal(typeof c.gate, 'function', `${id}: ${c.label}의 gate`);
      assert.ok(Array.isArray(c.failAfter) && c.failAfter.length > 0,
        `${id}: ${c.label}에 실패 대사가 없다 — 실패하면 화면이 빈다`);
    }
  }
});

test('선택지가 있는 씬은 질문(q)을 갖는다', () => {
  for (const id of CHOICE_SCENES) {
    assert.ok(SCENES[id].q, `${id}에 q가 없다`);
  }
});

test('엔딩 5개가 있고 각각 판정 함수를 갖는다', () => {
  assert.equal(ENDINGS.length, 5);
  for (const e of ENDINGS) {
    assert.equal(typeof e.test, 'function', `${e.id}.test`);
    assert.ok(e.stamp && e.title && e.stampEnd, `${e.id}의 표시 문구`);
    assert.ok(Array.isArray(e.epi) && e.epi.length > 0, `${e.id}.epi`);
  }
});

test('마지막 엔딩은 무조건 참인 폴백이다', () => {
  assert.equal(ENDINGS.at(-1).test({}), true);
});

test('엔딩 판정 순서가 대본과 같다', () => {
  assert.deepEqual(
    ENDINGS.map(e => e.id),
    ['zero_cr', 'corrupted', 'perfect_machine', 'one_more_game', 'neon_star']
  );
});

test('ZERO CR 엔딩은 자금이 0 이하일 때 걸린다', () => {
  assert.equal(ENDINGS[0].test({ funds: 0, flags: {} }), true);
  assert.equal(ENDINGS[0].test({ funds: -1, flags: {} }), true);
  assert.equal(ENDINGS[0].test({ funds: 1, flags: {} }), false);
});

test('CORRUPTED 엔딩은 치명적 버그 2개 이상일 때 걸린다', () => {
  assert.equal(ENDINGS[1].test({ flags: { bug01Unfixed: true } }), false);
  assert.equal(ENDINGS[1].test({ flags: { bug01Unfixed: true, bug02Risk: true } }), true);
});

test('WEEK 3 자금 표시(63,000 CR)가 실제 잔액과 일치한다', () => {
  const f = createFlow({ scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState() });
  while (f.state.sceneId !== 'w3_funds') {
    if (f.mode === 'choice') f.choose(1);   // 자금을 건드리지 않는 선택지
    else f.advance();
  }
  assert.equal(f.state.funds, 63000, '대본의 OPERATING FUNDS 표시와 실제 자금이 어긋난다');
});

test('배너에 적힌 시작 자금이 초기 상태와 일치한다', () => {
  const banner = SCENES.p02_ceo.beats.find(b => b.hud?.includes('FUNDS'));
  assert.ok(banner, '시작 자금 배너가 없다');
  assert.ok(banner.hud.includes(initialState().funds.toLocaleString('en-US')));
});

test('QUESTIONS 세 문장이 유지된다', () => {
  assert.equal(QUESTIONS.length, 3);
});

// ── 도달 가능성: 모든 엔딩이 실제 플레이로 나올 수 있어야 한다

/** 선택 인덱스 배열대로 완주하고 엔딩 id를 돌려준다. */
function play(picks) {
  const f = createFlow({ scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState() });
  let n = 0;
  let guard = 0;
  while (f.mode !== 'ending') {
    if (guard++ > 5000) throw new Error('진행이 막혔다');
    if (f.mode === 'choice') {
      const len = f.scene().choices.length;
      f.choose(Math.min(picks[n++] ?? 0, len - 1));
    } else {
      f.advance();
    }
  }
  return { id: f.ending.id, state: f.state };
}

test('모든 선택지 조합을 완주해도 진행이 막히지 않는다', () => {
  const counts = CHOICE_SCENES.map(id => SCENES[id].choices.length);
  const total = counts.reduce((a, b) => a * b, 1);
  assert.ok(total > 1000, `조합이 ${total}개뿐 — 분기가 너무 얕다`);

  const reached = new Set();
  for (let i = 0; i < total; i++) {
    let rest = i;
    const picks = counts.map(c => { const p = rest % c; rest = Math.floor(rest / c); return p; });
    reached.add(play(picks).id);
  }

  for (const e of ENDINGS) {
    assert.ok(reached.has(e.id), `${e.id} 엔딩에 도달하는 플레이가 하나도 없다`);
  }
});
