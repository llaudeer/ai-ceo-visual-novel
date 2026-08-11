import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, ORDER, ENDINGS, QUESTIONS } from '../src/game/story.data.js';
import { CHARACTERS } from '../src/game/characters.data.js';

test('씬 12개가 ORDER와 정확히 일치한다', () => {
  assert.equal(ORDER.length, 12);
  assert.deepEqual([...ORDER].sort(), Object.keys(SCENES).sort());
});

test('ORDER 첫 씬은 s01_start', () => {
  assert.equal(ORDER[0], 's01_start');
});

test('모든 씬이 필수 필드를 갖는다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    assert.ok(sc.act, `${id}.act`);
    assert.ok(sc.chapter, `${id}.chapter`);
    assert.ok(Array.isArray(sc.beats) && sc.beats.length > 0, `${id}.beats`);
    assert.ok(sc.q, `${id}.q`);
    assert.ok(Array.isArray(sc.choices) && sc.choices.length >= 2, `${id}.choices`);
  }
});

test('모든 대사 beat의 화자가 실존 캐릭터다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    const all = [...sc.beats, ...sc.choices.flatMap(c => c.after ?? [])];
    for (const b of all) {
      if (!('w' in b)) continue;
      assert.ok(CHARACTERS[b.w], `${id}: 알 수 없는 화자 "${b.w}"`);
    }
  }
});

test('모든 beat은 나레이션이거나 대사다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    for (const b of sc.beats) {
      const isNarration = typeof b.n === 'string';
      const isLine = typeof b.w === 'string' && typeof b.t === 'string';
      assert.ok(isNarration || isLine, `${id}: 형식이 이상한 beat ${JSON.stringify(b)}`);
    }
  }
});

test('모든 선택지가 label, hint, effects, after를 갖는다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    for (const [i, ch] of sc.choices.entries()) {
      assert.ok(ch.label, `${id}.choices[${i}].label`);
      assert.ok(ch.hint, `${id}.choices[${i}].hint`);
      assert.equal(typeof ch.effects, 'object', `${id}.choices[${i}].effects`);
      assert.ok(Array.isArray(ch.after), `${id}.choices[${i}].after`);
    }
  }
});

test('엔딩 6개가 있고 각각 판정 함수를 갖는다', () => {
  assert.equal(ENDINGS.length, 6);
  for (const e of ENDINGS) {
    assert.ok(e.id && e.stamp && e.title, `${e.id} 메타 누락`);
    assert.equal(typeof e.test, 'function', `${e.id}.test`);
    assert.ok(Array.isArray(e.epi) && e.epi.length > 0, `${e.id}.epi`);
  }
});

test('마지막 엔딩은 조건 없이 항상 참인 기본값이다', () => {
  const fallback = ENDINGS[ENDINGS.length - 1];
  assert.equal(fallback.test({}), true, '마지막 엔딩은 폴백이어야 어떤 상태에서도 엔딩이 나온다');
});

test('파산 엔딩은 자금이 음수일 때 걸린다', () => {
  const bankrupt = ENDINGS.find(e => e.id === 'bankrupt');
  assert.ok(bankrupt, 'bankrupt 엔딩이 있어야 한다');
  assert.equal(bankrupt.test({ cash: -1 }), true);
  assert.equal(bankrupt.test({ cash: 1000 }), false);
});

test('핵심 질문 3개', () => {
  assert.equal(QUESTIONS.length, 3);
});
