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
    { x: -1.0, z: 0, w: 1, d: 6 },
    { x: 1.0,  z: 0, w: 1, d: 6 }
  ];
  const R = 0.4;
  // 통로 안쪽 폭(1.0)은 플레이어 지름(0.8)보다 넓어 지나갈 수 있어야 한다.
  // 다만 중심(x=0)에서 벗어난 시작점(x=0.3)을 써서, 오른쪽 벽과 실제로
  // 겹치는 상황을 만든다 — 겹침이 한 번도 안 일어나면 이 테스트는
  // "이동을 막는" 잘못된 구현과 구별하지 못한다 (아래 overlapped로 검증).
  function overlaps(pt) {
    return walls.some(w => Math.abs(pt.x - w.x) < w.w / 2 + R && Math.abs(pt.z - w.z) < w.d / 2 + R);
  }
  let p = { x: 0.3, z: 3 };
  let overlapped = false;
  for (let i = 0; i < 120; i++) {
    const next = { x: p.x, z: p.z - 0.05 };
    if (overlaps(next)) overlapped = true;
    p = resolveCollision(p, next, walls, R);
  }
  assert.ok(overlapped, '테스트 설계 오류 — 벽과 실제로 겹치는 지점이 없었다');
  assert.ok(p.z < -2, `통로를 통과하지 못했다: z=${p.z}`);
});

test('겹침 보정 뒤 남은 부동소수점 잔여가 다른 장애물 위로 다시 밀어내지 않는다', () => {
  // 리뷰에서 발견한 버그의 재현 케이스.
  //
  // x축 보정은 원을 장애물 B의 표면에 "정확히" 접하는 좌표로 옮긴다
  // (x = b.x ± (b.w/2 + radius)). 그런데 이 값을 실수 연산으로 계산하면
  // |x - b.x|가 이론상 한계(limitX)보다 극히 미세하게(1e-15 자릿수) 작게
  // 나올 수 있다 — 즉 "접했을 뿐"인데 "아직 겹쳐 있다"고 오판하게 된다.
  //
  // z축 보정 루프는 이 오판을 그대로 믿고 B에 대해 또 한 번 전체 보정을
  // 무조건 적용한다. 이 두 번째 보정은 사실 필요 없는 보정인데도 z를
  // B의 반대쪽 표면까지 크게 튕겨보낸다 — 그 자리에 마침 다른 장애물
  // A가 있으면 플레이어가 A 안에 박힌 채로 끝난다.
  //
  // 아래 숫자는 이 잔여가 실제로 양수로 남는 조합을 부동소수점 값
  // 탐색으로 찾은 것이다 (깔끔한 정수 좌표로는 재현되지 않는다 — 정수
  // 연산은 반올림 오차가 생기지 않기 때문).
  const r = 0.48757042741883083;
  const B = { x: 7.74905674435114, z: 0, w: 0.5493038943395285, d: 3 };
  // A는 "잘못된" 두 번째 z 보정이 착지하는 바로 그 자리에 둔다.
  const A = { x: 8.501279118939735, z: 1.9875704274188308, w: 1, d: 1 };
  const pos = { x: 3, z: 0 };
  const next = { x: 8.501279118939735, z: 0.4 };

  // A가 B보다 먼저 배열에 오도록 한다 — z 루프가 B를 다시 건드릴 때
  // A는 이미 "지나친" 장애물이라 재검사되지 않는다는 게 버그의 핵심이다.
  const out = resolveCollision(pos, next, [A, B], r);

  const insideA = Math.min(
    A.w / 2 + r - Math.abs(out.x - A.x),
    A.d / 2 + r - Math.abs(out.z - A.z)
  );
  assert.ok(insideA <= 1e-9,
    `장애물 A 안에 박혔다 (겹침 ${insideA.toFixed(6)}m): ${JSON.stringify(out)}`);
});
