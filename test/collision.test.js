import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCollision } from '../src/player/collision.js';

/** 원점에 놓인 2x2 상자 하나. */
const BOX = [{ x: 0, z: 0, w: 2, d: 2 }];
const R = 0.5;

test('장애물에서 먼 이동은 그대로 통과한다', () => {
  const out = resolveCollision({ x: 5, z: 5 }, { x: 5.2, z: 5 }, BOX, R);
  assert.deepEqual(out, { x: 5.2, z: 5 });
});

test('상자 정면으로 밀면 X가 막힌다', () => {
  const out = resolveCollision({ x: 2, z: 0 }, { x: 1.0, z: 0 }, BOX, R);
  assert.ok(out.x >= 1.5 - 1e-9, `x가 ${out.x} — 상자 표면(1.5) 안으로 들어갔다`);
});

test('막힌 축이 있어도 다른 축으로는 미끄러진다', () => {
  const out = resolveCollision({ x: 2, z: 0 }, { x: 1.0, z: 0.4 }, BOX, R);
  assert.ok(out.x >= 1.5 - 1e-9, 'x는 막혀야 한다');
  assert.ok(Math.abs(out.z - 0.4) < 1e-9, 'z는 그대로 움직여야 한다');
});

test('반대편에서 밀어도 대칭으로 막힌다', () => {
  const out = resolveCollision({ x: -2, z: 0 }, { x: -1.0, z: 0 }, BOX, R);
  assert.ok(out.x <= -1.5 + 1e-9, `x가 ${out.x}`);
});

test('Z축도 같은 방식으로 막힌다', () => {
  const out = resolveCollision({ x: 0, z: 2 }, { x: 0, z: 1.0 }, BOX, R);
  assert.ok(out.z >= 1.5 - 1e-9, `z가 ${out.z}`);
});

test('상자를 대각선으로 스쳐가도 안으로 들어가지 않는다', () => {
  let p = { x: 3, z: 3 };
  for (let i = 0; i < 200; i++) {
    p = resolveCollision(p, { x: p.x - 0.05, z: p.z - 0.05 }, BOX, R);
    const inside = Math.abs(p.x) < 1.5 - 1e-6 && Math.abs(p.z) < 1.5 - 1e-6;
    assert.ok(!inside, `스텝 ${i}에서 상자 안으로 들어감: ${JSON.stringify(p)}`);
  }
});

test('장애물이 없으면 아무것도 하지 않는다', () => {
  const out = resolveCollision({ x: 0, z: 0 }, { x: 1, z: 1 }, [], R);
  assert.deepEqual(out, { x: 1, z: 1 });
});

test('여러 장애물 사이의 좁은 통로를 지나갈 수 있다', () => {
  const walls = [
    { x: -1.2, z: 0, w: 1, d: 4 },
    { x: 1.2, z: 0, w: 1, d: 4 }
  ];
  let p = { x: 0, z: 3 };
  for (let i = 0; i < 120; i++) {
    p = resolveCollision(p, { x: p.x, z: p.z - 0.05 }, walls, 0.15);
  }
  assert.ok(p.z < -2, `통로를 통과하지 못했다: z=${p.z}`);
});
