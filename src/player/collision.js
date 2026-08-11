/**
 * 원(플레이어)과 축정렬 사각형(벽·책상)의 충돌 해소.
 *
 * 축을 하나씩 따로 처리해서, 한 축이 막혀도 다른 축으로는 미끄러지게 한다.
 * 벽에 비스듬히 부딪혔을 때 멈춰 서지 않고 스르륵 지나가는 느낌이 여기서 나온다.
 */

function overlaps(x, z, box, r) {
  return Math.abs(x - box.x) < box.w / 2 + r && Math.abs(z - box.z) < box.d / 2 + r;
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
    if (!overlaps(x, z, b, radius)) continue;
    const limitX = b.w / 2 + radius;
    const limitZ = b.d / 2 + radius;
    const penX = limitX - Math.abs(x - b.x);
    const penZ = limitZ - Math.abs(z - b.z);
    if (penX < penZ) {
      x = x > b.x ? b.x + limitX : b.x - limitX;
    }
  }

  let z2 = next.z;
  for (const b of obstacles) {
    if (!overlaps(x, z2, b, radius)) continue;
    const limit = b.d / 2 + radius;
    z2 = z2 > b.z ? b.z + limit : b.z - limit;
  }

  return { x, z: z2 };
}
