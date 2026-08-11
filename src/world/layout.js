/**
 * 사무실 치수와 배치. 순수 데이터라 three.js를 import 하지 않는다.
 * office.js가 이 데이터를 읽어 지오메트리를 세우고,
 * controller.js가 OBSTACLES로 충돌을 판정한다.
 *
 * 좌표: Y 위, 미터. 방 중심이 원점. -Z가 사무실 안쪽(창문 쪽).
 */

export const ROOM = { width: 18, depth: 14, height: 3.2, halfW: 9, halfD: 7 };

export const PLAYER_RADIUS = 0.35;

/** 입구 쪽. 사무실 전체가 시야에 들어오는 위치. */
export const SPAWN = { x: 0, z: 5.5, facing: 0 };

/** 회의 테이블 중심과, NPC가 둘러설 반지름. 테이블 좌표와 일치해야 한다. */
export const MEETING = { x: 0, z: -1.4, radius: 2.4 };

/**
 * 책상.
 *
 * w는 로컬 X, d는 로컬 Z 방향 길이. rot은 Y축 회전(라디안).
 * rot = π/2 이면 로컬 X가 월드 Z로 가므로, 월드 footprint는 x폭 d, z폭 w가 된다.
 *
 * seatSide는 앉는 사람이 로컬 Z의 어느 쪽에 있는지다(+1 또는 -1).
 * office.js 가 모니터를 반대편에 놓고 사람 쪽을 향하게 돌리는 데 쓴다.
 * meeting: true 인 책상에는 모니터 대신 ARIA 받침이 올라간다.
 *
 * 책상끼리 겹치면 안 된다. test/layout.test.js 가 검사한다.
 */
export const DESKS = [
  // 좌측 개발/QA 존 — 긴 축이 Z를 향한다. 월드 footprint x폭 1.1, z폭 2.8
  { x: -6.2, z: -4.6, w: 2.8, d: 1.1, rot: Math.PI / 2, seatSide: -1 },  // 이서연 · 개발존 안쪽
  { x: -6.2, z: -0.8, w: 2.8, d: 1.1, rot: Math.PI / 2, seatSide: -1 },  // 정유나 · QA존
  // 안쪽 여분 책상 — 사무실 밀도를 만든다
  { x: -2.6, z: -5.2, w: 2.4, d: 1.0, rot: 0, seatSide: 1 },
  // 우측 창가
  { x: 6.0,  z: -2.6, w: 2.8, d: 1.1, rot: Math.PI / 2, seatSide: 1 },   // 최민 · 아트존
  { x: 6.4,  z: -5.6, w: 2.4, d: 1.0, rot: 0, seatSide: -1 },            // 한도윤 · 회의실 창가
  // 중앙 회의 테이블 — ARIA 받침 자리
  { x: 0.0,  z: -1.4, w: 3.6, d: 1.8, rot: 0, seatSide: 1, meeting: true }
];

/** 회전을 반영한 월드 축정렬 footprint. 충돌과 겹침 검사 양쪽에서 쓴다. */
export function deskFootprint(d) {
  const c = Math.abs(Math.cos(d.rot));
  const s = Math.abs(Math.sin(d.rot));
  return { x: d.x, z: d.z, w: d.w * c + d.d * s, d: d.w * s + d.d * c };
}

const WALL_T = 0.4;

/** 벽 4면 + 책상. 축정렬 사각형만 쓴다. */
export const OBSTACLES = [
  { x: 0, z: -ROOM.halfD - WALL_T / 2, w: ROOM.width + WALL_T * 2, d: WALL_T },
  { x: 0, z: ROOM.halfD + WALL_T / 2,  w: ROOM.width + WALL_T * 2, d: WALL_T },
  { x: -ROOM.halfW - WALL_T / 2, z: 0, w: WALL_T, d: ROOM.depth + WALL_T * 2 },
  { x: ROOM.halfW + WALL_T / 2,  z: 0, w: WALL_T, d: ROOM.depth + WALL_T * 2 },
  ...DESKS.map(deskFootprint)
];

/**
 * 회의 시 NPC가 설 자리. 회의 테이블을 중심으로 플레이어 쪽(+Z)을 향한 부채꼴.
 * 2단계 계획의 회의하기 연출이 이 좌표를 쓴다.
 */
export function meetingSlots(count) {
  const spread = Math.PI * 0.9;
  const slots = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const a = -spread / 2 + spread * t;
    slots.push({
      x: MEETING.x + Math.sin(a) * MEETING.radius,
      z: MEETING.z - Math.cos(a) * MEETING.radius,
      facing: a + Math.PI
    });
  }
  return slots;
}
