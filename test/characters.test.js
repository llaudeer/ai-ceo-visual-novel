import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, listSeated, getCharacter } from '../src/game/characters.data.js';
import { readdir } from 'node:fs/promises';

const LEGACY_IDS = ['jihun', 'seoyeon', 'min', 'yuna', 'doyun', 'sera', 'taeseok', 'aria'];

test('레거시 CAST의 id 8개를 모두 갖는다', () => {
  for (const id of LEGACY_IDS) {
    assert.ok(CHARACTERS[id], `${id} 가 없다`);
  }
  assert.equal(Object.keys(CHARACTERS).length, 8);
});

test('id 필드가 키와 일치한다', () => {
  for (const [key, c] of Object.entries(CHARACTERS)) {
    assert.equal(c.id, key);
  }
});

test('사무실에 자리를 가진 캐릭터는 팀원 5인뿐', () => {
  const seated = listSeated().map(c => c.id).sort();
  assert.deepEqual(seated, ['doyun', 'jihun', 'min', 'seoyeon', 'yuna']);
});

test('이서연의 색상은 프로필 시트가 아니라 포트레이트 기준(보라)', () => {
  assert.equal(CHARACTERS.seoyeon.hue.toLowerCase(), '#a855f7');
});

test('portrait가 선언된 캐릭터는 실제 파일이 존재한다', async () => {
  const files = new Set(await readdir(new URL('../assets/chars/', import.meta.url)));
  for (const c of Object.values(CHARACTERS)) {
    if (!c.portrait) continue;
    const name = c.portrait.split('/').pop();
    assert.ok(files.has(name), `${c.id}: ${c.portrait} 파일이 없다`);
  }
});

test('포트레이트가 없는 캐릭터는 sera, taeseok, aria 뿐', () => {
  const none = Object.values(CHARACTERS).filter(c => !c.portrait).map(c => c.id).sort();
  assert.deepEqual(none, ['aria', 'sera', 'taeseok']);
});

test('자리 좌표는 방 안에 있다', () => {
  for (const c of listSeated()) {
    assert.ok(Math.abs(c.seat.x) < 9, `${c.id} x 범위 초과`);
    assert.ok(Math.abs(c.seat.z) < 7, `${c.id} z 범위 초과`);
  }
});

test('모든 캐릭터가 특징 5종을 갖는다', () => {
  for (const c of Object.values(CHARACTERS)) {
    for (const k of ['personality', 'speech', 'duty', 'ariaRelation', 'quote']) {
      assert.ok(c.traits[k], `${c.id}.traits.${k} 가 비어 있다`);
    }
  }
});

test('getCharacter는 없는 id에 대해 throw', () => {
  assert.throws(() => getCharacter('nobody'), /nobody/);
});
