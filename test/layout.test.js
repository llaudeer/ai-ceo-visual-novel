import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOM, DESKS, OBSTACLES, SPAWN, MEETING, PLAYER_RADIUS, meetingSlots, deskFootprint }
  from '../src/world/layout.js';
import { resolveCollision } from '../src/player/collision.js';
import { listSeated, ARIA_ANCHOR } from '../src/game/characters.data.js';

/** 두 축정렬 사각형이 겹치는가. 접하는 것은 겹침이 아니다. */
function rectsOverlap(a, b) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 1e-9
      && Math.abs(a.z - b.z) < (a.d + b.d) / 2 - 1e-9;
}

/** 점이 사각형 안에 있는가. */
function pointInRect(p, r) {
  return Math.abs(p.x - r.x) < r.w / 2 && Math.abs(p.z - r.z) < r.d / 2;
}

test('방 치수가 일관된다', () => {
  assert.equal(ROOM.halfW, ROOM.width / 2);
  assert.equal(ROOM.halfD, ROOM.depth / 2);
});

test('스폰 지점은 방 안이고 장애물과 겹치지 않는다', () => {
  assert.ok(Math.abs(SPAWN.x) < ROOM.halfW);
  assert.ok(Math.abs(SPAWN.z) < ROOM.halfD);
  const stuck = resolveCollision(SPAWN, SPAWN, OBSTACLES, PLAYER_RADIUS);
  assert.ok(Math.hypot(stuck.x - SPAWN.x, stuck.z - SPAWN.z) < 1e-9,
    '스폰 지점이 장애물 안에 박혀 있다');
});

test('벽 4면이 장애물에 포함되어 방을 닫는다', () => {
  for (const dir of [[0, -20], [0, 20], [-20, 0], [20, 0]]) {
    let p = { x: SPAWN.x, z: SPAWN.z };
    for (let i = 0; i < 400; i++) {
      p = resolveCollision(p, { x: p.x + dir[0] * 0.01, z: p.z + dir[1] * 0.01 },
        OBSTACLES, PLAYER_RADIUS);
    }
    assert.ok(Math.abs(p.x) <= ROOM.halfW, `방을 x로 빠져나갔다: ${p.x}`);
    assert.ok(Math.abs(p.z) <= ROOM.halfD, `방을 z로 빠져나갔다: ${p.z}`);
  }
});

test('책상이 5개 이상 배치되어 있다', () => {
  assert.ok(DESKS.length >= 5, `책상 ${DESKS.length}개 — 사무실이 너무 비었다`);
});

test('책상끼리 겹치지 않는다', () => {
  const boxes = DESKS.map(deskFootprint);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      assert.ok(!rectsOverlap(boxes[i], boxes[j]),
        `책상 ${i}와 ${j}가 겹친다: ${JSON.stringify(boxes[i])} / ${JSON.stringify(boxes[j])}`);
    }
  }
});

test('앉은 캐릭터마다 근처에 책상이 있다', () => {
  for (const c of listSeated()) {
    const near = DESKS.some(d => Math.hypot(d.x - c.seat.x, d.z - c.seat.z) < 2.0);
    assert.ok(near, `${c.id}의 자리(${c.seat.x}, ${c.seat.z}) 근처에 책상이 없다`);
  }
});

test('캐릭터 자리가 책상 안에 박혀 있지 않다', () => {
  const boxes = DESKS.map(deskFootprint);
  for (const c of listSeated()) {
    for (const [i, b] of boxes.entries()) {
      assert.ok(!pointInRect(c.seat, b),
        `${c.id}의 자리가 책상 ${i} 안에 있다 — 빌보드가 책상을 뚫는다`);
    }
  }
});

test('ARIA 받침이 회의 테이블 상판 위에 정확히 놓인다', () => {
  const table = DESKS.find(d => d.meeting);
  assert.ok(table, 'meeting: true 인 책상이 있어야 한다');
  assert.ok(pointInRect({ x: ARIA_ANCHOR.x, z: ARIA_ANCHOR.z }, deskFootprint(table)),
    'ARIA 받침이 회의 테이블 밖에 있다 — 공중에 뜬다');
  assert.ok(Math.abs(ARIA_ANCHOR.y - 0.78) < 1e-9,
    '받침 높이가 상판 높이(0.78)와 다르다 — 파묻히거나 뜬다');
});

test('회의 중심이 회의 테이블 위치와 일치한다', () => {
  const table = DESKS.find(d => d.meeting);
  assert.equal(MEETING.x, table.x);
  assert.equal(MEETING.z, table.z);
});

test('회의 슬롯이 요청한 개수만큼 나온다', () => {
  assert.equal(meetingSlots(5).length, 5);
  assert.equal(meetingSlots(1).length, 1);
});

test('회의 슬롯은 모두 회의 중심에서 반지름만큼 떨어져 있다', () => {
  for (const s of meetingSlots(5)) {
    const d = Math.hypot(s.x - MEETING.x, s.z - MEETING.z);
    assert.ok(Math.abs(d - MEETING.radius) < 1e-6, `거리 ${d}`);
  }
});

test('회의 슬롯은 서로 겹치지 않는다', () => {
  const slots = meetingSlots(5);
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const d = Math.hypot(slots[i].x - slots[j].x, slots[i].z - slots[j].z);
      assert.ok(d > 0.7, `슬롯 ${i}와 ${j}가 너무 가깝다: ${d}`);
    }
  }
});

test('회의 슬롯은 모두 방 안에 있다', () => {
  for (const s of meetingSlots(5)) {
    assert.ok(Math.abs(s.x) < ROOM.halfW);
    assert.ok(Math.abs(s.z) < ROOM.halfD);
  }
});

test('회의 슬롯이 어떤 책상에도 박히지 않는다', () => {
  const boxes = DESKS.map(deskFootprint);
  for (const [i, s] of meetingSlots(5).entries()) {
    for (const [j, b] of boxes.entries()) {
      assert.ok(!pointInRect(s, b), `회의 슬롯 ${i}가 책상 ${j} 안에 있다`);
    }
  }
});
