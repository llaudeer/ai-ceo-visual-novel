/**
 * 원(플레이어)과 축정렬 사각형(벽·책상)의 충돌 해소.
 *
 * 축을 하나씩 따로 처리해서, 한 축이 막혀도 다른 축으로는 미끄러지게 한다.
 * 벽에 비스듬히 부딪혔을 때 멈춰 서지 않고 스르륵 지나가는 느낌이 여기서 나온다.
 */

/**
 * 겹침 판정에 쓰는 아주 작은 여유값.
 *
 * x축 보정은 원을 장애물 표면에 "정확히" 접하는 좌표(box.x ± (w/2+radius))로
 * 옮긴다. 이 값을 실수 연산으로 계산하면 반올림 때문에 |x - box.x|가 이론상
 * 한계보다 1e-15 자릿수만큼 작게 나올 수 있다 — 즉 접했을 뿐인데 z축 보정
 * 루프가 "아직 겹쳐 있다"고 오판해 같은 장애물을 상대로 불필요한 큰 보정을
 * 한 번 더 적용하게 된다. 그 결과 이미 안전하게 통과한 다른 장애물 위로
 * 플레이어가 다시 튕겨나갈 수 있다. EPS보다 얕은 "겹침"은 이런 반올림
 * 잔여로 보고 무시한다 — 실제 게임에서 의미 있는 겹침은 센티미터
 * 단위이므로 이 정도 여유는 실질적인 충돌 판정에 영향을 주지 않는다.
 */
const EPS = 1e-9;

/** box와의 x·z 겹침 깊이. 양수면 그만큼 파고들어 있다는 뜻이다. */
function penetration(x, z, box, r) {
  return {
    x: box.w / 2 + r - Math.abs(x - box.x),
    z: box.d / 2 + r - Math.abs(z - box.z)
  };
}

/**
 * @param {{x:number,z:number}} pos   현재 위치 (장애물 밖이라고 가정)
 * @param {{x:number,z:number}} next  이동하려는 위치
 * @param {{x:number,z:number,w:number,d:number}[]} obstacles
 * @param {number} radius
 * @returns {{x:number,z:number}} 보정된 위치
 */
export function resolveCollision(pos, next, obstacles, radius) {
  let x = next.x;
  let z = pos.z;

  // x축 통과분만 먼저 막는다. 단, 겹침이 실제로 x축에서 얕을 때만 x를 보정한다.
  // 방을 감싸는 벽처럼 x로는 넓고 z로는 얇은 장애물의 경우, x쪽 겹침이 항상
  // 더 깊기 때문에 x를 그대로 두면 아래 z 보정 단계에서 올바르게 막힌다.
  // 이 구분이 없으면 얇고 넓은 벽에 부딪힐 때 플레이어가 반대편 벽까지
  // 튕겨나가는 문제가 생긴다.
  for (const b of obstacles) {
    const pen = penetration(x, z, b, radius);
    if (pen.x <= EPS || pen.z <= EPS) continue;
    if (pen.x < pen.z) {
      const limitX = b.w / 2 + radius;
      x = x > b.x ? b.x + limitX : b.x - limitX;
    }
  }

  let z2 = next.z;
  for (const b of obstacles) {
    const pen = penetration(x, z2, b, radius);
    if (pen.x <= EPS || pen.z <= EPS) continue;
    const limitZ = b.d / 2 + radius;
    z2 = z2 > b.z ? b.z + limitZ : b.z - limitZ;
  }

  return { x, z: z2 };
}
